"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Check, X, Shield, Users, Box, Zap } from "lucide-react";
import { createOrUpdatePlanAction, deletePlanAction } from "./actions";

export function PlanManager({ plans }: { plans: any[] }) {
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [products, setProducts] = useState(100);
  const [staff, setStaff] = useState(2);
  const [color, setColor] = useState("blue");
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setName(plan.name);
    setPrice(plan.monthlyPrice);
    setProducts(plan.maxProducts);
    setStaff(plan.maxStaff);
    setColor(plan.badgeColor || "blue");
    setFeatures(JSON.parse(plan.featuresData || "[]"));
    setIsAdding(true);
  };

  const handleSave = async () => {
    await createOrUpdatePlanAction({
      id: editingPlan?.id,
      name,
      monthlyPrice: price,
      maxProducts: products,
      maxStaff: staff,
      badgeColor: color,
      features,
      isActive: true
    });
    reset();
  };

  const reset = () => {
    setEditingPlan(null);
    setIsAdding(false);
    setName("");
    setPrice(0);
    setProducts(100);
    setStaff(2);
    setFeatures([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-white text-slate-900 text-slate-900 border border-slate-100 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" /> Forge New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border rounded-[32px] p-8 shadow-sm relative group overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 opacity-5 rotate-12 translate-x-8 -translate-y-8`}>
               <Shield className="w-full h-full" />
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-${plan.badgeColor}-100 text-${plan.badgeColor}-700`}>
                  {plan.name}
                </span>
                <h2 className="text-3xl font-black text-[#0F172A] mt-2">৳{plan.monthlyPrice}<span className="text-sm text-gray-400 font-medium">/mo</span></h2>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(plan)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => deletePlanAction(plan.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                 <Box className="w-4 h-4 text-blue-500" /> {plan.maxProducts === -1 ? 'Unlimited' : plan.maxProducts} Products
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                 <Users className="w-4 h-4 text-emerald-500" /> {plan.maxStaff === -1 ? 'Unlimited' : plan.maxStaff} Staff
              </div>
            </div>

            <div className="space-y-2">
               {JSON.parse(plan.featuresData || "[]").map((f: string, i: number) => (
                 <div key={i} className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Check className="w-3 h-3 text-green-500" /> {f}
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Side Panel for Adding/Editing */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={reset}></div>
           <div className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-black text-[#0F172A] mb-8">
                {editingPlan ? "Amend Plan" : "Forge New SaaS Tier"}
              </h3>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none" placeholder="e.g. Growth" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing (BDT/mo)</label>
                    <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Products (-1 for inf)</label>
                    <input type="number" value={products} onChange={e => setProducts(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Staff</label>
                    <input type="number" value={staff} onChange={e => setStaff(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none" />
                 </div>
              </div>

              <div className="space-y-2 mb-8">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Features List</label>
                 <div className="flex gap-2 mb-3">
                    <input 
                      value={newFeature} 
                      onChange={e => setNewFeature(e.target.value)} 
                      onKeyPress={e => e.key === 'Enter' && (setFeatures([...features, newFeature]), setNewFeature(""))}
                      className="flex-1 px-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none" 
                      placeholder="Add feature..." 
                    />
                    <button onClick={() => { setFeatures([...features, newFeature]); setNewFeature(""); }} className="bg-blue-50 text-blue-600 px-4 rounded-xl font-bold"><Plus className="w-4 h-4" /></button>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {features.map((f, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                        {f} <X className="w-3 h-3 cursor-pointer" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))} />
                      </span>
                    ))}
                 </div>
              </div>

              <div className="flex gap-4">
                 <button onClick={reset} className="flex-1 py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors">Abort</button>
                 <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 text-white rounded-[20px] font-black shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">Commit Changes</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
