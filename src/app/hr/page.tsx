import React from "react";
import { 
  Search, Filter, Download, Zap, MoreHorizontal, CheckCircle2, 
  XCircle, Clock, Activity, TrendingUp, Trophy, DollarSign,
  User as UserIcon
} from "lucide-react";
import { db as prisma } from "@/lib/db";

export default async function HRMatrixPage() {
  // 1. Fetch Staff Members with Profiles
  const staffMembers = await prisma.user.findMany({
    where: { role: "STAFF" },
    include: { 
      staffProfile: true,
      staffWorkLogs: {
        take: 1,
        orderBy: { startTime: "desc" }
      },
      commissions: true
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch Leaderboard Data (Real-time Top Performers)
  const topByActivity = [...staffMembers].sort((a, b) => 
    (b.staffWorkLogs[0]?.activityScore || 0) - (a.staffWorkLogs[0]?.activityScore || 0)
  ).slice(0, 3);

  const topByCommission = [...staffMembers].sort((a, b) => {
    const totalA = a.commissions.reduce((acc, c) => acc + c.amount, 0);
    const totalB = b.commissions.reduce((acc, c) => acc + c.amount, 0);
    return totalB - totalA;
  }).slice(0, 3);

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col h-full animate-in fade-in duration-500 pb-10">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Enterprise HR Matrix</h1>
          <p className="text-sm text-[#64748B] font-medium mt-1">Real-time performance monitoring & automated commission payouts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search staff, ID or role..." 
              className="bg-white border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#1E40AF] w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-[#1E3A8A] transition-all group">
            <Zap className="w-4 h-4" />
            Payout All
          </button>
        </div>
      </div>

      {/* Analytics Grid: Hubstaff & ERP Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         {/* Performance Leaderboard */}
         <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
               <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Trophy size={18} /></div>
               <h3 className="font-bold text-sm text-[#0F172A] uppercase tracking-widest">Activity Leaderboard</h3>
            </div>
            <div className="space-y-4">
               {topByActivity.map((staff, i) => (
                 <div key={staff.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">{i+1}</div>
                       <div>
                          <div className="text-xs font-bold text-[#0F172A]">{staff.name}</div>
                          <div className="text-[10px] text-[#A1A1AA] font-bold">{staff.staffWorkLogs[0]?.activityScore.toFixed(1) || 0}% Activity</div>
                       </div>
                    </div>
                    <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-400" style={{ width: `${staff.staffWorkLogs[0]?.activityScore || 0}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Commission Champions */}
         <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
               <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={18} /></div>
               <h3 className="font-bold text-sm text-[#0F172A] uppercase tracking-widest">Revenue Champions</h3>
            </div>
            <div className="space-y-4">
               {topByCommission.map((staff, i) => {
                  const total = staff.commissions.reduce((acc, c) => acc + c.amount, 0);
                  return (
                    <div key={staff.id} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>{i+1}</div>
                          <div className="text-xs font-bold text-[#0F172A]">{staff.name}</div>
                       </div>
                       <div className="text-xs font-black text-emerald-600">৳ {total.toLocaleString()}</div>
                    </div>
                  );
               })}
            </div>
         </div>

         {/* Total Payout Summary */}
         <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm flex flex-col justify-center">
            <div className="text-center space-y-2">
               <div className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-[0.3em]">Monthly Liability</div>
               <div className="text-4xl font-black text-[#0F172A]">৳ {staffMembers.reduce((acc, s) => acc + (s.staffProfile?.basePay || 0) + s.commissions.reduce((cAcc, c) => cAcc + c.amount, 0), 0).toLocaleString()}</div>
               <div className="text-xs font-bold text-[#16A34A] flex items-center justify-center gap-1">
                  <CheckCircle2 size={12} /> Sync with bKash/Nagad
               </div>
            </div>
         </div>
      </div>

      {/* Main Data Table */}
      <div className="flex-1 bg-white border border-[#E5E7EB] rounded-[40px] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 no-scrollbar">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[10px] text-[#A1A1AA] uppercase bg-[#F8F9FA] sticky top-0 z-10 border-b border-[#E5E7EB] font-black tracking-widest">
              <tr>
                <th className="px-6 py-5">Staff Member</th>
                <th className="px-6 py-5">Active Work Session</th>
                <th className="px-6 py-5 text-center">Activity Score</th>
                <th className="px-6 py-5 text-right">Fixed Pay</th>
                <th className="px-6 py-5 text-right">Earnings</th>
                <th className="px-6 py-5 text-right">Total Owed</th>
                <th className="px-6 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {staffMembers.map((staff) => {
                const activeLog = staff.staffWorkLogs[0];
                const totalCommission = staff.commissions.reduce((acc, c) => acc + c.amount, 0);
                const totalOwed = (staff.staffProfile?.basePay || 0) + totalCommission;

                return (
                  <tr key={staff.id} className="hover:bg-[#F8F9FA]/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1E40AF] font-bold">
                            {staff.name?.charAt(0)}
                         </div>
                         <div>
                            <div className="font-bold text-[#0F172A]">{staff.name}</div>
                            <div className="text-[10px] text-[#A1A1AA] font-bold uppercase">{staff.staffProfile?.jobRole || "Executive"}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {activeLog?.status === "ACTIVE" ? (
                        <div className="flex items-center gap-2 text-[#BEF264] bg-white border border-slate-100 px-3 py-1.5 rounded-lg w-max font-bold text-[10px]">
                           <div className="w-2 h-2 rounded-full bg-[#BEF264] animate-pulse" />
                           IN PROGRESS
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-gray-400">LAST SESSION: {activeLog?.endTime ? new Date(activeLog.endTime).toLocaleTimeString() : 'N/A'}</div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                       <div className="flex flex-col items-center gap-1">
                          <span className={`text-[10px] font-black ${activeLog?.activityScore > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                             {activeLog?.activityScore?.toFixed(1) || 0}%
                          </span>
                          <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                             <div className={`h-full ${activeLog?.activityScore > 80 ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${activeLog?.activityScore || 0}%` }}></div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-[#0F172A]">৳ {(staff.staffProfile?.basePay || 0).toLocaleString()}</td>
                    <td className="px-6 py-5 text-right text-emerald-600 font-black">+ ৳ {totalCommission.toLocaleString()}</td>
                    <td className="px-6 py-5 text-right font-black text-[#0F172A] text-base leading-none">
                       ৳ {totalOwed.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-center">
                       <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 bg-blue-50 text-[#1E40AF] rounded-lg hover:bg-[#1E40AF] hover:text-white transition-all"><DollarSign size={14} /></button>
                          <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-200 hover:text-gray-600 transition-all"><MoreHorizontal size={14} /></button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="h-14 border-t border-[#E5E7EB] bg-[#F8F9FA] flex items-center justify-between px-8 text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">
          <div>Real-time Cluster Sync: Stable</div>
          <div className="flex gap-6">
             <span>Active Staff: {staffMembers.filter(s => s.staffWorkLogs[0]?.status === "ACTIVE").length}</span>
             <span>Total Payout Pending: ৳ {staffMembers.reduce((acc, s) => acc + (s.staffProfile?.basePay || 0) + s.commissions.reduce((cAcc, c) => cAcc + c.amount, 0), 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
