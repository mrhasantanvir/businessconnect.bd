import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminChatQueueUI } from "@/components/support/AdminChatQueueUI";

export default async function AdminChatQueuePage() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") redirect("/login");

  // Fetch all active support chats
  const activeChats = await prisma.incident.findMany({
    where: {
      subject: "PLATFORM_SUPPORT_CHAT",
      status: { not: "CLOSED" }
    },
    include: {
      merchantStore: true,
      user: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="h-[calc(100vh-6rem)] w-full max-w-7xl mx-auto flex bg-white border border-[#E5E7EB] shadow-2xl overflow-hidden animate-in fade-in duration-500">
      <AdminChatQueueUI initialChats={activeChats} currentAdminId={session.userId} />
    </div>
  );
}
