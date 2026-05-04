"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, ArrowRight, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIPersonalizedPicks({ products, storeId }: { products: any[], storeId: string }) {
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    // Advanced Logic: 
    // 1. Get history from localStorage
    // 2. Filter products based on category affinity
    // 3. Fallback to top rated/trending
    
    const history = JSON.parse(localStorage.getItem(`history_${storeId}`) || "[]");
    
    let picks: any[] = [];
    if (history.length > 0) {
      const lastCategory = history[history.length - 1].categoryId;
      picks = products.filter(p => p.categoryId === lastCategory).slice(0, 4);
    }
    
    // If not enough history, take random trending ones
    if (picks.length < 4) {
      const extra = products.filter(p => !picks.find(x => x.id === p.id)).slice(0, 4 - picks.length);
      picks = [...picks, ...extra];
    }
    
    setRecommendations(picks);
  }, [products, storeId]);

  if (recommendations.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-8 py-32 space-y-16">
      <div className="flex items-end justify-between border-b border-slate-100 pb-12">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 animate-pulse">
               <Sparkles className="w-3.5 h-3.5" />
               <span className="text-[10px] font-black uppercase tracking-widest">AI Intelligence</span>
            </div>
            <h3 className="text-lg font-semibold tracking-tighter uppercase text-slate-900">
               Suggested <span className="text-indigo-600">For You</span>
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Based on your browsing patterns</p>
         </div>
         <button className="text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center gap-2">
            View All <ArrowRight className="w-4 h-4" />
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
         {recommendations.map((product) => (
           <div key={product.id} className="group relative bg-white rounded-[48px] p-8 border border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              
              <div className="aspect-square bg-slate-50 rounded-[32px] overflow-hidden relative mb-8">
                 <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="space-y-4 relative z-10">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">{product.category?.name || "Premium"}</span>
                    <span className="text-sm font-black text-slate-900">৳{product.price}</span>
                 </div>
                 <h4 className="text-sm font-black uppercase tracking-tight truncate">{product.name}</h4>
                 <button className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                    <ShoppingBag className="w-4 h-4" /> Quick Add
                 </button>
              </div>
           </div>
         ))}
      </div>
    </section>
  );
}
