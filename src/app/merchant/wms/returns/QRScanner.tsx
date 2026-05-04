"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { X, Camera, Zap } from "lucide-react";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Basic config for the scanner
    const config = { 
       fps: 10, 
       qrbox: { width: 250, height: 250 },
       aspectRatio: 1.0
    };

    scannerRef.current = new Html5QrcodeScanner("reader", config, false);

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        // Clear and close on successful scan
        if (scannerRef.current) {
          scannerRef.current.clear().then(() => {
            onClose();
          }).catch(err => console.error("Failed to clear scanner", err));
        }
      },
      (errorMessage) => {
        // Optional: track scanning errors (silent by default to avoid spam)
        // console.warn(errorMessage);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner on unmount", err));
      }
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-500">
      <div className="bg-white  w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl relative border border-gray-100 ">
         
         <div className="p-8 border-b border-gray-50  flex items-center justify-between bg-gray-50/50 ">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-50  rounded-2xl flex items-center justify-center">
                  <Camera className="w-5 h-5 text-indigo-600 " />
               </div>
               <div>
                  <h3 className="text-xl font-semibold text-[#0F172A]  tracking-tight">Lens Scan Mode</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                     <Zap className="w-2.5 h-2.5 text-indigo-500" /> Real-time AR Decoder Active
                  </p>
               </div>
            </div>
            <button 
               onClick={onClose}
               className="w-10 h-10 bg-gray-100  hover:bg-gray-200  rounded-2xl flex items-center justify-center transition-all"
            >
               <X className="w-5 h-5 text-gray-400" />
            </button>
         </div>

         <div className="p-8 space-y-6">
            <div id="reader" className="w-full overflow-hidden rounded-[24px] border-4 border-dashed border-indigo-100 "></div>
            
            <div className="bg-indigo-50/50  p-5 rounded-3xl border border-indigo-100 ">
               <p className="text-xs text-indigo-800  font-medium leading-relaxed text-center">
                  Position the **Order QR Code** within the frame above. The system will automatically decode the secure reference and capture the fulfillment metadata.
               </p>
            </div>
         </div>

         <div className="p-6 bg-gray-50  text-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">
               Awaiting Digital Signature...
            </span>
         </div>
      </div>
    </div>
  );
}

