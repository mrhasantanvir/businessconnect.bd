"use client";

import React, { useState, useTransition } from "react";
import { Landmark, Wallet, Plus, CreditCard, ArrowRight, Sparkles } from "lucide-react";
import { createBusinessAccountAction } from "./actions";

export function AccountManager({ branches, accounts }: { branches: any[], accounts: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [type, setType] = useState("BANK");
  const [balance, setBalance] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branchId, setBranchId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createBusinessAccountAction({
          name,
          type,
          initialBalance: parseFloat(balance) || 0,
          bankName: type === "BANK" ? bankName : undefined,
          accountNumber: type === "BANK" ? accountNumber : undefined,
          branchId: branchId || undefined,
        });
        setName("");
        setBalance("");
        setBankName("");
        setAccountNumber("");
        alert("Financial account registered!");
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[48px] p-10 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 p-12 bg-emerald-50 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
      
      <div className="relative z-10">
         <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-emerald-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-emerald-100">
               <Landmark className="w-7 h-7" />
            </div>
            <div>
               <h3 className="text-2xl font-black uppercase tracking-tighter italic">Treasury Nodes</h3>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Manage bank & cash liquidity</p>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4 mb-10">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Account Type</label>
                  <select 
                     value={type}
                     onChange={(e) => setType(e.target.value)}
                     className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold outline-none cursor-pointer"
                  >
                     <option value="BANK">Banking Institution</option>
                     <option value="CASH">Physical Cash (Vault)</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Opening Balance</label>
                  <input 
                     value={balance}
                     onChange={(e) => setBalance(e.target.value)}
                     className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold outline-none placeholder:text-slate-300"
                     placeholder="৳ 0.00"
                  />
               </div>
            </div>

            <input 
               required
               value={name}
               onChange={(e) => setName(e.target.value)}
               className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold outline-none placeholder:text-slate-300"
               placeholder="Account Label (e.g. Brac Bank Main)"
            />

            {type === "BANK" && (
               <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <input 
                     value={bankName}
                     onChange={(e) => setBankName(e.target.value)}
                     className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold outline-none"
                     placeholder="Bank Name"
                  />
                  <input 
                     value={accountNumber}
                     onChange={(e) => setAccountNumber(e.target.value)}
                     className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold outline-none"
                     placeholder="Account Number"
                  />
               </div>
            )}

            <button 
               type="submit"
               disabled={isPending}
               className="w-full py-5 bg-slate-900 text-white rounded-[28px] font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-2"
            >
               {isPending ? <Sparkles className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
               Initialize Account
            </button>
         </form>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accounts.map(acc => (
               <div key={acc.id} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-500">
                  <div className="flex items-center justify-between mb-4">
                     <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${acc.type === 'BANK' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                        {acc.type === 'BANK' ? <CreditCard className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                     </div>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{acc.type}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 truncate uppercase tracking-tighter">{acc.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{acc.accountNumber || "Direct Access"}</p>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                     <p className="text-xl font-black text-slate-900 italic">৳{acc.balance.toLocaleString()}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
