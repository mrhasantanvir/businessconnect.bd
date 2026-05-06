import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { askAI } from "@/lib/ai/gateway";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.merchantStoreId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    // 1. Handle AI Context Paste (JSON)
    if (contentType.includes("application/json")) {
       const { context, type } = await req.json();
       if (type === "html_extraction") {
          const prompt = `
            You are a Neural Scraper. Extract product metadata from this raw context (HTML/Text):
            Content Snippet: ${context.slice(0, 30000)}

            Return ONLY JSON:
            {"name": "title", "description": "long description", "price": 0.0, "images": ["url"]}
          `;
          const { content } = await askAI(prompt, { jsonMode: true });
          return NextResponse.json(JSON.parse(content));
       }
    }

    // 2. Handle Vision Analysis (FormData)
    const formData = await req.formData();
    const image = formData.get("image") as File;
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${image.type};base64,${buffer.toString("base64")}`;

    const prompt = `
      Analyze this product image and provide:
      1. A professional product name (max 50 chars).
      2. The most suitable category (one word).
      3. Brand name if visible (else 'Generic').
      4. A brief description (max 100 chars).
      Return ONLY as JSON: {"name": "...", "category": "...", "brand": "...", "description": "..."}
    `;

    const { content } = await askAI(prompt, { 
      imageUrl: base64Image, 
      jsonMode: true 
    });

    const data = JSON.parse(content);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("AI Studio Error:", error);
    return NextResponse.json({ error: "Failed to process AI request" }, { status: 500 });
  }
}
