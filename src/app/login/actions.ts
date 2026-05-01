"use server";

import { db as prisma } from "@/lib/db";
import { encrypt } from "@/lib/auth";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticator } from "otplib";

async function createSession(user: any) {
  // Generate a unique session ID for single device login
  const sessionId = crypto.randomUUID();
  
  // Update user's current session in DB
  await prisma.user.update({
    where: { id: user.id },
    data: { currentSessionId: sessionId }
  });

  // Create the session
  const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
  const sessionData = {
    id: user.id,
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    customRoleId: user.customRoleId,
    permissions: user.customRole?.permissions || [],
    merchantStoreId: user.merchantStoreId,
    sessionId,
    expires,
  };

  const session = await encrypt(sessionData);

  // Save session in a cookie
  (await cookies()).set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return user.role === "SUPER_ADMIN" ? "/admin" : "/dashboard";
}

export async function loginAction(formData: FormData) {
  const identifier = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!identifier || !password) {
    return { error: "Credentials are required" };
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }]
      },
      include: { customRole: true }
    });

    if (!user) return { error: "Invalid credentials" };

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return { error: "Invalid credentials" };

    if (!user.isActive) {
      return { error: "Your account is deactivated. Please contact your administrator." };
    }

    // Check 2FA
    if (user.isTwoFactorEnabled) {
      return { requires2FA: true, userId: user.id };
    }

    const redirectPath = await createSession(user);
    redirect(redirectPath);

  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    console.error("Login error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function complete2FALoginAction(userId: string, token: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customRole: true }
    });

    if (!user || !user.twoFactorSecret) return { error: "Invalid login attempt" };

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret
    });

    if (!isValid) return { error: "Invalid verification code" };

    const redirectPath = await createSession(user);
    redirect(redirectPath);

  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    console.error("2FA Login error:", error);
    return { error: "Something went wrong." };
  }
}

export async function logoutAction() {
  (await cookies()).delete("session");
  redirect("/login");
}
