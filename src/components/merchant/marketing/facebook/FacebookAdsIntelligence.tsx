"use client";

import React, { useState } from "react";
import { 
  Facebook, TrendingUp, DollarSign, Target, 
  Sparkles, ExternalLink, RefreshCcw, Layout,
  BarChart3, MousePointer2, Zap
} from "lucide-react";

import { generateAdCopyAction } from "@/app/merchant/marketing/facebook/actions";
import { toast } from "sonner";

export default function FacebookAdsIntelligence({ 
  products = [], 
  merchantStoreId 
}: { 
  products?: {id: string, name: string}[],
  merchantStoreId?: string
}) {
  const [activeTab, setActiveTab] = useState<"ANALYTICS" | "LIBRARY" | "AI_COPY">("ANALYTICS");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [objective, setObjective] = useState("Sales Conversion");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState("");

  const handleGenerateCopy = async () => {
    if (!selectedProductId) {
      toast.error("Please select a product first");
      return;
    }
    if (!merchantStoreId) return;

    setIsGenerating(true);
    try {
      const result = await generateAdCopyAction({
        productId: selectedProductId,
        objective,
        merchantStoreId
      });

      if (result.success && result.copy) {
        setGeneratedCopy(result.copy);
        toast.success("Ad copy generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate copy");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-8 animate-in fade-in duration-500 pb-20 px-4 md:px-0">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100  pb-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#1877F2] text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                 <Facebook className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[#0F172A]  uppercase tracking-tighter italic">
                Ads <span className="text-[#1877F2]">Intelligence</span>
              </h1>
           </div>
           <p className="text-gray-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
             CAPI Sync • Catalog Automation • ROAS Optimization
           </p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-6 py-2.5 bg-white  border border-gray-100  rounded-2xl text-[10px] font-black uppercase hover:bg-gray-50 transition-all shadow-sm">
              <RefreshCcw className="w-4 h-4" /> Sync Now
           </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-gray-50  p-1.5 rounded-[20px] border border-gray-100  w-fit">
         {[
           { id: "ANALYTICS", label: "Performance", icon: BarChart3 },
           { id: "LIBRARY", label: "Ad Library", icon: Layout },
           { id: "AI_COPY", label: "AI Copywriter", icon: Sparkles },
         ].map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
               activeTab === tab.id ? "bg-white  text-indigo-600  shadow-sm" : "text-gray-400"
             }`}
           >
             <tab.icon className="w-4 h-4" />
             {tab.label}
           </button>
         ))}
      </div>

      {activeTab === "ANALYTICS" && (
        <div className="space-y-8">
           {/* ROAS Summary Metrics */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard title="Total Ad Spend" value="৳ 12,500" trend="-15%" isPositive={false} icon={DollarSign} />
              <MetricCard title="Conversion Revenue" value="৳ 84,200" trend="+24%" isPositive={true} icon={TrendingUp} />
              <MetricCard title="ROAS (Real-time)" value="6.74x" trend="+1.2" isPositive={true} icon={Target} />
              <MetricCard title="CAPI Accuracy" value="99.8%" trend="Elite" isPositive={true} icon={Zap} />
           </div>

           {/* Chart Placeholder */}
           <div className="bg-white  border border-gray-100  rounded-[40px] p-8 md:p-12 shadow-sm h-[400px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-transparent " />
              <div className="text-center space-y-4 relative z-10">
                 <BarChart3 className="w-16 h-16 text-indigo-600 opacity-20 mx-auto" />
                 <h3 className="text-xl font-black text-[#0F172A] ">ROAS vs Ad Spend Visualization</h3>
                 <p className="text-xs text-gray-400 font-bold max-w-sm">Aggregating Meta Pixel & Conversions API data to show your true return on investment.</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === "LIBRARY" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => (
             <div key={i} className="bg-white  border border-gray-100  rounded-3xl overflow-hidden group hover:border-indigo-500/30 transition-all shadow-sm">
                <div className="aspect-[4/5] bg-gray-50  flex items-center justify-center relative overflow-hidden">
                   <Layout className="w-12 h-12 text-gray-200" />
                   <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-[8px] font-black uppercase rounded-full shadow-lg">Active Ad</div>
                </div>
                <div className="p-6 space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100  rounded-lg"></div>
                      <div>
                         <h4 className="text-xs font-black">Competitor Brand</h4>
                         <p className="text-[9px] text-gray-400 font-bold">Fashion Industry</p>
                      </div>
                   </div>
                   <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic line-clamp-3">
                     "Transform your style with our latest collection. 20% off for first 100 orders!"
                   </p>
                   <button className="w-full py-3 bg-gray-50  border border-gray-100  rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      View in Ad Library <ExternalLink className="w-3.5 h-3.5" />
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}

      {activeTab === "AI_COPY" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white  border border-gray-100  rounded-[40px] p-8 md:p-12 space-y-8">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Product Selection</label>
                 <select 
                   value={selectedProductId}
                   onChange={(e) => setSelectedProductId(e.target.value)}
                   className="w-full bg-gray-50  border border-gray-100  rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500"
                 >
                    <option value="">Select from Inventory...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                 </select>
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Ad Objective</label>
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setObjective("Sales Conversion")}
                      className={`p-4 rounded-2xl text-[10px] font-black uppercase transition-all ${objective === 'Sales Conversion' ? 'bg-indigo-50 border border-indigo-100 text-indigo-600' : 'bg-white border border-gray-100 text-gray-400'}`}
                    >
                      Sales Conversion
                    </button>
                    <button 
                      onClick={() => setObjective("Brand Awareness")}
                      className={`p-4 rounded-2xl text-[10px] font-black uppercase transition-all ${objective === 'Brand Awareness' ? 'bg-indigo-50 border border-indigo-100 text-indigo-600' : 'bg-white border border-gray-100 text-gray-400'}`}
                    >
                      Brand Awareness
                    </button>
                 </div>
              </div>
              <button 
                onClick={handleGenerateCopy}
                disabled={isGenerating || !selectedProductId}
                className="w-full py-5 bg-[#1877F2] text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                 {isGenerating ? (
                   <RefreshCcw className="w-5 h-5 animate-spin" />
                 ) : (
                   <Sparkles className="w-5 h-5" />
                 )}
                 {isGenerating ? "Generating..." : "Generate High-Converting Copy"}
              </button>
           </div>
           
           <div className="bg-indigo-600 text-white rounded-[40px] p-8 md:p-12 flex flex-col justify-between shadow-2xl shadow-indigo-200 min-h-[400px]">
              <div className="space-y-6">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60">
                   <Sparkles className="w-4 h-4" /> {generatedCopy ? "AI-Powered Ad Copy" : "AI Suggestion"}
                 </div>
                 {generatedCopy ? (
                   <div className="whitespace-pre-wrap text-sm md:text-base font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500">
                     {generatedCopy}
                   </div>
                 ) : (
                   <>
                     <h3 className="text-2xl md:text-3xl font-black tracking-tighter leading-tight italic">
                       {isGenerating ? "Analyzing product and crafting copy..." : "Your AI-generated copy will appear here."}
                     </h3>
                     {!isGenerating && (
                       <p className="text-sm font-medium opacity-80 leading-relaxed">
                         Select a product and objective to generate optimized ad copy for your Meta campaigns.
                       </p>
                     )}
                   </>
                 )}
              </div>
              {generatedCopy && (
                <div className="pt-8 border-t border-white/10 mt-12 flex items-center justify-between">
                   <div className="text-[10px] font-black uppercase tracking-widest">Optimized for ROAS</div>
                   <button 
                     onClick={() => {
                        navigator.clipboard.writeText(generatedCopy);
                        toast.success("Copied to clipboard!");
                     }}
                     className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase hover:bg-gray-100 transition-all"
                   >
                     Copy to Ads
                   </button>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, trend, isPositive, icon: Icon }: any) {
  return (
    <div className="bg-white  border border-gray-100  rounded-3xl p-5 md:p-6 shadow-sm group hover:border-indigo-500/30 transition-all">
       <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-gray-50  rounded-xl flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-colors">
             <Icon className="w-5 h-5" />
          </div>
          <div className={`text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-full border ${
            isPositive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
             {trend}
          </div>
       </div>
       <div className="text-lg md:text-xl font-black text-[#0F172A]  tracking-tight">{value}</div>
       <h4 className="text-[8px] md:text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">{title}</h4>
    </div>
  );
}
