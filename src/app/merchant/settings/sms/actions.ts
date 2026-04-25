"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveSmsConfigAction(formData: FormData) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) {
    return { success: false, error: "Unauthorized" };
  }

  const provider = formData.get("provider") as string;
  const isActive = formData.get("isActive") === "true";
  
  const configData: any = {
    isActive,
    apiKey: formData.get("apiKey") as string,
    senderId: formData.get("senderId") as string,
    apiUrl: formData.get("apiUrl") as string || null,
  };

  try {
    await prisma.smsConfig.upsert({
      where: {
        merchantStoreId_provider: {
          merchantStoreId: session.merchantStoreId,
          provider: provider,
        },
      },
      update: configData,
      create: {
        merchantStoreId: session.merchantStoreId,
        provider: provider,
        ...configData,
      },
    });

    revalidatePath("/merchant/settings/sms");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendTestSmsAction(provider: string, phone: string) {
    const session = await getSession();
    if (!session || !session.merchantStoreId) return { success: false, error: "Unauthorized" };

    // Mock sending SMS
    console.log(`[SMS MOCK] Sending test SMS via ${provider} to ${phone}`);
    
    // Check if store has balance (demo)
    const store = await prisma.merchantStore.findUnique({
        where: { id: session.merchantStoreId },
        select: { smsBalance: true, name: true }
    });

    if (!store || store.smsBalance <= 0) {
        return { success: false, error: "Insufficient SMS Balance. Please top up." };
    }

    // Deduct balance (mock)
    await prisma.merchantStore.update({
        where: { id: session.merchantStoreId },
        data: { smsBalance: { decrement: 0.5 } } // 0.5 BDT per SMS
    });

    return { success: true, message: `Test SMS sent via ${provider}! Check your phone.` };
}
