import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Box, Package, ArrowUpRight, ArrowDownLeft, Activity, History } from "lucide-react";
import { StockAdjustmentForm } from "./StockAdjustmentForm";

import { hasPermission } from "@/lib/permissions";

export default async function InventoryOverviewPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const canView = await hasPermission("inventory:manage");
  if (!canView) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-20 h-20 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500">
             <Package className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Access Denied</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest text-center max-w-xs">
             Your account is not authorized for WMS operations. Please contact the System Administrator.
          </p>
       </div>
    );
  }

  const warehouses = await prisma.warehouse.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: {
      stocks: {
        include: { product: true }
      }
    }
  });

  const products = await prisma.product.findMany({
    where: { merchantStoreId: session.merchantStoreId }
  });

  const recentLogs = await prisma.inventoryLog.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: { product: true, warehouse: true, user: true },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white  border border-[#E5E7EB]  p-6 rounded-[28px] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-blue-50  rounded-xl flex items-center justify-center text-blue-600">
                  <Box className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Hubs</span>
            </div>
            <div className="text-3xl font-black text-[#0F172A] ">{warehouses.length}</div>
         </div>
         <div className="bg-white  border border-[#E5E7EB]  p-6 rounded-[28px] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-green-50  rounded-xl flex items-center justify-center text-green-600">
                  <Activity className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total SKU Count</span>
            </div>
            <div className="text-3xl font-black text-[#0F172A] ">{products.length}</div>
         </div>
         <div className="bg-white  border border-[#E5E7EB]  p-6 rounded-[28px] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-indigo-50  rounded-xl flex items-center justify-center text-indigo-600">
                  <History className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logs (Last 24h)</span>
            </div>
            <div className="text-3xl font-black text-[#0F172A] ">{recentLogs.length}</div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            {/* Warehouse Stock Tables */}
            {warehouses.map(wh => (
              <div key={wh.id} className="bg-white  border border-[#E5E7EB]  rounded-[32px] overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                       <Package className="w-5 h-5 text-indigo-500" />
                       <h3 className="font-extrabold text-[#0F172A]">{wh.name} Stock Registry</h3>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-[#F8F9FA] text-[10px] uppercase font-bold text-[#A1A1AA] tracking-widest">
                          <tr>
                             <th className="px-6 py-4">Product Name</th>
                             <th className="px-6 py-4 text-center">Current Qty</th>
                             <th className="px-6 py-4 text-right">Last Sync</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-[#F1F5F9]">
                          {wh.stocks.map(st => (
                            <tr key={st.id} className="hover:bg-gray-50 transition-colors">
                               <td className="px-6 py-4 font-bold text-[#0F172A]">{st.product.name}</td>
                               <td className="px-6 py-4 text-center">
                                  <span className={`px-2.5 py-1 rounded-full font-black text-xs ${
                                     st.quantity < 10 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 text-gray-700 border border-gray-100'
                                  }`}>
                                     {st.quantity}
                                  </span>
                               </td>
                               <td className="px-6 py-4 text-right text-[10px] text-gray-400 font-medium italic">
                                  {new Date(st.updatedAt).toLocaleString()}
                               </td>
                            </tr>
                          ))}
                          {wh.stocks.length === 0 && (
                            <tr>
                               <td colSpan={3} className="px-6 py-10 text-center text-gray-400 text-xs italic">No stock initialized in this hub.</td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
            ))}
         </div>

         <div className="lg:col-span-1 space-y-6">
            <StockAdjustmentForm warehouses={warehouses} products={products} />

            {/* Recent Audit Rail */}
            <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm space-y-6">
               <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-slate-900">
                 <History className="w-5 h-5 text-indigo-600" />
                 Audit Rail
               </h3>
               <div className="space-y-4">
                  {recentLogs.map(log => (
                    <div key={log.id} className="border-l-2 border-indigo-100 pl-4 py-1 space-y-1">
                       <div className="flex items-center justify-between">
                         <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                           log.type === 'STOCK_IN' || log.type === 'RETURN' ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'
                         }`}>
                           {log.type}
                         </span>
                         <span className="text-[10px] text-slate-400 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                       </div>
                       <div className="text-sm font-bold truncate max-w-[180px] text-slate-900">{log.product.name}</div>
                       <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          {log.type.includes('IN') ? <ArrowUpRight className="w-3 h-3 text-emerald-600" /> : <ArrowDownLeft className="w-3 h-3 text-red-600" />}
                          Qty: {log.quantity} @ {log.warehouse.name}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

