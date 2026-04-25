"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function subscribeToReportAction(data: {
  reportType: string;
  frequency: string;
  email: string;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  await prisma.reportSubscription.create({
    data: {
      merchantStoreId: session.merchantStoreId,
      reportType: data.reportType,
      frequency: data.frequency,
      email: data.email,
      isActive: true
    }
  });

  revalidatePath("/merchant/reports");
  return { success: true };
}

export async function unsubscribeFromReportAction(subscriptionId: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  await prisma.reportSubscription.update({
    where: { id: subscriptionId, merchantStoreId: session.merchantStoreId },
    data: { isActive: false }
  });

  revalidatePath("/merchant/reports");
  return { success: true };
}

export async function deleteSubscriptionAction(subscriptionId: string) {
    const session = await getSession();
    if (!session || !session.merchantStoreId) throw new Error("Unauthorized");
  
    await prisma.reportSubscription.delete({
      where: { id: subscriptionId, merchantStoreId: session.merchantStoreId }
    });
  
    revalidatePath("/merchant/reports");
    return { success: true };
  }

export async function getReportSubscriptionsAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) return [];

  return await prisma.reportSubscription.findMany({
    where: { merchantStoreId: session.merchantStoreId }
  });
}
