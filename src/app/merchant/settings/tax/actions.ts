"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateTaxSettingsAction(data: {
  isVatEnabled: boolean;
  vatRate: number;
  binNumber: string;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  await prisma.$executeRaw`
    UPDATE MerchantStore 
    SET isVatEnabled = ${data.isVatEnabled ? 1 : 0}, 
        vatRate = ${data.vatRate}, 
        binNumber = ${data.binNumber}
    WHERE id = ${session.merchantStoreId}
  `;

  revalidatePath("/merchant/settings/tax");
  return { success: true };
}
