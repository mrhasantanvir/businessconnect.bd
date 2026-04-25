import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AlertTriangle, Trash2, Calendar, Warehouse } from "lucide-react";

export default async function DamageReportPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const damageLogs = await prisma.inventoryLog.findMany({
    where: { 
      merchantStoreId: session.merchantStoreId,
      type: { in: ['DAMAGE', 'ADJUSTMENT'] } // We can filter for damage-specific reasons too
    },
    include: { product: true, warehouse: true, user: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="space-y-1">
         <div className="flex items-center gap-2 text-red-600  font-bold text-xs uppercase tracking-widest">
            <AlertTriangle className="w-3.5 h-3.5" /> Loss Prevention
         </div>
         <h1 className="text-4xl font-extrabold text-[#0F172A]  tracking-tight">Damage Inventory Log</h1>
         <p className="text-[#64748B]  text-sm max-w-xl leading-relaxed">
            Consolidated record of all items marked as damaged, expired, or non-sellable during RMA inspections.
         </p>
      </div>

      <div className="bg-white  border border-[#E5E7EB]  rounded-[32px] overflow-hidden shadow-sm">
         <div className="p-6 border-b border-[#F1F5F9]  flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Trash2 className="w-5 h-5 text-red-500" />
               <h3 className="font-extrabold text-[#0F172A] ">Active Damage Repository</h3>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-[#F8F9FA]  text-[10px] uppercase font-bold text-[#A1A1AA] tracking-widest">
                  <tr>
                     <th className="px-6 py-4">Product Info</th>
                     <th className="px-6 py-4">Hub Location</th>
                     <th className="px-6 py-4 text-center">Qty</th>
                     <th className="px-6 py-4">Reason / Notes</th>
                     <th className="px-6 py-4 text-right">Logged At</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#F1F5F9] ">
                  {damageLogs.map(log => (
                    <tr key={log.id} className="hover:bg-red-50/30  transition-colors">
                       <td className="px-6 py-4">
                          <div className="font-bold text-[#0F172A] ">{log.product.name}</div>
                          <div className="text-[10px] text-gray-400 font-medium">Recorded by {log.user.name}</div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-600 ">
                             <Warehouse className="w-3.5 h-3.5 text-gray-400" /> {log.warehouse.name}
                          </div>
                       </td>
                       <td className="px-6 py-4 text-center font-black text-red-600">
                          {log.quantity}
                       </td>
                       <td className="px-6 py-4 text-xs text-gray-500 italic max-w-xs truncate">
                          {log.reason}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-[10px] text-gray-400 font-mono">
                             <Calendar className="w-3 h-3" /> {new Date(log.createdAt).toLocaleDateString()}
                          </div>
                       </td>
                    </tr>
                  ))}
                  {damageLogs.length === 0 && (
                    <tr>
                       <td colSpan={5} className="px-6 py-20 text-center text-gray-400 text-xs italic">
                          No damage records found in the current ledger.
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

