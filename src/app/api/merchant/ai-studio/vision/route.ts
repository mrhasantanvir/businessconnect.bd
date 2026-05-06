import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.merchantStoreId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get("image") as File;
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert file to base64 for Gemini
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Analyze this product image and provide:
      1. A professional product name (max 50 chars).
      2. The most suitable category (one word).
      3. Brand name if visible (else 'Generic').
      4. A brief description (max 100 chars).
      Return ONLY as JSON: {"name": "...", "category": "...", "brand": "...", "description": "..."}
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type
        }
      }
    ]);

    const responseText = result.response.text();
    const jsonStr = responseText.match(/\{.*\}/s)?.[0] || "{}";
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Vision AI Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 });
  }
}
