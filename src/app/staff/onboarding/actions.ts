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

export async function submitStaffOnboardingAction(data: {
  nidNumber: string;
  dob: string;
  permanentAddress: string;
  currentAddress: string;
  nidFrontUrl: string;
  nidBackUrl: string;
  cvUrl: string;
  references: { name: string; contact: string }[];
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    bkash: string;
    nagad: string;
  };
}) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const profile = await prisma.staffProfile.findUnique({
    where: { userId: session.userId }
  });

  if (!profile) throw new Error("Profile not found");

  await prisma.staffProfile.update({
    where: { id: profile.id },
    data: {
      nidNumber: data.nidNumber,
      dob: data.dob ? new Date(data.dob) : null,
      permanentAddress: data.permanentAddress,
      currentAddress: data.currentAddress,
      nidFrontUrl: data.nidFrontUrl,
      nidBackUrl: data.nidBackUrl,
      cvUrl: data.cvUrl,
      referencesData: JSON.stringify(data.references),
      bankDetailsData: JSON.stringify(data.bankDetails),
      submittedAt: new Date(),
      status: "ONBOARDING", // Still onboarding until merchant approves
      onboardingStep: 4 // Final step
    }
  });

  revalidatePath("/staff/onboarding");
  return { success: true };
}
