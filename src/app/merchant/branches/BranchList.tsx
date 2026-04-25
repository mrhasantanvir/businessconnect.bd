"use client";

import React from "react";
import { MapPin, Phone, User, Trash2, Edit2, Building2, Users, ShoppingBag, Box } from "lucide-react";
import { deleteBranchAction } from "./actions";

export function BranchList({ branches }: { branches: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {branches.length > 0 ? (
        branches.map((branch) => (
          <div key={branch.id} className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 transform translate-x-1/2 -translate-y-1/2 bg-indigo-50 w-32 h-32 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <Building2 className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2">
                   <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100"><Edit2 className="w-4 h-4" /></button>
                   <button 
                     onClick={() => {
                        if (confirm("Delete this branch node? This cannot be undone.")) {
                           deleteBranchAction(branch.id).catch(err => alert(err.message));
                        }
                     }}
                     className="p-2.5 hover:bg-red-50 rounded-xl text-red-200 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">{branch.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-widest leading-none">{branch.address || "No Address Provided"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Manager</p>
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><User className="w-3 h-3" /></div>
                         <span className="text-xs font-black text-slate-700">{branch.manager?.name || "N/A"}</span>
                      </div>
                   </div>
                   <div className="space-y-1 text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact</p>
                      <p className="text-xs font-black text-slate-700">{branch.phone || "N/A"}</p>
                   </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                   <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Users className="w-3.5 h-3.5 text-indigo-500" />
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Staff</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{branch._count.users}</span>
                   </div>
                   <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Orders</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{branch._count.orders}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="md:col-span-2 py-20 text-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
           <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-200" />
           <p className="text-xl font-black text-gray-300 uppercase tracking-tighter">No Active Branches Found</p>
           <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Start by adding your first location on the right</p>
        </div>
      )}
    </div>
  );
}
