"use client";

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Search, 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Clock,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Globe,
  Plus,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PredictiveSearch } from "../PredictiveSearch";
import { AIPersonalizedPicks } from "../AIPersonalizedPicks";
import { useStorefront } from "@/context/StorefrontContext";

export function ThemeNokkhotro({ store, brandColor }: { store: any, brandColor: string }) {
  const { cartCount, cartTotal, currency, setCurrency, formatPrice } = useStorefront();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [showCurrency, setShowCurrency] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#0F172A] selection:bg-indigo-100 font-sans">
      
      {/* 1. Header & Navigation (The Gateway) */}
      <header className={cn(
        "fixed top-0 w-full z-[100] transition-all duration-500",
        isScrolled ? "bg-white/80 backdrop-blur-xl border-b border-slate-100 py-4 shadow-sm" : "bg-transparent py-6"
      )}>
         <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
            <div className="flex items-center gap-12">
               <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-full transition-all"
                  >
                    <Menu className="w-5 h-5 text-slate-900" />
                  </button>
                  <h1 className="text-2xl font-bold tracking-tight uppercase text-indigo-600">
                    {store.name}
                  </h1>
               </div>
               <nav className="hidden lg:flex items-center gap-8">
                  {["Collection", "New Arrivals", "Premium Pick", "Story"].map(item => (
                    <a key={item} href="#" className="text-[10px] font-bold uppercase tracking-widest hover:text-indigo-600 transition-colors">
                       {item}
                    </a>
                  ))}
               </nav>
            </div>

            <div className="flex items-center gap-6">
               <PredictiveSearch storeId={store.id} />
               <div className="flex items-center gap-4">
                  <div className="relative">
                     <button 
                        onClick={() => setShowCurrency(!showCurrency)}
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                     >
                        <Globe className="w-4 h-4" /> {currency.code}
                     </button>
                     {showCurrency && (
                        <div className="absolute top-full right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 z-[200] min-w-[100px] animate-in fade-in slide-in-from-top-2">
                           {["BDT", "USD", "EUR", "GBP"].map(code => (
                              <button 
                                 key={code}
                                 onClick={() => { setCurrency(code); setShowCurrency(false); }}
                                 className={cn(
                                   "w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all",
                                   currency.code === code ? "text-indigo-600 bg-indigo-50" : "text-slate-400"
                                 )}
                              >
                                 {code}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
                  <div className="relative p-2 hover:bg-slate-100 rounded-full transition-all group cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent("toggleCart"))}>
                     <ShoppingBag className="w-5 h-5" />
                     <span className="absolute top-0 right-0 w-4 h-4 bg-indigo-600 text-white text-[8px] font-bold flex items-center justify-center rounded-full shadow-lg">{cartCount}</span>
                     
                     {/* Micro-Cart Hover Preview */}
                     <div className="absolute top-full right-0 mt-4 w-64 bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all z-50">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Cart Preview</p>
                        {cartCount === 0 ? (
                           <div className="text-center py-6 text-slate-300 text-xs font-bold">Your cart is empty</div>
                        ) : (
                           <div className="space-y-4 mb-6">
                              <div className="flex justify-between text-[10px] font-bold uppercase">
                                 <span>Subtotal</span>
                                 <span>৳{cartTotal.toLocaleString()}</span>
                              </div>
                           </div>
                        )}
                        <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest">Checkout Now</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Mobile Menu Drawer */}
         {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[300] lg:hidden">
               <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
               <div className="absolute inset-y-0 left-0 w-[80%] max-w-sm bg-white shadow-2xl p-8 animate-in slide-in-from-left duration-500">
                  <div className="flex items-center justify-between mb-12">
                     <h1 className="text-xl font-bold tracking-tight uppercase text-indigo-600">{store.name}</h1>
                     <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-full">
                        <X className="w-6 h-6 text-slate-400" />
                     </button>
                  </div>
                  <nav className="space-y-8">
                     {["Collection", "New Arrivals", "Premium Pick", "Story"].map(item => (
                        <a key={item} href="#" className="block text-2xl font-bold uppercase tracking-tight hover:text-indigo-600 transition-colors">
                           {item}
                        </a>
                     ))}
                  </nav>
                  <div className="mt-20 pt-8 border-t border-slate-100 space-y-6">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Currency</p>
                     <div className="grid grid-cols-4 gap-2">
                        {["BDT", "USD", "EUR", "GBP"].map(code => (
                           <button 
                              key={code}
                              onClick={() => { setCurrency(code); setIsMobileMenuOpen(false); }}
                              className={cn(
                                "py-3 text-[10px] font-bold uppercase rounded-xl transition-all border",
                                currency.code === code ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-400 border-slate-100"
                              )}
                           >
                              {code}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         )}
      </header>

      {/* 2. Hero Section (The First Impression) */}
      <section className="relative h-[100vh] overflow-hidden flex items-center">
         <div className="absolute inset-0">
            <img 
               src={store.coverImage || store.products?.[0]?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80"} 
               className="w-full h-full object-cover" 
               alt="Hero"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
         </div>
         
         <div className="max-w-[1400px] mx-auto w-full px-8 relative z-10 space-y-10 animate-in fade-in slide-in-from-left-20 duration-1000">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
               <Sparkles className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Direct from Origin</span>
            </div>
            <h2 className="text-2xl lg:text-[140px] font-bold tracking-tight uppercase leading-[0.85] text-slate-900">
               Pure <br /> <span className="text-indigo-600">Heritage</span>
            </h2>
            <p className="max-w-md text-lg font-bold text-slate-500 uppercase leading-relaxed tracking-wider">
               Authentic products sourced directly from local artisans and farmers. Quality you can trust.
            </p>
            <button className="px-12 py-6 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-6 hover:bg-indigo-600 transition-all shadow-2xl hover:scale-105">
               Start Shopping <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </section>

      {/* 3. Trust Bar (Trust Indicators) */}
      <section className="bg-white border-y border-slate-100 py-12 px-8">
         <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
               { icon: Truck, label: "Free Shipping", sub: "Orders over ৳৫০০" },
               { icon: CheckCircle2, label: "Organic Certified", sub: "100% Pesticide Free" },
               { icon: RotateCcw, label: "Instant Replace", sub: "7 Days Easy Returns" },
               { icon: ShieldCheck, label: "Secure Payment", sub: "bKash, Nagad & Cards" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-6 group cursor-default">
                 <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <item.icon className="w-7 h-7" />
                 </div>
                 <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">{item.label}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{item.sub}</p>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* 4. Trending Categories (Visual Grid) */}
      <section className="max-w-[1400px] mx-auto px-8 py-32 space-y-16">
         <div className="text-center space-y-4">
            <h3 className="text-lg font-bold tracking-tight uppercase">Shop By <span className="text-indigo-600">Category</span></h3>
            <div className="w-20 h-1 bg-indigo-600 mx-auto" />
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {["Grocery", "Fashion", "Electronics", "Beauty", "Home", "Gifts"].map((cat, i) => (
              <div key={i} className="group space-y-4 text-center cursor-pointer">
                 <div className="aspect-square bg-white rounded-full border border-slate-100 flex items-center justify-center p-8 group-hover:border-indigo-600 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 transition-all duration-500">
                    <img src={`https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100`} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">{cat}</span>
              </div>
            ))}
         </div>
      </section>

      {/* 5. Dynamic Product Grid (Smart Listing) */}
      <section className="max-w-[1400px] mx-auto px-8 pb-32 space-y-20">
         <div className="flex items-end justify-between border-b border-slate-100 pb-12">
            <div>
               <h3 className="text-lg font-bold tracking-tight uppercase">The <span className="text-indigo-600">Premium</span> List</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Selected for excellence</p>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-indigo-600 transition-all">Explore All Products</button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-20">
            {store.products?.map((product: any) => (
              <div 
                key={product.id} 
                className="group space-y-6 cursor-pointer"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => window.location.href = `/s/${store.slug}/p/${product.id}`}
              >
                 <div className="aspect-[3/4] bg-white rounded-[40px] overflow-hidden relative shadow-sm hover:shadow-2xl transition-all duration-700">
                    <img 
                       src={product.image} 
                       className={cn("w-full h-full object-cover transition-transform duration-[2s]", hoveredProduct === product.id ? "scale-110 opacity-0" : "scale-100 opacity-100")} 
                    />
                    {/* Hover Swap Image (Visual Psychology) */}
                    <img 
                       src={product.image} // Placeholder for second image
                       className={cn("absolute inset-0 w-full h-full object-cover transition-transform duration-[2s]", hoveredProduct === product.id ? "scale-100 opacity-100" : "scale-110 opacity-0")} 
                    />
                    
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                       <span className="px-3 py-1.5 bg-white text-[#0F172A] text-[8px] font-bold uppercase tracking-widest rounded-full shadow-xl">AI Choice</span>
                    </div>

                    {/* Quick Add UI */}
                    <div className="absolute bottom-6 left-6 right-6 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                       <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             window.dispatchEvent(new CustomEvent("addToCart", { detail: product }));
                          }}
                          className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 shadow-2xl"
                       >
                          <Plus className="w-4 h-4" /> Quick Add To Cart
                       </button>
                    </div>
                 </div>
                 
                 <div className="space-y-2 px-4">
                    <div className="flex items-center justify-between">
                       <h4 className="text-sm font-bold uppercase tracking-tight truncate flex-1">{product.name}</h4>
                       <span className="text-sm font-bold text-indigo-600">{formatPrice(product.price)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                       {product.category?.name || "Local Harvest"} • 
                       <span className="text-emerald-600">Available in {product.allowedDistricts || "All Over BD"}</span>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* 6. Special Deal (Urgency) */}
      <section className="px-8 pb-32">
         <div className="max-w-[1400px] mx-auto bg-indigo-600 rounded-[64px] p-12 lg:p-24 relative overflow-hidden flex flex-col items-center text-center text-white space-y-12 shadow-2xl shadow-indigo-600/20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="space-y-6 relative z-10">
               <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-100">Limited Time Offer</p>
               <h2 className="text-2xl lg:text-2xl font-bold tracking-tight uppercase leading-none">Deal Of The <span className="text-indigo-200">Season</span></h2>
            </div>
            
            <div className="flex gap-4 md:gap-12 relative z-10">
               {["04", "12", "45", "08"].map((time, i) => (
                 <div key={i} className="flex flex-col items-center">
                    <div className="text-2xl lg:text-2xl font-bold tracking-tight">{time}</div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{["Days", "Hours", "Mins", "Secs"][i]}</span>
                 </div>
               ))}
            </div>

            <button className="px-12 py-5 bg-white text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all relative z-10 shadow-2xl">
               Claim Discount Now
            </button>
         </div>
      </section>

      {/* 7. Why Us? (Brand Story) */}
      <section className="max-w-[1400px] mx-auto px-8 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
         <div className="aspect-video bg-white rounded-[64px] overflow-hidden shadow-2xl border border-slate-100">
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
         </div>
         <div className="space-y-10">
            <h3 className="text-lg font-bold tracking-tight uppercase leading-none text-slate-900">
               The Story of <br /> <span className="text-indigo-600">Authenticity</span>
            </h3>
            <div className="space-y-6">
               <p className="text-lg font-bold text-slate-500 uppercase leading-relaxed">
                  Founded on the principles of direct sourcing and fair trade. We believe that everyone deserves access to original products without hidden margins.
               </p>
               <div className="space-y-4">
                  {[
                    "Hand-picked from Rajshahi Orchards",
                    "3-Step Quality Control Protocol",
                    "Fair Pricing for Our Farmers"
                  ].map(item => (
                    <div key={item} className="flex items-center gap-4">
                       <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white"><Plus className="w-3 h-3" /></div>
                       <span className="text-xs font-bold uppercase tracking-widest text-slate-900">{item}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 8. Customer Reviews (Social Proof) */}
      <section className="bg-white py-32 px-8">
         <div className="max-w-[1400px] mx-auto space-y-20">
            <div className="flex items-end justify-between border-b border-slate-100 pb-12">
               <div>
                  <h3 className="text-lg font-bold tracking-tight uppercase">Loved by <span className="text-indigo-600">The People</span></h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Verified customer experiences</p>
               </div>
               <button className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-indigo-600 transition-all">All Reviews</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[1, 2, 3].map(i => (
                 <div key={i} className="p-10 bg-[#F9FAFB] rounded-[48px] space-y-8 border border-slate-100 hover:border-indigo-600 transition-all group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-bold shadow-sm">KU</div>
                       <div>
                          <h5 className="text-xs font-bold uppercase text-slate-900">Kabir Ullah</h5>
                          <div className="flex gap-1 mt-1">
                             {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 text-amber-500 fill-amber-500" />)}
                          </div>
                       </div>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase leading-relaxed">
                       "The quality of the mangoes was beyond expectations. Delivered fresh and within 24 hours in Dhaka."
                    </p>
                    <div className="flex items-center gap-2 text-[8px] font-bold uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit">
                       <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 8. AI Personalized Recommendations */}
      <AIPersonalizedPicks products={store.products} storeId={store.id} />

      {/* Footer (The Anchor) */}
      <footer className="bg-slate-900 py-32 px-8 text-white">
         <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
            <div className="col-span-1 lg:col-span-2 space-y-12">
               <h2 className="text-2xl font-bold tracking-tight uppercase leading-none">Stay In The <br /> <span className="text-indigo-400">Inner Circle</span></h2>
               <div className="max-w-md space-y-6">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Subscribe for 10% off your first order and exclusive access to new harvests.</p>
                  <div className="flex border-b-2 border-slate-700 pb-4">
                     <input placeholder="ENTER EMAIL ADDRESS" className="bg-transparent border-none outline-none text-[10px] font-bold w-full" />
                     <button className="hover:text-indigo-400 transition-all"><ArrowRight className="w-6 h-6" /></button>
                  </div>
               </div>
            </div>
            <div className="space-y-8">
               <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400">Information</h5>
               <ul className="space-y-4">
                  {["About Us", "Contact", "Sitemap", "Terms & Conditions"].map(l => (
                    <li key={l}><a href="#" className="text-xs font-bold text-slate-400 uppercase hover:text-white transition-colors">{l}</a></li>
                  ))}
               </ul>
            </div>
            <div className="space-y-8 text-right">
               <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400">Location</h5>
               <p className="text-xs font-bold text-slate-400 uppercase leading-relaxed">
                  Rajshahi Branch<br />
                  Central Market, Block B<br />
                  Dhaka, Bangladesh
               </p>
               <div className="flex items-center justify-end gap-6 pt-10 grayscale opacity-40">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Nagad_Logo.svg/1200px-Nagad_Logo.svg.png" className="h-6" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/BKash_Logo.svg/2560px-BKash_Logo.svg.png" className="h-4" />
               </div>
            </div>
         </div>
      </footer>

      {/* AI Chat Widget (Persistent) */}
      <div className="fixed bottom-10 right-10 z-[200]">
         <button className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/40 hover:scale-110 transition-all relative group">
            <MessageSquare className="w-8 h-8" />
            <div className="absolute right-full mr-4 px-6 py-3 bg-white text-slate-900 text-slate-900 border border-slate-100 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
               Ask AI Assistant
            </div>
         </button>
      </div>

    </div>
  );
}
