"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Activity, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StaffTimerDashboard() {
  const [isTracking, setIsTracking] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activity, setActivity] = useState({ hits: 0, clicks: 0 });
  const [currentTask, setCurrentTask] = useState("");
  
  // Ref for timer interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor activity
  useEffect(() => {
    const handleKeyDown = () => setActivity(prev => ({ ...prev, hits: prev.hits + 1 }));
    const handleMouseClick = () => setActivity(prev => ({ ...prev, clicks: prev.clicks + 1 }));

    if (isTracking) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("mousedown", handleMouseClick);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseClick);
    };
  }, [isTracking]);

  // Timer logic
  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 min-h-screen bg-[#F8FAFC]">
      {/* Timer Section */}
      <div className="bg-white border-2 border-[#0F172A] rounded-[2px] p-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="text-center md:text-left space-y-2">
              <h1 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Session</h1>
              <div className="text-6xl md:text-8xl font-black text-[#0F172A] tracking-tighter tabular-nums">
                 {formatTime(seconds)}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 <div className={cn("w-2 h-2 rounded-full", isTracking ? "bg-green-500 animate-pulse" : "bg-gray-300")} />
                 {isTracking ? "Live Tracking Active" : "Session Paused"}
              </div>
           </div>

           <div className="flex items-center gap-3">
              {!isTracking ? (
                <button 
                   onClick={() => setIsTracking(true)}
                   className="flex items-center gap-3 bg-[#1E40AF] text-white px-8 py-4 text-xs font-black uppercase tracking-widest rounded-[2px] hover:bg-[#1E3A8A] transition-all"
                >
                   <Play className="w-4 h-4 fill-current" /> Start Work
                </button>
              ) : (
                <>
                  <button 
                     onClick={() => setIsTracking(false)}
                     className="flex items-center gap-3 bg-amber-500 text-white px-8 py-4 text-xs font-black uppercase tracking-widest rounded-[2px] hover:bg-amber-600 transition-all"
                  >
                     <Pause className="w-4 h-4 fill-current" /> Pause
                  </button>
                  <button 
                     className="flex items-center gap-3 bg-red-600 text-white px-4 py-4 text-xs font-black uppercase tracking-widest rounded-[2px] hover:bg-red-700 transition-all"
                  >
                     <Square className="w-4 h-4 fill-current" />
                  </button>
                </>
              )}
           </div>
        </div>

        {/* Task Input */}
        <div className="mt-8 pt-8 border-t border-gray-100">
           <div className="relative">
              <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input 
                 placeholder="What are you working on right now?" 
                 className="w-full bg-gray-50 border border-gray-200 rounded-[2px] pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:border-[#1E40AF] focus:ring-0 transition-all"
                 value={currentTask}
                 onChange={(e) => setCurrentTask(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-gray-100 rounded-[2px] shadow-sm">
           <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[#1E40AF]" />
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Real-time Activity</h3>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-end">
                 <span className="text-2xl font-black text-[#0F172A]">{activity.hits + activity.clicks}</span>
                 <span className="text-[10px] font-bold text-gray-400">Total Inputs</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                 <div className="bg-[#1E40AF] h-full transition-all duration-1000" style={{ width: '65%' }} />
              </div>
              <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase">
                 <span>Keys: {activity.hits}</span>
                 <span>Mouse: {activity.clicks}</span>
              </div>
           </div>
        </div>

        <div className="bg-white p-6 border border-gray-100 rounded-[2px] shadow-sm">
           <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-green-500" />
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Today's Summary</h3>
           </div>
           <div className="space-y-3">
              <div className="flex justify-between items-center">
                 <span className="text-[11px] font-bold text-gray-500">Total Hours</span>
                 <span className="text-[11px] font-black text-[#0F172A]">06h 45m</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[11px] font-bold text-gray-500">Break Time</span>
                 <span className="text-[11px] font-black text-gray-400">45m</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                 <span className="text-[11px] font-black text-green-600">Earnings</span>
                 <span className="text-[11px] font-black text-green-600">৳1,250.00</span>
              </div>
           </div>
        </div>

        <div className="bg-white p-6 border border-gray-100 rounded-[2px] shadow-sm flex flex-col justify-between">
           <div>
              <div className="flex items-center gap-2 mb-4">
                 <Calendar className="w-4 h-4 text-indigo-500" />
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Leave Status</h3>
              </div>
              <div className="flex items-center gap-3">
                 <div className="text-center flex-1">
                    <p className="text-lg font-black text-[#0F172A]">12</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">Casual</p>
                 </div>
                 <div className="w-px h-8 bg-gray-100" />
                 <div className="text-center flex-1">
                    <p className="text-lg font-black text-[#0F172A]">08</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">Sick</p>
                 </div>
              </div>
           </div>
           <button className="mt-4 w-full py-2 border border-indigo-100 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-[2px] hover:bg-indigo-100 transition-all">
              Request Leave
           </button>
        </div>
      </div>
    </div>
  );
}
