"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateAiGlobalSettingsAction(data: {
  openaiApiKey?: string,
  openaiModel?: string,
  openRouterKey?: string,
  openRouterModel?: string,
  geminiKey?: string,
  geminiModel?: string,
  deepseekKey?: string,
  deepseekModel?: string,
  groqKey?: string,
  groqModel?: string,
  aiProviderPriority?: string,
  googleVisionKey?: string,
  fbAppSecret?: string,
  aiCreditPrice?: number
}) {
  await prisma.systemSettings.upsert({
    where: { id: "GLOBAL" },
    update: data,
    create: { 
      id: "GLOBAL",
      ...data
    }
  });

  revalidatePath("/admin/ai-settings");
  return { success: true };
}

export async function rechargeMerchantAiBalanceAction(data: {
  merchantStoreId: string,
  amount: number,
  notes?: string
}) {
  await prisma.$transaction([
    prisma.merchantStore.update({
      where: { id: data.merchantStoreId },
      data: { aiBalance: { increment: data.amount } }
    }),
    prisma.aiTransaction.create({
      data: {
        merchantStoreId: data.merchantStoreId,
        amount: data.amount,
        type: "TOPUP",
        description: data.notes || "Manual Admin Top-up"
      }
    })
  ]);

  revalidatePath("/admin/merchants");
  return { success: true };
}
