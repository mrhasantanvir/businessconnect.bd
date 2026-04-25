"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getStoreCategoriesAction, getStoreBrandsAction } from "../actions";
import ProductWizard from "@/components/merchant/catalog/ProductWizard";

export default function AddProductPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, brnds] = await Promise.all([
          getStoreCategoriesAction(),
          getStoreBrandsAction()
        ]);
        setCategories(cats);
        setBrands(brnds);
      } catch (err) {
        console.error("Failed to load catalog data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FA] ">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-blue/20 border-t-primary-blue rounded-full animate-spin" />
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Initializing Launchpad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA]  relative overflow-hidden flex flex-col items-center py-12 px-4 md:px-8">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-blue/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Link 
              href="/merchant/catalog" 
              className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Back to Catalog
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter mb-2">
              Add New <span className="text-primary-blue">Product</span>
            </h1>
            <p className="text-muted-foreground font-medium text-sm md:text-base">
              Configure your product for the global market with AI-driven optimizations.
            </p>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-3xl bg-white  border border-surface-border shadow-sm">
             <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-500" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Active Store</p>
                <p className="text-sm font-bold text-foreground">GadgetGear BD</p>
             </div>
          </div>
        </div>

        {/* Wizard Component */}
        <ProductWizard categories={categories} brands={brands} />

        {/* Footer Info */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
           <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
             © 2026 BusinessConnect.bd — Advanced Commerce OS
           </p>
           <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Systems Nominal
              </span>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> AI Engine Ready
              </span>
           </div>
        </div>

      </div>
    </div>
  );
}
