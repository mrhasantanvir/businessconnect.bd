import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessageSquare, ShieldCheck, Zap } from "lucide-react";
import { SmsSettingsForm } from "./SmsSettingsForm";

export default async function SmsSettingsPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const [configs, store] = await Promise.all([
    prisma.smsConfig.findMany({
        where: { merchantStoreId: session.merchantStoreId }
    }),
    prisma.merchantStore.findUnique({
        where: { id: session.merchantStoreId },
        select: { smsBalance: true }
    })
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50  rounded-full">
               <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
               <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Global Communication Suite</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900  uppercase leading-none">
               SMS <span className="text-indigo-600">Gateways</span>
            </h1>
            <p className="text-slate-500  text-sm font-bold max-w-xl">
               Automate your customer communication. Link your preferred SMS gateway provider for automated order confirmations, OTPs, and marketing campaigns.
            </p>
         </div>

         <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Platform Stability</div>
               <div className="text-xs font-bold text-slate-900  mt-1">99.9% UPTIME CLOUD</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-900  flex items-center justify-center text-white  shadow-xl">
               <Zap className="w-6 h-6" />
            </div>
         </div>
      </div>

      {/* Main Settings Form */}
      <SmsSettingsForm 
        initialConfigs={configs} 
        smsBalance={store?.smsBalance || 0} 
      />

    </div>
  );
}

