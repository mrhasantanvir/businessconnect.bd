"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Phone, X, PhoneOff, Mic, MicOff, User, Clock, 
  CheckCircle, Lock, Unlock, Coffee, LogOut, 
  ChevronDown, MessageSquare, Brain, Zap,
  AlertCircle
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { updateSipStatus, logAdvancedCall } from "@/app/merchant/sip/actions";
import { toast } from "sonner";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SipStatus = "OFFLINE" | "AVAILABLE" | "BREAK" | "MEAL" | "BUSY";

export function SipDialer({ userId, merchantStoreId }: { userId?: string, merchantStoreId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isActiveCall, setIsActiveCall] = useState(false);
  const [isIncoming, setIsIncoming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [number, setNumber] = useState("");
  const [status, setStatus] = useState<SipStatus>("OFFLINE");
  const [duration, setDuration] = useState(0);

  // Status Colors Mapping
  const statusColors = {
    AVAILABLE: "bg-emerald-500",
    BREAK: "bg-amber-500",
    MEAL: "bg-orange-500",
    BUSY: "bg-red-500",
    OFFLINE: "bg-gray-400"
  };

  // Timer for Active Call
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActiveCall) {
      timer = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(timer);
  }, [isActiveCall]);

  // Listen for Global Click-to-Call Event
  useEffect(() => {
    const handleDial = (e: any) => {
      setNumber(e.detail.number);
      setIsOpen(true);
      if (!isActiveCall) {
         // Auto-start call if configured?
      }
    };
    window.addEventListener("bc-dial", handleDial as EventListener);
    return () => window.removeEventListener("bc-dial", handleDial as EventListener);
  }, [isActiveCall]);

  const handleStatusChange = async (newStatus: SipStatus) => {
    setStatus(newStatus);
    if (userId) {
      const res = await updateSipStatus(userId, newStatus);
      if (res.success) toast.success(`Status updated to ${newStatus}`);
    }
  };

  const handleStartCall = () => {
    if (!number) return;
    setIsActiveCall(true);
    handleStatusChange("BUSY");
  };

  const handleEndCall = () => {
    startTransition(async () => {
      if (userId && merchantStoreId) {
        await logAdvancedCall({
          userId,
          merchantStoreId,
          from: "SIP_ENDPOINT",
          to: number || "UNKNOWN",
          duration,
          direction: isIncoming ? "INBOUND" : "OUTBOUND",
          transcription: "Simulated transcription: Customer satisfied with the response."
        });
      }
      setIsActiveCall(false);
      setIsIncoming(false);
      handleStatusChange("AVAILABLE");
      if (!isLocked) setIsOpen(false);
    });
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && !isLocked && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-[#1E40AF] text-white rounded-full shadow-[0_8px_40px_rgba(30,64,175,0.5)] flex items-center justify-center hover:scale-110 transition-all z-[1000] group"
        >
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20 group-hover:opacity-40" />
          <Phone className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          <div className={cn("absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white", statusColors[status])} />
        </button>
      )}

      {/* Main Softphone UI */}
      <div
        className={cn(
          "fixed bottom-6 right-6 w-[380px] bg-white  border border-gray-200  rounded-[40px] shadow-2xl flex flex-col overflow-hidden transition-all duration-500 z-[1001] transform origin-bottom-right",
          isOpen || isLocked ? "scale-100 opacity-100" : "scale-75 opacity-0 pointer-events-none"
        )}
      >
        {/* Header: Status & Controls */}
        <div className="p-6 border-b border-gray-100  flex items-center justify-between bg-gray-50/50 ">
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white  border border-gray-100  rounded-full shadow-sm hover:border-indigo-500 transition-all">
               <div className={cn("w-2 h-2 rounded-full", statusColors[status])} />
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 ">{status}</span>
               <ChevronDown size={12} className="text-gray-400" />
            </button>
            <div className="absolute top-full left-0 mt-2 w-40 bg-white  border border-gray-100  rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-10 p-2">
               {(["AVAILABLE", "BREAK", "MEAL", "BUSY", "OFFLINE"] as SipStatus[]).map(s => (
                 <button 
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-gray-50  flex items-center gap-2 transition-colors"
                 >
                    <div className={cn("w-1.5 h-1.5 rounded-full", statusColors[s])} /> {s}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setIsLocked(!isLocked)} 
               className={cn("p-2.5 rounded-xl transition-all", isLocked ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-gray-400 hover:bg-gray-100 ")}
             >
               {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
             </button>
             <button onClick={() => setIsOpen(false)} className="p-2.5 text-gray-400 hover:text-red-500 transition-colors">
               <X size={20} />
             </button>
          </div>
        </div>

        {/* Content Area */}
        {!isActiveCall && !isIncoming ? (
          <div className="p-8 flex flex-col items-center">
             <input 
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="01XXXXXXXXX" 
              className="w-full text-center text-4xl bg-transparent border-none outline-none font-black text-[#0F172A]  placeholder:text-gray-200 mb-10 tracking-tighter" 
            />
            
            <div className="grid grid-cols-3 gap-6 mb-12 w-full max-w-[280px]">
               {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((num) => (
                 <button 
                  key={num} 
                  onClick={() => setNumber(prev => prev + num)}
                  className="h-16 w-16 rounded-[24px] bg-gray-50  border border-gray-100  flex items-center justify-center text-2xl font-black text-gray-700  hover:bg-indigo-50  hover:border-indigo-200 transition-all active:scale-90"
                 >
                   {num}
                 </button>
               ))}
            </div>

            <button 
              onClick={handleStartCall}
              className="w-24 h-24 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-2xl shadow-green-200 hover:scale-110 active:scale-95 transition-all group relative"
            >
               <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20" />
               <Phone className="w-10 h-10 fill-current" />
            </button>
          </div>
        ) : (
          /* Active Call State */
          <div className="flex flex-col h-[560px] bg-white text-slate-900 animate-in slide-in-from-bottom-10 duration-500">
             <div className="p-10 text-center space-y-6">
                <div className="w-24 h-24 mx-auto relative group">
                   <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-emerald-400 rounded-[32px] animate-pulse blur-xl opacity-40 group-hover:opacity-70 transition-opacity" />
                   <div className="relative h-full w-full bg-white/10 backdrop-blur-xl rounded-[32px] border border-white/20 flex items-center justify-center text-3xl font-black shadow-2xl">
                      {number?.charAt(0) || "C"}
                   </div>
                </div>
                <div>
                   <h3 className="text-lg font-semibold tracking-tight">{number || "Incoming Guest"}</h3>
                   <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[#A1A1AA] text-[10px] font-black uppercase tracking-[0.3em]">
                        {isIncoming ? 'Incoming Request' : 'Active Discussion'}
                      </p>
                   </div>
                </div>
                <div className="flex items-center justify-center gap-3 bg-white/5 w-fit mx-auto px-6 py-2.5 rounded-full text-sm font-black border border-white/5 shadow-inner">
                   <Clock className="w-4 h-4 text-[#BEF264]" /> {formatTime(duration)}
                </div>
             </div>

             {/* AI Insights & Transcription Panel */}
             <div className="flex-1 px-8 space-y-6 overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-400 tracking-widest">
                   <Zap size={14} /> AI Live Intelligence
                </div>
                <div className="space-y-4">
                   <div className="p-5 bg-white/5 border border-white/10 rounded-3xl text-xs leading-relaxed font-bold text-gray-300 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                      "আমি জানতে চাচ্ছিলাম আমার অর্ডারটা কি আজকে পাঠানো হবে?"
                      <div className="mt-2 text-[8px] uppercase text-[#BEF264]/60">Transcription Active</div>
                   </div>
                   <div className="p-5 bg-indigo-600 rounded-3xl text-xs leading-relaxed font-black shadow-lg shadow-indigo-900/50">
                      "অবশ্যই স্যার, আপনার প্যাকেজটি বর্তমানে ডিসপ্যাচ হাবে আছে। আজ রাতের মধ্যেই ট্র্যাকিং কোড পেয়ে যাবেন।"
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2">
                      <Brain size={14} className="text-[#BEF264]" />
                      <div className="text-[9px] font-black uppercase">Sentiment: <span className="text-emerald-400">Positive</span></div>
                   </div>
                   <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2">
                      <MessageSquare size={14} className="text-blue-400" />
                      <div className="text-[9px] font-black uppercase">Auto Summary: <span className="text-gray-400">On</span></div>
                   </div>
                </div>
             </div>

             {/* Action Buttons */}
             <div className="p-10 flex items-center justify-center gap-8">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={cn("p-5 rounded-3xl transition-all border", isMuted ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-900" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10")}
                >
                  {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>
                <button 
                  onClick={handleEndCall}
                  className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-red-900 group"
                >
                  <PhoneOff className="w-9 h-9 fill-current group-hover:rotate-12 transition-transform" />
                </button>
             </div>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Global helper to trigger a call from anywhere in the app
 */
export const dialNumber = (number: string) => {
  window.dispatchEvent(new CustomEvent("bc-dial", { detail: { number } }));
};
