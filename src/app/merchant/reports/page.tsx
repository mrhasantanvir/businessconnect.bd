"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  BarChart3, 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Search, 
  TrendingUp, 
  Package, 
  Truck, 
  Calendar,
  Filter,
  RefreshCw,
  LayoutGrid,
  XCircle,
  ShieldCheck
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { getReportDataAction, ReportType } from "./actions";
import { subscribeToReportAction, getReportSubscriptionsAction, deleteSubscriptionAction } from "./subscriptionActions";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("SALES");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "ALL"
  });
  
  const [data, setData] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setFilters({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: "ALL"
    });
    setMounted(true);
  }, []);

  const [subForm, setSubForm] = useState({
    email: "",
    frequency: "WEEKLY",
  });

  const fetchReport = () => {
    startTransition(async () => {
      const res = await getReportDataAction({ type: reportType, ...filters });
      setData(res);
      const subs = await getReportSubscriptionsAction();
      setSubscriptions(subs);
    });
  };

  useEffect(() => {
    if (mounted) {
      fetchReport();
    }
  }, [reportType, mounted]);

  const exportToExcel = () => {
    if (!data?.tableData) return;
    const worksheet = XLSX.utils.json_to_sheet(data.tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportType);
    XLSX.writeFile(workbook, `Report_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
       const res = await subscribeToReportAction({
         reportType,
         email: subForm.email,
         frequency: subForm.frequency
       });
       if (res.success) {
          setSubForm({ email: "", frequency: "WEEKLY" });
          const subs = await getReportSubscriptionsAction();
          setSubscriptions(subs);
          alert("Automation Engine Primed: You will receive the report via email.");
       }
    });
  };

  const handleDeleteSub = async (id: string) => {
    startTransition(async () => {
       await deleteSubscriptionAction(id);
       const subs = await getReportSubscriptionsAction();
       setSubscriptions(subs);
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
         <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase flex items-center gap-4">
              <BarChart3 className="w-10 h-10 text-[#0F172A]" /> Advanced Intelligence
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-emerald-500" /> Enterprise-Grade Customizable Reports
            </p>
         </div>

         <div className="flex items-center gap-3">
            <button 
              onClick={exportToExcel}
              className="px-6 py-4 bg-white border border-gray-100 rounded-3xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
            >
               <Download className="w-4 h-4" /> Download Excel
            </button>
            <button 
              onClick={() => window.print()}
              className="px-6 py-4 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-3xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-xl"
            >
               <Printer className="w-4 h-4" /> Print PDF
            </button>
         </div>
      </div>

      {/* 2. Top Navigation Hub */}
      <div className="bg-white  border border-gray-100  p-2 rounded-[40px] flex items-center gap-2 max-w-2xl">
         {[
           { id: "SALES", label: "Financial Sales", icon: TrendingUp },
           { id: "INVENTORY", label: "Inventory Wealth", icon: Package },
           { id: "LOGISTICS", label: "Delivery Performance", icon: Truck }
         ].map((tab) => (
           <button
             key={tab.id}
             onClick={() => setReportType(tab.id as ReportType)}
             className={`flex-1 py-4 rounded-[32px] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
               reportType === tab.id 
                 ? "bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white shadow-xl" 
                 : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
             }`}
           >
             <tab.icon className="w-4 h-4" /> {tab.label}
           </button>
         ))}
      </div>

      {/* 3. Global Filter Console */}
      <div className="bg-white  border border-[#E5E7EB]  rounded-[48px] p-8 lg:p-10 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
         
         <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-2">Start Date</label>
            <div className="relative">
               <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input 
                 type="date"
                 value={filters.startDate}
                 onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                 className="w-full pl-12 pr-6 py-4 bg-gray-50  border border-transparent rounded-[24px] text-xs font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer"
               />
            </div>
         </div>

         <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-2">End Date</label>
            <div className="relative">
               <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input 
                 type="date"
                 value={filters.endDate}
                 onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                 className="w-full pl-12 pr-6 py-4 bg-gray-50  border border-transparent rounded-[24px] text-xs font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer"
               />
            </div>
         </div>

         <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-2">Status / Segment</label>
            <div className="relative">
               <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <select 
                 value={filters.status}
                 onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                 className="w-full pl-12 pr-6 py-4 bg-gray-50  border border-transparent rounded-[24px] text-xs font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all flex appearance-none"
               >
                  <option value="ALL">All Categories</option>
                  <option value="DELIVERED">Success / Delivered</option>
                  <option value="PENDING">Pending Orders</option>
                  <option value="CANCELLED">Returns / Denied</option>
               </select>
            </div>
         </div>

         <button 
           onClick={fetchReport}
           disabled={isPending}
           className="h-[58px] bg-[#1E40AF] text-white rounded-[24px] text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
         >
            {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Run Engine</>}
         </button>

      </div>

      {/* 4. Visualization Core */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Primary Visualization */}
           <div className="lg:col-span-2 bg-white  border border-[#E5E7EB]  rounded-[48px] p-10 shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-gray-100  pb-8">
                 <h3 className="text-xl font-bold uppercase tracking-tight">Performance Trend</h3>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full">
                    <TrendingUp className="w-3 h-3" /> Real-time Sync
                 </div>
              </div>
              
              <div className="h-[350px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    {reportType === "LOGISTICS" ? (
                      <BarChart data={data.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                        <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="successRate" fill="#1E40AF" radius={[8, 8, 0, 0]} barSize={40} />
                      </BarChart>
                    ) : (
                      <AreaChart data={data.chartData}>
                        <defs>
                          <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#1E40AF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                        <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="amount" stroke="#1E40AF" strokeWidth={4} fillOpacity={1} fill="url(#colorAmt)" />
                      </AreaChart>
                    )}
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Performance Snapshot */}
           <div className="bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-[48px] p-10 shadow-2xl space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-20 transform translate-x-1/2 -translate-y-1/2 bg-[#BEF264]/10 w-64 h-64 rounded-full blur-3xl" />
              
              <h3 className="text-xs font-bold uppercase text-[#BEF264] tracking-[0.2em] mb-4">Executive Snapshot</h3>
              
              <div className="space-y-12">
                 {reportType === "SALES" && (
                   <>
                     <Metric label="Total Revenue Generated" value={`৳${data.summary.totalRevenue.toLocaleString()}`} icon={TrendingUp} />
                     <Metric label="Transaction Volume" value={data.summary.orderCount} icon={LayoutGrid} />
                     <Metric label="Average Basket Value" value={`৳${data.summary.avgOrderValue.toFixed(0)}`} icon={RefreshCw} />
                   </>
                 )}
                 {reportType === "INVENTORY" && (
                   <>
                     <Metric label="Total Stock Value" value={`৳${data.summary.totalValue.toLocaleString()}`} icon={Package} />
                     <Metric label="Catalog Depth" value={data.summary.itemCount} icon={LayoutGrid} />
                     <Metric label="Critical Out of Stock" value={data.summary.outOfStock} icon={RefreshCw} color="text-red-400" />
                   </>
                 )}
                 {reportType === "LOGISTICS" && (
                   <>
                     <Metric label="Total Shipments Handled" value={data.summary.totalShipments} icon={Truck} />
                     <Metric label="Carrier Success Margin" value={`${data.summary.avgSuccessRate.toFixed(1)}%`} icon={LayoutGrid} />
                   </>
                 )}
              </div>

              <div className="pt-10 border-t border-white/10 mt-auto">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Global Market Intelligence Powered</p>
              </div>
           </div>
        </div>
      )}

      {/* 5. Enterprise Data Table */}
      {data && (
        <div className="bg-white  border border-[#E5E7EB]  rounded-[48px] overflow-hidden shadow-sm">
           <div className="p-10 border-b border-[#F1F5F9]  flex items-center justify-between bg-gray-50 ">
              <h3 className="text-sm font-bold flex items-center gap-3 uppercase tracking-widest">
                <LayoutGrid className="w-6 h-6 text-indigo-500" /> Consolidated Report Ledger
              </h3>
              <div className="flex items-center gap-3">
                 <div className="px-4 py-2 bg-white  border border-gray-100  rounded-xl text-[10px] font-bold uppercase tracking-widest">
                    Showing {data.tableData.length} records
                 </div>
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50  border-b border-gray-100 ">
                       {Object.keys(data.tableData[0] || {}).map((header, i) => (
                         <th key={i} className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                           {header}
                         </th>
                       ))}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 ">
                    {data.tableData.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50  transition-colors group">
                         {Object.values(row).map((val: any, j: number) => (
                           <td key={j} className="px-8 py-6 text-xs font-bold text-[#0F172A] ">
                             {typeof val === 'number' ? val.toLocaleString() : val}
                           </td>
                         ))}
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* 6. Automation & Scheduling Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-[#1E40AF] text-white rounded-[48px] p-10 shadow-2xl space-y-8">
            <div className="flex items-center gap-4 border-b border-white/20 pb-6">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-[#BEF264]" />
               </div>
               <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">Schedule Intelligence</h3>
                  <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest leading-none mt-1">Automated Multi-Tenant Delivery</p>
               </div>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <label className="text-[10px] font-bold uppercase text-blue-200 tracking-widest ml-1">Delivery Frequency</label>
                     <select 
                       value={subForm.frequency}
                       onChange={(e) => setSubForm(f => ({ ...f, frequency: e.target.value }))}
                       className="w-full h-14 px-6 bg-white/10 border border-white/10 rounded-2xl text-xs font-bold outline-none focus:bg-white/20 transition-all appearance-none"
                     >
                        <option value="DAILY">Daily Pulse</option>
                        <option value="WEEKLY">Weekly Insight</option>
                        <option value="MONTHLY">Monthly Overview</option>
                     </select>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-bold uppercase text-blue-200 tracking-widest ml-1">Current Intelligence</label>
                     <div className="h-14 px-6 bg-white/10 border border-white/10 rounded-2xl flex items-center text-xs font-bold uppercase text-[#BEF264]">
                        {reportType} REPORT
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase text-blue-200 tracking-widest ml-1">Target Email Address</label>
                  <input 
                    type="email"
                    required
                    value={subForm.email}
                    onChange={(e) => setSubForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="e.g. boss@businessconnect.bd"
                    className="w-full h-14 px-6 bg-white/10 border border-white/10 rounded-2xl text-xs font-bold outline-none focus:bg-white/20 transition-all placeholder:text-blue-100/30 font-bold"
                  />
               </div>

               <button 
                 disabled={isPending}
                 className="w-full py-5 bg-[#BEF264] text-black rounded-3xl font-bold text-[11px] uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-blue-900/40 transition-all flex items-center justify-center gap-2"
               >
                  {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Authorize Automation"}
               </button>
            </form>
         </div>

         <div className="bg-white  border border-[#E5E7EB]  rounded-[48px] p-10 shadow-sm space-y-8">
            <h3 className="text-sm font-bold flex items-center gap-3 uppercase tracking-widest">
               <ShieldCheck className="w-6 h-6 text-[#1E40AF]" /> Active Subscriptions
            </h3>
            
            <div className="space-y-4">
               {subscriptions.map((sub) => (
                 <div key={sub.id} className="flex items-center justify-between p-6 bg-gray-50  rounded-[32px] border border-transparent hover:border-blue-100 transition-all group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white  rounded-xl flex items-center justify-center text-[#1E40AF]">
                          <Calendar className="w-5 h-5" />
                       </div>
                       <div>
                          <div className="text-xs font-bold text-[#0F172A]  uppercase">{sub.reportType}</div>
                          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{sub.frequency} • {sub.email}</div>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteSub(sub.id)}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                       <XCircle className="w-5 h-5" />
                    </button>
                 </div>
               ))}
               {subscriptions.length === 0 && (
                 <div className="py-12 text-center space-y-2 opacity-30">
                    <LayoutGrid className="w-12 h-12 mx-auto" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No active automated reports</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon, color = "text-[#BEF264]" }: any) {
  return (
    <div className="space-y-3">
       <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
             <Icon className="w-4 h-4 text-white/50" />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{label}</span>
       </div>
       <div className={`text-2xl font-bold tracking-tight ${color}`}>{value}</div>
    </div>
  );
}

