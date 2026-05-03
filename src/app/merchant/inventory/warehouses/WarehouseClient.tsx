"use client";

import React, { useState, useEffect } from "react";
import { 
  Warehouse, 
  MapPin, 
  Plus, 
  Settings2, 
  Package, 
  ArrowRightLeft, 
  ChevronRight, 
  Search,
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Truck,
  Database,
  Building2,
  Box,
  Layers,
  History,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from "lucide-react";
import { 
  getWarehousesAction, 
  createWarehouseAction, 
  updateWarehouseAction, 
  deleteWarehouseAction,
  updateStockAction,
  initializeWarehousesAction
} from "./actions";
import { toast } from "sonner";

export default function WarehouseClient() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'stocks' | 'transfers'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [adjustData, setAdjustData] = useState({
    quantity: 0,
    type: 'ADD' as 'ADD' | 'SET',
    reason: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    isDefault: false
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const data = await getWarehousesAction();
      setWarehouses(data);
    } catch (err) {
      toast.error("Failed to load warehouses");
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      setLoading(true);
      const res = await initializeWarehousesAction();
      toast.success(`Initialized 2 hubs and migrated ${res.productCount} products!`);
      fetchWarehouses();
    } catch (err) {
      toast.error("Initialization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        await updateWarehouseAction(editingWarehouse.id, formData);
        toast.success("Warehouse updated successfully");
      } else {
        await createWarehouseAction(formData);
        toast.success("Warehouse created successfully");
      }
      setIsModalOpen(false);
      setEditingWarehouse(null);
      setFormData({ name: "", location: "", isDefault: false });
      fetchWarehouses();
    } catch (err) {
      toast.error("Failed to save warehouse");
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStockAction(
        selectedStock.warehouseId, 
        selectedStock.productId, 
        adjustData.quantity, 
        adjustData.type
      );
      toast.success("Stock adjusted successfully");
      setIsAdjustModalOpen(false);
      setSelectedStock(null);
      fetchWarehouses();
    } catch (err) {
      toast.error("Failed to adjust stock");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this warehouse?")) return;
    try {
      await deleteWarehouseAction(id);
      toast.success("Warehouse deleted");
      fetchWarehouses();
    } catch (err) {
      toast.error("Failed to delete warehouse");
    }
  };

  const openEditModal = (w: any) => {
    setEditingWarehouse(w);
    setFormData({
      name: w.name,
      location: w.location || "",
      isDefault: w.isDefault
    });
    setIsModalOpen(true);
  };

  const openAdjustModal = (w: any, s: any) => {
    setSelectedStock({ ...s, warehouseId: w.id, warehouseName: w.name });
    setAdjustData({ quantity: 0, type: 'ADD', reason: "" });
    setIsAdjustModalOpen(true);
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-1000">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-500/40">
            <Warehouse className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight leading-none">
              Warehouse Hub
            </h1>
            <p className="text-slate-500 font-bold mt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Multi-location Inventory Orchestration
            </p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
             <div className="text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Hubs</div>
                <div className="text-sm font-bold text-slate-900">{warehouses.length}</div>
             </div>
          </div>
          <button 
            onClick={() => {
              setEditingWarehouse(null);
              setFormData({ name: "", location: "", isDefault: false });
              setIsModalOpen(true);
            }}
            className="group flex items-center gap-3 bg-[#0F172A] text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            Add New Warehouse
          </button>
        </div>
      </div>

      {/* Navigation & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-100 rounded-[24px] shadow-sm w-fit">
          {[
            { id: 'list', label: 'Warehouses', icon: Building2 },
            { id: 'stocks', label: 'Inventory', icon: Box },
            { id: 'transfers', label: 'Logistics', icon: Truck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'list' && (
           <div className="flex items-center gap-4">
              <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Sort by:</div>
              <select className="bg-white border border-slate-100 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest outline-none shadow-sm focus:ring-2 ring-blue-500/10">
                 <option>Recent First</option>
                 <option>Name A-Z</option>
                 <option>Capacity</option>
              </select>
           </div>
        )}
      </div>

      {/* Content Canvas */}
      <div className="min-h-[600px] relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <div className="relative w-20 h-20">
               <div className="absolute inset-0 border-4 border-blue-50 rounded-[24px]"></div>
               <div className="absolute inset-0 border-4 border-blue-600 rounded-[24px] border-t-transparent animate-spin"></div>
            </div>
            <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">Synchronizing Logistics Data</p>
          </div>
        ) : activeTab === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {warehouses.length === 0 ? (
              <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-200 rounded-[60px] flex flex-col items-center justify-center text-center group hover:border-blue-300 transition-all">
                <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 group-hover:scale-110 group-hover:bg-blue-50 group-hover:text-blue-200 transition-all duration-700">
                  <Warehouse size={64} />
                </div>
                <div className="mt-8 space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Warehouse Setup Required</h3>
                  <p className="text-slate-400 font-medium max-w-sm mx-auto">Your inventory management is currently inactive. Add your first warehouse to begin managing stock.</p>
                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="bg-[#0F172A] text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10"
                    >
                      Add Custom Warehouse
                    </button>
                    <button 
                      onClick={handleInitialize}
                      className="bg-blue-50 text-blue-600 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-all border border-blue-100 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Initialize with eCommerce Stocks
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              warehouses.map(w => (
                <div key={w.id} className="group relative bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-slate-50 rounded-full group-hover:bg-blue-50/50 transition-colors duration-500 -z-0"></div>

                  <div className="relative z-10 space-y-8">
                    <div className="flex items-start justify-between">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-500">
                        <Building2 className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex items-center gap-2">
                        {w.isDefault && (
                          <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-emerald-100">
                            Primary
                          </div>
                        )}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => openEditModal(w)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                             <Edit className="w-5 h-5" />
                           </button>
                           <button onClick={() => handleDelete(w.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                             <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-[#0F172A] tracking-tight group-hover:text-blue-600 transition-colors">{w.name}</h3>
                      <div className="flex items-center gap-2 text-slate-400 text-sm mt-3 font-bold">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        {w.location || "Global Coordinates Missing"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-50">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                           <Box className="w-3 h-3" /> SKUs Managed
                        </div>
                        <div className="text-xl font-black text-slate-900">{w.stocks?.length || 0}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                           <History className="w-3 h-3" /> Last Sync
                        </div>
                        <div className="text-xl font-black text-slate-900">Active</div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveTab('stocks')}
                      className="w-full py-5 bg-[#0F172A] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-blue-600 hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                      Audit Inventory <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'stocks' ? (
          <div className="bg-white border border-slate-100 rounded-[60px] shadow-2xl shadow-slate-200/20 overflow-hidden">
             <div className="p-10 border-b border-slate-50 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Global Stock Ledger</h2>
                   <p className="text-slate-400 text-sm font-bold mt-1 tracking-wide uppercase tracking-[0.1em] text-[10px]">Real-time synchronization across all established nodes</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative flex-1 min-w-[300px]">
                     <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                     <input 
                       type="text" 
                       placeholder="Filter by SKU, Name or Node..."
                       className="w-full pl-14 pr-8 py-5 bg-slate-50 border-none rounded-[24px] font-bold text-sm outline-none focus:ring-2 ring-blue-500/10 transition-all"
                     />
                  </div>
                  <button className="px-8 py-5 bg-white border border-slate-100 text-slate-600 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                     <Layers className="w-4 h-4" /> Export Data
                  </button>
                </div>
             </div>
             <div className="overflow-x-auto no-scrollbar pb-10">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-slate-50/50">
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Details</th>
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location Allocation</th>
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Volume</th>
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {warehouses.flatMap(w => w.stocks.map((s: any) => (
                         <tr key={`${w.id}-${s.productId}`} className="hover:bg-blue-50/20 transition-all group">
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-5 cursor-pointer" onClick={() => setSelectedStock({ ...s, warehouseId: w.id, warehouseName: w.name })}>
                                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-white group-hover:shadow-lg transition-all">
                                     <Box className="w-7 h-7 text-blue-600" />
                                  </div>
                                  <div>
                                     <div className="font-black text-slate-900 tracking-tight">{s.product.name}</div>
                                     <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">{s.product.sku}</div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                  <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                                  {w.name}
                               </div>
                            </td>
                            <td className="px-10 py-8">
                               <div className="text-lg font-black text-slate-900">
                                  {s.quantity} <span className="text-[10px] text-slate-400 uppercase tracking-widest ml-1">{s.product.unitType || 'Units'}</span>
                                </div>
                            </td>
                            <td className="px-10 py-8">
                               <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                  s.quantity > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                               }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${s.quantity > 10 ? 'bg-emerald-600' : 'bg-red-600 animate-pulse'}`}></div>
                                  {s.quantity > 10 ? 'Optimal' : 'Low Stock'}
                               </span>
                            </td>
                            <td className="px-10 py-8 text-right">
                               <button 
                                 onClick={() => openAdjustModal(w, s)}
                                 className="px-6 py-3 bg-white border border-slate-100 text-[#0F172A] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                               >
                                 Adjust
                               </button>
                            </td>
                         </tr>
                      )))}
                   </tbody>
                </table>
             </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-[60px] p-32 flex flex-col items-center justify-center text-center space-y-10 relative overflow-hidden">
             <div className="absolute inset-0 bg-blue-50/30 -z-10"></div>
             <div className="w-32 h-32 bg-blue-600 rounded-[40px] flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 animate-bounce duration-[3000ms]">
                <ArrowRightLeft size={64} />
             </div>
             <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Warehouse Logistics</h3>
                <p className="text-slate-400 font-bold max-w-md mx-auto uppercase tracking-[0.1em] text-xs">Track and manage stock movements between your established warehouses.</p>
             </div>
             <button className="bg-[#0F172A] text-white px-12 py-5 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all">
                Initialize Transfer Protocol
              </button>
          </div>
        )}
      </div>

      {/* Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsAdjustModalOpen(false)}></div>
           <div className="relative bg-white w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-12">
                 <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                       <h2 className="text-2xl font-black text-slate-900 tracking-tight">Adjust Inventory</h2>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedStock?.product.name}</p>
                    </div>
                    <button onClick={() => setIsAdjustModalOpen(false)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500">
                       <X className="w-5 h-5" />
                    </button>
                 </div>

                 <form onSubmit={handleAdjust} className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         type="button"
                         onClick={() => setAdjustData({...adjustData, type: 'ADD'})}
                         className={`p-6 rounded-[32px] font-black text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-3 transition-all border-2 ${
                           adjustData.type === 'ADD' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'
                         }`}
                       >
                          <ArrowUpRight className="w-6 h-6" /> 
                          <div className="text-center">
                             <div className="leading-none">Stock In / Out</div>
                             <div className={`text-[8px] font-bold mt-1 ${adjustData.type === 'ADD' ? 'text-blue-100' : 'text-slate-300'}`}>+/- Relative Change</div>
                          </div>
                       </button>
                       <button 
                         type="button"
                         onClick={() => setAdjustData({...adjustData, type: 'SET'})}
                         className={`p-6 rounded-[32px] font-black text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-3 transition-all border-2 ${
                           adjustData.type === 'SET' ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xl shadow-slate-900/20' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'
                         }`}
                       >
                          <Settings2 className="w-6 h-6" /> 
                          <div className="text-center">
                             <div className="leading-none">Stock Correction</div>
                             <div className={`text-[8px] font-bold mt-1 ${adjustData.type === 'SET' ? 'text-slate-400' : 'text-slate-300'}`}>Overwrite Quantity</div>
                          </div>
                       </button>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                          {adjustData.type === 'ADD' ? 'Quantity to Add/Remove' : 'New Absolute Quantity'}
                       </label>
                       <div className="relative">
                          <input 
                            type="number" 
                            required
                            value={adjustData.quantity}
                            onChange={e => setAdjustData({...adjustData, quantity: parseInt(e.target.value)})}
                            className="w-full px-8 py-5 bg-slate-50 border-none rounded-[24px] font-black text-2xl outline-none focus:ring-4 ring-blue-500/5 transition-all text-center"
                          />
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-slate-300 uppercase tracking-widest text-xs">
                             {selectedStock?.product.unitType || 'Units'}
                          </div>
                       </div>
                       {adjustData.type === 'ADD' ? (
                         <div className="text-center text-[10px] font-bold text-slate-400">
                           Current: {selectedStock?.quantity} {adjustData.quantity >= 0 ? '+' : '-'} {Math.abs(adjustData.quantity || 0)} → Result: <span className="text-blue-600">{selectedStock?.quantity + (adjustData.quantity || 0)}</span>
                         </div>
                       ) : (
                         <div className="text-center text-[10px] font-bold text-slate-400">
                           Current: {selectedStock?.quantity} → Overwrite with: <span className="text-blue-600">{adjustData.quantity || 0}</span>
                         </div>
                       )}
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-6 bg-[#0F172A] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/10 active:scale-95"
                    >
                       Apply Adjustment
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* Product Info Sidebar / Modal */}
      {selectedStock && !isAdjustModalOpen && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-end">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedStock(null)}></div>
           <div className="relative bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-500">
              <div className="p-12 space-y-12 pb-24">
                 <div className="flex items-center justify-between">
                    <button onClick={() => setSelectedStock(null)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                       <X className="w-6 h-6" />
                    </button>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Inventory Intelligence</div>
                 </div>

                 <div className="space-y-8">
                    <div className="w-32 h-32 bg-blue-50 rounded-[40px] flex items-center justify-center text-blue-600 shadow-inner">
                       {selectedStock.product.image ? (
                         <img src={selectedStock.product.image} className="w-full h-full object-cover rounded-[40px]" />
                       ) : (
                         <Box size={48} />
                       )}
                    </div>
                    <div>
                       <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{selectedStock.product.name}</h2>
                       <p className="text-blue-500 font-black text-xs uppercase tracking-widest mt-2">{selectedStock.product.sku}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-8 bg-slate-50 rounded-[32px] space-y-2">
                       <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available Stock</div>
                       <div className="text-3xl font-black text-slate-900">{selectedStock.quantity}</div>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[32px] space-y-2">
                       <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Price</div>
                       <div className="text-3xl font-black text-slate-900">৳{selectedStock.product.price}</div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                       <h3 className="text-lg font-black text-slate-900 tracking-tight">Logistics Details</h3>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Node</div>
                          <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                             <Warehouse className="w-4 h-4 text-blue-500" /> {selectedStock.warehouseName}
                          </div>
                       </div>
                       <div className="flex justify-between items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bin Allocation</div>
                          <div className="font-black text-slate-900 text-sm">{selectedStock.binLocation || "UNALLOCATED"}</div>
                       </div>
                       <div className="flex justify-between items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unit Specification</div>
                          <div className="font-black text-slate-900 text-sm">{selectedStock.product.unitType || "General Units"}</div>
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 flex gap-4">
                    <button 
                      onClick={() => openAdjustModal({ id: selectedStock.warehouseId, name: selectedStock.warehouseName }, selectedStock)}
                      className="flex-1 py-6 bg-[#0F172A] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                    >
                       Execute Adjustment
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Modal - Create/Edit Warehouse */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[60px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-20 duration-700">
            {/* Modal Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
            
            <div className="p-12 relative z-10">
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingWarehouse ? 'Modify Warehouse' : 'Add Warehouse'}</h2>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Warehouse Configuration</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                   <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-                   <div className="group space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 group-focus-within:text-blue-600 transition-colors">Warehouse Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Central Warehouse Dhaka"
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold text-sm outline-none focus:bg-white focus:border-blue-600/20 focus:ring-4 ring-blue-500/5 transition-all"
                    />
                  </div>
                  <div className="group space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 group-focus-within:text-blue-600 transition-colors">Address / Location</label>label>
                    <div className="relative">
                       <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                       <input 
                        type="text" 
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g. Sector 7, Uttara, Dhaka"
                        className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold text-sm outline-none focus:bg-white focus:border-blue-600/20 focus:ring-4 ring-blue-500/5 transition-all"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-6 p-8 bg-slate-50 rounded-[32px] cursor-pointer hover:bg-blue-50 transition-all group border-2 border-transparent hover:border-blue-100">
                    <div className="relative w-6 h-6 flex items-center justify-center">
                       <input 
                        type="checkbox" 
                        checked={formData.isDefault}
                        onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                        className="peer sr-only"
                      />
                      <div className="w-6 h-6 border-2 border-slate-300 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                      <CheckCircle2 className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-slate-900 tracking-tight">Primary Supply Chain Hub</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Automatic allocation for fulfillment orders</div>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 py-6 bg-[#0F172A] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/10 active:scale-95"
                  >
                    {editingWarehouse ? 'Execute Updates' : 'Confirm Establishment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
