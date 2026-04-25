"use client";

import React from "react";
import { 
  ShoppingBag, 
  Search, 
  Grid, 
  List, 
  Filter, 
  ChevronDown,
  Clock,
  ShieldCheck,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeDairy({ store, brandColor }: { store: any, brandColor: string }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. Utility Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[100]">
         <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
               <ShoppingBag className="w-6 h-6 text-indigo-600" />
               {store.name}
            </h1>
            <div className="flex-1 max-w-xl mx-10 hidden md:block">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input placeholder="Search products..." className="w-full pl-12 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
               </div>
            </div>
            <div className="flex items-center gap-4">
               <button className="p-2 text-slate-600 relative">
                  <ShoppingBag className="w-6 h-6" />
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full">0</span>
               </button>
            </div>
         </div>
      </header>

      {/* 2. Compact Grid Section */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-10">
         
         {/* Sidebar Filters */}
         <aside className="hidden lg:block space-y-10">
            <div className="space-y-4">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Categories</h3>
               <div className="space-y-2">
                  {["All Items", "Dairy & Eggs", "Beverages", "Snacks", "Household"].map(c => (
                    <button key={c} className="w-full text-left px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 transition-all flex items-center justify-between">
                       {c} <ChevronDown className="w-3 h-3 opacity-20" />
                    </button>
                  ))}
               </div>
            </div>

            <div className="p-6 bg-indigo-600 rounded-3xl text-white space-y-4">
               <Clock className="w-8 h-8" />
               <h4 className="font-black uppercase tracking-tight text-lg">Fast Delivery</h4>
               <p className="text-xs font-bold text-indigo-100 leading-relaxed">We deliver within 60 minutes in your local area.</p>
            </div>
         </aside>

         {/* Product Matrix */}
         <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex items-center gap-4">
                  <button className="p-2 bg-slate-50 rounded-lg text-indigo-600"><Grid className="w-5 h-5" /></button>
                  <button className="p-2 text-slate-400"><List className="w-5 h-5" /></button>
               </div>
               <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400">
                  <span>Sort by:</span>
                  <select className="bg-transparent border-none outline-none text-slate-900 font-black">
                     <option>Newest</option>
                     <option>Price: Low to High</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
               {store.products?.map((product: any) => (
                 <div key={product.id} className="bg-white rounded-3xl border border-slate-100 p-4 space-y-4 hover:shadow-xl transition-all group">
                    <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden relative">
                       <img src={product.images?.[0]} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="space-y-1">
                       <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] font-black">4.8</span>
                       </div>
                       <h4 className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{product.name}</h4>
                       <p className="text-sm font-black text-indigo-600">৳{product.price}</p>
                    </div>
                    <button className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                       Add to Cart
                    </button>
                 </div>
               ))}
            </div>
         </div>
      </main>

      <footer className="py-20 text-center space-y-6">
         <div className="flex items-center justify-center gap-6">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            <div className="text-left">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Secure</p>
               <h5 className="text-sm font-black uppercase italic">Safe Commerce Engine</h5>
            </div>
         </div>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 {store.name}. All Rights Reserved.</p>
      </footer>

    </div>
  );
}
