"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  Building2, 
  Shield, 
  X, 
  ChevronRight, 
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  Key,
  Eye,
  ArrowRight
} from "lucide-react";
import { StaffList } from "./StaffList";
import Link from "next/link";
import { resetStaffPasswordAction, approveStaffAction } from "./actions";
import { toast } from "sonner";

export default function StaffDirectoryClient({ initialStaff, roles }: { initialStaff: any[], roles: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showAll, setShowAll] = useState(false);

  const filteredStaff = useMemo(() => {
    if (!searchQuery) return initialStaff;
    const q = searchQuery.toLowerCase().trim();
    return initialStaff.filter(s => 
      (s.name?.toLowerCase().includes(q)) || 
      (s.email?.toLowerCase().includes(q)) || 
      (s.phone?.includes(q)) ||
      (s.staffProfile?.jobRole?.toLowerCase().includes(q))
    );
  }, [searchQuery, initialStaff]);

  const displayStaff = showAll ? filteredStaff : filteredStaff.slice(0, 5);

  const handleApprove = async (staffProfileId: string) => {
    try {
      await approveStaffAction(staffProfileId);
      toast.success("Personnel approved.");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">Human Resources</span>
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Personnel<br/>Directory</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Manage, monitor and deploy your operational workforce.</p>
        </div>

        <Link href="/merchant/staff/enroll" className="flex items-center gap-4 bg-slate-900 text-white px-8 py-5 rounded-[32px] hover:bg-black transition-all shadow-2xl shadow-slate-200 group">
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-90 transition-transform">
            <UserPlus className="w-5 h-5 text-[#BEF264]" />
          </div>
          <span className="font-black uppercase tracking-widest text-xs">New Enrollment</span>
        </Link>
      </div>

      {/* Search Console */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
          <Search className="w-6 h-6 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
        </div>
        <input 
          type="text"
          placeholder="Search by Name, Email or Phone Number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-20 pr-8 py-8 bg-white border border-slate-100 rounded-[40px] shadow-2xl shadow-indigo-50/50 outline-none font-black text-slate-900 placeholder:text-slate-300 text-xl tracking-tight focus:ring-4 focus:ring-indigo-50 transition-all"
        />
        {searchQuery && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-slate-100 text-[10px] font-black px-4 py-2 rounded-full uppercase text-slate-500">
            {filteredStaff.length} Result{filteredStaff.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Quick Search Results Popup (only if searching) */}
      {searchQuery && filteredStaff.length > 0 && !showAll && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-500">
           {filteredStaff.slice(0, 6).map(staff => (
             <div 
               key={staff.id} 
               onClick={() => setSelectedProfile(staff)}
               className="p-6 bg-white border border-slate-50 rounded-[32px] shadow-xl shadow-indigo-50/20 hover:border-indigo-100 transition-all cursor-pointer flex items-center gap-4 group"
             >
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-[#BEF264] transition-all">
                   <Users className="w-7 h-7" />
                </div>
                <div>
                   <h4 className="font-black text-slate-900 uppercase tracking-tighter italic leading-tight">{staff.name}</h4>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{staff.phone || staff.email}</p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowRight className="w-4 h-4 text-indigo-600" />
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Main List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-6">
           <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
             {showAll ? 'Active Fleet' : 'Recent Deployments'}
           </h2>
           {!showAll && filteredStaff.length > 5 && (
             <button 
               onClick={() => setShowAll(true)}
               className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all"
             >
               See All Staff <ChevronRight className="w-4 h-4" />
             </button>
           )}
           {showAll && (
             <button 
                onClick={() => setShowAll(false)}
                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"
             >
                Collapse
             </button>
           )}
        </div>
        
        <StaffList staff={displayStaff} roles={roles} />
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-white rounded-[56px] shadow-2xl relative overflow-hidden animate-in zoom-in duration-500">
              <div className="absolute top-0 right-0 p-32 bg-indigo-50/50 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2" />
              
              <button 
                onClick={() => setSelectedProfile(null)}
                className="absolute top-8 right-8 w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all z-20"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative z-10 p-12">
                 <div className="flex items-start gap-8 mb-12">
                    <div className="w-32 h-32 bg-slate-900 rounded-[40px] flex items-center justify-center text-[#BEF264] shadow-2xl shadow-slate-200">
                       <Users className="w-16 h-16" />
                    </div>
                    <div className="space-y-4 py-2">
                       <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${selectedProfile.staffProfile?.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                             {selectedProfile.staffProfile?.status || 'ONBOARDING'}
                          </span>
                       </div>
                       <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">{selectedProfile.name}</h2>
                       <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                             <Phone className="w-3.5 h-3.5 text-slate-400" />
                             <span className="text-xs font-bold text-slate-600">{selectedProfile.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Mail className="w-3.5 h-3.5 text-slate-400" />
                             <span className="text-xs font-bold text-slate-600">{selectedProfile.email}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6 mb-12">
                    <div className="p-6 bg-slate-50 rounded-[32px] space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Role</p>
                       <p className="text-xl font-black text-slate-900 italic uppercase">{selectedProfile.customRole?.name || selectedProfile.staffProfile?.jobRole || 'Standard Unit'}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[32px] space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Node</p>
                       <p className="text-xl font-black text-slate-900 italic uppercase">{selectedProfile.branch?.name || 'Global HQ'}</p>
                    </div>
                    <div className="p-6 bg-indigo-50 rounded-[32px] space-y-1">
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Efficiency Score</p>
                       <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-indigo-600" />
                          <p className="text-xl font-black text-indigo-600 italic uppercase">94% Optimal</p>
                       </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[32px] space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Since</p>
                       <p className="text-xl font-black text-slate-900 italic uppercase">{new Date(selectedProfile.createdAt).toLocaleDateString()}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    {selectedProfile.staffProfile?.status === 'PENDING_APPROVAL' ? (
                       <button 
                         onClick={() => handleApprove(selectedProfile.staffProfile.id)}
                         className="flex-1 py-6 bg-[#BEF264] text-green-900 rounded-[32px] font-black uppercase tracking-widest text-sm shadow-xl shadow-[#BEF264]/20 flex items-center justify-center gap-3 animate-pulse"
                       >
                         <CheckCircle2 className="w-5 h-5" />
                         Confirm & Deploy Unit
                       </button>
                    ) : (
                       <button 
                         onClick={() => {
                            setSelectedProfile(null);
                            toast.info(`Accessing workspace for ${selectedProfile.name}...`);
                         }}
                         className="flex-1 py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest text-sm shadow-2xl shadow-slate-200 flex items-center justify-center gap-3"
                       >
                         <Eye className="w-5 h-5 text-[#BEF264]" />
                         View Full Workspace
                       </button>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
