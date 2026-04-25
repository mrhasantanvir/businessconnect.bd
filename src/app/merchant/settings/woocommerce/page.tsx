import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Layout } from "lucide-react";
import { WoocommerceSettingsForm } from "./WoocommerceSettingsForm";

export default async function WoocommerceSettingsPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const config = await prisma.wcConfig.findUnique({
    where: { merchantStoreId: session.merchantStoreId }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-gray-100 ">
         <div>
            <h1 className="text-4xl font-black tracking-tight text-[#0F172A]  uppercase italic">
               eCommerce <span className="text-indigo-600">Pipeline</span>
            </h1>
            <p className="text-[#64748B]  text-sm font-bold mt-2 uppercase tracking-widest flex items-center gap-2">
               <Layout className="w-4 h-4 text-indigo-500" /> WooCommerce Integration & Sync
            </p>
         </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 relative overflow-hidden">
         <div className="absolute right-0 top-0 opacity-10 pointer-events-none text-amber-900">
            <Layout className="w-48 h-48 -mt-6 -mr-6" />
         </div>
         <h2 className="font-extrabold text-amber-900 mb-2 z-10 relative">Multi-Source Fulfillment</h2>
         <p className="text-xs text-amber-800 z-10 relative max-w-2xl leading-relaxed font-medium">
            Synchronize your external WooCommerce orders into BusinessOS in real-time. This integration allows you to leverage our advanced warehousing and logistics (ServiceNow & Zoho standard) for orders originating from your WordPress website.
         </p>
      </div>

      <WoocommerceSettingsForm initialConfig={config} />
      
    </div>
  );
}

