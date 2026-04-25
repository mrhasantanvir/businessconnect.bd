import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { generateAiResponse } from "@/lib/ai/inference";

/**
 * Facebook Webhook Hub
 * Handles verification and real-time messaging events from Meta
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || "businessconnect_ai_swarm";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Meta Webhook Verified Successfully.");
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (body.object === "page") {
    for (const entry of body.entry) {
      const messagingEvent = entry.messaging?.[0];

      if (messagingEvent?.message?.text) {
        const senderId = messagingEvent.sender.id;
        const recipientId = messagingEvent.recipient.id; // Merchant's Page ID
        const text = messagingEvent.message.text;

        // Find Merchant Config
        const config = await prisma.facebookConfig.findFirst({
           where: { pageId: recipientId },
           include: { merchantStore: true }
        });

        if (config && config.isActive) {
           console.log(`Processing AI reply for Lead: ${senderId}`);
           
           try {
              // 1. Sync to Unified Inbox (Conversation Upsert)
              const conversation = await prisma.unifiedConversation.upsert({
                 where: {
                    merchantStoreId_externalId_source: {
                       merchantStoreId: config.merchantStoreId,
                       externalId: senderId,
                       source: "FACEBOOK"
                    }
                 },
                 update: {
                    lastMessageAt: new Date(),
                    lastMessage: text
                 },
                 create: {
                    merchantStoreId: config.merchantStoreId,
                    externalId: senderId,
                    source: "FACEBOOK",
                    customerName: `FB Lead (${senderId.substring(0, 5)})`, // In prod: Fetch profile from Graph API
                    lastMessage: text
                 }
              });

              // 2. Save Inbound Message
              await prisma.unifiedMessage.create({
                 data: {
                    conversationId: conversation.id,
                    content: text,
                    senderId: senderId,
                    direction: "INBOUND",
                    isAiGenerated: false
                 }
              });

              // 3. Get AI Context & Generate Reply if enabled
              if (conversation.isAiEnabled) {
                 const kb = await prisma.knowledgeBase.findFirst({
                    where: { merchantStoreId: config.merchantStoreId, isIndexed: true }
                 });

                 const reply = await generateAiResponse({
                    merchantStoreId: config.merchantStoreId,
                    prompt: text,
                    context: kb?.content || "Standard Shopping Assistant"
                 });

                 if (reply) {
                    // Save AI Reply to Inbox
                    await prisma.unifiedMessage.create({
                       data: {
                          conversationId: conversation.id,
                          content: reply,
                          senderId: "SYSTEM_AI",
                          direction: "OUTBOUND",
                          isAiGenerated: true
                       }
                    });

                    console.log(`[FB AI REPLY SENT]: To ${senderId} -> ${reply}`);
                 }
              }
           } catch (err) {
              console.error("AI Auto-Reply / Inbox Sync Failed:", err);
           }
        }
      }
    }
    return NextResponse.json({ status: "EVENT_RECEIVED" });
  }

  return NextResponse.json({ error: "Invalid Object" }, { status: 404 });
}
