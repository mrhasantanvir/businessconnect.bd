import { Metadata } from "next";
import React from "react";
import { db as prisma } from "@/lib/db";
import ProductDetailClient from "./ProductDetailClient";
import { TrackingScripts } from "@/components/storefront/TrackingScripts";

export async function generateMetadata({ params }: { params: { slug: string, id: string } }): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.ogTitle || `${product.name} | BusinessConnect`,
    description: product.ogDescription || product.seoDescription || product.description,
    openGraph: {
      title: product.ogTitle || product.name,
      description: product.ogDescription || product.description || undefined,
      images: [product.ogImage || product.image || ""],
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string, id: string } }) {
  const { slug, id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      gallery: true,
      reviews: {
        include: {
          customer: { select: { name: true } }
        }
      }
    }
  });

  const store = await prisma.merchantStore.findUnique({
    where: { slug }
  });

  if (!product || !store) return <div>Product not found</div>;

  const reviews = product.reviews || [];
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length 
    : 5;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [product.image, ...(product.gallery?.map((g: any) => g.url) || [])],
    "description": product.description,
    "sku": product.sku,
    "brand": { "@type": "Brand", "name": store.name },
    "offers": {
      "@type": "Offer",
      "url": `https://${store.slug}.businessconnect.bd/p/${product.id}`,
      "priceCurrency": "BDT",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackingScripts store={store as any} />
      <ProductDetailClient 
        product={product} 
        store={store} 
        slug={slug} 
        id={id} 
        averageRating={averageRating} 
        reviews={reviews.map((r: any) => ({
          ...r,
          customerName: r.customer?.name || "Verified Customer"
        }))} 
      />
    </>
  );
}
