"use client";

import React, { useState, useTransition } from "react";
import { Repeat, Clock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { createRecurringTransactionAction } from "./actions";

export function RecurringManager({ categories, branches, recurrings }: { categories: any[], branches: any[], recurrings: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return;
    
    startTransition(async () => {
      const nextRunDate = new Date();
      nextRunDate.setMonth(nextRunDate.getMonth() + 1);

      await createRecurringTransactionAction({
        amount: parseFloat(amount),
        type: categories.find(c => c.id === categoryId)?.type || "EXPENSE",
        description,
        frequency,
        nextRunDate,
        categoryId,
        branchId: branchId || undefined,
      });
      setAmount("");
      setDescription("");
      alert("Recurring automation established!");
    });
  };

  return (
    <div className="bg-slate-900 text-white rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 bg-indigo-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
      
      <div className="relative z-10">
         <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-[#BEF264] rounded-[24px] flex items-center justify-center text-green-900 shadow-xl shadow-green-900/20">
               <Repeat className="w-7 h-7" />
            </div>
            <div>
               <h3 className="text-lg font-semibold uppercase tracking-tighter">Automation Engine</h3>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Automated recurring journals</p>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4 mb-10">
            <div className="grid grid-cols-2 gap-4">
               <input 
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold focus:ring-2 focus:ring-[#BEF264]/20 outline-none transition-all placeholder:text-slate-600"
                  placeholder="Amount (৳)"
               />
               <select 
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none cursor-pointer"
               >
                  <option className="text-slate-900" value="WEEKLY">Weekly Cycle</option>
                  <option className="text-slate-900" value="MONTHLY">Monthly Cycle</option>
                  <option className="text-slate-900" value="YEARLY">Yearly Cycle</option>
               </select>
            </div>
            <select 
               required
               value={categoryId}
               onChange={(e) => setCategoryId(e.target.value)}
               className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none cursor-pointer"
            >
               <option className="text-slate-900" value="">Select Category</option>
               {categories.map(c => (
                  <option className="text-slate-900" key={c.id} value={c.id}>{c.name} ({c.type})</option>
               ))}
            </select>
            <textarea 
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold focus:ring-2 focus:ring-[#BEF264]/20 outline-none resize-none placeholder:text-slate-600"
               placeholder="Description (e.g. Office Internet Bill)"
               rows={2}
            />
            <button 
               type="submit"
               disabled={isPending}
               className="w-full py-5 bg-[#BEF264] text-green-900 rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-white transition-all active:scale-95 flex items-center justify-center gap-2"
            >
               {isPending ? <Sparkles className="w-5 h-5 animate-pulse" /> : <ShieldCheck className="w-5 h-5" />}
               Deploy Automated Entry
            </button>
         </form>

         <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Active Automations</h4>
            {recurrings.map(r => (
               <div key={r.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                     <Clock className="w-4 h-4 text-[#BEF264]" />
                     <div>
                        <p className="text-xs font-black text-white">{r.category.name}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">{r.frequency} • Next: {new Date(r.nextRunDate).toLocaleDateString("en-US")}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-black text-[#BEF264]">৳{r.amount.toLocaleString("en-US")}</p>
                  </div>
               </div>
            ))}
            {recurrings.length === 0 && (
               <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-[32px]">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No automations deployed</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
