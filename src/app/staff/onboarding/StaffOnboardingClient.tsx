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
  Banknote,
  AlertCircle
} from "lucide-react";
import { processNIDAction, submitStaffOnboardingAction } from "./actions";
import { toast } from "sonner";

export function StaffOnboardingClient({ profile, storeName }: { profile: any, storeName: string }) {
  const missingDocs = profile.missingDocuments ? JSON.parse(profile.missingDocuments) : [];
  
  // If there are missing documents, we reset to step 1 to allow re-upload
  const initialStep = missingDocs.length > 0 ? 1 : (profile.onboardingStep || 1);
  const [step, setStep] = useState(initialStep > 3 ? 3 : initialStep);
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
    fatherName: profile.fatherName || "",
    motherName: profile.motherName || "",
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
      
      toast.info(`Extracting information from NID ${side}...`);
      const info: any = await processNIDAction(url);
      if (!info.error) {
        setFormData(prev => ({
          ...prev,
          nidNumber: info.nidNumber || prev.nidNumber,
          permanentAddress: info.permanentAddress || prev.permanentAddress,
          dob: info.dob || prev.dob,
          fatherName: info.fatherName || prev.fatherName,
          motherName: info.motherName || prev.motherName
        }));
        toast.success(`NID ${side} information extracted!`);
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

  if (submitted || (profile.onboardingStep >= 4 && missingDocs.length === 0)) {
    return (
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-[4px] p-8 text-center space-y-6 shadow-sm animate-in fade-in zoom-in duration-300">
         <div className="w-16 h-16 bg-green-50 rounded-[4px] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
         </div>
         <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Onboarding Complete</h2>
            <p className="text-slate-500 font-medium text-xs leading-relaxed">
               Your profile has been submitted to <strong>{storeName}</strong> for review. 
               Once they approve your documents, your account will be activated and you can access the dashboard.
            </p>
         </div>
         <div className="pt-2 border-t border-gray-50">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Verification Status: Pending Review</p>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full">
      {/* Header */}
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-[4px] text-indigo-600 font-bold text-[10px] uppercase tracking-wider">
           <Sparkles className="w-3.5 h-3.5" /> Welcome to {storeName}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Complete your profile</h1>
        <div className="flex justify-center gap-1.5 mt-6">
           {[1, 2, 3].map((s) => (
             <div key={s} className={`h-1 w-16 rounded-[2px] transition-all duration-500 ${step >= s ? "bg-indigo-600" : "bg-gray-100"}`} />
           ))}
        </div>
      </div>

      {/* Re-upload Notice */}
      {missingDocs.length > 0 && (
        <div className="mb-8 bg-red-50 border border-red-100 rounded-[4px] p-5 shadow-sm animate-in shake duration-500">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <h3 className="text-[11px] font-black text-red-600 uppercase tracking-widest leading-none">Correction Required</h3>
          </div>
          <p className="text-[12px] font-medium text-red-800 mb-4 leading-relaxed">{profile.rejectionReason}</p>
          <div className="flex flex-wrap gap-2">
            {missingDocs.map((doc: string) => (
              <span key={doc} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-[9px] font-bold uppercase tracking-widest rounded-[2px]">
                RE-UPLOAD: {doc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="bg-white border border-gray-100 rounded-[4px] p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-[4px] flex items-center justify-center">
                  <UserSquare2 className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Identity Details</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step 1 of 3</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">NID Front</p>
                  <label className="aspect-[1.6/1] bg-gray-50 border border-dashed border-gray-200 rounded-[4px] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-600/30 transition-all group overflow-hidden relative">
                     {formData.nidFrontUrl ? (
                        <img src={formData.nidFrontUrl} className="w-full h-full object-cover" />
                     ) : (
                        <>
                           <Upload className="w-6 h-6 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Upload Front</span>
                        </>
                     )}
                     <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleNIDUpload(e.target.files[0], 'front')} />
                  </label>
               </div>
               <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">NID Back</p>
                  <label className="aspect-[1.6/1] bg-gray-50 border border-dashed border-gray-200 rounded-[4px] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-600/30 transition-all group overflow-hidden relative">
                     {formData.nidBackUrl ? (
                        <img src={formData.nidBackUrl} className="w-full h-full object-cover" />
                     ) : (
                        <>
                           <Upload className="w-6 h-6 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Upload Back</span>
                        </>
                     )}
                     <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleNIDUpload(e.target.files[0], 'back')} />
                  </label>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">NID Number</label>
                  <input 
                    value={formData.nidNumber}
                    onChange={e => setFormData({...formData, nidNumber: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Date of Birth</label>
                  <input 
                    type="date"
                    value={formData.dob}
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Father's Name</label>
                  <input 
                    value={formData.fatherName}
                    onChange={e => setFormData({...formData, fatherName: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                    placeholder="Enter Father's Name"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Mother's Name</label>
                  <input 
                    value={formData.motherName}
                    onChange={e => setFormData({...formData, motherName: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                    placeholder="Enter Mother's Name"
                  />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Permanent Address</label>
               <textarea 
                 value={formData.permanentAddress}
                 onChange={e => setFormData({...formData, permanentAddress: e.target.value})}
                 className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-600 transition-all min-h-[80px]"
               />
            </div>

            <button 
              onClick={nextStep}
              disabled={!formData.nidFrontUrl || !formData.nidBackUrl || !formData.nidNumber}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-[4px] font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Continue to Step 2 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-[4px] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Address & Refs</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step 2 of 3</p>
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Current Address</label>
               <textarea 
                 value={formData.currentAddress}
                 onChange={e => setFormData({...formData, currentAddress: e.target.value})}
                 placeholder="Where are you staying currently?"
                 className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-600 transition-all min-h-[80px]"
               />
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                  <Users className="w-3.5 h-3.5" /> Personal References
               </div>
               {formData.references.map((ref, i) => (
                 <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      placeholder={`Reference ${i+1} Name`}
                      value={ref.name}
                      onChange={e => {
                        const newRefs = [...formData.references];
                        newRefs[i].name = e.target.value;
                        setFormData({...formData, references: newRefs});
                      }}
                      className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                    />
                    <input 
                      placeholder={`Contact Number`}
                      value={ref.contact}
                      onChange={e => {
                        const newRefs = [...formData.references];
                        newRefs[i].contact = e.target.value;
                        setFormData({...formData, references: newRefs});
                      }}
                      className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                    />
                 </div>
               ))}
            </div>

            <div className="flex gap-3">
              <button onClick={prevStep} className="px-4 bg-gray-50 text-gray-400 rounded-[4px] hover:bg-gray-100">
                 <ArrowLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextStep}
                disabled={!formData.currentAddress || formData.references.some(r => !r.name || !r.contact)}
                className="flex-1 bg-indigo-600 text-white py-3.5 rounded-[4px] font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Continue to Step 3 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-[4px] flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Finance & Documents</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Final Step</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Account Name</label>
                  <input 
                    value={formData.bankDetails.accountName}
                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, accountName: e.target.value}})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Bank & Branch</label>
                  <input 
                    value={formData.bankDetails.bankName}
                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, bankName: e.target.value}})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-rose-600 uppercase tracking-widest ml-0.5">bKash</label>
                  <input 
                    value={formData.bankDetails.bkash}
                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, bkash: e.target.value}})}
                    className="w-full bg-rose-50 border border-rose-100 rounded-[4px] px-4 py-2 text-sm font-medium outline-none focus:border-rose-600 transition-all"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-amber-600 uppercase tracking-widest ml-0.5">Nagad</label>
                  <input 
                    value={formData.bankDetails.nagad}
                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, nagad: e.target.value}})}
                    className="w-full bg-amber-50 border border-amber-100 rounded-[4px] px-4 py-2 text-sm font-medium outline-none focus:border-amber-600 transition-all"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Upload CV (PDF/Image)</p>
               <label className="w-full bg-slate-900 text-white rounded-[4px] p-5 flex items-center justify-between cursor-pointer hover:bg-black transition-all">
                  <div className="flex items-center gap-3">
                     <FileText className="w-6 h-6 text-[#BEF264]" />
                     <div>
                        <p className="text-xs font-bold uppercase tracking-tight leading-none">Professional Resume</p>
                        <p className="text-[10px] font-medium text-gray-400 mt-1">
                           {files.cv ? files.cv.name : "Choose File"}
                        </p>
                     </div>
                  </div>
                  <Upload className="w-5 h-5 text-gray-500" />
                  <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => setFiles({...files, cv: e.target.files?.[0] || null})} />
               </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={prevStep} className="px-4 bg-gray-50 text-gray-400 rounded-[4px] hover:bg-gray-100">
                 <ArrowLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3.5 rounded-[4px] font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Submit Profile</>}
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

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
