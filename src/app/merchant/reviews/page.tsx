import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Star, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Reply
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function MerchantReviewsPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  // Fetch reviews using queryRaw to avoid stale client issues
  const reviews = await prisma.$queryRaw<any[]>`
    SELECT 
      pr.*, 
      p.name as productName,
      p.image as productImage,
      c.name as customerName
    FROM ProductReview pr
    JOIN Product p ON pr.productId = p.id
    JOIN Customer c ON pr.customerId = c.id
    WHERE p.merchantStoreId = ${session.merchantStoreId}
    ORDER BY pr.createdAt DESC
  `;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
         <div className="space-y-4">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">
               Review <span className="text-indigo-600">Manager</span>
            </h1>
            <p className="text-slate-500 text-sm font-bold max-w-xl uppercase tracking-widest leading-relaxed">
               Manage customer sentiment and boost conversion by engaging with feedback.
            </p>
         </div>
         
         <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
            <div className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl">
               All Reviews ({reviews.length})
            </div>
            <div className="px-6 py-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-indigo-600 transition-colors">
               Pending Reply
            </div>
         </div>
      </div>

      {/* Review Matrix */}
      <div className="bg-white border border-slate-100 rounded-[48px] overflow-hidden shadow-sm">
         <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="relative w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input placeholder="Search product or customer..." className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-xs font-bold outline-none" />
            </div>
            <div className="flex items-center gap-4">
               <button className="p-3 bg-slate-50 rounded-2xl"><Filter className="w-5 h-5 text-slate-400" /></button>
            </div>
         </div>

         <div className="divide-y divide-slate-50">
            {reviews.map((r) => (
              <div key={r.id} className="p-10 hover:bg-slate-50/50 transition-all group">
                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    
                    {/* Customer & Product */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold">
                             {r.customerName?.slice(0, 2) || "CU"}
                          </div>
                          <div>
                             <p className="text-[10px] font-bold uppercase text-indigo-600 mb-1">Customer</p>
                             <h4 className="text-sm font-bold uppercase text-slate-900">{r.customerName || "Guest User"}</h4>
                          </div>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-3xl flex items-center gap-4 border border-slate-100">
                          <img src={r.productImage} className="w-10 h-10 rounded-xl object-cover" />
                          <div className="min-w-0">
                             <p className="text-[9px] font-bold uppercase text-slate-400 truncate">Product</p>
                             <h5 className="text-[11px] font-bold uppercase text-slate-900 truncate">{r.productName}</h5>
                          </div>
                       </div>
                    </div>

                    {/* Rating & Content */}
                    <div className="lg:col-span-2 space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="flex gap-0.5">
                             {[1, 2, 3, 4, 5].map(s => (
                               <Star key={s} className={cn("w-4 h-4", s <= r.rating ? "text-amber-500 fill-amber-500" : "text-slate-200")} />
                             ))}
                          </div>
                          <span className="text-[10px] font-bold uppercase text-slate-400">{new Date(r.createdAt).toLocaleDateString("en-US")}</span>
                       </div>
                       <p className="text-sm font-bold text-slate-600 leading-relaxed">
                          "{r.comment || "No text provided."}"
                       </p>
                       {r.merchantReply && (
                          <div className="bg-indigo-50 p-6 rounded-3xl space-y-2 border border-indigo-100">
                             <p className="text-[9px] font-bold uppercase text-indigo-600 flex items-center gap-2">
                                <Reply className="w-3.5 h-3.5" /> Your Official Reply
                             </p>
                             <p className="text-xs font-bold text-slate-600">"{r.merchantReply}"</p>
                          </div>
                       )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 justify-center">
                       {!r.merchantReply ? (
                          <button className="w-full py-4 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl">
                             <MessageSquare className="w-4 h-4" /> Add Reply
                          </button>
                       ) : (
                          <button className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 cursor-not-allowed">
                             <CheckCircle2 className="w-4 h-4" /> Replied
                          </button>
                       )}
                       <button className="w-full py-4 border border-slate-100 text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all">
                          <XCircle className="w-4 h-4" /> Moderation
                       </button>
                    </div>

                 </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="py-32 text-center space-y-6">
                 <Star className="w-16 h-16 mx-auto opacity-10" />
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No product reviews yet</p>
              </div>
            )}
         </div>
      </div>

    </div>
  );
}

