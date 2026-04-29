"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Phone, 
  Store, 
  MapPin, 
  CheckCircle2, 
  Box, 
  FileText,
  Users,
  Building2,
  Upload,
  UserSquare2,
  Lock
} from "lucide-react";
import { completeOnboardingAction } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getDivisions, getDistrictsByDivision, getUpazilasByDistrict } from "@/lib/locationHelper";

export function OnboardingClient() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    businessType: "",
    phone: "",
    address: "",
    division: "",
    district: "",
    upazila: "",
    tradeLicenseUrl: "",
    nidFrontUrl: "",
    nidBackUrl: "",
    tradeLicenseName: "",
    nidFrontName: "",
    nidBackName: "",
    employeeCount: 1,
  });

  const [divisions, setDivisions] = useState<{name: string, bnName: string}[]>([]);
  const [districts, setDistricts] = useState<{name: string, upazilas: string[]}[]>([]);
  const [upazilas, setUpazilas] = useState<string[]>([]);

  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    setDivisions(getDivisions());
  }, []);

  useEffect(() => {
    if (formData.division) {
      const dists = getDistrictsByDivision(formData.division);
      setDistricts(dists);
      setFormData(prev => ({ ...prev, district: "", upazila: "" }));
    }
  }, [formData.division]);

  useEffect(() => {
    if (formData.district) {
      const upzs = getUpazilasByDistrict(formData.district);
      setUpazilas(upzs);
      setFormData(prev => ({ ...prev, upazila: "" }));
    }
  }, [formData.district]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await completeOnboardingAction(formData);
      if (res.success) {
        setIsBuilding(true);
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          setBuildProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            toast.success("Store successfully activated!");
            router.push("/dashboard");
          }
        }, 100);
      }
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const steps = [
    { title: "Business Info", icon: Building2 },
    { title: "Documents", icon: FileText },
    { title: "Team Size", icon: Users },
    { title: "Finalize", icon: CheckCircle2 }
  ];

  if (!mounted) return null;

  if (isBuilding) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-700">
        <div className="relative">
           <div className="w-32 h-32 border-4 border-indigo-100 rounded-full animate-spin-slow"></div>
           <Sparkles className="w-12 h-12 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="space-y-4">
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Activating <span className="text-indigo-600">Merchant</span> Store...</h2>
           <p className="text-slate-500 font-medium max-w-sm mx-auto uppercase text-[10px] tracking-[0.2em]">We are synchronizing your workspace and deploying your storefront environment.</p>
        </div>
        <div className="w-full max-w-md bg-white border border-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
           <div 
             className="h-full bg-gradient-to-r from-indigo-600 to-blue-400 transition-all duration-300"
             style={{ width: `${buildProgress}%` }}
           />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{buildProgress}% Environment Deployed</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 font-outfit">
      
      {/* Progress Header */}
      <div className="max-w-xl w-full mb-12">
        <div className="flex justify-between items-center mb-8">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                 <Box className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase italic">Business<span className="text-indigo-600">Connect</span></span>
           </div>
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
              Step {step} of 5
           </div>
        </div>
        <div className="flex gap-2.5">
           {steps.map((s, i) => (
             <div 
               key={i} 
               className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
                 step > i ? "bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]" : "bg-white border border-slate-100"
               }`} 
             />
           ))}
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-xl w-full bg-white border border-slate-100 rounded-[48px] p-12 shadow-2xl shadow-indigo-500/5 relative overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3 text-center">
               <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.3em] bg-indigo-50 px-4 py-1.5 rounded-full">
                  <Building2 className="w-4 h-4" /> Business Identity
               </div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Start with your <span className="text-indigo-600 italic">Business Details.</span></h2>
            </div>
            
            <div className="space-y-5">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Business Name</label>
                  <input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. BlueSky Enterprises Ltd."
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white rounded-3xl px-8 py-5 text-sm font-bold outline-none transition-all placeholder:text-slate-300"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Type</label>
                  <select 
                    value={formData.businessType}
                    onChange={e => setFormData({...formData, businessType: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white rounded-3xl px-8 py-5 text-sm font-bold outline-none transition-all appearance-none"
                  >
                    <option value="">Select Type</option>
                    <option value="RETAIL">Retail Store</option>
                    <option value="WHOLESALE">Wholesale / Distribution</option>
                    <option value="SERVICE">Service Provider</option>
                    <option value="MANUFACTURING">Manufacturing</option>
                    <option value="OTHER">Other</option>
                  </select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Division</label>
                      <select 
                        value={formData.division}
                        onChange={e => setFormData({...formData, division: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white rounded-3xl px-6 py-4 text-xs font-bold outline-none transition-all appearance-none"
                      >
                        <option value="">Select</option>
                        {divisions.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                      </select>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">District</label>
                      <select 
                        value={formData.district}
                        onChange={e => setFormData({...formData, district: e.target.value})}
                        disabled={!formData.division}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white rounded-3xl px-6 py-4 text-xs font-bold outline-none transition-all appearance-none disabled:opacity-50"
                      >
                        <option value="">Select</option>
                        {districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                      </select>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Business Address</label>
                  <textarea 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    placeholder="Enter detailed address..."
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white rounded-[32px] px-8 py-4 text-sm font-bold outline-none transition-all min-h-[100px] resize-none placeholder:text-slate-300"
                  />
               </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3 text-center">
               <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.3em] bg-indigo-50 px-4 py-1.5 rounded-full">
                  <FileText className="w-4 h-4" /> Verification
               </div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Upload <span className="text-indigo-600 italic">Legal Documents.</span></h2>
            </div>

            <div className="space-y-6">
               <div className="space-y-3 p-6 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 hover:border-indigo-600/20 transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Trade License</h4>
                      <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">PDF or Image (Max 5MB)</p>
                    </div>
                    <label className="cursor-pointer bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-all">
                      <Upload className="w-5 h-5 text-indigo-600" />
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setFormData({...formData, tradeLicenseUrl: "mock_id", tradeLicenseName: file.name});
                        }} 
                      />
                    </label>
                  </div>
                  {formData.tradeLicenseName && (
                    <div className="flex items-center gap-2 text-green-600 text-[10px] font-bold uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-xl w-max">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {formData.tradeLicenseName}
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3 p-6 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 hover:border-indigo-600/20 transition-all">
                    <div className="flex flex-col items-center text-center">
                      <UserSquare2 className="w-8 h-8 text-slate-300 mb-3" />
                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">NID Front</h4>
                      <label className="mt-4 cursor-pointer bg-white px-4 py-2 rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-50">
                        {formData.nidFrontName ? "Change" : "Upload"}
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setFormData({...formData, nidFrontUrl: "mock_id", nidFrontName: file.name});
                          }} 
                        />
                      </label>
                    </div>
                    {formData.nidFrontName && (
                      <div className="text-center text-green-600 text-[8px] font-bold uppercase tracking-widest mt-2 truncate w-full px-2">{formData.nidFrontName}</div>
                    )}
                  </div>
                  <div className="space-y-3 p-6 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 hover:border-indigo-600/20 transition-all">
                    <div className="flex flex-col items-center text-center">
                      <UserSquare2 className="w-8 h-8 text-slate-300 mb-3" />
                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">NID Back</h4>
                      <label className="mt-4 cursor-pointer bg-white px-4 py-2 rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-50">
                        {formData.nidBackName ? "Change" : "Upload"}
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setFormData({...formData, nidBackUrl: "mock_id", nidBackName: file.name});
                          }} 
                        />
                      </label>
                    </div>
                    {formData.nidBackName && (
                      <div className="text-center text-green-600 text-[8px] font-bold uppercase tracking-widest mt-2 truncate w-full px-2">{formData.nidBackName}</div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3 text-center">
               <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.3em] bg-indigo-50 px-4 py-1.5 rounded-full">
                  <Users className="w-4 h-4" /> Team Scale
               </div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">How many <span className="text-indigo-600 italic">Employees?</span></h2>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] px-8">System resources will be allocated based on your team size.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {[1, 5, 10, 20, 50, 100].map((count) => (
                 <button 
                   key={count}
                   onClick={() => setFormData({...formData, employeeCount: count})}
                   className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-2 ${
                     formData.employeeCount === count 
                       ? "border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100" 
                       : "border-slate-50 bg-slate-50 hover:bg-slate-100"
                   }`}
                 >
                    <span className={`text-2xl font-black ${formData.employeeCount === count ? "text-indigo-600" : "text-slate-300"}`}>{count}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Users</span>
                 </button>
               ))}
            </div>
            
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-[32px] flex gap-4 items-start">
               <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
               <div className="space-y-1">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest">Enterprise Scaling</h4>
                  <p className="text-[10px] text-amber-700 font-medium">Monthly billing will be adjusted based on the number of staff seats selected.</p>
               </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-10 text-center py-10 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-indigo-50 rounded-[40px] flex items-center justify-center mx-auto mb-6 relative">
               <Lock className="w-12 h-12 text-indigo-600" />
               <div className="absolute inset-0 bg-indigo-600/10 animate-ping rounded-[40px]"></div>
            </div>
            <div className="space-y-4">
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Review & <span className="text-indigo-600 italic">Submit.</span></h2>
               <p className="text-slate-400 text-base font-medium max-w-[280px] mx-auto uppercase text-[10px] tracking-widest leading-loose">
                 Your information will be reviewed by the BusinessConnect Super Admin panel. Verification typically takes <span className="text-indigo-600 font-black">2-4 business hours.</span>
               </p>
            </div>
            <div className="pt-8">
               <button 
                 onClick={handleSubmit}
                 disabled={loading}
                 className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-500/20 disabled:opacity-50"
               >
                 {loading ? "Sending Encrypted Data..." : "Submit for Approval"}
               </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="flex gap-4 pt-16">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="p-6 bg-slate-50 text-slate-400 rounded-3xl hover:bg-slate-100 transition-all active:scale-95"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <button 
              onClick={nextStep}
              className="flex-1 bg-white text-slate-900 border border-slate-100 py-6 rounded-[32px] font-black flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all shadow-xl shadow-slate-100 active:scale-95 uppercase text-[10px] tracking-[0.2em]"
            >
              Next: {steps[step]?.title} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <p className="mt-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
        Powered by BusinessConnect.bd - Enterprise Division
      </p>
    </div>
  );
}
