"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowRight, ArrowLeft, Sparkles, Phone, Facebook, Instagram,
  Store, MapPin, Palette, CheckCircle2, Box, Globe
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

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    phone: "",
    address: "",
    fbPage: "",
    igProfile: "",
    selectedTheme: "MODERN_LIGHT",
    division: "",
    district: "",
    upazila: ""
  });

  const [divisions, setDivisions] = useState<{name: string, bnName: string}[]>([]);
  const [districts, setDistricts] = useState<{name: string, upazilas: string[]}[]>([]);
  const [upazilas, setUpazilas] = useState<string[]>([]);

  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);

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
    { title: "Store Info", icon: Store },
    { title: "Location", icon: MapPin },
    { title: "Socials", icon: Globe },
    { title: "Theme", icon: Palette },
    { title: "Review", icon: CheckCircle2 }
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
          <div className="space-y-10 relative">
            <div className="space-y-3">
               <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.3em]">
                  <Store className="w-4 h-4" /> Identity
               </div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Tell us about your <span className="text-indigo-600 italic">Brand.</span></h2>
               <p className="text-slate-400 text-sm font-medium">Define your store identity to begin your journey.</p>
            </div>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Name</label>
                  <input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. GadgetGear Bangladesh"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white rounded-3xl px-8 py-5 text-sm font-bold outline-none transition-all placeholder:text-slate-300"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store URL (Slug)</label>
                  <div className="relative">
                    <input 
                      value={formData.slug}
                      onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                      placeholder="gadget-gear"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white rounded-3xl px-8 py-5 text-sm font-bold outline-none transition-all placeholder:text-slate-300"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">.businessconnect.bd</div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 relative">
            <div className="space-y-3">
               <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.3em]">
                  <MapPin className="w-4 h-4" /> Logistics
               </div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Where are you <span className="text-indigo-600 italic">located?</span></h2>
               <p className="text-slate-400 text-sm font-medium">This helps us calculate shipping rates and logistics.</p>
            </div>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="+880 1XXX XXXXXX"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white rounded-3xl pl-14 pr-8 py-5 text-sm font-bold outline-none transition-all "
                    />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Division</label>
                     <select 
                       value={formData.division}
                       onChange={e => setFormData({...formData, division: e.target.value})}
                       className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white rounded-3xl px-8 py-5 text-sm font-bold outline-none transition-all appearance-none"
                     >
                        <option value="">Select Division</option>
                        {divisions.map(d => <option key={d.name} value={d.name}>{d.name} ({d.bnName})</option>)}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">District</label>
                     <select 
                       value={formData.district}
                       onChange={e => setFormData({...formData, district: e.target.value})}
                       disabled={!formData.division}
                       className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white rounded-3xl px-8 py-5 text-sm font-bold outline-none transition-all appearance-none disabled:opacity-50"
                     >
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                     </select>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upazila / Thana</label>
                  <select 
                    value={formData.upazila}
                    onChange={e => setFormData({...formData, upazila: e.target.value})}
                    disabled={!formData.district}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white rounded-3xl px-8 py-5 text-sm font-bold outline-none transition-all appearance-none disabled:opacity-50"
                  >
                     <option value="">Select Upazila</option>
                     {upazilas.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Address (House/Road)</label>
                  <textarea 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    placeholder="Enter house number, road, or area details"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white rounded-[32px] px-8 py-5 text-sm font-bold outline-none transition-all min-h-[100px] resize-none"
                  />
               </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 relative">
            <div className="space-y-3">
               <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.3em]">
                  <Globe className="w-4 h-4" /> Social Presence
               </div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Connect your <span className="text-indigo-600 italic">Reach.</span></h2>
               <p className="text-slate-400 text-sm font-medium">We'll use these to sync your social media catalog.</p>
            </div>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Facebook Page URL</label>
                  <div className="relative">
                    <Facebook className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                    <input 
                      value={formData.fbPage}
                      onChange={e => setFormData({...formData, fbPage: e.target.value})}
                      placeholder="facebook.com/your-store"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white rounded-3xl pl-14 pr-8 py-5 text-sm font-bold outline-none transition-all "
                    />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instagram Profile</label>
                  <div className="relative">
                    <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-600" />
                    <input 
                      value={formData.igProfile}
                      onChange={e => setFormData({...formData, igProfile: e.target.value})}
                      placeholder="@your.store"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white rounded-3xl pl-14 pr-8 py-5 text-sm font-bold outline-none transition-all "
                    />
                  </div>
               </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-10 relative">
            <div className="space-y-3">
               <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.3em]">
                  <Palette className="w-4 h-4" /> Visual System
               </div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Pick a <span className="text-indigo-600 italic">Vibe.</span></h2>
               <p className="text-slate-400 text-sm font-medium">Select your initial storefront theme. You can change this later.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {["MODERN_LIGHT", "DARK_ELITE"].map((theme) => (
                 <div 
                   key={theme}
                   onClick={() => setFormData({...formData, selectedTheme: theme})}
                   className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all ${
                     formData.selectedTheme === theme 
                       ? "border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100" 
                       : "border-slate-50 bg-slate-50 hover:bg-slate-100"
                   }`}
                 >
                    <div className="w-full aspect-video bg-white rounded-xl mb-4 border border-slate-100 flex items-center justify-center">
                       <Sparkles className={`w-6 h-6 ${formData.selectedTheme === theme ? "text-indigo-600" : "text-slate-200"}`} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-center">{theme.replace('_', ' ')}</div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-10 text-center py-10 relative">
            <div className="w-24 h-24 bg-indigo-50 rounded-[40px] flex items-center justify-center mx-auto mb-6">
               <CheckCircle2 className="w-12 h-12 text-indigo-600" />
            </div>
            <div className="space-y-4">
               <h2 className="text-4xl font-black text-slate-900 tracking-tight">Ready for <span className="text-indigo-600 italic">Launch?</span></h2>
               <p className="text-slate-400 text-base font-medium max-w-[280px] mx-auto uppercase text-[10px] tracking-widest">
                 Your store configuration is ready to be deployed to the BusinessConnect grid.
               </p>
            </div>
            <div className="pt-8">
               <button 
                 onClick={handleSubmit}
                 disabled={loading}
                 className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-500/20 disabled:opacity-50"
               >
                 {loading ? "Activating Grid..." : "Go Live Now"}
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
