"use client";

import React, { useState, useTransition, useRef } from "react";
import { 
  Plus, Upload, Sparkles, Check, ChevronRight, ChevronLeft, 
  Tag, Scale, Truck, Globe, ShoppingBag, DollarSign, 
  Layers, Package, MapPin, Search, Barcode, Trash2, Image as ImageIcon, ShieldCheck,
  RefreshCw, Wand2, Scissors, Zap, Download, Globe2, Save, Gift
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
      alert("AI Processing failed.");
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
       alert("External Node Synchronized! 🌍");
    } catch (err) {
       alert("Import failed.");
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
        alert("Intelligent Product Successfully Launched! 🚀");
        window.location.href = "/merchant/catalog";
      } catch (err) {
        alert("Launch sequence failure.");
      }
    });
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="w-full max-w-6xl bg-white  rounded-[48px] shadow-2xl border border-surface-border overflow-hidden flex flex-col md:flex-row min-h-[750px]">
      
      {/* Sidebar: Step Progress */}
      <div className="w-full md:w-80 bg-gray-50/50  p-10 border-b md:border-b-0 md:border-r border-surface-border flex flex-col justify-between">
        <div className="space-y-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-blue flex items-center justify-center shadow-xl shadow-primary-blue/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-base uppercase tracking-tighter text-foreground">AI Product Launch</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vision-First Workflow</p>
            </div>
          </div>

          <div className="space-y-8">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              return (
                <div key={s.id} className="flex items-center gap-5 relative group cursor-pointer" onClick={() => step > s.id && setStep(s.id)}>
                  <div className={cn(
                    "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 z-10",
                    isActive ? "border-primary-blue bg-primary-blue text-white scale-110 shadow-2xl shadow-primary-blue/30" : 
                    isCompleted ? "border-green-500 bg-green-500 text-white" : "border-surface-border bg-white  text-muted-foreground"
                  )}>
                    {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isActive ? "text-primary-blue" : "text-muted-foreground")}>{s.sub}</span>
                    <span className={cn("text-base font-black tracking-tight", isActive ? "text-foreground" : "text-muted-foreground/60")}>{s.name}</span>
                  </div>
                  {s.id !== 4 && (
                    <div className={cn("absolute left-6 top-12 w-0.5 h-8 -ml-[1px] transition-colors duration-500", isCompleted ? "bg-green-500" : "bg-surface-border")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-[32px] bg-gradient-to-br from-indigo-50 to-blue-50   border border-indigo-100 ">
           <div className="flex items-center gap-2 mb-3">
             <Sparkles className="w-5 h-5 text-indigo-600" />
             <span className="text-xs font-black text-indigo-900  uppercase tracking-widest">Neural Sync</span>
           </div>
           <p className="text-[11px] font-bold text-indigo-800/60  leading-relaxed uppercase">
             Automated category detection and content generation enabled.
           </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 md:p-12 flex flex-col relative overflow-hidden bg-white ">
        
        {/* Import Bar */}
        {step === 1 && (
           <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3 bg-gray-50  p-2 rounded-[28px] border border-surface-border focus-within:border-primary-blue transition-all">
                 <div className="w-12 h-12 rounded-[20px] bg-white  flex items-center justify-center text-primary-blue shadow-sm">
                    <Globe2 className="w-5 h-5" />
                 </div>
                 <input 
                   value={importUrl}
                   onChange={(e) => setImportUrl(e.target.value)}
                   placeholder="Import from Alibaba, 1688, Amazon, etc..."
                   className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-foreground px-2"
                 />
                 <button 
                   onClick={handleImportUrl}
                   className="px-6 py-3 bg-foreground text-background rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                 >
                    Import Node
                 </button>
              </div>
           </div>
        )}

        {/* Step 1: Vision Hub */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-3xl font-black text-foreground tracking-tighter">Vision <span className="text-primary-blue">Intelligence</span></h3>
               {formData.image && (
                  <div className="flex gap-2">
                     <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-gray-100">
                        <Scissors className="w-3 h-3" /> Remove BG
                     </button>
                     <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600 transition-all border border-gray-100">
                        <Layers className="w-3 h-3" /> Add Mockup
                     </button>
                  </div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
               <div className="space-y-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative group w-full aspect-square rounded-[40px] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden",
                      formData.image ? "border-green-500/20 bg-green-50/5" : "border-surface-border bg-gray-50/50 hover:border-primary-blue/30"
                    )}
                  >
                     {isUploading ? (
                        <div className="flex flex-col items-center gap-4">
                           <RefreshCw className="w-12 h-12 text-primary-blue animate-spin" />
                           <p className="text-xs font-black uppercase tracking-widest animate-pulse">Scanning Image Paths...</p>
                        </div>
                     ) : formData.image ? (
                        <>
                           <img src={formData.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Plus className="w-10 h-10 text-white" />
                           </div>
                        </>
                     ) : (
                        <div className="flex flex-col items-center gap-4 p-10 text-center">
                           <div className="w-20 h-20 rounded-[32px] bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                              <Upload className="w-8 h-8 text-primary-blue" />
                           </div>
                           <div>
                              <p className="text-base font-black text-foreground">Upload Media</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Vision Engine will Detect Context</p>
                           </div>
                        </div>
                     )}
                     <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </div>
               </div>

               <div className="space-y-8 py-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                       <Sparkles className="w-3 h-3 text-primary-blue" /> Suggested Name
                    </label>
                    <input 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={isAiLoading ? "AI processing..." : "Waiting for image..."}
                      className="w-full bg-transparent border-b-2 border-surface-border focus:border-primary-blue outline-none py-3 text-2xl font-black text-foreground tracking-tight transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Auto-detected Category</label>
                      <select 
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50  border border-surface-border rounded-2xl p-5 text-sm font-black outline-none focus:ring-4 focus:ring-primary-blue/10 uppercase tracking-widest"
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Brand Suggestion</label>
                      <select 
                        name="brandId"
                        value={formData.brandId}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50  border border-surface-border rounded-2xl p-5 text-sm font-black outline-none focus:ring-4 focus:ring-primary-blue/10 uppercase tracking-widest"
                      >
                        <option value="">No Brand (Generic)</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex justify-end pt-10 border-t border-surface-border mt-auto">
               <button 
                 onClick={nextStep}
                 disabled={!formData.image || isAiLoading}
                 className="group flex items-center gap-3 px-10 py-5 bg-primary-blue text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl disabled:opacity-50"
               >
                  Sync AI Copy <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
               </button>
            </div>
          </div>
        )}

        {/* Step 2: AI Copywriter */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-3xl font-black text-foreground tracking-tighter">AI <span className="text-indigo-600">Copywriter</span></h3>
               <button 
                 onClick={async () => {
                    setIsAiLoading(true);
                    const content = await generateAILongDescriptionAction({ name: formData.name, category: "Product" });
                    setFormData({...formData, description: content.longDescription, shortDescription: content.shortDescription, tagline: content.tagline});
                    setIsAiLoading(false);
                 }}
                 className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
               >
                  <RefreshCw className={cn("w-4 h-4", isAiLoading && "animate-spin")} /> Regenerate Neural Text
               </button>
            </div>

            <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Marketing Tagline</label>
                  <input 
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleInputChange}
                    placeholder="Short catchy tagline..."
                    className="w-full bg-indigo-50/30  border border-indigo-100  rounded-[20px] px-6 py-4 text-base font-black text-indigo-900  outline-none"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Short Description</label>
                  <textarea 
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full bg-gray-50  border border-surface-border rounded-[24px] p-6 text-sm font-bold text-foreground outline-none resize-none"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Long Description (AI Optimized)</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={10}
                    className="w-full bg-gray-50  border border-surface-border rounded-[32px] p-8 text-sm font-medium text-foreground outline-none leading-relaxed"
                  />
               </div>
            </div>

            <div className="flex justify-between pt-10 border-t border-surface-border mt-8">
               <button onClick={prevStep} className="flex items-center gap-2 px-8 py-5 text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-5 h-5" /> Back
               </button>
               <button onClick={nextStep} className="flex items-center gap-3 px-10 py-5 bg-primary-blue text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all">
                  Configure Commerce <ChevronRight className="w-5 h-5" />
               </button>
            </div>
          </div>
        )}

        {/* Step 3: Commerce Ops */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
            <h3 className="text-3xl font-black text-foreground mb-8 tracking-tighter">Commerce <span className="text-amber-500">Infrastructure</span></h3>
            <div className="space-y-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Price & Margin Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 rounded-[32px] bg-white  border border-surface-border shadow-lg space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Download className="w-5 h-5" /></div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Purchase Price</label>
                      <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleInputChange} className="text-xl font-black text-foreground bg-transparent border-none outline-none w-full" placeholder="0.00" />
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-[32px] bg-white  border border-surface-border shadow-lg space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-blue/10 flex items-center justify-center text-primary-blue"><DollarSign className="w-5 h-5" /></div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Retail Price</label>
                      <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="text-xl font-black text-foreground bg-transparent border-none outline-none w-full" placeholder="0.00" />
                    </div>
                  </div>

                  <div className="p-6 rounded-[32px] bg-white  border border-surface-border shadow-lg space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500"><Gift className="w-5 h-5" /></div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Discount Price</label>
                      <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} className="text-xl font-black text-foreground bg-transparent border-none outline-none w-full text-red-500" placeholder="0.00" />
                    </div>
                  </div>

                  <div className={cn(
                    "p-6 rounded-[32px] border transition-all flex flex-col justify-between group cursor-pointer",
                    formData.isFreeDelivery ? "bg-green-500/10 border-green-500 shadow-xl" : "bg-white  border-surface-border"
                  )} onClick={() => setFormData({...formData, isFreeDelivery: !formData.isFreeDelivery})}>
                    <div className="flex items-center justify-between">
                       <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", formData.isFreeDelivery ? "bg-green-500 text-white" : "bg-gray-100 text-muted-foreground")}><Truck className="w-5 h-5" /></div>
                       <div className={cn("w-10 h-5 rounded-full relative transition-all", formData.isFreeDelivery ? "bg-green-500" : "bg-gray-300")}><div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm", formData.isFreeDelivery ? "right-0.5" : "left-0.5")} /></div>
                    </div>
                    <div className="mt-2">
                       <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Shipping Policy</p>
                       <h4 className="text-xs font-black text-foreground uppercase tracking-tight">{formData.isFreeDelivery ? "Free Delivery" : "Paid Delivery"}</h4>
                    </div>
                  </div>
                </div>

                {/* Inventory & POS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 rounded-[40px] bg-white  border border-surface-border shadow-xl space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500"><Package className="w-7 h-7" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vault Inventory</label><input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="text-3xl font-black text-foreground bg-transparent border-none outline-none w-full tracking-tight" placeholder="0" /></div>
                  </div>
                  <div className="p-8 rounded-[40px] bg-white  border border-surface-border shadow-xl space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500"><Barcode className="w-7 h-7" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">POS / SKU Barcode</label><input type="text" name="barcode" value={formData.barcode} onChange={handleInputChange} className="text-2xl font-black text-foreground bg-transparent border-none outline-none w-full font-mono tracking-tighter" placeholder="AUTO-GEN" /></div>
                  </div>
                </div>

                {/* Financial Policy Integration */}
                <div className="space-y-6 bg-gray-50/50  p-10 rounded-[48px] border border-surface-border">
                   <div className="flex items-center gap-3 mb-6"><div className="w-1.5 h-6 bg-primary-blue rounded-full" /><h4 className="text-xl font-black text-foreground tracking-tighter italic uppercase">Financial Policy Integration</h4></div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[{ id: "COD", label: "Cash on Delivery", sub: "Pay at doorstep", icon: ShoppingBag }, { id: "FULL_ADVANCE", label: "Full Advance", sub: "Payment upfront", icon: ShieldCheck }, { id: "PARTIAL_ADVANCE", label: "Partial Payment", sub: "Booking amount", icon: RefreshCw }].map((policy) => (
                        <button key={policy.id} type="button" onClick={() => setFormData({ ...formData, paymentPolicy: policy.id })} className={cn("p-8 rounded-[32px] border transition-all text-left group flex flex-col gap-4", formData.paymentPolicy === policy.id ? "bg-white  border-primary-blue shadow-2xl" : "bg-white  border-surface-border")}>
                           <policy.icon className={cn("w-8 h-8 transition-colors", formData.paymentPolicy === policy.id ? "text-primary-blue" : "text-muted-foreground")} />
                           <div><p className="text-base font-black text-foreground tracking-tight">{policy.label}</p><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{policy.sub}</p></div>
                        </button>
                      ))}
                   </div>

                   {formData.paymentPolicy === "PARTIAL_ADVANCE" && (
                      <div className="mt-8 p-8 bg-blue-50/50  rounded-[40px] border border-blue-100  animate-in slide-in-from-top-4">
                         <label className="text-[10px] font-black uppercase text-blue-800  tracking-widest block mb-4">Set Advance Booking Amount (BDT)</label>
                         <div className="flex items-center gap-6">
                            <span className="text-4xl font-black text-blue-600">৳</span>
                            <input 
                              type="number"
                              name="partialAmount"
                              value={formData.partialAmount}
                              onChange={handleInputChange}
                              className="bg-transparent border-b-4 border-blue-200  focus:border-blue-500 outline-none text-4xl font-black text-blue-900  w-full"
                              placeholder="e.g. 500"
                            />
                         </div>
                         <p className="text-xs font-bold text-blue-800/50  uppercase mt-4">This amount will be verified via SMS/Gateway before the order hits the dashboard.</p>
                      </div>
                   )}
                </div>
            </div>

            <div className="flex justify-between pt-10 border-t border-surface-border mt-auto">
               <button onClick={prevStep} className="flex items-center gap-2 px-8 py-5 text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"><ChevronLeft className="w-5 h-5" /> Back</button>
               <button onClick={nextStep} className="flex items-center gap-3 px-10 py-5 bg-primary-blue text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl">Finalize Node <ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {/* Step 4: Logistics & SEO */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <h3 className="text-3xl font-black text-foreground tracking-tighter">Logistics <span className="text-indigo-600">& SEO</span></h3>
                  {formData.isFreeDelivery && (
                     <div className="px-4 py-1.5 bg-green-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
                        <Zap className="w-3 h-3" /> Free Shipping Enabled
                     </div>
                  )}
               </div>
               <button 
                 onClick={async () => {
                    setIsAiLoading(true);
                    const seo = await generateProductSEOAction({ name: formData.name, description: formData.description });
                    setFormData({...formData, seoTitle: seo.title, seoDescription: seo.description, seoKeywords: seo.keywords});
                    setIsAiLoading(false);
                 }}
                 className="flex items-center gap-2 px-6 py-3 bg-primary-blue/5 text-primary-blue rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-blue hover:text-white transition-all"
               >
                  <RefreshCw className={cn("w-4 h-4", isAiLoading && "animate-spin")} /> SEO Neural Fill
               </button>
            </div>

            <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className={cn("space-y-4 transition-opacity", formData.isFreeDelivery && "opacity-50 pointer-events-none")}>
                     <div className="flex items-center gap-2 mb-1"><Globe className="w-4 h-4 text-primary-blue" /><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Logistics Territory Reach</label></div>
                     <div className="grid grid-cols-2 gap-2">
                        {["Dhaka Only", "All Bangladesh", "Outside Dhaka", "Custom Districts"].map((zone) => (
                           <button key={zone} type="button" onClick={() => setFormData({ ...formData, allowedDistricts: zone })} className={cn("px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tighter border transition-all flex items-center justify-center text-center", formData.allowedDistricts === zone ? "bg-primary-blue text-white border-primary-blue shadow-lg" : "bg-gray-50  border-surface-border text-muted-foreground")}>{zone}</button>
                        ))}
                     </div>
                     {formData.isFreeDelivery && <p className="text-[10px] font-black text-green-600 uppercase">Automatic Zero-Rate Configured</p>}
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 mb-1"><Truck className="w-4 h-4 text-indigo-500" /><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Enabled Delivery Pipelines</label></div>
                     <div className="grid grid-cols-2 gap-2">
                        {["STEADFAST", "REDX", "PATHAO", "SUNDARBAN", "PAPERFLY"].map((courier) => {
                           const isSelected = formData.allowedCouriers.includes(courier);
                           return (
                              <button key={courier} type="button" onClick={() => { const next = isSelected ? formData.allowedCouriers.filter(c => c !== courier) : [...formData.allowedCouriers, courier]; setFormData({ ...formData, allowedCouriers: next }); }} className={cn("p-3 rounded-2xl text-[10px] font-black border transition-all flex items-center justify-between", isSelected ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 shadow-sm" : "bg-gray-50  border-surface-border text-muted-foreground")}>{courier}<div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", isSelected ? "bg-indigo-500 border-indigo-500 text-white" : "border-gray-200")}>{isSelected && <Check className="w-2.5 h-2.5" />}</div></button>
                           );
                        })}
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <div className={cn("p-6 rounded-[32px] border transition-all flex flex-col gap-4", (formData.isHomeDelivery || formData.isFreeDelivery) ? "bg-white  border-green-500/30 shadow-lg" : "bg-white  border-surface-border")}>
                     <div className="flex items-center justify-between"><div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", (formData.isHomeDelivery || formData.isFreeDelivery) ? "bg-green-500/10 text-green-600" : "bg-gray-100 text-muted-foreground")}><Truck className="w-6 h-6" /></div><button type="button" onClick={() => setFormData({...formData, isHomeDelivery: !formData.isHomeDelivery})} className={cn("w-12 h-6 rounded-full relative transition-all", (formData.isHomeDelivery || formData.isFreeDelivery) ? "bg-green-500" : "bg-gray-300")}><div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm", (formData.isHomeDelivery || formData.isFreeDelivery) ? "right-1" : "left-1")} /></button></div>
                     <div><p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Doorstep Service</p><h4 className="text-sm font-black text-foreground uppercase tracking-tight">Home Delivery</h4></div>
                  </div>
                  <div className={cn("p-6 rounded-[32px] border transition-all flex flex-col gap-4", formData.isCollectionPoint ? "bg-white  border-blue-500/30 shadow-lg" : "bg-white  border-surface-border")}>
                     <div className="flex items-center justify-between"><div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", formData.isCollectionPoint ? "bg-blue-500/10 text-blue-600" : "bg-gray-100 text-muted-foreground")}><MapPin className="w-6 h-6" /></div><button type="button" onClick={() => setFormData({...formData, isCollectionPoint: !formData.isCollectionPoint})} className={cn("w-12 h-6 rounded-full relative transition-all", formData.isCollectionPoint ? "bg-blue-500" : "bg-gray-300")}><div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm", formData.isCollectionPoint ? "right-1" : "left-1")} /></button></div>
                     <div><p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Pickup Points</p><h4 className="text-sm font-black text-foreground uppercase tracking-tight">Collect Point</h4></div>
                  </div>
                  <div className="p-6 rounded-[32px] bg-white  border border-surface-border flex flex-col gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-gray-100  flex items-center justify-center text-muted-foreground"><Layers className="w-6 h-6" /></div>
                     <div><p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1 leading-none">Shipping Type</p><select name="shippingType" value={formData.shippingType} onChange={handleInputChange} className="w-full bg-transparent text-sm font-black text-foreground focus:outline-none uppercase tracking-tight"><option value="GENERAL">General eCommerce</option><option value="WEIGHT_BASED">Weight Based (KG)</option><option value="LIQUID_BASED">Liquid Based (Ltr)</option></select></div>
                  </div>
               </div>

               <div className="p-10 bg-gray-50  rounded-[48px] border border-surface-border space-y-6">
                  <div className="flex items-center gap-3"><div className="w-1.5 h-6 bg-indigo-600 rounded-full" /><h4 className="text-xl font-black text-foreground tracking-tighter italic uppercase">Neural SEO Metadata</h4></div>
                  <div className="space-y-4">
                     <div className="space-y-1"><label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">SEO Optimized Title</label><input name="seoTitle" value={formData.seoTitle} onChange={handleInputChange} className="w-full bg-white  border border-surface-border rounded-2xl px-6 py-3 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-indigo-600/20" /></div>
                     <div className="space-y-1"><label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Meta Neural Description</label><textarea name="seoDescription" value={formData.seoDescription} onChange={handleInputChange} rows={3} className="w-full bg-white  border border-surface-border rounded-2xl px-6 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-indigo-600/20 resize-none" /></div>
                  </div>
               </div>
            </div>

            <div className="flex justify-between pt-10 border-t border-surface-border mt-8">
               <button onClick={prevStep} className="flex items-center gap-2 px-8 py-5 text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"><ChevronLeft className="w-5 h-5" /> Back</button>
               <button onClick={handleSubmit} disabled={isPending} className="flex items-center gap-3 px-12 py-5 bg-primary-blue text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl">{isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Deploy to Catalog</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
