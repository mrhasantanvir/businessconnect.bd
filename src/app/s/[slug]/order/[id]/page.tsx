import React from "react";
import { db as prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { OrderStatusPage } from "@/components/storefront/OrderStatusPage";

export default async function OrderTrackingPage({ params }: { params: Promise<{ slug: string, id: string }> }) {
  const { slug, id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true
        }
      },
      merchantStore: true
    }
  });

  if (!order || order.merchantStore.slug !== slug) {
    notFound();
  }

  return (
    <OrderStatusPage 
      order={order} 
      store={order.merchantStore} 
      slug={slug} 
    />
  );
}
