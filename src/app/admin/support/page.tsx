import React from "react";
import { 
  Building2, Clock, CheckCircle2, AlertCircle, 
  MessageSquare, User, ShieldCheck, ChevronRight, Hash,
  Filter, Search
} from "lucide-react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminCreateIncidentModal } from "@/components/support/AdminCreateIncidentModal";

export default async function AdminSupportQueuePage() {
  const session = await getSession();
  
  // Security check: Only SUPER_ADMIN
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  // Fetch all stores and their users for the "Log on behalf" modal
  const allStores = await prisma.merchantStore.findMany({
    include: { users: true }
  });

  const allIncidents = await prisma.incident.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      merchantStore: true,
      user: true,
      assignedTo: true,
      _count: { select: { messages: true } }
    }
  });

  // Agent Workload Board
  const agents = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
    include: {
      assignedIncidents: {
        where: { status: { notIn: ["RESOLVED", "CLOSED"] } }
      }
    }
  });

  const stats = {
    total: allIncidents.length,
    new: allIncidents.filter(i => i.status === 'NEW').length,
    inProgress: allIncidents.filter(i => i.status === 'IN_PROGRESS').length,
    highPriority: allIncidents.filter(i => i.priority === 'HIGH' || i.priority === 'CRITICAL').length
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Platform Owner Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-3">
             <ShieldCheck className="w-8 h-8 text-[#1E40AF]" />
             Global Incident Queue
          </h1>
          <p className="text-[#64748B] text-sm font-medium mt-1">Unified support management for all BusinessOS merchants.</p>
        </div>
        <AdminCreateIncidentModal stores={allStores} />
      </div>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatItem title="Total Incidents" value={stats.total} icon={Hash} />
        <StatItem title="New / Unassigned" value={stats.new} icon={AlertCircle} color="text-blue-600 bg-blue-50" />
        <StatItem title="In Progress" value={stats.inProgress} icon={Clock} color="text-orange-600 bg-orange-50" />
        <StatItem title="High/Critical" value={stats.highPriority} icon={ShieldCheck} color="text-red-600 bg-red-50" />
      </section>

      {/* Agent Workload Scoreboard */}
      <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-4 flex items-center gap-2">
          <User className="w-3.5 h-3.5" /> Agent Workload — Live
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {agents.map(agent => {
            const open = agent.assignedIncidents.length;
            const pct = Math.min((open / 10) * 100, 100);
            return (
              <div key={agent.id} className="flex items-center gap-4 p-4 bg-[#F8F9FA] rounded-2xl border border-[#F1F5F9]">
                <div className="w-10 h-10 rounded-full bg-white text-slate-900 text-slate-900 border border-slate-100 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {agent.name?.charAt(0) ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-[#0F172A] truncate">{agent.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      open === 0 ? "bg-[#F0FDF4] text-[#16A34A]" :
                      open <= 3 ? "bg-[#FFF7ED] text-[#EA580C]" :
                      "bg-red-50 text-red-600"
                    }`}>{open} open</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        open === 0 ? "bg-[#16A34A]" :
                        open <= 3 ? "bg-[#EA580C]" : "bg-[#DC2626]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Queue Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-[32px] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-white text-slate-900 text-slate-900 border border-slate-100 text-white">
           <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search across all merchants..." 
                  className="bg-white text-slate-900 text-slate-900/10 border border-white/20 rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#BEF264]/50 w-96 transition-all"
                />
              </div>
              <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all text-xs font-bold flex items-center gap-2">
                 <Filter className="w-3.5 h-3.5" /> Filter Queue
              </button>
           </div>
           <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
              Live Monitor Status: Active
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[10px] text-[#A1A1AA] uppercase bg-[#F8F9FA] border-b border-[#E5E7EB] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Merchant</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {allIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-[#F8F9FA]/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-5">
                    <span className="font-mono font-bold text-[#1E40AF]">#{inc.number}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#1E40AF]">
                          <Building2 className="w-4 h-4" />
                       </div>
                       <div>
                          <div className="font-bold text-[#0F172A]">{inc.merchantStore.name}</div>
                          <div className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-tight">Plan: {inc.merchantStore.plan}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="max-w-md">
                       <div className="font-bold text-[#0F172A] truncate group-hover:text-[#1E40AF] transition-colors">{inc.subject}</div>
                       <div className="text-xs text-[#A1A1AA] flex items-center gap-2 mt-1">
                          <User className="w-3 h-3" /> {inc.user.name}
                          <span className="opacity-30">•</span>
                          {new Date(inc.createdAt).toLocaleDateString("en-US")}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={inc.status} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${
                         inc.priority === 'CRITICAL' ? 'bg-[#DC2626] animate-pulse' :
                         inc.priority === 'HIGH' ? 'bg-[#EA580C]' :
                         'bg-[#1E40AF]'
                       }`}></div>
                       <span className="text-[10px] font-bold text-[#0F172A]">{inc.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     {inc.assignedTo ? (
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#BEF264]/20 text-[#65A30D] flex items-center justify-center text-[10px] font-bold">
                             {inc.assignedTo.name?.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-[#0F172A]">{inc.assignedTo.name}</span>
                       </div>
                     ) : (
                       <span className="text-xs font-bold text-[#DC2626] animate-pulse flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Unassigned
                       </span>
                     )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <Link href={`/admin/support/${inc.id}`}
                      className="px-3 py-1.5 bg-[#F1F5F9] text-[#0F172A] text-xs font-bold rounded-lg hover:bg-[#1E40AF] hover:text-white transition-all inline-block">
                       Manage
                    </Link>
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

function StatItem({ title, value, icon: Icon, color = "text-[#64748B] bg-[#F1F5F9]" }: any) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-bold text-[#0F172A] tracking-tight">{value}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mt-1">{title}</div>
        </div>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
           <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    NEW: "bg-blue-50 text-blue-600 border-blue-100",
    IN_PROGRESS: "bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]",
    RESOLVED: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]",
    CLOSED: "bg-gray-50 text-gray-500 border-gray-100"
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center w-max gap-1.5 border ${styles[status]}`}>
      {status === 'NEW' && <AlertCircle className="w-3 h-3" />}
      {status === 'IN_PROGRESS' && <Clock className="w-3 h-3" />}
      {status === 'RESOLVED' && <CheckCircle2 className="w-3 h-3" />}
      {status}
    </span>
  );
}
