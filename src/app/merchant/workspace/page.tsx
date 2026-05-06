"use client";

import { useState } from "react";
import { 
  Briefcase, 
  Package, 
  PieChart, 
  Users, 
  TrendingUp,
  AlertTriangle,
  FileText,
  ChevronRight,
  ArrowUpRight,
  Calendar,
  Layers,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "OVERVIEW" | "CRM" | "INVENTORY" | "FINANCE";

export default function EnterpriseWorkspace() {
  const [activeTab, setActiveTab] = useState<Tab>("OVERVIEW");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header - Aligned with BusinessConnect Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-gray-200 rounded-none shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="w-5 h-5 bg-indigo-600 rounded-[2px] flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
             </div>
             <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none uppercase">Enterprise Command Center</h1>
          </div>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">Advanced Business Intelligence & Resource Planning</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">System Health</p>
              <p className="text-[11px] font-black text-green-600">OPTIMIZED</p>
           </div>
           <button className="px-4 py-2 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-none hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              May 2026 Reports
           </button>
        </div>
      </div>

      {/* Secondary Navigation - Integrated Tabs */}
      <div className="flex items-center border-b border-gray-200 bg-white px-6">
        {[
          { id: "OVERVIEW", label: "Executive Summary", icon: Layers },
          { id: "CRM", label: "CRM Intelligence", icon: Users },
          { id: "INVENTORY", label: "Inventory Matrix", icon: Package },
          { id: "FINANCE", label: "Financial Engine", icon: PieChart },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all",
              activeTab === t.id 
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/30" 
                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-gray-50"
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-2">
        {activeTab === "OVERVIEW" && <OverviewModule />}
        {activeTab === "CRM" && <CRMModule />}
        {activeTab === "INVENTORY" && <InventoryModule />}
        {activeTab === "FINANCE" && <FinanceModule />}
      </div>
    </div>
  );
}

function OverviewModule() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {/* High Density KPI Section */}
       <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <KPICard title="Net Revenue" value="৳842,500.00" trend="+12.4%" color="indigo" />
             <KPICard title="Operational Profit" value="৳124,800.00" trend="+8.2%" color="green" />
             <KPICard title="Active Leads" value="42" trend="+5 New" color="blue" />
             <KPICard title="VAT Liability" value="৳18,420.00" trend="Current Month" color="amber" />
          </div>

          {/* AI Insights Board */}
          <div className="bg-white border border-gray-200 rounded-none shadow-sm overflow-hidden">
             <div className="px-4 py-3 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Logistics Forecasting</span>
                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5">PREDICTIVE ENGINE ON</span>
             </div>
             <div className="p-4 space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-100 hover:border-indigo-200 transition-all cursor-pointer group">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-none flex items-center justify-center">
                           <Package className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                           <p className="text-[12px] font-bold text-slate-800">Ultra-Slim Laptop Pro Max</p>
                           <p className="text-[10px] text-slate-400 font-medium">SKU: USL-409 | Stock: 14 pcs</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[11px] font-black text-rose-600 uppercase">~4 Days Remaining</p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase">AI Depletion Forecast</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
       </div>

       {/* Side Alerts & Quick Stats */}
       <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-none text-white shadow-xl relative overflow-hidden">
             <Briefcase className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />
             <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Quick Actions</h3>
             <div className="space-y-3 relative z-10">
                <ActionButton label="Generate P&L Statement" />
                <ActionButton label="Transfer Stock (WMS)" />
                <ActionButton label="Review CRM Pipeline" />
             </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-none shadow-sm p-4">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">RFM Customer Segments</h3>
             <div className="space-y-3">
                <SegmentProgress label="Champions" count={24} color="bg-indigo-600" percentage={60} />
                <SegmentProgress label="Loyal Customers" count={142} color="bg-green-500" percentage={85} />
                <SegmentProgress label="At Risk" count={12} color="bg-amber-500" percentage={15} />
             </div>
          </div>
       </div>
    </div>
  );
}

function CRMModule() {
  return (
    <div className="bg-white border border-gray-200 p-8 text-center py-20">
       <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
       <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">CRM Intelligence Matrix</h2>
       <p className="text-xs text-slate-400 mt-2">Integrating Lead-to-Deal Pipeline and Call Logs...</p>
    </div>
  );
}

function InventoryModule() {
  return (
    <div className="bg-white border border-gray-200 p-8 text-center py-20">
       <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
       <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Inventory Forecasting Hub</h2>
       <p className="text-xs text-slate-400 mt-2">Multi-Warehouse stock transfer and AI depletion analytics...</p>
    </div>
  );
}

function FinanceModule() {
  return (
    <div className="bg-white border border-gray-200 p-8 text-center py-20">
       <PieChart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
       <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Enterprise Financial Engine</h2>
       <p className="text-xs text-slate-400 mt-2">Real-time P&L, VAT reports, and expense reconciliation...</p>
    </div>
  );
}

/* Helper Components */
function KPICard({ title, value, trend, color }: any) {
  return (
    <div className="bg-white p-5 border border-gray-100 hover:shadow-md transition-all">
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
       <div className="flex items-end justify-between">
          <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-[2px]", 
            color === 'green' ? "bg-green-50 text-green-600" : 
            color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
            color === 'amber' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
          )}>{trend}</span>
       </div>
    </div>
  );
}

function ActionButton({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-none transition-all group">
       <span className="text-[11px] font-bold text-slate-200">{label}</span>
       <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
    </button>
  );
}

function SegmentProgress({ label, count, color, percentage }: any) {
  return (
    <div className="space-y-1.5">
       <div className="flex justify-between text-[11px] font-bold">
          <span className="text-slate-600 uppercase tracking-tighter">{label}</span>
          <span className="text-slate-900">{count}</span>
       </div>
       <div className="h-1 bg-gray-100 rounded-none overflow-hidden">
          <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${percentage}%` }} />
       </div>
    </div>
  );
}
