"use client";

import React, { useState, useEffect } from "react";
import { 
  Lock, Save, RefreshCw, ShieldCheck, 
  Shield, Key, QrCode, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { 
  updateProfileAction, generate2FASecretAction, 
  verifyAndEnable2FAAction, disable2FAAction 
} from "./actions";
import { cn } from "@/lib/utils";
import { StaffProfileCard } from "@/components/merchant/staff/StaffProfileCard";

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

  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<any>(null);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [activityStats, setActivityStats] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { getStaffActivityStatsAction } = await import("@/app/merchant/staff/staffActions");
        const stats = await getStaffActivityStatsAction(user.id);
        setActivityStats(stats);
      } catch (err) {
        console.error("Failed to fetch activity stats:", err);
      }
    }
    fetchStats();
  }, [user.id]);

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
      
      <StaffProfileCard 
        user={user} 
        isEditable={true} 
        activityStats={activityStats}
        onUpdate={async (data) => {
          const res = await updateProfileAction(data);
          return res;
        }}
      />

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
                      
                      {user.isTwoFactorEnabled ? (
                        <div className="space-y-4">
                           <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                              <div className="flex items-center gap-2">
                                 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                 <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">2FA is Enabled</span>
                              </div>
                              <button 
                                onClick={async () => {
                                  if (confirm("Are you sure you want to disable 2FA?")) {
                                    setLoading(true);
                                    await disable2FAAction();
                                    setLoading(false);
                                    toast.success("2FA Disabled");
                                  }
                                }}
                                className="text-[10px] font-black text-rose-600 uppercase hover:underline"
                              >
                                Disable
                              </button>
                           </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                           {!show2FASetup ? (
                             <button 
                               onClick={async () => {
                                 setLoading(true);
                                 try {
                                   const res = await generate2FASecretAction();
                                   setTwoFactorData(res);
                                   setShow2FASetup(true);
                                 } catch (err: any) {
                                   toast.error(err.message);
                                 } finally {
                                   setLoading(false);
                                 }
                               }}
                               className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
                             >
                               Enable 2FA Now
                             </button>
                           ) : (
                             <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight text-center">Scan QR Code with Authenticator App</p>
                                <div className="flex justify-center p-2 bg-slate-50 rounded-xl">
                                   <img src={twoFactorData.qrCodeUrl} className="w-32 h-32" alt="QR Code" />
                                </div>
                                <div className="space-y-2">
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Enter the 6-digit code</p>
                                   <input 
                                     type="text" 
                                     maxLength={6}
                                     value={twoFactorToken}
                                     onChange={e => setTwoFactorToken(e.target.value)}
                                     className="w-full text-center text-xl font-black tracking-[0.5em] py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20"
                                     placeholder="000000"
                                   />
                                </div>
                                <div className="flex gap-2">
                                   <button 
                                     onClick={() => setShow2FASetup(false)}
                                     className="flex-1 py-3 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900"
                                   >
                                     Cancel
                                   </button>
                                   <button 
                                     onClick={async () => {
                                       setLoading(true);
                                       try {
                                         await verifyAndEnable2FAAction(twoFactorData.secret, twoFactorToken);
                                         toast.success("2FA Enabled Successfully!");
                                         setShow2FASetup(false);
                                       } catch (err: any) {
                                         toast.error(err.message);
                                       } finally {
                                         setLoading(false);
                                       }
                                     }}
                                     className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                   >
                                     Verify & Enable
                                   </button>
                                </div>
                             </div>
                           )}
                        </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}

