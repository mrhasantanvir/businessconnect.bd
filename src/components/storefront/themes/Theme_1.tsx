import React from "react";
import { ShoppingBag, Search, Filter, Star, ShieldCheck, Truck } from "lucide-react";
import { AddToCartButton } from "@/app/s/[slug]/AddToCartButton";

interface ThemeProps {
  store: any;
  brandColor: string;
}

export function Theme_1({ store, brandColor }: ThemeProps) {
  return (
    <div className="min-h-screen bg-white text-[#0F172A]">
      {/* 1. Slim Announcement Bar */}
      <div className="bg-white text-slate-900 text-slate-900 border border-slate-100 text-white py-2 text-center overflow-hidden">
         <p className="text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">
            {store.welcomeMessage || "Free Priority Shipping on orders over ৳5000"}
         </p>
      </div>

      {/* 2. Premium Navigation */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-gray-100/50">
         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
               {store.logo ? (
                 <img src={store.logo} alt={store.name} className="w-10 h-10 rounded-2xl object-cover shadow-sm" />
               ) : (
                 <div className="w-12 h-12 bg-white text-slate-900 text-slate-900 border border-slate-100 text-white rounded-[18px] flex items-center justify-center font-bold text-xl shadow-xl">
                   {store.name.charAt(0)}
                 </div>
               )}
               <h1 className="text-xl font-bold tracking-tight uppercase">{store.name}</h1>
            </div>

            <nav className="hidden lg:flex items-center gap-10">
               {["Shop", "Collections", "About", "Track Order"].map(link => (
                 <a key={link} href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#0F172A] transition-colors">{link}</a>
               ))}
            </nav>

            <div className="flex items-center gap-4">
               <button className="p-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100"><Search className="w-5 h-5" /></button>
               <div className="w-px h-6 bg-gray-100 mx-2 hidden lg:block" />
               <button className="relative group">
                  <div className="p-3 bg-[#F8F9FA] rounded-2xl group-hover:bg-white text-slate-900 text-slate-900 border border-slate-100 group-hover:text-white transition-all shadow-sm">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">0</span>
               </button>
            </div>
         </div>
      </header>

      {/* 3. Editorial Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-20 md:pb-40">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-center">
            <div className="space-y-6 md:space-y-10 group order-2 lg:order-1">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-indigo-50 text-indigo-600 rounded-full">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping" />
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">New Season Drop</span>
               </div>
               <h2 className="text-2xl md:text-2xl lg:text-2xl font-bold tracking-tight leading-[0.9] text-[#0F172A] transition-transform group-hover:-translate-y-2 duration-700">
                  Elevate your <br /> standard.
               </h2>
               <p className="text-sm md:text-lg font-medium text-gray-500 max-w-md leading-relaxed">
                  Discover {store.name}'s limited edition releases. Crafted with precision and local heritage.
               </p>
               <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                  <button 
                    style={{ backgroundColor: brandColor }}
                    className="w-full sm:w-auto px-8 md:px-10 py-5 md:py-6 text-white rounded-2xl md:rounded-[28px] text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-2xl hover:brightness-110 active:scale-95 transition-all"
                  >
                    Start Shopping
                  </button>
                  <button className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest border-b-2 border-gray-100 pb-1 hover:border-indigo-600 transition-all">View Lookbook</button>
               </div>
            </div>

            <div className="relative order-1 lg:order-2">
               <div className="aspect-square bg-[#F8F9FA] rounded-[40px] md:rounded-[64px] overflow-hidden rotate-0 md:rotate-3 hover:rotate-0 transition-transform duration-1000 shadow-2xl border-4 border-white">
                  <img 
                    src={store.products[0]?.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop"} 
                    alt="Hero" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                  />
               </div>
               <div className="absolute -bottom-6 md:-bottom-10 -left-4 md:-left-10 bg-white p-4 md:p-8 rounded-3xl md:rounded-[48px] shadow-2xl border border-gray-100 max-w-[180px] md:max-w-[240px] animate-bounce">
                  <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                     <Star className="w-4 h-4 md:w-5 md:h-5 text-orange-400 fill-orange-400" />
                     <span className="text-xs md:text-sm font-bold">4.9 Ratings</span>
                  </div>
                  <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trusted by 2k+ Local Customers</p>
               </div>
            </div>
         </div>
      </section>

      {/* 4. Filter Bar */}
      <div className="sticky top-20 z-40 bg-white/50 backdrop-blur-md border-y border-gray-100">
         <div className="max-w-7xl mx-auto px-6 h-12 md:h-16 flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar">
               {["All Products", "Best Sellers", "New Arrivals"].map(tab => (
                 <button key={tab} className="whitespace-nowrap text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-[#0F172A] transition-all">{tab}</button>
               ))}
            </div>
            <button className="flex items-center gap-2 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] shrink-0">
               <Filter className="w-3.5 h-3.5" /> Filter
            </button>
         </div>
      </div>

      {/* 5. Product Grid (High Density) */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
         <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 lg:gap-12">
            {store.products.map((product: any) => (
               <div key={product.id} className="space-y-4 md:space-y-6 group">
                  <div className="aspect-[3/4] bg-[#F1F3F5] rounded-[32px] md:rounded-[48px] overflow-hidden relative border border-gray-100/30 group-hover:shadow-2xl group-hover:shadow-indigo-100 transition-all duration-700">
                     {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <ShoppingBag className="w-8 h-8 text-gray-200" />
                        </div>
                     )}
                     <div className="absolute top-4 right-4 md:top-6 md:right-6">
                        <div className="bg-white/90 backdrop-blur-md w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-xl md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 translate-y-0 md:translate-y-2 md:group-hover:translate-y-0">
                           <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                     </div>
                  </div>
                  <div className="px-2 md:px-4 space-y-1.5 md:space-y-2 text-center">
                     <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-gray-400 group-hover:text-indigo-600 transition-all duration-500 line-clamp-1">{product.name}</h3>
                     <div className="flex items-center justify-center gap-2 md:gap-3">
                        <span className="text-sm md:text-xl font-bold">৳{product.price.toLocaleString("en-US")}</span>
                     </div>
                     <div className="pt-1 md:pt-2 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-y-2 md:group-hover:translate-y-0">
                        <AddToCartButton product={{ id: product.id, name: product.name, price: product.price, image: product.image }} />
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </main>

      {/* 6. Values Section */}
      <section className="bg-[#F8F9FA] py-32">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-20">
            {[
              { icon: ShieldCheck, title: "Secured Payments", desc: "Safe checkout with SSL protection" },
              { icon: Truck, title: "Same Day Delivery", desc: "Available for Dhaka Metro areas" },
              { icon: Star, title: "Loyalty Rewards", desc: "Earn points on every single order" }
            ].map(v => (
              <div key={v.title} className="text-center space-y-6">
                 <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center mx-auto shadow-xl border border-gray-100">
                    <v.icon style={{ color: brandColor }} className="w-8 h-8" />
                 </div>
                 <h4 className="font-bold uppercase tracking-widest text-sm">{v.title}</h4>
                 <p className="text-xs font-medium text-gray-400">{v.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-white py-20 border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-6 text-center space-y-10">
            <h1 className="text-2xl font-bold tracking-tight uppercase">{store.name}</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Powered by BusinessConnect Cloud</p>
         </div>
      </footer>
    </div>
  );
}
