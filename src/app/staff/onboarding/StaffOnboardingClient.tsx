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
  AlertCircle,
  ScanText
} from "lucide-react";
import { processNIDAction, submitStaffOnboardingAction } from "./actions";
import { toast } from "sonner";

export function StaffOnboardingClient({ profile, storeName }: { profile: any, storeName: string }) {
  const missingDocs = profile.missingDocuments ? JSON.parse(profile.missingDocuments) : [];
  
  const isReuploadMode = missingDocs.length > 0;
  const initialStep = isReuploadMode ? 0 : (profile.onboardingStep || 1);
  const [step, setStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    nidFront: null,
    nidBack: null,
    cv: null,
    photo: null
  });

  const [formData, setFormData] = useState({
    nameEn: profile.nameEn || profile.user?.name || "",
    nameBn: profile.nameBn || "",
    nidNumber: profile.nidNumber || "",
    dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : "",
    fatherName: profile.fatherName || "",
    motherName: profile.motherName || "",
    permanentAddress: profile.permanentAddress || "",
    currentAddress: profile.currentAddress || "",
    nidFrontUrl: profile.nidFrontUrl || "",
    nidBackUrl: profile.nidBackUrl || "",
    cvUrl: profile.cvUrl || "",
    photoUrl: profile.user?.image || "",
    references: profile.referencesData ? JSON.parse(profile.referencesData) : [
      { name: "", contact: "" },
      { name: "", contact: "" }
    ],
    bankDetails: profile.bankDetailsData ? JSON.parse(profile.bankDetailsData) : {
      bankName: "",
      branchName: "",
      accountName: "",
      accountNumber: "",
      bkash: "",
      nagad: ""
    }
  });

  const requiredDocsList = profile.requiredDocs ? JSON.parse(profile.requiredDocs) : [];
  const [additionalDocFiles, setAdditionalDocFiles] = useState<{ [key: string]: string }>({});
  
  const docLabels: { [key: string]: string } = {
    "UTILITY": "Utility Bill",
    "SSC": "SSC Certificate",
    "HSC": "HSC Certificate",
    "HONORS": "Honors Certificate",
    "MASTERS": "Masters Certificate",
    "POLICE_CLEARANCE": "Police Clearance",
    "OTHER": "Other Document",
    "NID": "NID Card",
    "STUDENT_ID": "Student ID Card"
  };

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
      toast.success(`${side === 'front' ? 'Front' : 'Back'} side uploaded!`);
    } catch (error) {
      toast.error("Failed to upload NID image");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setLoading(true);
    try {
      const url = await handleFileUpload(file, "profile_photo");
      setFormData(prev => ({ ...prev, photoUrl: url }));
      toast.success("Profile photo uploaded!");
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  const startExtraction = async () => {
    if (!formData.nidFrontUrl) return toast.error("Please upload NID front side first");
    
    setExtracting(true);
    setStep(2); // Move to step 2 where fields are
    
    try {
      toast.info("AI is extracting details from your NID...");
      
      // Extract from Front (Identity)
      const infoFront: any = await processNIDAction(formData.nidFrontUrl);
      console.log("[Onboarding] Front NID Extraction Result:", infoFront);
      
      let infoBack: any = {};
      if (formData.nidBackUrl) {
        // Extract from Back (Address)
        infoBack = await processNIDAction(formData.nidBackUrl);
        console.log("[Onboarding] Back NID Extraction Result:", infoBack);
      }

      // Check if we actually got any meaningful data
      const hasAnyData = 
        infoFront.nameEn || infoFront.name || infoFront.nidNumber || infoFront.dob || 
        infoFront.fatherName || infoFront.motherName || infoBack.permanentAddress;

      if (!infoFront.error && hasAnyData) {
        setFormData(prev => ({
          ...prev,
          nameEn: infoFront.nameEn || infoFront.name || prev.nameEn,
          nameBn: infoFront.nameBn || prev.nameBn,
          nidNumber: infoFront.nidNumber || prev.nidNumber,
          dob: infoFront.dob || prev.dob,
          fatherName: infoFront.fatherName || prev.fatherName,
          motherName: infoFront.motherName || prev.motherName,
          permanentAddress: infoBack.permanentAddress || infoFront.permanentAddress || prev.permanentAddress
        }));
        toast.success("Information extracted successfully!");
      } else {
        const errorMsg = infoFront.error || infoBack.error || "AI could not find clear details in this image.";
        toast.error(errorMsg);
        console.warn("[Onboarding] Extraction completed but no data found or error occurred.");
      }
    } catch (error) {
      console.error("Extraction error:", error);
      toast.error("AI extraction failed, please enter details manually.");
    } finally {
      setExtracting(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let cvUrl = formData.cvUrl;
      if (files.cv) {
        cvUrl = await handleFileUpload(files.cv, "cv");
      }

      const res = await submitStaffOnboardingAction({ 
        ...formData, 
        cvUrl,
        additionalDocs: Object.entries(additionalDocFiles).map(([name, url]) => ({
          name: docLabels[name] || name,
          url
        }))
      });
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

  if (submitted || (profile.onboardingStep >= 5 && missingDocs.length === 0)) {
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
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={`h-1 w-12 rounded-[2px] transition-all duration-500 ${step >= s ? "bg-indigo-600" : "bg-gray-100"}`} />
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

      {/* Steps or Re-upload View */}
      <div className="bg-white border border-gray-100 rounded-[4px] p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {isReuploadMode && step === 0 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-red-50 text-red-600 rounded-[4px] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Re-upload Documents</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Please provide the following corrections</p>
               </div>
            </div>

            <div className="space-y-8">
               {(missingDocs.includes("NID Front") || missingDocs.includes("NID Back")) && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {missingDocs.includes("NID Front") && (
                      <div className="space-y-2">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">NID Front</p>
                         <label className="aspect-[1.6/1] bg-gray-50 border border-dashed border-gray-200 rounded-[4px] flex flex-col items-center justify-center cursor-pointer hover:border-red-600/30 transition-all group overflow-hidden relative">
                            {formData.nidFrontUrl ? (
                               <img src={formData.nidFrontUrl} className="w-full h-full object-cover" />
                            ) : (
                               <>
                                  <Upload className="w-6 h-6 text-gray-300 group-hover:text-red-600 transition-colors" />
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Upload Front</span>
                               </>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleNIDUpload(e.target.files[0], 'front')} />
                         </label>
                      </div>
                    )}
                    {missingDocs.includes("NID Back") && (
                      <div className="space-y-2">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">NID Back</p>
                         <label className="aspect-[1.6/1] bg-gray-50 border border-dashed border-gray-200 rounded-[4px] flex flex-col items-center justify-center cursor-pointer hover:border-red-600/30 transition-all group overflow-hidden relative">
                            {formData.nidBackUrl ? (
                               <img src={formData.nidBackUrl} className="w-full h-full object-cover" />
                            ) : (
                               <>
                                  <Upload className="w-6 h-6 text-gray-300 group-hover:text-red-600 transition-colors" />
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Upload Back</span>
                               </>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleNIDUpload(e.target.files[0], 'back')} />
                         </label>
                      </div>
                    )}
                 </div>
               )}

               {missingDocs.includes("Profile Photo") && (
                 <div className="space-y-2">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Profile Photo</p>
                   <label className="flex items-center gap-4 cursor-pointer group">
                     <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-200 group-hover:border-red-400 transition-all flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                       {formData.photoUrl ? (
                         <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Profile" />
                       ) : (
                         <div className="flex flex-col items-center gap-1">
                           <Upload className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-colors" />
                           <span className="text-[8px] text-gray-300 font-bold uppercase">Photo</span>
                         </div>
                       )}
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-700">{formData.photoUrl ? "✅ Photo uploaded — click to change" : "Click to upload your photo"}</p>
                       <p className="text-[10px] text-gray-400 mt-0.5">JPG or PNG, clear face visible</p>
                     </div>
                     <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
                   </label>
                 </div>
               )}

               {missingDocs.includes("CV") && (
                 <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Update CV (PDF/Image)</p>
                    <label className="w-full bg-slate-900 text-white rounded-[4px] p-5 flex items-center justify-between cursor-pointer hover:bg-black transition-all">
                       <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-[#BEF264]" />
                          <div>
                             <p className="text-sm font-bold uppercase tracking-tight leading-none">Professional Resume</p>
                             <p className="text-[10px] font-medium text-gray-400 mt-1">
                                {files.cv ? files.cv.name : "Choose New CV File"}
                             </p>
                          </div>
                       </div>
                       <Upload className="w-5 h-5 text-gray-500" />
                       <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => setFiles({...files, cv: e.target.files?.[0] || null})} />
                    </label>
                 </div>
               )}

               {missingDocs.includes("Bank Details") && (
                 <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Update Bank Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Account Name</label>
                          <input 
                            value={formData.bankDetails.accountName}
                            onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, accountName: e.target.value}})}
                            placeholder="Name as on bank account"
                            className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2 text-sm font-medium outline-none focus:border-red-600 transition-all"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Account No</label>
                          <input 
                            value={formData.bankDetails.accountNumber}
                            onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, accountNumber: e.target.value}})}
                            placeholder="e.g. 1234567890"
                            className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2 text-sm font-medium outline-none focus:border-red-600 transition-all"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Bank Name</label>
                          <input 
                            value={formData.bankDetails.bankName}
                            onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, bankName: e.target.value}})}
                            placeholder="e.g. Dutch-Bangla Bank"
                            className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2 text-sm font-medium outline-none focus:border-red-600 transition-all"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Branch Name</label>
                          <input 
                            value={formData.bankDetails.branchName || ""}
                            onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, branchName: e.target.value}})}
                            placeholder="e.g. Dhanmondi Branch"
                            className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2 text-sm font-medium outline-none focus:border-red-600 transition-all"
                          />
                       </div>
                    </div>
                 </div>
               )}
            </div>

            <div className="pt-4">
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-red-600 text-white py-4 rounded-[4px] font-black text-xs uppercase tracking-widest shadow-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit Corrections <CheckCircle2 className="w-4 h-4" /></>}
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">Please ensure all requested documents are uploaded correctly</p>
            </div>
          </div>
        )}

        {!isReuploadMode && step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-[4px] flex items-center justify-center">
                  <ScanText className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Upload NID</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step 1 of 4</p>
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

             {/* Profile Photo Upload */}
             <div className="space-y-2">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Profile Photo <span className="text-indigo-400">(used as your avatar)</span></p>
               <label className="flex items-center gap-4 cursor-pointer group">
                 <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-200 group-hover:border-indigo-400 transition-all flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                   {formData.photoUrl ? (
                     <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Profile" />
                   ) : (
                     <div className="flex flex-col items-center gap-1">
                       <Upload className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                       <span className="text-[8px] text-gray-300 font-bold uppercase">Photo</span>
                     </div>
                   )}
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-700">{formData.photoUrl ? "✅ Photo uploaded — click to change" : "Click to upload your photo"}</p>
                   <p className="text-[10px] text-gray-400 mt-0.5">JPG or PNG, clear face visible</p>
                 </div>
                 <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
               </label>
             </div>

             <button 
               onClick={startExtraction}
               disabled={!formData.nidFrontUrl || !formData.nidBackUrl || loading}
               className="w-full bg-indigo-600 text-white py-3.5 rounded-[4px] font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Next: Extract Details <ArrowRight className="w-4 h-4" /></>}
             </button>
           </div>
         )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-[4px] flex items-center justify-center">
                  <UserSquare2 className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Identity Details</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step 2 of 4</p>
               </div>
            </div>

             {extracting && (
               <div className="bg-indigo-50 border border-indigo-100 rounded-[4px] p-6 text-center space-y-3 animate-pulse">
                 <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                 <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">AI is reading your NID...</p>
                 <p className="text-[10px] text-indigo-400">Please wait while we extract your personal information.</p>
               </div>
             )}

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${extracting ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Full Name (English)</label>
                  <input 
                    value={formData.nameEn}
                    onChange={e => setFormData({...formData, nameEn: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                    placeholder="Auto-extracted"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">বাংলা নাম (Bengali)</label>
                  <input 
                    value={formData.nameBn}
                    onChange={e => setFormData({...formData, nameBn: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                    placeholder="বাংলায় নাম"
                  />
               </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${extracting ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">NID Number</label>
                  <input 
                    value={formData.nidNumber}
                    onChange={e => setFormData({...formData, nidNumber: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                    placeholder="Auto-extracted"
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

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${extracting ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Father's Name</label>
                  <input 
                    value={formData.fatherName}
                    onChange={e => setFormData({...formData, fatherName: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                    placeholder="Auto-extracted"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Mother's Name</label>
                  <input 
                    value={formData.motherName}
                    onChange={e => setFormData({...formData, motherName: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                    placeholder="Auto-extracted"
                  />
               </div>
            </div>

            <div className={`space-y-1.5 ${extracting ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
               <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Permanent Address</label>
               <textarea 
                 value={formData.permanentAddress}
                 onChange={e => setFormData({...formData, permanentAddress: e.target.value})}
                 className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-600 transition-all min-h-[80px]"
                 placeholder="Auto-extracted"
               />
            </div>

            <div className="flex gap-3">
              <button onClick={prevStep} className="px-4 bg-gray-50 text-gray-400 rounded-[4px] hover:bg-gray-100">
                 <ArrowLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextStep}
                disabled={extracting || !formData.nidNumber || !formData.dob}
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
                  <MapPin className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Current Address</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step 3 of 4</p>
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
                onClick={() => {
                  const ref1 = formData.references[0];
                  const ref2 = formData.references[1];
                  
                  if (ref1.name.trim().toLowerCase() === ref2.name.trim().toLowerCase()) {
                    toast.error("Reference names must be unique.");
                    return;
                  }
                  if (ref1.contact.trim() === ref2.contact.trim()) {
                    toast.error("Reference contact numbers must be unique.");
                    return;
                  }
                  nextStep();
                }}
                disabled={!formData.currentAddress || formData.references.some(r => !r.name || !r.contact)}
                className="flex-1 bg-indigo-600 text-white py-3.5 rounded-[4px] font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Continue to Final Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-[4px] flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Finance & CV</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step 4 of 4</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Account Name</label>
                  <input 
                    value={formData.bankDetails.accountName}
                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, accountName: e.target.value}})}
                    placeholder="Name as on bank account"
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Account No</label>
                  <input 
                    value={formData.bankDetails.accountNumber}
                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, accountNumber: e.target.value}})}
                    placeholder="e.g. 1234567890"
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Bank Name</label>
                  <input 
                    value={formData.bankDetails.bankName}
                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, bankName: e.target.value}})}
                    placeholder="e.g. Dutch-Bangla Bank"
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Branch Name</label>
                  <input 
                    value={formData.bankDetails.branchName || ""}
                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, branchName: e.target.value}})}
                    placeholder="e.g. Dhanmondi Branch"
                    className="w-full bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-2 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-rose-600 uppercase tracking-widest ml-0.5">bKash <span className="normal-case text-gray-300 font-normal">(optional)</span></label>
                  <input 
                    value={formData.bankDetails.bkash}
                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, bkash: e.target.value}})}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-rose-50 border border-rose-100 rounded-[4px] px-4 py-2 text-sm font-medium outline-none focus:border-rose-600 transition-all"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-amber-600 uppercase tracking-widest ml-0.5">Nagad <span className="normal-case text-gray-300 font-normal">(optional)</span></label>
                  <input 
                    value={formData.bankDetails.nagad}
                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, nagad: e.target.value}})}
                    placeholder="01XXXXXXXXX"
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
                onClick={nextStep}
                className="flex-1 bg-indigo-600 text-white py-3.5 rounded-[4px] font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                Continue to Document Upload <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-[4px] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Required Documents</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step 5 of 5</p>
               </div>
            </div>

            {requiredDocsList.length === 0 ? (
               <div className="bg-indigo-50/50 border border-indigo-100 rounded-[4px] p-8 text-center">
                  <p className="text-sm font-bold text-indigo-900">No additional documents required.</p>
                  <p className="text-[10px] text-indigo-400 mt-1 uppercase tracking-widest font-black">You can proceed to final submission</p>
               </div>
            ) : (
               <div className="space-y-4">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Please upload the following mandatory documents</p>
                  <div className="grid grid-cols-1 gap-3">
                     {requiredDocsList.filter((d: string) => d !== 'NID').map((doc: string) => (
                        <div key={doc} className="group">
                           <label className={cn(
                              "w-full rounded-[4px] p-4 flex items-center justify-between cursor-pointer border transition-all",
                              additionalDocFiles[doc] ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100 hover:border-indigo-200"
                           )}>
                              <div className="flex items-center gap-3">
                                 <div className={cn(
                                    "w-8 h-8 rounded-[4px] flex items-center justify-center",
                                    additionalDocFiles[doc] ? "bg-emerald-600 text-white" : "bg-white text-gray-400 border border-gray-100"
                                 )}>
                                    {additionalDocFiles[doc] ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                 </div>
                                 <div>
                                    <p className={cn("text-xs font-bold uppercase tracking-tight leading-none", additionalDocFiles[doc] ? "text-emerald-700" : "text-slate-700")}>
                                       {docLabels[doc] || doc}
                                    </p>
                                    <p className="text-[9px] font-medium text-gray-400 mt-1">
                                       {additionalDocFiles[doc] ? "Document uploaded successfully" : "Click to upload file (PDF/Image)"}
                                    </p>
                                 </div>
                              </div>
                              <input 
                                 type="file" 
                                 className="hidden" 
                                 accept=".pdf,image/*" 
                                 onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                       setLoading(true);
                                       try {
                                          const url = await handleFileUpload(file, doc.toLowerCase());
                                          setAdditionalDocFiles(prev => ({ ...prev, [doc]: url }));
                                          toast.success(`${docLabels[doc] || doc} uploaded!`);
                                       } catch (err) {
                                          toast.error("Upload failed");
                                       } finally {
                                          setLoading(false);
                                       }
                                    }
                                 }} 
                              />
                           </label>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={prevStep} className="px-4 bg-gray-50 text-gray-400 rounded-[4px] hover:bg-gray-100">
                 <ArrowLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading || requiredDocsList.filter((d: string) => d !== 'NID').some((d: string) => !additionalDocFiles[d])}
                className="flex-1 bg-indigo-600 text-white py-3.5 rounded-[4px] font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Complete Submission</>}
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
