"use client";

import React, { useState } from "react";
import { 
  User, Camera, MapPin, Briefcase, Clock, 
  CheckCircle2, FileText, ExternalLink, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

interface StaffProfileCardProps {
  user: any;
  isEditable?: boolean;
  onUpdate?: (data: any) => Promise<any>;
  activityStats?: {
    attendance: number;
    totalMinutes: number;
    avgActivityScore: number;
    tasksCompleted: number;
    month: string;
  };
}

export function StaffProfileCard({ user, isEditable = false, onUpdate, activityStats }: StaffProfileCardProps) {
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [tempPosition, setTempPosition] = useState(user.coverPosition || 50);
  const [startY, setStartY] = useState(0);

  const staff = user.staffProfile;
  const storeName = staff?.merchantStore?.name || "BusinessConnect";
  const jobTitle = staff?.jobRole || user.role;
  const joinDate = staff?.approvedAt || user.createdAt;
  const duration = joinDate ? formatDistanceToNow(new Date(joinDate)) : "N/A";

  const handleFileUpload = async (file: File, type: 'avatar' | 'cover') => {
    if (!isEditable || !onUpdate) return;
    const isCover = type === 'cover';
    isCover ? setUploadingCover(true) : setUploadingAvatar(true);
    
    const fd = new FormData();
    fd.append("file", file);
    
    try {
      const res = await fetch("/api/upload/documents", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      await onUpdate({ [isCover ? 'coverImage' : 'image']: data.url });
      toast.success(`${isCover ? 'Cover' : 'Profile'} photo updated!`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isCover ? setUploadingCover(false) : setUploadingAvatar(false);
    }
  };

  const handleRepositionStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isRepositioning) return;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    setStartY(clientY);
  };

  const handleRepositionMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isRepositioning || startY === 0) return;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    const delta = (startY - clientY) / 2;
    const newPos = Math.max(0, Math.min(100, tempPosition + delta));
    setTempPosition(newPos);
    setStartY(clientY);
  };

  const handleSavePosition = async () => {
    if (!onUpdate) return;
    try {
      await onUpdate({ coverPosition: Math.round(tempPosition) });
      setIsRepositioning(false);
      toast.success("Cover position saved!");
    } catch (err: any) {
      toast.error("Failed to save position");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
          {user.coverImage ? (
            <img 
              src={user.coverImage} 
              className="w-full h-full object-cover transition-none pointer-events-none select-none" 
              style={{ objectPosition: `center ${isRepositioning ? tempPosition : (user.coverPosition || 50)}%` }}
              alt="Cover" 
            />
          ) : (
            <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          )}

          {isRepositioning && (
             <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                   <Clock className="w-4 h-4 text-blue-600" />
                   <span className="text-[10px] font-black uppercase text-slate-900">Drag to reposition</span>
                </div>
             </div>
          )}

          {isEditable && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              {!isRepositioning ? (
                <>
                  <button 
                    onClick={() => { setIsRepositioning(true); setTempPosition(user.coverPosition || 50); }}
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
          )}
        </div>

        {/* Profile Info Summary */}
        <div className="px-6 md:px-10 pb-8 relative">
          {/* Avatar */}
          <div className="absolute -top-16 left-6 md:left-10 group">
             <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden relative">
                {user.image ? (
                  <img src={user.image} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                    <User className="w-16 h-16" />
                  </div>
                )}
                {isEditable && (
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                     {uploadingAvatar ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                     <span className="text-[9px] font-black uppercase tracking-widest mt-2">Change Photo</span>
                     <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'avatar')} />
                  </label>
                )}
             </div>
          </div>

          <div className="pt-20 md:pt-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
               <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                 {user.name}
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
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Details */}
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
                   <p className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">{user.name}</p>
                </div>
                <div className="space-y-1.5">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                   <p className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">{user.email}</p>
                </div>
                <div className="space-y-1.5">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                   <p className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">{user.phone || "Not Set"}</p>
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

          {/* Documents */}
          <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-lg shadow-slate-200/40 border border-slate-100 space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Verified Documents</h3>
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                   <FileText className="w-5 h-5" />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
             </div>
          </div>
        </div>

        {/* Sidebar Activity */}
        <div className="space-y-8">
           <div className="bg-white rounded-[32px] p-8 border border-slate-100 space-y-6 shadow-lg shadow-slate-200/40">
              <div className="flex items-center justify-between">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Performance Snapshot ({activityStats?.month || 'This Month'})</h3>
                 <Clock className="w-4 h-4 text-slate-300" />
              </div>
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
                    <p className="text-xl font-black text-slate-900">{activityStats?.attendance ?? staff?.attendance ?? 0} Sessions</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tasks Completed</p>
                    <p className="text-xl font-black text-indigo-600">{activityStats?.tasksCompleted ?? 0} Units</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Activity Score</p>
                    <p className="text-xl font-black text-blue-600">{(activityStats?.avgActivityScore ?? staff?.avgActivityScore ?? 0).toFixed(1)}/100</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Shield(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}
