"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateMerchantStatusAction(storeId: string, status: "ACTIVE" | "REJECTED") {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.merchantStore.update({
    where: { id: storeId },
    data: {
      activationStatus: status,
      activationDate: status === "ACTIVE" ? new Date() : null,
    },
  });

  revalidatePath("/admin/merchants");
  revalidatePath("/dashboard");
  return { success: true };
}
