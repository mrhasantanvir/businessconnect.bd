"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail";
import { logAdminAction } from "@/lib/audit";

export async function createStaffAction(data: {
  name: string;
  email: string;
  roleId?: string;
  jobRole: string;
  wageType: string;
  baseSalary: number;
  requiredDocs?: string[];
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
          onboardingStep: 1,
          requiredDocs: data.requiredDocs ? JSON.stringify(data.requiredDocs) : null
        }
      }
    },
    include: {
      staffProfile: {
        include: {
          documents: true
        }
      },
      customRole: true
    }
  });

  // Send Invitation Email (Don't await to speed up response)
  sendEmail({
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
        <a href="https://businessconnect.bd/login" style="display: inline-block; background: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Login & Onboard Now</a>
        <p style="margin-top: 30px; font-size: 12px; color: #94A3B8;">This is an automated invitation from BusinessConnect.bd</p>
      </div>
    `
  }).catch(err => console.error("Failed to send invitation email:", err));

  revalidatePath("/merchant/staff");
  return { success: true, staff: user };
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
      staffProfile: {
        include: {
          documents: true
        }
      },
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

  // Notify Staff
  if (staff.user?.email) {
    try {
      await sendEmail({
        to: staff.user.email,
        subject: "Onboarding Approved - Welcome to the Team!",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
            <h2 style="color: #1E40AF; margin-top: 0;">Congratulations!</h2>
            <p>Hello <strong>${staff.user.name}</strong>,</p>
            <p>Your onboarding documents have been reviewed and approved. Your account is now fully <strong>ACTIVE</strong>.</p>
            <p>You can now access all features of the staff dashboard and start your work.</p>
            <a href="https://businessconnect.bd/dashboard" style="display: inline-block; background: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Go to Dashboard</a>
            <p style="color: #94A3B8; font-size: 12px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
              BusinessConnect.bd Administrative Team
            </p>
          </div>
        `
      });
    } catch (err) {
      console.error("Failed to notify staff of activation:", err);
    }
  }

  revalidatePath("/merchant/staff");
  return { success: true };
}

export async function requestReuploadAction(staffId: string, reason: string, missingDocs: string[]) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  const profile = await prisma.staffProfile.update({
    where: { id: staffId },
    data: { 
      status: "ONBOARDING",
      rejectionReason: reason,
      missingDocuments: JSON.stringify(missingDocs)
    },
    include: { user: true, merchantStore: true }
  });

  // Send Email Notification
  if (profile.user?.email) {
    try {
      await sendEmail({
        to: profile.user.email,
        subject: `Re-upload Documents Required - ${profile.merchantStore?.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
            <h2 style="color: #1E40AF; margin-top: 0;">Documents Re-upload Required</h2>
            <p>Hello <strong>${profile.user.name}</strong>,</p>
            <p>Your documents for <strong>${profile.merchantStore?.name}</strong> need to be re-uploaded for the following reason:</p>
            <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px; margin: 16px 0;">
              <p style="margin: 0; color: #991B1B; font-weight: 500;">${reason}</p>
            </div>
            <p><strong>Please re-upload the following:</strong></p>
            <ul style="color: #475569;">
              ${missingDocs.map(d => `<li>${d}</li>`).join('')}
            </ul>
            <p>Please login to your dashboard to complete the onboarding:</p>
            <a href="https://businessconnect.bd/login" style="display: inline-block; background: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Login & Re-upload</a>
            <p style="color: #94A3B8; font-size: 12px; margin-top: 24px; border-top: 1px solid #f1f5f9; pt: 16px;">
              BusinessConnect Staff Onboarding System
            </p>
          </div>
        `
      });
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  }

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
        <a href="https://businessconnect.bd/login" style="display: inline-block; background: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Login Now</a>
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
  nameEn?: string;
  nameBn?: string;
  nidNumber?: string;
  dob?: string | Date;
  fatherName?: string;
  motherName?: string;
  permanentAddress?: string;
  currentAddress?: string;
  image?: string;
  coverImage?: string;
  coverPosition?: number;
}) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      image: data.image,
      coverImage: data.coverImage,
      coverPosition: data.coverPosition,
      customRoleId: data.roleId || null,
      staffProfile: {
        update: {
          jobRole: data.jobRole,
          baseSalary: data.baseSalary,
          wageType: data.wageType,
          nameEn: data.nameEn,
          nameBn: data.nameBn,
          nidNumber: data.nidNumber,
          dob: data.dob ? new Date(data.dob) : undefined,
          fatherName: data.fatherName,
          motherName: data.motherName,
          permanentAddress: data.permanentAddress,
          currentAddress: data.currentAddress
        }
      }
    }
  });

  await logAdminAction({
    adminId: session.userId || session.id,
    action: "UPDATE_STAFF_INFO",
    entity: "USER",
    entityId: userId,
    merchantStoreId: session.merchantStoreId,
    targetUserId: userId,
    metadata: {
      updatedBy: session.role
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
  
  // Notify Staff
  const staff = await prisma.user.findUnique({
    where: { id: userId },
    include: { merchantStore: true }
  });

  if (staff?.email) {
    try {
      await sendEmail({
        to: staff.email,
        subject: `Account Notice: ${staff.merchantStore?.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
            <h2 style="color: #EF4444; margin-top: 0;">Account Status Update</h2>
            <p>Hello <strong>${staff.name}</strong>,</p>
            <p>This is to inform you that your staff account at <strong>${staff.merchantStore?.name}</strong> has been <strong>TERMINATED</strong> by the administrator.</p>
            <p>You will no longer be able to access the staff dashboard. If you believe this is an error, please contact your merchant administrator.</p>
            <p style="color: #94A3B8; font-size: 12px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
              BusinessConnect.bd Administrative Notification
            </p>
          </div>
        `
      });
    } catch (err) {
      console.error("Failed to notify staff of termination:", err);
    }
  }

  revalidatePath("/merchant/staff");
  return { success: true };
}

export async function rejoinStaffAction(userId: string, data: {
  jobRole: string;
  roleId: string;
  baseSalary: number;
  wageType: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId, merchantStoreId: session.merchantStoreId },
    data: { 
      isActive: true,
      customRoleId: data.roleId || null,
      staffProfile: {
        update: { 
          status: "ACTIVE",
          jobRole: data.jobRole,
          baseSalary: data.baseSalary,
          wageType: data.wageType,
          approvedAt: new Date(), // Reset approval date to rejoin date
          approvedBy: session.userId
        }
      }
    }
  });

  // Notify Staff
  const staff = await prisma.user.findUnique({
    where: { id: userId },
    include: { merchantStore: true }
  });

  if (staff?.email) {
    try {
      await sendEmail({
        to: staff.email,
        subject: "Welcome Back! Your Account has been Reactivated",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
            <h2 style="color: #059669; margin-top: 0;">Welcome Back!</h2>
            <p>Hello <strong>${staff.name}</strong>,</p>
            <p>We are excited to have you back at <strong>${staff.merchantStore?.name}</strong>. Your account has been <strong>REACTIVATED</strong> with the following terms:</p>
            <div style="background: #F0FDF4; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 13px; color: #166534;"><strong>New Designation:</strong> ${data.jobRole}</p>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #166534;"><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>You can now login and resume your duties.</p>
            <a href="https://businessconnect.bd/dashboard" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Login to Dashboard</a>
            <p style="color: #94A3B8; font-size: 12px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
              BusinessConnect.bd Administrative Team
            </p>
          </div>
        `
      });
    } catch (err) {
      console.error("Failed to notify staff of rejoin:", err);
    }
  }
  
  revalidatePath("/merchant/staff");
  return { success: true };
}

export async function deleteStaffInvitationAction(userId: string) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  // Only allow deleting if not ACTIVE
  const staff = await prisma.staffProfile.findUnique({
    where: { userId }
  });

  if (!staff) throw new Error("Staff not found");
  if (staff.status === "ACTIVE") throw new Error("Cannot delete an active staff member. Use termination instead.");

  await prisma.user.delete({
    where: { id: userId, merchantStoreId: session.merchantStoreId }
  });

  revalidatePath("/merchant/staff");
  return { success: true };
}
export async function getStaffDevicesAction(userId: string) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  const devices = await prisma.staffDevice.findMany({
    where: { userId },
    include: { license: true },
    orderBy: { createdAt: "desc" }
  });

  return devices;
}

export async function authorizeDeviceAction(staffDeviceId: string) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  const device = await prisma.staffDevice.findUnique({
    where: { id: staffDeviceId },
    include: { user: { include: { staffProfile: true } } }
  });

  if (!device) throw new Error("Device not found");
  if (device.isAuthorized) return { success: true };

  // Fetch global pricing settings
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "GLOBAL" }
  });

  // Check how many devices are already authorized for this user
  const authorizedCount = await prisma.staffDevice.count({
    where: { userId: device.userId, isAuthorized: true }
  });

  // Use global settings or defaults
  const basePrice = settings?.staffSubscriptionPrice ?? 300;
  const additionalPrice = settings?.additionalDevicePrice ?? 250;
  
  const price = authorizedCount === 0 ? basePrice : additionalPrice;

  await prisma.$transaction([
    prisma.staffDevice.update({
      where: { id: staffDeviceId },
      data: { 
        isAuthorized: true, 
        authorizedAt: new Date() 
      }
    }),
    prisma.deviceLicense.create({
      data: {
        staffDeviceId: staffDeviceId,
        merchantStoreId: session.merchantStoreId!,
        price: price,
        activatedAt: new Date()
      }
    })
  ]);

  revalidatePath("/merchant/staff");
  return { success: true, price };
}

/**
 * Extracts personal information from a staff NID image using AI (OpenAI GPT-4o Vision).
 * Returns name, nidNumber, dob, fatherName, motherName, permanentAddress.
 */
export async function extractNIDDataAction(imageUrl: string, backImageUrl?: string) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  try {
    const { extractNIDInfo } = await import("@/lib/vision");
    
    // Extract from Front
    const result = await extractNIDInfo(imageUrl);
    if ("error" in result && result.error) {
      return { success: false, error: result.error };
    }

    let finalData = {
      nameEn: result.nameEn || result.name || "",
      nameBn: result.nameBn || "",
      name: result.nameEn || result.name || "",
      nidNumber: result.nidNumber || "",
      dob: result.dob || "",
      fatherName: result.fatherName || "",
      motherName: result.motherName || "",
      permanentAddress: result.permanentAddress || "",
    };

    // If back image is provided, extract and prioritize address from it
    if (backImageUrl) {
      const backResult = await extractNIDInfo(backImageUrl);
      if (!("error" in backResult)) {
        if (backResult.permanentAddress) {
          finalData.permanentAddress = backResult.permanentAddress;
        }
        // Sometimes NID number is also on the back
        if (!finalData.nidNumber && backResult.nidNumber) {
          finalData.nidNumber = backResult.nidNumber;
        }
      }
    }

    return {
      success: true,
      data: finalData
    };
  } catch (error: any) {
    console.error("NID Extraction Error:", error);
    return { success: false, error: error.message || "Failed to extract NID data" };
  }
}

export async function getStaffActivityStatsAction(userId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const workLogs = await prisma.staffWorkLog.findMany({
    where: {
      userId,
      startTime: { gte: startOfMonth }
    }
  });

  const attendance = workLogs.length;
  const totalMinutes = workLogs.reduce((acc, log) => acc + log.totalMinutes, 0);
  const avgActivityScore = workLogs.length > 0 
    ? workLogs.reduce((acc, log) => acc + log.activityScore, 0) / workLogs.length 
    : 0;

  // Tasks completed (Orders processed by this user)
  const tasksCompleted = await prisma.orderActivity.count({
    where: {
      userId,
      type: "STATUS_CHANGE",
      message: { contains: "DELIVERED" },
      createdAt: { gte: startOfMonth }
    }
  });

  return {
    attendance,
    totalMinutes,
    avgActivityScore,
    tasksCompleted,
    month: format(startOfMonth, 'MMMM yyyy')
  };
}

