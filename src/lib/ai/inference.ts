import { OpenAI } from "openai";
import { db as prisma } from "@/lib/db";
import { askAI } from "./gateway";

/**
 * AI Inference Engine with SaaS Credit Deduction Layer
 */
export async function generateAiResponse(data: {
  merchantStoreId: string,
  prompt: string,
  context?: string,
  model?: string
}) {
  const store = await prisma.merchantStore.findUnique({
    where: { id: data.merchantStoreId },
    select: { aiBalance: true, aiRate: true }
  });

  if (!store || store.aiBalance < store.aiRate) {
    throw new Error("INSUFFICIENT_AI_CREDIT: Please top-up to resume AI services.");
  }

  // Use Bulletproof AI Gateway with fallback support
  const { content: aiContent, provider } = await askAI(data.prompt, {
    systemPrompt: "You are a professional shop assistant for a business. Use the following context to answer customers accurately. Context: " + (data.context || "Standard Retail")
  });

  // SaaS Logic: Deduct Credit
  await prisma.$transaction([
    prisma.merchantStore.update({
      where: { id: data.merchantStoreId },
      data: { aiBalance: { decrement: store.aiRate } }
    }),
    prisma.aiTransaction.create({
      data: {
        merchantStoreId: data.merchantStoreId,
        amount: -store.aiRate,
        type: "USAGE",
        provider: provider,
        description: `AI Chat: ${provider} (${data.model || "default"})`
      }
    })
  ]);

  return aiContent;
}

/**
 * Image Intelligence using Google Vision API
 */
export async function analyzeImageWithVision(data: {
  merchantStoreId: string,
  imageUrl: string
}) {
  const store = await prisma.merchantStore.findUnique({
    where: { id: data.merchantStoreId },
    select: { aiBalance: true, aiRate: true }
  });

  const visionCost = (store?.aiRate || 1) * 5; // Vision costs 5x of standard chat

  if (!store || store.aiBalance < visionCost) {
    throw new Error("INSUFFICIENT_AI_CREDIT: Image Intelligence requires more units.");
  }

  const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
  if (!settings?.googleVisionKey) throw new Error("SYSTEM_ERROR: Google Vision Gateway missing.");

  // Real Google Vision Implementation
  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${settings.googleVisionKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { source: { imageUri: data.imageUrl } },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 10 },
                { type: 'IMAGE_PROPERTIES', maxResults: 1 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 5 }
              ]
            }
          ]
        })
      }
    );

    const result = await response.json();
    const labels = result.responses[0]?.labelAnnotations?.map((l: any) => l.description).join(", ") || "Unknown items";
    const objects = result.responses[0]?.localizedObjectAnnotations?.map((o: any) => o.name).join(", ");
    
    const description = `Detected: ${labels}. ${objects ? `Objects found: ${objects}.` : ""}`;

    await prisma.$transaction([
      prisma.merchantStore.update({
        where: { id: data.merchantStoreId },
        data: { aiBalance: { decrement: visionCost } }
      }),
      prisma.aiTransaction.create({
        data: {
          merchantStoreId: data.merchantStoreId,
          amount: -visionCost,
          type: "USAGE",
          description: `Visual Scan: Google Vision Intelligence`
        }
      })
    ]);

    return description;
  } catch (error) {
    console.error("Vision API Error:", error);
    return "Could not analyze image. Defaulting to standard description.";
  }
}

/**
 * Advanced NID Data Extraction (AI Powered)
 * 1. Uses Google Vision TEXT_DETECTION to get raw strings.
 * 2. Uses GPT to parse strings into structured NID fields.
 */
export async function extractNidDataWithVision(data: {
  merchantStoreId: string,
  imageUrl: string
}) {
  const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
  if (!settings?.googleVisionKey) throw new Error("SYSTEM_ERROR: Google Vision Gateway missing.");

  try {
    // 1. Get raw text from Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${settings.googleVisionKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { source: { imageUri: data.imageUrl } },
            features: [{ type: 'TEXT_DETECTION' }]
          }]
        })
      }
    );

    const visionResult = await visionResponse.json();
    const rawText = visionResult.responses[0]?.fullTextAnnotation?.text;

    if (!rawText) return null;

    // 2. Use GPT to structure the data
    const structuredData = await generateAiResponse({
      merchantStoreId: data.merchantStoreId,
      prompt: `Extract NID information from the following raw text detected from a Bangladesh NID image. 
      Return ONLY a JSON object with fields: name, nidNumber, dob (YYYY-MM-DD), and permanentAddress.
      Raw Text: ${rawText}`,
      model: "gpt-4o"
    });

    try {
      return JSON.parse(structuredData.replace(/```json|```/g, ""));
    } catch (e) {
      console.error("Failed to parse GPT response for NID:", structuredData);
      return null;
    }
  } catch (error) {
    console.error("NID Extraction Error:", error);
    return null;
  }
}
