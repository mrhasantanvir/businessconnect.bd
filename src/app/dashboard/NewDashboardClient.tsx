"use client";

import React from "react";
import DynamicMetrics from "@/components/new_ui/ecommerce/DynamicMetrics";
import { MonthlySalesChart, StatisticsChart } from "@/components/new_ui/ecommerce/EcommerceCharts";
import { useLanguage } from "@/context/LanguageContext";
import { ChatLiveMonitor } from "@/components/merchant/ai/ChatLiveMonitor";
import ResourceWalletWidget from "@/components/merchant/ResourceWalletWidget";
import { NewIncidentModal } from "@/components/support/NewIncidentModal";

export default function NewDashboardClient({ 
  session, 
  store, 
  recentOrders, 
  totalRevenue, 
  totalSalesCount, 
  lowStockCount, 
  daysLeft 
}: any) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-theme-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{store?.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your resources and orders in one place.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
           <ResourceWalletWidget 
             smsBalance={store?.smsBalance || 0} 
             sipBalance={store?.sipBalance || 0} 
             validityDays={daysLeft} 
           />
           <div className="flex items-center gap-3">
              <div className="bg-brand-50 text-brand-600 px-4 py-2 rounded-lg text-xs font-bold border border-brand-100">
                 {store?.subscriptionPlan?.name || store?.plan}
              </div>
           </div>
        </div>
      </div>

      <DynamicMetrics 
        totalRevenue={totalRevenue}
        totalSalesCount={totalSalesCount}
        productsCount={store?._count.products || 0}
        customersCount={store?._count.users || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlySalesChart />
        <StatisticsChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{t("recent_orders")}</h3>
            <button className="text-sm font-semibold text-brand-500 hover:text-brand-600">
              {t("view_all")}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 text-sm">#{order.id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        order.status === 'DELIVERED' ? 'bg-brand-50 text-brand-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 text-sm">
                      ৳{order.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1">
          <ChatLiveMonitor />
        </div>
      </div>
    </div>
  );
}
