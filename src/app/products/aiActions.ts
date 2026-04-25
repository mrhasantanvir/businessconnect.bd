"use server";

import { generateAiResponse } from "@/lib/ai/inference";
import { getSession } from "@/lib/auth";

export async function analyzeProductImageAction(imageUrl: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const prompt = `
    Analyze this product image URL: ${imageUrl}
    (Simulate image recognition)
    
    Return a JSON with:
    {
      "suggestedName": "A catchy product name",
      "category": "Detected category",
      "brand": "Suggested brand if applicable",
      "tags": ["tag1", "tag2"],
      "confidence": 0.95
    }
  `;

  // In a real scenario, we'd use a vision model (e.g., gpt-4o or gemini-pro-vision)
  const responseText = await generateAiResponse({
    merchantStoreId: session.merchantStoreId,
    prompt: prompt,
    context: "Product Vision Expert",
    model: "gpt-4o" 
  });

  try {
    const jsonString = responseText!.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    return {
       suggestedName: "New Product",
       category: "General",
       brand: "Generic",
       tags: ["new"],
       confidence: 0.5
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

  // Mocking China URL Import logic (Alibaba, 1688, etc.)
  return {
    success: true,
    data: {
      name: "Imported Product from China",
      description: "Extracted from " + url,
      price: 1500,
      stock: 100,
      images: ["https://picsum.photos/800/800"],
      brand: "Imported",
      category: "Global Import"
    }
  };
}
