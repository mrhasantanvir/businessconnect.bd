"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function savePaymentConfigAction(data: {
  provider: string;
  apiKey?: string;
  apiSecret?: string;
  merchantId?: string;
  publicKey?: string;
  privateKey?: string;
  storeId?: string;
  storePass?: string;
  isTestMode: boolean;
  isActive: boolean;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const merchantStoreId = session.merchantStoreId;

  await prisma.paymentConfig.upsert({
    where: {
      merchantStoreId_provider: {
        merchantStoreId,
        provider: data.provider
      }
    },
    update: {
      apiKey: data.apiKey,
      apiSecret: data.apiSecret,
      merchantId: data.merchantId,
      publicKey: data.publicKey,
      privateKey: data.privateKey,
      storeId: data.storeId,
      storePass: data.storePass,
      isTestMode: data.isTestMode,
      isActive: data.isActive
    },
    create: {
      merchantStoreId,
      provider: data.provider,
      apiKey: data.apiKey,
      apiSecret: data.apiSecret,
      merchantId: data.merchantId,
      publicKey: data.publicKey,
      privateKey: data.privateKey,
      storeId: data.storeId,
      storePass: data.storePass,
      isTestMode: data.isTestMode,
      isActive: data.isActive
    }
  });

  revalidatePath("/merchant/settings/payments");
  return { success: true };
}

export async function getPaymentConfigsAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  return await prisma.paymentConfig.findMany({
    where: { merchantStoreId: session.merchantStoreId }
  });
}
