"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Activity, 
  Clock, 
  Monitor, 
  Search, 
  Filter,
  ArrowUpRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WorkforceTracker() {
  const [activeStaffCount, setActiveStaffCount] = useState(0);
  
  // Placeholder data for design preview
  const staffMembers = [
    { id: 1, name: "Tanvir Hasan", role: "Sales Manager", status: "ACTIVE", score: 92, timeWorked: "04h 20m", lastActivity: "2 mins ago" },
    { id: 2, name: "Anika Rahman", role: "Support Lead", status: "IDLE", score: 45, timeWorked: "06h 15m", lastActivity: "12 mins ago" },
    { id: 3, name: "Mahmudul Haq", role: "Delivery Rider", status: "OFFLINE", score: 0, timeWorked: "00h 00m", lastActivity: "Yesterday" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-4 space-y-6 bg-[#F8FAFC] min-h-screen">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-gray-100 rounded-[2px] shadow-sm">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Staff</span>
              <Activity className="w-3.5 h-3.5 text-green-500" />
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#0F172A]">08</span>
              <span className="text-[10px] font-bold text-green-500">+12% vs last week</span>
           </div>
        </div>
        <div className="bg-white p-4 border border-gray-100 rounded-[2px] shadow-sm">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Productivity</span>
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#0F172A]">84%</span>
              <span className="text-[10px] font-bold text-blue-500">OPTIMAL</span>
           </div>
        </div>
        <div className="bg-white p-4 border border-gray-100 rounded-[2px] shadow-sm">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Late Arrivals</span>
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#0F172A]">02</span>
              <span className="text-[10px] font-bold text-amber-500">REVIEW REQUIRED</span>
           </div>
        </div>
        <div className="bg-white p-4 border border-gray-100 rounded-[2px] shadow-sm">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Leaves</span>
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#0F172A]">05</span>
              <span className="text-[10px] font-bold text-indigo-500">APPROVAL PENDING</span>
           </div>
        </div>
      </div>

      {/* Main Monitoring Wall */}
      <div className="bg-white border border-gray-100 rounded-[2px] shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">Live Activity Wall</h2>
            <div className="px-2 py-0.5 bg-green-50 text-green-600 rounded-[2px] text-[8px] font-black border border-green-100">REAL-TIME</div>
          </div>
          <div className="flex items-center gap-2">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                <input 
                   placeholder="Search staff..." 
                   className="bg-gray-50 border border-gray-100 rounded-[2px] pl-9 pr-4 py-2 text-[11px] font-bold outline-none focus:border-blue-600 w-64"
                />
             </div>
             <button className="p-2 border border-gray-100 rounded-[2px] hover:bg-gray-50"><Filter className="w-3.5 h-3.5 text-gray-400" /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
               <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff Member</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Score</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Daily Hours</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Sync</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {staffMembers.map((staff) => (
                 <tr key={staff.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#1E40AF] text-white flex items-center justify-center font-black text-[11px] rounded-[2px]">
                             {staff.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                             <p className="text-[12px] font-black text-[#0F172A]">{staff.name}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{staff.role}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={cn(
                          "px-2 py-0.5 rounded-[2px] text-[8px] font-black uppercase tracking-widest border",
                          staff.status === "ACTIVE" ? "bg-green-50 text-green-600 border-green-100" :
                          staff.status === "IDLE" ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-gray-50 text-gray-400 border-gray-100"
                       )}>
                          {staff.status}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col items-center">
                          <span className={cn(
                             "text-[12px] font-black",
                             staff.score > 80 ? "text-green-600" : staff.score > 50 ? "text-amber-600" : "text-red-600"
                          )}>{staff.score}%</span>
                          <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                             <div 
                                className={cn(
                                   "h-full transition-all",
                                   staff.score > 80 ? "bg-green-500" : staff.score > 50 ? "bg-amber-500" : "bg-red-500"
                                )} 
                                style={{ width: `${staff.score}%` }} 
                             />
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-[11px] font-bold text-gray-600">{staff.timeWorked}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[11px] font-bold text-gray-400 uppercase">{staff.lastActivity}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 hover:bg-[#1E40AF]/10 hover:text-[#1E40AF] transition-all rounded-[2px]">
                          <Monitor className="w-4 h-4" />
                       </button>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
