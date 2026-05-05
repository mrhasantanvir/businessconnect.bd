import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Users, 
  Search, 
  TrendingUp, 
  Star, 
  Phone, 
  ShoppingBag, 
  ArrowUpRight,
  Filter,
  UserPlus
} from "lucide-react";
import Link from "next/link";

export default async function CustomerDirectoryPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const customers = await prisma.customer.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    orderBy: { totalSpend: "desc" },
    include: { _count: { select: { orders: true } } }
  });

  const stats = {
    total: customers.length,
    highValue: customers.filter(c => c.totalSpend > 5000).length,
    newThisWeek: customers.filter(c => new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Header & Stats Hub */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h1 className="text-2xl font-bold text-[#0F172A]  tracking-tight">Customer Directory</h1>
            <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Manage your relationship with {stats.total} customers</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-[#BEF264] text-green-900 rounded-2xl text-[10px] font-bold uppercase hover:scale-105 transition-all shadow-xl shadow-[#BEF264]/20">
               <UserPlus className="w-4 h-4" /> Add Customer
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Total Customers", value: stats.total, icon: Users, color: "bg-blue-500" },
           { label: "High Value (LTV > 5k)", value: stats.highValue, icon: TrendingUp, color: "bg-green-500" },
           { label: "Recent Engagements", value: stats.newThisWeek, icon: Star, color: "bg-orange-500" }
         ].map((stat, i) => (
           <div key={i} className="bg-white  border border-gray-100  p-6 rounded-[32px] flex items-center gap-6 shadow-sm">
              <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                 <stat.icon className="w-7 h-7" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                 <h2 className="text-2xl font-bold mt-2 text-[#0F172A]  leading-none">{stat.value}</h2>
              </div>
           </div>
         ))}
      </div>

      {/* 2. Customer Directory List */}
      <div className="bg-white  border border-[#E5E7EB]  rounded-[48px] overflow-hidden shadow-sm">
         
         {/* Filters & Search */}
         <div className="p-8 border-b border-[#F1F5F9]  flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full max-w-md group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
               <input 
                 placeholder="Search by name, phone or email..." 
                 className="w-full pl-12 pr-6 py-4 bg-gray-50  border border-gray-100  rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
               />
            </div>
            <div className="flex items-center gap-3">
               <button className="p-4 bg-gray-50  border border-gray-100  rounded-2xl text-gray-400 hover:text-indigo-500 transition-all">
                  <Filter className="w-5 h-5" />
               </button>
            </div>
         </div>

         {/* Table Experience */}
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-[#F8F9FA]  text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em]">
                  <tr>
                     <th className="px-10 py-6">Customer Identity</th>
                     <th className="px-6 py-6 text-center">Orders</th>
                     <th className="px-6 py-6 text-center">Loyalty Points</th>
                     <th className="px-6 py-6 text-right">Lifetime Spend</th>
                     <th className="px-10 py-6 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#F1F5F9] ">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F8F9FA]  transition-colors group">
                       <td className="px-10 py-7">
                          <div className="flex items-center gap-5">
                             <div className="w-14 h-14 bg-indigo-50  rounded-2xl flex items-center justify-center border border-indigo-100 ">
                                <span className="text-xl font-bold text-indigo-400">{c.name?.[0].toUpperCase() || "G"}</span>
                             </div>
                             <div>
                                <h4 className="font-bold text-[#0F172A]  group-hover:text-indigo-600 transition-colors uppercase">{c.name || "Guest Customer"}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                   <Phone className="w-3 h-3 text-gray-300" />
                                   <span className="text-[10px] font-bold text-gray-400 leading-none">{c.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                   {c.tags.split(",").map(tag => (
                                      <span key={tag} className="px-2 py-0.5 bg-gray-100  rounded text-[8px] font-bold uppercase text-gray-500 tracking-tight">{tag.trim()}</span>
                                   ))}
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-7 text-center">
                          <div className="flex flex-col items-center">
                             <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A] ">
                                <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                                {c.orderCount}
                             </div>
                             <div className="text-[9px] font-bold text-gray-400 uppercase mt-1">Total Orders</div>
                          </div>
                       </td>
                       <td className="px-6 py-7 text-center">
                          <div className="flex flex-col items-center">
                             <div className="text-sm font-bold text-indigo-500">
                                {c.loyaltyPoints.toLocaleString("en-US")}
                             </div>
                             <div className="text-[9px] font-bold text-gray-400 uppercase mt-1">Earned Points</div>
                          </div>
                       </td>
                       <td className="px-6 py-7 text-right">
                          <div className="text-xl font-bold text-[#0F172A] ">৳{c.totalSpend.toLocaleString("en-US")}</div>
                          <div className="text-[9px] font-bold text-gray-400 uppercase mt-1">Total Value (LTV)</div>
                       </td>
                       <td className="px-10 py-7 text-right">
                          <Link 
                            href={`/merchant/customers/${c.id}`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
                          >
                             View 360° Profile <ArrowUpRight className="w-4 h-4" />
                          </Link>
                       </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                       <td colSpan={5} className="px-10 py-32 text-center">
                          <div className="max-w-xs mx-auto space-y-4">
                             <div className="w-20 h-20 bg-gray-50  rounded-[32px] flex items-center justify-center mx-auto">
                                <Users className="w-10 h-10 text-gray-300" />
                             </div>
                             <h4 className="text-sm font-bold uppercase tracking-widest">No customers found</h4>
                             <p className="text-xs text-gray-400 font-medium leading-relaxed">Customers will appear here automatically when they place an order or contact you.</p>
                          </div>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}

