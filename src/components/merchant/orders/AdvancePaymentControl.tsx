"use client";

import React, { useState, useTransition } from "react";
import { CreditCard, Check, AlertCircle, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";

export function AdvancePaymentControl({ 
  orderId, 
  currentAdvance,
  totalAmount
}: { 
  orderId: string, 
  currentAdvance: number,
  totalAmount: number
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState("");
  const [trxId, setTrxId] = useState("");
  const [method, setMethod] = useState("BKASH");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
       // We'll define this action shortly in fulfillmentActions.ts or similar
       const response = await fetch("/api/merchant/orders/advance-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, amount: parseFloat(amount), trxId, method })
       });
       
       if (response.ok) {
         setIsAdding(false);
         router.refresh();
       } else {
         alert("Failed to record payment");
       }
    });
  };

  return (
    <div className="p-6 bg-indigo-50/50  rounded-[32px] border border-indigo-100  space-y-4">
       <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Advance Payment
          </h4>
          {currentAdvance > 0 && (
            <div className="text-xs font-black text-green-600">৳{currentAdvance.toLocaleString()} Received</div>
          )}
       </div>

       {!isAdding ? (
         <button 
           onClick={() => setIsAdding(true)}
           className="w-full py-3 bg-white  border border-indigo-100  rounded-2xl text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-white transition-all"
         >
           Record Advance / Partial Payment
         </button>
       ) : (
         <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="text-[8px] font-black text-gray-400 uppercase ml-2">Amount</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="e.g. 500"
                    className="w-full bg-white  border border-indigo-100  rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
               </div>
               <div>
                  <label className="text-[8px] font-black text-gray-400 uppercase ml-2">Method</label>
                  <select 
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full bg-white  border border-indigo-100  rounded-xl p-3 text-xs outline-none"
                  >
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                  </select>
               </div>
            </div>
            <div>
               <label className="text-[8px] font-black text-gray-400 uppercase ml-2">Transaction ID / Reference</label>
               <input 
                 type="text" 
                 value={trxId}
                 onChange={(e) => setTrxId(e.target.value)}
                 required
                 placeholder="e.g. 7X8Y9Z"
                 className="w-full bg-white  border border-indigo-100  rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
               />
            </div>
            <div className="flex gap-2 pt-2">
               <button 
                 type="submit" 
                 disabled={isPending}
                 className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
               >
                 {isPending ? "Saving..." : "Confirm Payment"}
               </button>
               <button 
                 type="button" 
                 onClick={() => setIsAdding(false)}
                 className="px-4 py-3 bg-gray-200  text-gray-500 rounded-xl font-black text-[10px] uppercase hover:bg-gray-300 transition-all"
               >
                 Cancel
               </button>
            </div>
         </form>
       )}

       <div className="flex items-start gap-2 pt-2">
          <AlertCircle className="w-3 h-3 text-indigo-400 mt-0.5" />
          <p className="text-[8px] font-bold text-gray-400 uppercase leading-relaxed">
            Advance payments will be automatically deducted from the Courier COD amount during dispatch.
          </p>
       </div>
    </div>
  );
}
