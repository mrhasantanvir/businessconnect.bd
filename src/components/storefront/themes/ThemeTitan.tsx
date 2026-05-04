"use client";

import React from "react";
import { 
  Cpu, 
  Zap, 
  Shield, 
  Gamepad2, 
  Smartphone, 
  Headphones, 
  BatteryCharging,
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeTitan({ store, brandColor }: { store: any, brandColor: string }) {
  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. Tech Header */}
      <header className="fixed top-0 w-full z-[100] bg-black/60 backdrop-blur-2xl border-b border-white/5">
         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                  <Cpu className="w-6 h-6" />
               </div>
               <h1 className="text-xl font-black tracking-tighter uppercase">{store.name}</h1>
            </div>

            <nav className="hidden md:flex items-center gap-8">
               {["Components", "Gaming", "Mobile", "Support"].map(link => (
                 <a key={link} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400 transition-colors">{link}</a>
               ))}
            </nav>

            <div className="flex items-center gap-4">
               <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                  <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">System Online</span>
               </div>
            </div>
         </div>
      </header>

      {/* 2. Cyberpunk Hero */}
      <section className="pt-32 px-6">
         <div className="max-w-7xl mx-auto rounded-[48px] bg-gradient-to-br from-slate-900 to-black p-12 lg:p-24 relative overflow-hidden border border-white/5 group shadow-2xl">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
               <div className="space-y-10">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                     <Zap className="w-4 h-4 text-cyan-400" />
                     <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Next-Gen Technology</span>
                  </div>
                  <h2 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
                     Power <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Unleashed</span>
                  </h2>
                  <p className="text-lg text-slate-400 max-w-md leading-relaxed font-medium">
                     Experience the pinnacle of electronic engineering. Our 2026 lineup is designed for creators, gamers, and visionaries.
                  </p>
                  <div className="flex flex-wrap gap-6">
                     <button className="px-10 py-5 bg-cyan-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 hover:scale-105 transition-all shadow-xl shadow-cyan-500/20 flex items-center gap-4">
                        View Hardware <ArrowRight className="w-5 h-5" />
                     </button>
                     <div className="flex items-center gap-4 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Top Rated 2026</span>
                     </div>
                  </div>
               </div>

               <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full scale-75 group-hover:scale-110 transition-transform duration-[3s]" />
                  <img 
                     src={store.products?.[0]?.images?.[0] || "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80"} 
                     className="w-full h-auto object-contain relative z-10 drop-shadow-[0_35px_35px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform duration-[2s]" 
                     alt="Titan Pro"
                  />
               </div>
            </div>
         </div>
      </section>

      {/* 3. Specs & Category Grid */}
      <section className="max-w-7xl mx-auto px-6 py-32">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
               { icon: Smartphone, label: "Mobile Tech", count: "12+ Items" },
               { icon: Gamepad2, label: "Gaming Rig", count: "8+ Items" },
               { icon: Headphones, label: "Audio Gear", count: "15+ Items" },
               { icon: BatteryCharging, label: "Power & Acc", count: "20+ Items" }
            ].map((cat, i) => (
              <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-[32px] hover:bg-white/10 hover:border-cyan-500/30 transition-all group cursor-pointer">
                 <cat.icon className="w-8 h-8 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
                 <h4 className="text-sm font-black uppercase tracking-widest">{cat.label}</h4>
                 <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">{cat.count}</p>
              </div>
            ))}
         </div>
      </section>

      {/* 4. Product Matrix (SEO Focus) */}
      <section className="max-w-7xl mx-auto px-6 pb-32 space-y-20">
         <div className="flex items-end justify-between border-b border-white/5 pb-12">
            <div>
               <h3 className="text-4xl font-black uppercase tracking-tighter">Engineered <span className="text-cyan-400">Superiority</span></h3>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Latest technical arrivals</p>
            </div>
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 border-b-2 border-cyan-500 pb-2">Full Inventory</button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {store.products?.map((product: any) => (
              <div key={product.id} className="group bg-[#0A0D14] border border-white/5 rounded-[40px] overflow-hidden hover:border-cyan-500/50 transition-all shadow-sm hover:shadow-cyan-500/5">
                 <div className="aspect-video bg-black/40 relative flex items-center justify-center p-10 overflow-hidden">
                    <img src={product.images?.[0]} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] to-transparent opacity-60" />
                 </div>
                 <div className="p-10 space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-cyan-500/20">Tech Specs</span>
                       <span className="text-lg font-black text-white">৳{product.price}</span>
                    </div>
                    <h4 className="text-xl font-black uppercase tracking-tight">{product.name}</h4>
                    
                    <div className="space-y-3 pt-4 border-t border-white/5">
                       <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <span>Performance</span>
                          <span className="text-cyan-400">High Speed</span>
                       </div>
                       <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <span>Warranty</span>
                          <span className="text-cyan-400">2 Years</span>
                       </div>
                    </div>

                    <button className="w-full py-5 bg-white/5 hover:bg-cyan-500 hover:text-black border border-white/10 hover:border-cyan-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                       Initialize Checkout
                    </button>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* 5. Support Feature */}
      <section className="px-6 pb-32">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
               { icon: Shield, title: "Secure Protocol", desc: "Military-grade encryption for all transactions." },
               { icon: Zap, title: "Instant Sync", desc: "Real-time inventory and delivery tracking." },
               { icon: Headphones, label: "24/7 Expert Support", desc: "Direct access to our hardware engineers." }
            ].map((f, i) => (
              <div key={i} className="p-10 bg-white/5 border border-white/5 rounded-[40px] space-y-6">
                 <f.icon className="w-10 h-10 text-cyan-400" />
                 <h5 className="text-lg font-black uppercase tracking-tight">{f.title || f.label}</h5>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 text-slate-500">
            <div className="flex items-center gap-3">
               <Cpu className="w-6 h-6 text-cyan-500" />
               <h2 className="text-xl font-black text-white uppercase tracking-tighter">{store.name}</h2>
            </div>
            <div className="flex items-center gap-10">
               {["Protocols", "Compliance", "Architecture"].map(l => (
                 <span key={l} className="text-[10px] font-black uppercase tracking-widest hover:text-cyan-400 transition-colors cursor-pointer">{l}</span>
               ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest">© 2026 Titanium-OS Powered</p>
         </div>
      </footer>

    </div>
  );
}
