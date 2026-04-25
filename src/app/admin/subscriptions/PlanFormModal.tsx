"use client";

import React, { useState, useTransition } from "react";
import { createOrUpdatePlanAction } from "./actions";
import { Loader2 } from "lucide-react";

export function PlanFormModal({ plan, onClose }: { plan?: any; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: plan?.id,
      name: formData.get("name") as string,
      monthlyPrice: parseFloat(formData.get("monthlyPrice") as string),
      maxProducts: parseInt(formData.get("maxProducts") as string),
      maxStaff: parseInt(formData.get("maxStaff") as string),
      badgeColor: formData.get("badgeColor") as string,
      features: JSON.parse(formData.get("featuresData") as string || "[]"),
      isActive: true,
    };

    startTransition(async () => {
      try {
        await createOrUpdatePlanAction(data);
        onClose();
        alert(`Plan ${plan ? "updated" : "created"} successfully!`);
      } catch (err) {
        alert("Failed to save plan.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative animate-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold mb-4">{plan ? "Edit Plan" : "Create New Plan"}</h2>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Plan Name</label>
            <input name="name" defaultValue={plan?.name} required className="w-full p-2 border rounded-lg text-sm" placeholder="e.g. Starter" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Monthly Price (BDT)</label>
              <input name="monthlyPrice" type="number" defaultValue={plan?.monthlyPrice || 0} required className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Badge Color (Tailwind)</label>
              <input name="badgeColor" defaultValue={plan?.badgeColor || "gray"} required className="w-full p-2 border rounded-lg text-sm" placeholder="blue, green, indigo..." />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Max Products</label>
              <input name="maxProducts" type="number" defaultValue={plan?.maxProducts || 100} required className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Max Staff</label>
              <input name="maxStaff" type="number" defaultValue={plan?.maxStaff || 2} required className="w-full p-2 border rounded-lg text-sm" />
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 mb-1">Features JSON Array</label>
             <textarea 
               name="featuresData" 
               defaultValue={plan?.featuresData || '["Basic Analytics", "Email Support"]'} 
               required 
               className="w-full p-2 border rounded-lg text-sm font-mono" 
               rows={3} 
             />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-bold bg-[#1E40AF] text-white rounded-lg flex items-center gap-2">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
