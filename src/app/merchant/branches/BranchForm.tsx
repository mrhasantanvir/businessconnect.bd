"use client";

import React, { useState, useTransition } from "react";
import { Plus, Save, MapPin, Phone, User, Sparkles } from "lucide-react";
import { createOrUpdateBranchAction } from "./actions";

export function BranchForm({ staff }: { staff: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [managerId, setManagerId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createOrUpdateBranchAction({
          name,
          address,
          phone,
          managerId: managerId || undefined,
        });
        setName("");
        setAddress("");
        setPhone("");
        setManagerId("");
        alert("Branch created successfully!");
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Plus className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-[#0F172A]">New Branch Node</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Branch Name</label>
          <input 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            placeholder="e.g. Dhaka Main Branch"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Location Address</label>
          <div className="flex items-center gap-2 bg-gray-50 px-5 py-3.5 rounded-2xl">
            <MapPin className="w-4 h-4 text-slate-400" />
            <input 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-transparent border-none p-0 flex-1 font-bold text-[#0F172A] outline-none"
              placeholder="Full physical address..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Phone</label>
            <div className="flex items-center gap-2 bg-gray-50 px-5 py-3.5 rounded-2xl">
              <Phone className="w-4 h-4 text-slate-400" />
              <input 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-transparent border-none p-0 flex-1 font-bold text-[#0F172A] outline-none"
                placeholder="+880..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Branch Manager</label>
            <div className="flex items-center gap-2 bg-gray-50 px-5 py-3.5 rounded-2xl">
              <User className="w-4 h-4 text-slate-400" />
              <select 
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="bg-transparent border-none p-0 flex-1 font-bold text-[#0F172A] outline-none appearance-none cursor-pointer"
              >
                <option value="">Select Manager</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isPending}
          className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Save className="w-5 h-5" />}
          {isPending ? "Expanding Network..." : "Initialize Branch"}
        </button>
      </form>
    </div>
  );
}
