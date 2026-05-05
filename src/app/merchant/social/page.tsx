"use client";

import React, { useState, useEffect } from "react";
import { 
  Share2, 
  Copy, 
  CheckCircle2, 
  Facebook, 
  MessageCircle, 
  RefreshCw,
  ExternalLink,
  Info,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  Settings2,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { 
  getFacebookConfigAction, 
  updateFacebookConfigAction, 
  getDiscoveryDataAction,
  getFacebookAdsROIAction 
} from "./actions";
import { useSearchParams } from "next/navigation";

export default function UnifiedMetaHubPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"SYNC" | "ADS" | "CHATBOT">("SYNC");
  const [config, setConfig] = useState<any>(null);
  const [discovery, setDiscovery] = useState<any>(null);
  const [roi, setRoi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Success/Error toast logic
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const [cfg, disco, r] = await Promise.all([
        getFacebookConfigAction(),
        getDiscoveryDataAction(),
        getFacebookAdsROIAction()
      ]);
      setConfig(cfg);
      setDiscovery(disco);
      setRoi(r);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const feedUrl = `https://businessconnect.bd/api/catalog/${config?.merchantStoreId || '...'}/feed`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAssets = async (formData: FormData) => {
    setSaving(true);
    try {
      await updateFacebookConfigAction({
        adAccountId: formData.get("adAccountId") as string,
        pixelId: formData.get("pixelId") as string,
        pageId: formData.get("pageId") as string,
      });
      await fetchInitialData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Synchronizing Meta Hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Header & Connection Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-4">
              <Facebook className="w-10 h-10 text-blue-600" /> Meta Business Center
            </h1>
            <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Unified Ads & Chatbot Intelligence</p>
         </div>
         
         {!config?.accessToken ? (
            <a 
              href="/api/auth/facebook/login"
              className="flex items-center gap-3 px-8 py-4 bg-[#1877F2] text-white rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl hover:bg-[#166fe5] transition-all transform hover:-translate-y-1"
            >
               Connect with Facebook <Facebook className="w-4 h-4" />
            </a>
         ) : (
            <div className="flex items-center gap-3 px-6 py-3 bg-green-50 border border-green-100 rounded-2xl">
               <ShieldCheck className="w-5 h-5 text-green-600" />
               <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Successfully Authorized</span>
            </div>
         )}
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-bold animate-in zoom-in">
           ✅ {success === 'MetaConnected' ? 'Meta Account Linked Successfully. Now map your assets below.' : success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
         <TabButton active={activeTab === 'SYNC'} onClick={() => setActiveTab('SYNC')} icon={Share2} label="Catalog Sync" />
         <TabButton active={activeTab === 'ADS'} onClick={() => setActiveTab('ADS')} icon={BarChart3} label="Ads Intelligence" />
         <TabButton active={activeTab === 'CHATBOT'} onClick={() => setActiveTab('CHATBOT')} icon={MessageCircle} label="Chatbot Setup" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
         
         {/* Main Content Area */}
         <div className="lg:col-span-8 space-y-8">
            {activeTab === 'SYNC' && (
               <div className="bg-white border border-[#E5E7EB] rounded-[48px] p-10 shadow-sm space-y-8">
                  <div className="flex items-center justify-between">
                     <h2 className="text-2xl font-bold flex items-center gap-3"><Zap className="w-6 h-6 text-yellow-500"/> Smart Catalog Feed</h2>
                     <button onClick={copyToClipboard} className="text-xs font-bold text-indigo-600 flex items-center gap-2 hover:underline">
                        {copied ? 'Copied URL!' : 'Copy Catalog URL'}
                     </button>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                     Your live inventory is automatically synced with Facebook Business Manager every hour. 
                     Make sure to use the **Data Feed** method in Meta Commerce Manager.
                  </p>
                  <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 break-all font-mono text-[10px] text-indigo-600 select-all cursor-pointer">
                     {feedUrl}
                  </div>
               </div>
            )}

            {activeTab === 'ADS' && (
               <div className="space-y-8 animate-in slide-in-from-right-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <ROICard title="Total Sales" value={`৳ ${roi?.totalRevenue.toLocaleString("en-US")}`} icon={TrendingUp} color="blue" />
                     <ROICard title="Ad Spend (Est.)" value={`৳ ${roi?.adSpend.toLocaleString("en-US")}`} icon={BarChart3} color="orange" />
                     <ROICard title="Hub ROAS" value={`${roi?.roas}x`} icon={Zap} color="green" />
                  </div>

                  <div className="bg-white border border-[#E5E7EB] rounded-[48px] p-10 shadow-sm">
                     <h2 className="text-xl font-bold mb-6 flex items-center gap-3 font-outfit uppercase tracking-tight">
                        <Settings2 className="w-5 h-5" /> Marketing Asset Mapping
                     </h2>
                     
                     {!config?.accessToken ? (
                        <div className="bg-blue-50 border border-blue-100 p-8 rounded-3xl text-center space-y-4">
                           <p className="text-sm font-bold text-blue-700 uppercase tracking-widest">Meta API Access Needed</p>
                           <p className="text-xs text-blue-600/70">Connect your account first to fetch your Ad Accounts and Pixels.</p>
                        </div>
                     ) : (
                        <form action={handleSaveAssets} className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <SelectField 
                                label="Facebook Ad Account" 
                                name="adAccountId" 
                                defaultValue={config?.adAccountId}
                                options={discovery?.adAccounts.map((a: any) => ({ label: a.name, value: a.id })) || []}
                              />
                              <SelectField 
                                label="Tracking Pixel ID" 
                                name="pixelId" 
                                defaultValue={config?.pixelId}
                                options={discovery?.pixels.map((p: any) => ({ label: p.name, value: p.id })) || []}
                              />
                           </div>
                           <button 
                             disabled={saving}
                             type="submit" 
                             className="w-full py-4 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-black transition-all"
                           >
                              {saving ? 'Saving Asset Map...' : 'Save Marketing Configuration'}
                           </button>
                        </form>
                     )}
                  </div>
               </div>
            )}

            {activeTab === 'CHATBOT' && (
               <div className="bg-white border border-[#E5E7EB] rounded-[48px] p-10 shadow-sm space-y-8 animate-in slide-in-from-right-4">
                  <h2 className="text-xl font-bold flex items-center gap-3 uppercase tracking-tight">
                     <MessageCircle className="w-6 h-6 text-green-600"/> Automation Master
                  </h2>
                  <p className="text-sm font-medium text-gray-500">
                     Select which Facebook Page you want the **AI-Commerce Bot** to manage. 
                     The bot will handle price queries, product discovery, and order links automatically.
                  </p>
                  
                  {config?.accessToken ? (
                     <form action={handleSaveAssets} className="space-y-6">
                        <SelectField 
                           label="Primary Messenger Page" 
                           name="pageId" 
                           defaultValue={config?.pageId}
                           options={discovery?.pages.map((pg: any) => ({ label: pg.name, value: pg.id })) || []}
                        />
                        <button 
                           disabled={saving}
                           type="submit" 
                           className="w-full py-4 bg-[#16A34A] text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-green-700 transition-all shadow-lg"
                        >
                           {saving ? 'Linking Page...' : 'Activate AI Chatbot for selected page'}
                        </button>
                     </form>
                  ) : (
                    <div className="p-8 bg-gray-50 border border-dashed border-gray-300 rounded-[32px] text-center">
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Connect Facebook to see available pages</p>
                    </div>
                  )}
               </div>
            )}
         </div>

         {/* Sidebar Stats / Info */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden group">
               <BarChart3 className="absolute bottom-[-10px] right-[-10px] w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-70">Hub Health</h3>
               <div className="space-y-4">
                  <StatusRow label="Graph Auth" active={!!config?.accessToken} />
                  <StatusRow label="CAPI Tracking" active={!!config?.pixelId} />
                  <StatusRow label="Chatbot Webhook" active={!!config?.pageId} />
               </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-[40px] p-8 space-y-4">
               <h4 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" /> Meta Integration Guide
               </h4>
               <ul className="space-y-3">
                  <GuideItem step="1" text="Connect your Business Profile" />
                  <GuideItem step="2" text="Grant Ads & Messaging Permissions" />
                  <GuideItem step="3" text="Select Ad Account & Primary Page" />
                  <GuideItem step="4" text="Verify ROI in Intelligence Tab" />
               </ul>
            </div>
         </div>

      </div>
    </div>
  );
}

function TabButton({ active, label, icon: Icon, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
        active ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' : 'text-gray-400 hover:text-[#0F172A]'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function ROICard({ title, value, icon: Icon, color }: any) {
   return (
      <div className={`bg-white border-2 border-transparent hover:border-${color}-500/30 rounded-[32px] p-6 shadow-sm space-y-2 transition-all group`}>
         <div className={`w-10 h-10 bg-${color}-50 rounded-xl flex items-center justify-center text-${color}-600 group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
         </div>
         <div className="text-xl font-bold tracking-tight">{value}</div>
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      </div>
   );
}

function SelectField({ label, name, options, defaultValue }: any) {
   return (
      <div className="space-y-2">
         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
         <select 
            name={name}
            defaultValue={defaultValue}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0F172A] outline-none focus:ring-2 focus:ring-indigo-500/20"
         >
            <option value="">Select an asset...</option>
            {options.map((opt: any) => (
               <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
         </select>
      </div>
   );
}

function StatusRow({ label, active }: any) {
   return (
      <div className="flex items-center justify-between">
         <span className="text-[10px] font-bold uppercase opacity-80">{label}</span>
         <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400'}`} />
      </div>
   );
}

function GuideItem({ step, text }: any) {
   return (
      <li className="flex items-start gap-3">
         <span className="text-[10px] font-bold w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center shrink-0">{step}</span>
         <span className="text-[10px] font-bold text-gray-500 uppercase leading-none mt-1.5">{text}</span>
      </li>
   );
}

