"use client";

import React from "react";
import { ArrowUpRight, ArrowDownLeft, Trash2, Calendar, Building2, Layers } from "lucide-react";
import { deleteLedgerTransactionAction } from "./actions";

export function BranchLedger({ transactions }: { transactions: any[] }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[40px] overflow-hidden shadow-sm">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
         <div>
            <h3 className="text-xl font-semibold text-slate-900 uppercase tracking-tight">Audit Trail</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Detailed history of all branch-level movements</p>
         </div>
         <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">Export Ledger</button>
         </div>
      </div>

      <div className="overflow-x-auto">
         <table className="w-full text-left">
            <thead>
               <tr className="border-b border-gray-50 bg-gray-50/10">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Description</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Branch Node</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {transactions.map((trx) => (
                  <tr key={trx.id} className="group hover:bg-slate-50/50 transition-colors">
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${trx.type === "INCOME" ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {trx.type === "INCOME" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-900 leading-none">{trx.description || "No narrative"}</p>
                              <div className="flex items-center gap-2 mt-1.5 opacity-60">
                                 <Calendar className="w-3 h-3" />
                                 <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(trx.date).toLocaleDateString()}</span>
                              </div>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <Building2 className="w-3.5 h-3.5 text-slate-300" />
                           <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{trx.branch?.name || "Global"}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                           <Layers className="w-3 h-3 text-slate-500" />
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{trx.category.name}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <span className={`text-lg font-black ${trx.type === "INCOME" ? 'text-emerald-600' : 'text-slate-900'}`}>
                           {trx.type === "INCOME" ? "+" : "-"} ৳{trx.amount.toLocaleString("en-US")}
                        </span>
                     </td>
                     <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => {
                             if (confirm("Permanently erase this journal entry?")) {
                                deleteLedgerTransactionAction(trx.id).catch(err => alert(err.message));
                             }
                          }}
                          className="p-2.5 hover:bg-red-50 rounded-xl text-red-200 hover:text-red-500 transition-all"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </td>
                  </tr>
               ))}
               {transactions.length === 0 && (
                  <tr>
                     <td colSpan={5} className="py-20 text-center text-slate-300 font-black uppercase tracking-tighter text-xl opacity-30">No Journal Entries Found</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
