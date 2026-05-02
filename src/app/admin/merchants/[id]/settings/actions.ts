"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { getSession } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";

export async function updateMerchantUserAction(userId: string, data: {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) {
      // Check if email taken by another user
      const existing = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id: userId } }
      });
      if (existing) throw new Error("Email already in use");
      updateData.email = data.email;
    }
    if (data.phone) updateData.phone = data.phone;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    await logAdminAction({
      adminId: session.id,
      action: "UPDATE_MERCHANT_USER",
      entity: "USER",
      entityId: userId,
      targetUserId: userId,
      metadata: {
        fieldsUpdated: Object.keys(updateData).filter(k => k !== 'password')
      }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMerchantCredentialsAction(merchantId: string, data: any) {
  try {
    const { sipUsername, sipPassword, sipDomain, sipPort, smsRate, sipRate } = data;

    await prisma.$transaction([
      // Update basic rates
      prisma.merchantStore.update({
        where: { id: merchantId },
        data: { smsRate, sipRate }
      }),
      // Upsert SIP Config
      prisma.sipConfig.upsert({
        where: { merchantStoreId: merchantId },
        create: {
          merchantStoreId: merchantId,
          username: sipUsername,
          password: sipPassword,
          domain: sipDomain,
          port: parseInt(sipPort) || 5060,
        },
        update: {
          username: sipUsername,
          password: sipPassword,
          domain: sipDomain,
          port: parseInt(sipPort) || 5060,
        }
      })
    ]);

    const session = await getSession();
    if (session) {
      await logAdminAction({
        adminId: session.id,
        action: "UPDATE_MERCHANT_CONFIG",
        entity: "MERCHANT_STORE",
        entityId: merchantId,
        merchantStoreId: merchantId,
        metadata: {
          smsRate: data.smsRate,
          sipRate: data.sipRate
        }
      });
    }

    revalidatePath(`/admin/merchants/${merchantId}/settings`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addMerchantCreditsAction(merchantId: string, type: "SMS" | "SIP", amount: number) {
  try {
    const field = type === "SMS" ? "smsBalance" : "sipBalance";
    
    await prisma.merchantStore.update({
      where: { id: merchantId },
      data: {
        [field]: { increment: amount }
      }
    });

    revalidatePath(`/admin/merchants/${merchantId}/settings`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
