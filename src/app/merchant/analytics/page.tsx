import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  Activity,
  Calendar,
  Filter,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AnalyticsDashboardPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  // Fetch metrics
  const orders = await prisma.order.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" }
  });

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? totalSales / totalOrders : 0;
  
  const productSales: Record<string, { name: string, sales: number, quantity: number }> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (item.productId && item.product) {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.product.name, sales: 0, quantity: 0 };
        }
        productSales[item.productId].sales += item.price * item.quantity;
        productSales[item.productId].quantity += item.quantity;
      }
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4);

  const stats = [
    { label: "Gross Volume", value: `৳${totalSales.toLocaleString()}`, trend: "+12%", positive: true, icon: DollarSign },
    { label: "Orders", value: totalOrders.toString(), trend: "+5%", positive: true, icon: ShoppingBag },
    { label: "AOV", value: `৳${Math.round(aov).toLocaleString()}`, trend: "-2%", positive: false, icon: TrendingUp },
    { label: "Visits", value: "24.5k", trend: "+18%", positive: true, icon: Users },
  ];

  return (
    <div className="max-w-full mx-auto space-y-4 pb-4 font-outfit h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      
      {/* Header - More Compact */}
      <div className="flex items-center justify-between shrink-0">
         <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic leading-none">
               Advanced <span className="text-indigo-600">Analytics</span>
            </h1>
            <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg">
               <Activity className="w-3 h-3" />
               <span className="text-[9px] font-black uppercase tracking-widest">Live</span>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase hover:bg-slate-50 transition-all shadow-sm">
               <Calendar className="w-3 h-3 text-slate-400" /> Period
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-indigo-700 transition-all shadow-md">
               <Filter className="w-3 h-3" /> Filter
            </button>
         </div>
      </div>

      {/* KPIs - Condensed */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
         {stats.map((stat, i) => (
           <div key={i} className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                 <stat.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                 <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">{stat.value}</h3>
                    <span className={cn(
                      "text-[8px] font-bold px-1 py-0.5 rounded",
                      stat.positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                       {stat.trend}
                    </span>
                 </div>
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
         
         {/* Main Chart Section */}
         <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 shrink-0">
               <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" /> Revenue Performance
               </h3>
               <div className="flex gap-2">
                  {["1W", "1M", "1Y"].map(t => <button key={t} className="text-[9px] font-black px-2 py-1 hover:bg-slate-50 rounded-lg transition-all">{t}</button>)}
               </div>
            </div>
            
            <div className="flex-1 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
               <div className="text-center">
                  <Activity className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Chart Visualizer</p>
               </div>
            </div>
         </div>

         {/* Side Lists / Secondary Insights */}
         <div className="flex flex-col gap-4 min-h-0 overflow-hidden">
            {/* Top Products - More Compact */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
               <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-900 mb-4 shrink-0">
                  <Package className="w-4 h-4 text-indigo-600" /> Top Sellers
               </h3>
               
               <div className="space-y-2 overflow-y-auto no-scrollbar flex-1 pr-1">
                  {topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-100 transition-all group">
                       <div className="min-w-0">
                          <h4 className="text-[11px] font-bold truncate text-slate-900">{p.name}</h4>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">{p.quantity} Sold</p>
                       </div>
                       <div className="text-right shrink-0">
                          <p className="text-[11px] font-black text-indigo-600">৳{p.sales.toLocaleString()}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Micro Stats Row */}
            <div className="grid grid-cols-2 gap-4 shrink-0">
               <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                  <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Conversion</p>
                  <div className="text-lg font-black text-slate-900 leading-none">3.4%</div>
               </div>
               <div className="bg-indigo-600 p-4 rounded-2xl shadow-sm text-white">
                  <p className="text-[8px] font-bold opacity-70 uppercase mb-1">Returning</p>
                  <div className="text-lg font-black leading-none">42%</div>
               </div>
            </div>
         </div>

      </div>

    </div>
  );
}
