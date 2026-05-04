import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Package, 
  ShoppingBag, 
  Star, 
  CreditCard, 
  User, 
  MapPin, 
  ChevronRight,
  ArrowRight,
  Clock,
  Sparkles,
  LogOut,
  Settings,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function CustomerDashboardPage({ params }: { params: { slug: string } }) {
  const session = await getSession();
  const slug = (await params).slug;

  if (!session || session.role !== "CUSTOMER") {
    redirect(`/s/${slug}/login`);
  }

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5
      },
      merchantStore: true
    }
  });

  if (!customer) redirect(`/s/${slug}/login`);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#0F172A] font-sans pb-20">
      
      {/* Dashboard Header */}
      <header className="bg-white border-b border-slate-100 py-12 px-8 lg:px-20">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
               <div className="w-20 h-20 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-600 font-bold text-2xl border border-indigo-100 shadow-sm">
                  {customer.name?.slice(0, 2).toUpperCase() || "CU"}
               </div>
               <div>
                  <h1 className="text-2xl font-bold tracking-tight uppercase text-slate-900 leading-none">
                     Hello, <span className="text-indigo-600">{customer.name?.split(" ")[0]}</span>
                  </h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Member since {new Date(customer.createdAt).toLocaleDateString()}</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <Link href={`/s/${slug}`} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4" /> Shop Now
               </Link>
               <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
               </button>
            </div>
         </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 lg:px-20 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
         
         {/* Left: Stats & Profile */}
         <div className="space-y-8">
            {/* Loyalty Card */}
            <div className="bg-indigo-600 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20 group">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
               <Sparkles className="absolute right-[-10px] top-[-10px] w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
               
               <div className="relative z-10 space-y-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-60">Loyalty Balance</p>
                  <div>
                     <h2 className="text-2xl font-bold tracking-tight leading-none">{customer.loyaltyPoints}</h2>
                     <p className="text-[11px] font-bold uppercase tracking-widest mt-2">Nokkhotro Points</p>
                  </div>
                  <button className="w-full py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all">
                     Redeem Rewards
                  </button>
               </div>
            </div>

            {/* Account Quick Links */}
            <div className="bg-white border border-slate-100 rounded-[40px] p-8 space-y-6">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Quick Navigation</h3>
               <div className="space-y-2">
                  {[
                    { icon: Package, label: "My Orders", count: customer.orderCount },
                    { icon: Heart, label: "Wishlist", count: 0 },
                    { icon: MapPin, label: "Addresses", count: 1 },
                    { icon: Settings, label: "Account Settings", count: null }
                  ].map((link, i) => (
                    <button key={i} className="w-full p-5 hover:bg-slate-50 rounded-3xl flex items-center justify-between transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                             <link.icon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-tight text-slate-900">{link.label}</span>
                       </div>
                       {link.count !== null && <span className="text-[10px] font-bold text-slate-400">{link.count}</span>}
                    </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Center/Right: Order History */}
         <div className="lg:col-span-2 space-y-12">
            
            <div className="flex items-end justify-between border-b border-slate-100 pb-8">
               <div>
                  <h3 className="text-lg font-bold tracking-tight uppercase">Order <span className="text-indigo-600">History</span></h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Track your recent purchases</p>
               </div>
               <button className="text-[10px] font-bold uppercase tracking-widest hover:text-indigo-600 transition-colors">View All</button>
            </div>

            <div className="space-y-6">
               {customer.orders.length > 0 ? customer.orders.map((order) => (
                 <div key={order.id} className="bg-white border border-slate-100 rounded-[40px] p-8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-indigo-600">
                             <Package className="w-8 h-8" />
                          </div>
                          <div>
                             <div className="flex items-center gap-3">
                                <h4 className="text-sm font-bold uppercase text-slate-900">Order #{order.id.slice(-6).toUpperCase()}</h4>
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest",
                                  order.status === 'DELIVERED' ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                                )}>
                                   {order.status}
                                </span>
                             </div>
                             <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-8">
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-400 uppercase">Total Amount</p>
                             <p className="text-xl font-bold text-slate-900 tracking-tight">৳{order.total.toLocaleString()}</p>
                          </div>
                          <button className="w-12 h-12 bg-slate-50 text-slate-900 text-slate-900 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                             <ChevronRight className="w-6 h-6" />
                          </button>
                       </div>
                    </div>
                 </div>
               )) : (
                 <div className="py-32 text-center space-y-6">
                    <ShoppingBag className="w-16 h-16 mx-auto opacity-10 text-slate-400" />
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">No orders yet</p>
                       <Link href={`/s/${slug}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase text-indigo-600 hover:gap-4 transition-all">
                          Start Shopping <ArrowRight className="w-4 h-4" />
                       </Link>
                    </div>
                 </div>
               )}
            </div>

            {/* AI Recommendation Banner */}
            <div className="p-10 bg-slate-900 rounded-[56px] text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
               <div className="relative z-10 w-40 h-40 bg-indigo-600/20 rounded-full flex items-center justify-center border border-indigo-500/20">
                  <Sparkles className="w-16 h-16 text-indigo-400" />
               </div>
               <div className="relative z-10 space-y-6 flex-1">
                  <h3 className="text-lg font-bold uppercase tracking-tight leading-none">
                     You have <span className="text-indigo-400">10 Unused Points</span>
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                     Don't let your rewards expire. Use them to get a discount on our new organic collection.
                  </p>
                  <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[9px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-600/20">
                     Redeem Now
                  </button>
               </div>
            </div>

         </div>

      </main>

    </div>
  );
}
