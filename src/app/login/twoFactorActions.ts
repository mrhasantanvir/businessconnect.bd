"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { authenticator } from "otplib";
import QRCode from "qrcode";

export async function generateTwoFactorSecretAction() {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  if (!user) throw new Error("User not found");

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(
    user.email || user.id,
    "BusinessConnect.bd",
    secret
  );

  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  // Store secret temporarily in user record (but not enabled yet)
  await prisma.user.update({
    where: { id: session.userId },
    data: { twoFactorSecret: secret }
  });

  return { secret, qrCodeUrl };
}

export async function verifyAndEnableTwoFactorAction(token: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  if (!user || !user.twoFactorSecret) throw new Error("2FA not initialized");

  const isValid = authenticator.verify({
    token,
    secret: user.twoFactorSecret
  });

  if (!isValid) return { error: "Invalid verification code" };

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

export async function verifyTwoFactorLoginAction(userId: string, token: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.twoFactorSecret) return { error: "Invalid request" };

  const isValid = authenticator.verify({
    token,
    secret: user.twoFactorSecret
  });

  if (!isValid) return { error: "Invalid 2FA code" };

  return { success: true };
}
