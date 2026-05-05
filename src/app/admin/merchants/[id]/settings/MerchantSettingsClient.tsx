"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Settings, 
  MessageSquare, 
  Phone, 
  Save, 
  RefreshCw, 
  KeyRound, 
  PlusCircle, 
  TrendingUp,
  ArrowLeft,
  User,
  Mail,
  Lock
} from "lucide-react";
import Link from "next/link";
import { updateMerchantCredentialsAction, addMerchantCreditsAction, updateMerchantUserAction } from "./actions";

export function MerchantSettingsClient({ merchant }: { merchant: any }) {
  const [loading, setLoading] = useState(false);
  const [topupLoading, setTopupLoading] = useState<string | null>(null);
  
  // Credentials State
  const [creds, setCreds] = useState({
    sipUsername: merchant.sipConfig?.username || "",
    sipPassword: merchant.sipConfig?.password || "",
    sipDomain: merchant.sipConfig?.domain || "",
    sipPort: merchant.sipConfig?.port?.toString() || "5060",
    smsRate: merchant.smsRate || 0.50,
    sipRate: merchant.sipRate || 1.00,
  });

  // Top-up State
  const [topup, setTopup] = useState({ type: "SMS", amount: 100 });

  const handleSaveCreds = async () => {
    setLoading(true);
    const res = await updateMerchantCredentialsAction(merchant.id, creds);
    if (res.success) alert("Credentials Updated!");
    else alert(`Error: ${res.error}`);
    setLoading(false);
  };

  const handleTopup = async () => {
    setTopupLoading(topup.type);
    const res = await addMerchantCreditsAction(merchant.id, topup.type as "SMS" | "SIP", topup.amount);
    if (res.success) {
      alert(`${topup.type} Balance Increased!`);
      // Update local state if needed or revalidate will handle it
    }
    setTopupLoading(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex items-center gap-6">
         <Link href="/admin/merchants" className="p-4 bg-white border border-slate-100 rounded-[24px] hover:bg-slate-50 transition-all shadow-sm">
            <ArrowLeft className="w-6 h-6 text-slate-900" />
         </Link>
         <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Manage <span className="text-blue-600">{merchant.name}</span></h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Resource & Credential Control Center</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         
         {/* Credentials Form */}
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-slate-100 rounded-[48px] p-10 space-y-10 shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                     <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-slate-900 uppercase">Core Credentials</h2>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configure platform-level connectivity</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">SIP Username</label>
                     <input 
                        value={creds.sipUsername}
                        onChange={e => setCreds({...creds, sipUsername: e.target.value})}
                        className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">SIP Password</label>
                     <input 
                        type="password"
                        value={creds.sipPassword}
                        onChange={e => setCreds({...creds, sipPassword: e.target.value})}
                        className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">SIP Domain</label>
                     <input 
                        value={creds.sipDomain}
                        onChange={e => setCreds({...creds, sipDomain: e.target.value})}
                        className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">SIP Port</label>
                     <input 
                        value={creds.sipPort}
                        onChange={e => setCreds({...creds, sipPort: e.target.value})}
                        className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">SMS Rate (Per SMS)</label>
                     <input 
                        type="number"
                        step="0.01"
                        value={creds.smsRate}
                        onChange={e => setCreds({...creds, smsRate: parseFloat(e.target.value)})}
                        className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">SIP Rate (Per Minute)</label>
                     <input 
                        type="number"
                        step="0.01"
                        value={creds.sipRate}
                        onChange={e => setCreds({...creds, sipRate: parseFloat(e.target.value)})}
                        className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                     />
                  </div>
               </div>

               <button 
                  onClick={handleSaveCreds}
                  disabled={loading}
                  className="w-full h-16 bg-blue-600 text-white rounded-[24px] font-bold text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
               >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Synchronize Credentials
               </button>
            </div>
         </div>

         {/* Credit Management Sidebar */}
         <div className="space-y-8">
            <div className="bg-white border border-slate-100 rounded-[48px] p-10 space-y-10 shadow-sm relative overflow-hidden">
               <TrendingUp className="absolute bottom-[-20px] right-[-20px] w-40 h-40 opacity-5 text-slate-300" />
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <PlusCircle className="w-6 h-6 text-blue-600" />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold uppercase text-slate-900">Sell Credits</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Top up merchant balance</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex gap-4">
                        {["SMS", "SIP"].map((t) => (
                           <button 
                              key={t}
                              onClick={() => setTopup({...topup, type: t})}
                              className={`flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                                 topup.type === t ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                              }`}
                           >
                              {t}
                           </button>
                        ))}
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Amount to Add</label>
                        <input 
                           type="number"
                           value={topup.amount}
                           onChange={e => setTopup({...topup, amount: parseInt(e.target.value) || 0})}
                           className="w-full h-14 px-6 bg-slate-50 text-slate-900 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                        />
                     </div>

                     <button 
                        onClick={handleTopup}
                        disabled={!!topupLoading}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                        {topupLoading === topup.type ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        Execute Top-up
                     </button>
                  </div>

                  <div className="pt-8 border-t border-slate-100 space-y-6">
                     <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SMS Balance</p>
                        <span className="text-xl font-bold text-slate-900">৳{merchant.smsBalance.toLocaleString("en-US")}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SIP Balance</p>
                        <span className="text-xl font-bold text-slate-900">{merchant.sipBalance.toLocaleString("en-US")}</span>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
         </div>

      </div>

      {/* Merchant Account Management Section (Super Admin Only) */}
      <div className="bg-white border border-slate-100 rounded-[48px] p-10 space-y-10 shadow-sm">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
               <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
               <h2 className="text-xl font-bold text-slate-900 uppercase">Merchant Account Management</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update owner credentials and login information</p>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-8">
            {merchant.users?.map((user: any) => (
               <MerchantUserEditCard key={user.id} user={user} />
            ))}
            {(!merchant.users || merchant.users.length === 0) && (
               <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold">
                  No merchant accounts found for this store.
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

function MerchantUserEditCard({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    password: ""
  });

  const handleUpdate = async () => {
    if (!formData.name || !formData.email) return alert("Name and Email are required");
    
    setLoading(true);
    const res = await updateMerchantUserAction(user.id, formData);
    if (res.success) {
      alert("Merchant account updated successfully!");
      setFormData(prev => ({ ...prev, password: "" }));
    } else {
      alert(`Error: ${res.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-8">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 font-bold">
                {user.name.substring(0,2).toUpperCase()}
             </div>
             <div>
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
             </div>
          </div>
          <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase">
             Merchant Owner
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
             <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-indigo-100 transition-all"
                />
             </div>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Login Email (User ID)</label>
             <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                   value={formData.email}
                   onChange={e => setFormData({...formData, email: e.target.value})}
                   className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-indigo-100 transition-all"
                />
             </div>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone</label>
             <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                   value={formData.phone}
                   onChange={e => setFormData({...formData, phone: e.target.value})}
                   className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-indigo-100 transition-all"
                />
             </div>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reset Password</label>
             <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                   type="password"
                   value={formData.password}
                   onChange={e => setFormData({...formData, password: e.target.value})}
                   placeholder="New password (optional)"
                   className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-indigo-100 transition-all"
                />
             </div>
          </div>
       </div>

       <button 
          onClick={handleUpdate}
          disabled={loading}
          className="px-8 h-12 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
       >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Update User Info
       </button>
    </div>
  );
}
