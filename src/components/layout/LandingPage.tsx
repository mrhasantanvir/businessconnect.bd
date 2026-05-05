"use client";

import React, { useState, useEffect } from "react";
import {
  Check, Menu, X, ArrowRight, ChevronDown, ChevronUp,
  Globe, Shield, Users, Zap, Database, Box,
  CreditCard, Bell, Star, Package, TrendingUp,
  Truck, BarChart3, MessageSquare, Lock,
  Building2, Cpu, FileText, HeadphonesIcon, Layers
} from "lucide-react";
import Link from "next/link";

const R = { sm: "6px", md: "10px", lg: "14px", xl: "20px", "2xl": "28px", "3xl": "36px", pill: "9999px" };
const FONT: React.CSSProperties = { fontFamily: "'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, sans-serif" };
const BLUE = "#1D4ED8";
const DARK = "#0F172A";

export function LandingPageContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const navLinks = ["Features", "How it Works", "Solutions", "Integrations"];

  const faqs = [
    { q: "How do I get started with BusinessConnect?", a: "Sign up for a free account, add your products using our AI engine, connect your preferred couriers and payment methods, and start receiving orders — all within 30 minutes. No developer or technical setup required." },
    { q: "Which courier services are integrated?", a: "We support Pathao, Steadfast, RedX, and Paperfly natively. Booking, waybill generation, and live tracking are all done from within the BusinessConnect dashboard." },
    { q: "Is BusinessConnect suitable for small businesses?", a: "Absolutely. We have merchants starting from 5 orders a day all the way to 700+ orders a day. Our platform scales with you and pricing is based on your usage — you only pay for what you need." },
    { q: "How does the AI product listing work?", a: "Upload a photo or type a product name. Our Gemini AI engine generates a full product listing — title, description, category, SEO tags — in under 3 seconds. It supports both Bangla and English." },
    { q: "Is my business data secure?", a: "Yes. All data is encrypted at rest and in transit. We use bank-grade TLS 1.3 encryption, role-based access control, and maintain 99.9% uptime with full audit logs." },
  ];

  const partners = ["Pathao", "Steadfast", "RedX", "bKash", "Nagad", "SSLCOMMERZ", "Paperfly", "Gemini AI"];

  const reviews = [
    { name: "Ariful Islam", role: "CEO, GadgetGear BD", content: "BusinessConnect is one of the best decisions we've ever made for our store. Our order volume tripled in 3 months and the AI product listing alone saves us hours every day.", rating: 5, seed: "Arif" },
    { name: "Sultana Razia", role: "Founder, Bloom Fashion", content: "Managing 3 warehouses used to be a nightmare. Now everything syncs in real-time. Their support team understands the Bangladesh market inside out and responds within hours.", rating: 5, seed: "Sultana" },
  ];

  return (
    <div className="landing-page min-h-screen bg-white text-slate-900 antialiased overflow-x-hidden" style={FONT}>

      {/* ─── Ambient gradient orbs ─── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(219,234,254,0.55) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", top: "20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(253,242,248,0.50) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "20%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,253,244,0.45) 0%, transparent 60%)" }} />
      </div>

      {/* ─── NAV ─── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(226,232,240,0.7)", height: 64 }}>
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <div style={{ width: 32, height: 32, borderRadius: R.md, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box size={16} className="text-white" />
              </div>
              <span className="font-extrabold text-slate-900" style={{ fontSize: "1rem" }}>BusinessConnect.</span>
            </Link>
            <div className="hidden lg:flex items-center gap-7">
              {navLinks.map(n => (
                <a key={n} href={`#${n.toLowerCase().replace(/\s+/g, "-")}`} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">{n}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block text-sm font-semibold text-slate-600 px-4 py-2 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50">Sign In</Link>
            <Link href="/register" className="text-sm font-bold text-white px-5 py-2.5 hover:opacity-90 transition-opacity" style={{ background: DARK, borderRadius: R.pill }}>Sign up Free</Link>
            <button className="lg:hidden p-2 text-slate-500" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[5000] bg-white flex flex-col" style={FONT}>
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
            <span className="font-extrabold text-slate-900">BusinessConnect.</span>
            <button onClick={() => setMenuOpen(false)}><X size={22} className="text-slate-400" /></button>
          </div>
          <div className="p-8 flex flex-col gap-6 text-lg font-semibold text-slate-900">
            {navLinks.map(n => <a key={n} href={`#${n.toLowerCase().replace(/\s+/g, "-")}`} onClick={() => setMenuOpen(false)} className="hover:text-blue-700 transition-colors">{n}</a>)}
            <div className="h-px bg-slate-100" />
            <Link href="/register" className="text-blue-700 font-bold">Sign up Free →</Link>
          </div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ═══════════════════════
            HERO
        ═══════════════════════ */}
        <section style={{ paddingTop: 128, paddingBottom: 0, textAlign: "center" }}>
          <div className="max-w-3xl mx-auto px-6" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>

            <div className="inline-flex items-center gap-2 font-semibold text-slate-600" style={{ padding: "5px 14px", borderRadius: R.pill, background: "rgba(255,255,255,0.9)", border: "1px solid #E2E8F0", fontSize: "0.72rem", letterSpacing: "0.01em" }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#6366F1" }} />
              Top Business Platform of Bangladesh
            </div>

            <h1 className="font-extrabold text-slate-900 tracking-tight" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", lineHeight: 1.12, maxWidth: 700 }}>
              Smarter Operations,<br />Stronger Bangladesh Business
            </h1>

            <p className="text-slate-500 font-medium" style={{ fontSize: "1.02rem", lineHeight: 1.75, maxWidth: 500 }}>
              BusinessConnect helps you automate relationships, streamline sales processes, and make data-driven decisions — so you can focus on closing more deals.
            </p>

            <Link href="/register" className="inline-flex items-center gap-2 font-bold text-white hover:opacity-90 transition-opacity" style={{ padding: "13px 28px", background: DARK, borderRadius: R.pill, fontSize: "0.9rem" }}>
              Get Started <ArrowRight size={16} />
            </Link>

            <p className="text-slate-400 font-medium" style={{ fontSize: "0.75rem" }}>No credit card required · Free to get started</p>
          </div>

          {/* Hero dashboard mockup */}
          <div className="max-w-4xl mx-auto px-6" style={{ marginTop: 56, paddingBottom: 0 }}>
            <div style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: "24px 24px 0 0", boxShadow: "0 -4px 60px rgba(0,0,0,0.06), 0 20px 80px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              {/* Window chrome */}
              <div style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FCA5A5" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FDE68A" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#A7F3D0" }} />
                <div style={{ flex: 1, margin: "0 12px", height: 22, background: "#EFF6FF", borderRadius: R.pill, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "0.6rem", color: "#64748B", fontWeight: 600 }}>businessconnect.bd/dashboard</span>
                </div>
              </div>
              {/* Dashboard content */}
              <div style={{ padding: 20, background: "#FAFAFA" }}>
                <div className="grid grid-cols-4 gap-3" style={{ marginBottom: 16 }}>
                  {[
                    { label: "Today's Revenue", val: "৳1,24,800", change: "+18%", bg: "#EFF6FF", accent: "#2563EB" },
                    { label: "Active Orders",   val: "247",       change: "+32%", bg: "#F0FDF4", accent: "#16A34A" },
                    { label: "In Transit",      val: "89",        change: "Live",  bg: "#FFF7ED", accent: "#D97706" },
                    { label: "AI Products",     val: "1,204",     change: "+55%", bg: "#F5F3FF", accent: "#7C3AED" },
                  ].map(({ label, val, change, bg, accent }) => (
                    <div key={label} style={{ background: "white", border: "1px solid #F1F5F9", borderRadius: R.lg, padding: "14px 16px" }}>
                      <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 900, color: DARK, lineHeight: 1.1 }}>{val}</div>
                      <div style={{ marginTop: 6, fontSize: "0.62rem", fontWeight: 700, color: accent, background: bg, display: "inline-block", padding: "2px 7px", borderRadius: R.pill }}>{change}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2" style={{ background: "white", border: "1px solid #F1F5F9", borderRadius: R.lg, padding: "16px 18px" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: DARK, marginBottom: 14 }}>Revenue Overview</div>
                    <div className="flex items-end gap-2" style={{ height: 72 }}>
                      {[38,55,42,70,58,82,65,90,72,85,60,95].map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, background: i >= 9 ? "#2563EB" : "#DBEAFE", borderRadius: "4px 4px 0 0", transition: "all 0.3s" }} />
                      ))}
                    </div>
                    <div className="flex justify-between" style={{ marginTop: 8 }}>
                      {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => (
                        <div key={m} style={{ fontSize: "0.5rem", color: "#94A3B8", fontWeight: 600 }}>{m}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "white", border: "1px solid #F1F5F9", borderRadius: R.lg, padding: "16px 18px" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: DARK, marginBottom: 10 }}>Recent Orders</div>
                    {["#5821 Chittagong", "#5820 Dhaka", "#5819 Sylhet", "#5818 Rajshahi"].map((o, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < 3 ? "1px solid #F8FAFC" : "none" }}>
                        <div style={{ width: 22, height: 22, borderRadius: R.sm, background: "#F1F5F9", flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: DARK }}>{o}</div>
                        </div>
                        <div style={{ fontSize: "0.55rem", fontWeight: 700, color: "#059669", background: "#D1FAE5", padding: "2px 7px", borderRadius: R.pill }}>Confirmed</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════
            TRUST STRIP
        ═══════════════════════ */}
        <section style={{ padding: "44px 24px 36px", borderBottom: "1px solid #F1F5F9" }}>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-slate-400 font-semibold uppercase tracking-widest" style={{ fontSize: "0.65rem", marginBottom: 28 }}>Trusted integrations powering 2,000+ stores</p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {partners.map(p => (
                <div key={p} className="font-extrabold text-slate-300 hover:text-slate-500 transition-colors" style={{ fontSize: "0.8rem", letterSpacing: "0.04em" }}>{p}</div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════
            FEATURE 1 — AI Products
        ═══════════════════════ */}
        <section id="features" style={{ padding: "88px 24px" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left text */}
              <div style={{ flex: "0 0 44%", display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="inline-flex items-center gap-1.5 font-semibold text-slate-500" style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366F1", display: "inline-block" }} />
                  Data & AI
                </div>
                <h2 className="font-extrabold text-slate-900 tracking-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.15 }}>
                  Selling Digital Products Is Easier.
                </h2>
                <p className="text-slate-500 font-medium" style={{ fontSize: "0.93rem", lineHeight: 1.75 }}>
                  Digital Products Are The Future. Start Being Profitable For Smart Entrepreneurs. Our Gemini AI generates full product listings — title, description, SEO tags — in under 3 seconds.
                </p>
                <Link href="/register" className="inline-flex items-center gap-2 font-bold text-white hover:opacity-90 transition-opacity self-start" style={{ padding: "10px 22px", background: DARK, borderRadius: R.pill, fontSize: "0.84rem" }}>
                  Learn More <ArrowRight size={14} />
                </Link>
                {/* Stat cards row */}
                <div className="flex gap-4" style={{ marginTop: 8 }}>
                  <div style={{ background: "white", border: "1px solid #F1F5F9", borderRadius: R.xl, padding: "14px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", flex: 1 }}>
                    <div style={{ fontSize: "0.58rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>AI Products Generated</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 900, color: DARK, lineHeight: 1 }}>8,429,782</div>
                    <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#16A34A", marginTop: 4 }}>↑ Higher Than Last Month</div>
                  </div>
                  <div style={{ background: "white", border: "1px solid #F1F5F9", borderRadius: R.xl, padding: "14px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", flex: 1 }}>
                    <div style={{ fontSize: "0.58rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Offline Sales</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 900, color: DARK, lineHeight: 1 }}>৳9,983,410</div>
                    <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#16A34A", marginTop: 4 }}>↑ Higher Than Last Month</div>
                  </div>
                </div>
              </div>
              {/* Right mockup */}
              <div style={{ flex: 1, width: "100%" }}>
                <div style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: R["2xl"], boxShadow: "0 8px 48px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                  <div style={{ background: "#F8FAFC", borderBottom: "1px solid #F1F5F9", padding: "10px 16px", display: "flex", gap: 6, alignItems: "center" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: DARK }}>Store Order Analysis</div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                      {["Online","Offline"].map((l, i) => (
                        <div key={l} className="flex items-center gap-1">
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? "#2563EB" : "#E2E8F0" }} />
                          <span style={{ fontSize: "0.58rem", fontWeight: 600, color: "#94A3B8" }}>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: 20 }}>
                    <div className="flex items-end gap-3 justify-center" style={{ height: 120, marginBottom: 8 }}>
                      {[
                        { on: 68, off: 42 }, { on: 80, off: 55 }, { on: 55, off: 38 },
                        { on: 92, off: 65 }, { on: 74, off: 50 }, { on: 85, off: 60 },
                        { on: 60, off: 44 }, { on: 95, off: 70 },
                      ].map((d, i) => (
                        <div key={i} style={{ display: "flex", gap: 2, alignItems: "flex-end", flex: 1 }}>
                          <div style={{ flex: 1, height: `${d.on}%`, background: "#2563EB", borderRadius: "3px 3px 0 0" }} />
                          <div style={{ flex: 1, height: `${d.off}%`, background: "#DBEAFE", borderRadius: "3px 3px 0 0" }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"].map(m => (
                        <div key={m} style={{ fontSize: "0.55rem", color: "#94A3B8", fontWeight: 600, flex: 1, textAlign: "center" }}>{m}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════
            FEATURE 2 — CRM / Business
        ═══════════════════════ */}
        <section style={{ padding: "0 24px 88px" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left mockup: activity card */}
              <div style={{ flex: 1, width: "100%" }}>
                <div style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: R["2xl"], boxShadow: "0 8px 48px rgba(0,0,0,0.07)", padding: 24 }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: DARK, marginBottom: 16 }}>Recent Activity</div>
                  <div className="flex gap-2" style={{ marginBottom: 14 }}>
                    {["All","Selling","Marketing"].map((t, i) => (
                      <div key={t} style={{ padding: "5px 12px", borderRadius: R.pill, fontSize: "0.68rem", fontWeight: 700, background: i === 0 ? "#1D4ED8" : "#F8FAFC", color: i === 0 ? "white" : "#94A3B8", border: i === 0 ? "none" : "1px solid #E2E8F0", cursor: "pointer" }}>{t}</div>
                    ))}
                  </div>
                  {[
                    { name: "Stone Black Jacket", price: "৳2,800", event: "New Order", time: "10 min ago", bg: "#1D4ED8" },
                    { name: "Premium T-Shirt",    price: "৳1,400", event: "Restocked",  time: "25 min ago", bg: "#059669" },
                    { name: "Summer Hoodie",      price: "৳3,200", event: "Shipped",    time: "1 hr ago",   bg: "#D97706" },
                  ].map(({ name, price, event, time, bg }) => (
                    <div key={name} className="flex items-center gap-3" style={{ padding: "10px 0", borderBottom: "1px solid #F8FAFC" }}>
                      <div style={{ width: 36, height: 36, borderRadius: R.md, background: bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Package size={16} className="text-white" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: DARK }}>{name}</div>
                        <div style={{ fontSize: "0.62rem", fontWeight: 600, color: "#94A3B8" }}>{event} · {time}</div>
                      </div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 800, color: DARK }}>{price}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Right text */}
              <div style={{ flex: "0 0 44%", display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="inline-flex items-center gap-1.5 font-semibold text-slate-500" style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
                  Platform Features
                </div>
                <h2 className="font-extrabold text-slate-900 tracking-tight" style={{ fontSize: "clamp(1.7rem, 2.8vw, 2.4rem)", lineHeight: 1.2 }}>
                  What Can Our Business OS Do For You?
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { icon: Cpu,      color: "#EFF6FF", ic: "#2563EB", title: "AI Product Management",   desc: "Generate complete listings in seconds using Gemini AI. Bangla and English supported." },
                    { icon: BarChart3, color: "#FFF7ED", ic: "#D97706", title: "Smart Data Analytics",    desc: "Get Real-Time Reports And Insights To Help Make Better Decisions Across Your Store." },
                    { icon: Truck,    color: "#F0FDF4", ic: "#16A34A", title: "1-Click Courier Booking",  desc: "Book Pathao, Steadfast, RedX from your dashboard with auto waybill generation." },
                    { icon: Shield,   color: "#F5F3FF", ic: "#7C3AED", title: "Bank-Grade Security",      desc: "Role-based access, encrypted data, audit logs — fully compliant and secure." },
                  ].map(({ icon: Ic, color, ic, title, desc }) => (
                    <div key={title} className="flex items-start gap-4" style={{ padding: "14px 16px", background: "white", border: "1px solid #F1F5F9", borderRadius: R.lg, boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                      <div style={{ width: 36, height: 36, background: color, borderRadius: R.md, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Ic size={17} style={{ color: ic }} />
                      </div>
                      <div>
                        <div style={{ fontSize: "0.83rem", fontWeight: 700, color: DARK, marginBottom: 3 }}>{title}</div>
                        <div style={{ fontSize: "0.76rem", fontWeight: 500, color: "#64748B", lineHeight: 1.55 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/register" className="inline-flex items-center gap-2 font-bold text-white hover:opacity-90 transition-opacity self-start" style={{ padding: "10px 22px", background: DARK, borderRadius: R.pill, fontSize: "0.84rem", marginTop: 4 }}>
                  Learn More <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════
            TESTIMONIALS
        ═══════════════════════ */}
        <section style={{ padding: "80px 24px", background: "#FAFAFA", borderTop: "1px solid #F1F5F9", borderBottom: "1px solid #F1F5F9" }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center" style={{ marginBottom: 56 }}>
              <div className="inline-flex items-center gap-1.5 font-semibold text-slate-500" style={{ fontSize: "0.68rem", letterSpacing: "0.05em", marginBottom: 14 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />
                Our Testimonial
              </div>
              <h2 className="font-extrabold text-slate-900 tracking-tight" style={{ fontSize: "clamp(1.7rem, 3vw, 2.4rem)", lineHeight: 1.15 }}>
                What Our Customers Say
              </h2>
              <p className="text-slate-500 font-medium" style={{ marginTop: 10, fontSize: "0.88rem", maxWidth: 400, margin: "10px auto 0" }}>
                Not How Companies can Move more Steadfast That Same Business Goals
              </p>
              <div style={{ marginTop: 20 }}>
                <Link href="/register" className="inline-flex items-center gap-2 font-bold text-white hover:opacity-90 transition-opacity" style={{ padding: "10px 22px", background: DARK, borderRadius: R.pill, fontSize: "0.84rem" }}>
                  See All Testimonials <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left stat */}
              <div style={{ flex: "0 0 200px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 36 }}>
                <div>
                  <div className="font-extrabold" style={{ fontSize: "3rem", color: DARK, lineHeight: 1 }}>৳2.5M</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94A3B8", marginTop: 6 }}>Revenue Generated</div>
                </div>
                <div>
                  <div className="font-extrabold" style={{ fontSize: "3rem", color: DARK, lineHeight: 1 }}>45%</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94A3B8", marginTop: 6 }}>Online Revenue Growth</div>
                </div>
              </div>
              {/* Right testimonials */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                {reviews.map((r, i) => (
                  <div key={i} style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: R.xl, padding: "28px 28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                    <div className="flex gap-0.5" style={{ marginBottom: 14 }}>
                      {[...Array(r.rating)].map((_, j) => <Star key={j} size={13} className="fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-slate-700 font-medium" style={{ fontSize: "0.93rem", lineHeight: 1.75, marginBottom: 18 }}>
                      &ldquo;{r.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.seed}`} alt={r.name} style={{ width: 36, height: 36, borderRadius: "50%", background: "#F1F5F9" }} />
                      <div>
                        <div style={{ fontSize: "0.84rem", fontWeight: 700, color: DARK }}>{r.name}</div>
                        <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "#94A3B8" }}>{r.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════
            FEATURE 3 — Build/Grow
        ═══════════════════════ */}
        <section id="solutions" style={{ padding: "88px 24px" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left text */}
              <div style={{ flex: "0 0 44%", display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="inline-flex items-center gap-1.5 font-semibold text-slate-500" style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563EB", display: "inline-block" }} />
                  Order Features
                </div>
                <h2 className="font-extrabold text-slate-900 tracking-tight" style={{ fontSize: "clamp(1.7rem, 2.8vw, 2.4rem)", lineHeight: 1.2 }}>
                  BusinessConnect Helps You Build Beautiful Store Operations
                </h2>
                <p className="text-slate-500 font-medium" style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>
                  Providing Customer Service In One Platform. Our Responsive Landing Page Works On All Devices. With A Fully Redesigned Project Management Experience.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { ic: "🤖", label: "Simply AI-Powered", desc: "Auto-fill product listings, packaging and web page items now use AI features." },
                    { ic: "🎯", label: "Easy To Customize", desc: "Add custom landing packaging and web page features by category and brand." },
                    { ic: "⚡", label: "Made With Tailwind CSS", desc: "Modern stacking packages and web page features now use Tail-wind for free." },
                  ].map(({ ic, label, desc }) => (
                    <div key={label} className="flex items-start gap-4" style={{ padding: "14px 0" }}>
                      <div style={{ width: 36, height: 36, borderRadius: R.md, background: "#F8FAFC", border: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{ic}</div>
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: DARK, marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: "0.76rem", fontWeight: 500, color: "#64748B", lineHeight: 1.55 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Right mockup */}
              <div style={{ flex: 1 }}>
                <div style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: R["2xl"], boxShadow: "0 8px 48px rgba(0,0,0,0.07)", padding: 24 }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: DARK }}>Store Order Analysis</div>
                    <div className="flex gap-4">
                      {["Statistics","Sales","Insight"].map((t, i) => (
                        <span key={t} style={{ fontSize: "0.62rem", fontWeight: 700, color: i === 0 ? "#2563EB" : "#94A3B8", paddingBottom: 2, borderBottom: i === 0 ? "2px solid #2563EB" : "none", cursor: "pointer" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end gap-2 justify-center" style={{ height: 120 }}>
                    {[
                      ["৳2k","#EFF6FF"],["৳4k","#EFF6FF"],["৳5k","#EFF6FF"],["৳3k","#EFF6FF"],
                      ["৳7k","#2563EB"],["৳6k","#2563EB"],["৳8k","#2563EB"],
                    ].map(([label, color], i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                        <div style={{ fontSize: "0.5rem", color: "#94A3B8", fontWeight: 700, marginBottom: 4 }}>{label}</div>
                        <div style={{ width: "100%", background: color, borderRadius: "5px 5px 0 0", height: `${[35,50,62,42,85,72,95][i]}%`, border: "1px solid rgba(0,0,0,0.04)" }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-around" style={{ marginTop: 8 }}>
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul"].map(m => (
                      <div key={m} style={{ fontSize: "0.55rem", color: "#94A3B8", fontWeight: 600 }}>{m}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════
            FAQ
        ═══════════════════════ */}
        <section style={{ padding: "80px 24px", background: "#FAFAFA", borderTop: "1px solid #F1F5F9" }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center" style={{ marginBottom: 48 }}>
              <div className="inline-flex items-center gap-1.5 font-semibold text-slate-500" style={{ fontSize: "0.68rem", letterSpacing: "0.05em", marginBottom: 14 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F43F5E", display: "inline-block" }} />
                Our FAQs
              </div>
              <h2 className="font-extrabold text-slate-900 tracking-tight" style={{ fontSize: "clamp(1.7rem, 3vw, 2.4rem)", lineHeight: 1.15, marginBottom: 10 }}>
                Business OS Sales FAQs
              </h2>
              <p className="text-slate-500 font-medium" style={{ fontSize: "0.88rem", maxWidth: 420, margin: "0 auto 20px" }}>
                As a leading digital merchant agency, we are dedicated to providing comprehensive educational resources and answering frequently asked questions to help our clients.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/register" className="inline-flex items-center gap-2 font-bold text-white hover:opacity-90 transition-opacity" style={{ padding: "10px 22px", background: DARK, borderRadius: R.pill, fontSize: "0.84rem" }}>
                  More Questions <ArrowRight size={14} />
                </Link>
                <Link href="/login" className="inline-flex items-center gap-2 font-bold text-slate-700 hover:bg-slate-100 transition-colors" style={{ padding: "10px 22px", background: "white", border: "1.5px solid #E2E8F0", borderRadius: R.pill, fontSize: "0.84rem" }}>
                  Contact Us
                </Link>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {faqs.map((f, i) => (
                <div key={i} style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: R.xl, overflow: "hidden" }}>
                  <button className="w-full text-left flex items-center justify-between gap-4 font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                    style={{ padding: "18px 22px", fontSize: "0.875rem" }}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {f.q}
                    {openFaq === i ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: "0 22px 18px", fontSize: "0.855rem", color: "#64748B", lineHeight: 1.75, fontWeight: 500, borderTop: "1px solid #F1F5F9" }}>
                      <div style={{ paddingTop: 14 }}>{f.a}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════
            FOOTER CTA
        ═══════════════════════ */}
        <section style={{ padding: "72px 24px 0" }}>
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8" style={{ paddingBottom: 64, borderBottom: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: R.md, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Box size={16} className="text-white" />
                </div>
                <span className="font-extrabold" style={{ fontSize: "1rem" }}>BusinessConnect.</span>
              </div>
              <h2 className="font-extrabold text-slate-900 tracking-tight" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", lineHeight: 1.2, maxWidth: 360 }}>
                Are You Interested With BusinessConnect?
              </h2>
              <div>
                <Link href="/register" className="inline-flex items-center gap-2 font-bold text-white hover:opacity-90 transition-opacity" style={{ padding: "11px 24px", background: DARK, borderRadius: R.pill, fontSize: "0.875rem" }}>
                  Contact Sales
                </Link>
              </div>
            </div>
            {/* Decorative mockup */}
            <div style={{ flex: 1, maxWidth: 480 }}>
              <div style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: R["2xl"], padding: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-2.5" style={{ marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: R.sm, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Box size={13} className="text-white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, width: 110, background: "#E2E8F0", borderRadius: R.pill }} />
                    <div style={{ height: 6, width: 68, background: "#F1F5F9", borderRadius: R.pill, marginTop: 5 }} />
                  </div>
                  <div className="flex items-center gap-1">
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
                    <span style={{ fontSize: "0.55rem", fontWeight: 700, color: "#059669" }}>LIVE</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[["Revenue","৳1,24,800","#EFF6FF"],["Orders","247","#F0FDF4"],["Returns","3","#FFF1F2"]].map(([label, val, bg]) => (
                    <div key={label} style={{ background: bg, borderRadius: R.md, padding: "10px 12px" }}>
                      <div style={{ fontSize: "0.55rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 900, color: DARK }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════
            FOOTER
        ═══════════════════════ */}
        <footer style={{ padding: "40px 24px 32px", background: "white" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12" style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="flex items-center gap-2">
                  <div style={{ width: 28, height: 28, borderRadius: R.md, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Box size={14} className="text-white" />
                  </div>
                  <span className="font-extrabold text-slate-900" style={{ fontSize: "0.95rem" }}>BusinessConnect.</span>
                </div>
                <p className="text-slate-400 font-medium" style={{ fontSize: "0.8rem", lineHeight: 1.6, maxWidth: 220 }}>
                  The AI-First Business OS for Bangladesh's digital economy.
                </p>
              </div>
              <div className="flex flex-wrap gap-12">
                {[
                  { heading: "Company",          links: ["Security", "Brand Guidelines", "Careers"] },
                  { heading: "Career",            links: ["Jobs", "Hiring", "Internship"] },
                  { heading: "Legal Information", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
                ].map(({ heading, links }) => (
                  <div key={heading}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: DARK, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>{heading}</div>
                    <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {links.map(l => <li key={l} className="text-slate-400 hover:text-slate-700 cursor-pointer transition-colors font-medium" style={{ fontSize: "0.82rem" }}>{l}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4" style={{ paddingTop: 24, borderTop: "1px solid #F1F5F9" }}>
              <div className="flex items-center gap-2">
                <div style={{ width: 24, height: 24, borderRadius: R.md, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Box size={12} className="text-white" />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: DARK }}>BusinessConnect.</span>
                <span style={{ fontSize: "0.7rem", color: "#CBD5E1", fontWeight: 500 }}>Home · About Us · Reviews</span>
              </div>
              <p style={{ fontSize: "0.72rem", color: "#CBD5E1", fontWeight: 500 }}>© 2026 BusinessConnect.bd — Terms & Conditions · Privacy Policy</p>
              <div className="flex items-center gap-2">
                {["f","ig","tw","yt","in"].map(s => (
                  <div key={s} style={{ width: 28, height: 28, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "0.55rem", fontWeight: 800, color: "#94A3B8", textTransform: "lowercase" }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
