"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleAutomationAction(type: string, status: boolean) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) return { success: false, error: "Unauthorized" };

  // Store automation settings in MerchantStore (simplified for now)
  // In a real app, you'd have an AutomationSettings model
  try {
    // Mock saving setting
    console.log(`[AUTOMATION] ${type} is now ${status ? "ACTIVE" : "INACTIVE"}`);
    
    revalidatePath("/merchant/campaigns/marketing-automation");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAbandonedCartsAction() {
    const session = await getSession();
    if (!session || !session.merchantStoreId) return [];

    return prisma.abandonedCart.findMany({
        where: { merchantStoreId: session.merchantStoreId },
        orderBy: { createdAt: "desc" },
        take: 20
    });
}
