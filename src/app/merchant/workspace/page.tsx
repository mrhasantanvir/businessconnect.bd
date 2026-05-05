"use client";

import { useState } from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  Package, 
  PieChart, 
  Users, 
  Settings,
  X,
  Plus,
  Maximize2,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  title: string;
  type: "DASHBOARD" | "CRM" | "INVENTORY" | "FINANCE";
};

export default function EnterpriseWorkspace() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "dashboard", title: "Overview", type: "DASHBOARD" }
  ]);

  const addTab = (id: string, title: string, type: Tab["type"]) => {
    if (!tabs.find(t => t.id === id)) {
      setTabs([...tabs, { id, title, type }]);
    }
    setActiveTab(id);
  };

  const removeTab = (id: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTab === id) setActiveTab(newTabs[newTabs.length - 1].id);
  };

  return (
    <div className="flex h-screen bg-[#F1F5F9] font-inter overflow-hidden">
      {/* Mini Sidebar */}
      <div className="w-[60px] bg-[#0F172A] flex flex-col items-center py-6 space-y-8 border-r border-gray-800">
         <div className="w-8 h-8 bg-blue-600 rounded-[2px] flex items-center justify-center font-black text-white text-xs">BC</div>
         <div className="flex flex-col space-y-4">
            <button onClick={() => addTab("crm-leads", "Lead Pipeline", "CRM")} className="p-2 text-gray-400 hover:text-white transition-all"><Users className="w-5 h-5" /></button>
            <button onClick={() => addTab("inventory", "Inventory Matrix", "INVENTORY")} className="p-2 text-gray-400 hover:text-white transition-all"><Package className="w-5 h-5" /></button>
            <button onClick={() => addTab("finance", "P&L Statement", "FINANCE")} className="p-2 text-gray-400 hover:text-white transition-all"><PieChart className="w-5 h-5" /></button>
            <button onClick={() => addTab("reports", "BI Reports", "FINANCE")} className="p-2 text-gray-400 hover:text-white transition-all"><FileText className="w-5 h-5" /></button>
         </div>
         <div className="mt-auto">
            <Settings className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer" />
         </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab Bar */}
        <div className="h-10 bg-white border-b border-gray-200 flex items-center px-2 space-x-1">
           {tabs.map((tab) => (
             <div 
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                 "group flex items-center h-8 px-3 text-[11px] font-bold border-t-2 cursor-pointer transition-all uppercase tracking-wider",
                 activeTab === tab.id 
                  ? "bg-[#F8FAFC] border-blue-600 text-blue-600" 
                  : "bg-white border-transparent text-gray-400 hover:bg-gray-50"
               )}
             >
                <span className="mr-2">{tab.title}</span>
                <X 
                  onClick={(e) => { e.stopPropagation(); removeTab(tab.id); }}
                  className="w-3 h-3 opacity-0 group-hover:opacity-100 hover:text-red-500" 
                />
             </div>
           ))}
           <button className="p-1.5 text-gray-400 hover:text-blue-600 ml-2"><Plus className="w-3.5 h-3.5" /></button>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-auto p-4">
           {activeTab === "dashboard" && <WorkspaceDashboard />}
           {activeTab === "crm-leads" && <CRMPipeline />}
           {/* Other components will be injected here */}
        </div>
      </div>
    </div>
  );
}

function WorkspaceDashboard() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
             <h1 className="text-xl font-black text-[#0F172A] tracking-tight">Business Intelligence Command Center</h1>
             <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time Enterprise Overview</p>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-1 rounded-[2px] uppercase">Live Sync: ACTIVE</span>
             <Maximize2 className="w-4 h-4 text-gray-400 cursor-pointer" />
          </div>
       </div>

       {/* Top Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 border-2 border-transparent hover:border-blue-600 rounded-[2px] shadow-sm transition-all group">
             <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Profit</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
             </div>
             <div className="text-2xl font-black text-[#0F172A]">৳42,850.00</div>
             <div className="mt-2 flex items-center gap-1">
                <span className="text-[9px] font-bold text-green-600">+18.5%</span>
                <span className="text-[9px] font-bold text-gray-300">vs last period</span>
             </div>
          </div>
          <div className="bg-white p-4 border-2 border-transparent hover:border-amber-600 rounded-[2px] shadow-sm transition-all group">
             <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Health</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
             </div>
             <div className="text-2xl font-black text-[#0F172A]">82%</div>
             <div className="mt-2 flex items-center gap-1">
                <span className="text-[9px] font-bold text-amber-600">5 Products Low</span>
                <span className="text-[9px] font-bold text-gray-300">AI Forecast Active</span>
             </div>
          </div>
          <div className="bg-white p-4 border-2 border-transparent hover:border-indigo-600 rounded-[2px] shadow-sm transition-all group">
             <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CRM Pipeline</span>
                <ChevronRight className="w-4 h-4 text-indigo-500" />
             </div>
             <div className="text-2xl font-black text-[#0F172A]">14 Deals</div>
             <div className="mt-2 flex items-center gap-1">
                <span className="text-[9px] font-bold text-indigo-600">৳2.4M Potential</span>
                <span className="text-[9px] font-bold text-gray-300">Active Negotiations</span>
             </div>
          </div>
          <div className="bg-white p-4 border-2 border-transparent hover:border-purple-600 rounded-[2px] shadow-sm transition-all group">
             <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">VAT Liability</span>
                <FileText className="w-4 h-4 text-purple-500" />
             </div>
             <div className="text-2xl font-black text-[#0F172A]">৳8,420.00</div>
             <div className="mt-2 flex items-center gap-1">
                <span className="text-[9px] font-bold text-purple-600">April 2026</span>
                <span className="text-[9px] font-bold text-gray-300">Automated Calc</span>
             </div>
          </div>
       </div>

       {/* Detailed BI Section */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-[2px] shadow-sm p-4">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Stock Depletion Forecast (AI)</h3>
             <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-[2px]">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-white border border-gray-200 rounded-[2px] flex items-center justify-center text-[10px] font-black text-gray-400">IMG</div>
                         <div>
                            <p className="text-[11px] font-black text-[#0F172A]">Premium Leather Bag - SKU #{i}42</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">Stock: 14 pcs</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[11px] font-black text-red-600">~3 Days Left</p>
                         <p className="text-[9px] font-bold text-gray-400 uppercase">AI Prediction</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-[2px] shadow-sm p-4">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Customer Segments (RFM)</h3>
             <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-[2px]">
                   <p className="text-[18px] font-black text-blue-700">24</p>
                   <p className="text-[9px] font-black text-blue-500 uppercase">Champions</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-100 rounded-[2px]">
                   <p className="text-[18px] font-black text-green-700">142</p>
                   <p className="text-[9px] font-black text-green-500 uppercase">Loyal Customers</p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-[2px]">
                   <p className="text-[18px] font-black text-amber-700">12</p>
                   <p className="text-[9px] font-black text-amber-500 uppercase">At Risk</p>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-[2px]">
                   <p className="text-[18px] font-black text-gray-700">8</p>
                   <p className="text-[9px] font-black text-gray-500 uppercase">Hibernating</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function CRMPipeline() {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-[2px] h-full">
       <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-widest mb-6">Lead-to-Deal Pipeline</h2>
       <div className="grid grid-cols-4 gap-4 h-full">
          {["Prospecting", "Proposal", "Negotiation", "Won"].map((stage) => (
             <div key={stage} className="flex flex-col bg-gray-50 border border-gray-100 rounded-[2px] p-2 space-y-3">
                <div className="flex justify-between items-center px-1">
                   <span className="text-[10px] font-black text-gray-400 uppercase">{stage}</span>
                   <span className="text-[10px] font-bold text-gray-300">03</span>
                </div>
                {[1, 2].map((i) => (
                   <div key={i} className="bg-white p-3 border border-gray-100 rounded-[2px] shadow-sm cursor-pointer hover:border-blue-600 transition-all">
                      <p className="text-[11px] font-black text-[#0F172A]">Enterprise Order - Store #{i}</p>
                      <p className="text-[10px] font-bold text-blue-600 mt-1">৳125,000.00</p>
                      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                         <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[8px] font-bold text-gray-400">JD</div>
                         <span className="text-[8px] font-bold text-gray-300 uppercase">2 Days Ago</span>
                      </div>
                   </div>
                ))}
             </div>
          ))}
       </div>
    </div>
  );
}
