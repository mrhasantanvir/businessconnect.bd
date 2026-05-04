"use client";

import React, { useState, useTransition } from "react";
import { 
  Zap, Plus, Search, Filter, Calendar, Clock, 
  Trash2, Edit3, ChevronRight, BarChart3, Package,
  TrendingUp, Clock4, AlertCircle, CheckCircle2,
  MoreVertical, X, ShoppingBag, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { 
  getFlashSalesAction, 
  deleteFlashSaleAction, 
  updateFlashSaleStatusAction 
} from "./actions";
import { toast } from "sonner";

export default function FlashSalesPage() {
  const [isPending, startTransition] = useTransition();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlashSales = async () => {
    setLoading(true);
    try {
      const data = await getFlashSalesAction();
      setFlashSales(data);
    } catch (error) {
      console.error("Failed to fetch flash sales:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setMounted(true);
    fetchFlashSales();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await deleteFlashSaleAction(id);
      toast.success("Campaign deleted");
      fetchFlashSales();
    } catch (error) {
      toast.error("Failed to delete campaign");
    }
  };

  // Calculate real analytics
  const activeCampaigns = flashSales.filter(fs => fs.status === "ACTIVE").length;
  const totalItems = flashSales.reduce((acc, fs) => acc + fs.items.length, 0);
  const totalRevenue = flashSales.reduce((acc, fs) => acc + fs.items.reduce((sum: number, item: any) => sum + (item.soldCount * item.salePrice), 0), 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Zap className="w-6 h-6 text-white animate-pulse" />
             </div>
             <h1 className="text-2xl font-bold tracking-tight text-slate-900  uppercase">Flash <span className="text-amber-500">Discounts</span></h1>
          </div>
          <p className="text-sm font-bold text-slate-500  uppercase tracking-widest ml-14">International Campaign Hub</p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="group flex items-center gap-3 px-8 py-4 bg-slate-900  text-white  rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          Create Campaign
        </button>
      </div>

      {/* Analytics Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Active Campaigns", value: String(activeCampaigns).padStart(2, '0'), sub: "Currently Live", icon: Clock4, color: "text-amber-500", bg: "bg-amber-500/10" },
           { label: "Items Discounted", value: String(totalItems), sub: "Across all sales", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
           { label: "Gross Revenue", value: `৳${totalRevenue.toLocaleString()}`, sub: "Total Lifetime", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
         ].map((stat, i) => (
           <div key={i} className="p-8 rounded-[40px] bg-white  border border-slate-100  shadow-sm hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between mb-4">
                 <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg)}>
                    <stat.icon className={cn("w-7 h-7", stat.color)} />
                 </div>
                 <BarChart3 className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-900  tracking-tight">{stat.value}</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
              <div className="mt-4 pt-4 border-t border-slate-50 ">
                 <span className="text-[10px] font-bold text-slate-400">{stat.sub}</span>
              </div>
           </div>
         ))}
      </div>

      {/* Campaigns List */}
      <div className="bg-white  rounded-[48px] border border-slate-100  overflow-hidden shadow-2xl">
         <div className="p-10 border-b border-slate-50  flex items-center justify-between bg-slate-50/50 ">
            <h2 className="text-xl font-bold text-slate-900  tracking-tight uppercase">Campaign Pipeline</h2>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 bg-white  px-6 py-2.5 rounded-2xl border border-slate-200  shadow-sm focus-within:ring-2 focus-within:ring-amber-500 transition-all">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input placeholder="Search Campaigns..." className="bg-transparent border-none outline-none text-xs font-bold" />
               </div>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="bg-slate-50/50 ">
                     <th className="px-10 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campaign Identity</th>
                     <th className="px-10 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temporal Window</th>
                     <th className="px-10 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance</th>
                     <th className="px-10 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                     <th className="px-10 py-6 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 ">
                  {flashSales.map((sale) => {
                      const itemsCount = sale.items.length;
                      const totalSold = sale.items.reduce((sum: number, item: any) => sum + item.soldCount, 0);
                      const revenue = sale.items.reduce((sum: number, item: any) => sum + (item.soldCount * item.salePrice), 0);
                      
                      return (
                        <tr key={sale.id} className="hover:bg-slate-50/50  transition-colors group">
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-4">
                                 <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                    <Zap className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <div className="text-base font-bold text-slate-900  tracking-tight">{sale.name}</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{itemsCount} SKU Items</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <div className="space-y-2">
                                 <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 ">
                                    <Calendar className="w-3 h-3 text-blue-500" /> {mounted ? format(new Date(sale.startTime), "MMM d, yyyy") : "--"}
                                 </div>
                                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                    <Clock className="w-3 h-3" /> {mounted ? `${format(new Date(sale.startTime), "hh:mm a")} - ${format(new Date(sale.endTime), "hh:mm a")}` : "--:--"}
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <div className="space-y-1">
                                 <div className="text-sm font-bold text-slate-900 ">৳{revenue.toLocaleString()}</div>
                                 <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{totalSold} Units Dispatched</div>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <div className={cn(
                                 "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                 sale.status === "ACTIVE" ? "bg-green-500/10 text-green-600 border border-green-500/20" : 
                                 sale.status === "PENDING" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-slate-100 text-slate-500"
                              )}>
                                 {sale.status === "ACTIVE" ? <CheckCircle2 className="w-3 h-3" /> : <Clock4 className="w-3 h-3" />}
                                 {sale.status}
                              </div>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <button className="p-3 bg-white  rounded-xl border border-slate-200  text-slate-500 hover:text-slate-900  hover:shadow-lg transition-all">
                                    <Edit3 className="w-4 h-4" />
                                 </button>
                                 <button 
                                   onClick={() => handleDelete(sale.id)}
                                   className="p-3 bg-white text-red-500 rounded-xl border border-slate-200 hover:bg-red-500 hover:text-white hover:shadow-lg transition-all"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                      );
                   })}
                   {flashSales.length === 0 && !loading && (
                     <tr>
                       <td colSpan={5} className="px-10 py-32 text-center">
                          <div className="max-w-xs mx-auto space-y-4">
                             <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto text-slate-300">
                                <AlertCircle className="w-10 h-10" />
                             </div>
                             <div className="space-y-1">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">No Campaigns Initialized</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start your first flash sale to boost conversions</p>
                             </div>
                             <button 
                               onClick={() => setShowCreateModal(true)}
                               className="px-6 py-3 bg-amber-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-amber-500/20"
                             >
                               Create Now
                             </button>
                          </div>
                       </td>
                     </tr>
                   )}
                   {loading && (
                     <tr>
                       <td colSpan={5} className="px-10 py-32 text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
                       </td>
                     </tr>
                   )}
               </tbody>
            </table>
         </div>
         
         <div className="p-8 border-t border-slate-50  bg-slate-50/30  flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {flashSales.length} Campaigns in Pipeline</p>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-white  border border-slate-200  rounded-xl text-[10px] font-bold text-slate-400 uppercase">Previous</button>
               <button className="px-4 py-2 bg-slate-900  text-white  rounded-xl text-[10px] font-bold uppercase">Next</button>
            </div>
         </div>
      </div>

      {/* Ali-Express Style Flash Sale Teaser Section */}
      <div className="p-12 rounded-[64px] bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-6 max-w-xl text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-6 py-2 bg-amber-500 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-amber-500/30">
                  <TrendingUp className="w-4 h-4" /> Global Performance Engine
               </div>
               <h2 className="text-2xl font-bold tracking-tight leading-none uppercase">Ali-Grade <span className="text-amber-500">Flash Sales</span></h2>
               <p className="text-slate-400 text-lg font-bold leading-relaxed">
                  Maximize your turnover with high-frequency time-slots, real-time stock limits, and neural-optimized discount landing pages. 
               </p>
               <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                  {[
                    { label: "Countdown Tech", icon: Clock },
                    { label: "Stock Vault", icon: Package },
                    { label: "Viral Share", icon: Zap }
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl">
                       <f.icon className="w-4 h-4 text-amber-500" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">{f.label}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="w-full max-w-sm aspect-[4/5] bg-white rounded-[40px] shadow-2xl p-2 relative group overflow-hidden">
               <div className="w-full h-full rounded-[36px] bg-slate-50 overflow-hidden flex flex-col">
                  <div className="h-48 bg-slate-200 relative">
                     <div className="absolute top-4 left-4 px-4 py-2 bg-red-600 text-white text-[10px] font-bold uppercase rounded-lg shadow-xl">65% OFF</div>
                     <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="flex gap-2 justify-center">
                           {["02", "14", "55", "12"].map((n, i) => (
                              <div key={i} className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center flex-col shadow-lg">
                                 <span className="text-xs font-bold text-slate-900 leading-none">{n}</span>
                                 <span className="text-[6px] font-bold text-slate-500 uppercase">{["H", "M", "S", "MS"][i]}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
                  <div className="p-6 space-y-4">
                     <div className="h-4 w-2/3 bg-slate-200 rounded-full" />
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <div className="text-lg font-bold text-slate-900 tracking-tight leading-none">৳2,450</div>
                           <div className="text-[10px] font-bold text-slate-400 line-through">৳5,800</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white"><ShoppingBag className="w-5 h-5" /></div>
                     </div>
                     <div className="space-y-1.5">
                        <div className="flex justify-between text-[8px] font-bold uppercase text-slate-500 tracking-widest"><span>Sold: 420</span> <span>Only 80 Left</span></div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden"><div className="w-[84%] h-full bg-amber-500" /></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}

