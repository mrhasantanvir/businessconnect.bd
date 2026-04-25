"use client";

import React, { useState, useTransition } from "react";
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Sparkles, Plus } from "lucide-react";
import { upsertBudgetAction } from "./actions";

export function BudgetPlanner({ categories, branches, budgets }: { categories: any[], branches: any[], budgets: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [branchId, setBranchId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return;
    
    startTransition(async () => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

      await upsertBudgetAction({
        amount: parseFloat(amount),
        startDate,
        categoryId,
        branchId: branchId || undefined,
      });
      setAmount("");
      alert("Budget set for this month!");
    });
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[40px] p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
               <Target className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Budget Governance</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Set monthly expenditure limits</p>
            </div>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 items-end">
         <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Category</label>
            <select 
               value={categoryId} 
               onChange={(e) => setCategoryId(e.target.value)}
               className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm outline-none"
            >
               <option value="">Select Category</option>
               {categories.filter(c => c.type === "EXPENSE").map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
               ))}
            </select>
         </div>
         <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Branch (Optional)</label>
            <select 
               value={branchId} 
               onChange={(e) => setBranchId(e.target.value)}
               className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm outline-none"
            >
               <option value="">All Branches</option>
               {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
               ))}
            </select>
         </div>
         <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Monthly Limit</label>
            <input 
               type="number"
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm outline-none"
               placeholder="0.00"
            />
         </div>
         <button 
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-100"
         >
            {isPending ? <Sparkles className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Provision
         </button>
      </form>

      <div className="space-y-4">
         {budgets.map((budget) => {
            const spent = budget.category.transactions?.filter((t: any) => t.type === "EXPENSE").reduce((acc: number, t: any) => acc + t.amount, 0) || 0;
            const percentage = Math.min(100, (spent / budget.amount) * 100);
            const isOver = spent > budget.amount;

            return (
               <div key={budget.id} className="p-6 bg-slate-50/50 rounded-[32px] border border-slate-100 group hover:border-indigo-100 transition-all">
                  <div className="flex items-center justify-between mb-4">
                     <div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{budget.category.name}</p>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">{budget.branch?.name || "Global Strategy"}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-slate-900">৳{spent.toLocaleString()} / ৳{budget.amount.toLocaleString()}</p>
                        <p className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${isOver ? 'text-rose-500' : 'text-emerald-500'}`}>
                           {isOver ? 'Exceeded limit' : 'Within Budget'}
                        </p>
                     </div>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                     <div 
                        className={`h-full transition-all duration-1000 ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${percentage}%` }}
                     />
                  </div>
               </div>
            );
         })}
      </div>
    </div>
  );
}
