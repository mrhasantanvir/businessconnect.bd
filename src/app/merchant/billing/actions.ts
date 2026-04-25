"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function initiateRechargeAction(
  type: "SMS" | "SIP" | "SUBSCRIPTION_RENEW" | "SUBSCRIPTION_UPGRADE",
  amount: number,
  credits: number,
  planId?: string
) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const storeId = session.merchantStoreId;

  // In a real app, you'd call bKash/SSLCommerz here.
  // We simulate a successful transaction.

  await prisma.$transaction(async (tx) => {
    // 1. Log the transaction (Legacy PaymentTransaction model)
    await tx.paymentTransaction.create({
      data: {
        merchantStoreId: storeId,
        userId: session.userId,
        amount: amount,
        credits: credits,
        paymentMethod: "BKASH",
        trxId: `BK-${Math.random().toString(36).substring(7).toUpperCase()}`,
        status: "COMPLETED",
        type: type.startsWith("SUBSCRIPTION") ? "SAAS_PLAN" : type as any
      }
    });

    // 2. Apply the impact
    if (type === "SMS") {
      await tx.merchantStore.update({
        where: { id: storeId },
        data: { smsBalance: { increment: credits } }
      });
    } else if (type === "SIP") {
      await tx.merchantStore.update({
        where: { id: storeId },
        data: { sipBalance: { increment: credits } }
      });
    } else if (type === "SUBSCRIPTION_RENEW" || type === "SUBSCRIPTION_UPGRADE") {
      if (!planId) throw new Error("Plan ID missing for subscription action");
      
      const plan = await tx.subscriptionPlan.findUnique({ where: { id: planId } });
      if (!plan) throw new Error("Subscription plan not found");

      // Set expiry to 30 days from now (or extend current expiry if it's a renew)
      const currentExpiry = await tx.merchantStore.findUnique({ 
        where: { id: storeId },
        select: { subscriptionExpiry: true, subscriptionPlanId: true }
      });

      let nextExpiry = new Date();
      nextExpiry.setDate(nextExpiry.getDate() + 30);

      // If it's the same plan and it hasn't expired yet, extend it
      if (type === "SUBSCRIPTION_RENEW" && currentExpiry?.subscriptionExpiry && currentExpiry.subscriptionExpiry > new Date()) {
         nextExpiry = new Date(currentExpiry.subscriptionExpiry);
         nextExpiry.setDate(nextExpiry.getDate() + 30);
      }

      await tx.merchantStore.update({
        where: { id: storeId },
        data: {
          subscriptionPlanId: planId,
          subscriptionExpiry: nextExpiry,
          subscriptionStatus: "ACTIVE",
          plan: plan.name // Sync legacy field
        }
      });
    }
  });

  revalidatePath("/merchant/billing");
  revalidatePath("/dashboard");
  return { success: true };
}
