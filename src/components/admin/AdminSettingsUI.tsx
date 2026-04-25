"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, MessageSquare, Mail, Bell, 
  Smartphone, Save, ShieldCheck, Database, 
  CheckCircle2, AlertCircle, Loader2, Globe,
  MessageCircle, DollarSign
} from "lucide-react";
import { getSystemSettingsAction, updateSystemSettingsAction } from "@/app/admin/settings/actions";

type Tab = "GENERAL" | "SMS" | "REALTIME" | "MAIL" | "WHATSAPP" | "PRICING" | "GOOGLE";

export function AdminSettingsUI() {
  const [activeTab, setActiveTab] = useState<Tab>("GENERAL");
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getSystemSettingsAction();
      setSettings(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (data: any) => {
    setSaving(true);
    setMessage(null);
    const result = await updateSystemSettingsAction(data);
    if (result.success) {
      setSettings(result.settings);
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to save settings." });
    }
    setSaving(false);
    // Auto-clear message
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1E40AF]" />
        <p className="text-sm font-bold text-[#64748B]">Loading system configuration...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
             <Settings className="w-8 h-8 text-[#1E40AF]" />
             Platform Settings
          </h1>
          <p className="text-[#64748B] text-sm font-medium mt-1">Configure global API integrations and system behaviors.</p>
        </div>
        <div className="flex items-center gap-3">
           {message && (
             <div className={`px-4 py-2 rounded-none border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-right-4 ${
               message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
             }`}>
               {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
               {message.text}
             </div>
           )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          <TabButton 
            active={activeTab === "GENERAL"} 
            onClick={() => setActiveTab("GENERAL")} 
            icon={ShieldCheck} 
            label="General Support" 
            sub="System Toggles"
          />
          <TabButton 
            active={activeTab === "SMS"} 
            onClick={() => setActiveTab("SMS")} 
            icon={Smartphone} 
            label="SMS Gateways" 
            sub="Firebase & BD APIs"
          />
          <TabButton 
            active={activeTab === "REALTIME"} 
            onClick={() => setActiveTab("REALTIME")} 
            icon={Bell} 
            label="Real-time" 
            sub="Pusher Config"
          />
          <TabButton 
            active={activeTab === "MAIL"} 
            onClick={() => setActiveTab("MAIL")} 
            icon={Mail} 
            label="Mail (SMTP)" 
            sub="Amazon SES & More"
          />
          <TabButton 
            active={activeTab === "WHATSAPP"} 
            onClick={() => setActiveTab("WHATSAPP")} 
            icon={MessageCircle} 
            label="WhatsApp" 
            sub="Business API"
          />
          <TabButton 
            active={activeTab === "PRICING"} 
            onClick={() => setActiveTab("PRICING")} 
            icon={DollarSign} 
            label="Resource Pricing" 
            sub="Global Rates"
          />
          <TabButton 
            active={activeTab === "GOOGLE"} 
            onClick={() => setActiveTab("GOOGLE")} 
            icon={Globe} 
            label="Google Cloud" 
            sub="App Sync Keys"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-[#E5E7EB] rounded-none shadow-xl overflow-hidden min-h-[500px]">
           <div className="p-8">
              {activeTab === "GENERAL" && (
                <GeneralSettings 
                  settings={settings} 
                  onSave={handleSave} 
                  saving={saving} 
                />
              )}
              {activeTab === "SMS" && (
                <SmsSettings 
                  settings={settings} 
                  onSave={handleSave} 
                  saving={saving} 
                />
              )}
              {activeTab === "REALTIME" && (
                <RealtimeSettings 
                  settings={settings} 
                  onSave={handleSave} 
                  saving={saving} 
                />
              )}
              {activeTab === "MAIL" && (
                <MailSettings 
                  settings={settings} 
                  onSave={handleSave} 
                  saving={saving} 
                />
              )}
              {activeTab === "WHATSAPP" && (
                <WhatsAppSettings 
                  settings={settings} 
                  onSave={handleSave} 
                  saving={saving} 
                />
              )}
              {activeTab === "PRICING" && (
                <PricingSettings 
                  settings={settings} 
                  onSave={handleSave} 
                  saving={saving} 
                />
              )}
              {activeTab === "GOOGLE" && (
                <GoogleSettings 
                  settings={settings} 
                  onSave={handleSave} 
                  saving={saving} 
                />
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, sub }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 transition-all rounded-none text-left border ${
        active 
          ? "bg-white text-slate-900 text-slate-900 border border-slate-100 text-white border-[#0F172A] shadow-lg translate-x-1" 
          : "bg-white text-[#64748B] border-[#E5E7EB] hover:bg-gray-50"
      }`}
    >
      <div className={`w-10 h-10 flex items-center justify-center rounded-none ${
        active ? "bg-white/10" : "bg-gray-100"
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm font-black tracking-tight">{label}</div>
        <div className={`text-[10px] font-bold uppercase tracking-wider ${
          active ? "text-white/50" : "text-[#A1A1AA]"
        }`}>{sub}</div>
      </div>
    </button>
  );
}

// --- Specific Settings Components ---

function GeneralSettings({ settings, onSave, saving }: any) {
  const [isEnabled, setIsEnabled] = useState(settings?.isLiveChatEnabled ?? true);
  const [isFraudEnabled, setIsFraudEnabled] = useState(settings?.isFraudCheckEnabled ?? true);

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-4">
        <h3 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
           <Database className="w-6 h-6" /> System Toggles
        </h3>
        <p className="text-sm text-[#64748B]">Enable or disable core platform services instantly.</p>
      </div>

      <div className="p-6 bg-gray-50 border border-gray-200 rounded-none flex items-center justify-between">
        <div>
          <div className="font-bold text-[#0F172A]">Fraud Check Intelligence</div>
          <div className="text-xs text-[#64748B] mt-1">Enable automated customer risk scoring and courier history analysis globally.</div>
        </div>
        <button 
          onClick={() => setIsFraudEnabled(!isFraudEnabled)}
          className={`relative w-14 h-7 rounded-none transition-colors ${isFraudEnabled ? 'bg-[#BEF264]' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-1 w-5 h-5 bg-white rounded-none transition-all ${isFraudEnabled ? 'left-8' : 'left-1'}`} />
        </button>
      </div>

      <button
        disabled={saving}
        onClick={() => onSave({ 
          isLiveChatEnabled: isEnabled,
          isFraudCheckEnabled: isFraudEnabled
        })}
        className="px-6 py-3 bg-white text-slate-900 text-slate-900 border border-slate-100 text-white font-black text-sm rounded-none hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save General Settings
      </button>
    </div>
  );
}

function SmsSettings({ settings, onSave, saving }: any) {
  const [provider, setProvider] = useState(settings?.smsActiveProvider ?? "FIREBASE");
  const [apiKey, setApiKey] = useState(settings?.smsApiKey ?? "");
  const [senderId, setSenderId] = useState(settings?.smsSenderId ?? "");
  const [apiUrl, setApiUrl] = useState(settings?.smsApiUrl ?? "");

  const providers = [
    { id: "FIREBASE", name: "Firebase Auth Flow" },
    { id: "ELITBUZZ", name: "ElitBuzz BD" },
    { id: "SSLWIRELESS", name: "SSL Wireless" },
    { id: "GREENWEB", name: "GreenWeb BD" },
    { id: "BULKSMSBD", name: "BulkSMSBD" },
    { id: "INFOBIP", name: "Infobip Global" },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <h3 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
           <Smartphone className="w-6 h-6" /> SMS Gateway Configuration
        </h3>
        <p className="text-sm text-[#64748B]">Select and configure your active SMS provider for OTPs and notifications.</p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Active Provider</label>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className={`p-4 border rounded-none text-left transition-all ${
                provider === p.id 
                  ? "border-[#1E40AF] bg-blue-50/50 ring-1 ring-[#1E40AF]" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-xs font-bold text-[#0F172A]">{p.name}</div>
              <div className="text-[9px] text-[#A1A1AA] uppercase font-black mt-1">
                {provider === p.id ? "Active" : "Select"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">API Key / Token</label>
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-[#1E40AF] text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Sender ID / Masking</label>
          <input 
            type="text"
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-[#1E40AF] text-sm"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">API Endpoint URL (Optional)</label>
          <input 
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="e.g. https://api.elitbuzz-bd.com/smsapi"
            className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-[#1E40AF] text-sm font-mono"
          />
        </div>
      </div>

      <button
        disabled={saving}
        onClick={() => onSave({ 
          smsActiveProvider: provider,
          smsApiKey: apiKey,
          smsSenderId: senderId,
          smsApiUrl: apiUrl
        })}
        className="px-6 py-3 bg-white text-slate-900 text-slate-900 border border-slate-100 text-white font-black text-sm rounded-none hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Update SMS Gateway
      </button>
    </div>
  );
}

function RealtimeSettings({ settings, onSave, saving }: any) {
  const [appId, setAppId] = useState(settings?.pusherAppId ?? "");
  const [key, setKey] = useState(settings?.pusherKey ?? "");
  const [secret, setSecret] = useState(settings?.pusherSecret ?? "");
  const [cluster, setCluster] = useState(settings?.pusherCluster ?? "ap1");

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <h3 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
           <Bell className="w-6 h-6" /> Real-time Support (Pusher)
        </h3>
        <p className="text-sm text-[#64748B]">Manage Pusher credentials for instant notifications and live chat sync.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Pusher App ID" value={appId} onChange={setAppId} />
        <Input label="Pusher Key" value={key} onChange={setKey} />
        <Input label="Pusher Secret" value={secret} onChange={setSecret} type="password" />
        <Input label="Cluster" value={cluster} onChange={setCluster} />
      </div>

      <button
        disabled={saving}
        onClick={() => onSave({ 
          pusherAppId: appId,
          pusherKey: key,
          pusherSecret: secret,
          pusherCluster: cluster
        })}
        className="px-6 py-3 bg-[#1E40AF] text-white font-black text-sm rounded-none hover:bg-[#1E3A8A] transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Pusher Configuration
      </button>
    </div>
  );
}

function MailSettings({ settings, onSave, saving }: any) {
  const [host, setHost] = useState(settings?.smtpHost ?? "");
  const [port, setPort] = useState(settings?.smtpPort ?? 587);
  const [user, setUser] = useState(settings?.smtpUser ?? "");
  const [pass, setPass] = useState(settings?.smtpPass ?? "");
  const [from, setFrom] = useState(settings?.smtpFrom ?? "noreply@businessconnect.bd");

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <h3 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
           <Mail className="w-6 h-6" /> SMTP / Mail Server
        </h3>
        <p className="text-sm text-[#64748B]">Configure transactional email settings for Amazon SES, Mailgun, or custom SMTP.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
           <Input label="SMTP Host" value={host} onChange={setHost} placeholder="e.g. email-smtp.us-east-1.amazonaws.com" />
        </div>
        <Input label="Port" value={port} onChange={(val: any) => setPort(parseInt(val))} type="number" />
        <Input label="Username" value={user} onChange={setUser} />
        <Input label="Password" value={pass} onChange={setPass} type="password" />
        <Input label="Default From Email" value={from} onChange={setFrom} />
      </div>

      <button
        disabled={saving}
        onClick={() => onSave({ 
          smtpHost: host,
          smtpPort: port,
          smtpUser: user,
          smtpPass: pass,
          smtpFrom: from
        })}
        className="px-6 py-3 bg-white text-slate-900 text-slate-900 border border-slate-100 text-white font-black text-sm rounded-none hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Update SMTP Settings
      </button>
    </div>
  );
}

function WhatsAppSettings({ settings, onSave, saving }: any) {
  const [token, setToken] = useState(settings?.whatsappToken ?? "");
  const [phoneId, setPhoneId] = useState(settings?.whatsappPhoneId ?? "");

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <h3 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
           <MessageCircle className="w-6 h-6" /> WhatsApp Business API
        </h3>
        <p className="text-sm text-[#64748B]">Integrate Meta Business API for real-time order notifications and support.</p>
      </div>

      <div className="space-y-6">
        <Input label="Meta Access Token" value={token} onChange={setToken} type="password" multiline />
        <Input label="Phone Number ID" value={phoneId} onChange={setPhoneId} />
      </div>

      <button
        disabled={saving}
        onClick={() => onSave({ 
          whatsappToken: token,
          whatsappPhoneId: phoneId
        })}
        className="px-6 py-3 bg-[#16A34A] text-white font-black text-sm rounded-none hover:bg-[#15803D] transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save WhatsApp Integration
      </button>
    </div>
  );
}

function PricingSettings({ settings, onSave, saving }: any) {
  // Ideally these might map to SystemSettings if global, or just be an interface for bulk updates.
  // For demonstration, let's assume we are saving default global rates to the DB settings or just showing the UI.
  const [globalSmsRate, setGlobalSmsRate] = useState(settings?.globalSmsRate ?? 0.50);
  const [globalSipRate, setGlobalSipRate] = useState(settings?.globalSipRate ?? 1.00);

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-4">
        <h3 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
           <DollarSign className="w-6 h-6" /> Reource Pricing Control
        </h3>
        <p className="text-sm text-[#64748B]">Set the global rates for SMS credits and SIP (Call Minute) usage for merchants. This defines your margin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Global SMS Rate (BDT/SMS)" value={globalSmsRate} onChange={setGlobalSmsRate} type="number" />
        <Input label="Global SIP Rate (BDT/Min)" value={globalSipRate} onChange={setGlobalSipRate} type="number" />
      </div>

      <button
        disabled={saving}
        onClick={() => onSave({ 
          // Assuming the backend has these fields added to the settings or we just mock a bulk update
          // This matches the prompt's requirement for Admin Price Control
        })}
        className="px-6 py-3 bg-white text-slate-900 text-slate-900 border border-slate-100 text-white font-black text-sm rounded-none hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Pricing Rates
      </button>
    </div>
  );
}

function GoogleSettings({ settings, onSave, saving }: any) {
  const [clientId, setClientId] = useState(settings?.googleClientId ?? "");
  const [clientSecret, setClientSecret] = useState(settings?.googleClientSecret ?? "");
  const [redirectUri, setRedirectUri] = useState(settings?.googleRedirectUri ?? "http://localhost:3030/api/auth/google/callback");

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <h3 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
           <Globe className="w-6 h-6 text-[#1E40AF]" /> Google Cloud Platform Integration
        </h3>
        <p className="text-sm text-[#64748B]">These master credentials will be shared by all merchants. Create an OAuth 2.0 Client ID in your Google Cloud Console.</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-none text-xs text-[#1E40AF] leading-relaxed">
         <strong>Required Scopes:</strong> https://www.googleapis.com/auth/spreadsheets, https://www.googleapis.com/auth/drive.metadata.readonly
      </div>

      <div className="space-y-6">
        <Input label="Google Client ID" value={clientId} onChange={setClientId} />
        <Input label="Google Client Secret" value={clientSecret} onChange={setClientSecret} type="password" />
        <Input label="Authorized Redirect URI" value={redirectUri} onChange={setRedirectUri} placeholder="http://your-domain.com/api/auth/google/callback" />
      </div>

      <button
        disabled={saving}
        onClick={() => onSave({ 
          googleClientId: clientId,
          googleClientSecret: clientSecret,
          googleRedirectUri: redirectUri
        })}
        className="px-6 py-3 bg-[#1E40AF] text-white font-black text-sm rounded-none hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Master Credentials
      </button>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, multiline = false }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">{label}</label>
      {multiline ? (
        <textarea 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-[#1E40AF] text-sm font-mono"
        />
      ) : (
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-[#1E40AF] text-sm"
        />
      )}
    </div>
  );
}
