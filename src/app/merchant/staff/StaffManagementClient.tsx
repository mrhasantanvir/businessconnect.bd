"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Phone,
  Edit3,
  UserSquare2,
  UserMinus,
  UserX,
  UserCheck,
  RotateCcw,
  Smartphone,
  Monitor,
  Check,
  Trash2
} from "lucide-react";
import { 
  createStaffAction, 
  activateStaffAction, 
  requestReuploadAction, 
  getRolesAction,
  resendInvitationAction,
  updateStaffInfoAction,
  terminateStaffAction,
  deleteStaffInvitationAction,
  rejoinStaffAction,
  getStaffDevicesAction,
  authorizeDeviceAction,
  extractNIDDataAction
} from "./staffActions";
import { toast } from "sonner";
import { MerchantRoleManagement } from "@/components/merchant/MerchantRoleManagement";

export function StaffManagementClient({ initialStaff }: { initialStaff: any[] }) {
  const [activeTab, setActiveTab] = useState<"STAFF" | "ROLES">("STAFF");
  const [staff, setStaff] = useState(initialStaff);
  const [roles, setRoles] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRejoinModalOpen, setIsRejoinModalOpen] = useState(false);
  const [isDevicesModalOpen, setIsDevicesModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [staffDevices, setStaffDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedMissingDocs, setSelectedMissingDocs] = useState<string[]>([]);
  const [customDocRequest, setCustomDocRequest] = useState("");

  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    jobRole: "Sales Executive",
    roleId: "",
    wageType: "MONTHLY",
    baseSalary: 15000
  });

  const [selectedRequiredDocs, setSelectedRequiredDocs] = useState<string[]>(["NID"]);
  const [customRequiredDoc, setCustomRequiredDoc] = useState("");

  const loadRoles = useCallback(async () => {
    try {
      const data = await getRolesAction();
      setRoles(data);
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  async function handleTerminate(userId: string) {
    if (!confirm("Are you sure you want to terminate this staff member? This will disable their account immediately.")) return;
    setLoading(true);
    try {
      const res = await terminateStaffAction(userId);
      if (res.success) {
        toast.success("Staff member terminated");
        setActiveMenuId(null);
        // Update local state
        setStaff(prev => prev.map(s => s.id === userId ? { ...s, staffProfile: { ...s.staffProfile, status: "TERMINATED" } } : s));
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const docs = [...selectedRequiredDocs];
      if (customRequiredDoc) docs.push(customRequiredDoc);

      const res = await createStaffAction({ ...newStaff, requiredDocs: docs });
      if (res.success) {
        toast.success("Invitation sent to staff!");
        setIsAddModalOpen(false);
        setNewStaff({ name: "", email: "", jobRole: "Sales Executive", roleId: "", wageType: "MONTHLY", baseSalary: 15000 });
        setSelectedRequiredDocs(["NID"]);
        setCustomRequiredDoc("");
        if (res.staff) {
          setStaff(prev => [res.staff, ...prev]);
        }
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
    if (selectedMissingDocs.length === 0 && !customDocRequest) {
      toast.error("Please select at least one document or specify a reason");
      return;
    }
    setLoading(true);
    try {
      const docs = [...selectedMissingDocs];
      if (customDocRequest) docs.push(customDocRequest);
      
      const res = await requestReuploadAction(id, rejectionReason, docs);
      if (res.success) {
        toast.success("Re-upload request sent");
        setIsReviewModalOpen(false);
        setRejectionReason("");
        setSelectedMissingDocs([]);
        setCustomDocRequest("");
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteInvitation(userId: string) {
    if (!confirm("Are you sure you want to delete this invitation? This will permanently remove the staff record.")) return;
    setLoading(true);
    try {
      const res = await deleteStaffInvitationAction(userId);
      if (res.success) {
        toast.success("Invitation deleted");
        setActiveMenuId(null);
        setStaff(prev => prev.filter(s => s.id !== userId));
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRejoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await rejoinStaffAction(selectedStaff.id, {
        jobRole: selectedStaff.staffProfile.jobRole,
        roleId: selectedStaff.customRoleId || "",
        baseSalary: selectedStaff.staffProfile.baseSalary,
        wageType: selectedStaff.staffProfile.wageType
      });
      if (res.success) {
        toast.success("Staff rejoined successfully!");
        setIsRejoinModalOpen(false);
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }



  async function handleOpenDevices(member: any) {
    setSelectedStaff(member);
    setLoading(true);
    try {
      const devices = await getStaffDevicesAction(member.id);
      setStaffDevices(devices);
      setIsDevicesModalOpen(true);
      setActiveMenuId(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAuthorizeDevice(deviceId: string) {
    setLoading(true);
    try {
      const res = await authorizeDeviceAction(deviceId);
      if (res.success) {
        toast.success(`Device authorized. License price: ৳${res.price}`);
        // Refresh devices
        const devices = await getStaffDevicesAction(selectedStaff.id);
        setStaffDevices(devices);
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
        wageType: selectedStaff.staffProfile.wageType,
        nameEn: selectedStaff.staffProfile.nameEn,
        nameBn: selectedStaff.staffProfile.nameBn,
        nidNumber: selectedStaff.staffProfile.nidNumber,
        dob: selectedStaff.staffProfile.dob,
        fatherName: selectedStaff.staffProfile.fatherName,
        motherName: selectedStaff.staffProfile.motherName,
        permanentAddress: selectedStaff.staffProfile.permanentAddress,
        currentAddress: selectedStaff.staffProfile.currentAddress,
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
      case "TERMINATED": return "bg-red-100 text-red-700 border-red-200";
      case "RE_UPLOAD": return "bg-orange-50 text-orange-600 border-orange-100";
      default: return "bg-gray-50 text-gray-400 border-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-100 rounded-[4px] p-4 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-[4px] flex items-center justify-center">
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
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Onboard Pending</p>
                 <p className="text-xl font-bold text-[#0F172A]">{staff.filter(s => s.staffProfile?.status === "ONBOARDING").length}</p>
              </div>
           </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-[4px] p-4 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-[4px] flex items-center justify-center">
                 <UserX className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Left Staff</p>
                 <p className="text-xl font-bold text-[#0F172A]">{staff.filter(s => s.staffProfile?.status === "TERMINATED").length}</p>
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
          Create Role
        </button>
      </div>

      {activeTab === "ROLES" ? (
        <MerchantRoleManagement roles={roles} onUpdate={loadRoles} />
      ) : (
        <div className="space-y-6">
          {/* Review Required Section - Only for STAFF tab */}
          {activeTab === "STAFF" && staff.filter(s => s.staffProfile?.status === "ONBOARDING" && s.staffProfile?.nidFrontUrl && !s.staffProfile?.missingDocuments).length > 0 && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-[4px] p-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-indigo-600" />
                <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Action Required: Review Onboarding Documents</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.filter(s => s.staffProfile?.status === "ONBOARDING" && s.staffProfile?.nidFrontUrl && !s.staffProfile?.missingDocuments).map(member => (
                  <div key={member.id} className="bg-white border border-indigo-100 rounded-[4px] p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-[4px] flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-slate-900">{member.name}</p>
                        <p className="text-[10px] font-medium text-gray-400">Submitted {member.staffProfile?.updatedAt ? new Date(member.staffProfile.updatedAt).toLocaleDateString() : "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { setSelectedStaff(member); setIsReviewModalOpen(true); }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-[4px] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                      >
                        Review
                      </button>
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === member.id ? null : member.id)}
                          className="p-1.5 hover:bg-indigo-50 text-indigo-400 rounded-[4px] transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeMenuId === member.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-[4px] shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                             <button 
                               onClick={() => handleDeleteInvitation(member.id)}
                               className="w-full px-4 py-2 text-left text-[11px] font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                             >
                                <Trash2 className="w-3.5 h-3.5" /> DELETE INVITATION
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              {staff
                .filter(member => member.staffProfile?.status !== "TERMINATED")
                .map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-[4px] flex items-center justify-center text-indigo-600 font-bold text-[10px] overflow-hidden">
                        {member.image ? (
                          <img src={member.image} className="w-full h-full object-cover" alt={member.name} />
                        ) : (
                          member.name.substring(0, 2).toUpperCase()
                        )}
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
                    <span className={cn(
                      "px-3 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border",
                      member.staffProfile?.status === "ONBOARDING" 
                        ? (member.staffProfile?.missingDocuments ? "bg-orange-50 text-orange-600 border-orange-100" : (member.staffProfile?.nidFrontUrl ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-amber-50 text-amber-600 border-amber-100"))
                        : getStatusStyle(member.staffProfile?.status)
                    )}>
                      {member.staffProfile?.status === "ONBOARDING" 
                        ? (member.staffProfile?.missingDocuments ? "Re-uploading" : (member.staffProfile?.nidFrontUrl ? "Waiting Review" : "Invitation Sent"))
                        : member.staffProfile?.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[13px] font-bold text-[#0F172A]">৳{member.staffProfile?.baseSalary?.toLocaleString()}</p>
                    <p className="text-[10px] font-medium text-gray-400 uppercase">{member.staffProfile?.wageType}</p>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <div className="flex justify-end items-center gap-1">
                      {member.staffProfile?.status === "ONBOARDING" && member.staffProfile?.nidFrontUrl ? (
                        <button 
                          onClick={() => { setSelectedStaff(member); setIsReviewModalOpen(true); }}
                          className="p-1.5 bg-indigo-50 text-indigo-600 rounded-[4px] hover:bg-indigo-100 transition-all inline-flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Review</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => { setSelectedStaff(member); setIsEditModalOpen(true); }}
                          className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-[4px] transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

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
                                 {member.staffProfile?.status !== "ACTIVE" && (
                                   <button 
                                     onClick={() => handleDeleteInvitation(member.id)}
                                     className="w-full px-4 py-2 text-left text-[11px] font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                   >
                                      <Trash2 className="w-3.5 h-3.5" /> DELETE INVITATION
                                   </button>
                                 )}
                                 {member.staffProfile?.status === "TERMINATED" && (
                                   <button 
                                     onClick={() => { setSelectedStaff(member); setIsRejoinModalOpen(true); }}
                                     className="w-full px-4 py-2 text-left text-[11px] font-bold text-green-600 hover:bg-green-50 flex items-center gap-2"
                                   >
                                      <RotateCcw className="w-3.5 h-3.5" /> REJOIN STAFF
                                   </button>
                                 )}
                                 {member.staffProfile?.status !== "TERMINATED" && (
                                   <button 
                                     onClick={() => handleOpenDevices(member)}
                                     className="w-full px-4 py-2 text-left text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                                   >
                                      <Smartphone className="w-3.5 h-3.5" /> MANAGE DEVICES
                                   </button>
                                 )}
                                 {member.staffProfile?.status !== "TERMINATED" && (
                                   <button 
                                     onClick={() => handleTerminate(member.id)}
                                     className="w-full px-4 py-2 text-left text-[11px] font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                   >
                                      <UserX className="w-3.5 h-3.5" /> TERMINATE
                                   </button>
                                 )}
                              </div>
                          )}
                        </div>
                      </div>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

                 <div className="space-y-3 pt-2 border-t border-gray-100">
                     <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Required Documents for Onboarding</label>
                     <div className="flex flex-wrap gap-2">
                        {[
                          { id: "NID", label: "NID Card" },
                          { id: "UTILITY", label: "Utility Bill" },
                          { id: "SSC", label: "SSC Certificate" },
                          { id: "HSC", label: "HSC Certificate" },
                          { id: "HONORS", label: "Honors Certificate" },
                          { id: "MASTERS", label: "Masters Certificate" },
                          { id: "POLICE_CLEARANCE", label: "Police Clearance" },
                          { id: "STUDENT_ID", label: "Student ID Card" },
                          { id: "OTHER", label: "Other Document" }
                        ].map(doc => (
                           <button 
                             key={doc.id}
                             type="button"
                             onClick={() => {
                                setSelectedRequiredDocs(prev => prev.includes(doc.id) ? prev.filter(d => d !== doc.id) : [...prev, doc.id])
                             }}
                             className={cn(
                                "px-3 py-1.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest border transition-all",
                                selectedRequiredDocs.includes(doc.id) ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
                             )}
                           >
                              {doc.label}
                           </button>
                        ))}
                     </div>
                     <input 
                       value={customRequiredDoc}
                       onChange={e => setCustomRequiredDoc(e.target.value)}
                       placeholder="Other Document? (e.g. Police Clearance)"
                       className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-[11px] font-medium outline-none focus:border-indigo-600 transition-all mt-1"
                     />
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

              <form onSubmit={handleUpdateStaff} className="space-y-5 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
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
                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">English Name (NID)</label>
                       <input 
                         value={selectedStaff.staffProfile.nameEn || ""}
                         onChange={e => setSelectedStaff({
                           ...selectedStaff, 
                           staffProfile: { ...selectedStaff.staffProfile, nameEn: e.target.value }
                         })}
                         className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                         placeholder="Name in English"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Bengali Name (NID)</label>
                       <input 
                         value={selectedStaff.staffProfile.nameBn || ""}
                         onChange={e => setSelectedStaff({
                           ...selectedStaff, 
                           staffProfile: { ...selectedStaff.staffProfile, nameBn: e.target.value }
                         })}
                         className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                         placeholder="বাংলা নাম"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">NID Number</label>
                       <input 
                         value={selectedStaff.staffProfile.nidNumber || ""}
                         onChange={e => setSelectedStaff({
                           ...selectedStaff, 
                           staffProfile: { ...selectedStaff.staffProfile, nidNumber: e.target.value }
                         })}
                         className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                         placeholder="1234567890"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Date of Birth</label>
                       <input 
                         type="date"
                         value={selectedStaff.staffProfile.dob ? new Date(selectedStaff.staffProfile.dob).toISOString().split('T')[0] : ""}
                         onChange={e => setSelectedStaff({
                           ...selectedStaff, 
                           staffProfile: { ...selectedStaff.staffProfile, dob: e.target.value }
                         })}
                         className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Father's Name</label>
                       <input 
                         value={selectedStaff.staffProfile.fatherName || ""}
                         onChange={e => setSelectedStaff({
                           ...selectedStaff, 
                           staffProfile: { ...selectedStaff.staffProfile, fatherName: e.target.value }
                         })}
                         className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Mother's Name</label>
                       <input 
                         value={selectedStaff.staffProfile.motherName || ""}
                         onChange={e => setSelectedStaff({
                           ...selectedStaff, 
                           staffProfile: { ...selectedStaff.staffProfile, motherName: e.target.value }
                         })}
                         className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Permanent Address</label>
                    <textarea 
                      value={selectedStaff.staffProfile.permanentAddress || ""}
                      onChange={e => setSelectedStaff({
                        ...selectedStaff, 
                        staffProfile: { ...selectedStaff.staffProfile, permanentAddress: e.target.value }
                      })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all min-h-[60px]"
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Current Address</label>
                    <textarea 
                      value={selectedStaff.staffProfile.currentAddress || ""}
                      onChange={e => setSelectedStaff({
                        ...selectedStaff, 
                        staffProfile: { ...selectedStaff.staffProfile, currentAddress: e.target.value }
                      })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all min-h-[60px]"
                    />
                 </div>

                 <hr className="border-gray-100" />

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
                        placeholder="Sales Executive"
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
                   className="w-full bg-[#1E40AF] text-white py-3 rounded-[4px] font-bold text-xs uppercase tracking-widest hover:bg-[#1E3A8A] transition-all flex items-center justify-center gap-2 sticky bottom-0 shadow-lg"
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
                           <UserSquare2 className="w-3.5 h-3.5 text-indigo-600" /> Identity Details
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                           <div className="bg-gray-50 p-4 rounded-[4px] border border-gray-100">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Father's Name</p>
                              <p className="text-[12px] font-medium text-[#0F172A]">{selectedStaff.staffProfile?.fatherName || "N/A"}</p>
                           </div>
                           <div className="bg-gray-50 p-4 rounded-[4px] border border-gray-100">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mother's Name</p>
                              <p className="text-[12px] font-medium text-[#0F172A]">{selectedStaff.staffProfile?.motherName || "N/A"}</p>
                           </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-[4px] border border-gray-100 mb-6">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">NID Number</p>
                           <p className="text-[13px] font-bold text-[#0F172A]">{selectedStaff.staffProfile?.nidNumber || "N/A"}</p>
                        </div>

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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                           <div className="bg-indigo-50/50 p-4 rounded-[4px] border border-indigo-100">
                              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Bank Account</p>
                              {selectedStaff.staffProfile?.bankDetailsData ? (
                                <div className="space-y-0.5">
                                   <p className="text-[12px] font-bold text-[#0F172A]">{JSON.parse(selectedStaff.staffProfile.bankDetailsData).accountName}</p>
                                   <p className="text-[11px] font-medium text-slate-500">Acc: {JSON.parse(selectedStaff.staffProfile.bankDetailsData).accountNumber}</p>
                                   <p className="text-[10px] font-medium text-slate-400">{JSON.parse(selectedStaff.staffProfile.bankDetailsData).bankName}</p>
                                </div>
                              ) : <p className="text-[11px] text-gray-400">N/A</p>}
                           </div>
                           <div className="bg-rose-50/50 p-4 rounded-[4px] border border-rose-100">
                              <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">Mobile Wallet</p>
                              {selectedStaff.staffProfile?.bankDetailsData ? (
                                <div className="space-y-1">
                                   {JSON.parse(selectedStaff.staffProfile.bankDetailsData).bkash && (
                                     <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-rose-400">bKash</span>
                                        <span className="text-[11px] font-bold text-rose-700">{JSON.parse(selectedStaff.staffProfile.bankDetailsData).bkash}</span>
                                     </div>
                                   )}
                                   {JSON.parse(selectedStaff.staffProfile.bankDetailsData).nagad && (
                                     <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-amber-500">Nagad</span>
                                        <span className="text-[11px] font-bold text-amber-700">{JSON.parse(selectedStaff.staffProfile.bankDetailsData).nagad}</span>
                                     </div>
                                   )}
                                </div>
                              ) : <p className="text-[11px] text-gray-400">N/A</p>}
                           </div>
                        </div>

                        {/* Additional Documents Section */}
                        {selectedStaff.staffProfile?.documents && selectedStaff.staffProfile.documents.length > 0 && (
                          <div className="space-y-3">
                             <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">
                                <FileText className="w-3.5 h-3.5 text-indigo-600" /> Academic & Other Documents
                             </div>
                             <div className="grid grid-cols-1 gap-2">
                                {selectedStaff.staffProfile.documents.map((doc: any) => (
                                   <div key={doc.id} className="bg-white border border-gray-100 p-3 rounded-[4px] flex items-center justify-between group hover:border-indigo-200 transition-all">
                                      <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 bg-gray-50 rounded-[4px] flex items-center justify-center text-gray-400">
                                            <FileText className="w-4 h-4" />
                                         </div>
                                         <p className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{doc.name}</p>
                                      </div>
                                      <a 
                                        href={doc.url} 
                                        target="_blank" 
                                        className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-[2px] text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                                      >
                                         View
                                      </a>
                                   </div>
                                ))}
                             </div>
                          </div>
                        )}
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
               <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Documents to Re-upload</label>
                           <div className="flex flex-wrap gap-2">
                              {["NID Front", "NID Back", "Profile Photo", "CV", "Bank Details"].map(doc => (
                                 <button 
                                   key={doc}
                                   type="button"
                                   onClick={() => {
                                      setSelectedMissingDocs(prev => prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc])
                                   }}
                                   className={cn(
                                      "px-3 py-1.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest border transition-all",
                                      selectedMissingDocs.includes(doc) ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
                                   )}
                                 >
                                    {doc}
                                 </button>
                              ))}
                           </div>
                           <input 
                             value={customDocRequest}
                             onChange={e => setCustomDocRequest(e.target.value)}
                             placeholder="Any other document? (e.g. Electricity Bill)"
                             className="w-full bg-white border border-gray-100 rounded-[4px] px-3 py-2 text-[11px] font-medium outline-none focus:border-red-500 transition-all mt-2"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Re-upload Reason (Visible to Staff)</label>
                           <textarea 
                             value={rejectionReason}
                             onChange={e => setRejectionReason(e.target.value)}
                             className="w-full bg-white border border-gray-100 rounded-[4px] px-3 py-2 text-[11px] font-medium outline-none focus:border-red-500 transition-all min-h-[80px]"
                             placeholder="Describe why these documents are being rejected..."
                           />
                        </div>
                     </div>
                     
                     <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-100">
                        <button 
                          onClick={() => handleRequestReupload(selectedStaff.staffProfile?.id)}
                          disabled={loading || (selectedMissingDocs.length === 0 && !customDocRequest)}
                          className="flex-1 bg-red-600 text-white py-3 rounded-[4px] font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                           {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Request Document Re-upload"}
                        </button>
                        <button 
                          onClick={() => handleActivate(selectedStaff.staffProfile?.id)}
                          disabled={loading}
                          className="md:w-64 bg-indigo-600 text-white py-3 rounded-[4px] font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                        >
                          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Approve & Activate Staff</>}
                        </button>
                     </div>
                  </div>

                  {/* AI NID Extraction Button */}
                  {selectedStaff.staffProfile?.nidFrontUrl && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-[4px] p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-[4px] flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.2 3.2 0 01-.933 2.197A3.2 3.2 0 0115.75 21h-7.5a3.2 3.2 0 01-2.197-.933A3.2 3.2 0 015.25 18l-.347-.347a5 5 0 010-7.072z" /></svg>
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-indigo-900 uppercase tracking-widest">AI NID Extraction</p>
                          <p className="text-[10px] text-indigo-500 mt-0.5">{extractedData ? "Data extracted successfully" : "Auto-fill personal info from NID image"}</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          setExtracting(true);
                          setExtractedData(null);
                          try {
                            const result = await extractNIDDataAction(
                              selectedStaff.staffProfile.nidFrontUrl,
                              selectedStaff.staffProfile.nidBackUrl
                            );
                            if (result.success && result.data) {
                              setExtractedData(result.data);
                              toast.success("NID data extracted! Saving to profile...");
                              // Auto-save extracted data to staff profile
                              await updateStaffInfoAction(selectedStaff.id, {
                                name: result.data.nameEn || result.data.name || selectedStaff.name,
                                jobRole: selectedStaff.staffProfile.jobRole,
                                roleId: selectedStaff.customRoleId || "",
                                baseSalary: selectedStaff.staffProfile.baseSalary,
                                wageType: selectedStaff.staffProfile.wageType,
                                // All new extracted fields
                                nameEn: result.data.nameEn || "",
                                nameBn: result.data.nameBn || "",
                                nidNumber: result.data.nidNumber || "",
                                dob: result.data.dob || "",
                                fatherName: result.data.fatherName || "",
                                motherName: result.data.motherName || "",
                                permanentAddress: result.data.permanentAddress || "",
                              });
                              // Update local state with all extracted fields
                              const updater = (profile: any) => ({
                                ...profile,
                                nidNumber: result.data.nidNumber || profile?.nidNumber,
                                nameEn: result.data.nameEn || profile?.nameEn,
                                nameBn: result.data.nameBn || profile?.nameBn,
                                fatherName: result.data.fatherName || profile?.fatherName,
                                motherName: result.data.motherName || profile?.motherName,
                                permanentAddress: result.data.permanentAddress || profile?.permanentAddress,
                                dob: result.data.dob ? new Date(result.data.dob) : profile?.dob,
                              });
                              setStaff(prev => prev.map(s => s.id === selectedStaff.id ? {
                                ...s,
                                name: result.data.nameEn || result.data.name || s.name,
                                staffProfile: updater(s.staffProfile)
                              } : s));
                              setSelectedStaff((prev: any) => ({
                                ...prev,
                                name: result.data.nameEn || result.data.name || prev.name,
                                staffProfile: updater(prev.staffProfile)
                              }));
                              toast.success(`✅ Saved: ${result.data.nameEn || 'Name'} — NID: ${result.data.nidNumber || 'N/A'}`);
                            } else {
                              toast.error(result.error || "Extraction failed");
                            }
                          } catch (e: any) {
                            toast.error(e.message || "Extraction failed");
                          } finally {
                            setExtracting(false);
                          }
                        }}
                        disabled={extracting}
                        className="shrink-0 px-4 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2 rounded-[4px]"
                      >
                        {extracting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting...</> : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Extract Info</>}
                      </button>
                    </div>
                  )}

                  {/* Extracted Data Preview */}
                  {extractedData && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-[4px] p-4 space-y-3">
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Extracted Data (Auto-Saved)
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {extractedData.nameEn && <div className="bg-white rounded p-2 border border-emerald-100"><p className="text-[9px] text-gray-400 uppercase font-bold">English Name</p><p className="text-[11px] font-bold text-gray-900">{extractedData.nameEn}</p></div>}
                        {extractedData.nameBn && <div className="bg-white rounded p-2 border border-emerald-100"><p className="text-[9px] text-gray-400 uppercase font-bold">বাংলা নাম</p><p className="text-[13px] font-bold text-gray-900">{extractedData.nameBn}</p></div>}
                        {extractedData.nidNumber && <div className="bg-white rounded p-2 border border-emerald-100"><p className="text-[9px] text-gray-400 uppercase font-bold">NID Number</p><p className="text-[11px] font-bold text-gray-900">{extractedData.nidNumber}</p></div>}
                        {extractedData.dob && <div className="bg-white rounded p-2 border border-emerald-100"><p className="text-[9px] text-gray-400 uppercase font-bold">Date of Birth</p><p className="text-[11px] font-bold text-gray-900">{extractedData.dob}</p></div>}
                        {extractedData.fatherName && <div className="bg-white rounded p-2 border border-emerald-100"><p className="text-[9px] text-gray-400 uppercase font-bold">Father</p><p className="text-[11px] font-bold text-gray-900">{extractedData.fatherName}</p></div>}
                        {extractedData.motherName && <div className="bg-white rounded p-2 border border-emerald-100"><p className="text-[9px] text-gray-400 uppercase font-bold">Mother</p><p className="text-[11px] font-bold text-gray-900">{extractedData.motherName}</p></div>}
                        {extractedData.permanentAddress && <div className="bg-white rounded p-2 border border-emerald-100 col-span-2"><p className="text-[9px] text-gray-400 uppercase font-bold">Permanent Address</p><p className="text-[11px] font-bold text-gray-900">{extractedData.permanentAddress}</p></div>}
                      </div>
                    </div>
                  )}
               </div>
           </div>
        </div>
      )}
      {/* Rejoin Staff Modal */}
      {isRejoinModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[4px] w-full max-w-lg p-6 md:p-8 shadow-xl relative animate-in fade-in zoom-in duration-200">
              <button onClick={() => setIsRejoinModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors">
                 <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                 <div className="w-12 h-12 bg-green-50 rounded-[4px] flex items-center justify-center mb-4">
                    <RotateCcw className="w-6 h-6 text-green-600" />
                 </div>
                 <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">Rejoin Staff Member</h2>
                 <p className="text-xs font-medium text-gray-400 mt-1">Update terms for re-employment</p>
              </div>

              <form onSubmit={handleRejoin} className="space-y-5">
                 <div className="bg-amber-50 border border-amber-100 p-4 rounded-[4px] mb-4">
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2">
                       <AlertCircle className="w-3.5 h-3.5" /> Billing Notice
                    </p>
                    <p className="text-[10px] text-amber-600 mt-1 font-medium">Reactivating this staff member will affect your monthly billing according to your subscription plan.</p>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Staff Name</label>
                    <input 
                      disabled
                      value={selectedStaff.name}
                      className="w-full bg-gray-100 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none opacity-60 cursor-not-allowed"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">New Job Designation</label>
                      <input 
                        required
                        value={selectedStaff.staffProfile.jobRole}
                        onChange={e => setSelectedStaff({
                          ...selectedStaff, 
                          staffProfile: { ...selectedStaff.staffProfile, jobRole: e.target.value }
                        })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-green-600 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Security Role</label>
                      <select 
                        value={selectedStaff.customRoleId || ""}
                        onChange={e => setSelectedStaff({...selectedStaff, customRoleId: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-green-600 transition-all appearance-none"
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
                         className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-green-600 transition-all appearance-none"
                       >
                          <option value="MONTHLY">Monthly</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="HOURLY">Hourly</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">New Base Salary (৳)</label>
                       <input 
                         type="number"
                         value={selectedStaff.staffProfile.baseSalary}
                         onChange={e => setSelectedStaff({
                           ...selectedStaff,
                           staffProfile: { ...selectedStaff.staffProfile, baseSalary: parseInt(e.target.value) }
                         })}
                         className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-2 text-sm font-medium outline-none focus:border-green-600 transition-all"
                       />
                    </div>
                 </div>

                 <button 
                   disabled={loading}
                   className="w-full bg-green-600 text-white py-3 rounded-[4px] font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                 >
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Rejoin & Reactivate"}
                 </button>
              </form>
           </div>
        </div>
      )}
      {/* Manage Devices Modal */}
      {isDevicesModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[4px] w-full max-w-2xl p-6 md:p-8 shadow-xl relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
              <button onClick={() => setIsDevicesModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors">
                 <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                 <div className="w-12 h-12 bg-indigo-50 rounded-[4px] flex items-center justify-center mb-4">
                    <Smartphone className="w-6 h-6 text-indigo-600" />
                 </div>
                 <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">Manage Authorized Devices</h2>
                 <p className="text-xs font-medium text-gray-400 mt-1">View and approve login hardware for <strong>{selectedStaff.name}</strong></p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                 {staffDevices.length === 0 ? (
                   <div className="text-center py-12 bg-gray-50 rounded-[4px] border border-dashed border-gray-200">
                      <Monitor className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No devices recorded yet</p>
                   </div>
                 ) : (
                   staffDevices.map((device) => (
                     <div key={device.id} className={cn(
                       "p-4 rounded-[4px] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4",
                       device.isAuthorized ? "bg-white border-gray-100" : "bg-amber-50/50 border-amber-100"
                     )}>
                        <div className="flex items-center gap-4">
                           <div className={cn(
                             "w-10 h-10 rounded-[4px] flex items-center justify-center",
                             device.isAuthorized ? "bg-green-50 text-green-600" : "bg-amber-100 text-amber-600"
                           )}>
                              {device.userAgent?.toLowerCase().includes('mobile') ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                 <p className="text-[13px] font-bold text-[#0F172A]">{device.deviceName || "Unknown Device"}</p>
                                 <span className={cn(
                                   "px-2 py-0.5 rounded-[2px] text-[8px] font-black uppercase tracking-widest border",
                                   device.isAuthorized ? "bg-green-50 text-green-600 border-green-100" : "bg-amber-100 text-amber-600 border-amber-200"
                                 )}>
                                    {device.isAuthorized ? "Authorized" : "Pending Approval"}
                                 </span>
                              </div>
                              <p className="text-[10px] text-gray-400 font-medium truncate max-w-[300px] mt-0.5">{device.userAgent}</p>
                              <div className="flex items-center gap-3 mt-1">
                                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Last used: {new Date(device.lastUsedAt).toLocaleString()}
                                 </p>
                                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                    IP: {device.ipAddress || "Unknown"}
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           {device.isAuthorized ? (
                             <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Licensed</p>
                                <p className="text-[12px] font-black text-green-600">৳{device.license?.price}</p>
                                <p className="text-[8px] font-medium text-gray-400">{new Date(device.license?.activatedAt).toLocaleDateString()}</p>
                             </div>
                           ) : (
                             <button 
                               onClick={() => handleAuthorizeDevice(device.id)}
                               disabled={loading}
                               className="bg-indigo-600 text-white px-4 py-2 rounded-[4px] font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2"
                             >
                                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                Authorize & Add License
                             </button>
                           )}
                        </div>
                     </div>
                   ))
                 )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-[4px]">
                    <div className="flex items-center gap-2 mb-1">
                       <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                       <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Device Licensing Policy</p>
                    </div>
                    <p className="text-[10px] text-blue-600 font-medium leading-relaxed">
                        Authorizing a device will activate a permanent license. The first device costs <strong>৳300</strong>, and each additional device costs <strong>৳250</strong>. Billing starts immediately upon authorization.
                    </p>
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
