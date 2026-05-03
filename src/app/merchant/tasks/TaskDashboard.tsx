"use client";

import React, { useState, useMemo } from "react";
import { 
  LayoutGrid, 
  List, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Calendar,
  MessageSquare,
  FileIcon,
  ArrowRight,
  TrendingUp,
  Box,
  Layers,
  SearchIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import TaskDrawer from "@/components/merchant/tasks/TaskDrawer";
import { useRouter } from "next/navigation";

const COLUMNS = [
  "PENDING_CONFIRMATION",
  "ACTIVE",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
];

const COLUMN_NAMES: any = {
  "PENDING_CONFIRMATION": "Awaiting Handshake",
  "ACTIVE": "Operations Ready",
  "IN_PROGRESS": "In Execution",
  "COMPLETED": "Successful Delivery",
  "CANCELLED": "Operations Halted"
};

export default function TaskDashboard({ tasks, staff }: { tasks: any[], staff: any[] }) {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPriority = filterPriority === "ALL" || task.priority === filterPriority;
      
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, filterPriority]);

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] font-inter overflow-hidden">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 p-6">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                <Layers className="w-8 h-8 text-indigo-600" />
                TASK HUB CONTROL
              </h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Real-time operational synchronization & staff management
              </p>
            </div>
            <div className="flex items-center gap-3">
               <div className="bg-emerald-50 px-4 py-2 border border-emerald-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Efficiency: 92%</span>
               </div>
               <button className="px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all rounded-none flex items-center gap-2">
                 <Plus className="w-4 h-4" />
                 Initialize Operation
               </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative group">
               <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search by operation title or description..."
                 className="w-full bg-gray-50 border border-gray-100 rounded-none pl-11 pr-4 py-3 text-xs font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <div className="flex items-center gap-2">
               <select 
                 className="bg-gray-50 border border-gray-100 rounded-none px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-600"
                 value={filterPriority}
                 onChange={(e) => setFilterPriority(e.target.value)}
               >
                  <option value="ALL">All Priorities</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
               </select>
               <button className="p-3 bg-white border border-gray-100 rounded-none hover:bg-gray-50 text-gray-400 transition-all">
                  <Filter className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board - Scrollable Content */}
      <div className="flex-1 overflow-x-auto no-scrollbar p-6">
        <div className="flex gap-6 h-full min-w-max max-w-[1600px] mx-auto">
          {COLUMNS.map(col => {
            const columnTasks = filteredTasks.filter(t => t.status === col);
            return (
              <div key={col} className="w-[320px] flex flex-col h-full bg-gray-50/50 border border-gray-100 rounded-none overflow-hidden">
                {/* Column Header */}
                <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between sticky top-0 z-10">
                   <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-none",
                        col === 'COMPLETED' ? 'bg-emerald-500' : col === 'CANCELLED' ? 'bg-red-500' : 'bg-indigo-500'
                      )} />
                      <h3 className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest">{COLUMN_NAMES[col]}</h3>
                   </div>
                   <span className="bg-gray-100 text-[10px] font-black px-2 py-0.5 rounded-none text-gray-500">{columnTasks.length}</span>
                </div>

                {/* Column Tasks - Independent Scroll */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                   {columnTasks.map(task => (
                      <div 
                        key={task.id} 
                        onClick={() => setSelectedTask(task)}
                        className="bg-white border border-gray-100 p-5 rounded-none shadow-sm hover:shadow-md transition-all group cursor-pointer border-l-4" 
                        style={{ borderLeftColor: task.priority === 'URGENT' ? '#ef4444' : task.priority === 'HIGH' ? '#f97316' : '#6366f1' }}
                      >
                         <div className="flex items-center justify-between mb-3">
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-[0.15em]",
                              task.priority === 'URGENT' ? 'text-red-600' : 'text-indigo-600'
                            )}>{task.priority}</span>
                            {task.attachments && <FileIcon className="w-3 h-3 text-gray-300" />}
                         </div>
                         <h4 className="text-sm font-black text-[#0F172A] group-hover:text-indigo-600 transition-colors mb-2 leading-snug">{task.title}</h4>
                         
                         {/* Card Meta Info */}
                         <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-3">
                               <div className="flex items-center gap-1 text-[9px] font-black text-indigo-500">
                                  <MessageSquare className="w-2.5 h-2.5" />
                                  {task.messages?.length || 0}
                               </div>
                               {task.assignee && (
                                  <div className="flex items-center gap-1.5">
                                     <div className="w-4 h-4 bg-slate-100 border border-gray-200 rounded-none flex items-center justify-center text-[7px] font-black uppercase">
                                        {task.assignee.name?.[0] || "?"}
                                     </div>
                                  </div>
                               )}
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-tight">
                               <Clock className="w-3 h-3" />
                               {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'ASAP'}
                            </div>
                         </div>
                      </div>
                   ))}
                   
                   {columnTasks.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-10">
                         <Box className="w-8 h-8 mb-2" />
                         <p className="text-[9px] font-black uppercase">No Operations</p>
                      </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Drawer */}
      {selectedTask && (
        <TaskDrawer 
          task={selectedTask} 
          staff={staff}
          onClose={() => setSelectedTask(null)} 
          onUpdate={() => {
            router.refresh();
          }} 
        />
      )}

    </div>
  );
}
