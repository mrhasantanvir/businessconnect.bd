import React from "react";
import { db as prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { CartAndCheckout } from "@/components/storefront/CartAndCheckout";
import { Theme_1 } from "@/components/storefront/themes/Theme_1";
import { ThemeVogue } from "@/components/storefront/themes/ThemeVogue";
import { ThemeOrganic } from "@/components/storefront/themes/ThemeOrganic";
import { ThemeTitan } from "@/components/storefront/themes/ThemeTitan";
import { ThemeDairy } from "@/components/storefront/themes/ThemeDairy";
import { ThemeModern } from "@/components/storefront/themes/ThemeModern";
import { ThemeNokkhotro } from "@/components/storefront/themes/ThemeNokkhotro";
import { StorefrontProvider } from "@/context/StorefrontContext";
import { TrackingScripts } from "@/components/storefront/TrackingScripts";

export default async function MerchantStorefront({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const store = await prisma.merchantStore.findUnique({
    where: { slug: slug },
    include: {
      categories: true,
      products: {
        where: { stock: { gt: 0 } },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!store) {
    notFound();
  }

  // Theme Picker Logic
  let ThemeComponent = Theme_1; // Default
  if (store.selectedTheme === "VOGUE_FASHION") {
    ThemeComponent = ThemeVogue;
  } else if (store.selectedTheme === "ORGANIC_FRESH") {
    ThemeComponent = ThemeOrganic;
  } else if (store.selectedTheme === "TECH_NOIR") {
    ThemeComponent = ThemeTitan;
  } else if (store.selectedTheme === "DAIRY_DELIGHT") {
    ThemeComponent = ThemeDairy;
  } else if (store.selectedTheme === "MODERN_MINIMAL") {
    ThemeComponent = ThemeModern;
  } else if (store.selectedTheme === "NOKKHOTRO_GOLD") {
    ThemeComponent = ThemeNokkhotro;
  }

  return (
    <StorefrontProvider storeId={store.id}>
      <TrackingScripts store={store} />
      <ThemeComponent 
        store={store} 
        brandColor={store.brandColor || "#1E40AF"} 
      />
      
      {/* Universal Cart OS */}
      <CartAndCheckout storeId={store.id} />
    </StorefrontProvider>
  );
}
