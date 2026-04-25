"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getFacebookConfigAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  return await prisma.facebookConfig.findUnique({
    where: { merchantStoreId: session.merchantStoreId }
  });
}

export async function updateFacebookConfigAction(data: {
  pixelId?: string;
  adAccountId?: string;
  pageId?: string;
  pageAccessToken?: string;
  isActive?: boolean;
  testEventCode?: string;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const config = await prisma.facebookConfig.upsert({
    where: { merchantStoreId: session.merchantStoreId },
    create: {
      merchantStoreId: session.merchantStoreId,
      pixelId: data.pixelId,
      adAccountId: data.adAccountId,
      pageId: data.pageId,
      accessToken: data.pageAccessToken, // Current token is the Page Access Token for Chatbot
      isActive: data.isActive ?? true,
      testEventCode: data.testEventCode
    },
    update: {
      pixelId: data.pixelId,
      adAccountId: data.adAccountId,
      pageId: data.pageId,
      accessToken: data.pageAccessToken ?? undefined,
      isActive: data.isActive,
      testEventCode: data.testEventCode
    }
  });

  revalidatePath("/merchant/social");
  return config;
}

export async function getDiscoveryDataAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const config = await prisma.facebookConfig.findUnique({
    where: { merchantStoreId: session.merchantStoreId }
  });

  if (!config?.accessToken) return null;

  const { getFacebookAdAccounts, getFacebookPages, getFacebookPixels } = await import("@/lib/social/facebookMeta");
  
  const [adAccounts, pages] = await Promise.all([
    getFacebookAdAccounts(config.accessToken),
    getFacebookPages(config.accessToken)
  ]);

  let pixels: any[] = [];
  if (config.adAccountId) {
    pixels = await getFacebookPixels(config.adAccountId, config.accessToken);
  }

  return { adAccounts, pages, pixels };
}

export async function getFacebookAdsROIAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  // Mock ROI Calculation based on "DELIVERED" orders
  // In a real scenario, we would filter by 'source === "FACEBOOK"'
  const orders = await prisma.order.findMany({
    where: { 
      merchantStoreId: session.merchantStoreId,
      status: "DELIVERED"
    },
    select: { total: true, createdAt: true }
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = orders.length;

  return {
    totalRevenue,
    orderCount,
    adSpend: totalRevenue * 0.15, // Mock: assuming 15% ad spend for demo
    roas: 6.6, // Mock: standard ROAS
  };
}
