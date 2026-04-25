"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getSystemSettingsAction() {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "GLOBAL" },
    });
    
    // If doesn't exist, create default
    if (!settings) {
      return await prisma.systemSettings.create({
        data: { id: "GLOBAL" },
      });
    }
    
    return settings;
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return null;
  }
}

export async function updateSystemSettingsAction(data: any) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    const settings = await prisma.systemSettings.upsert({
      where: { id: "GLOBAL" },
      update: data,
      create: { id: "GLOBAL", ...data },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/dashboard"); // For live chat visibility checks
    
    return { success: true, settings };
  } catch (error: any) {
    console.error("Error updating system settings:", error);
    return { success: false, error: error.message };
  }
}
