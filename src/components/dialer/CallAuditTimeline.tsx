"use client";

import React, { useState, useTransition } from "react";
import { 
  Play, Pause, Star, MessageSquare, Clock, 
  User, CheckCircle, ShieldCheck, Download,
  Volume2
} from "lucide-react";
import { auditCallLog } from "@/app/merchant/sip/actions";
import { toast } from "sonner";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CallLog {
  id: string;
  from: string;
  to: string;
  duration: number;
  direction: string;
  createdAt: string | Date;
  recordingUrl?: string | null;
  aiSummary?: string | null;
  sentiment?: string | null;
  auditNote?: string | null;
  rating?: number | null;
  user?: { name: string | null } | null;
}

export function CallAuditTimeline({ logs, auditorId }: { logs: CallLog[], auditorId: string }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(0);
  const [isPending, startTransition] = useTransition();

   const [mounted, setMounted] = useState(false);
   React.useEffect(() => setMounted(true), []);

  const handleAuditSubmit = (logId: string) => {
    startTransition(async () => {
      const res = await auditCallLog({
        logId,
        auditNote: note,
        rating,
        auditorId
      });
      if (res.success) {
        toast.success("Audit submitted successfully");
        setEditingId(null);
      } else {
        toast.error("Failed to submit audit");
      }
    });
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 relative">
      <div className="absolute top-0 left-6 h-full w-0.5 bg-white/5 -z-0" />
      
      {logs.map((log, idx) => (
        <div key={log.id} className="relative z-10 flex items-start gap-8 group">
          {/* Status Icon */}
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all border shadow-lg",
            idx === 0 ? "bg-indigo-600 border-indigo-400 text-white" : "bg-white/5 border-white/10 text-gray-400"
          )}>
            <Clock size={20} />
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BEF264]">
                    {log.direction === 'ACTIVITY' ? ((log as any).type?.replace(/_/g, ' ') || "SYSTEM ACTIVITY") : (log.duration > 0 ? "Interaction" : "Missed Call")}
                  </h4>
                  <p className="text-[9px] font-mono text-gray-500 mt-1">
                    {mounted ? new Date(log.createdAt).toLocaleString('en-US') : "---"} • Staff: {log.user?.name || "System"}
                  </p>
               </div>
               <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      size={10} 
                      className={cn(s <= (log.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-600")} 
                    />
                  ))}
               </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-6 overflow-hidden transition-all hover:bg-white/[0.07]">
               {/* Content Section */}
               {log.direction === 'ACTIVITY' ? (
                  <div className="space-y-2">
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#BEF264] tracking-widest">
                        <ShieldCheck size={12} /> System Event
                     </div>
                     <p className="text-sm text-gray-300 font-bold leading-relaxed">
                        {(log as any).message || "System activity recorded."}
                     </p>
                  </div>
               ) : (
                  <>
                    {/* Player Section */}
                    <div className="flex items-center gap-6">
                        <button 
                          onClick={() => setPlayingId(playingId === log.id ? null : log.id)}
                          className="w-14 h-14 rounded-full bg-[#BEF264] text-green-900 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
                        >
                          {playingId === log.id ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                        </button>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                              <span>{playingId === log.id ? "Streaming..." : "Ready to Audit"}</span>
                              <span>{formatDuration(log.duration)}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                              <div className={cn("h-full bg-[#BEF264] transition-all duration-300", playingId === log.id ? "w-1/3 animate-pulse" : "w-0")} />
                          </div>
                        </div>
                        <a 
                          href={`/api/calls/stream/${log.id}`} 
                          download 
                          className="p-3 bg-white text-slate-900 text-slate-900/10 rounded-xl text-white hover:bg-white/20 transition-all"
                        >
                          <Download size={16} />
                        </a>
                    </div>

                    {/* Hidden Audio Element for actual playback */}
                    {playingId === log.id && (
                        <audio 
                          autoPlay 
                          src={`/api/calls/stream/${log.id}`} 
                          onEnded={() => setPlayingId(null)}
                          className="hidden"
                        />
                    )}

                    {/* AI Intelligence Summary */}
                    {log.aiSummary && (
                        <div className="pt-4 border-t border-white/5">
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-indigo-400 tracking-widest mb-2">
                              <ShieldCheck size={12} /> Intelligence Summary
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed font-bold">
                              "{log.aiSummary}"
                          </p>
                        </div>
                    )}
                  </>
               )}

               {/* Audit Notes Display/Edit */}
               <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-[9px] font-black uppercase text-amber-400 tracking-widest">
                        <MessageSquare size={12} /> Audit Observations
                     </div>
                     <button 
                        onClick={() => {
                           setEditingId(log.id);
                           setNote(log.auditNote || "");
                           setRating(log.rating || 0);
                        }}
                        className="text-[9px] font-black uppercase text-gray-500 hover:text-white"
                     >
                        Edit Audit
                     </button>
                  </div>
                  
                  {editingId === log.id ? (
                     <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <textarea 
                           value={note}
                           onChange={(e) => setNote(e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-all"
                           placeholder="Describe staff performance, tone, and accuracy..."
                           rows={3}
                        />
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button 
                                  key={s} 
                                  onClick={() => setRating(s)}
                                  className="transition-all hover:scale-125"
                                >
                                   <Star 
                                     size={18} 
                                     className={cn(s <= rating ? "text-yellow-400 fill-current" : "text-gray-600")} 
                                   />
                                </button>
                              ))}
                           </div>
                           <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setEditingId(null)}
                                className="px-4 py-2 text-[9px] font-black uppercase text-gray-500"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleAuditSubmit(log.id)}
                                disabled={isPending}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                              >
                                {isPending ? "Saving..." : "Save Audit"}
                              </button>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <p className="text-xs text-gray-300 font-bold leading-relaxed">
                        {log.auditNote || "No audit notes recorded for this interaction yet."}
                     </p>
                  )}
               </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
