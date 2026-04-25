"use client";

import React, { useTransition } from "react";
import { Plus, MapPin, Loader2, Sparkles } from "lucide-react";
import { upsertWarehouseAction } from "../actions";

export function WarehouseForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await upsertWarehouseAction({
          name: formData.get("name") as string,
          location: formData.get("location") as string,
          isDefault: formData.get("isDefault") === "on",
        });
        alert("Warehouse hub successfully synchronized.");
        window.location.reload();
      } catch (err) {
        alert("Integrity error. Hub could not be synchronized.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white  border border-[#E5E7EB]  p-8 rounded-[32px] shadow-sm space-y-6 sticky top-28 animate-in slide-in-from-left-8 duration-700">
      <div className="flex items-center gap-2 mb-2">
         <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
         <h2 className="text-xl font-black text-[#0F172A]  tracking-tight">Hub Registration</h2>
      </div>
      
      <div className="space-y-4">
         <div className="group relative">
           <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-1.5 block ml-1">Location Name</label>
           <input 
             name="name" 
             required 
             placeholder="e.g. Dhaka Terminal Hub" 
             className="w-full bg-[#F8F9FA]  border border-transparent focus:border-indigo-500 rounded-2xl px-5 py-3 text-sm font-medium outline-none transition-all placeholder:text-[#A1A1AA]/50" 
           />
         </div>

         <div className="group relative">
           <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-1.5 block ml-1">Geo-Location / Address</label>
           <div className="relative">
             <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
             <input 
               name="location" 
               placeholder="e.g. Uttara Sector 10, Dhaka" 
               className="w-full bg-[#F8F9FA]  border border-transparent focus:border-indigo-500 rounded-2xl pl-11 pr-5 py-3 text-sm font-medium outline-none transition-all placeholder:text-[#A1A1AA]/50" 
             />
           </div>
         </div>

         <label className="flex items-center gap-3 p-4 bg-indigo-50/50  rounded-2xl cursor-pointer hover:bg-indigo-50 transition-colors group">
            <input type="checkbox" name="isDefault" className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <div className="flex flex-col">
               <span className="text-sm font-bold text-indigo-900 ">Primary Fulfillment Center</span>
               <span className="text-[10px] text-indigo-700/70 font-medium">Orders will be fulfilled from this hub by default.</span>
            </div>
         </label>
      </div>

      <button 
        disabled={isPending}
        type="submit" 
        className="w-full bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100  text-white  font-black py-4 rounded-[18px] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
        {isPending ? "Configuring Hub..." : "Initialize Hub Control"}
      </button>
    </form>
  );
}

