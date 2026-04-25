"use client";

import React from "react";
import { 
  Package, 
  ShieldCheck, 
  RefreshCw, 
  Truck, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";

/**
 * Premium Status Stepper Component
 */
export function OrderStepper({ currentStatus }: { currentStatus: string }) {
  const steps = [
    { id: "PENDING", label: "Pending", icon: Package },
    { id: "CONFIRMED", label: "Confirmed", icon: ShieldCheck },
    { id: "PROCESSING", label: "Processing", icon: RefreshCw },
    { id: "READY_TO_SHIP", label: "Ready", icon: Package },
    { id: "SHIPPED", label: "On the Way", icon: Truck },
    { id: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
  ];

  const currentIdx = steps.findIndex(s => s.id === currentStatus);
  const isCancelled = currentStatus === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center gap-4 py-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
          <XCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-black text-red-600 uppercase tracking-widest">Order Cancelled</h4>
          <p className="text-xs text-gray-400 font-bold">This transaction has been terminated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-between w-full">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100  -translate-y-1/2 -z-0" />
      
      {/* Active Progress Line */}
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-1000"
        style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isCompleted = idx <= currentIdx;
        const isActive = idx === currentIdx;

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
              isActive ? 'bg-black text-white border-black shadow-xl scale-110' :
              isCompleted ? 'bg-indigo-600 text-white border-indigo-400' : 
              'bg-white  text-gray-300 border-gray-100 '
            }`}>
              <Icon className={idx === currentIdx ? "w-6 h-6 animate-pulse" : "w-5 h-5"} />
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
              isCompleted ? 'text-[#0F172A] ' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
