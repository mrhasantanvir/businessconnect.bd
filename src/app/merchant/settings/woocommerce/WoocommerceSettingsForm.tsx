"use client";

import React, { useState, useTransition } from "react";
import { saveWcSettingsAction } from "./actions";
import { 
  Globe, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw,
  Layout
} from "lucide-react";

export function WoocommerceSettingsForm({ initialConfig }: { initialConfig: any }) {
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState(initialConfig?.websiteUrl || "");
  const [deductInventory, setDeductInventory] = useState(initialConfig?.deductInventory ?? true);
  const [savedConfig, setSavedConfig] = useState(initialConfig);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveWcSettingsAction({ 
        websiteUrl: url,
        deductInventory: deductInventory
      });
      setSavedConfig(res);
      alert("Settings saved successfully!");
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Connection Card */}
      <div className="bg-white  border border-[#E5E7EB]  rounded-[48px] p-10 space-y-8 shadow-sm">
         <div className="flex items-center gap-4 border-b border-gray-100  pb-6">
            <div className="w-10 h-10 bg-indigo-50  rounded-xl flex items-center justify-center text-indigo-600">
               <Globe className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-lg font-black uppercase tracking-tight">WooCommerce Pipeline</h3>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Connect your external store</p>
            </div>
         </div>

         <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">WooCommerce Website URL</label>
               <div className="relative group">
                  <Layout className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    placeholder="https://yourstore.com" 
                    className="w-full pl-14 pr-8 py-5 bg-gray-50  border border-gray-100  rounded-[32px] text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100  transition-all font-mono"
                  />
               </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50  p-6 rounded-[32px] border border-gray-100  group">
               <div className="flex-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] ">Deduct Inventory on Sync</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1 group-hover:text-indigo-500 transition-colors">If enabled, WooCommerce orders will decrease your local warehouse stock.</p>
               </div>
               <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={deductInventory}
                    onChange={(e) => setDeductInventory(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="relative w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
               </label>
            </div>

            <button 
              disabled={isPending}
              className="px-10 py-5 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:bg-gray-400 flex items-center gap-2"
            >
               {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Establish Connection"}
            </button>
         </form>
      </div>

      {savedConfig && (
        <>
          {/* 2. Webhook & Plugin Card */}
          <div className="bg-indigo-600 rounded-[48px] p-10 text-white space-y-8 shadow-2xl shadow-indigo-200 ">
             <div className="flex items-center gap-4 pb-6 border-b border-white/20">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-lg font-black uppercase tracking-tight italic">Synchronization Key</h3>
                   <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest leading-none mt-1">Authentication for your WordPress site</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-indigo-200 tracking-widest ml-2">Secure Webhook Secret</label>
                   <div className="px-8 py-5 bg-white/10 backdrop-blur-md rounded-[32px] font-mono text-sm break-all flex items-center justify-between border border-white/5">
                      {savedConfig.webhookSecret}
                   </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-indigo-200 tracking-widest ml-2">Integration Method</label>
                    <div className="flex items-center gap-4">
                       <a 
                         href={`/api/merchant/woocommerce/plugin?merchantId=${savedConfig.merchantStoreId}`}
                         className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-white text-indigo-600 rounded-[32px] text-[10px] font-black uppercase hover:scale-[1.02] transition-transform active:scale-95 shadow-xl"
                       >
                          <Download className="w-4 h-4" />
                          Download Plugin (.zip)
                       </a>
                    </div>
                </div>
             </div>

             <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                   <ExternalLink className="w-3 h-3" /> Installation Guide
                </h4>
                <ol className="text-xs space-y-2 text-indigo-100 font-medium">
                   <li>1. Download the custom **BusinessConnect Sync** plugin above.</li>
                   <li>2. Go to your WordPress Admin ➔ **Plugins** ➔ **Add New** ➔ **Upload Plugin**.</li>
                   <li>3. Install and Activate the plugin. It is pre-configured with your secure secret key.</li>
                   <li>4. New orders in WooCommerce will now appear in your BusinessOS dashboard automatically.</li>
                </ol>
             </div>
          </div>
        </>
      )}
    </div>
  );
}

