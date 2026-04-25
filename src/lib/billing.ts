import { db as prisma } from "@/lib/db";

/**
 * Consumes SMS credits from a merchant's balance.
 * Adjustment is based on the merchant's specific smsRate.
 */
export async function consumeSms(storeId: string, count: number = 1) {
  const store = await prisma.merchantStore.findUnique({
    where: { id: storeId },
    select: { smsBalance: true, smsRate: true }
  });

  if (!store) throw new Error("Store not found");
  
  const totalCost = count * store.smsRate;
  
  if (store.smsBalance < totalCost) {
    throw new Error("Insufficient SMS balance");
  }

  return prisma.merchantStore.update({
    where: { id: storeId },
    data: {
      smsBalance: { decrement: totalCost }
    }
  });
}

/**
 * Consumes SIP (Call) credits from a merchant's balance.
 * Adjustment is based on minutes (rounded up) and the merchant's sipRate.
 */
export async function consumeSipMinutes(storeId: string, durationSeconds: number) {
  const store = await prisma.merchantStore.findUnique({
    where: { id: storeId },
    select: { sipBalance: true, sipRate: true }
  });

  if (!store) throw new Error("Store not found");

  const minutes = Math.ceil(durationSeconds / 60);
  const totalCost = minutes * store.sipRate;

  if (store.sipBalance < totalCost) {
    throw new Error("Insufficient SIP balance");
  }

  return prisma.merchantStore.update({
    where: { id: storeId },
    data: {
      sipBalance: { decrement: totalCost }
    }
  });
}

/**
 * Logs a consumption transaction in the database for transparency.
 */
export async function logConsumption(storeId: string, type: "SMS" | "SIP", amount: number, details: string) {
    // In a production app, you'd have a ConsumptionLog model.
    // For now, we can use the PaymentTransaction model with a specific type,
    // but typically consumption is separate from top-ups.
    console.log(`[BILLING] Store ${storeId} consumed ${amount} for ${type}. Details: ${details}`);
}
