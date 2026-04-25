import React from "react";
import { CheckCircle2, Circle, Clock, Package, Truck, Check } from "lucide-react";

type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "READY_TO_SHIP" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";

const STAGES = [
  { key: "PENDING", label: "Order Placed", icon: Clock },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "PROCESSING", label: "Processing", icon: Package },
  { key: "READY_TO_SHIP", label: "Ready", icon: BoxIcon },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Completed", icon: Check },
];

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

export function OrderStepper({ currentStatus }: { currentStatus: string }) {
  const currentIdx = STAGES.findIndex(s => s.key === currentStatus);
  
  if (currentStatus === "CANCELLED" || currentStatus === "RETURNED") {
     return (
       <div className="flex items-center gap-2 p-4 bg-red-50  rounded-2xl border border-red-100 ">
          <Circle className="w-5 h-5 text-red-600 fill-red-600" />
          <span className="text-sm font-black text-red-700 uppercase tracking-widest">{currentStatus}</span>
       </div>
     );
  }

  return (
    <div className="w-full py-8">
      <div className="relative flex justify-between">
        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100  -z-0" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-indigo-500 transition-all duration-1000 -z-0" 
          style={{ width: `${Math.max(0, (currentIdx / (STAGES.length - 1)) * 100)}%` }}
        />

        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isCompleted = i < currentIdx;
          const isActive = i === currentIdx;
          const isPending = i > currentIdx;

          return (
            <div key={stage.key} className="flex flex-col items-center gap-3 relative z-10 transition-all">
              <div 
                className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                  isCompleted ? "bg-indigo-500 border-indigo-100 " :
                  isActive ? "bg-white  border-indigo-500" :
                  "bg-white  border-gray-100 "
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Icon className={`w-5 h-5 ${isActive ? "text-indigo-500" : "text-gray-300"}`} />
                )}
              </div>
              <p className={`text-[9px] font-black uppercase tracking-widest ${isActive ? "text-indigo-600" : isCompleted ? "text-gray-500" : "text-gray-400"}`}>
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
