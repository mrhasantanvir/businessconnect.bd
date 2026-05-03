import React from "react";
import { Activity, TrendingUp, Zap, Clock, Star, Award } from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PerformancePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-emerald-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-emerald-100">
          <Activity className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Performance Hub</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time productivity & growth analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Efficiency Score", value: "94%", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Tasks Completed", value: "128", icon: Award, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Active Hours", value: "164h", icon: Clock, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-6 max-w-xl">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
              <TrendingUp className="w-4 h-4" /> Coming Soon
           </div>
           <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Advanced Neural <span className="text-emerald-500">Analytics</span></h2>
           <p className="text-slate-400 font-bold leading-relaxed">
             We are training a custom AI model to analyze your business performance, staff efficiency, and growth patterns. 
             Detailed insights will be available in the next major update.
           </p>
           <div className="flex gap-4 pt-4">
              <div className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl">
                 <Star className="w-4 h-4 text-amber-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest">AI Insights</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl">
                 <Activity className="w-4 h-4 text-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Real-time Sync</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");
