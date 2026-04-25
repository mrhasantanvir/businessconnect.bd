"use client";

import React from "react";
import { 
  History, 
  Circle, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  Layout, 
  RefreshCw 
} from "lucide-react";

interface Activity {
  id: string;
  type: string;
  message: string;
  createdAt: Date | string;
  user?: {
    name: string | null;
    email: string;
  } | null;
}

interface IncidentActivityLogProps {
  activities: Activity[];
}

/**
 * Audit Trail component following ServiceNow standards.
 * Shows a vertical timeline of every field change, status update, and assignment.
 */
export function IncidentActivityLog({ activities }: IncidentActivityLogProps) {
  if (!activities?.length) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "STATUS_CHANGE": return <RefreshCw className="w-3 h-3 text-indigo-500" />;
      case "ASSIGNMENT": return <User className="w-3 h-3 text-emerald-500" />;
      case "PRIORITY_CHANGE": return <AlertTriangle className="w-3 h-3 text-rose-500" />;
      default: return <Layout className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#64748B]">
        <History className="w-3.5 h-3.5" /> Audit Trail (Activity)
      </div>

      <div className="relative pl-3 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-gray-100 ">
        {activities.map((activity) => (
          <div key={activity.id} className="relative pl-6">
            <div className="absolute left-[-1px] top-1 w-6 h-6 rounded-full bg-white  border-2 border-gray-100  flex items-center justify-center z-10">
               {getIcon(activity.type)}
            </div>
            
            <div className="space-y-1">
               <div className="text-[11px] font-bold text-[#0F172A]  leading-tight">
                  {activity.message}
               </div>
               <div className="flex items-center gap-2 text-[9px] text-gray-400 font-medium">
                  <span className="flex items-center gap-0.5">
                     <ShieldCheck className="w-2.5 h-2.5" />
                     {activity.user?.name || "System"}
                  </span>
                  <span>•</span>
                  <span>{new Date(activity.createdAt).toLocaleString()}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
