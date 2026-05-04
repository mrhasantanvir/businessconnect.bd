import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Globe, 
  Palette, 
  Layout, 
  Settings, 
  CheckCircle2, 
  ExternalLink,
  Save,
  Image as ImageIcon,
  Type,
  CloudLightning
} from "lucide-react";
import { updateStorefrontSettingsAction } from "./actions";
import { BrandingForm } from "./BrandingForm";

export default async function StorefrontSettingsPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const store = await prisma.merchantStore.findUnique({
    where: { id: session.merchantStoreId }
  });

  if (!store) redirect("/login");

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h1 className="text-2xl font-bold text-[#0F172A]  tracking-tight">Storefront Branding</h1>
            <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest leading-none">Design your public identity and custom domain</p>
         </div>
         <div className="flex items-center gap-3">
            <a 
              href={`/s/${store.slug}`} 
              target="_blank"
              className="flex items-center gap-2 px-6 py-4 bg-white  border border-gray-100  rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
            >
               <ExternalLink className="w-4 h-4" /> View Live Store
            </a>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Sidebar Navigation for Settings */}
         <div className="lg:col-span-1 space-y-4">
            <div className="p-8 bg-white  border border-[#E5E7EB]  rounded-[32px] space-y-6 shadow-sm">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1E40AF]">Settings Navigation</h3>
               <nav className="space-y-2">
                  {[
                    { label: "Domain & Identity", icon: Globe, active: true },
                    { label: "Theme Selector", icon: Layout, active: false },
                    { label: "Color Palette", icon: Palette, active: false },
                    { label: "Typography", icon: Type, active: false }
                  ].map(tab => (
                    <button key={tab.label} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-xs ${tab.active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-50'}`}>
                       <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                  ))}
               </nav>
            </div>

            {/* Cloudflare Integration Instructions */}
            <div className="p-8 bg-slate-900 text-white rounded-[32px] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 transform translate-x-1/2 -translate-y-1/2 bg-indigo-500/20 w-32 h-32 rounded-full blur-2xl" />
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="w-10 h-10 bg-[#BEF264] rounded-xl flex items-center justify-center text-green-900 shadow-xl">
                        <CloudLightning className="w-6 h-6" />
                     </div>
                     <span className="text-[9px] font-bold bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-400/20">DNS Guide</span>
                  </div>
                  
                  <div className="space-y-4">
                     <h4 className="text-sm font-bold uppercase tracking-tight">Cloudflare Integration</h4>
                     <div className="space-y-3">
                        <div className="flex gap-3">
                           <div className="w-5 h-5 rounded-full bg-[#BEF264]/10 border border-[#BEF264]/20 flex items-center justify-center text-[#BEF264] text-[10px] font-bold shrink-0">1</div>
                           <p className="text-[10px] font-medium text-slate-300 leading-relaxed">Add your domain in Cloudflare Dashboard</p>
                        </div>
                        <div className="flex gap-3">
                           <div className="w-5 h-5 rounded-full bg-[#BEF264]/10 border border-[#BEF264]/20 flex items-center justify-center text-[#BEF264] text-[10px] font-bold shrink-0">2</div>
                           <p className="text-[10px] font-medium text-slate-300 leading-relaxed">Go to DNS Settings and add a <span className="text-white font-bold">CNAME</span> record</p>
                        </div>
                        <div className="flex gap-3">
                           <div className="w-5 h-5 rounded-full bg-[#BEF264]/10 border border-[#BEF264]/20 flex items-center justify-center text-[#BEF264] text-[10px] font-bold shrink-0">3</div>
                           <p className="text-[10px] font-medium text-slate-300 leading-relaxed uppercase">Target: <span className="text-[#BEF264] font-bold break-all">proxy.businessconnect.bd</span></p>
                        </div>
                        <div className="flex gap-3">
                           <div className="w-5 h-5 rounded-full bg-[#BEF264]/10 border border-[#BEF264]/20 flex items-center justify-center text-[#BEF264] text-[10px] font-bold shrink-0">4</div>
                           <p className="text-[10px] font-medium text-slate-300 leading-relaxed">Set Proxy Status to <span className="text-orange-400 font-bold">DNS Only</span> for SSL propagation</p>
                        </div>
                     </div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                     <p className="text-[9px] font-medium text-indigo-200/60 leading-relaxed uppercase tracking-tight">Propagation may take up to 24 hours.</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Main Settings Form */}
         <div className="lg:col-span-2">
            <BrandingForm store={store} />
         </div>

      </div>

    </div>
  );
}

