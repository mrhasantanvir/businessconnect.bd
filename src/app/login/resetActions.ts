"use server";

import { db as prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail";
import { getPasswordResetEmailTemplate } from "@/lib/templates/passwordReset";

export async function requestPasswordResetAction(email: string) {
  if (!email) return { error: "Email is required" };

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // For security, don't reveal if user exists or not
      return { success: "If an account exists with this email, a reset link has been sent." };
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: expires
      }
    });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://businessconnect.bd'}/reset-password?token=${token}`;

    const emailSent = await sendEmail({
      to: email,
      subject: "Password Reset Request - BusinessConnect.bd",
      html: getPasswordResetEmailTemplate({
        userName: user.name || "Valued User",
        resetLink
      })
    });

    if (!emailSent) {
      return { error: "Failed to send reset email. Please try again later." };
    }

    return { success: "Reset link sent to your email." };

  } catch (error) {
    console.error("Reset request error:", error);
    return { error: "Something went wrong." };
  }
}

export async function resetPasswordAction(token: string, newPassword: string) {
  if (!token || !newPassword) return { error: "Missing required fields" };

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gte: new Date() }
      }
    });

    if (!user) {
      return { error: "Invalid or expired reset token." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    return { success: "Password reset successfully. You can now login." };

  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Something went wrong." };
  }
}
