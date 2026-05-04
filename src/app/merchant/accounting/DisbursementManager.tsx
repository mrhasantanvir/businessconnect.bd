"use client";

import React, { useState, useTransition } from "react";
import { Banknote, Truck, Users, ShoppingBag, Sparkles, Plus, ArrowRight } from "lucide-react";
import { recordDisbursementAction } from "./actions";

const DISBURSEMENT_TYPES = [
  { id: "Salary", label: "Staff Payroll", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "Courier Payment", label: "Courier Settlement", icon: Truck, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "Vendor Payment", label: "Supplier / Vendor", icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "Daily Expense", label: "Operational Cost", icon: Banknote, color: "text-rose-600", bg: "bg-rose-50" },
];

export function DisbursementManager({ accounts, branches }: { accounts: any[], branches: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [selectedType, setSelectedType] = useState(DISBURSEMENT_TYPES[0].id);
  const [accountId, setAccountId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return alert("Select a source account");

    startTransition(async () => {
      try {
        await recordDisbursementAction({
          amount: parseFloat(amount),
          categoryName: selectedType,
          description,
          accountId,
          branchId: branchId || undefined,
        });
        setAmount("");
        setDescription("");
        alert(`${selectedType} recorded successfully!`);
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[48px] p-10 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-16 bg-blue-50/50 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
      
      <div className="relative z-10">
         <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-blue-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-blue-100">
               <Banknote className="w-7 h-7" />
            </div>
            <div>
               <h3 className="text-lg font-semibold uppercase tracking-tighter text-slate-900">Capital Outflow</h3>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Process payroll, vendors & logistics</p>
            </div>
         </div>

         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {DISBURSEMENT_TYPES.map(type => (
               <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-[28px] border-2 transition-all flex flex-col items-center gap-3 ${selectedType === type.id ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-50' : 'border-slate-50 bg-white hover:border-slate-200'}`}
               >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${type.bg} ${type.color}`}>
                     <type.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-tighter text-center ${selectedType === type.id ? 'text-blue-700' : 'text-slate-400'}`}>{type.label}</span>
               </button>
            ))}
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Disbursement Amount</label>
                  <div className="relative">
                     <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">৳</span>
                     <input 
                        required
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-10 pr-6 py-4 bg-slate-50 border-none rounded-[22px] font-black text-lg outline-none"
                        placeholder="0.00"
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Source Account</label>
                  <select 
                     required
                     value={accountId}
                     onChange={(e) => setAccountId(e.target.value)}
                     className="w-full px-6 py-4 bg-slate-50 border-none rounded-[22px] font-bold outline-none appearance-none"
                  >
                     <option value="">Select Account</option>
                     {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} (৳{acc.balance.toLocaleString()})</option>
                     ))}
                  </select>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Reference Branch (Optional)</label>
               <select 
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-[22px] font-bold outline-none appearance-none"
               >
                  <option value="">Consolidated / HQ</option>
                  {branches.map(b => (
                     <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
               </select>
            </div>

            <input 
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               className="w-full px-6 py-4 bg-slate-50 border-none rounded-[22px] font-bold outline-none placeholder:text-slate-300"
               placeholder="Payment remarks (e.g. March 2024 Salary for Robin)"
            />

            <button 
               type="submit"
               disabled={isPending}
               className="w-full py-5 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-3"
            >
               {isPending ? <Sparkles className="w-5 h-5 animate-spin text-blue-300" /> : <ArrowRight className="w-5 h-5 text-blue-300" />}
               Commit Payout
            </button>
         </form>
      </div>
    </div>
  );
}
