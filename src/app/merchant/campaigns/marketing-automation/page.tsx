import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Megaphone, ShieldCheck, Zap, TrendingUp } from "lucide-react";
import { AutomationDashboard } from "./AutomationDashboard";

export default async function MarketingAutomationPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  // Fetch recent abandoned carts for the dashboard
  const abandonedCarts = await prisma.abandonedCart.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50  rounded-full">
               <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
               <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Growth Hyper-Automation</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900  uppercase leading-none">
               Marketing <span className="text-indigo-600">Automation</span>
            </h1>
            <p className="text-slate-500  text-sm font-bold max-w-xl">
               Maximize your ROI with automated marketing pipelines. Set up rules to recover lost sales, greet new customers, and collect reviews without lifting a finger.
            </p>
         </div>

         <div className="flex items-center gap-8 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-10 -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-1000">
               <TrendingUp className="w-32 h-32" />
            </div>
            <div className="relative z-10">
               <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Recovered Revenue</div>
               <div className="text-2xl font-bold mt-2 tracking-tight">৳42,500</div>
            </div>
            <div className="w-px h-12 bg-white/10 mx-2" />
            <div className="relative z-10">
               <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Efficiency</div>
               <div className="text-2xl font-bold mt-2 tracking-tight">+18.5%</div>
            </div>
         </div>
      </div>

      {/* Main Dashboard Interface */}
      <AutomationDashboard initialCarts={abandonedCarts} />

    </div>
  );
}

