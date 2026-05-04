import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  FileText, 
  Download, 
  TrendingUp, 
  ShieldCheck, 
  PieChart,
  Calendar,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

import { hasPermission } from "@/lib/permissions";

export default async function VatReportPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const canView = await hasPermission("reports:view");
  if (!canView) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-20 h-20 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500">
             <FileText className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Access Denied</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest text-center max-w-xs">
             Tax Intelligence data is restricted. Your node lacks the required analytics clearance.
          </p>
       </div>
    );
  }

  const stores = await prisma.$queryRaw<any[]>`
    SELECT isVatEnabled, vatRate, binNumber 
    FROM MerchantStore 
    WHERE id = ${session.merchantStoreId}
    LIMIT 1
  `;
  const store = stores[0];

  // Fetch orders from the last 30 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const orders = await prisma.order.findMany({
    where: {
      merchantStoreId: session.merchantStoreId,
      createdAt: { gte: startDate }
    },
    orderBy: { createdAt: "desc" }
  });

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  // Calculate VAT based on store rate if enabled
  const vatRate = store?.vatRate || 0;
  const totalVat = orders.reduce((sum, o) => {
      // In a real system, vat is stored per order. 
      // For now we calculate it: vat = total - (total / (1 + rate/100))
      const net = o.total / (1 + (vatRate / 100));
      return sum + (o.total - net);
  }, 0);

  const stats = [
    { label: "Total Taxable Sales", value: `৳${(totalSales - totalVat).toLocaleString('en-US')}`, icon: TrendingUp, color: "text-blue-500" },
    { label: "Total VAT Collected", value: `৳${totalVat.toLocaleString('en-US')}`, icon: ShieldCheck, color: "text-emerald-500" },
    { label: "Standard Rate", value: `${vatRate}%`, icon: PieChart, color: "text-indigo-500" },
    { label: "NBR Compliance", value: store?.binNumber ? "Verified" : "Pending BIN", icon: FileText, color: store?.binNumber ? "text-green-500" : "text-amber-500" }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">VAT <span className="text-indigo-600">Reporting</span> Center</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Official Tax Logs & Compliance Documentation</p>
         </div>
         <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
               <Calendar className="w-4 h-4 text-slate-400" /> Last 30 Days
            </button>
            <button className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl">
               <Download className="w-4 h-4" /> Export NBR CSV
            </button>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {stats.map((stat, i) => (
           <div key={i} className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group">
              <div className={cn("w-12 h-12 rounded-2xl bg-slate-50 text-slate-900 text-slate-900 text-slate-900 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all", stat.color)}>
                 <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
              <h3 className="text-lg font-bold text-slate-900 leading-none tracking-tight">{stat.value}</h3>
           </div>
         ))}
      </div>

      {/* VAT Log Table */}
      <div className="bg-white border border-slate-100 rounded-[48px] overflow-hidden shadow-sm">
         <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
               <Filter className="w-5 h-5 text-indigo-600" /> Transaction VAT Breakdown
            </h2>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <tr>
                     <th className="px-10 py-6">Order ID</th>
                     <th className="px-6 py-6 text-right">Net Amount</th>
                     <th className="px-6 py-6 text-right">VAT Amount ({vatRate}%)</th>
                     <th className="px-6 py-6 text-right">Grand Total</th>
                     <th className="px-10 py-6 text-right">Compliance Date</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-900">
                  {orders.map((o) => {
                    const net = o.total / (1 + (vatRate / 100));
                    const vat = o.total - net;
                    return (
                      <tr key={o.id} className="hover:bg-slate-50/50 transition-all">
                         <td className="px-10 py-6 font-bold uppercase text-indigo-600 tracking-tight">#{o.id.slice(-6)}</td>
                         <td className="px-6 py-6 text-right">৳{net.toFixed(2)}</td>
                         <td className="px-6 py-6 text-right text-emerald-600">+ ৳{vat.toFixed(2)}</td>
                         <td className="px-6 py-6 text-right font-bold">৳{o.total.toFixed(2)}</td>
                         <td className="px-10 py-6 text-right text-slate-400">{new Date(o.createdAt).toLocaleDateString('en-US')}</td>
                      </tr>
                    );
                  })}
                  {orders.length === 0 && (
                    <tr>
                       <td colSpan={5} className="px-10 py-20 text-center text-slate-400 uppercase text-[10px] font-bold">No VAT transactions found in this period</td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}
