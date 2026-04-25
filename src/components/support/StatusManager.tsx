"use client";

import React, { useState, useTransition } from "react";
import { CheckCircle2, Clock, AlertCircle, XCircle, Loader2, PauseCircle } from "lucide-react";
import { updateIncidentStatusAction } from "@/app/support/incidents/actions";
import { ResolutionModal } from "./ResolutionModal";

const STATUSES = [
  { value: "NEW", label: "New", icon: AlertCircle, color: "text-blue-600 bg-blue-50 border-blue-100" },
  { value: "IN_PROGRESS", label: "In Progress", icon: Clock, color: "text-orange-600 bg-orange-50 border-orange-100" },
  { value: "ON_HOLD", label: "On Hold", icon: PauseCircle, color: "text-yellow-600 bg-yellow-50 border-yellow-100" },
  { value: "RESOLVED", label: "Resolved", icon: CheckCircle2, color: "text-green-600 bg-green-50 border-green-100" },
  { value: "CLOSED", label: "Closed", icon: XCircle, color: "text-gray-600 bg-gray-50 border-gray-100" },
];

interface StatusManagerProps {
  incidentId: string;
  currentStatus: string;
  adminId: string; // kept for interface compat but not used in action
}

export function StatusManager({ incidentId, currentStatus }: StatusManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState(currentStatus);
  const [showResolveModal, setShowResolveModal] = useState(false);

  const handleChange = (newStatus: string) => {
    if (newStatus === selected) return;
    
    // ServiceNow standard: Resolve must have a mandatory modal
    if (newStatus === "RESOLVED") {
      setShowResolveModal(true);
      return;
    }

    setSelected(newStatus);
    startTransition(async () => {
      await updateIncidentStatusAction(incidentId, newStatus);
    });
  };

  const handleResolveSuccess = () => {
    setShowResolveModal(false);
    setSelected("RESOLVED");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#64748B]">
        <Clock className="w-3.5 h-3.5" /> Update Status
        {isPending && <Loader2 className="w-3 h-3 animate-spin ml-auto text-[#1E40AF]" />}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {STATUSES.map(({ value, label, icon: Icon, color }) => (
          <button
            key={value}
            onClick={() => handleChange(value)}
            disabled={isPending}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-sm font-bold transition-all text-left ${
              selected === value
                ? `${color} scale-[1.02] shadow-sm`
                : "bg-white border-[#E5E7EB] text-[#64748B] hover:bg-[#F8F9FA]"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {selected === value && (
              <span className="ml-auto text-[10px] font-black uppercase tracking-wider opacity-60">
                Current
              </span>
            )}
          </button>
        ))}
      </div>

      {showResolveModal && (
        <ResolutionModal 
          incidentId={incidentId}
          onClose={() => setShowResolveModal(false)}
          onSuccess={handleResolveSuccess}
        />
      )}
    </div>
  );
}
