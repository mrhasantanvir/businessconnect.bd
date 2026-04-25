"use client";

import React, { useState } from "react";
import { Box, ArrowRight, Lock, Mail, User, Store, Sparkles, Eye, EyeOff, Phone, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";
import Link from "next/link";
import { registerAction, sendOtpAction, verifyOtpAction } from "./actions";
import { toast } from "sonner";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    storeName: "",
    phone: ""
  });

  async function handleSendOtp() {
    if (!formData.phone) return toast.error("Please enter a phone number");
    setOtpLoading(true);
    const res = await sendOtpAction(formData.phone);
    setOtpLoading(false);
    if (res.success) {
      setShowOtpStep(true);
      toast.success("Verification code sent to your phone!");
    } else {
      toast.error(res.error || "Failed to send OTP");
    }
  }

  async function handleVerifyOtp() {
    if (!otp) return toast.error("Please enter the OTP");
    setOtpLoading(true);
    const res = await verifyOtpAction(formData.phone, otp);
    setOtpLoading(false);
    if (res.success) {
      setIsPhoneVerified(true);
      setShowOtpStep(false);
      toast.success("Phone number verified successfully!");
    } else {
      toast.error(res.error || "Invalid OTP");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isPhoneVerified) return toast.error("Please verify your phone number first");
    
    setError("");
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("storeName", formData.storeName);
    data.append("phone", formData.phone);
    data.append("isPhoneVerified", "true");

    const result = await registerAction(data);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <Box className="w-10 h-10 text-[#1E40AF] group-hover:scale-110 transition-transform" />
            <span className="font-extrabold tracking-tight text-2xl text-[#0F172A]">Businessconnect.bd</span>
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#16A34A]">Bangladesh's Most Secure OS</span>
          </div>
        </div>

        {/* Register Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-[40px] p-8 md:p-12 shadow-2xl shadow-[#1E40AF]/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1E40AF] to-[#BEF264]"></div>
          
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-[#0F172A] mb-2 tracking-tight">Create your account</h1>
            <p className="text-[#64748B] text-sm font-medium">Join 2,000+ merchants with verified phone security.</p>
          </div>

          {!showOtpStep ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-sm p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA] group-focus-within:text-[#1E40AF] transition-colors" />
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/5 transition-all font-medium text-[#0F172A]"
                      placeholder="Sabbir Ahmed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-1">Store Name</label>
                  <div className="relative group">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA] group-focus-within:text-[#1E40AF] transition-colors" />
                    <input
                      required
                      value={formData.storeName}
                      onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/5 transition-all font-medium text-[#0F172A]"
                      placeholder="Galaxy Gadgets"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA] group-focus-within:text-[#16A34A] transition-colors" />
                  <input
                    required
                    type="tel"
                    disabled={isPhoneVerified}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl py-3.5 pl-12 pr-32 outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/5 transition-all font-medium text-[#0F172A] ${isPhoneVerified ? 'border-green-200 bg-green-50/30' : ''}`}
                    placeholder="+880 1XXX XXXXXX"
                  />
                  {!isPhoneVerified ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#16A34A] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-[#15803D] transition-all disabled:opacity-50"
                    >
                      {otpLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Verify SMS"}
                    </button>
                  ) : (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA] group-focus-within:text-[#1E40AF] transition-colors" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/5 transition-all font-medium text-[#0F172A]"
                    placeholder="name@business.bd"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA] group-focus-within:text-[#1E40AF] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl py-3.5 pl-12 pr-12 outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/5 transition-all font-medium text-[#0F172A]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#0F172A]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isPhoneVerified}
                className="w-full bg-[#1E40AF] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-[#1E40AF]/20 hover:bg-[#1E3A8A] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {loading ? "Creating System..." : "Initialize Free Trial"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in duration-300">
               <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <ShieldCheck className="w-8 h-8 text-[#16A34A]" />
                  </div>
                  <h2 className="text-2xl font-black text-[#0F172A]">Security Verification</h2>
                  <p className="text-sm text-[#64748B] font-medium">We've sent a 6-digit code to <span className="text-[#0F172A] font-bold">{formData.phone}</span></p>
               </div>

               <div className="space-y-6">
                  <div className="flex gap-4 justify-center">
                     <input 
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="••••••"
                        className="w-full max-w-[200px] bg-[#F8F9FA] border border-[#E5E7EB] rounded-3xl py-5 text-center text-3xl font-black tracking-[0.5em] outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/5 transition-all text-[#0F172A]"
                     />
                  </div>
                  
                  <button 
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otp.length < 6}
                    className="w-full bg-[#16A34A] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-[#16A34A]/20 hover:bg-[#15803D] transition-all disabled:opacity-50"
                  >
                    {otpLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                  </button>

                  <button 
                    onClick={() => setShowOtpStep(false)}
                    className="w-full text-sm font-bold text-[#64748B] hover:text-[#0F172A] transition-colors"
                  >
                    Change Phone Number
                  </button>
               </div>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-[#F1F5F9] text-center">
            <p className="text-[#64748B] text-sm font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1E40AF] font-bold hover:underline">Log in here</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[#A1A1AA] text-xs font-medium">Your data is encrypted with bank-grade security protocols.</p>
        </div>
      </div>
    </div>
  );
}
