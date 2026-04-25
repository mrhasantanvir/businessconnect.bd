"use client";

import React, { useState, useTransition } from "react";
import { Plus, Tag, ArrowUpRight, ArrowDownLeft, Sparkles } from "lucide-react";
import { createAccountCategoryAction } from "./actions";

export function CategoryManager({ categories }: { categories: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [type, setType] = useState("EXPENSE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createAccountCategoryAction({ name, type });
        setName("");
        alert("Category added!");
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
          <Tag className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-[#0F172A]">Ledger Categories</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="flex gap-2">
           <input 
             required
             value={name}
             onChange={(e) => setName(e.target.value)}
             className="flex-1 px-5 py-3.5 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-slate-100 outline-none transition-all"
             placeholder="e.g. Office Rent, Product Sales..."
           />
           <select 
             value={type}
             onChange={(e) => setType(e.target.value)}
             className="px-4 py-3.5 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-slate-100 outline-none"
           >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
           </select>
           <button 
             type="submit"
             disabled={isPending}
             className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all disabled:opacity-50"
           >
              {isPending ? <Sparkles className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
           </button>
        </div>
      </form>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
         {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
               <span className="font-bold text-slate-700">{cat.name}</span>
               {cat.type === "INCOME" ? (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                     <ArrowDownLeft className="w-3 h-3" /> Income
                  </span>
               ) : (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                     <ArrowUpRight className="w-3 h-3" /> Expense
                  </span>
               )}
            </div>
         ))}
      </div>
    </div>
  );
}
