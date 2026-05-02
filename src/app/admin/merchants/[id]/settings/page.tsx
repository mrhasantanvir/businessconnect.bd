import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MerchantSettingsClient } from "./MerchantSettingsClient";

export default async function MerchantSettingsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") redirect("/login");

  const resolvedParams = await params;
  const merchantId = resolvedParams.id;

  const merchant = await prisma.merchantStore.findUnique({
    where: { id: merchantId },
    include: {
      sipConfig: true,
      subscriptionPlan: true,
      users: {
        where: { role: "MERCHANT" }
      }
    }
  });

  if (!merchant) redirect("/admin/merchants");

  return (
    <MerchantSettingsClient merchant={merchant} />
  );
}
