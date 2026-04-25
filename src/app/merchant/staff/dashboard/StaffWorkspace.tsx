"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Square, 
  Clock, 
  Zap, 
  Target, 
  BarChart3, 
  ArrowUpRight, 
  ShieldCheck, 
  Timer, 
  Eye, 
  MousePointer2, 
  Keyboard,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  PhoneCall,
  Truck
} from "lucide-react";
import { startWorkAction, stopWorkAction, recordActivityFrameAction } from "../actions";

export default function StaffWorkspace({ profile, activeLog: initialLog }: { profile: any, activeLog: any }) {
  const [activeLog, setActiveLog] = useState(initialLog);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activityScore, setActivityScore] = useState(initialLog?.activityScore || 0);
  const [interactions, setInteractions] = useState({ hits: 0, clicks: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (activeLog) {
      const start = new Date(activeLog.startTime).getTime();
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - start) / 1000));
      }, 1000);

      // Frame recording logic (every 5 mins)
      frameRef.current = setInterval(async () => {
         if (activeLog.id === "preview-log") {
            setActivityScore(Math.floor(Math.random() * 20) + 80);
            setInteractions({ hits: 0, clicks: 0 });
            return;
         }
         // This is a simulation for demo, normally would track real events
         const frame = await recordActivityFrameAction(activeLog.id, { 
            hits: interactions.hits, 
            clicks: interactions.clicks 
         });
         setActivityScore(frame.currentScore);
         setInteractions({ hits: 0, clicks: 0 });
      }, 300000); 
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (frameRef.current) clearInterval(frameRef.current);
      setElapsedTime(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (frameRef.current) clearInterval(frameRef.current);
    };
  }, [activeLog]);

  // Handle Work Start/Stop
  const toggleWork = async () => {
    if (profile.id === "preview-id") {
       if (activeLog) {
          setActiveLog(null);
       } else {
          setActiveLog({
             id: "preview-log",
             startTime: new Date(),
             activityScore: 90
          });
       }
       return;
    }

    if (activeLog) {
      await stopWorkAction(activeLog.id);
      setActiveLog(null);
    } else {
      const log = await startWorkAction(profile.id);
      setActiveLog(log);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-8 animate-in fade-in duration-1000">
      
      {/* Upper Status Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white border-4 border-indigo-100 rounded-[24px] flex items-center justify-center shadow-xl shadow-indigo-100 overflow-hidden group">
               <img src={profile.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.user.name}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            </div>
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">{profile.user.name}<span className="text-indigo-600">.</span>NODE</h1>
               <div className="flex items-center gap-2 mt-1">
                  <div className="px-3 py-1 bg-slate-900 text-[#BEF264] text-[9px] font-black uppercase tracking-widest rounded-full">{profile.jobRole}</div>
                  <div className={`w-2 h-2 rounded-full ${activeLog ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{activeLog ? 'Live Session Active' : 'Offline'}</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className={`p-6 bg-white border-2 rounded-[32px] transition-all flex flex-col items-center min-w-[240px] shadow-sm ${activeLog ? 'border-emerald-500 shadow-lg shadow-emerald-50' : 'border-slate-100'}`}>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Timer className="w-3 h-3" /> Session Timer
               </p>
               <p className={`text-4xl font-black tracking-tighter italic ${activeLog ? 'text-emerald-600' : 'text-slate-300'}`}>
                  {formatTime(elapsedTime)}
               </p>
            </div>
            <button 
               onClick={toggleWork}
               className={`w-20 h-20 rounded-[32px] flex items-center justify-center transition-all shadow-2xl group active:scale-95 ${activeLog ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-100' : 'bg-slate-900 hover:bg-black shadow-slate-200'}`}
            >
               {activeLog ? <Square className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-[#BEF264] fill-current" />}
            </button>
         </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* Left Column: Metrics (8 Cols) */}
         <div className="lg:col-span-8 space-y-8">
            
            {/* Real-time Pulse Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <div className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm group hover:border-indigo-200 transition-all">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                     <Zap className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Efficiency Score</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{activityScore.toFixed(0)}%</p>
                  <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${activityScore}%` }} />
                  </div>
               </div>

               <div className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm group hover:border-[#BEF264] transition-all">
                  <div className="w-12 h-12 bg-[#BEF264]/20 rounded-2xl flex items-center justify-center text-green-700 mb-6 group-hover:scale-110 transition-transform">
                     <BarChart3 className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Pending Commission</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter italic">৳4,250</p>
                  <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                     <ArrowUpRight className="w-3 h-3" /> 12% Growth this week
                  </div>
               </div>

               <div className="p-8 bg-slate-900 text-white rounded-[40px] shadow-2xl shadow-indigo-100 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 bg-indigo-600/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#BEF264] mb-6 relative z-10">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic relative z-10">Compliance Level</p>
                  <p className="text-4xl font-black text-white tracking-tighter italic relative z-10 uppercase">High</p>
                  <div className="mt-4 flex items-center gap-2 relative z-10">
                     <div className="px-3 py-1 bg-[#BEF264] text-slate-900 text-[9px] font-black uppercase tracking-tight rounded-full">Secure Node</div>
                  </div>
               </div>
            </div>

            {/* Performance Visualization Simulation */}
            <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-sm overflow-hidden relative group">
               <div className="absolute top-0 right-0 p-16 bg-indigo-50/50 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Activity Pulse</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Interactions tracked via background engine</p>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                           <Keyboard className="w-4 h-4 text-slate-300" />
                           <span className="text-[11px] font-black text-slate-900 uppercase">{interactions.hits} Keys</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <MousePointer2 className="w-4 h-4 text-slate-300" />
                           <span className="text-[11px] font-black text-slate-900 uppercase">{interactions.clicks} Clicks</span>
                        </div>
                     </div>
                  </div>

                  <div className="h-64 flex items-end gap-2 px-2">
                     {/* Simulating a graph */}
                     {[40, 65, 45, 80, 55, 90, 75, 40, 60, 85, 30, 50, 70, 95, 60].map((val, i) => (
                        <div key={i} className="flex-1 bg-slate-50 rounded-t-xl relative group/bar hover:bg-indigo-100 transition-all cursor-crosshair">
                           <div 
                              className={`absolute bottom-0 left-0 right-0 rounded-t-xl transition-all duration-1000 ${val > 80 ? 'bg-indigo-600' : 'bg-slate-300 group-hover/bar:bg-indigo-400'}`} 
                              style={{ height: `${val}%` }} 
                           />
                        </div>
                     ))}
                  </div>
               </div>
            </div>

         </div>

         {/* Right Column: Tasks & Intelligence (4 Cols) */}
         <div className="lg:col-span-4 space-y-8">
            
            {/* Smart To-do Card */}
            <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm relative overflow-hidden">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                     <Target className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic text-lg leading-none">Today's Missions</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">High priority task queue</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {[
                     { task: "Fulfill Order #8273", icon: Truck, color: "text-blue-500", bg: "bg-blue-50" },
                     { task: "Call Customer Robin", icon: PhoneCall, color: "text-purple-500", bg: "bg-purple-50" },
                     { task: "Inventory Check-in", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
                     { task: "Approve 12 Returns", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
                  ].map((item, idx) => (
                     <div key={idx} className="p-5 bg-slate-50/50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:bg-white hover:border-slate-200 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.bg} ${item.color}`}>
                              <item.icon className="w-5 h-5" />
                           </div>
                           <span className="text-xs font-black text-slate-700 uppercase tracking-tight group-hover:text-slate-900 transition-colors">{item.task}</span>
                        </div>
                        <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
                           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Earnings Intelligence Card */}
            <div className="p-10 bg-indigo-600 text-white rounded-[48px] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-24 bg-white/10 rounded-full blur-[80px] transform translate-x-1/3 -translate-y-1/3" />
               <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-[#BEF264] border border-white/20 shadow-xl">
                     <Sparkles className="w-8 h-8" />
                  </div>
                  <h4 className="text-4xl font-black tracking-tighter italic leading-[0.9] uppercase">Revenue<br/>Target</h4>
                  <p className="text-sm font-medium text-indigo-100 leading-relaxed uppercase tracking-tight opacity-90">
                     Generate ৳25,000 more sales this month to unlock a ৳5,000 bonus.
                  </p>
                  <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300 italic">Current Velocity</span>
                        <span className="text-2xl font-black italic tracking-tighter">72% ACHIEVED</span>
                     </div>
                     <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ArrowUpRight className="w-5 h-5 text-[#BEF264]" />
                     </div>
                  </div>
               </div>
            </div>

         </div>

      </div>
    </div>
  );
}
