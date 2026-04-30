"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notifyAdminMerchantAction } from "@/lib/notifications/admin";

export async function reuploadDocumentsAction(data: {
  tradeLicenseUrl?: string;
  nidFrontUrl?: string;
  nidBackUrl?: string;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) {
    throw new Error("Unauthorized");
  }

  const store = await prisma.merchantStore.findUnique({
    where: { id: session.merchantStoreId },
    select: { name: true }
  });

  await prisma.merchantStore.update({
    where: { id: session.merchantStoreId },
    data: {
      tradeLicenseUrl: data.tradeLicenseUrl || undefined,
      nidFrontUrl: data.nidFrontUrl || undefined,
      nidBackUrl: data.nidBackUrl || undefined,
      activationStatus: "PENDING",
      reuploadMessage: null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/merchant/settings/documents");

  // Notify Admin
  try {
    await notifyAdminMerchantAction(store?.name || "Unknown Store", session.name || "Unknown Merchant", "REUPLOAD");
  } catch (err) {
    console.error("Failed to notify admin:", err);
  }

  return { success: true };
}
