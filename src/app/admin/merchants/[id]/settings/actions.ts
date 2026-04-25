"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateMerchantCredentialsAction(merchantId: string, data: any) {
  try {
    const { sipUsername, sipPassword, sipDomain, sipPort, smsRate, sipRate } = data;

    await prisma.$transaction([
      // Update basic rates
      prisma.merchantStore.update({
        where: { id: merchantId },
        data: { smsRate, sipRate }
      }),
      // Upsert SIP Config
      prisma.sipConfig.upsert({
        where: { merchantStoreId: merchantId },
        create: {
          merchantStoreId: merchantId,
          username: sipUsername,
          password: sipPassword,
          domain: sipDomain,
          port: parseInt(sipPort) || 5060,
        },
        update: {
          username: sipUsername,
          password: sipPassword,
          domain: sipDomain,
          port: parseInt(sipPort) || 5060,
        }
      })
    ]);

    revalidatePath(`/admin/merchants/${merchantId}/settings`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addMerchantCreditsAction(merchantId: string, type: "SMS" | "SIP", amount: number) {
  try {
    const field = type === "SMS" ? "smsBalance" : "sipBalance";
    
    await prisma.merchantStore.update({
      where: { id: merchantId },
      data: {
        [field]: { increment: amount }
      }
    });

    revalidatePath(`/admin/merchants/${merchantId}/settings`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
