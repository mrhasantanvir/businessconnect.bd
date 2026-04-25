"use client";

import React, { useState, useTransition } from "react";
import { initiateTransferAction } from "../actions";
import { Loader2, Send, Plus, Trash2, ArrowRight } from "lucide-react";

export function TransferForm({ warehouses, products }: { warehouses: any[], products: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<{ productId: string, quantity: number }[]>([
    { productId: "", quantity: 1 }
  ]);

  const addItem = () => setItems([...items, { productId: "", quantity: 1 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, key: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[key] = value;
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await initiateTransferAction({
          fromWarehouseId: formData.get("from") as string,
          toWarehouseId: formData.get("to") as string,
          items: items.filter(i => i.productId !== ""),
          notes: formData.get("notes") as string,
        });
        alert("Logistics movement successfully authorized.");
        window.location.reload();
      } catch (err: any) {
        alert(err.message || "Transfer failed.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white  border border-[#E5E7EB]  p-8 rounded-[32px] shadow-sm space-y-8 animate-in slide-in-from-left-8 duration-700">
      <div className="flex items-center gap-2 mb-2 text-orange-600">
         <Send className="w-5 h-5" />
         <h2 className="text-xl font-black text-[#0F172A]  tracking-tight">Initiate Movement</h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <div className="flex items-center gap-4 bg-gray-50  p-4 rounded-2xl border border-gray-100 ">
            <div className="flex-1 space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Origin</label>
               <select name="from" required className="w-full bg-transparent border-b border-gray-200 py-1 text-sm font-bold outline-none border-none">
                  <option value="">-- From --</option>
                  {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
               </select>
            </div>
            <ArrowRight className="w-4 h-4 text-orange-400 shrink-0" />
            <div className="flex-1 space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Destination</label>
               <select name="to" required className="w-full bg-transparent border-b border-gray-200 py-1 text-sm font-bold outline-none border-none">
                  <option value="">-- To --</option>
                  {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
               </select>
            </div>
         </div>

         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest ml-1">Payload Items</label>
               <button type="button" onClick={addItem} className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add SKU
               </button>
            </div>
            
            <div className="space-y-3">
               {items.map((item, index) => (
                 <div key={index} className="flex items-center gap-3">
                    <select 
                      required 
                      value={item.productId}
                      onChange={(e) => updateItem(index, "productId", e.target.value)}
                      className="flex-1 bg-[#F8F9FA]  border border-transparent focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                    >
                       <option value="">Select Product...</option>
                       {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input 
                      type="number" 
                      required 
                      min="1" 
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                      className="w-20 bg-[#F8F9FA]  border border-transparent focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs font-bold outline-none" 
                    />
                    <button type="button" onClick={() => removeItem(index)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-1">
            <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest ml-1">Logistics Notes</label>
            <textarea name="notes" placeholder="e.g. Stock replenishment for weekend sale..." className="w-full bg-[#F8F9FA]  border border-transparent focus:border-orange-500 rounded-2xl px-5 py-3 text-sm font-medium outline-none h-24 resize-none" />
         </div>
      </div>

      <button 
        disabled={isPending}
        type="submit" 
        className="w-full bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100  text-white  font-black py-4 rounded-[20px] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
        {isPending ? "Routing Logistics..." : "Authorize Movement"}
      </button>
    </form>
  );
}

