"use client";

import React, { useState } from "react";
import { 
  Globe, 
  Palette, 
  Type, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Hash
} from "lucide-react";
import { updateStorefrontSettingsAction } from "./actions";
import { STOREFRONT_THEMES } from "@/lib/themes";

export function BrandingForm({ store }: { store: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: store.name || "",
    address: store.address || "",
    phone: store.phone || "",
    description: store.description || "",
    customDomain: store.customDomain || "",
    brandColor: store.brandColor || "#1E40AF",
    welcomeMessage: store.welcomeMessage || "",
    selectedTheme: store.selectedTheme || "THEME_1"
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateStorefrontSettingsAction(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      
      {/* 1. Core Shop Information */}
      <div className="bg-white  border border-[#E5E7EB]  rounded-[48px] p-10 space-y-8 shadow-sm">
         <div className="flex items-center gap-4 border-b border-gray-100  pb-6">
            <div className="w-10 h-10 bg-blue-50  rounded-xl flex items-center justify-center text-blue-600">
               <Hash className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-lg font-semibold uppercase tracking-tight">Core Business Identity</h3>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Official shop name and contact details</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">Public Shop Name</label>
               <input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. GadgetGear Bangladesh" 
                  className="w-full px-8 py-4 bg-gray-50  border border-gray-100  rounded-[24px] text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
               />
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">Official Contact Number</label>
               <input 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="e.g. +880 1700-000000" 
                  className="w-full px-8 py-4 bg-gray-50  border border-gray-100  rounded-[24px] text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
               />
            </div>
         </div>

         <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">Shop Physical Address</label>
            <textarea 
               value={formData.address}
               onChange={(e) => setFormData({...formData, address: e.target.value})}
               placeholder="e.g. Level 4, Bashundhara City Shopping Mall, Dhaka" 
               className="w-full px-8 py-4 bg-gray-50  border border-gray-100  rounded-[24px] text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all min-h-[100px] resize-none"
            />
         </div>

         <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">Short Business Description</label>
            <textarea 
               value={formData.description}
               onChange={(e) => setFormData({...formData, description: e.target.value})}
               placeholder="Tell your customers who you are..." 
               className="w-full px-8 py-4 bg-gray-50  border border-gray-100  rounded-[24px] text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all min-h-[80px] resize-none"
            />
         </div>
      </div>

      {/* 2. Identity & Domain Card */}
      <div className="bg-white  border border-[#E5E7EB]  rounded-[48px] p-10 space-y-8 shadow-sm">
         <div className="flex items-center gap-4 border-b border-gray-100  pb-6">
            <div className="w-10 h-10 bg-indigo-50  rounded-xl flex items-center justify-center text-indigo-600">
               <Globe className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-lg font-semibold uppercase tracking-tight">Identity & Connectivity</h3>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Map your store to the digital world</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">Store Slug (Internal)</label>
               <div className="px-6 py-4 bg-gray-50  border border-gray-100  rounded-[24px] text-xs font-bold text-gray-400">
                  businessconnect.bd/s/{store.slug}
               </div>
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">Custom Root Domain</label>
               <div className="relative">
                  <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    value={formData.customDomain}
                    onChange={(e) => setFormData({...formData, customDomain: e.target.value})}
                    placeholder="e.g. fashiongrid.com" 
                    className="w-full pl-14 pr-8 py-4 bg-gray-50  border border-gray-100  rounded-[24px] text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
               </div>
            </div>
         </div>
      </div>

      {/* 3. Visual Style Card */}
      <div className="bg-white  border border-[#E5E7EB]  rounded-[48px] p-10 space-y-8 shadow-sm">
         <div className="flex items-center gap-4 border-b border-gray-100  pb-6">
            <div className="w-10 h-10 bg-orange-50  rounded-xl flex items-center justify-center text-orange-500">
               <Palette className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-lg font-semibold uppercase tracking-tight">Brand Atmosphere</h3>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Colors and theme configurations</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">Primary Brand Color</label>
               <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                     <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input 
                       value={formData.brandColor}
                       onChange={(e) => setFormData({...formData, brandColor: e.target.value})}
                       placeholder="#1E40AF" 
                       className="w-full pl-14 pr-8 py-4 bg-gray-50  border border-gray-100  rounded-[24px] text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                     />
                  </div>
                  <div 
                    style={{ backgroundColor: formData.brandColor }} 
                    className="w-14 h-14 rounded-[20px] shadow-xl border-4 border-white  shrink-0" 
                  />
               </div>
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">Selected Theme</label>
               <select 
                 value={formData.selectedTheme}
                 onChange={(e) => setFormData({...formData, selectedTheme: e.target.value})}
                 className="w-full px-8 py-4 bg-gray-50  border border-gray-100  rounded-[24px] text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all appearance-none"
               >
                  {STOREFRONT_THEMES.map(theme => (
                     <option key={theme.id} value={theme.id}>{theme.name} ({theme.category})</option>
                  ))}
               </select>
            </div>
         </div>

         <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">Announcement / Welcome Message</label>
            <input 
              value={formData.welcomeMessage}
              onChange={(e) => setFormData({...formData, welcomeMessage: e.target.value})}
              placeholder="e.g. Free shipping on your first order over ৳500!" 
              className="w-full px-8 py-5 bg-gray-50  border border-gray-100  rounded-[32px] text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-inner"
            />
         </div>
      </div>

      {/* 3. Action Footer */}
      <div className="flex items-center justify-between p-6 bg-[#F8F9FA]  rounded-[40px] border border-gray-100 ">
         <div className="flex items-center gap-3">
            {success && (
              <div className="flex items-center gap-2 text-green-600 animate-in slide-in-from-left-2">
                 <CheckCircle2 className="w-5 h-5" />
                 <span className="text-[10px] font-black uppercase">Settings Propagated!</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-red-600">
                 <AlertCircle className="w-5 h-5" />
                 <span className="text-[10px] font-black uppercase">{error}</span>
              </div>
            )}
         </div>
         <button 
           type="submit" 
           disabled={loading}
           className="px-12 py-5 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:bg-gray-400 flex items-center gap-2"
         >
            {loading ? "Propagating..." : <><Save className="w-4 h-4" /> Save Configuration</>}
         </button>
      </div>

    </form>
  );
}

