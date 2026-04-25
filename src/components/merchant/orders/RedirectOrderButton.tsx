'use client';

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { reassignOrderAction } from "../../../app/merchant/orders/fulfillmentActions";

export function RedirectOrderButton({ sourceOrderId }: { sourceOrderId: string }) {
  const [targetOrderId, setTargetOrderId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRedirect() {
    if (!targetOrderId) return alert("Please enter the Target Order ID");
    if (!confirm("Are you sure you want to redirect this parcel to a new order? This will cancel the current fulfillment.")) return;

    setLoading(true);
    try {
      const result = await reassignOrderAction(sourceOrderId, targetOrderId);
      if (result) {
        window.location.reload();
      }
    } catch (error: any) {
      alert(error.message || "Failed to redirect order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-6 border-t border-gray-100  space-y-4">
      <h4 className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-2">
        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Zone Change (Redirect)
      </h4>
      <p className="text-[9px] font-bold text-gray-400">If delivery fails, you can redirect this physical parcel to another order.</p>
      <div className="flex gap-2">
        <input 
          value={targetOrderId}
          onChange={(e) => setTargetOrderId(e.target.value)}
          placeholder="New Order ID" 
          className="flex-1 px-4 py-2 bg-gray-50  border border-gray-200  rounded-xl text-[10px] font-bold outline-none focus:border-indigo-500 transition-all"
        />
        <button 
          onClick={handleRedirect}
          disabled={loading}
          className="px-4 py-2 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100  text-white  rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Redirect'}
        </button>
      </div>
    </div>
  );
}
