"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Lock, Save, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { updateProfileAction } from "./actions";

export default function ProfileClient({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    setLoading(true);
    const toastId = toast.loading("Updating profile...");
    try {
      const res = await updateProfileAction({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (res.success) {
        toast.success("Profile updated successfully!", { id: toastId });
        setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      } else {
        toast.error("Failed to update profile", { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full">
           <User className="w-3.5 h-3.5 text-blue-500" />
           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Account Security</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic">
           Personal <span className="text-blue-600">Profile</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                       <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                         type="text"
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                         className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none transition-all"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                       <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                         type="email"
                         value={formData.email}
                         onChange={e => setFormData({...formData, email: e.target.value})}
                         className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none transition-all"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                       <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                         type="tel"
                         value={formData.phone}
                         onChange={e => setFormData({...formData, phone: e.target.value})}
                         className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none transition-all"
                       />
                    </div>
                 </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="space-y-6">
                 <h3 className="text-lg font-black text-slate-900 uppercase italic">Change Password</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                       <div className="relative">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="password"
                            value={formData.currentPassword}
                            onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                            placeholder="Leave blank to keep current password"
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none transition-all"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                       <div className="relative">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="password"
                            value={formData.newPassword}
                            onChange={e => setFormData({...formData, newPassword: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none transition-all"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                       <div className="relative">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="password"
                            value={formData.confirmPassword}
                            onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none transition-all"
                          />
                       </div>
                    </div>
                 </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white rounded-2xl py-5 text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Profile Changes</>}
              </button>
           </form>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                 <ShieldCheck className="w-10 h-10 text-blue-400" />
                 <h4 className="text-xl font-black uppercase italic leading-tight">Your data is <span className="text-blue-400">encrypted</span></h4>
                 <p className="text-xs text-slate-400 font-medium">We use industry-standard encryption to protect your personal information and credentials.</p>
              </div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl" />
           </div>

           <div className="bg-white rounded-[32px] p-8 border border-slate-100 space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</h4>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-xs font-black text-slate-900 uppercase tracking-tight">Active {user.role}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
           </div>
        </div>
      </div>
    </div>
  );
}
