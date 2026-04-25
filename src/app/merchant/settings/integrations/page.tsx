"use client";

import React, { useEffect, useState } from "react";
import { 
  Globe, Layout, FileText, Database, ShieldCheck, 
  ChevronRight, RefreshCw, AlertCircle, CheckCircle2,
  ExternalLink, ArrowUpRight, Zap, Settings, Lock
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getIntegrationsStatusAction } from "./actions";

export default function IntegrationHubPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      const data = await getIntegrationsStatusAction();
      setStatus(data);
      setLoading(false);
    }
    loadStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Scanning Integrations...</p>
        </div>
      </div>
    );
  }

  const integrationGroups = [
    {
      title: "eCommerce Pipelines",
      description: "Sync products, orders, and customers from external storefronts.",
      items: [
        {
          id: "woocommerce",
          name: "WooCommerce",
          description: "Connect your WordPress store for automated fulfillment.",
          icon: "https://upload.wikimedia.org/wikipedia/commons/2/2a/WooCommerce_logo.svg",
          link: "/merchant/settings/woocommerce",
          connected: status?.woocommerce?.isConnected,
          active: status?.woocommerce?.isActive,
          details: status?.woocommerce?.url || "Not configured"
        },
        {
          id: "shopify",
          name: "Shopify",
          description: "Enterprise-grade sync for high-volume Shopify stores.",
          icon: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Shopify_Logo.png",
          link: "#",
          connected: status?.shopify?.isConnected,
          active: false,
          details: "Coming Soon",
          isLocked: true
        }
      ]
    },
    {
      title: "Data & Automation",
      description: "Automate your workflows and export data to external tools.",
      items: [
        {
          id: "google-sheets",
          name: "Google Sheets",
          description: "Auto-sync every order to a spreadsheet in real-time.",
          icon: "https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg",
          link: "/merchant/settings/google-sheets",
          connected: status?.googleSheets?.isConnected,
          active: status?.googleSheets?.isActive,
          details: status?.googleSheets?.spreadsheetId ? `ID: ...${status.googleSheets.spreadsheetId.slice(-6)}` : "Not linked"
        },
        {
          id: "google-drive",
          name: "Google Drive",
          description: "Auto-backup invoices and delivery notes to the cloud.",
          icon: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
          link: "#",
          connected: false,
          active: false,
          details: "Internal Beta",
          isLocked: true
        }
      ]
    },
    {
      title: "Analytics & Tracking",
      description: "Measure performance and track visitor behavior across your store.",
      items: [
        {
          id: "analytics",
          name: "Marketing Intelligence",
          description: "Google Analytics, FB Pixel, and Microsoft Clarity integration.",
          icon: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_Ads_logo.svg",
          link: "/merchant/settings/integrations/analytics",
          connected: !!(status?.analytics?.hasActiveTracking),
          active: true,
          details: status?.analytics?.statusText || "Configure Tracking"
        }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-12 animate-in fade-in duration-700">
      
      {/* Hero Header */}
      <div className="relative p-10 rounded-[40px] bg-indigo-600 overflow-hidden shadow-2xl shadow-indigo-500/20">
         <div className="absolute top-0 right-0 p-12 opacity-10 animate-pulse">
            <Zap className="w-64 h-64 text-white" />
         </div>
         <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-6 backdrop-blur-md">
               <ShieldCheck className="w-3 h-3" /> Secure Integration Node
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
               Integration <span className="text-indigo-200/50">Control Hub</span>
            </h1>
            <p className="text-indigo-100/70 text-base font-medium leading-relaxed">
               Centralize your business ecosystem. Connect WooCommerce, Google Sheets, and other platforms to create a seamless, automated workflow.
            </p>
         </div>
      </div>

      {/* Main Integration Grid */}
      <div className="space-y-16">
        {integrationGroups.map((group, idx) => (
          <div key={idx} className="space-y-6">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-indigo-500 pl-6">
                <div>
                   <h2 className="text-2xl font-black text-foreground tracking-tight uppercase italic">{group.title}</h2>
                   <p className="text-sm text-muted-foreground font-medium">{group.description}</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.items.map((item) => (
                  <div 
                    key={item.id}
                    className={cn(
                      "group p-8 rounded-[32px] border transition-all duration-500 relative overflow-hidden",
                      item.isLocked ? "bg-gray-50/50  border-surface-border opacity-60" : 
                      item.connected ? "bg-white  border-green-500/30 shadow-lg shadow-green-500/5 hover:border-green-500" :
                      "bg-white  border-surface-border hover:border-indigo-500/30 shadow-sm"
                    )}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-6 right-6">
                       {item.isLocked ? (
                         <div className="px-3 py-1 bg-gray-200  rounded-full flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Locked</span>
                         </div>
                       ) : item.connected ? (
                         <div className={cn(
                           "px-3 py-1 rounded-full flex items-center gap-1.5",
                           item.active ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                         )}>
                            {item.active ? <CheckCircle2 className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 animate-spin-slow" />}
                            <span className="text-[9px] font-black uppercase tracking-widest">{item.active ? "Active" : "Paused"}</span>
                         </div>
                       ) : (
                         <div className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Disconnected</span>
                         </div>
                       )}
                    </div>

                    <div className="flex items-start gap-6">
                       <div className="w-16 h-16 rounded-2xl bg-gray-50  p-3 flex items-center justify-center border border-surface-border group-hover:scale-110 transition-transform duration-500 shadow-inner">
                          <img src={item.icon} alt={item.name} className={cn("w-full h-full object-contain", item.isLocked && "grayscale")} />
                       </div>
                       <div className="flex-1 space-y-1">
                          <h4 className="text-xl font-black text-foreground">{item.name}</h4>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed">{item.description}</p>
                          
                          <div className="pt-4 flex items-center justify-between">
                             <div className="flex flex-col">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Current Source</span>
                                <span className="text-[10px] font-bold text-foreground truncate max-w-[150px]">{item.details}</span>
                             </div>
                             {!item.isLocked && (
                               <Link 
                                href={item.link}
                                className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                  item.connected ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:scale-110"
                                )}
                               >
                                  {item.connected ? <Settings className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                               </Link>
                             )}
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        ))}
      </div>

      {/* Security Footer */}
      <div className="p-8 rounded-[32px] bg-gray-50  border border-surface-border flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
               <ShieldCheck className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
               <h5 className="text-sm font-black text-foreground uppercase tracking-tight">Enterprise Security</h5>
               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">All API Keys are encrypted with AES-256-GCM</p>
            </div>
         </div>
         <button className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] hover:underline flex items-center gap-2">
            View API Logs <ExternalLink className="w-3 h-3" />
         </button>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

