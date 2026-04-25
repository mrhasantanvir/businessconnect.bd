"use client";

import React, { useState, useRef, useTransition, useMemo } from "react";
import { Plus, X, Loader2, AlertCircle, Building2, User, ShieldCheck, Search, ChevronDown } from "lucide-react";
import { createIncidentOnBehalfAction } from "@/app/support/incidents/actions";

export function AdminCreateIncidentModal({ stores }: { stores: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  
  // Filter stores based on search query
  const filteredStores = useMemo(() => {
    if (!searchQuery) return stores;
    return stores.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, stores]);

  // Find users for the selected store
  const selectedStore = stores.find(s => s.id === selectedStoreId);
  const storeUsers = selectedStore?.users || [];

  const handleSelectStore = (storeId: string, storeName: string) => {
    setSelectedStoreId(storeId);
    setSearchQuery(storeName);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreId) {
      setError("Please select a merchant store using the search.");
      return;
    }
    setError(null);
    const formData = new FormData(formRef.current!);
    formData.set("storeId", selectedStoreId);

    startTransition(async () => {
      try {
        const result = await createIncidentOnBehalfAction(formData);
        if (result.success) {
          setShowSuccess(true);
          setTimeout(() => {
            setIsOpen(false);
            setShowSuccess(false);
            setSelectedStoreId("");
            setSearchQuery("");
          }, 2000);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-[#BEF264] text-[#14532D] font-bold text-xs hover:bg-[#aee64a] transition-all flex items-center gap-2 shadow-lg shadow-[#BEF264]/20"
      >
        <Plus className="w-4 h-4" />
        Log Incident for Merchant
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-white overflow-hidden shadow-2xl border border-[#E5E7EB] animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            
            <div className="p-8 border-b border-[#F1F5F9] flex items-center justify-between bg-[#F8F9FA] shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#BEF264]/20 text-[#65A30D] flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#0F172A]">Log Manual Incident</h2>
                    <p className="text-[10px] text-[#A1A1AA] font-black uppercase tracking-widest mt-0.5">Admin-On-Behalf Creation</p>
                  </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white transition-colors">
                  <X className="w-6 h-6 text-[#A1A1AA]" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {showSuccess ? (
                <div className="p-12 text-center animate-in zoom-in duration-500">
                   <div className="w-20 h-20 bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center mx-auto mb-6">
                      <ShieldCheck className="w-10 h-10" />
                   </div>
                   <h3 className="text-xl font-bold text-[#0F172A]">Ticket Logged Successfully</h3>
                   <p className="text-sm text-[#64748B] mt-2">The merchant will see this in their support dashboard.</p>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="p-8 space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold">
                      <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Searchable Store Selector */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Merchant Store Search</label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                        <input
                          type="text"
                          placeholder="Search Store Name or ID..."
                          value={searchQuery}
                          onFocus={() => setIsDropdownOpen(true)}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsDropdownOpen(true);
                            setSelectedStoreId(""); // Reset selection if user keeps typing
                          }}
                          className="w-full bg-[#F8F9FA] border border-[#E5E7EB] pl-11 pr-10 py-3 text-sm text-[#0F172A] outline-none focus:border-[#BEF264] transition-all"
                        />
                        <button 
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {isDropdownOpen && (
                        <div className="absolute z-[110] left-0 right-0 top-full mt-1 bg-white border border-[#E5E7EB] shadow-2xl max-h-[250px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                           {filteredStores.length > 0 ? (
                             filteredStores.map(s => (
                               <button
                                 key={s.id}
                                 type="button"
                                 onClick={() => handleSelectStore(s.id, s.name)}
                                 className="w-full text-left px-4 py-3 hover:bg-[#F8F9FA] border-b border-[#F1F5F9] last:border-0 group"
                               >
                                 <div className="font-bold text-sm text-[#0F172A] group-hover:text-[#1E40AF]">{s.name}</div>
                                 <div className="text-[10px] text-[#A1A1AA] uppercase font-black">{s.id} — {s.plan}</div>
                               </button>
                             ))
                           ) : (
                             <div className="p-4 text-center text-xs text-[#A1A1AA] font-bold italic">No stores found matching "{searchQuery}"</div>
                           )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Affected User/Owner</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                        <select 
                          name="userId" 
                          required 
                          disabled={!selectedStoreId}
                          className="w-full bg-[#F8F9FA] border border-[#E5E7EB] pl-11 pr-4 py-3 text-sm text-[#0F172A] outline-none focus:border-[#BEF264] transition-all disabled:opacity-50"
                        >
                          <option value="">Select User...</option>
                          {storeUsers.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Subject</label>
                    <input name="subject" required placeholder="Issue reported via phone/chat..."
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-5 py-3 text-sm text-[#0F172A] outline-none focus:border-[#BEF264] transition-all" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Category</label>
                      <select name="category" className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-4 py-3 text-sm text-[#0F172A] outline-none focus:border-[#BEF264] transition-all">
                        <option value="TECHNICAL">Technical Issue</option>
                        <option value="BILLING">Billing & Invoice</option>
                        <option value="ACCOUNT">Account Management</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Priority</label>
                      <select name="priority" className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-4 py-3 text-sm text-[#0F172A] outline-none focus:border-[#BEF264] transition-all">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Detailed Notes</label>
                    <textarea name="description" required rows={4} placeholder="Summary of the conversation and issue details..."
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-5 py-3 text-sm text-[#0F172A] outline-none focus:border-[#BEF264] transition-all resize-none" />
                  </div>

                  <button type="submit" disabled={isPending}
                    className="w-full bg-white text-slate-900 text-slate-900 border border-slate-100 text-white py-4 font-bold text-sm shadow-xl hover:bg-[#1E40AF] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log Incident with Auto-Assignment"}
                  </button>
                </form>
              )}
            </div>
            
            <div className="bg-[#F8F9FA] px-8 py-3 border-t border-[#F1F5F9] text-center">
               <p className="text-[9px] text-[#A1A1AA] font-black uppercase tracking-widest italic">Always verify merchant identity before logging on-behalf</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
