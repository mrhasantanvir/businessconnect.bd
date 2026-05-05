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

    const prompt = `You are a highly specialized document parser for Bangladeshi National ID (NID) cards. 
Analyze the provided image with surgical precision. 
Identify the card type (Smart Card or Old Laminated) and extract information.

FIELD MAPPING RULES:
- "Name (English)" / "Name" -> nameEn
- "নাম (বাংলা)" -> nameBn
- "Father's Name" / "পিতা" -> fatherName (MUST be in English)
- "Mother's Name" / "মাতা" -> motherName (MUST be in English)
- "NID No" / "ID No" / "National ID" -> nidNumber (10, 13, or 17 digits)
- "Date of Birth" / "জন্ম তারিখ" -> dob (Convert to YYYY-MM-DD)
- "Address" / "ঠিকানা" (Found on the BACK side) -> permanentAddress (Translate to English)

EXTRACTION STRATEGY:
1. Scan for the unique 10, 13, or 17 digit NID number first.
2. Look for "নাম" (Bengali) and "Name" (English) which are usually adjacent.
3. If this is the BACK side, extract the full address including Village, Post Office, and District.
4. If some fields are missing (e.g., this is only one side), leave them as empty strings "".

CRITICAL: Return ONLY a valid JSON object. Do not include any text before or after the JSON.
{
  "nameEn": "",
  "nameBn": "",
  "nidNumber": "",
  "dob": "",
  "fatherName": "",
  "motherName": "",
  "permanentAddress": ""
}`;

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
        throw new Error(`NID Image file not found at ${imageUrl}`);
      }
    }

    // Use the Bulletproof Vision Gateway with a validator
    const validator = (content: string) => {
      const lower = content.toLowerCase();
      // Look for keys or patterns that suggest it actually found something
      return lower.includes("nameen") || lower.includes("namebn") || lower.includes("nidnumber") || 
             lower.includes("name") || lower.includes("nid");
    };

    const { content, provider } = await askAiVision(imageContent, prompt, undefined, validator);

    console.log(`[Vision] AI Response from ${provider} [${isBack ? "BACK" : "FRONT"}]:`, content);

    if (!content) {
      throw new Error("No response from AI Gateway");
    }

    // Attempt to parse the JSON response more robustly
    let extraction: any = {};
    try {
      // Clean the content of any markdown or noise
      const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
      
      // Try to find the first '{' and last '}'
      const firstBrace = cleanContent.indexOf('{');
      const lastBrace = cleanContent.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonPart = cleanContent.substring(firstBrace, lastBrace + 1);
        extraction = JSON.parse(jsonPart);
      } else {
        throw new Error("No JSON object found in response");
      }
    } catch (parseError) {
      console.warn("[Vision] JSON Parse failed, attempting regex extraction...");
      extraction = {
        nameEn: content.match(/"(?:nameEn|name|name_en)":\s*"([^"]*)"/i)?.[1] || 
                content.match(/Name:\s*([A-Za-z\s]+)/i)?.[1]?.trim() || "",
        nameBn: content.match(/"(?:nameBn|name_bn)":\s*"([^"]*)"/i)?.[1] || "",
        nidNumber: content.match(/"(?:nidNumber|idNo|idNumber|nid_no)":\s*"([^"]*)"/i)?.[1] || 
                   content.match(/(?:ID NO|NID NO):\s*(\d+)/i)?.[1] || "",
        dob: content.match(/"(?:dob|date_of_birth)":\s*"([^"]*)"/i)?.[1] || "",
        fatherName: content.match(/"(?:fatherName|father_name)":\s*"([^"]*)"/i)?.[1] || "",
        motherName: content.match(/"(?:motherName|mother_name)":\s*"([^"]*)"/i)?.[1] || "",
        permanentAddress: content.match(/"(?:permanentAddress|address)":\s*"([^"]*)"/i)?.[1] || ""
      };
    }

    // Normalize keys (if AI returned 'name' instead of 'nameEn', etc.)
    if (!extraction.nameEn && extraction.name) extraction.nameEn = extraction.name;
    if (!extraction.nidNumber && extraction.idNo) extraction.nidNumber = extraction.idNo;
    if (!extraction.nidNumber && extraction.idNumber) extraction.nidNumber = extraction.idNumber;

    // Final check - if we have almost nothing, it's a failure for this specific provider
    const crucialDataFound = extraction.nameEn || extraction.nameBn || extraction.nidNumber;
    
    if (!crucialDataFound) {
      console.warn(`[Vision] AI [${provider}] returned suspiciously empty data for ${isBack ? "BACK" : "FRONT"}.`);
      
      // If we used a lower-tier provider, we could try again, but askAI already loops.
      // The issue is askAI returns 'success' even if content is garbage.
      // Let's force a retry by throwing an error if data is empty, allowing the next iteration in askAI (if we were to restructure askAI)
      // For now, if gateway fails to give meaningful data, we trigger Google Fallback.
      console.log(`[Vision] Falling back to Google for ${isBack ? "BACK" : "FRONT"}...`);
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
