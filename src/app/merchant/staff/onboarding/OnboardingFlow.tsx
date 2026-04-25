"use client";

import React, { useState, useTransition } from "react";
import { 
  ShieldCheck, 
  FileText, 
  Upload, 
  Banknote, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  UserPlus, 
  PenTool, 
  Lock,
  ArrowRight
} from "lucide-react";
import { signAgreementAction, uploadStaffDocumentAction, completeStaffOnboardingAction, saveStaffDetailsAction } from "../actions";

const STEPS = [
  { id: 1, label: "Welcome", icon: UserPlus },
  { id: 2, label: "Identity Details", icon: ShieldCheck },
  { id: 3, label: "Agreement", icon: FileText },
  { id: 4, label: "Documents", icon: Upload },
  { id: 5, label: "Final Submission", icon: CheckCircle2 },
];

export default function OnboardingFlow({ profile }: { profile: any }) {
  const [currentStep, setCurrentStep] = useState(
    profile.status === "PENDING_APPROVAL" ? 5 : (profile.onboardingStep || 1)
  );
  const [isPending, startTransition] = useTransition();
  const [signed, setSigned] = useState(false);
  const [address, setAddress] = useState(profile.address || "");
  const [nid, setNid] = useState(profile.nidNumber || "");
  const [reference, setReference] = useState(profile.reference || "");
  const [emergency, setEmergency] = useState(profile.emergencyContact || "");

  const handleSaveDetails = () => {
    startTransition(async () => {
      await saveStaffDetailsAction(profile.id, {
        address,
        nidNumber: nid,
        reference,
        emergencyContact: emergency
      });
      setCurrentStep(3);
    });
  };

  const handleSign = () => {
    startTransition(async () => {
      await signAgreementAction(profile.id);
      setCurrentStep(4);
    });
  };

  const handleUpload = () => {
    startTransition(async () => {
      await uploadStaffDocumentAction(profile.id, "NID Card", "https://example.com/nid.pdf");
      setCurrentStep(5);
    });
  };

  const handleComplete = () => {
    startTransition(async () => {
      await completeStaffOnboardingAction(profile.id);
      alert("Submission successful! Your account is now pending HR approval.");
      window.location.reload();
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8 animate-in zoom-in duration-700">
      
      {/* Step Indicator */}
      <div className="w-full max-w-4xl mb-12 flex items-center justify-between px-10">
         {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center group">
               <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${currentStep >= step.id ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center shadow-2xl transition-all ${currentStep >= step.id ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-slate-400'}`}>
                     <step.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600 transition-colors">{step.label}</span>
               </div>
               {idx < STEPS.length - 1 && (
                  <div className={`w-24 h-1 mx-4 rounded-full transition-all duration-1000 ${currentStep > step.id ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-200'}`} />
               )}
            </div>
         ))}
      </div>

      {/* Main Container */}
      <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-[56px] p-12 shadow-2xl shadow-indigo-50 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-24 bg-indigo-50/50 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3" />
         
         <div className="relative z-10">
            {currentStep === 1 && (
               <div className="text-center space-y-8 animate-in slide-in-from-bottom-10 duration-700">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-50">
                     <UserPlus className="w-10 h-10" />
                  </div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Welcome to the<br/><span className="text-indigo-600">Elite</span> Network</h2>
                  <p className="text-slate-500 font-medium text-lg max-w-md mx-auto uppercase tracking-tight italic">Your account has been provisioned as a <span className="text-slate-900 font-black">{profile.jobRole}</span>. Let's finalize your digital identity.</p>
                  <button 
                     onClick={() => setCurrentStep(2)}
                     className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest text-sm hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200"
                  >
                     Begin Initialization <ChevronRight className="w-5 h-5 text-indigo-400" />
                  </button>
               </div>
            )}

            {currentStep === 2 && (
               <div className="space-y-8 animate-in fade-in duration-700">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-slate-900 text-[#BEF264] rounded-[24px] flex items-center justify-center shadow-xl">
                        <ShieldCheck className="w-8 h-8" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Identity Profile</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Verify your personal operational details</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Permanent Address</label>
                        <textarea 
                           value={address}
                           onChange={(e) => setAddress(e.target.value)}
                           className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-[24px] font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none h-24"
                           placeholder="Full physical address..."
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">NID Number</label>
                           <input 
                              value={nid}
                              onChange={(e) => setNid(e.target.value)}
                              className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-[24px] font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                              placeholder="xxxxxxxxxxxxx"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Emergency Contact</label>
                           <input 
                              value={emergency}
                              onChange={(e) => setEmergency(e.target.value)}
                              className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-[24px] font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                              placeholder="017xxxxxxxx"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Professional Reference</label>
                        <input 
                           value={reference}
                           onChange={(e) => setReference(e.target.value)}
                           className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-[24px] font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                           placeholder="Name - Relationship - Phone"
                        />
                     </div>
                  </div>

                  <button 
                     onClick={handleSaveDetails}
                     disabled={isPending || !address || !nid}
                     className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest text-sm hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 disabled:opacity-30"
                  >
                     {isPending ? <Sparkles className="w-5 h-5 animate-spin" /> : 'Lock Identity & Proceed'} <ChevronRight className="w-5 h-5 text-indigo-400" />
                  </button>
               </div>
            )}

            {currentStep === 3 && (
               <div className="space-y-10 animate-in fade-in duration-700">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-indigo-100">
                        <PenTool className="w-8 h-8" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Digital Agreement</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Legally binding employment contract</p>
                     </div>
                  </div>

                  <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] h-64 overflow-y-auto text-slate-600 text-xs leading-relaxed custom-scrollbar font-medium">
                     <h3 className="font-black text-slate-900 uppercase mb-4 tracking-tight text-lg">Terms of Operations</h3>
                     <p className="mb-4">By signing this document, you agree to the employment terms of BusinessConnect.bd and its associated merchant entity. You acknowledge that your digital activities, including mouse clicks, keyboard interactions, and session durations, will be tracked via our proprietary 'Pulse' AI engine for performance optimization and payroll calculation.</p>
                     <p className="mb-4 italic font-bold text-indigo-600">Salary Structure: {profile.wageType} @ ৳{profile.baseSalary.toLocaleString()}</p>
                     <p>Any misuse of the platform or fraudulent activity will result in immediate termination of this agreement and potential legal action.</p>
                  </div>

                  <div className="flex items-center gap-4">
                     <div className="flex-1 relative">
                        <input 
                           type="text" 
                           placeholder="Type your full name to sign" 
                           className="w-full px-8 py-5 bg-white border border-slate-200 rounded-[24px] font-black italic outline-none focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300"
                           onChange={(e) => setSigned(e.target.value.length > 3)}
                        />
                     </div>
                     <button 
                        disabled={!signed || isPending}
                        onClick={handleSign}
                        className="px-10 py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:grayscale"
                     >
                        {isPending ? <Sparkles className="w-5 h-5 animate-spin" /> : 'Confirm Sign'}
                     </button>
                  </div>
               </div>
            )}

            {currentStep === 3 && (
               <div className="space-y-10 animate-in slide-in-from-right-10 duration-700">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-emerald-500 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-emerald-100">
                        <Lock className="w-8 h-8" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Secure Vault</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Identity verification & document storage</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                     {["National ID Card", "Profile Photograph", "Work Portfolio (Optional)"].map((doc, i) => (
                        <div key={i} className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex items-center justify-between group hover:border-indigo-400 hover:bg-white transition-all cursor-pointer">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                                 <Upload className="w-5 h-5" />
                              </div>
                              <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{doc}</span>
                           </div>
                           <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Awaiting PDF/JPG</div>
                        </div>
                     ))}
                  </div>

                  <button 
                     disabled={isPending}
                     onClick={handleUpload}
                     className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest text-sm hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200"
                  >
                     Sync to Vault <ArrowRight className="w-5 h-5 text-[#BEF264]" />
                  </button>
               </div>
            )}

            {currentStep === 5 && (
               <div className="text-center space-y-10 animate-in zoom-in duration-700">
                  <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-50 relative">
                     <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-pulse" />
                     <ShieldCheck className="w-14 h-14 relative z-10" />
                  </div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Awaiting<br/><span className="text-indigo-600">Approval</span></h2>
                  <p className="text-slate-500 font-medium text-lg max-w-md mx-auto uppercase tracking-tight italic">Your dossier has been submitted. A Command Officer (HR) will review your information shortly.</p>
                  
                  <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-around">
                     <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Profile Status</p>
                        <p className="text-xl font-black text-orange-500 italic uppercase">PENDING</p>
                     </div>
                     <div className="w-px h-10 bg-slate-200" />
                     <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Payout</p>
                        <p className="text-xl font-black text-indigo-600 italic uppercase">৳{profile.baseSalary.toLocaleString()}</p>
                     </div>
                  </div>

                  <button 
                     disabled={isPending}
                     onClick={handleComplete}
                     className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100"
                  >
                     Finalize Submission <Sparkles className="w-5 h-5 text-[#BEF264]" />
                  </button>
               </div>
            )}
         </div>
      </div>

      <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Powered by Antigravity Performance Engine</p>
    </div>
  );
}
