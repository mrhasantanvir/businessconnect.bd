"use client";

import React, { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  Mail,
  ShieldCheck,
  X,
  Loader2,
  FileText,
  CreditCard,
  Building2,
  Phone
} from "lucide-react";
import { createStaffAction, activateStaffAction, requestReuploadAction } from "./staffActions";
import { toast } from "sonner";

export function StaffManagementClient({ initialStaff }: { initialStaff: any[] }) {
  const [staff, setStaff] = useState(initialStaff);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "Sales Executive",
    wageType: "MONTHLY",
    baseSalary: 15000
  });

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createStaffAction(newStaff);
      if (res.success) {
        toast.success("Invitation sent to staff!");
        setIsAddModalOpen(false);
        setNewStaff({ name: "", email: "", role: "Sales Executive", wageType: "MONTHLY", baseSalary: 15000 });
        // Refresh would happen via revalidatePath, but for UI we might want to reload
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleActivate(id: string) {
    setLoading(true);
    try {
      const res = await activateStaffAction(id);
      if (res.success) {
        toast.success("Staff activated successfully!");
        setIsReviewModalOpen(false);
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestReupload(id: string) {
    if (!rejectionReason) {
      toast.error("Please provide a reason for re-upload");
      return;
    }
    setLoading(true);
    try {
      const res = await requestReuploadAction(id, rejectionReason);
      if (res.success) {
        toast.success("Re-upload request sent");
        setIsReviewModalOpen(false);
        setRejectionReason("");
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-50 text-green-600 border-green-100";
      case "ONBOARDING": return "bg-amber-50 text-amber-600 border-amber-100";
      case "PENDING_APPROVAL": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "REJECTED": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-gray-50 text-gray-400 border-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                 <Users className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Staff</p>
                 <p className="text-2xl font-black text-[#0F172A]">{staff.length}</p>
              </div>
           </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                 <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active</p>
                 <p className="text-2xl font-black text-[#0F172A]">{staff.filter(s => s.staffProfile?.status === "ACTIVE").length}</p>
              </div>
           </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                 <Clock className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Onboarding</p>
                 <p className="text-2xl font-black text-[#0F172A]">{staff.filter(s => s.staffProfile?.status === "ONBOARDING").length}</p>
              </div>
           </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#1E40AF] text-white rounded-[32px] p-6 shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <UserPlus className="w-6 h-6" />
          <span className="font-black text-xs uppercase tracking-widest">Invite New Staff</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Salary</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#0F172A]">{member.name}</p>
                        <p className="text-[10px] font-bold text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-[#0F172A]">{member.staffProfile?.jobRole}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(member.staffProfile?.status)}`}>
                      {member.staffProfile?.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-[#0F172A]">৳{member.staffProfile?.baseSalary.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{member.staffProfile?.wageType}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {member.staffProfile?.status === "ONBOARDING" && member.staffProfile?.nidFrontUrl ? (
                      <button 
                        onClick={() => { setSelectedStaff(member); setIsReviewModalOpen(true); }}
                        className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all inline-flex items-center gap-2"
                      >
                        <Eye className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Review Profile</span>
                      </button>
                    ) : (
                      <button className="p-2 hover:bg-gray-100 text-gray-400 rounded-xl transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[40px] w-full max-w-lg p-8 md:p-10 shadow-2xl relative animate-in fade-in zoom-in duration-300">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition-colors">
                 <X className="w-6 h-6" />
              </button>
              
              <div className="mb-8">
                 <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                    <UserPlus className="w-8 h-8 text-indigo-600" />
                 </div>
                 <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Invite New Staff</h2>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Start the onboarding process</p>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Staff Name</label>
                       <input 
                         required
                         value={newStaff.name}
                         onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                         placeholder="John Doe"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email ID</label>
                       <input 
                         required
                         type="email"
                         value={newStaff.email}
                         onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                         placeholder="staff@example.com"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Job Role</label>
                    <select 
                      value={newStaff.role}
                      onChange={e => setNewStaff({...newStaff, role: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:border-indigo-600 transition-all appearance-none"
                    >
                       <option value="Sales Executive">Sales Executive</option>
                       <option value="Support Agent">Support Agent</option>
                       <option value="Inventory Manager">Inventory Manager</option>
                       <option value="Delivery Person">Delivery Person</option>
                       <option value="Store Admin">Store Admin</option>
                    </select>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Wage Type</label>
                       <select 
                         value={newStaff.wageType}
                         onChange={e => setNewStaff({...newStaff, wageType: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:border-indigo-600 transition-all appearance-none"
                       >
                          <option value="MONTHLY">Monthly</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="HOURLY">Hourly</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Base Salary (৳)</label>
                       <input 
                         type="number"
                         value={newStaff.baseSalary}
                         onChange={e => setNewStaff({...newStaff, baseSalary: parseInt(e.target.value)})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                       />
                    </div>
                 </div>

                 <button 
                   disabled={loading}
                   className="w-full bg-[#1E40AF] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1E3A8A] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                 >
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invitation"}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Review Onboarding Modal */}
      {isReviewModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-in fade-in slide-in-from-bottom-8 duration-500">
              {/* Header */}
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">
                       {selectedStaff.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">{selectedStaff.name}</h2>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Review Staff Onboarding Profile</p>
                    </div>
                 </div>
                 <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                 {/* Documents Section */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0F172A]">
                       <FileText className="w-4 h-4 text-indigo-600" /> Identity Documents
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NID Front Part</p>
                          <div className="aspect-[1.6/1] bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden group relative">
                             <img src={selectedStaff.staffProfile?.nidFrontUrl} alt="NID Front" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a href={selectedStaff.staffProfile?.nidFrontUrl} target="_blank" className="bg-white text-[#0F172A] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">View Full Size</a>
                             </div>
                          </div>
                       </div>
                       <div className="space-y-3">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NID Back Part</p>
                          <div className="aspect-[1.6/1] bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden group relative">
                             <img src={selectedStaff.staffProfile?.nidBackUrl} alt="NID Back" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a href={selectedStaff.staffProfile?.nidBackUrl} target="_blank" className="bg-white text-[#0F172A] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">View Full Size</a>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Profile Details */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                       <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0F172A]">
                          <Building2 className="w-4 h-4 text-indigo-600" /> Address Details
                       </div>
                       <div className="space-y-4">
                          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Permanent Address (AI Extracted)</p>
                             <p className="text-xs font-bold text-[#0F172A]">{selectedStaff.staffProfile?.permanentAddress || "Not provided"}</p>
                          </div>
                          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Address</p>
                             <p className="text-xs font-bold text-[#0F172A]">{selectedStaff.staffProfile?.currentAddress || "Not provided"}</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0F172A]">
                          <CreditCard className="w-4 h-4 text-indigo-600" /> Financial Info
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                             <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">Bank Account</p>
                             <p className="text-[10px] font-bold text-[#0F172A] leading-relaxed">
                                {selectedStaff.staffProfile?.bankDetailsData ? JSON.parse(selectedStaff.staffProfile.bankDetailsData).accountName : "N/A"}
                             </p>
                          </div>
                          <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100">
                             <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Mobile Wallet</p>
                             <div className="space-y-1">
                                <p className="text-[10px] font-bold text-[#0F172A]">bKash: {selectedStaff.staffProfile?.bankDetailsData ? JSON.parse(selectedStaff.staffProfile.bankDetailsData).bkash : "N/A"}</p>
                                <p className="text-[10px] font-bold text-[#0F172A]">Nagad: {selectedStaff.staffProfile?.bankDetailsData ? JSON.parse(selectedStaff.staffProfile.bankDetailsData).nagad : "N/A"}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* CV Section */}
                 <div className="bg-slate-900 rounded-3xl p-8 text-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-[#BEF264]" />
                       </div>
                       <div>
                          <p className="text-lg font-black tracking-tight leading-none mb-1">Professional CV</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Candidate Resume File</p>
                       </div>
                    </div>
                    <a href={selectedStaff.staffProfile?.cvUrl} target="_blank" className="bg-[#BEF264] text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Download CV</a>
                 </div>
              </div>

              {/* Actions Footer */}
              <div className="p-8 border-t border-gray-50 bg-gray-50/30">
                 <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Rejection Reason / Re-upload Request</label>
                       <div className="flex gap-2">
                          <input 
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            className="flex-1 bg-white border border-gray-100 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-red-500 transition-all"
                            placeholder="e.g. NID image is blurry. Please upload again."
                          />
                          <button 
                            onClick={() => handleRequestReupload(selectedStaff.staffProfile?.id)}
                            disabled={loading || !rejectionReason}
                            className="px-6 bg-red-50 text-red-600 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                          >
                            Request Re-upload
                          </button>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleActivate(selectedStaff.staffProfile?.id)}
                      disabled={loading}
                      className="md:w-64 bg-[#1E40AF] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1E3A8A] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Activate Staff</>}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
