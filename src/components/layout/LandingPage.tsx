"use client";

import React, { useState, useEffect } from "react";
import { 
  Check, Menu, X, ArrowRight, BarChart2, Globe, Shield, 
  Users, Zap, ChevronRight, Layout, Database, Clock, Sparkles, Box,
  Smartphone, CreditCard, PieChart, Bell, Star
} from "lucide-react";
import Link from "next/link";

export function LandingPageContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-jakarta selection:bg-[#DEEBFF] selection:text-[#0052CC] leading-normal">
      
      {/* Signature Branding Bar */}
      <div className="fixed top-0 w-full h-1 bg-gradient-to-r from-[#1E40AF] via-[#16A34A] to-[#BEF264] z-[2000]"></div>

      {/* Sticky Navigation */}
      <nav className="fixed top-1 w-full z-[1000] bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center transition-all">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2 group">
              <Box className="w-8 h-8 text-[#1E40AF] group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xl tracking-tight">BusinessConnect</span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-8">
              {["Features", "Solutions", "Enterprise", "Pricing"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-gray-500 hover:text-[#1E40AF] transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-[#1E40AF] px-3 py-2">Sign in</Link>
            <Link 
              href="/register" 
              className="hidden sm:block bg-[#1E40AF] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1E3A8A] transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
            >
              Get started
            </Link>
            <button className="lg:hidden p-2 text-gray-500" onClick={() => setIsMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[5000] bg-white flex flex-col lg:hidden animate-in fade-in duration-300">
          <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between">
             <span className="font-bold text-lg">BusinessConnect</span>
             <button onClick={() => setIsMenuOpen(false)}><X size={28} className="text-gray-400" /></button>
          </div>
          <div className="p-10 flex flex-col gap-10 text-2xl font-bold text-[#0F172A]">
             <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
             <a href="#solutions" onClick={() => setIsMenuOpen(false)}>Solutions</a>
             <a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a>
             <div className="h-px bg-gray-100" />
             <Link href="/login" className="text-[#1E40AF]">Start free trial</Link>
          </div>
        </div>
      )}

      {/* Hero Section - Subtle Glow & Motion */}
      <section className="pt-32 md:pt-48 pb-32 px-6 relative bg-gradient-to-b from-blue-50/20 to-transparent">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30-30-30z' fill='%231E40AF' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }}>
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-blue-50 rounded-full shadow-sm">
            <Sparkles size={14} className="text-[#1E40AF]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1E40AF]">Bangladesh's Most Powerful Business OS</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
            Scale with total <br /> <span className="text-[#1E40AF] relative">Intelligence. <div className="absolute -bottom-2 left-0 w-full h-1 bg-green-400/30 rounded-full"></div></span>
          </h1>
          
          <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            A unified platform to automate your entire business. From high-speed AI product listing to automated global logistics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 px-10 sm:px-0 relative z-20">
            <Link 
              href="/register" 
              className="bg-[#1E40AF] text-white px-6 py-3.5 sm:px-10 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg hover:bg-[#1E3A8A] transition-all shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 text-center block w-full sm:w-auto"
            >
              Get Started Now
            </Link>
            <button className="bg-white border border-gray-200 text-gray-600 px-6 py-3.5 sm:px-10 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
              Watch Demo <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Section - Enhanced with Glass Cards */}
      <section id="features" className="py-32 px-6 bg-emerald-50/10 relative border-y border-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl font-bold text-[#0F172A]">Elite Features for Elite Brands</h2>
            <p className="text-lg text-gray-500 font-medium">Built to solve the unique chaos of high-scale commerce.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Zap, title: "Gemini AI Listings", desc: "Automate your product cataloging in seconds with world-class AI models." },
              { icon: Database, title: "Smart Inventory", desc: "Real-time stock sync across all channels, warehouses, and physical stores." },
              { icon: Globe, title: "Automated Logistics", desc: "Direct integration with Pathao, Steadfast, and RedX for 1-click booking." },
              { icon: Shield, title: "Enterprise Security", desc: "Bank-grade encryption and 99.9% uptime guarantee for total peace of mind." },
              { icon: Users, title: "Staff Collaboration", desc: "Granular role-based access to manage large teams across 64 districts." },
              { icon: PieChart, title: "Advanced Analytics", desc: "Powerful real-time reporting to help you optimize ROI and daily operations." }
            ].map((feature, i) => (
              <div key={i} className="p-10 bg-white/50 backdrop-blur-md rounded-[40px] border border-gray-100 hover:border-[#1E40AF]/20 hover:shadow-2xl transition-all group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                  <feature.icon size={28} className="text-[#1E40AF]" />
                </div>
                <h3 className="text-xl font-extrabold mb-4 text-[#0F172A]">{feature.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions - UI Showcase */}
      <section id="solutions" className="py-32 px-6 bg-slate-50/50 overflow-hidden">
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
            <div className="flex-1 space-y-10">
               <h2 className="text-4xl font-bold text-[#0F172A] leading-tight">A Unified Ecosystem for <br /> Digital Bangladesh.</h2>
               <p className="text-xl text-gray-500 leading-relaxed font-medium">
                  We've built every module from the ground up to ensure they work together seamlessly. No more messy integrations.
               </p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    "Automatic Billing", "Real-time Tracking", "Multi-warehouse Support", "Local VAT/Tax Ready"
                  ].map(li => (
                    <div key={li} className="flex items-center gap-3 text-base font-bold text-[#0F172A]">
                       <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <Check size={14} className="text-[#1E40AF]" />
                       </div>
                       {li}
                    </div>
                  ))}
               </div>
               <button className="px-10 py-5 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-2xl font-bold hover:bg-black transition-all">
                  Explore Enterprise Solutions
               </button>
            </div>
            <div className="flex-1 relative group">
               <div className="absolute -inset-10 bg-blue-500/5 blur-[100px] rounded-full animate-pulse"></div>
               <div className="relative bg-white p-10 rounded-[60px] border border-gray-100 shadow-2xl">
                  <div className="space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="w-24 h-4 bg-slate-100 rounded-full" />
                        <Bell className="w-6 h-6 text-slate-300" />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-blue-50 rounded-3xl space-y-4">
                           <CreditCard className="w-8 h-8 text-blue-500" />
                           <div className="h-4 w-full bg-blue-100/50 rounded" />
                        </div>
                        <div className="p-6 bg-emerald-50 rounded-3xl space-y-4">
                           <Smartphone className="w-8 h-8 text-emerald-500" />
                           <div className="h-4 w-full bg-emerald-100/50 rounded" />
                        </div>
                     </div>
                     <div className="p-8 bg-slate-50 rounded-3xl space-y-6">
                        <div className="flex justify-between items-center">
                           <div className="h-4 w-20 bg-slate-200 rounded" />
                           <div className="h-4 w-12 bg-slate-100 rounded" />
                        </div>
                        <div className="flex items-end gap-3 h-24">
                           {[40, 70, 45, 90, 60, 80, 50, 65, 85].map((h, i) => (
                              <div key={i} className="flex-1 bg-blue-200 rounded-full" style={{ height: `${h}%` }} />
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Social Proof - Scrolling Logos */}
      <section className="py-24 border-y border-gray-100">
         <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-[0.3em] mb-16">Trusted by High-Scale Brands</p>
            <div className="flex flex-wrap justify-center items-center gap-16 lg:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
               <div className="text-3xl font-black italic">DARAZ</div>
               <div className="text-3xl font-black italic">CHALDAL</div>
               <div className="text-3xl font-black italic">PATHAO</div>
               <div className="text-3xl font-black italic">SHOPUP</div>
               <div className="text-3xl font-black italic">G&G</div>
            </div>
         </div>
      </section>

      {/* Pricing - Polished Cards */}
      <section id="pricing" className="py-32 bg-blue-50/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
             <h2 className="text-4xl font-bold text-[#0F172A]">Plans Built for Success</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {[
              { name: "Starter", price: "2,500", desc: "Perfect for new retailers" },
              { name: "Growth", price: "6,500", desc: "Scaling high-volume shops", popular: true },
              { name: "Enterprise", price: "Custom", desc: "For large organizations" }
            ].map((plan, i) => (
              <div key={i} className={`p-12 bg-white border rounded-[50px] flex flex-col transition-all ${plan.popular ? 'border-[#1E40AF] shadow-2xl ring-8 ring-blue-500/5' : 'border-gray-100 hover:shadow-xl'}`}>
                {plan.popular && <div className="bg-[#1E40AF] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full self-start mb-6">Most Popular</div>}
                <h3 className="text-xl font-extrabold mb-2 text-[#0F172A]">{plan.name}</h3>
                <p className="text-sm text-gray-400 font-medium mb-8">{plan.desc}</p>
                <div className="text-5xl font-extrabold mb-10 text-[#0F172A]">
                  {plan.price !== "Custom" && "৳"}{plan.price}
                  {plan.price !== "Custom" && <span className="text-sm text-gray-400 font-normal">/mo</span>}
                </div>
                <ul className="space-y-6 mb-12 flex-1">
                  {["Unlimited Orders", "Premium Support", "AI Modules", "Mobile Dashboard"].map(f => (
                    <li key={f} className="flex items-center gap-4 text-sm font-bold text-[#0F172A]">
                      <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                         <Check size={12} className="text-[#16A34A]" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/register"
                  className={`w-full py-5 rounded-2xl font-bold text-base transition-all text-center relative z-20 ${plan.popular ? 'bg-[#1E40AF] text-white shadow-xl hover:bg-[#1E3A8A]' : 'bg-[#F1F5F9] text-[#0F172A] hover:bg-gray-200'}`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section - Modern Social Proof */}
      <section className="py-32 px-6 bg-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full -mr-48 -mt-48"></div>
         <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
               <div className="space-y-4 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#1E40AF] rounded-full text-[10px] font-black uppercase tracking-widest">
                     <Star size={12} className="fill-current" /> Wall of Love
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
                    Trusted by 2,000+ <br /> Scaling Merchants in <span className="text-[#1E40AF]">Bangladesh.</span>
                  </h2>
               </div>
               <div className="flex gap-4">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                     <div className="text-3xl font-black text-[#1E40AF]">4.9/5</div>
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Average Merchant Rating</div>
                  </div>
               </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {[
                 {
                   name: "Ariful Islam",
                   role: "CEO, GadgetGear",
                   image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arif",
                   content: "BusinessConnect transformed our operations. We've scaled from 50 orders to 500+ daily with their automated logistics integration. The AI product listing is a game changer!",
                   rating: 5
                 },
                 {
                   name: "Sultana Razia",
                   role: "Founder, Bloom Fashion",
                   image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sultana",
                   content: "Managing multiple warehouses across Bangladesh was a nightmare until we found this platform. Their support team is incredibly responsive and understands the local market.",
                   rating: 5
                 },
                 {
                   name: "Tanvir Ahmed",
                   role: "Operations Head, TechHub BD",
                   image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir",
                   content: "The seamless integration with Pathao and Steadfast saves us hours every single day. Being able to track everything from one dashboard is exactly what we needed to scale.",
                   rating: 5
                 }
               ].map((review, i) => (
                 <div key={i} className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
                    <div className="flex gap-1 mb-6">
                       {[...Array(review.rating)].map((_, i) => (
                         <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                       ))}
                    </div>
                    <p className="text-lg font-medium text-slate-600 leading-relaxed mb-10 italic">
                      "{review.content}"
                    </p>
                    <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                       <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                          <img src={review.image} alt={review.name} className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <h4 className="font-bold text-[#0F172A]">{review.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.role}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Ready to Scale - Final CTA */}
      <section className="py-24 px-6">
         <div className="max-w-5xl mx-auto bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 rounded-[60px] p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to Scale Your <br /> Business in Bangladesh?</h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">Join thousands of successful merchants who have moved to BusinessConnect.</p>
            <Link href="/register" className="relative z-20 bg-[#BEF264] text-[#0F172A] px-12 py-6 rounded-3xl font-extrabold text-xl hover:scale-105 transition-all inline-block shadow-2xl shadow-lime-400/10">
               Initialize Your Free Trial
            </Link>
         </div>
      </section>

      {/* Elite Footer */}
      <footer className="bg-white py-24 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <Box size={24} className="text-[#1E40AF]" />
              <span className="font-bold text-2xl tracking-tight">BusinessConnect</span>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed">
              The leading AI-First Business Operating System designed for the digital economy of Bangladesh.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#0F172A] mb-8">Product</h4>
            <ul className="space-y-5 text-sm font-bold text-gray-400">
              <li>CRM & Sales</li>
              <li>Inventory Hub</li>
              <li>Logistics AI</li>
              <li>Books & Accounting</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#0F172A] mb-8">Support</h4>
            <ul className="space-y-5 text-sm font-bold text-gray-400">
              <li>Documentation</li>
              <li>API Status</li>
              <li>Help Center</li>
              <li>Community</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#0F172A] mb-8">Company</h4>
            <ul className="space-y-5 text-sm font-bold text-gray-400">
              <li>About Vision</li>
              <li>Our Story</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-xs font-bold text-gray-300 tracking-widest uppercase">© 2026 BusinessConnect.bd - The Pride of Digital Bangladesh</p>
           <div className="flex gap-10 opacity-30">
              <div className="w-10 h-6 bg-red-600 rounded-sm" />
              <div className="w-10 h-6 bg-emerald-600 rounded-sm" />
           </div>
        </div>
      </footer>
    </div>
  );
}
