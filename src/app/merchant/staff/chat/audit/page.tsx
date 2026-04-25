import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  ShieldAlert, User, Clock, 
  MessageSquare, AlertTriangle, 
  CheckCircle2, Search, Filter 
} from "lucide-react";
import { format } from "date-fns";

export default async function ChatAuditPage() {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") redirect("/login");

  const alerts = await prisma.chatModerationAlert.findMany({
    where: { merchantStoreId: session.merchantStoreId! },
    orderBy: { createdAt: "desc" },
    include: { sender: { select: { name: true, role: true } } }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
               <ShieldAlert className="w-10 h-10 text-rose-600" />
               AI Chat <span className="text-rose-600 italic">Audit Hub</span>
            </h1>
            <p className="text-slate-400 font-medium mt-2 uppercase text-[10px] tracking-[0.3em]">Monitoring and enforcing professional conduct via GPT-4o Intelligence.</p>
         </div>
         <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-xl">
            <div className="px-6 py-3 bg-rose-50 rounded-xl text-rose-600 font-black text-xs uppercase tracking-widest border border-rose-100">
               Total Flags: {alerts.length}
            </div>
         </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatCard title="High Risk Alerts" value={alerts.filter(a => a.severity === 'HIGH').length} color="rose" />
         <StatCard title="Moderated Messages" value={alerts.length} color="indigo" />
         <StatCard title="Active Channels" value="N/A" color="slate" />
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-slate-100 rounded-[48px] shadow-2xl overflow-hidden">
         <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
               <AlertTriangle className="w-5 h-5 text-amber-500" />
               Recent Moderation Activity
            </h3>
            <div className="flex items-center gap-4">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input placeholder="Search Staff..." className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-full text-[10px] font-bold outline-none focus:border-indigo-600" />
               </div>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                  <tr>
                     <th className="px-10 py-6">Staff Member</th>
                     <th className="px-6 py-6">Message Content</th>
                     <th className="px-6 py-6">AI Audit Reason</th>
                     <th className="px-6 py-6">Severity</th>
                     <th className="px-10 py-6">Timestamp</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {alerts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-10 py-20 text-center">
                         <CheckCircle2 className="w-12 h-12 text-emerald-500 opacity-20 mx-auto mb-4" />
                         <p className="text-xs font-black text-slate-300 uppercase tracking-widest">System Clean: No unprofessional activity detected.</p>
                      </td>
                    </tr>
                  )}
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-10 py-6">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400">
                                {alert.sender.name?.[0]}
                             </div>
                             <div>
                                <div className="text-xs font-black text-slate-900">{alert.sender.name}</div>
                                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{alert.sender.role}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <div className="max-w-xs truncate text-[11px] font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-lg italic">
                             "{alert.messageContent}"
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <div className="text-[10px] font-bold text-rose-600">
                             {alert.aiReason}
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                            alert.severity === 'HIGH' ? 'bg-rose-100 text-rose-600' :
                            alert.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                             {alert.severity}
                          </span>
                       </td>
                       <td className="px-10 py-6">
                          <div className="text-[10px] font-bold text-slate-400">
                             {format(new Date(alert.createdAt), "MMM d, HH:mm")}
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, color }: { title: string, value: any, color: string }) {
  return (
    <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm flex flex-col gap-2 group hover:shadow-xl transition-all">
       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
       <div className={`text-3xl font-black tracking-tight text-${color}-600 group-hover:scale-110 transition-transform origin-left`}>
          {value}
       </div>
    </div>
  );
}
