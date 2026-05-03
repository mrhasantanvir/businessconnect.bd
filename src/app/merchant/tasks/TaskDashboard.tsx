"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  MessageSquare, 
  FileIcon, 
  Layers, 
  SearchIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Activity,
  User,
  ArrowUpRight,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import TaskDrawer from "@/components/merchant/tasks/TaskDrawer";
import CreateTaskModal from "@/components/merchant/tasks/CreateTaskModal";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 15;

const STATUS_COLORS: any = {
  "PENDING_CONFIRMATION": "bg-amber-100 text-amber-700 border-amber-200",
  "ACTIVE": "bg-blue-100 text-blue-700 border-blue-200",
  "IN_PROGRESS": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "COMPLETED": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "CANCELLED": "bg-red-100 text-red-700 border-red-200"
};

const STATUS_NAMES: any = {
  "PENDING_CONFIRMATION": "Awaiting Response",
  "ACTIVE": "Active Operation",
  "IN_PROGRESS": "In Execution",
  "COMPLETED": "Completed",
  "CANCELLED": "Cancelled"
};

const STATUS_PROGRESS: any = {
  "PENDING_CONFIRMATION": 15,
  "ACTIVE": 35,
  "IN_PROGRESS": 65,
  "COMPLETED": 100,
  "CANCELLED": 0
};

export default function TaskDashboard({ tasks = [], staff = [] }: { tasks: any[], staff: any[] }) {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === "ALL" || task.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchQuery, filterStatus]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTasks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTasks, currentPage]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-inter">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                <Layers className="w-8 h-8 text-indigo-600" />
                TASK REPOSITORY
              </h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Unified task list & staff productivity logs
              </p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all rounded-none flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Operation
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
               <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Filter operations by title, ID or assignee..."
                 className="w-full bg-gray-50 border border-gray-100 rounded-none pl-11 pr-4 py-3.5 text-xs font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all"
                 value={searchQuery}
                 onChange={(e) => {
                   setSearchQuery(e.target.value);
                   setCurrentPage(1);
                 }}
               />
            </div>
            <select 
              className="bg-gray-50 border border-gray-100 rounded-none px-4 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-600"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
               <option value="ALL">All Statuses</option>
               {Object.keys(STATUS_NAMES).map(status => (
                  <option key={status} value={status}>{STATUS_NAMES[status]}</option>
               ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table View */}
      <div className="flex-1 w-full p-8">
         <div className="max-w-[1600px] mx-auto bg-white border border-gray-100 shadow-sm overflow-hidden rounded-none">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Operation Detail</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assignee</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Execution Progress</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Activity Status</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {paginatedTasks.map((task) => (
                     <tr 
                       key={task.id} 
                       onClick={() => setSelectedTask(task)}
                       className="group hover:bg-indigo-50/30 transition-all cursor-pointer"
                     >
                        <td className="px-6 py-6">
                           <div className="flex flex-col gap-1.5">
                              <span className="text-sm font-black text-[#0F172A] group-hover:text-indigo-600 transition-colors leading-none tracking-tight">{task.title}</span>
                              <div className="flex items-center gap-2">
                                 <span className={cn(
                                   "px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter border rounded-none inline-block",
                                   task.priority === 'URGENT' ? 'bg-red-50 text-red-600 border-red-100' : 
                                   task.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                 )}>{task.priority}</span>
                                 <span className="text-[9px] font-bold text-gray-300 uppercase">#{task.id.toString().slice(-6)}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                           {task.assignee ? (
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-none flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase">
                                    {task.assignee.name?.[0]}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-[#0F172A]">{task.assignee.name}</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{task.assignee.staffProfile?.jobRole || 'Staff'}</span>
                                 </div>
                              </div>
                           ) : (
                              <span className="text-[10px] font-black text-gray-300 italic uppercase">Unassigned</span>
                           )}
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex flex-col gap-2 max-w-[140px] mx-auto">
                              <div className="flex justify-between items-center text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                 <span>Completion</span>
                                 <span className="text-indigo-600">{STATUS_PROGRESS[task.status]}%</span>
                              </div>
                              <div className="h-1 w-full bg-gray-100 rounded-none overflow-hidden border border-gray-50">
                                 <div 
                                   className={cn(
                                     "h-full transition-all duration-1000 ease-out",
                                     task.status === 'COMPLETED' ? 'bg-emerald-500' : 
                                     task.status === 'CANCELLED' ? 'bg-red-400' : 'bg-indigo-600'
                                   )}
                                   style={{ width: `${STATUS_PROGRESS[task.status]}%` }}
                                 />
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                           <span className={cn(
                             "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border rounded-none inline-block shadow-sm",
                             STATUS_COLORS[task.status]
                           )}>
                              {STATUS_NAMES[task.status]}
                           </span>
                        </td>
                        <td className="px-6 py-6 text-right">
                           <div className="flex flex-col items-end gap-1.5">
                              <div className="flex items-center gap-3">
                                 <div className="flex items-center gap-1 text-[10px] font-black text-indigo-500">
                                    <MessageSquare className="w-3 h-3" />
                                    {task.messages?.length || 0}
                                 </div>
                                 {task.attachments && <FileIcon className="w-3 h-3 text-gray-300" />}
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase">
                                 <Clock className="w-3 h-3" />
                                 Due {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'ASAP'}
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6 text-right">
                           <button className="p-2 text-gray-300 hover:text-indigo-600 transition-colors">
                              <ArrowUpRight className="w-4 h-4" />
                           </button>
                        </td>
                     </tr>
                  ))}
                  {paginatedTasks.length === 0 && (
                     <tr>
                        <td colSpan={6} className="px-6 py-24 text-center">
                           <div className="flex flex-col items-center opacity-20">
                              <BarChart3 className="w-12 h-12 mb-3" />
                              <p className="text-[12px] font-black uppercase tracking-[0.2em]">No task data detected</p>
                           </div>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>

            {/* Pagination Navigation */}
            {totalPages > 1 && (
               <div className="bg-white border-t border-gray-100 p-8 flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                     Showing {Math.min(filteredTasks.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} - {Math.min(filteredTasks.length, currentPage * ITEMS_PER_PAGE)} of {filteredTasks.length} Operations
                  </p>
                  <div className="flex items-center gap-2">
                     <button 
                       disabled={currentPage === 1}
                       onClick={() => setCurrentPage(p => p - 1)}
                       className="p-3 border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-none"
                     >
                        <ChevronLeft className="w-4 h-4" />
                     </button>
                     <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                           <button 
                             key={i}
                             onClick={() => setCurrentPage(i + 1)}
                             className={cn(
                               "w-10 h-10 text-[10px] font-black transition-all border rounded-none",
                               currentPage === i + 1 ? "bg-[#0F172A] border-[#0F172A] text-white shadow-lg" : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"
                             )}
                           >
                              {i + 1}
                           </button>
                        ))}
                     </div>
                     <button 
                       disabled={currentPage === totalPages}
                       onClick={() => setCurrentPage(p => p + 1)}
                       className="p-3 border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-none"
                     >
                        <ChevronRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            )}
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

      {showCreateModal && (
        <CreateTaskModal 
          staff={staff} 
          onClose={() => setShowCreateModal(false)} 
          onCreated={() => {
            router.refresh();
          }} 
        />
      )}

    </div>
  );
}
