"use client";

import React, { useEffect, useState } from "react";
import { 
  BarChart3, Save, ArrowLeft, ShieldCheck, 
  Search, ExternalLink, Zap, AlertTriangle 
} from "lucide-react";
import Link from "next/link";
import { getAnalyticsSettingsAction, updateAnalyticsSettingsAction } from "./actions";
import { toast } from "sonner";

export default function AnalyticsSettingsPage() {
  const [settings, setSettings] = useState({
    googleAnalyticsId: "",
    gtmId: "",
    fbPixelId: "",
    msClarityId: "",
    customScripts: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getAnalyticsSettingsAction();
        if (data) {
          setSettings({
            googleAnalyticsId: data.googleAnalyticsId || "",
            gtmId: data.gtmId || "",
            fbPixelId: data.fbPixelId || "",
            msClarityId: data.msClarityId || "",
            customScripts: data.customScripts || "",
          });
        }
      } catch (err) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAnalyticsSettingsAction(settings);
      toast.success("Tracking settings updated successfully");
    } catch (err) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] w-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/merchant/settings/integrations" className="p-3 bg-white  border border-surface-border rounded-2xl hover:bg-gray-50 transition-all">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight uppercase">Tracking & Analytics</h1>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Configure your marketing and measurement pixels</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-bold uppercase shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Google Ecosystem */}
        <div className="space-y-6">
          <div className="p-6 bg-white  rounded-[32px] border border-surface-border space-y-6">
            <div className="flex items-center gap-4 border-b border-surface-border pb-4">
              <div className="w-10 h-10 bg-gray-50  p-2 rounded-xl border border-surface-border">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_Ads_logo.svg" className="w-full h-full object-contain" alt="Google" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight">Google Analytics & GTM</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">GA4 Measurement ID</label>
                <input 
                  type="text" 
                  value={settings.googleAnalyticsId}
                  onChange={(e) => setSettings({...settings, googleAnalyticsId: e.target.value})}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full bg-gray-50  border border-surface-border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Tag Manager ID</label>
                <input 
                  type="text" 
                  value={settings.gtmId}
                  onChange={(e) => setSettings({...settings, gtmId: e.target.value})}
                  placeholder="GTM-XXXXXXX"
                  className="w-full bg-gray-50  border border-surface-border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Microsoft Clarity */}
          <div className="p-6 bg-white  rounded-[32px] border border-surface-border space-y-6">
            <div className="flex items-center gap-4 border-b border-surface-border pb-4">
              <div className="w-10 h-10 bg-gray-50  p-2 rounded-xl border border-surface-border">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Microsoft_Logo.svg" className="w-full h-full object-contain" alt="Microsoft" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight">Microsoft Clarity</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Clarity Project ID</label>
              <input 
                type="text" 
                value={settings.msClarityId}
                onChange={(e) => setSettings({...settings, msClarityId: e.target.value})}
                placeholder="Project ID"
                className="w-full bg-gray-50  border border-surface-border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Facebook & Custom */}
        <div className="space-y-6">
          {/* Meta Pixel */}
          <div className="p-6 bg-white  rounded-[32px] border border-surface-border space-y-6">
            <div className="flex items-center gap-4 border-b border-surface-border pb-4">
              <div className="w-10 h-10 bg-gray-50  p-2 rounded-xl border border-surface-border">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" className="w-full h-full object-contain" alt="Meta" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight">Meta Pixel</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Pixel ID</label>
              <input 
                type="text" 
                value={settings.fbPixelId}
                onChange={(e) => setSettings({...settings, fbPixelId: e.target.value})}
                placeholder="Pixel ID"
                className="w-full bg-gray-50  border border-surface-border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Custom Scripts */}
          <div className="p-6 bg-white  rounded-[32px] border border-surface-border space-y-6">
            <div className="flex items-center gap-4 border-b border-surface-border pb-4">
              <div className="w-10 h-10 bg-indigo-500/10 p-2 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight">Custom Header Scripts</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Head Scripts (HTML)</label>
              <textarea 
                rows={6}
                value={settings.customScripts}
                onChange={(e) => setSettings({...settings, customScripts: e.target.value})}
                placeholder="<!-- Paste your custom tracking scripts here -->"
                className="w-full bg-gray-50  border border-surface-border rounded-xl px-4 py-3 text-[10px] font-mono focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
              <p className="text-[8px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5 px-1">
                <AlertTriangle className="w-3 h-3" /> Warning: Scripts will be injected into the storefront header. Use with caution.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Help Section */}
      <div className="p-8 rounded-[32px] bg-indigo-600 text-white space-y-4 shadow-xl shadow-indigo-600/20">
         <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-indigo-200" />
            <h4 className="text-sm font-bold uppercase tracking-tight">Marketing Intelligence Guide</h4>
         </div>
         <p className="text-xs font-medium text-indigo-100 leading-relaxed opacity-80">
            By integrating these tracking tools, you'll gain deep insights into your customer's behavior. Google Analytics helps you track traffic, while Facebook Pixel enables high-performance retargeting ads. Microsoft Clarity provides heatmaps and session recordings to see how users interact with your store.
         </p>
      </div>

    </div>
  );
}

function RefreshCw({ className }: { className: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
      <path d="M21 3v5h-5"></path>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
      <path d="M8 16H3v5"></path>
    </svg>
  );
}

