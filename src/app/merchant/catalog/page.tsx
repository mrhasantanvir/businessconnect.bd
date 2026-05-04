"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Plus, Search, Filter, MoreVertical, Edit2, Trash2, 
  Barcode, ShoppingBag, Package, ChevronRight, X, ExternalLink, MapPin,
  TrendingUp, AlertCircle, LayoutGrid, List as ListIcon,
  Layers, Truck, Globe, DollarSign, Scale, Check, Save
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getStoreProductsAction, deleteProductAction, createProductAction } from "@/app/products/actions";

export default function MerchantCatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getStoreProductsAction();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    startTransition(async () => {
      try {
        await deleteProductAction(id);
        setProducts(prev => prev.filter(p => p.id !== id));
        if (selectedProduct?.id === id) setIsDrawerOpen(false);
      } catch (err) {
        alert("Failed to delete product.");
      }
    });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    
    if (activeTab === "out_of_stock") return matchesSearch && p.stock <= 0;
    if (activeTab === "low_stock") return matchesSearch && p.stock > 0 && p.stock < 10;
    if (activeTab === "pos_ready") return matchesSearch && p.barcode;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-blue/20 border-t-primary-blue rounded-full animate-spin" />
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Synchronizing Unified Catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] flex overflow-hidden">
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                <ShoppingBag className="w-3 h-3" /> Catalog Management
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Unified <span className="text-primary-blue">Catalog</span>
              </h1>
              <p className="text-muted-foreground text-sm font-medium mt-1">
                Deep-dive into your products across all sales channels.
              </p>
            </div>

            <Link 
              href="/products/add" 
              className="flex items-center gap-2 px-6 py-3 bg-primary-blue text-white rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary-blue/20"
            >
              <Plus className="w-4 h-4" /> Add Product
            </Link>
          </div>

          {/* Scalable KPI Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { id: "all", label: "All Products", count: products.length, icon: Layers, color: "text-blue-500", bg: "bg-blue-500/10" },
              { id: "out_of_stock", label: "Out of Stock", count: products.filter(p => p.stock <= 0).length, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
              { id: "low_stock", label: "Low Stock", count: products.filter(p => p.stock < 10 && p.stock > 0).length, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
              { id: "pos_ready", label: "POS Enabled", count: products.filter(p => p.barcode).length, icon: Barcode, color: "text-green-500", bg: "bg-green-500/10" },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "p-5 rounded-[24px] border transition-all text-left group relative overflow-hidden",
                  activeTab === tab.id 
                    ? "bg-white border-primary-blue shadow-lg shadow-primary-blue/5" 
                    : "bg-white border-surface-border hover:border-primary-blue/30"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", tab.bg)}>
                  <tab.icon className={cn("w-5 h-5", tab.color)} />
                </div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{tab.label}</p>
                <h4 className="text-2xl font-bold text-foreground">{tab.count}</h4>
                {activeTab === tab.id && (
                  <div className="absolute right-4 bottom-4 w-2 h-2 rounded-full bg-primary-blue animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Unified Sync Hub (Futuristic) */}
          <div className="mb-10 p-1 bg-gradient-to-r from-primary-blue via-indigo-500 to-purple-500 rounded-[32px] shadow-xl shadow-primary-blue/10">
             <div className="bg-white rounded-[31px] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-2xl bg-primary-blue/10 flex items-center justify-center animate-pulse">
                      <Globe className="w-7 h-7 text-primary-blue" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-foreground leading-tight">Unified Sync Hub</h3>
                      <p className="text-xs text-muted-foreground font-medium">Connect external platforms to sync products, orders, and inventory automatically.</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 border border-surface-border rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-primary-blue/50 transition-all">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/WooCommerce_logo.svg" alt="Woo" className="w-4 h-4 grayscale group-hover:grayscale-0" />
                      WooCommerce
                   </button>
                   <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 border border-surface-border rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-indigo-500/50 transition-all">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Shopify_Logo.png" alt="Shopify" className="w-4 h-4 grayscale" />
                      Shopify
                   </button>
                   <div className="w-px h-8 bg-surface-border mx-2" />
                   <button className="px-6 py-2.5 bg-foreground text-background rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
                      Configure Sync
                   </button>
                </div>
             </div>
          </div>

          {/* Catalog Controls */}
          <div className="bg-white rounded-[32px] border border-surface-border shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Global search by SKU, Barcode, Name..."
                    className="w-full bg-gray-50 border border-surface-border rounded-2xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all"
                  />
              </div>
              <div className="flex items-center gap-3">
                  <button className="p-3 rounded-xl bg-gray-50 border border-surface-border text-muted-foreground hover:text-foreground transition-colors">
                    <Filter className="w-4 h-4" />
                  </button>
                  <div className="w-px h-8 bg-surface-border mx-2" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Showing {filteredProducts.length} items</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-surface-border">
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Product Details</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Inventory</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Channel Sync</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {filteredProducts.map((product) => (
                    <tr 
                      key={product.id} 
                      onClick={() => { setSelectedProduct(product); setIsDrawerOpen(true); }}
                      className={cn(
                        "group hover:bg-gray-50 transition-all cursor-pointer",
                        selectedProduct?.id === product.id ? "bg-primary-blue/5" : ""
                      )}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-surface-hover border border-surface-border overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <ShoppingBag className="w-6 h-6 text-muted-foreground/20" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-base tracking-tight leading-tight mb-1">{product.name}</p>
                            <div className="flex items-center gap-3">
                               <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">SKU: {product.sku || "N/A"}</span>
                               <span className="text-[10px] font-bold text-primary-blue uppercase tracking-widest">{product.category?.name || "Global"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="space-y-1">
                            <p className="font-bold text-foreground">৳{product.price.toLocaleString()}</p>
                            <div className="flex items-center gap-2">
                               <span className={cn(
                                 "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                 product.stock <= 0 ? "bg-red-500/10 border-red-500/20 text-red-600" : 
                                 product.stock < 10 ? "bg-amber-500/10 border-amber-500/20 text-amber-600" : "bg-green-500/10 border-green-500/20 text-green-600"
                               )}>
                                 {product.stock} {product.unitType}(s)
                               </span>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", product.barcode ? "bg-green-500" : "bg-gray-300")} title="POS Ready" />
                            <div className={cn("w-2 h-2 rounded-full", product.image ? "bg-blue-500" : "bg-gray-300")} title="Storefront Sync" />
                            <div className={cn("w-2 h-2 rounded-full", product.allowedDistricts ? "bg-indigo-500" : "bg-gray-300")} title="Logistics Routing" />
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2.5 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-surface-border">
                               <Edit2 className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                              className="p-2.5 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                            >
                               <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-surface-border flex items-center justify-between bg-gray-50/30">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Viewing {filteredProducts.length} of {products.length} products</p>
               <div className="flex items-center gap-3">
                  <button disabled className="px-5 py-2.5 rounded-xl border border-surface-border text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-white transition-all">Previous</button>
                  <button disabled className="px-5 py-2.5 rounded-xl border border-surface-border text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-white transition-all">Next</button>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Drawer: Product Detail & Edit */}
      {isDrawerOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
             
             {/* Drawer Header */}
             <div className="p-8 border-b border-surface-border flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-bold text-foreground tracking-tight">Product <span className="text-primary-blue">Deep-Dive</span></h3>
                   <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ref ID: {selectedProduct.id}</p>
                      {selectedProduct.externalSource && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded text-[9px] font-bold uppercase">
                           <Globe className="w-2.5 h-2.5" /> Synced from {selectedProduct.externalSource}
                        </span>
                      )}
                   </div>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center hover:rotate-90 transition-transform duration-300"
                >
                   <X className="w-5 h-5 text-muted-foreground" />
                </button>
             </div>

             {/* Drawer Content */}
             <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                
                {/* Visual Section */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                   <div className="w-full md:w-48 aspect-square rounded-[32px] bg-surface-hover border-2 border-surface-border overflow-hidden shadow-xl">
                      {selectedProduct.image ? (
                        <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <ShoppingBag className="w-10 h-10 text-muted-foreground/10" />
                        </div>
                      )}
                   </div>
                   <div className="flex-1 space-y-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unified Identity</label>
                         <h4 className="text-xl font-bold text-foreground leading-tight">{selectedProduct.name}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 rounded-2xl bg-gray-50 border border-surface-border">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Current Price</p>
                            <p className="text-lg font-bold text-foreground">৳{selectedProduct.price.toLocaleString()}</p>
                         </div>
                         <div className="p-4 rounded-2xl bg-gray-50 border border-surface-border">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">In Stock</p>
                            <p className="text-lg font-bold text-foreground">{selectedProduct.stock} Units</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* POS & Warehouse Data */}
                <div className="space-y-4">
                   <h5 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-tight">
                      <Barcode className="w-4 h-4 text-primary-blue" /> POS & Inventory Data
                   </h5>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global SKU</label>
                         <div className="p-3 bg-gray-50 rounded-xl border border-surface-border text-xs font-bold font-mono">{selectedProduct.sku || "NOT SET"}</div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">POS Barcode</label>
                         <div className="p-3 bg-gray-50 rounded-xl border border-surface-border text-xs font-bold font-mono">{selectedProduct.barcode || "NOT SET"}</div>
                      </div>
                   </div>
                </div>

                {/* Logistics Hub */}
                <div className="space-y-4">
                   <h5 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-tight">
                      <Truck className="w-4 h-4 text-indigo-500" /> Logistics Hub
                   </h5>
                   <div className="p-5 bg-indigo-50/50 rounded-[24px] border border-indigo-100 space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-indigo-900 uppercase tracking-tight">Preferred Courier</span>
                         <span className="px-3 py-1 bg-indigo-100 rounded-full text-[10px] font-bold text-indigo-700 uppercase">{selectedProduct.preferredCourier || "STANDARD"}</span>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-indigo-800/60 uppercase tracking-widest flex items-center gap-2">
                           <MapPin className="w-3 h-3" /> Geo-Fencing Zones
                         </label>
                         <p className="text-xs text-indigo-900/70 leading-relaxed font-medium">
                            {selectedProduct.allowedDistricts || "Global Bangladesh Delivery Enabled"}
                         </p>
                      </div>
                   </div>
                </div>

                {/* Storefront SEO */}
                <div className="space-y-4">
                   <h5 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-tight">
                      <Globe className="w-4 h-4 text-green-500" /> Storefront Performance
                   </h5>
                   <div className="space-y-3">
                      <div className="p-5 rounded-[24px] bg-white border border-surface-border shadow-sm group hover:border-green-500/30 transition-all">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Meta Title</span>
                            <span className="text-[9px] font-bold text-green-500">OPTIMIZED</span>
                         </div>
                         <p className="text-sm font-bold text-foreground">{selectedProduct.seoTitle || selectedProduct.name}</p>
                      </div>
                      <div className="p-5 rounded-[24px] bg-white border border-surface-border shadow-sm">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Meta Description</span>
                         <p className="text-xs text-muted-foreground leading-relaxed">
                            "{selectedProduct.seoDescription || "No custom SEO snippet provided. System is using auto-generated content."}"
                         </p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Drawer Footer Actions */}
             <div className="p-8 border-t border-surface-border flex items-center gap-4 bg-gray-50/50">
                <button 
                   onClick={() => { setIsDrawerOpen(false); /* Navigate to edit page or handle inline edit */ }}
                   className="flex-1 h-14 bg-foreground text-background rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                   <Edit2 className="w-4 h-4" /> Edit Master Entry
                </button>
                <button 
                   className="w-14 h-14 bg-white border border-surface-border rounded-2xl flex items-center justify-center hover:text-primary-blue transition-colors"
                   title="View on Storefront"
                >
                   <ExternalLink className="w-5 h-5" />
                </button>
             </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

