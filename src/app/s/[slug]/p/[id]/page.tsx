import React from "react";
import { db as prisma } from "@/lib/db";
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
import { TrackingScripts } from "@/components/storefront/TrackingScripts";

export default async function ProductDetailPage({ params }: { params: { slug: string, id: string } }) {
  const { slug, id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      // category: true, // Temporarily disabled due to Prisma Client Sync Issue
      // reviews: {
      //   include: { customer: true },
      //   orderBy: { createdAt: "desc" }
      // }
    }
  }) as any;

  const store = await prisma.merchantStore.findUnique({
    where: { slug }
  });

  if (!product || !store) return <div>Product not found</div>;

  const reviews = product.reviews || [];
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length 
    : 5;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#0F172A] font-sans pb-20">
      <TrackingScripts store={store as any} />
      
      {/* 1. Detail Header */}
      <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-8 lg:px-20 sticky top-0 z-[100]">
         <Link href={`/s/${slug}`} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Collection
         </Link>
         <h1 className="text-xl font-black tracking-tighter uppercase text-indigo-600">{store.name}</h1>
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
                  <img src={product.image || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" />
                  <div className="absolute top-10 left-10">
                     <div className="px-6 py-2 bg-white/90 backdrop-blur shadow-xl rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" /> Premium Quality
                     </div>
                  </div>
               </div>
               <div className="grid grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="aspect-square bg-white rounded-3xl overflow-hidden border border-slate-100 cursor-pointer hover:border-indigo-600 transition-all opacity-40 hover:opacity-100">
                       <img src={product.image || ""} className="w-full h-full object-cover" />
                    </div>
                  ))}
               </div>
            </div>

            {/* Right: Info & Actions */}
            <div className="space-y-12 animate-in fade-in slide-in-from-right-20 duration-1000">
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">{product.category?.name}</span>
                     <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-black">{averageRating.toFixed(1)}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">({reviews.length} Reviews)</span>
                     </div>
                  </div>
                  <h2 className="text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-none text-slate-900">{product.name}</h2>
                  <div className="flex items-baseline gap-4">
                     <span className="text-5xl font-black text-indigo-600 tracking-tighter">৳{product.price.toLocaleString()}</span>
                     <span className="text-xl font-bold text-slate-300 line-through tracking-tighter">৳{(product.price * 1.2).toLocaleString()}</span>
                  </div>
               </div>

               <p className="text-lg font-bold text-slate-500 uppercase leading-relaxed tracking-wider">
                  {product.description || "Indulge in the finest quality product, sourced directly from the heart of origin. Experience authenticity like never before."}
               </p>

               <div className="space-y-8 pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-8">
                     <div className="flex items-center bg-slate-50 rounded-[24px] p-2 border border-slate-100">
                        <button className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-2xl transition-all"><Minus className="w-5 h-5" /></button>
                        <span className="w-16 text-center text-xl font-black">1</span>
                        <button className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-2xl transition-all"><Plus className="w-5 h-5" /></button>
                     </div>
                     <button className="flex-1 py-6 bg-slate-900 text-white rounded-[32px] text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-6 hover:bg-indigo-600 transition-all shadow-2xl hover:scale-105">
                        <ShoppingBag className="w-6 h-6" /> Add To Shopping Bag
                     </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-6 bg-white rounded-[32px] border border-slate-100 space-y-2">
                        <Truck className="w-6 h-6 text-indigo-600" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Free Shipping</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">On all orders over ৳৫০০</p>
                     </div>
                     <div className="p-6 bg-white rounded-[32px] border border-slate-100 space-y-2">
                        <RotateCcw className="w-6 h-6 text-indigo-600" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Easy Returns</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">7 Days replacement policy</p>
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
                        <h4 className="text-xl font-black uppercase leading-none">Security Guaranteed</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-2">Verified Merchant • Protected Payments</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* 2. Advanced Reviews System */}
         <div className="mt-32">
            <ProductReviews 
               productId={id} 
               reviews={reviews.map((r: any) => ({
                 ...r,
                 customerName: r.customer?.name
               }))}
               averageRating={averageRating}
               totalReviews={reviews.length}
            />
         </div>
      </main>

    </div>
  );
}
