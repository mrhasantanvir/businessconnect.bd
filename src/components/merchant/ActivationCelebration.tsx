"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, CheckCircle2, X, PartyPopper } from "lucide-react";

import { markCelebrationSeenAction } from "@/app/login/actions";

export function ActivationCelebration({ 
  userId, 
  storeId, 
  activationStatus, 
  entityName, 
  role,
  hasSeenCelebration
}: { 
  userId: string, 
  storeId?: string, 
  activationStatus: string, 
  entityName: string,
  role: string,
  hasSeenCelebration?: boolean
}) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (activationStatus === "ACTIVE" && !hasSeenCelebration) {
      // Trigger fireworks
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        setShowModal(true);
        markCelebrationSeenAction(userId);
    }
  }, [activationStatus, storeId, userId, role, hasSeenCelebration]);

  if (!showModal) return null;

  const isMerchant = role === "MERCHANT";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#0F172A]/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-700 ease-out border border-white/20">
        
        {/* Decorative Background Gradients */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-indigo-50/80 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Close Button */}
        <button 
          onClick={() => setShowModal(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition-colors z-20 bg-white/60 backdrop-blur-md p-2 rounded-full hover:bg-slate-100 shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative pt-12 px-8 pb-10 text-center z-10">
          
          {/* Animated Premium Badge */}
          <div className="relative inline-flex items-center justify-center mb-8">
            {/* Glowing Rings */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-indigo-500 rounded-[28px] rotate-6 opacity-20 blur-sm animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-emerald-400 to-indigo-500 rounded-[28px] -rotate-6 opacity-20 blur-sm animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            {/* Core Badge */}
            <div className="relative w-24 h-24 bg-white/90 backdrop-blur-xl rounded-[24px] shadow-xl shadow-indigo-500/10 border border-white/50 flex items-center justify-center z-10 group overflow-hidden ring-1 ring-slate-900/5">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               {isMerchant ? (
                 <CheckCircle2 className="w-10 h-10 text-emerald-500 drop-shadow-sm" strokeWidth={2} />
               ) : (
                 <PartyPopper className="w-10 h-10 text-indigo-500 drop-shadow-sm" strokeWidth={2} />
               )}
               <Sparkles className="absolute top-3 right-3 w-4 h-4 text-amber-400 animate-bounce" />
               <Sparkles className="absolute bottom-4 left-3 w-3 h-3 text-emerald-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>

          {/* Typography */}
          <h2 className="text-2xl font-semibold text-slate-900 mb-3 tracking-tight">
            {isMerchant ? "Store Activated!" : "Welcome Aboard!"}
          </h2>
          
          <div className="text-[15px] font-medium text-slate-500 mb-10 leading-relaxed max-w-[280px] mx-auto space-y-1">
            {isMerchant ? (
              <>
                <p><strong className="text-slate-900">{entityName}</strong> is now <span className="text-emerald-600 font-bold tracking-wide">LIVE</span>.</p>
                <p className="text-sm opacity-90">All premium features are unlocked.</p>
              </>
            ) : (
              <>
                <p>You've successfully joined <strong className="text-slate-900">{entityName}</strong>.</p>
                <p className="text-sm opacity-90">Your workspace is fully ready.</p>
              </>
            )}
          </div>

          {/* Action Button */}
          <button 
            onClick={() => setShowModal(false)}
            className="group relative w-full inline-flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10">{isMerchant ? "Access Dashboard" : "Get Started"}</span>
            <svg 
              className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
