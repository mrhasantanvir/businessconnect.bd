"use client";

import React, { useState, useEffect } from "react";
import {
  Check, Menu, X, ArrowRight, Globe, Shield,
  Users, Zap, Database, Sparkles, Box,
  Smartphone, CreditCard, PieChart, Bell, Star,
  Package, TrendingUp, Layers, Truck, BarChart3,
  MessageSquare, Lock, RefreshCw, ChevronRight,
  Building2, Cpu, FileText, HeadphonesIcon
} from "lucide-react";
import Link from "next/link";

export function LandingPageContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const navLinks = ["Features", "How it Works", "Solutions", "Integrations"];

  const stats = [
    { value: "2,000+", label: "Active Merchants" },
    { value: "500K+", label: "Orders Processed" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "64", label: "Districts Covered" },
  ];

  const coreFeatures = [
    {
      icon: Cpu,
      tag: "AI-Powered",
      title: "Gemini AI Product Engine",
      desc: "Generate complete product listings — title, description, SEO tags, and category — in under 3 seconds. Feed a photo or a few keywords and let our AI do the rest. Supports Bangla and English.",
      points: ["Auto-title & description generation", "Smart category mapping", "Bulk upload with AI fill", "SEO-optimized by default"],
      color: "blue",
    },
    {
      icon: Database,
      tag: "Inventory",
      title: "Multi-Channel Inventory Hub",
      desc: "One source of truth for your entire stock. Sync in real-time across your online store, physical outlets, and third-party marketplaces. Never oversell again.",
      points: ["Live stock sync across all channels", "Low-stock alerts & auto-reorder", "Batch and serial number tracking", "Multi-warehouse management"],
      color: "emerald",
    },
    {
      icon: Truck,
      tag: "Logistics",
      title: "1-Click Courier Booking",
      desc: "Book Pathao, Steadfast, RedX, and Paperfly directly from your dashboard. Auto-generate waybills, track shipments live, and handle returns — all in one place.",
      points: ["Pathao, Steadfast, RedX, Paperfly", "Auto waybill generation", "Live shipment tracking", "Automated return handling"],
      color: "violet",
    },
    {
      icon: BarChart3,
      tag: "Analytics",
      title: "Real-Time Business Intelligence",
      desc: "Powerful dashboards that show you what's working and what's not. From product-level ROI to district-wise sales heatmaps — make every decision with data.",
      points: ["Revenue & profit dashboards", "Product performance ranking", "District-wise sales heatmap", "Custom report builder"],
      color: "amber",
    },
    {
      icon: Users,
      tag: "Team",
      title: "Staff & Role Management",
      desc: "Scale your team safely. Assign granular permissions by role, track activity logs, and manage your entire workforce across departments and locations.",
      points: ["Role-based access control (RBAC)", "Activity & audit logs", "Multi-location team support", "Performance tracking per staff"],
      color: "rose",
    },
    {
      icon: CreditCard,
      tag: "Payments",
      title: "Integrated Payment Gateway",
      desc: "Accept payments via bKash, Nagad, SSLCOMMERZ, and bank transfer. Reconcile automatically and get detailed financial reports at the end of every day.",
      points: ["bKash, Nagad, SSLCOMMERZ", "Auto payment reconciliation", "Daily financial summaries", "Refund & dispute management"],
      color: "teal",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Create Your Store",
      desc: "Sign up and configure your store in minutes. Add your branding, set your currency, and connect your bank — no technical setup required.",
      icon: Building2,
    },
    {
      step: "02",
      title: "Add Your Products with AI",
      desc: "Upload photos or paste product names. Our Gemini AI fills in everything else — descriptions, tags, categories, and SEO metadata — instantly.",
      icon: Cpu,
    },
    {
      step: "03",
      title: "Start Selling & Shipping",
      desc: "Receive orders, book couriers in 1 click, and watch your business grow — all from a single dashboard designed for Bangladesh's market.",
      icon: TrendingUp,
    },
  ];

  const integrations = [
    { name: "Pathao", category: "Courier", color: "bg-red-50 text-red-600 border-red-100" },
    { name: "Steadfast", category: "Courier", color: "bg-blue-50 text-blue-600 border-blue-100" },
    { name: "RedX", category: "Courier", color: "bg-orange-50 text-orange-600 border-orange-100" },
    { name: "Paperfly", category: "Courier", color: "bg-sky-50 text-sky-600 border-sky-100" },
    { name: "bKash", category: "Payment", color: "bg-pink-50 text-pink-600 border-pink-100" },
    { name: "Nagad", category: "Payment", color: "bg-orange-50 text-orange-700 border-orange-100" },
    { name: "SSLCOMMERZ", category: "Payment", color: "bg-green-50 text-green-700 border-green-100" },
    { name: "Gemini AI", category: "AI Engine", color: "bg-blue-50 text-blue-700 border-blue-100" },
  ];

  const reviews = [
    {
      name: "Ariful Islam",
      role: "CEO, GadgetGear BD",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arif",
      content: "We went from 50 to 700+ daily orders without hiring extra staff. The AI product listing and auto courier booking alone save us 4 hours every single day.",
      rating: 5,
      metric: "14x order growth",
    },
    {
      name: "Sultana Razia",
      role: "Founder, Bloom Fashion",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sultana",
      content: "Managing 3 warehouses across Dhaka, Chittagong, and Sylhet is now effortless. The inventory sync is flawless and their support team knows the BD market inside out.",
      rating: 5,
      metric: "3 warehouses, 1 dashboard",
    },
    {
      name: "Tanvir Ahmed",
      role: "Operations Head, TechHub BD",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir",
      content: "The Pathao and Steadfast integrations are seamless. We book 200+ shipments daily with 2 clicks. The real-time tracking dashboard is a game changer for our team.",
      rating: 5,
      metric: "200+ shipments/day, 2 clicks",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; badge: string; dot: string }> = {
    blue:    { bg: "bg-blue-50",   text: "text-blue-600",   badge: "bg-blue-100 text-blue-700",   dot: "bg-blue-500" },
    emerald: { bg: "bg-emerald-50",text: "text-emerald-600",badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
    violet:  { bg: "bg-violet-50", text: "text-violet-600", badge: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
    amber:   { bg: "bg-amber-50",  text: "text-amber-600",  badge: "bg-amber-100 text-amber-700",  dot: "bg-amber-500" },
    rose:    { bg: "bg-rose-50",   text: "text-rose-600",   badge: "bg-rose-100 text-rose-700",    dot: "bg-rose-500" },
    teal:    { bg: "bg-teal-50",   text: "text-teal-600",   badge: "bg-teal-100 text-teal-700",    dot: "bg-teal-500" },
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-jakarta selection:bg-[#DEEBFF] selection:text-[#0052CC] leading-normal">

      {/* Top Accent Bar */}
      <div className="fixed top-0 w-full h-[3px] bg-gradient-to-r from-[#1E40AF] via-[#2563EB] to-[#16A34A] z-[2000]" />

      {/* Navigation */}
      <nav className="fixed top-[3px] w-full z-[1000] bg-white/90 backdrop-blur-xl border-b border-gray-100/80 h-[68px] flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-[#1E40AF] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Box className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-[1.1rem] tracking-tight text-[#0F172A]">BusinessConnect</span>
            </Link>
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm font-semibold text-gray-500 hover:text-[#1E40AF] transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm font-bold text-[#1E40AF] px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              Sign in
            </Link>
            <Link href="/register"
              className="bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1E3A8A] transition-all shadow-md shadow-blue-500/15 hover:shadow-blue-500/25 hover:scale-[1.02]">
              Get Started Free
            </Link>
            <button className="lg:hidden p-2 text-gray-500 hover:text-gray-800" onClick={() => setIsMenuOpen(true)}>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[5000] bg-white flex flex-col lg:hidden">
          <div className="h-[68px] px-6 border-b border-gray-100 flex items-center justify-between">
            <span className="font-extrabold text-lg">BusinessConnect</span>
            <button onClick={() => setIsMenuOpen(false)}><X size={26} className="text-gray-400" /></button>
          </div>
          <div className="p-8 flex flex-col gap-8 text-xl font-bold text-[#0F172A]">
            {navLinks.map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} onClick={() => setIsMenuOpen(false)}>{item}</a>
            ))}
            <div className="h-px bg-gray-100" />
            <Link href="/register" className="text-[#1E40AF]">Get Started Free →</Link>
          </div>
        </div>
      )}

      {/* ─── HERO ─── */}
      <section className="pt-36 md:pt-52 pb-24 px-6 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 -z-10"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-blue-500/8 to-transparent rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#1E40AF]">Now serving 2,000+ merchants across Bangladesh</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#0F172A] leading-[1.08] tracking-tight">
            The Business OS<br />
            <span className="relative inline-block">
              <span className="text-[#1E40AF]">Built for Bangladesh.</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 400 12" fill="none">
                <path d="M2 9 Q100 2 200 8 Q300 14 398 6" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            One platform to run your entire business — AI product listings, inventory sync, courier booking, payments, and analytics. No integrations headache. Just results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/register"
              className="bg-[#1E40AF] text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-[#1E3A8A] transition-all shadow-2xl shadow-blue-500/20 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2">
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link href="/login"
              className="bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold text-base hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              Sign In to Dashboard
            </Link>
          </div>

          <p className="text-xs text-gray-400 font-medium">No credit card required &nbsp;·&nbsp; Free to get started &nbsp;·&nbsp; Cancel anytime</p>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="py-16 border-y border-gray-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl md:text-4xl font-extrabold text-[#1E40AF]">{s.value}</div>
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-[#1E40AF] rounded-full text-xs font-bold uppercase tracking-widest">
              <Layers size={13} /> Platform Features
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] leading-tight">
              Everything your business needs,<br className="hidden md:block" /> in one place
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
              Purpose-built for Bangladesh's e-commerce ecosystem — from AI cataloging to local courier integrations.
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {coreFeatures.map((f, i) => {
              const c = colorMap[f.color];
              return (
                <button key={i} onClick={() => setActiveFeature(i)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    activeFeature === i
                      ? `${c.bg} ${c.text} border-transparent shadow-sm`
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}>
                  {f.title.split(" ")[0]} {f.title.split(" ")[1]}
                </button>
              );
            })}
          </div>

          {/* Active Feature Detail */}
          {(() => {
            const f = coreFeatures[activeFeature];
            const c = colorMap[f.color];
            const Icon = f.icon;
            return (
              <div className={`rounded-[40px] border p-10 md:p-16 ${c.bg} border-transparent`}>
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                  <div className="flex-1 space-y-8">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${c.badge}`}>
                      <Icon size={13} /> {f.tag}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] leading-tight">{f.title}</h3>
                    <p className="text-lg text-gray-600 leading-relaxed font-medium">{f.desc}</p>
                    <ul className="space-y-4">
                      {f.points.map((pt, j) => (
                        <li key={j} className="flex items-center gap-3 text-base font-semibold text-[#0F172A]">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${c.dot}`}>
                            <Check size={11} className="text-white" />
                          </div>
                          {pt}
                        </li>
                      ))}
                    </ul>
                    <Link href="/register"
                      className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 ${c.dot}`}>
                      Explore This Feature <ChevronRight size={16} />
                    </Link>
                  </div>
                  {/* Visual mockup panel */}
                  <div className="flex-1 w-full">
                    <div className="bg-white rounded-[28px] shadow-2xl p-8 space-y-6 border border-white/80">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg}`}>
                            <Icon size={20} className={c.text} />
                          </div>
                          <div>
                            <div className="h-3 w-28 bg-slate-200 rounded-full" />
                            <div className="h-2 w-16 bg-slate-100 rounded-full mt-2" />
                          </div>
                        </div>
                        <Bell size={18} className="text-slate-300" />
                      </div>
                      <div className="space-y-3">
                        {f.points.map((_, j) => (
                          <div key={j} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                            <div className={`w-3 h-3 rounded-full shrink-0 ${c.dot}`} />
                            <div className="flex-1">
                              <div className={`h-2.5 rounded-full ${c.bg}`} style={{ width: `${60 + j * 10}%` }} />
                            </div>
                            <div className="h-2 w-8 bg-slate-200 rounded-full" />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-end gap-2 h-20 pt-2">
                        {[55, 70, 45, 90, 65, 80, 50, 75, 85, 60].map((h, i) => (
                          <div key={i} className={`flex-1 rounded-full ${c.bg} opacity-80`} style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Feature Grid Summary */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-16">
            {coreFeatures.map((f, i) => {
              const c = colorMap[f.color];
              const Icon = f.icon;
              return (
                <button key={i} onClick={() => setActiveFeature(i)}
                  className={`p-7 text-left rounded-[28px] border transition-all hover:shadow-lg group ${
                    activeFeature === i ? `${c.bg} border-transparent shadow-md` : "bg-white border-gray-100 hover:border-gray-200"
                  }`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${c.bg} group-hover:scale-105 transition-transform`}>
                    <Icon size={22} className={c.text} />
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${c.text}`}>{f.tag}</div>
                  <h4 className="font-extrabold text-[#0F172A] mb-2">{f.title}</h4>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2">{f.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-32 px-6 bg-slate-50/60 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold uppercase tracking-widest text-gray-600">
              <RefreshCw size={13} /> How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] leading-tight">
              Go live in under 30 minutes
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto font-medium">
              No developers needed. No complex setup. Just sign up and start selling.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 to-blue-200" />

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all text-center space-y-6">
                  <div className="w-14 h-14 bg-[#1E40AF] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                    <Icon size={26} />
                  </div>
                  <div className="absolute top-6 right-8 text-5xl font-black text-gray-100 select-none">{step.step}</div>
                  <h3 className="text-xl font-extrabold text-[#0F172A]">{step.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-sm">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SOLUTIONS ─── */}
      <section id="solutions" className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-[#1E40AF] rounded-full text-xs font-bold uppercase tracking-widest">
              <Globe size={13} /> Enterprise Solutions
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] leading-tight">
              A unified ecosystem<br /> for Digital Bangladesh
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed font-medium">
              We've built every module from the ground up so they work together seamlessly. No messy third-party integrations, no data silos — just one clean workflow from order to delivery.
            </p>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { icon: FileText, label: "Automated Invoice & Billing" },
                { icon: Truck, label: "Real-time Shipment Tracking" },
                { icon: Package, label: "Multi-warehouse Support" },
                { icon: Shield, label: "Local VAT & Tax Ready" },
                { icon: MessageSquare, label: "Built-in Customer CRM" },
                { icon: Lock, label: "Bank-grade Data Security" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 p-4 bg-blue-50/60 rounded-2xl border border-blue-100/50">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-[#1E40AF]" />
                  </div>
                  <span className="font-bold text-sm text-[#0F172A]">{label}</span>
                </div>
              ))}
            </div>
            <Link href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#0F172A] text-white rounded-2xl font-bold text-sm hover:bg-[#1E293B] transition-all">
              Explore Enterprise Solutions <ArrowRight size={16} />
            </Link>
          </div>
          {/* Dashboard Preview */}
          <div className="flex-1 relative w-full max-w-lg mx-auto">
            <div className="absolute -inset-8 bg-blue-500/5 blur-[80px] rounded-full" />
            <div className="relative bg-white rounded-[44px] border border-gray-100 shadow-2xl p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#1E40AF] rounded-lg flex items-center justify-center">
                    <Box size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="h-2.5 w-28 bg-slate-200 rounded-full" />
                    <div className="h-2 w-16 bg-slate-100 rounded-full mt-1.5" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <div className="text-[10px] font-bold text-green-600">LIVE</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Today's Revenue", val: "৳1,24,800", color: "bg-blue-50", icon: TrendingUp, iconColor: "text-blue-500" },
                  { label: "Active Orders", val: "247", color: "bg-emerald-50", icon: Package, iconColor: "text-emerald-500" },
                  { label: "In Transit", val: "89", color: "bg-amber-50", icon: Truck, iconColor: "text-amber-500" },
                  { label: "Low Stock Items", val: "12", color: "bg-rose-50", icon: Bell, iconColor: "text-rose-500" },
                ].map(({ label, val, color, icon: Icon, iconColor }) => (
                  <div key={label} className={`${color} rounded-2xl p-5 space-y-3`}>
                    <Icon size={18} className={iconColor} />
                    <div className="text-lg font-black text-[#0F172A]">{val}</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Orders</div>
                {["Order #5821 · Chittagong", "Order #5820 · Dhaka", "Order #5819 · Sylhet"].map((o, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-xl" />
                      <div>
                        <div className="text-xs font-bold text-[#0F172A]">{o}</div>
                        <div className="h-1.5 w-16 bg-slate-100 rounded mt-1" />
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">Confirmed</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTEGRATIONS ─── */}
      <section id="integrations" className="py-28 px-6 bg-slate-50/50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">
            <Zap size={13} className="text-amber-500" /> Native Integrations
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] mb-4">
            Connects with the tools you already use
          </h2>
          <p className="text-base text-gray-500 font-medium mb-16 max-w-xl mx-auto">
            Pre-built integrations with Bangladesh's top couriers, payment gateways, and AI services — ready on day one.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {integrations.map((item) => (
              <div key={item.name} className={`flex flex-col items-center gap-3 p-6 bg-white rounded-[24px] border ${item.color.split(" ").find(c => c.startsWith("border-")) || "border-gray-100"} hover:shadow-lg transition-all`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black ${item.color}`}>
                  {item.name.charAt(0)}
                </div>
                <div className="font-extrabold text-sm text-[#0F172A]">{item.name}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-32 px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/4 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
            <div className="space-y-5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest">
                <Star size={12} className="fill-current" /> Merchant Stories
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] leading-tight">
                Trusted by merchants<br /> scaling across Bangladesh
              </h2>
            </div>
            <div className="flex gap-4 shrink-0">
              <div className="bg-blue-50 px-8 py-6 rounded-3xl border border-blue-100 text-center">
                <div className="text-3xl font-extrabold text-[#1E40AF]">4.9</div>
                <div className="flex gap-0.5 justify-center mt-1.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Avg Rating</div>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <div key={i} className="p-8 bg-white border border-slate-100 rounded-[36px] shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    {review.metric}
                  </div>
                </div>
                <p className="text-base font-medium text-slate-600 leading-relaxed flex-1 mb-8">
                  &ldquo;{review.content}&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                    <img src={review.image} alt={review.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#0F172A] text-sm">{review.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-[#0F172A] rounded-[48px] px-10 py-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/15 blur-[80px] rounded-full" />
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-widest">
              <HeadphonesIcon size={13} /> Dedicated Support Included
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Ready to grow your<br /> business faster?
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium">
              Join 2,000+ merchants already using BusinessConnect. Get full platform access and our onboarding team will guide you step by step.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register"
                className="bg-[#BEF264] text-[#0F172A] px-10 py-4 rounded-2xl font-extrabold text-base hover:scale-[1.03] transition-all shadow-2xl shadow-lime-400/10 flex items-center justify-center gap-2">
                Get Started — It&apos;s Free <ArrowRight size={18} />
              </Link>
              <Link href="/login"
                className="bg-white/10 text-white border border-white/20 px-10 py-4 rounded-2xl font-bold text-base hover:bg-white/15 transition-all flex items-center justify-center gap-2">
                Sign In
              </Link>
            </div>
            <p className="text-xs text-gray-600 font-medium">No credit card required &nbsp;·&nbsp; Setup in under 30 minutes</p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white py-20 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#1E40AF] rounded-xl flex items-center justify-center">
                <Box size={18} className="text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight">BusinessConnect</span>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed text-sm max-w-xs">
              The AI-First Business Operating System designed for Bangladesh's digital economy. From inventory to delivery, we automate it all.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              All systems operational
            </div>
          </div>
          {[
            {
              heading: "Product",
              links: ["AI Product Engine", "Inventory Hub", "Logistics & Courier", "Payments", "Analytics", "Staff Management"],
            },
            {
              heading: "Solutions",
              links: ["Retail & E-commerce", "Wholesale & B2B", "Multi-location Brands", "Enterprise"],
            },
            {
              heading: "Company",
              links: ["About Us", "Privacy Policy", "Terms of Service", "Help Center", "Contact"],
            },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0F172A] mb-6">{heading}</h4>
              <ul className="space-y-4">
                {links.map(l => (
                  <li key={l} className="text-sm font-semibold text-gray-400 hover:text-[#1E40AF] cursor-pointer transition-colors">{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-gray-300 tracking-widest uppercase">© 2026 BusinessConnect.bd — The Pride of Digital Bangladesh</p>
          <div className="flex items-center gap-3 opacity-40">
            <div className="w-8 h-5 bg-red-600 rounded-sm" />
            <div className="w-8 h-5 bg-emerald-600 rounded-sm" />
          </div>
        </div>
      </footer>
    </div>
  );
}
