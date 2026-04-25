"use client";

import React, { useState } from "react";
import { Search, Sparkles, Send, MessageSquare, Globe, MoreVertical, Image as ImageIcon, CheckCircle2, User } from "lucide-react";
import { cn } from "@/lib/utils";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn2(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const INBOX_THREADS = [
  { id: 1, name: "Sakib Al Hasan", platform: "whatsapp", message: "Do you have the iPhone 15 Pro in Titanium?", time: "10:42 AM", unread: true },
  { id: 2, name: "Nusrat Jahan", platform: "facebook", message: "My order hasn't arrived yet! Order #44920", time: "09:15 AM", unread: true },
  { id: 3, name: "Guest_9921", platform: "web", message: "Thank you, the quality is good.", time: "Yesterday", unread: false },
  { id: 4, name: "Farhad Reza", platform: "whatsapp", message: "Send me the bkash number.", time: "Yesterday", unread: false },
];

export default function UnifiedInboxPage() {
  const [activeThread, setActiveThread] = useState(INBOX_THREADS[0]);
  const [inputText, setInputText] = useState("");
  const [isAiDrafting, setIsAiDrafting] = useState(false);

  const handleAiSuggest = () => {
    setIsAiDrafting(true);
    setTimeout(() => {
      setInputText("Hello! Yes, the iPhone 15 Pro in Natural Titanium (256GB / 512GB) is currently in stock. Would you like to place an order? 😊");
      setIsAiDrafting(false);
    }, 800);
  };

  return (
    <div className="h-[calc(100vh-6rem)] w-full max-w-7xl mx-auto flex bg-surface border border-surface-border rounded-xl shadow-soft overflow-hidden animate-in fade-in duration-500">
      
      {/* Sidebar: Thread List */}
      <div className="w-80 border-r border-surface-border flex flex-col bg-surface-hover/30">
        <div className="p-4 border-b border-surface-border flex items-center gap-2">
           <div className="relative flex-1">
             <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
             <input type="text" placeholder="Search chats..." className="w-full bg-surface border border-surface-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground outline-none focus:border-primary-blue transition-colors" />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {INBOX_THREADS.map((thread) => (
             <button 
                key={thread.id}
                onClick={() => setActiveThread(thread)}
                className={cn2(
                  "w-full p-4 flex items-start gap-3 border-b border-surface-border hover:bg-surface transition-colors focus:outline-none text-left",
                  activeThread.id === thread.id && "bg-surface border-l-2 border-l-primary-blue"
                )}
             >
               <div className="relative mt-1">
                 <div className="w-10 h-10 rounded-full bg-surface-border flex items-center justify-center font-bold text-foreground overflow-hidden">
                    {thread.name.charAt(0)}
                 </div>
                 <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-0.5">
                   {thread.platform === "whatsapp" && <MessageSquare className="w-3.5 h-3.5 text-[#25D366] fill-current" />}
                   {thread.platform === "facebook" && <Globe className="w-3.5 h-3.5 text-[#1877F2] fill-current" />}
                   {thread.platform === "web" && <Globe className="w-3.5 h-3.5 text-[#1E40AF]" />}
                 </div>
               </div>
               <div className="flex-1 min-w-0">
                 <div className="flex justify-between items-baseline mb-0.5">
                   <span className={cn2("text-sm font-semibold truncate pr-2", thread.unread ? "text-foreground" : "text-foreground/80")}>{thread.name}</span>
                   <span className={cn2("text-[10px]", thread.unread ? "text-primary-blue font-bold" : "text-[#A1A1AA]")}>{thread.time}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <p className={cn2("text-xs truncate max-w-[180px]", thread.unread ? "font-semibold text-foreground" : "text-[#A1A1AA]")}>
                     {thread.message}
                   </p>
                   {thread.unread && <div className="w-2 h-2 rounded-full bg-primary-blue ml-2 shrink-0"></div>}
                 </div>
               </div>
             </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-surface relative">
        {/* Chat Header */}
        <div className="h-16 border-b border-surface-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center font-bold text-foreground">
                {activeThread.name.charAt(0)}
             </div>
             <div>
               <h3 className="font-bold text-foreground leading-tight">{activeThread.name}</h3>
               <p className="text-xs text-[#A1A1AA] flex items-center gap-1">
                 {activeThread.platform === "whatsapp" && <><MessageSquare className="w-3 h-3 text-[#25D366]" /> WhatsApp Business</>}
                 {activeThread.platform === "facebook" && <><Globe className="w-3 h-3 text-[#1877F2]" /> Facebook Messenger</>}
                 {activeThread.platform === "web" && <><Globe className="w-3 h-3 text-[#1E40AF]" /> Live Chat</>}
                 {activeThread.platform === "whatsapp" && <span className="ml-2 text-primary-green">• Online</span>}
               </p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-semibold text-foreground bg-surface-hover border border-surface-border rounded-lg hover:bg-[#E5E7EB] transition-colors flex items-center gap-1">
               <CheckCircle2 className="w-3.5 h-3.5 text-primary-green" /> Mark Resolved
            </button>
            <button className="p-2 text-[#A1A1AA] hover:text-foreground transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto no-scrollbar flex flex-col gap-4">
           {/* Mock History */}
           <div className="flex justify-center mb-6">
             <span className="text-[10px] uppercase font-bold tracking-wider text-[#A1A1AA] bg-surface-hover px-3 py-1 rounded-full">Today</span>
           </div>
           
           <div className="flex flex-col gap-1 max-w-[70%]">
             <div className="bg-[#F1F5F9] text-foreground p-3 rounded-2xl rounded-tl-sm text-sm border border-surface-border inline-block self-start shadow-soft">
               {activeThread.message}
             </div>
             <div className="text-[10px] text-[#A1A1AA] ml-1">{activeThread.time}</div>
           </div>
           
           {/* If AI is drafting, show a cool placeholder */}
           {isAiDrafting && (
             <div className="flex flex-col gap-1 max-w-[70%] self-end">
               <div className="bg-primary-blue text-white p-3 rounded-2xl rounded-tr-sm text-sm inline-block self-end mt-4 animate-pulse">
                 AI is generating a smart reply...
               </div>
             </div>
           )}
        </div>

        {/* AI Input Area */}
        <div className="p-4 bg-surface border-t border-surface-border">
          <div className="flex items-center gap-2 bg-surface border border-surface-border p-1 pl-3 rounded-2xl focus-within:border-primary-blue focus-within:ring-1 focus-within:ring-primary-blue transition-all">
            <button className="p-2 text-[#A1A1AA] hover:text-foreground transition-colors shrink-0">
               <ImageIcon className="w-5 h-5" />
            </button>
            
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none outline-none resize-none py-3 text-sm text-foreground placeholder:text-[#A1A1AA]"
              rows={1}
            />

            <button 
              onClick={handleAiSuggest}
              className="px-4 py-2 bg-surface-hover border border-surface-border rounded-xl text-xs font-bold text-primary-blue flex items-center gap-1.5 hover:bg-[#F0FDF4]  transition-all shrink-0 hover:text-primary-green hover:border-[#BBF7D0]  group"
            >
              <Sparkles className="w-3.5 h-3.5 group-hover:animate-pulse" /> AI Suggest
            </button>
            
            <button className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0 hover:opacity-90 transition-all disabled:opacity-50 ml-1">
               <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
