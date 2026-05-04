import { db as prisma } from "@/lib/db";
import vision from "@google-cloud/vision";
import fs from "fs/promises";
import path from "path";
import { askAiVision } from "./ai/gateway";

// Google Vision Client (Legacy/Fallback)
const googleClient = new vision.ImageAnnotatorClient({
  credentials: process.env.GOOGLE_VISION_CREDENTIALS 
    ? JSON.parse(process.env.GOOGLE_VISION_CREDENTIALS) 
    : undefined,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function extractNIDInfo(imageUrl: string, merchantStoreId?: string) {
  try {
    console.log(`[Vision] Processing NID extraction for: ${imageUrl}`);
    // Use the new Bulletproof Gateway which handles fallbacks automatically
    const result = await extractWithGateway(imageUrl, merchantStoreId);
    return result;
  } catch (error: any) {
    console.error("Extraction Error:", error);
    return { error: `AI Extraction Failed: ${error.message || "Unknown error occurred"}` };
  }
}

async function extractWithGateway(imageUrl: string, merchantStoreId?: string) {
  try {
    const isBack = imageUrl.includes("back") || imageUrl.includes("_back");
    console.log(`[Vision] Starting NID extraction for ${isBack ? "BACK" : "FRONT"} image:`, imageUrl);

    const prompt = `You are an elite document analysis expert specializing in Bangladeshi National ID (NID) cards. 
Analyze the provided image with extreme precision. This is likely the ${isBack ? "BACK (Address side)" : "FRONT (Information side)"} of the card.

CRITICAL INSTRUCTIONS:
1. SPELLING ACCURACY: Do not hallucinate or guess names. Check every character.
2. BILINGUAL MATCHING: Smart NIDs have names in both Bengali and English. Cross-reference them.
3. FIELD MAPPING:
   - "Name (English)" -> nameEn
   - "নাম (বাংলা)" -> nameBn
   - "Father" / "পিতা" -> fatherName (Translate to English)
   - "Mother" / "মাতা" -> motherName (Translate to English)
   - "ID No" / "NID No" -> nidNumber
   - "Date of Birth" / "জন্ম তারিখ" -> dob (Format: YYYY-MM-DD)
   - "Address" / "ঠিকানা" (usually on back) -> permanentAddress (Translate to English accurately)

4. ADDRESS FORMAT: For permanentAddress, include all details: Village/House, Road, Post Office, Upazila/Thana, District.

Return ONLY a valid JSON object. No preamble, no markdown.
{
  "nameEn": "",
  "nameBn": "",
  "nidNumber": "",
  "dob": "",
  "fatherName": "",
  "motherName": "",
  "permanentAddress": ""
}

Rules:
- Translate Father, Mother, and Address to English.
- Keep nameBn in Bengali.`;

    // Convert local path to base64 if needed
    let imageContent: string = imageUrl;
    if (imageUrl.startsWith("/")) {
      const filePath = path.join(process.cwd(), "public", imageUrl);
      try {
        const buffer = await fs.readFile(filePath);
        const ext = path.extname(filePath).slice(1) || "jpeg";
        imageContent = `data:image/${ext};base64,${buffer.toString("base64")}`;
      } catch (err) {
        console.error(`[Vision] Local file not found: ${filePath}`);
        // If local file fails, maybe it's accessible via URL?
        // But usually it's a relative path starting with /
        throw new Error(`NID Image file not found at ${imageUrl}`);
      }
    }

    // Use the Bulletproof Vision Gateway
    const { content, provider } = await askAiVision(imageContent, prompt);

    console.log(`[Vision] AI Response from ${provider} [${isBack ? "BACK" : "FRONT"}]:`, content);

    if (!content) {
      throw new Error("No response from AI Gateway");
    }

    // Attempt to parse the JSON response more robustly
    let extraction: any = {};
    try {
      const jsonStr = content.includes("```json") 
        ? content.split("```json")[1].split("```")[0] 
        : content;
      
      extraction = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.warn("[Vision] JSON Parse failed, attempting regex extraction...");
      extraction = {
        nameEn: content.match(/"(?:nameEn|name)":\s*"([^"]*)"/i)?.[1] || "",
        nameBn: content.match(/"nameBn":\s*"([^"]*)"/i)?.[1] || "",
        nidNumber: content.match(/"(?:nidNumber|idNo|idNumber)":\s*"([^"]*)"/i)?.[1] || "",
        dob: content.match(/"dob":\s*"([^"]*)"/i)?.[1] || "",
        fatherName: content.match(/"fatherName":\s*"([^"]*)"/i)?.[1] || "",
        motherName: content.match(/"motherName":\s*"([^"]*)"/i)?.[1] || "",
        permanentAddress: content.match(/"permanentAddress":\s*"([^"]*)"/i)?.[1] || ""
      };
    }

    // Normalize keys (if AI returned 'name' instead of 'nameEn', etc.)
    if (!extraction.nameEn && extraction.name) extraction.nameEn = extraction.name;
    if (!extraction.nidNumber && extraction.idNo) extraction.nidNumber = extraction.idNo;
    if (!extraction.nidNumber && extraction.idNumber) extraction.nidNumber = extraction.idNumber;

    // Final check - if we have almost nothing, it's a failure for this specific side
    const hasData = Object.values(extraction).some(v => v && v !== "");
    if (!hasData) {
      console.warn(`[Vision] AI returned empty data for ${isBack ? "BACK" : "FRONT"}, falling back to Google...`);
      return await extractWithGoogle(imageUrl);
    }

    // Deduct Credit for Vision Usage (Safe Wrap)
    if (merchantStoreId && merchantStoreId !== "GLOBAL") {
      try {
        await prisma.aiTransaction.create({
          data: {
            merchantStoreId: merchantStoreId,
            amount: -5.0, 
            type: "VISION_USAGE",
            provider: provider,
            description: `NID Extraction (${isBack ? "BACK" : "FRONT"}): ${provider}`
          }
        });
      } catch (e) {
        console.error("Failed to log AI transaction:", e);
      }
    }

    return {
      ...extraction,
      rawText: content,
      provider: provider
    };
  } catch (error) {
    console.error("AI Gateway Extraction Error:", error);
    return await extractWithGoogle(imageUrl);
  }
}


async function extractWithGoogle(imageUrl: string) {
  try {
    // In a production environment with relative URLs, we'd need a full URL for Google Vision
    // or provide the image as a buffer.
    let requestPayload: any;
    
    if (imageUrl.startsWith("/")) {
      const filePath = path.join(process.cwd(), "public", imageUrl);
      const buffer = await fs.readFile(filePath);
      requestPayload = { image: { content: buffer } };
    } else {
      requestPayload = { image: { source: { imageUri: imageUrl } } };
    }

    const [result] = await googleClient.textDetection(requestPayload);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      return { error: "No text detected in image" };
    }

    const fullText = detections[0].description || "";
    
    // Very basic parsing for Google Vision (fragile)
    const info = {
      name: "",
      fatherName: "",
      motherName: "",
      nidNumber: "",
      dob: "",
      permanentAddress: "",
      rawText: fullText,
      provider: "google"
    };

    const lines = fullText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes("নাম") && lines[i+1]) info.name = lines[i+1].trim();
      if (line.includes("পিতা") && lines[i+1]) info.fatherName = lines[i+1].trim();
      if (line.includes("মাতা") && lines[i+1]) info.motherName = lines[i+1].trim();
      if (line.match(/\d{1,2} [A-Za-z]{3} \d{4}/)) info.dob = line.match(/\d{1,2} [A-Za-z]{3} \d{4}/)?.[0] || "";
      if (line.match(/(\d{10,17})/)) info.nidNumber = line.match(/(\d{10,17})/)?.[0] || "";
    }

    return info;
  } catch (error: any) {
    console.error("Google Vision Error:", error);
    return { error: `Google Vision Error: ${error.message || "Failed to extract info"}` };
  }
}
