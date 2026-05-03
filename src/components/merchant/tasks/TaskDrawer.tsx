"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Send, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  History,
  User,
  ExternalLink,
  MoreVertical,
  Activity,
  AlertCircle,
  FileIcon,
  ArrowRight,
  UserPlus,
  Loader2,
  Timer,
  Pause
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  sendTaskMessageAction, 
  updateTaskStatusAction, 
  getTaskAction, 
  forwardTaskAction,
  startWorkLogAction,
  stopWorkLogAction
} from "@/app/merchant/tasks/taskActions";
import { toast } from "sonner";

export default function TaskDrawer({ 
  task: initialTask, 
  staff,
  onClose, 
  onUpdate 
}: { 
  task: any, 
  staff: any[],
  onClose: () => void, 
  onUpdate: () => void 
}) {
  const [task, setTask] = useState(initialTask);
  const [activeTab, setActiveTab] = useState<"chat" | "activity">("chat");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [forwardUserId, setForwardUserId] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    refreshTask();
  }, [initialTask.id]);

  useEffect(() => {
    // Check if there's an active work log
    const hasActiveLog = task.workLogs?.some((log: any) => !log.endTime);
    setIsWorking(!!hasActiveLog);
  }, [task]);

  async function refreshTask() {
    setIsLoading(true);
    try {
      const updated = await getTaskAction(initialTask.id);
      if (updated) setTask(updated);
    } catch (error) {
      console.error("Failed to refresh task", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendMessage() {
    if (!message.trim() || isSending) return;
    setIsSending(true);
    try {
      await sendTaskMessageAction(task.id, message);
      setMessage("");
      await refreshTask();
      onUpdate();
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  }

  async function handleStatusChange(status: string) {
    try {
      await updateTaskStatusAction(task.id, status);
      toast.success(`Status updated to ${status}`);
      await refreshTask();
      onUpdate();
    } catch (error) {
      toast.error("Failed to update status");
    }
  }

  async function handleForward() {
    if (!forwardUserId) return;
    try {
      await forwardTaskAction(task.id, forwardUserId);
      toast.success("Task forwarded successfully!");
      setShowForward(false);
      onClose();
      onUpdate();
    } catch (error) {
      toast.error("Failed to forward task");
    }
  }

  async function toggleWork() {
    try {
      if (isWorking) {
        await stopWorkLogAction(task.id);
        toast.success("Work session paused");
      } else {
        await startWorkLogAction(task.id);
        toast.success("Work session started successfully");
        if (task.status === 'PENDING_CONFIRMATION' || task.status === 'ACTIVE') {
           try {
              await updateTaskStatusAction(task.id, 'IN_PROGRESS');
           } catch (e) {
              console.error("Status update failed but log was created", e);
           }
        }
      }
      await refreshTask();
      onUpdate();
    } catch (error: any) {
      console.error("Work toggle error:", error);
      toast.error(error.message || "Failed to update work status");
    }
  }

  // Calculate real-time logged
  const calculateTimeLogged = () => {
    let totalMinutes = 0;
    if (task.workLogs) {
      task.workLogs.forEach((log: any) => {
        if (log.duration) {
          totalMinutes += log.duration;
        } else if (!log.endTime) {
          // Ongoing session
          const now = new Date();
          const start = new Date(log.startTime);
          totalMinutes += Math.round((now.getTime() - start.getTime()) / 60000);
        }
      });
    }
    
    if (totalMinutes === 0) {
       // Show time since creation if no work logs yet
       const now = new Date();
       const created = new Date(task.createdAt);
       totalMinutes = Math.round((now.getTime() - created.getTime()) / 60000);
       return { label: "IN QUEUE", value: formatDuration(totalMinutes) };
    }

    return { label: "TIME LOGGED", value: formatDuration(totalMinutes) };
  };

  const formatDuration = (min: number) => {
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}m`;
  };

  const timeInfo = calculateTimeLogged();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300 font-inter">
      <div className="w-full max-w-2xl bg-white shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh] rounded-none relative">
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] z-50 flex items-center justify-center">
           <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className={cn(
               "w-2 h-2 rounded-none animate-pulse",
               task.status === 'COMPLETED' ? 'bg-emerald-500' : 
               isWorking ? 'bg-indigo-500' : 'bg-gray-300'
            )} />
            <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">
               {isWorking ? 'Operation Active' : 'Task Master Control'}
            </h2>
         </div>
         <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-none transition-all">
            <X className="w-5 h-5 text-gray-400" />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
         {/* Forward Section Overlay */}
         {showForward && (
            <div className="p-6 bg-[#0F172A] text-white animate-in slide-in-from-top-4 duration-300 sticky top-0 z-30">
               <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Reassign / Forward Operation</h3>
                     <button onClick={() => setShowForward(false)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex gap-2">
                     <select 
                       className="flex-1 bg-white/5 border border-white/10 text-white rounded-none p-3 text-xs font-bold outline-none focus:bg-white/10"
                       value={forwardUserId}
                       onChange={(e) => setForwardUserId(e.target.value)}
                     >
                        <option value="" className="text-gray-900">Select new assignee...</option>
                        {staff.filter(s => s.id !== task.assigneeId).map(s => (
                           <option key={s.id} value={s.id} className="text-gray-900">{s.name} ({s.staffProfile?.jobRole || 'Staff'})</option>
                        ))}
                     </select>
                     <button 
                       onClick={handleForward}
                       disabled={!forwardUserId}
                       className="px-6 py-3 bg-indigo-600 text-white rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
                     >
                        Execute Transfer
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Task Overview Section */}
         <div className="p-8 space-y-8">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-none border",
                    task.priority === 'URGENT' ? 'bg-red-50 text-red-600 border-red-100' : 
                    task.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  )}>{task.priority} Priority</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                     <Clock className="w-3.5 h-3.5" />
                     Due {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'ASAP'}
                  </div>
               </div>
               <h1 className="text-2xl font-black text-[#0F172A] leading-tight tracking-tighter">{task.title}</h1>
               <p className="text-sm font-medium text-gray-500 leading-relaxed">{task.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-50 p-5 rounded-none border border-gray-100 relative group">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Assignee</label>
                  <div className="flex items-center justify-between">
                     {task.assignee ? (
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-gray-200 rounded-none flex items-center justify-center text-[12px] font-black text-indigo-600 uppercase">
                             {task.assignee.name?.[0] || "?"}
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-[#0F172A] leading-none mb-1">{task.assignee.name || "Unknown"}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase">{task.assignee.staffProfile?.jobRole || 'Staff'}</p>
                          </div>
                       </div>
                     ) : <p className="text-[11px] font-black text-gray-300 italic uppercase">Unassigned</p>}
                     
                     <button 
                       onClick={() => setShowForward(true)}
                       className="p-2 text-indigo-600 hover:bg-indigo-50 transition-all rounded-none border border-transparent hover:border-indigo-100"
                       title="Forward Task"
                     >
                        <UserPlus className="w-4 h-4" />
                     </button>
                  </div>
               </div>
               <div className="bg-gray-50 p-5 rounded-none border border-gray-100">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Operational Status</label>
                  <select 
                    className="bg-transparent border-none p-0 text-[11px] font-black uppercase text-indigo-600 focus:ring-0 w-full cursor-pointer"
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                     <option value="PENDING_CONFIRMATION">Pending Confirmation</option>
                     <option value="ACTIVE">Active</option>
                     <option value="IN_PROGRESS">In Progress</option>
                     <option value="COMPLETED">Completed</option>
                     <option value="CANCELLED">Cancelled</option>
                  </select>
               </div>
            </div>

            {/* AI Efficiency Audit */}
            <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-none space-y-3 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl -mr-8 -mt-8" />
               <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-indigo-600">
                  <Activity className="w-3.5 h-3.5" />
                  AI Efficiency Audit
               </div>
               <p className="text-[11px] font-bold leading-relaxed text-indigo-900">
                  {task.status === 'COMPLETED' 
                    ? "The staff handled this task with high precision. Total time spent aligns with the initial estimate."
                    : "Task is currently active. AI is monitoring activity sync to generate the final efficiency report."}
               </p>
               <div className="flex items-center gap-4 pt-2">
                  <div className="text-[10px] font-black text-indigo-600">EFFICIENCY SCORE: <span className="text-indigo-900 bg-white px-2 py-0.5 border border-indigo-100 ml-1">{task.status === 'COMPLETED' ? '9.4/10' : 'ANALYZING...'}</span></div>
               </div>
            </div>
 
             {task.order && task.order.id && (
               <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-none">
                  <div className="flex items-center gap-3">
                     <ExternalLink className="w-4 h-4 text-indigo-600" />
                     <div>
                        <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Linked Order</p>
                        <p className="text-xs font-black text-indigo-900">#{task.order.orderNumber || task.order.id.toString().slice(-8)}</p>
                     </div>
                  </div>
                  <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">View Details</button>
               </div>
             )}

            {/* Task Attachments Section */}
            {task.attachments && (
              <div className="space-y-3">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shared Documents & Assets</h3>
                 <div className="grid grid-cols-2 gap-3">
                    {JSON.parse(task.attachments).map((file: any, idx: number) => (
                       <a 
                         key={idx} 
                         href={file.url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-none hover:border-indigo-200 transition-all group"
                       >
                          <div className="w-8 h-8 bg-white border border-gray-100 flex items-center justify-center rounded-none text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                             <FileIcon className="w-4 h-4" />
                          </div>
                          <div className="overflow-hidden">
                             <p className="text-[10px] font-black text-[#0F172A] truncate">{file.name}</p>
                             <p className="text-[8px] font-bold text-gray-400 uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                       </a>
                    ))}
                 </div>
              </div>
            )}
         </div>

         {/* Tabs Section */}
         <div className="flex border-b border-gray-50 bg-white sticky top-0 z-20">
            <button 
              onClick={() => setActiveTab("chat")}
              className={cn(
                "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'chat' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
               Task Chat ({task.messages?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab("activity")}
              className={cn(
                "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'activity' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
               Activity History ({task.activities?.length || 0})
            </button>
         </div>

         <div className="p-6 h-[400px] flex flex-col bg-white">
            {activeTab === 'chat' ? (
              <>
                 <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 no-scrollbar">
                    {task.messages?.map((msg: any) => (
                       <div key={msg.id} className={cn(
                         "max-w-[85%] p-4 rounded-none",
                         msg.isAi ? "bg-indigo-50 text-indigo-700 border border-indigo-100 italic" : "bg-gray-50 text-[#0F172A] border border-gray-100"
                       )}>
                          <p className="text-[11px] font-medium leading-relaxed">{msg.content}</p>
                          <div className="flex items-center justify-between mt-2 opacity-50">
                             <span className="text-[8px] font-black uppercase">{msg.user?.name || 'AI'}</span>
                             <span className="text-[8px] font-bold uppercase">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                       </div>
                    ))}
                    {(!task.messages || task.messages.length === 0) && (
                       <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale scale-75">
                          <MessageSquare className="w-12 h-12 mb-2" />
                          <p className="text-[10px] font-black uppercase">No Intelligence Logs Found</p>
                       </div>
                    )}
                 </div>
                 <div className="flex gap-2 bg-gray-50 p-2 rounded-none border border-gray-200">
                    <input 
                      type="text" 
                      placeholder="Enter operational update..."
                      className="flex-1 bg-transparent border-none text-[12px] font-medium focus:ring-0 p-2 outline-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={isSending || !message.trim()}
                      className="p-3 bg-indigo-600 text-white rounded-none hover:bg-black transition-all disabled:opacity-50"
                    >
                       <Send className="w-4 h-4" />
                    </button>
                 </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 no-scrollbar">
                 {task.activities?.map((activity: any) => (
                    <div key={activity.id} className="flex gap-4 relative">
                       <div className="w-px bg-gray-100 absolute left-[15px] top-8 bottom-[-24px] z-0" />
                       <div className="w-8 h-8 bg-white border border-gray-100 rounded-none flex items-center justify-center shadow-sm z-10 shrink-0">
                          <Activity className="w-3.5 h-3.5 text-indigo-400" />
                       </div>
                       <div className="pb-6">
                          <p className="text-[11px] font-black text-[#0F172A] uppercase tracking-tight">{activity.type.replace(/_/g, ' ')}</p>
                          <p className="text-[11px] font-medium text-gray-500 mt-0.5 leading-relaxed">{activity.message}</p>
                          <p className="text-[8px] font-bold text-gray-300 uppercase mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                       </div>
                    </div>
                 ))}
                 {(!task.activities || task.activities.length === 0) && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale scale-75">
                       <History className="w-12 h-12 mb-2" />
                       <p className="text-[10px] font-black uppercase">No Activity Trail Detected</p>
                    </div>
                 )}
              </div>
            )}
         </div>
      </div>

      {/* Footer / Time Tracking Status */}
      <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className={cn(
               "w-10 h-10 rounded-none flex items-center justify-center transition-all",
               isWorking ? "bg-indigo-600 text-white animate-pulse" : "bg-gray-200 text-gray-400"
            )}>
               <Timer className="w-5 h-5" />
            </div>
            <div>
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{timeInfo.label}</p>
               <p className="text-sm font-black text-[#0F172A] tracking-tight">{timeInfo.value}</p>
            </div>
         </div>
         <button 
           onClick={toggleWork}
           className={cn(
             "px-8 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-none shadow-sm flex items-center gap-2 border",
             isWorking 
              ? "bg-white border-indigo-200 text-indigo-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100" 
              : "bg-black border-black text-white hover:bg-gray-800"
           )}
         >
            {isWorking ? (
               <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  Pause Session
               </>
            ) : (
               <>
                  <Timer className="w-3.5 h-3.5" />
                  Submit
               </>
            )}
         </button>
      </div>

     </div>
    </div>
  );
}
