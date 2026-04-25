"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, Bot, ShieldAlert, Paperclip, 
  MessageSquare, User, Clock, 
  ChevronDown, X, Zap, ShieldCheck
} from "lucide-react";
import { sendInternalMessageAction, getChatMessagesAction } from "./actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { MemberManager } from "./MemberManager";

export function InternalChatWindow({ 
  channelId, 
  title, 
  contextInfo,
  isMerchant,
  allColleagues
}: { 
  channelId: string, 
  title: string, 
  contextInfo: string,
  isMerchant?: boolean,
  allColleagues?: any[]
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [moderationLoading, setModerationLoading] = useState(false);
  const [showMemberManager, setShowMemberManager] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial Load
  useEffect(() => {
    async function load() {
      const res = await getChatMessagesAction(channelId);
      if (res.success) {
        setMessages(res.messages.map((m: any) => ({ ...m, createdAt: new Date(m.createdAt) })));
      }
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [channelId]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading || moderationLoading) return;

    setModerationLoading(true);
    
    try {
      const res = await sendInternalMessageAction({ channelId, content: newMessage });
      if (res.success) {
        setNewMessage("");
        const newMsg = {
           id: res.message.id,
           content: res.message.content,
           sender: res.message.sender,
           createdAt: new Date(res.message.createdAt),
           isFlagged: res.message.isFlagged
        };
        setMessages(prev => [...prev, newMsg]);
      } else {
        toast.error(res.error, { duration: 5000 });
      }
    } catch (err: any) {
      toast.error("Failed to send message");
    } finally {
      setModerationLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <MessageSquare className="w-5 h-5" />
            </div>
            <div>
               <h3 className="text-xs font-black uppercase tracking-widest leading-none">{title}</h3>
               <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-1.5 h-1.5 bg-[#BEF264] rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">AI Moderation Active</span>
               </div>
            </div>
         </div>
         
         <div className="flex items-center gap-3">
            {isMerchant && !title.includes("Secure") && (
              <button 
                onClick={() => setShowMemberManager(true)}
                className="px-5 py-3 bg-white text-slate-900 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                 <User size={14} />
                 Manage Members
              </button>
            )}
            <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 border border-white/5">
               <ShieldCheck size={20} />
            </div>
         </div>
      </div>

      {/* Member Manager Modal */}
      {showMemberManager && allColleagues && (
        <MemberManager 
          channelId={channelId} 
          allColleagues={allColleagues} 
          onClose={() => setShowMemberManager(false)} 
        />
      )}

      {/* Context Banner */}
      {contextInfo && (
        <div className="px-6 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center gap-3 shrink-0">
           <Zap size={12} className="text-indigo-600" />
           <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{contextInfo}</p>
        </div>
      )}

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scroll-smooth custom-scrollbar">
         {messages.length === 0 && !loading && (
           <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <Bot className="w-12 h-12 text-slate-300" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Secure Internal Channel<br/>Monitoring in Progress</p>
           </div>
         )}
         
         {messages.map((msg) => (
           <div key={msg.id} className="flex flex-col gap-1 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{msg.sender.name}</span>
                    <span className="text-[8px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md uppercase tracking-widest">{msg.sender.role}</span>
                 </div>
                 <span className="text-[8px] font-black text-slate-300 uppercase">{format(msg.createdAt, "HH:mm")}</span>
              </div>
              <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed border transition-all ${
                msg.isFlagged 
                  ? "bg-rose-50 border-rose-100 text-rose-700 shadow-sm" 
                  : "bg-white border-slate-100 text-slate-700 shadow-sm"
              }`}>
                 {msg.content}
                 {msg.isFlagged && (
                   <div className="mt-2 pt-2 border-t border-rose-100 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-rose-400">
                      <ShieldAlert size={10} /> Flagged for Merchant Review
                   </div>
                 )}
              </div>
           </div>
         ))}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-slate-100 relative shrink-0">
         {moderationLoading && (
           <div className="absolute inset-x-0 -top-10 flex justify-center animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-indigo-600 text-white px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-500/20">
                 <Bot size={12} className="animate-spin-slow" /> AI Supervisor Scanning Intent...
              </div>
           </div>
         )}
         
         <form onSubmit={handleSend} className="relative flex items-center gap-3">
            <div className="flex-1 relative group">
               <input 
                 value={newMessage}
                 onChange={e => setNewMessage(e.target.value)}
                 disabled={loading || moderationLoading}
                 placeholder="Type professional message..."
                 className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white rounded-2xl px-6 py-4 text-xs font-bold outline-none transition-all placeholder:text-slate-300 disabled:opacity-50"
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button type="button" className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                     <Paperclip size={16} />
                  </button>
               </div>
            </div>
            <button 
              type="submit" 
              disabled={!newMessage.trim() || loading || moderationLoading}
              className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
               <Send size={20} />
            </button>
         </form>

         <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5 opacity-30">
               <ShieldCheck size={10} className="text-emerald-500" />
               <span className="text-[8px] font-black uppercase tracking-widest">Secure Channel</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-30">
               <Clock size={10} className="text-amber-500" />
               <span className="text-[8px] font-black uppercase tracking-widest">Policy Compliant</span>
            </div>
         </div>
      </div>
    </div>
  );
}
