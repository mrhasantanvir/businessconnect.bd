"use client";

import React, { useState } from "react";
import { 
  MessageSquare, 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight, 
  Lock, 
  Zap,
  Save,
  Smartphone,
  Info,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { saveSmsConfigAction, sendTestSmsAction } from "./actions";

export function SmsSettingsForm({ initialConfigs, smsBalance }: { initialConfigs: any[], smsBalance: number }) {
  const [configs, setConfigs] = useState<Record<string, any>>(() => {
    const map: Record<string, any> = {};
    initialConfigs.forEach(c => map[c.provider] = c);
    return map;
  });

  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState("");

  const providers = [
    { id: "BULKSMSBD", name: "BulkSMSBD", color: "bg-[#1E40AF]" },
    { id: "GREENWEB", name: "GreenWeb", color: "bg-[#059669]" },
    { id: "SSLWIRELESS", name: "SSL Wireless", color: "bg-[#7C3AED]" },
  ];

  const handleSave = async (providerId: string) => {
    setSaving(providerId);
    const config = configs[providerId] || { provider: providerId, isActive: false };
    
    const formData = new FormData();
    formData.append("provider", providerId);
    formData.append("isActive", String(config.isActive));
    formData.append("apiKey", config.apiKey || "");
    formData.append("senderId", config.senderId || "");
    formData.append("apiUrl", config.apiUrl || "");

    const result = await saveSmsConfigAction(formData);
    if (result.success) {
      alert(`${providerId} configuration updated!`);
    } else {
      alert(`Error: ${result.error}`);
    }
    setSaving(null);
  };

  const handleTest = async (providerId: string) => {
    if (!testPhone) return alert("Please enter a phone number to test.");
    setTesting(providerId);
    const result = await sendTestSmsAction(providerId, testPhone);
    if (result.success) {
      alert(result.message);
    } else {
      alert(`Error: ${result.error}`);
    }
    setTesting(null);
  };

  const updateConfig = (provider: string, fields: any) => {
    setConfigs(prev => ({
      ...prev,
      [provider]: { ...prev[provider], provider, ...fields }
    }));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
      
      {/* Left Column: Provider List */}
      <div className="xl:col-span-2 space-y-8">
        {providers.map((p) => {
          const config = configs[p.id] || { provider: p.id, isActive: false };
          
          return (
            <div key={p.id} className="bg-white  border border-slate-100  rounded-[48px] overflow-hidden shadow-sm hover:shadow-xl transition-all">
              <div className="p-10 space-y-8">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center text-white text-xl font-black shadow-lg", p.color)}>
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900  tracking-tighter italic uppercase">{p.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">SMS Gateway Integration</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateConfig(p.id, { isActive: !config.isActive })}
                    className="transition-transform active:scale-90"
                  >
                    {config.isActive ? (
                      <ToggleRight className="w-10 h-10 text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-300" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">API Key / Token</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="password"
                        value={config.apiKey || ""}
                        onChange={(e) => updateConfig(p.id, { apiKey: e.target.value })}
                        className="w-full h-14 pl-12 pr-6 bg-slate-50  border border-transparent rounded-[24px] text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                        placeholder="Enter API Key..."
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Sender ID / Masking</label>
                    <div className="relative group">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="text"
                        value={config.senderId || ""}
                        onChange={(e) => updateConfig(p.id, { senderId: e.target.value })}
                        className="w-full h-14 pl-12 pr-6 bg-slate-50  border border-transparent rounded-[24px] text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                        placeholder="e.g. BusinessConnect"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-50  flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <input 
                        type="tel"
                        placeholder="Test Number..."
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                        className="h-12 w-40 px-4 bg-slate-50  border border-transparent rounded-xl text-[10px] font-bold outline-none focus:bg-white transition-all"
                      />
                      <button 
                        onClick={() => handleTest(p.id)}
                        disabled={testing === p.id}
                        className="flex items-center gap-2 px-6 py-3 bg-white  border border-slate-200  rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 transition-all shadow-sm"
                      >
                        {testing === p.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Test Gateway"}
                      </button>
                   </div>
                   <button 
                    onClick={() => handleSave(p.id)}
                    disabled={saving === p.id}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-900  text-white  rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                    {saving === p.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Config</>}
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column: Wallet & Stats */}
      <div className="space-y-8">
        <div className="bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-20 transform translate-x-1/2 -translate-y-1/2 bg-blue-500/10 w-64 h-64 rounded-full blur-3xl" />
           
           <div className="relative z-10 space-y-10">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black uppercase text-blue-400 tracking-[0.2em]">SMS Credit Wallet</h3>
                 <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>

              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Available Balance</p>
                 <div className="text-6xl font-black mt-4 tracking-tighter">৳{smsBalance.toFixed(2)}</div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Est. Messages</span>
                    <span className="text-white">~{Math.floor(smsBalance / 0.5)} SMS</span>
                 </div>
                 <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-[65%] h-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                 </div>
              </div>

              <button className="w-full py-5 bg-white text-slate-900 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl">
                 Recharge Wallet
              </button>
           </div>
        </div>

        <div className="bg-white  border border-slate-100  rounded-[40px] p-8 space-y-6">
           <h4 className="text-sm font-black uppercase italic tracking-tight flex items-center gap-3">
              <Info className="w-5 h-5 text-indigo-500" /> Integration Tips
           </h4>
           <ul className="space-y-4">
              {[
                "Use International format (e.g. 88017...)",
                "BulkSMSBD supports masking & non-masking",
                "Minimum balance for delivery is ৳2.00",
                "Ensure API Key permissions include 'Send SMS'"
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-[11px] font-bold text-slate-500 leading-relaxed">
                   <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                   {tip}
                </li>
              ))}
           </ul>
        </div>
      </div>

    </div>
  );
}

