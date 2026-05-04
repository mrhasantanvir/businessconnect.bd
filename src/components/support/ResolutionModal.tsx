"use client";

import React, { useState } from "react";
import { ShieldCheck, X, Loader2 } from "lucide-react";
import { resolveIncidentAction } from "@/app/support/incidents/actions";

interface ResolutionModalProps {
  incidentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResolutionModal({ incidentId, onClose, onSuccess }: ResolutionModalProps) {
  const [loading, setLoading] = useState(false);
  const [resolutionCode, setResolutionCode] = useState("SOLVED");
  const [resolutionNotes, setResolutionNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resolveIncidentAction({
        incidentId,
        resolutionCode,
        resolutionNotes
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to resolve incident");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      <div 
        className="bg-white  w-full max-w-lg rounded-[40px] border border-[#E5E7EB]  shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
           <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
                 <ShieldCheck className="w-6 h-6" />
               </div>
               <div>
                  <h2 className="text-xl font-semibold text-[#0F172A] ">Resolve Incident</h2>
                  <p className="text-xs font-bold text-[#64748B]">Follow ServiceNow Standard Closure</p>
               </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-gray-100  rounded-full text-gray-400 transition-colors">
               <X className="w-5 h-5" />
             </button>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Resolution Code</label>
                <select 
                  value={resolutionCode}
                  onChange={(e) => setResolutionCode(e.target.value)}
                  className="w-full bg-[#F8F9FA]  border border-[#E5E7EB]  rounded-2xl px-5 py-3.5 text-sm font-bold text-[#0F172A]  outline-none focus:border-[#1E40AF] transition-all appearance-none"
                >
                  <option value="SOLVED">Solved (Permanent Fix)</option>
                  <option value="WORKAROUND">Workaround (Temporary Fix)</option>
                  <option value="DUPLICATE">Duplicate of another ticket</option>
                  <option value="REJECTED">Rejected / Out of Scope</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Resolution Notes (Mandatory)</label>
                <textarea 
                  required
                  placeholder="Explain how the issue was resolved..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-[#F8F9FA]  border border-[#E5E7EB]  rounded-2xl px-5 py-4 text-sm font-medium text-[#0F172A]  outline-none focus:border-[#1E40AF] transition-all min-h-[140px] resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                 <button 
                   type="button" 
                   onClick={onClose}
                   className="flex-1 px-6 py-4 rounded-2xl border border-[#E5E7EB]  text-sm font-black text-[#64748B] hover:bg-gray-50  transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   disabled={loading || !resolutionNotes.trim()}
                   className="flex-3 bg-white text-slate-900 text-slate-900 border border-slate-100 text-white px-8 py-4 rounded-2xl text-sm font-black hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Resolution"}
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
