"use client";

import React, { useState, useTransition } from "react";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { stockInAction } from "../actions";
import { 
  ArrowUpCircle, 
  History, 
  AlertCircle, 
  CheckCircle2,
  Box,
  Truck
} from "lucide-react";

export default function StockInPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [batchLogs, setBatchLogs] = useState<any[]>([]);
  const [binLocation, setBinLocation] = useState("");

  const handleScan = (barcode: string) => {
    setError(null);
    startTransition(async () => {
      const res = await stockInAction(barcode, 1, undefined, binLocation); // Pass binLocation
      if (res.success) {
        setLastScanned(res);
        setBatchLogs(prev => [{
          id: Date.now(),
          name: res.productName,
          barcode,
          time: new Date().toLocaleTimeString(),
          status: "SUCCESS"
        }, ...prev]);
        
        // Play success sound if needed
      } else {
        setError(res.error || "Unknown error");
        // Play error sound
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-gray-100 ">
         <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]  uppercase">
               Inventory <span className="text-indigo-600">Inbound</span>
            </h1>
            <p className="text-[#64748B]  text-sm font-bold mt-2 uppercase tracking-widest flex items-center gap-2">
               <Truck className="w-4 h-4 text-indigo-500" /> Procurement & Warehouse Receiving
            </p>
         </div>
         
          <div className="flex items-center gap-4 bg-white  border border-gray-100  rounded-[32px] px-6 py-4">
             <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Current Bin</label>
                <input 
                  type="text" 
                  placeholder="Set Bin (e.g. A1)" 
                  value={binLocation}
                  onChange={(e) => setBinLocation(e.target.value)}
                  className="bg-transparent text-sm font-bold outline-none text-[#0F172A]  placeholder:text-gray-300"
                />
             </div>
             <button 
               onClick={() => setIsScanning(true)}
               className="px-8 py-3 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95 group"
             >
                <ArrowUpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Scan
             </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Live Status Card */}
         <div className="lg:col-span-2 space-y-8">
            {error && (
               <div className="p-8 bg-red-50 border border-red-100 rounded-[40px] flex items-center gap-6 animate-in slide-in-from-top-4">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                     <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                     <h4 className="text-sm font-bold text-red-900 uppercase">Input Failed</h4>
                     <p className="text-xs text-red-600 font-bold mt-1 uppercase tracking-tight">{error}</p>
                  </div>
               </div>
            )}

            {lastScanned ? (
               <div className="p-10 bg-white  border border-gray-100  rounded-[48px] shadow-soft relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#BEF264]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                  
                  <div className="flex items-center gap-8 relative z-10">
                     <div className="w-24 h-24 bg-[#F8F9FA]  rounded-[32px] flex items-center justify-center shadow-inner border border-white/10 shrink-0">
                        <Box className="w-12 h-12 text-indigo-500" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="px-3 py-1 bg-[#BEF264]/20 text-[#65A30D] rounded-full text-[10px] font-bold uppercase tracking-widest">Received</span>
                           <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Ref: #PRO-{Date.now().toString().slice(-6)}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-[#0F172A]  uppercase tracking-tight leading-none">
                           {lastScanned.productName}
                        </h2>
                        <div className="mt-4 flex items-center gap-6">
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity Added</p>
                              <p className="text-xl font-bold text-indigo-600">+1 Unit</p>
                           </div>
                           <div className="w-px h-10 bg-gray-100" />
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Stock</p>
                              <p className="text-xl font-bold text-[#0F172A] ">{lastScanned.newTotal} Units</p>
                           </div>
                        </div>
                     </div>
                     <div className="hidden lg:flex flex-col items-center justify-center p-6 bg-gray-50  rounded-[32px] border border-gray-100">
                        <CheckCircle2 className="w-10 h-10 text-[#65A30D]" />
                        <span className="text-[9px] font-bold uppercase text-gray-400 mt-2">Verified</span>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="h-64 border-2 border-dashed border-gray-100  rounded-[48px] flex flex-col items-center justify-center text-center p-12 opacity-50">
                  <History className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No active scan session. Click button to begin.</p>
               </div>
            )}

            {/* Batch List */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#64748B]">Batch Session Log</h3>
                  <span className="text-[10px] font-bold text-indigo-500">{batchLogs.length} Items Proccessed</span>
               </div>
               
               <div className="bg-white  border border-gray-100  rounded-[40px] overflow-hidden shadow-sm">
                  <div className="divide-y divide-gray-50 ">
                     {batchLogs.map((log) => (
                        <div key={log.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-50  rounded-xl flex items-center justify-center">
                                 <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-[#0F172A]  uppercase leading-none mb-1">{log.name}</p>
                                 <p className="text-[10px] font-bold text-gray-400 tracking-tight uppercase">{log.barcode}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-[#0F172A] ">{log.time}</p>
                              <p className="text-[9px] font-bold text-[#65A30D] uppercase tracking-widest mt-0.5">Logged</p>
                           </div>
                        </div>
                     ))}
                     {batchLogs.length === 0 && (
                        <div className="p-12 text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">Waiting for session start...</div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Instructions Card */}
         <div className="space-y-6">
            <div className="p-10 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-[48px] shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/50 to-transparent" />
               <div className="relative z-10">
                  <h3 className="text-lg font-bold uppercase tracking-tight">Best Practice <br/><span className="text-indigo-400">Inventory Sync</span></h3>
                  <ul className="mt-8 space-y-6">
                     <li className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold">01</div>
                        <p className="text-xs font-bold leading-relaxed text-gray-300 uppercase tracking-tight">Ensure lighting is uniform to reduce optical reflection on glossy barcodes.</p>
                     </li>
                     <li className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold">02</div>
                        <p className="text-xs font-bold leading-relaxed text-gray-300 uppercase tracking-tight">Wait for the green "Verified" pulse before moving to the next item.</p>
                     </li>
                     <li className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold">03</div>
                        <p className="text-xs font-bold leading-relaxed text-gray-300 uppercase tracking-tight">Use HID industrial scanners for high-volume high-speed procurement.</p>
                     </li>
                  </ul>
               </div>
            </div>
            
            <div className="p-8 border border-gray-100  rounded-[40px] bg-white ">
               <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Supported Formats</h4>
               <div className="grid grid-cols-2 gap-4">
                  {['QR Code', 'Code 128', 'EAN-13', 'UPC-A'].map(format => (
                     <div key={format} className="p-3 bg-gray-50  rounded-2xl flex items-center justify-center text-[9px] font-bold uppercase text-gray-600 ">
                        {format}
                     </div>
                  ))}
               </div>
            </div>
         </div>

      </div>

      {/* Scanner Modal Overlay */}
      {isScanning && (
        <BarcodeScanner 
          onScan={handleScan}
          onClose={() => setIsScanning(false)}
          title="Stock Procurement Scanner"
        />
      )}
    </div>
  );
}

