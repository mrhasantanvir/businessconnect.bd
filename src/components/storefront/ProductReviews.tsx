"use client";

import React, { useState } from "react";
import { 
  Star, 
  ThumbsUp, 
  CheckCircle2, 
  Camera, 
  MessageSquare,
  ChevronDown,
  Filter,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductReviews({ 
  productId, 
  reviews = [], 
  averageRating = 4.8, 
  totalReviews = 0 
}: { 
  productId: string, 
  reviews?: any[], 
  averageRating?: number, 
  totalReviews?: number 
}) {
  const [filter, setFilter] = useState("ALL");
  
  const ratingDist = [
    { star: 5, count: 85, color: "bg-emerald-500" },
    { star: 4, count: 10, color: "bg-indigo-500" },
    { star: 3, count: 3, color: "bg-amber-500" },
    { star: 2, count: 1, color: "bg-orange-500" },
    { star: 1, count: 1, color: "bg-red-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
         
         {/* 1. Summary Column */}
         <div className="space-y-10">
            <div>
               <h3 className="text-lg font-semibold tracking-tighter uppercase">Customer <span className="text-indigo-600">Reviews</span></h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Honest feedback from our community</p>
            </div>

            <div className="bg-slate-50 rounded-[40px] p-10 space-y-8">
               <div className="flex items-center gap-6">
                  <div className="text-6xl font-black tracking-tighter text-slate-900">{averageRating.toFixed(1)}</div>
                  <div>
                     <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={cn("w-5 h-5", s <= Math.floor(averageRating) ? "text-amber-500 fill-amber-500" : "text-slate-300")} />
                        ))}
                     </div>
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Based on {totalReviews} Reviews</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {ratingDist.map((dist) => (
                    <div key={dist.star} className="flex items-center gap-4 group">
                       <span className="text-[10px] font-black text-slate-400 w-4">{dist.star}</span>
                       <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={cn("h-full transition-all duration-1000", dist.color)} style={{ width: `${dist.count}%` }} />
                       </div>
                       <span className="text-[10px] font-black text-slate-900 w-10 text-right">{dist.count}%</span>
                    </div>
                  ))}
               </div>

               <div className="pt-6 border-t border-slate-200">
                  <div className="p-6 bg-indigo-600 rounded-3xl text-white space-y-4 relative overflow-hidden group">
                     <Sparkles className="absolute right-[-10px] top-[-10px] w-20 h-20 text-white/10 group-hover:scale-125 transition-transform" />
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Reward Program</p>
                     <h4 className="text-lg font-black uppercase leading-none">Earn 10 Points</h4>
                     <p className="text-[10px] font-bold text-indigo-100 leading-relaxed">Leave a photo review and get points for your next purchase.</p>
                     <button className="w-full py-3 bg-white text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">Write a Review</button>
                  </div>
               </div>
            </div>
         </div>

         {/* 2. Reviews Feed */}
         <div className="lg:col-span-2 space-y-12">
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 border-b border-slate-100 pb-8">
               {["All", "With Photos", "5 Star", "4 Star", "3 Star"].map(f => (
                 <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                      filter === f ? "bg-slate-900 text-white shadow-xl" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    )}
                 >
                    {f}
                 </button>
               ))}
            </div>

            {/* List */}
            <div className="space-y-12 divide-y divide-slate-100">
               {reviews.length > 0 ? reviews.map((review, i) => (
                 <div key={i} className="pt-12 first:pt-0 space-y-6 group">
                    <div className="flex items-start justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black uppercase">
                             {review.customerName?.slice(0, 2) || "AN"}
                          </div>
                          <div>
                             <h4 className="text-sm font-black uppercase text-slate-900">{review.customerName || "Anonymous User"}</h4>
                             <div className="flex items-center gap-2 mt-1">
                                {review.isVerified && (
                                   <div className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                      <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                                   </div>
                                )}
                                <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(review.createdAt).toLocaleDateString("en-US")}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={cn("w-3.5 h-3.5", s <= review.rating ? "text-amber-500 fill-amber-500" : "text-slate-200")} />
                          ))}
                       </div>
                    </div>

                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                       {review.comment || "No comment provided."}
                    </p>

                    {review.images?.length > 0 && (
                      <div className="flex gap-4">
                         {review.images.map((img: string, j: number) => (
                           <div key={j} className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 cursor-zoom-in hover:scale-105 transition-transform">
                              <img src={img} className="w-full h-full object-cover" />
                           </div>
                         ))}
                      </div>
                    )}

                    {review.merchantReply && (
                       <div className="bg-slate-50 p-6 rounded-3xl border-l-4 border-indigo-500 space-y-2">
                          <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                             <MessageSquare className="w-3.5 h-3.5" /> Merchant Reply
                          </p>
                          <p className="text-xs font-bold text-slate-500 leading-relaxed">
                             "{review.merchantReply}"
                          </p>
                       </div>
                    )}

                    <div className="flex items-center gap-6 pt-2">
                       <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                          <ThumbsUp className="w-4 h-4" /> Helpful (12)
                       </button>
                       <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                          Report
                       </button>
                    </div>
                 </div>
               )) : (
                 <div className="py-20 text-center space-y-4 text-slate-300">
                    <ImageIcon className="w-16 h-16 mx-auto opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No reviews yet. Be the first!</p>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* SEO Structured Data (AggregateRating) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "Product Name", // Dynamic
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": averageRating,
              "reviewCount": totalReviews
            }
          })
        }}
      />
    </div>
  );
}
