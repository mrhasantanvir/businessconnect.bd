"use client";

import React from "react";
import { 
  Leaf, 
  ShoppingBasket, 
  MapPin, 
  Clock, 
  ChevronRight, 
  TrendingUp, 
  Zap,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeOrganic({ store, brandColor }: { store: any, brandColor: string }) {
  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#2D3A2D] font-serif selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. Natural Header */}
      <header className="fixed top-0 w-full z-[100] bg-white/60 backdrop-blur-md border-b border-emerald-50">
         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <Leaf className="w-6 h-6" />
               </div>
               <h1 className="text-xl font-black tracking-tight text-emerald-900">{store.name}</h1>
            </div>

            <nav className="hidden md:flex items-center gap-10">
               {["Our Farm", "Categories", "Subscription", "Offers"].map(link => (
                 <a key={link} href="#" className="text-xs font-black uppercase tracking-widest hover:text-emerald-600 transition-colors">{link}</a>
               ))}
            </nav>

            <div className="flex items-center gap-4">
               <button className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl hover:bg-emerald-100 transition-all">
                  <ShoppingBasket className="w-6 h-6" />
               </button>
            </div>
         </div>
      </header>

      {/* 2. Natural Hero */}
      <section className="pt-32 px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-[64px] p-12 lg:p-20 shadow-sm border border-emerald-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 w-64 h-64 rounded-full blur-3xl" />
            
            <div className="space-y-8 relative z-10">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Fresh From the Root</span>
               </div>
               <h2 className="text-6xl lg:text-8xl font-black leading-tight tracking-tight text-emerald-950">
                  Organic <br /> <span className="italic text-emerald-600">Nutrition</span> <br /> For Life
               </h2>
               <p className="text-lg text-emerald-800/60 max-w-md leading-relaxed">
                  We bridge the gap between farmers and your table. 100% Pesticide-free, hand-picked daily.
               </p>
               <div className="flex flex-wrap gap-4 pt-4">
                  <button className="px-10 py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-200 hover:scale-105 transition-all flex items-center gap-4">
                     Browse Harvest <ArrowRight className="w-5 h-5" />
                  </button>
                  <button className="px-10 py-5 border-2 border-emerald-100 text-emerald-700 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all">
                     Our Story
                  </button>
               </div>
            </div>

            <div className="relative group">
               <div className="absolute inset-0 bg-emerald-600/5 rounded-[64px] scale-95 group-hover:scale-105 transition-transform duration-1000" />
               <img 
                  src={store.products?.[1]?.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80"} 
                  className="w-full aspect-square object-cover rounded-[64px] shadow-2xl relative z-10" 
                  alt="Organic Fresh"
               />
               <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[40px] shadow-2xl space-y-4 border border-emerald-50 z-20 animate-bounce">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 leading-none">Express Delivery</p>
                        <p className="text-sm font-black text-slate-900 mt-1 uppercase">Under 30 Mins</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 3. Product Grid (Natural Aesthetic) */}
      <section className="max-w-7xl mx-auto px-6 py-32 space-y-20">
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-4xl font-black text-emerald-950 tracking-tight">Today's <span className="italic text-emerald-600">Fresh</span> Pick</h3>
               <p className="text-xs font-bold text-emerald-800/40 uppercase tracking-widest mt-2">Supplied by local artisan farmers</p>
            </div>
            <button className="text-xs font-black uppercase tracking-widest text-emerald-600 border-b-2 border-emerald-100 pb-2 hover:border-emerald-600 transition-all">View All Products</button>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {store.products?.map((product: any) => (
              <div key={product.id} className="group space-y-6">
                 <div className="aspect-square bg-white rounded-[48px] overflow-hidden p-6 border border-emerald-50 shadow-sm hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500 relative">
                    <img src={product.images?.[0]} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    <button className="absolute top-6 right-6 w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                       <ShoppingBasket className="w-6 h-6" />
                    </button>
                 </div>
                 <div className="text-center space-y-2">
                    <h4 className="text-lg font-black text-emerald-950 uppercase italic leading-none">{product.name}</h4>
                    <p className="text-xs font-bold text-emerald-800/40 uppercase tracking-widest">৳{product.price} / KG</p>
                    <div className="pt-4">
                       <button className="px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">Add To Basket</button>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* 4. Farmers Corner */}
      <section className="bg-emerald-950 py-32 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10" />
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10 relative z-10">
               <h2 className="text-5xl lg:text-7xl font-black italic tracking-tighter leading-none">
                  Supporting Our <br /> <span className="text-emerald-400">Local Heroes</span>
               </h2>
               <p className="text-lg text-emerald-200/60 leading-relaxed max-w-lg">
                  Every purchase you make directly supports over 50+ local families in Rajshahi and Jessore. We take 0% commission from farmers.
               </p>
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <p className="text-4xl font-black text-[#BEF264]">50+</p>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Local Farms</p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-4xl font-black text-[#BEF264]">100%</p>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Plastic Free</p>
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-6 relative z-10">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className={cn("aspect-square rounded-[40px] overflow-hidden", i % 2 === 0 ? "translate-y-12" : "")}>
                    <img src={`https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200`} className="w-full h-full object-cover" />
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-emerald-50">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-3">
               <Leaf className="w-6 h-6 text-emerald-600" />
               <h2 className="text-xl font-black text-emerald-950 uppercase italic">{store.name}</h2>
            </div>
            <p className="text-xs font-bold text-emerald-800/40 uppercase tracking-widest text-center">
               © 2026 {store.name}. Sustainable Commerce Engine.
            </p>
            <div className="flex items-center gap-8">
               {["Terms", "Policy", "BIN: 12345678"].map(link => (
                 <span key={link} className="text-[10px] font-black uppercase tracking-widest text-emerald-800/60">{link}</span>
               ))}
            </div>
         </div>
      </footer>

    </div>
  );
}
