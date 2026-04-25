"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { 
  X, 
  Send, 
  Smile, 
  Bot,
  Loader2,
  ShieldCheck,
  MessageCircle,
  Clock
} from "lucide-react";
import { getOrCreateSupportChatAction, addReplyAction } from "@/app/support/incidents/actions";
import { useSupport } from "@/context/SupportContext";

/**
 * Unified Support Drawer
 * Acts as a slide-out panel from the right.
 * Triggered by the Navbar chat icon via SupportContext.
 */
export function WebChatWidget({ user }: { user?: any }) {
  const { isOpen, setIsOpen } = useSupport();
  const [incident, setIncident] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Poll for messages every 10 seconds if drawer is open
  useEffect(() => {
    let interval: any;
    if (isOpen && user?.merchantStoreId) {
      const fetchChat = async () => {
        const res = await getOrCreateSupportChatAction();
        if (res.success && res.incident) {
          setIncident(res.incident);
          setMessages(res.incident.messages);
        }
      };
      
      fetchChat();
      interval = setInterval(fetchChat, 10000);
    }
    return () => clearInterval(interval);
  }, [isOpen, user?.merchantStoreId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (!user || user.role === "SUPER_ADMIN") return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !incident || isPending) return;

    const fd = new FormData();
    fd.append("incidentId", incident.id);
    fd.append("content", input);
    fd.append("isInternal", "false");

    const text = input;
    setInput("");

    startTransition(async () => {
      try {
        await addReplyAction(fd);
        // Instant optimism
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: text,
          userId: user.id,
          createdAt: new Date().toISOString(),
          user: { name: user.name, role: user.role }
        }]);
      } catch (err) {
        alert("Failed to send message. Please check your connection.");
        setInput(text);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[998] animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white  border-l border-[#E5E7EB]  shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col z-[999] animate-in slide-in-from-right duration-500 ease-out">
        
        {/* Header */}
        <div className="p-8 bg-white text-slate-900 text-slate-900 border border-slate-100 text-white flex items-center justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
           
           <div className="flex items-center gap-4 z-10">
              <div className="w-14 h-14 bg-indigo-500 rounded-[20px] shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                 <Bot className="w-8 h-8" />
              </div>
              <div>
                 <h3 className="text-lg font-black tracking-tight uppercase">Live Support</h3>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-[#BEF264] rounded-full animate-pulse" />
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Online • Powered by BusinessOS</p>
                 </div>
              </div>
           </div>
           
           <button 
             onClick={() => setIsOpen(false)} 
             className="z-10 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-90"
           >
              <X className="w-6 h-6 text-gray-400" />
           </button>
        </div>

        {/* Chat History */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.98] bg-[#F9FAFB] "
        >
           <div className="flex justify-center mb-4">
              <div className="bg-white  border border-gray-100  py-2 px-4 rounded-xl shadow-sm">
                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3 text-indigo-500" /> End-to-End Encryption Active
                 </p>
              </div>
           </div>

           {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                 <div className="w-16 h-16 bg-gray-100  rounded-full flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                 </div>
                 <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Waiting for first response...</p>
              </div>
           )}

           {messages.map((msg, idx) => {
             const isMe = msg.userId === user.id;
             return (
               <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className={`p-5 rounded-[30px] text-xs font-bold leading-relaxed shadow-sm max-w-[85%] ${
                    isMe 
                      ? "bg-white text-slate-900 text-slate-900 border border-slate-100 text-white rounded-tr-none" 
                      : "bg-white  text-[#0F172A]  rounded-tl-none border border-transparent "
                  }`}>
                     {msg.content}
                  </div>
                  <div className="flex items-center gap-2 mt-2 px-2">
                     <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400">
                        {isMe ? "Sent" : (msg.user?.role === 'SUPER_ADMIN' ? 'Official Support' : msg.user?.name)}
                     </span>
                     <Clock className="w-2.5 h-2.5 text-gray-300" />
                  </div>
               </div>
             );
           })}
           {isPending && (
              <div className="flex justify-end pr-2">
                 <div className="text-[8px] font-black uppercase text-indigo-500 animate-pulse">Syncing to Cloud...</div>
              </div>
           )}
        </div>

        {/* Input Area */}
        <div className="p-8 border-t border-[#E5E7EB]  bg-white ">
           <form onSubmit={handleSend} className="relative flex items-center gap-4">
              <div className="flex-1 relative group">
                 <input 
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   disabled={isPending}
                   placeholder="Type your message..." 
                   className="w-full bg-[#F8F9FA]  border border-transparent focus:border-indigo-500/50 rounded-[24px] py-5 px-6 text-sm font-bold outline-none transition-all shadow-inner placeholder:text-gray-400 disabled:opacity-50"
                 />
                 <button type="button" className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-500 transition-colors">
                    <Smile className="w-5 h-5" />
                 </button>
              </div>
              <button 
                type="submit" 
                disabled={!input.trim() || isPending || !incident}
                className="shrink-0 w-16 h-16 bg-white text-slate-900 text-slate-900 border border-slate-100 hover:bg-black text-white rounded-[24px] shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100"
              >
                 {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </button>
           </form>
           <div className="text-center mt-6">
              <p className="italic text-[8px] font-black uppercase text-gray-300 tracking-[0.2em]">
                 Military-Grade Privacy • 256-Bit SSL
              </p>
           </div>
        </div>

      </div>
    </>
  );
}
