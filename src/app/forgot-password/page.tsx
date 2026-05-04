"use client";

import React, { useState } from "react";
import { Box, ArrowRight, Mail, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requestPasswordResetAction } from "../login/resetActions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const result = await requestPasswordResetAction(email);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setMessage(result.success);
    }
    setLoading(false);
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
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 md:p-10 shadow-2xl shadow-[#1E40AF]/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1E40AF] to-[#BEF264]"></div>
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0F172A] mb-2 tracking-tight">Reset Password</h1>
            <p className="text-[#64748B] text-sm font-medium">Enter your email and we'll send you a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-sm p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] text-sm p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                {message}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA] group-focus-within:text-[#1E40AF] transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/5 transition-all font-medium text-[#0F172A]"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || message !== ""}
              className="w-full bg-[#1E40AF] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#1E40AF]/20 hover:bg-[#1E3A8A] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? "Sending link..." : message ? "Link Sent" : "Send Reset Link"}
              {!loading && !message && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-[#F1F5F9] text-center">
            <Link href="/login" className="text-[#64748B] text-sm font-bold flex items-center justify-center gap-2 hover:text-[#1E40AF] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
