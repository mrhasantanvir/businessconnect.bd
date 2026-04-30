import { db as prisma } from "@/lib/db";
import nodemailer from "nodemailer";

export async function notifyAdminMerchantAction(storeName: string, merchantName: string, actionType: "ONBOARDING" | "REUPLOAD", customMessage?: string) {
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
    if (!settings?.smtpHost || !settings?.smtpUser || !settings?.smtpPass) {
      console.log("SMTP not configured, skipping admin notification.");
      return;
    }

    const admin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
      select: { email: true }
    });

    if (!admin?.email) {
      console.log("No admin email found for notification.");
      return;
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    const isReupload = actionType === "REUPLOAD";
    const subject = isReupload ? `Document Re-uploaded: ${storeName}` : `New Merchant Onboarding: ${storeName}`;
    const body = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #1e40af;">${isReupload ? "Merchant Document Update" : "New Merchant Registration"}</h2>
        <p>${isReupload ? "A merchant has re-uploaded documents for your review." : "A new merchant has completed their onboarding and is waiting for approval."}</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p><strong>Store Name:</strong> ${storeName}</p>
        <p><strong>Merchant Name:</strong> ${merchantName}</p>
        <p><strong>Status:</strong> ${isReupload ? "DOCUMENTS UPDATED" : "PENDING APPROVAL"}</p>
        ${customMessage ? `<p><strong>Message:</strong> ${customMessage}</p>` : ""}
        <br />
        <a href="https://businessconnect.bd/admin/merchants" style="background: #1e40af; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">Review Documents</a>
      </div>
    `;

    await transporter.sendMail({
      from: `"${settings.siteTitle}" <${settings.smtpFrom || settings.smtpUser}>`,
      to: admin.email,
      subject: subject,
      html: body,
    });

    console.log(`Admin notification sent to ${admin.email}`);
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
}
