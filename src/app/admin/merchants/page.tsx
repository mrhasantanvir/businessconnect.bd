import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Store, ShieldCheck, Settings, CreditCard, MessageSquare, Phone, FileText, ExternalLink } from "lucide-react";
import { MerchantTableClient } from "./MerchantTableClient";

export default async function AdminMerchantsPage() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") redirect("/login");

  const merchants = await prisma.merchantStore.findMany({
    include: {
        _count: { select: { users: true, orders: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const settings = await prisma.systemSettings.findUnique({
    where: { id: "GLOBAL" }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex items-end justify-between">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full">
               <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Platform Control</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic">
               Merchant <span className="text-blue-600">Ecosystem</span>
            </h1>
         </div>
      </div>

      <MerchantTableClient merchants={merchants} settings={settings} />
    </div>
  );
}
