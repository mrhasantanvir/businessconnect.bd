"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";

async function sendMerchantEmail(storeId: string, templateType: string, customMessage: string | null = null, missingDocs: string | null = null) {
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
    if (!settings?.smtpHost || !settings?.smtpUser || !settings?.smtpPass) {
      console.log("SMTP not configured, skipping email.");
      return;
    }

    const template = await prisma.emailTemplate.findUnique({ where: { type: templateType } });
    if (!template || !template.isActive) return;

    const store = await prisma.merchantStore.findUnique({
      where: { id: storeId },
      include: { users: { where: { role: "MERCHANT" } } }
    });

    const merchantUser = store?.users?.[0];
    if (!merchantUser?.email) return;

    // Replace variables
    let body = template.body
      .replace(/\{\{store_name\}\}/g, store?.name || "Your Store")
      .replace(/\{\{merchant_name\}\}/g, merchantUser.name || "Merchant")
      .replace(/\{\{missing_documents\}\}/g, missingDocs || "N/A")
      .replace(/\{\{message\}\}/g, customMessage || "");

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"${settings.siteTitle}" <${settings.smtpFrom || settings.smtpUser}>`,
      to: merchantUser.email,
      subject: template.subject,
      html: body,
    });
    console.log(`Email sent to ${merchantUser.email} for ${templateType}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export async function updateMerchantStatusAction(storeId: string, status: string, missingDocs: string | null = null, message: string | null = null) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    console.log(`UPDATING MERCHANT STATUS: ${storeId} to ${status}`);
    await prisma.merchantStore.update({
      where: { id: storeId },
      data: {
        activationStatus: status,
        activationDate: status === "ACTIVE" ? new Date() : null,
        missingDocuments: missingDocs,
        reuploadMessage: message,
      },
    });

    // Fire & Forget email sending (don't block the UI response)
    if (status === "ACTIVE") sendMerchantEmail(storeId, "STORE_ACTIVATED");
    if (status === "REJECTED") sendMerchantEmail(storeId, "STORE_REJECTED");
    if (status === "DOCUMENTS_REJECTED") sendMerchantEmail(storeId, "DOCUMENTS_REUPLOAD", message, missingDocs);

    revalidatePath("/admin/merchants");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function archiveMerchantAction(storeId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

    const now = new Date();
    console.log(`ARCHIVING STORE: ${storeId}`);
    await prisma.$transaction([
      prisma.merchantStore.update({
        where: { id: storeId },
        data: { isArchived: true, archivedAt: now }
      }),
      prisma.user.updateMany({
        where: { merchantStoreId: storeId },
        data: { isArchived: true, archivedAt: now }
      })
    ]);

    revalidatePath("/admin/merchants");
    revalidatePath("/admin/merchants", "page");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reactivateMerchantAction(storeId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

    await prisma.$transaction([
      prisma.merchantStore.update({
        where: { id: storeId },
        data: { isArchived: false, archivedAt: null }
      }),
      prisma.user.updateMany({
        where: { merchantStoreId: storeId },
        data: { isArchived: false, archivedAt: null }
      })
    ]);

    revalidatePath("/admin/merchants");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMerchantPhoneAction(userId: string, newPhone: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

    // Check if phone already in use
    const existing = await prisma.user.findFirst({
      where: { phone: newPhone, id: { not: userId } }
    });
    if (existing) throw new Error("This phone number is already used by another account.");

    await prisma.user.update({
      where: { id: userId },
      data: { phone: newPhone }
    });

    revalidatePath("/admin/merchants");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

