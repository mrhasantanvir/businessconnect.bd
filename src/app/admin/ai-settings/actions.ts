"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateAiGlobalSettingsAction(data: {
  openaiApiKey?: string,
  openaiModel?: string,
  openRouterKey?: string,
  openRouterModel?: string,
  geminiKey?: string,
  geminiModel?: string,
  deepseekKey?: string,
  deepseekModel?: string,
  groqKey?: string,
  groqModel?: string,
  aiProviderPriority?: string,
  googleVisionKey?: string,
  fbAppSecret?: string,
  aiCreditPrice?: number
}) {
  await prisma.systemSettings.upsert({
    where: { id: "GLOBAL" },
    update: data,
    create: { 
      id: "GLOBAL",
      ...data
    }
  });

  revalidatePath("/admin/ai-settings");
  return { success: true };
}

export async function rechargeMerchantAiBalanceAction(data: {
  merchantStoreId: string,
  amount: number,
  notes?: string
}) {
  await prisma.$transaction([
    prisma.merchantStore.update({
      where: { id: data.merchantStoreId },
      data: { aiBalance: { increment: data.amount } }
    }),
    prisma.aiTransaction.create({
      data: {
        merchantStoreId: data.merchantStoreId,
        amount: data.amount,
        type: "TOPUP",
        description: data.notes || "Manual Admin Top-up"
      }
    })
  ]);

  revalidatePath("/admin/merchants");
  return { success: true };
}

export async function testAiConnectionAction(provider: string) {
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
    if (!settings) throw new Error("Settings not found");

    if (provider === "OPENAI") {
      if (!settings.openaiApiKey) throw new Error("OpenAI API Key not configured");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.openaiApiKey.trim()}`
      };
      if (settings.openaiProjectId) headers["OpenAI-Project"] = settings.openaiProjectId.trim();

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: settings.openaiModel || "gpt-4o",
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 5
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "OpenAI error");
      return { success: true, message: data.choices[0].message.content };
    }

    if (provider === "GEMINI") {
      if (!settings.geminiKey) throw new Error("Gemini API Key not configured");
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.geminiModel || 'gemini-1.5-pro'}:generateContent?key=${settings.geminiKey.trim()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "hi" }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gemini error");
      return { success: true, message: data.candidates[0].content.parts[0].text };
    }

    if (provider === "GROQ") {
      if (!settings.groqKey) throw new Error("Groq API Key not configured");
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${settings.groqKey.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: settings.groqModel || "llama-3.1-70b-versatile",
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 5
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Groq error");
      return { success: true, message: data.choices[0].message.content };
    }

    if (provider === "DEEPSEEK") {
      if (!settings.deepseekKey) throw new Error("DeepSeek API Key not configured");
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${settings.deepseekKey.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: settings.deepseekModel || "deepseek-chat",
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 5
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "DeepSeek error");
      return { success: true, message: data.choices[0].message.content };
    }

    if (provider === "OPENROUTER") {
      if (!settings.openRouterKey) throw new Error("OpenRouter API Key not configured");
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${settings.openRouterKey.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: settings.openRouterModel || "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 5
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "OpenRouter error");
      return { success: true, message: data.choices[0].message.content };
    }

    throw new Error("Unsupported provider");
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
