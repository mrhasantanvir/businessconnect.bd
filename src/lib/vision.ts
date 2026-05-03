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
    // Use the new Bulletproof Gateway which handles fallbacks automatically
    return await extractWithGateway(imageUrl, merchantStoreId);
  } catch (error) {
    console.error("Extraction Error:", error);
    return { error: "Failed to extract information from NID" };
  }
}

async function extractWithGateway(imageUrl: string, merchantStoreId?: string) {
  try {
    console.log("[Vision] Starting NID extraction for:", imageUrl);

    const prompt = `You are an elite document analysis expert specializing in Bangladeshi National ID (NID) cards. 
Analyze the provided image(s) with extreme precision. 

CRITICAL INSTRUCTIONS:
1. SPELLING ACCURACY: Do not hallucinate or guess names. If a name is "Md. Amzad Hossain", do not return "Md. Mazhad Hossain". Check every character.
2. BILINGUAL MATCHING: Smart NIDs have names in both Bengali and English. Cross-reference them to ensure the spelling is correct.
3. FIELD MAPPING:
   - "Name (English)" -> nameEn
   - "নাম (বাংলা)" -> nameBn
   - "Father" / "পিতা" -> fatherName (Translate to English)
   - "Mother" / "মাতা" -> motherName (Translate to English)
   - "ID No" / "NID No" -> nidNumber
   - "Date of Birth" / "জন্ম তারিখ" -> dob (Format: YYYY-MM-DD)
   - "Address" / "ঠিকানা" (usually on back) -> permanentAddress (Translate to English accurately)

4. ADDRESS FORMAT: For permanentAddress, include all details: Village/House, Road, Post Office, Upazila/Thana, District.

Return ONLY a valid JSON object with these exact keys. No preamble, no markdown code blocks, just raw JSON:
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
- Translate Bengali specific fields (Father, Mother, Address) to English.
- Keep nameBn in original Bengali script.
- Return ONLY valid JSON. No conversational text.`;

    // Convert local path to base64 if needed
    let imageContent: string = imageUrl;
    if (imageUrl.startsWith("/")) {
      const filePath = path.join(process.cwd(), "public", imageUrl);
      const buffer = await fs.readFile(filePath);
      const ext = path.extname(filePath).slice(1) || "jpeg";
      imageContent = `data:image/${ext};base64,${buffer.toString("base64")}`;
    }

    // Use the Bulletproof Vision Gateway
    const { content, provider } = await askAiVision(imageContent, prompt);

    console.log(`[Vision] AI Response from ${provider}:`, content);

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
      // Fallback regex extraction if JSON parsing fails
      extraction = {
        nameEn: content.match(/"nameEn":\s*"([^"]*)"/)?.[1] || "",
        nameBn: content.match(/"nameBn":\s*"([^"]*)"/)?.[1] || "",
        nidNumber: content.match(/"nidNumber":\s*"([^"]*)"/)?.[1] || "",
        dob: content.match(/"dob":\s*"([^"]*)"/)?.[1] || "",
        fatherName: content.match(/"fatherName":\s*"([^"]*)"/)?.[1] || "",
        motherName: content.match(/"motherName":\s*"([^"]*)"/)?.[1] || "",
        permanentAddress: content.match(/"permanentAddress":\s*"([^"]*)"/)?.[1] || ""
      };
    }

    // Final check - if we have almost nothing, it's a failure
    const hasData = Object.values(extraction).some(v => v && v !== "");
    if (!hasData) {
      console.warn("[Vision] AI returned empty data, falling back to Google...");
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
            description: `NID Extraction: ${provider}`
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
  } catch (error) {
    console.error("Google Vision Error:", error);
    return { error: "Failed to extract info" };
  }
}
