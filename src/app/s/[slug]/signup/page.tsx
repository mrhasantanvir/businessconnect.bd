"use client";

import React, { useState } from "react";
import { 
  ArrowRight, 
  Mail, 
  Lock, 
  User,
  Phone,
  Sparkles, 
  ShieldCheck,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { customerSignupAction } from "../authActions";
import Link from "next/link";

export default function CustomerSignupPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const result = await customerSignupAction(data, params.slug as string);
      if (result.success) {
        router.push(`/s/${params.slug}/dashboard`);
      } else {
        setError(result.error || "Signup failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col lg:flex-row font-sans text-[#0F172A]">
      
      {/* Left: Brand / Promo Area */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-20 flex-col justify-between relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
         <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl">
               <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase text-white leading-none">
               Join The <br /> <span className="text-indigo-500">Elite</span> <br /> Circle
            </h1>
         </div>
         <div className="relative z-10 space-y-8">
            <div className="p-8 bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 space-y-4">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Privileged Access</p>
               <h4 className="text-xl font-black text-white uppercase">Instant Reward Points</h4>
               <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase">Sign up today and get 10 bonus points to spend on your favorite items.</p>
            </div>
            <div className="flex items-center gap-4 text-white/20">
               <ShieldCheck className="w-5 h-5" />
               <span className="text-[10px] font-black uppercase tracking-widest">Secure Data Encryption</span>
            </div>
         </div>
      </div>

      {/* Right: Signup Form */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:px-20 py-20 relative overflow-y-auto">
         <div className="absolute top-12 left-8 lg:left-20">
            <Link href={`/s/${params.slug}`} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
               <ArrowLeft className="w-4 h-4" /> Return to Store
            </Link>
         </div>

         <div className="max-w-md mx-auto w-full space-y-12 animate-in fade-in slide-in-from-right-20 duration-1000">
            <div className="space-y-4">
               <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Create <span className="text-indigo-600">Account</span></h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Join thousands of happy customers today.</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100">
                 {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-4">
                  <div className="group space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 group-focus-within:text-indigo-600 transition-colors">Full Legal Name</label>
                     <div className="flex items-center gap-4 bg-white border border-slate-100 p-5 rounded-[24px] focus-within:border-indigo-600 focus-within:shadow-2xl focus-within:shadow-indigo-600/5 transition-all">
                        <User className="w-5 h-5 text-slate-300" />
                        <input name="name" required placeholder="John Doe" className="bg-transparent border-none outline-none text-sm font-bold w-full" />
                     </div>
                  </div>

                  <div className="group space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 group-focus-within:text-indigo-600 transition-colors">Email Address</label>
                     <div className="flex items-center gap-4 bg-white border border-slate-100 p-5 rounded-[24px] focus-within:border-indigo-600 focus-within:shadow-2xl focus-within:shadow-indigo-600/5 transition-all">
                        <Mail className="w-5 h-5 text-slate-300" />
                        <input name="email" type="email" required placeholder="name@example.com" className="bg-transparent border-none outline-none text-sm font-bold w-full" />
                     </div>
                  </div>

                  <div className="group space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 group-focus-within:text-indigo-600 transition-colors">Phone Number</label>
                     <div className="flex items-center gap-4 bg-white border border-slate-100 p-5 rounded-[24px] focus-within:border-indigo-600 focus-within:shadow-2xl focus-within:shadow-indigo-600/5 transition-all">
                        <Phone className="w-5 h-5 text-slate-300" />
                        <input name="phone" required placeholder="+880 1XXX XXXXXX" className="bg-transparent border-none outline-none text-sm font-bold w-full" />
                     </div>
                  </div>

                  <div className="group space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 group-focus-within:text-indigo-600 transition-colors">Security Password</label>
                     <div className="flex items-center gap-4 bg-white border border-slate-100 p-5 rounded-[24px] focus-within:border-indigo-600 focus-within:shadow-2xl focus-within:shadow-indigo-600/5 transition-all">
                        <Lock className="w-5 h-5 text-slate-300" />
                        <input name="password" type="password" required placeholder="••••••••" className="bg-transparent border-none outline-none text-sm font-bold w-full" />
                     </div>
                  </div>
               </div>

               <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-6 bg-indigo-600 text-white rounded-[32px] text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-slate-900 transition-all shadow-2xl hover:scale-105 disabled:opacity-50"
               >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Account"} <ArrowRight className="w-5 h-5" />
               </button>
            </form>

            <div className="pt-8 text-center space-y-4 border-t border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Already have an account?</p>
               <Link href={`/s/${params.slug}/login`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900 hover:gap-4 transition-all">
                  Sign In to Dashboard <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
         </div>
      </div>

    </div>
  );
}
