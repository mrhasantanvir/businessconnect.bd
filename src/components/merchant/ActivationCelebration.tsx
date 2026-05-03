"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, CheckCircle2, X, PartyPopper } from "lucide-react";

export function ActivationCelebration({ 
  userId, 
  storeId, 
  activationStatus, 
  entityName, 
  role 
}: { 
  userId: string, 
  storeId?: string, 
  activationStatus: string, 
  entityName: string,
  role: string 
}) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (activationStatus === "ACTIVE") {
      // For merchants, it's tied to the store activation
      // For staff/admins, it's tied to their user account (first login)
      const isMerchant = role === "MERCHANT";
      const storageKey = isMerchant ? `activation_celebrated_${storeId}` : `joined_celebrated_${userId}`;
      const hasCelebrated = localStorage.getItem(storageKey);

      if (!hasCelebrated) {
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
        localStorage.setItem(storageKey, "true");
      }
    }
  }, [activationStatus, storeId, userId, role]);

  if (!showModal) return null;

  const isMerchant = role === "MERCHANT";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="relative w-full max-w-lg bg-white rounded-none shadow-2xl border-t-4 border-[#16A34A] animate-in zoom-in-95 duration-500 p-8 md:p-12 text-center">
        <button 
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-24 h-24 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative">
           <div className="absolute inset-0 bg-[#16A34A] rounded-full animate-ping opacity-20"></div>
           {isMerchant ? <CheckCircle2 className="w-12 h-12 text-[#16A34A]" /> : <PartyPopper className="w-12 h-12 text-[#16A34A]" />}
           <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-400 animate-pulse" />
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
          Congratulations! 🎉
        </h2>
        
        <p className="text-lg font-medium text-slate-600 mb-8 leading-relaxed">
          {isMerchant ? (
            <>
              Your store <strong className="text-slate-900">{entityName}</strong> is now officially <span className="text-[#16A34A] font-bold">ACTIVE</span>. 
              You now have full access to all merchant ecosystem features. Let's start growing your business!
            </>
          ) : (
            <>
              You have successfully joined <strong className="text-slate-900">{entityName}</strong>. 
              Your account is now <span className="text-[#16A34A] font-bold">ACTIVE</span> and ready to use. Welcome aboard!
            </>
          )}
        </p>

        <button 
          onClick={() => setShowModal(false)}
          className="w-full bg-[#16A34A] text-white px-8 py-4 rounded-none font-black text-sm uppercase tracking-widest hover:bg-[#15803D] transition-all shadow-xl hover:shadow-2xl active:scale-95"
        >
          {isMerchant ? "Explore Dashboard" : "Get Started"}
        </button>
      </div>
    </div>
  );
}
