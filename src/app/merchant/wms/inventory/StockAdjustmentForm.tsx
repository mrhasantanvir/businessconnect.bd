"use client";

import React, { useTransition } from "react";
import { adjustStockAction } from "../actions";
import { Loader2, Zap, AlertTriangle } from "lucide-react";

export function StockAdjustmentForm({ warehouses, products }: { warehouses: any[], products: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await adjustStockAction({
          warehouseId: formData.get("warehouseId") as string,
          productId: formData.get("productId") as string,
          type: formData.get("type") as any,
          quantity: parseInt(formData.get("quantity") as string),
          reason: formData.get("reason") as string,
        });
        alert("Stock ledger successfully updated.");
        window.location.reload();
      } catch (err: any) {
        alert(err.message || "Failed to adjust stock.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white  border border-[#E5E7EB]  p-8 rounded-[32px] shadow-sm space-y-5 animate-in slide-in-from-right-8 duration-700">
      <div className="flex items-center gap-2 mb-2 text-indigo-600">
         <Zap className="w-5 h-5 fill-current" />
         <h2 className="text-xl font-black text-[#0F172A]  tracking-tight">Quick Adjustment</h2>
      </div>

      <div className="space-y-4">
         <div className="space-y-1">
            <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest ml-1">Target Warehouse</label>
            <select name="warehouseId" required className="w-full bg-[#F8F9FA]  border border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm font-medium outline-none transition-all">
               {warehouses.map(wh => (
                 <option key={wh.id} value={wh.id}>{wh.name} {wh.isDefault ? '(Main)' : ''}</option>
               ))}
            </select>
         </div>

         <div className="space-y-1">
            <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest ml-1">Product SKU</label>
            <select name="productId" required className="w-full bg-[#F8F9FA]  border border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm font-medium outline-none transition-all">
               {products.map(p => (
                 <option key={p.id} value={p.id}>{p.name}</option>
               ))}
            </select>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest ml-1">Action Type</label>
               <select name="type" required className="w-full bg-[#F8F9FA]  border border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm font-medium outline-none transition-all">
                  <option value="STOCK_IN">STOCK IN (+)</option>
                  <option value="STOCK_OUT">STOCK OUT (-)</option>
                  <option value="ADJUSTMENT">ADJUSTMENT</option>
                  <option value="DAMAGE">DAMAGE (-)</option>
               </select>
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest ml-1">Quantity</label>
               <input name="quantity" type="number" required min="1" placeholder="0" className="w-full bg-[#F8F9FA]  border border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-[#A1A1AA]/50" />
            </div>
         </div>

         <div className="space-y-1">
            <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest ml-1">Audit Reason / Note</label>
            <textarea name="reason" required placeholder="Describe why this change is occurring..." className="w-full bg-[#F8F9FA]  border border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm font-medium outline-none transition-all h-20 resize-none placeholder:text-[#A1A1AA]/50" />
         </div>
      </div>

      <button 
        disabled={isPending}
        type="submit" 
        className="w-full bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100  text-white  font-black py-4 rounded-[18px] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
        {isPending ? "Syncing Ledger..." : "Commit Stock Change"}
      </button>
    </form>
  );
}

