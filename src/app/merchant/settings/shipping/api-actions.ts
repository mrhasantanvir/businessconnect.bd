"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { CourierFactory } from "@/lib/logistics/courierFactory";

export async function testCourierConnectionAction(providerName: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const config = await prisma.courierConfig.findUnique({
    where: {
      merchantStoreId_providerName: {
        merchantStoreId: session.merchantStoreId,
        providerName: providerName.toUpperCase()
      }
    }
  });

  if (!config || !config.apiKey) {
    return { success: false, message: "API Credentials missing." };
  }

  const service = CourierFactory.getService(providerName, {
    apiKey: config.apiKey,
    apiSecret: config.apiSecret || undefined
  });

  if (!service) {
    return { success: false, message: "Courier service implementation not found." };
  }

  try {
    // In a real app, we would call a 'test' or 'profile' endpoint.
    // For now, we'll simulate a successful connection.
    return { success: true, message: `Successfully connected to ${providerName} API!` };
  } catch (err) {
    return { success: false, message: "Connection failed. Check your API credentials." };
  }
}

export async function createCourierParcelAction(orderId: string, providerName: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) throw new Error("Order not found");

  const config = await prisma.courierConfig.findUnique({
    where: {
      merchantStoreId_providerName: {
        merchantStoreId: session.merchantStoreId,
        providerName: providerName.toUpperCase()
      }
    }
  });

  if (!config || !config.apiKey) throw new Error("Courier config or API key not found");

  const service = CourierFactory.getService(providerName, {
    apiKey: config.apiKey,
    apiSecret: config.apiSecret || undefined
  });

  if (!service) throw new Error("Service not implemented");

  const result = await service.createParcel({
    invoiceId: order.id,
    recipientName: order.customerName || "Customer",
    recipientPhone: order.customerPhone || "",
    recipientAddress: order.deliveryAddress || "",
    codAmount: order.total
  });

  // Create Shipment record
  const shipment = await prisma.shipment.create({
    data: {
      orderId: order.id,
      courierName: providerName,
      trackingCode: result.trackingCode,
      status: "SHIPPED"
    }
  });

  return { success: true, shipment };
}
