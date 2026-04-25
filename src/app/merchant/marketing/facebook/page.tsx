import React from "react";
import FacebookAdsIntelligence from "@/components/merchant/marketing/facebook/FacebookAdsIntelligence";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

import { getMerchantProductsAction } from "./actions";
import { db as prisma } from "@/lib/db";

export default async function FacebookAdsPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) {
    redirect("/login");
  }

  const products = await getMerchantProductsAction(session.merchantStoreId);

  return <FacebookAdsIntelligence products={products} merchantStoreId={session.merchantStoreId} />;
}

