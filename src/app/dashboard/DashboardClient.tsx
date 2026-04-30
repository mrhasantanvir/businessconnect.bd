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

  return (
    <>
      {isArchived && (
        <div className="fixed inset-0 z-50 bg-[#0F172A] flex items-center justify-center p-4 text-center">
          <div className="max-w-md w-full bg-white rounded-[48px] p-10 md:p-14 shadow-2xl border-t-8 border-amber-500 animate-in zoom-in duration-500">
             <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Box className="w-10 h-10 text-amber-600" />
             </div>
             <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase italic mb-4">Account Archived</h2>
             <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                Your store has been archived due to 6 months of inactivity or manual request. 
                Please complete a payment to reactivate your account or contact support.
             </p>
             <div className="space-y-4">
                <button className="w-full bg-[#1E40AF] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20">
                   Pay for Reactivation
                </button>
                <button className="w-full bg-slate-100 text-slate-500 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                   Contact Support
                </button>
             </div>
          </div>
        </div>
      )}

      {needsOnboarding && !isArchived && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-md flex items-center justify-center overflow-y-auto p-4 md:p-8">
          <div className="w-full max-w-4xl relative">
            <div className="absolute -top-12 left-0 w-full text-center">
               <h2 className="text-white font-black text-xl tracking-widest uppercase">Complete Store Setup to Continue</h2>
            </div>
            <OnboardingClient />
          </div>
        </div>
      )}
      <div className={`w-full max-w-7xl mx-auto space-y-4 md:space-y-8 animate-in fade-in duration-500 pb-20 px-4 md:px-0 ${(needsOnboarding || isArchived) ? 'blur-md pointer-events-none select-none opacity-50' : ''}`}>
        
        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">{store?.name}</h1>
            <p className="text-[#64748B] text-xs md:text-sm font-medium mt-1">Hello {session.name}, manage your resources and orders.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
           <ResourceWalletWidget 
             smsBalance={store?.smsBalance || 0} 
             sipBalance={store?.sipBalance || 0} 
             validityDays={daysLeft} 
           />
           <div className="flex items-center gap-3">
              <div className="bg-[#BEF264]/20 text-[#65A30D] px-4 py-2.5 rounded-none text-xs font-bold border border-[#BEF264]/40">
                 Plan: {store?.subscriptionPlan?.name || store?.plan}
              </div>
              <NewIncidentModal />
           </div>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6">
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
          trend="+84" 
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
          title="Staff" 
          value={store?._count.users.toString() || "0"} 
          trend="Active" 
          isPositive={true} 
          icon={Users}
        />
      </section>

      {/* Main Grid: Data & Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
           <div className="px-4 py-3 md:px-5 md:py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-black text-[10px] md:text-xs text-[#0F172A] flex items-center gap-2 uppercase tracking-widest">
                 <ShoppingBag className="w-4 h-4 text-indigo-600" />
                 {t("recent_orders")}
              </h3>
              <button className="text-[8px] md:text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">{t("view_all")}</button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px] md:min-w-0">
                 <thead className="bg-gray-50/50 text-[8px] md:text-[9px] uppercase font-black text-gray-400 tracking-widest">
                    <tr>
                       <th className="px-4 md:px-6 py-3 md:py-4">{t("order_id")}</th>
                       <th className="px-3 md:px-4 py-3 md:py-4">{t("date")}</th>
                       <th className="px-3 md:px-4 py-3 md:py-4">{t("amount")}</th>
                       <th className="px-4 md:px-6 py-3 md:py-4 text-center">{t("status")}</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-4 md:px-6 py-2.5 md:py-3 font-bold text-[10px] md:text-xs text-indigo-600 uppercase tracking-tight">#{order.id.slice(-6).toUpperCase()}</td>
                        <td className="px-3 md:px-4 py-2.5 md:py-3 text-gray-500 font-bold text-[9px] md:text-[10px]">
                           <FormattedDate date={order.createdAt} />
                        </td>
                        <td className="px-3 md:px-4 py-2.5 md:py-3 font-black text-[10px] md:text-xs text-[#0F172A]">
                           <FormattedAmount value={order.total} />
                        </td>
                        <td className="px-4 md:px-6 py-2.5 md:py-3 text-center">
                           <span className={`text-[7px] md:text-[8px] font-black px-1.5 md:px-2 py-0.5 rounded-full border ${
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
    <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      <div className="flex justify-between items-start mb-2 md:mb-4">
         <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-colors">
            <Icon className="w-4 h-4 md:w-5 md:h-5" />
         </div>
         <div className={`flex items-center text-[8px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 rounded-full border ${isPositive ? 'border-green-100 text-green-600 bg-green-50' : 'border-red-100 text-red-600 bg-red-50'}`}>
            {trend}
         </div>
      </div>
      
      <div>
         <div className="text-lg md:text-xl font-black text-[#0F172A] tracking-tight leading-none">
            {!mounted ? "---" : value}
         </div>
         <h3 className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-1.5">{title}</h3>
      </div>
    </div>
  );
}
