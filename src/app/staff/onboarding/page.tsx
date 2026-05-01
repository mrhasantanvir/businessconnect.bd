import React from "react";
import { getSession } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { StaffOnboardingClient } from "./StaffOnboardingClient";

export default async function StaffOnboardingPage() {
  const session = await getSession();
  if (!session || session.role !== "STAFF") redirect("/login");

  const staffProfile = await prisma.staffProfile.findUnique({
    where: { userId: session.userId },
    include: { merchantStore: true }
  });

  if (!staffProfile) redirect("/login");
  
  // If already active, redirect to dashboard
  if (staffProfile.status === "ACTIVE") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-12 px-6">
      <StaffOnboardingClient profile={staffProfile} storeName={staffProfile.merchantStore?.name || "the Merchant"} />
    </div>
  );
}
