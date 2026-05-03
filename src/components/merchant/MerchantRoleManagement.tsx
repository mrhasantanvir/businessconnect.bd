"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  X, 
  Loader2,
  Lock,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { getRolesAction, createRoleAction, updateRoleAction, deleteRoleAction } from "@/app/merchant/staff/staffActions";
import { toast } from "sonner";

const AVAILABLE_PERMISSIONS = [
  { key: "orders:view", label: "View Orders", group: "Sales" },
  { key: "orders:manage", label: "Manage Orders", group: "Sales" },
  { key: "pos:access", label: "Access POS", group: "Sales" },
  { key: "inventory:view", label: "View Inventory", group: "Warehouse" },
  { key: "inventory:manage", label: "Manage Inventory", group: "Warehouse" },
  { key: "customers:view", label: "View Customers", group: "CRM" },
  { key: "customers:manage", label: "Manage Customers", group: "CRM" },
  { key: "marketing:manage", label: "Marketing Tools", group: "Growth" },
  { key: "staff:manage", label: "Manage Staff", group: "Admin" },
  { key: "accounting:view", label: "View Financials", group: "Admin" },
  { key: "settings:manage", label: "Store Settings", group: "Admin" },
];

export function MerchantRoleManagement({ roles, onUpdate }: { roles: any[], onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    permissions: [] as string[]
  });

  function handleOpenAdd() {
    setEditingRole(null);
    setFormData({ name: "", permissions: [] });
    setIsModalOpen(true);
  }

  function handleEdit(role: any) {
    setEditingRole(role);
    setFormData({
      name: role.name,
      permissions: JSON.parse(role.permissions)
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name) return;
    setSaving(true);
    try {
      if (editingRole) {
        await updateRoleAction(editingRole.id, formData);
        toast.success("Role updated");
      } else {
        await createRoleAction(formData);
        toast.success("Role created");
      }
      setIsModalOpen(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await deleteRoleAction(id);
      toast.success("Role deleted");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  const togglePermission = (key: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(k => k !== key)
        : [...prev.permissions, key]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-[4px] flex items-center justify-center">
               <Shield className="w-5 h-5" />
            </div>
            <div>
               <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">Access Control</h2>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Define custom roles & permissions</p>
            </div>
         </div>
         <button 
           onClick={handleOpenAdd}
           className="bg-indigo-600 text-white px-4 py-2 rounded-[4px] text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2"
         >
           <Plus className="w-4 h-4" /> Create Role
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const perms = JSON.parse(role.permissions);
          return (
            <div key={role.id} className="bg-white border border-gray-100 rounded-[4px] p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(role)} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-[2px] transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(role.id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-[2px] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
               </div>

               <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-base">{role.name}</h3>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">{role._count.users} Staff Assigned</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-50 rounded-[4px] flex items-center justify-center text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
               </div>

               <div className="space-y-2 mt-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-1">Privileges</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {perms.length > 0 ? perms.slice(0, 4).map((p: string) => (
                      <span key={p} className="text-[9px] font-bold px-2 py-0.5 bg-gray-50 text-gray-600 rounded-[2px] border border-gray-100 uppercase tracking-tighter">
                        {p.split(':')[1]}
                      </span>
                    )) : <span className="text-[10px] text-gray-400 italic">No specific permissions</span>}
                    {perms.length > 4 && <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-[2px] border border-indigo-100">+{perms.length - 4} More</span>}
                  </div>
               </div>
            </div>
          );
        })}
        {roles.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-[4px]">
             <Shield className="w-12 h-12 text-gray-200 mx-auto mb-3" />
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No custom roles defined yet</p>
          </div>
        )}
      </div>

      {/* Role Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-[4px] flex items-center justify-center shadow-lg shadow-indigo-200">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#0F172A] tracking-tight">{editingRole ? "Modify Privilege Group" : "Create Security Role"}</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Define what this role can access</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Role Designation Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Senior Floor Manager"
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-3 text-sm font-bold outline-none focus:border-indigo-600 transition-all placeholder:text-gray-300"
                  />
               </div>

               <div className="space-y-4">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                     <Lock className="w-3.5 h-3.5" /> Functional Permissions
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                     {Array.from(new Set(AVAILABLE_PERMISSIONS.map(p => p.group))).map(group => (
                       <div key={group} className="space-y-2">
                          <h4 className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-[2px] w-fit mb-3">{group} Modules</h4>
                          {AVAILABLE_PERMISSIONS.filter(p => p.group === group).map(perm => (
                            <button
                              key={perm.key}
                              type="button"
                              onClick={() => togglePermission(perm.key)}
                              className={cn(
                                "w-full flex items-center justify-between p-3 rounded-[4px] border transition-all text-left",
                                formData.permissions.includes(perm.key)
                                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm shadow-indigo-100"
                                  : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                              )}
                            >
                               <span className="text-xs font-bold">{perm.label}</span>
                               {formData.permissions.includes(perm.key) ? (
                                 <CheckCircle2 className="w-4 h-4 text-indigo-600 animate-in zoom-in duration-300" />
                               ) : (
                                 <ChevronRight className="w-4 h-4 opacity-30" />
                               )}
                            </button>
                          ))}
                       </div>
                     ))}
                  </div>
               </div>

               <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all rounded-[4px]"
                  >
                    Cancel Changes
                  </button>
                  <button 
                    disabled={saving}
                    className="flex-[2] py-3 bg-[#0F172A] text-[#BEF264] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all rounded-[4px] flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingRole ? "Update Security Role" : "Deploy Security Role"}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
