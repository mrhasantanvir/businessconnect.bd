"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Toggle Staff SIP Status
 */
export async function updateSipStatus(userId: string, status: "OFFLINE" | "AVAILABLE" | "BREAK" | "MEAL" | "BUSY") {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        sipStatus: status,
        lastActiveAt: new Date()
      }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update status" };
  }
}

/**
 * Find the best agent for an incoming call (Smart Routing)
 * Logic: Round Robin among AVAILABLE agents
 */
export async function getNextAvailableAgent(merchantStoreId: string) {
  try {
    const availableAgents = await prisma.user.findMany({
      where: { 
        merchantStoreId, 
        role: "STAFF",
        sipStatus: "AVAILABLE"
      },
      orderBy: { lastActiveAt: "asc" } // Oldest active gets the call (Round Robin)
    });

    if (availableAgents.length === 0) return null;

    const selectedAgent = availableAgents[0];

    // Mark agent as BUSY immediately to prevent dual-routing
    await prisma.user.update({
      where: { id: selectedAgent.id },
      data: { sipStatus: "BUSY" }
    });

    return selectedAgent;
  } catch (error) {
    return null;
  }
}

/**
 * Log Call with AI Insights
 */
export async function logAdvancedCall(data: {
  userId: string;
  merchantStoreId: string;
  orderId?: string;
  from: string;
  to: string;
  duration: number;
  direction: "INBOUND" | "OUTBOUND";
  transcription?: string;
}) {
  try {
    // 1. Generate AI Summary (Simulated for now, can use OpenAI/Gemini)
    let aiSummary = "Summary pending analysis...";
    let sentiment = "NEUTRAL";

    if (data.transcription) {
      // Here you would call Gemini API:
      // const aiResponse = await analyzeCall(data.transcription);
      // aiSummary = aiResponse.summary;
      // sentiment = aiResponse.sentiment;
      aiSummary = "Customer inquired about delivery timeline. Agent confirmed shipment via Steadfast.";
      sentiment = "POSITIVE";
    }

    const log = await prisma.callLog.create({
      data: {
        ...data,
        aiSummary,
        sentiment,
        status: "COMPLETED"
      }
    });

    // 2. Set agent back to AVAILABLE if they were busy
    await prisma.user.update({
      where: { id: data.userId },
      data: { sipStatus: "AVAILABLE" }
    });

    return { success: true, logId: log.id };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Audit a Call Log (Notes & Rating)
 */
export async function auditCallLog(data: {
  logId: string;
  auditNote: string;
  rating: number;
  auditorId: string;
}) {
  try {
    await prisma.callLog.update({
      where: { id: data.logId },
      data: {
        auditNote: data.auditNote,
        rating: data.rating,
        auditedById: data.auditorId,
        auditedAt: new Date()
      }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Audit failed" };
  }
}
