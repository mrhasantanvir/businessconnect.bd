import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import OnboardingFlow from "./OnboardingFlow";

export default async function StaffOnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let profile = await prisma.staffProfile.findUnique({
    where: { userId: session.userId },
    include: { user: true }
  });

  if (!profile && session.role === "MERCHANT") {
     profile = {
        id: "preview-id",
        userId: session.userId,
        user: { name: "Merchant Owner", email: session.email },
        jobRole: "Store Owner (Preview)",
        onboardingStep: 1,
        status: "ONBOARDING",
        baseSalary: 0,
        wageType: "MONTHLY",
        agreementSigned: false
     } as any;
  }

  if (!profile) {
     redirect("/dashboard");
  }

  if (profile.status === "ACTIVE" && session.role !== "MERCHANT") {
    redirect("/merchant/staff/dashboard");
  }

  return <OnboardingFlow profile={profile} />;
}
