import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

/**
 * Meta Catalog Sync Feed (Standard JSON Format)
 * Allows Meta to crawl product inventory in real-time.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");

  if (!storeId) {
    return NextResponse.json({ error: "Store ID required" }, { status: 400 });
  }

  try {
    const products = await prisma.product.findMany({
      where: { merchantStoreId: storeId, status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        stock: true,
        category: true,
        brand: true,
      }
    });

    // Format for Meta Catalog
    const feed = products.map(p => ({
      id: p.id,
      title: p.name,
      description: p.description || p.name,
      availability: p.stock > 0 ? "in stock" : "out of stock",
      condition: "new",
      price: `${p.price} BDT`,
      link: `https://businessconnect.bd/p/${p.id}`,
      image_link: p.image || "https://businessconnect.bd/placeholder.png",
      brand: p.brand || "Generic",
      google_product_category: p.category || "General",
    }));

    return NextResponse.json(feed, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
      }
    });
  } catch (error: any) {
    console.error("Catalog Feed Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
