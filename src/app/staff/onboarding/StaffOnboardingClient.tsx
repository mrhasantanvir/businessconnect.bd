"use client";

import React, { useState } from "react";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Upload, 
  UserSquare2, 
  MapPin, 
  Users, 
  CreditCard, 
  FileText, 
  Sparkles,
  Loader2,
  ShieldCheck,
  Building2,
  Phone,
  Banknote
} from "lucide-react";
import { processNIDAction, submitStaffOnboardingAction } from "./actions";
import { toast } from "sonner";

export function StaffOnboardingClient({ profile, storeName }: { profile: any, storeName: string }) {
  const [step, setStep] = useState(profile.onboardingStep || 1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    nidFront: null,
    nidBack: null,
    cv: null
  });

  const [formData, setFormData] = useState({
    nidNumber: profile.nidNumber || "",
    dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : "",
    permanentAddress: profile.permanentAddress || "",
    currentAddress: profile.currentAddress || "",
    nidFrontUrl: profile.nidFrontUrl || "",
    nidBackUrl: profile.nidBackUrl || "",
    cvUrl: profile.cvUrl || "",
    references: profile.referencesData ? JSON.parse(profile.referencesData) : [
      { name: "", contact: "" },
      { name: "", contact: "" }
    ],
    bankDetails: profile.bankDetailsData ? JSON.parse(profile.bankDetailsData) : {
      bankName: "",
      accountName: "",
      accountNumber: "",
      bkash: "",
      nagad: ""
    }
  });

  const handleFileUpload = async (file: File, type: string) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload/documents", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  };

  const handleNIDUpload = async (file: File, side: 'front' | 'back') => {
    setLoading(true);
    try {
      const url = await handleFileUpload(file, `nid_${side}`);
      setFormData(prev => ({ ...prev, [`nid${side.charAt(0).toUpperCase() + side.slice(1)}Url`]: url }));
      
      if (side === 'front') {
        toast.info("Extracting information from NID...");
        const info: any = await processNIDAction(url);
        if (!info.error) {
          setFormData(prev => ({
            ...prev,
            nidNumber: info.nidNumber || prev.nidNumber,
            permanentAddress: info.permanentAddress || prev.permanentAddress,
            dob: info.dob || prev.dob
          }));
          toast.success("NID information extracted!");
        }
      }
    } catch (error) {
      toast.error("Failed to process NID");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Final CV upload if needed
      let cvUrl = formData.cvUrl;
      if (files.cv) {
        cvUrl = await handleFileUpload(files.cv, "cv");
      }

      const res = await submitStaffOnboardingAction({ ...formData, cvUrl });
      if (res.success) {
        setSubmitted(true);
        toast.success("Profile submitted for approval!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl w-full bg-white border border-gray-100 rounded-[48px] p-12 text-center space-y-8 shadow-2xl shadow-indigo-500/5 animate-in fade-in zoom-in duration-500">
         <div className="w-24 h-24 bg-green-50 rounded-[40px] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
         </div>
         <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Onboarding <span className="text-green-600 italic">Complete!</span></h2>
            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em] leading-loose">
               Your profile has been submitted to <strong>{storeName}</strong> for review. 
               Once they approve your documents, your account will be activated and you can access the dashboard.
            </p>
         </div>
         <div className="pt-4">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Verification Status: Pending Merchant Review</p>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full">
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 font-black text-[10px] uppercase tracking-widest">
           <Sparkles className="w-4 h-4" /> Welcome to {storeName}
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Complete your <span className="text-indigo-600 italic">Elite Profile.</span></h1>
        <div className="flex justify-center gap-2 mt-8">
           {[1, 2, 3].map((s) => (
             <div key={s} className={`h-1.5 w-24 rounded-full transition-all duration-700 ${step >= s ? "bg-indigo-600 shadow-lg shadow-indigo-200" : "bg-gray-100"}`} />
           ))}
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white border border-gray-100 rounded-[48px] p-10 md:p-12 shadow-2xl shadow-indigo-500/5 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <UserSquare2 className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900">NID & Identity</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step 1 of 3</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NID Front Part</p>
                  <label className="aspect-[1.6/1] bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-600/30 transition-all group overflow-hidden relative">
                     {formData.nidFrontUrl ? (
                        <img src={formData.nidFrontUrl} className="w-full h-full object-cover" />
                     ) : (
                        <>
                           <Upload className="w-8 h-8 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Click to Upload</span>
                        </>
                     )}
                     <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleNIDUpload(e.target.files[0], 'front')} />
                  </label>
               </div>
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NID Back Part</p>
                  <label className="aspect-[1.6/1] bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-600/30 transition-all group overflow-hidden relative">
                     {formData.nidBackUrl ? (
                        <img src={formData.nidBackUrl} className="w-full h-full object-cover" />
                     ) : (
                        <>
                           <Upload className="w-8 h-8 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Click to Upload</span>
                        </>
                     )}
                     <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleNIDUpload(e.target.files[0], 'back')} />
                  </label>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NID Number</label>
                  <input 
                    value={formData.nidNumber}
                    onChange={e => setFormData({...formData, nidNumber: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                  <input 
                    type="date"
                    value={formData.dob}
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Permanent Address (From NID)</label>
               <textarea 
                 value={formData.permanentAddress}
                 onChange={e => setFormData({...formData, permanentAddress: e.target.value})}
                 className="w-full bg-gray-50 border border-gray-100 rounded-[32px] px-6 py-4 text-sm font-bold outline-none focus:border-indigo-600 transition-all min-h-[100px]"
               />
            </div>

            <button 
              onClick={nextStep}
              disabled={!formData.nidFrontUrl || !formData.nidBackUrl || !formData.nidNumber}
              className="w-full bg-indigo-600 text-white py-5 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Continue to Step 2 <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900">Current Residence & Refs</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step 2 of 3</p>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Address</label>
               <textarea 
                 value={formData.currentAddress}
                 onChange={e => setFormData({...formData, currentAddress: e.target.value})}
                 placeholder="Where are you staying currently?"
                 className="w-full bg-gray-50 border border-gray-100 rounded-[32px] px-6 py-4 text-sm font-bold outline-none focus:border-indigo-600 transition-all min-h-[100px]"
               />
            </div>

            <div className="space-y-6">
               <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600">
                  <Users className="w-4 h-4" /> Personal References
               </div>
               {formData.references.map((ref, i) => (
                 <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      placeholder={`Reference ${i+1} Name`}
                      value={ref.name}
                      onChange={e => {
                        const newRefs = [...formData.references];
                        newRefs[i].name = e.target.value;
                        setFormData({...formData, references: newRefs});
                      }}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                    />
                    <input 
                      placeholder={`Contact Number`}
                      value={ref.contact}
                      onChange={e => {
                        const newRefs = [...formData.references];
                        newRefs[i].contact = e.target.value;
                        setFormData({...formData, references: newRefs});
                      }}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                    />
                 </div>
               ))}
            </div>

            <div className="flex gap-4">
              <button onClick={prevStep} className="p-5 bg-gray-50 text-gray-400 rounded-3xl hover:bg-gray-100">
                 <ArrowLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextStep}
                disabled={!formData.currentAddress || formData.references.some(r => !r.name || !r.contact)}
                className="flex-1 bg-indigo-600 text-white py-5 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Continue to Step 3 <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Banknote className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900">Financials & Documents</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Final Step</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Account Name</label>
                  <input 
                    value={formData.bankDetails.accountName}
                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, accountName: e.target.value}})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Name & Branch</label>
                  <input 
                    value={formData.bankDetails.bankName}
                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, bankName: e.target.value}})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">bKash (Personal)</label>
                  <input 
                    value={formData.bankDetails.bkash}
                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, bkash: e.target.value}})}
                    className="w-full bg-rose-50 border border-rose-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-rose-600 transition-all"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Nagad (Personal)</label>
                  <input 
                    value={formData.bankDetails.nagad}
                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, nagad: e.target.value}})}
                    className="w-full bg-amber-50 border border-amber-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-amber-600 transition-all"
                  />
               </div>
            </div>

            <div className="space-y-4">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Upload Professional CV (PDF/Image)</p>
               <label className="w-full bg-slate-900 text-white rounded-[32px] p-8 flex items-center justify-between cursor-pointer hover:bg-black transition-all">
                  <div className="flex items-center gap-4">
                     <FileText className="w-8 h-8 text-[#BEF264]" />
                     <div>
                        <p className="text-sm font-black uppercase tracking-tight leading-none">Candidate Resume</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                           {files.cv ? files.cv.name : "Choose File"}
                        </p>
                     </div>
                  </div>
                  <Upload className="w-6 h-6 text-gray-500" />
                  <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => setFiles({...files, cv: e.target.files?.[0] || null})} />
               </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="p-5 bg-gray-50 text-gray-400 rounded-3xl hover:bg-gray-100">
                 <ArrowLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-5 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Submit Profile</>}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
        Verified by BusinessConnect Security Systems
      </p>
    </div>
  );
}
