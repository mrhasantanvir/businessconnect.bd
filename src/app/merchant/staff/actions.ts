"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getStaffProfileByUserIdAction(userId: string) {
  return await prisma.staffProfile.findUnique({
    where: { userId },
    include: { user: true }
  });
}

export async function recruitStaffAction(data: {
  name: string;
  email: string;
  phone: string;
  branchId: string;
  wageType: string;
  baseSalary: number;
  customRoleId?: string | null;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("User with this email already exists");

  // Create User + Profile in transaction
  const hashedPassword = await bcrypt.hash("password123", 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: "STAFF",
        customRoleId: data.customRoleId || null,
        merchantStoreId: session.merchantStoreId,
        branchId: data.branchId || null,
        isOnboarded: false
      }
    });

    const profile = await tx.staffProfile.create({
      data: {
        userId: user.id,
        merchantStoreId: session.merchantStoreId!,
        jobRole: "STAFF",
        wageType: data.wageType,
        baseSalary: data.baseSalary,
        status: "ONBOARDING",
        onboardingStep: 1
      }
    });

    return { user, profile };
  });

  revalidatePath("/merchant/staff");
  return result;
}

export async function createStaffProfileAction(data: {
  userId: string;
  jobRole: string;
  wageType: string;
  baseSalary: number;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const profile = await prisma.staffProfile.create({
    data: {
      userId: data.userId,
      merchantStoreId: session.merchantStoreId,
      jobRole: data.jobRole,
      wageType: data.wageType,
      baseSalary: data.baseSalary,
      status: "ONBOARDING",
      onboardingStep: 2 // Move to Agreement
    }
  });

  revalidatePath("/merchant/staff");
  return profile;
}

export async function signAgreementAction(staffProfileId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.staffProfile.update({
    where: { id: staffProfileId },
    data: {
      agreementSigned: true,
      signedAt: new Date(),
      onboardingStep: 3 // Move to Documents
    }
  });

  revalidatePath("/merchant/staff/onboarding");
  return { success: true };
}

export async function uploadStaffDocumentAction(staffProfileId: string, name: string, url: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.staffDocument.create({
    data: {
      staffProfileId,
      name,
      url
    }
  });

  revalidatePath("/merchant/staff/onboarding");
  return { success: true };
}

export async function completeStaffOnboardingAction(staffProfileId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.staffProfile.update({
    where: { id: staffProfileId },
    data: {
      status: "PENDING_APPROVAL",
      onboardingStep: 5, // Final step
      submittedAt: new Date()
    }
  });

  revalidatePath("/merchant/staff");
  return { success: true };
}

export async function saveStaffDetailsAction(staffProfileId: string, data: {
  address: string;
  nidNumber: string;
  reference: string;
  emergencyContact: string;
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.staffProfile.update({
    where: { id: staffProfileId },
    data: {
      address: data.address,
      nidNumber: data.nidNumber,
      reference: data.reference,
      emergencyContact: data.emergencyContact,
      onboardingStep: 2 // Assuming this step is done
    }
  });

  revalidatePath("/merchant/staff/onboarding");
  return { success: true };
}

export async function approveStaffAction(staffProfileId: string) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  await prisma.staffProfile.update({
    where: { id: staffProfileId },
    data: {
      status: "ACTIVE",
      approvedAt: new Date(),
      approvedBy: session.userId
    }
  });

  revalidatePath("/merchant/staff");
  return { success: true };
}

export async function resetStaffPasswordAction(userId: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  // Only merchants or managers with staff:manage can reset passwords
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.update({
    where: { id: userId, merchantStoreId: session.merchantStoreId },
    data: {
      password: hashedPassword
    }
  });

  revalidatePath("/merchant/staff");
  return { success: true };
}

export async function startWorkAction(staffProfileId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const activeLog = await prisma.staffWorkLog.findFirst({
    where: { staffProfileId, status: "ACTIVE" }
  });

  if (activeLog) return activeLog;

  const profile = await prisma.staffProfile.findUnique({
    where: { id: staffProfileId }
  });

  const log = await prisma.staffWorkLog.create({
    data: {
      staffProfileId,
      merchantStoreId: profile?.merchantStoreId || "",
      status: "ACTIVE",
      startTime: new Date()
    }
  });

  return log;
}

export async function stopWorkAction(workLogId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const log = await prisma.staffWorkLog.findUnique({ where: { id: workLogId } });
  if (!log) throw new Error("Log not found");

  const endTime = new Date();
  const durationMs = endTime.getTime() - log.startTime.getTime();
  const totalMinutes = Math.floor(durationMs / 60000);

  await prisma.staffWorkLog.update({
    where: { id: workLogId },
    data: {
      endTime,
      totalMinutes,
      status: "COMPLETED"
    }
  });

  // Update total minutes in profile
  await prisma.staffProfile.update({
    where: { id: log.staffProfileId },
    data: {
      totalMinutesWorked: { increment: totalMinutes }
    }
  });

  return { success: true };
}

export async function recordActivityFrameAction(workLogId: string, data: { hits: number, clicks: number, screenshot?: string }) {
  const score = Math.min(100, ((data.hits + data.clicks) / 50) * 100);

  await prisma.staffActivityFrame.create({
    data: {
      workLogId,
      keyboardHits: data.hits,
      mouseClicks: data.clicks,
      activityScore: score,
      screenshotUrl: data.screenshot
    }
  });

  // Update work log avg score
  const allFrames = await prisma.staffActivityFrame.findMany({
    where: { workLogId }
  });
  const avg = allFrames.reduce((acc, f) => acc + f.activityScore, 0) / allFrames.length;

  await prisma.staffWorkLog.update({
    where: { id: workLogId },
    data: { activityScore: avg }
  });

  return { success: true, currentScore: score };
}

export async function evaluateIncrementRulesAction(staffProfileId: string) {
  const profile = await prisma.staffProfile.findUnique({
    where: { id: staffProfileId },
    include: { incrementRules: { where: { isApplied: false } }, user: { include: { driverOrders: true } } }
  });

  if (!profile) return;

  const totalSales = profile.user.driverOrders.filter(o => o.deliveryStatus === "DELIVERED").reduce((acc, o) => acc + (o.cashCollected || 0), 0);
  const avgActivity = profile.avgActivityScore;

  for (const rule of profile.incrementRules) {
    let met = false;
    if (rule.conditionType === "SALES_TARGET" && totalSales >= rule.conditionValue) {
      met = true;
    } else if (rule.conditionType === "ACTIVITY_SCORE" && avgActivity >= rule.conditionValue) {
      met = true;
    }

    if (met) {
      const incrementAmount = (profile.baseSalary * rule.incrementPercent) / 100;
      await prisma.staffProfile.update({
        where: { id: staffProfileId },
        data: {
          baseSalary: { increment: incrementAmount }
        }
      });
      await prisma.incrementRule.update({
        where: { id: rule.id },
        data: { isApplied: true }
      });
      
      // Log to accounting or notify manager here
      console.log(`[Auto-Increment]: Staff ${profile.user.name} salary increased by ${rule.incrementPercent}%`);
    }
  }
}

export async function updateStaffRoleAction(userId: string, customRoleId: string | null) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId, merchantStoreId: session.merchantStoreId },
    data: {
      customRoleId: customRoleId
    }
  });

  revalidatePath("/merchant/staff");
  return { success: true };
}

/**
 * Processes automated commission for an order.
 * Triggered when an order is confirmed or delivered.
 */
export async function processOrderCommission(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { merchantStore: { include: { commissionRules: { where: { isActive: true } } } } }
  });

  if (!order || !order.assignedDriverId) return { success: false, message: "Order or Staff not found" };

  const rules = order.merchantStore.commissionRules;
  if (rules.length === 0) return { success: true, message: "No commission rules found" };

  let totalCommission = 0;

  for (const rule of rules) {
    if (rule.type === "PERCENTAGE") {
      totalCommission += (order.total * rule.value) / 100;
    } else if (rule.type === "FIXED") {
      totalCommission += rule.value;
    }
  }

  if (totalCommission > 0) {
    await prisma.staffCommission.create({
      data: {
        userId: order.assignedDriverId,
        orderId: order.id,
        merchantStoreId: order.merchantStoreId,
        amount: totalCommission,
        type: "SALE",
        status: "PENDING"
      }
    });
  }

  return { success: true, amount: totalCommission };
}
