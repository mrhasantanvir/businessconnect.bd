"use client";

import React, { useState, useEffect } from "react";
import { 
  Truck, MapPin, Scale, Droplet, Plus, Save, 
  CheckCircle2, AlertCircle, RefreshCw, ChevronRight,
  Globe, Info, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getShippingRatesAction, saveShippingRateAction, uploadCourierLogoAction, initializeCourierAction } from "./actions";
import { testCourierConnectionAction } from "./api-actions";

export default function ShippingSettingsPage() {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const handleTestConnection = async (provider: string) => {
    setTesting(provider);
    try {
      const res = await testCourierConnectionAction(provider);
      if (res.success) {
        alert(res.message);
      } else {
        alert("Error: " + res.message);
      }
    } catch (err) {
      alert("Test failed.");
    } finally {
      setTesting(null);
    }
  };
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [customCourierName, setCustomCourierName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [hasApi, setHasApi] = useState(false);

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

  // Merge default couriers with custom ones from DB
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
      alert(`${courierName} rates and config updated!`);
    } catch (err) {
      alert("Failed to save.");
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
    if (allCourierNames.includes(upperName)) {
      alert("Courier already exists.");
      return;
    }

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
      alert(`${upperName} Initialized Successfully! 🚀`);
    } catch (err) {
      alert("Failed to add courier.");
    } finally {
      setSaving(null);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
       <RefreshCw className="w-8 h-8 animate-spin text-primary-blue" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-12 animate-in fade-in duration-700 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
           <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-blue mb-2">
                 <Truck className="w-4 h-4" /> Logistics Intelligence
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight uppercase">
                 Advanced <span className="text-primary-blue">Shipping</span> Module
              </h1>
              <p className="text-muted-foreground text-sm font-medium mt-1 opacity-80">Configure courier-specific charges and location surcharges for unified fulfillment.</p>
           </div>
           <button 
             onClick={() => setIsAddingCustom(true)}
             className="px-6 py-3 bg-primary-blue text-white rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary-blue/20"
           >
              <Plus className="w-4 h-4" /> Add Custom Courier
           </button>
        </div>

        {/* Add Custom Modal/Form */}
        {isAddingCustom && (
          <div className="p-8 rounded-[40px] bg-card border-2 border-primary-blue/30 shadow-2xl animate-in zoom-in-95 space-y-8 max-h-[80vh] overflow-y-auto">
             <div className="flex items-center justify-between">
                <div className="space-y-1">
                   <h3 className="text-xl font-bold uppercase tracking-tight text-foreground">BD Courier Intelligence</h3>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">Select from national logistics network</p>
                </div>
                <button onClick={() => setIsAddingCustom(false)} className="text-muted-foreground hover:text-foreground">
                   <Plus className="w-6 h-6 rotate-45" />
                </button>
             </div>

             {/* Courier Selection Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {bdCouriers.map((c) => (
                  <button 
                    key={c.name}
                    onClick={() => {
                      setSelectedCourier(c);
                      setHasApi(c.hasApi);
                    }}
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                      selectedCourier?.name === c.name 
                        ? "bg-primary-blue/10 border-primary-blue shadow-lg" 
                        : "bg-muted border-border hover:border-muted-foreground"
                    )}
                  >
                     <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                        {c.logo ? <img src={c.logo} alt="" className="w-full h-full object-contain" /> : <Truck className="w-5 h-5 text-muted-foreground" />}
                     </div>
                     <span className="text-[9px] font-bold tracking-tight">{c.name}</span>
                     {c.hasApi && <span className="text-[7px] bg-green-500 text-white px-1 rounded uppercase">API</span>}
                  </button>
                ))}
             </div>

             {selectedCourier?.name === "OTHERS" && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Custom Provider Name</label>
                   <input 
                     type="text"
                     placeholder="E.G. LOCAL_VAN_SERVICE"
                     value={customCourierName}
                     onChange={(e) => setCustomCourierName(e.target.value)}
                     className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-primary-blue/20"
                   />
                </div>
             )}

             {(selectedCourier?.hasApi || (selectedCourier?.name === "OTHERS" && hasApi)) && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">API Key / Client ID</label>
                     <input 
                       type="password"
                       placeholder="Enter API Key"
                       value={apiKey}
                       onChange={(e) => setApiKey(e.target.value)}
                       className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-blue/20"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">API Secret / Token</label>
                     <input 
                       type="password"
                       placeholder="Enter Secret"
                       value={apiSecret}
                       onChange={(e) => setApiSecret(e.target.value)}
                       className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-blue/20"
                     />
                  </div>
               </div>
             )}

             {selectedCourier && (
               <button 
                 onClick={handleAddCustom}
                 disabled={saving !== null}
                 className="w-full py-5 bg-foreground text-background rounded-[24px] text-xs font-bold uppercase tracking-[0.2em] hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-foreground/10 flex items-center justify-center gap-2"
               >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Deploy {selectedCourier.name} Node
               </button>
             )}
          </div>
        )}

        {/* Global Shipping Strategy Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { icon: Globe, label: "Zone Based", sub: "Dhaka vs National Rates", color: "text-blue-500", bg: "bg-blue-500/10" },
             { icon: Scale, label: "Weight Logic", sub: "Per KG Additional Fees", color: "text-amber-500", bg: "bg-amber-500/10" },
             { icon: Droplet, label: "Type Surcharge", sub: "Liquid & Fragile Rules", color: "text-indigo-500", bg: "bg-indigo-500/10" },
           ].map((item, i) => (
             <div key={i} className="p-6 rounded-[32px] bg-card border border-border flex items-center gap-4 shadow-sm">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", item.bg)}>
                   <item.icon className={cn("w-6 h-6", item.color)} />
                </div>
                <div>
                   <h4 className="text-sm font-bold text-card-foreground uppercase tracking-tight">{item.label}</h4>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.sub}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Courier Config List */}
        <div className="space-y-8">
          {allCourierNames.map((courier) => {
            const rate = rates.find(r => r.courierName === courier) || {
              insideDhaka: 60,
              outsideDhaka: 120,
              subDhaka: 100,
              baseWeightKg: 1,
              extraWeightFee: 20,
              liquidSurcharge: 0,
              courierLogo: null,
              isActive: false
            };
            
            return (
              <div key={courier} className={cn(
                "p-8 rounded-[40px] border transition-all duration-500",
                rate.isActive 
                  ? "bg-card border-primary-blue/30 shadow-xl shadow-primary-blue/5" 
                  : "bg-card/40 border-dashed border-border opacity-80"
              )}>
                 <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* Left: Branding & Toggle */}
                    <div className="w-full lg:w-48 space-y-4">
                       <div className="relative group">
                          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center border border-border shadow-inner overflow-hidden">
                             {rate.courierLogo ? (
                               <img src={rate.courierLogo} alt="Logo" className="w-full h-full object-contain" />
                             ) : (
                               <span className="text-xs font-bold uppercase text-muted-foreground">{courier.slice(0, 3)}</span>
                             )}
                          </div>
                          <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary-blue text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                             <Plus className="w-4 h-4" />
                             <input 
                               type="file" 
                               className="hidden" 
                               accept="image/*"
                               onChange={(e) => e.target.files?.[0] && handleLogoUpload(courier, e.target.files[0])}
                             />
                          </label>
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-foreground">{courier}</h3>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active API Node</p>
                       </div>
                       <button 
                         onClick={() => updateRate(courier, "isActive", !rate.isActive)}
                         className={cn(
                           "w-full py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                           rate.isActive 
                            ? "bg-green-500/10 text-green-600 border-green-500/30" 
                            : "bg-muted text-muted-foreground border-transparent"
                         )}
                       >
                          {rate.isActive ? "Active" : "Enable"}
                       </button>
                    </div>

                    {/* Middle: Pricing Controls */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="space-y-6">
                          <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                             <MapPin className="w-3 h-3" /> Location Charges
                          </h5>
                          <div className="space-y-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground/60">Inside Dhaka</label>
                                <div className="flex items-center gap-2 border-b border-border pb-1">
                                   <span className="text-lg font-bold text-foreground">৳</span>
                                   <input 
                                     type="number" 
                                     value={rate.insideDhaka}
                                     onChange={(e) => updateRate(courier, "insideDhaka", parseFloat(e.target.value))}
                                     className="bg-transparent text-lg font-bold text-foreground outline-none w-full"
                                   />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground/60">Outside Dhaka</label>
                                <div className="flex items-center gap-2 border-b border-border pb-1">
                                   <span className="text-lg font-bold text-foreground">৳</span>
                                   <input 
                                     type="number" 
                                     value={rate.outsideDhaka}
                                     onChange={(e) => updateRate(courier, "outsideDhaka", parseFloat(e.target.value))}
                                     className="bg-transparent text-lg font-bold text-foreground outline-none w-full"
                                   />
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                             <Scale className="w-3 h-3" /> Weight Management
                          </h5>
                          <div className="space-y-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground/60">Base Weight (KG)</label>
                                <div className="flex items-center gap-2 border-b border-border pb-1">
                                   <input 
                                     type="number" 
                                     value={rate.baseWeightKg}
                                     onChange={(e) => updateRate(courier, "baseWeightKg", parseFloat(e.target.value))}
                                     className="bg-transparent text-lg font-bold text-foreground outline-none w-full"
                                   />
                                   <span className="text-xs font-bold text-muted-foreground">KG</span>
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground/60">Extra Weight Fee</label>
                                <div className="flex items-center gap-2 border-b border-border pb-1">
                                   <span className="text-lg font-bold text-foreground">৳</span>
                                   <input 
                                     type="number" 
                                     value={rate.extraWeightFee}
                                     onChange={(e) => updateRate(courier, "extraWeightFee", parseFloat(e.target.value))}
                                     className="bg-transparent text-lg font-bold text-foreground outline-none w-full"
                                   />
                                   <span className="text-[9px] font-bold text-muted-foreground">/KG</span>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                             <Droplet className="w-3 h-3" /> specialized surcharges
                          </h5>
                          <div className="space-y-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground/60">Liquid / Oil Charge</label>
                                <div className="flex items-center gap-2 border-b border-border pb-1">
                                   <span className="text-lg font-bold text-foreground">৳</span>
                                   <input 
                                     type="number" 
                                     value={rate.liquidSurcharge}
                                     onChange={(e) => updateRate(courier, "liquidSurcharge", parseFloat(e.target.value))}
                                     className="bg-transparent text-lg font-bold text-foreground outline-none w-full"
                                   />
                                </div>
                             </div>
                             <div className="flex gap-2 pt-2">
                                <button 
                                  onClick={() => handleSave(courier)}
                                  disabled={saving === courier}
                                  className="flex-1 h-12 bg-foreground text-background rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-foreground/5"
                                >
                                   {saving === courier ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                   Save Config
                                </button>
                                {bdCouriers.find(c => c.name === courier)?.hasApi && (
                                  <button 
                                    onClick={() => handleTestConnection(courier)}
                                    disabled={testing === courier}
                                    className="px-4 h-12 bg-primary-blue/10 text-primary-blue rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary-blue/20 transition-all active:scale-95 border border-primary-blue/20"
                                  >
                                     {testing === courier ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Test API"}
                                  </button>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            );
          })}
        </div>

        {/* Security Info */}
        <div className="p-8 rounded-[40px] bg-indigo-600 shadow-2xl shadow-indigo-500/20 text-white flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                 <Info className="w-7 h-7 text-white" />
              </div>
              <div>
                 <h4 className="text-lg font-bold tracking-tight">Logistics API Sync</h4>
                 <p className="text-indigo-100/70 text-xs font-medium">These rates will be used by the Unified Product Catalog to calculate accurate shipping for storefront orders.</p>
              </div>
           </div>
           <button className="px-8 py-3 bg-white text-indigo-600 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
              Configure Webhooks
           </button>
        </div>

      </div>
    </div>
  );
}

