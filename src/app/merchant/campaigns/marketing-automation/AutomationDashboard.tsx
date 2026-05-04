"use client";

import React, { useState } from "react";
import { 
  Zap, 
  MessageSquare, 
  Smartphone, 
  ToggleLeft, 
  ToggleRight, 
  Clock, 
  Target, 
  TrendingUp,
  RotateCcw,
  RefreshCw,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toggleAutomationAction } from "./actions";

export function AutomationDashboard({ initialCarts }: { initialCarts: any[] }) {
  const [automations, setAutomations] = useState([
    { id: "abandoned_cart", name: "Abandoned Cart Recovery", desc: "Send SMS 1 hour after cart abandonment", icon: RotateCcw, color: "bg-amber-500", active: true },
    { id: "welcome_series", name: "Welcome SMS", desc: "Greet new customers with a discount code", icon: Target, color: "bg-indigo-500", active: false },
    { id: "review_request", name: "Review Collector", desc: "Request reviews 3 days after delivery", icon: TrendingUp, color: "bg-emerald-500", active: true },
  ]);

  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setLoading(id);
    const result = await toggleAutomationAction(id, !currentStatus);
    if (result.success) {
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, active: !currentStatus } : a));
    }
    setLoading(null);
  };

  return (
    <div className="space-y-12">
      
      {/* Automation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {automations.map((a) => (
           <div key={a.id} className="bg-white  border border-slate-100  rounded-[40px] p-8 space-y-8 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex items-start justify-between">
                 <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", a.color)}>
                    <a.icon className="w-6 h-6" />
                 </div>
                 <button 
                  onClick={() => handleToggle(a.id, a.active)}
                  disabled={loading === a.id}
                  className="transition-transform active:scale-90"
                 >
                    {loading === a.id ? (
                      <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
                    ) : a.active ? (
                      <ToggleRight className="w-10 h-10 text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-300" />
                    )}
                 </button>
              </div>

              <div className="space-y-2">
                 <h3 className="text-xl font-semibold text-slate-900  tracking-tight uppercase">{a.name}</h3>
                 <p className="text-[11px] font-bold text-slate-400 leading-relaxed">{a.desc}</p>
              </div>

              <div className="pt-6 border-t border-slate-50  flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Engine</span>
                 </div>
                 <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest cursor-pointer hover:underline">
                    Edit Rules
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* Recent Activity / Abandoned Carts */}
      <div className="bg-white  border border-slate-100  rounded-[48px] overflow-hidden shadow-sm">
         <div className="p-8 border-b border-slate-50  flex items-center justify-between bg-slate-50/50 ">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-slate-900  flex items-center justify-center text-white  shadow-xl">
                  <Clock className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-lg font-semibold uppercase tracking-tight text-slate-900 ">Recent Automation Logs</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tracking recovered revenue in real-time</p>
               </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white  border border-slate-200  rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 transition-all shadow-sm">
               <RefreshCw className="w-3 h-3" /> Sync Data
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50/30 ">
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Identity</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cart Value</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recovery Status</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Reminder</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 ">
                  {initialCarts.map((cart) => (
                    <tr key={cart.id} className="hover:bg-slate-50/50  transition-colors group">
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-slate-100  flex items-center justify-center text-slate-400 font-black text-xs uppercase">
                                {cart.customerName?.charAt(0) || "U"}
                             </div>
                             <div>
                                <div className="text-sm font-black text-slate-900  uppercase">{cart.customerName || "Anonymous"}</div>
                                <div className="text-[10px] font-bold text-slate-400 mt-1">{cart.customerPhone || "No Phone"}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-8 text-sm font-black text-slate-900  tracking-tight">
                          ৳{(JSON.parse(cart.cartData || "{}").total || 0).toLocaleString()}
                       </td>
                       <td className="px-10 py-8">
                          <span className={cn(
                             "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                             cart.status === "RECOVERED" 
                               ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                               : "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                             {cart.status}
                          </span>
                       </td>
                       <td className="px-10 py-8 text-[11px] font-bold text-slate-400">
                          {cart.lastReminderSentAt ? format(new Date(cart.lastReminderSentAt), "MMM d, h:mm a") : "Not Sent Yet"}
                       </td>
                       <td className="px-10 py-8 text-right">
                          <button className="p-3 bg-white  border border-slate-200  rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                             <MessageSquare className="w-4 h-4" />
                          </button>
                       </td>
                    </tr>
                  ))}
                  {initialCarts.length === 0 && (
                    <tr>
                       <td colSpan={5} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-20">
                             <CheckCircle2 className="w-16 h-16" />
                             <p className="text-[10px] font-black uppercase tracking-widest">No Abandoned Carts Found</p>
                          </div>
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

