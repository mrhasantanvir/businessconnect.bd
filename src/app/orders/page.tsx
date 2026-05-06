import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrderWorkspace } from "./OrderWorkspace";

import { hasPermission } from "@/lib/permissions";

export default async function OrdersManagementPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const canView = await hasPermission("orders:view");
  if (!canView) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-20 h-20 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500">
             <Truck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Access Denied</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest text-center max-w-xs">
             Authorization failed. Your node does not have the required clearance to access Logistics.
          </p>
       </div>
    );
  }

  

  const statsData = await prisma.order.groupBy({
    by: ['status'],
    where: { merchantStoreId: session.merchantStoreId },
    _count: { _all: true },
    _sum: { total: true }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysPendingData = await prisma.order.aggregate({
    where: { 
      merchantStoreId: session.merchantStoreId,
      status: "PENDING",
      createdAt: { gte: today }
    },
    _count: { _all: true },
    _sum: { total: true }
  });

  const damagedCount = await prisma.returnRequest.count({
    where: {
      merchantStoreId: session.merchantStoreId,
      status: "DAMAGED"
    }
  });

  const orders = await prisma.order.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: {
       items: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 50 // Load recent 50 for workspace performance
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
             <h1 className="text-xl md:text-2xl font-bold text-[#0F172A] uppercase tracking-tight">Order <span className="text-indigo-600">Workspace</span></h1>
          </div>
          <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">Enterprise Command & Dispatch Center</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-gray-50 text-gray-500 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-gray-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              Real-time Intelligence Active
           </div>
        </div>
      </div>

      <OrderWorkspace initialOrders={orders} statsData={statsData} />
    </div>
  );
}
