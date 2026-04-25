"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, Square, Clock, Activity, Shield } from "lucide-react";
import { startWorkAction, stopWorkAction, recordActivityFrameAction, getStaffProfileByUserIdAction } from "@/app/merchant/staff/actions";
import { toast } from "sonner";

export function StaffTracker({ userId, merchantStoreId }: { userId: string, merchantStoreId: string }) {
  const [isActive, setIsActive] = useState(false);
  const [logId, setLogId] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [stats, setStats] = useState({ hits: 0, clicks: 0 });
  const [profileId, setProfileId] = useState<string | null>(null);

  // Load Profile and active session
  useEffect(() => {
    async function init() {
       const profile = await getStaffProfileByUserIdAction(userId);
       if (profile) {
          setProfileId(profile.id);
          
          const saved = localStorage.getItem(`BC_STAFF_SESSION_${userId}`);
          if (saved) {
            const { id, startAt } = JSON.parse(saved);
            setLogId(id);
            setIsActive(true);
            const elapsed = Math.floor((Date.now() - new Date(startAt).getTime()) / 1000);
            setSeconds(elapsed > 0 ? elapsed : 0);
          }
       }
    }
    init();
  }, [userId]);

  // Timer & Activity Logging
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let activityLogger: NodeJS.Timeout;

    if (isActive && logId) {
      timer = setInterval(() => setSeconds(s => s + 1), 1000);
      
      activityLogger = setInterval(async () => {
         const currentStats = { ...stats };
         await recordActivityFrameAction(logId, { 
            hits: currentStats.hits, 
            clicks: currentStats.clicks 
         });
         setStats({ hits: 0, clicks: 0 });
      }, 5 * 60 * 1000);
    }

    return () => {
      clearInterval(timer);
      clearInterval(activityLogger);
    };
  }, [isActive, logId]);

  // Detect basic activity
  useEffect(() => {
    if (!isActive) return;

    const handleKey = () => setStats(s => ({ ...s, hits: s.hits + 1 }));
    const handleClick = () => setStats(s => ({ ...s, clicks: s.clicks + 1 }));

    window.addEventListener("keydown", handleKey);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("click", handleClick);
    };
  }, [isActive]);

  const handleStart = async () => {
    if (!profileId) return toast.error("Staff profile not found");
    try {
       const log = await startWorkAction(profileId);
       if (log && log.id) {
         setLogId(log.id);
         setIsActive(true);
         setSeconds(0);
         localStorage.setItem(`BC_STAFF_SESSION_${userId}`, JSON.stringify({
           id: log.id,
           startAt: new Date()
         }));
         toast.success("Work session started");
       }
    } catch (err: any) {
       toast.error(err.message || "Failed to start session");
    }
  };

  const handleStop = async () => {
    if (!logId) return;
    try {
       await stopWorkAction(logId);
       setIsActive(false);
       setLogId(null);
       setSeconds(0);
       localStorage.removeItem(`BC_STAFF_SESSION_${userId}`);
       toast.info("Session completed and synced");
    } catch (err: any) {
       toast.error(err.message);
    }
  };

  const formatTime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!profileId) return null; // Don't show tracker for non-staff

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      <div className={`bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl p-4 transition-all duration-300 w-64 overflow-hidden ${isActive ? 'ring-2 ring-indigo-500' : ''}`}>
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-indigo-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                {isActive ? 'Tracking Active' : 'System Idle'}
              </span>
           </div>
           <Shield size={14} className="text-[#A1A1AA]" />
        </div>

        <div className="text-center py-4 bg-gray-50 rounded-xl mb-4">
           <div className="text-2xl font-black font-mono tracking-tighter text-[#0F172A]">
              {formatTime(seconds)}
           </div>
           <div className="text-[9px] font-bold text-[#A1A1AA] uppercase mt-1 tracking-widest">Total Worked Today</div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
           <div className="p-2 bg-gray-50 rounded-lg text-center">
              <div className="text-xs font-bold text-[#0F172A]">{stats.hits + stats.clicks}</div>
              <div className="text-[8px] text-[#A1A1AA] uppercase font-bold">Activity</div>
           </div>
           <div className="p-2 bg-gray-50 rounded-lg text-center">
              <div className="text-xs font-bold text-[#0F172A]">5m</div>
              <div className="text-[8px] text-[#A1A1AA] uppercase font-bold">Frame</div>
           </div>
        </div>

        {isActive ? (
          <button 
            onClick={handleStop}
            className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-700 transition-all"
          >
            <Square size={14} fill="currentColor" /> Stop Work Session
          </button>
        ) : (
          <button 
            onClick={handleStart}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition-all"
          >
            <Play size={14} fill="currentColor" /> Start Work Session
          </button>
        )}
      </div>
    </div>
  );
}
