"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAnalyticsSettingsAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const store = await prisma.merchantStore.findUnique({
    where: { id: session.merchantStoreId },
    select: {
      googleAnalyticsId: true,
      gtmId: true,
      fbPixelId: true,
      msClarityId: true,
      customScripts: true,
    }
  });

  return store;
}

export async function updateAnalyticsSettingsAction(data: {
  googleAnalyticsId?: string;
  gtmId?: string;
  fbPixelId?: string;
  msClarityId?: string;
  customScripts?: string;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  await prisma.merchantStore.update({
    where: { id: session.merchantStoreId },
    data: {
      googleAnalyticsId: data.googleAnalyticsId,
      gtmId: data.gtmId,
      fbPixelId: data.fbPixelId,
      msClarityId: data.msClarityId,
      customScripts: data.customScripts,
    }
  });

  revalidatePath("/merchant/settings/integrations");
  return { success: true };
}
