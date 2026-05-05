"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Menu, X, ArrowRight, ChevronDown, ChevronUp,
  Shield, Box, Package, Truck, BarChart3, Star, Cpu
} from "lucide-react";
import Link from "next/link";

/* ─── Design tokens ─── */
const R = { sm:"6px",md:"10px",lg:"14px",xl:"20px","2xl":"28px","3xl":"36px",pill:"9999px" };
const BLUE = "#1D4ED8";
const DARK = "#0F172A";

/* ─── Scroll-reveal hook ─── */
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Animated counter ─── */
function useCounter(target: number, duration = 1400, enabled = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [enabled, target, duration]);
  return val;
}

/* ─── Inline CSS (keyframes + utility) ─── */
const STYLES = `
@keyframes lp-float   { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-10px)} }
@keyframes lp-fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes lp-fadeLeft{ from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }
@keyframes lp-fadeRight{from{opacity:0;transform:translateX(28px)}  to{opacity:1;transform:translateX(0)} }
@keyframes lp-scaleIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
@keyframes lp-pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.55;transform:scale(1.25)} }
@keyframes lp-marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
@keyframes lp-barGrow { from{height:0} to{height:var(--bar-h)} }
@keyframes lp-ping    { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2);opacity:0} }

.lp-float   { animation:lp-float 4s ease-in-out infinite; }
.lp-pulse-dot::after {
  content:''; position:absolute; inset:0; border-radius:50%;
  background:inherit; animation:lp-ping 1.4s cubic-bezier(0,0,0.2,1) infinite;
}
.lp-reveal-up    { opacity:0; transform:translateY(28px); transition:opacity .55s cubic-bezier(.16,1,.3,1),transform .55s cubic-bezier(.16,1,.3,1); }
.lp-reveal-left  { opacity:0; transform:translateX(-28px); transition:opacity .55s cubic-bezier(.16,1,.3,1),transform .55s cubic-bezier(.16,1,.3,1); }
.lp-reveal-right { opacity:0; transform:translateX(28px);  transition:opacity .55s cubic-bezier(.16,1,.3,1),transform .55s cubic-bezier(.16,1,.3,1); }
.lp-reveal-scale { opacity:0; transform:scale(0.94);        transition:opacity .5s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.16,1,.3,1); }
.lp-shown        { opacity:1 !important; transform:none !important; }
.lp-d1 { transition-delay:.05s!important } .lp-d2 { transition-delay:.12s!important }
.lp-d3 { transition-delay:.19s!important } .lp-d4 { transition-delay:.26s!important }
.lp-d5 { transition-delay:.33s!important } .lp-d6 { transition-delay:.40s!important }
.lp-hover-lift { transition:transform .2s,box-shadow .2s; }
.lp-hover-lift:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(0,0,0,0.10)!important; }
`;

export function LandingPageContent() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [mounted, setMounted]     = useState(false);
  const [openFaq, setOpenFaq]     = useState<number | null>(0);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const FONT: React.CSSProperties = { fontFamily:"var(--font-jakarta),Inter,-apple-system,BlinkMacSystemFont,sans-serif" };
  const navLinks = ["Features","How it Works","Solutions","Integrations"];
  const partners = ["Pathao","Steadfast","RedX","bKash","Nagad","SSLCOMMERZ","Paperfly","Gemini AI"];
  const faqs = [
    { q:"How do I get started with BusinessConnect?",   a:"Sign up, add products with our AI engine, connect couriers and payments — live within 30 minutes. No technical setup needed." },
    { q:"Which courier services are integrated?",       a:"Pathao, Steadfast, RedX, and Paperfly. Booking, waybill generation, and live tracking are done from the dashboard." },
    { q:"Is it suitable for small businesses?",         a:"Yes — we support merchants from 5 to 700+ daily orders. Pricing scales with usage; you only pay for what you need." },
    { q:"How does AI product listing work?",            a:"Upload a photo or type a product name. Gemini AI generates title, description, category, and SEO tags in under 3 seconds in Bangla or English." },
    { q:"Is my business data secure?",                 a:"All data is TLS 1.3 encrypted at rest and in transit. Role-based access, audit logs, 99.9% uptime — bank-grade security." },
  ];
  const reviews = [
    { name:"Ariful Islam",   role:"CEO, GadgetGear BD",  content:"Our order volume tripled in 3 months. The AI product listing alone saves hours every day.", rating:5, seed:"Arif" },
    { name:"Sultana Razia",  role:"Founder, Bloom Fashion", content:"Managing 3 warehouses used to be a nightmare. Now everything syncs in real-time and support responds within hours.", rating:5, seed:"Sultana" },
  ];

  /* ─── Section refs ─── */
  const hero     = useReveal(0.05);
  const trust    = useReveal(0.1);
  const feat1L   = useReveal(0.1);
  const feat1R   = useReveal(0.1);
  const feat2L   = useReveal(0.1);
  const feat2R   = useReveal(0.1);
  const testi    = useReveal(0.1);
  const feat3L   = useReveal(0.1);
  const feat3R   = useReveal(0.1);
  const faqSec   = useReveal(0.1);
  const ctaSec   = useReveal(0.08);

  /* Animated counters (stat section) */
  const c1 = useCounter(8429782, 1600, testi.visible);
  const c2 = useCounter(9983410, 1800, testi.visible);
  const c3 = useCounter(2500000,  1400, testi.visible);
  const c4 = useCounter(45,        900, testi.visible);

  const fmtBDT = (n: number) => n >= 1000000 ? `৳${(n/1000000).toFixed(1)}M` : `৳${n.toLocaleString()}`;

  return (
    <div className="landing-page min-h-screen bg-white text-slate-900 antialiased overflow-x-hidden" style={FONT}>
      <style>{STYLES}</style>

      {/* ── Ambient orbs ── */}
      <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:"-8%",left:"-4%",width:640,height:640,borderRadius:"50%",background:"radial-gradient(circle,rgba(219,234,254,0.6) 0%,transparent 62%)" }} />
        <div style={{ position:"absolute",top:"18%",right:"-8%",width:560,height:560,borderRadius:"50%",background:"radial-gradient(circle,rgba(253,242,248,0.55) 0%,transparent 62%)" }} />
        <div style={{ position:"absolute",bottom:"12%",left:"22%",width:460,height:460,borderRadius:"50%",background:"radial-gradient(circle,rgba(240,253,244,0.5) 0%,transparent 62%)" }} />
      </div>

      {/* ═══════ NAV ═══════ */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:1000,background:"rgba(255,255,255,0.88)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(226,232,240,0.7)",height:58 }}>
        <div className="max-w-6xl mx-auto px-5 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div style={{ width:30,height:30,borderRadius:R.md,background:BLUE,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Box size={15} className="text-white" />
              </div>
              <span className="font-extrabold text-slate-900" style={{ fontSize:"0.95rem" }}>BusinessConnect.</span>
            </Link>
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map(n=>(
                <a key={n} href={`#${n.toLowerCase().replace(/\s+/g,"-")}`} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">{n}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block text-sm font-semibold text-slate-600 px-3 py-1.5 hover:text-blue-700 transition-colors hover:bg-blue-50" style={{ borderRadius:R.lg }}>Sign In</Link>
            <Link href="/register" className="text-sm font-bold text-white px-4 py-2 hover:opacity-90 transition-all hover:scale-105" style={{ background:DARK,borderRadius:R.pill }}>Sign up Free</Link>
            <button className="lg:hidden p-1.5 text-slate-500" onClick={()=>setMenuOpen(true)}><Menu size={19}/></button>
          </div>
        </div>
      </nav>

      {menuOpen&&(
        <div className="fixed inset-0 z-[5000] bg-white flex flex-col" style={FONT}>
          <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between">
            <span className="font-extrabold text-slate-900">BusinessConnect.</span>
            <button onClick={()=>setMenuOpen(false)}><X size={21} className="text-slate-400"/></button>
          </div>
          <div className="p-7 flex flex-col gap-5 text-lg font-semibold text-slate-900">
            {navLinks.map(n=><a key={n} href={`#${n.toLowerCase().replace(/\s+/g,"-")}`} onClick={()=>setMenuOpen(false)} className="hover:text-blue-700 transition-colors">{n}</a>)}
            <div className="h-px bg-slate-100"/>
            <Link href="/register" className="text-blue-700 font-bold">Sign up Free →</Link>
          </div>
        </div>
      )}

      <div style={{ position:"relative",zIndex:1 }}>

        {/* ═══════ HERO ═══════ */}
        <section style={{ paddingTop:96,paddingBottom:0,textAlign:"center" }}>
          <div ref={hero.ref} className="max-w-3xl mx-auto px-5" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:18 }}>
            {/* badge */}
            <div className={`inline-flex items-center gap-2 font-semibold text-slate-600 lp-reveal-up ${hero.visible?"lp-shown":""}`}
              style={{ padding:"4px 13px",borderRadius:R.pill,background:"rgba(255,255,255,0.92)",border:"1px solid #E2E8F0",fontSize:"0.7rem",letterSpacing:"0.01em" }}>
              <span className="lp-pulse-dot" style={{ display:"inline-block",width:6,height:6,borderRadius:"50%",background:"#6366F1",position:"relative" }}/>
              Top Business Platform of Bangladesh
            </div>

            <h1 className={`font-extrabold text-slate-900 tracking-tight lp-reveal-up lp-d1 ${hero.visible?"lp-shown":""}`}
              style={{ fontSize:"clamp(2rem,4.8vw,3.4rem)",lineHeight:1.12,maxWidth:680 }}>
              Smarter Operations,<br/>Stronger Bangladesh Business
            </h1>

            <p className={`text-slate-500 font-medium lp-reveal-up lp-d2 ${hero.visible?"lp-shown":""}`}
              style={{ fontSize:"0.97rem",lineHeight:1.7,maxWidth:480 }}>
              BusinessConnect helps you automate relationships, streamline sales, and make data-driven decisions — so you can focus on closing more deals.
            </p>

            <div className={`flex items-center gap-3 lp-reveal-up lp-d3 ${hero.visible?"lp-shown":""}`}>
              <Link href="/register" className="inline-flex items-center gap-2 font-bold text-white hover:opacity-90 transition-all hover:scale-105"
                style={{ padding:"11px 24px",background:DARK,borderRadius:R.pill,fontSize:"0.88rem" }}>
                Get Started <ArrowRight size={15}/>
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                style={{ padding:"11px 20px",border:"1.5px solid #E2E8F0",borderRadius:R.pill,fontSize:"0.84rem" }}>
                Watch Demo
              </Link>
            </div>
            <p className={`text-slate-400 font-medium lp-reveal-up lp-d4 ${hero.visible?"lp-shown":""}`} style={{ fontSize:"0.72rem" }}>
              No credit card required · Free to get started
            </p>
          </div>

          {/* Hero mockup — floats */}
          <div className={`max-w-4xl mx-auto px-5 lp-reveal-scale lp-d3 ${hero.visible?"lp-shown":""}`} style={{ marginTop:40 }}>
            <div className="lp-float" style={{ background:"white",border:"1px solid #E2E8F0",borderRadius:"22px 22px 0 0",boxShadow:"0 -4px 40px rgba(0,0,0,0.05),0 16px 60px rgba(0,0,0,0.08)",overflow:"hidden" }}>
              <div style={{ background:"#F8FAFC",borderBottom:"1px solid #E2E8F0",padding:"8px 14px",display:"flex",alignItems:"center",gap:7 }}>
                {["#FCA5A5","#FDE68A","#A7F3D0"].map(c=><div key={c} style={{ width:9,height:9,borderRadius:"50%",background:c }}/>)}
                <div style={{ flex:1,margin:"0 10px",height:20,background:"#EFF6FF",borderRadius:R.pill,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <span style={{ fontSize:"0.58rem",color:"#64748B",fontWeight:600 }}>businessconnect.bd/dashboard</span>
                </div>
              </div>
              <div style={{ padding:16,background:"#FAFAFA" }}>
                <div className="grid grid-cols-4 gap-2.5" style={{ marginBottom:14 }}>
                  {[
                    { label:"Today's Revenue",val:"৳1,24,800",change:"+18%",bg:"#EFF6FF",accent:"#2563EB" },
                    { label:"Active Orders",  val:"247",       change:"+32%",bg:"#F0FDF4",accent:"#16A34A" },
                    { label:"In Transit",     val:"89",        change:"Live", bg:"#FFF7ED",accent:"#D97706" },
                    { label:"AI Products",    val:"1,204",     change:"+55%",bg:"#F5F3FF",accent:"#7C3AED" },
                  ].map(({ label,val,change,bg,accent },idx)=>(
                    <div key={label} className="lp-hover-lift" style={{ background:"white",border:"1px solid #F1F5F9",borderRadius:R.lg,padding:"11px 13px",animationDelay:`${idx*0.08}s` }}>
                      <div style={{ fontSize:"0.56rem",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6 }}>{label}</div>
                      <div style={{ fontSize:"1.12rem",fontWeight:900,color:DARK,lineHeight:1.1 }}>{val}</div>
                      <div style={{ marginTop:5,fontSize:"0.6rem",fontWeight:700,color:accent,background:bg,display:"inline-block",padding:"2px 6px",borderRadius:R.pill }}>{change}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-2" style={{ background:"white",border:"1px solid #F1F5F9",borderRadius:R.lg,padding:"13px 15px" }}>
                    <div style={{ fontSize:"0.7rem",fontWeight:700,color:DARK,marginBottom:11 }}>Revenue Overview</div>
                    <div className="flex items-end gap-1.5" style={{ height:64 }}>
                      {[38,55,42,70,58,82,65,90,72,85,60,95].map((h,i)=>(
                        <div key={i} style={{ flex:1,height:`${h}%`,background:i>=9?"#2563EB":"#DBEAFE",borderRadius:"3px 3px 0 0",transition:"all 0.3s",animationDelay:`${i*0.05}s` }}/>
                      ))}
                    </div>
                    <div className="flex justify-between" style={{ marginTop:6 }}>
                      {["J","F","M","A","M","J","J","A","S","O","N","D"].map(m=>(
                        <div key={m} style={{ fontSize:"0.47rem",color:"#94A3B8",fontWeight:600 }}>{m}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background:"white",border:"1px solid #F1F5F9",borderRadius:R.lg,padding:"13px 15px" }}>
                    <div style={{ fontSize:"0.7rem",fontWeight:700,color:DARK,marginBottom:8 }}>Recent Orders</div>
                    {["#5821 Chittagong","#5820 Dhaka","#5819 Sylhet","#5818 Rajshahi"].map((o,i)=>(
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:i<3?"1px solid #F8FAFC":"none" }}>
                        <div style={{ width:20,height:20,borderRadius:R.sm,background:"#F1F5F9",flexShrink:0 }}/>
                        <div style={{ flex:1,fontSize:"0.62rem",fontWeight:700,color:DARK }}>{o}</div>
                        <div style={{ fontSize:"0.52rem",fontWeight:700,color:"#059669",background:"#D1FAE5",padding:"2px 5px",borderRadius:R.pill }}>OK</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ TRUST STRIP (scrolling marquee) ═══════ */}
        <section ref={trust.ref} style={{ padding:"30px 0 26px",borderBottom:"1px solid #F1F5F9",overflow:"hidden" }}>
          <p className={`text-center text-slate-400 font-semibold uppercase tracking-widest lp-reveal-up ${trust.visible?"lp-shown":""}`}
            style={{ fontSize:"0.62rem",marginBottom:18 }}>Trusted integrations powering 2,000+ stores</p>
          <div style={{ display:"flex",overflow:"hidden" }}>
            <div style={{ display:"flex",gap:48,animation:"lp-marquee 18s linear infinite",whiteSpace:"nowrap" }}>
              {[...partners,...partners].map((p,i)=>(
                <span key={i} className="font-extrabold text-slate-300 hover:text-slate-500 transition-colors"
                  style={{ fontSize:"0.78rem",letterSpacing:"0.04em",cursor:"default" }}>{p}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ FEATURE 1 ═══════ */}
        <section id="features" style={{ padding:"60px 20px 48px" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div ref={feat1L.ref} className={`lp-reveal-left ${feat1L.visible?"lp-shown":""}`} style={{ flex:"0 0 44%",display:"flex",flexDirection:"column",gap:16 }}>
                <div className="inline-flex items-center gap-1.5 font-semibold text-slate-500" style={{ fontSize:"0.66rem",letterSpacing:"0.05em" }}>
                  <span className="lp-pulse-dot" style={{ width:6,height:6,borderRadius:"50%",background:"#6366F1",display:"inline-block",position:"relative" }}/>
                  Data & AI
                </div>
                <h2 className="font-extrabold text-slate-900 tracking-tight" style={{ fontSize:"clamp(1.6rem,2.8vw,2.4rem)",lineHeight:1.15 }}>
                  Selling Digital Products Is Easier.
                </h2>
                <p className="text-slate-500 font-medium" style={{ fontSize:"0.9rem",lineHeight:1.7 }}>
                  Our Gemini AI generates full product listings — title, description, SEO tags — in under 3 seconds in Bangla or English.
                </p>
                <Link href="/register" className="inline-flex items-center gap-2 font-bold text-white hover:opacity-90 hover:scale-105 transition-all self-start"
                  style={{ padding:"9px 20px",background:DARK,borderRadius:R.pill,fontSize:"0.82rem" }}>
                  Learn More <ArrowRight size={13}/>
                </Link>
                <div className="flex gap-3" style={{ marginTop:4 }}>
                  {[
                    { label:"AI Products Generated", val:c1.toLocaleString(), accent:"#16A34A" },
                    { label:"Offline Sales",          val:"৳"+c2.toLocaleString(), accent:"#16A34A" },
                  ].map(({ label,val,accent })=>(
                    <div key={label} className="lp-hover-lift" style={{ background:"white",border:"1px solid #F1F5F9",borderRadius:R.xl,padding:"12px 15px",boxShadow:"0 2px 10px rgba(0,0,0,0.04)",flex:1 }}>
                      <div style={{ fontSize:"0.56rem",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5 }}>{label}</div>
                      <div style={{ fontSize:"1.35rem",fontWeight:900,color:DARK,lineHeight:1 }}>{val}</div>
                      <div style={{ fontSize:"0.6rem",fontWeight:700,color:accent,marginTop:3 }}>↑ Higher Than Last Month</div>
                    </div>
                  ))}
                </div>
              </div>
              <div ref={feat1R.ref} className={`lp-reveal-right ${feat1R.visible?"lp-shown":""}`} style={{ flex:1,width:"100%" }}>
                <div className="lp-hover-lift" style={{ background:"white",border:"1px solid #E2E8F0",borderRadius:R["2xl"],boxShadow:"0 6px 36px rgba(0,0,0,0.07)",overflow:"hidden" }}>
                  <div style={{ background:"#F8FAFC",borderBottom:"1px solid #F1F5F9",padding:"8px 14px",display:"flex",gap:5,alignItems:"center" }}>
                    <div style={{ fontSize:"0.68rem",fontWeight:700,color:DARK }}>Store Order Analysis</div>
                    <div style={{ marginLeft:"auto",display:"flex",gap:5 }}>
                      {["Online","Offline"].map((l,i)=>(
                        <div key={l} className="flex items-center gap-1">
                          <div style={{ width:5,height:5,borderRadius:"50%",background:i===0?"#2563EB":"#CBD5E1" }}/>
                          <span style={{ fontSize:"0.56rem",fontWeight:600,color:"#94A3B8" }}>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding:16 }}>
                    <div className="flex items-end gap-2 justify-center" style={{ height:100,marginBottom:6 }}>
                      {[{on:68,off:42},{on:80,off:55},{on:55,off:38},{on:92,off:65},{on:74,off:50},{on:85,off:60},{on:60,off:44},{on:95,off:70}].map((d,i)=>(
                        <div key={i} style={{ display:"flex",gap:2,alignItems:"flex-end",flex:1 }}>
                          <div style={{ flex:1,height:feat1R.visible?`${d.on}%`:"0%",background:"#2563EB",borderRadius:"3px 3px 0 0",transition:`height 0.8s cubic-bezier(.16,1,.3,1) ${i*0.07}s` }}/>
                          <div style={{ flex:1,height:feat1R.visible?`${d.off}%`:"0%",background:"#DBEAFE",borderRadius:"3px 3px 0 0",transition:`height 0.8s cubic-bezier(.16,1,.3,1) ${i*0.07+0.04}s` }}/>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"].map(m=>(
                        <div key={m} style={{ fontSize:"0.53rem",color:"#94A3B8",fontWeight:600,flex:1,textAlign:"center" }}>{m}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ FEATURE 2 ═══════ */}
        <section style={{ padding:"0 20px 60px" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div ref={feat2L.ref} className={`lp-reveal-left ${feat2L.visible?"lp-shown":""}`} style={{ flex:1,width:"100%" }}>
                <div className="lp-hover-lift" style={{ background:"white",border:"1px solid #E2E8F0",borderRadius:R["2xl"],boxShadow:"0 6px 36px rgba(0,0,0,0.07)",padding:20 }}>
                  <div style={{ fontSize:"0.78rem",fontWeight:700,color:DARK,marginBottom:12 }}>Recent Activity</div>
                  <div className="flex gap-2" style={{ marginBottom:11 }}>
                    {["All","Selling","Marketing"].map((t,i)=>(
                      <div key={t} style={{ padding:"4px 11px",borderRadius:R.pill,fontSize:"0.66rem",fontWeight:700,background:i===0?"#1D4ED8":"#F8FAFC",color:i===0?"white":"#94A3B8",border:i===0?"none":"1px solid #E2E8F0",cursor:"pointer",transition:"all .2s" }}>{t}</div>
                    ))}
                  </div>
                  {[
                    { name:"Stone Black Jacket",price:"৳2,800",event:"New Order", time:"10m ago",bg:"#1D4ED8" },
                    { name:"Premium T-Shirt",   price:"৳1,400",event:"Restocked", time:"25m ago",bg:"#059669" },
                    { name:"Summer Hoodie",     price:"৳3,200",event:"Shipped",   time:"1hr ago", bg:"#D97706" },
                  ].map(({ name,price,event,time,bg },i)=>(
                    <div key={name} className="lp-hover-lift flex items-center gap-3" style={{ padding:"8px 0",borderBottom:"1px solid #F8FAFC",animationDelay:`${i*0.1}s` }}>
                      <div style={{ width:32,height:32,borderRadius:R.md,background:bg,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <Package size={14} className="text-white"/>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"0.76rem",fontWeight:700,color:DARK }}>{name}</div>
                        <div style={{ fontSize:"0.6rem",fontWeight:600,color:"#94A3B8" }}>{event} · {time}</div>
                      </div>
                      <div style={{ fontSize:"0.8rem",fontWeight:800,color:DARK }}>{price}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div ref={feat2R.ref} className={`lp-reveal-right ${feat2R.visible?"lp-shown":""}`} style={{ flex:"0 0 44%",display:"flex",flexDirection:"column",gap:16 }}>
                <div className="inline-flex items-center gap-1.5 font-semibold text-slate-500" style={{ fontSize:"0.66rem",letterSpacing:"0.05em" }}>
                  <span className="lp-pulse-dot" style={{ width:6,height:6,borderRadius:"50%",background:"#10B981",display:"inline-block",position:"relative" }}/>
                  Platform Features
                </div>
                <h2 className="font-extrabold text-slate-900 tracking-tight" style={{ fontSize:"clamp(1.55rem,2.6vw,2.2rem)",lineHeight:1.2 }}>
                  What Can Our Business OS Do For You?
                </h2>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {[
                    { icon:Cpu,      color:"#EFF6FF",ic:"#2563EB",title:"AI Product Management",   desc:"Generate complete listings in seconds using Gemini AI." },
                    { icon:BarChart3,color:"#FFF7ED",ic:"#D97706",title:"Smart Data Analytics",    desc:"Real-time reports and insights for better business decisions." },
                    { icon:Truck,    color:"#F0FDF4",ic:"#16A34A",title:"1-Click Courier Booking",  desc:"Book Pathao, Steadfast, RedX with auto waybill generation." },
                    { icon:Shield,   color:"#F5F3FF",ic:"#7C3AED",title:"Bank-Grade Security",      desc:"Role-based access, encrypted data and full audit logs." },
                  ].map(({ icon:Ic,color,ic,title,desc },i)=>(
                    <div key={title} className={`lp-hover-lift flex items-start gap-3 lp-reveal-up lp-d${i+1} ${feat2R.visible?"lp-shown":""}`}
                      style={{ padding:"11px 13px",background:"white",border:"1px solid #F1F5F9",borderRadius:R.lg,boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                      <div style={{ width:32,height:32,background:color,borderRadius:R.md,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        <Ic size={15} style={{ color:ic }}/>
                      </div>
                      <div>
                        <div style={{ fontSize:"0.8rem",fontWeight:700,color:DARK,marginBottom:2 }}>{title}</div>
                        <div style={{ fontSize:"0.73rem",fontWeight:500,color:"#64748B",lineHeight:1.5 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/register" className="inline-flex items-center gap-2 font-bold text-white hover:opacity-90 hover:scale-105 transition-all self-start"
                  style={{ padding:"9px 20px",background:DARK,borderRadius:R.pill,fontSize:"0.82rem",marginTop:2 }}>
                  Learn More <ArrowRight size={13}/>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ TESTIMONIALS ═══════ */}
        <section ref={testi.ref} style={{ padding:"56px 20px 52px",background:"#FAFAFA",borderTop:"1px solid #F1F5F9",borderBottom:"1px solid #F1F5F9" }}>
          <div className="max-w-6xl mx-auto">
            <div className={`text-center lp-reveal-up ${testi.visible?"lp-shown":""}`} style={{ marginBottom:36 }}>
              <div className="inline-flex items-center gap-1.5 font-semibold text-slate-500" style={{ fontSize:"0.66rem",letterSpacing:"0.05em",marginBottom:10 }}>
                <span className="lp-pulse-dot" style={{ width:6,height:6,borderRadius:"50%",background:"#F59E0B",display:"inline-block",position:"relative" }}/>
                Our Testimonial
              </div>
              <h2 className="font-extrabold text-slate-900 tracking-tight" style={{ fontSize:"clamp(1.55rem,2.8vw,2.2rem)",lineHeight:1.15 }}>
                What Our Customers Say
              </h2>
              <p className="text-slate-500 font-medium" style={{ marginTop:8,fontSize:"0.85rem",maxWidth:380,margin:"8px auto 16px" }}>
                Trusted by thousands of Bangladesh businesses
              </p>
              <Link href="/register" className="inline-flex items-center gap-2 font-bold text-white hover:opacity-90 hover:scale-105 transition-all"
                style={{ padding:"9px 20px",background:DARK,borderRadius:R.pill,fontSize:"0.82rem" }}>
                See All Testimonials <ArrowRight size={13}/>
              </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-7">
              {/* Animated stats */}
              <div className={`flex flex-row lg:flex-col justify-around lp-reveal-left lp-d1 ${testi.visible?"lp-shown":""}`}
                style={{ flex:"0 0 180px",display:"flex",flexDirection:"column",justifyContent:"center",gap:24 }}>
                <div className="lp-hover-lift" style={{ padding:"16px 18px",background:"white",border:"1px solid #F1F5F9",borderRadius:R.xl,boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div className="font-extrabold" style={{ fontSize:"2.2rem",color:DARK,lineHeight:1 }}>{fmtBDT(c3)}</div>
                  <div style={{ fontSize:"0.72rem",fontWeight:600,color:"#94A3B8",marginTop:4 }}>Revenue Generated</div>
                </div>
                <div className="lp-hover-lift" style={{ padding:"16px 18px",background:"white",border:"1px solid #F1F5F9",borderRadius:R.xl,boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div className="font-extrabold" style={{ fontSize:"2.2rem",color:DARK,lineHeight:1 }}>{c4}%</div>
                  <div style={{ fontSize:"0.72rem",fontWeight:600,color:"#94A3B8",marginTop:4 }}>Online Revenue Growth</div>
                </div>
              </div>
              <div style={{ flex:1,display:"flex",flexDirection:"column",gap:13 }}>
                {reviews.map((r,i)=>(
                  <div key={i} className={`lp-hover-lift lp-reveal-up lp-d${i+2} ${testi.visible?"lp-shown":""}`}
                    style={{ background:"white",border:"1px solid #E2E8F0",borderRadius:R.xl,padding:"20px 22px 17px",boxShadow:"0 2px 10px rgba(0,0,0,0.04)" }}>
                    <div className="flex gap-0.5" style={{ marginBottom:10 }}>
                      {[...Array(r.rating)].map((_,j)=><Star key={j} size={12} className="fill-amber-400 text-amber-400"/>)}
                    </div>
                    <p className="text-slate-700 font-medium" style={{ fontSize:"0.88rem",lineHeight:1.7,marginBottom:14 }}>
                      &ldquo;{r.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.seed}`} alt={r.name} style={{ width:32,height:32,borderRadius:"50%",background:"#F1F5F9" }}/>
                      <div>
                        <div style={{ fontSize:"0.8rem",fontWeight:700,color:DARK }}>{r.name}</div>
                        <div style={{ fontSize:"0.65rem",fontWeight:600,color:"#94A3B8" }}>{r.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ FEATURE 3 ═══════ */}
        <section id="solutions" style={{ padding:"60px 20px 52px" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div ref={feat3L.ref} className={`lp-reveal-left ${feat3L.visible?"lp-shown":""}`} style={{ flex:"0 0 44%",display:"flex",flexDirection:"column",gap:16 }}>
                <div className="inline-flex items-center gap-1.5 font-semibold text-slate-500" style={{ fontSize:"0.66rem",letterSpacing:"0.05em" }}>
                  <span className="lp-pulse-dot" style={{ width:6,height:6,borderRadius:"50%",background:"#2563EB",display:"inline-block",position:"relative" }}/>
                  Order Features
                </div>
                <h2 className="font-extrabold text-slate-900 tracking-tight" style={{ fontSize:"clamp(1.55rem,2.6vw,2.2rem)",lineHeight:1.2 }}>
                  BusinessConnect Helps You Build Beautiful Store Operations
                </h2>
                <p className="text-slate-500 font-medium" style={{ fontSize:"0.88rem",lineHeight:1.68 }}>
                  One platform for orders, inventory, couriers and payments. Responsive design for every device.
                </p>
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  {[
                    { ic:"🤖",label:"Simply AI-Powered",   desc:"Auto-fill product listings using AI in Bangla and English." },
                    { ic:"🎯",label:"Easy To Customize",   desc:"Add custom features and branding for every category." },
                    { ic:"⚡",label:"Made With Tailwind CSS",desc:"Modern, fast, and responsive — no extra CSS needed." },
                  ].map(({ ic,label,desc },i)=>(
                    <div key={label} className={`lp-hover-lift flex items-start gap-3 lp-reveal-up lp-d${i+1} ${feat3L.visible?"lp-shown":""}`}
                      style={{ padding:"10px 0" }}>
                      <div style={{ width:32,height:32,borderRadius:R.md,background:"#F8FAFC",border:"1px solid #F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem",flexShrink:0 }}>{ic}</div>
                      <div>
                        <div style={{ fontSize:"0.82rem",fontWeight:700,color:DARK,marginBottom:2 }}>{label}</div>
                        <div style={{ fontSize:"0.73rem",fontWeight:500,color:"#64748B",lineHeight:1.5 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div ref={feat3R.ref} className={`lp-reveal-right ${feat3R.visible?"lp-shown":""}`} style={{ flex:1 }}>
                <div className="lp-hover-lift" style={{ background:"white",border:"1px solid #E2E8F0",borderRadius:R["2xl"],boxShadow:"0 6px 36px rgba(0,0,0,0.07)",padding:20 }}>
                  <div className="flex items-center justify-between" style={{ marginBottom:13 }}>
                    <div style={{ fontSize:"0.76rem",fontWeight:700,color:DARK }}>Store Order Analysis</div>
                    <div className="flex gap-4">
                      {["Statistics","Sales","Insight"].map((t,i)=>(
                        <span key={t} style={{ fontSize:"0.6rem",fontWeight:700,color:i===0?"#2563EB":"#94A3B8",paddingBottom:2,borderBottom:i===0?"2px solid #2563EB":"none",cursor:"pointer",transition:"all .2s" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end gap-2 justify-center" style={{ height:100 }}>
                    {[
                      ["৳2k","#DBEAFE"],["৳4k","#DBEAFE"],["৳5k","#DBEAFE"],["৳3k","#DBEAFE"],
                      ["৳7k","#2563EB"],["৳6k","#2563EB"],["৳8k","#2563EB"],
                    ].map(([label,color],i)=>(
                      <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",flex:1 }}>
                        <div style={{ fontSize:"0.48rem",color:"#94A3B8",fontWeight:700,marginBottom:3 }}>{label}</div>
                        <div style={{ width:"100%",background:color,borderRadius:"4px 4px 0 0",height:feat3R.visible?`${[35,50,62,42,85,72,95][i]}%`:"0%",transition:`height 0.8s cubic-bezier(.16,1,.3,1) ${i*0.08}s` }}/>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-around" style={{ marginTop:7 }}>
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul"].map(m=>(
                      <div key={m} style={{ fontSize:"0.53rem",color:"#94A3B8",fontWeight:600 }}>{m}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ FAQ ═══════ */}
        <section ref={faqSec.ref} style={{ padding:"52px 20px 48px",background:"#FAFAFA",borderTop:"1px solid #F1F5F9" }}>
          <div className="max-w-3xl mx-auto">
            <div className={`text-center lp-reveal-up ${faqSec.visible?"lp-shown":""}`} style={{ marginBottom:32 }}>
              <div className="inline-flex items-center gap-1.5 font-semibold text-slate-500" style={{ fontSize:"0.66rem",letterSpacing:"0.05em",marginBottom:10 }}>
                <span className="lp-pulse-dot" style={{ width:6,height:6,borderRadius:"50%",background:"#F43F5E",display:"inline-block",position:"relative" }}/>
                Our FAQs
              </div>
              <h2 className="font-extrabold text-slate-900 tracking-tight" style={{ fontSize:"clamp(1.55rem,2.8vw,2.2rem)",lineHeight:1.15,marginBottom:8 }}>
                Business OS Sales FAQs
              </h2>
              <p className="text-slate-500 font-medium" style={{ fontSize:"0.85rem",maxWidth:400,margin:"0 auto 16px" }}>
                Everything you need to know about running your store on BusinessConnect.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/register" className="inline-flex items-center gap-2 font-bold text-white hover:opacity-90 hover:scale-105 transition-all"
                  style={{ padding:"9px 18px",background:DARK,borderRadius:R.pill,fontSize:"0.82rem" }}>
                  More Questions <ArrowRight size={13}/>
                </Link>
                <Link href="/login" className="inline-flex items-center font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  style={{ padding:"9px 18px",background:"white",border:"1.5px solid #E2E8F0",borderRadius:R.pill,fontSize:"0.82rem" }}>
                  Contact Us
                </Link>
              </div>
            </div>

            <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
              {faqs.map((f,i)=>(
                <div key={i} className={`lp-reveal-up lp-d${Math.min(i+1,6)} ${faqSec.visible?"lp-shown":""}`}
                  style={{ background:"white",border:"1px solid #E2E8F0",borderRadius:R.xl,overflow:"hidden",transition:"box-shadow .2s",boxShadow:openFaq===i?"0 4px 20px rgba(0,0,0,0.07)":"none" }}>
                  <button className="w-full text-left flex items-center justify-between gap-4 font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                    style={{ padding:"15px 18px",fontSize:"0.85rem" }}
                    onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                    {f.q}
                    <div style={{ transition:"transform .3s",transform:openFaq===i?"rotate(180deg)":"rotate(0deg)",flexShrink:0 }}>
                      <ChevronDown size={15} className="text-slate-400"/>
                    </div>
                  </button>
                  <div style={{ maxHeight:openFaq===i?"200px":"0",overflow:"hidden",transition:"max-height .35s cubic-bezier(.16,1,.3,1)" }}>
                    <div style={{ padding:"0 18px 15px",fontSize:"0.83rem",color:"#64748B",lineHeight:1.7,fontWeight:500,borderTop:"1px solid #F1F5F9" }}>
                      <div style={{ paddingTop:12 }}>{f.a}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ FOOTER CTA ═══════ */}
        <section ref={ctaSec.ref} style={{ padding:"52px 20px 0" }}>
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8"
            style={{ paddingBottom:48,borderBottom:"1px solid #F1F5F9" }}>
            <div className={`lp-reveal-left ${ctaSec.visible?"lp-shown":""}`} style={{ display:"flex",flexDirection:"column",gap:13 }}>
              <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                <div style={{ width:28,height:28,borderRadius:R.md,background:BLUE,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <Box size={14} className="text-white"/>
                </div>
                <span className="font-extrabold" style={{ fontSize:"0.9rem" }}>BusinessConnect.</span>
              </div>
              <h2 className="font-extrabold text-slate-900 tracking-tight" style={{ fontSize:"clamp(1.35rem,2.2vw,2rem)",lineHeight:1.2,maxWidth:340 }}>
                Are You Interested With BusinessConnect?
              </h2>
              <Link href="/register" className="inline-flex items-center gap-2 font-bold text-white hover:opacity-90 hover:scale-105 transition-all self-start"
                style={{ padding:"10px 22px",background:DARK,borderRadius:R.pill,fontSize:"0.85rem" }}>
                Contact Sales
              </Link>
            </div>
            <div className={`lp-reveal-right lp-d2 ${ctaSec.visible?"lp-shown":""}`} style={{ flex:1,maxWidth:440 }}>
              <div className="lp-hover-lift" style={{ background:"white",border:"1px solid #E2E8F0",borderRadius:R["2xl"],padding:17,boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-2" style={{ marginBottom:12 }}>
                  <div style={{ width:26,height:26,borderRadius:R.sm,background:BLUE,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <Box size={12} className="text-white"/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ height:7,width:100,background:"#E2E8F0",borderRadius:R.pill }}/>
                    <div style={{ height:5,width:60,background:"#F1F5F9",borderRadius:R.pill,marginTop:4 }}/>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="lp-pulse-dot" style={{ width:6,height:6,borderRadius:"50%",background:"#10B981",position:"relative" }}/>
                    <span style={{ fontSize:"0.52rem",fontWeight:700,color:"#059669" }}>LIVE</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[["Revenue","৳1,24,800","#EFF6FF"],["Orders","247","#F0FDF4"],["Returns","3","#FFF1F2"]].map(([label,val,bg])=>(
                    <div key={label} style={{ background:bg,borderRadius:R.md,padding:"9px 11px" }}>
                      <div style={{ fontSize:"0.52rem",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",marginBottom:3 }}>{label}</div>
                      <div style={{ fontSize:"0.9rem",fontWeight:900,color:DARK }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ FOOTER ═══════ */}
        <footer style={{ padding:"32px 20px 26px",background:"white" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-10" style={{ marginBottom:28 }}>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                <div className="flex items-center gap-2">
                  <div style={{ width:26,height:26,borderRadius:R.md,background:BLUE,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <Box size={13} className="text-white"/>
                  </div>
                  <span className="font-extrabold text-slate-900" style={{ fontSize:"0.9rem" }}>BusinessConnect.</span>
                </div>
                <p className="text-slate-400 font-medium" style={{ fontSize:"0.76rem",lineHeight:1.6,maxWidth:200 }}>
                  The AI-First Business OS for Bangladesh's digital economy.
                </p>
              </div>
              <div className="flex flex-wrap gap-10">
                {[
                  { heading:"Company",          links:["Security","Brand Guidelines","Careers"] },
                  { heading:"Career",            links:["Jobs","Hiring","Internship"] },
                  { heading:"Legal Information", links:["Privacy Policy","Terms of Service","Cookie Policy"] },
                ].map(({ heading,links })=>(
                  <div key={heading}>
                    <div style={{ fontSize:"0.68rem",fontWeight:700,color:DARK,marginBottom:11,textTransform:"uppercase",letterSpacing:"0.06em" }}>{heading}</div>
                    <ul style={{ display:"flex",flexDirection:"column",gap:8 }}>
                      {links.map(l=>(
                        <li key={l} className="text-slate-400 hover:text-slate-700 cursor-pointer transition-colors font-medium" style={{ fontSize:"0.78rem" }}>{l}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4" style={{ paddingTop:18,borderTop:"1px solid #F1F5F9" }}>
              <div className="flex items-center gap-2">
                <div style={{ width:22,height:22,borderRadius:R.md,background:BLUE,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <Box size={11} className="text-white"/>
                </div>
                <span style={{ fontSize:"0.72rem",fontWeight:700,color:DARK }}>BusinessConnect.</span>
                <span style={{ fontSize:"0.67rem",color:"#CBD5E1",fontWeight:500 }}>Home · About · Reviews</span>
              </div>
              <p style={{ fontSize:"0.68rem",color:"#CBD5E1",fontWeight:500 }}>© 2026 BusinessConnect.bd · Terms · Privacy</p>
              <div className="flex items-center gap-1.5">
                {["f","ig","tw","yt","in"].map(s=>(
                  <div key={s} className="lp-hover-lift" style={{ width:26,height:26,borderRadius:"50%",background:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
                    <span style={{ fontSize:"0.52rem",fontWeight:800,color:"#94A3B8",textTransform:"lowercase" }}>{s}</span>
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
