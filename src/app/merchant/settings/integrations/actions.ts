"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function getIntegrationsStatusAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) return null;

  const [wc, gs, store] = await Promise.all([
    prisma.wcConfig.findUnique({ where: { merchantStoreId: session.merchantStoreId } }),
    prisma.googleSheetsConfig.findUnique({ where: { merchantStoreId: session.merchantStoreId } }),
    prisma.merchantStore.findUnique({ where: { id: session.merchantStoreId } })
  ]);

  const hasTracking = !!(store?.googleAnalyticsId || store?.gtmId || store?.fbPixelId || store?.msClarityId || store?.customScripts);

  return {
    woocommerce: {
      isConnected: !!(wc?.consumerKey && wc?.consumerSecret),
      isActive: wc?.isActive ?? false,
      url: wc?.websiteUrl
    },
    googleSheets: {
      isConnected: !!(gs?.accessToken),
      isActive: gs?.isActive ?? false,
      spreadsheetId: gs?.spreadsheetId
    },
    analytics: {
      isConnected: hasTracking,
      hasActiveTracking: hasTracking,
      statusText: hasTracking ? "Operational" : "Not configured"
    },
    shopify: {
      isConnected: false, // Future implementation
      isActive: false
    }
  };
}
