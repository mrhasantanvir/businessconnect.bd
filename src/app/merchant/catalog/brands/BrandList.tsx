"use client";

import React from "react";
import { MoreVertical, Trash2, Edit2, Globe, ExternalLink, Box, BadgeCheck, Shield } from "lucide-react";
import { deleteBrandAction } from "./actions";

export function BrandList({ brands }: { brands: any[] }) {
  return (
    <div className="space-y-4">
      {brands.length > 0 ? (
        brands.map((brand) => (
          <div key={brand.id} className="group bg-white border border-[#F1F5F9] hover:border-blue-200 rounded-3xl p-6 transition-all shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden flex items-center justify-center relative shadow-inner">
                   {brand.logo ? (
                     <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain p-2" />
                   ) : (
                     <Globe className="w-8 h-8 text-gray-200" />
                   )}
                </div>
                <div>
                   <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-[#0F172A]">{brand.name}</h3>
                      {brand.isFeatured && (
                        <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50" />
                      )}
                   </div>
                   <div className="flex items-center gap-3 mt-1">
                      <div className="text-[10px] font-bold text-gray-400 font-mono">/brand/{brand.slug}</div>
                      {brand.website && (
                        <a 
                          href={brand.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] font-extrabold text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-widest"
                        >
                           <ExternalLink className="w-2.5 h-2.5" /> Visit Site
                        </a>
                      )}
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="text-right pr-4 border-r border-gray-100 hidden md:block">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Catalog Grip</p>
                    <p className="text-lg font-black text-[#0F172A] mt-1 flex items-center gap-2 justify-end">
                       <Box className="w-4 h-4 text-blue-500" /> {brand._count.products}
                    </p>
                 </div>
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 group/btn">
                       <Edit2 className="w-4 h-4 group-hover/btn:text-blue-600 transition-colors" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Excommunicate ${brand.name} from the vault?`)) {
                           deleteBrandAction(brand.id).catch(err => alert(err.message));
                        }
                      }}
                      className="p-3 hover:bg-red-50 rounded-2xl text-gray-300 group/del"
                    >
                       <Trash2 className="w-4 h-4 group-hover/del:text-red-500 transition-colors" />
                    </button>
                 </div>
              </div>
            </div>
            
            {brand.description && (
              <p className="text-sm text-gray-500 mt-4 pl-[84px] leading-relaxed line-clamp-1">
                 "{brand.description}"
              </p>
            )}
          </div>
        ))
      ) : (
        <div className="p-24 text-center space-y-4 opacity-30">
           <Shield className="w-20 h-20 mx-auto mb-4 stroke-[1px]" />
           <p className="font-black text-2xl uppercase tracking-widest">Brand Vault Empty</p>
           <p className="text-sm font-medium">Registers brands on the right to start cataloging.</p>
        </div>
      )}
    </div>
  );
}

