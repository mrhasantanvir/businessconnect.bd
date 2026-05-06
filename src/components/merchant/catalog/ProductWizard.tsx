"use client";

import React, { useState, useTransition, useRef } from "react";
import { 
  Plus, Upload, Sparkles, Check, ChevronRight, ChevronLeft, 
  Tag, Scale, Truck, Globe, ShoppingBag, DollarSign, 
  Layers, Package, MapPin, Search, Barcode, Trash2, Image as ImageIcon, ShieldCheck,
  RefreshCw, Wand2, Scissors, Zap, Download, Globe2, Save, Gift, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { bdDistricts } from "@/lib/data/districts";
import { createProductAction, uploadProductImageAction } from "@/app/products/actions";
import { generateProductSEOAction } from "@/app/products/seoActions";
import { analyzeProductImageAction, generateAILongDescriptionAction, importProductFromChinaUrlAction } from "@/app/products/aiActions";

interface ProductWizardProps {
  categories: any[];
  brands: any[];
}

export default function ProductWizard({ categories, brands }: ProductWizardProps) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    purchasePrice: "",
    discountPrice: "",
    isFreeDelivery: false,
    stock: "",
    sku: "",
    barcode: "",
    categoryId: "",
    brandId: "",
    unitType: "piece",
    unitWeight: "",
    allowedDistricts: "Dhaka Only",
    preferredCourier: "STEADFAST",
    isHomeDelivery: true,
    isCollectionPoint: false,
    allowedCouriers: ["STEADFAST", "REDX"],
    shippingType: "GENERAL",
    paymentPolicy: "COD",
    partialAmount: "0",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    image: null as string | null,
    shortDescription: "",
    tagline: "",
  });

  const steps = [
    { id: 1, name: "Vision Hub", icon: ImageIcon, sub: "AI Recognition" },
    { id: 2, name: "AI Copywriter", icon: Wand2, sub: "Content Gen" },
    { id: 3, name: "Commerce Ops", icon: DollarSign, sub: "Inventory & POS" },
    { id: 4, name: "Logistics", icon: Truck, sub: "Delivery & SEO" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsAiLoading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const result = await uploadProductImageAction(uploadData);
      setFormData(prev => ({ ...prev, image: result.url }));
      
      const analysis = await analyzeProductImageAction(result.url);
      setFormData(prev => ({
        ...prev,
        name: analysis.suggestedName,
        categoryId: categories.find(c => c.name.toLowerCase().includes(analysis.category.toLowerCase()))?.id || "",
        brandId: brands.find(b => b.name.toLowerCase().includes(analysis.brand.toLowerCase()))?.id || "",
      }));
      
      if (analysis.suggestedName) {
         const content = await generateAILongDescriptionAction({ name: analysis.suggestedName, category: analysis.category });
         setFormData(prev => ({
           ...prev,
           shortDescription: content.shortDescription,
           description: content.longDescription,
           tagline: content.tagline
         }));
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      setIsAiLoading(false);
    }
  };

  const handleImportUrl = async () => {
    if (!importUrl) return;
    setIsAiLoading(true);
    try {
       const result = await importProductFromChinaUrlAction(importUrl);
       setFormData(prev => ({
         ...prev,
         name: result.data.name,
         description: result.data.description,
         price: result.data.price.toString(),
         stock: result.data.stock.toString(),
         image: result.data.images[0],
         categoryId: categories.find(c => c.name.toLowerCase().includes(result.data.category.toLowerCase()))?.id || ""
       }));
    } catch (err) {
       console.error(err);
    } finally {
       setIsAiLoading(false);
    }
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        await createProductAction({
          ...formData,
          price: parseFloat(formData.price) || 0,
          purchasePrice: parseFloat(formData.purchasePrice) || 0,
          discountPrice: parseFloat(formData.discountPrice) || 0,
          stock: parseInt(formData.stock) || 0,
          unitWeight: formData.unitWeight ? parseFloat(formData.unitWeight) : 0,
          allowedCouriers: formData.allowedCouriers.join(","),
          partialAmount: parseFloat(formData.partialAmount) || 0,
          categoryId: formData.categoryId || undefined,
          brandId: formData.brandId || undefined,
        });
        window.location.href = "/merchant/catalog";
      } catch (err) {
        console.error(err);
      }
    });
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="w-full max-w-6xl mx-auto bg-white/40 backdrop-blur-2xl rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden flex flex-col md:flex-row min-h-[780px] animate-in zoom-in-95 duration-700">
      
      {/* Premium Glass Sidebar */}
      <div className="w-full md:w-80 bg-slate-900/5 backdrop-blur-md p-10 border-b md:border-b-0 md:border-r border-white/40 flex flex-col justify-between">
        <div className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-lg uppercase tracking-tighter text-slate-900 leading-none">Product Studio</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enterprise Launchpad</p>
            </div>
          </div>

          <div className="space-y-10">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              return (
                <div key={s.id} className="flex items-center gap-5 relative group cursor-pointer" onClick={() => step > s.id && setStep(s.id)}>
                  <div className={cn(
                    "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 z-10",
                    isActive ? "border-indigo-600 bg-indigo-600 text-white scale-110 shadow-xl shadow-indigo-100" : 
                    isCompleted ? "border-green-500 bg-green-500 text-white" : "border-slate-200 bg-white text-slate-300"
                  )}>
                    {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className={cn("text-[9px] font-black uppercase tracking-widest", isActive ? "text-indigo-600" : "text-slate-400")}>{s.sub}</span>
                    <span className={cn("text-base font-black tracking-tight", isActive ? "text-slate-900" : "text-slate-400")}>{s.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-[32px] bg-indigo-600 p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
           <Sparkles className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:rotate-12 transition-all duration-1000" />
           <div className="flex items-center gap-2 mb-3">
             <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest">Neural Link Active</span>
           </div>
           <p className="text-[11px] font-bold leading-relaxed uppercase opacity-80">
             Vision-First workflow enabled for automated category & SEO mapping.
           </p>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 p-8 md:p-14 flex flex-col relative overflow-hidden">
        
        {/* Futuristic URL Node */}
        {step === 1 && (
           <div className="mb-12 animate-in slide-in-from-top-6 duration-700">
              <div className="flex items-center gap-4 bg-white/60 border border-white p-3 rounded-[32px] shadow-sm focus-within:shadow-xl focus-within:border-indigo-600/30 transition-all">
                 <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                    <Globe2 className="w-5 h-5" />
                 </div>
                 <input 
                   value={importUrl}
                   onChange={(e) => setImportUrl(e.target.value)}
                   placeholder="Neural Sync: Alibaba, Amazon, 1688 URL..."
                   className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300"
                 />
                 <button 
                   onClick={handleImportUrl}
                   disabled={isAiLoading}
                   className="px-8 h-12 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                 >
                    {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Import Node"}
                 </button>
              </div>
           </div>
        )}

        {/* Content Modules */}
        <div className="flex-1 flex flex-col">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-10 duration-700 h-full flex flex-col">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Vision <span className="text-indigo-600">Intelligence</span></h3>
                 <div className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Real-time Detection</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1">
                 <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative group w-full aspect-square rounded-[48px] border-4 border-dashed transition-all overflow-hidden cursor-pointer",
                    formData.image ? "border-green-500/20 bg-slate-50" : "border-slate-200 bg-slate-50/50 hover:border-indigo-400"
                  )}
                 >
                    {isUploading ? (
                       <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
                          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 animate-pulse">Neural Path Scan...</p>
                       </div>
                    ) : formData.image ? (
                       <img src={formData.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    ) : (
                       <div className="flex flex-col items-center gap-6 p-12 text-center h-full justify-center">
                          <div className="w-24 h-24 rounded-[40px] bg-white shadow-2xl shadow-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                             <Upload className="w-10 h-10 text-indigo-600" />
                          </div>
                          <div>
                             <p className="text-lg font-black text-slate-800 uppercase tracking-tight">Upload Media</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-[200px]">Vision engine will detect materials, colors & context</p>
                          </div>
                       </div>
                    )}
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                 </div>

                 <div className="space-y-10 py-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Neural suggested name
                      </label>
                      <input 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={isAiLoading ? "Processing neural paths..." : "Awaiting visual data..."}
                        className="w-full bg-transparent border-b-4 border-slate-100 focus:border-indigo-600 outline-none py-4 text-3xl font-black text-slate-900 tracking-tight transition-all placeholder:text-slate-200"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mapped Category</label>
                          <select 
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 border-none rounded-[24px] p-6 text-xs font-black outline-none focus:ring-4 focus:ring-indigo-600/10 uppercase tracking-widest text-slate-700 appearance-none shadow-sm"
                          >
                             <option value="">SELECT GLOBAL CATEGORY</option>
                             {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Authority</label>
                          <select 
                            name="brandId"
                            value={formData.brandId}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 border-none rounded-[24px] p-6 text-xs font-black outline-none focus:ring-4 focus:ring-indigo-600/10 uppercase tracking-widest text-slate-700 appearance-none shadow-sm"
                          >
                             <option value="">GENERIC (NO BRAND)</option>
                             {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                          </select>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-auto pt-10 border-t border-slate-100 flex justify-end">
                 <button 
                  onClick={nextStep}
                  disabled={!formData.image || isAiLoading}
                  className="group flex items-center gap-4 px-12 h-16 bg-slate-900 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl disabled:opacity-50"
                 >
                    Next Engine <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                 </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-10 duration-700 h-full flex flex-col">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">AI <span className="text-indigo-600">Copywriter</span></h3>
                  <button 
                    onClick={async () => {
                       setIsAiLoading(true);
                       const content = await generateAILongDescriptionAction({ name: formData.name, category: "Product" });
                       setFormData({...formData, description: content.longDescription, shortDescription: content.shortDescription, tagline: content.tagline});
                       setIsAiLoading(false);
                    }}
                    className="flex items-center gap-3 px-8 py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                     <RefreshCw className={cn("w-4 h-4", isAiLoading && "animate-spin")} /> Regenerate Neural Context
                  </button>
               </div>

               <div className="space-y-10 flex-1 overflow-y-auto pr-4 custom-scrollbar">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marketing Neural Tagline</label>
                     <input 
                      name="tagline"
                      value={formData.tagline}
                      onChange={handleInputChange}
                      className="w-full bg-indigo-50/50 border border-indigo-100 rounded-[24px] px-8 py-5 text-lg font-black text-indigo-900 outline-none"
                      placeholder="Marketing headline..."
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Executive Summary</label>
                     <textarea 
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full bg-slate-50 border-none rounded-[28px] p-8 text-sm font-bold text-slate-800 outline-none resize-none shadow-sm"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Generated Narrative</label>
                     <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={8}
                      className="w-full bg-slate-50 border-none rounded-[32px] p-10 text-sm font-medium text-slate-600 outline-none leading-relaxed shadow-inner"
                     />
                  </div>
               </div>

               <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between">
                  <button onClick={prevStep} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                     <ChevronLeft className="w-5 h-5" /> Previous
                  </button>
                  <button onClick={nextStep} className="group flex items-center gap-4 px-12 h-16 bg-slate-900 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl">
                     Commerce Ops <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-10 duration-700 h-full flex flex-col">
               <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-10">Commerce <span className="text-amber-500">Infrastructure</span></h3>
               <div className="space-y-12 flex-1 overflow-y-auto pr-4 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <StatBox icon={Download} label="Purchase Rate" value={formData.purchasePrice} name="purchasePrice" onChange={handleInputChange} color="blue" />
                     <StatBox icon={DollarSign} label="Retail Price" value={formData.price} name="price" onChange={handleInputChange} color="indigo" />
                     <StatBox icon={Gift} label="Discounted" value={formData.discountPrice} name="discountPrice" onChange={handleInputChange} color="rose" />
                     <div 
                        onClick={() => setFormData({...formData, isFreeDelivery: !formData.isFreeDelivery})}
                        className={cn("p-6 rounded-[32px] border-2 transition-all flex flex-col justify-between cursor-pointer group", formData.isFreeDelivery ? "bg-green-500 border-green-500 shadow-xl shadow-green-100" : "bg-white border-slate-100 hover:border-indigo-600/30")}
                     >
                        <Truck className={cn("w-8 h-8", formData.isFreeDelivery ? "text-white" : "text-slate-300")} />
                        <div className="mt-4">
                           <p className={cn("text-[9px] font-black uppercase tracking-widest", formData.isFreeDelivery ? "text-white/70" : "text-slate-400")}>Shipping Policy</p>
                           <h4 className={cn("text-xs font-black uppercase tracking-tight", formData.isFreeDelivery ? "text-white" : "text-slate-900")}>{formData.isFreeDelivery ? "Free Delivery" : "Paid Delivery"}</h4>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-100 space-y-4">
                        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm"><Package className="w-5 h-5" /></div><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Status</span></div>
                        <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="text-4xl font-black text-slate-900 bg-transparent border-none outline-none w-full tracking-tighter" placeholder="0" />
                     </div>
                     <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-100 space-y-4">
                        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm"><Barcode className="w-5 h-5" /></div><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">POS / SKU Integration</span></div>
                        <input type="text" name="barcode" value={formData.barcode} onChange={handleInputChange} className="text-3xl font-black text-slate-900 bg-transparent border-none outline-none w-full font-mono tracking-tighter" placeholder="AUTO-NODE-GEN" />
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Settlement Protocols</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                           { id: "COD", label: "Cash On Delivery", icon: ShoppingBag },
                           { id: "FULL_ADVANCE", label: "Full Advance", icon: ShieldCheck },
                           { id: "PARTIAL_ADVANCE", label: "Partial Booking", icon: RefreshCw }
                        ].map((p) => (
                           <button 
                              key={p.id} 
                              onClick={() => setFormData({...formData, paymentPolicy: p.id})}
                              className={cn("p-8 rounded-[32px] border-2 transition-all flex flex-col gap-6 text-left", formData.paymentPolicy === p.id ? "bg-white border-indigo-600 shadow-xl shadow-indigo-50" : "bg-slate-50 border-slate-50 hover:border-slate-200")}
                           >
                              <p.icon className={cn("w-8 h-8", formData.paymentPolicy === p.id ? "text-indigo-600" : "text-slate-300")} />
                              <span className={cn("text-sm font-black uppercase tracking-tighter", formData.paymentPolicy === p.id ? "text-slate-900" : "text-slate-400")}>{p.label}</span>
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between">
                  <button onClick={prevStep} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                     <ChevronLeft className="w-5 h-5" /> Previous
                  </button>
                  <button onClick={nextStep} className="group flex items-center gap-4 px-12 h-16 bg-slate-900 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl">
                     Logistics Sync <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-10 duration-700 h-full flex flex-col">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Logistics <span className="text-indigo-600">& SEO</span></h3>
                  <button 
                    onClick={async () => {
                       setIsAiLoading(true);
                       const seo = await generateProductSEOAction({ name: formData.name, description: formData.description });
                       setFormData({...formData, seoTitle: seo.title, seoDescription: seo.description, seoKeywords: seo.keywords});
                       setIsAiLoading(false);
                    }}
                    className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                  >
                     <RefreshCw className={cn("w-4 h-4", isAiLoading && "animate-spin")} /> SEO Neural Optimizer
                  </button>
               </div>

               <div className="space-y-12 flex-1 overflow-y-auto pr-4 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistics Territory</label>
                        <div className="grid grid-cols-2 gap-3">
                           {["Dhaka Only", "All Bangladesh", "Outside Dhaka", "Global Shipping"].map((z) => (
                              <button key={z} onClick={() => setFormData({...formData, allowedDistricts: z})} className={cn("px-6 py-4 rounded-2xl text-[10px] font-black border transition-all uppercase", formData.allowedDistricts === z ? "bg-indigo-600 text-white border-indigo-600 shadow-lg" : "bg-slate-50 border-slate-50 text-slate-400")}>{z}</button>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Pipelines</label>
                        <div className="grid grid-cols-2 gap-3">
                           {["STEADFAST", "REDX", "PATHAO", "SUNDARBAN"].map((c) => {
                              const sel = formData.allowedCouriers.includes(c);
                              return (
                                 <button key={c} onClick={() => { const next = sel ? formData.allowedCouriers.filter(x => x !== c) : [...formData.allowedCouriers, c]; setFormData({...formData, allowedCouriers: next}); }} className={cn("px-6 py-4 rounded-2xl text-[10px] font-black border transition-all flex items-center justify-between uppercase", sel ? "bg-white border-indigo-600 text-indigo-600 shadow-md" : "bg-slate-50 border-slate-50 text-slate-400")}>{c}{sel && <Check className="w-4 h-4" />}</button>
                              );
                           })}
                        </div>
                     </div>
                  </div>

                  <div className="p-10 bg-slate-900 rounded-[48px] text-white space-y-8 relative overflow-hidden">
                     <Globe className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5" />
                     <div className="flex items-center gap-3 relative z-10"><div className="w-2 h-6 bg-indigo-500 rounded-full" /><h4 className="text-xl font-black uppercase tracking-tight">Neural SEO Bridge</h4></div>
                     <div className="grid grid-cols-1 gap-8 relative z-10">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Meta Title Index</label>
                           <input value={formData.seoTitle} onChange={(e) => setFormData({...formData, seoTitle: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Meta Description Engine</label>
                           <textarea value={formData.seoDescription} onChange={(e) => setFormData({...formData, seoDescription: e.target.value})} rows={3} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white/80 outline-none focus:border-indigo-500 resize-none" />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between">
                  <button onClick={prevStep} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                     <ChevronLeft className="w-5 h-5" /> Previous
                  </button>
                  <button onClick={handleSubmit} disabled={isPending} className="group flex items-center gap-4 px-16 h-16 bg-indigo-600 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.3em] hover:bg-slate-900 transition-all shadow-[0_20px_40px_rgba(79,70,229,0.3)]">
                     {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />} Launch Product
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, name, onChange, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-500",
    indigo: "bg-indigo-50 text-indigo-500",
    rose: "bg-rose-50 text-rose-500",
  };

  return (
    <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-xl shadow-slate-100/50 space-y-4 hover:border-indigo-600/20 transition-all group">
       <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", colors[color])}><Icon className="w-5 h-5" /></div>
       <div className="space-y-1">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</label>
          <div className="flex items-center gap-1">
             <span className="text-xl font-black text-slate-900/40 leading-none mt-1">৳</span>
             <input type="number" name={name} value={value} onChange={onChange} className="text-xl font-black text-slate-900 bg-transparent border-none outline-none w-full tracking-tight" placeholder="0.00" />
          </div>
       </div>
    </div>
  );
}
