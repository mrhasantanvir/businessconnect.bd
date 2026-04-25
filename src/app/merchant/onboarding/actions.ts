"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function completeOnboardingAction(data: {
  name?: string;
  slug?: string;
  phone?: string;
  address?: string;
  fbPage?: string;
  igProfile?: string;
  selectedTheme?: string;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) {
    throw new Error("Unauthorized or no store associated");
  }

  await prisma.merchantStore.update({
    where: { id: session.merchantStoreId },
    data: {
      ...data,
      isOnboarded: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/merchant/onboarding");
  return { success: true };
}
