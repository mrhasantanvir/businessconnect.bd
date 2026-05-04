"use client";

import React, { useState, useEffect } from "react";
import { 
  Zap, RefreshCw, CheckCircle2, AlertTriangle, 
  Terminal, Activity, ShieldCheck, History
} from "lucide-react";
import { 
  checkSystemUpdateAction, 
  deploySystemUpdateAction, 
  getSystemLogsAction 
} from "@/app/admin/system/actions";
import { toast } from "sonner";

export default function SystemUpdateWidget() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState("");

  const checkUpdate = async () => {
    setLoading(true);
    const res = await checkSystemUpdateAction();
    if (res.success) {
      setStatus(res);
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!confirm("This will pull the latest code and rebuild the production server. Proceed?")) return;
    
    setUpdating(true);
    toast.info("Deployment started... This may take a few minutes.");
    
    const res = await deploySystemUpdateAction();
    if (res.success) {
      toast.success("System updated successfully!");
      checkUpdate();
    } else {
      toast.error("Deployment failed: " + res.error);
    }
    setUpdating(false);
  };

  const fetchLogs = async () => {
    const res = await getSystemLogsAction();
    if (res.success) setLogs(res.logs);
    setShowLogs(true);
  };

  useEffect(() => {
    checkUpdate();
  }, []);

  return (
    <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-700" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
            status?.isUpdateAvailable ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-500 text-white'
          }`}>
             {status?.isUpdateAvailable ? <Zap className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">System <span className="text-indigo-600">Pulse</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Core Engine Orchestration</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={checkUpdate}
             className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all"
           >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
           </button>
           <button 
             onClick={fetchLogs}
             className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
           >
              <Terminal className="w-4 h-4" /> Logs
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Local Build</span>
            <code className="text-xs font-black text-slate-600">#{status?.localHash || '-------'}</code>
         </div>
         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Stable Release</span>
            <code className="text-xs font-black text-indigo-600">#{status?.remoteHash || '-------'}</code>
         </div>
      </div>

      {status?.isUpdateAvailable ? (
        <div className="space-y-6">
           <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">
                A new stable build has been verified on the staging environment. Apply the update to sync the production server.
              </p>
           </div>
           <button 
             onClick={handleUpdate}
             disabled={updating}
             className="w-full py-5 bg-[#0F172A] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
           >
              {updating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              {updating ? "Executing Deployment..." : "Apply Live Update Now"}
           </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
           <CheckCircle2 className="w-5 h-5 text-emerald-500" />
           <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
             System is running on the latest stable build. No updates required.
           </p>
        </div>
      )}

      {/* Log Modal Overlay */}
      {showLogs && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-[#0F172A] w-full max-w-2xl rounded-[32px] p-8 border border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3 text-white">
                    <History className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Deployment Logs</h3>
                 </div>
                 <button onClick={() => setShowLogs(false)} className="text-slate-500 hover:text-white transition-colors">
                    <Activity className="w-5 h-5" />
                 </button>
              </div>
              <div className="bg-slate-950/50 rounded-2xl p-6 h-96 overflow-y-auto font-mono text-[10px] text-emerald-400 no-scrollbar border border-slate-800">
                 <pre className="whitespace-pre-wrap">{logs || "Waiting for output..."}</pre>
              </div>
              <button 
                onClick={() => setShowLogs(false)}
                className="w-full mt-6 py-4 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
              >
                 Close Terminal
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
