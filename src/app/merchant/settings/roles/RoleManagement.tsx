"use client";

import React, { useState, useTransition } from "react";
import { 
  Shield, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Lock, 
  Settings, 
  ChevronRight,
  ShieldAlert,
  Save,
  Fingerprint
} from "lucide-react";
import { createRoleAction, deleteRoleAction } from "./actions";
import { PERMISSIONS_LIST } from "./permissions";

export default function RoleManagement({ initialRoles }: { initialRoles: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const togglePermission = (key: string) => {
    setSelectedPermissions(prev => 
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const handleCreate = () => {
    if (!newRoleName) return;
    startTransition(async () => {
      await createRoleAction({ name: newRoleName, permissions: selectedPermissions });
      setShowAdd(false);
      setNewRoleName("");
      setSelectedPermissions([]);
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
         <div className="space-y-1">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <Fingerprint className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Security Layer</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Access<span className="text-indigo-600">Control</span></h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Define custom roles and granular permissions for your team.</p>
         </div>

         <button 
            onClick={() => setShowAdd(!showAdd)}
            className="px-8 py-4 bg-slate-900 text-[#BEF264] rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-2xl flex items-center gap-2"
         >
            {showAdd ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAdd ? "Close Form" : "Add New Role"}
         </button>
      </div>

      {showAdd && (
         <div className="bg-white border-2 border-indigo-100 rounded-[40px] p-10 shadow-2xl shadow-indigo-50 animate-in zoom-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Name</label>
                     <input 
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        placeholder="e.g. Sales Manager"
                        className="w-full px-8 py-5 bg-slate-50 border-none rounded-[24px] font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                     />
                  </div>

                  <div className="p-8 bg-indigo-50/50 rounded-[32px] border border-indigo-100">
                     <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-indigo-600" /> Permissions Matrix
                     </h4>
                     <p className="text-[10px] font-bold text-indigo-600/60 leading-relaxed uppercase tracking-tighter">
                        Select the features this role can access. Granting 'Accounting' permissions will expose financial sensitive data to the staff.
                     </p>
                  </div>

                  <button 
                     onClick={handleCreate}
                     disabled={isPending || !newRoleName}
                     className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                  >
                     <Save className="w-5 h-5" />
                     Create Role
                  </button>
               </div>

               <div className="space-y-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Permissions</label>
                  <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                     {PERMISSIONS_LIST.map(p => (
                        <div 
                           key={p.key}
                           onClick={() => togglePermission(p.key)}
                           className={`p-5 rounded-[24px] border-2 transition-all cursor-pointer flex items-center justify-between group ${selectedPermissions.includes(p.key) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'}`}
                        >
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPermissions.includes(p.key) ? 'bg-white/10' : 'bg-slate-50'}`}>
                                 <Shield className={`w-5 h-5 ${selectedPermissions.includes(p.key) ? 'text-white' : 'text-slate-400'}`} />
                              </div>
                              <div>
                                 <p className="text-[11px] font-black uppercase tracking-tight">{p.label}</p>
                                 <p className={`text-[8px] font-bold uppercase tracking-widest opacity-60`}>{p.category}</p>
                              </div>
                           </div>
                           <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedPermissions.includes(p.key) ? 'bg-white border-white text-indigo-600' : 'border-slate-200'}`}>
                              {selectedPermissions.includes(p.key) && <CheckCircle2 className="w-4 h-4" />}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {initialRoles.map(role => (
            <div key={role.id} className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-sm group hover:shadow-2xl hover:shadow-indigo-50 transition-all relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 bg-slate-50 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-indigo-50 transition-colors" />
               
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="w-16 h-16 bg-slate-900 text-[#BEF264] rounded-[24px] flex items-center justify-center shadow-2xl">
                        <Settings className="w-8 h-8" />
                     </div>
                     <button 
                        onClick={() => {
                           if (confirm("Delete this role? Users assigned to this role will lose access.")) {
                              deleteRoleAction(role.id);
                           }
                        }}
                        className="p-3 bg-rose-50 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-100"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>

                  <div>
                     <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{role.name}</h3>
                     <div className="flex items-center gap-2 mt-2">
                        <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full">
                           {role.permissions.length} PERMISSIONS
                        </div>
                        <div className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full">
                           {role._count?.users || 0} MEMBERS
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50">
                     <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 3).map((p: string) => (
                           <span key={p} className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-50 px-2 py-1 rounded-md">{p.replace(":", " ")}</span>
                        ))}
                        {role.permissions.length > 3 && (
                           <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter px-2 py-1">+{role.permissions.length - 3} MORE</span>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         ))}

         {initialRoles.length === 0 && !showAdd && (
            <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-100 rounded-[56px]">
               <ShieldAlert className="w-16 h-16 text-slate-200 mx-auto mb-6" />
               <p className="text-xl font-black text-slate-300 uppercase tracking-tighter">No custom roles found.</p>
               <button 
                  onClick={() => setShowAdd(true)}
                  className="mt-6 text-indigo-600 font-black uppercase tracking-widest text-[10px] hover:underline"
               >
                  Add First Role
               </button>
            </div>
         )}
      </div>

    </div>
  );
}
