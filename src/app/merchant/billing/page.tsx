import React from 'react';
import ResourceWalletWidget from '@/components/merchant/ResourceWalletWidget';
import { ShieldCheck, Zap, Activity } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { RechargeButton } from '@/components/merchant/RechargeButton';

export default async function MerchantBillingPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect('/login');

  const store = await prisma.merchantStore.findUnique({
    where: { id: session.merchantStoreId },
    include: { subscriptionPlan: true }
  });

  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { monthlyPrice: "asc" }
  });

  const mockSmsBalance = store?.smsBalance || 0;
  const mockSipBalance = store?.sipBalance || 0;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing Center</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your SMS and SIP (Call Minute) credits seamlessly.</p>
        </div>
        <ResourceWalletWidget smsBalance={mockSmsBalance} sipBalance={mockSipBalance} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content - Combo Packs & Topup */}
        <div className="lg:col-span-2 space-y-6">
          {/* SaaS Subscription Plans */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-800">SaaS Subscription Plans</h2>
            </div>
            
            {/* Current Active Plan Banner */}
            <div className="mb-6 p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <p className="text-sm font-bold text-indigo-900 mb-1">
                  Active Plan: <span className="uppercase">{store?.subscriptionPlan?.name || store?.plan}</span> 
                  <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${store?.subscriptionStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {store?.subscriptionStatus}
                  </span>
                </p>
                <p className="text-xs text-indigo-600">
                  Expires: {store?.subscriptionExpiry ? new Date(store?.subscriptionExpiry).toLocaleDateString() : 'Trial / Lifetime'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan: any) => {
                const isCurrentPlan = store?.subscriptionPlanId === plan.id;
                return (
                  <div key={plan.id} className={`border ${isCurrentPlan ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200'} rounded-xl p-5 flex flex-col`}>
                    <h3 className="text-lg font-bold text-gray-800 uppercase">{plan.name}</h3>
                    <div className="mt-2 mb-4">
                      <span className="text-2xl font-black text-gray-900">৳{plan.monthlyPrice}</span>
                      <span className="text-xs text-gray-500">/mo</span>
                    </div>
                    
                    <ul className="text-xs text-gray-600 space-y-2 mb-6 flex-1">
                      <li>• Max Products: {plan.maxProducts === -1 ? 'Unlimited' : plan.maxProducts}</li>
                      <li>• Max Staff: {plan.maxStaff === -1 ? 'Unlimited' : plan.maxStaff}</li>
                      {JSON.parse(plan.featuresData || "[]").map((feat: string, i: number) => (
                        <li key={i}>• {feat}</li>
                      ))}
                    </ul>

                    {isCurrentPlan ? (
                       <RechargeButton type="SUBSCRIPTION_RENEW" amount={plan.monthlyPrice} credits={30} planId={plan.id} className="w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200" label="Renew Plan" />
                    ) : (
                       <RechargeButton type="SUBSCRIPTION_UPGRADE" amount={plan.monthlyPrice} credits={30} planId={plan.id} className="w-full bg-indigo-600 text-white hover:bg-indigo-700" label="Upgrade" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-800">Quick Resource Recharge</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pack 1 */}
              <div className="border border-teal-100 bg-teal-50/30 hover:border-teal-300 transition-all rounded-xl p-5 cursor-pointer relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">POPULAR</div>
                <h3 className="text-lg font-bold text-gray-800">Combo 500</h3>
                <p className="text-sm text-gray-500 mt-1">500 SMS Credits</p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-black text-teal-600">৳250</span>
                  </div>
                  <RechargeButton type="SMS" amount={250} credits={500} className="bg-teal-600 text-white hover:bg-teal-700" label="Buy Now" />
                </div>
              </div>

              {/* Pack 2 */}
              <div className="border border-gray-200 hover:border-emerald-300 transition-all rounded-xl p-5 cursor-pointer">
                <h3 className="text-lg font-bold text-gray-800">Voice 100</h3>
                <p className="text-sm text-gray-500 mt-1">100 Minutes Talk-Time</p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-black text-emerald-600">৳100</span>
                  </div>
                  <RechargeButton type="SIP" amount={100} credits={100} className="bg-emerald-600 text-white hover:bg-emerald-700" label="Buy Now" />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Or choose a custom amount:</h3>
              <div className="flex gap-3 max-w-md">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                  <input type="number" placeholder="Amount (BDT)" className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                </div>
                <select className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none text-gray-700">
                  <option value="SMS">SMS Credit</option>
                  <option value="SIP">Talk-Time</option>
                </select>
                <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  Pay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Usage Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
            </div>
            
            <div className="space-y-4">
              {/* Dummy Transaction */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">Recharge - SMS</p>
                  <p className="text-xs text-gray-400">Today, 10:45 AM</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">+৳250.00</p>
                  <p className="text-[10px] text-gray-400">bKash (TrxID: 9AKJDF...)</p>
                </div>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">Usage - Auto SMS</p>
                  <p className="text-xs text-gray-400">Yesterday, 02:15 PM</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-500">-৳0.50</p>
                  <p className="text-[10px] text-gray-400">Order Dispatch</p>
                </div>
              </div>
            </div>
            
            <button className="w-full text-center text-sm text-indigo-600 font-medium mt-4 hover:text-indigo-700">
              View All History &rarr;
            </button>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-white/5">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <h3 className="font-semibold mb-2 relative z-10">Secure Gateway</h3>
            <p className="text-gray-400 text-sm relative z-10 leading-relaxed">
              Your API keys and credentials are automatically managed by the platform. You never have to worry about third-party gateway setups.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

