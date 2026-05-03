"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export async function generateTwoFactorSecretAction() {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  if (!user) throw new Error("User not found");

  const secret = speakeasy.generateSecret({
    name: `BusinessConnect:${user.email || user.id}`
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "", {
    margin: 1,
    width: 800,
    color: {
      dark: "#0F172A",
      light: "#FFFFFF"
    }
  });

  // Store base32 secret temporarily
  await prisma.user.update({
    where: { id: session.userId },
    data: { twoFactorSecret: secret.base32 }
  });

  return { secret: secret.base32, qrCodeUrl };
}

export async function verifyAndEnableTwoFactorAction(token: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  if (!user || !user.twoFactorSecret) throw new Error("2FA not initialized");

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token
  });

  if (!verified) return { error: "Invalid verification code" };

  await prisma.user.update({
    where: { id: session.userId },
    data: { isTwoFactorEnabled: true }
  });

  return { success: "Two-factor authentication enabled successfully" };
}

export async function disableTwoFactorAction() {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      isTwoFactorEnabled: false,
      twoFactorSecret: null
    }
  });

  return { success: "Two-factor authentication disabled" };
}
