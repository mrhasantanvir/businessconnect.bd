"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Fetch all customers for a merchant store with filtering
 */
export async function getCustomersAction(query?: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  return await prisma.customer.findMany({
    where: {
      merchantStoreId: session.merchantStoreId,
      OR: query ? [
        { name: { contains: query } },
        { phone: { contains: query } },
        { email: { contains: query } }
      ] : undefined
    },
    orderBy: { totalSpend: "desc" }
  });
}

/**
 * Fetch a single customer's full detail including orders
 */
export async function getCustomerDetailAction(customerId: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  return await prisma.customer.findUnique({
    where: { id: customerId, merchantStoreId: session.merchantStoreId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10
      },
      user: true
    }
  });
}

/**
 * Update Customer Tags (VIP, Frequent, etc.)
 */
export async function updateCustomerTagsAction(customerId: string, tags: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const customer = await prisma.customer.update({
    where: { id: customerId, merchantStoreId: session.merchantStoreId },
    data: { tags }
  });

  revalidatePath(`/merchant/customers/${customerId}`);
  return customer;
}

/**
 * Internal logic to upsert a customer record from an order
 */
export async function upsertCustomerFromOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });

  if (!order || !order.customerPhone) return;

  // Standard BD logic: phone number is the primary key for identity
  const customer = await prisma.customer.upsert({
    where: {
      merchantStoreId_phone: {
        merchantStoreId: order.merchantStoreId,
        phone: order.customerPhone
      }
    },
    update: {
      name: order.customerName || undefined,
      // Note: We update orderCount/Spend during fulfillment (Delivery) to be safe
    },
    create: {
      merchantStoreId: order.merchantStoreId,
      name: order.customerName,
      phone: order.customerPhone,
      email: order.customerId && order.customerId.includes("@") ? order.customerId : undefined
    }
  });

  // Link Order to this Customer Entity
  await prisma.order.update({
    where: { id: orderId },
    data: { customerEntityId: customer.id }
  });

  return customer;
}

/**
 * Recalculate LTV and Loyalty Points (Triggered on Delivery)
 */
export async function syncCustomerLoyaltyAction(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { orders: { where: { status: "DELIVERED" } } }
  });

  if (!customer) return;

  const totalSpend = customer.orders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = customer.orders.length;
  const loyaltyPoints = Math.floor(totalSpend / 100); // 1 point per 100 BDT

  return await prisma.customer.update({
    where: { id: customerId },
    data: {
      totalSpend,
      orderCount,
      loyaltyPoints
    }
  });
}
