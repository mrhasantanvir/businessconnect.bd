"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { Send, Loader2, Image as ImageIcon, Sparkles, MessageSquare } from "lucide-react";
import { addReplyAction } from "@/app/support/incidents/actions";

export function PlatformChatUI({ incident, userId }: { incident: any, userId: string }) {
  const [inputText, setInputText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll to bottom on load and new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [incident.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isPending) return;

    const fd = new FormData();
    fd.append("incidentId", incident.id);
    fd.append("content", inputText);
    fd.append("isInternal", "false");

    const text = inputText;
    setInputText("");

    startTransition(async () => {
      try {
        await addReplyAction(fd);
      } catch (err) {
        alert("Failed to send message");
        setInputText(text);
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] relative h-full overflow-hidden">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto no-scrollbar flex flex-col gap-6"
      >
        <div className="flex justify-center mb-4">
          <span className="text-[10px] uppercase font-black tracking-widest text-[#A1A1AA] bg-white border border-[#E5E7EB] px-4 py-1">
             Encrypted Channel Established
          </span>
        </div>

        {incident.messages.map((msg: any) => {
          const isMe = msg.userId === userId;
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col gap-1.5 max-w-[80%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                 {!isMe && (
                   <span className="text-[10px] font-black text-[#1E40AF] uppercase tracking-tighter">
                     {msg.user.role === 'SUPER_ADMIN' ? 'Official Agent' : msg.user.name}
                   </span>
                 )}
                 <span className="text-[9px] font-bold text-[#A1A1AA] uppercase">
                   {isMounted ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "..."}
                 </span>
              </div>
              <div 
                className={`p-4 text-sm font-medium shadow-sm border ${
                  isMe 
                    ? "bg-white text-slate-900 text-slate-900 border border-slate-100 text-white border-[#0F172A]" 
                    : "bg-white text-[#0F172A] border-[#E5E7EB]"
                }`}
                style={{ borderRadius: 0 }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        
        {isPending && (
          <div className="self-end flex items-center gap-2 text-[#A1A1AA] text-[10px] font-bold uppercase animate-pulse">
            Sending...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-[#F1F5F9]">
        <form ref={formRef} onSubmit={handleSend} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Type your message to platform support..."
              className="w-full bg-[#F8F9FA] border border-[#E5E7EB] p-4 pr-12 text-sm text-[#0F172A] outline-none focus:border-[#1E40AF] transition-all resize-none block"
              rows={1}
            />
            <button 
              type="button" 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#1E40AF] transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            type="submit"
            disabled={!inputText.trim() || isPending}
            className="w-14 h-14 bg-[#1E40AF] text-white flex items-center justify-center hover:bg-[#1E3A8A] transition-all disabled:opacity-50 shrink-0 shadow-lg active:scale-95"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        
        <div className="mt-4 flex items-center gap-6">
           <button className="flex items-center gap-2 text-[10px] font-black text-[#A1A1AA] uppercase hover:text-[#1E40AF] transition-colors">
              <Sparkles className="w-3.5 h-3.5" /> AI Assist
           </button>
           <button className="flex items-center gap-2 text-[10px] font-black text-[#A1A1AA] uppercase hover:text-[#1E40AF] transition-colors">
              <MessageSquare className="w-3.5 h-3.5" /> Request Voice Call
           </button>
        </div>
      </div>
    </div>
  );
}
