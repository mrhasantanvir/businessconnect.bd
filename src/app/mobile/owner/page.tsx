"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, Award, X, Check, Activity, PieChart, Layers } from "lucide-react";
import { getOwnerPulseData, getOwnerInboxData, handleApprovalAction } from "./actions";
import { toast } from "sonner";

export default function MobileOwnerPage() {
  const [activeTab, setActiveTab] = useState<"pulse" | "inbox">("pulse");
  const [swipedCards, setSwipedCards] = useState<string[]>([]);
  const [pulseData, setPulseData] = useState<any>(null);
  const [inboxData, setInboxData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // For this environment, we'll assume we can get merchantStoreId from a session hook or context
  // If not, we'd need to fetch it.
  const merchantStoreId = "clp...example"; // This should come from a real session

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const pulse = await getOwnerPulseData(merchantStoreId);
        const inbox = await getOwnerInboxData(merchantStoreId);
        setPulseData(pulse);
        setInboxData(inbox);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [merchantStoreId]);

  const handleSwipe = async (id: string, direction: 'left' | 'right', type: string) => {
    setSwipedCards(prev => [...prev, id]);
    try {
      await handleApprovalAction(id, type, direction === 'right' ? 'APPROVE' : 'REJECT');
      toast.success(`${type} ${direction === 'right' ? 'Approved' : 'Rejected'}`);
    } catch (err) {
      toast.error("Failed to process action");
    }
  };

  return (
    <div className="w-full h-[calc(100vh-8rem)] flex items-center justify-center">
      {/* Mobile Device Frame Mockup */}
      <div className="w-full max-w-[400px] h-full max-h-[850px] bg-surface border-4 border-surface-border rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50">
           <div className="w-32 h-6 bg-surface-border rounded-b-3xl"></div>
        </div>

        {/* Header Tabs */}
        <div className="pt-12 pb-2 px-6 bg-surface border-b border-surface-border flex justify-between z-10">
           <button 
             onClick={() => setActiveTab("pulse")}
             className={`pb-2 text-lg font-bold border-b-2 transition-all ${activeTab === 'pulse' ? 'border-[#1E40AF] text-[#1E40AF]' : 'border-transparent text-[#A1A1AA]'}`}
           >
             Pulse
           </button>
           <button 
             onClick={() => setActiveTab("inbox")}
             className={`pb-2 text-lg font-bold border-b-2 transition-all relative ${activeTab === 'inbox' ? 'border-[#1E40AF] text-[#1E40AF]' : 'border-transparent text-[#A1A1AA]'}`}
           >
             Inbox
             {activeTab !== 'inbox' && <div className="absolute top-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>}
           </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#F8F9FA]  relative no-scrollbar">
          
          {loading ? (
             <div className="flex-1 flex items-center justify-center">
                <RefreshCcw className="w-8 h-8 animate-spin text-indigo-600" />
             </div>
          ) : activeTab === "pulse" ? (
             <div className="p-6 space-y-6 animate-in fade-in duration-300">
                
                {/* Revenue Micro-Chart */}
                <div className="bg-surface rounded-3xl p-5 shadow-soft border border-surface-border">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <div className="text-xs font-semibold text-[#A1A1AA] uppercase">Today's Revenue</div>
                       <div className="text-2xl font-bold text-foreground">৳ {pulseData?.revenueToday.toLocaleString() || 0}</div>
                     </div>
                     <div className={`font-bold text-xs px-2 py-1 rounded-lg flex items-center gap-1 ${Number(pulseData?.revenueTrend) >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {Number(pulseData?.revenueTrend) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} 
                        {Math.abs(pulseData?.revenueTrend || 0)}%
                     </div>
                   </div>
                   {/* Tiny bar chart mockup with real spread if available */}
                   <div className="flex items-end justify-between h-16 gap-1.5 mt-2">
                     {(pulseData?.hourlyData || [30, 45, 25, 60, 50, 40, 75, 65, 80, 55, 90, 85]).map((h: number, i: number) => (
                       <div key={i} className="flex-1 bg-[#1E40AF]/20 rounded-t-sm relative group">
                          <div className="absolute bottom-0 w-full bg-[#1E40AF] rounded-t-sm" style={{ height: `${h}%` }}></div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Return Rate & Orders Mini Stats */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-surface rounded-3xl p-5 shadow-soft border border-surface-border flex flex-col gap-2">
                     <div className="w-8 h-8 rounded-full bg-[#BEF264]/20 text-[#65A30D] flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                     </div>
                     <div className="text-xl font-bold text-foreground">{pulseData?.totalOrdersToday || 0}</div>
                     <div className="text-xs text-[#A1A1AA] font-medium">Orders Placed</div>
                   </div>
                   
                   <div className="bg-surface rounded-3xl p-5 shadow-soft border border-surface-border flex flex-col gap-2">
                     <div className="w-8 h-8 rounded-full bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                     </div>
                     <div className="text-xl font-bold text-foreground">{pulseData?.returnRate || 0}%</div>
                     <div className="text-xs text-[#A1A1AA] font-medium">Return Rate</div>
                   </div>
                </div>

                {/* Top Staff List */}
                <div className="bg-surface rounded-3xl p-5 shadow-soft border border-surface-border">
                   <h3 className="font-bold border-b border-surface-border pb-3 mb-3 text-foreground flex items-center justify-between">
                     Top Performers <Award className="w-4 h-4 text-[#EAB308]" />
                   </h3>
                   <div className="space-y-4">
                      {pulseData?.topStaff.length > 0 ? pulseData.topStaff.map((staff: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#E5E7EB]  rounded-full flex items-center justify-center text-xs font-bold text-foreground">
                                {staff.name[0]}
                              </div>
                              <div className="text-sm font-semibold text-foreground">{staff.name}</div>
                           </div>
                           <div className="text-sm font-bold text-[#16A34A]">+{staff.count} Fulfills</div>
                        </div>
                      )) : (
                        <div className="text-center text-xs text-gray-400 py-2">No activity today</div>
                      )}
                   </div>
                </div>
             </div>
          ) : (
            // Approval Inbox (Tinder Swipe Style)
            <div className="p-6 h-full flex flex-col relative animate-in fade-in duration-300">
               <h3 className="text-center font-bold text-foreground mb-6">Requires Action</h3>
               
               <div className="flex-1 relative w-full flex items-center justify-center mb-10">
                 {inboxData.filter(req => !swipedCards.includes(req.id)).length === 0 ? (
                   <div className="text-center flex flex-col items-center opacity-50">
                     <Check className="w-16 h-16 text-[#16A34A] mb-4" />
                     <p className="font-bold text-foreground">All Caught Up!</p>
                   </div>
                 ) : (
                   inboxData.filter(req => !swipedCards.includes(req.id)).map((req, index, arr) => {
                     const isTop = index === arr.length - 1;
                     return (
                       <div 
                         key={req.id}
                         className={`absolute w-full bg-surface border border-surface-border rounded-3xl p-6 shadow-2xl transition-all duration-300 ease-out flex flex-col gap-4 ${!isTop && 'scale-95 translate-y-4 opacity-50'}`}
                         style={{ zIndex: index }}
                       >
                         <div className="flex justify-between items-center pb-4 border-b border-surface-border">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${req.type === 'Refund' ? 'bg-[#DC2626]/10 text-[#DC2626]' : 'bg-[#1E40AF]/10 text-[#1E40AF]'}`}>
                             {req.type}
                           </span>
                           <span className="font-mono text-xs text-[#A1A1AA]">ID: {req.id.slice(-6)}</span>
                         </div>
                         
                         <div>
                            <div className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Amount Due</div>
                            <div className="text-3xl font-bold tracking-tight text-foreground">{req.amount}</div>
                         </div>
                         
                         <div className="bg-surface-hover rounded-xl p-3 text-sm">
                           <strong className="text-foreground">Reason:</strong> <span className="text-foreground/80">{req.reason}</span><br/>
                           <strong className="text-foreground">Customer:</strong> <span className="text-foreground/80">{req.customer}</span>
                         </div>

                         {/* Action Buttons Mocking the Swipes */}
                         <div className="flex justify-between gap-4 mt-4">
                           <button 
                             onClick={() => handleSwipe(req.id, 'left', req.type)}
                             className="flex-1 h-14 bg-surface border-2 border-[#DC2626]/30 text-[#DC2626] rounded-2xl flex items-center justify-center font-bold text-lg active:bg-[#DC2626] active:text-white transition-colors"
                           >
                              <X className="w-6 h-6" />
                           </button>
                           <button 
                             onClick={() => handleSwipe(req.id, 'right', req.type)}
                             className="flex-1 h-14 bg-surface border-2 border-[#BEF264]/80 text-[#65A30D]  rounded-2xl flex items-center justify-center font-bold text-lg active:bg-[#BEF264] active:text-[#14532D] transition-colors"
                           >
                              <Check className="w-6 h-6" />
                           </button>
                         </div>
                       </div>
                     );
                   })
                 )}
               </div>
               
               <div className="text-center text-xs text-[#A1A1AA]">
                 Swipe Right to Approve • Swipe Left to Deny
               </div>
            </div>
          )}
        </div>

        {/* Clean Bottom Navigation */}
        <div className="h-20 bg-surface border-t border-surface-border flex items-center justify-around px-6 z-20 pb-4">
          <button className="p-3 text-[#A1A1AA] hover:bg-surface-hover rounded-2xl transition-colors">
            <Layers className="w-6 h-6" />
          </button>
          <div className="w-16 h-1 bg-foreground rounded-full absolute bottom-2 left-1/2 -translate-x-1/2"></div>
          <button className="p-3 text-primary-blue bg-primary-blue/10 rounded-2xl transition-colors">
            <PieChart className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
}
