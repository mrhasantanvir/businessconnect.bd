"use client";

import React from "react";
import { Folder, MoreVertical, Trash2, Edit2, ChevronRight, Hash, Database } from "lucide-react";
import { deleteCategoryAction } from "./actions";

export function CategoryList({ categories }: { categories: any[] }) {
  const rootCategories = categories.filter((c) => !c.parentId);

  const renderCategoryNode = (category: any, depth = 0) => {
    if (depth > 5) return null; // Hard limit to prevent infinite recursion
    const children = categories.filter((c) => c.parentId === category.id);
    const paddingLeft = depth * 32;

    return (
      <div key={category.id} className="group">
        <div 
          className="flex items-center justify-between py-6 border-b border-gray-50 group-hover:bg-gray-50/50 transition-all px-6 rounded-[24px]"
          style={{ paddingLeft: `${paddingLeft + 24}px` }}
        >
          <div className="flex items-center gap-6">
            <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              depth === 0 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : 
              depth === 1 ? "bg-slate-100 text-slate-600 border border-slate-200" : 
              "bg-gray-50 text-gray-400 border border-dashed border-gray-200"
            }`}>
              {category.image ? (
                 <img src={category.image} alt="" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                 depth === 0 ? <Folder className="w-5 h-5" /> : <ChevronRight className="w-4 h-4" />
              )}
              {category.isFeatured && (
                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className={`font-black uppercase tracking-tight ${depth === 0 ? 'text-lg text-slate-900' : 'text-sm text-slate-600'}`}>{category.name}</span>
                {category.isFeatured && (
                  <span className="text-[7px] font-black uppercase bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full tracking-widest">Featured</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">slug: {category.slug || "n/a"}</span>
                <span className="w-1 h-1 bg-gray-200 rounded-full" />
                <span className="text-[10px] text-indigo-500 font-black flex items-center gap-1 uppercase tracking-tighter">
                   <Database className="w-3 h-3" /> {category._count?.products || 0} Products
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
             <button className="p-3 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 border border-transparent hover:border-gray-100 transition-all shadow-sm"><Edit2 className="w-4 h-4" /></button>
             <button 
               onClick={() => {
                 if (confirm("Permanently remove this category and all its metadata?")) {
                   deleteCategoryAction(category.id).catch(e => alert(e.message));
                 }
               }}
               className="p-3 hover:bg-red-50 rounded-xl text-red-200 hover:text-red-500 border border-transparent hover:border-red-100 transition-all shadow-sm"
             >
               <Trash2 className="w-4 h-4" />
             </button>
          </div>
        </div>
        
        {children.length > 0 && (
          <div className="animate-in slide-in-from-left-2 duration-300">
            {children.map((child) => renderCategoryNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {rootCategories.length > 0 ? (
        rootCategories.map((root) => renderCategoryNode(root))
      ) : (
        <div className="p-20 text-center space-y-4 opacity-30">
           <Folder className="w-16 h-16 mx-auto mb-4" />
           <p className="font-black text-xl">No categories found.</p>
           <p className="text-sm">Start your catalog by creating a root node on the right.</p>
        </div>
      )}
    </div>
  );
}

