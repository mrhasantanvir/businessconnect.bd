"use client";

import React, { useState, useEffect } from "react";
import { 
  Truck, Save, RefreshCw, Plus, MapPin, 
  Scale, Droplet, Globe, Info, Server, 
  KeyRound, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getShippingRatesAction, 
  saveShippingRateAction, 
  uploadCourierLogoAction, 
  initializeCourierAction,
  upsertCourierConfigAction
} from "./actions";
import { useLanguage } from "@/context/LanguageContext";

export function UnifiedLogisticsHub({ existingConfigs }: { existingConfigs: any[] }) {
  const { t } = useLanguage();
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [customCourierName, setCustomCourierName] = useState("");
  const [hasApi, setHasApi] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);

  const bdCouriers = [
    { name: "STEADFAST", hasApi: true, logo: "https://steadfast.com.bd/logo.png" },
    { name: "REDX", hasApi: true, logo: "https://redx.com.bd/logo.png" },
    { name: "PATHAO", hasApi: true, logo: "https://pathao.com/logo.png" },
    { name: "PAPERFLY", hasApi: true, logo: "https://paperfly.com.bd/logo.png" },
    { name: "EDESH", hasApi: true, logo: "https://edesh.com/logo.png" },
    { name: "SUNDARBAN", hasApi: false, logo: "https://sundarbancourier.com.bd/logo.png" },
    { name: "SA_PARIBAHAN", hasApi: false, logo: "https://saparabahan.com/logo.png" },
    { name: "KOROTOA", hasApi: false, logo: "https://korotoa.com/logo.png" },
    { name: "JANANI", hasApi: false, logo: "https://janani.com/logo.png" },
    { name: "CONTINENTAL", hasApi: false, logo: "https://continental.com/logo.png" },
    { name: "OTHERS", hasApi: false, logo: "" },
  ];

  const defaultCouriers = ["STEADFAST", "REDX", "PATHAO", "SUNDARBAN", "PAPERFLY"];

  useEffect(() => {
    async function load() {
      const data = await getShippingRatesAction();
      setRates(data);
      setLoading(false);
    }
    load();
  }, []);

  const allCourierNames = Array.from(new Set([
    ...defaultCouriers,
    ...rates.map(r => r.courierName)
  ]));

  const handleSave = async (courierName: string) => {
    const rateData = rates.find(r => r.courierName === courierName) || {
      courierName,
      insideDhaka: 60,
      outsideDhaka: 120,
      subDhaka: 100,
      baseWeightKg: 1,
      extraWeightFee: 20,
      liquidSurcharge: 0,
      courierLogo: null,
      isActive: true
    };

    setSaving(courierName);
    try {
      await saveShippingRateAction(rateData);
      alert(`${courierName} Config Synchronized!`);
    } catch (err) {
      alert("Sync failed.");
    } finally {
      setSaving(null);
    }
  };

  const handleLogoUpload = async (courier: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { url } = await uploadCourierLogoAction(formData);
      updateRate(courier, "courierLogo", url);
    } catch (err) {
      alert("Logo upload failed.");
    }
  };

  const updateRate = (courier: string, field: string, value: any) => {
    setRates(prev => {
      const existing = prev.find(r => r.courierName === courier);
      if (existing) {
        return prev.map(r => r.courierName === courier ? { ...r, [field]: value } : r);
      } else {
        return [...prev, { courierName: courier, [field]: value, insideDhaka: 60, outsideDhaka: 120, subDhaka: 100, baseWeightKg: 1, extraWeightFee: 20, liquidSurcharge: 0, isActive: true }];
      }
    });
  };

  const handleAddCustom = async () => {
    const courierToUse = selectedCourier ? selectedCourier.name : customCourierName;
    if (!courierToUse) return;
    const upperName = courierToUse.toUpperCase();

    setSaving(upperName);
    try {
      await initializeCourierAction({
        courierName: upperName,
        hasApi: selectedCourier ? selectedCourier.hasApi : hasApi,
        apiKey: (selectedCourier?.hasApi || hasApi) ? apiKey : undefined,
        apiSecret: (selectedCourier?.hasApi || hasApi) ? apiSecret : undefined
      });

      const data = await getShippingRatesAction();
      setRates(data);
      
      setCustomCourierName("");
      setApiKey("");
      setApiSecret("");
      setHasApi(false);
      setSelectedCourier(null);
      setIsAddingCustom(false);
      alert(`${upperName} Node Deployed! 🚀`);
    } catch (err) {
      alert("Initialization failed.");
    } finally {
      setSaving(null);
    }
  };

  if (loading) return (
    <div className="h-40 flex items-center justify-center">
       <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="space-y-6">
        
        {/* Actions Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-none border border-gray-100 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                 <Server className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                 <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Courier Services</h2>
                 <p className="text-[10px] font-bold text-slate-500 uppercase">Managing {allCourierNames.length} delivery nodes</p>
              </div>
           </div>
           <button 
             onClick={() => setIsAddingCustom(true)}
             className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-indigo-100"
           >
              <Plus className="w-4 h-4" /> Add New Courier
           </button>
        </div>

        {/* Add Modal Overlay */}
        {isAddingCustom && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
             <div className="absolute inset-0 bg-white border border-slate-100/60 backdrop-blur-sm" onClick={() => setIsAddingCustom(false)} />
             
             <div className="relative w-full max-w-4xl bg-white rounded-[48px] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-8 md:p-12 space-y-8 overflow-y-auto custom-scrollbar">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <h3 className="text-2xl font-black uppercase tracking-tight text-indigo-900">Logistics Node Registration</h3>
                         <p className="text-[10px] font-bold text-gray-400 uppercase">Select provider or add custom infrastructure</p>
                      </div>
                      <button onClick={() => setIsAddingCustom(false)} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all hover:rotate-90">
                         <Plus className="w-6 h-6 rotate-45" />
                      </button>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {bdCouriers.map((c) => (
                        <button 
                          key={c.name}
                          onClick={() => { setSelectedCourier(c); setHasApi(c.hasApi); }}
                          className={cn(
                            "p-6 rounded-3xl border transition-all flex flex-col items-center gap-3",
                            selectedCourier?.name === c.name 
                              ? "bg-indigo-50 border-indigo-600 shadow-xl scale-105" 
                              : "bg-gray-50 border-transparent hover:border-gray-200"
                          )}
                        >
                           <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
                              {c.logo ? <img src={c.logo} alt="" className="w-full h-full object-contain p-1" /> : <Truck className="w-6 h-6 text-gray-400" />}
                           </div>
                           <span className="text-[9px] font-black tracking-tighter uppercase">{c.name}</span>
                           {c.hasApi && <span className="text-[7px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase font-black">API Support</span>}
                        </button>
                      ))}
                   </div>

                   {selectedCourier?.name === "OTHERS" && (
                      <div className="space-y-2 animate-in slide-in-from-top-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Custom Provider Name</label>
                         <input 
                           type="text"
                           placeholder="E.G. SA_PARIBHAN_LOCAL"
                           value={customCourierName}
                           onChange={(e) => setCustomCourierName(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-100 rounded-[24px] px-8 py-5 text-sm font-black uppercase outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all"
                         />
                      </div>
                   )}

                   {(selectedCourier?.hasApi || (selectedCourier?.name === "OTHERS" && hasApi)) && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-500">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><KeyRound className="w-3 h-3"/> API Key / Client ID</label>
                           <input 
                             type="password"
                             placeholder="Enter Key"
                             value={apiKey}
                             onChange={(e) => setApiKey(e.target.value)}
                             className="w-full bg-gray-50 border border-gray-100 rounded-[24px] px-8 py-5 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> API Secret / Token</label>
                           <input 
                             type="password"
                             placeholder="Enter Secret"
                             value={apiSecret}
                             onChange={(e) => setApiSecret(e.target.value)}
                             className="w-full bg-gray-50 border border-gray-100 rounded-[24px] px-8 py-5 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all"
                           />
                        </div>
                     </div>
                   )}

                   {selectedCourier && (
                     <button 
                       onClick={handleAddCustom}
                       disabled={saving !== null}
                       className="w-full py-6 bg-indigo-600 text-white rounded-[32px] text-xs font-black uppercase tracking-[0.3em] hover:bg-black hover:scale-[1.01] active:scale-95 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3"
                     >
                        {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        Deploy {selectedCourier.name} Logistics Pipeline
                     </button>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* Courier List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {allCourierNames.map((courier) => {
            const rate = rates.find(r => r.courierName === courier) || {
              insideDhaka: 60, outsideDhaka: 120, subDhaka: 100, baseWeightKg: 1, extraWeightFee: 20, liquidSurcharge: 0, courierLogo: null, isActive: false
            };
            const config = existingConfigs.find(c => c.providerName === courier);
            
            return (
              <div key={courier} className={cn(
                "p-6 rounded-none bg-white border transition-all duration-500",
                rate.isActive ? "border-indigo-600/20 shadow-xl" : "opacity-60 grayscale border-dashed"
              )}>
                 <div className="space-y-8">
                    <div className="flex justify-between items-start">
                       <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden relative group">
                             {rate.courierLogo ? <img src={rate.courierLogo} alt="" className="w-full h-full object-contain" /> : <span className="font-black text-gray-300 text-xs">{courier.slice(0,3)}</span>}
                             <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <Plus className="w-6 h-6 text-white" />
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleLogoUpload(courier, e.target.files[0])} />
                             </label>
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-gray-900 tracking-tight">{courier}</h3>
                             <div className="flex gap-2 mt-1">
                                {config ? (
                                  <span className="text-[7px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase">Connected API</span>
                                ) : (
                                  <span className="text-[7px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-black uppercase">Manual Routing</span>
                                )}
                             </div>
                          </div>
                       </div>
                       <button 
                         onClick={() => updateRate(courier, "isActive", !rate.isActive)}
                         className={cn("w-14 h-8 rounded-full relative transition-colors", rate.isActive ? "bg-indigo-600" : "bg-gray-200")}
                       >
                          <div className={cn("absolute top-1 w-6 h-6 bg-white rounded-full transition-all", rate.isActive ? "right-1" : "left-1")} />
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
                       
                       {/* Category 1: General E-commerce */}
                       <div className="space-y-3 bg-gray-50/50 p-4 rounded-none border border-gray-100">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                <Truck className="w-4 h-4" />
                             </div>
                             <h5 className="text-[9px] font-black uppercase tracking-widest text-gray-900">Standard Delivery</h5>
                          </div>
                          <div className="space-y-3">
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">Inside Dhaka</label>
                                <div className="flex items-center gap-1 border-b border-gray-200 pb-1">
                                   <span className="text-sm font-black text-gray-900">৳</span>
                                   <input type="number" value={rate.insideDhaka} onChange={(e) => updateRate(courier, "insideDhaka", parseFloat(e.target.value))} className="w-full bg-transparent text-sm font-black focus:outline-none" />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">Outside Dhaka</label>
                                <div className="flex items-center gap-1 border-b border-gray-200 pb-1">
                                   <span className="text-sm font-black text-gray-900">৳</span>
                                   <input type="number" value={rate.outsideDhaka} onChange={(e) => updateRate(courier, "outsideDhaka", parseFloat(e.target.value))} className="w-full bg-transparent text-sm font-black focus:outline-none" />
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Category 4: Home Delivery (NEW) */}
                       <div className="space-y-3 bg-emerald-50/30 p-4 rounded-none border border-emerald-100/50">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <MapPin className="w-4 h-4" />
                             </div>
                             <h5 className="text-[9px] font-black uppercase tracking-widest text-gray-900">Home Delivery</h5>
                          </div>
                          <div className="space-y-3">
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">Inside Dhaka</label>
                                <div className="flex items-center gap-1 border-b border-emerald-200/50 pb-1">
                                   <span className="text-sm font-black text-gray-900">৳</span>
                                   <input type="number" value={rate.homeDeliveryInsideDhaka} onChange={(e) => updateRate(courier, "homeDeliveryInsideDhaka", parseFloat(e.target.value))} className="w-full bg-transparent text-sm font-black focus:outline-none" />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">Outside Dhaka</label>
                                <div className="flex items-center gap-1 border-b border-emerald-200/50 pb-1">
                                   <span className="text-sm font-black text-gray-900">৳</span>
                                   <input type="number" value={rate.homeDeliveryOutsideDhaka} onChange={(e) => updateRate(courier, "homeDeliveryOutsideDhaka", parseFloat(e.target.value))} className="w-full bg-transparent text-sm font-black focus:outline-none" />
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Category 2: Weight-based (Mango, etc.) */}
                       <div className="space-y-3 bg-amber-50/30 p-4 rounded-none border border-amber-100/50">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                                <Scale className="w-4 h-4" />
                             </div>
                             <h5 className="text-[9px] font-black uppercase tracking-widest text-gray-900">Weight-based (Per KG)</h5>
                          </div>
                          <div className="space-y-3">
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">Inside Dhaka</label>
                                <div className="flex items-center gap-1 border-b border-amber-200/50 pb-1">
                                   <span className="text-sm font-black text-gray-900">৳</span>
                                   <input type="number" value={rate.perKgInsideDhaka} onChange={(e) => updateRate(courier, "perKgInsideDhaka", parseFloat(e.target.value))} className="w-full bg-transparent text-sm font-black focus:outline-none" />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">Outside Dhaka</label>
                                <div className="flex items-center gap-1 border-b border-amber-200/50 pb-1">
                                   <span className="text-sm font-black text-gray-900">৳</span>
                                   <input type="number" value={rate.perKgOutsideDhaka} onChange={(e) => updateRate(courier, "perKgOutsideDhaka", parseFloat(e.target.value))} className="w-full bg-transparent text-sm font-black focus:outline-none" />
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Category 3: Liquid-based (Oil, Honey) */}
                       <div className="space-y-3 bg-indigo-50/30 p-4 rounded-none border border-indigo-100/50">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <Droplet className="w-4 h-4" />
                             </div>
                             <h5 className="text-[9px] font-black uppercase tracking-widest text-gray-900">Liquid-based (Per LTR)</h5>
                          </div>
                          <div className="space-y-3">
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">Inside Dhaka</label>
                                <div className="flex items-center gap-1 border-b border-indigo-200/50 pb-1">
                                   <span className="text-sm font-black text-gray-900">৳</span>
                                   <input type="number" value={rate.perLiterInsideDhaka} onChange={(e) => updateRate(courier, "perLiterInsideDhaka", parseFloat(e.target.value))} className="w-full bg-transparent text-sm font-black focus:outline-none" />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase">Outside Dhaka</label>
                                <div className="flex items-center gap-1 border-b border-indigo-200/50 pb-1">
                                   <span className="text-sm font-black text-gray-900">৳</span>
                                   <input type="number" value={rate.perLiterOutsideDhaka} onChange={(e) => updateRate(courier, "perLiterOutsideDhaka", parseFloat(e.target.value))} className="w-full bg-transparent text-sm font-black focus:outline-none" />
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                       <button 
                         onClick={() => handleSave(courier)}
                         disabled={saving === courier}
                         className="w-full py-5 bg-indigo-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                       >
                          {saving === courier ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Synchronize Pipeline Infrastructure
                       </button>
                    </div>
                 </div>
              </div>
            );
          })}
        </div>

    </div>
  );
}

