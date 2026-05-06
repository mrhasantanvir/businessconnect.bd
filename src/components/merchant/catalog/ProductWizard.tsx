"use client";

import React, { useState, useTransition, useRef } from "react";
import { 
  Plus, Upload, Sparkles, Check, ChevronRight, ChevronLeft, 
  Tag, Scale, Truck, Globe, ShoppingBag, DollarSign, 
  Layers, Package, MapPin, Search, Barcode, Trash2, Image as ImageIcon, ShieldCheck,
  RefreshCw, Wand2, Scissors, Zap, Download, Globe2, Save, Gift, Loader2,
  MoreVertical, ExternalLink, AlertCircle, Link as LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createProductAction, uploadProductImageAction } from "@/app/products/actions";
import { analyzeProductImageAction, generateAILongDescriptionAction, importProductFromChinaUrlAction } from "@/app/products/aiActions";

interface ProductWizardProps {
  categories: any[];
  brands: any[];
}

export default function ProductWizard({ categories, brands }: ProductWizardProps) {
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
       alert("Failed to extract data. The site might be protected.");
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

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-20">
      {/* Sticky Header Actions */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between mb-8 rounded-2xl shadow-sm mt-4">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
               <Package className="w-5 h-5" />
            </div>
            <div>
               <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">Create New Product</h1>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Editor</p>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.href = "/merchant/catalog"}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
            >
               Discard
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isPending}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-xl"
            >
               {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               Deploy Product
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Main Content: Left Column */}
         <div className="lg:col-span-8 space-y-8">
            
            {/* Global Import Module */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <Globe className="w-4 h-4 text-indigo-600" /> Global Smart Import
                  </h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded">AliExpress, Amazon, 1688</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="flex-1 relative group">
                     <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                     <input 
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        placeholder="Paste product URL for AI extraction..."
                        className="w-full pl-11 pr-4 h-12 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600/30 transition-all"
                     />
                  </div>
                  <button 
                    onClick={handleImportUrl}
                    disabled={isAiLoading}
                    className="px-6 h-12 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                     {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                     Sync Node
                  </button>
               </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Title</label>
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Premium Wireless Headphones Max"
                    className="w-full bg-transparent border-b border-slate-200 py-3 text-xl font-black text-slate-900 outline-none focus:border-indigo-600 transition-all placeholder:text-slate-200"
                  />
               </div>

               <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between mb-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description Engine</label>
                     <button 
                        onClick={async () => {
                           setIsAiLoading(true);
                           const content = await generateAILongDescriptionAction({ name: formData.name, category: "Product" });
                           setFormData({...formData, description: content.longDescription, shortDescription: content.shortDescription, tagline: content.tagline});
                           setIsAiLoading(false);
                        }}
                        className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1.5 hover:underline"
                     >
                        <Sparkles className="w-3.5 h-3.5" /> Neural Rewrite
                     </button>
                  </div>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={12}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-6 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/5 transition-all leading-relaxed resize-none"
                    placeholder="Describe your product in detail..."
                  />
               </div>
            </div>

            {/* Pricing & Media Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Pricing */}
               <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6">Financial Policy</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Retail Price</label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                           <input name="price" value={formData.price} onChange={handleInputChange} className="w-full pl-8 pr-4 h-12 bg-slate-50 rounded-xl text-base font-black text-slate-900 outline-none border border-slate-100 focus:border-indigo-600/30" placeholder="0.00" />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Discounted</label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                           <input name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} className="w-full pl-8 pr-4 h-12 bg-slate-50 rounded-xl text-base font-black text-rose-600 outline-none border border-slate-100 focus:border-rose-600/30" placeholder="0.00" />
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                     <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-indigo-600" />
                        <span className="text-[11px] font-black text-indigo-900 uppercase tracking-tight">Free Delivery Service</span>
                     </div>
                     <button 
                        onClick={() => setFormData({...formData, isFreeDelivery: !formData.isFreeDelivery})}
                        className={cn("w-10 h-5 rounded-full relative transition-all", formData.isFreeDelivery ? "bg-indigo-600" : "bg-slate-300")}
                     >
                        <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm", formData.isFreeDelivery ? "right-0.5" : "left-0.5")} />
                     </button>
                  </div>
               </div>

               {/* Inventory */}
               <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6">Inventory Ops</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stock Level</label>
                        <input name="stock" value={formData.stock} onChange={handleInputChange} className="w-full px-4 h-12 bg-slate-50 rounded-xl text-base font-black text-slate-900 outline-none border border-slate-100" placeholder="0" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SKU / Code</label>
                        <input name="barcode" value={formData.barcode} onChange={handleInputChange} className="w-full px-4 h-12 bg-slate-50 rounded-xl text-base font-black text-slate-900 outline-none border border-slate-100 font-mono" placeholder="AUTO-GEN" />
                     </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                     <Barcode className="w-5 h-5 text-slate-400" />
                     <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Internal barcodes will be generated upon catalog sync.</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Sidebar: Right Column */}
         <div className="lg:col-span-4 space-y-8">
            
            {/* Visual Assets */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
               <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">Media Assets</h3>
               <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "aspect-square rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group",
                    formData.image ? "border-indigo-600/30 bg-slate-50" : "border-slate-200 bg-slate-50/50 hover:border-indigo-600/50"
                  )}
               >
                  {isUploading ? (
                     <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  ) : formData.image ? (
                     <img src={formData.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                  ) : (
                     <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Product Image</span>
                     </div>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
               </div>
               {formData.image && (
                  <div className="mt-4 flex gap-2">
                     <button className="flex-1 h-10 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Vision Scan</button>
                     <button 
                        onClick={() => setFormData({...formData, image: null})}
                        className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               )}
            </div>

            {/* Categorization */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
               <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Product Nodes</h3>
               
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Primary Category</label>
                  <select 
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600/30 appearance-none"
                  >
                     <option value="">Uncategorized</option>
                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Brand Authority</label>
                  <select 
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleInputChange}
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600/30 appearance-none"
                  >
                     <option value="">Generic (No Brand)</option>
                     {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
               </div>
            </div>

            {/* Logistics Summary */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
               <div className="flex items-center gap-2 mb-6">
                  <Truck className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Logistics Config</h3>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/10">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Territory</span>
                     <span className="text-[10px] font-black uppercase text-indigo-400">All Bangladesh</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/10">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Settlement</span>
                     <span className="text-[10px] font-black uppercase text-indigo-400">COD Verified</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Automated Dispatch</span>
                     <span className="text-[10px] font-black uppercase text-green-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Enabled</span>
                  </div>
               </div>
               <button 
                  onClick={() => setStep(4)} // Redirect to specific logic if needed
                  className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
               >
                  Modify Logistics Node
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
