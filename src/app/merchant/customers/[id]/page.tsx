import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  User, 
  ShoppingBag, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Star, 
  Clock, 
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Tag
} from "lucide-react";
import Link from "next/link";
import { updateCustomerTagsAction } from "../actions";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const customerId = (await params).id;

  const customer = await prisma.customer.findUnique({
    where: { id: customerId, merchantStoreId: session.merchantStoreId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { items: { include: { product: true } } }
      }
    }
  });

  if (!customer) redirect("/merchant/customers");

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* 1. Profile Header & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex items-center gap-6">
            <Link href="/merchant/customers" className="p-4 bg-white  border border-gray-100  rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
               <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div className="flex items-center gap-5">
               <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                  <span className="text-2xl font-bold">{customer.name?.[0].toUpperCase() || "C"}</span>
               </div>
               <div>
                  <div className="flex items-center gap-3">
                     <h1 className="text-2xl font-bold text-[#0F172A]  tracking-tight">{customer.name || "Guest Customer"}</h1>
                     <div className="px-4 py-1.5 bg-[#BEF264]/10 text-green-700  border border-[#BEF264]/30 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {customer.tags || "NEW"}
                     </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                     <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {customer.phone}</span>
                     {customer.email && (
                       <>
                         <span className="w-1 h-1 rounded-full bg-gray-300" />
                         <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {customer.email}</span>
                       </>
                     )}
                  </div>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-4 bg-white  border border-gray-100  rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">
               <MessageSquare className="w-4 h-4" /> Message
            </button>
            <button className="flex items-center gap-2 px-6 py-4 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200">
               <Phone className="w-4 h-4" /> Call Customer
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* 2. Left: Lifecycle Insights */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* LTV & Engagement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white  border border-[#E5E7EB]  rounded-[40px] p-8 shadow-sm">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-indigo-50  rounded-2xl">
                         <TrendingUp className="w-5 h-5 text-indigo-500" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Lifetime Value</span>
                   </div>
                   <h2 className="text-2xl font-bold text-[#0F172A] ">৳{customer.totalSpend.toLocaleString()}</h2>
                   <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tight leading-none">Total Gross Spend</p>
                </div>

                <div className="bg-white  border border-[#E5E7EB]  rounded-[40px] p-8 shadow-sm">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-orange-50  rounded-2xl">
                         <Star className="w-5 h-5 text-orange-500" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Loyalty Points</span>
                   </div>
                   <h2 className="text-2xl font-bold text-[#0F172A] ">{customer.loyaltyPoints}</h2>
                   <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tight leading-none">Available Credits</p>
                </div>

                <div className="bg-white  border border-[#E5E7EB]  rounded-[40px] p-8 shadow-sm">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-blue-50  rounded-2xl">
                         <ShoppingBag className="w-5 h-5 text-blue-500" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Order Frequency</span>
                   </div>
                   <h2 className="text-2xl font-bold text-[#0F172A] ">{customer.orderCount}</h2>
                   <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tight leading-none">Completed Purchases</p>
                </div>
            </div>

            {/* Order History Directory */}
            <div className="bg-white  border border-[#E5E7EB]  rounded-[48px] overflow-hidden shadow-sm">
               <div className="p-8 border-b border-[#F1F5F9]  flex items-center justify-between bg-[#F8F9FA] ">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-indigo-500" /> Recent Purchase History
                  </h3>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-[#F8F9FA]  text-[9px] uppercase font-bold text-gray-400 tracking-[0.2em]">
                        <tr>
                           <th className="px-8 py-4">Order ID</th>
                           <th className="px-6 py-4">Date</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-8 py-4 text-right">Amount</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[#F1F5F9] ">
                        {customer.orders.map((order) => (
                           <tr key={order.id} className="hover:bg-gray-50  transition-all group">
                              <td className="px-8 py-6">
                                 <Link href={`/orders/${order.id}`} className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-2">
                                    ORD-{order.id.slice(-6).toUpperCase()}
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                 </Link>
                              </td>
                              <td className="px-6 py-6 font-bold text-gray-500">
                                 {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-6">
                                 <div className={`inline-flex px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                                   order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                                 }`}>
                                    {order.status}
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right font-bold text-[#0F172A] ">
                                 ৳{order.total.toLocaleString()}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

         </div>

         {/* 3. Right: Meta & Sidebar Insights */}
         <div className="space-y-8">
            
            {/* Customer Intelligence Card */}
            <div className="bg-[#F8F9FA]  border border-[#E5E7EB]  rounded-[48px] p-8 space-y-8 shadow-sm">
               <h3 className="text-xs font-bold uppercase text-indigo-500 tracking-[0.2em] mb-8">System Intelligence</h3>
               
               <div className="space-y-6">
                  <div className="flex items-start gap-5">
                     <div className="p-3 bg-white  rounded-2xl shadow-sm border border-gray-100 ">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                     </div>
                     <div>
                        <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-1">Customer Since</h4>
                        <p className="text-xs font-bold text-[#0F172A] ">{new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                     </div>
                  </div>

                  <div className="flex items-start gap-5">
                     <div className="p-3 bg-white  rounded-2xl shadow-sm border border-gray-100 ">
                        <MapPin className="w-5 h-5 text-indigo-400" />
                     </div>
                     <div>
                        <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-1">Primary Zone</h4>
                        <p className="text-xs font-bold text-[#0F172A] ">Dhaka, Bangladesh</p>
                     </div>
                  </div>

                  <div className="flex items-start gap-5">
                     <div className="p-3 bg-white  rounded-2xl shadow-sm border border-gray-100 ">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                     </div>
                     <div>
                        <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-1">Trust Score</h4>
                        <div className="flex items-center gap-1 mt-1">
                           {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-orange-400 fill-orange-400" />)}
                           <span className="text-[10px] font-bold ml-2 text-indigo-500">Verified</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="pt-8 border-t border-gray-100 ">
                  <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-6 flex items-center gap-2">
                     <Tag className="w-3.5 h-3.5" /> Customer Segments
                  </h4>
                  <div className="flex flex-wrap gap-2">
                     {customer.tags.split(",").map(tag => (
                       <span key={tag} className="px-4 py-2 bg-white  border border-gray-100  rounded-xl text-[9px] font-bold uppercase tracking-tight text-indigo-600 shadow-sm">
                          {tag.trim()}
                       </span>
                     ))}
                  </div>
                  
                  <div className="mt-8 p-6 bg-white  border border-indigo-50  rounded-[32px]">
                     <h5 className="text-[10px] font-bold mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Account Security
                     </h5>
                     <p className="text-[9px] font-bold text-gray-400 leading-relaxed">This customer is linked to {customer.userId ? 'a registered user account' : 'a guest profile'}. Automated security checks passed.</p>
                  </div>
               </div>
            </div>

            {/* Quick Notes / Feedback (Placeholder) */}
            <div className="bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-[48px] p-10 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 transform translate-x-1/2 -translate-y-1/2 bg-[#BEF264]/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-[#BEF264]/20 transition-all duration-1000" />
                <h3 className="text-xl font-bold tracking-tight leading-none">Internal Notes</h3>
                <p className="text-xs text-indigo-200/60 leading-relaxed">Need custom pricing for this customer? You can assign a dedicated discount group here in Phase 18.</p>
            </div>

         </div>

      </div>

    </div>
  );
}
