"use client";

import React, { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { initiateRechargeAction } from "@/app/merchant/billing/actions";

interface RechargeButtonProps {
  type: "SMS" | "SIP" | "SUBSCRIPTION_RENEW" | "SUBSCRIPTION_UPGRADE" | "INVOICE_PAY";
  amount: number;
  credits?: number;
  planId?: string;
  invoiceId?: string;
  label?: string;
  className?: string;
}

export function RechargeButton({ type, amount, credits = 0, planId, invoiceId, label = "Buy via bKash", className }: RechargeButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleRecharge = () => {
    startTransition(async () => {
      try {
        const result = await initiateRechargeAction(type, amount, credits, planId, invoiceId);
        if (result.success && result.redirectUrl) {
          window.location.href = result.redirectUrl;
        }
      } catch (error: any) {
        alert(error.message || "Failed to initiate transaction");
      }
    });
  };

  return (
    <button
      onClick={handleRecharge}
      disabled={isPending}
      className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-75 ${className}`}
    >
      {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
      {isPending ? "Connecting..." : label}
    </button>
  );
}
