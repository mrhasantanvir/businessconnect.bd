"use client";

import React from "react";
import { 
  Sparkles, TrendingUp, ArrowUpRight, ArrowDownRight, 
  Box, ShoppingCart, ShoppingBag, Users
} from "lucide-react";
import { NewIncidentModal } from "@/components/support/NewIncidentModal";
import ResourceWalletWidget from "@/components/merchant/ResourceWalletWidget";
import { useLanguage } from "@/context/LanguageContext";
import { ChatLiveMonitor } from "@/components/merchant/ai/ChatLiveMonitor";
import { OnboardingClient } from "@/app/merchant/onboarding/OnboardingClient";
import Link from "next/link";

function FormattedDate({ date }: { date: string | Date }) {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="opacity-0">00/00/0000</span>;
  }

  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return <>{`${day}/${month}/${year}`}</>;
}

function FormattedAmount({ value }: { value: number }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <span>৳ ---</span>;
  return <>৳ {value.toLocaleString('en-US')}</>;
}

export default function MerchantDashboard({ 
  session, 
  store, 
  recentOrders, 
  totalRevenue, 
  totalSalesCount, 
  lowStockCount, 
  daysLeft 
}: any) {
  const { t } = useLanguage();
  const needsOnboarding = session.role === "MERCHANT" && store && store.isOnboarded === false;
  const isArchived = store?.isArchived === true;
  const isPending = store?.activationStatus !== "ACTIVE";

  return (
    <>
      {/* ... previous conditional banners ... */}
      
      <div className={`w-full max-w-7xl mx-auto space-y-4 animate-in fade-in duration-500 pb-12 px-4 md:px-0 ${(needsOnboarding || isArchived || isPending) ? 'blur-md pointer-events-none select-none opacity-50' : ''}`}>
        
        {/* Compact Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">{store?.name}</h1>
            <p className="text-[#64748B] text-[11px] font-medium">Hello {session.name}, system overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <ResourceWalletWidget 
              smsBalance={store?.smsBalance || 0} 
              sipBalance={store?.sipBalance || 0} 
              validityDays={daysLeft} 
            />
            <div className="bg-green-50 text-green-700 px-2 py-1 rounded-[4px] text-[10px] font-bold border border-green-100">
               {store?.subscriptionPlan?.name || store?.plan}
            </div>
          </div>
        </div>

        {/* Slim Metrics Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard 
            title={t("total_sales")} 
            value={`৳ ${totalRevenue.toLocaleString('en-US')}`} 
            trend="Total" 
            isPositive={true} 
            icon={TrendingUp}
          />
          <MetricCard 
            title={t("total_orders")} 
            value={totalSalesCount.toString()} 
            trend="+12%" 
            isPositive={true} 
            icon={ShoppingCart}
          />
          <MetricCard 
            title={t("inventory")} 
            value={store?._count.products.toString() || "0"} 
            trend={`${lowStockCount} Low`} 
            isPositive={lowStockCount === 0} 
            icon={Box}
          />
          <MetricCard 
            title="Branches" 
            value={store?._count.branches?.toString() || "0"} 
            trend="Active" 
            isPositive={true} 
            icon={Users}
          />
        </section>

        {/* Compact Main Content */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[8px] overflow-hidden shadow-sm">
             <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                <h3 className="font-bold text-[10px] text-[#0F172A] flex items-center gap-2 uppercase tracking-wider">
                   <ShoppingBag className="w-3 h-3 text-indigo-600" />
                   {t("recent_orders")}
                </h3>
                <button className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">{t("view_all")}</button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-gray-50/50 border-b border-gray-100 text-[9px] uppercase font-bold text-gray-400 tracking-widest">
                      <tr>
                         <th className="px-4 py-2">{t("order_id")}</th>
                         <th className="px-4 py-2">{t("date")}</th>
                         <th className="px-4 py-2">{t("amount")}</th>
                         <th className="px-4 py-2 text-center">{t("status")}</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {recentOrders.map((order: any) => (
                        <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-4 py-2.5 font-bold text-xs text-indigo-600 tracking-tight">#{order.id.slice(-6).toUpperCase()}</td>
                          <td className="px-4 py-2.5 text-gray-500 font-medium text-[11px]">
                             <FormattedDate date={order.createdAt} />
                          </td>
                          <td className="px-4 py-2.5 font-bold text-xs text-[#0F172A]">
                             <FormattedAmount value={order.total} />
                          </td>
                          <td className="px-4 py-2.5 text-center">
                             <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] border ${
                               order.status === 'DELIVERED' ? 'border-green-100 text-green-600 bg-green-50' :
                               'border-amber-100 text-amber-600 bg-amber-50'
                             }`}>
                               {order.status}
                             </span>
                          </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>

          {/* AI Chat Intelligence Monitor */}
          <div className="lg:col-span-1 h-full">
             <ChatLiveMonitor />
          </div>
        </section>
      </div>
    </>
  );
}

function MetricCard({ title, value, trend, isPositive, icon: Icon }: { title: string, value: string, trend: string, isPositive: boolean, icon: any }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="bg-white border border-gray-100 rounded-[8px] p-3 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      <div className="flex justify-between items-start mb-2">
         <div className="w-7 h-7 bg-gray-50 rounded-[6px] flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-colors">
            <Icon className="w-3.5 h-3.5" />
         </div>
         <div className={`flex items-center text-[9px] font-bold px-1 py-0.5 rounded-[2px] border ${isPositive ? 'border-green-100 text-green-600 bg-green-50' : 'border-red-100 text-red-600 bg-red-50'}`}>
            {trend}
         </div>
      </div>
      
      <div>
         <div className="text-base font-bold text-[#0F172A] tracking-tight leading-none">
            {!mounted ? "---" : value}
         </div>
         <h3 className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1.5">{title}</h3>
      </div>
    </div>
  );
}
