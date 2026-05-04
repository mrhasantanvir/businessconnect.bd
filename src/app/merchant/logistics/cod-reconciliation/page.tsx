import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Banknote, ShieldCheck, Zap, Truck, CheckCircle2 } from "lucide-react";
import { ReconciliationTable } from "./ReconciliationTable";
import { cn } from "@/lib/utils";

export default async function CodReconciliationPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  // Fetch orders that are DELIVERED but not yet RECONCILED
  const orders = await prisma.order.findMany({
    where: {
      merchantStoreId: session.merchantStoreId,
      status: "DELIVERED",
      reconciledAt: null,
    },
    orderBy: { createdAt: "desc" }
  });

  // Summary stats
  const totalOutstanding = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50  rounded-full">
               <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Financial Integrity System</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900  uppercase leading-none">
               COD <span className="text-indigo-600">Reconciliation</span>
            </h1>
            <p className="text-slate-500  text-sm font-bold max-w-xl">
               Track and settle Cash-on-Delivery payments from your courier partners. Ensure every Taka from your delivered parcels is accounted for and settled in your bank.
            </p>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <StatCard label="Outstanding COD" value={`৳${totalOutstanding.toLocaleString()}`} icon={Banknote} color="text-indigo-500" />
            <StatCard label="Pending Parcels" value={orders.length} icon={Truck} color="text-amber-500" />
         </div>
      </div>

      {/* Warning Box */}
      <div className="bg-indigo-50  border border-indigo-100  rounded-[40px] p-10 flex items-center justify-between relative overflow-hidden group">
         <div className="absolute right-0 top-0 p-20 transform translate-x-1/2 -translate-y-1/2 bg-white/50 w-64 h-64 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
         <div className="flex items-center gap-8 relative z-10">
            <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
               <Zap className="w-8 h-8" />
            </div>
            <div>
               <h3 className="text-xl font-black text-indigo-900  uppercase tracking-tight">Consolidated Settlement</h3>
               <p className="text-[11px] font-bold text-indigo-800/60  mt-1 max-w-md">
                  Select multiple delivered parcels and mark them as settled in one click. This keeps your financial ledger accurate and aligned with your bank statements.
               </p>
            </div>
         </div>
         <button className="px-8 py-4 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl relative z-10">
            View History
         </button>
      </div>

      {/* Main Reconciliation Interface */}
      <ReconciliationTable initialOrders={orders} />

    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white  border border-slate-100  p-6 rounded-[32px] min-w-[200px] shadow-sm">
       <div className="flex items-center gap-3 mb-3">
          <Icon className={cn("w-4 h-4", color)} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</span>
       </div>
       <div className="text-3xl font-black text-slate-900  tracking-tighter">{value}</div>
    </div>
  );
}

