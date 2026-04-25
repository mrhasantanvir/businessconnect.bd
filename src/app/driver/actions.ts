"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function assignDriverAction(orderId: string, driverId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { 
      assignedDriverId: driverId,
      deliveryStatus: "PICKED_UP" // Assume pick up happens on assignment or soon after
    }
  });
  revalidatePath("/orders");
  revalidatePath("/driver");
  return { success: true };
}

export async function updateDeliveryStatusAction(orderId: string, status: string, cashCollected: number = 0) {
  // If delivered, we also update the main order status
  const orderStatus = status === "DELIVERED" ? "DELIVERED" : "PROCESSING";
  
  await prisma.order.update({
    where: { id: orderId },
    data: { 
      deliveryStatus: status,
      status: orderStatus,
      cashCollected: cashCollected
    }
  });
  
  revalidatePath("/driver");
  revalidatePath("/orders");
  return { success: true };
}
