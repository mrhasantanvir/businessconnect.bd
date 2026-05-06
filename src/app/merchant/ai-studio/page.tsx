"use client";

import { useState, useRef } from "react";
import { 
  Sparkles, 
  Upload, 
  Link as LinkIcon, 
  Search, 
  Cpu, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ChevronRight,
  Globe,
  Zap,
  Layers,
  PenTool
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AIProductStudio() {
  const [importUrl, setImportUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlImport = async () => {
    if (!importUrl) return;
    setIsScraping(true);
    try {
      // Simulate/Trigger Global Scraper Logic
      const response = await fetch("/api/merchant/ai-studio/import", {
        method: "POST",
        body: JSON.stringify({ url: importUrl })
      });
      const data = await response.json();
      setAiAnalysis(data);
    } catch (error) {
      console.error("Scraping failed", error);
    } finally {
      setIsScraping(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsVisionLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/merchant/ai-studio/vision", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      setAiAnalysis(data);
    } catch (error) {
      console.error("Vision AI failed", error);
    } finally {
      setIsVisionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-inter pb-20">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href="/products/list" className="p-2 hover:bg-gray-100 rounded-full transition-all group">
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-slate-900" />
             </Link>
             <div>
                <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">AI Product Studio</h1>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Global Sourcing Hub</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black">AI</div>
                ))}
             </div>
             <div className="h-6 w-px bg-gray-200"></div>
             <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full uppercase">Neural Sync Active</span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Workflow Navigation */}
          <div className="lg:col-span-3 space-y-2">
             <WorkflowStep icon={Zap} title="AI Product Launch" subtitle="Vision-First Workflow" active />
             <WorkflowStep icon={Layers} title="Inventory & POS" subtitle="Commerce Ops" />
             <WorkflowStep icon={Globe} title="Global SEO" subtitle="Neural Translation" />
             <WorkflowStep icon={PenTool} title="Content Gen" subtitle="AI Copywriter" />
             
             <div className="mt-10 p-5 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl text-white shadow-xl shadow-indigo-200 relative overflow-hidden group cursor-pointer">
                <Sparkles className="absolute -right-2 -top-2 w-16 h-16 text-white/10 group-hover:rotate-12 transition-all duration-700" />
                <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-80">System Insight</p>
                <p className="text-xs font-bold leading-relaxed mb-4">Vision Engine will detect context, materials, and category automatically.</p>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                   <div className="w-2/3 h-full bg-white animate-pulse"></div>
                </div>
             </div>
          </div>

          {/* Center Panel: Main AI Studio */}
          <div className="lg:col-span-9 space-y-6">
             {/* Global Import Node */}
             <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white border border-gray-100 rounded-2xl p-2 flex items-center shadow-sm">
                   <div className="w-12 h-12 flex items-center justify-center text-slate-400">
                      <Globe className="w-5 h-5" />
                   </div>
                   <input 
                    type="text" 
                    placeholder="Paste URL from Alibaba, Amazon, 1688, Daraz..." 
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-300"
                   />
                   <button 
                    onClick={handleUrlImport}
                    disabled={isScraping}
                    className="px-6 py-2.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                   >
                      {isScraping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                      Import Node
                   </button>
                </div>
             </div>

             {/* AI Studio Area */}
             <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-indigo-600" />
                   </div>
                   <h2 className="text-lg font-black text-slate-900 tracking-tight">Vision Intelligence</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {/* Vision Upload Node */}
                   <div className="space-y-4">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "aspect-square rounded-[32px] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group",
                          previewImage ? "border-indigo-200 bg-slate-50" : "border-slate-100 bg-slate-50/50 hover:border-indigo-400 hover:bg-white"
                        )}
                      >
                         {previewImage ? (
                            <img src={previewImage} className="w-full h-full object-cover rounded-[28px] group-hover:scale-105 transition-all duration-700" alt="Preview" />
                         ) : (
                            <>
                               <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all">
                                  <Upload className="w-6 h-6 text-indigo-600" />
                               </div>
                               <p className="mt-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Neural Vision Entry</p>
                            </>
                         )}
                         {isVisionLoading && (
                            <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-sm flex items-center justify-center">
                               <div className="flex flex-col items-center gap-3">
                                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                  <p className="text-[10px] font-black text-indigo-600 uppercase animate-pulse">Detecting Context...</p>
                               </div>
                            </div>
                         )}
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </div>
                   </div>

                   {/* AI Generation Output */}
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-3 h-3 text-indigo-600" /> Suggested Identity
                         </label>
                         <div className="h-14 border-b-2 border-slate-100 flex items-center relative">
                            {aiAnalysis ? (
                               <input 
                                className="w-full text-xl font-black text-slate-800 bg-transparent border-none focus:ring-0 p-0"
                                defaultValue={aiAnalysis.name}
                               />
                            ) : (
                               <p className="text-xl font-black text-slate-200 uppercase tracking-tighter">Waiting for Vision...</p>
                            )}
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-Detected Category</label>
                         <div className="relative group">
                            <select className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-600/20 transition-all">
                               <option>{aiAnalysis?.category || "SELECT CATEGORY"}</option>
                               <option>Electronics</option>
                               <option>Fashion</option>
                               <option>Home & Decor</option>
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Suggestion</label>
                         <div className="h-12 bg-slate-50 rounded-xl px-4 flex items-center">
                            <span className="text-xs font-bold text-slate-400">{aiAnalysis?.brand || "NO BRAND DETECTED (GENERIC)"}</span>
                         </div>
                      </div>

                      <div className="pt-4 flex items-center gap-3">
                         <button className="flex-1 h-14 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
                            Push to Catalog
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function WorkflowStep({ icon: Icon, title, subtitle, active = false }: any) {
  return (
    <div className={cn(
      "w-full p-4 rounded-2xl flex items-center gap-4 transition-all cursor-pointer group",
      active ? "bg-white shadow-lg border border-indigo-50" : "hover:bg-gray-50"
    )}>
       <div className={cn(
         "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
         active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
       )}>
          <Icon className="w-5 h-5" />
       </div>
       <div>
          <p className={cn("text-xs font-black uppercase tracking-tight", active ? "text-slate-900" : "text-slate-400")}>{title}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
       </div>
    </div>
  );
}
