"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, UserMinus, X, CheckCircle } from "lucide-react";
import { getChannelMembersAction, addChannelMemberAction, removeChannelMemberAction } from "./actions";
import { toast } from "sonner";

export function MemberManager({ 
  channelId, 
  allColleagues, 
  onClose 
}: { 
  channelId: string, 
  allColleagues: any[], 
  onClose: () => void 
}) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMembers();
  }, [channelId]);

  const fetchMembers = async () => {
    const res = await getChannelMembersAction(channelId);
    setMembers(res);
    setLoading(false);
  };

  const filteredColleagues = allColleagues.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.role?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const toggleMember = async (userId: string, isMember: boolean) => {
    try {
      if (isMember) {
        await removeChannelMemberAction(channelId, userId);
        toast.success("Member Removed");
      } else {
        await addChannelMemberAction(channelId, userId);
        toast.success("Member Added");
      }
      fetchMembers();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-6 animate-in fade-in duration-300">
       <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 space-y-6 animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between shrink-0">
             <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                   <Users className="text-indigo-600" />
                   Manage Members
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Control channel access & privacy.</p>
             </div>
             <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
                <X size={20} className="text-slate-400" />
             </button>
          </div>

          {/* Search Bar */}
          <div className="shrink-0 relative group">
             <input 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search by name or role..." 
               className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] text-[11px] font-black outline-none focus:bg-white focus:border-indigo-600 transition-all placeholder:text-slate-300"
             />
             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                <Users size={16} />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
             {filteredColleagues.map((colleague) => {
               const isMember = members.some(m => m.userId === colleague.id);
               return (
                 <div 
                   key={colleague.id} 
                   className="flex items-center justify-between p-4 bg-slate-50 rounded-[24px] group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all border border-transparent hover:border-slate-100"
                 >
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black transition-all ${
                         isMember ? "bg-indigo-600 text-white" : "bg-white text-slate-400"
                       }`}>
                          {colleague.name?.[0]}
                       </div>
                       <div>
                          <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{colleague.name}</div>
                          <div className="flex items-center gap-2">
                             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{colleague.role}</span>
                             {colleague.phone && (
                               <span className="text-[8px] font-bold text-indigo-400 tracking-wider">({colleague.phone})</span>
                             )}
                          </div>
                       </div>
                    </div>
                    <button 
                      onClick={() => toggleMember(colleague.id, isMember)}
                      className={`p-3 rounded-xl transition-all ${
                        isMember 
                          ? "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white" 
                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                      }`}
                    >
                       {isMember ? <UserMinus size={16} /> : <UserPlus size={16} />}
                    </button>
                 </div>
               );
             })}
          </div>

          <button 
            onClick={onClose}
            className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
          >
             Done Editing
          </button>
       </div>
    </div>
  );
}
