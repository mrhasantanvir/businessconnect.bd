"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Camera, Keyboard, AlertCircle } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose?: () => void;
  title?: string;
}

/**
 * Unified Barcode/QR Scanner Component
 * Supports both camera-based scanning and manual keyboard input (for HID hardware scanners).
 */
export function BarcodeScanner({ onScan, onClose, title = "Scan Item Barcode" }: BarcodeScannerProps) {
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize Scanner on mount
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A
        ]
      },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        // We don't stop automatically to allow batch scanning
      },
      (errorMessage) => {
        // Ignored to avoid noise
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [onScan]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[1000] flex flex-col items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300">
      
      {/* Container */}
      <div className="w-full max-w-xl bg-white  rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(30,64,175,0.2)] flex flex-col relative border border-gray-100 ">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100  flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F1F5F9]  rounded-2xl flex items-center justify-center">
                 <Camera className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                 <h3 className="text-lg font-black tracking-tight text-[#0F172A]  uppercase">{title}</h3>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">AI-Powered Optical Recognition</p>
              </div>
           </div>
           
           {onClose && (
             <button 
               onClick={onClose}
               className="p-3 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
             >
                <X className="w-6 h-6" />
             </button>
           )}
        </div>

        {/* Scanner Viewport */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
           <div id="reader" className="w-full h-full" />
           {/* Custom Overlay for better UX */}
           <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20 flex items-center justify-center">
              <div className="w-64 h-32 border-2 border-indigo-500 rounded-2xl relative shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                 {/* Scanning Line Animation */}
                 <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500 animate-[scan_2s_ease-in-out_infinite] opacity-50" />
              </div>
           </div>
        </div>

        {/* Manual Input Fallback */}
        <div className="p-8 bg-gray-50/50  border-t border-gray-100 ">
           <div className="flex items-center gap-3 mb-4 text-[#A1A1AA]">
              <Keyboard className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Manual Input / Hardware Scanner</span>
           </div>
           
           <form onSubmit={handleManualSubmit} className="flex gap-3">
              <input 
                 value={manualInput}
                 onChange={(e) => setManualInput(e.target.value)}
                 autoFocus
                 placeholder="Type or scan manually..."
                 className="flex-1 bg-white  border border-gray-200  rounded-2xl py-4 px-6 text-sm font-bold shadow-inner outline-none focus:border-indigo-500 transition-all"
              />
              <button 
                type="submit"
                className="px-8 bg-white text-slate-900 text-slate-900 border border-slate-100 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
              >
                 Enter
              </button>
           </form>
           
           <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#BEF264] rounded-full animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-tighter text-gray-400">Ready for Scanners, QR, and Barcodes (128, 39, EAN)</p>
           </div>
        </div>

      </div>

      <style jsx global>{`
        #reader__dashboard { display: none !important; }
        #reader__status_span { display: none !important; }
        #reader video { 
          object-fit: cover !important; 
          border-radius: 0px !important; 
        }
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}
