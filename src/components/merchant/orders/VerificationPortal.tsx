"use client";

import React, { useState, useTransition } from "react";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ShieldCheck,
  QrCode
} from "lucide-react";
import { markReadyToShipAction } from "@/app/merchant/orders/fulfillmentActions";

interface VerificationPortalProps {
  orderId: string;
  items: any[];
}

/**
 * Fulfillment Verification Portal
 * Implements the "Scan-to-Verify" outbound practice.
 * Merchants must scan all items in the order before they can mark it as Ready to Ship.
 */
export function VerificationPortal({ orderId, items }: VerificationPortalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  // Calculate if all items are packed
  const isFullyPacked = items.every(item => 
    (scannedItems[item.product.barcode || item.product.sku || ""] || 0) >= item.quantity
  );

  const handleScan = (barcode: string) => {
    // Find item matching barcode or SKU
    const item = items.find(i => i.product.barcode === barcode || i.product.sku === barcode);
    
    if (item) {
      setScannedItems(prev => ({
        ...prev,
        [barcode]: (prev[barcode] || 0) + 1
      }));
      // Optional: Sound effect for success scan
    } else {
      // Optional: Sound effect for mismatch scan
      alert(`MISMATCH: Item with barcode ${barcode} is not part of this order!`);
    }
  };

  const handleComplete = () => {
    startTransition(async () => {
      await markReadyToShipAction(orderId);
      setIsScanning(false);
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-8 bg-indigo-50  rounded-[32px] border border-indigo-100 ">
        <h4 className="text-[10px] font-black text-indigo-700 uppercase mb-4 flex items-center gap-2">
           <ShieldCheck className="w-4 h-4" /> Fulfillment Verification Required
        </h4>
        
        <div className="space-y-4 mb-8">
           {items.map(item => {
              const scannedCount = scannedItems[item.product.barcode || item.product.sku || ""] || 0;
              const isDone = scannedCount >= item.quantity;
              
              return (
                <div key={item.id} className="flex items-center justify-between bg-white  p-4 rounded-2xl border border-white  shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDone ? 'bg-green-100' : 'bg-gray-100'}`}>
                         {isDone ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Package className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div>
                         <p className="text-xs font-black text-[#0F172A]  uppercase">{item.product.name}</p>
                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                            {scannedCount} of {item.quantity} units verified
                         </p>
                      </div>
                   </div>
                   {!isDone && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                   )}
                </div>
              );
           })}
        </div>

        {!isFullyPacked ? (
          <button 
            onClick={() => setIsScanning(true)}
            className="w-full py-4 bg-indigo-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
          >
             <QrCode className="w-4 h-4" /> Open Verification Scanner
          </button>
        ) : (
          <button 
            onClick={handleComplete}
            disabled={isPending}
            className="w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-gray-100 transition-all flex items-center justify-center gap-2"
          >
             {isPending ? "Syncing..." : "Mark as Ready to Ship"}
             <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {isScanning && (
        <BarcodeScanner 
          onScan={handleScan}
          onClose={() => setIsScanning(false)}
          title={`Verifying Order #${orderId.slice(-6).toUpperCase()}`}
        />
      )}
    </div>
  );
}
