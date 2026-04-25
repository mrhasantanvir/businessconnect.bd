import { db as prisma } from "@/lib/db";
import { askAI } from "./gateway";

/**
 * Unified AI Chatbot Engine
 * Handles Messenger/WhatsApp message logic with inventory & order tracking integration
 */
export async function processChatbotMessage(data: {
  merchantStoreId: string;
  senderId: string;
  platform: "MESSENGER" | "WHATSAPP";
  messageText: string;
  attachments?: any[];
}) {
  const { merchantStoreId, messageText, platform, senderId } = data;

  // 1. Fetch Store Context (Products, Active Orders for this user if possible)
  const store = await prisma.merchantStore.findUnique({
    where: { id: merchantStoreId },
    include: { products: { take: 5 } } // Sample products for context
  });

  if (!store) throw new Error("Store not found");

  // 2. Build System Prompt with Enterprise Tone & Functional Capabilities
  const systemPrompt = `
    You are an AI Sales & Support Assistant for "${store.name}".
    Your goal is to help customers buy products, track orders, and answer questions politely.
    
    CAPABILITIES:
    - You can check stock and prices for products.
    - You can track order status.
    - You can initiate a purchase by asking for details.
    
    CURRENT CONTEXT:
    - Store: ${store.name}
    - Platform: ${platform}
    - Products: ${store.products.map(p => `${p.name} (৳${p.price})`).join(", ")}
    
    RESPONSE RULES:
    1. Always use English numbers (e.g., 250, not ২৫০).
    2. If the user wants to buy something, ask for their: Full Name, Phone Number, and Delivery Address.
    3. If the user asks for order status, ask for their Order ID or Phone Number.
    4. If you need to perform an action, include a JSON block at the END of your message:
       { "action": "CHECK_STOCK", "product": "product_name" }
       { "action": "TRACK_ORDER", "query": "order_id_or_phone" }
       { "action": "CREATE_ORDER", "details": { "name": "...", "phone": "...", "address": "...", "product": "..." } }
       { "action": "HUMAN_HANDOVER" }
    
    Tone: Professional, Efficient, and Enterprise-grade.
  `;

  // 3. Get AI Response
  const aiResponse = await askAI(messageText, systemPrompt);

  // 4. Handle Post-AI Action Parsing (Tool Use Simulation)
  let finalResponse = aiResponse;
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    try {
      const actionData = JSON.parse(jsonMatch[0]);
      
      if (actionData.action === "CHECK_STOCK") {
        const product = await prisma.product.findFirst({
          where: { 
            merchantStoreId,
            name: { contains: actionData.product, mode: 'insensitive' }
          }
        });
        
        if (product) {
          finalResponse = aiResponse.replace(jsonMatch[0], "") + `\n\n[System]: I found ${product.name}. Current stock: ${product.stock} units. Price: ৳${product.price.toLocaleString('en-US')}.`;
        } else {
          finalResponse = aiResponse.replace(jsonMatch[0], "") + `\n\n[System]: I couldn't find that exact product in our inventory.`;
        }
      }

      if (actionData.action === "TRACK_ORDER") {
        const order = await prisma.order.findFirst({
          where: {
            merchantStoreId,
            OR: [
              { id: { contains: actionData.query } },
              { customerPhone: actionData.query }
            ]
          },
          orderBy: { createdAt: 'desc' }
        });

        if (order) {
           finalResponse = aiResponse.replace(jsonMatch[0], "") + `\n\n[System]: Order Found! Status: ${order.status}. Last updated: ${order.updatedAt.toLocaleDateString('en-US')}.`;
        } else {
           finalResponse = aiResponse.replace(jsonMatch[0], "") + `\n\n[System]: I couldn't find any order with that ID or Phone number.`;
        }
      }

      // Add more action handlers as needed (CREATE_ORDER, etc.)
    } catch (e) {
      console.error("Action parsing error:", e);
    }
  }

  // 5. Deduct AI Credit (Reusing logic from inference.ts)
  await prisma.$transaction([
    prisma.merchantStore.update({
      where: { id: merchantStoreId },
      data: { aiBalance: { decrement: store.aiRate } }
    }),
    prisma.aiTransaction.create({
      data: {
        merchantStoreId: merchantStoreId,
        amount: -store.aiRate,
        type: "USAGE",
        description: `AI Chatbot: ${platform} Interaction`
      }
    })
  ]);

  return {
    text: finalResponse.replace(/\{[\s\S]*\}/, "").trim(),
    platform,
    senderId
  };
}
