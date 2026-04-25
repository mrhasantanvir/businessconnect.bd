"use server";

import { generateAiResponse } from "@/lib/ai/inference";
import { getSession } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

export async function generateAdCopyAction(data: {
  productId: string,
  objective: string,
  merchantStoreId: string
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Fetch product details for better context
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
    select: { name: true, description: true, price: true }
  });

  if (!product) throw new Error("Product not found");

  const prompt = `Generate a high-converting Facebook Ad copy for the following product:
  Name: ${product.name}
  Description: ${product.description || "Premium quality"}
  Price: ${product.price} BDT
  
  Objective: ${data.objective}
  
  The copy should include:
  1. A scroll-stopping hook.
  2. Main benefits/value proposition.
  3. A sense of urgency or social proof.
  4. A clear call to action (CTA).
  5. Use relevant emojis to make it engaging.
  6. Tone: Professional yet exciting.`;

  try {
    const response = await generateAiResponse({
      merchantStoreId: data.merchantStoreId,
      prompt: prompt,
      model: "gpt-4o"
    });

    return { success: true, copy: response };
  } catch (error: any) {
    console.error("Ad Copy Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getMerchantProductsAction(merchantStoreId: string) {
  const products = await prisma.product.findMany({
    where: { merchantStoreId },
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  return products;
}
