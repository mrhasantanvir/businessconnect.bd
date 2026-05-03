"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { PaymentService } from "@/services/PaymentService";

export async function initiateRechargeAction(
  type: "SMS" | "SIP" | "SUBSCRIPTION_RENEW" | "SUBSCRIPTION_UPGRADE" | "INVOICE_PAY",
  amount: number,
  credits: number,
  planId?: string,
  invoiceId?: string
) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const storeId = session.merchantStoreId;

  // For this implementation, we default to bKash as requested
  const result = await PaymentService.initiateBkashPayment(storeId, amount, type, {
    planId,
    invoiceId,
    credits
  });

  if (result.success && result.redirectUrl) {
    // We return the URL so the client component can redirect
    return { success: true, redirectUrl: result.redirectUrl };
  }

  throw new Error("Failed to initiate payment");
}
