import React from 'react';
import ResourceWalletWidget from '@/components/merchant/ResourceWalletWidget';
import { ShieldCheck, Zap, Activity, FileText, Download } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { RechargeButton } from '@/components/merchant/RechargeButton';

export default async function MerchantBillingPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect('/login');

  const store = await prisma.merchantStore.findUnique({
    where: { id: session.merchantStoreId },
    include: { 
      subscriptionPlan: true, 
      invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
      transactions: { orderBy: { createdAt: 'desc' }, take: 10 }
    }
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
        <div className="lg:col-span-2 space-y-8">
          {/* New Monthly Staff Invoices */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-50/50 border border-indigo-50 p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-indigo-50/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                     <Activity className="w-5 h-5" />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Staff Subscription <span className="text-indigo-600">Invoices</span></h2>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Pay-per-User Model: ৳300/Staff/30 Days</p>
                  </div>
               </div>
            </div>

            <div className="space-y-4 relative z-10">
               {(!store || !store.invoices || store.invoices.length === 0) ? (
                 <div className="py-12 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No invoices generated yet.</p>
                 </div>
               ) : (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="border-b border-slate-100">
                             <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billing Cycle</th>
                             <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                             <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
                             <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                             <th className="py-4 text-right"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {store.invoices.map((inv: any) => (
                             <tr key={inv.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-5">
                                   <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{inv.billingCycle}</p>
                                </td>
                                <td className="py-5">
                                   <p className="text-sm font-bold text-indigo-600">৳{inv.amount.toLocaleString("en-US")}</p>
                                </td>
                                <td className="py-5">
                                   <p className="text-xs font-bold text-slate-500 uppercase">{new Date(inv.dueDate).toLocaleDateString("en-US")}</p>
                                </td>
                                <td className="py-5">
                                   <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                      {inv.status}
                                   </span>
                                </td>
                                <td className="py-5 text-right">
                                   {inv.status === 'PENDING' && (
                                      <RechargeButton 
                                        type="INVOICE_PAY" 
                                        amount={inv.amount} 
                                        invoiceId={inv.id} 
                                        className="bg-slate-900 text-white hover:bg-black rounded-xl text-[9px] font-bold uppercase tracking-widest px-4 py-2" 
                                        label="Pay Now" 
                                      />
                                   )}
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               )}
            </div>
          </div>
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
                  Active Plan: <span className="uppercase">{store?.subscriptionPlan?.name || store?.plan || 'None'}</span> 
                  <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${store?.subscriptionStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {store?.subscriptionStatus || 'INACTIVE'}
                  </span>
                </p>
                <p className="text-xs text-indigo-600">
                  Expires: {store?.subscriptionExpiry ? new Date(store?.subscriptionExpiry).toLocaleDateString("en-US") : 'Trial / Lifetime'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan: any) => {
                const isCurrentPlan = store?.subscriptionPlanId === plan.id;
                let features = [];
                try {
                  features = JSON.parse(plan.featuresData || "[]");
                } catch (e) {
                  console.error("Failed to parse featuresData", plan.featuresData);
                }

                return (
                  <div key={plan.id} className={`border ${isCurrentPlan ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200'} rounded-xl p-5 flex flex-col`}>
                    <h3 className="text-lg font-bold text-gray-800 uppercase">{plan.name}</h3>
                    <div className="mt-2 mb-4">
                      <span className="text-2xl font-bold text-gray-900">৳{plan.monthlyPrice}</span>
                      <span className="text-xs text-gray-500">/mo</span>
                    </div>
                    
                    <ul className="text-xs text-gray-600 space-y-2 mb-6 flex-1">
                      <li>• Max Products: {plan.maxProducts === -1 ? 'Unlimited' : plan.maxProducts}</li>
                      <li>• Max Staff: {plan.maxStaff === -1 ? 'Unlimited' : plan.maxStaff}</li>
                      {features.map((feat: string, i: number) => (
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
                    <span className="text-2xl font-bold text-teal-600">৳250</span>
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
                    <span className="text-2xl font-bold text-emerald-600">৳100</span>
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

        {/* Sidebar - Transaction History */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
            </div>
            
            <div className="space-y-4">
              {(!store || !store.transactions || store.transactions.length === 0) ? (
                <p className="text-xs text-gray-400 text-center py-4">No transactions found.</p>
              ) : (
                store.transactions.map((tx: any) => (
                  <div key={tx.id} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0 group">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <FileText className="w-4 h-4" />
                       </div>
                       <div>
                         <p className="text-sm font-medium text-gray-800 uppercase tracking-tight">{tx.type.replace('_', ' ')}</p>
                         <p className="text-[10px] text-gray-400">{new Date(tx.createdAt).toLocaleString("en-US")}</p>
                       </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">৳{tx.amount.toLocaleString("en-US")}</p>
                      {tx.invoiceUrl ? (
                         <a 
                           href={tx.invoiceUrl} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="flex items-center justify-end gap-1 text-[9px] font-bold text-indigo-600 uppercase hover:underline"
                         >
                           <Download className="w-2.5 h-2.5" /> Invoice
                         </a>
                      ) : (
                         <p className="text-[9px] text-gray-400 uppercase font-bold">{tx.paymentMethod}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {(store?.transactions?.length || 0) > 0 && (
              <button className="w-full text-center text-sm text-indigo-600 font-medium mt-4 hover:text-indigo-700">
                View All History &rarr;
              </button>
            )}
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

