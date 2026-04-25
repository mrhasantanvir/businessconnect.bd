"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getConversationsAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  return await prisma.unifiedConversation.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    orderBy: { lastMessageAt: "desc" }
  });
}

export async function getMessagesAction(conversationId: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  return await prisma.unifiedMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" }
  });
}

export async function sendMessageAction(data: {
  conversationId: string,
  content: string,
  source: string,
  externalId: string
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  // 1. Save Outbound Message to Database
  const message = await prisma.unifiedMessage.create({
    data: {
      conversationId: data.conversationId,
      content: data.content,
      senderId: session.id, // Current staff/merchant user
      senderName: session.name,
      direction: "OUTBOUND",
      isAiGenerated: false
    }
  });

  // 2. Update Conversation Last Message Metadata
  await prisma.unifiedConversation.update({
    where: { id: data.conversationId },
    data: {
       lastMessage: data.content,
       lastMessageAt: new Date()
    }
  });

  // 3. Routing: Send to actual platform (Logic Hub)
  console.log(`[ROUTING]: Sending ${data.source} message to ${data.externalId} -> ${data.content}`);
  
  if (data.source === "FACEBOOK") {
     // Trigger Meta Graph API (Mocked placeholder)
  } else if (data.source === "WHATSAPP") {
     // Trigger WhatsApp Business API (Mocked placeholder)
  }

  revalidatePath("/merchant/inbox");
  return { success: true, message };
}

export async function toggleAiAssistAction(conversationId: string, isAiEnabled: boolean) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  await prisma.unifiedConversation.update({
    where: { id: conversationId },
    data: { isAiEnabled }
  });

  revalidatePath("/merchant/inbox");
  return { success: true };
}
