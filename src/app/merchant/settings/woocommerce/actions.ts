"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function saveWcSettingsAction(data: { websiteUrl: string, deductInventory: boolean }) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const config = await prisma.wcConfig.upsert({
    where: { merchantStoreId: session.merchantStoreId },
    update: {
      websiteUrl: data.websiteUrl,
      deductInventory: data.deductInventory
    },
    create: {
      merchantStoreId: session.merchantStoreId,
      websiteUrl: data.websiteUrl,
      deductInventory: data.deductInventory,
      isActive: true
    }
  });

  return config;
}

export async function getWcConfigAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  return await prisma.wcConfig.findUnique({
    where: { merchantStoreId: session.merchantStoreId }
  });
}
