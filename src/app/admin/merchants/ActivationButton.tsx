"use client";

import React, { useState } from "react";
import { updateMerchantStatusAction } from "./actions";
import { toast } from "sonner";
import { RefreshCw, CheckCircle } from "lucide-react";

export function ActivationButton({ storeId }: { storeId: string }) {
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!confirm("Are you sure you want to activate this merchant?")) return;
    
    setLoading(true);
    try {
      const res = await updateMerchantStatusAction(storeId, "ACTIVE");
      if (res.success) {
        toast.success("Merchant activated successfully!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleActivate}
      disabled={loading}
      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
      {loading ? "Activating..." : "Verify & Activate Store"}
    </button>
  );
}
