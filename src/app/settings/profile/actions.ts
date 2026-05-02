"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { TOTP } from "otplib";
const totp = new TOTP();
import QRCode from "qrcode";
import { logAdminAction } from "@/lib/audit";

export async function updateProfileAction(data: {
  name?: string;
  email?: string;
  phone?: string;
  image?: string;
  coverImage?: string;
  coverPosition?: number;
  currentPassword?: string;
  newPassword?: string;
}) {
  const session = await getSession();
  if (!session || !session.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id }
  });

  if (!user) throw new Error("User not found");

  const updateData: any = {};

  if (data.name) updateData.name = data.name;
  if (data.email && data.email !== user.email) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error("Email already in use");
    updateData.email = data.email;
  }
  if (data.phone) updateData.phone = data.phone;
  if (data.image) updateData.image = data.image;
  if (data.coverImage) updateData.coverImage = data.coverImage;
  if (data.coverPosition !== undefined) updateData.coverPosition = data.coverPosition;

  // Password change logic
  if (data.newPassword) {
    if (!data.currentPassword) throw new Error("Current password required to set new password");
    
    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) throw new Error("Incorrect current password");

    updateData.password = await bcrypt.hash(data.newPassword, 10);
  }

  await prisma.user.update({
    where: { id: session.id },
    data: updateData
  });

  await logAdminAction({
    adminId: session.id,
    action: "UPDATE_PROFILE",
    entity: "USER",
    entityId: session.id,
    metadata: {
      fieldsUpdated: Object.keys(updateData).filter(k => k !== 'password')
    }
  });

  revalidatePath("/");
  return { success: true };
}

export async function generate2FASecretAction() {
  const session = await getSession();
  if (!session || !session.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) throw new Error("User not found");

  const secret = totp.generateSecret();
  const otpauth = totp.generateURI({
    issuer: "BusinessConnect.bd",
    label: user.email || user.id,
    secret
  });
  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  // We don't save the secret yet, only when they verify it
  return { secret, qrCodeUrl };
}

export async function verifyAndEnable2FAAction(secret: string, token: string) {
  const session = await getSession();
  if (!session || !session.id) throw new Error("Unauthorized");

  const isValid = totp.verify({ token, secret });
  if (!isValid) throw new Error("Invalid verification code");

  await prisma.user.update({
    where: { id: session.id },
    data: {
      twoFactorSecret: secret,
      isTwoFactorEnabled: true
    }
  });

  revalidatePath("/settings/profile");
  return { success: true };
}

export async function disable2FAAction() {
  const session = await getSession();
  if (!session || !session.id) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.id },
    data: {
      twoFactorSecret: null,
      isTwoFactorEnabled: false
    }
  });

  revalidatePath("/settings/profile");
  return { success: true };
}
