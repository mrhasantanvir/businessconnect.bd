"use client";

import React, { useState, useTransition } from "react";
import { Plus, Save, DollarSign, FileText, Building2, Calendar, Sparkles, Landmark } from "lucide-react";
import { createLedgerTransactionAction } from "./actions";

export function TransactionForm({ branches, categories, accounts }: { branches: any[], categories: any[], accounts: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [description, setDescription] = useState("");
  const [branchId, setBranchId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return alert("Select a category");
    
    startTransition(async () => {
      try {
        await createLedgerTransactionAction({
          amount: parseFloat(amount),
          type,
          description,
          branchId: branchId || undefined,
          categoryId,
          accountId: accountId || undefined,
        });
        setAmount("");
        setDescription("");
        alert("Transaction recorded and balance updated!");
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[40px] p-10 shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-[22px] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
          <DollarSign className="w-7 h-7" />
        </div>
        <div>
           <h3 className="text-lg font-semibold text-[#0F172A] tracking-tighter uppercase">New Journal Entry</h3>
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Record branch-level income or expenditure</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
           <button 
             type="button"
             onClick={() => setType("INCOME")}
             className={`py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 ${type === "INCOME" ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-lg shadow-emerald-50' : 'bg-white text-slate-400 border-gray-100'}`}
           >
              Income
           </button>
           <button 
             type="button"
             onClick={() => setType("EXPENSE")}
             className={`py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 ${type === "EXPENSE" ? 'bg-rose-50 text-rose-700 border-rose-500 shadow-lg shadow-rose-50' : 'bg-white text-slate-400 border-gray-100'}`}
           >
              Expense
           </button>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Amount (BDT)</label>
          <div className="relative">
             <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">৳</span>
             <input 
               required
               type="number"
               step="0.01"
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               className="w-full pl-12 pr-6 py-5 bg-slate-50 border-none rounded-[24px] text-xl font-black focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
               placeholder="0.00"
             />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Branch</label>
              <div className="flex items-center gap-2 bg-slate-50 px-6 py-4 rounded-[20px]">
                <Building2 className="w-4 h-4 text-slate-400" />
                <select 
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="bg-transparent border-none p-0 flex-1 font-bold text-[#0F172A] outline-none appearance-none cursor-pointer"
                >
                  <option value="">Consolidated (Global)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ledger Category</label>
              <div className="flex items-center gap-2 bg-slate-50 px-6 py-4 rounded-[20px]">
                <FileText className="w-4 h-4 text-slate-400" />
                <select 
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="bg-transparent border-none p-0 flex-1 font-bold text-[#0F172A] outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {filteredCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Account / Source</label>
           <div className="flex items-center gap-2 bg-slate-50 px-6 py-4 rounded-[20px]">
             <Landmark className="w-4 h-4 text-slate-400" />
             <select 
               value={accountId}
               onChange={(e) => setAccountId(e.target.value)}
               className="bg-transparent border-none p-0 flex-1 font-bold text-[#0F172A] outline-none appearance-none cursor-pointer"
             >
               <option value="">None (Internal Log Only)</option>
               {accounts.map(acc => (
                 <option key={acc.id} value={acc.id}>{acc.name} (৳{acc.balance.toLocaleString("en-US")})</option>
               ))}
             </select>
           </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Internal Narrative / Notes</label>
          <textarea 
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-[24px] font-bold focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
            placeholder="Describe the nature of this transaction..."
          />
        </div>

        <button 
          type="submit"
          disabled={isPending}
          className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black shadow-2xl shadow-indigo-100 hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isPending ? <Sparkles className="w-6 h-6 animate-pulse text-[#BEF264]" /> : <Save className="w-6 h-6 text-[#BEF264]" />}
          <span className="uppercase tracking-widest">{isPending ? "Finalizing Entry..." : "Commit Transaction"}</span>
        </button>
      </form>
    </div>
  );
}
