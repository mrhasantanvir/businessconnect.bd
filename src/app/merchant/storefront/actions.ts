"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateStorefrontSettingsAction(data: {
  name?: string;
  address?: string;
  phone?: string;
  description?: string;
  customDomain?: string;
  brandColor?: string;
  welcomeMessage?: string;
  selectedTheme?: string;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const updated = await prisma.merchantStore.update({
    where: { id: session.merchantStoreId },
    data: {
      name: data.name,
      address: data.address,
      phone: data.phone,
      description: data.description,
      customDomain: data.customDomain || null,
      brandColor: data.brandColor || "#1E40AF",
      welcomeMessage: data.welcomeMessage,
      selectedTheme: data.selectedTheme || "THEME_1"
    }
  });

  revalidatePath("/merchant/storefront");
  revalidatePath(`/s/${updated.slug}`);
  return updated;
}
