import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  DollarSign, TrendingUp, CreditCard, 
  ArrowUpRight, ArrowDownRight, Activity,
  Filter, Calendar, Download, RefreshCw
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfDay } from "date-fns";

export default async function AdminRevenuePage() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") redirect("/login");

  // 1. Core Metrics
  const totalRevenueData = await prisma.paymentTransaction.aggregate({
    where: { status: "COMPLETED" },
    _sum: { amount: true }
  });
  const totalRevenue = totalRevenueData._sum.amount || 0;

  const currentMonthStart = startOfMonth(new Date());
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

  const currentMonthRevenueData = await prisma.paymentTransaction.aggregate({
    where: { 
      status: "COMPLETED",
      createdAt: { gte: currentMonthStart }
    },
    _sum: { amount: true }
  });
  const currentMonthRevenue = currentMonthRevenueData._sum.amount || 0;

  const lastMonthRevenueData = await prisma.paymentTransaction.aggregate({
    where: { 
      status: "COMPLETED",
      createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
    },
    _sum: { amount: true }
  });
  const lastMonthRevenue = lastMonthRevenueData._sum.amount || 0;

  // Percentage change
  const revenueChange = lastMonthRevenue === 0 ? 100 : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  // 2. Breakdown by Type
  const typeBreakdown = await prisma.paymentTransaction.groupBy({
    by: ['type'],
    where: { status: "COMPLETED" },
    _sum: { amount: true },
    _count: { id: true }
  });

  // 3. Breakdown by Method
  const methodBreakdown = await prisma.paymentTransaction.groupBy({
    by: ['paymentMethod'],
    where: { status: "COMPLETED" },
    _sum: { amount: true }
  });

  // 4. Recent Transactions
  const recentTransactions = await prisma.paymentTransaction.findMany({
    where: { status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    take: 15,
    include: {
      merchantStore: true,
      user: true
    }
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Revenue <span className="text-indigo-600">Intelligence</span></h1>
          <p className="text-slate-500 font-medium mt-1">Real-time financial analytics and transaction oversight.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Calendar className="w-4 h-4" /> This Month
           </button>
           <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
              <Download className="w-4 h-4" /> Export Report
           </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-125 transition-transform">
               <DollarSign className="w-20 h-20 text-slate-900" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Lifecycle Revenue</p>
            <p className="text-3xl font-black text-slate-900">৳{totalRevenue.toLocaleString()}</p>
            <div className="mt-4 flex items-center gap-1.5">
               <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">+12.5%</span>
               <span className="text-[10px] font-bold text-slate-400">vs overall target</span>
            </div>
         </div>

         <div className="p-8 bg-indigo-600 text-white rounded-[32px] shadow-2xl shadow-indigo-100 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
               <TrendingUp className="w-20 h-20" />
            </div>
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Current Month Revenue</p>
            <p className="text-3xl font-black">৳{currentMonthRevenue.toLocaleString()}</p>
            <div className="mt-4 flex items-center gap-1.5">
               <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${revenueChange >= 0 ? 'bg-white/20 text-white' : 'bg-rose-400 text-white'}`}>
                  {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
               </span>
               <span className="text-[10px] font-bold text-indigo-200">vs last month</span>
            </div>
         </div>

         <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-125 transition-transform">
               <CreditCard className="w-20 h-20 text-slate-900" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Successful Payments</p>
            <p className="text-3xl font-black text-slate-900">{recentTransactions.length}+</p>
            <div className="mt-4 flex items-center gap-1.5">
               <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">LIVE</span>
               <span className="text-[10px] font-bold text-slate-400">Active gateways</span>
            </div>
         </div>

         <div className="p-8 bg-slate-900 text-white rounded-[32px] shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
               <Activity className="w-20 h-20" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Month Final</p>
            <p className="text-3xl font-black">৳{lastMonthRevenue.toLocaleString()}</p>
            <div className="mt-4 flex items-center gap-1.5 text-slate-400">
               <span className="text-[10px] font-bold uppercase tracking-widest">{format(lastMonthStart, "MMMM yyyy")}</span>
            </div>
         </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Revenue by Source */}
         <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm lg:col-span-1">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8">Revenue <span className="text-indigo-600">Sources</span></h3>
            <div className="space-y-6">
               {typeBreakdown.map((item: any) => (
                  <div key={item.type} className="group">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.type.replace('_', ' ')}</span>
                        <span className="font-black text-slate-900">৳{item._sum.amount.toLocaleString()}</span>
                     </div>
                     <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            item.type.includes('SMS') ? 'bg-indigo-500' : 
                            item.type.includes('SIP') ? 'bg-emerald-500' : 
                            'bg-amber-500'
                          }`}
                          style={{ width: `${(item._sum.amount / (totalRevenue || 1)) * 100}%` }}
                        ></div>
                     </div>
                     <div className="flex justify-between mt-1.5">
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{item._count.id} Transactions</span>
                        <span className="text-[9px] font-black text-slate-500">{((item._sum.amount / (totalRevenue || 1)) * 100).toFixed(1)}%</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Transactions List */}
         <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm lg:col-span-2">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
               <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Global <span className="text-indigo-600">Ledger</span></h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time successful transaction stream</p>
               </div>
               <button className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400">
                  <RefreshCw className="w-4 h-4" />
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                     <tr>
                        <th className="px-8 py-5">Merchant / User</th>
                        <th className="px-8 py-5">Type & Gateway</th>
                        <th className="px-8 py-5">Amount</th>
                        <th className="px-8 py-5 text-right">Date</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {recentTransactions.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors group">
                           <td className="px-8 py-6">
                              <div className="font-black text-slate-900 tracking-tight">{tx.merchantStore?.name || "N/A"}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase">{tx.user?.name || "Unknown User"}</div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{tx.type.replace('_', ' ')}</span>
                                 <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${tx.paymentMethod === 'BKASH' ? 'bg-[#e2136e]' : 'bg-[#f7941d]'}`}></span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{tx.paymentMethod}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="text-lg font-black text-slate-900 tracking-tighter">৳{tx.amount.toLocaleString()}</div>
                              <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Successful</div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="text-xs font-black text-slate-900 uppercase tracking-tighter">{format(tx.createdAt, "dd MMM, yy")}</div>
                              <div className="text-[10px] text-slate-400 font-medium">{format(tx.createdAt, "hh:mm a")}</div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            <div className="p-6 bg-slate-50/50 text-center border-t border-slate-100">
               <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Load More Financial Data</button>
            </div>
         </div>
      </div>

      {/* Gateway Efficiency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {methodBreakdown.map((method: any) => (
            <div key={method.paymentMethod} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm relative overflow-hidden group">
               <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-150 transition-transform ${method.paymentMethod === 'BKASH' ? 'bg-[#e2136e]' : 'bg-[#f7941d]'}`}></div>
               <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-xs font-black uppercase tracking-widest ${method.paymentMethod === 'BKASH' ? 'text-[#e2136e]' : 'text-[#f7941d]'}`}>{method.paymentMethod} Gateway</h4>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${method.paymentMethod === 'BKASH' ? 'bg-[#e2136e]/10 text-[#e2136e]' : 'bg-[#f7941d]/10 text-[#f7941d]'}`}>
                     <CreditCard className="w-4 h-4" />
                  </div>
               </div>
               <p className="text-3xl font-black text-slate-900 tracking-tighter">৳{method._sum.amount.toLocaleString()}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total processed via {method.paymentMethod}</p>
            </div>
         ))}
      </div>
    </div>
  );
}
