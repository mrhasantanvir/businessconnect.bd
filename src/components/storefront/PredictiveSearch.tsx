"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, ArrowUpRight } from "lucide-react";
import { predictiveSearchAction } from "@/app/actions/search";
import { cn } from "@/lib/utils";

export function PredictiveSearch({ storeId }: { storeId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);
    try {
      const data = await predictiveSearchAction(val, storeId);
      setResults(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
         <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <Search className="w-4 h-4" />}
         </div>
         <input 
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder="AI Search: Ask for anything..." 
            className="w-full pl-16 pr-8 py-4 bg-slate-100/50 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200/50 focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all outline-none" 
         />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-white border border-slate-100 rounded-[32px] shadow-2xl p-6 z-[200] animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="space-y-6">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">AI Predictive Results</p>
              
              <div className="space-y-4">
                 {results.map((item) => (
                   <a key={item.id} href={`/p/${item.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-200/50">
                            <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                         </div>
                         <div>
                            <h4 className="text-[11px] font-black uppercase text-slate-900 leading-none">{item.name}</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 tracking-widest">{item.category?.name || "General"}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="text-xs font-black text-indigo-600">৳{item.price}</span>
                         <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-600 transition-colors" />
                      </div>
                   </a>
                 ))}
                 {results.length === 0 && !loading && (
                   <div className="py-10 text-center space-y-2">
                      <p className="text-xs font-bold text-slate-400">"No items found for this query"</p>
                      <p className="text-[9px] font-black uppercase text-indigo-600 tracking-widest">Try searching for 'Mango' or 'Fresh'</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
