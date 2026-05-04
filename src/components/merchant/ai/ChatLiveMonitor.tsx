"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, User, Bot, Send, Shield, Zap } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "CUSTOMER" | "AI" | "MERCHANT";
  text: string;
  timestamp: Date;
  platform: "MESSENGER" | "WHATSAPP";
}

export function ChatLiveMonitor() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"LIVE" | "AI_LOGS">("LIVE");

  // Mock data for initial view
  useEffect(() => {
    setMessages([
      { id: "1", sender: "CUSTOMER", text: "Is the Premium Mango in stock?", timestamp: new Date(), platform: "WHATSAPP" },
      { id: "2", sender: "AI", text: "Checking our inventory for you...", timestamp: new Date(), platform: "WHATSAPP" },
      { id: "3", sender: "AI", text: "Yes! Premium Mango is in stock for ৳250/kg. Would you like to order?", timestamp: new Date(), platform: "WHATSAPP" },
    ]);
  }, []);

  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[600px]">
       {/* Header */}
       <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <MessageSquare className="w-5 h-5" />
             </div>
             <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest">Unified Chat Intelligence</h3>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">AI Agent Active</span>
                </div>
             </div>
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-gray-100">
             <button 
               onClick={() => setActiveTab("LIVE")}
               className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "LIVE" ? "bg-indigo-600 text-white shadow-md" : "text-gray-400"}`}
             >
               Live Chat
             </button>
             <button 
               onClick={() => setActiveTab("AI_LOGS")}
               className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "AI_LOGS" ? "bg-indigo-600 text-white shadow-md" : "text-gray-400"}`}
             >
               AI Logs
             </button>
          </div>
       </div>

       {/* Message List */}
       <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "CUSTOMER" ? "justify-start" : "justify-end"}`}>
               <div className={`max-w-[80%] flex gap-3 ${msg.sender === "CUSTOMER" ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    msg.sender === "AI" ? "bg-indigo-50 border-indigo-100 text-indigo-600" : 
                    msg.sender === "MERCHANT" ? "bg-amber-50 border-amber-100 text-amber-600" :
                    "bg-white border-gray-100 text-gray-400"
                  }`}>
                    {msg.sender === "AI" ? <Bot size={14} /> : msg.sender === "MERCHANT" ? <Shield size={14} /> : <User size={14} />}
                  </div>
                  <div className="space-y-1">
                     <div className={`px-4 py-3 rounded-2xl text-[11px] font-medium leading-relaxed ${
                       msg.sender === "CUSTOMER" ? "bg-white border border-gray-100 text-[#0F172A]" :
                       msg.sender === "AI" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" :
                       "bg-amber-500 text-white shadow-lg shadow-amber-100"
                     }`}>
                        {msg.text}
                     </div>
                     <div className={`text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ${msg.sender === "CUSTOMER" ? "justify-start" : "justify-end"}`}>
                        {msg.platform} • {msg.timestamp.toLocaleTimeString('en-US')}
                     </div>
                  </div>
               </div>
            </div>
          ))}
       </div>

       {/* Input Area */}
       <div className="p-4 bg-gray-50/50 border-t border-gray-100">
          <div className="relative flex items-center gap-2">
             <input 
               type="text" 
               placeholder="Take over as Merchant..."
               className="flex-1 bg-white border border-gray-200 rounded-2xl px-5 py-3 text-xs font-medium placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 transition-all"
             />
             <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all">
                <Send size={16} />
             </button>
          </div>
          <div className="flex items-center gap-4 mt-3 px-2">
             <div className="flex items-center gap-1.5">
                <Zap size={10} className="text-amber-500 fill-current" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">Auto-Pilot Mode Enabled</span>
             </div>
             <button className="text-[9px] font-black text-indigo-600 uppercase tracking-tight hover:underline">Deactivate AI for this chat</button>
          </div>
       </div>
    </div>
  );
}
