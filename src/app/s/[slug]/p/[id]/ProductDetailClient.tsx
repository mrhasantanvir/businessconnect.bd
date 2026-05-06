"use client";

import React, { useState } from "react";
import { 
  ShoppingBag, 
  ArrowLeft, 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Sparkles,
  Plus,
  Minus,
  Share2,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ProductReviews } from "@/components/storefront/ProductReviews";

export default function ProductDetailClient({ product, store, slug, id, averageRating, reviews }: any) {
  const [activeImage, setActiveImage] = useState(product.image || "");
  const [qty, setQty] = useState(1);

  const allImages = [product.image, ...(product.gallery?.map((g: any) => g.url) || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#0F172A] font-sans pb-20">
      
      {/* 1. Detail Header */}
      <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-8 lg:px-20 sticky top-0 z-[100]">
         <Link href={`/s/${slug}`} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Collection
         </Link>
         <h1 className="text-xl font-bold tracking-tight uppercase text-indigo-600">{store.name}</h1>
         <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><Share2 className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><Heart className="w-5 h-5" /></button>
         </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 lg:px-20 py-20">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
            
            {/* Left: Image Gallery (Visual Psychology) */}
            <div className="space-y-8 animate-in fade-in slide-in-from-left-20 duration-1000">
               <div className="aspect-[4/5] bg-white rounded-[64px] overflow-hidden shadow-2xl border border-slate-100 group relative">
                  <img src={activeImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" />
                  <div className="absolute top-10 left-10">
                     <div className="px-6 py-2 bg-white/90 backdrop-blur shadow-xl rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" /> Premium Quality
                     </div>
                  </div>
               </div>
               
               {/* DYNAMIC GALLERY */}
               <div className="grid grid-cols-4 gap-6">
                  {allImages.map((img, i) => (
                    <div 
                      key={i} 
                      onClick={() => setActiveImage(img)}
                      className={cn(
                        "aspect-square bg-white rounded-3xl overflow-hidden border transition-all cursor-pointer",
                        activeImage === img ? "border-indigo-600 ring-4 ring-indigo-50" : "border-slate-100 opacity-60 hover:opacity-100"
                      )}
                    >
                       <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
               </div>
            </div>

            {/* Right: Info & Actions */}
            <div className="space-y-12 animate-in fade-in slide-in-from-right-20 duration-1000">
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">{product.category?.name}</span>
                     <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold">{averageRating.toFixed(1)}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">({reviews.length} Reviews)</span>
                     </div>
                  </div>
                  <h2 className="text-2xl lg:text-2xl font-bold tracking-tight uppercase leading-none text-slate-900">{product.name}</h2>
                  <div className="flex items-baseline gap-4">
                     <span className="text-2xl font-bold text-indigo-600 tracking-tight">৳{product.price.toLocaleString("en-US")}</span>
                     <span className="text-xl font-bold text-slate-300 line-through tracking-tight">৳{(product.price * 1.2).toLocaleString("en-US")}</span>
                  </div>
               </div>

               <p className="text-lg font-bold text-slate-500 uppercase leading-relaxed tracking-wider">
                  {product.description || "Indulge in the finest quality product, sourced directly from the heart of origin."}
               </p>

               <div className="space-y-8 pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-8">
                     <div className="flex items-center bg-slate-50 rounded-[24px] p-2 border border-slate-100">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-2xl transition-all"><Minus className="w-5 h-5" /></button>
                        <span className="w-16 text-center text-xl font-bold">{qty}</span>
                        <button onClick={() => setQty(qty + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-2xl transition-all"><Plus className="w-5 h-5" /></button>
                     </div>
                     <button className="flex-1 py-6 bg-slate-900 text-white rounded-[32px] text-xs font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-6 hover:bg-indigo-600 transition-all shadow-2xl hover:scale-105">
                        <ShoppingBag className="w-6 h-6" /> Add To Shopping Bag
                     </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-6 bg-white rounded-[32px] border border-slate-100 space-y-2">
                        <Truck className="w-6 h-6 text-indigo-600" />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest">Free Shipping</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Node Delivery</p>
                     </div>
                     <div className="p-6 bg-white rounded-[32px] border border-slate-100 space-y-2">
                        <RotateCcw className="w-6 h-6 text-indigo-600" />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest">Easy Returns</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secure Policy</p>
                     </div>
                  </div>
               </div>

               <div className="p-10 bg-indigo-600 rounded-[56px] text-white space-y-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  <div className="relative z-10 flex items-center gap-6">
                     <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8" />
                     </div>
                     <div>
                        <h4 className="text-xl font-bold uppercase leading-none">Security Guaranteed</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-2">Verified Merchant • Protected Payments</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Review Section */}
         <div className="mt-32">
            <ProductReviews 
               productId={id} 
               reviews={reviews}
               averageRating={averageRating}
               totalReviews={reviews.length}
            />
         </div>
      </main>

    </div>
  );
}
