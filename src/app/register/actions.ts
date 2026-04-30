"use server";

import { db as prisma } from "@/lib/db";
import { encrypt } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CommunicationService } from "@/services/CommunicationService";

// In-memory storage replaced by DB for production stability (PM2/Multi-process)

export async function sendOtpAction(phone: string) {
  if (!phone) return { error: "Phone number is required" };

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP in DB with 5-minute expiry
  await prisma.otp.deleteMany({ where: { phone } }); // Clear old ones
  await prisma.otp.create({
    data: {
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    }
  });

  console.log(`[SYSTEM] Attempting to send OTP ${otp} to ${phone}`);
  
  const smsResult = await CommunicationService.sendSms("SYSTEM", phone, `Your BusinessConnect verification code is: ${otp}`);
  
  if (!smsResult.success) {
    return { error: smsResult.error || "Failed to send OTP. Please try again later." };
  }

  return { success: true, message: "OTP sent to your phone" };
}

export async function verifyOtpAction(phone: string, otp: string) {
  const record = await prisma.otp.findFirst({
    where: { phone, otp },
    orderBy: { createdAt: 'desc' }
  });
  
  if (!record) return { error: "Invalid OTP code" };
  if (record.expiresAt < new Date()) return { error: "OTP has expired" };

  // OTP is valid, we can delete it now
  await prisma.otp.delete({ where: { id: record.id } });

  return { success: true };
}

export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string || "Merchant User";
  const email = formData.get("email") as string || null;
  const password = formData.get("password") as string;
  const storeName = formData.get("storeName") as string || "My Store";
  const phone = formData.get("phone") as string;
  const isPhoneVerified = formData.get("isPhoneVerified") === "true";

  if (!password || !phone) {
    return { error: "Phone and password are required" };
  }

  if (!isPhoneVerified) {
    return { error: "Please verify your phone number first" };
  }

  try {
    // Check if phone already exists
    const existingUserByPhone = await prisma.user.findFirst({
      where: { phone },
    });

    if (existingUserByPhone) {
      return { error: "A user with this phone number already exists" };
    }

    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUserByEmail) {
        return { error: "A user with this email already exists" };
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const store = await tx.merchantStore.create({
        data: {
          name: storeName,
          slug: (storeName.toLowerCase().replace(/\s+/g, "-") || "store") + "-" + Math.random().toString(36).substring(2, 7),
          isOnboarded: false,
          address: "", 
          activationStatus: "PENDING",
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
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
      phone: result.user.phone,
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

  redirect("/dashboard");
}
