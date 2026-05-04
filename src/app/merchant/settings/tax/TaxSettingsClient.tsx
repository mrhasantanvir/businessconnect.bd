"use client";

import React, { useState } from "react";
import { ShieldCheck, Save, RefreshCw, AlertTriangle, CheckCircle2, Globe } from "lucide-react";
import { updateTaxSettingsAction } from "./actions";

export function TaxSettingsClient({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    isVatEnabled: initialData.isVatEnabled,
    vatRate: initialData.vatRate,
    binNumber: initialData.binNumber || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateTaxSettingsAction(formData);
      alert("Tax Configuration Synchronized with NBR Standards!");
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Global Toggle */}
      <div className={`p-10 rounded-[48px] border transition-all ${
        formData.isVatEnabled 
          ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl' 
          : 'bg-white border-slate-100 text-slate-900 shadow-sm'
      }`}>
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg ${
                 formData.isVatEnabled ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'
               }`}>
                  <Globe className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Global VAT Activation</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
                    formData.isVatEnabled ? 'text-indigo-100' : 'text-slate-400'
                  }`}>
                    Toggle VAT/Tax across all storefronts and POS terminals
                  </p>
               </div>
            </div>
            <button 
              onClick={() => setFormData({...formData, isVatEnabled: !formData.isVatEnabled})}
              className={`w-20 h-10 rounded-full relative transition-all ${
                formData.isVatEnabled ? 'bg-[#BEF264]' : 'bg-slate-200'
              }`}
            >
               <div className={`absolute top-1 w-8 h-8 rounded-full bg-white shadow-sm transition-all ${
                 formData.isVatEnabled ? 'left-11' : 'left-1'
               }`} />
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Rate Config */}
         <div className="bg-white border border-slate-100 rounded-[40px] p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 text-indigo-600">
               <ShieldCheck className="w-5 h-5" />
               <h4 className="text-xs font-black uppercase tracking-widest">VAT Percentage</h4>
            </div>
            <div className="relative">
               <input 
                 type="number"
                 step="0.01"
                 value={formData.vatRate}
                 onChange={(e) => setFormData({...formData, vatRate: parseFloat(e.target.value) || 0})}
                 disabled={!formData.isVatEnabled}
                 className="w-full h-16 px-8 bg-slate-50 border-none rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-indigo-100 transition-all disabled:opacity-50" 
               />
               <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-slate-400">%</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
               Standard NBR rates: Retail (5%), Standard (15%), Export (0%).
            </p>
         </div>

         {/* BIN Config */}
         <div className="bg-white border border-slate-100 rounded-[40px] p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 text-emerald-600">
               <CheckCircle2 className="w-5 h-5" />
               <h4 className="text-xs font-black uppercase tracking-widest">BIN Number</h4>
            </div>
            <input 
              placeholder="e.g. 000123456-0101"
              value={formData.binNumber}
              onChange={(e) => setFormData({...formData, binNumber: e.target.value})}
              disabled={!formData.isVatEnabled}
              className="w-full h-16 px-8 bg-slate-50 border-none rounded-2xl text-lg font-black outline-none focus:ring-2 focus:ring-emerald-100 transition-all disabled:opacity-50" 
            />
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
               Your Business Identification Number will appear on all legal receipts.
            </p>
         </div>
      </div>

      {/* Warning Box */}
      {formData.isVatEnabled && (
         <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-8 flex items-center gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
               <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
               <h5 className="text-[10px] font-black uppercase text-amber-900 tracking-widest mb-1">NBR Compliance Notice</h5>
               <p className="text-[10px] font-bold text-amber-800/60 leading-relaxed max-w-lg">
                  Enabling VAT will automatically calculate and display tax on the storefront checkout, POS receipts, and invoice PDF. Ensure your BIN is correct to avoid legal issues.
               </p>
            </div>
         </div>
      )}

      <button 
        onClick={handleSave}
        disabled={loading}
        className="w-full h-20 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
      >
         {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
         Sync Tax Infrastructure
      </button>

    </div>
  );
}

