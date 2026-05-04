"use client";

import React, { useState, useTransition } from "react";
import { processReturnAction } from "../actions";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { Loader2, RotateCcw, Box, CheckCircle, Smartphone, Zap } from "lucide-react";

export function ReturnProcessingForm({ warehouses, orders }: { warehouses: any[], orders: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [isScannerOpen, setScannerOpen] = useState(false);
  
  const selectedOrder = orders.find(o => o.id === selectedOrderId || o.id.includes(selectedOrderId));

  const handleScan = (barcode: string) => {
    // 1. Try to find by Order ID (QR on Invoice)
    const foundByOrder = orders.find(o => o.id === barcode || o.id.slice(-6).toUpperCase() === barcode.toUpperCase());
    if (foundByOrder) {
      setSelectedOrderId(foundByOrder.id);
      setScannerOpen(false);
      return;
    }

    // 2. Try to find by Product Barcode (Item identification)
    // If an order is already selected, we might want to "select" that item in the list
    if (selectedOrder) {
       const item = selectedOrder.items.find((i: any) => i.product.barcode === barcode || i.product.sku === barcode);
       if (item) {
          // Visual feedback or auto-scroll to that item could go here
          alert(`Item identified: ${item.product.name}`);
       }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const items = selectedOrder?.items.map((i: any) => ({
      productId: i.productId,
      quantity: i.quantity
    })) || [];

    startTransition(async () => {
      try {
        await processReturnAction({
          orderId: selectedOrder?.id || "",
          warehouseId: formData.get("warehouseId") as string,
          status: formData.get("status") as any,
          reason: formData.get("reason") as string,
          items
        });
        alert("RMA Record successfully localized.");
        window.location.reload();
      } catch (err: any) {
        alert(err.message || "Failed to process return.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {isScannerOpen && (
        <BarcodeScanner 
          onScan={handleScan} 
          onClose={() => setScannerOpen(false)} 
          title="Return Item / Order Scanner"
        />
      )}

      <form onSubmit={handleSubmit} className="bg-white  border border-[#E5E7EB]  p-8 rounded-[32px] shadow-sm space-y-6 animate-in slide-in-from-left-8 duration-700">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2 text-rose-600">
              <RotateCcw className="w-5 h-5" />
              <h2 className="text-xl font-semibold text-[#0F172A]  tracking-tight">RMA Intake</h2>
           </div>
           <button 
              type="button"
              onClick={() => setScannerOpen(true)}
              className="px-3 py-1.5 bg-indigo-50  text-indigo-700  rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100 "
           >
              <Smartphone className="w-3 h-3" /> Lens Scan
           </button>
        </div>

        <div className="space-y-4">
           <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Order Identifier (Manual or Scanned)</label>
              <div className="relative">
                 <select 
                   value={selectedOrderId} 
                   onChange={(e) => setSelectedOrderId(e.target.value)}
                   required 
                   className="w-full bg-[#F8F9FA]  border border-transparent focus:border-rose-500 rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all"
                 >
                    <option value="">-- Choose Order --</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>ORD-{o.id.slice(-6).toUpperCase()} ({o.customerName})</option>
                    ))}
                 </select>
                 {selectedOrderId && (
                   <Zap className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-pulse" />
                 )}
              </div>
           </div>

         {selectedOrder && (
           <div className="bg-rose-50/50  p-4 rounded-2xl border border-rose-100  space-y-2">
              <div className="text-[10px] font-bold text-rose-800  uppercase tracking-widest">Inventory to Recapture</div>
              {selectedOrder.items.map((i: any) => (
                <div key={i.id} className="text-xs font-bold text-rose-900  flex items-center justify-between">
                   <span>{i.product.name}</span>
                   <span>x{i.quantity}</span>
                </div>
              ))}
           </div>
         )}

         <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Destination Hub</label>
            <select name="warehouseId" required className="w-full bg-[#F8F9FA]  border border-transparent focus:border-rose-500 rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all">
               {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
            </select>
         </div>

         <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Inspection Verdict</label>
            <select name="status" required className="w-full bg-[#F8F9FA]  border border-transparent focus:border-rose-500 rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all">
               <option value="RESTOCKED">RESTOCK (Sellable Condition)</option>
               <option value="DAMAGED">DAMAGED (Write-Off)</option>
               <option value="REJECTED">REJECT (Return to Sender)</option>
            </select>
         </div>

         <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">RMA Context / Notes</label>
            <textarea name="reason" required placeholder="Describe why the product was returned..." className="w-full bg-[#F8F9FA]  border border-transparent focus:border-rose-500 rounded-2xl px-4 py-3 text-sm font-medium outline-none h-20 resize-none placeholder:text-gray-400" />
         </div>
      </div>

      <button 
        disabled={isPending}
        type="submit" 
        className="w-full bg-rose-600 text-white font-black py-4 rounded-[20px] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-200 "
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Box className="w-4 h-4" />}
        {isPending ? "Syncing RMA..." : "Authorize Intake"}
      </button>
      </form>
    </div>
  );
}

