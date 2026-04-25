import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Hash, Clock, CheckCircle2, AlertCircle, User, Lock } from "lucide-react";
import Link from "next/link";
import { ReplyForm } from "@/components/support/ReplyForm";

export default async function MerchantIncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      messages: {
        where: { isInternal: false }, // Merchants can't see internal notes
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
      user: true,
      assignedTo: true,
    }
  });

  if (!incident || incident.merchantStoreId !== session.merchantStoreId) notFound();

  const statusStyles: Record<string, string> = {
    NEW: "bg-blue-50 text-blue-600 border-blue-100",
    IN_PROGRESS: "bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]",
    ON_HOLD: "bg-yellow-50 text-yellow-600 border-yellow-100",
    RESOLVED: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]",
    CLOSED: "bg-gray-50 text-gray-500 border-gray-100",
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Back */}
      <Link href="/support/incidents" className="inline-flex items-center gap-2 text-sm font-bold text-[#64748B] hover:text-[#0F172A] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Incidents
      </Link>

      {/* Incident Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-[#1E40AF] flex items-center gap-1">
                <Hash className="w-3 h-3" />{incident.number}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 border ${statusStyles[incident.status]}`}>
                {incident.status === 'NEW' && <AlertCircle className="w-3 h-3" />}
                {incident.status === 'IN_PROGRESS' && <Clock className="w-3 h-3" />}
                {incident.status === 'RESOLVED' && <CheckCircle2 className="w-3 h-3" />}
                {incident.status}
              </span>
              <span className="text-[10px] font-bold bg-[#F1F5F9] text-[#64748B] px-2 py-1 rounded">{incident.category}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F172A]">{incident.subject}</h1>
            <p className="text-sm text-[#64748B] mt-1">Opened {new Date(incident.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                incident.priority === 'CRITICAL' ? 'bg-[#DC2626] animate-pulse' :
                incident.priority === 'HIGH' ? 'bg-[#EA580C]' :
                incident.priority === 'MEDIUM' ? 'bg-[#1E40AF]' : 'bg-[#64748B]'
              }`} />
              <span className="text-xs font-bold text-[#0F172A]">{incident.priority} Priority</span>
            </div>
            {incident.assignedTo && (
              <div className="flex items-center gap-2 bg-[#F8F9FA] rounded-xl px-3 py-2">
                <User className="w-3.5 h-3.5 text-[#64748B]" />
                <span className="text-xs font-bold text-[#64748B]">{incident.assignedTo.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Thread */}
      <div className="space-y-4">
        {incident.messages.map((msg) => {
          const isMerchant = msg.userId === incident.userId;
          return (
            <div key={msg.id} className={`flex gap-4 ${isMerchant ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                isMerchant ? "bg-[#1E40AF] text-white" : "bg-white text-slate-900 text-slate-900 border border-slate-100 text-white"
              }`}>
                {msg.user.name?.charAt(0) ?? "?"}
              </div>
              <div className={`max-w-[75%] space-y-1 ${isMerchant ? "items-end" : "items-start"} flex flex-col`}>
                <div className={`rounded-2xl px-5 py-4 ${
                  isMerchant
                    ? "bg-[#1E40AF] text-white rounded-tr-md"
                    : "bg-white border border-[#E5E7EB] text-[#0F172A] rounded-tl-md shadow-sm"
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  {msg.attachmentUrl && (
                    <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
                      <img src={msg.attachmentUrl} alt="Attachment" className="mt-3 max-h-48 rounded-xl border border-white/20 object-cover hover:opacity-90 transition-opacity" />
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

      {/* Reply Area */}
      {incident.status !== "CLOSED" && incident.status !== "RESOLVED" && (
        <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] mb-4">Add a Reply</h3>
          <ReplyForm incidentId={incident.id} isAdmin={false} />
        </div>
      )}

      {(incident.status === "RESOLVED" || incident.status === "CLOSED") && (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[32px] p-6 text-center">
          <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto mb-2" />
          <p className="font-bold text-[#16A34A]">This incident has been {incident.status.toLowerCase()}.</p>
          <p className="text-sm text-[#64748B] mt-1">Open a new incident if you have further issues.</p>
        </div>
      )}
    </div>
  );
}
