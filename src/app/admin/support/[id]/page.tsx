import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft, Hash, Clock, CheckCircle2, AlertCircle,
  Building2, User, Lock, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { ReplyForm } from "@/components/support/ReplyForm";
import { StatusManager } from "@/components/support/StatusManager";
import { AssignmentPanel } from "@/components/support/AssignmentPanel";
import { IncidentActivityLog } from "@/components/support/IncidentActivityLog";

export default async function AdminIncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") redirect("/login");

  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      messages: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
      user: true,
      merchantStore: true,
      assignedTo: true,
      activities: {
        include: { user: true },
        orderBy: { createdAt: "desc" }, // Most recent first for side panel
      }
    },
  });

  if (!incident) notFound();

  // Fetch all agents with their open ticket workload
  const agents = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
    include: {
      assignedIncidents: {
        where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
      },
    },
  });

  const agentsWithWorkload = agents.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    openTickets: a.assignedIncidents.length,
  }));

  const statusStyles: Record<string, string> = {
    NEW: "bg-blue-50 text-blue-600 border-blue-100",
    IN_PROGRESS: "bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]",
    ON_HOLD: "bg-yellow-50 text-yellow-600 border-yellow-100",
    RESOLVED: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]",
    CLOSED: "bg-gray-50 text-gray-500 border-gray-100",
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <Link
        href="/admin/support"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#64748B] hover:text-[#0F172A] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Queue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Thread ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Header */}
          <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#1E40AF] flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {incident.number}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 border ${statusStyles[incident.status]}`}
              >
                {incident.status === "NEW" && <AlertCircle className="w-3 h-3" />}
                {incident.status === "IN_PROGRESS" && <Clock className="w-3 h-3" />}
                {incident.status === "RESOLVED" && <CheckCircle2 className="w-3 h-3" />}
                {incident.status}
              </span>
              <span className="text-[10px] font-bold bg-[#F1F5F9] text-[#64748B] px-2 py-1 rounded">
                {incident.category}
              </span>
              <div className="flex items-center gap-1.5 ml-auto">
                <div
                  className={`w-2 h-2 rounded-full ${
                    incident.priority === "CRITICAL"
                      ? "bg-[#DC2626] animate-pulse"
                      : incident.priority === "HIGH"
                      ? "bg-[#EA580C]"
                      : incident.priority === "MEDIUM"
                      ? "bg-[#1E40AF]"
                      : "bg-[#64748B]"
                  }`}
                />
                <span className="text-[10px] font-bold text-[#64748B]">{incident.priority}</span>
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F172A]">{incident.subject}</h1>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 py-4 border-y border-gray-50 border-dashed">
               <div className="space-y-1">
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Impact</div>
                  <div className="text-xs font-bold text-[#0F172A]">
                     {incident.impact === '1' ? '1 - High' : incident.impact === '2' ? '2 - Medium' : '3 - Low'}
                  </div>
               </div>
               <div className="space-y-1">
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Urgency</div>
                  <div className="text-xs font-bold text-[#0F172A]">
                     {incident.urgency === '1' ? '1 - High' : incident.urgency === '2' ? '2 - Medium' : '3 - Low'}
                  </div>
               </div>
               <div className="space-y-1">
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Reported By</div>
                  <div className="text-xs font-bold text-[#0F172A]">{incident.user.name}</div>
               </div>
               <div className="space-y-1">
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Resolved Date</div>
                  <div className="text-xs font-bold text-[#64748B]">
                    {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleDateString() : 'Pending'}
                  </div>
               </div>
            </div>
            
            {(incident.status === 'RESOLVED' || incident.status === 'CLOSED') && incident.resolutionNotes && (
               <div className="mt-8 p-6 bg-green-50/50 rounded-2xl border border-green-100 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center shrink-0">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                     <div className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">Resolution Summary</div>
                     <div className="text-xs font-black text-[#0F172A] mb-1">Code: {incident.resolutionCode}</div>
                     <p className="text-sm text-green-800 font-medium leading-relaxed">{incident.resolutionNotes}</p>
                  </div>
               </div>
            )}
          </div>

          {/* Message Thread */}
          <div className="space-y-4">
            {incident.messages.map((msg) => {
              const isMerchant = msg.userId === incident.userId;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${!isMerchant ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      isMerchant ? "bg-[#F1F5F9] text-[#0F172A]" : "bg-white text-slate-900 text-slate-900 border border-slate-100 text-white"
                    }`}
                  >
                    {msg.user.name?.charAt(0) ?? "?"}
                  </div>
                  <div
                    className={`max-w-[75%] space-y-1 flex flex-col ${
                      !isMerchant ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-5 py-4 ${
                        msg.isInternal
                          ? "bg-amber-50 border border-amber-200 text-[#0F172A] rounded-tl-md"
                          : isMerchant
                          ? "bg-white border border-[#E5E7EB] text-[#0F172A] rounded-tl-md shadow-sm"
                          : "bg-white text-slate-900 text-slate-900 border border-slate-100 text-white rounded-tr-md"
                      }`}
                    >
                      {msg.isInternal && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-700 mb-2">
                          <Lock className="w-3 h-3" /> Internal Note
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      {msg.attachmentUrl && (
                        <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
                          <img
                            src={msg.attachmentUrl}
                            alt="Attachment"
                            className="mt-3 max-h-48 rounded-xl border border-[#E5E7EB] object-cover hover:opacity-90 transition-opacity"
                          />
                        </a>
                      )}
                    </div>
                    <span className="text-[10px] text-[#A1A1AA] font-medium px-1">
                      {msg.user.name} · {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Box */}
          <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#0F172A] mb-4">Reply to Merchant</h3>
            <ReplyForm incidentId={incident.id} isAdmin={true} />
          </div>
        </div>

        {/* ── Right: Management Panel ── */}
        <div className="space-y-5">
          {/* Merchant Info */}
          <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">
              Merchant
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F1F5F9] text-[#1E40AF] flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-[#0F172A]">{incident.merchantStore.name}</div>
                <div className="text-[10px] font-bold text-[#A1A1AA] uppercase">
                  {incident.merchantStore.plan} Plan
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-[#0F172A]">{incident.user.name}</div>
                <div className="text-[10px] text-[#A1A1AA] font-medium">{incident.user.email}</div>
              </div>
            </div>
            {incident.contactPhone ? (
              <a
                href={`tel:${incident.contactPhone}`}
                className="flex items-center gap-3 p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl hover:bg-[#DCFCE7] transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center text-sm shrink-0">
                  📞
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#16A34A]">Call Merchant</div>
                  <div className="text-sm font-bold text-[#0F172A]">{incident.contactPhone}</div>
                </div>
                <div className="ml-auto text-[10px] font-bold text-[#16A34A] opacity-0 group-hover:opacity-100 transition-opacity">
                  Tap to call →
                </div>
              </a>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-[#FFF7ED] border border-[#FFEDD5] rounded-2xl text-xs text-[#EA580C] font-bold">
                ⚠️ No contact phone provided
              </div>
            )}
          </div>

          {/* Assignment Panel */}
          <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
            <AssignmentPanel
              incidentId={incident.id}
              currentAgent={incident.assignedTo}
              currentUserId={session.userId}
              currentUserName={session.name ?? null}
              agents={agentsWithWorkload}
            />
          </div>

          {/* Status Manager */}
          <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
            <StatusManager
              incidentId={incident.id}
              currentStatus={incident.status}
              adminId={session.userId}
            />
          </div>

          {/* Activity Log */}
          <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
            <IncidentActivityLog activities={incident.activities} />
          </div>
        </div>
      </div>
    </div>
  );
}
