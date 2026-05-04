import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Zap, ShieldCheck, ShoppingBag } from "lucide-react";
import { PosInterface } from "./PosInterface";

import { hasPermission } from "@/lib/permissions";

export default async function PosPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const canAccess = await hasPermission("pos:access");
  if (!canAccess) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-20 h-20 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500">
             <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Access Denied</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest text-center max-w-xs">
             POS terminal access is restricted. Authorized credentials required for Sales execution.
          </p>
       </div>
    );
  }

  // Fetch initial products for quick selection
  const products = await prisma.product.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    take: 20,
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="max-w-[1800px] mx-auto space-y-10 animate-in fade-in duration-1000">
      
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50  rounded-full">
               <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Enterprise Cloud POS</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-slate-900  uppercase leading-none">
               Sales <span className="text-indigo-600">Terminal</span>
            </h1>
         </div>

         <div className="flex items-center gap-8 bg-white  border border-slate-100  p-6 rounded-[32px] shadow-sm">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                  <ShoppingBag className="w-6 h-6" />
               </div>
               <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">POS Session</div>
                  <div className="text-sm font-black text-slate-900  mt-1 uppercase">{session.name || "Staff Member"}</div>
               </div>
            </div>
            <div className="w-px h-10 bg-slate-100 " />
            <div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Terminal ID</div>
               <div className="text-sm font-black text-slate-900  mt-1 uppercase">DHA-001-ALPHA</div>
            </div>
         </div>
      </div>

      {/* POS Interface */}
      <PosInterface initialProducts={products} />

    </div>
  );
}

