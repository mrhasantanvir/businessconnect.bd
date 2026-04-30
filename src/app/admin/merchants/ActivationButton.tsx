"use client";

import React, { useState } from "react";
import { updateMerchantStatusAction } from "./actions";
import { toast } from "sonner";
import { RefreshCw, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function ActivationButton({ storeId }: { storeId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleActivate = async () => {
    if (!confirm("Are you sure you want to activate this merchant?")) return;
    
    setLoading(true);
    try {
      const res = await updateMerchantStatusAction(storeId, "ACTIVE");
      if (res.success) {
        toast.success("Merchant activated successfully!");
        router.refresh();
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
      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
      {loading ? "Activating..." : "Activate"}
    </button>
  );
}
