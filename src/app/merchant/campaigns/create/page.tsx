import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CampaignCreator } from "../CampaignCreator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CreateCampaignPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ where: { merchantStoreId: session.merchantStoreId } }),
    prisma.product.findMany({ where: { merchantStoreId: session.merchantStoreId }, select: { id: true, name: true } })
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex items-center gap-6">
         <Link href="/merchant/campaigns" className="p-4 bg-white border border-slate-100 rounded-[24px] hover:bg-slate-50 transition-all shadow-sm">
            <ArrowLeft className="w-6 h-6 text-slate-900" />
         </Link>
         <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Campaign <span className="text-blue-600">Manager</span></h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Multi-Channel Audience Engagement Engine</p>
         </div>
      </div>

      <CampaignCreator categories={categories} products={products} />
    </div>
  );
}

