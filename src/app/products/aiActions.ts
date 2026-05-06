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
     // Fetch content via proxy/server with a more common browser user-agent
     const res = await fetch(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        cache: 'no-store'
     });
     
     if (!res.ok) throw new Error("Failed to reach URL");
     
     const html = await res.text();
     // Extract critical product data points from HTML even if JS is needed
     const cleanHtml = html.slice(0, 20000); 

     const prompt = `
       You are an e-commerce data extractor. Extract product details from this HTML:
       URL: ${url}
       HTML Snippet: ${cleanHtml}

       Return ONLY a JSON object:
       {
         "name": "Full product title",
         "description": "Cleaned long description",
         "price": numerical_price_only,
         "stock": 100,
         "category": "Detected category",
         "brand": "Detected brand"
       }
     `;

     const { content } = await askAI(prompt, { 
       jsonMode: true,
       systemPrompt: "You are a professional web scraper AI. Extract product data accurately."
     });
     const parsedData = JSON.parse(content);

     return {
       success: true,
       data: {
         ...parsedData,
         images: ["https://picsum.photos/800/800"] // Scrapers usually need specific logic for images
       }
     };
  } catch (error: any) {
     console.error("URL Import Error:", error.message);
     throw new Error("Failed to extract data. This site might be protected or require JavaScript.");
  }
}
