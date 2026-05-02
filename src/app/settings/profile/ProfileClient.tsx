"use client";

import React, { useState, useEffect } from "react";
import { 
  User, Mail, Phone, Lock, Save, RefreshCw, ShieldCheck, 
  Camera, MapPin, Calendar, Briefcase, FileText, ExternalLink,
  Shield, Key, QrCode, CheckCircle2, AlertCircle, Clock
} from "lucide-react";
import { toast } from "sonner";
import { updateProfileAction } from "./actions";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

export default function ProfileClient({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [tempPosition, setTempPosition] = useState(user.coverPosition || 50);
  const [startY, setStartY] = useState(0);
  
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    image: user.image || "",
    coverImage: user.coverImage || "",
    coverPosition: user.coverPosition || 50,
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const staff = user.staffProfile;
  const storeName = staff?.merchantStore?.name || "BusinessConnect";
  const jobTitle = staff?.jobRole || user.role;
  const joinDate = staff?.approvedAt || user.createdAt;
  const duration = joinDate ? formatDistanceToNow(new Date(joinDate)) : "N/A";

  const handleFileUpload = async (file: File, type: 'avatar' | 'cover') => {
    const isCover = type === 'cover';
    isCover ? setUploadingCover(true) : setUploadingAvatar(true);
    
    const fd = new FormData();
    fd.append("file", file);
    
    try {
      const res = await fetch("/api/upload/documents", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      // Update profile immediately
      await updateProfileAction({ [isCover ? 'coverImage' : 'image']: data.url });
      setFormData(prev => ({ ...prev, [isCover ? 'coverImage' : 'image']: data.url }));
      toast.success(`${isCover ? 'Cover' : 'Profile'} photo updated!`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isCover ? setUploadingCover(false) : setUploadingAvatar(false);
    }
  };

  const handleRepositionStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isRepositioning) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
  };

  const handleRepositionMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isRepositioning || startY === 0) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const delta = (startY - clientY) / 2; // Sensitivity
    const newPos = Math.max(0, Math.min(100, tempPosition + delta));
    setTempPosition(newPos);
    setStartY(clientY);
  };

  const handleSavePosition = async () => {
    try {
      await updateProfileAction({ coverPosition: Math.round(tempPosition) });
      setFormData(prev => ({ ...prev, coverPosition: tempPosition }));
      setIsRepositioning(false);
      toast.success("Cover position saved!");
    } catch (err: any) {
      toast.error("Failed to save position");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    setLoading(true);
    try {
      const res = await updateProfileAction({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (res.success) {
        toast.success("Profile updated successfully!");
        setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section (LinkedIn Style) */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/60 border border-slate-100">
        {/* Cover Photo */}
        <div 
          className={cn(
            "h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-700 relative group overflow-hidden",
            isRepositioning ? "cursor-ns-resize" : ""
          )}
          onMouseDown={handleRepositionStart}
          onMouseMove={handleRepositionMove}
          onMouseUp={() => setStartY(0)}
          onMouseLeave={() => setStartY(0)}
          onTouchStart={handleRepositionStart}
          onTouchMove={handleRepositionMove}
          onTouchEnd={() => setStartY(0)}
        >
          {formData.coverImage ? (
            <img 
              src={formData.coverImage} 
              className="w-full h-full object-cover transition-none pointer-events-none select-none" 
              style={{ objectPosition: `center ${isRepositioning ? tempPosition : formData.coverPosition}%` }}
              alt="Cover" 
            />
          ) : (
            <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          )}

          {isRepositioning ? (
             <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                   <Clock className="w-4 h-4 text-blue-600" />
                   <span className="text-[10px] font-black uppercase text-slate-900">Drag to reposition</span>
                </div>
             </div>
          ) : null}

          <div className="absolute bottom-4 right-4 flex gap-2">
            {!isRepositioning ? (
              <>
                <button 
                  onClick={() => { setIsRepositioning(true); setTempPosition(formData.coverPosition); }}
                  className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-xl text-white hover:bg-black/70 transition-all shadow-lg flex items-center gap-2 border border-white/20"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Reposition</span>
                </button>
                <label className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-xl text-white cursor-pointer hover:bg-black/70 transition-all shadow-lg flex items-center gap-2 border border-white/20">
                  {uploadingCover ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  <span className="text-[10px] font-black uppercase tracking-widest">Change Cover</span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cover')} />
                </label>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsRepositioning(false)}
                  className="px-4 py-2 bg-white rounded-xl text-slate-900 hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2 font-black text-[10px] uppercase"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSavePosition}
                  className="px-4 py-2 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 font-black text-[10px] uppercase"
                >
                  Save Position
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Info Summary */}
        <div className="px-6 md:px-10 pb-8 relative">
          {/* Avatar */}
          <div className="absolute -top-16 left-6 md:left-10 group">
             <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden relative">
                {formData.image ? (
                  <img src={formData.image} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                    <User className="w-16 h-16" />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                   {uploadingAvatar ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                   <span className="text-[9px] font-black uppercase tracking-widest mt-2">Change Photo</span>
                   <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'avatar')} />
                </label>
             </div>
          </div>

          {/* Text Info */}
          <div className="pt-20 md:pt-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
               <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                 {formData.name}
                 <CheckCircle2 className="w-5 h-5 text-blue-500" />
               </h1>
               <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold text-slate-500">
                  <div className="flex items-center gap-1.5 text-indigo-600">
                     <Briefcase className="w-4 h-4" /> {jobTitle}
                  </div>
                  <div className="flex items-center gap-1.5">
                     <MapPin className="w-4 h-4" /> {storeName}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600">
                     <Clock className="w-4 h-4" /> Working for {duration}
                  </div>
               </div>
            </div>
            
            <div className="flex gap-3">
               <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined On</p>
                  <p className="text-sm font-black text-slate-700">{joinDate ? format(new Date(joinDate), 'MMM dd, yyyy') : "N/A"}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details & Docs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal Details Card */}
          <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-lg shadow-slate-200/40 border border-slate-100 space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Personal Details</h3>
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                   <User className="w-5 h-5" />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                   <p className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">{formData.name}</p>
                </div>
                <div className="space-y-1.5">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                   <p className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">{formData.email}</p>
                </div>
                <div className="space-y-1.5">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                   <p className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">{formData.phone || "Not Set"}</p>
                </div>
                {staff && (
                  <>
                    <div className="space-y-1.5">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NID Number</p>
                       <p className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">{staff.nidNumber || "N/A"}</p>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Home Address</p>
                       <p className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">{staff.currentAddress || staff.address || "N/A"}</p>
                    </div>
                  </>
                )}
             </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-lg shadow-slate-200/40 border border-slate-100 space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Verified Documents</h3>
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                   <FileText className="w-5 h-5" />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fixed NID Documents */}
                {staff?.nidFrontUrl && (
                  <a href={staff.nidFrontUrl} target="_blank" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-300 transition-all group">
                     <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                        <Shield className="w-6 h-6" />
                     </div>
                     <div className="flex-1">
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">NID Front Side</p>
                        <p className="text-[10px] font-medium text-slate-400">Official Identity Card</p>
                     </div>
                     <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </a>
                )}
                {staff?.nidBackUrl && (
                  <a href={staff.nidBackUrl} target="_blank" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-300 transition-all group">
                     <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                        <Shield className="w-6 h-6" />
                     </div>
                     <div className="flex-1">
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">NID Back Side</p>
                        <p className="text-[10px] font-medium text-slate-400">Address Verification</p>
                     </div>
                     <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </a>
                )}
                
                {/* Dynamic Additional Documents */}
                {staff?.documents?.map((doc: any) => (
                  <a key={doc.id} href={doc.url} target="_blank" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-300 transition-all group">
                     <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                        <FileText className="w-6 h-6" />
                     </div>
                     <div className="flex-1">
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{doc.name}</p>
                        <p className="text-[10px] font-medium text-slate-400">Supporting Document</p>
                     </div>
                     <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </a>
                ))}

                {(!staff?.documents?.length && !staff?.nidFrontUrl) && (
                   <div className="md:col-span-2 text-center py-10 text-slate-400 italic font-medium text-sm">
                      No documents found in profile.
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Activity Snapshot */}
        <div className="space-y-8">
           <div className="bg-white rounded-[32px] p-8 border border-slate-100 space-y-6 shadow-lg shadow-slate-200/40">
              <div className="flex items-center justify-between">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Monthly Activities</h3>
                 <Calendar className="w-4 h-4 text-slate-300" />
              </div>
              
              <div className="space-y-4">
                 {[
                   { label: "Attendance Rate", value: "98%", color: "text-emerald-500", bg: "bg-emerald-50" },
                   { label: "Tasks Completed", value: "142", color: "text-blue-500", bg: "bg-blue-50" },
                   { label: "Customer Rating", value: "4.9/5", color: "text-amber-500", bg: "bg-amber-50" },
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-500">{stat.label}</p>
                      <div className={cn("px-3 py-1 rounded-lg font-black text-xs", stat.bg, stat.color)}>
                         {stat.value}
                      </div>
                   </div>
                 ))}
              </div>
              
              <p className="text-[9px] text-slate-400 font-medium italic text-center">Detailed performance analytics are available in the team dashboard.</p>
           </div>
        </div>
      </div>

      {/* Security Settings Section (Full Width, Light Mode) at the bottom */}
      <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-lg shadow-slate-200/40 border border-slate-100 space-y-8">
          <div className="flex items-center justify-between">
              <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Security Settings</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage your credentials and 2FA</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <ShieldCheck className="w-6 h-6" />
              </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                          <div className="relative">
                              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input 
                                  type="password"
                                  value={formData.currentPassword}
                                  onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none transition-all"
                                  placeholder="••••••••"
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
                                  placeholder="New password"
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
                                  placeholder="Confirm password"
                              />
                          </div>
                      </div>
                  </div>
                  <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 hover:bg-blue-600 text-white rounded-2xl py-5 text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                      {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Key className="w-4 h-4" /> Update Credentials</>}
                  </button>
              </form>

              <div className="space-y-6">
                  <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
                              <QrCode className="w-6 h-6" />
                          </div>
                          <div>
                              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Two-Factor Authentication</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protect your account with 2FA</p>
                          </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Add an extra layer of security to your account. When enabled, you'll need to enter a code from your authenticator app to log in.
                      </p>
                      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status: Disabled</span>
                          <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-not-allowed">
                              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}

