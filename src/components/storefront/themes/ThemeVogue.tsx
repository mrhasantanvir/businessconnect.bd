"use client";

import React, { useState } from "react";
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  ArrowRight, 
  Star, 
  Heart, 
  ChevronRight,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeVogue({ store, brandColor }: { store: any, brandColor: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 1. Ultra-Thin Header */}
      <header className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100">
         <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-8">
               <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                  <Menu className="w-6 h-6" />
               </button>
               <nav className="hidden lg:flex items-center gap-6">
                  {["New Arrivals", "Collections", "Editorial"].map(item => (
                    <a key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors">
                       {item}
                    </a>
                  ))}
               </nav>
            </div>

            <h1 className="text-2xl font-black tracking-tighter uppercase translate-x-[-50%] absolute left-1/2">
               {store.name}
            </h1>

            <div className="flex items-center gap-4">
               <button className="p-2 hover:bg-slate-50 rounded-full transition-all"><Search className="w-5 h-5" /></button>
               <button className="p-2 hover:bg-slate-50 rounded-full transition-all relative">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-4 h-4 bg-indigo-600 text-white text-[8px] font-black flex items-center justify-center rounded-full">0</span>
               </button>
            </div>
         </div>
      </header>

      {/* 2. Hero Editorial */}
      <section className="pt-20">
         <div className="h-[90vh] relative overflow-hidden group">
            <img 
               src={store.products?.[0]?.images?.[0] || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80"} 
               className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[3s]" 
               alt="Hero"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/90" />
            
            <div className="absolute bottom-20 left-0 w-full px-8 lg:px-20 space-y-6">
               <div className="inline-flex items-center gap-4 mb-4">
                  <div className="w-12 h-px bg-slate-900" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">SS/2026 Collection</span>
               </div>
               <h2 className="text-6xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.85]">
                  Modern <br /> <span className="text-indigo-600">Aesthetics</span>
               </h2>
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-10">
                  <p className="max-w-md text-sm font-bold text-slate-500 uppercase leading-relaxed tracking-wider">
                     Redefining the boundaries of contemporary fashion with sustainable materials and timeless silhouettes.
                  </p>
                  <button className="px-12 py-6 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-indigo-600 transition-all shadow-2xl">
                     Explore Shop <ArrowRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* 3. Product Grid (SEO Optimized) */}
      <section className="max-w-[1600px] mx-auto px-8 py-32 space-y-20">
         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-100 pb-12">
            <div>
               <h3 className="text-4xl font-black tracking-tighter uppercase">Curated <span className="text-indigo-600">Essentials</span></h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Hand-picked by our editorial team</p>
            </div>
            <div className="flex items-center gap-8">
               {["All", "Apparel", "Accessories", "Footwear"].map(cat => (
                 <button key={cat} className="text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors border-b-2 border-transparent hover:border-indigo-600 pb-2">
                    {cat}
                 </button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {store.products?.map((product: any, i: number) => (
              <div key={product.id} className="group space-y-6">
                 <div className="aspect-[3/4] bg-slate-50 rounded-3xl overflow-hidden relative shadow-sm hover:shadow-2xl transition-all duration-700">
                    <img 
                       src={product.images?.[0]} 
                       alt={product.name} 
                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute top-6 left-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-[-20px] group-hover:translate-x-0 duration-500">
                       <button className="w-12 h-12 bg-white text-slate-900 text-slate-900 rounded-full flex items-center justify-center shadow-xl hover:bg-indigo-600 hover:text-white transition-all"><Heart className="w-5 h-5" /></button>
                       <button className="w-12 h-12 bg-white text-slate-900 text-slate-900 rounded-full flex items-center justify-center shadow-xl hover:bg-indigo-600 hover:text-white transition-all"><Maximize2 className="w-5 h-5" /></button>
                    </div>
                    {i % 3 === 0 && (
                       <div className="absolute bottom-6 right-6 px-4 py-2 bg-indigo-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl">Best Seller</div>
                    )}
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center justify-between">
                       <h4 className="text-sm font-black uppercase tracking-tight truncate flex-1">{product.name}</h4>
                       <span className="text-sm font-black text-indigo-600">৳{product.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <span>{product.category?.name || "New Collection"}</span>
                       <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-slate-900">4.9</span>
                       </div>
                    </div>
                 </div>
                 <button className="w-full py-4 border-2 border-slate-900 text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all">
                    Add to Cart
                 </button>
              </div>
            ))}
         </div>
      </section>

      {/* 4. Editorial Banner */}
      <section className="px-8 lg:px-20 pb-32">
         <div className="bg-white border border-slate-100 rounded-[64px] h-[60vh] relative overflow-hidden flex items-center justify-center text-center p-12">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
            <div className="relative z-10 max-w-2xl space-y-8">
               <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                  Sustainability is <span className="text-indigo-400">Not Optional</span>
               </h2>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                  Join our mission to reduce waste. Every piece in our new collection is made from 100% recycled materials.
               </p>
               <button className="px-10 py-5 bg-[#BEF264] text-green-900 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                  Our Manifesto
               </button>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-20 px-8 lg:px-20 border-t border-slate-100">
         <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            <div className="space-y-6">
               <h2 className="text-xl font-black tracking-tighter uppercase">{store.name}</h2>
               <p className="text-xs font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
                  International Standard Commerce Platform for the next generation of brands.
               </p>
            </div>
            {["Information", "Customer Service", "Newsletter"].map((title, i) => (
              <div key={i} className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">{title}</h5>
                 {i < 2 ? (
                   <ul className="space-y-3">
                      {["About Us", "Contact", "Shipping", "Returns"].map(link => (
                        <li key={link}><a href="#" className="text-xs font-bold text-slate-400 uppercase hover:text-indigo-600 transition-colors">{link}</a></li>
                      ))}
                   </ul>
                 ) : (
                   <div className="space-y-4">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Get 10% off your first order.</p>
                      <div className="flex border-b border-slate-300 pb-2">
                         <input placeholder="EMAIL ADDRESS" className="bg-transparent border-none outline-none text-[10px] font-black w-full" />
                         <button><ChevronRight className="w-4 h-4" /></button>
                      </div>
                   </div>
                 )}
              </div>
            ))}
         </div>
      </footer>

    </div>
  );
}
