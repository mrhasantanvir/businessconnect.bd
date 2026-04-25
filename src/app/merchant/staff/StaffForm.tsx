"use client";

import React, { useState, useTransition } from "react";
import { UserPlus, Save, Mail, Shield, Building2, Wallet, Sparkles } from "lucide-react";
import { recruitStaffAction } from "./actions";

export function StaffForm({ branches, roles }: { branches: any[], roles: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [jobRole, setJobRole] = useState("STAFF");
  const [wageType, setWageType] = useState("MONTHLY");
  const [branchId, setBranchId] = useState("");
  const [basePay, setBasePay] = useState("");
  const [customRoleId, setCustomRoleId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await recruitStaffAction({
           name,
           email,
           phone,
           branchId,
           wageType,
           baseSalary: parseFloat(basePay),
           customRoleId: customRoleId || null
        });
        
        setName("");
        setEmail("");
        setPhone("");
        setBasePay("");
        setCustomRoleId("");
        alert("Staff recruitment successful. They appear in the active personnel list below.");
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-2xl shadow-indigo-50/50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-16 bg-indigo-50/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-[#BEF264] shadow-xl shadow-slate-200">
            <UserPlus className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">New Recruitment</h3>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Authorize new personnel into the force.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Personnel Name</label>
            <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-transparent focus-within:border-indigo-100 transition-all">
               <Sparkles className="w-4 h-4 text-indigo-400" />
               <input 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent border-none p-0 flex-1 font-black text-slate-900 outline-none placeholder:text-slate-300"
                  placeholder="e.g. Commander Shepard"
               />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Identity Identifier (Email)</label>
            <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-transparent focus-within:border-indigo-100 transition-all">
              <Mail className="w-4 h-4 text-slate-300" />
              <input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none p-0 flex-1 font-black text-slate-900 outline-none placeholder:text-slate-300"
                placeholder="identity@fleet.bd"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Operational Contact (Phone)</label>
            <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-transparent focus-within:border-indigo-100 transition-all">
              <Shield className="w-4 h-4 text-slate-300" />
              <input 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-transparent border-none p-0 flex-1 font-black text-slate-900 outline-none placeholder:text-slate-300"
                placeholder="017xxxxxxxx"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Wage Model</label>
               <select 
                 value={wageType}
                 onChange={(e) => setWageType(e.target.value)}
                 className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 outline-none appearance-none"
               >
                 <option value="MONTHLY">Standard Monthly</option>
                 <option value="WEEKLY">Rapid Weekly</option>
                 <option value="HOURLY">Tactical Hourly</option>
               </select>
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Base Pay (৳)</label>
               <div className="flex items-center gap-2 bg-slate-50 px-6 py-4 rounded-2xl">
                 <input 
                   type="number"
                   value={basePay}
                   onChange={(e) => setBasePay(e.target.value)}
                   className="bg-transparent border-none p-0 flex-1 font-black text-slate-900 outline-none placeholder:text-slate-300"
                   placeholder="0.00"
                 />
               </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Operational Role</label>
                <select 
                  value={customRoleId}
                  onChange={(e) => setCustomRoleId(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 outline-none appearance-none"
                >
                  <option value="">Standard Recruit</option>
                  {roles?.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Assignment Node</label>
                <select 
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 outline-none appearance-none"
                >
                  <option value="">Global HQ</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
             </div>
          </div>

          <button 
            type="submit"
            disabled={isPending}
            className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isPending ? <Sparkles className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5 text-[#BEF264]" />}
            Authorize & Deploy Personnel
          </button>
        </form>
      </div>
    </div>
  );
}
