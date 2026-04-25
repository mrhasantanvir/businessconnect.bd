"use server";

import { db as prisma } from "@/lib/db";
import { encrypt } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Mock OTP storage (In production, use Redis or a DB table)
const otpStore = new Map<string, { otp: string; expires: number }>();

export async function sendOtpAction(phone: string) {
  if (!phone) return { error: "Phone number is required" };

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with 5-minute expiry
  otpStore.set(phone, {
    otp,
    expires: Date.now() + 5 * 60 * 1000
  });

  console.log(`[SMS GATEWAY] Sending OTP ${otp} to ${phone}`);
  
  // Here you would integrate with a real SMS API like Twilio, Infobip, or a local BD gateway
  return { success: true, message: "OTP sent to your phone" };
}

export async function verifyOtpAction(phone: string, otp: string) {
  const record = otpStore.get(phone);
  
  if (!record) return { error: "No OTP found for this number" };
  if (record.expires < Date.now()) return { error: "OTP expired" };
  if (record.otp !== otp) return { error: "Invalid OTP" };

  // Mark as verified (in session or a temporary store)
  return { success: true };
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const storeName = formData.get("storeName") as string;
  const phone = formData.get("phone") as string;
  const isPhoneVerified = formData.get("isPhoneVerified") === "true";

  if (!name || !email || !password || !storeName || !phone) {
    return { error: "All fields are required" };
  }

  if (!isPhoneVerified) {
    return { error: "Please verify your phone number first" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "A user with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const store = await tx.merchantStore.create({
        data: {
          name: storeName,
          slug: storeName.toLowerCase().replace(/\s+/g, "-") + "-" + Math.random().toString(36).substring(2, 7),
          isOnboarded: false,
          address: "", // Initial empty
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "MERCHANT",
          merchantStoreId: store.id,
          isOnboarded: false,
        },
      });

      return { user, store };
    });

    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const session = await encrypt({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      merchantStoreId: result.store.id,
      expires,
    });

    (await cookies()).set("session", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/merchant/onboarding");
}
