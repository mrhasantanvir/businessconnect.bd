"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, MessageSquare, ShieldCheck, Send, Loader2, Building2, User, MoreVertical, CheckCircle2 } from "lucide-react";
import { addReplyAction } from "@/app/support/incidents/actions";

export function AdminChatQueueUI({ initialChats, currentAdminId }: { initialChats: any[], currentAdminId: string }) {
  const [activeChat, setActiveChat] = useState<any>(initialChats[0] || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load messages for active chat (mocking real-time by re-fetching or using prop)
  // In a real app, this would be a subscription or a poll
  useEffect(() => {
    if (activeChat) {
      // Simulate fetching full history
      setMessages([]); // Clear and would fetch here
      // For this demo, we'll just show the last message plus any new ones
    }
  }, [activeChat]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat || isPending) return;

    const fd = new FormData();
    fd.append("incidentId", activeChat.id);
    fd.append("content", inputText);
    fd.append("isInternal", "false");

    const text = inputText;
    setInputText("");

    startTransition(async () => {
      try {
        await addReplyAction(fd);
        // Add to local state for instant feedback
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: text,
          userId: currentAdminId,
          createdAt: new Date().toISOString(),
          user: { name: "Me", role: "SUPER_ADMIN" }
        }]);
      } catch (err) {
        alert("Failed to send message");
        setInputText(text);
      }
    });
  };

  return (
    <>
      {/* Sidebar: Chat List */}
      <div className="w-80 border-r border-[#E5E7EB] flex flex-col bg-[#F8F9FA]">
        <div className="p-6 border-b border-[#E5E7EB] bg-white text-slate-900 text-slate-900 border border-slate-100 text-white">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60 mb-3">Merchant Support</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Filter chats..." 
              className="w-full bg-white text-slate-900 text-slate-900/5 border border-white/10 rounded-none pl-9 pr-4 py-2 text-xs text-white outline-none focus:bg-white/10 transition-all font-bold" 
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {initialChats.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center gap-3">
               <MessageSquare className="w-8 h-8 text-[#E5E7EB]" />
               <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest leading-relaxed">No active support requests</p>
            </div>
          ) : (
            initialChats.map((chat) => (
              <button 
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`w-full p-5 flex items-start gap-4 border-b border-[#F1F5F9] transition-all text-left ${
                  activeChat?.id === chat.id ? "bg-white shadow-[inset_4px_0_0_0_#1E40AF]" : "hover:bg-[#F1F5F9]"
                }`}
              >
                <div className="w-10 h-10 bg-[#F1F5F9] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                   <Building2 className="w-5 h-5 text-[#1E40AF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-bold text-[#0F172A] truncate pr-2 uppercase tracking-tight">{chat.merchantStore.name}</span>
                    <span className="text-[9px] font-bold text-[#A1A1AA] uppercase">
                       {isMounted ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "..."}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A1A1AA] font-medium truncate">
                    {chat.messages[0]?.content || "Started a chat..."}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChat ? (
          <>
            <div className="h-20 border-b border-[#F1F5F9] px-8 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white text-slate-900 text-slate-900 border border-slate-100 text-white flex items-center justify-center font-black text-sm">
                    {activeChat.merchantStore.name.charAt(0)}
                 </div>
                 <div>
                   <div className="flex items-center gap-2">
                     <h3 className="font-semibold text-[#0F172A] tracking-tight uppercase text-sm">{activeChat.merchantStore.name}</h3>
                     <span className="px-2 py-0.5 bg-[#BEF264]/20 text-[#65A30D] text-[9px] font-black uppercase tracking-widest">{activeChat.merchantStore.plan}</span>
                   </div>
                   <p className="text-[10px] text-[#A1A1AA] flex items-center gap-2 font-bold uppercase mt-1">
                     <User className="w-3 h-3" /> {activeChat.user.name} <span className="opacity-30">•</span> {activeChat.number}
                   </p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] text-[10px] font-black uppercase tracking-widest hover:bg-[#16A34A] hover:text-white transition-all flex items-center gap-2">
                   <CheckCircle2 className="w-3.5 h-3.5" /> Close Chat
                </button>
                <button className="p-2 text-[#A1A1AA] hover:text-[#0F172A] transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto no-scrollbar flex flex-col gap-6 bg-[#F8F9FA]/30">
               {/* Initial Message Wrapper */}
               <div className="flex flex-col gap-1.5 max-w-[80%] self-start items-start">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-[#64748B] uppercase tracking-tighter">{activeChat.user.name} (Merchant)</span>
                    <span className="text-[9px] font-bold text-[#A1A1AA] uppercase">{new Date(activeChat.createdAt).toLocaleTimeString("en-US")}</span>
                  </div>
                  <div className="p-4 text-sm font-medium shadow-sm border bg-white border-[#E5E7EB]">
                    {activeChat.description}
                  </div>
               </div>

               {messages.map(msg => (
                 <div 
                   key={msg.id} 
                   className={`flex flex-col gap-1.5 max-w-[80%] ${msg.userId === currentAdminId ? "self-end items-end" : "self-start items-start"}`}
                 >
                   <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-black uppercase tracking-tighter">
                        {msg.userId === currentAdminId ? "Official Agent (You)" : activeChat.user.name}
                     </span>
                     <span className="text-[9px] font-bold text-[#A1A1AA] uppercase">
                        {isMounted ? new Date(msg.createdAt).toLocaleTimeString("en-US") : "..."}
                     </span>
                   </div>
                   <div className={`p-4 text-sm font-medium shadow-sm border ${
                     msg.userId === currentAdminId ? "bg-white text-slate-900 text-slate-900 border border-slate-100 text-white border-[#0F172A]" : "bg-white border-[#E5E7EB]"
                   }`}>
                     {msg.content}
                   </div>
                 </div>
               ))}
            </div>

            <div className="p-6 bg-white border-t border-[#F1F5F9]">
              <form onSubmit={handleSend} className="flex items-center gap-4">
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Official platform response..."
                  className="flex-1 bg-[#F8F9FA] border border-[#E5E7EB] p-4 text-sm text-[#0F172A] outline-none focus:border-[#1E40AF] transition-all resize-none font-medium"
                  rows={1}
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() || isPending}
                  className="w-14 h-14 bg-white text-slate-900 text-slate-900 border border-slate-100 text-white flex items-center justify-center hover:bg-[#1E40AF] transition-all disabled:opacity-50 shadow-xl active:scale-95"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
             <div className="w-20 h-20 bg-[#F1F5F9] flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-[#A1A1AA]" />
             </div>
             <h3 className="text-xl font-semibold text-[#0F172A] uppercase tracking-tight mb-2">Support Management Hub</h3>
             <p className="text-xs text-[#64748B] font-medium max-w-sm uppercase tracking-widest leading-loose">Select a merchant from the queue to initiate a secure support session.</p>
          </div>
        )}
      </div>
    </>
  );
}
