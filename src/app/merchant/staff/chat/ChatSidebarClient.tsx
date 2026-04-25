"use client";

import React, { useState } from "react";
import { Search, Plus, MessageSquare, ArrowRight, User, Truck, Warehouse, Headphones } from "lucide-react";
import Link from "next/link";
import { createCustomChannelAction } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const IconMap = {
  TRUCK: Truck,
  WAREHOUSE: Warehouse,
  SUPPORT: Headphones,
  MESSAGE: MessageSquare
};

export function ChatSidebarClient({ 
  channels, 
  colleagues, 
  activeChannelId, 
  isMerchant 
}: { 
  channels: any[], 
  colleagues: any[], 
  activeChannelId?: string,
  isMerchant: boolean
}) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const filteredColleagues = colleagues.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.role?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    setLoading(true);
    try {
      const res = await createCustomChannelAction(newChannelName);
      if (res.success) {
        toast.success("New Channel Created");
        setShowModal(false);
        setNewChannelName("");
        router.push(`/merchant/staff/chat?channel=${res.channelId}`);
      }
    } catch (err) {
      toast.error("Failed to create channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      
      {/* Search Bar */}
      <div className="px-2">
         <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search colleagues or roles..." 
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] text-[11px] font-bold outline-none focus:bg-white focus:border-indigo-600 focus:shadow-xl focus:shadow-indigo-500/5 transition-all"
            />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
         
         {/* Departmental / Custom Groups */}
         <div className="space-y-3">
            <div className="flex items-center justify-between px-4">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Channels</h3>
               {isMerchant && (
                 <button 
                   onClick={() => setShowModal(true)}
                   className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                 >
                    <Plus size={14} />
                 </button>
               )}
            </div>
            <div className="space-y-1.5">
               {channels.map((channel) => (
                 <Link 
                   key={channel.id} 
                   href={`/merchant/staff/chat?channel=${channel.id}`}
                   className={`flex items-center gap-4 p-4 rounded-[24px] transition-all group ${
                     activeChannelId === channel.id 
                       ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20" 
                       : "hover:bg-slate-50 text-slate-500"
                   }`}
                 >
                   <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                     activeChannelId === channel.id ? "bg-white/20" : "bg-slate-100"
                   }`}>
                      {(() => {
                        const Icon = IconMap[channel.iconType as keyof typeof IconMap] || MessageSquare;
                        return <Icon size={18} />;
                      })()}
                   </div>
                   <div className="flex-1">
                      <div className="text-[10px] font-black uppercase tracking-widest leading-none">{channel.name}</div>
                      <div className={`text-[8px] mt-1 font-bold ${activeChannelId === channel.id ? "text-white/60" : "text-slate-400"}`}>
                         {channel.type?.replace("DEPARTMENT_", "").replace("CUSTOM_GROUP", "Group")}
                      </div>
                   </div>
                 </Link>
               ))}
            </div>
         </div>

         {/* Colleagues */}
         <div className="space-y-3">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Direct Messages</h3>
            <div className="space-y-1">
               {filteredColleagues.map((colleague) => (
                 <Link 
                   key={colleague.id}
                   href={`/merchant/staff/chat?userId=${colleague.id}`}
                   className="flex items-center gap-4 p-4 rounded-[24px] hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                 >
                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                       {colleague.name?.[0]}
                    </div>
                    <div className="flex-1">
                       <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{colleague.name}</div>
                       <div className="flex items-center gap-2">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{colleague.role}</span>
                          {colleague.phone && (
                            <>
                              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                              <span className="text-[8px] font-bold text-indigo-400 tracking-wider">{colleague.phone}</span>
                            </>
                          )}
                       </div>
                    </div>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-600" />
                 </Link>
               ))}
               {filteredColleagues.length === 0 && (
                 <p className="text-center py-10 text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching colleagues</p>
               )}
            </div>
         </div>
      </div>

      {/* Modal for Creating Channel */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300">
              <div className="space-y-2">
                 <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                    <Plus size={28} />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Create Professional Group</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    This channel will be visible to all staff. Professional AI moderation will be active.
                 </p>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Channel Name</label>
                    <input 
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="e.g. Ramdan Sale Prep" 
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-xs font-black outline-none focus:bg-white focus:border-indigo-600 transition-all"
                    />
                 </div>
              </div>

              <div className="flex gap-4">
                 <button 
                   onClick={() => setShowModal(false)}
                   className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                 >
                    Cancel
                 </button>
                 <button 
                   onClick={handleCreateChannel}
                   disabled={loading || !newChannelName.trim()}
                   className="flex-1 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                 >
                    {loading ? "Creating..." : "Launch Channel"}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
