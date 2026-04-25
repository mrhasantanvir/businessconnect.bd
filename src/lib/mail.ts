import nodemailer from "nodemailer";
import { prisma } from "./db";

export async function sendEmail({ to, subject, html, attachments }: {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}) {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "GLOBAL" }
  });

  if (!settings?.smtpHost) {
    console.error("SMTP not configured in system settings.");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort || 587,
    secure: settings.smtpPort === 465,
    auth: {
      user: settings.smtpUser || "",
      pass: settings.smtpPass || ""
    }
  });

  try {
    const info = await transporter.sendMail({
      from: settings.smtpFrom || "noreply@businessconnect.bd",
      to,
      subject,
      html,
      attachments
    });
    console.log("Email sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("Email sending failed:", err);
    return false;
  }
}
