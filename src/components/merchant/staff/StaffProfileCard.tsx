"use client";

import React, { useState } from "react";
import { 
  User, Camera, MapPin, Briefcase, Clock, 
  CheckCircle2, FileText, ExternalLink, RefreshCw, Download, UploadCloud, Trash2, FileUp
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

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const handleDocumentUpload = async (file: File, field: string, docId?: string) => {
    if (!isEditable || !onUpdate) return;
    
    // 1MB limit check
    if (file.size > 1 * 1024 * 1024) {
      toast.error("File size must be less than 1MB");
      return;
    }

    setUploadingDoc(field === 'other' ? docId || 'new' : field);
    
    const fd = new FormData();
    fd.append("file", file);
    
    try {
      const res = await fetch("/api/upload/documents", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      if (field === 'nidFrontUrl' || field === 'nidBackUrl' || field === 'utilityBillUrl') {
         await onUpdate({ [field]: data.url });
      } else if (field === 'other' && docId) {
         // Update existing other document
         const updatedDocs = staff.documents.map((d: any) => d.id === docId ? { ...d, url: data.url } : d);
         await onUpdate({ documents: updatedDocs });
      }
      
      toast.success("Document updated successfully!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploadingDoc(null);
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
      <div className="bg-white rounded-none overflow-hidden shadow-2xl shadow-slate-200/60 border border-slate-100">
        {/* Cover Photo */}
        <div 
          className={cn(
            "h-48 md:h-64 bg-slate-900 relative group overflow-hidden",
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
              className="w-full h-full object-cover transition-none pointer-events-none select-none rounded-none" 
              style={{ objectPosition: `center ${isRepositioning ? tempPosition : (user.coverPosition || 50)}%` }}
              alt="Cover" 
            />
          ) : (
            <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          )}

          {isRepositioning && (
             <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-none shadow-lg flex items-center gap-2">
                   <Clock className="w-4 h-4 text-slate-900" />
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
                    className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-none text-white hover:bg-black/70 transition-all shadow-lg flex items-center gap-2 border border-white/20"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Reposition</span>
                  </button>
                  <label className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-none text-white cursor-pointer hover:bg-black/70 transition-all shadow-lg flex items-center gap-2 border border-white/20">
                    {uploadingCover ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">Change Cover</span>
                    <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cover')} />
                  </label>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsRepositioning(false)}
                    className="px-4 py-2 bg-white rounded-none text-slate-900 hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2 font-black text-[10px] uppercase"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSavePosition}
                    className="px-4 py-2 bg-slate-900 rounded-none text-white hover:bg-black transition-all shadow-lg flex items-center gap-2 font-black text-[10px] uppercase"
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
             <div className="w-32 h-32 md:w-40 md:h-40 rounded-none border-4 border-white bg-white shadow-2xl overflow-hidden relative">
                {user.image ? (
                  <img src={user.image} className="w-full h-full object-cover rounded-none" alt="Avatar" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 rounded-none">
                    <User className="w-16 h-16" />
                  </div>
                )}
                {isEditable && (
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px] rounded-none">
                     {uploadingAvatar ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                     <span className="text-[9px] font-black uppercase tracking-widest mt-2 text-center px-2">Change Photo</span>
                     <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'avatar')} />
                  </label>
                )}
             </div>
          </div>

          <div className="pt-20 md:pt-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2 italic">
                 {user.name}
                 <CheckCircle2 className="w-5 h-5 text-blue-500" />
               </h1>
               <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5 text-slate-900">
                     <Briefcase className="w-4 h-4" /> {jobTitle}
                  </div>
                  <div className="flex items-center gap-1.5">
                     <MapPin className="w-4 h-4" /> {storeName}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600">
                     <Clock className="w-4 h-4" /> Joined {duration} ago
                  </div>
               </div>
            </div>
            
            <div className="flex gap-3">
               <div className="px-6 py-3 bg-slate-50 rounded-none border border-slate-100 text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registration Date</p>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{joinDate ? format(new Date(joinDate), 'MMMM dd, yyyy') : "N/A"}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Details */}
          <div className="bg-white rounded-none p-8 md:p-12 shadow-2xl shadow-slate-200/40 border border-slate-100 space-y-10">
             <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Personal Details</h3>
                <div className="w-10 h-10 bg-slate-900 rounded-none flex items-center justify-center text-white">
                   <User className="w-5 h-5" />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                 <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</p>
                    <p className="text-sm font-semibold text-slate-900 bg-slate-50 px-5 py-4 rounded-none border-l-2 border-slate-900 tracking-tight">{user.name}</p>
                 </div>
                 <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-semibold text-slate-900 bg-slate-50 px-5 py-4 rounded-none border-l-2 border-slate-900 lowercase tracking-tight">{user.email}</p>
                 </div>
                 <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-sm font-semibold text-slate-900 bg-slate-50 px-5 py-4 rounded-none border-l-2 border-slate-900 tracking-tight">{user.phone || "Not Set"}</p>
                 </div>
                {staff && (
                  <>
                     <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NID Number</p>
                        <p className="text-sm font-semibold text-slate-900 bg-slate-50 px-5 py-4 rounded-none border-l-2 border-slate-900 tracking-tight">{staff.nidNumber || "N/A"}</p>
                     </div>
                     <div className="space-y-1.5 md:col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Permanent Address</p>
                        <p className="text-sm font-semibold text-slate-900 bg-slate-50 px-5 py-4 rounded-none border-l-2 border-slate-900 tracking-tight leading-relaxed">{staff.currentAddress || staff.address || "N/A"}</p>
                     </div>
                  </>
                )}
             </div>
          </div>
        </div>

        {/* Sidebar Activity */}
        <div className="space-y-8">
           <div className="bg-white rounded-none p-8 md:p-10 border border-slate-100 space-y-8 shadow-2xl shadow-slate-200/40 h-full">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                 <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance Snapshot</h3>
                 <Clock className="w-4 h-4 text-slate-300" />
              </div>
              <div className="space-y-6">
                 <div className="p-6 bg-slate-50 rounded-none border-l-2 border-slate-900">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Attendance Record</p>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight italic">{activityStats?.attendance ?? staff?.attendance ?? 0} Sessions</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-none border-l-2 border-indigo-600">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Units Dispatched</p>
                    <p className="text-2xl font-bold text-indigo-600 tracking-tight italic">{activityStats?.tasksCompleted ?? 0} Units</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-none border-l-2 border-emerald-600">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Activity Score</p>
                    <p className="text-2xl font-bold text-emerald-600 tracking-tight italic">{(activityStats?.avgActivityScore ?? staff?.avgActivityScore ?? 0).toFixed(1)}%</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Documents Table - Now Full Width */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white rounded-none p-8 md:p-12 shadow-2xl shadow-slate-200/40 border border-slate-100 space-y-10">
             <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Verified Documents</h3>
                <div className="w-10 h-10 bg-slate-900 rounded-none flex items-center justify-center text-white">
                   <FileText className="w-5 h-5" />
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-slate-100">
                          <th className="py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Title</th>
                          <th className="py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identity Type</th>
                          <th className="py-5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                       </tr>
                    </thead>
                   <tbody className="divide-y divide-slate-100">
                       {staff?.nidFrontUrl && (
                         <tr className="group hover:bg-slate-50 transition-colors">
                            <td className="py-6 font-bold text-xs text-slate-900 tracking-tight">NID Front Side</td>
                            <td className="py-6">
                               <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-widest">Official ID</span>
                            </td>
                            <td className="py-6 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <a href={staff.nidFrontUrl} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-900 text-[9px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                     View <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <a href={staff.nidFrontUrl} download className="p-2 border border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                     <Download className="w-3.5 h-3.5" />
                                  </a>
                                  {isEditable && (
                                    <label className="p-2 border border-slate-200 text-slate-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm cursor-pointer relative">
                                       {uploadingDoc === 'nidFrontUrl' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
                                       <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={e => e.target.files?.[0] && handleDocumentUpload(e.target.files[0], 'nidFrontUrl')} />
                                    </label>
                                  )}
                               </div>
                            </td>
                         </tr>
                       )}
                       {staff?.nidBackUrl && (
                         <tr className="group hover:bg-slate-50 transition-colors">
                            <td className="py-6 font-bold text-xs text-slate-900 tracking-tight">NID Back Side</td>
                            <td className="py-6">
                               <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-widest">Official ID</span>
                            </td>
                            <td className="py-6 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <a href={staff.nidBackUrl} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-900 text-[9px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                     View <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <a href={staff.nidBackUrl} download className="p-2 border border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                     <Download className="w-3.5 h-3.5" />
                                  </a>
                                  {isEditable && (
                                    <label className="p-2 border border-slate-200 text-slate-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm cursor-pointer relative">
                                       {uploadingDoc === 'nidBackUrl' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
                                       <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={e => e.target.files?.[0] && handleDocumentUpload(e.target.files[0], 'nidBackUrl')} />
                                    </label>
                                  )}
                               </div>
                            </td>
                         </tr>
                       )}
                       {staff?.documents?.map((doc: any) => (
                         <tr key={doc.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="py-6 font-bold text-xs text-slate-900 tracking-tight">{doc.name}</td>
                            <td className="py-6">
                               <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-widest">Support Doc</span>
                            </td>
                            <td className="py-6 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <a href={doc.url} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-900 text-[9px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                     View <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <a href={doc.url} download className="p-2 border border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                     <Download className="w-3.5 h-3.5" />
                                  </a>
                                  {isEditable && (
                                    <label className="p-2 border border-slate-200 text-slate-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm cursor-pointer relative">
                                       {uploadingDoc === doc.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
                                       <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={e => e.target.files?.[0] && handleDocumentUpload(e.target.files[0], 'other', doc.id)} />
                                    </label>
                                  )}
                               </div>
                            </td>
                         </tr>
                       ))}
                      {!staff?.nidFrontUrl && !staff?.nidBackUrl && (!staff?.documents || staff.documents.length === 0) && (
                         <tr>
                            <td colSpan={3} className="py-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                               No verified documents in registry
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
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
