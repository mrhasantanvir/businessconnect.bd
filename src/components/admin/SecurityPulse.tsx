"use client";

import React from "react";
import { ShieldCheck, Zap, Globe, Lock } from "lucide-react";

export function SecurityPulse() {
  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
           <ShieldCheck className="w-5 h-5 text-green-500" />
           Security Integrity
        </h3>
        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full animate-pulse">MONITORING</span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Globe className="w-4 h-4 text-blue-500" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">WAF Status</p>
                <p className="text-xs font-bold text-gray-900">Active Protection</p>
             </div>
          </div>
          <Zap className="w-3 h-3 text-yellow-500" />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Lock className="w-4 h-4 text-purple-500" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">SSL Proxy</p>
                <p className="text-xs font-bold text-gray-900">Encrypted (TLS 1.3)</p>
             </div>
          </div>
          <Check className="w-3 h-3 text-green-500" />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
         <div className="flex justify-between items-end">
            <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Thwarted Attacks</p>
               <p className="text-xl font-black text-gray-900">1,242 <span className="text-[10px] text-gray-400 font-medium ml-1">/ 24h</span></p>
            </div>
            <button className="text-[10px] font-bold text-indigo-600 hover:underline">Full Log</button>
         </div>
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
