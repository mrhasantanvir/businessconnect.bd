"use client";

import React, { useState, useEffect } from "react";
import { 
  Megaphone, 
  Users, 
  Calendar, 
  FileText, 
  Target, 
  Zap, 
  Save, 
  RefreshCw, 
  Layers, 
  Filter,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createCampaignAction } from "./actions";

export function CampaignCreator({ categories, products }: { categories: any[], products: any[] }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("audience");
  
  const [formData, setFormData] = useState({
    name: "",
    content: "Hi {name}, we have a special offer for you!",
    scheduledAt: "",
    targetType: "ALL", // ALL, PRODUCT, CATEGORY, TOP_SELLING, RANGE, BULK_UPLOAD
    productId: "",
    categoryId: "",
    rangeLimit: 1000,
    rangeOrder: "FIRST", // FIRST, LAST
    externalNumbers: [] as string[],
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const numbers = text.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length >= 11);
      setFormData({...formData, externalNumbers: numbers});
      alert(`${numbers.length} unique numbers detected!`);
    };
    reader.readAsText(file);
  };

  const templates = [
    { name: "Welcome Offer", content: "Hi {name}, welcome to BusinessConnect! Use code FIRST20 for 20% off." },
    { name: "Flash Sale", content: "Emergency Sale! {name}, get 50% off on all products for the next 2 hours." },
    { name: "Bengali Greeting", content: "প্রিয় {name}, আমাদের নতুন কালেকশন দেখতে আজই ভিজিট করুন!" },
  ];

  const handleSubmit = async () => {
    if (!formData.name || !formData.content) return alert("Fill required fields");
    setLoading(true);
    try {
      const res = await createCampaignAction({
        name: formData.name,
        type: "SMS",
        content: formData.content,
        targetCriteria: {
            type: formData.targetType,
            productId: formData.productId,
            categoryId: formData.categoryId,
            limit: formData.rangeLimit,
            order: formData.rangeOrder
        }
      });
      alert("Campaign Created as DRAFT!");
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white  border border-slate-100  rounded-[48px] overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-500">
      
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-50 ">
         {[
           { id: "audience", label: "Select Audience", icon: Users },
           { id: "content", label: "Message & Templates", icon: FileText },
           { id: "schedule", label: "Schedule & Launch", icon: Calendar },
         ].map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={cn(
               "flex-1 py-6 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all",
               activeTab === tab.id ? "text-indigo-600 bg-indigo-50/50 " : "text-slate-400 hover:text-slate-900 "
             )}
           >
              <tab.icon className="w-4 h-4" />
              {tab.label}
           </button>
         ))}
      </div>

      <div className="p-10 space-y-10">
         
         {/* Audience Section */}
         {activeTab === "audience" && (
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { id: "ALL", label: "All Customers", desc: "Every user in your database", icon: Users },
                    { id: "PRODUCT", label: "Product Buyers", desc: "Buyers of a specific item", icon: Zap },
                    { id: "CATEGORY", label: "Category Specific", desc: "Buyers from a category", icon: Layers },
                    { id: "TOP_SELLING", label: "Top Spenders", desc: "Your most loyal customers", icon: Sparkles },
                    { id: "RANGE", label: "Range Selection", desc: "First/Last N customers", icon: Filter },
                    { id: "BULK_UPLOAD", label: "Bulk CSV/List", desc: "Upload numbers from file", icon: FileText },
                  ].map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setFormData({...formData, targetType: t.id})}
                      className={cn(
                        "p-6 rounded-[32px] border text-left transition-all group",
                        formData.targetType === t.id ? "bg-indigo-600 border-indigo-500 text-white shadow-xl" : "bg-white  border-slate-100  text-slate-900  hover:border-indigo-200"
                      )}
                    >
                       <t.icon className={cn("w-6 h-6 mb-4", formData.targetType === t.id ? "text-white" : "text-indigo-500")} />
                       <div className="text-sm font-black uppercase tracking-tight">{t.label}</div>
                       <div className={cn("text-[10px] font-bold mt-1 uppercase opacity-60", formData.targetType === t.id ? "text-white" : "text-slate-400")}>{t.desc}</div>
                    </button>
                  ))}
               </div>

               {/* Conditional Filters */}
               <div className="bg-slate-50  rounded-[32px] p-8 border border-dashed border-slate-200  space-y-6">
                  {formData.targetType === "PRODUCT" && (
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Target Product</label>
                       <select 
                         value={formData.productId}
                         onChange={e => setFormData({...formData, productId: e.target.value})}
                         className="w-full h-14 px-6 bg-white  rounded-2xl text-sm font-bold outline-none"
                       >
                          <option value="">Choose a product...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                       </select>
                    </div>
                  )}

                  {formData.targetType === "CATEGORY" && (
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Target Category</label>
                       <select 
                         value={formData.categoryId}
                         onChange={e => setFormData({...formData, categoryId: e.target.value})}
                         className="w-full h-14 px-6 bg-white  rounded-2xl text-sm font-bold outline-none"
                       >
                          <option value="">Choose a category...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                    </div>
                  )}

                  {formData.targetType === "RANGE" && (
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Order</label>
                          <select 
                            value={formData.rangeOrder}
                            onChange={e => setFormData({...formData, rangeOrder: e.target.value})}
                            className="w-full h-14 px-6 bg-white  rounded-2xl text-sm font-bold outline-none"
                          >
                             <option value="FIRST">First Registered</option>
                             <option value="LAST">Recently Registered</option>
                          </select>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Count (Limit)</label>
                          <input 
                            type="number"
                            value={formData.rangeLimit}
                            onChange={e => setFormData({...formData, rangeLimit: parseInt(e.target.value) || 0})}
                            className="w-full h-14 px-6 bg-white  rounded-2xl text-sm font-bold outline-none" 
                          />
                       </div>
                    </div>
                  )}

                  {formData.targetType === "BULK_UPLOAD" && (
                    <div className="space-y-6">
                       <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200  rounded-3xl p-10 bg-white  transition-all hover:bg-slate-50">
                          <FileText className="w-12 h-12 text-slate-300 mb-4" />
                          <h4 className="text-sm font-black uppercase tracking-tight">Upload Numbers List</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 mb-6 text-center max-w-xs">Supports CSV, TXT (One number per line or comma separated)</p>
                          <div className="flex items-center gap-4 mb-6">
                             <input 
                                type="file" 
                                accept=".csv,.txt"
                                onChange={handleFileUpload}
                                className="hidden" 
                                id="csv-upload"
                             />
                             <label 
                                htmlFor="csv-upload"
                                className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xl"
                             >
                                Choose File
                             </label>
                             <button 
                                onClick={() => {
                                   const blob = new Blob(["phone\n01712345678\n01812345678\n01912345678"], { type: 'text/csv' });
                                   const url = window.URL.createObjectURL(blob);
                                   const a = document.createElement('a');
                                   a.href = url;
                                   a.download = 'sample_numbers.csv';
                                   a.click();
                                }}
                                className="text-[10px] font-black uppercase text-indigo-600 underline"
                             >
                                Download Sample
                             </button>
                          </div>
                       </div>
                       {formData.externalNumbers.length > 0 && (
                          <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50  p-4 rounded-2xl border border-indigo-100">
                             <CheckCircle2 className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase">{formData.externalNumbers.length} Numbers Loaded Successfully</span>
                          </div>
                       )}
                    </div>
                  )}
               </div>
            </div>
         )}

         {/* Content Section */}
         {activeTab === "content" && (
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Message Composer */}
                  <div className="lg:col-span-2 space-y-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Campaign Name</label>
                        <input 
                          placeholder="e.g. Eid Flash Sale 2024"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full h-14 px-6 bg-slate-50  rounded-2xl text-sm font-bold outline-none" 
                        />
                     </div>
                     <div className="space-y-3">
                        <div className="flex justify-between items-end">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Message Content</label>
                           <span className="text-[9px] font-bold text-slate-400 uppercase">Use <code className="text-indigo-500">{`{name}`}</code> for personalization</span>
                        </div>
                        <textarea 
                          rows={6}
                          value={formData.content}
                          onChange={e => setFormData({...formData, content: e.target.value})}
                          className="w-full p-6 bg-slate-50  rounded-3xl text-sm font-bold outline-none resize-none"
                        />
                        <div className="flex justify-between items-center px-4">
                           <span className="text-[10px] font-bold text-slate-400 uppercase">{formData.content.length} / 160 Characters</span>
                           <span className="text-[10px] font-black text-indigo-600 uppercase">1 SMS Part</span>
                        </div>
                     </div>
                  </div>

                  {/* Templates Panel */}
                  <div className="space-y-6">
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-900  flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Quick Templates
                     </h3>
                     <div className="space-y-4">
                        {templates.map((t, i) => (
                           <button 
                             key={i}
                             onClick={() => setFormData({...formData, content: t.content})}
                             className="w-full p-6 bg-slate-50  border border-slate-100  rounded-3xl text-left hover:border-indigo-200 transition-all group"
                           >
                              <div className="text-[10px] font-black uppercase text-indigo-600 mb-2">{t.name}</div>
                              <p className="text-[11px] font-bold text-slate-500 line-clamp-2 leading-relaxed">{t.content}</p>
                           </button>
                        ))}
                     </div>
                  </div>

               </div>
            </div>
         )}

         {/* Schedule Section */}
         {activeTab === "schedule" && (
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
               <div className="bg-indigo-600 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                  <Calendar className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10" />
                  <div className="relative z-10 max-w-lg space-y-6">
                     <h3 className="text-3xl font-black tracking-tighter uppercase">Ready for Blast Off?</h3>
                     <p className="text-sm font-bold text-indigo-100 opacity-80 uppercase leading-relaxed">
                        Schedule your campaign for the perfect moment or send it immediately to all selected targets.
                     </p>
                     
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Scheduled Time (Optional)</label>
                        <input 
                           type="datetime-local"
                           value={formData.scheduledAt}
                           onChange={e => setFormData({...formData, scheduledAt: e.target.value})}
                           className="w-full h-14 px-6 bg-white text-slate-900 text-slate-900 text-slate-900/10 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-white/20 text-white" 
                        />
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50  rounded-[32px] p-8 space-y-4">
                     <h4 className="text-xs font-black uppercase text-slate-500">Summary</h4>
                     <div className="space-y-3">
                        <div className="flex justify-between text-sm font-black text-slate-900  uppercase">
                           <span>Audience</span>
                           <span className="text-indigo-600">{formData.targetType}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-slate-900  uppercase">
                           <span>Language</span>
                           <span className="">Bengali/English</span>
                        </div>
                     </div>
                  </div>

                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="h-full bg-slate-900   text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                     {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Megaphone className="w-6 h-6" />}
                     Create Campaign
                  </button>
               </div>
            </div>
         )}

      </div>
    </div>
  );
}

