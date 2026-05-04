import React from "react";
import { Cpu, ShieldCheck, Zap } from "lucide-react";
import SystemUpdateWidget from "@/components/admin/SystemUpdateWidget";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function SystemUpdatePage() {
  const session = await getSession();
  
  if (!session || session.role !== "SUPER_ADMIN") {
    notFound();
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
             <Cpu className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System <span className="text-indigo-600">Update Center</span></h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Enterprise Orchestration & Lifecycle</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
           <ShieldCheck className="w-5 h-5" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Environment: Stable</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
         <SystemUpdateWidget />
         
         <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Deployment Best Practices</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                     <div className="text-indigo-400 text-xs font-bold uppercase">01. Verify Staging</div>
                     <p className="text-slate-400 text-[10px] leading-relaxed">Always check the dev.businessconnect.bd environment before pushing to production.</p>
                  </div>
                  <div className="space-y-3">
                     <div className="text-indigo-400 text-xs font-bold uppercase">02. Backups Active</div>
                     <p className="text-slate-400 text-[10px] leading-relaxed">Automated database snapshots are taken every 6 hours and before every deployment.</p>
                  </div>
                  <div className="space-y-3">
                     <div className="text-indigo-400 text-xs font-bold uppercase">03. Zero Downtime</div>
                     <p className="text-slate-400 text-[10px] leading-relaxed">The system uses PM2 reload to swap instances without dropping active connections.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
