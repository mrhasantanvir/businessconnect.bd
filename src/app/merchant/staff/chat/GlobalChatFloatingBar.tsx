"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Minus, Maximize2, Send, Bot } from "lucide-react";
import { getChatMessagesAction, sendInternalMessageAction } from "./actions";
import { toast } from "sonner";
import { format } from "date-fns";

export function GlobalChatFloatingBar({ userId, merchantStoreId, userName }: { userId: string, merchantStoreId: string, userName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Sound
  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
  }, []);

  // Poll for ALL channels the user is part of to detect new messages
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      // In a real app, we'd have a specific "getLatestMessagesAcrossAllChannels" action
      // For now, we'll focus on the active channel if open, or general unread logic
      if (activeChannelId) {
        const res = await getChatMessagesAction(activeChannelId);
        if (res.success && res.messages.length > 0) {
          const latest = res.messages[res.messages.length - 1];
          if (latest.id !== lastMessageId) {
            if (latest.senderId !== userId) {
              audioRef.current?.play().catch(() => {});
              if (!isOpen) setUnreadCount(prev => prev + 1);
            }
            setMessages(res.messages);
            setLastMessageId(latest.id);
          }
        }
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [activeChannelId, lastMessageId, isOpen, userId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChannelId || loading) return;

    setLoading(true);
    try {
      const res = await sendInternalMessageAction({ channelId: activeChannelId, content: newMessage });
      if (res.success) {
        setNewMessage("");
        setMessages(prev => [...prev, { ...res.message, createdAt: new Date(res.message.createdAt) }]);
      }
    } catch (err) {
      toast.error("Failed to send");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-4 pointer-events-none">
      
      {/* Floating Chat Window (Facebook Style) */}
      {isOpen && activeChannelId && (
        <div className="w-[360px] h-[480px] bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500 pointer-events-auto">
           {/* Header */}
           <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <MessageSquare size={16} />
                 </div>
                 <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest leading-none">Staff Chat</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                       <div className="w-1.5 h-1.5 bg-[#BEF264] rounded-full animate-pulse"></div>
                       <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Monitoring</span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-all text-slate-400">
                    <Minus size={16} />
                 </button>
                 <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-rose-500 rounded-lg transition-all text-slate-400 hover:text-white">
                    <X size={16} />
                 </button>
              </div>
           </div>

           {/* Messages */}
           <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.senderId === userId ? "items-end" : "items-start"}`}>
                   <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm border ${
                     msg.senderId === userId 
                       ? "bg-indigo-600 text-white border-indigo-500 rounded-tr-none" 
                       : "bg-white text-slate-700 border-slate-100 rounded-tl-none"
                   }`}>
                      {msg.content}
                   </div>
                   <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest px-1">
                      {msg.senderId === userId ? "You" : msg.sender.name} • {format(new Date(msg.createdAt), "HH:mm")}
                   </span>
                </div>
              ))}
           </div>

           {/* Input */}
           <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 shrink-0 flex items-center gap-2">
              <input 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type message..."
                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim() || loading}
                className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                 <Send size={16} />
              </button>
           </form>
        </div>
      )}

      {/* Floating Bubble */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          setUnreadCount(0);
          if (!activeChannelId) setActiveChannelId("global"); // Placeholder
        }}
        className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 pointer-events-auto relative group ${
          isOpen ? "bg-slate-900 text-white rotate-90" : "bg-indigo-600 text-white"
        }`}
      >
         {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
         
         {!isOpen && unreadCount > 0 && (
           <div className="absolute -top-2 -left-2 w-7 h-7 bg-[#BEF264] text-slate-900 rounded-full flex items-center justify-center text-[10px] font-black border-4 border-white animate-bounce">
              {unreadCount}
           </div>
         )}

         {/* Tooltip */}
         {!isOpen && (
           <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 shadow-2xl">
              Internal Chat
           </div>
         )}
      </button>

    </div>
  );
}
