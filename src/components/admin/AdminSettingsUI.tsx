"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, MessageSquare, Mail, Bell, 
  Smartphone, Save, ShieldCheck, Database, 
  CheckCircle2, AlertCircle, Loader2, Globe,
  MessageCircle, DollarSign, Search, Cloud,
  Key, Shield, CreditCard
} from "lucide-react";
import { getSystemSettingsAction, updateSystemSettingsAction, getEmailTemplatesAction, updateEmailTemplateAction, testOpenAIConnectionAction, testSmsConnectionAction } from "@/app/admin/settings/actions";
import { RichEditor } from "@/components/ui/RichEditor";
import { Sparkles, BrainCircuit, Scan, Terminal } from "lucide-react";

import { useRouter, usePathname } from "next/navigation";

type Tab = "GENERAL" | "SMS" | "REALTIME" | "MAIL" | "WHATSAPP" | "PRICING" | "GOOGLE" | "SEO" | "STORAGE" | "EMAIL_TEMPLATES" | "PAYMENTS";

interface AdminSettingsUIProps {
  activeTab: Tab;
}

export function AdminSettingsUI({ activeTab }: AdminSettingsUIProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getSystemSettingsAction();
      const tmpls = await getEmailTemplatesAction();
      setSettings(data);
      setTemplates(tmpls);
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
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-3">
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
            onClick={() => router.push("/admin/settings/general")} 
            icon={ShieldCheck} 
            label="General Support" 
            sub="System Toggles"
          />
          <TabButton 
            active={activeTab === "SMS"} 
            onClick={() => router.push("/admin/settings/sms")} 
            icon={Smartphone} 
            label="SMS Gateways" 
            sub="Firebase & BD APIs"
          />
          <TabButton 
            active={activeTab === "REALTIME"} 
            onClick={() => router.push("/admin/settings/realtime")} 
            icon={Bell} 
            label="Real-time" 
            sub="Pusher Config"
          />
          <TabButton 
            active={activeTab === "MAIL"} 
            onClick={() => router.push("/admin/settings/mail")} 
            icon={Mail} 
            label="Mail (SMTP)" 
            sub="Amazon SES & More"
          />
          <TabButton 
            active={activeTab === "WHATSAPP"} 
            onClick={() => router.push("/admin/settings/whatsapp")} 
            icon={MessageCircle} 
            label="WhatsApp" 
            sub="Business API"
          />
          <TabButton 
            active={activeTab === "PRICING"} 
            onClick={() => router.push("/admin/settings/pricing")} 
            icon={DollarSign} 
            label="Resource Pricing" 
            sub="Global Rates"
          />
          <TabButton 
            active={activeTab === "GOOGLE"} 
            onClick={() => router.push("/admin/settings/google")} 
            icon={Globe} 
            label="Google Cloud" 
            sub="App Sync Keys"
          />
          <TabButton 
            active={activeTab === "SEO"} 
            onClick={() => router.push("/admin/settings/seo")} 
            icon={Search} 
            label="SEO & Branding" 
            sub="Meta & Social"
          />
          <TabButton 
            active={activeTab === "STORAGE"} 
            onClick={() => router.push("/admin/settings/storage")} 
            icon={Cloud} 
            label="Cloud Storage" 
            sub="CDN & Buckets"
          />
          <TabButton 
            active={activeTab === "EMAIL_TEMPLATES"} 
            onClick={() => router.push("/admin/settings/email-templates")} 
            icon={Mail} 
            label="Email Templates" 
            sub="Auto Responses"
          />
          <TabButton 
            active={activeTab === "PAYMENTS"} 
            onClick={() => router.push("/admin/settings/payments")} 
            icon={CreditCard} 
            label="Payment Gateways" 
            sub="bKash & Nagad"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-[#E5E7EB] rounded-none shadow-xl overflow-visible min-h-[500px]">
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
              {activeTab === "SEO" && (
                <SeoSettings 
                  settings={settings} 
                  onSave={handleSave} 
                  saving={saving} 
                />
              )}
              {activeTab === "STORAGE" && (
                <CloudStorageSettings 
                  settings={settings} 
                  onSave={handleSave} 
                  saving={saving} 
                />
              )}
              {activeTab === "EMAIL_TEMPLATES" && (
                <EmailTemplateSettings 
                  templates={templates} 
                />
              )}
              {activeTab === "PAYMENTS" && (
                <PaymentSettings 
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
          ? "bg-[#0F172A] text-white border-[#0F172A] shadow-lg translate-x-1" 
          : "bg-white text-[#64748B] border-[#E5E7EB] hover:bg-gray-50"
      }`}
    >
      <div className={`w-10 h-10 flex items-center justify-center rounded-none ${
        active ? "bg-white/10" : "bg-gray-100"
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm font-bold tracking-tight">{label}</div>
        <div className={`text-[10px] font-bold uppercase tracking-wider ${
          active ? "text-white/60" : "text-[#A1A1AA]"
        }`}>{sub}</div>
      </div>
    </button>
  );
}

// --- Specific Settings Components ---

function GeneralSettings({ settings, onSave, saving }: any) {
  const [isEnabled, setIsEnabled] = useState(settings?.isLiveChatEnabled ?? true);
  const [isFraudEnabled, setIsFraudEnabled] = useState(settings?.isFraudCheckEnabled ?? true);
  const [masterPassword, setMasterPassword] = useState(settings?.masterPassword || "");

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
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
      <div className="p-6 bg-white border border-gray-100 rounded-none space-y-4">
        <div>
          <div className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <Key className="w-4 h-4 text-[#1E40AF]" /> Security Override
          </div>
          <p className="text-[10px] text-[#64748B] font-bold uppercase mt-1 tracking-wider">Super Admin Master Password</p>
        </div>
        <div className="relative">
          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder="Set Master Bypass Password"
            className="w-full bg-gray-50 border border-gray-100 focus:border-[#1E40AF] rounded-none pl-12 pr-5 py-4 text-xs font-bold outline-none transition-all"
          />
        </div>
        <p className="text-[10px] font-medium text-amber-600 bg-amber-50 p-2 border border-amber-100">
          ⚠️ <strong>WARNING:</strong> This password allows logging into ANY account without 2FA. Keep it extremely secure.
        </p>
      </div>

      <button
        disabled={saving}
        onClick={() => onSave({ 
          isLiveChatEnabled: isEnabled,
          isFraudCheckEnabled: isFraudEnabled,
          masterPassword: masterPassword
        })}
        className="px-6 py-3 bg-[#1E40AF] text-white font-bold text-sm rounded-none hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
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
    { id: "SSLCOMMERZ", name: "SSL Commerz (SSL Wireless)" },
    { id: "FIREBASE", name: "Firebase Auth Flow" },
    { id: "ELITBUZZ", name: "ElitBuzz BD" },
    { id: "GREENWEB", name: "GreenWeb BD" },
    { id: "BULKSMSBD", name: "BulkSMSBD" },
    { id: "INFOBIP", name: "Infobip Global" },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
           <Smartphone className="w-6 h-6" /> SMS Gateway Configuration
        </h3>
        <p className="text-sm text-[#64748B]">Select and configure your active SMS provider for OTPs and notifications.</p>
        
        {provider === "SSLCOMMERZ" && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-none text-xs text-[#1E40AF] space-y-2">
            <p className="font-bold flex items-center gap-2 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> SSLCommerz Integration Active
            </p>
            <p>This provider is currently used for <strong>Merchant Phone Verification (OTP)</strong>.</p>
            <p>• <strong>API Key / Token</strong>: Use the Secret Token provided by SSL Wireless.</p>
            <p>• <strong>Sender ID / Masking</strong>: Use your approved SID (e.g., RAJBRAND).</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Active Provider</label>
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
              <div className="text-[9px] text-[#A1A1AA] uppercase font-bold mt-1">
                {provider === p.id ? "Active" : "Select"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">API Key / Token</label>
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-[#1E40AF] text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Sender ID / Masking</label>
          <input 
            type="text"
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-[#1E40AF] text-sm"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">API Endpoint URL (Optional)</label>
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
        className="px-6 py-3 bg-[#1E40AF] text-white font-bold text-sm rounded-none hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Update SMS Gateway
      </button>

      <div className="pt-8 border-t border-gray-100 space-y-4">
         <div className="flex flex-col">
            <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-tight">Diagnostics</h4>
            <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest">Verify API Credentials</p>
         </div>
         
         <div className="flex flex-col sm:flex-row gap-4">
            <input 
               type="text" 
               id="test-sms-phone"
               placeholder="Enter phone number (e.g. 01700000000)" 
               className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-[#1E40AF] text-xs font-bold"
            />
            <button
               id="test-sms-btn"
               onClick={async () => {
                  const input = document.getElementById('test-sms-phone') as HTMLInputElement;
                  const phone = input.value;
                  if (!phone) return alert("Please enter a phone number first.");
                  
                  const btn = document.getElementById('test-sms-btn');
                  if (btn) {
                     btn.innerHTML = "Sending...";
                     (btn as HTMLButtonElement).disabled = true;
                  }

                  try {
                     const res = await testSmsConnectionAction(phone);
                     if (res.success) {
                        alert("✅ SMS Sent Successfully! Please check the device.");
                     } else {
                        alert("❌ Failed to send SMS: " + res.error);
                     }
                  } catch (err: any) {
                     alert("❌ Error: " + err.message);
                  } finally {
                     if (btn) {
                        btn.innerHTML = "Test SMS Connection";
                        (btn as HTMLButtonElement).disabled = false;
                     }
                  }
               }}
               className="px-6 py-3 bg-white text-[#1E40AF] border border-[#1E40AF] font-bold text-[10px] uppercase tracking-widest rounded-none hover:bg-gray-50 transition-all whitespace-nowrap"
            >
               Test SMS Connection
            </button>
         </div>
      </div>
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
        <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
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
        className="px-6 py-3 bg-[#1E40AF] text-white font-bold text-sm rounded-none hover:bg-[#1E3A8A] transition-all flex items-center gap-2 disabled:opacity-50"
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
        <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
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

      <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-100">
        <button
          disabled={saving}
          onClick={() => onSave({ 
            smtpHost: host,
            smtpPort: port,
            smtpUser: user,
            smtpPass: pass,
            smtpFrom: from
          })}
          className="px-6 py-3 bg-[#1E40AF] text-white font-bold text-sm rounded-none hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Update SMTP Settings
        </button>

        <div className="flex-1 flex gap-2">
           <input 
             type="email" 
             placeholder="Enter email to test..." 
             className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-[#1E40AF] text-sm font-mono"
             id="test-email-input"
           />
           <button
             onClick={async () => {
               const input = document.getElementById('test-email-input') as HTMLInputElement;
               const email = input.value;
               if (!email) return alert('Please enter an email address first.');
               
               const btn = document.getElementById('test-btn');
               if (btn) btn.innerHTML = 'Sending...';
               
               const { testSmtpConnectionAction } = await import('@/app/admin/settings/actions');
               const res = await testSmtpConnectionAction(email);
               
               if (btn) btn.innerHTML = 'Send Test Email';
               
               if (res.success) alert('Test email sent successfully! Please check your inbox.');
               else alert('Failed to send test email: ' + res.error);
             }}
             id="test-btn"
             className="px-6 py-3 bg-white text-[#1E40AF] border border-[#1E40AF] font-bold text-sm rounded-none hover:bg-gray-50 transition-all whitespace-nowrap"
           >
             Send Test Email
           </button>
        </div>
      </div>
    </div>
  );
}

function WhatsAppSettings({ settings, onSave, saving }: any) {
  const [token, setToken] = useState(settings?.whatsappToken ?? "");
  const [phoneId, setPhoneId] = useState(settings?.whatsappPhoneId ?? "");

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
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
        className="px-6 py-3 bg-[#16A34A] text-white font-bold text-sm rounded-none hover:bg-[#15803D] transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save WhatsApp Integration
      </button>
    </div>
  );
}

function PricingSettings({ settings, onSave, saving }: any) {
  const [smsRate, setSmsRate] = useState(settings?.smsRate ?? 0.50);
  const [sipRate, setSipRate] = useState(settings?.sipRate ?? 1.00);
  const [aiPrice, setAiPrice] = useState(settings?.aiCreditPrice ?? 0.50);
  const [staffPrice, setStaffPrice] = useState(settings?.staffSubscriptionPrice ?? 300);
  const [devicePrice, setDevicePrice] = useState(settings?.additionalDevicePrice ?? 250);

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
           <DollarSign className="w-6 h-6" /> Resource Pricing Control
        </h3>
        <p className="text-sm text-[#64748B]">Set global base rates for platform resources. These values act as defaults for new merchants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Global SMS Rate (BDT/SMS)" value={smsRate} onChange={(v: any) => setSmsRate(parseFloat(v))} type="number" />
        <Input label="Global SIP Rate (BDT/Min)" value={sipRate} onChange={(v: any) => setSipRate(parseFloat(v))} type="number" />
        <Input label="AI Credit Price (BDT/1k)" value={aiPrice} onChange={(v: any) => setAiPrice(parseFloat(v))} type="number" />
        <Input label="Staff Base Price (1st Device)" value={staffPrice} onChange={(v: any) => setStaffPrice(parseFloat(v))} type="number" />
        <Input label="Additional Device Price" value={devicePrice} onChange={(v: any) => setDevicePrice(parseFloat(v))} type="number" />
      </div>

      <button
        disabled={saving}
        onClick={() => onSave({ 
          smsRate,
          sipRate,
          aiCreditPrice: aiPrice,
          staffSubscriptionPrice: staffPrice,
          additionalDevicePrice: devicePrice
        })}
        className="px-6 py-3 bg-[#1E40AF] text-white font-bold text-sm rounded-none hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
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
        <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
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
        className="px-6 py-3 bg-[#1E40AF] text-white font-bold text-sm rounded-none hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Master Credentials
      </button>
    </div>
  );
}

function SeoSettings({ settings, onSave, saving }: any) {
  const [title, setTitle] = useState(settings?.siteTitle ?? "BusinessConnect.bd");
  const [desc, setDesc] = useState(settings?.siteDescription ?? "");
  const [keywords, setKeywords] = useState(settings?.metaKeywords ?? "");
  const [ogImage, setOgImage] = useState(settings?.ogImage ?? "");

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
           <Search className="w-6 h-6" /> SEO & Platform Branding
        </h3>
        <p className="text-sm text-[#64748B]">Manage how the platform appears in Google search results and social media shares.</p>
      </div>

      <div className="space-y-6">
        <Input label="Global Site Title" value={title} onChange={setTitle} placeholder="e.g. BusinessConnect - The Ultimate OS" />
        <Input label="Meta Description" value={desc} onChange={setDesc} multiline placeholder="Describe your platform for search engines..." />
        <Input label="Meta Keywords (Comma separated)" value={keywords} onChange={setKeywords} placeholder="business, platform, automation, bangladesh" />
        <Input label="Social Share Image (URL)" value={ogImage} onChange={setOgImage} placeholder="https://example.com/og-image.jpg" />
      </div>

      <div className="p-6 bg-slate-50 border border-slate-100 rounded-none">
         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Google Preview</div>
         <div className="space-y-1">
            <div className="text-blue-700 text-xl font-medium hover:underline cursor-pointer truncate">{title}</div>
            <div className="text-green-700 text-sm truncate">https://businessconnect.bd</div>
            <div className="text-slate-600 text-sm line-clamp-2">{desc || "Enter a description to see a preview of how this page will appear in search results."}</div>
         </div>
      </div>

      <button
        disabled={saving}
        onClick={() => onSave({ 
          siteTitle: title,
          siteDescription: desc,
          metaKeywords: keywords,
          ogImage: ogImage
        })}
        className="px-6 py-3 bg-[#1E40AF] text-white font-bold text-sm rounded-none hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Update SEO Metadata
      </button>
    </div>
  );
}

function CloudStorageSettings({ settings, onSave, saving }: any) {
  const [provider, setProvider] = useState(settings?.storageProvider ?? "LOCAL");
  const [bucket, setBucket] = useState(settings?.storageBucket ?? "");
  const [endpoint, setEndpoint] = useState(settings?.storageEndpoint ?? "");
  const [accessKey, setAccessKey] = useState(settings?.storageAccessKey ?? "");
  const [secretKey, setSecretKey] = useState(settings?.storageSecretKey ?? "");
  const [cdnUrl, setCdnUrl] = useState(settings?.storageCdnUrl ?? "");

  const providers = [
    { id: "LOCAL", name: "Local Server Disk" },
    { id: "WASABI", name: "Wasabi Hot Storage" },
    { id: "S3", name: "Amazon S3" },
    { id: "AZURE", name: "Azure Blob Storage" },
    { id: "GCP", name: "Google Cloud Storage" },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
           <Cloud className="w-6 h-6 text-[#1E40AF]" /> Cloud Storage & CDN
        </h3>
        <p className="text-sm text-[#64748B]">Configure where merchant documents and product images are stored and served from.</p>
        
        {provider === "LOCAL" && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-none text-xs text-amber-800 space-y-1">
            <p className="font-bold">⚠️ Warning: Using Local Storage</p>
            <p>Files are currently being saved to the local Ubuntu server. This is not recommended for production scaling.</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Storage Provider</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
              <div className="text-[9px] text-[#A1A1AA] uppercase font-bold mt-1">
                {provider === p.id ? "Active" : "Select"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {provider !== "LOCAL" && (
        <div className="space-y-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Bucket / Container Name" value={bucket} onChange={setBucket} placeholder="e.g. businessconnect-assets" />
            <Input label="Endpoint URL (Optional)" value={endpoint} onChange={setEndpoint} placeholder="e.g. s3.ap-southeast-1.wasabisys.com" />
            <Input label="Access Key ID" value={accessKey} onChange={setAccessKey} />
            <Input label="Secret Access Key" value={secretKey} onChange={setSecretKey} type="password" />
          </div>
          
          <div className="space-y-2 pt-4">
             <Input 
               label="CDN Domain URL (Required for serving images)" 
               value={cdnUrl} 
               onChange={setCdnUrl} 
               placeholder="e.g. https://cdn.businessconnect.bd" 
             />
             <p className="text-[10px] text-gray-500 font-medium">Do not include a trailing slash. All image paths will be prefixed with this URL.</p>
          </div>
        </div>
      )}

      <button
        disabled={saving}
        onClick={() => onSave({ 
          storageProvider: provider,
          storageBucket: bucket,
          storageEndpoint: endpoint,
          storageAccessKey: accessKey,
          storageSecretKey: secretKey,
          storageCdnUrl: cdnUrl
        })}
        className="px-6 py-3 bg-[#1E40AF] text-white font-bold text-sm rounded-none hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Storage Configuration
      </button>
    </div>
  );
}


function EmailTemplateSettings({ templates: initialTemplates }: any) {
  const [templates, setTemplates] = useState<any[]>(initialTemplates || []);
  const [activeTemplate, setActiveTemplate] = useState<any>(templates[0] || null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!activeTemplate) return;
    setSaving(true);
    const res = await updateEmailTemplateAction(activeTemplate.id, {
      subject: activeTemplate.subject,
      body: activeTemplate.body
    });
    if (res.success) {
      setTemplates(templates.map(t => t.id === activeTemplate.id ? res.template : t));
      alert("Template saved successfully!");
    } else {
      alert("Failed to save template.");
    }
    setSaving(false);
  };

  if (!activeTemplate) return <div className="p-4 text-sm text-gray-500">No templates found.</div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
           <Mail className="w-6 h-6 text-[#1E40AF]" /> Automated Email Responses
        </h3>
        <p className="text-sm text-[#64748B]">Customize the emails sent to merchants when their application is approved, rejected, or needs document reupload.</p>
      </div>

      <div className="flex gap-2 pb-4 border-b border-gray-100 overflow-x-auto">
        {templates.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTemplate(t)}
            className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${
              activeTemplate.id === t.id ? "bg-[#1E40AF] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <Input 
          label="Email Subject" 
          value={activeTemplate.subject} 
          onChange={(val: string) => setActiveTemplate({...activeTemplate, subject: val})} 
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Email Body</label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
               <button 
                 onClick={() => setActiveTemplate({...activeTemplate, _mode: "HTML"})}
                 className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${activeTemplate._mode !== "PREVIEW" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
               >
                 HTML Source
               </button>
               <button 
                 onClick={() => setActiveTemplate({...activeTemplate, _mode: "PREVIEW"})}
                 className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${activeTemplate._mode === "PREVIEW" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
               >
                 Live Preview
               </button>
            </div>
          </div>

          {activeTemplate._mode === "PREVIEW" ? (
             <div className="w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner p-4 min-h-[400px] flex justify-center items-start">
                <div 
                  className="w-full max-w-2xl bg-white shadow-sm border border-slate-100 rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: activeTemplate.body }} 
                />
             </div>
          ) : (
             <textarea 
               value={activeTemplate.body}
               onChange={(e) => setActiveTemplate({...activeTemplate, body: e.target.value})}
               rows={16}
               className="w-full p-4 bg-[#0F172A] text-[#38BDF8] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E40AF] text-sm font-mono leading-relaxed"
               placeholder="Write your HTML template here..."
               spellCheck={false}
             />
          )}

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
             <p className="text-[10px] font-bold uppercase text-blue-600 mb-2">Available Variables:</p>
             <div className="flex flex-wrap gap-2">
                {["{{store_name}}", "{{merchant_name}}", "{{missing_documents}}", "{{message}}", "{{due_amount}}", "{{due_date}}", "{{plan_name}}"].map(v => (
                  <span key={v} className="bg-white text-blue-700 px-2 py-1 rounded-md text-[10px] font-mono border border-blue-200">{v}</span>
                ))}
             </div>
          </div>
        </div>
      </div>

      <button
        disabled={saving}
        onClick={handleSave}
        className="px-6 py-3 bg-[#1E40AF] text-white font-bold text-sm rounded-none hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Template
      </button>
    </div>
  );
}

function PaymentSettings({ settings, onSave, saving }: any) {
  const [bkashAppKey, setBkashAppKey] = useState(settings?.bkashAppKey ?? "");
  const [bkashAppSecret, setBkashAppSecret] = useState(settings?.bkashAppSecret ?? "");
  const [bkashUsername, setBkashUsername] = useState(settings?.bkashUsername ?? "");
  const [bkashPassword, setBkashPassword] = useState(settings?.bkashPassword ?? "");
  const [bkashIsLive, setBkashIsLive] = useState(settings?.bkashIsLive ?? false);

  const [nagadMerchantId, setNagadMerchantId] = useState(settings?.nagadMerchantId ?? "");
  const [nagadPublicKey, setNagadPublicKey] = useState(settings?.nagadPublicKey ?? "");
  const [nagadPrivateKey, setNagadPrivateKey] = useState(settings?.nagadPrivateKey ?? "");
  const [nagadIsLive, setNagadIsLive] = useState(settings?.nagadIsLive ?? false);

  return (
    <div className="space-y-10 max-w-4xl">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
           <CreditCard className="w-6 h-6 text-[#E11D48]" /> Payment Gateway Configurations
        </h3>
        <p className="text-sm text-[#64748B]">Configure global bKash and Nagad credentials for merchant billing and resource purchases.</p>
      </div>

      {/* bKash Section */}
      <div className="bg-pink-50/30 border border-pink-100 p-8 space-y-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#E11D48] flex items-center justify-center rounded-xl shadow-lg shadow-pink-200">
                 <span className="text-white font-bold text-xs">BK</span>
              </div>
              <div>
                 <h4 className="text-lg font-bold text-[#0F172A] uppercase tracking-tight">bKash <span className="text-[#E11D48]">Checkout</span></h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Mobile Financial Service Integration</p>
              </div>
           </div>
           <div className="flex items-center gap-3 bg-white p-2 border border-pink-100">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${bkashIsLive ? 'text-green-600' : 'text-amber-600'}`}>
                 {bkashIsLive ? 'Live Mode' : 'Sandbox Mode'}
              </span>
              <button 
                onClick={() => setBkashIsLive(!bkashIsLive)}
                className={`relative w-12 h-6 rounded-full transition-colors ${bkashIsLive ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${bkashIsLive ? 'left-7' : 'left-1'}`} />
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Input label="App Key" value={bkashAppKey} onChange={setBkashAppKey} />
           <Input label="App Secret" value={bkashAppSecret} onChange={setBkashAppSecret} type="password" />
           <Input label="Username" value={bkashUsername} onChange={setBkashUsername} />
           <Input label="Password" value={bkashPassword} onChange={setBkashPassword} type="password" />
        </div>
      </div>

      {/* Nagad Section */}
      <div className="bg-orange-50/30 border border-orange-100 p-8 space-y-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#F97316] flex items-center justify-center rounded-xl shadow-lg shadow-orange-200">
                 <span className="text-white font-bold text-xs">NG</span>
              </div>
              <div>
                 <h4 className="text-lg font-bold text-[#0F172A] uppercase tracking-tight">Nagad <span className="text-[#F97316]">Gateway</span></h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Post-Payment Verification Mode</p>
              </div>
           </div>
           <div className="flex items-center gap-3 bg-white p-2 border border-orange-100">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${nagadIsLive ? 'text-green-600' : 'text-amber-600'}`}>
                 {nagadIsLive ? 'Live Mode' : 'Sandbox Mode'}
              </span>
              <button 
                onClick={() => setNagadIsLive(!nagadIsLive)}
                className={`relative w-12 h-6 rounded-full transition-colors ${nagadIsLive ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${nagadIsLive ? 'left-7' : 'left-1'}`} />
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="md:col-span-2">
              <Input label="Merchant ID" value={nagadMerchantId} onChange={setNagadMerchantId} />
           </div>
           <Input label="Public Key" value={nagadPublicKey} onChange={setNagadPublicKey} multiline />
           <Input label="Private Key" value={nagadPrivateKey} onChange={setNagadPrivateKey} multiline type="password" />
        </div>
      </div>

      <button
        disabled={saving}
        onClick={() => onSave({ 
          bkashAppKey,
          bkashAppSecret,
          bkashUsername,
          bkashPassword,
          bkashIsLive,
          nagadMerchantId,
          nagadPublicKey,
          nagadPrivateKey,
          nagadIsLive
        })}
        className="px-10 py-4 bg-[#0F172A] text-white font-bold text-sm rounded-none hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50 shadow-2xl shadow-slate-200"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        DEPLOY PAYMENT SETTINGS
      </button>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, multiline = false }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">{label}</label>
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
