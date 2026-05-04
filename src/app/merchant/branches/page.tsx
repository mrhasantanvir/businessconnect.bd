import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Building2, Plus, Users, Globe } from "lucide-react";
import { BranchList } from "./BranchList";
import { BranchForm } from "./BranchForm";

export default async function MerchantBranchesPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const branches = await prisma.branch.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: {
      _count: { select: { users: true, orders: true, warehouses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const staff = await prisma.user.findMany({
    where: { 
      merchantStoreId: session.merchantStoreId,
      role: { in: ["MERCHANT", "STAFF"] }
    },
    select: { id: true, name: true }
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] bg-indigo-50 px-2 py-0.5 rounded">Multi-Location Engine</span>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter uppercase">Branch Network</h1>
          <p className="text-[#64748B] text-sm font-medium mt-1">
            Manage your decentralized business ecosystem across multiple physical and digital locations.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-xs font-black border border-slate-100 shadow-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" /> {branches.length} Registered Nodes
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Branch Grid */}
        <div className="lg:col-span-2 space-y-6">
           <BranchList branches={branches} />
        </div>

        {/* Right: Management Panel */}
        <div className="space-y-6 sticky top-8">
           <BranchForm staff={staff} />
           
           {/* Branch Stats Mini-Card */}
           <div className="p-8 bg-slate-900 text-white rounded-[32px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 transform translate-x-1/2 -translate-y-1/2 bg-indigo-500/20 w-32 h-32 rounded-full blur-2xl" />
              <div className="relative z-10 space-y-4">
                 <div className="w-10 h-10 bg-[#BEF264] rounded-xl flex items-center justify-center text-green-900 shadow-xl">
                    <Globe className="w-6 h-6" />
                 </div>
                 <h4 className="text-sm font-black uppercase tracking-tight text-indigo-200">Network Intelligence</h4>
                 <p className="text-[10px] font-medium text-slate-300 leading-relaxed uppercase tracking-tighter">
                   Centralized control for all branches. Orders and inventory are automatically routed based on branch assignment.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
