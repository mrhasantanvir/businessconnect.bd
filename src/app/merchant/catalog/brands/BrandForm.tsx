"use client";

import React, { useState, useTransition } from "react";
import { Plus, Save, Globe, Link as LinkIcon, Sparkles, ChevronDown } from "lucide-react";
import { createOrUpdateBrandAction } from "./actions";

export function BrandForm() {
  const [isPending, startTransition] = useTransition();
  const [isSeoOpen, setIsSeoOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createOrUpdateBrandAction({
          name,
          slug,
          website,
          description,
          seoTitle,
          seoDescription,
          logo: "https://via.placeholder.com/150?text=Brand+Logo" // Placeholder for now
        });
        setName("");
        setSlug("");
        setWebsite("");
        setDescription("");
        setSeoTitle("");
        setSeoDescription("");
        alert("Brand added successfully!");
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-[#0F172A]">Registry Entry</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand Name</label>
          <input 
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            placeholder="e.g. Apple Inc."
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Safe Slug</label>
          <div className="flex items-center gap-2 bg-gray-50 px-5 py-3.5 rounded-2xl border-none">
            <span className="text-xs text-gray-400 font-medium">/brand/</span>
            <input 
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="bg-transparent border-none p-0 flex-1 font-bold text-[#0F172A] outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Official Website</label>
          <div className="flex items-center gap-2 bg-gray-50 px-5 py-3.5 rounded-2xl border-none">
            <LinkIcon className="w-4 h-4 text-gray-400" />
            <input 
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="bg-transparent border-none p-0 flex-1 font-bold text-[#0F172A] outline-none"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand Brief</label>
          <textarea 
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none resize-none"
            placeholder="One-liner about this entity..."
          />
        </div>

        {/* SEO Intelligence */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden mt-4">
           <button 
             type="button"
             onClick={() => setIsSeoOpen(!isSeoOpen)}
             className="w-full px-5 py-4 flex items-center justify-between bg-gray-50/50 hover:bg-gray-50 transition-colors"
           >
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1E40AF]">
                 <Globe className="w-4 h-4" /> SEO Integrity
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSeoOpen ? 'rotate-180' : ''}`} />
           </button>
           
           {isSeoOpen && (
             <div className="p-5 space-y-4 bg-white animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Search Title</label>
                  <input 
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Search Snippet</label>
                  <textarea 
                    rows={2}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                  />
                </div>
             </div>
           )}
        </div>

        <button 
          type="submit"
          disabled={isPending}
          className="w-full py-5 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-[24px] font-black shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Save className="w-5 h-5" />}
          {isPending ? "Validating Entry..." : "Register Brand"}
        </button>
      </form>
    </div>
  );
}

