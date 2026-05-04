"use client";

import React, { useState, useTransition } from "react";
import { 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Disc as Disconnect
} from "lucide-react";
import { 
  updateGoogleSheetsSettingsAction, 
  disconnectGoogleSheetsAction,
  manualPushOrdersToSheetAction,
  importProductsFromSheetAction
} from "./actions";

export function GoogleSheetsSettingsForm({ config }: { config: any }) {
  const [isPending, startTransition] = useTransition();
  const [spreadsheetId, setSpreadsheetId] = useState(config?.spreadsheetId || "");
  const [sheetName, setSheetName] = useState(config?.sheetName || "Orders");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isConnected = config?.isActive && config?.refreshToken;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateGoogleSheetsSettingsAction({ spreadsheetId, sheetName });
      if (res.success) setMsg({ type: "success", text: "Spreadsheet configuration updated." });
    });
  };

  const handleManualSync = () => {
    startTransition(async () => {
      const res = await manualPushOrdersToSheetAction();
      if (res.success) {
        setMsg({ type: "success", text: `Successfully synced ${res.count} orders to Google Sheets.` });
      } else {
        setMsg({ type: "error", text: res.error || "Sync failed." });
      }
    });
  };

  const handlePullProducts = () => {
    if (!confirm("This will update existing products and add new ones from your Google Sheet 'Products' tab. Continue?")) return;
    startTransition(async () => {
      const res = await importProductsFromSheetAction();
      if (res.success) {
        setMsg({ type: "success", text: `Successfully imported/updated ${res.count} products from Google Sheets.` });
      } else {
        setMsg({ type: "error", text: res.error || "Import failed. Ensure you have a 'Products' tab with correct headers." });
      }
    });
  };

  const handleDisconnect = () => {
    if (!confirm("Are you sure you want to disconnect Google Sheets Access?")) return;
    startTransition(async () => {
      await disconnectGoogleSheetsAction();
      setMsg({ type: "success", text: "Google Sheets access revoked." });
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Connection Status */}
      <div className={`p-10 rounded-[48px] border flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all shadow-sm ${
        isConnected 
          ? "bg-emerald-50 border-emerald-100" 
          : "bg-gray-50 border-gray-100"
      }`}>
         <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner ${
              isConnected ? "bg-white text-emerald-600" : "bg-white text-gray-400"
            }`}>
               <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div>
               <h3 className="text-xl font-black uppercase tracking-tight">
                  {isConnected ? "Google Pipeline Active" : "Disconnected"}
               </h3>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-1">
                  {isConnected ? "Securely connected to your Google account" : "Authorize access to start syncing data"}
               </p>
            </div>
         </div>

         {!isConnected ? (
           <a 
             href="/api/auth/google/login"
             className="px-10 py-5 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center gap-2"
           >
              Connect Google Sheets <ArrowUpRight className="w-4 h-4" />
           </a>
         ) : (
           <button 
             onClick={handleDisconnect}
             className="px-10 py-5 bg-white text-red-600 border border-red-100 rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
           >
              Disconnect Access <Disconnect className="w-4 h-4" />
           </button>
         )}
      </div>

      {isConnected && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 2. Configuration Form */}
            <div className="bg-white  border border-[#E5E7EB]  rounded-[48px] p-10 space-y-8 shadow-sm">
               <div className="flex items-center gap-4 border-b border-gray-100  pb-6">
                  <div className="w-10 h-10 bg-indigo-50  rounded-xl flex items-center justify-center text-indigo-600">
                     <Database className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-lg font-black uppercase tracking-tight tracking-tight">Configuration</h3>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Mapping & Targets</p>
                  </div>
               </div>

               <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Google Spreadsheet ID</label>
                     <input 
                       value={spreadsheetId}
                       onChange={(e) => setSpreadsheetId(e.target.value)}
                       required
                       placeholder="e.g. 1aBC-dEf_gHiJkLmNoP" 
                       className="w-full px-6 py-5 bg-gray-50  border border-gray-100  rounded-[32px] text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100  transition-all font-mono"
                     />
                     <p className="text-[9px] text-gray-400 font-bold uppercase ml-2">Found in your sheet URL: https://docs.google.com/spreadsheets/d/<b>SpreadsheetID</b>/edit</p>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Sheet / Tab Name</label>
                     <input 
                       value={sheetName}
                       onChange={(e) => setSheetName(e.target.value)}
                       required
                       placeholder="Orders" 
                       className="w-full px-6 py-5 bg-gray-50  border border-gray-100  rounded-[32px] text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100  transition-all"
                     />
                  </div>

                  <button 
                    disabled={isPending}
                    className="w-full py-5 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                     {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Save Configuration"}
                  </button>
               </form>
            </div>

            {/* 3. Sync Tools */}
            <div className="bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 rounded-[48px] p-10 text-white space-y-8 shadow-2xl">
               <div className="flex items-center gap-4 pb-6 border-b border-white/20">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-lg font-black uppercase tracking-tight">Synchronization Portal</h3>
                     <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest leading-none mt-1">Real-time Data Exchange</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-xs text-indigo-100/60 font-bold uppercase tracking-widest leading-relaxed border-l-2 border-indigo-500/30 pl-4">
                     Export your centralized logistics data into your connected Google Spreadsheet for advanced reporting or external analysis.
                  </p>
                  
                  <button 
                    onClick={handleManualSync}
                    disabled={isPending || !spreadsheetId}
                    className="w-full py-5 bg-white text-[#0F172A] rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform active:scale-95 shadow-xl flex items-center justify-center gap-2"
                  >
                     {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Push Orders to Sheet"} <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={handlePullProducts}
                    disabled={isPending || !spreadsheetId}
                    className="w-full py-5 bg-indigo-500 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform active:scale-95 shadow-xl flex items-center justify-center gap-2 border border-indigo-400"
                  >
                     {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Pull Products from Sheet"} <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                     <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Sync Intelligence
                     </h4>
                     <ul className="text-[10px] space-y-2 text-indigo-100/80 font-black uppercase tracking-wider">
                        <li>• Syncs last 50 orders instantly</li>
                        <li>• Appends data to existing rows</li>
                        <li>• Maintains formatting & formulas</li>
                     </ul>
                  </div>
               </div>
            </div>
          </div>

          {msg && (
            <div className={`p-6 rounded-[32px] border text-xs font-bold font-black flex items-center gap-3 animate-in slide-in-from-bottom-4 ${
              msg.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
            }`}>
               {msg.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
               {msg.text}
            </div>
          )}
        </>
      )}
    </div>
  );
}

