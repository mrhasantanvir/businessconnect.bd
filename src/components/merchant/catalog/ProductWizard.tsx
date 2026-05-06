"use client";

import React, { useState, useTransition, useRef } from "react";
import { 
  Plus, Upload, Sparkles, Check, ChevronRight, ChevronLeft, 
  Tag, Scale, Truck, Globe, ShoppingBag, DollarSign, 
  Layers, Package, MapPin, Search, Barcode, Trash2, Image as ImageIcon, ShieldCheck,
  RefreshCw, Wand2, Scissors, Zap, Download, Globe2, Save, Gift, Loader2,
  MoreVertical, ExternalLink, AlertCircle, Link as LinkIcon, FileText, Database,
  Eye, Facebook, Share2, Info, Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createProductAction, uploadProductImageAction } from "@/app/products/actions";
import { analyzeProductImageAction, generateAILongDescriptionAction, importProductFromChinaUrlAction } from "@/app/products/aiActions";

interface ProductWizardProps {
  categories: any[];
  brands: any[];
}

type TabType = "general" | "pricing" | "logistics" | "seo";
type SourceType = "manual" | "url" | "ai_context";

export default function ProductWizard({ categories, brands }: ProductWizardProps) {
  const [tab, setTab] = useState<TabType>("general");
  const [source, setSource] = useState<SourceType>("manual");
  const [isPending, startTransition] = useTransition();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [aiContext, setAiContext] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    purchasePrice: "",
    discountPrice: "",
    wholesalePrice: "",
    minWholesaleQty: "0",
    isFreeDelivery: false,
    stock: "",
    sku: "",
    barcode: "",
    categoryId: "",
    brandId: "",
    unitType: "piece",
    unitWeight: "",
    width: "",
    height: "",
    length: "",
    handlingClass: "GENERAL",
    allowedDistricts: "All Bangladesh",
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
    } catch (err) { console.error(err); } finally {
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
       setTab("general");
    } catch (err) { 
       setSource("ai_context");
       alert("Automated Sync Blocked. Please use 'AI Context Paste' below to extract data manually."); 
    } finally {
       setIsAiLoading(false);
    }
  };

  const handleAiContextExtraction = async () => {
    if (!aiContext) return;
    setIsAiLoading(true);
    try {
       const res = await fetch("/api/merchant/ai-studio/vision", { // Re-using vision or creating a dedicated parser
          method: "POST",
          body: JSON.stringify({ context: aiContext, type: "html_extraction" })
       });
       const result = await res.json();
       setFormData(prev => ({
         ...prev,
         name: result.name,
         description: result.description,
         price: result.price?.toString() || "",
         image: result.images?.[0] || prev.image,
       }));
       setTab("general");
    } catch (err) { alert("AI could not parse the provided context."); } finally {
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
          wholesalePrice: parseFloat(formData.wholesalePrice) || 0,
          minWholesaleQty: parseInt(formData.minWholesaleQty) || 0,
          stock: parseInt(formData.stock) || 0,
          unitWeight: formData.unitWeight ? parseFloat(formData.unitWeight) : 0,
          width: parseFloat(formData.width) || 0,
          height: parseFloat(formData.height) || 0,
          length: parseFloat(formData.length) || 0,
          allowedCouriers: formData.allowedCouriers.join(","),
          partialAmount: parseFloat(formData.partialAmount) || 0,
          categoryId: formData.categoryId || undefined,
          brandId: formData.brandId || undefined,
        });
        window.location.href = "/merchant/catalog";
      } catch (err) { console.error(err); }
    });
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto pb-20">
      
      {/* 1. SOURCE SELECTOR */}
      <div className="bg-white border border-slate-100 rounded-3xl p-1.5 mb-8 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
         <div className="flex items-center gap-1">
            <SourceBtn active={source === "manual"} icon={FileText} label="Manual" onClick={() => setSource("manual")} />
            <SourceBtn active={source === "url"} icon={Globe} label="Auto Sync" onClick={() => setSource("url")} />
            <SourceBtn active={source === "ai_context"} icon={Terminal} label="AI Context Paste" onClick={() => setSource("ai_context")} />
         </div>
         <div className="hidden md:flex items-center gap-4 px-6 border-l border-slate-50">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Engine v2.0</span>
            </div>
         </div>
      </div>

      {/* URL Import Module */}
      {source === "url" && (
         <div className="bg-slate-900 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center gap-4 shadow-2xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex-1 w-full relative">
               <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
               <input 
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="Paste product link (Aliexpress, Amazon, etc)..."
                  className="w-full pl-12 pr-4 h-14 bg-white/5 border border-white/10 text-sm font-medium text-white outline-none focus:border-indigo-500 rounded-2xl transition-all"
               />
            </div>
            <button onClick={handleImportUrl} disabled={isAiLoading} className="w-full md:w-auto h-14 px-10 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 rounded-2xl disabled:opacity-50 transition-all shadow-xl">
               {isAiLoading ? "Syncing..." : "Sync Engine"}
            </button>
         </div>
      )}

      {/* AI CONTEXT PASTE (The Bulletproof Solution) */}
      {source === "ai_context" && (
         <div className="bg-slate-900 rounded-[40px] p-10 mb-8 space-y-6 shadow-2xl animate-in slide-in-from-top-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><Terminal className="w-5 h-5" /></div>
                  <div>
                     <h3 className="text-white text-sm font-black uppercase tracking-tight">AI Neural Context Extraction</h3>
                     <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Paste HTML Source or Text if automated sync fails.</p>
                  </div>
               </div>
               <button onClick={handleAiContextExtraction} disabled={isAiLoading || !aiContext} className="px-10 h-12 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-30">
                  {isAiLoading ? "Extracting..." : "AI Extract All"}
               </button>
            </div>
            <textarea 
               value={aiContext}
               onChange={(e) => setAiContext(e.target.value)}
               placeholder="Press Ctrl+U on product page, copy some text or HTML, and paste here..."
               className="w-full h-48 bg-white/5 border border-white/10 p-6 text-xs font-mono text-indigo-300 outline-none focus:border-indigo-500 rounded-2xl resize-none"
            />
         </div>
      )}

      {/* 2. PREMIUM EDITOR FRAME */}
      <div className="bg-white border border-slate-100 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col md:flex-row min-h-[750px] overflow-hidden">
         
         {/* SIDEBAR NAVIGATION */}
         <div className="w-full md:w-72 bg-slate-50/50 p-8 space-y-2 border-b md:border-b-0 md:border-r border-slate-50">
            <TabBtn active={tab === "general"} icon={ShoppingBag} label="General Hub" onClick={() => setTab("general")} />
            <TabBtn active={tab === "pricing"} icon={DollarSign} label="Price & Stock" onClick={() => setTab("pricing")} />
            <TabBtn active={tab === "logistics"} icon={Truck} label="Logistics Engine" onClick={() => setTab("logistics")} />
            <TabBtn active={tab === "seo"} icon={Search} label="AI & SEO Schema" onClick={() => setTab("seo")} />
            
            <div className="pt-12">
               <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl text-white shadow-xl shadow-indigo-100">
                  <div className="flex items-center gap-2 mb-3">
                     <Sparkles className="w-4 h-4 text-white/80" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Neural Assistant</span>
                  </div>
                  <p className="text-[10px] font-medium leading-relaxed opacity-80 uppercase">AI is analyzing your input for optimized SEO schema and market positioning.</p>
               </div>
            </div>
         </div>

         {/* MAIN STUDIO CONTENT */}
         <div className="flex-1 p-8 md:p-12 bg-white">
            
            {/* GENERAL TAB */}
            {tab === "general" && (
               <div className="space-y-10 animate-in fade-in duration-700">
                  <SectionTitle title="General Information" sub="Base identity and visual assets." />
                  
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-3 h-3" /> Product Display Title
                     </label>
                     <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Product Title..." className="w-full bg-slate-50 border-none h-16 px-6 text-xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-600/5 rounded-2xl transition-all" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Category</label>
                        <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full bg-slate-50 border-none h-14 px-6 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-600/5 rounded-2xl appearance-none">
                           <option value="">UNCATEGORIZED</option>
                           {categories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                        </select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Authority</label>
                        <select name="brandId" value={formData.brandId} onChange={handleInputChange} className="w-full bg-slate-50 border-none h-14 px-6 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-600/5 rounded-2xl appearance-none">
                           <option value="">GENERIC (NO BRAND)</option>
                           {brands.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Narrative Engine</label>
                        <button onClick={async () => {
                           setIsAiLoading(true);
                           const content = await generateAILongDescriptionAction({ name: formData.name, category: "Product" });
                           setFormData({...formData, description: content.longDescription, shortDescription: content.shortDescription, tagline: content.tagline});
                           setIsAiLoading(false);
                        }} className="px-4 py-2 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-full flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all">
                           <Sparkles className="w-3 h-3" /> AI Content Generate
                        </button>
                     </div>
                     <textarea name="description" value={formData.description} onChange={handleInputChange} rows={8} className="w-full bg-slate-50 border-none p-8 text-sm font-medium text-slate-600 outline-none focus:ring-4 focus:ring-indigo-600/5 rounded-[32px] leading-relaxed resize-none shadow-inner" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Media Gallery</label>
                        <div onClick={() => fileInputRef.current?.click()} className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex items-center justify-center cursor-pointer group hover:border-indigo-400 hover:bg-slate-100/50 transition-all overflow-hidden relative">
                           {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-indigo-600" /> : 
                           formData.image ? <img src={formData.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" /> : 
                           <div className="flex flex-col items-center gap-3">
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                 <Plus className="w-6 h-6 text-indigo-600" />
                              </div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Main Image</span>
                           </div>}
                           <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                        </div>
                     </div>
                     <div className="flex flex-col justify-center gap-4 bg-slate-50/50 p-8 rounded-[32px] border border-slate-50">
                        <h4 className="text-[10px] font-black uppercase text-slate-400">Media Enhancer</h4>
                        <button className="h-12 bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2">
                           <Scissors className="w-4 h-4" /> Remove Background
                        </button>
                        <button className="h-12 bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2">
                           <Zap className="w-4 h-4" /> HD Upscale (4K)
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {/* PRICING & STOCK TAB */}
            {tab === "pricing" && (
               <div className="space-y-12 animate-in fade-in duration-700">
                  <SectionTitle title="Financial Strategy" sub="Pricing tiers and inventory management." />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <PriceBox label="Selling Price" name="price" value={formData.price} onChange={handleInputChange} icon={DollarSign} color="indigo" />
                     <PriceBox label="Offer Price" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} icon={Gift} color="rose" />
                     <PriceBox label="Purchase Cost" name="purchasePrice" value={formData.purchasePrice} onChange={handleInputChange} icon={Download} color="slate" />
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-indigo-50/20 p-10 rounded-[40px] border border-slate-100 space-y-8 shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Wholesale Protocol</h4>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <PriceBox label="Wholesale Rate" name="wholesalePrice" value={formData.wholesalePrice} onChange={handleInputChange} icon={ShoppingBag} />
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Minimum Bulk Quantity</label>
                           <input name="minWholesaleQty" value={formData.minWholesaleQty} onChange={handleInputChange} className="w-full h-14 px-6 bg-white border border-slate-100 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-600/5 rounded-2xl" placeholder="0" />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-50 space-y-4">
                        <div className="flex items-center justify-between">
                           <label className="text-[10px] font-black text-slate-400 uppercase">Available Inventory</label>
                           <Package className="w-5 h-5 text-indigo-400" />
                        </div>
                        <input name="stock" value={formData.stock} onChange={handleInputChange} className="w-full bg-transparent border-none text-4xl font-black text-slate-900 outline-none" placeholder="0" />
                     </div>
                     <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-50 space-y-4">
                        <div className="flex items-center justify-between">
                           <label className="text-[10px] font-black text-slate-400 uppercase">POS Barcode / SKU</label>
                           <Barcode className="w-5 h-5 text-indigo-400" />
                        </div>
                        <input name="barcode" value={formData.barcode} onChange={handleInputChange} className="w-full bg-transparent border-none text-2xl font-black text-slate-900 outline-none font-mono" placeholder="AUTO-NODE-GEN" />
                     </div>
                  </div>
               </div>
            )}

            {/* LOGISTICS TAB */}
            {tab === "logistics" && (
               <div className="space-y-12 animate-in fade-in duration-700">
                  <SectionTitle title="Logistics & Compliance" sub="Physical specs for automated shipping." />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     <LogiInput label="Weight (KG)" name="unitWeight" value={formData.unitWeight} onChange={handleInputChange} />
                     <LogiInput label="Length (CM)" name="length" value={formData.length} onChange={handleInputChange} />
                     <LogiInput label="Width (CM)" name="width" value={formData.width} onChange={handleInputChange} />
                     <LogiInput label="Height (CM)" name="height" value={formData.height} onChange={handleInputChange} />
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Handling Classification</label>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {["GENERAL", "FRAGILE", "LIQUID", "ELECTRONIC"].map(c => (
                           <button key={c} onClick={() => setFormData({...formData, handlingClass: c})} className={cn("h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2", formData.handlingClass === c ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-white border-slate-50 text-slate-400 hover:border-slate-200")}>{c}</button>
                        ))}
                     </div>
                  </div>

                  <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg"><ShieldCheck className="w-6 h-6 text-indigo-600" /></div>
                        <div>
                           <h4 className="text-sm font-black text-slate-900 uppercase leading-none mb-1">Settlement Protocol</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase">COD & Digital Advance Sync Active.</p>
                        </div>
                     </div>
                     <select name="paymentPolicy" value={formData.paymentPolicy} onChange={handleInputChange} className="w-full md:w-auto h-12 px-8 bg-white text-[11px] font-black uppercase border-none outline-none rounded-xl shadow-sm cursor-pointer">
                        <option value="COD">CASH ON DELIVERY</option>
                        <option value="FULL_ADVANCE">FULL PRE-PAYMENT</option>
                        <option value="PARTIAL_ADVANCE">PARTIAL BOOKING</option>
                     </select>
                  </div>
               </div>
            )}

            {/* AI & SEO TAB */}
            {tab === "seo" && (
               <div className="space-y-12 animate-in fade-in duration-700">
                  <SectionTitle title="Marketing Optimization" sub="Search visibility and social schema." />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     <div className="space-y-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEO Optimized Title</label>
                           <input name="seoTitle" value={formData.seoTitle} onChange={handleInputChange} className="w-full bg-slate-50 border-none h-14 px-6 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-600/5 rounded-2xl" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Meta Description</label>
                           <textarea name="seoDescription" value={formData.seoDescription} onChange={handleInputChange} rows={5} className="w-full bg-slate-50 border-none p-6 text-sm font-medium text-slate-600 outline-none focus:ring-4 focus:ring-indigo-600/5 rounded-[32px] resize-none" />
                        </div>
                     </div>
                     
                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-600" /> Visual Social Preview</h4>
                        <div className="bg-slate-50 rounded-[40px] border border-slate-100 overflow-hidden shadow-sm group">
                           <div className="aspect-video bg-slate-200 overflow-hidden">
                              {formData.image ? <img src={formData.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-white" /></div>}
                           </div>
                           <div className="p-8 bg-white border-t border-slate-50">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{typeof window !== 'undefined' ? window.location.hostname : 'BUSINESSCONNECT.BD'}</p>
                              <h4 className="text-lg font-black text-slate-900 leading-tight mb-2">{formData.name || "Product Display Title Preview"}</h4>
                              <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">{formData.seoDescription || "Automated social summary will generate here for platforms like Facebook and WhatsApp."}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-900 p-8 rounded-[40px] text-white flex items-center justify-between shadow-2xl relative overflow-hidden">
                     <Share2 className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5" />
                     <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-indigo-400" /></div>
                        <div>
                           <h4 className="text-sm font-black uppercase tracking-tight leading-none mb-1">JSON-LD Schema Guard</h4>
                           <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Automated Search Engine Compliance.</p>
                        </div>
                     </div>
                     <div className="px-6 py-2 bg-green-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest relative z-10 animate-pulse">
                        Engine Nominal
                     </div>
                  </div>
               </div>
            )}

         </div>
      </div>

      {/* STICKY LAUNCH BAR */}
      <div className="sticky bottom-6 z-50 mt-10 px-4">
         <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-2xl border border-white rounded-[32px] p-4 flex items-center justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]">
            <div className="hidden md:flex items-center gap-8 px-6">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Stock Readiness</span>
                  <span className={cn("text-xs font-black uppercase tracking-widest", formData.stock ? "text-green-600" : "text-rose-500")}>{formData.stock || 0} UNITS</span>
               </div>
               <div className="w-px h-10 bg-slate-100" />
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Sales Tier</span>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{formData.price ? `৳${formData.price}` : "PENDING"}</span>
               </div>
            </div>
            <button 
               onClick={handleSubmit}
               disabled={isPending}
               className="flex-1 md:flex-none px-16 h-16 bg-slate-900 text-white text-[12px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all rounded-[24px] shadow-2xl flex items-center justify-center gap-4 group"
            >
               {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
               Publish to Store
            </button>
         </div>
      </div>

    </div>
  );
}

function SourceBtn({ active, icon: Icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("px-8 h-14 flex items-center gap-3 transition-all rounded-2xl", active ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50")}>
       <Icon className="w-4 h-4" />
       <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function TabBtn({ active, icon: Icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("w-full h-16 px-6 flex items-center gap-4 transition-all group rounded-2xl", active ? "bg-white text-indigo-600 shadow-lg shadow-slate-100" : "bg-transparent text-slate-400 hover:text-slate-600")}>
       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", active ? "bg-indigo-50 text-indigo-600" : "bg-white border border-slate-50 text-slate-300 group-hover:text-slate-400")}>
          <Icon className="w-5 h-5" />
       </div>
       <span className={cn("text-[11px] font-black uppercase tracking-tight", active ? "text-slate-900" : "text-slate-400")}>{label}</span>
       {active && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/50" />}
    </button>
  );
}

function SectionTitle({ title, sub }: { title: string, sub: string }) {
   return (
      <div>
         <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1 leading-none">{title}</h2>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
      </div>
   )
}

function PriceBox({ label, icon: Icon, name, value, onChange, color = "indigo" }: any) {
   const colors: any = {
      indigo: "text-indigo-600 ring-indigo-600/5",
      rose: "text-rose-600 ring-rose-600/5",
      slate: "text-slate-900 ring-slate-900/5"
   };
   return (
      <div className="bg-white p-8 rounded-[32px] shadow-lg shadow-slate-100/50 space-y-4 border border-slate-50 group hover:ring-2 hover:ring-indigo-600/10 transition-all">
         <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", color === "indigo" ? "bg-indigo-50 text-indigo-600" : color === "rose" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600")}>
            <Icon className="w-6 h-6" />
         </div>
         <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
            <div className="flex items-center gap-1">
               <span className="text-2xl font-black text-slate-300">৳</span>
               <input name={name} value={value} onChange={onChange} className={cn("w-full bg-transparent border-none text-2xl font-black outline-none", colors[color])} placeholder="0.00" />
            </div>
         </div>
      </div>
   )
}

function LogiInput({ label, name, value, onChange }: any) {
   return (
      <div className="space-y-2">
         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
         <input name={name} value={value} onChange={onChange} className="w-full h-14 px-6 bg-slate-50 border-none text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-600/5 rounded-2xl transition-all" placeholder="0" />
      </div>
   )
}
