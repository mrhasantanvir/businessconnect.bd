import { db as prisma } from "@/lib/db";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * High-Availability AI Gateway
 * Implements priority-based fallback logic
 */
export async function askAI(prompt: string, systemPrompt?: string) {
  const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
  if (!settings) throw new Error("System settings not found");

  const priority = settings.aiProviderPriority.split(","); // e.g., ["OPENROUTER", "OPENAI", "GEMINI"]
  let lastError = null;

  for (const provider of priority) {
    try {
      console.log(`[AI Gateway] Attempting with: ${provider}`);
      
      switch (provider.trim()) {
        case "OPENROUTER":
          if (settings.openRouterKey) {
            return await callOpenRouter(prompt, settings.openRouterKey, settings.openRouterModel, systemPrompt);
          }
          break;

        case "OPENAI":
          if (settings.openaiApiKey) {
            return await callOpenAI(prompt, settings.openaiApiKey, settings.openaiModel, systemPrompt);
          }
          break;

        case "GEMINI":
          if (settings.geminiKey) {
            return await callGemini(prompt, settings.geminiKey, settings.geminiModel, systemPrompt);
          }
          break;

        case "DEEPSEEK":
          if (settings.deepseekKey) {
            return await callDeepSeek(prompt, settings.deepseekKey, settings.deepseekModel, systemPrompt);
          }
          break;

        case "GROQ":
          if (settings.groqKey) {
            return await callGroq(prompt, settings.groqKey, settings.groqModel, systemPrompt);
          }
          break;
      }
    } catch (error: any) {
      console.error(`[AI Gateway] ${provider} failed:`, error.message);
      lastError = error;
    }
  }

  throw lastError || new Error("All AI providers failed or are not configured.");
}

/**
 * DeepSeek Implementation (Ultra Low Cost)
 */
async function callDeepSeek(prompt: string, apiKey: string, model: string, system?: string) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "DeepSeek API Error");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Groq Implementation (High Speed)
 */
async function callGroq(prompt: string, apiKey: string, model: string, system?: string) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "Groq API Error");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * OpenRouter Implementation (Primary)
 */
async function callOpenRouter(prompt: string, apiKey: string, model: string, system?: string) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://businessconnect.bd", 
      "X-Title": "BusinessConnect.bd"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "OpenRouter API Error");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * OpenAI Implementation (Secondary)
 */
async function callOpenAI(prompt: string, apiKey: string, model: string, system?: string) {
  const openai = new OpenAI({ apiKey });
  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      ...(system ? [{ role: "system", content: system }] : []) as any,
      { role: "user", content: prompt }
    ]
  });
  return response.choices[0].message.content;
}

/**
 * Google Gemini Implementation (Final Fallback)
 */
async function callGemini(prompt: string, apiKey: string, model: string, system?: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelInstance = genAI.getGenerativeModel({ model: model });
  
  const combinedPrompt = system ? `${system}\n\nUser Question: ${prompt}` : prompt;
  const result = await modelInstance.generateContent(combinedPrompt);
  const response = await result.response;
  return response.text();
}
