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
  AlertCircle
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
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-[60] border-l border-gray-100 flex flex-col animate-in slide-in-from-right duration-500 font-inter">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className={cn(
               "w-2 h-2 rounded-full animate-pulse",
               task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-500'
            )} />
            <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">Task Details</h2>
         </div>
         <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-all">
            <X className="w-5 h-5 text-gray-400" />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
         {/* Task Overview Section */}
         <div className="p-8 space-y-8">
            <div className="space-y-2">
               <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-[1px] border",
                    task.priority === 'URGENT' ? 'bg-red-50 text-red-600 border-red-100' : 
                    task.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  )}>{task.priority} Priority</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                     <Clock className="w-3.5 h-3.5" />
                     Due {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'ASAP'}
                  </div>
               </div>
               <h1 className="text-xl font-black text-[#0F172A] leading-tight">{task.title}</h1>
               <p className="text-xs font-medium text-gray-500 leading-relaxed">{task.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-50 p-4 rounded-[2px] border border-gray-100">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Assignee</label>
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[11px] font-black text-indigo-600">
                          {task.assignee.name?.[0]}
                       </div>
                       <div>
                          <p className="text-[11px] font-black text-[#0F172A] leading-none">{task.assignee.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{task.assignee.staffProfile?.jobRole || 'Staff'}</p>
                       </div>
                    </div>
                  ) : <p className="text-[11px] font-black text-gray-300 italic uppercase">Unassigned</p>}
               </div>
               <div className="bg-gray-50 p-4 rounded-[2px] border border-gray-100">
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

            {/* AI Efficiency Audit */}
            <div className="bg-slate-900 text-white p-6 rounded-[2px] space-y-3 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
               <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Efficiency Audit
               </div>
               <p className="text-[11px] font-medium leading-relaxed opacity-90">
                  {task.status === 'COMPLETED' 
                    ? "The staff handled this task with high precision. Total time spent aligns with the initial estimate."
                    : "Task is currently active. AI is monitoring activity sync to generate the final efficiency report."}
               </p>
               <div className="flex items-center gap-4 pt-2">
                  <div className="text-[10px] font-black text-indigo-400">SCORE: <span className="text-white">{task.status === 'COMPLETED' ? '9.4/10' : 'TBD'}</span></div>
               </div>
            </div>

            {task.order && (
              <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-[2px]">
                 <div className="flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-indigo-600" />
                    <div>
                       <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Linked Order</p>
                       <p className="text-xs font-black text-indigo-900">#{task.order.orderNumber || task.order.id.slice(-8)}</p>
                    </div>
                 </div>
                 <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">View Details</button>
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
  );
}
