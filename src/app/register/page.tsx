"use client";

import React, { useState } from "react";
import { Box, ArrowRight, Lock, Sparkles, Phone, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";
import Link from "next/link";
import { registerAction, sendOtpAction, verifyOtpAction } from "./actions";
import { toast } from "sonner";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  async function handleSendOtp() {
    if (!phone) return toast.error("Please enter your phone number");
    setOtpLoading(true);
    try {
      const res = await sendOtpAction(phone);
      if (res.success) {
        setOtpSent(true);
        toast.success("Verification code sent!");
      } else {
        toast.error(res.error || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Error sending OTP");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otp) return toast.error("Please enter the code");
    setOtpLoading(true);
    try {
      const res = await verifyOtpAction(phone, otp);
      if (res.success) {
        setIsVerified(true);
        toast.success("Phone verified!");
      } else {
        toast.error(res.error || "Invalid code");
      }
    } catch (err) {
      toast.error("Verification failed");
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 font-outfit">
      <div className="w-full max-w-lg">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <Box className="w-10 h-10 text-[#1E40AF] group-hover:scale-110 transition-transform" />
            <span className="font-extrabold tracking-tight text-2xl text-[#0F172A]">BusinessConnect.bd</span>
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#16A34A]">AI-First Business OS</span>
          </div>
        </div>

        {/* Registration Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-[48px] p-10 md:p-14 shadow-2xl shadow-[#1E40AF]/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1E40AF] via-[#3B82F6] to-[#BEF264]"></div>
          
          <div className="mb-12">
            <h1 className="text-4xl font-black text-[#0F172A] mb-3 tracking-tighter uppercase italic">
              Join the <span className="text-[#1E40AF]">Grid.</span>
            </h1>
            <p className="text-[#64748B] text-sm font-medium">Verify your phone to start your business journey.</p>
          </div>

          <form action={registerAction} className="space-y-8">
            {error && (
              <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-sm p-4 rounded-3xl animate-in fade-in slide-in-from-top-2 duration-300 font-bold">
                {error}
              </div>
            )}

            {/* Step 1: Phone & OTP */}
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] ml-1">Business Phone</label>
                  <div className="flex gap-3">
                     <div className="relative flex-1 group">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA] group-focus-within:text-[#1E40AF] transition-colors" />
                        <input
                           type="tel"
                           name="phone"
                           required
                           value={phone}
                           onChange={(e) => setPhone(e.target.value)}
                           disabled={isVerified}
                           className="w-full bg-[#F8F9FA] border-2 border-transparent focus:border-[#1E40AF]/10 focus:bg-white rounded-3xl py-5 pl-14 pr-4 outline-none transition-all font-bold text-[#0F172A] placeholder:text-slate-300 disabled:opacity-50"
                           placeholder="+880 1XXX XXXXXX"
                        />
                     </div>
                     {!isVerified && (
                        <button
                           type="button"
                           onClick={handleSendOtp}
                           disabled={otpLoading || !phone}
                           className="bg-slate-900 text-white px-6 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                        >
                           {otpLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Send OTP"}
                        </button>
                     )}
                  </div>
               </div>

               {otpSent && !isVerified && (
                  <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                     <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] ml-1">Verification Code</label>
                     <div className="flex gap-3">
                        <input
                           type="text"
                           value={otp}
                           onChange={(e) => setOtp(e.target.value)}
                           className="flex-1 bg-[#F8F9FA] border-2 border-transparent focus:border-[#1E40AF]/10 focus:bg-white rounded-3xl py-5 px-8 outline-none transition-all font-black text-center tracking-[1em] text-[#1E40AF]"
                           placeholder="000000"
                           maxLength={6}
                        />
                        <button
                           type="button"
                           onClick={handleVerifyOtp}
                           className="bg-[#BEF264] text-[#064E3B] px-6 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                        >
                           Verify
                        </button>
                     </div>
                  </div>
               )}

               {isVerified && (
                  <div className="bg-green-50 border border-green-100 p-4 rounded-3xl flex items-center gap-3 animate-in fade-in zoom-in duration-500">
                     <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <CheckCircle2 className="w-5 h-5" />
                     </div>
                     <span className="text-xs font-black text-green-700 uppercase tracking-widest">Phone Verified</span>
                  </div>
               )}
            </div>

            {/* Step 2: Password */}
            {isVerified && (
               <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] ml-1">Secure Password</label>
                     <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA] group-focus-within:text-[#1E40AF] transition-colors" />
                        <input
                           type="password"
                           name="password"
                           required
                           className="w-full bg-[#F8F9FA] border-2 border-transparent focus:border-[#1E40AF]/10 focus:bg-white rounded-3xl py-5 pl-14 pr-4 outline-none transition-all font-bold text-[#0F172A]"
                           placeholder="••••••••"
                        />
                     </div>
                  </div>

                  <input type="hidden" name="isPhoneVerified" value="true" />
                  <input type="hidden" name="phone" value={phone} />

                  <button
                     type="submit"
                     className="w-full bg-[#1E40AF] text-white py-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-[#1E40AF]/20 hover:bg-[#1E3A8A] hover:scale-[1.02] active:scale-[0.98] transition-all group"
                  >
                     Complete Registration
                     <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            )}
          </form>

          <div className="mt-10 pt-8 border-t border-[#F1F5F9] text-center">
            <p className="text-[#64748B] text-sm font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1E40AF] font-bold hover:underline tracking-tight uppercase italic text-[10px]">Log in here</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[#A1A1AA] text-[10px] font-black uppercase tracking-widest leading-loose">
            By registering, you agree to our <span className="text-[#0F172A]">Terms of Service</span><br/>
            and <span className="text-[#0F172A]">Privacy Policy.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
