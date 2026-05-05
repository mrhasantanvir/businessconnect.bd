"use client";

import { useState } from "react";
import { 
  Package, 
  Truck, 
  Layers, 
  Search, 
  Image as ImageIcon, 
  Globe, 
  Sparkles, 
  Facebook, 
  Plus, 
  X,
  ChevronRight,
  Save,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdvancedProductBuilder() {
  const [activeTab, setActiveTab] = useState("BASIC");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    tags: [] as string[]
  });
  
  const [variations, setVariations] = useState<any[]>([]);
  const [variationTypes, setVariationTypes] = useState<string[]>(["Color", "Size"]);

  const addVariationRow = () => {
    setVariations([...variations, { id: Date.now(), name: "New Variation", price: "", stock: "", sku: "" }]);
  };

  const removeVariation = (id: number) => {
    setVariations(variations.filter(v => v.id !== id));
  };

  const handleAiAnalyze = async () => {
    if (!productData.imageUrl) return;
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/merchant/ai-studio", {
        method: "POST",
        body: JSON.stringify({ action: "ANALYZE", imageUrl: productData.imageUrl })
      });
      const data = await res.json();
      if (data.success) {
        setProductData(prev => ({
          ...prev,
          tags: data.tags,
          description: data.description || prev.description
        }));
      }
    } catch (err) {
      console.error("AI Analysis failed", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const tabs = [
    { id: "BASIC", label: "Basic Info", icon: Package },
    { id: "LOGISTICS", label: "Logistics", icon: Truck },
    { id: "VARIATIONS", label: "Variations", icon: Layers },
    { id: "SEO", label: "SEO & Social", icon: Globe },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4 p-4 md:p-6 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-gray-100 rounded-[2px] shadow-sm">
        <div>
          <h1 className="text-xl font-black text-[#0F172A] tracking-tight uppercase">Global Product Engine</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">AliExpress / Alibaba Standard Sourcing</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-[2px] text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
            Discard
          </button>
          <button className="px-6 py-2 bg-[#1E40AF] text-white rounded-[2px] text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20">
            <Save className="w-3.5 h-3.5" /> Save Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar Tabs */}
        <div className="lg:col-span-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-l-4",
                activeTab === tab.id 
                  ? "bg-white border-[#1E40AF] text-[#1E40AF] shadow-sm" 
                  : "bg-transparent border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}

          {/* AI Helper Card */}
          <div className="mt-8 bg-gradient-to-br from-indigo-600 to-blue-700 p-5 rounded-[2px] text-white shadow-xl">
             <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-[10px] font-black uppercase tracking-widest">AI Studio</span>
             </div>
             <p className="text-[11px] font-medium leading-relaxed opacity-90">
                Let AI remove backrounds, upscale images, and generate SEO descriptions instantly.
             </p>
             <button 
                onClick={handleAiAnalyze}
                disabled={isAiLoading || !productData.imageUrl}
                className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-[2px] text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
             >
                {isAiLoading ? "Processing..." : "Launch AI Studio"}
             </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 bg-white border border-gray-100 rounded-[2px] shadow-sm min-h-[600px] flex flex-col">
          <div className="p-6 flex-1">
            {activeTab === "BASIC" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Name</label>
                    <input 
                      value={productData.name}
                      onChange={e => setProductData({...productData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-[2px] px-4 py-2.5 text-sm font-bold text-[#0F172A] outline-none focus:border-blue-600 transition-all"
                      placeholder="e.g. Ultra Slim Wireless Earbuds Pro"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Image URL</label>
                    <div className="relative">
                      <input 
                        value={productData.imageUrl}
                        onChange={e => setProductData({...productData, imageUrl: e.target.value})}
                        className="w-full bg-indigo-50/30 border border-indigo-100 rounded-[2px] pl-4 pr-12 py-2.5 text-sm font-medium text-indigo-900 outline-none focus:border-indigo-600 transition-all"
                        placeholder="Paste image URL here"
                      />
                      <button 
                        onClick={handleAiAnalyze}
                        disabled={isAiLoading || !productData.imageUrl}
                        className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-[2px] hover:bg-indigo-700 transition-all disabled:opacity-50"
                      >
                        {isAiLoading ? <ImageIcon className="w-3.5 h-3.5 animate-pulse" /> : <Sparkles className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                   <textarea 
                     rows={6}
                     value={productData.description}
                     onChange={e => setProductData({...productData, description: e.target.value})}
                     className="w-full bg-gray-50 border border-gray-100 rounded-[2px] px-4 py-3 text-sm font-medium text-[#0F172A] outline-none focus:border-blue-600 transition-all resize-none"
                     placeholder="Deep product details..."
                   />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Retail Price</label>
                      <input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-[2px] px-4 py-2.5 text-sm font-bold" placeholder="0.00" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Wholesale</label>
                      <input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-[2px] px-4 py-2.5 text-sm font-bold" placeholder="0.00" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</label>
                      <input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-[2px] px-4 py-2.5 text-sm font-bold" placeholder="0" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SKU</label>
                      <input className="w-full bg-gray-50 border border-gray-100 rounded-[2px] px-4 py-2.5 text-sm font-bold" placeholder="AUTO" />
                   </div>
                </div>
              </div>
            )}

            {activeTab === "LOGISTICS" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-[2px] flex items-center gap-3">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <div>
                       <p className="text-[11px] font-bold text-blue-900 uppercase">Shipping Optimization</p>
                       <p className="text-[10px] text-blue-600">Accurate dimensions help calculate the best courier rates.</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Weight (kg)</label>
                       <input type="number" step="0.01" className="w-full bg-gray-50 border border-gray-100 rounded-[2px] px-4 py-3 text-lg font-black text-[#0F172A]" placeholder="0.5" />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Packaging Dimensions (cm)</label>
                       <div className="grid grid-cols-3 gap-2">
                          <input type="number" className="bg-gray-50 border border-gray-100 rounded-[2px] px-3 py-3 text-center text-sm font-bold" placeholder="L" />
                          <input type="number" className="bg-gray-50 border border-gray-100 rounded-[2px] px-3 py-3 text-center text-sm font-bold" placeholder="W" />
                          <input type="number" className="bg-gray-50 border border-gray-100 rounded-[2px] px-3 py-3 text-center text-sm font-bold" placeholder="H" />
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === "SEO" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <Facebook className="w-3.5 h-3.5 text-blue-600" /> Social Media Preview
                    </h3>
                    
                    {/* FB Preview Card */}
                    <div className="max-w-sm bg-white border border-gray-200 rounded-[2px] shadow-sm overflow-hidden">
                       <div className="w-full aspect-[1.91/1] bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                       </div>
                       <div className="p-3 bg-gray-50 border-t border-gray-100">
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">BUSINESSCONNECT.BD</p>
                          <p className="text-sm font-bold text-slate-900 mt-1 truncate">Product Title for Social Sharing</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">Short SEO friendly description will appear here...</p>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SEO Title Tag</label>
                       <input className="w-full bg-gray-50 border border-gray-100 rounded-[2px] px-4 py-2.5 text-sm font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SEO Meta Description</label>
                       <textarea className="w-full bg-gray-50 border border-gray-100 rounded-[2px] px-4 py-2.5 text-sm font-medium resize-none" rows={3} />
                    </div>
                 </div>
              </div>
            )}

            {activeTab === "VARIATIONS" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Variation Matrix</h3>
                    <button 
                      onClick={addVariationRow}
                      className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 px-2 py-1 transition-all"
                    >
                       <Plus className="w-3 h-3" /> Add Variation Type
                    </button>
                 </div>

                 <div className="bg-gray-50 border border-gray-100 rounded-[2px] overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                       <thead className="bg-white border-b border-gray-100">
                          <tr>
                             <th className="px-4 py-3 font-black text-gray-400 uppercase tracking-widest">Variation</th>
                             <th className="px-4 py-3 font-black text-gray-400 uppercase tracking-widest">Price</th>
                             <th className="px-4 py-3 font-black text-gray-400 uppercase tracking-widest">Stock</th>
                             <th className="px-4 py-3 font-black text-gray-400 uppercase tracking-widest">SKU</th>
                             <th className="px-4 py-3 font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {variations.length === 0 ? (
                            <tr>
                               <td colSpan={5} className="px-4 py-8 text-center text-gray-400 font-medium italic">
                                  No variations added yet. Click "Add Variation Type" to start.
                               </td>
                            </tr>
                          ) : variations.map((v) => (
                            <tr key={v.id} className="bg-white hover:bg-gray-50/50 transition-all">
                               <td className="px-4 py-3 font-bold text-[#0F172A]">
                                  <input 
                                    className="bg-transparent border-none outline-none focus:ring-0 w-full"
                                    value={v.name}
                                    onChange={(e) => {
                                      const newVars = [...variations];
                                      const idx = newVars.findIndex(varItem => varItem.id === v.id);
                                      newVars[idx].name = e.target.value;
                                      setVariations(newVars);
                                    }}
                                  />
                               </td>
                               <td className="px-4 py-3 font-black">
                                  <input 
                                    type="number"
                                    className="bg-transparent border-none outline-none focus:ring-0 w-20"
                                    placeholder="0.00"
                                    value={v.price}
                                    onChange={(e) => {
                                      const newVars = [...variations];
                                      const idx = newVars.findIndex(varItem => varItem.id === v.id);
                                      newVars[idx].price = e.target.value;
                                      setVariations(newVars);
                                    }}
                                  />
                               </td>
                               <td className="px-4 py-3 font-black text-green-600">
                                  <input 
                                    type="number"
                                    className="bg-transparent border-none outline-none focus:ring-0 w-16"
                                    placeholder="0"
                                    value={v.stock}
                                    onChange={(e) => {
                                      const newVars = [...variations];
                                      const idx = newVars.findIndex(varItem => varItem.id === v.id);
                                      newVars[idx].stock = e.target.value;
                                      setVariations(newVars);
                                    }}
                                  />
                               </td>
                               <td className="px-4 py-3 font-mono text-gray-400 uppercase">
                                  <input 
                                    className="bg-transparent border-none outline-none focus:ring-0 w-full"
                                    placeholder="AUTO"
                                    value={v.sku}
                                    onChange={(e) => {
                                      const newVars = [...variations];
                                      const idx = newVars.findIndex(varItem => varItem.id === v.id);
                                      newVars[idx].sku = e.target.value;
                                      setVariations(newVars);
                                    }}
                                  />
                               </td>
                               <td className="px-4 py-3 text-right">
                                  <button 
                                    onClick={() => removeVariation(v.id)}
                                    className="p-1.5 text-gray-300 hover:text-red-500 transition-all"
                                  >
                                     <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}
          </div>

          {/* Footer Stats Bar */}
          <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex items-center justify-between">
             <div className="flex gap-4">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Channel Sync</span>
                   <span className="text-[10px] font-bold text-green-600 uppercase">Live Ready</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">AI Status</span>
                   <span className="text-[10px] font-bold text-indigo-600 uppercase">Optimized</span>
                </div>
             </div>
             <div className="text-[10px] font-medium text-gray-400">
                Last saved: Just now
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
