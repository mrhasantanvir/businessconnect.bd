import { OpenAI } from "openai";
import { db as prisma } from "@/lib/db";

export interface ModerationResult {
  isProfessional: boolean;
  reason?: string;
  flagReason?: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

/**
 * AI Moderation Engine for Internal Staff Chat
 * Uses GPT-4o to analyze intent and professional tone.
 */
export async function moderateInternalMessage(data: {
  merchantStoreId: string,
  content: string,
  senderName: string
}): Promise<ModerationResult> {
  
  // Fetch Global Master Keys
  const settings = await prisma.systemSettings.findFirst();
  if (!settings?.openaiApiKey) {
    // If not configured, we allow but warn (or block depending on policy)
    return { isProfessional: true, severity: "LOW" };
  }

  const openai = new OpenAI({ apiKey: settings.openaiApiKey });

  const systemPrompt = `
    You are an AI Professional Supervisor for BusinessConnect.bd, an enterprise business OS.
    Your job is to moderate internal staff chat messages to ensure 100% professional conduct.
    
    CRITICAL RULES:
    1. BLOCK any romantic, flirty, or overly personal talk (e.g., "jaan", "baby", "I like you", "dating").
    2. BLOCK unprofessional gossip or irrelevant chat that has zero connection to business tasks.
    3. FLAG messages that use improper language or slang.
    4. ALLOW task-related talk, orders, logistics, inventory, and professional greetings.
    
    OUTPUT FORMAT (JSON ONLY):
    {
      "isProfessional": boolean,
      "reason": "Brief explanation why it was blocked (if blocked)",
      "flagReason": "Brief explanation for merchant (if suspicious but not blocked)",
      "severity": "LOW" | "MEDIUM" | "HIGH"
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Sender: ${data.senderName}\nMessage: "${data.content}"` }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      isProfessional: result.isProfessional ?? true,
      reason: result.reason,
      flagReason: result.flagReason,
      severity: result.severity || "LOW"
    };
  } catch (error) {
    console.error("AI_MODERATION_ERROR:", error);
    return { isProfessional: true, severity: "LOW" }; // Default to allow if AI fails
  }
}
