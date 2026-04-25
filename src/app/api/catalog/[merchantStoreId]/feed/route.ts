import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

// Force Node.js runtime for large data streams if necessary
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ merchantStoreId: string }> }
) {
  try {
    const { merchantStoreId } = await params;

    const store = await prisma.merchantStore.findUnique({
      where: { id: merchantStoreId },
      include: {
        products: {
          orderBy: { createdAt: "desc" },
          include: { 
            brand: true,
            category: true
          }
        }
      }
    });

    if (!store) {
      return new NextResponse("Merchant Store not found", { status: 404 });
    }

    const baseUrl = store.customDomain 
      ? `https://${store.customDomain}`
      : `https://businessconnect.bd/s/${store.slug}`; 

    const headers = [
      "id",
      "title",
      "description",
      "availability",
      "condition",
      "price",
      "link",
      "image_link",
      "brand",
      "google_product_category",
      "fb_product_category"
    ];

    let csvContent = headers.join(",") + "\n";

    store.products.forEach(product => {
      const id = product.id;
      const title = `"${product.name.replace(/"/g, '""')}"`;
      const description = product.description 
        ? `"${product.description.replace(/"/g, '""')}"`
        : `"${product.name} High Quality Product from ${store.name}"`;
      
      const availability = product.stock > 0 ? "in stock" : "out of stock";
      const condition = "new"; 
      const price = `${product.price.toFixed(2)} BDT`; 
      
      const link = `"${baseUrl}/product/${product.id}"`; 
      const image_link = product.image ? `"${product.image}"` : `""`;
      
      const brand = product.brand?.name ? `"${product.brand.name.replace(/"/g, '""')}"` : `"${store.name}"`;
      const gpc = product.category?.name ? `"${product.category.name.replace(/"/g, '""')}"` : `"Apparel & Accessories"`;
      const fpc = gpc;

      const row = [id, title, description, availability, condition, price, link, image_link, brand, gpc, fpc];
      csvContent += row.join(",") + "\n";
    });

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="facebook-catalog-${store.slug}.csv"`,
        "Cache-Control": "s-maxage=3600, stale-while-revalidate" 
      }
    });

  } catch (error: any) {
    console.error("Facebook Catalog Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
