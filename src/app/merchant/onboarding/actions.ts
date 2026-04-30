"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notifyAdminMerchantAction } from "@/lib/notifications/admin";

export async function completeOnboardingAction(data: {
  name?: string;
  businessType?: string;
  phone?: string;
  address?: string;
  division?: string;
  district?: string;
  upazila?: string;
  tradeLicenseUrl?: string;
  nidFrontUrl?: string;
  nidBackUrl?: string;
  employeeCount?: number;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) {
    throw new Error("Unauthorized or no store associated");
  }

  await prisma.merchantStore.update({
    where: { id: session.merchantStoreId },
    data: {
      name: data.name,
      businessType: data.businessType,
      phone: data.phone,
      address: data.address,
      division: data.division,
      district: data.district,
      upazila: data.upazila,
      tradeLicenseUrl: data.tradeLicenseUrl,
      nidFrontUrl: data.nidFrontUrl,
      nidBackUrl: data.nidBackUrl,
      employeeCount: data.employeeCount,
      isOnboarded: true,
      activationStatus: "PENDING",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/merchant/onboarding");

  // Notify Admin
  try {
    await notifyAdminMerchantAction(data.name || "Unknown Store", session.name || "Unknown Merchant", "ONBOARDING");
  } catch (err) {
    console.error("Failed to notify admin:", err);
  }

  return { success: true };
}
