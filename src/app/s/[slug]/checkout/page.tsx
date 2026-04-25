import React from "react";
import { db as prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { SinglePageCheckout } from "@/components/storefront/CheckoutForm";
import { StorefrontProvider } from "@/context/StorefrontContext";

export default async function SinglePageCheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch store and payment configs
  const store = await prisma.merchantStore.findUnique({
    where: { slug: slug },
    include: {
      paymentConfigs: {
        where: { isActive: true }
      }
    }
  });

  if (!store) {
    notFound();
  }

  return (
    <StorefrontProvider storeId={slug}>
      <SinglePageCheckout 
        paymentConfigs={store.paymentConfigs} 
        slug={slug} 
      />
    </StorefrontProvider>
  );
}
