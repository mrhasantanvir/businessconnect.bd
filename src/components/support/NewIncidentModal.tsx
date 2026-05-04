"use client";

import React, { useState, useRef, useTransition } from "react";
import { Plus, X, Loader2, AlertCircle, ShieldCheck, Ticket, Image as ImageIcon, Sparkles, MessageSquare, ArrowRight, ExternalLink } from "lucide-react";
import { createIncidentAction, getAiSupportResolutionAction } from "@/app/support/incidents/actions";
import Link from "next/link";
import { useSupport } from "@/context/SupportContext";

export function NewIncidentModal({ disabled }: { disabled?: boolean }) {
  const { toggle, isEnabled } = useSupport();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useTransition();
  const [view, setView] = useState<"FORM" | "AI_SUGGESTION" | "SUCCESS">("FORM");
  const [autoAssigned, setAutoAssigned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [aiSuggestion, setAiSuggestion] = useState<{ suggestion: string, kbLink: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const resetAll = () => {
    setIsOpen(false);
    setView("FORM");
    setError(null);
    setPreviewUrl(null);
    setUploadedUrl(null);
    setAiSuggestion(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setUploadedUrl(data.url);
      else throw new Error("Upload failed");
    } catch {
      setError("Image upload failed. Please try again.");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAiAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    
    setError(null);
    const formData = new FormData(formRef.current!);
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;
    
    if (!subject || !description) {
      setError("Subject and Description are required.");
      return;
    }
    
    setIsAiLoading(true);
    try {
      const result = await getAiSupportResolutionAction(subject, description);
      setAiSuggestion({ suggestion: result.suggestion, kbLink: result.kbLink });
      setView("AI_SUGGESTION");
    } catch (err) {
      setError("AI analysis failed. You can skip directly to manual submission.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsPending(async () => {
      const formData = new FormData(formRef.current!);
      if (uploadedUrl) formData.append("attachmentUrl", uploadedUrl);

      const result = await createIncidentAction(formData);
      if (result.success) {
        setAutoAssigned(!!result.autoAssigned);
        setView("SUCCESS");
        setTimeout(() => resetAll(), 4000);
      } else {
        setError("Failed to create incident. Please try again.");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-none font-bold text-sm transition-all shrink-0 ${
          disabled 
            ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300" 
            : "bg-[#1E40AF] text-white shadow-lg hover:bg-[#1E3A8A] active:scale-95"
        }`}
      >
        <Plus className="w-4 h-4" />
        Raise New Incident
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-white rounded-none overflow-hidden shadow-2xl border border-[#E5E7EB] animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-8 border-b border-[#F1F5F9] flex items-center justify-between bg-gradient-to-br from-[#F8F9FA] to-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-none bg-[#1E40AF]/10 text-[#1E40AF] flex items-center justify-center">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0F172A]">
                    {view === "FORM" ? "Open New Incident" : view === "AI_SUGGESTION" ? "AI Smart Solution" : "Success"}
                  </h2>
                  <p className="text-xs text-[#64748B] font-medium uppercase tracking-widest mt-0.5">Service-Now Module</p>
                </div>
              </div>
              <button onClick={resetAll} className="p-2 hover:bg-[#F1F5F9] rounded-none transition-colors text-[#A1A1AA] hover:text-[#0F172A]">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto min-h-[400px]">
              
              {view === "SUCCESS" && (
                <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500 h-full">
                  <div className="w-24 h-24 rounded-none bg-[#F0FDF4] border-4 border-white flex items-center justify-center text-[#16A34A] shadow-xl mb-6 animate-bounce">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Incident Logged Successfully</h3>
                  <p className="text-[#64748B] text-sm max-w-xs mx-auto leading-relaxed">
                    Your ticket has been registered. Our support engineers are already reviewing your request.
                  </p>
                  
                  {autoAssigned && (
                    <div className="mt-8 flex items-center gap-3 bg-[#BEF264]/10 border border-[#BEF264]/30 px-6 py-3 rounded-none">
                      <div className="w-2 h-2 rounded-none bg-[#65A30D] animate-ping" />
                      <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#65A30D]">
                        Auto-assigned to available agent
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-12 text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Auto-closing in seconds...
                  </div>
                </div>
              )}

              {view === "AI_SUGGESTION" && aiSuggestion && (
                <div className="p-8 space-y-8 animate-in slide-in-from-right-8 duration-500">
                  <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-none p-6 relative overflow-hidden group">
                     <Sparkles className="absolute top-[-10px] right-[-10px] w-24 h-24 text-[#3B82F6] opacity-10 group-hover:scale-110 transition-transform" />
                     <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5" /> AI Recommended Solution
                     </h3>
                     <p className="text-[#1E40AF] text-sm leading-relaxed mb-6">
                        {aiSuggestion.suggestion}
                     </p>
                     <Link href={aiSuggestion.kbLink} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1D4ED8] hover:underline">
                        Read Detailed Knowledge Base Article <ExternalLink className="w-3 h-3" />
                     </Link>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-bold text-[#64748B] text-center uppercase tracking-widest">Does this help?</p>
                    <div className="flex flex-col gap-3">
                       <button onClick={resetAll} 
                         className="w-full py-4 bg-[#F0FDF4] text-[#16A34A] rounded-none font-black text-sm border-2 border-[#BBF7D0] hover:bg-[#16A34A] hover:text-white transition-all shadow-md active:scale-[0.98]">
                          Yes, this solved my problem!
                       </button>
                        <div className={`grid ${isEnabled ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                          <button onClick={handleFinalSubmit} disabled={isPending}
                            className="py-4 bg-white text-[#0F172A] rounded-none font-bold text-sm border-2 border-[#E5E7EB] hover:bg-[#F8F9FA] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm">
                             {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Need Help / Create Ticket"}
                          </button>
                          {isEnabled && (
                            <button onClick={() => { resetAll(); toggle(); }}
                              className="py-4 bg-white text-slate-900 text-slate-900 border border-slate-100 text-white rounded-none font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-md">
                               <MessageSquare className="w-4 h-4" /> Live Chat with Agent
                            </button>
                          )}
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {view === "FORM" && (
                <form ref={formRef} onSubmit={handleAiAnalysis} className="p-8 space-y-5 animate-in slide-in-from-left-8 duration-300">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-none flex items-center gap-3 text-red-600 text-sm font-bold animate-shake">
                      <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Subject</label>
                    <input name="subject" required
                      placeholder="Briefly describe the issue..."
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-none px-5 py-3 text-sm text-[#0F172A] outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/5 transition-all" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Category</label>
                      <select name="category"
                        className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-none px-4 py-3 text-sm text-[#0F172A] outline-none focus:border-[#1E40AF] transition-all">
                        <option value="TECHNICAL">Technical Issue</option>
                        <option value="BILLING">Billing & Invoice</option>
                        <option value="ACCOUNT">Account Management</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Contact Phone</label>
                      <input name="contactPhone"
                        placeholder="01XXX-XXXXXX"
                        className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-none px-5 py-3 text-sm text-[#0F172A] outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/5 transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Priority</label>
                    <select name="priority"
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-none px-4 py-3 text-sm text-[#0F172A] outline-none focus:border-[#1E40AF] transition-all">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High - Urgent</option>
                      <option value="CRITICAL">Critical - Business Blocker ⚠️</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Description</label>
                    <textarea name="description" required rows={3}
                      placeholder="Provide detailed information about the incident..."
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-none px-5 py-3 text-sm text-[#0F172A] outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/5 transition-all resize-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Attachment (Optional)</label>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    {previewUrl ? (
                      <div className="relative inline-flex items-start gap-3 p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl">
                        <img src={previewUrl} alt="Preview" className="h-20 rounded-none object-cover" />
                        <div className="flex flex-col gap-1 min-w-[120px]">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#A1A1AA]">
                            {isUploading ? "Uploading..." : "Ready to Send"}
                          </span>
                          {isUploading && <Loader2 className="w-4 h-4 text-[#1E40AF] animate-spin" />}
                        </div>
                        <button type="button" onClick={() => { setPreviewUrl(null); setUploadedUrl(null); }}
                          className="absolute top-2 right-2 bg-white border border-[#E5E7EB] rounded-none p-1 shadow-sm">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-3 w-full p-4 border-2 border-dashed border-[#E5E7EB] rounded-none hover:border-[#1E40AF] hover:bg-[#F8F9FF] transition-all group">
                        <ImageIcon className="w-6 h-6 text-[#A1A1AA] group-hover:text-[#1E40AF] transition-colors" />
                        <div className="text-left font-bold">
                          <div className="text-sm text-[#64748B]">Click to attach a screenshot</div>
                          <div className="text-[10px] text-[#A1A1AA] uppercase tracking-widest">PNG, JPG, GIF up to 5MB</div>
                        </div>
                      </button>
                    )}
                  </div>

                  <button type="submit" disabled={isAiLoading || isUploading}
                    className="w-full bg-white text-slate-900 text-slate-900 border border-slate-100 text-white px-6 py-4 rounded-none font-bold text-sm shadow-xl hover:bg-[#1E40AF] transition-all active:scale-[0.98] flex items-center justify-center gap-2 group">
                    {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <><Sparkles className="w-4 h-4 text-[#BEF264]" /> Start AI Analysis <ArrowRight className="w-4 h-4 opacity-30 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="bg-[#F8F9FA] px-8 py-3 border-t border-[#F1F5F9] shrink-0">
              <p className="text-[9px] text-[#A1A1AA] font-bold uppercase tracking-[0.2em] text-center">
                {view === "AI_SUGGESTION" ? "AI analysis is based on historical patterns and knowledge base" : "Data Protection: Encrypted & Compliant Storage"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
