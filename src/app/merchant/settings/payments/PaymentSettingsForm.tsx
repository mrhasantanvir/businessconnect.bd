"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight, 
  Lock, 
  Zap,
  ChevronRight,
  Save,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { savePaymentConfigAction } from "./actions";

interface PaymentConfig {
  provider: string;
  isActive: boolean;
  isTestMode: boolean;
  apiKey?: string;
  apiSecret?: string;
  merchantId?: string;
  publicKey?: string;
  privateKey?: string;
  storeId?: string;
  storePass?: string;
}

export function PaymentSettingsForm({ initialConfigs }: { initialConfigs: any[] }) {
  const [configs, setConfigs] = useState<Record<string, PaymentConfig>>(() => {
    const map: Record<string, any> = {};
    initialConfigs.forEach(c => map[c.provider] = c);
    return map;
  });

  const [saving, setSaving] = useState<string | null>(null);

  const providers = [
    { id: "BKASH", name: "bKash", color: "bg-[#D12053]", icon: "৳" },
    { id: "NAGAD", name: "Nagad", color: "bg-[#F7941D]", icon: "৳" },
    { id: "SSLCOMMERZ", name: "SSLCommerz", color: "bg-[#005BAC]", icon: "💳" },
  ];

  const handleSave = async (providerId: string) => {
    setSaving(providerId);
    const config = configs[providerId] || { provider: providerId, isActive: false, isTestMode: true };
    
    const formData = new FormData();
    formData.append("provider", providerId);
    formData.append("isActive", String(config.isActive));
    formData.append("isTestMode", String(config.isTestMode));
    
    if (config.apiKey) formData.append("apiKey", config.apiKey);
    if (config.apiSecret) formData.append("apiSecret", config.apiSecret);
    if (config.merchantId) formData.append("merchantId", config.merchantId);
    if (config.publicKey) formData.append("publicKey", config.publicKey);
    if (config.privateKey) formData.append("privateKey", config.privateKey);
    if (config.storeId) formData.append("storeId", config.storeId);
    if (config.storePass) formData.append("storePass", config.storePass);

    const result = await savePaymentConfigAction(formData);
    if (result.success) {
      alert(`${providerId} configuration updated successfully!`);
    } else {
      alert(`Error: ${result.error}`);
    }
    setSaving(null);
  };

  const updateConfig = (provider: string, fields: Partial<PaymentConfig>) => {
    setConfigs(prev => ({
      ...prev,
      [provider]: { ...prev[provider], provider, ...fields }
    }));
  };

  return (
    <div className="space-y-8">
      {providers.map((p) => {
        const config = configs[p.id] || { provider: p.id, isActive: false, isTestMode: true };
        
        return (
          <div key={p.id} className="bg-white  border border-slate-100  rounded-[40px] overflow-hidden shadow-sm hover:shadow-xl transition-all group">
            <div className="p-8 lg:p-10 flex flex-col lg:flex-row gap-10">
              
              {/* Provider Info */}
              <div className="lg:w-1/3 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg", p.color)}>
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900  tracking-tighter">{p.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Payment Gateway Provider</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50  rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Status</span>
                    <button 
                      onClick={() => updateConfig(p.id, { isActive: !config.isActive })}
                      className="transition-transform active:scale-90"
                    >
                      {config.isActive ? (
                        <ToggleRight className="w-8 h-8 text-emerald-500 fill-emerald-500/10" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-300" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50  rounded-2xl border border-dashed border-amber-200 ">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Sandbox Mode</span>
                    </div>
                    <button 
                      onClick={() => updateConfig(p.id, { isTestMode: !config.isTestMode })}
                      className="transition-transform active:scale-90"
                    >
                      {config.isTestMode ? (
                        <ToggleRight className="w-8 h-8 text-amber-500 fill-amber-500/10" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-300" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {p.id === "BKASH" && (
                    <>
                      <Field label="App Key" value={config.apiKey} onChange={(v: string) => updateConfig(p.id, { apiKey: v })} />
                      <Field label="App Secret" value={config.apiSecret} onChange={(v: string) => updateConfig(p.id, { apiSecret: v })} type="password" />
                    </>
                  )}
                  {p.id === "NAGAD" && (
                    <>
                      <Field label="Merchant ID" value={config.merchantId} onChange={(v: string) => updateConfig(p.id, { merchantId: v })} />
                      <Field label="Public Key" value={config.publicKey} onChange={(v: string) => updateConfig(p.id, { publicKey: v })} />
                      <div className="md:col-span-2">
                        <Field label="Private Key" value={config.privateKey} onChange={(v: string) => updateConfig(p.id, { privateKey: v })} isTextArea />
                      </div>
                    </>
                  )}
                  {p.id === "SSLCOMMERZ" && (
                    <>
                      <Field label="Store ID" value={config.storeId} onChange={(v: string) => updateConfig(p.id, { storeId: v })} />
                      <Field label="Store Password" value={config.storePass} onChange={(v: string) => updateConfig(p.id, { storePass: v })} type="password" />
                    </>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-50  flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Storage</span>
                  </div>
                  <button 
                    onClick={() => handleSave(p.id)}
                    disabled={saving === p.id}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-900  text-white  rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                  >
                    {saving === p.id ? (
                      <Zap className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Authorize Connection
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", isTextArea = false }: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  type?: string;
  isTextArea?: boolean;
}) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Lock className="w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        {isTextArea ? (
          <textarea 
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50  border border-transparent rounded-[24px] text-xs font-bold outline-none focus:bg-white  focus:ring-2 focus:ring-indigo-100  transition-all min-h-[100px]"
            placeholder={`Enter ${label}...`}
          />
        ) : (
          <input 
            type={type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-14 pl-12 pr-6 bg-slate-50  border border-transparent rounded-[24px] text-xs font-bold outline-none focus:bg-white  focus:ring-2 focus:ring-indigo-100  transition-all"
            placeholder={`Enter ${label}...`}
          />
        )}
      </div>
    </div>
  );
}

