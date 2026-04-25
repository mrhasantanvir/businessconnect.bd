import { prisma } from './db';

export class InsufficientBalanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientBalanceError';
  }
}

export async function deductSmsBalance(merchantStoreId: string, count: number = 1) {
  const store = await prisma.merchantStore.findUnique({ where: { id: merchantStoreId } });
  if (!store) throw new Error("Merchant Store not found");

  if (store.subscriptionStatus === "EXPIRED" || (store.subscriptionExpiry && new Date(store.subscriptionExpiry) < new Date())) {
     throw new Error("Your Store Subscription has expired. Please renew your plan before sending SMS.");
  }

  const cost = store.smsRate * count;
  if (store.smsBalance < cost) {
    throw new InsufficientBalanceError("Insufficient SMS balance. Please recharge your wallet.");
  }

  const updatedStore = await prisma.merchantStore.update({
    where: { id: merchantStoreId },
    data: { smsBalance: { decrement: cost } },
  });

  return updatedStore;
}

export async function deductSipBalance(merchantStoreId: string, minutes: number = 1) {
  const store = await prisma.merchantStore.findUnique({ where: { id: merchantStoreId } });
  if (!store) throw new Error("Merchant Store not found");

  if (store.subscriptionStatus === "EXPIRED" || (store.subscriptionExpiry && new Date(store.subscriptionExpiry) < new Date())) {
     throw new Error("Your Store Subscription has expired. Please renew your plan before making SIP calls.");
  }

  const cost = store.sipRate * minutes;
  if (store.sipBalance < cost) {
    throw new InsufficientBalanceError("Insufficient SIP balance for the call duration. Please recharge.");
  }

  const updatedStore = await prisma.merchantStore.update({
    where: { id: merchantStoreId },
    data: { sipBalance: { decrement: cost } },
  });

  return updatedStore;
}
