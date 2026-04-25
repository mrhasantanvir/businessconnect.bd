"use client";

import React from "react";
import { PhoneCall } from "lucide-react";
import { dialNumber } from "./SipDialer";

export function CallAction({ phone, name }: { phone: string, name?: string }) {
  const handleCall = () => {
    dialNumber(phone);
  };

  return (
    <button 
      onClick={handleCall}
      className="p-3 bg-[#BEF264] text-green-900 rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-[#BEF264]/20 group"
      title={`Call ${name || phone}`}
    >
      <PhoneCall className="w-5 h-5 group-hover:rotate-12 transition-transform" />
    </button>
  );
}
