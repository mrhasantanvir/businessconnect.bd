"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  Plus, 
  ShieldCheck, 
  RefreshCcw, 
  Coins,
  DollarSign,
  ArrowRight,
  Activity
} from "lucide-react";

export default function RechargeAiPage() {
  const [selectedPack, setSelectedPack] = useState(1);
  
  const packs = [
    { id: 1, units: 1000, price: 500, label: "Starter Pack" },
    { id: 2, units: 5000, price: 2000, label: "Growth Pack (Best Value)", featured: true },
    { id: 3, units: 25000, price: 9000, label: "Business Pack" }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="space-y-1">
         <div className="flex items-center gap-2 text-pink-600 font-bold text-xs uppercase tracking-widest">
            <Coins className="w-3.5 h-3.5" /> Direct Monetization
         </div>
         <h1 className="text-2xl font-bold text-[#0F172A]  tracking-tight">Top-up AI Credits</h1>
         <p className="text-[#64748B]  text-sm max-w-xl leading-relaxed">
            Purchase AI units to fuel your Facebook auto-replies and vision intelligence.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {packs.map(pack => (
           <div 
             key={pack.id} 
             onClick={() => setSelectedPack(pack.id)}
             className={`p-8 rounded-[48px] border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-80 ${
               selectedPack === pack.id 
                 ? "border-pink-500 bg-pink-50/20  shadow-xl shadow-pink-200 " 
                 : "border-[#E5E7EB]  bg-white  hover:border-pink-200"
             }`}
           >
              {pack.featured && (
                <div className="absolute top-4 right-[-35px] bg-pink-500 text-white px-10 py-1 text-[8px] font-bold uppercase rotate-45">
                   Best Value
                </div>
              )}
              <div className="space-y-4">
                 <div className="text-xs font-bold uppercase tracking-widest opacity-50">{pack.label}</div>
                 <div className="text-2xl font-bold text-[#0F172A] ">
                    {pack.units.toLocaleString("en-US")} <span className="text-sm opacity-50">Units</span>
                 </div>
              </div>
              <div className="pt-6 border-t border-gray-100 ">
                 <div className="text-2xl font-bold text-pink-500">৳ {pack.price}</div>
                 <div className="text-[10px] text-gray-400 font-medium">Billed via bKash/Nagad</div>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-white border border-slate-100 p-12 rounded-[64px] shadow-2xl space-y-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5">
         <div className="space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight">Confirm Your Top-up</h3>
            <p className="text-gray-400 text-sm max-w-md">
               Secure checkout via bKash. Credits will be instantly credited to your **AI Workspace** vault.
            </p>
            <div className="flex items-center gap-6 pt-4">
               <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span className="text-[10px] font-bold uppercase text-white/50">SSL Secured</span>
               </div>
               <div className="flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase text-white/50">Instant Sync</span>
               </div>
            </div>
         </div>
         <button className="w-full md:w-auto px-12 py-5 bg-pink-600 text-white font-bold rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-pink-500/20 flex items-center justify-center gap-4">
            Pay with bKash <ArrowRight className="w-5 h-5" />
         </button>
      </div>

      {/* Transaction History Mock */}
      <div className="space-y-6">
         <h3 className="text-xl font-bold flex items-center gap-3">
            <Activity className="w-5 h-5 text-gray-400" /> Transaction Ledger
         </h3>
         <div className="overflow-hidden border border-[#E5E7EB]  rounded-[32px] bg-white ">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-[#F8F9FA]  text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                     <th className="px-8 py-5">TxID</th>
                     <th className="px-8 py-5">Date</th>
                     <th className="px-8 py-5">Units</th>
                     <th className="px-8 py-5">Amount</th>
                     <th className="px-8 py-5 text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="text-xs font-bold text-[#0F172A]  divide-y divide-gray-50 ">
                  <tr>
                     <td className="px-8 py-5">TRX-77421</td>
                     <td className="px-8 py-5">Apr 12, 2026</td>
                     <td className="px-8 py-5">+5,000</td>
                     <td className="px-8 py-5">৳ 2,000.00</td>
                     <td className="px-8 py-5 text-right text-green-500">SUCCESS</td>
                  </tr>
                  <tr>
                     <td className="px-8 py-5">TRX-77189</td>
                     <td className="px-8 py-5">Apr 08, 2026</td>
                     <td className="px-8 py-5">+1,000</td>
                     <td className="px-8 py-5">৳ 500.00</td>
                     <td className="px-8 py-5 text-right text-green-500">SUCCESS</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

