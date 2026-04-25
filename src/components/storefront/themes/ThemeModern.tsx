"use client";

import React from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";

export function ThemeModern({ store, brandColor }: { store: any, brandColor: string }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <header className="h-20 border-b flex items-center justify-between px-8">
         <h1 className="text-xl font-black uppercase tracking-tight">{store.name}</h1>
         <div className="flex items-center gap-6">
            <button className="text-sm font-bold uppercase tracking-widest">Shop</button>
            <button className="p-3 bg-slate-900 text-white rounded-full"><ShoppingBag className="w-5 h-5" /></button>
         </div>
      </header>

      <section className="py-20 px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
         <div className="space-y-8">
            <h2 className="text-7xl font-black tracking-tighter uppercase leading-none">Simple. <br /> <span className="text-indigo-600">Elegant.</span></h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">Upgrade your lifestyle with our curated collection of essential products.</p>
            <button className="px-10 py-5 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-4">
               Start Shopping <ArrowRight className="w-5 h-5" />
            </button>
         </div>
         <div className="aspect-square bg-slate-100 rounded-[40px] overflow-hidden">
            <img src={store.products?.[0]?.images?.[0]} className="w-full h-full object-cover" />
         </div>
      </section>

      <section className="py-20 px-8 max-w-7xl mx-auto">
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {store.products?.map((p: any) => (
              <div key={p.id} className="space-y-4">
                 <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden border">
                    <img src={p.images?.[0]} className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-widest">{p.name}</h4>
                    <p className="text-sm font-black text-indigo-600 mt-1">৳{p.price}</p>
                 </div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}
