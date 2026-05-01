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
      {isArchived && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-sm flex items-center justify-center p-4 text-center">
          <div className="max-w-md w-full bg-white rounded-[4px] p-8 md:p-10 shadow-xl border-t-4 border-amber-500 animate-in zoom-in duration-300">
             <div className="w-16 h-16 bg-amber-50 rounded-[4px] flex items-center justify-center mx-auto mb-6">
                <Box className="w-8 h-8 text-amber-600" />
             </div>
             <h2 className="text-xl font-bold text-[#0F172A] tracking-tight uppercase mb-3">Account Archived</h2>
             <p className="text-slate-500 font-medium text-xs mb-6 leading-relaxed">
                Your store has been archived due to inactivity or manual request. 
                Please complete a payment to reactivate your account.
             </p>
             <div className="space-y-3">
                <button className="w-full bg-[#1E40AF] text-white py-3 rounded-[4px] font-bold text-xs uppercase tracking-widest hover:bg-[#1E3A8A] transition-all">
                   Reactivate Now
                </button>
                <button className="w-full bg-slate-50 text-slate-500 py-3 rounded-[4px] font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
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

      {isPending && !needsOnboarding && !isArchived && (
        <div className={`${store?.activationStatus === "DOCUMENTS_REJECTED" ? "bg-rose-600" : "bg-amber-600"} text-white py-2 px-4 text-center animate-in slide-in-from-top duration-300`}>
          <div className="flex items-center justify-center gap-2">
             <Sparkles className="w-3.5 h-3.5" />
             <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider">
               {store?.activationStatus === "DOCUMENTS_REJECTED" 
                 ? `Action Required: ${store.reuploadMessage || "Please re-upload your documents."}`
                 : "Store Verification Pending. Full access is restricted."}
             </p>
             {store?.activationStatus === "DOCUMENTS_REJECTED" && (
                <Link href="/merchant/settings/documents" className="bg-white text-rose-600 px-2.5 py-0.5 rounded-[2px] text-[10px] font-bold hover:bg-rose-50 transition-colors ml-2">
                   FIX NOW
                </Link>
             )}
          </div>
        </div>
      )}

      <div className={`w-full max-w-7xl mx-auto space-y-4 md:space-y-8 animate-in fade-in duration-500 pb-20 px-4 md:px-0 ${(needsOnboarding || isArchived) ? 'blur-md pointer-events-none select-none opacity-50' : ''}`}>
        
        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight">{store?.name}</h1>
            <p className="text-[#64748B] text-[13px] font-medium mt-0.5">Hello {session.name}, manage your ecosystem.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3">
           <ResourceWalletWidget 
             smsBalance={store?.smsBalance || 0} 
             sipBalance={store?.sipBalance || 0} 
             validityDays={daysLeft} 
           />
           <div className="flex items-center gap-2">
              <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-[4px] text-[11px] font-bold border border-green-100">
                 {store?.subscriptionPlan?.name || store?.plan}
              </div>
              <NewIncidentModal />
           </div>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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

      {/* Main Grid: Data & Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[4px] overflow-hidden shadow-sm">
           <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-[11px] text-[#0F172A] flex items-center gap-2 uppercase tracking-wider">
                 <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                 {t("recent_orders")}
              </h3>
              <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">{t("view_all")}</button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                    <tr>
                       <th className="px-6 py-3">{t("order_id")}</th>
                       <th className="px-4 py-3">{t("date")}</th>
                       <th className="px-4 py-3">{t("amount")}</th>
                       <th className="px-6 py-3 text-center">{t("status")}</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-[13px] text-indigo-600 tracking-tight">#{order.id.slice(-6).toUpperCase()}</td>
                        <td className="px-4 py-3.5 text-gray-500 font-medium text-[12px]">
                           <FormattedDate date={order.createdAt} />
                        </td>
                        <td className="px-4 py-3.5 font-bold text-[13px] text-[#0F172A]">
                           <FormattedAmount value={order.total} />
                        </td>
                        <td className="px-6 py-3.5 text-center">
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] border ${
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
    <div className="bg-white border border-gray-100 rounded-[4px] p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      <div className="flex justify-between items-start mb-3">
         <div className="w-9 h-9 bg-gray-50 rounded-[4px] flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-colors">
            <Icon className="w-4 h-4" />
         </div>
         <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] border ${isPositive ? 'border-green-100 text-green-600 bg-green-50' : 'border-red-100 text-red-600 bg-red-50'}`}>
            {trend}
         </div>
      </div>
      
      <div>
         <div className="text-xl font-bold text-[#0F172A] tracking-tight leading-none">
            {!mounted ? "---" : value}
         </div>
         <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">{title}</h3>
      </div>
    </div>
  );
}
