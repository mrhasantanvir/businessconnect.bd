"use client";

import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  Loader2, 
  Plus, 
  Calendar, 
  User, 
  AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { suggestTaskAction, createTaskAction } from "@/app/merchant/tasks/taskActions";
import { toast } from "sonner";

export default function CreateTaskModal({ 
  staff, 
  onClose, 
  onCreated 
}: { 
  staff: any[], 
  onClose: () => void, 
  onCreated: () => void 
}) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    assigneeId: "",
    deadline: ""
  });

  const handleAiSuggest = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const suggestion = await suggestTaskAction(aiPrompt);
      if (suggestion) {
        setFormData({
          ...formData,
          title: suggestion.title || "",
          description: suggestion.description || "",
          priority: suggestion.priority || "MEDIUM"
        });
        toast.success("AI generated task structure!");
      }
    } catch (error) {
      toast.error("AI could not process the request");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error("Title is required");
    
    setIsSubmitting(true);
    try {
      await createTaskAction({
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined
      });
      toast.success("Task created and notification sent!");
      onCreated();
      onClose();
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-300 rounded-none overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white">
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Task Management</h2>
            <p className="text-sm font-black text-[#0F172A] tracking-tighter uppercase">Create New Task</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-none transition-all">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar max-h-[80vh]">
          {/* AI Suggestion Box */}
          <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-none space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl -mr-8 -mt-8" />
            <label className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI Task Architect
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Describe the task (e.g., Send 50 items to Uttara warehouse)..."
                className="flex-1 bg-white border border-indigo-100 rounded-none px-4 py-2.5 text-xs font-bold focus:border-indigo-600 outline-none transition-all"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSuggest()}
              />
              <button 
                onClick={handleAiSuggest}
                disabled={isAiLoading || !aiPrompt.trim()}
                className="px-4 bg-indigo-600 text-white rounded-none hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center min-w-[44px]"
              >
                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-tight">AI will auto-fill title, description and priority levels.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Task Title</label>
              <input 
                type="text" 
                required
                placeholder="e.g., Inventory Audit - Q2"
                className="w-full bg-gray-50 border border-gray-100 rounded-none px-4 py-3 text-xs font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Task Description</label>
              <textarea 
                placeholder="Detailed instructions for the staff..."
                rows={4}
                className="w-full bg-gray-50 border border-gray-100 rounded-none px-4 py-3 text-xs font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Task Priority</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-100 rounded-none px-4 py-3 text-xs font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all uppercase tracking-widest"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Task Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input 
                    type="date" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-none pl-10 pr-4 py-3 text-xs font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Assign Staff</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <select 
                  className="w-full bg-gray-50 border border-gray-100 rounded-none pl-10 pr-4 py-3 text-xs font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all"
                  value={formData.assigneeId}
                  onChange={(e) => setFormData({...formData, assigneeId: e.target.value})}
                >
                  <option value="">Leave Unassigned (Pool Task)</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.staffProfile?.jobRole || 'Staff'})</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Assign Task
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
