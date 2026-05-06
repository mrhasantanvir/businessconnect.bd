"use client";

import React, { useState, useTransition, useRef } from "react";
import { 
  Plus, Upload, Sparkles, Check, ChevronRight, ChevronLeft, 
  Tag, Scale, Truck, Globe, ShoppingBag, DollarSign, 
  Layers, Package, MapPin, Search, Barcode, Trash2, Image as ImageIcon, ShieldCheck,
  RefreshCw, Wand2, Scissors, Zap, Download, Globe2, Save, Gift, Loader2,
  MoreVertical, ExternalLink, AlertCircle, Link as LinkIcon, FileText, Database,
  Eye, Facebook, Share2, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createProductAction, uploadProductImageAction } from "@/app/products/actions";
import { analyzeProductImageAction, generateAILongDescriptionAction, importProductFromChinaUrlAction } from "@/app/products/aiActions";

interface ProductWizardProps {
  categories: any[];
  brands: any[];
}

type TabType = "general" | "pricing" | "logistics" | "seo";
type SourceType = "manual" | "url" | "csv";

export default function ProductWizard({ categories, brands }: ProductWizardProps) {
  const [tab, setTab] = useState<TabType>("general");
  const [source, setSource] = useState<SourceType>("manual");
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
    } catch (err) { alert("Failed to extract data. The site might be protected."); } finally {
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
    <div className="w-full max-w-[1200px] mx-auto font-inter">
      
      {/* 1. SOURCE SELECTOR (Header) */}
      <div className="bg-white border border-slate-200 rounded-[2px] p-2 mb-6 flex items-center justify-between shadow-sm">
         <div className="flex items-center">
            <SourceBtn active={source === "manual"} icon={FileText} label="Manual Entry" onClick={() => setSource("manual")} />
            <SourceBtn active={source === "url"} icon={Globe} label="URL Import" onClick={() => setSource("url")} />
            <SourceBtn active={source === "csv"} icon={Database} label="Bulk CSV" onClick={() => setSource("csv")} />
         </div>
         <div className="flex items-center gap-4 px-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Node: <span className="text-indigo-600">BusinessConnect Cloud</span></span>
         </div>
      </div>

      {/* URL Import Bar (Conditional) */}
      {source === "url" && (
         <div className="bg-slate-900 rounded-[2px] p-4 mb-6 flex items-center gap-3 animate-in slide-in-from-top-2">
            <input 
               value={importUrl}
               onChange={(e) => setImportUrl(e.target.value)}
               placeholder="AliExpress, Amazon or Global URL..."
               className="flex-1 bg-white/10 border border-white/10 h-10 px-4 text-xs font-medium text-white outline-none focus:border-indigo-500 rounded-[2px]"
            />
            <button onClick={handleImportUrl} disabled={isAiLoading} className="h-10 px-6 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 rounded-[2px] disabled:opacity-50">
               {isAiLoading ? "Processing..." : "Sync Engine"}
            </button>
         </div>
      )}

      {/* 2. MAIN EDITOR FRAME */}
      <div className="bg-white border border-slate-200 rounded-[2px] shadow-sm flex flex-col md:flex-row min-h-[700px]">
         
         {/* TABS NAVIGATION */}
         <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 p-6 space-y-2 bg-slate-50/30">
            <TabBtn active={tab === "general"} icon={ShoppingBag} label="General Info" onClick={() => setTab("general")} />
            <TabBtn active={tab === "pricing"} icon={DollarSign} label="Pricing & Stock" onClick={() => setTab("pricing")} />
            <TabBtn active={tab === "logistics"} icon={Truck} label="Logistics Sync" onClick={() => setTab("logistics")} />
            <TabBtn active={tab === "seo"} icon={Search} label="AI & SEO Schema" onClick={() => setTab("seo")} />
            
            <div className="pt-20">
               <div className="p-4 bg-white border border-slate-100 rounded-[2px] shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                     <Sparkles className="w-4 h-4 text-indigo-600" />
                     <span className="text-[10px] font-black text-slate-900 uppercase">AI Studio</span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase">Neural engines are processing metadata in real-time.</p>
               </div>
            </div>
         </div>

         {/* CONTENT AREA */}
         <div className="flex-1 p-8">
            
            {/* GENERAL TAB */}
            {tab === "general" && (
               <div className="space-y-8 animate-in fade-in duration-300">
                  <SectionTitle title="General Information" sub="Base product identity and categorization." />
                  
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Title (SEO Optimized)</label>
                     <input name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-slate-200 h-12 px-4 text-sm font-black text-slate-900 outline-none focus:border-indigo-600 rounded-[2px]" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Node</label>
                        <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full border border-slate-200 h-12 px-4 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 rounded-[2px] bg-white">
                           <option value="">Uncategorized</option>
                           {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Authority</label>
                        <select name="brandId" value={formData.brandId} onChange={handleInputChange} className="w-full border border-slate-200 h-12 px-4 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 rounded-[2px] bg-white">
                           <option value="">No Brand (Generic)</option>
                           {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Narrative (HTML Support)</label>
                        <button onClick={async () => {
                           setIsAiLoading(true);
                           const content = await generateAILongDescriptionAction({ name: formData.name, category: "Product" });
                           setFormData({...formData, description: content.longDescription, shortDescription: content.shortDescription, tagline: content.tagline});
                           setIsAiLoading(false);
                        }} className="text-[9px] font-black text-indigo-600 uppercase hover:underline">Neural Rewrite</button>
                     </div>
                     <textarea name="description" value={formData.description} onChange={handleInputChange} rows={10} className="w-full border border-slate-200 p-6 text-sm font-medium text-slate-700 outline-none focus:border-indigo-600 rounded-[2px] leading-relaxed resize-none bg-slate-50/30" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Visual Asset</label>
                        <div onClick={() => fileInputRef.current?.click()} className="aspect-video border-2 border-dashed border-slate-200 rounded-[2px] flex items-center justify-center cursor-pointer hover:border-indigo-600/30 transition-all bg-slate-50 relative overflow-hidden">
                           {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-indigo-600" /> : 
                           formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : 
                           <Upload className="w-8 h-8 text-slate-300" />}
                           <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                        </div>
                     </div>
                     <div className="bg-slate-50 p-6 rounded-[2px] border border-slate-100 flex flex-col justify-center gap-4">
                        <h4 className="text-[10px] font-black uppercase text-slate-400">AI Processing Studio</h4>
                        <button className="h-10 bg-white border border-slate-200 text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all rounded-[2px]">Background Remove</button>
                        <button className="h-10 bg-white border border-slate-200 text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all rounded-[2px]">AI Upscale (HD)</button>
                     </div>
                  </div>
               </div>
            )}

            {/* PRICING & STOCK TAB */}
            {tab === "pricing" && (
               <div className="space-y-8 animate-in fade-in duration-300">
                  <SectionTitle title="Pricing & Inventory" sub="Configure your revenue strategy and stock levels." />
                  
                  <div className="grid grid-cols-3 gap-6">
                     <PriceInput label="Base Retail Price" name="price" value={formData.price} onChange={handleInputChange} />
                     <PriceInput label="Discount Price" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} color="rose" />
                     <PriceInput label="Purchase Cost" name="purchasePrice" value={formData.purchasePrice} onChange={handleInputChange} color="slate" />
                  </div>

                  <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-[2px] space-y-6">
                     <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Wholesale / Tiered Pricing</h4>
                     <div className="grid grid-cols-2 gap-6">
                        <PriceInput label="Wholesale Price" name="wholesalePrice" value={formData.wholesalePrice} onChange={handleInputChange} />
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Min. Wholesale Qty</label>
                           <input name="minWholesaleQty" value={formData.minWholesaleQty} onChange={handleInputChange} className="w-full h-12 px-4 border border-slate-200 bg-white text-sm font-black outline-none focus:border-indigo-600 rounded-[2px]" placeholder="0" />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Inventory (Stock)</label>
                        <div className="relative">
                           <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                           <input name="stock" value={formData.stock} onChange={handleInputChange} className="w-full h-12 pl-12 pr-4 border border-slate-200 text-sm font-black outline-none focus:border-indigo-600 rounded-[2px]" placeholder="0" />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal SKU / Barcode</label>
                        <div className="relative">
                           <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                           <input name="barcode" value={formData.barcode} onChange={handleInputChange} className="w-full h-12 pl-12 pr-4 border border-slate-200 text-sm font-black outline-none focus:border-indigo-600 rounded-[2px] font-mono" placeholder="AUTO-NODE-GEN" />
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* LOGISTICS TAB */}
            {tab === "logistics" && (
               <div className="space-y-8 animate-in fade-in duration-300">
                  <SectionTitle title="Logistics Standard" sub="Critical physical data for shipping & handling." />
                  
                  <div className="grid grid-cols-4 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weight (KG)</label>
                        <input name="unitWeight" value={formData.unitWeight} onChange={handleInputChange} className="w-full h-12 px-4 border border-slate-200 text-sm font-black outline-none focus:border-indigo-600 rounded-[2px]" placeholder="0.5" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Length (CM)</label>
                        <input name="length" value={formData.length} onChange={handleInputChange} className="w-full h-12 px-4 border border-slate-200 text-sm font-black outline-none focus:border-indigo-600 rounded-[2px]" placeholder="10" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Width (CM)</label>
                        <input name="width" value={formData.width} onChange={handleInputChange} className="w-full h-12 px-4 border border-slate-200 text-sm font-black outline-none focus:border-indigo-600 rounded-[2px]" placeholder="10" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Height (CM)</label>
                        <input name="height" value={formData.height} onChange={handleInputChange} className="w-full h-12 px-4 border border-slate-200 text-sm font-black outline-none focus:border-indigo-600 rounded-[2px]" placeholder="10" />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Handling Classification</label>
                     <div className="grid grid-cols-4 gap-3">
                        {["GENERAL", "FRAGILE", "LIQUID", "FLAMMABLE"].map(c => (
                           <button key={c} onClick={() => setFormData({...formData, handlingClass: c})} className={cn("h-12 border rounded-[2px] text-[10px] font-black uppercase tracking-widest transition-all", formData.handlingClass === c ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white border-slate-200 text-slate-400")}>{c}</button>
                        ))}
                     </div>
                  </div>

                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2px] flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center rounded-[2px]"><ShieldCheck className="w-5 h-5 text-indigo-600" /></div>
                        <div>
                           <h4 className="text-[10px] font-black uppercase text-slate-900">Settlement Policy</h4>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">COD & Verified Advance enabled.</p>
                        </div>
                     </div>
                     <select name="paymentPolicy" value={formData.paymentPolicy} onChange={handleInputChange} className="h-10 px-4 bg-white border border-slate-200 text-[10px] font-black uppercase outline-none rounded-[2px]">
                        <option value="COD">Cash on Delivery</option>
                        <option value="FULL_ADVANCE">Full Advance</option>
                        <option value="PARTIAL_ADVANCE">Partial Payment</option>
                     </select>
                  </div>
               </div>
            )}

            {/* AI & SEO TAB */}
            {tab === "seo" && (
               <div className="space-y-8 animate-in fade-in duration-300">
                  <SectionTitle title="Marketing Optimization" sub="Configure Social OG Tags and JSON-LD Schema." />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEO Meta Title</label>
                           <input name="seoTitle" value={formData.seoTitle} onChange={handleInputChange} className="w-full border border-slate-200 h-12 px-4 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 rounded-[2px]" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEO Meta Description</label>
                           <textarea name="seoDescription" value={formData.seoDescription} onChange={handleInputChange} rows={4} className="w-full border border-slate-200 p-4 text-xs font-medium text-slate-700 outline-none focus:border-indigo-600 rounded-[2px] resize-none" />
                        </div>
                     </div>
                     
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-600" /> Social Sharing Preview</h4>
                        <div className="border border-slate-200 rounded-[2px] overflow-hidden bg-slate-50">
                           <div className="aspect-video bg-slate-200 flex items-center justify-center">
                              {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 text-white" />}
                           </div>
                           <div className="p-4 bg-white border-t border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{new URL(window.location.href).hostname}</p>
                              <h4 className="text-sm font-black text-slate-900 mt-1 truncate">{formData.name || "Product Title Preview"}</h4>
                              <p className="text-[10px] font-medium text-slate-500 mt-1 line-clamp-1">{formData.seoDescription || "Social summary will appear here..."}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-[2px] text-white flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Share2 className="w-5 h-5 text-indigo-400" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">JSON-LD Schema Automation</h4>
                     </div>
                     <div className="px-3 py-1 bg-white/10 rounded-[2px] text-[9px] font-black uppercase text-green-400 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Schema Nominal
                     </div>
                  </div>
               </div>
            )}

         </div>
      </div>

      {/* 3. STICKY FOOTER ACTIONS */}
      <div className="sticky bottom-4 z-40 bg-white border border-slate-200 rounded-[2px] p-4 mt-8 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-4">
         <div className="flex items-center gap-6 px-4">
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Status</span>
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Draft Node</span>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Inventory</span>
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{formData.stock || 0} Units</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button 
              onClick={handleSubmit}
              disabled={isPending}
              className="px-12 h-14 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all rounded-[2px] shadow-xl flex items-center gap-3"
            >
               {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
               Publish to Global Store
            </button>
         </div>
      </div>

    </div>
  );
}

function SourceBtn({ active, icon: Icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("px-6 h-12 flex items-center gap-3 transition-all", active ? "bg-slate-900 text-white rounded-[2px]" : "text-slate-400 hover:text-slate-900")}>
       <Icon className="w-4 h-4" />
       <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function TabBtn({ active, icon: Icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("w-full h-14 px-6 flex items-center gap-4 border-2 transition-all group", active ? "bg-white border-slate-900 text-slate-900" : "bg-transparent border-transparent text-slate-400 hover:text-slate-600")}>
       <Icon className={cn("w-5 h-5 transition-colors", active ? "text-indigo-600" : "text-slate-300 group-hover:text-slate-400")} />
       <span className="text-[11px] font-black uppercase tracking-tighter">{label}</span>
       {active && <div className="ml-auto w-1 h-1 bg-indigo-600 rounded-full" />}
    </button>
  );
}

function SectionTitle({ title, sub }: { title: string, sub: string }) {
   return (
      <div className="mb-8">
         <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1 leading-none">{title}</h2>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
      </div>
   )
}

function PriceInput({ label, name, value, onChange, color = "indigo" }: any) {
   const colors: any = {
      indigo: "text-indigo-600 focus:border-indigo-600",
      rose: "text-rose-600 focus:border-rose-600",
      slate: "text-slate-900 focus:border-slate-900"
   };
   return (
      <div className="space-y-1.5">
         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
         <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
            <input name={name} value={value} onChange={onChange} className={cn("w-full h-12 pl-8 pr-4 border border-slate-200 bg-white text-sm font-black outline-none rounded-[2px] transition-all", colors[color])} placeholder="0.00" />
         </div>
      </div>
   )
}
