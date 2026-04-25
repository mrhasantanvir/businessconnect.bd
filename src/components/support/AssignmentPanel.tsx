"use client";

import React, { useState, useTransition } from "react";
import {
  UserCheck, UserPlus, ChevronDown, Loader2,
  CheckCircle2, AlertCircle, Shuffle
} from "lucide-react";
import {
  claimIncidentAction,
  assignIncidentAction,
} from "@/app/support/incidents/actions";

interface Agent {
  id: string;
  name: string | null;
  email: string;
  openTickets: number;
}

interface AssignmentPanelProps {
  incidentId: string;
  currentAgent: { id: string; name: string | null; email: string } | null;
  currentUserId: string;
  currentUserName: string | null;
  agents: Agent[];
}

export function AssignmentPanel({
  incidentId,
  currentAgent,
  currentUserId,
  currentUserName,
  agents,
}: AssignmentPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [showReassign, setShowReassign] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const isMine = currentAgent?.id === currentUserId;
  const isUnassigned = !currentAgent;

  const handleClaim = () => {
    startTransition(async () => {
      await claimIncidentAction(incidentId);
      setFeedback("✅ Ticket claimed!");
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  const handleAssign = () => {
    if (!selectedAgentId) return;
    startTransition(async () => {
      await assignIncidentAction(incidentId, selectedAgentId);
      setFeedback("✅ Ticket reassigned!");
      setShowReassign(false);
      setSelectedAgentId("");
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#64748B]">
        <UserCheck className="w-3.5 h-3.5" /> Assignment
        {isPending && <Loader2 className="w-3 h-3 animate-spin ml-auto text-[#1E40AF]" />}
      </div>

      {/* Current Assignment State */}
      {isUnassigned ? (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-xs font-bold text-red-600">Unassigned</span>
        </div>
      ) : isMine ? (
        <div className="flex items-center gap-2 p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#16A34A]">You are handling this</div>
            <div className="text-[10px] text-[#64748B] truncate">{currentAgent?.email}</div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl">
          <div className="w-7 h-7 rounded-full bg-[#1E40AF] text-white flex items-center justify-center text-xs font-black shrink-0">
            {currentAgent?.name?.charAt(0) ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#0F172A] truncate">{currentAgent?.name}</div>
            <div className="text-[10px] text-[#64748B] truncate">{currentAgent?.email}</div>
          </div>
        </div>
      )}

      {feedback && (
        <div className="text-xs font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-3 py-2">
          {feedback}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid gap-2">
        {/* Self-Claim */}
        {!isMine && (
          <button
            onClick={handleClaim}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-3 bg-[#1E40AF] text-white rounded-2xl text-xs font-bold hover:bg-[#1E3A8A] transition-all disabled:opacity-60 justify-center"
          >
            <UserCheck className="w-4 h-4" />
            {isUnassigned ? "Claim This Ticket" : "Take Over Ticket"}
          </button>
        )}

        {/* Manual Assign */}
        <button
          onClick={() => setShowReassign(v => !v)}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-3 bg-white border border-[#E5E7EB] text-[#0F172A] rounded-2xl text-xs font-bold hover:bg-[#F8F9FA] transition-all disabled:opacity-60 justify-center"
        >
          <Shuffle className="w-4 h-4" />
          Assign to Agent
          <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${showReassign ? "rotate-180" : ""}`} />
        </button>

        {showReassign && (
          <div className="space-y-2 p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl">
            <div className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-2">
              Select Agent (by workload)
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border ${
                    selectedAgentId === agent.id
                      ? "bg-[#1E40AF]/5 border-[#1E40AF]/30 text-[#1E40AF]"
                      : "bg-white border-[#E5E7EB] hover:bg-[#F1F5F9] text-[#0F172A]"
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center text-xs font-black shrink-0">
                    {agent.name?.charAt(0) ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{agent.name}</div>
                    <div className="text-[10px] text-[#A1A1AA] truncate">{agent.email}</div>
                  </div>
                  <div className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-black ${
                    agent.openTickets === 0
                      ? "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]"
                      : agent.openTickets <= 3
                      ? "bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]"
                      : "bg-red-50 text-red-600 border border-red-100 animate-pulse"
                  }`}>
                    {agent.openTickets === 0 ? "IDEAL" : agent.openTickets <= 3 ? "STABLE" : "OVERLOADED"} · {agent.openTickets} open
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={handleAssign}
              disabled={!selectedAgentId || isPending}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-900 text-slate-900 border border-slate-100 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all disabled:opacity-40"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Confirm Assignment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
