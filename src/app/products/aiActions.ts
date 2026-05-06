"use server";

import { generateAiResponse } from "@/lib/ai/inference";
import { getSession } from "@/lib/auth";
import { askAI } from "@/lib/ai/gateway";

export async function analyzeProductImageAction(imageUrl: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const prompt = `
    Analyze this product image and provide:
    1. A professional, catchy product name (max 50 chars).
    2. The most suitable category (one word).
    3. Brand name if visible (else 'Generic').
    4. 5 relevant tags for searching.
    Return ONLY as JSON: {"suggestedName": "...", "category": "...", "brand": "...", "tags": [...]}
  `;

  const { content } = await askAI(prompt, { 
    imageUrl, 
    jsonMode: true,
    systemPrompt: "You are a product vision expert. Analyze images and return structured JSON only."
  });

  try {
    const jsonString = content.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    return {
       suggestedName: "New Product",
       category: "General",
       brand: "Generic",
       tags: ["new"]
    };
  }
}

export async function generateAILongDescriptionAction(data: { name: string, category: string }) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const prompt = `
    Create a professional, high-conversion long description and short description for:
    Product: ${data.name}
    Category: ${data.category}
    
    Return JSON:
    {
      "shortDescription": "One liner catchy desc",
      "longDescription": "Detailed HTML or formatted text for product page",
      "tagline": "Marketing tagline"
    }
  `;

  const responseText = await generateAiResponse({
    merchantStoreId: session.merchantStoreId,
    prompt: prompt,
    context: "Marketing Copywriter",
    model: "gpt-4o-mini"
  });

  try {
    const jsonString = responseText!.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    return {
      shortDescription: "Quality product.",
      longDescription: "Detailed description coming soon.",
      tagline: "Quality Guaranteed"
    };
  }
}

export async function importProductFromChinaUrlAction(url: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  try {
     // Fetch content via proxy/server
     const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
     });
     const html = await res.text();
     const cleanHtml = html.slice(0, 15000); // Higher limit for product pages

     const prompt = `
       Analyze this e-commerce HTML and extract product details:
       Return ONLY as JSON: {"name": "...", "description": "...", "price": 0, "stock": 100, "category": "...", "brand": "..."}
       HTML: ${cleanHtml}
     `;

     const { content } = await askAI(prompt, { jsonMode: true });
     const parsedData = JSON.parse(content);

     return {
       success: true,
       data: {
         ...parsedData,
         images: ["https://picsum.photos/800/800"] // Scrapers usually need specific logic for images, keeping a placeholder for now or using the first detected img
       }
     };
  } catch (error) {
     console.error("URL Import Error:", error);
     throw new Error("Failed to extract data from URL.");
  }
}
