"use client";

import React, { useState, useTransition, useRef } from "react";
import { 
  Plus, Upload, Sparkles, ShoppingBag, DollarSign, 
  Truck, Package, Barcode, Trash2, Image as ImageIcon, ShieldCheck,
  Scissors, Zap, Download, Save, Gift, Loader2,
  Info, X, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createProductAction, uploadProductImageAction } from "@/app/products/actions";
import { generateAILongDescriptionAction } from "@/app/products/aiActions";

interface ProductWizardProps {
  categories: any[];
  brands: any[];
}

type TabType = "general" | "pricing" | "logistics" | "seo";

export default function ProductWizard({ categories, brands }: ProductWizardProps) {
  const [tab, setTab] = useState<TabType>("general");
  const [isPending, startTransition] = useTransition();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
    gallery: [] as string[],
    shortDescription: "",
    tagline: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'gallery') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      if (type === 'main') {
        const uploadData = new FormData();
        uploadData.append("file", files[0]);
        const result = await uploadProductImageAction(uploadData);
        setFormData(prev => ({ ...prev, image: result.url }));
      } else {
        const newImages = await Promise.all(Array.from(files).map(async file => {
           const uploadData = new FormData();
           uploadData.append("file", file);
           const res = await uploadProductImageAction(uploadData);
           return res.url;
        }));
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...newImages] }));
      }
    } catch (err) { console.error(err); } finally {
      setIsUploading(false);
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

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-8 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
               <Plus className="w-6 h-6" />
            </div>
            <div>
               <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Add New Product</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enterprise Inventory Node</p>
            </div>
         </div>
         <div className="hidden md:flex items-center gap-4 px-6 border-l border-slate-100">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Node Online</span>
            </div>
         </div>
      </div>

      {/* MAIN EDITOR FRAME */}
      <div className="bg-white border border-slate-100 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col md:flex-row min-h-[750px] overflow-hidden">
         
         {/* SIDEBAR NAVIGATION */}
         <div className="w-full md:w-72 bg-slate-50/50 p-8 space-y-2 border-b md:border-b-0 md:border-r border-slate-50">
            <TabBtn active={tab === "general"} icon={ShoppingBag} label="General Hub" onClick={() => setTab("general")} />
            <TabBtn active={tab === "pricing"} icon={DollarSign} label="Price & Stock" onClick={() => setTab("pricing")} />
            <TabBtn active={tab === "logistics"} icon={Truck} label="Logistics Engine" onClick={() => setTab("logistics")} />
            <TabBtn active={tab === "seo"} icon={Search} label="AI & SEO Schema" onClick={() => setTab("seo")} />
            
            <div className="pt-12">
               <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl text-white shadow-xl shadow-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                     <Sparkles className="w-4 h-4 text-indigo-400" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">AI Assistant</span>
                  </div>
                  <p className="text-[10px] font-medium leading-relaxed opacity-80 uppercase tracking-tight">Use the Neural Rewrite button to automatically generate high-converting descriptions.</p>
               </div>
            </div>
         </div>

         {/* MAIN CONTENT AREA */}
         <div className="flex-1 p-8 md:p-12 bg-white">
            
            {/* GENERAL TAB */}
            {tab === "general" && (
               <div className="space-y-10 animate-in fade-in duration-700">
                  <SectionTitle title="Product Identity" sub="Base information and visual assets." />
                  
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-3 h-3" /> Product Name
                     </label>
                     <input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Premium Wireless Headphones..." className="w-full bg-slate-50 border-none h-16 px-6 text-xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-600/5 rounded-2xl transition-all" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                        <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full bg-slate-50 border-none h-14 px-6 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-600/5 rounded-2xl appearance-none">
                           <option value="">SELECT CATEGORY</option>
                           {categories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                        </select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Authority</label>
                        <select name="brandId" value={formData.brandId} onChange={handleInputChange} className="w-full bg-slate-50 border-none h-14 px-6 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-600/5 rounded-2xl appearance-none">
                           <option value="">NO BRAND (GENERIC)</option>
                           {brands.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
                        </select>
                     </div>
                  </div>

                  {/* IMAGES SECTION */}
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="col-span-1 space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Thumbnail</label>
                           <div onClick={() => fileInputRef.current?.click()} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex items-center justify-center cursor-pointer group hover:border-indigo-400 transition-all overflow-hidden relative">
                              {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-indigo-600" /> : 
                              formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : 
                              <div className="flex flex-col items-center gap-2 text-slate-400">
                                 <Upload className="w-6 h-6" />
                                 <span className="text-[9px] font-black uppercase">Click to Upload</span>
                              </div>}
                              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, 'main')} />
                           </div>
                        </div>

                        <div className="col-span-2 space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Gallery ({formData.gallery.length}/8)</label>
                           <div className="grid grid-cols-4 gap-4">
                              {formData.gallery.map((img, idx) => (
                                 <div key={idx} className="aspect-square bg-slate-50 rounded-2xl relative group overflow-hidden border border-slate-100">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                                 </div>
                              ))}
                              {formData.gallery.length < 8 && (
                                 <div onClick={() => galleryInputRef.current?.click()} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-all">
                                    <Plus className="w-5 h-5 text-slate-300" />
                                    <input ref={galleryInputRef} type="file" multiple className="hidden" onChange={(e) => handleFileChange(e, 'gallery')} />
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Description</label>
                        <button onClick={async () => {
                           setIsAiLoading(true);
                           const content = await generateAILongDescriptionAction({ name: formData.name, category: "Product" });
                           setFormData({...formData, description: content.longDescription, shortDescription: content.shortDescription, tagline: content.tagline});
                           setIsAiLoading(false);
                        }} className="px-4 py-2 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-full flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all">
                           <Sparkles className="w-3 h-3" /> Neural Rewrite
                        </button>
                     </div>
                     <textarea name="description" value={formData.description} onChange={handleInputChange} rows={8} className="w-full bg-slate-50 border-none p-8 text-sm font-medium text-slate-600 outline-none focus:ring-4 focus:ring-indigo-600/5 rounded-[32px] leading-relaxed resize-none shadow-inner" />
                  </div>
               </div>
            )}

            {/* PRICING & STOCK TAB */}
            {tab === "pricing" && (
               <div className="space-y-12 animate-in fade-in duration-700">
                  <SectionTitle title="Financials & Stock" sub="Manage your prices and inventory levels." />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <PriceBox label="Selling Price" name="price" value={formData.price} onChange={handleInputChange} icon={DollarSign} color="indigo" />
                     <PriceBox label="Offer Price" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} icon={Gift} color="rose" />
                     <PriceBox label="Purchase Price" name="purchasePrice" value={formData.purchasePrice} onChange={handleInputChange} icon={Download} color="slate" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-50 space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Available Stock</label>
                        <input name="stock" value={formData.stock} onChange={handleInputChange} className="w-full bg-transparent border-none text-4xl font-black text-slate-900 outline-none" placeholder="0" />
                     </div>
                     <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-50 space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase">SKU / Barcode</label>
                        <input name="barcode" value={formData.barcode} onChange={handleInputChange} className="w-full bg-transparent border-none text-2xl font-black text-slate-900 outline-none font-mono" placeholder="AUTO-GEN" />
                     </div>
                  </div>
               </div>
            )}

            {/* LOGISTICS TAB */}
            {tab === "logistics" && (
               <div className="space-y-12 animate-in fade-in duration-700">
                  <SectionTitle title="Logistics Data" sub="Physical specs for shipping calculation." />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     <LogiInput label="Weight (KG)" name="unitWeight" value={formData.unitWeight} onChange={handleInputChange} />
                     <LogiInput label="Length (CM)" name="length" value={formData.length} onChange={handleInputChange} />
                     <LogiInput label="Width (CM)" name="width" value={formData.width} onChange={handleInputChange} />
                     <LogiInput label="Height (CM)" name="height" value={formData.height} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Handling Class</label>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {["GENERAL", "FRAGILE", "LIQUID", "ELECTRONIC"].map(c => (
                           <button key={c} onClick={() => setFormData({...formData, handlingClass: c})} className={cn("h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2", formData.handlingClass === c ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-white border-slate-50 text-slate-400")}>{c}</button>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {/* AI & SEO TAB */}
            {tab === "seo" && (
               <div className="space-y-12 animate-in fade-in duration-700">
                  <SectionTitle title="Search Optimization" sub="Configure visibility for Google & Social Media." />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     <div className="space-y-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEO Meta Title</label>
                           <input name="seoTitle" value={formData.seoTitle} onChange={handleInputChange} className="w-full bg-slate-50 border-none h-14 px-6 text-sm font-bold text-slate-800 outline-none rounded-2xl" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEO Description</label>
                           <textarea name="seoDescription" value={formData.seoDescription} onChange={handleInputChange} rows={5} className="w-full bg-slate-50 border-none p-6 text-sm font-medium text-slate-600 outline-none rounded-[32px] resize-none" />
                        </div>
                     </div>
                  </div>
               </div>
            )}

         </div>
      </div>

      {/* STICKY ACTION BAR */}
      <div className="sticky bottom-6 z-50 mt-10 px-4">
         <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-2xl border border-white rounded-[32px] p-4 flex items-center justify-end shadow-2xl">
            <button 
               onClick={handleSubmit}
               disabled={isPending}
               className="px-16 h-16 bg-slate-900 text-white text-[12px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all rounded-[24px] shadow-2xl flex items-center gap-4"
            >
               {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
               Save Product
            </button>
         </div>
      </div>

    </div>
  );
}

function TabBtn({ active, icon: Icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("w-full h-16 px-6 flex items-center gap-4 transition-all rounded-2xl", active ? "bg-white text-indigo-600 shadow-lg" : "text-slate-400 hover:text-slate-600")}>
       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", active ? "bg-indigo-50 text-indigo-600" : "bg-white border border-slate-50")}>
          <Icon className="w-5 h-5" />
       </div>
       <span className={cn("text-[11px] font-black uppercase tracking-tight", active ? "text-slate-900" : "text-slate-400")}>{label}</span>
    </button>
  );
}

function SectionTitle({ title, sub }: { title: string, sub: string }) {
   return (
      <div>
         <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">{title}</h2>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sub}</p>
      </div>
   )
}

function PriceBox({ label, icon: Icon, name, value, onChange, color = "indigo" }: any) {
   const colors: any = { indigo: "text-indigo-600", rose: "text-rose-600", slate: "text-slate-900" };
   return (
      <div className="bg-white p-8 rounded-[32px] shadow-lg border border-slate-50 space-y-4">
         <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", color === "indigo" ? "bg-indigo-50 text-indigo-600" : "bg-slate-100")}>
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
         <input name={name} value={value} onChange={onChange} className="w-full h-14 px-6 bg-slate-50 border-none text-sm font-black text-slate-900 outline-none rounded-2xl" placeholder="0" />
      </div>
   )
}
