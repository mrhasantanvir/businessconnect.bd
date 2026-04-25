"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createOrUpdatePlanAction(data: {
  id?: string;
  name: string;
  monthlyPrice: number;
  maxProducts: number;
  maxStaff: number;
  badgeColor: string;
  features: string[];
  isActive: boolean;
}) {
  const planData = {
    name: data.name,
    monthlyPrice: data.monthlyPrice,
    maxProducts: data.maxProducts,
    maxStaff: data.maxStaff,
    badgeColor: data.badgeColor,
    featuresData: JSON.stringify(data.features),
    isActive: data.isActive
  };

  if (data.id) {
    await prisma.subscriptionPlan.update({
      where: { id: data.id },
      data: planData
    });
  } else {
    await prisma.subscriptionPlan.create({
      data: planData
    });
  }

  revalidatePath("/admin/subscriptions");
  revalidatePath("/merchant/billing");
  return { success: true };
}

export async function deletePlanAction(id: string) {
  // Check if any store is using this plan
  const count = await prisma.merchantStore.count({
    where: { subscriptionPlanId: id }
  });

  if (count > 0) {
    throw new Error("Cannot delete plan. There are merchants assigned to it.");
  }

  await prisma.subscriptionPlan.delete({ where: { id } });
  revalidatePath("/admin/subscriptions");
  return { success: true };
}
