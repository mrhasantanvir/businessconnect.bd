"use client";

import React, { useState, useEffect } from "react";
import { Box, ArrowRight, Lock, Eye, EyeOff, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction } from "../login/resetActions";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setLoading(true);

    const result = await resetPasswordAction(token, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.success) {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white border border-[#E5E7EB] rounded-[40px] p-10 shadow-2xl shadow-[#1E40AF]/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#BEF264]"></div>
            <div className="w-20 h-20 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-[#16A34A]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] mb-4">Password Updated</h1>
            <p className="text-[#64748B] font-medium mb-8">Your password has been reset successfully. You can now log in with your new credentials.</p>
            <Link 
              href="/login" 
              className="w-full bg-[#1E40AF] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#1E3A8A] transition-all"
            >
              Back to Login
            </Link>
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
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 md:p-10 shadow-2xl shadow-[#1E40AF]/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1E40AF] to-[#BEF264]"></div>
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0F172A] mb-2 tracking-tight">Set New Password</h1>
            <p className="text-[#64748B] text-sm font-medium">Create a strong password to secure your account.</p>
          </div>

          {!token ? (
            <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-sm p-6 rounded-2xl text-center">
              <p className="font-bold mb-4">Invalid Reset Link</p>
              <p className="mb-6">This password reset link is invalid or has expired.</p>
              <Link href="/forgot-password" className="text-[#1E40AF] font-bold hover:underline">Request a new link</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-sm p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-1">New Password</label>
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

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA] group-focus-within:text-[#1E40AF] transition-colors" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/5 transition-all font-medium text-[#0F172A]"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1E40AF] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#1E40AF]/20 hover:bg-[#1E3A8A] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? "Resetting..." : "Update Password"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-[#F1F5F9] text-center">
            <Link href="/login" className="text-[#64748B] text-sm font-bold hover:text-[#1E40AF] transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
