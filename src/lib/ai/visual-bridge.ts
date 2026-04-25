import { db as prisma } from "@/lib/db";
import { analyzeImageWithVision } from "./inference";

/**
 * Intelligent Visual Search Bridge
 * Converts customer-sent images into Orderable Product objects.
 */
export async function visualSearchToProduct(data: {
  merchantStoreId: string,
  imageUrl: string
}) {
  console.log(`AI Vision: Scanning inventory for image: ${data.imageUrl}`);

  try {
     // 1. Get descriptive text from Google Vision
     const description = await analyzeImageWithVision({
        merchantStoreId: data.merchantStoreId,
        imageUrl: data.imageUrl
     });

     // 2. Perform Keyword Search in Merchant's Products
     // Splits description into words and searches for closest name match
     const keywords = description.split(" ");
     
     const matchedProduct = await prisma.product.findFirst({
        where: {
           merchantStoreId: data.merchantStoreId,
           OR: keywords.map(w => ({
              name: { contains: w }
           }))
        }
      });

      if (!matchedProduct) return { status: "NOT_FOUND", info: description };

      return {
         status: "FOUND",
         product: matchedProduct,
         reasoning: `AI identified this as: ${description}`
      };
  } catch (err) {
     console.error("Visual Intelligence Error:", err);
     throw err;
  }
}
