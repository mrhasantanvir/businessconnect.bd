"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function reconcileOrderAction(orderId: string, amount: number) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) return { success: false, error: "Unauthorized" };

  try {
    await prisma.order.update({
      where: { id: orderId, merchantStoreId: session.merchantStoreId },
      data: {
        reconciledAt: new Date(),
        paymentStatus: "PAID",
        cashCollected: amount,
      }
    });

    // Add activity log
    await prisma.orderActivity.create({
      data: {
        orderId,
        type: "PAYMENT_RECEIVED",
        message: `COD Reconciled: ৳${amount} received from courier.`,
      }
    });

    revalidatePath("/merchant/logistics/cod-reconciliation");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkReconcileAction(orderIds: string[]) {
    const session = await getSession();
    if (!session || !session.merchantStoreId) return { success: false, error: "Unauthorized" };

    try {
        await prisma.order.updateMany({
            where: { 
                id: { in: orderIds },
                merchantStoreId: session.merchantStoreId 
            },
            data: {
                reconciledAt: new Date(),
                paymentStatus: "PAID",
            }
        });
        
        revalidatePath("/merchant/logistics/cod-reconciliation");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
