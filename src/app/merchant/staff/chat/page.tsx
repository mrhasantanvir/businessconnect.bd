import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  MessageSquare, Zap, 
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { InternalChatWindow } from "./InternalChatWindow";
import { ChatClientWrapper } from "./ChatClientWrapper";
import { ChatSidebarClient } from "./ChatSidebarClient";

export default async function StaffChatHubPage({ searchParams }: { searchParams: { channel?: string, userId?: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const merchantStoreId = session.merchantStoreId;
  if (!merchantStoreId) redirect("/dashboard");

  const staffProfile = await prisma.staffProfile.findUnique({
    where: { userId: session.userId },
    select: { hasAcceptedChatPolicy: true }
  });

  const hasAccepted = staffProfile?.hasAcceptedChatPolicy || session.role === "MERCHANT";

  // Fetch All Channels (Departmental + Custom Groups)
  // If not MERCHANT, only show channels where user is a member
  const dbChannels = await prisma.chatChannel.findMany({
    where: { 
      merchantStoreId,
      OR: [
        { type: { startsWith: "DEPARTMENT_" } },
        { type: "CUSTOM_GROUP" }
      ],
      ...(session.role !== "MERCHANT" ? {
        members: { some: { userId: session.userId } }
      } : {})
    },
    orderBy: { createdAt: "asc" }
  });

  const channels = dbChannels.map(c => ({
    ...c,
    iconType: c.type === "DEPARTMENT_LOGISTICS" ? "TRUCK" : 
              c.type === "DEPARTMENT_INVENTORY" ? "WAREHOUSE" : 
              c.type === "DEPARTMENT_SUPPORT" ? "SUPPORT" : "MESSAGE"
  }));

  let activeChannelId = (await searchParams).channel;
  const targetUserId = (await searchParams).userId;
  const isMerchant = session.role === "MERCHANT";

  if (targetUserId) {
    const { getOrCreatePrivateChannelAction } = await import("./actions");
    const res = await getOrCreatePrivateChannelAction(targetUserId);
    if (res.success) activeChannelId = res.channelId;
  }

  if (!activeChannelId && channels.length > 0) {
    activeChannelId = channels[0].id;
  }

  const activeChannel = activeChannelId 
    ? await prisma.chatChannel.findUnique({ where: { id: activeChannelId } })
    : null;

  const colleagues = await prisma.user.findMany({
    where: { 
      merchantStoreId, 
      id: { not: session.userId },
      role: { in: ["STAFF", "MERCHANT"] }
    },
    select: { id: true, name: true, role: true, phone: true }
  });

  return (
    <ChatClientWrapper hasAcceptedPolicy={hasAccepted}>
      <div className="max-w-7xl mx-auto h-[calc(100vh-180px)] flex gap-8 animate-in fade-in duration-700">
        
        {/* Sidebar */}
        <div className="w-80 flex flex-col gap-6 h-full overflow-hidden">
           <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-4 shadow-2xl shrink-0">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="w-6 h-6 text-[#BEF264]" />
                 <h2 className="text-xl font-black tracking-tight uppercase leading-none">Internal<br/>Channels</h2>
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Moderated by GPT-4o Agent</p>
           </div>

           <ChatSidebarClient 
             channels={channels} 
             colleagues={colleagues} 
             activeChannelId={activeChannelId}
             isMerchant={isMerchant}
           />

           <div className="p-6 bg-amber-50 border border-amber-100 rounded-[32px] shrink-0">
              <div className="flex items-center gap-2 mb-2">
                 <Zap size={14} className="text-amber-600" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Zero-Gossip Policy</span>
              </div>
              <p className="text-[9px] font-bold text-amber-800 leading-relaxed uppercase italic">
                 System logs are audited by Merchant.
              </p>
           </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
           {activeChannel ? (
             <InternalChatWindow 
               channelId={activeChannel.id} 
               title={activeChannel.type === "PRIVATE" ? (activeChannel.name?.split("&").find(n => !n.includes(session.name || ""))?.trim() || activeChannel.name || "Private Chat") : (activeChannel.name || "Departmental Chat")} 
               contextInfo={activeChannel.type === "PRIVATE" ? "Secure 1-on-1 Session" : 
                            activeChannel.type === "CUSTOM_GROUP" ? "Official Store Group" :
                            `Official ${activeChannel.type.replace("DEPARTMENT_", "")} Channel`}
               isMerchant={isMerchant}
               allColleagues={colleagues}
             />
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <MessageSquare className="w-20 h-20 text-slate-100 mb-6" />
                <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">No Active Stream</h3>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Select a channel or colleague to begin.</p>
             </div>
           )}
        </div>

      </div>
    </ChatClientWrapper>
  );
}
