"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { extractNIDInfo } from "@/lib/vision";

export async function processNIDAction(imageUrl: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const info = await extractNIDInfo(imageUrl);
  return info;
}

import { sendEmail } from "@/lib/mail";

export async function submitStaffOnboardingAction(data: {
  nidNumber: string;
  dob: string;
  permanentAddress: string;
  currentAddress: string;
  nidFrontUrl: string;
  nidBackUrl: string;
  cvUrl: string;
  photoUrl?: string;
  references: { name: string; contact: string }[];
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    bkash: string;
    nagad: string;
  };
  fatherName: string;
  motherName: string;
}) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const profile = await prisma.staffProfile.findUnique({
    where: { userId: session.userId },
    include: { user: true, merchantStore: true }
  });

  if (!profile) throw new Error("Profile not found");

  // Save profile photo to User.image so it's used everywhere
  if (data.photoUrl) {
    await prisma.user.update({
      where: { id: session.userId },
      data: { image: data.photoUrl }
    });
  }

  await prisma.staffProfile.update({
    where: { id: profile.id },
    data: {
      nidNumber: data.nidNumber,
      dob: data.dob ? new Date(data.dob) : null,
      fatherName: data.fatherName,
      motherName: data.motherName,
      permanentAddress: data.permanentAddress,
      currentAddress: data.currentAddress,
      nidFrontUrl: data.nidFrontUrl,
      nidBackUrl: data.nidBackUrl,
      cvUrl: data.cvUrl,
      referencesData: JSON.stringify(data.references),
      bankDetailsData: JSON.stringify(data.bankDetails),
      submittedAt: new Date(),
      status: "ONBOARDING",
      missingDocuments: null,
      rejectionReason: null,
      onboardingStep: 4
    }
  });

  // Notify Merchant
  const merchant = await prisma.user.findFirst({
    where: { 
      merchantStoreId: profile.merchantStoreId,
      role: "MERCHANT"
    }
  });

  if (merchant?.email) {
    try {
      await sendEmail({
        to: merchant.email,
        subject: `New Staff Onboarding Submission: ${profile.user?.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
            <h2 style="color: #1E40AF; margin-top: 0;">Onboarding Documents Submitted</h2>
            <p>Hello <strong>${merchant.name}</strong>,</p>
            <p><strong>${profile.user?.name}</strong> has submitted their onboarding documents for review in your store <strong>${profile.merchantStore?.name}</strong>.</p>
            <div style="background: #F8FAFC; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 13px; color: #64748B;"><strong>Staff Member:</strong> ${profile.user?.name}</p>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #64748B;"><strong>Designation:</strong> ${profile.jobRole}</p>
            </div>
            <p>Please login to your merchant dashboard to review the documents and approve the staff profile.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/merchant/staff" style="display: inline-block; background: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Review & Approve Now</a>
            <p style="color: #94A3B8; font-size: 12px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
              BusinessConnect.bd Administrative Notification
            </p>
          </div>
        `
      });
    } catch (err) {
      console.error("Failed to send merchant notification:", err);
    }
  }

  revalidatePath("/staff/onboarding");
  return { success: true };
}
