"use client";

import React, { useState, useTransition } from "react";
import { Loader2, Plus, Minus } from "lucide-react";
import { manualBalanceAdjustAction } from "./actions";

export function ManualAdjustForm({ merchantStoreId }: { merchantStoreId: string }) {
  const [type, setType] = useState<"SMS" | "SIP">("SMS");
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === 0) return;

    startTransition(async () => {
      try {
        await manualBalanceAdjustAction(merchantStoreId, type, amount, reason);
        setAmount(0);
        setReason("");
        alert("Balance successfully adjusted");
      } catch (error) {
        alert("Failed to adjust balance");
      }
    });
  };

  return (
    <form onSubmit={handleAdjust} className="flex flex-col gap-2 p-3 bg-gray-50 border border-gray-100 rounded-lg">
      <div className="flex items-center gap-2">
        <select 
          value={type} 
          onChange={e => setType(e.target.value as any)}
          className="text-xs p-1 border rounded"
        >
          <option value="SMS">SMS</option>
          <option value="SIP">SIP</option>
        </select>
        
        <input 
          type="number" 
          value={amount || ""} 
          onChange={e => setAmount(parseInt(e.target.value) || 0)}
          placeholder="+/- Amount"
          className="w-24 text-xs p-1 border rounded"
          required
        />
        
        <button 
          disabled={isPending || amount === 0}
          type="submit" 
          className="px-2 py-1 bg-white text-slate-900 text-slate-900 border border-slate-100 text-white text-xs rounded font-medium disabled:opacity-50 flex items-center gap-1"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
        </button>
      </div>
      <input 
        type="text" 
        value={reason} 
        onChange={e => setReason(e.target.value)}
        placeholder="Reason (e.g. Refund, Bonus)"
        className="w-full text-xs p-1 border rounded"
      />
    </form>
  );
}
