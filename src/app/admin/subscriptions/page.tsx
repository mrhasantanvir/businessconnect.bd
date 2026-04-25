import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Package, MonitorSpeaker } from "lucide-react";
import { PlanManager } from "./PlanManager";

export default async function AdminSubscriptionsPage() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") redirect("/login");

  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { monthlyPrice: "asc" },
    include: {
      _count: { select: { stores: true } }
    }
  });

  return (
    <div className="p-6 space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-[#1E40AF]" />
          SaaS Blueprint Engine
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage platform subscription tiers, resource caps, and billing structures.
        </p>
      </div>

      <PlanManager plans={plans} />

      {/* Global Status List */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mt-8">
         <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
           <h3 className="font-bold flex items-center gap-2">
             <MonitorSpeaker className="w-4 h-4 text-gray-400" />
             Merchant Subscriptions Ledger
           </h3>
         </div>
         {/* Here we can list merchants by plan or just rely on the other dashboards */}
         <div className="p-8 text-center text-sm text-gray-500">
            {plans.reduce((acc, p) => acc + p._count.stores, 0)} Total Merchants Assigned to Plans.
         </div>
      </div>
    </div>
  );
}
