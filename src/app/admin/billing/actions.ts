"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function manualBalanceAdjustAction(
  merchantStoreId: string, 
  type: "SMS" | "SIP", 
  amount: number, 
  reason: string
) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  if (amount === 0) return { success: true };

  await prisma.$transaction(async (tx) => {
    // 1. Log manual adjustment
    await tx.paymentTransaction.create({
      data: {
        trxId: `MANUAL_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        merchantStoreId,
        amount: 0, // Since it's a manual credit not involving money paid
        currency: "MANUAL",
        type: `${type}_ADJUST`,
        status: "SUCCESS"
      }
    });

    // 2. Adjust Balance
    if (type === "SMS") {
      await tx.merchantStore.update({
        where: { id: merchantStoreId },
        data: { smsBalance: { increment: amount } } // Positive to add, negative to remove
      });
    } else {
      await tx.merchantStore.update({
        where: { id: merchantStoreId },
        data: { sipBalance: { increment: amount } }
      });
    }
  });

  revalidatePath("/admin/billing");
  return { success: true };
}

export async function updateStaffPriceAction(staffPrice: number, devicePrice: number) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  await prisma.systemSettings.upsert({
     where: { id: "GLOBAL" },
     update: { 
       staffSubscriptionPrice: staffPrice,
       additionalDevicePrice: devicePrice
     },
     create: { 
       id: "GLOBAL", 
       staffSubscriptionPrice: staffPrice,
       additionalDevicePrice: devicePrice
     }
  });

  revalidatePath("/admin/billing");
  return { success: true };
}

