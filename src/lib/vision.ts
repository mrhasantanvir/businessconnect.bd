import { OpenAI } from "openai";
import { db as prisma } from "@/lib/db";
import vision from "@google-cloud/vision";
import fs from "fs/promises";
import path from "path";

// Google Vision Client (Legacy/Fallback)
const googleClient = new vision.ImageAnnotatorClient({
  credentials: process.env.GOOGLE_VISION_CREDENTIALS 
    ? JSON.parse(process.env.GOOGLE_VISION_CREDENTIALS) 
    : undefined,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

/**
 * Extracts NID information using AI.
 * Prioritizes OpenAI GPT-4o if configured in SystemSettings.
 * Falls back to Google Vision API if OpenAI is unavailable.
 */
export async function extractNIDInfo(imageUrl: string) {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "GLOBAL" }
    });

    if (settings?.openaiApiKey) {
      return await extractWithOpenAI(imageUrl, settings.openaiApiKey, settings.openaiModel || "gpt-4o");
    }

    return await extractWithGoogle(imageUrl);
  } catch (error) {
    console.error("Extraction Error:", error);
    return { error: "Failed to extract information from NID" };
  }
}

async function extractWithOpenAI(imageUrl: string, apiKey: string, model: string) {
  try {
    const openai = new OpenAI({ apiKey });

    let imageContent: string;

    // Handle local paths for OpenAI by converting to base64
    if (imageUrl.startsWith("/")) {
      const filePath = path.join(process.cwd(), "public", imageUrl);
      const buffer = await fs.readFile(filePath);
      const ext = path.extname(filePath).slice(1) || "jpeg";
      imageContent = `data:image/${ext};base64,${buffer.toString("base64")}`;
    } else {
      imageContent = imageUrl;
    }

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Extract the following information from this NID (National ID) card image. Respond ONLY with a JSON object containing these keys: name (English full name), nidNumber (the long identification number), dob (Date of birth in YYYY-MM-DD format), fatherName (English), motherName (English), and permanentAddress (Full address in English). If any field is not clear, leave it as an empty string. The NID might be in Bengali, please translate the values to English." 
            },
            {
              type: "image_url",
              image_url: {
                url: imageContent,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from OpenAI");

    const data = JSON.parse(content);
    return {
      ...data,
      rawText: content,
      provider: "openai"
    };
  } catch (error) {
    console.error("OpenAI Extraction Error:", error);
    // Fallback to Google Vision if OpenAI fails
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
