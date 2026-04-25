"use server";

import { generateAiResponse } from "@/lib/ai/inference";
import { getSession } from "@/lib/auth";

export async function generateProductSEOAction(data: {
  name: string;
  description: string;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const prompt = `
    Generate high-conversion SEO metadata for a product with the following details:
    Name: ${data.name}
    Description: ${data.description}
    
    Please return the result in EXACT JSON format:
    {
      "title": "High-impact SEO title (max 60 chars)",
      "description": "Compelling meta description (max 160 chars)",
      "keywords": "comma-separated keywords"
    }
  `;

  const responseText = await generateAiResponse({
    merchantStoreId: session.merchantStoreId,
    prompt: prompt,
    context: "E-commerce SEO Expert",
    model: "gpt-4o-mini" // Fast and efficient for text tasks
  });

  try {
    // Clean potential markdown wrap if AI adds it
    const jsonString = responseText!.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI SEO Parse Failure:", responseText);
    throw new Error("Failed to parse AI response. Please try again.");
  }
}
