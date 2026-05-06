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
     const res = await fetch(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/'
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(15000) // 15s timeout
     });
     
     if (!res.ok) return { success: false, error: "SITE_BLOCKED" };
     
     const html = await res.text();
     
     let contextData = html.slice(0, 30000); 
     const scriptMatch = html.match(/window\.runParams\s*=\s*({.*?});/s) || 
                         html.match(/data:\s*({.*?}),\s*csrfToken/s) ||
                         html.match(/_itemDetailData\s*=\s*({.*?});/s);

     if (scriptMatch && scriptMatch[1]) {
        contextData = scriptMatch[1].slice(0, 20000);
     }

     const prompt = `
       Extract product details from: ${contextData}
       URL: ${url}
       Return ONLY JSON: {"name": "title", "description": "desc", "price": 0, "stock": 100, "images": ["url"]}
     `;

     const { content } = await askAI(prompt, { 
       jsonMode: true,
       systemPrompt: "Professional Scraper AI."
     });
     
     const parsedData = JSON.parse(content);
     return {
       success: true,
       data: {
         ...parsedData,
         images: (parsedData.images && parsedData.images.length > 0) ? parsedData.images : ["https://picsum.photos/800/800"]
       }
     };
  } catch (error: any) {
     console.error("URL Import Error:", error.message);
     return { success: false, error: error.message || "TIMEOUT" };
  }
}
