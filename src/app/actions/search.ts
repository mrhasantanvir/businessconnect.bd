"use server";

import { db as prisma } from "@/lib/db";

export async function predictiveSearchAction(query: string, storeId: string) {
  if (!query || query.length < 2) return [];

  // Search products by name or category in the specific store
  const results = await prisma.product.findMany({
    where: {
      merchantStoreId: storeId,
      OR: [
        { name: { contains: query } },
        { category: { name: { contains: query } } }
      ]
    },
    take: 5,
    select: {
      id: true,
      name: true,
      price: true,
      image: true,
      category: { select: { name: true } }
    }
  });

  return results;
}
