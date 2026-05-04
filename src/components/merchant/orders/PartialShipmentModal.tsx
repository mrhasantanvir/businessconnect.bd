"use client";

import React, { useState, useTransition } from "react";
import { 
  X, 
  Truck, 
  Package, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { partialShipOrderAction } from "@/app/merchant/orders/fulfillmentActions";

interface PartialShipmentModalProps {
  orderId: string;
  items: any[];
  onClose: () => void;
  couriers: any[];
  preferredCourier?: string;
}

export function PartialShipmentModal({ orderId, items, onClose, couriers, preferredCourier }: PartialShipmentModalProps) {
  const [isPending, startTransition] = useTransition();
  
  // Default to preferred courier if matches one of the available configs, else first config, else empty
  const defaultCourier = preferredCourier && couriers.some(c => c.providerName === preferredCourier)
    ? preferredCourier
    : (couriers[0]?.providerName || "");

  const [selectedCourier, setSelectedCourier] = useState(defaultCourier);
  const [trackingCode, setTrackingCode] = useState("");
  
  // Track quantities to ship for each item
  const [shipQuantities, setShipQuantities] = useState<Record<string, number>>(
    items.reduce((acc, item) => ({
      ...acc,
      [item.id]: 0
    }), {})
  );

  const handleQtyChange = (itemId: string, val: number, max: number) => {
    const qty = Math.max(0, Math.min(max, val));
    setShipQuantities(prev => ({ ...prev, [itemId]: qty }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toShip = Object.entries(shipQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ orderItemId: id, quantity: qty }));

    if (toShip.length === 0) {
      alert("Please select at least one item to ship.");
      return;
    }

    startTransition(async () => {
      try {
        await partialShipOrderAction(orderId, selectedCourier, trackingCode || `PARTIAL-${Date.now()}`, toShip);
        onClose();
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white  w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-gray-100  animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100  flex items-center justify-between bg-[#F8F9FA] ">
           <div>
              <h3 className="text-xl font-semibold text-[#0F172A]  uppercase">Partial <span className="text-indigo-600">Dispatch</span></h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Select items for this fulfillment batch</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-100  rounded-xl transition-all">
              <X className="w-5 h-5 text-gray-400" />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
           
           {/* Item Selection */}
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Select Quantities</label>
              <div className="space-y-3">
                 {items.map((item) => {
                   const remaining = item.quantity - item.shippedQuantity;
                   if (remaining <= 0) return null;
                   
                   return (
                     <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50  rounded-3xl border border-gray-100 ">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white  rounded-xl flex items-center justify-center border border-gray-100 ">
                              <Package className="w-5 h-5 text-indigo-400" />
                           </div>
                           <div>
                              <div className="text-xs font-black text-[#0F172A] ">{item.product?.name || item.name}</div>
                              <div className="text-[9px] font-bold text-gray-400 uppercase">{item.shippedQuantity} of {item.quantity} already shipped</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <input 
                             type="number" 
                             min="0"
                             max={remaining}
                             value={shipQuantities[item.id]}
                             onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 0, remaining)}
                             className="w-16 px-3 py-2 bg-white  border border-gray-200  rounded-xl text-xs font-bold text-center outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                           />
                           <span className="text-[10px] font-black text-gray-400 uppercase">/ {remaining}</span>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>

           {/* Logistics Info */}
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Courier Service</label>
                    {preferredCourier && selectedCourier === preferredCourier && (
                       <span className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-indigo-100">Customer Choice</span>
                    )}
                 </div>
                 <select 
                    value={selectedCourier}
                    onChange={(e) => setSelectedCourier(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50  border border-gray-100  rounded-[24px] text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100 appearance-none"
                 >
                    {couriers.map(c => <option key={c.id} value={c.providerName}>{c.providerName}</option>)}
                    <option value="Self Delivery">Self Delivery</option>
                    <option value="Other">Other Courier</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Tracking Code</label>
                 <input 
                   placeholder="e.g. TRK-99221"
                   value={trackingCode}
                   onChange={(e) => setTrackingCode(e.target.value)}
                   className="w-full px-5 py-4 bg-gray-50  border border-gray-100  rounded-[24px] text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100 font-mono"
                 />
              </div>
           </div>

           {/* Actions */}
           <div className="flex items-center gap-4 pt-4 border-t border-gray-100 ">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-gray-100  text-gray-500 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                 Cancel
              </button>
              <button 
                type="submit"
                disabled={isPending}
                className="flex-[2] py-4 bg-indigo-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:bg-indigo-300"
              >
                 {isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Truck className="w-4 h-4" />}
                 Dispatch Batch
              </button>
           </div>

        </form>

      </div>
    </div>
  );
}
