"use client";

import React, { useState, useTransition } from "react";
import { upsertCourierConfigAction } from "./actions";
import { Loader2, KeyRound, Server } from "lucide-react";

export function CourierConfigForm({ existingConfigs }: { existingConfigs: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [newCourierName, setNewCourierName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>, pName?: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const providerName = pName || (formData.get("providerName") as string);
    
    if (!providerName) return;

    startTransition(async () => {
      try {
        await upsertCourierConfigAction({
          providerName,
          apiKey: formData.get("apiKey") as string,
          apiSecret: formData.get("apiSecret") as string,
          type: formData.get("type") as string,
          trackingUrlTemplate: formData.get("trackingUrlTemplate") as string,
          isActive: formData.get("isActive") === "on",
        });
        alert(`${providerName} saved successfully.`);
        if (!pName) {
           setShowAddForm(false);
           setNewCourierName("");
        }
      } catch (err) {
        alert("Failed to save credentials.");
      }
    });
  };

  const baseProviders = ["STEADFAST", "REDX", "PATHAO"];
  // Merge existing configs with base providers to ensure all are shown
  const allProviders = Array.from(new Set([...baseProviders, ...existingConfigs.map(c => c.providerName)]));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <h2 className="text-lg font-black uppercase tracking-tight text-gray-400">Manage Couriers</h2>
         <button 
           onClick={() => setShowAddForm(!showAddForm)}
           className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
         >
           + Add Custom Courier
         </button>
      </div>

      {showAddForm && (
        <form onSubmit={(e) => handleSave(e)} className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-[32px] p-8 animate-in zoom-in-95">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600">New Courier Name</label>
                 <input name="providerName" required placeholder="e.g. JONONI" className="w-full bg-white border border-indigo-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Service Type</label>
                 <select name="type" className="w-full bg-white border border-indigo-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm">
                    <option value="API">API (Automated)</option>
                    <option value="MANUAL">MANUAL (Name Only)</option>
                 </select>
              </div>
              <button disabled={isPending} type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase hover:scale-[1.02] transition-all">
                 {isPending ? "Connecting..." : "Add to Pipeline"}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-3 bg-white text-gray-500 rounded-xl text-xs font-black uppercase border border-gray-200">
                 Cancel
              </button>
           </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allProviders.map(provider => (
          <CourierCard 
            key={provider} 
            provider={provider} 
            config={existingConfigs.find(c => c.providerName === provider)}
            isPending={isPending}
            handleSave={handleSave}
          />
        ))}
      </div>
    </div>
  );
}

function CourierCard({ provider, config, isPending, handleSave }: { 
  provider: string, 
  config: any, 
  isPending: boolean, 
  handleSave: any 
}) {
  const [mode, setMode] = useState(config?.type || "API");

  return (
    <form onSubmit={(e) => handleSave(e, provider)} className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50 transition-colors" />
        
        <div className="flex justify-between items-start mb-8 z-10 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50  border border-gray-100 rounded-[18px] flex items-center justify-center">
                  <Server className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-lg tracking-tight uppercase">{provider}</h3>
                <div className="flex gap-2 mt-1">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${mode === 'API' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {mode}
                    </span>
                </div>
              </div>
            </div>
            <label className="flex items-center cursor-pointer group">
              <input type="checkbox" name="isActive" defaultChecked={config ? config.isActive : false} className="sr-only peer" />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
        </div>

        <div className="space-y-6 z-10 relative">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Connection Mode</label>
            <select 
              name="type" 
              defaultValue={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full bg-gray-50 border border-transparent rounded-2xl p-3 text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
            >
                <option value="API">API (Integrated)</option>
                <option value="MANUAL">MANUAL (Tracker Only)</option>
            </select>
          </div>

          {mode === "API" ? (
            <>
              <div className="group relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block flex items-center gap-1">API Key / Merchant ID</label>
                <input name="apiKey" defaultValue={config?.apiKey || ""} placeholder="Enter credentials" className="w-full bg-gray-50 border border-transparent rounded-2xl p-3 text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div className="group relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block flex items-center gap-1">API Secret / Token</label>
                <input name="apiSecret" type="password" defaultValue={config?.apiSecret || ""} placeholder="••••••••••••" className="w-full bg-gray-50 border border-transparent rounded-2xl p-3 text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all" />
              </div>
            </>
          ) : (
            <div className="group relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block flex items-center gap-1">Tracking URL Template (Optional)</label>
              <input name="trackingUrlTemplate" defaultValue={config?.trackingUrlTemplate || ""} placeholder="https://jononi.com/track/{id}" className="w-full bg-gray-50 border border-transparent rounded-2xl p-3 text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all font-mono" />
            </div>
          )}
        </div>

        <div className="mt-8 z-10 relative">
          <button disabled={isPending} type="submit" className="w-full bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl flex justify-center items-center gap-2 transition-all disabled:opacity-50">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Secure Sync"}
          </button>
        </div>
    </form>
  );
}

