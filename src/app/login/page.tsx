"use client";

import React, { useState } from "react";
import { Box, ArrowRight, Lock, Mail, Eye, EyeOff, Sparkles, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { loginAction, complete2FALoginAction } from "./actions";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userIdFor2FA, setUserIdFor2FA] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (requires2FA) {
      const result = await complete2FALoginAction(userIdFor2FA, twoFactorCode);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.requires2FA) {
      setRequires2FA(true);
      setUserIdFor2FA(result.userId);
      setLoading(false);
    }
  }

  if (requires2FA) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-4 group">
              <Box className="w-10 h-10 text-[#1E40AF] group-hover:scale-110 transition-transform" />
              <span className="font-bold tracking-tight text-2xl text-[#0F172A]">Businessconnect.bd</span>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 md:p-10 shadow-2xl shadow-[#1E40AF]/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#BEF264]"></div>
            
            <div className="mb-8">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-[#1E40AF]" />
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A] mb-2 tracking-tight">Two-Step Verification</h1>
              <p className="text-[#64748B] text-sm font-medium">Enter the 6-digit code from your authenticator app.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-sm p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-1">Authenticator Code</label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/5 transition-all text-[#0F172A]"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={loading || twoFactorCode.length !== 6}
                className="w-full bg-[#1E40AF] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#1E40AF]/20 hover:bg-[#1E3A8A] transition-all disabled:opacity-70"
              >
                {loading ? "Verifying..." : "Verify & Log in"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>

              <button 
                type="button"
                onClick={() => setRequires2FA(false)}
                className="w-full text-sm font-bold text-[#64748B] hover:text-[#1E40AF] transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-4 group">
            <Box className="w-10 h-10 text-[#1E40AF] group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-tight text-2xl text-[#0F172A]">Businessconnect.bd</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#16A34A]">AI-First Business OS</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 md:p-10 shadow-2xl shadow-[#1E40AF]/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1E40AF] to-[#BEF264]"></div>
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0F172A] mb-2 tracking-tight">Log in</h1>
            <p className="text-[#64748B] text-sm font-medium">Enter your credentials to access your OS.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-sm p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-1">Email or Phone Number</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA] group-focus-within:text-[#1E40AF] transition-colors" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/5 transition-all font-medium text-[#0F172A]"
                  placeholder="Email or +880..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" size="sm" className="text-xs font-bold text-[#1E40AF] hover:underline">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA] group-focus-within:text-[#1E40AF] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              disabled={loading}
              className="w-full bg-[#1E40AF] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#1E40AF]/20 hover:bg-[#1E3A8A] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? "Authenticating..." : "Continue to Dashboard"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-[#F1F5F9] text-center">
            <p className="text-[#64748B] text-sm font-medium">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#1E40AF] font-bold hover:underline">Get started for free</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[#A1A1AA] text-xs font-medium">© 2026 Businessconnect.bd • All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
