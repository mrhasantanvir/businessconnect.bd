"use client";

import React, { useState, useTransition } from "react";
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { 
  confirmOrderAction,
  markAsProcessingAction,
  markReadyToShipAction, 
  completeDeliveryAction,
  bookSteadfastDispatchAction,
  bookRedxDispatchAction,
  bookManualDispatchAction
} from "@/app/merchant/orders/fulfillmentActions";
import { PartialShipmentModal } from "./PartialShipmentModal";
import { CallButton } from "./CallButton";
import { VerificationPortal } from "./VerificationPortal";
import { RedirectOrderButton } from "./RedirectOrderButton";

export function OrderFulfillmentHub({ order, configs }: { order: any, configs: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [showPartialModal, setShowPartialModal] = useState(false);

  const orderId = order.id;

  return (
    <div className="bg-white  border border-[#E5E7EB]  rounded-3xl md:rounded-[48px] p-5 md:p-8 shadow-sm space-y-4 md:space-y-6">
      <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] mb-4">Fulfillment Hub</h3>
      
      {order.status === "PENDING" && (
        <div className="space-y-3">
          <div className="relative group/row">
            <button 
              onClick={() => startTransition(async () => { await confirmOrderAction(orderId, "PHONE_CALL"); })}
              disabled={isPending}
              className="w-full py-4 bg-indigo-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
               {isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
               Confirm via Call
            </button>
            <CallButton orderId={orderId} customerPhone={order.customerPhone || ""} />
          </div>
          <button 
            onClick={() => startTransition(async () => { await confirmOrderAction(orderId, "MANUAL"); })}
            disabled={isPending}
            className="w-full py-4 bg-white  border border-gray-200  text-[#0F172A]  rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
             Confirm Without Call
          </button>
        </div>
      )}

      {order.status === "CONFIRMED" && (
        <button 
          onClick={() => startTransition(async () => { await markAsProcessingAction(orderId); })}
          disabled={isPending}
          className="w-full py-4 bg-indigo-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
        >
           {isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Package className="w-4 h-4" />}
           Start Processing
        </button>
      )}

      {(order.status === "PROCESSING" || order.status === "READY_TO_SHIP" || order.status === "PARTIAL_SHIPPED") && (
        <div className="space-y-4">
           {order.status === "PROCESSING" && (
             <VerificationPortal orderId={orderId} items={order.items} />
           )}
           
           <div className="p-5 bg-indigo-50  rounded-3xl border border-indigo-100 ">
              <h4 className="text-[10px] font-black text-indigo-700 uppercase mb-1 flex items-center gap-2"><Truck className="w-3 h-3" /> Logistics Sync</h4>
              <p className="text-[9px] font-bold text-indigo-600/80">
                 {order.status === "PARTIAL_SHIPPED" ? "Remaining items detected. Dispatch next batch." : "Inventory is verified and packed. Proceed with courier dispatch."}
              </p>
           </div>
           
           <div className="flex flex-col gap-2">
              <button 
                onClick={() => setShowPartialModal(true)}
                className="w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
              >
                 <Package className="w-4 h-4" /> Dispatch Specific Items
              </button>
              
              <div className="relative">
                 <div className="absolute inset-0 flex items-center px-4"><div className="w-full border-t border-gray-100 "></div></div>
                 <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest bg-white  px-4 mx-auto w-fit text-gray-400">Full Dispatch Options</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 {configs.map((cfg) => (
                    <button 
                       key={cfg.id}
                       disabled={isPending}
                       onClick={() => startTransition(async () => {
                          if (cfg.type === "API") {
                             if (cfg.providerName === "STEADFAST") await bookSteadfastDispatchAction(orderId);
                             else if (cfg.providerName === "REDX") await bookRedxDispatchAction(orderId);
                             else await bookManualDispatchAction(orderId, cfg.providerName);
                          } else {
                             await bookManualDispatchAction(orderId, cfg.providerName);
                          }
                       })}
                       className={`w-full py-4 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] shadow-xl transition-all flex items-center justify-center gap-2 ${
                          cfg.providerName === 'STEADFAST' ? 'bg-green-600 shadow-green-200' : 
                          cfg.providerName === 'REDX' ? 'bg-red-600 shadow-red-200' : 
                          cfg.providerName === 'PATHAO' ? 'bg-orange-600 shadow-orange-200' : 
                          'bg-indigo-600 shadow-indigo-200'
                       }`}
                    >
                       {isPending ? "..." : cfg.providerName}
                    </button>
                 ))}
                 {configs.length === 0 && (
                    <div className="col-span-full py-4 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                       <p className="text-[10px] font-bold text-gray-400">No active couriers configured.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {(order.status === "SHIPPED" || order.status === "PARTIAL_SHIPPED") && (
        <div className="space-y-3">
          <button 
             onClick={() => startTransition(async () => { await completeDeliveryAction(orderId); })}
             className="w-full py-4 bg-[#BEF264] text-green-900 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-[#BEF264]/20 transition-all flex items-center justify-center gap-2"
          >
             <CheckCircle2 className="w-4 h-4" /> Mark as Fully Delivered
          </button>
          <div className="p-4 bg-gray-50  rounded-2xl border border-gray-200  text-center">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Courier Status</p>
             <p className="text-xs font-black text-[#0F172A]  flex items-center justify-center gap-2 mt-1">
                Consignment: {order.courierTrxId || "Various"}
             </p>
          </div>
        </div>
      )}

      {order.status === "SHIPPED" && (
         <RedirectOrderButton sourceOrderId={orderId} />
      )}

      {order.status !== "CANCELLED" && order.status !== "DELIVERED" && order.status !== "RETURNED" && (
        <button className="w-full py-4 bg-white  border border-red-100  text-red-600 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-red-50 transition-all">
           Cancel Fulfillment
        </button>
      )}

      {showPartialModal && (
        <PartialShipmentModal 
          orderId={orderId} 
          items={order.items} 
          couriers={configs} 
          preferredCourier={order.preferredCourier}
          onClose={() => setShowPartialModal(false)} 
        />
      )}
    </div>
  );
}
