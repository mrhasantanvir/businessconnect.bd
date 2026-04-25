"use server";

import { db as prisma } from "@/lib/db";
import { paymentFactory } from "@/lib/payments/factory";

export async function initializePaymentAction(data: {
  orderId: string;
  providerName: string;
  slug: string;
}) {
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    include: { merchantStore: true }
  });

  if (!order) throw new Error("Order not found");

  const config = await prisma.paymentConfig.findUnique({
    where: {
      merchantStoreId_provider: {
        merchantStoreId: order.merchantStoreId,
        provider: data.providerName
      }
    }
  });

  if (!config || !config.isActive) {
    throw new Error(`${data.providerName} is not active for this store.`);
  }

  const provider = paymentFactory.getProvider(data.providerName);
  if (!provider) throw new Error("Invalid payment provider");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl = `${baseUrl}/api/payments/callback?provider=${data.providerName}&orderId=${data.orderId}&slug=${data.slug}`;

  const request = {
    amount: order.total,
    orderId: order.id,
    customerName: order.customerName || "Customer",
    customerEmail: order.customerEmail || "customer@example.com",
    customerPhone: order.customerPhone || "01700000000",
    callbackUrl: callbackUrl,
    successUrl: callbackUrl,
    failUrl: callbackUrl,
    cancelUrl: callbackUrl
  };

  const response = await provider.initializePayment(config as any, request);

  if (response.success && response.gatewayUrl) {
    return { success: true, url: response.gatewayUrl };
  } else {
    throw new Error(response.error || "Failed to initialize payment");
  }
}

export async function getActivePaymentMethodsAction(merchantStoreId: string) {
  return await prisma.paymentConfig.findMany({
    where: { merchantStoreId, isActive: true },
    select: { provider: true }
  });
}
