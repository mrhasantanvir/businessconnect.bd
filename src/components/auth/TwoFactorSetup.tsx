"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, QrCode, Copy, CheckCircle2, Loader2, X } from "lucide-react";
import { generateTwoFactorSecretAction, verifyAndEnableTwoFactorAction, disableTwoFactorAction } from "@/app/login/twoFactorActions";
import { toast } from "sonner";

export function TwoFactorSetup({ isEnabledInitial }: { isEnabledInitial: boolean }) {
  const [isEnabled, setIsEnabled] = useState(isEnabledInitial);
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  async function handleStartSetup() {
    setLoading(true);
    try {
      const data = await generateTwoFactorSecretAction();
      setSetupData(data);
      setShowSetup(true);
    } catch (error) {
      toast.error("Failed to initialize 2FA setup");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAndEnable() {
    if (verificationCode.length !== 6) return;
    setLoading(true);
    try {
      const result = await verifyAndEnableTwoFactorAction(verificationCode);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("2FA enabled successfully");
        setIsEnabled(true);
        setShowSetup(false);
        setSetupData(null);
        setVerificationCode("");
      }
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    if (!confirm("Are you sure you want to disable 2FA? This will make your account less secure.")) return;
    setLoading(true);
    try {
      await disableTwoFactorAction();
      setIsEnabled(false);
      toast.success("2FA disabled");
    } catch (error) {
      toast.error("Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isEnabled ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
            {isEnabled ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0F172A]">Two-Factor Authentication</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">
              {isEnabled ? 'Your account is protected' : 'Highly recommended for security'}
            </p>
          </div>
        </div>
        {!isEnabled && !showSetup && (
          <button 
            onClick={handleStartSetup}
            disabled={loading}
            className="px-6 py-3 bg-[#1E40AF] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1E3A8A] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enable 2FA'}
          </button>
        )}
        {isEnabled && (
          <button 
            onClick={handleDisable}
            disabled={loading}
            className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all"
          >
            Disable
          </button>
        )}
      </div>

      {showSetup && setupData && (
        <div className="pt-6 border-t border-gray-50 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="w-72 h-72 bg-white border-8 border-gray-50 rounded-[48px] p-2 shadow-inner relative group flex items-center justify-center">
              <img 
                src={setupData.qrCodeUrl} 
                alt="2FA QR Code" 
                className="w-full h-full object-contain aspect-square" 
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]">
                <QrCode className="w-14 h-14 text-[#1E40AF]" />
              </div>
            </div>
            
            <div className="flex-1 space-y-6 w-full">
              <div className="space-y-2">
                <h4 className="text-sm font-black text-[#0F172A]">Step 1: Scan QR Code</h4>
                <p className="text-xs font-bold text-gray-500 leading-relaxed">
                  Open your authenticator app (like Google Authenticator or Authy) and scan this QR code. 
                  Alternatively, you can enter the secret key manually.
                </p>
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between group">
                  <code className="text-[10px] font-mono font-bold text-[#1E40AF] tracking-widest">{setupData.secret}</code>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(setupData.secret); toast.success("Secret copied"); }}
                    className="p-1.5 hover:bg-white rounded-lg transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black text-[#0F172A]">Step 2: Enter Verification Code</h4>
                <div className="flex gap-4">
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-xl font-black tracking-[0.5em] text-center outline-none focus:border-[#1E40AF] transition-all"
                    placeholder="000000"
                  />
                  <button 
                    onClick={handleVerifyAndEnable}
                    disabled={loading || verificationCode.length !== 6}
                    className="px-8 bg-[#1E40AF] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1E3A8A] transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Verify</>}
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setShowSetup(false)}
                className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Cancel Setup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
