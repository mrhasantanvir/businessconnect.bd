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

export async function getEmailTemplatesAction() {
  try {
    const templates = await prisma.emailTemplate.findMany();
    
    // Seed default templates if they don't exist
    const defaultTypes = [
      { type: "STORE_ACTIVATED", name: "Store Activation Success", subject: "Welcome to BusinessConnect! Your Store is Active" },
      { type: "DOCUMENTS_REUPLOAD", name: "Request Document Reupload", subject: "Action Required: Reupload your Business Documents" },
      { type: "STORE_REJECTED", name: "Store Application Rejected", subject: "Update on your BusinessConnect Application" }
    ];

    if (templates.length === 0) {
      await prisma.emailTemplate.createMany({
        data: defaultTypes.map(t => ({
          ...t,
          body: `Hello,\n\nThis is an automated message regarding your store.\n\nThank you.`
        }))
      });
      return await prisma.emailTemplate.findMany();
    }
    
    return templates;
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return [];
  }
}

export async function updateEmailTemplateAction(id: string, data: any) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

    const template = await prisma.emailTemplate.update({
      where: { id },
      data
    });

    return { success: true, template };
  } catch (error: any) {
    console.error("Error updating template:", error);
    return { success: false, error: error.message };
  }
}
