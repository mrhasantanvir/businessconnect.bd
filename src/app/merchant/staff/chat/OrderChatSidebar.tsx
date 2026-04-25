"use client";

import React, { useState } from "react";
import { MessageSquare, X, Shield, Zap } from "lucide-react";
import { InternalChatWindow } from "./InternalChatWindow";
import { getOrCreateOrderChannelAction } from "./actions";

export function OrderChatSidebar({ orderId, orderNumber }: { orderId: string, orderNumber: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleOpen = async () => {
    if (!isOpen && !channelId) {
      setLoading(true);
      try {
        const res = await getOrCreateOrderChannelAction(orderId);
        if (res.success) setChannelId(res.channelId);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        onClick={toggleOpen}
        className={`fixed bottom-24 right-8 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all z-40 group ${
          isOpen ? "bg-slate-900 rotate-90" : "bg-indigo-600 hover:scale-110"
        }`}
      >
        {isOpen ? <X className="text-white" /> : <MessageSquare className="text-white" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </button>

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 right-0 w-[450px] bg-slate-50 border-l border-slate-200 shadow-[-40px_0_80px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-500 ease-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex flex-col h-full p-6">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <Shield className="w-6 h-6 text-indigo-600" />
                 <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Professional Feed</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
           </div>

           <div className="flex-1">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : channelId ? (
                <InternalChatWindow 
                  channelId={channelId} 
                  title={`Order Discussion #${orderNumber.slice(-6).toUpperCase()}`} 
                  contextInfo={`Discussion for Order: ${orderNumber}`}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                   <Zap className="w-12 h-12 text-amber-500 opacity-20" />
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Initialize secure channel for<br/>contextual task orchestration.
                   </p>
                </div>
              )}
           </div>

           <div className="mt-8 p-4 bg-indigo-600 rounded-3xl text-white">
              <div className="flex items-center gap-3 mb-2">
                 <Shield className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Policy Enforcement</span>
              </div>
              <p className="text-[10px] font-medium leading-relaxed opacity-80 uppercase italic">
                AI Supervisor is monitoring this session. Personal or irrelevant chat will result in immediate flagging.
              </p>
           </div>
        </div>
      </div>
    </>
  );
}
