
"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updatePrintSettingsAction(config: any) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const store = await prisma.merchantStore.findUnique({
    where: { id: session.merchantStoreId }
  });

  let currentConfig: any = {};
  try {
    if (store?.themeConfig) {
      currentConfig = JSON.parse(store.themeConfig);
    }
  } catch (err) {
    console.error("Parse error:", err);
  }

  // Merge print config
  const newConfig = {
    ...currentConfig,
    print: config
  };

  await prisma.merchantStore.update({
    where: { id: session.merchantStoreId },
    data: {
      themeConfig: JSON.stringify(newConfig)
    }
  });

  revalidatePath("/merchant/settings/print");
  return { success: true };
}
