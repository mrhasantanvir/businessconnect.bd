'use client';

import React, { useState } from "react";
import { PhoneCall, Loader2 } from "lucide-react";
import { logCallAction } from "../../../app/merchant/orders/fulfillmentActions";

export function CallButton({ orderId, customerPhone }: { orderId: string, customerPhone: string }) {
  const [isCalling, setIsCalling] = useState(false);

  const handleCall = async () => {
    setIsCalling(true);
    
    // 1. Log the call on server
    try {
      await logCallAction(orderId, customerPhone);
      
      // 2. Open dialer (simulated tel link)
      window.location.href = `tel:${customerPhone}`;
    } catch (error) {
      console.error("Call Log Error:", error);
    } finally {
      // Small timeout to show calling state
      setTimeout(() => setIsCalling(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCall}
      disabled={isCalling}
      className={`absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all flex items-center gap-2 group ${
        isCalling ? 'bg-indigo-100 text-indigo-400' : 'bg-indigo-50  text-indigo-600  hover:bg-indigo-100 '
      }`}
      title="Call Customer Now"
    >
      {isCalling ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <PhoneCall className="w-4 h-4 group-hover:scale-110 transition-transform" />
      )}
      <span className="text-[10px] font-black uppercase">Call</span>
    </button>
  );
}
