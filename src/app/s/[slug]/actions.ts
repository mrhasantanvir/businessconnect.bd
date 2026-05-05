"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendOrderNotification } from "@/lib/notifications";

export async function placeOrderAction(data: {
  merchantStoreId: string;
  total: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  items: { productId: string; quantity: number; price: number }[];
}) {
  const storeStatus = await prisma.merchantStore.findUnique({
    where: { id: data.merchantStoreId },
    select: { activationStatus: true }
  });

  if (storeStatus?.activationStatus !== "ACTIVE") {
    throw new Error("This store is currently not taking orders (Pending Verification).");
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("Cannot place an empty order.");
  }

  const order = await prisma.$transaction(async (tx) => {
    // 1. Create the Order
    const newOrder = await tx.order.create({
      data: {
        merchantStoreId: data.merchantStoreId,
        total: data.total,
        status: "PENDING",
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddress: data.deliveryAddress,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    // 2. Reduce Stock
    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    return newOrder;
  });

  // 3. Trigger Notification (Async)
  const store = await prisma.merchantStore.findUnique({
    where: { id: data.merchantStoreId }
  });

  if (store && data.customerEmail) {
    sendOrderNotification({ 
      order, 
      store, 
      customerEmail: data.customerEmail 
    }).catch(console.error);
  }

  // 4. Send Push Notification to Store Owner (New)
  if (store?.ownerId) {
    (async () => {
       try {
          const { NotificationService } = await import("@/services/NotificationService");
          await NotificationService.sendToUser(
            store.ownerId,
            "New Order Received! 💰",
            `Order #${order.id.slice(-6).toUpperCase()} for ৳${order.total} from ${order.customerName}.`,
            { orderId: order.id, type: "NEW_ORDER" }
          );
       } catch (err) {
          console.error("FCM Order Notification Error:", err);
       }
    })();
  }

  revalidatePath("/orders"); 
  revalidatePath(`/s/${store?.slug}/order/${order.id}`);
  
  return { success: true, orderId: order.id };
}

export async function requestReturnAction(orderId: string, data: {
  reason: string,
  method: string,
  details: string,
  items: any[]
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { merchantStore: true }
  });

  if (!order) throw new Error("Order not found");
  if (order.status !== "DELIVERED") throw new Error("Returns only allowed for delivered orders.");

  const request = await prisma.returnRequest.create({
    data: {
      orderId,
      merchantStoreId: order.merchantStoreId,
      reason: data.reason,
      status: "NEW",
      items: JSON.stringify(data.items),
      // We'll store method/details in the reason or a separate metadata if schema not updated
      // But for now let's assume we can add them to a JSON string in reason or metadata
    }
  });

  // Log Activity
  await prisma.orderActivity.create({
    data: {
      orderId,
      type: "STATUS_CHANGE",
      message: `Customer requested a return. Reason: ${data.reason}. Refund Method: ${data.method}`
    }
  });

  revalidatePath(`/s/${order.merchantStore.slug}/order/${orderId}`);
  return { success: true, requestId: request.id };
}
