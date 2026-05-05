import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Megaphone, 
  Send, 
  Users, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Plus,
  BarChart3,
  Search,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default async function MarketingDashboard() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const campaigns = await prisma.marketingCampaign.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { logs: true } } }
  });

  const stats = {
    totalSent: campaigns.reduce((acc, c) => acc + c.sentCount, 0),
    totalCost: campaigns.reduce((acc, c) => acc + c.totalCost, 0),
    activeCampaigns: campaigns.filter(c => c.status === "SENDING").length
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Header & Actions Hub */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h1 className="text-2xl font-bold text-[#0F172A]  tracking-tight">Marketing Hub</h1>
            <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest leading-none">Automate your sales growth with targeted campaigns</p>
         </div>
         <div className="flex items-center gap-3">
            <Link 
              href="/merchant/campaigns/create" 
              className="flex items-center gap-2 px-6 py-4 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
            >
               <Plus className="w-4 h-4" /> Start New Campaign
            </Link>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Total Sent SMS", value: stats.totalSent.toLocaleString("en-US"), icon: Send, color: "bg-indigo-500" },
           { label: "Marketing Spend", value: `৳${stats.totalCost.toLocaleString("en-US")}`, icon: CreditCard, color: "bg-orange-500" },
           { label: "Active Broadcasts", value: stats.activeCampaigns, icon: Megaphone, color: "bg-[#BEF264] text-green-900" }
         ].map((stat, i) => (
           <div key={i} className="bg-white  border border-gray-100  p-6 rounded-[32px] flex items-center gap-6 shadow-sm">
              <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                 <stat.icon className="w-7 h-7" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                 <h2 className="text-2xl font-bold mt-2 text-[#0F172A]  leading-none">{stat.value}</h2>
              </div>
           </div>
         ))}
      </div>

      {/* 2. Campaign History & Performance */}
      <div className="bg-white  border border-[#E5E7EB]  rounded-[48px] overflow-hidden shadow-sm">
         
         <div className="p-8 border-b border-[#F1F5F9]  flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
               <Clock className="w-5 h-5 text-indigo-500" /> Recent Campaign History
            </h2>
            <div className="relative group flex-1 max-w-xs mx-4">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
               <input placeholder="Search campaigns..." className="w-full pl-10 pr-4 py-2 bg-gray-50  border border-gray-100  rounded-xl text-xs outline-none" />
            </div>
         </div>

         <div className="overflow-x-auto text-[#0F172A] ">
            <table className="w-full text-sm text-left">
               <thead className="bg-[#F8F9FA]  text-[9px] uppercase font-bold text-gray-400 tracking-[0.2em]">
                  <tr>
                     <th className="px-10 py-6">Campaign Strategy</th>
                     <th className="px-6 py-6 text-center">Status</th>
                     <th className="px-6 py-6 text-center">Engagement</th>
                     <th className="px-6 py-6 text-right">Cost</th>
                     <th className="px-10 py-6 text-right">Execution</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#F1F5F9] ">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50  transition-all group">
                       <td className="px-10 py-7">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-indigo-50  rounded-2xl flex items-center justify-center border border-indigo-100 ">
                                <Megaphone className="w-5 h-5 text-indigo-500" />
                             </div>
                             <div>
                                <h4 className="font-bold text-sm uppercase tracking-tight">{c.name}</h4>
                                <p className="text-[10px] font-bold text-gray-400 mt-1">{new Date(c.createdAt).toLocaleDateString("en-US")} • {c.type}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-7 text-center">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                            c.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-100' : 
                            c.status === 'SENDING' ? 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse' : 
                            'bg-gray-50 text-gray-600 border-gray-100'
                          }`}>
                            {c.status}
                          </span>
                       </td>
                       <td className="px-6 py-7 text-center">
                          <div className="flex flex-col items-center">
                             <div className="text-sm font-bold text-[#0F172A] ">{c.sentCount} / {c.totalTarget}</div>
                             <div className="text-[10px] font-bold text-gray-400 uppercase mt-1">Delivered</div>
                          </div>
                       </td>
                       <td className="px-6 py-7 text-right font-bold">
                          <div className="text-sm">৳{c.totalCost.toLocaleString("en-US")}</div>
                       </td>
                       <td className="px-10 py-7 text-right">
                          <Link 
                            href={`/merchant/campaigns/${c.id}`}
                            className="p-3 bg-gray-50  border border-gray-100  rounded-xl hover:bg-white transition-all group shadow-sm inline-block"
                          >
                             <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                          </Link>
                       </td>
                    </tr>
                  ))}
                  {campaigns.length === 0 && (
                    <tr>
                       <td colSpan={5} className="px-10 py-32 text-center">
                          <div className="max-w-xs mx-auto space-y-4">
                             <div className="w-20 h-20 bg-gray-50  rounded-[32px] flex items-center justify-center mx-auto">
                                <Megaphone className="w-10 h-10 text-gray-300" />
                             </div>
                             <h4 className="text-sm font-bold uppercase tracking-widest">No Campaigns Found</h4>
                             <p className="text-xs text-gray-400 font-medium leading-relaxed">Start your first marketing campaign to engage with your customers and boost sales.</p>
                             <Link href="/merchant/campaigns/create" className="inline-block mt-4 text-[10px] font-bold uppercase tracking-widest text-indigo-600 border-b border-indigo-200 pb-1">Create Now</Link>
                          </div>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
      
      {/* 3. AI Marketing Insights Sidebar Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white p-10 rounded-[48px] space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 transform translate-x-1/2 -translate-y-1/2 bg-[#BEF264]/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-[#BEF264]/20 transition-all duration-1000" />
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-[#BEF264] rounded-xl flex items-center justify-center text-green-900 shadow-xl">
                  <BarChart3 className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold uppercase tracking-tight leading-none">AI Market Insight</h3>
            </div>
            <p className="text-sm text-indigo-200/60 leading-relaxed">Your VIP segment (Spent {`>`} ৳5000) has a 25% higher open rate on weekend mornings. Consider launching an SMS blast this Saturday at 10:00 AM.</p>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
               <span className="text-[10px] font-bold uppercase tracking-widest text-[#BEF264]">Phase 18 Integration: Active</span>
               <button className="text-[10px] font-bold uppercase underline tracking-tight hover:text-[#BEF264] transition-colors">Apply Strategy</button>
            </div>
         </div>

         <div className="bg-white  border border-[#E5E7EB]  p-10 rounded-[48px] flex items-center gap-8 shadow-sm">
            <div className="w-24 h-24 bg-orange-50  rounded-[32px] flex items-center justify-center text-orange-500 shadow-lg border border-orange-100">
               <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
               <h4 className="text-lg font-bold text-[#0F172A]  uppercase leading-none">Compliance Hub</h4>
               <p className="text-xs text-gray-400 font-medium leading-relaxed">Ensure all marketing SMS include an "Opt-out" keyword to comply with local regulations. Automated unsubscribe logic is coming in Phase 19.</p>
            </div>
         </div>
      </div>

    </div>
  );
}

