import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import StaffWorkspace from "./StaffWorkspace";

export default async function StaffDashboardPage() {
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
        user: { name: "Merchant Owner", email: session.email } as any,
        jobRole: "Store Owner (Preview)",
        status: "ACTIVE",
        baseSalary: 0,
        wageType: "MONTHLY",
        avgActivityScore: 95
     } as any;
  }

  if (!profile || (profile.status !== "ACTIVE" && session.role !== "MERCHANT")) {
    redirect("/merchant/staff/onboarding");
  }

  const activeLog = await prisma.staffWorkLog.findFirst({
    where: { staffProfileId: profile.id, status: "ACTIVE" }
  });

  return <StaffWorkspace profile={profile} activeLog={activeLog} />;
}
