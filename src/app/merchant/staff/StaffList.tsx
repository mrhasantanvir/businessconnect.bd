"use client";

import React, { useState } from "react";
import { User, Activity, Wallet, Award, Building2, MapPin, Clock, Star, TrendingUp, Shield, Key, Eye, Trash2, ChevronRight, CheckCircle2 } from "lucide-react";
import { resetStaffPasswordAction, approveStaffAction, updateStaffRoleAction } from "./actions";
import { toast } from "sonner";

export function StaffList({ staff, roles }: { staff: any[], roles: any[] }) {
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = async (userId: string) => {
    if (!confirm("Reset password to 'password123'? User will be forced to change it on next login.")) return;
    setIsResetting(true);
    try {
      await resetStaffPasswordAction(userId);
      toast.success("Password reset to 'password123' successfully.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleApprove = async (staffProfileId: string) => {
    if (!confirm("Are you sure you want to approve this personnel? They will be granted full system access.")) return;
    try {
      await approveStaffAction(staffProfileId);
      toast.success("Personnel approved and deployed to duty.");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    try {
      await updateStaffRoleAction(userId, newRoleId === "STAFF" ? null : newRoleId);
      toast.success("Operational role updated successfully.");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {staff.map((member) => (
        <div key={member.id} className="bg-white border border-slate-100 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-16 bg-slate-50/50 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-indigo-50/50 transition-colors" />
          
          <div className="flex flex-col lg:flex-row items-center gap-6 relative z-10">
             {/* Left: Identity */}
             <div className="flex items-center gap-5 min-w-[280px]">
                <div className="relative">
                   <div className="w-16 h-16 bg-slate-900 rounded-[22px] flex items-center justify-center text-[#BEF264] text-xl font-black shadow-xl shadow-slate-200">
                      {member.name.charAt(0)}
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#BEF264] rounded-lg border-4 border-white flex items-center justify-center">
                      <Shield className="w-3 h-3 text-green-900" />
                   </div>
                </div>
                <div>
                   <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{member.name}</h4>
                   <div className="flex items-center gap-2 mt-1">
                      <select 
                         defaultValue={member.customRoleId || "STAFF"}
                         onChange={(e) => handleRoleChange(member.id, e.target.value)}
                         className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 border-none px-2 py-1 rounded-md outline-none cursor-pointer hover:bg-indigo-100 transition-colors"
                      >
                         <option value="STAFF">Operational Force</option>
                         {roles.map(r => (
                           <option key={r.id} value={r.id}>{r.name}</option>
                         ))}
                      </select>
                   </div>
                   {member.staffProfile?.status === "PENDING_APPROVAL" && (
                      <span className="ml-2 text-[8px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md animate-pulse">PENDING APPROVAL</span>
                   )}
                   <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1.5">
                         <Building2 className="w-3 h-3 text-slate-400" />
                         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{member.branch?.name || "Global Command"}</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Middle: Performance Matrix */}
             <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency</span>
                   <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                      </div>
                      <span className="text-sm font-black text-slate-700 italic">92%</span>
                   </div>
                </div>
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Duty</span>
                   <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-black text-slate-700 italic">{member.staffProfile?.attendance || 0} Days</span>
                   </div>
                </div>
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact Val</span>
                   <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-black text-slate-700 italic">৳{member._count?.driverOrders ? (member._count.driverOrders * 1200).toLocaleString() : "0"}</span>
                   </div>
                </div>
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Earnings</span>
                   <div className="flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-black text-slate-900 italic font-black underline decoration-[#BEF264] decoration-2">৳{member.staffProfile?.baseSalary || 0}</span>
                   </div>
                </div>
             </div>

             {/* Right: Security & Ops */}
             <div className="flex items-center gap-2 lg:border-l lg:pl-6 lg:border-slate-100">
                {member.staffProfile?.status === "PENDING_APPROVAL" ? (
                   <button 
                     onClick={() => handleApprove(member.staffProfile.id)}
                     className="px-6 py-3 bg-[#BEF264] text-green-900 hover:bg-[#d4ff80] rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#BEF264]/20 transition-all animate-bounce"
                   >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Deploy
                   </button>
                ) : (
                   <>
                      <button 
                        onClick={() => handleResetPassword(member.id)}
                        className="p-3 bg-slate-50 hover:bg-slate-900 hover:text-[#BEF264] text-slate-400 rounded-2xl transition-all group/btn relative"
                        title="Reset Access Credentials"
                      >
                         <Key className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setSelectedStaff(member)}
                        className="px-6 py-3 bg-slate-900 text-white hover:bg-black rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-100 transition-all"
                      >
                         <Eye className="w-3.5 h-3.5 text-[#BEF264]" />
                         Review Log
                      </button>
                   </>
                )}
             </div>
          </div>
        </div>
      ))}

      {/* Activity Review Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white text-2xl font-black italic">
                  {selectedStaff.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{selectedStaff.name}</h3>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Personnel Activity Archive</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStaff(null)}
                className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-6 rounded-[32px] space-y-1">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Efficiency</p>
                     <h4 className="text-2xl font-black text-slate-900">92% <span className="text-xs text-emerald-500 italic">+4.2%</span></h4>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[32px] space-y-1">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duty Minutes</p>
                     <h4 className="text-2xl font-black text-slate-900">12,450m</h4>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[32px] space-y-1">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Commissions</p>
                     <h4 className="text-2xl font-black text-indigo-600">৳{selectedStaff._count?.commissions || 0}</h4>
                  </div>
               </div>

               <div className="space-y-6">
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 italic">
                     <Clock className="w-4 h-4 text-indigo-600" /> Recent Work Sessions
                  </h5>
                  <div className="space-y-3">
                     {[1,2,3].map(i => (
                        <div key={i} className="flex items-center justify-between p-6 border border-slate-100 rounded-[28px] hover:border-indigo-100 transition-all group">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                 <Activity className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-sm font-black text-slate-800">Branch Dispatch Session</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Apr 21, 2024 • 09:00 AM - 05:30 PM</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-black text-slate-900">510m</p>
                              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Verified</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
               <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all flex items-center gap-2">
                  View Full Detailed Activity Report <ChevronRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
