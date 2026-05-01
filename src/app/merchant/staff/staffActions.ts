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
  roleId?: string;
  jobRole: string;
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
      customRoleId: data.roleId,
      isActive: true, // User can login but status is ONBOARDING
      staffProfile: {
        create: {
          merchantStoreId: merchantStoreId,
          jobRole: data.jobRole,
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
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #1E40AF;">Welcome to the Team!</h2>
        <p>Hi <strong>${data.name}</strong>,</p>
        <p>You have been invited to join <strong>${merchantStore.name}</strong> as a <strong>${data.jobRole}</strong>.</p>
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
      staffProfile: true,
      customRole: true
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

// ROLE ACTIONS
export async function getRolesAction() {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");
  
  return await prisma.role.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: { _count: { select: { users: true } } }
  });
}

export async function createRoleAction(data: { name: string; permissions: string[] }) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");
  
  await prisma.role.create({
    data: {
      name: data.name,
      permissions: JSON.stringify(data.permissions),
      merchantStoreId: session.merchantStoreId!
    }
  });
  
  revalidatePath("/merchant/staff");
  return { success: true };
}

export async function updateRoleAction(id: string, data: { name: string; permissions: string[] }) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");
  
  await prisma.role.update({
    where: { id },
    data: {
      name: data.name,
      permissions: JSON.stringify(data.permissions)
    }
  });
  
  revalidatePath("/merchant/staff");
  return { success: true };
}

export async function deleteRoleAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");
  
  // Check if any users are assigned to this role
  const userCount = await prisma.user.count({ where: { customRoleId: id } });
  if (userCount > 0) throw new Error("Cannot delete role with assigned staff");

  await prisma.role.delete({ where: { id } });
  
  revalidatePath("/merchant/staff");
  return { success: true };
}

export async function resendInvitationAction(userId: string) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  const staff = await prisma.user.findUnique({
    where: { id: userId },
    include: { staffProfile: true, merchantStore: true }
  });

  if (!staff || !staff.merchantStore) throw new Error("Staff or Store not found");

  const tempPassword = crypto.randomBytes(8).toString("hex");
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  await sendEmail({
    to: staff.email!,
    subject: `Invitation Resent: Join ${staff.merchantStore.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #1E40AF;">Invitation Resent</h2>
        <p>Hi <strong>${staff.name}</strong>,</p>
        <p>Your invitation to join <strong>${staff.merchantStore.name}</strong> has been resent by the administrator.</p>
        <div style="background: #F8F9FA; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0; color: #64748B; font-size: 12px; text-transform: uppercase; font-weight: bold;">New Login Credentials</p>
          <p style="margin: 10px 0 5px 0;"><strong>Email:</strong> ${staff.email}</p>
          <p style="margin: 0;"><strong>New Temporary Password:</strong> <code style="background: #eee; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
        </div>
        <p>Please login and complete your profile.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display: inline-block; background: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Login Now</a>
      </div>
    `
  });

  return { success: true };
}

export async function updateStaffInfoAction(userId: string, data: {
  name: string;
  jobRole: string;
  roleId: string;
  baseSalary: number;
  wageType: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      customRoleId: data.roleId || null,
      staffProfile: {
        update: {
          jobRole: data.jobRole,
          baseSalary: data.baseSalary,
          wageType: data.wageType
        }
      }
    }
  });

  revalidatePath("/merchant/staff");
  return { success: true };
}

export async function terminateStaffAction(userId: string) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");
  
  await prisma.user.update({
    where: { id: userId, merchantStoreId: session.merchantStoreId },
    data: { 
      isActive: false,
      staffProfile: {
        update: { status: "TERMINATED" }
      }
    }
  });
  
  revalidatePath("/merchant/staff");
  return { success: true };
}
