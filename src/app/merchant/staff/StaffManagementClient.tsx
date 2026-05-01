"use client";

import React, { useState, useEffect } from "react";
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
import { 
  createStaffAction, 
  activateStaffAction, 
  requestReuploadAction, 
  getRolesAction,
  resendInvitationAction,
  updateStaffInfoAction 
} from "./staffActions";
import { toast } from "sonner";
import { MerchantRoleManagement } from "@/components/merchant/MerchantRoleManagement";

export function StaffManagementClient({ initialStaff }: { initialStaff: any[] }) {
  const [activeTab, setActiveTab] = useState<"STAFF" | "ROLES">("STAFF");
  const [staff, setStaff] = useState(initialStaff);
  const [roles, setRoles] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    jobRole: "Sales Executive",
    roleId: "",
    wageType: "MONTHLY",
    baseSalary: 15000
  });

  useEffect(() => {
    async function loadRoles() {
      const data = await getRolesAction();
      setRoles(data);
    }
    loadRoles();
  }, []);

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createStaffAction(newStaff);
      if (res.success) {
        toast.success("Invitation sent to staff!");
        setIsAddModalOpen(false);
        setNewStaff({ name: "", email: "", jobRole: "Sales Executive", roleId: "", wageType: "MONTHLY", baseSalary: 15000 });
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

  async function handleResendInvitation(id: string) {
    setLoading(true);
    try {
      const res = await resendInvitationAction(id);
      if (res.success) {
        toast.success("Invitation resent with new credentials");
        setActiveMenuId(null);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStaff(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateStaffInfoAction(selectedStaff.id, {
        name: selectedStaff.name,
        jobRole: selectedStaff.staffProfile.jobRole,
        roleId: selectedStaff.customRoleId || "",
        baseSalary: selectedStaff.staffProfile.baseSalary,
        wageType: selectedStaff.staffProfile.wageType
      });
      if (res.success) {
        toast.success("Staff profile updated");
        setIsEditModalOpen(false);
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
        <div className="bg-white border border-gray-100 rounded-[4px] p-4 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-[4px] flex items-center justify-center">
                 <Users className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Staff</p>
                 <p className="text-xl font-bold text-[#0F172A]">{staff.length}</p>
              </div>
           </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-[4px] p-4 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-[4px] flex items-center justify-center">
                 <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</p>
                 <p className="text-xl font-bold text-[#0F172A]">{staff.filter(s => s.staffProfile?.status === "ACTIVE").length}</p>
              </div>
           </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-[4px] p-4 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-[4px] flex items-center justify-center">
                 <Clock className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Onboarding</p>
                 <p className="text-xl font-bold text-[#0F172A]">{staff.filter(s => s.staffProfile?.status === "ONBOARDING").length}</p>
              </div>
           </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#1E40AF] text-white rounded-[4px] p-4 shadow-sm hover:bg-[#1E3A8A] transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-widest">Invite Staff</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-[4px] w-fit">
        <button 
          onClick={() => setActiveTab("STAFF")}
          className={cn(
            "px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-[4px]",
            activeTab === "STAFF" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
          )}
        >
          Staff Directory
        </button>
        <button 
          onClick={() => setActiveTab("ROLES")}
          className={cn(
            "px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-[4px]",
            activeTab === "ROLES" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
          )}
        >
          Security Roles
        </button>
      </div>

      {activeTab === "ROLES" ? (
        <MerchantRoleManagement />
      ) : (
        <div className="bg-white border border-gray-100 rounded-[4px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Staff Name</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Salary</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-[4px] flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#0F172A]">{member.name}</p>
                        <p className="text-[11px] font-medium text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[13px] font-medium text-[#0F172A]">{member.staffProfile?.jobRole}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(member.staffProfile?.status)}`}>
                      {member.staffProfile?.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[13px] font-bold text-[#0F172A]">৳{member.staffProfile?.baseSalary.toLocaleString()}</p>
                    <p className="text-[10px] font-medium text-gray-400 uppercase">{member.staffProfile?.wageType}</p>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    {member.staffProfile?.status === "ONBOARDING" && member.staffProfile?.nidFrontUrl ? (
                      <button 
                        onClick={() => { setSelectedStaff(member); setIsReviewModalOpen(true); }}
                        className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-[4px] transition-all inline-flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Review</span>
                      </button>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => { setSelectedStaff(member); setIsEditModalOpen(true); }}
                          className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-[4px] transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === member.id ? null : member.id)}
                            className="p-1.5 hover:bg-gray-100 text-gray-400 rounded-[4px] transition-all"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {activeMenuId === member.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-[4px] shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                               <button 
                                 onClick={() => handleResendInvitation(member.id)}
                                 className="w-full px-4 py-2 text-left text-[11px] font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                               >
                                  <Mail className="w-3.5 h-3.5" /> RESEND INVITATION
                               </button>
                               <button className="w-full px-4 py-2 text-left text-[11px] font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                  <X className="w-3.5 h-3.5" /> TERMINATE
                               </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[4px] w-full max-w-lg p-6 md:p-8 shadow-xl relative animate-in fade-in zoom-in duration-200">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors">
                 <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                 <div className="w-12 h-12 bg-indigo-50 rounded-[4px] flex items-center justify-center mb-4">
                    <UserPlus className="w-6 h-6 text-indigo-600" />
                 </div>
                 <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">Invite New Staff</h2>
                 <p className="text-xs font-medium text-gray-400 mt-1">Start the onboarding process</p>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-5">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Staff Name</label>
                       <input 
                         required
                         value={newStaff.name}
                         onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                         placeholder="John Doe"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Email ID</label>
                       <input 
                         required
                         type="email"
                         value={newStaff.email}
                         onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                         placeholder="staff@example.com"
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Job Designation</label>
                      <input 
                        required
                        value={newStaff.jobRole}
                        onChange={e => setNewStaff({...newStaff, jobRole: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                        placeholder="Sales Executive"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Security Role</label>
                      <select 
                        value={newStaff.roleId}
                        onChange={e => setNewStaff({...newStaff, roleId: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all appearance-none"
                      >
                        <option value="">Default Permissions</option>
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Wage Type</label>
                       <select 
                         value={newStaff.wageType}
                         onChange={e => setNewStaff({...newStaff, wageType: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all appearance-none"
                       >
                          <option value="MONTHLY">Monthly</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="HOURLY">Hourly</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Base Salary (৳)</label>
                       <input 
                         type="number"
                         value={newStaff.baseSalary}
                         onChange={e => setNewStaff({...newStaff, baseSalary: parseInt(e.target.value)})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                       />
                    </div>
                 </div>

                 <button 
                   disabled={loading}
                   className="w-full bg-[#1E40AF] text-white py-3 rounded-[4px] font-bold text-xs uppercase tracking-widest hover:bg-[#1E3A8A] transition-all flex items-center justify-center gap-2"
                 >
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invitation"}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {isEditModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[4px] w-full max-w-lg p-6 md:p-8 shadow-xl relative animate-in fade-in zoom-in duration-200">
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors">
                 <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                 <div className="w-12 h-12 bg-indigo-50 rounded-[4px] flex items-center justify-center mb-4">
                    <Edit3 className="w-6 h-6 text-indigo-600" />
                 </div>
                 <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">Edit Staff Profile</h2>
                 <p className="text-xs font-medium text-gray-400 mt-1">Update professional details</p>
              </div>

              <form onSubmit={handleUpdateStaff} className="space-y-5">
                 <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Staff Name</label>
                    <input 
                      required
                      value={selectedStaff.name}
                      onChange={e => setSelectedStaff({...selectedStaff, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Job Designation</label>
                      <input 
                        required
                        value={selectedStaff.staffProfile.jobRole}
                        onChange={e => setSelectedStaff({
                          ...selectedStaff, 
                          staffProfile: { ...selectedStaff.staffProfile, jobRole: e.target.value }
                        })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Security Role</label>
                      <select 
                        value={selectedStaff.customRoleId || ""}
                        onChange={e => setSelectedStaff({...selectedStaff, customRoleId: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all appearance-none"
                      >
                        <option value="">Default Permissions</option>
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Wage Type</label>
                       <select 
                         value={selectedStaff.staffProfile.wageType}
                         onChange={e => setSelectedStaff({
                           ...selectedStaff,
                           staffProfile: { ...selectedStaff.staffProfile, wageType: e.target.value }
                         })}
                         className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all appearance-none"
                       >
                          <option value="MONTHLY">Monthly</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="HOURLY">Hourly</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Base Salary (৳)</label>
                       <input 
                         type="number"
                         value={selectedStaff.staffProfile.baseSalary}
                         onChange={e => setSelectedStaff({
                           ...selectedStaff,
                           staffProfile: { ...selectedStaff.staffProfile, baseSalary: parseInt(e.target.value) }
                         })}
                         className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                       />
                    </div>
                 </div>

                 <button 
                   disabled={loading}
                   className="w-full bg-[#1E40AF] text-white py-3 rounded-[4px] font-bold text-xs uppercase tracking-widest hover:bg-[#1E3A8A] transition-all flex items-center justify-center gap-2"
                 >
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Review Onboarding Modal */}
      {isReviewModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[4px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl relative animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-[4px] flex items-center justify-center text-indigo-600 font-bold text-sm">
                       {selectedStaff.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                       <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">{selectedStaff.name}</h2>
                       <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Review Staff Profile</p>
                    </div>
                 </div>
                 <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                 {/* Documents Section */}
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">
                       <FileText className="w-3.5 h-3.5 text-indigo-600" /> Identity Documents
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">NID Front</p>
                          <div className="aspect-[1.6/1] bg-gray-50 rounded-[4px] border border-gray-100 overflow-hidden group relative">
                             <img src={selectedStaff.staffProfile?.nidFrontUrl} alt="NID Front" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a href={selectedStaff.staffProfile?.nidFrontUrl} target="_blank" className="bg-white text-[#0F172A] px-3 py-1.5 rounded-[2px] text-[10px] font-bold uppercase tracking-widest">View</a>
                             </div>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">NID Back</p>
                          <div className="aspect-[1.6/1] bg-gray-50 rounded-[4px] border border-gray-100 overflow-hidden group relative">
                             <img src={selectedStaff.staffProfile?.nidBackUrl} alt="NID Back" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a href={selectedStaff.staffProfile?.nidBackUrl} target="_blank" className="bg-white text-[#0F172A] px-3 py-1.5 rounded-[2px] text-[10px] font-bold uppercase tracking-widest">View</a>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Profile Details */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Address Details
                       </div>
                       <div className="space-y-3">
                          <div className="bg-gray-50 p-4 rounded-[4px] border border-gray-100">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Permanent Address</p>
                             <p className="text-[13px] font-medium text-[#0F172A]">{selectedStaff.staffProfile?.permanentAddress || "N/A"}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-[4px] border border-gray-100">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Address</p>
                             <p className="text-[13px] font-medium text-[#0F172A]">{selectedStaff.staffProfile?.currentAddress || "N/A"}</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">
                          <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Financial Info
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-indigo-50/50 p-4 rounded-[4px] border border-indigo-100">
                             <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Bank Account</p>
                             <p className="text-[12px] font-medium text-[#0F172A] leading-relaxed">
                                {selectedStaff.staffProfile?.bankDetailsData ? JSON.parse(selectedStaff.staffProfile.bankDetailsData).accountName : "N/A"}
                             </p>
                          </div>
                          <div className="bg-rose-50/50 p-4 rounded-[4px] border border-rose-100">
                             <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">Mobile Wallet</p>
                             <div className="space-y-0.5">
                                <p className="text-[11px] font-medium text-[#0F172A]">bKash: {selectedStaff.staffProfile?.bankDetailsData ? JSON.parse(selectedStaff.staffProfile.bankDetailsData).bkash : "N/A"}</p>
                                <p className="text-[11px] font-medium text-[#0F172A]">Nagad: {selectedStaff.staffProfile?.bankDetailsData ? JSON.parse(selectedStaff.staffProfile.bankDetailsData).nagad : "N/A"}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* CV Section */}
                 <div className="bg-slate-900 rounded-[4px] p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white/10 rounded-[4px] flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#BEF264]" />
                       </div>
                       <div>
                          <p className="text-sm font-bold tracking-tight">Professional CV</p>
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Candidate Resume</p>
                       </div>
                    </div>
                    <a href={selectedStaff.staffProfile?.cvUrl} target="_blank" className="bg-[#BEF264] text-black px-4 py-2 rounded-[2px] font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Download</a>
                 </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-gray-50 bg-gray-50/30">
                 <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-1.5">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Re-upload Reason</label>
                       <div className="flex gap-2">
                          <input 
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            className="flex-1 bg-white border border-gray-100 rounded-[4px] px-3 py-2 text-xs font-medium outline-none focus:border-red-500 transition-all"
                            placeholder="Reason for re-upload..."
                          />
                          <button 
                            onClick={() => handleRequestReupload(selectedStaff.staffProfile?.id)}
                            disabled={loading || !rejectionReason}
                            className="px-4 bg-red-50 text-red-600 rounded-[4px] font-bold text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                          >
                            Request
                          </button>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleActivate(selectedStaff.staffProfile?.id)}
                      disabled={loading}
                      className="md:w-48 bg-indigo-600 text-white rounded-[4px] font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Activate</>}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
