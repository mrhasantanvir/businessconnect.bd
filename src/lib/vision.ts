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

export async function extractNIDInfo(imageUrl: string) {
  try {
    // Use the new Bulletproof Gateway which handles fallbacks automatically
    return await extractWithGateway(imageUrl);
  } catch (error) {
    console.error("Extraction Error:", error);
    return { error: "Failed to extract information from NID" };
  }
}

async function extractWithGateway(imageUrl: string) {
  try {

    const prompt = `You are an expert at reading Bangladeshi National ID (NID) cards. Extract ALL text from this NID card image and return a JSON object with these exact keys:
- nameEn: Full name in ENGLISH (as printed in English on the card)
- nameBn: Full name in BENGALI (বাংলা নাম, as printed in Bengali script)
- nidNumber: The NID number (10, 13, or 17 digit number at the bottom or labeled as "ID No")
- dob: Date of birth in YYYY-MM-DD format (look for "Date of Birth" or "জন্ম তারিখ")
- fatherName: Father's name in English (look for "Father" or "পিতা")
- motherName: Mother's name in English (look for "Mother" or "মাতা")
- permanentAddress: Complete permanent address in English (look for "Address" or "স্থায়ী ঠিকানা" - include village/road, post office, district, all parts)

Rules:
- Translate Bengali text to English for fatherName, motherName, permanentAddress
- Keep nameBn in Bengali script (do not translate)
- If a field is unclear or not visible, return an empty string ""
- Return ONLY valid JSON, no extra text`;

    // Convert local path to base64 if needed (gateway handles both, but let's be consistent)
    let imageContent: string = imageUrl;
    if (imageUrl.startsWith("/")) {
      const filePath = path.join(process.cwd(), "public", imageUrl);
      const buffer = await fs.readFile(filePath);
      const ext = path.extname(filePath).slice(1) || "jpeg";
      imageContent = `data:image/${ext};base64,${buffer.toString("base64")}`;
    }

    // Use the Bulletproof Vision Gateway
    const content = await askAiVision(imageContent, prompt);
    
    if (!content) throw new Error("No response from AI Gateway");

    const cleanJson = content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    return {
      ...parsed,
      rawText: content,
      provider: "ai-gateway"
    };
  } catch (error) {
    console.error("AI Gateway Extraction Error:", error);
    // Fallback to Google Vision if AI Gateway completely fails
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
