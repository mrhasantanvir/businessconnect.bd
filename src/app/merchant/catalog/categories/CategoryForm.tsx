"use client";

import React, { useState, useTransition } from "react";
import { Plus, Save, Globe, Info, Sparkles, ChevronDown } from "lucide-react";
import { createOrUpdateCategoryAction } from "./actions";

export function CategoryForm({ allCategories }: { allCategories: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [isSeoOpen, setIsSeoOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
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
        await createOrUpdateCategoryAction({
          name,
          slug,
          parentId: parentId || null,
          description,
          image,
          isFeatured,
          seoTitle,
          seoDescription,
        });
        // Reset form
        setName("");
        setSlug("");
        setParentId("");
        setDescription("");
        setImage("");
        setIsFeatured(false);
        setSeoTitle("");
        setSeoDescription("");
        alert("Category created successfully!");
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  // Only allow top-level and mid-level categories as parents (max 3 level depth)
  const potentialParents = allCategories.filter(c => {
    // If a category has no parent, it's Level 1.
    // If its parent has no parent, it's Level 2.
    // If its parent's parent has no parent, it's Level 3.
    // We only want Level 1 and Level 2 as potential parents.
    const isLevel1 = !c.parentId;
    const parent = allCategories.find(pc => pc.id === c.parentId);
    const isLevel2 = c.parentId && !parent?.parentId;
    return isLevel1 || isLevel2;
  });

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-none p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-none bg-blue-50 flex items-center justify-center text-blue-600">
          <Plus className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-[#0F172A]">Add Category</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category Name</label>
          <input 
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-none font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            placeholder="e.g. Smart Electronics"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">URL Slug</label>
          <div className="flex items-center gap-2 bg-gray-50 px-5 py-3.5 rounded-none border-none">
            <span className="text-xs text-gray-400 font-medium">/catalog/</span>
            <input 
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="bg-transparent border-none p-0 flex-1 font-bold text-[#0F172A] outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Parent Category</label>
          <select 
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-none font-bold focus:ring-2 focus:ring-blue-100 outline-none appearance-none cursor-pointer"
          >
            <option value="">Root Level (No Parent)</option>
            {potentialParents.map(p => (
              <option key={p.id} value={p.id}>
                 {allCategories.find(pc => pc.id === p.parentId) ? '── ' : ''}{p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category Icon / Image</label>
              <input 
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-none font-bold focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="Image URL or Icon name"
              />
           </div>
           <div className="space-y-2 flex flex-col justify-end pb-3.5">
              <label className="flex items-center gap-3 cursor-pointer group">
                 <div 
                   onClick={() => setIsFeatured(!isFeatured)}
                   className={`w-12 h-6 rounded-none transition-all relative ${isFeatured ? 'bg-orange-500' : 'bg-gray-200'}`}
                 >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-none transition-all ${isFeatured ? 'left-7' : 'left-1'}`} />
                 </div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-orange-600 transition-colors">Featured Category</span>
              </label>
           </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
          <textarea 
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-none font-bold focus:ring-2 focus:ring-blue-100 outline-none resize-none"
            placeholder="Write a short description for this category..."
          />
        </div>

        {/* SEO Collapsible */}
        <div className="border border-gray-100 rounded-none overflow-hidden mt-4">
           <button 
             type="button"
             onClick={() => setIsSeoOpen(!isSeoOpen)}
             className="w-full px-5 py-4 flex items-center justify-between bg-gray-50/50 hover:bg-gray-50 transition-colors"
           >
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1E40AF]">
                 <Globe className="w-4 h-4" /> SEO Settings
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSeoOpen ? 'rotate-180' : ''}`} />
           </button>
           
           {isSeoOpen && (
             <div className="p-5 space-y-4 bg-white animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Meta Title</label>
                  <input 
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-none text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Meta Description</label>
                  <textarea 
                    rows={2}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-none text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                  />
                </div>
             </div>
           )}
        </div>

        <button 
          type="submit"
          disabled={isPending}
          className="w-full py-5 bg-slate-900 text-white rounded-none font-black shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Save className="w-5 h-5" />}
          {isPending ? "Saving..." : "Save Category"}
        </button>
      </form>
    </div>
  );
}

