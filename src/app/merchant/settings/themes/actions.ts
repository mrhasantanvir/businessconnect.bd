"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateStoreThemeAction(themeId: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  await prisma.$executeRaw`
    UPDATE MerchantStore 
    SET selectedTheme = ${themeId}
    WHERE id = ${session.merchantStoreId}
  `;

  revalidatePath("/merchant/settings/themes");
  return { success: true };
}
