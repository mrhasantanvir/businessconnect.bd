"use client";

import React, { useState } from "react";
import { ScanBarcode, PackageCheck, Clock, Layers, Maximize } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MobileStaffPage() {
  const [activeTab, setActiveTab] = useState<"home" | "scan">("home");

  return (
    <div className="w-full h-[calc(100vh-8rem)] flex items-center justify-center">
      {/* Mobile Device Frame Mockup for Web Viewing */}
      <div className="w-full max-w-[400px] h-full max-h-[850px] bg-surface border-4 border-surface-border rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col group">
        
        {/* Safe Area Notch Mock */}
        <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50">
           <div className="w-32 h-6 bg-surface-border rounded-b-3xl"></div>
        </div>

        {/* Header */}
        <div className="pt-10 pb-4 px-6 bg-primary-blue text-white rounded-b-3xl shadow-md z-10 transition-all duration-300">
           <div className="flex justify-between items-center mb-6">
             <div>
                <h2 className="font-bold text-xl tracking-tight">Staff Ops Hub</h2>
                <p className="text-xs text-white/70">W1 - Zone B</p>
             </div>
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Rahim+Uddin&background=BEF264&color=1E40AF" alt="Avatar" />
             </div>
           </div>
           
           {/* Shift Status */}
           <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
              <div className="text-xs text-white/70 mb-1 font-medium tracking-wider uppercase">Active Shift</div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold font-mono tracking-tight">04:12:45</span>
                <span className="text-xs bg-[#16A34A] text-white px-2 py-1 rounded-full font-bold shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> CLOCKED IN
                </span>
              </div>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#F8F9FA]  relative no-scrollbar">
          
          {activeTab === "home" ? (
             <div className="p-6 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                
                {/* Large Action Tiles */}
                <button 
                  onClick={() => setActiveTab("scan")}
                  className="col-span-2 bg-surface p-6 rounded-3xl shadow-soft border border-surface-border flex flex-col items-center justify-center gap-4 active:scale-95 transition-transform group/card"
                >
                  <div className="w-16 h-16 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue group-hover/card:bg-primary-blue group-hover/card:text-white transition-colors duration-300">
                     <ScanBarcode className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-foreground text-lg">Scan Product</h3>
                    <p className="text-xs text-[#A1A1AA] mt-1">AI AR Overlay Mode</p>
                  </div>
                </button>

                <button className="bg-surface p-6 rounded-3xl shadow-soft border border-surface-border flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform group/card">
                  <div className="w-12 h-12 rounded-full bg-primary-green/20 flex items-center justify-center text-[#166534]  group-hover/card:bg-primary-green group-hover/card:text-[#166534] transition-colors duration-300">
                     <PackageCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">Fulfill Order</h3>
                </button>

                <button className="bg-surface p-6 rounded-3xl shadow-soft border border-surface-border flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform group/card">
                  <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-foreground group-hover/card:bg-foreground group-hover/card:text-background transition-colors duration-300">
                     <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">Clock-out</h3>
                </button>
             </div>
          ) : (
            // AR Scanner View mock
            <div className="absolute inset-0 bg-slate-50 text-slate-900 flex flex-col animate-in fade-in duration-300">
               {/* Mock Camera Feed with blurred blocks representing shelves */}
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8ed7c80bc2?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center brightness-50"></div>
               
               {/* AR Overlays */}
               <div className="absolute inset-0 pointer-events-none p-6">
                 {/* Scanner Bracket */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-dashed border-[#BEF264]/50 rounded-3xl flex items-center justify-center">
                   <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#BEF264] rounded-tr-3xl"></div>
                   <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#BEF264] rounded-tl-3xl"></div>
                   <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#BEF264] rounded-br-3xl"></div>
                   <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#BEF264] rounded-bl-3xl"></div>
                   {/* Scanning Line */}
                   <div className="w-full h-0.5 bg-primary-green relative overflow-hidden shadow-[0_0_15px_rgba(190,242,100,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                 </div>

                 {/* AR Stock Info popups */}
                 <div className="absolute top-[35%] left-[20%] bg-surface/80 backdrop-blur border border-surface-border p-3 rounded-2xl shadow-2xl animate-pulse">
                   <div className="text-[10px] text-[#A1A1AA] uppercase font-bold tracking-wider">Stock Match</div>
                   <div className="text-sm font-bold text-foreground">Samsung S24 Case</div>
                   <div className="text-primary-green font-semibold text-xs mt-1 text-right">In Stock: 42</div>
                 </div>
               </div>

               {/* Scanner Controls Layout */}
               <div className="mt-auto p-6 z-10">
                 <button 
                  onClick={() => setActiveTab("home")}
                  className="w-full h-14 bg-white text-slate-900 text-slate-900/10 backdrop-blur-md rounded-2xl flex items-center justify-center font-bold text-white mb-4 active:scale-95 transition-transform border border-white/20"
                 >
                   Cancel Scan
                 </button>
               </div>
            </div>
          )}

        </div>

        {/* Clean Bottom Navigation */}
        <div className="h-20 bg-surface border-t border-surface-border flex items-center justify-around px-6 z-20 pb-4">
          <button className="p-3 text-primary-blue bg-primary-blue/10 rounded-2xl">
            <Layers className="w-6 h-6" />
          </button>
          <button className="p-3 text-[#A1A1AA] hover:bg-surface-hover rounded-2xl transition-colors">
            <Maximize className="w-6 h-6" />
          </button>
          <button className="p-3 text-[#A1A1AA] hover:bg-surface-hover rounded-2xl transition-colors">
            <Clock className="w-6 h-6" />
          </button>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: -45%; }
          50% { top: 45%; }
          100% { top: -45%; }
        }
      `}} />
    </div>
  );
}
