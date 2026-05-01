"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail";

export async function createStaffAction(data: {
  name: string;
  email: string;
  role: string;
  wageType: string;
  baseSalary: number;
}) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  const merchantStoreId = session.merchantStoreId;
  if (!merchantStoreId) throw new Error("Merchant store not found for this account");

  const merchantStore = await prisma.merchantStore.findUnique({
    where: { id: merchantStoreId }
  });

  if (!merchantStore) throw new Error("Merchant store not found");

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) throw new Error("Email already registered");

  const tempPassword = crypto.randomBytes(8).toString("hex");
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Create User
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "STAFF",
      merchantStoreId: merchantStoreId,
      isActive: true, // User can login but status is ONBOARDING
      staffProfile: {
        create: {
          merchantStoreId: merchantStoreId,
          jobRole: data.role,
          wageType: data.wageType,
          baseSalary: data.baseSalary,
          status: "ONBOARDING",
          onboardingStep: 1
        }
      }
    }
  });

  // Send Invitation Email
  await sendEmail({
    to: data.email,
    subject: `Invitation to join ${merchantStore.name} on BusinessConnect.bd`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; rounded: 12px;">
        <h2 style="color: #1E40AF;">Welcome to the Team!</h2>
        <p>Hi <strong>${data.name}</strong>,</p>
        <p>You have been invited to join <strong>${merchantStore.name}</strong> as a <strong>${data.role}</strong>.</p>
        <div style="background: #F8F9FA; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0; color: #64748B; font-size: 12px; text-transform: uppercase; font-weight: bold;">Your Credentials</p>
          <p style="margin: 10px 0 5px 0;"><strong>Email:</strong> ${data.email}</p>
          <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #eee; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
        </div>
        <p>Please login and complete your onboarding profile to get started.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display: inline-block; background: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Login & Onboard Now</a>
        <p style="margin-top: 30px; font-size: 12px; color: #94A3B8;">This is an automated invitation from BusinessConnect.bd</p>
      </div>
    `
  });

  revalidatePath("/merchant/staff");
  return { success: true };
}

export async function getStaffListAction() {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  const merchantStoreId = session.merchantStoreId;
  if (!merchantStoreId) throw new Error("Merchant store not found");

  const staff = await prisma.user.findMany({
    where: { 
      role: "STAFF",
      merchantStoreId: merchantStoreId
    },
    include: {
      staffProfile: true
    },
    orderBy: { createdAt: "desc" }
  });

  return staff;
}

export async function activateStaffAction(staffId: string) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  const staff = await prisma.staffProfile.findUnique({
    where: { id: staffId },
    include: { user: true }
  });

  if (!staff) throw new Error("Staff not found");

  await prisma.staffProfile.update({
    where: { id: staffId },
    data: { 
      status: "ACTIVE",
      approvedAt: new Date(),
      approvedBy: session.userId
    }
  });

  revalidatePath("/merchant/staff");
  return { success: true };
}

export async function requestReuploadAction(staffId: string, reason: string) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  await prisma.staffProfile.update({
    where: { id: staffId },
    data: { 
      status: "ONBOARDING",
      rejectionReason: reason
    }
  });

  revalidatePath("/merchant/staff");
  return { success: true };
}
