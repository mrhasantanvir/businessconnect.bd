import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldCheck, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { confirmTaskAction } from "../taskActions";

export default async function TaskConfirmPage({ searchParams }: { searchParams: { id: string } }) {
  const taskId = searchParams.id;
  const session = await getSession();
  
  if (!session) redirect("/login");

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignee: true, merchantStore: true }
  });

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6">
        <div className="max-w-md w-full bg-white border border-gray-100 p-10 rounded-[2px] shadow-sm text-center space-y-4">
           <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
           <h1 className="text-xl font-bold text-[#0F172A] uppercase tracking-tight">Task Not Found</h1>
           <p className="text-xs font-medium text-gray-500">This task may have been deleted or the link is invalid.</p>
        </div>
      </div>
    );
  }

  if (task.assigneeId !== session.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6">
        <div className="max-w-md w-full bg-white border border-gray-100 p-10 rounded-[2px] shadow-sm text-center space-y-4">
           <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
           <h1 className="text-xl font-bold text-[#0F172A] uppercase tracking-tight">Unauthorized</h1>
           <p className="text-xs font-medium text-gray-500">This task is not assigned to you.</p>
        </div>
      </div>
    );
  }

  if (task.status !== "PENDING_CONFIRMATION") {
    redirect("/merchant/tasks");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6 font-inter">
      <div className="max-w-xl w-full bg-white border border-gray-100 p-10 rounded-[2px] shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] uppercase tracking-tight">Task <span className="text-indigo-600">Confirmation</span></h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acknowledgment for New Assignment</p>
         </div>

         <div className="bg-gray-50 p-6 rounded-[2px] space-y-4 border border-gray-100">
            <div>
               <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Task Title</label>
               <p className="text-sm font-bold text-[#0F172A]">{task.title}</p>
            </div>
            <div>
               <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
               <p className="text-xs font-medium text-gray-600 leading-relaxed">{task.description || 'No detailed description.'}</p>
            </div>
            <div className="flex gap-8">
               <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Priority</label>
                  <p className={cn(
                    "text-xs font-bold",
                    task.priority === 'URGENT' ? 'text-red-600' : 
                    task.priority === 'HIGH' ? 'text-orange-600' : 'text-indigo-600'
                  )}>{task.priority}</p>
               </div>
               <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Deadline</label>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
                     <Clock className="w-3.5 h-3.5 text-indigo-600" />
                     {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'ASAP'}
                  </div>
               </div>
            </div>
         </div>

         <form action={async () => {
           "use server";
           await confirmTaskAction(taskId);
           redirect("/merchant/tasks");
         }}>
           <button 
             type="submit"
             className="w-full bg-[#BEF264] text-[#166534] py-4 rounded-[2px] text-sm font-bold uppercase tracking-widest hover:bg-[#a3d94b] transition-all shadow-md flex items-center justify-center gap-3"
           >
              <CheckCircle2 className="w-5 h-5" />
              Confirm & Start Now
           </button>
         </form>

         <p className="text-center text-[9px] font-bold text-gray-400 leading-relaxed px-6">
            By confirming, you acknowledge that you have read the task details and will begin working on it immediately. Your activity will be tracked as part of the task management system.
         </p>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
