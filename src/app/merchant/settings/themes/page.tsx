import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ThemeSelector } from "./ThemeSelector";
import { STOREFRONT_THEMES } from "@/lib/themes";
import { Palette as PaletteIcon, Sparkles as ShootingStarIcon } from "lucide-react";

export default async function ThemeSettingsPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const store = await prisma.merchantStore.findUnique({
    where: { id: session.merchantStoreId },
    select: { selectedTheme: true }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-12 font-outfit">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-50 rounded-full">
               <PaletteIcon className="w-3.5 h-3.5 text-brand-500" />
               <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Brand Aesthetics & UI</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tighter text-gray-900 uppercase leading-none">
               Storefront <span className="text-brand-500">Themer</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium max-w-xl tracking-tight leading-relaxed">
               Choose a design architecture that resonates with your brand. Switch between Minimalist, Organic, and High-Fashion layouts.
            </p>
         </div>

         <div className="p-8 bg-white border border-gray-200 rounded-3xl shadow-xl shadow-gray-200/50 relative overflow-hidden group min-w-[300px]">
            <ShootingStarIcon className="absolute right-[-10px] top-[-10px] w-24 h-24 text-brand-500/5 group-hover:scale-125 transition-transform duration-700" />
            <p className="text-[10px] font-bold uppercase text-brand-500 tracking-widest mb-2">Upgrade Status</p>
            <h3 className="text-xl font-bold text-gray-900 leading-none">Pro Merchant</h3>
            <p className="text-[10px] font-medium text-gray-400 mt-2 uppercase">All Premium Themes Unlocked</p>
         </div>
      </div>

      {!STOREFRONT_THEMES || STOREFRONT_THEMES.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
           <p className="text-sm font-bold uppercase text-gray-400">No themes configured in system</p>
        </div>
      ) : (
        <ThemeSelector currentTheme={store?.selectedTheme || "MODERN_MINIMAL"} />
      )}
      
    </div>
  );
}

