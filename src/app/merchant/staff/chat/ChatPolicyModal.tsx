"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, Bot, Scale, CheckCircle } from "lucide-react";
import { acceptChatPolicyAction } from "./actions";
import { toast } from "sonner";

export function ChatPolicyModal({ onAccepted }: { onAccepted: () => void }) {
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleAccept = async () => {
    if (!agreed) return;
    setLoading(true);
    try {
      const res = await acceptChatPolicyAction();
      if (res.success) {
        toast.success("Policy Accepted. Professional Chat Enabled.");
        onAccepted();
      }
    } catch (err) {
      toast.error("Failed to update policy status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-2xl w-full bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]">
         
         {/* Left: Brand & Visual */}
         <div className="w-full md:w-5/12 bg-slate-900 p-10 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/20 blur-[80px] rounded-full"></div>
            <div className="relative z-10">
               <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-8">
                  <ShieldCheck className="w-8 h-8 text-[#BEF264]" />
               </div>
               <h2 className="text-3xl font-black tracking-tight leading-tight uppercase">Professional<br/>Code of<br/>Conduct</h2>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4">Internal Communication Protocol v2.0</p>
            </div>
            
            <div className="relative z-10 space-y-4">
               <div className="flex items-center gap-3">
                  <Bot size={16} className="text-indigo-400" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">AI Managed Environment</span>
               </div>
               <div className="flex items-center gap-3">
                  <Scale size={16} className="text-amber-400" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Strict Professional Intent</span>
               </div>
            </div>
         </div>

         {/* Right: Terms & Action */}
         <div className="flex-1 p-10 md:p-14 flex flex-col justify-between">
            <div className="space-y-8">
               <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600">Acknowledgement Required</h3>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                    "I understand that the BusinessConnect.bd internal chat is strictly for professional, task-based communication. I acknowledge that every message is scanned by GPT-4o Intelligence for compliance."
                  </p>
               </div>

               <div className="space-y-4 border-l-2 border-slate-100 pl-6">
                  <PolicyItem title="Zero Gossip Policy" desc="Personal, romantic, or irrelevant chatter is strictly prohibited." />
                  <PolicyItem title="Merchant Oversight" desc="The Merchant Store owner has full access to my chat logs and AI flags." />
                  <PolicyItem title="Data Retention" desc="Logs are permanently stored for auditing and performance matrix calculation." />
               </div>
            </div>

            <div className="space-y-6">
               <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="relative mt-1">
                     <input 
                       type="checkbox" 
                       className="peer hidden" 
                       checked={agreed} 
                       onChange={() => setAgreed(!agreed)} 
                     />
                     <div className="w-6 h-6 border-2 border-slate-200 rounded-lg peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center">
                        <CheckCircle size={14} className="text-white scale-0 peer-checked:scale-100 transition-transform" />
                     </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                     I accept the professional conduct policy
                  </span>
               </label>

               <button 
                 onClick={handleAccept}
                 disabled={!agreed || loading}
                 className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
               >
                  {loading ? "Activating Secure Feed..." : "Enable Professional Chat"}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function PolicyItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="space-y-1">
       <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{title}</div>
       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{desc}</div>
    </div>
  );
}
