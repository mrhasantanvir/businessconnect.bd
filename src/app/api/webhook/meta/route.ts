import { NextRequest, NextResponse } from "next/server";
import { processChatbotMessage } from "@/lib/ai/chatbot-engine";
import { db as prisma } from "@/lib/db";

/**
 * Unified Meta Webhook (Messenger & WhatsApp)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode && token) {
    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      return new Response(challenge, { status: 200 });
    } else {
      return new Response("Forbidden", { status: 403 });
    }
  }
  return new Response("Bad Request", { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Basic check for Messenger vs WhatsApp
  const isMessenger = body.object === "page";
  const isWhatsApp = body.object === "whatsapp_business_account";

  if (!isMessenger && !isWhatsApp) {
    return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
  }

  try {
    // 1. Extract Merchant/Store ID from Meta ID (Lookup in DB)
    // For demo/dev, we assume we have a mapping or use a default
    // Real implementation would look up store by body.entry[0].id (Page ID)
    const store = await prisma.merchantStore.findFirst(); // Fallback to first store for now
    if (!store) return NextResponse.json({ error: "No store found" });

    // 2. Extract Message Details
    let senderId = "";
    let messageText = "";
    
    if (isMessenger) {
      const entry = body.entry?.[0];
      const messaging = entry?.messaging?.[0];
      senderId = messaging?.sender?.id;
      messageText = messaging?.message?.text;
    } else if (isWhatsApp) {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];
      senderId = message?.from;
      messageText = message?.text?.body;
    }

    if (!messageText) return NextResponse.json({ status: "ok" });

    // 3. Process with AI Engine
    const result = await processChatbotMessage({
      merchantStoreId: store.id,
      senderId,
      platform: isMessenger ? "MESSENGER" : "WHATSAPP",
      messageText
    });

    // 4. Send Response back to Meta (Mocking the send API call for now)
    console.log(`[Chatbot] Sending to ${result.platform} (${result.senderId}): ${result.text}`);
    
    // In production, we'd use fetch() to call Meta Graph API:
    // await sendMetaMessage(result.platform, result.senderId, result.text);

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
