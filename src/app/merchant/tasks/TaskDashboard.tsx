"use client";

import React, { useState, useTransition } from "react";
import { 
  Plus, 
  Search, 
  Table as TableIcon, 
  Layout as KanbanIcon, 
  Sparkles,
  Filter,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { suggestTaskAction, createTaskAction } from "./taskActions";
import { toast } from "sonner";
import TaskDrawer from "@/components/merchant/tasks/TaskDrawer";

export default function TaskDashboardClient({ tasks, staff, merchantStoreId }: { tasks: any[], staff: any[], merchantStoreId: string }) {
  const [view, setView] = useState<"table" | "kanban">("table");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [suggestedTask, setSuggestedTask] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  async function handleAiSuggest() {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    try {
      const suggestion = await suggestTaskAction(aiInput);
      setSuggestedTask(suggestion);
    } catch (error) {
      toast.error("AI failed to parse the task. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  }

  async function handleCreateTask(taskData: any) {
    startTransition(async () => {
      try {
        await createTaskAction(taskData);
        toast.success("Task created and handshake sent!");
        setSuggestedTask(null);
        setAiInput("");
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  }

  return (
    <div className="max-w-full mx-auto space-y-6 font-inter animate-in fade-in duration-500 pb-10">
      
      {/* Header & AI Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tighter italic">TASK <span className="text-indigo-600">HUB</span></h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Virtual Operations Manager Activated</p>
        </div>

        <div className="flex-1 max-w-xl relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Sparkles className="w-4 h-4 text-indigo-500 group-focus-within:animate-pulse" />
          </div>
          <input 
            type="text" 
            placeholder="Describe a task in plain text (e.g. 'Check mango delivery for order #123')..."
            className="w-full bg-white border border-gray-100 rounded-[2px] pl-11 pr-32 py-4 text-sm font-medium focus:ring-0 focus:border-indigo-600 transition-all shadow-sm"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSuggest()}
          />
          <button 
            onClick={handleAiSuggest}
            disabled={isAiLoading || !aiInput}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white rounded-[2px] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Auto-Generate"}
          </button>
        </div>
      </div>

      {/* AI Suggestion Card */}
      {suggestedTask && (
        <div className="bg-indigo-50 border-2 border-indigo-600 p-6 rounded-[2px] animate-in slide-in-from-top-4 duration-500 shadow-xl">
           <div className="flex items-center gap-2 mb-4">
             <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3" />
             </div>
             <h3 className="text-xs font-black uppercase tracking-widest text-indigo-700">AI Proposed Task Structure</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <div>
                    <label className="text-[9px] font-bold text-indigo-400 uppercase">Title</label>
                    <input 
                      className="w-full bg-white border-none rounded-[2px] p-2 text-sm font-black text-[#0F172A]" 
                      value={suggestedTask.title} 
                      onChange={(e) => setSuggestedTask({...suggestedTask, title: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="text-[9px] font-bold text-indigo-400 uppercase">Description</label>
                    <textarea 
                      className="w-full bg-white border-none rounded-[2px] p-2 text-xs font-medium text-gray-600 min-h-[80px]" 
                      value={suggestedTask.description} 
                      onChange={(e) => setSuggestedTask({...suggestedTask, description: e.target.value})}
                    />
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex gap-4">
                    <div className="flex-1">
                       <label className="text-[9px] font-bold text-indigo-400 uppercase">Priority</label>
                       <select 
                         className="w-full bg-white border-none rounded-[2px] p-2 text-xs font-black uppercase"
                         value={suggestedTask.priority}
                         onChange={(e) => setSuggestedTask({...suggestedTask, priority: e.target.value})}
                       >
                          <option>LOW</option>
                          <option>MEDIUM</option>
                          <option>HIGH</option>
                          <option>URGENT</option>
                       </select>
                    </div>
                    <div className="flex-1">
                       <label className="text-[9px] font-bold text-indigo-400 uppercase">Deadline</label>
                       <input 
                         type="date"
                         className="w-full bg-white border-none rounded-[2px] p-2 text-xs font-bold"
                         value={suggestedTask.deadline?.split('T')[0] || ""}
                         onChange={(e) => setSuggestedTask({...suggestedTask, deadline: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <div className="flex-1">
                       <label className="text-[9px] font-bold text-indigo-400 uppercase">Assign To</label>
                       <select 
                         className="w-full bg-white border-none rounded-[2px] p-2 text-xs font-bold"
                         onChange={(e) => setSuggestedTask({...suggestedTask, assigneeId: e.target.value})}
                       >
                          <option value="">Select Staff</option>
                          {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.staffProfile?.jobRole || 'No Role'})</option>)}
                       </select>
                    </div>
                    {suggestedTask.orderId && (
                       <div className="flex-1">
                          <label className="text-[9px] font-bold text-emerald-500 uppercase">Linked Order</label>
                          <div className="p-2 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-[2px]">
                             #{suggestedTask.orderId.slice(-6)} Connected
                          </div>
                       </div>
                    )}
                 </div>

                 <div className="flex items-center gap-2 pt-4">
                    <button 
                      onClick={() => handleCreateTask(suggestedTask)}
                      disabled={isPending}
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-[2px] text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                       {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Finalize & Send Handshake</>}
                    </button>
                    <button 
                      onClick={() => setSuggestedTask(null)}
                      className="px-6 py-3 bg-white text-gray-400 rounded-[2px] text-[11px] font-black uppercase tracking-widest hover:text-red-500 transition-all"
                    >
                       Discard
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between py-4 border-y border-gray-100">
         <div className="flex items-center gap-4">
            <div className="flex bg-white border border-gray-100 p-1 rounded-[2px]">
               <button 
                 onClick={() => setView("table")}
                 className={cn("p-1.5 rounded-[1px] transition-all", view === 'table' ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-indigo-600")}
               >
                 <TableIcon className="w-4 h-4" />
               </button>
               <button 
                 onClick={() => setView("kanban")}
                 className={cn("p-1.5 rounded-[1px] transition-all", view === 'kanban' ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-indigo-600")}
               >
                 <KanbanIcon className="w-4 h-4" />
               </button>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-1">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Filters:</span>
               <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black px-1.5 py-0.5 rounded-[1px] uppercase">All Tasks</span>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search tasks..." 
                 className="bg-white border border-gray-100 rounded-[2px] pl-9 pr-4 py-2 text-xs font-medium focus:border-indigo-600 transition-all w-48"
               />
            </div>
            <button className="p-2 border border-gray-100 rounded-[2px] text-gray-400 hover:text-indigo-600 transition-all">
               <Filter className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* View Rendering */}
      {view === "table" ? (
        <div className="bg-white border border-gray-100 rounded-[2px] overflow-hidden shadow-sm">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Task Title</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assignee</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Deadline</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {tasks.map(task => (
                    <tr 
                      key={task.id} 
                      onClick={() => setSelectedTask(task)}
                      className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                    >
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className={cn(
                               "w-1.5 h-6 rounded-full",
                               task.priority === 'URGENT' ? 'bg-red-500' : 
                               task.priority === 'HIGH' ? 'bg-orange-500' :
                               task.priority === 'MEDIUM' ? 'bg-indigo-500' : 'bg-gray-300'
                             )} />
                             <div>
                                <p className="text-sm font-black text-[#0F172A] group-hover:text-indigo-600 transition-colors">{task.title}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase truncate max-w-[200px]">{task.description}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          {task.assignee ? (
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-black">
                                  {task.assignee.name?.[0]}
                               </div>
                               <span className="text-[11px] font-bold text-gray-600">{task.assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-gray-300 uppercase">Unassigned</span>
                          )}
                       </td>
                       <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-[2px]",
                            task.status === 'PENDING_CONFIRMATION' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            task.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            'bg-gray-50 text-gray-600 border border-gray-100'
                          )}>
                             {task.status.replace(/_/g, ' ')}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <span className={cn(
                            "text-[10px] font-black italic",
                            task.priority === 'URGENT' ? 'text-red-600' : 
                            task.priority === 'HIGH' ? 'text-orange-600' :
                            task.priority === 'MEDIUM' ? 'text-indigo-600' : 'text-gray-400'
                          )}>
                             {task.priority}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                             <span className="text-[11px] font-black text-[#0F172A]">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No Date'}</span>
                             <span className="text-[8px] font-bold text-gray-400 uppercase">Due Soon</span>
                          </div>
                       </td>
                    </tr>
                 ))}
                 {tasks.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="max-w-xs mx-auto">
                           <KanbanIcon className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                           <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No Active Tasks Found</p>
                           <p className="text-[10px] text-gray-400 font-medium mt-1 leading-relaxed">Describe a task above to let the AI Ops Manager organize your operations.</p>
                        </div>
                     </td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {["PENDING_CONFIRMATION", "ACTIVE", "IN_PROGRESS", "COMPLETED"].map(col => (
              <div key={col} className="space-y-4">
                 <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full",
                         col === 'PENDING_CONFIRMATION' ? 'bg-amber-500' :
                         col === 'ACTIVE' ? 'bg-blue-500' :
                         col === 'IN_PROGRESS' ? 'bg-indigo-500' : 'bg-emerald-500'
                       )} />
                       {col.replace(/_/g, ' ')}
                       <span className="ml-1 opacity-50">({tasks.filter(t => t.status === col).length})</span>
                    </h3>
                    <Plus className="w-3 h-3 text-gray-300 hover:text-indigo-600 cursor-pointer transition-colors" />
                 </div>

                 <div className="space-y-3">
                    {tasks.filter(t => t.status === col).map(task => (
                       <div 
                         key={task.id} 
                         onClick={() => setSelectedTask(task)}
                         className="bg-white border border-gray-100 p-4 rounded-[2px] shadow-sm hover:shadow-md transition-all group cursor-pointer border-l-4" 
                         style={{ borderLeftColor: task.priority === 'URGENT' ? '#ef4444' : task.priority === 'HIGH' ? '#f97316' : '#6366f1' }}
                       >
                          <h4 className="text-sm font-black text-[#0F172A] group-hover:text-indigo-600 transition-colors mb-1">{task.title}</h4>
                          <p className="text-[10px] text-gray-400 font-medium line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
                          
                          <div className="flex items-center justify-between">
                             <div className="flex -space-x-1">
                                {task.assignee && (
                                   <div className="w-5 h-5 bg-slate-100 border border-white rounded-full flex items-center justify-center text-[8px] font-black uppercase shadow-sm">
                                      {task.assignee.name?.[0]}
                                   </div>
                                )}
                             </div>
                             <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase">
                                <Clock className="w-2.5 h-2.5" />
                                {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'ASAP'}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* Task Detail Drawer */}
      {selectedTask && (
        <TaskDrawer 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={() => {
            // In a real app, we'd refetch or use a shared state
            // For now, toast is enough or we could use window.location.reload()
            window.location.reload();
          }} 
        />
      )}

    </div>
  );
}
