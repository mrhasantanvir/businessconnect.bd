
import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db as prisma } from "@/lib/db";
import PrintSettingsClient from "@/components/merchant/settings/PrintSettingsClient";

export default async function PrintSettingsPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const store = await prisma.merchantStore.findUnique({
    where: { id: session.merchantStoreId }
  });

  // Parse print config from themeConfig or use default
  let initialConfig = null;
  try {
    if (store?.themeConfig) {
      const fullConfig = JSON.parse(store.themeConfig);
      initialConfig = fullConfig.print;
    }
  } catch (err) {
    console.error("Failed to parse print config:", err);
  }

  return (
    <div className="p-4 md:p-8">
      <PrintSettingsClient initialConfig={initialConfig} />
    </div>
  );
}
