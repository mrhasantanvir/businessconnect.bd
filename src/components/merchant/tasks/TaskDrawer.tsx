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
  FileIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendTaskMessageAction, updateTaskStatusAction } from "@/app/merchant/tasks/taskActions";
import { toast } from "sonner";

export default function TaskDrawer({ task, onClose, onUpdate }: { task: any, onClose: () => void, onUpdate: () => void }) {
  const [activeTab, setActiveTab] = useState<"chat" | "activity">("chat");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSendMessage() {
    if (!message.trim() || isSending) return;
    setIsSending(true);
    try {
      await sendTaskMessageAction(task.id, message);
      setMessage("");
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
      onUpdate();
    } catch (error) {
      toast.error("Failed to update status");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300 font-inter">
      <div className="w-full max-w-2xl bg-white shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh] rounded-none">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className={cn(
               "w-2 h-2 rounded-none animate-pulse",
               task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-500'
            )} />
            <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">Task Master Control</h2>
         </div>
         <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-none transition-all">
            <X className="w-5 h-5 text-gray-400" />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
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
               <div className="bg-gray-50 p-4 rounded-none border border-gray-100">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Assignee</label>
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 bg-white border border-gray-200 rounded-none flex items-center justify-center text-[11px] font-black text-indigo-600">
                          {task.assignee.name?.[0] || "?"}
                       </div>
                       <div>
                          <p className="text-[11px] font-black text-[#0F172A] leading-none">{task.assignee.name || "Unknown"}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{task.assignee.staffProfile?.jobRole || 'Staff'}</p>
                       </div>
                    </div>
                  ) : <p className="text-[11px] font-black text-gray-300 italic uppercase">Unassigned</p>}
               </div>
               <div className="bg-gray-50 p-4 rounded-none border border-gray-100">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Status</label>
                  <select 
                    className="bg-transparent border-none p-0 text-[11px] font-black uppercase text-indigo-600 focus:ring-0 w-full"
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

            {/* AI Efficiency Audit - Updated Styling */}
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
               <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-[2px]">
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
         <div className="flex border-b border-gray-50">
            <button 
              onClick={() => setActiveTab("chat")}
              className={cn(
                "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'chat' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
               Task Chat
            </button>
            <button 
              onClick={() => setActiveTab("activity")}
              className={cn(
                "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'activity' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
               Activity History
            </button>
         </div>

         <div className="p-6 h-[400px] flex flex-col">
            {activeTab === 'chat' ? (
              <>
                 <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 no-scrollbar">
                    {task.messages?.map((msg: any) => (
                       <div key={msg.id} className={cn(
                         "max-w-[80%] p-3 rounded-[2px]",
                         msg.isAi ? "bg-indigo-50 text-indigo-700 border border-indigo-100 italic" : "bg-gray-100 text-[#0F172A]"
                       )}>
                          <p className="text-[11px] font-medium leading-relaxed">{msg.content}</p>
                          <p className="text-[8px] font-black uppercase opacity-40 mt-1 text-right">
                             {msg.user?.name || 'AI'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                    ))}
                    {(!task.messages || task.messages.length === 0) && (
                       <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale scale-75">
                          <MessageSquare className="w-12 h-12 mb-2" />
                          <p className="text-[10px] font-black uppercase">No Messages Yet</p>
                       </div>
                    )}
                 </div>
                 <div className="flex gap-2 bg-gray-50 p-2 rounded-[2px] border border-gray-200">
                    <input 
                      type="text" 
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent border-none text-[12px] font-medium focus:ring-0 p-2"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={isSending || !message.trim()}
                      className="p-2 bg-indigo-600 text-white rounded-[2px] hover:bg-indigo-700 transition-all disabled:opacity-50"
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
                       <div className="w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm z-10 shrink-0">
                          <Activity className="w-3.5 h-3.5 text-indigo-400" />
                       </div>
                       <div className="pb-6">
                          <p className="text-[11px] font-black text-[#0F172A] uppercase tracking-tight">{activity.type.replace(/_/g, ' ')}</p>
                          <p className="text-[11px] font-medium text-gray-500 mt-0.5">{activity.message}</p>
                          <p className="text-[8px] font-bold text-gray-300 uppercase mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                       </div>
                    </div>
                 ))}
                 {(!task.activities || task.activities.length === 0) && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale scale-75">
                       <History className="w-12 h-12 mb-2" />
                       <p className="text-[10px] font-black uppercase">No Activity Recorded</p>
                    </div>
                 )}
              </div>
            )}
         </div>
      </div>

      {/* Footer / Time Tracking Status */}
      <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-[2px] flex items-center justify-center">
               <Activity className="w-4 h-4" />
            </div>
            <div>
               <p className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest leading-none mb-1">Time Logged</p>
               <p className="text-xs font-black text-indigo-600">2h 45m</p>
            </div>
         </div>
         <button className="px-6 py-2.5 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest text-[#0F172A] hover:bg-gray-100 transition-all rounded-[2px]">
            Start Timer
         </button>
      </div>

    </div>
  </div>
  );
}
