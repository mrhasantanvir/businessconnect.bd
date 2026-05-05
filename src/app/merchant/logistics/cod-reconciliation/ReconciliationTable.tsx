"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  Truck, 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronRight,
  MoreVertical,
  Banknote,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { reconcileOrderAction, bulkReconcileAction } from "./actions";

export function ReconciliationTable({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const handleReconcile = async (orderId: string, amount: number) => {
    setLoading(orderId);
    const result = await reconcileOrderAction(orderId, amount);
    if (result.success) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } else {
      alert(result.error);
    }
    setLoading(null);
  };

  const handleBulkReconcile = async () => {
    if (selected.length === 0) return;
    setLoading("bulk");
    const result = await bulkReconcileAction(selected);
    if (result.success) {
      setOrders(prev => prev.filter(o => !selected.includes(o.id)));
      setSelected([]);
    } else {
      alert(result.error);
    }
    setLoading(null);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="bg-white  rounded-[48px] border border-slate-100  overflow-hidden shadow-2xl">
      
      {/* Search & Actions Hub */}
      <div className="p-8 border-b border-slate-50  flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50 ">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              placeholder="Search by Tracking ID or Order ID..." 
              className="w-full h-12 pl-12 pr-6 bg-white  border border-slate-200  rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
         </div>

         <div className="flex items-center gap-4">
            {selected.length > 0 && (
              <button 
                onClick={handleBulkReconcile}
                disabled={loading === "bulk"}
                className="flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                {loading === "bulk" ? <RefreshCw className="w-3 h-3 animate-spin" /> : <><CheckCircle2 className="w-3 h-3" /> Reconcile Selected ({selected.length})</>}
              </button>
            )}
            <button className="p-3 bg-white  border border-slate-200  rounded-xl text-slate-400 hover:text-slate-900 transition-all">
               <Filter className="w-5 h-5" />
            </button>
         </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
           <thead>
              <tr className="bg-slate-50/30 ">
                 <th className="px-10 py-6 w-10">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                 </th>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Courier Identity</th>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient</th>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Order Value</th>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Settlement Action</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-50 ">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50  transition-colors group">
                   <td className="px-10 py-8">
                      <input 
                        type="checkbox" 
                        checked={selected.includes(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        className="w-4 h-4 rounded border-slate-300" 
                      />
                   </td>
                   <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-slate-900  flex items-center justify-center text-white  shadow-sm">
                            <Truck className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="text-sm font-black text-slate-900  uppercase">{order.preferredCourier || "Standard"}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.courierTrxId || "No Tracking"}</div>
                         </div>
                      </div>
                   </td>
                   <td className="px-10 py-8">
                      <div className="text-sm font-black text-slate-900  uppercase">{order.customerName}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1">{order.customerPhone}</div>
                   </td>
                   <td className="px-10 py-8 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50  rounded-full border border-slate-100 ">
                         <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                         <span className="text-sm font-black text-slate-900 ">৳{order.total.toLocaleString("en-US")}</span>
                      </div>
                   </td>
                   <td className="px-10 py-8 text-right">
                      <button 
                        onClick={() => handleReconcile(order.id, order.total)}
                        disabled={loading === order.id}
                        className="px-6 py-3 bg-white text-slate-900 text-slate-900 text-slate-900  border border-slate-200  rounded-2xl text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                      >
                         {loading === order.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Mark Reconciled"}
                      </button>
                   </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                         <CheckCircle2 className="w-16 h-16" />
                         <p className="text-[10px] font-black uppercase tracking-widest">All Delivered Orders are Reconciled</p>
                      </div>
                   </td>
                </tr>
              )}
           </tbody>
        </table>
      </div>

    </div>
  );
}

