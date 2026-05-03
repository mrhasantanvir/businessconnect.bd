import React from "react";
import { db as prisma } from "@/lib/db";
import { 
  Users, Store, TrendingUp, ShieldAlert, 
  ArrowUpRight, MoreVertical, Search, Filter 
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { SecurityPulse } from "@/components/admin/SecurityPulse";
import SystemUpdateWidget from "@/components/admin/SystemUpdateWidget";

export default async function SuperAdminDashboard() {
  const session = await getSession();
  
  // Real Data Fetching from DB
  const merchantCount = await prisma.user.count({ where: { role: "MERCHANT" } });
  const staffCount = await prisma.user.count({ where: { role: "STAFF" } });
  const totalOrders = await prisma.order.count();
  const rawGmv = await prisma.order.aggregate({
    _sum: { total: true }
  });
  const totalGmv = rawGmv._sum.total || 0;

  const activeSubscriptions = await prisma.merchantStore.count({
    where: { subscriptionStatus: "ACTIVE" }
  });

  const rawRevenue = await prisma.paymentTransaction.groupBy({
    by: ['type'],
    where: { status: "SUCCESS" },
    _sum: { amount: true }
  });

  const saasRevenue = rawRevenue.find(r => r.type === "SAAS_SUBSCRIPTION")?._sum.amount || 0;
  const creditsRevenue = (rawRevenue.find(r => r.type === "SMS_CREDIT")?._sum.amount || 0) + 
                         (rawRevenue.find(r => r.type === "SIP_CREDIT")?._sum.amount || 0);

  const pendingOnboardingCount = await prisma.merchantStore.count({
    where: { activationStatus: "PENDING" }
  });

  const pendingDocsCount = await prisma.merchantStore.count({
    where: { activationStatus: "DOCUMENTS_REJECTED" }
  });

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
       merchantStore: {
          include: { subscriptionPlan: true }
       }
    }
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">System Global Pulse</h1>
          <p className="text-[#64748B] text-sm font-medium mt-1">Platform-wide overview for {session?.name}.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-[#1E40AF]/10 text-[#1E40AF] px-4 py-2 rounded-full text-xs font-bold border border-[#1E40AF]/20 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Super Admin Access
           </div>
        </div>
      </div>

      {(pendingOnboardingCount > 0 || pendingDocsCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top duration-700">
          {pendingOnboardingCount > 0 && (
            <div className="bg-[#1E40AF] text-white p-6 rounded-[32px] shadow-xl flex items-center justify-between border-4 border-white group hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                   <Store className="w-8 h-8" />
                </div>
                <div>
                   <div className="text-2xl font-black">{pendingOnboardingCount} New Requests</div>
                   <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Pending Merchant Activations</div>
                </div>
              </div>
              <a href="/admin/merchants" className="bg-white text-[#1E40AF] px-6 py-2.5 rounded-full text-xs font-black hover:bg-[#BEF264] hover:text-black transition-all">
                Review Now
              </a>
            </div>
          )}

          {pendingDocsCount > 0 && (
            <div className="bg-[#DC2626] text-white p-6 rounded-[32px] shadow-xl flex items-center justify-between border-4 border-white group hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                   <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                   <div className="text-2xl font-black">{pendingDocsCount} Doc Re-uploads</div>
                   <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Verify corrected documents</div>
                </div>
              </div>
              <a href="/admin/merchants" className="bg-white text-[#DC2626] px-6 py-2.5 rounded-full text-xs font-black hover:bg-black hover:text-white transition-all">
                Verify Now
              </a>
            </div>
          )}
        </div>
      )}
      
      {/* Platform Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="w-12 h-12 bg-[#EFF6FF] rounded-2xl flex items-center justify-center text-[#1E40AF]">
                <Store className="w-6 h-6" />
             </div>
             <div className="text-right">
                <span className="text-[10px] font-bold text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-full">{activeSubscriptions} Active</span>
             </div>
          </div>
          <div className="text-3xl font-black text-[#0F172A]">{merchantCount || 0}</div>
          <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">Total Merchants</div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="w-12 h-12 bg-[#F0FDF4] rounded-2xl flex items-center justify-center text-[#16A34A]">
                <Users className="w-6 h-6" />
             </div>
          </div>
          <div className="text-3xl font-black text-[#0F172A]">{staffCount || 0}</div>
          <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">Platform Staff</div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="w-12 h-12 bg-[#FEF2F2] rounded-2xl flex items-center justify-center text-[#DC2626]">
                <TrendingUp className="w-6 h-6" />
             </div>
             <span className="text-[10px] font-bold text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-full">+৳ {totalGmv.toLocaleString()}</span>
          </div>
          <div className="text-3xl font-black text-[#0F172A]">৳ {(totalGmv / 1000).toFixed(1)}k</div>
          <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">Total GMV (Lifecycle)</div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="w-12 h-12 bg-[#FFF7ED] rounded-2xl flex items-center justify-center text-[#EA580C]">
                <ShieldAlert className="w-6 h-6" />
             </div>
             <span className="text-[10px] font-bold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-full">LIVE</span>
          </div>
          <div className="text-3xl font-black text-[#0F172A]">{totalOrders}</div>
          <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">Platform Interaction</div>
        </div>
      </section>

      {/* Main Administrative Action Area */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#E5E7EB] rounded-[32px] overflow-hidden shadow-sm">
               <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between">
                  <h3 className="font-bold text-[#0F172A]">Merchant Registration & Health</h3>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-[#F8F9FA] rounded-xl transition-colors"><Search className="w-4 h-4 text-[#A1A1AA]" /></button>
                    <button className="p-2 hover:bg-[#F8F9FA] rounded-xl transition-colors"><Filter className="w-4 h-4 text-[#A1A1AA]" /></button>
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-[#F8F9FA] text-[10px] uppercase font-bold text-[#A1A1AA] tracking-widest">
                       <tr>
                         <th className="px-6 py-4">Merchant / Store</th>
                         <th className="px-6 py-4">Plan & Status</th>
                         <th className="px-6 py-4">Resources</th>
                         <th className="px-6 py-4 text-center">Stability</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                       {recentUsers.map((user) => (
                         <tr key={user.id} className="hover:bg-[#F8F9FA]/50 transition-colors group">
                           <td className="px-6 py-4">
                              <div className="font-bold text-[#0F172A]">{user.name || "Unnamed"}</div>
                              <div className="text-xs text-[#A1A1AA] font-medium">{user.merchantStore?.name || "No Store Linked"}</div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-[#1E40AF] uppercase">
                                  {user.merchantStore?.subscriptionPlan?.name || user.merchantStore?.plan || "N/A"}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded w-fit ${
                                  user.merchantStore?.subscriptionStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                                  user.merchantStore?.subscriptionStatus === 'TRIAL' ? 'bg-blue-100 text-blue-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {user.merchantStore?.subscriptionStatus || "UNKNOWN"}
                                </span>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="text-xs space-y-1">
                                <div className="flex items-center gap-1 text-[#64748B]">
                                  <span className="font-bold text-[#0F172A]">৳{user.merchantStore?.smsBalance.toFixed(2)}</span>
                                  <span className="opacity-50">SMS</span>
                                </div>
                                <div className="flex items-center gap-1 text-[#64748B]">
                                  <span className="font-bold text-[#0F172A]">৳{user.merchantStore?.sipBalance.toFixed(2)}</span>
                                  <span className="opacity-50">SIP</span>
                                </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-center">
                              <div className={`w-2 h-2 rounded-full mx-auto ${
                                user.merchantStore?.subscriptionStatus === 'ACTIVE' ? 'bg-[#16A34A] animate-pulse' : 'bg-[#A1A1AA]'
                              }`}></div>
                           </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
               <div className="p-4 bg-[#F8F9FA] text-center">
                  <button className="text-xs font-bold text-[#1E40AF] hover:underline">Launch Governance Console</button>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            {/* Revenue Analytics Widget */}
            <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-6">Revenue Breakdown</h3>
               <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">SaaS Subscriptions</span>
                       <span className="font-black text-gray-900">৳{saasRevenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                       <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(saasRevenue / (saasRevenue + creditsRevenue + 1)) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resource Credits</span>
                       <span className="font-black text-gray-900">৳{creditsRevenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                       <div className="bg-green-500 h-full rounded-full" style={{ width: `${(creditsRevenue / (saasRevenue + creditsRevenue + 1)) * 100}%` }}></div>
                    </div>
                  </div>
               </div>
               <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex flex-col">
                     <span className="text-xs font-bold text-gray-400">Total Pipeline</span>
                     <span className="text-xl font-black text-indigo-600">৳{(saasRevenue + creditsRevenue).toLocaleString()}</span>
                  </div>
                  <a href="/admin/billing/revenue" className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg shadow-slate-100">
                     <ArrowUpRight className="w-5 h-5" />
                  </a>
               </div>
            </div>

            <SecurityPulse />
         </div>
      </section>
    </div>
  );
}
