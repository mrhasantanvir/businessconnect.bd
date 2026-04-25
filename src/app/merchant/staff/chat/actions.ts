"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { moderateInternalMessage } from "@/lib/ai/moderation";
import { revalidatePath } from "next/cache";

/**
 * Ensures a chat channel exists for a specific order.
 */
export async function getOrCreateOrderChannelAction(orderId: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { merchantStoreId: true }
  });

  if (!order || order.merchantStoreId !== session.merchantStoreId) {
    throw new Error("Order not found or access denied");
  }

  let channel = await prisma.chatChannel.findUnique({
    where: { orderId: orderId }
  });

  if (!channel) {
    channel = await prisma.chatChannel.create({
      data: {
        orderId: orderId,
        merchantStoreId: session.merchantStoreId,
        type: "ORDER_CONTEXT"
      }
    });
  }

  return { success: true, channelId: channel.id };
}

/**
 * Sends a message with AI moderation.
 */
export async function sendInternalMessageAction(data: {
  channelId: string,
  content: string,
  attachments?: string[]
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  // AI Moderation Step
  const moderation = await moderateInternalMessage({
    merchantStoreId: session.merchantStoreId,
    content: data.content,
    senderName: session.name || "Staff"
  });

  if (!moderation.isProfessional) {
    // Log the attempted unprofessional message for the merchant
    await prisma.chatModerationAlert.create({
      data: {
        merchantStoreId: session.merchantStoreId,
        senderId: session.userId,
        messageContent: data.content,
        aiReason: moderation.reason || "Unprofessional content",
        severity: moderation.severity
      }
    });

    return { 
      success: false, 
      error: "MESSAGE_BLOCKED: " + (moderation.reason || "This message is not professional.") 
    };
  }

  // Save the message
  const message = await prisma.internalMessage.create({
    data: {
      channelId: data.channelId,
      senderId: session.userId,
      content: data.content,
      attachmentUrls: data.attachments ? JSON.stringify(data.attachments) : null,
      isFlagged: moderation.flagReason ? true : false,
      flagReason: moderation.flagReason || null,
    },
    include: { sender: { select: { name: true, role: true } } }
  });

  // If flagged (but not blocked), alert the merchant silently
  if (moderation.flagReason) {
    await prisma.chatModerationAlert.create({
      data: {
        merchantStoreId: session.merchantStoreId,
        senderId: session.userId,
        messageContent: data.content,
        aiReason: moderation.flagReason,
        severity: moderation.severity
      }
    });
  }

  return { success: true, message };
}

/**
 * Fetches messages for a channel.
 */
export async function getChatMessagesAction(channelId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Check membership if not MERCHANT and not Order/Private channel
  if (session.role !== "MERCHANT") {
    const channel = await prisma.chatChannel.findUnique({ where: { id: channelId } });
    if (channel?.type !== "ORDER" && channel?.type !== "PRIVATE") {
      const isMember = await prisma.chatChannelMember.findUnique({
        where: { channelId_userId: { channelId, userId: session.userId } }
      });
      if (!isMember) throw new Error("Not a member of this channel");
    }
  }

  const messages = await prisma.internalMessage.findMany({
    where: { channelId: channelId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { name: true, role: true } } },
    take: 50
  });

  return { success: true, messages };
}

/**
 * Fetches moderation alerts for the merchant audit page.
 */
export async function getChatModerationAlertsAction() {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  const alerts = await prisma.chatModerationAlert.findMany({
    where: { merchantStoreId: session.merchantStoreId! },
    orderBy: { createdAt: "desc" },
    include: { sender: { select: { name: true, role: true } } }
  });

  return { success: true, alerts };
}

/**
 * Accepts the professional chat policy.
 */
export async function acceptChatPolicyAction() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const profile = await prisma.staffProfile.findUnique({
    where: { userId: session.userId }
  });

  if (!profile) throw new Error("Staff profile not found");

  await prisma.staffProfile.update({
    where: { id: profile.id },
    data: {
      hasAcceptedChatPolicy: true,
      chatPolicyAcceptedAt: new Date()
    }
  });

  revalidatePath("/merchant/staff/chat");
  return { success: true };
}

/**
 * Find or Create a private 1-on-1 chat channel.
 */
export async function getOrCreatePrivateChannelAction(targetUserId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const myId = session.userId;
  const merchantStoreId = session.merchantStoreId!;

  // Sort IDs to keep consistency (participant1 < participant2)
  const [p1, p2] = [myId, targetUserId].sort();

  let channel = await prisma.chatChannel.findFirst({
    where: {
      merchantStoreId,
      type: "PRIVATE",
      participant1Id: p1,
      participant2Id: p2
    }
  });

  if (!channel) {
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    channel = await prisma.chatChannel.create({
      data: {
        merchantStoreId,
        type: "PRIVATE",
        participant1Id: p1,
        participant2Id: p2,
        name: `Private: ${session.name} & ${targetUser?.name || 'Staff'}`
      }
    });
  }

  return { success: true, channelId: channel.id };
}

/**
 * Creates a custom group channel (Merchant only).
 */
export async function createCustomChannelAction(name: string) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  const channel = await prisma.chatChannel.create({
    data: {
      merchantStoreId: session.merchantStoreId!,
      name,
      type: "CUSTOM_GROUP"
    }
  });

  revalidatePath("/merchant/staff/chat");
  return { success: true, channelId: channel.id };
}

/**
 * Add a member to a channel.
 */
export async function addChannelMemberAction(channelId: string, userId: string) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  await prisma.chatChannelMember.upsert({
    where: { channelId_userId: { channelId, userId } },
    update: {},
    create: { channelId, userId }
  });

  revalidatePath("/merchant/staff/chat");
  return { success: true };
}

/**
 * Remove a member from a channel.
 */
export async function removeChannelMemberAction(channelId: string, userId: string) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") throw new Error("Unauthorized");

  await prisma.chatChannelMember.delete({
    where: { channelId_userId: { channelId, userId } }
  });

  revalidatePath("/merchant/staff/chat");
  return { success: true };
}

/**
 * Get channel members.
 */
export async function getChannelMembersAction(channelId: string) {
  return await prisma.chatChannelMember.findMany({
    where: { channelId },
    include: { user: { select: { id: true, name: true, role: true } } }
  });
}
