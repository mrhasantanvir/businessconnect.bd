"use client";

import React, { useState, useEffect } from "react";
import { STOREFRONT_THEMES } from "@/lib/themes";
import { updateStoreThemeAction } from "./actions";
import { cn } from "@/lib/utils";
import { 
  CheckCircle as CheckCircleIcon, 
  Sparkles as ShootingStarIcon, 
  Package as BoxIcon, 
  Eye as EyeIcon, 
  Clock as TimeIcon,
  LayoutGrid as GridIcon
} from "lucide-react";
import { toast } from "sonner";

export function ThemeSelector({ currentTheme }: { currentTheme: string }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState(currentTheme);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = async (id: string) => {
    setLoading(id);
    try {
      const res = await updateStoreThemeAction(id);
      if (res.success) {
        setSelected(id);
        toast.success("Theme Updated Successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update theme");
    } finally {
      setLoading(null);
    }
  };

  if (!mounted) return (
    <div className="h-64 flex items-center justify-center">
       <TimeIcon className="w-8 h-8 animate-spin text-brand-500" />
    </div>
  );

  return (
    <div className="space-y-12 pb-20 font-outfit">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {STOREFRONT_THEMES.map((theme) => {
          const isActive = selected === theme.id;
          return (
            <div 
              key={theme.id}
              className={cn(
                "group relative bg-white border rounded-3xl overflow-hidden transition-all duration-500",
                isActive ? "border-brand-500 ring-4 ring-brand-500/10 shadow-xl" : "border-gray-100 shadow-sm"
              )}
            >
              <div className="aspect-[4/5] bg-gray-50 relative overflow-hidden flex items-center justify-center">
                <GridIcon className="w-12 h-12 text-gray-200" />
                
                {theme.isPremium && (
                  <div className="absolute top-6 right-6 px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm z-20">
                    <ShootingStarIcon className="w-3 h-3" /> Premium
                  </div>
                )}
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">{theme.category}</span>
                  {isActive && <CheckCircleIcon className="w-6 h-6 text-brand-500" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 uppercase">{theme.name}</h3>
                <p className="text-[11px] font-medium text-gray-400 uppercase leading-relaxed line-clamp-2">
                  {theme.description}
                </p>

                {/* Mobile & Desktop Action Buttons */}
                <div className="flex flex-col gap-3 pt-4">
                  {!isActive && (
                    <button 
                      onClick={() => handleSelect(theme.id)}
                      disabled={loading !== null}
                      className="w-full py-4 bg-brand-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-md shadow-brand-500/20"
                    >
                      {loading === theme.id ? <TimeIcon className="w-4 h-4 animate-spin" /> : <BoxIcon className="w-4 h-4" />}
                      {theme.isPremium ? "Activate Premium" : "Activate Theme"}
                    </button>
                  )}
                  <button className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-all border border-gray-100">
                    <EyeIcon className="w-4 h-4" /> Preview Demo
                  </button>
                </div>
              </div>

              {isActive && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-brand-500 text-white rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg">
                  Active
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

