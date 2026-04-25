import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  MessageSquare, 
  Facebook, 
  Globe, 
  Search, 
  Filter, 
  Send, 
  Bot, 
  User, 
  CheckCircle2,
  Clock,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Phone
} from "lucide-react";
import { getConversationsAction, getMessagesAction } from "./actions";

export default async function UnifiedInboxPage({ searchParams }: { searchParams: { id?: string } }) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const conversations = await getConversationsAction();
  const selectedId = searchParams.id || conversations[0]?.id;
  const messages = selectedId ? await getMessagesAction(selectedId) : [];
  const activeChat = conversations.find(c => c.id === selectedId);

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white  border border-[#E5E7EB]  rounded-[48px] overflow-hidden shadow-2xl animate-in fade-in duration-700">
      
      {/* 1. Chat List Sidebar */}
      <div className="w-80 lg:w-96 border-r border-[#E5E7EB]  flex flex-col bg-[#F8F9FA] ">
         <div className="p-6 space-y-4">
            <h2 className="text-xl font-black flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" /> Unified Inbox
            </h2>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search multi-channel leads..." 
                 className="w-full bg-white  border border-transparent focus:border-indigo-500 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none transition-all shadow-sm"
               />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1">
            {conversations.map((chat) => (
              <a 
                key={chat.id}
                href={`/merchant/inbox?id=${chat.id}`}
                className={`flex items-center gap-4 p-4 rounded-[32px] transition-all group ${
                  selectedId === chat.id 
                    ? "bg-white  shadow-lg border border-indigo-100 " 
                    : "hover:bg-white/50  border border-transparent"
                }`}
              >
                 <div className="relative shrink-0">
                    <div className="w-12 h-12 bg-indigo-100  rounded-2xl flex items-center justify-center font-black text-indigo-600">
                       {chat.customerName?.charAt(0) || "L"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-1 bg-white  rounded-full shadow-md">
                       {chat.source === "FACEBOOK" ? <Facebook className="w-3 h-3 text-blue-500" /> : <Globe className="w-3 h-3 text-green-500" />}
                    </div>
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                       <span className="text-sm font-black truncate">{chat.customerName}</span>
                       <span className="text-[9px] font-bold text-gray-400">{new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[10px] font-medium text-gray-400 truncate tracking-tight">{chat.lastMessage || "No messages yet."}</p>
                 </div>
              </a>
            ))}
         </div>
      </div>

      {/* 2. Main Chat Window */}
      <div className="flex-1 flex flex-col bg-white  relative">
         {activeChat ? (
           <>
             {/* Chat Header */}
             <div className="h-20 border-b border-[#E5E7EB]  flex items-center justify-between px-8 bg-white/50  shrink-0">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-50  rounded-xl flex items-center justify-center font-black text-indigo-500">
                      {activeChat.customerName?.charAt(0)}
                   </div>
                   <div>
                      <h3 className="text-sm font-black flex items-center gap-2">
                        {activeChat.customerName} <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      </h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">External Lead • {activeChat.source}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   {activeChat.isAiEnabled && (
                     <div className="bg-[#BEF264]/10 text-green-700  px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-[#BEF264]/30">
                        <Bot className="w-3.5 h-3.5" /> AI Assist Active
                     </div>
                   )}
                   <button className="p-2.5 bg-gray-50  rounded-xl hover:bg-gray-100 transition-all border border-gray-100 ">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                   </button>
                </div>
             </div>

             {/* Messages Display */}
             <div className="flex-1 overflow-y-auto p-10 space-y-6 no-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.98]">
                {messages.map((msg) => (
                   <div key={msg.id} className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`max-w-[70%] space-y-1 ${msg.direction === "OUTBOUND" ? "items-end" : "items-start"}`}>
                         <div className={`p-4 rounded-[32px] text-xs font-medium leading-relaxed ${
                           msg.direction === "OUTBOUND" 
                             ? "bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-tr-none shadow-xl" 
                             : "bg-indigo-50  text-[#0F172A]  rounded-tl-none border border-indigo-100/50 "
                         }`}>
                           {msg.isAiGenerated && (
                             <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest mb-2 opacity-60">
                                <Bot className="w-2.5 h-2.5" /> Generated by AI
                             </div>
                           )}
                           {msg.content}
                         </div>
                         <div className="text-[8px] font-bold text-gray-400 px-2 flex items-center gap-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {msg.direction === "OUTBOUND" && <CheckCircle2 className="w-2.5 h-2.5 text-blue-500" />}
                         </div>
                      </div>
                   </div>
                ))}
             </div>

             {/* Input Area */}
             <div className="p-8 border-t border-[#E5E7EB]  bg-white ">
                <form className="relative flex items-center gap-4">
                   <div className="flex-1 relative group">
                      <input 
                        placeholder={`Reply to ${activeChat.customerName}...`}
                        className="w-full bg-[#F8F9FA]  border border-transparent focus:border-indigo-500 rounded-3xl py-4 pl-6 pr-14 text-xs font-bold outline-none transition-all shadow-inner"
                      />
                      <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-500 transition-colors">
                        <Sparkles className="w-4 h-4" />
                      </button>
                   </div>
                   <button type="submit" className="shrink-0 p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">
                      <Send className="w-5 h-5" />
                   </button>
                </form>
             </div>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6 opacity-40">
              <div className="w-24 h-24 bg-indigo-50  rounded-[48px] flex items-center justify-center">
                 <MessageSquare className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black">No Conversation Selected</h3>
                 <p className="text-xs font-medium max-w-[280px]">Select a lead from the sidebar to start omni-channel support.</p>
              </div>
           </div>
         )}
      </div>

      {/* 3. Lead Context Panel (Right) */}
      <div className="w-72 border-l border-[#E5E7EB]  shrink-0 bg-[#F8F9FA]  hidden xl:flex flex-col p-8 space-y-10 overflow-y-auto no-scrollbar">
         {activeChat && (
            <>
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Lead Meta</h4>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500">Channel</span>
                        <div className="px-3 py-1 bg-white  rounded-full text-[9px] font-black text-blue-500 border border-blue-100  flex items-center gap-1.5">
                           {activeChat.source === "FACEBOOK" ? <Facebook className="w-3 h-3" /> : <Globe className="w-3 h-3" />} {activeChat.source}
                        </div>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500">Status</span>
                        <div className="px-3 py-1 bg-green-50  rounded-full text-[9px] font-black text-green-600 border border-green-100 ">
                           {activeChat.status}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-6 pt-6 border-t border-gray-100 ">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">AI Configuration</h4>
                  <div className="p-5 bg-white  rounded-[32px] border border-gray-100  space-y-4 shadow-sm">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Bot className="w-3.5 h-3.5 text-indigo-500" />
                           <span className="text-[10px] font-black">AI Auto-Reply</span>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-all cursor-pointer ${activeChat.isAiEnabled ? "bg-[#BEF264]" : "bg-gray-200"}`}>
                           <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${activeChat.isAiEnabled ? "right-1" : "left-1"}`} />
                        </div>
                     </div>
                     <p className="text-[9px] font-medium text-gray-400 leading-relaxed">
                        When active, AI uses your **Knowledge Base** to reply to customer queries instantly.
                     </p>
                  </div>
               </div>

               <div className="space-y-6 pt-6 border-t border-gray-100 ">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Quick Actions</h4>
                  <div className="space-y-2">
                     <button className="w-full py-3 bg-white  border border-gray-100  rounded-2xl text-[10px] font-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Mark Resolved
                     </button>
                     <button className="w-full py-3 bg-white  border border-gray-100  rounded-2xl text-[10px] font-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Draft AI Summary
                     </button>
                  </div>
               </div>
            </>
         )}
      </div>

    </div>
  );
}

