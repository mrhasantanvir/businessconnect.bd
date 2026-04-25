"use client";

import React, { useState } from "react";
import { 
  CreditCard, ShieldCheck, Zap, ToggleLeft, 
  Settings2, Key, Info, CheckCircle2, 
  AlertCircle, RefreshCw, Smartphone
} from "lucide-react";
import { savePaymentConfigAction } from "@/app/merchant/settings/payments/actions";
import { toast } from "sonner";

const GATEWAYS = [
  { 
    id: "BKASH", 
    name: "bKash Tokenized", 
    color: "#E2136E", 
    logo: <Smartphone className="w-6 h-6" />,
    fields: ["apiKey", "apiSecret", "publicKey", "privateKey"],
    fieldLabels: {
      apiKey: "Username",
      apiSecret: "Password",
      publicKey: "App Key",
      privateKey: "App Secret"
    }
  },
  { 
    id: "SSLCOMMERZ", 
    name: "SSLCommerz", 
    color: "#005CAB", 
    logo: <ShieldCheck className="w-6 h-6" />,
    fields: ["storeId", "storePass"],
    fieldLabels: {
      storeId: "Store ID",
      storePass: "Store Password"
    }
  },
  { 
    id: "AAMARPAY", 
    name: "AamarPay", 
    color: "#F68B1E", 
    logo: <Zap className="w-6 h-6" />,
    fields: ["storeId", "apiSecret"],
    fieldLabels: {
      storeId: "Store ID",
      apiSecret: "Signature Key"
    }
  },
  { 
    id: "NAGAD", 
    name: "Nagad", 
    color: "#EC1C24", 
    logo: <Smartphone className="w-6 h-6" />,
    fields: ["merchantId", "publicKey", "privateKey"],
    fieldLabels: {
      merchantId: "Merchant ID",
      publicKey: "Nagad Public Key",
      privateKey: "Merchant Private Key"
    }
  },
  { 
    id: "ROCKET", 
    name: "Rocket (DBBL)", 
    color: "#8C3494", 
    logo: <Smartphone className="w-6 h-6" />,
    fields: ["merchantId", "apiSecret"],
    fieldLabels: {
      merchantId: "Merchant ID",
      apiSecret: "API Secret/Password"
    }
  }
];

export default function PaymentConfigClient({ initialConfigs = [] }: { initialConfigs: any[] }) {
  const [configs, setConfigs] = useState(initialConfigs);
  const [selectedGateway, setSelectedGateway] = useState(GATEWAYS[0]);
  const [isSaving, setIsSaving] = useState(false);

  const currentConfig = configs.find(c => c.provider === selectedGateway.id) || {
    provider: selectedGateway.id,
    isTestMode: true,
    isActive: false
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      provider: selectedGateway.id,
      isActive: formData.get("isActive") === "on",
      isTestMode: formData.get("isTestMode") === "on",
      apiKey: formData.get("apiKey")?.toString(),
      apiSecret: formData.get("apiSecret")?.toString(),
      publicKey: formData.get("publicKey")?.toString(),
      privateKey: formData.get("privateKey")?.toString(),
      storeId: formData.get("storeId")?.toString(),
      storePass: formData.get("storePass")?.toString(),
    };

    try {
      const result = await savePaymentConfigAction(data as any);
      if (result.success) {
        toast.success(`${selectedGateway.name} configuration saved!`);
        // Update local state
        setConfigs(prev => {
          const filtered = prev.filter(p => p.provider !== data.provider);
          return [...filtered, { ...data, merchantStoreId: "" }];
        });
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100  pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100">
               <CreditCard className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-[#0F172A]  uppercase tracking-tighter italic">
              Payment <span className="text-indigo-600">Gateways</span>
            </h1>
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">
            Configure secure payment methods for your customers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Gateway Selection Sidebar */}
        <div className="lg:col-span-4 space-y-4">
           <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-6">Select Gateway</h3>
           <div className="space-y-3">
             {GATEWAYS.map((gw) => {
               const isActive = configs.find(c => c.provider === gw.id)?.isActive;
               return (
                 <button
                   key={gw.id}
                   onClick={() => setSelectedGateway(gw)}
                   className={`w-full p-5 rounded-3xl border-2 transition-all flex items-center justify-between group ${
                     selectedGateway.id === gw.id 
                       ? "bg-white border-indigo-600 shadow-xl shadow-indigo-50" 
                       : "bg-gray-50/50 border-transparent hover:border-gray-200"
                   }`}
                 >
                   <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                        style={{ backgroundColor: gw.color }}
                      >
                         {gw.logo}
                      </div>
                      <div className="text-left">
                         <div className="text-sm font-black text-[#0F172A] ">{gw.name}</div>
                         <div className="text-[9px] font-bold text-gray-400 uppercase">Direct Integration</div>
                      </div>
                   </div>
                   {isActive && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                 </button>
               );
             })}
           </div>

           <div className="p-6 bg-indigo-50  rounded-[32px] border border-indigo-100  mt-8">
              <div className="flex gap-3 items-start">
                 <Info className="w-5 h-5 text-indigo-600 shrink-0" />
                 <div>
                    <h4 className="text-xs font-black text-indigo-900 uppercase mb-1">Global Security</h4>
                    <p className="text-[10px] text-indigo-700/70 font-medium leading-relaxed">
                      All credentials are encrypted at rest. We never store raw keys in readable format.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Configuration Form */}
        <div className="lg:col-span-8 bg-white  border border-gray-100  rounded-[40px] p-8 md:p-12 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50  rounded-bl-full -z-10" />
           
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedGateway.color }}
                 >
                    {selectedGateway.logo}
                 </div>
                 <h2 className="text-xl font-black text-[#0F172A]  uppercase tracking-tight italic">
                   {selectedGateway.name} <span className="text-gray-400 opacity-30">Settings</span>
                 </h2>
              </div>
              <div className="flex items-center gap-3">
                 <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${currentConfig.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {currentConfig.isActive ? "Active" : "Disabled"}
                 </span>
              </div>
           </div>

           <form onSubmit={handleSave} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="flex items-center justify-between p-4 bg-gray-50  rounded-2xl border border-gray-100 ">
                    <div className="flex items-center gap-3">
                       <Zap className="w-5 h-5 text-indigo-600" />
                       <span className="text-xs font-black uppercase tracking-wider text-gray-700">Live Gateway</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="isActive" defaultChecked={currentConfig.isActive} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-gray-50  rounded-2xl border border-gray-100 ">
                    <div className="flex items-center gap-3">
                       <Settings2 className="w-5 h-5 text-orange-500" />
                       <span className="text-xs font-black uppercase tracking-wider text-gray-700">Sandbox Mode</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="isTestMode" defaultChecked={currentConfig.isTestMode} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                 </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-gray-50 ">
                 {selectedGateway.fields.map((field) => (
                    <div key={field} className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                          <Key className="w-3 h-3" /> {(selectedGateway as any).fieldLabels[field]}
                       </label>
                       <input 
                          name={field}
                          type="password"
                          defaultValue={currentConfig[field] || ""}
                          placeholder={`Enter your ${gwFieldLabel(selectedGateway, field)}...`}
                          className="w-full bg-gray-50/50  border border-gray-100  rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all"
                       />
                    </div>
                 ))}
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-8">
                 <button 
                   type="submit"
                   disabled={isSaving}
                   className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                    {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    {isSaving ? "Syncing..." : "Update Gateway Configuration"}
                 </button>
                 <button 
                   type="button"
                   className="px-10 py-5 bg-white  border border-gray-200  text-gray-400 rounded-2xl text-[10px] font-black uppercase hover:bg-gray-50 transition-all"
                 >
                    Documentation
                 </button>
              </div>

              <div className="flex items-center gap-2 text-red-500 bg-red-50  p-4 rounded-2xl border border-red-100  mt-4">
                 <AlertCircle className="w-4 h-4" />
                 <p className="text-[9px] font-bold uppercase tracking-tight">Warning: Changing these keys will affect active checkout sessions immediately.</p>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}

function gwFieldLabel(gw: any, field: string) {
  return gw.fieldLabels[field];
}
