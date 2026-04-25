import { Worker } from "bullmq";
import { db as prisma } from "@/lib/db";
import { generateAiResponse } from "./inference";

/**
 * AI Sales Recovery Worker
 * This worker processes delayed sequences for abandoned chats.
 */
export async function startRecoveryWorker() {
  console.log("AI-Commerce: Recovery Worker starting...");

  const worker = new Worker("recovery-queue", async (job) => {
    const { conversationId, merchantStoreId, step } = job.data;
    
    console.log(`Analyzing Recovery Step ${step} for Lead: ${conversationId}`);

    // Check if customer placed an order in the meantime
    const lastOrder = await prisma.order.findFirst({
       where: { merchantStoreId, customerId: conversationId },
       orderBy: { createdAt: "desc" }
    });

    if (lastOrder && (new Date().getTime() - lastOrder.createdAt.getTime() < 86400000)) {
       console.log(`Lead ${conversationId} converted to Order. Sequence terminating.`);
       return { status: "CONVERTED" };
    }

    // Still no order? Send follow-up AI message
    const kb = await prisma.knowledgeBase.findFirst({ where: { merchantStoreId } });
    const recoveryPrompt = `The customer started a chat but hasn't ordered. This is step ${step} of follow-up. 
       Gently remind them and offer a discount if it's step 3. 
       Context: ${kb?.content || ""}`;

    const followUp = await generateAiResponse({
       merchantStoreId,
       prompt: recoveryPrompt,
       model: "gpt-4o"
    });

    console.log(`[FB RECOVERY TRIGGERED]: Sending follow-up ${step} -> ${followUp}`);
    // In production: Send to FB Graph API

    return { status: "FOLLOW_UP_SENT", step };
  }, {
     connection: { host: "localhost", port: 6379 } // Redis Configuration
  });

  return worker;
}
