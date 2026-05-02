import { db as prisma } from "@/lib/db";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AiOptions {
  systemPrompt?: string;
  jsonMode?: boolean;
  imageUrl?: string;
  maxTokens?: number;
}

/**
 * High-Availability AI Gateway (Bulletproof Core)
 * Returns { content, provider }
 */
export async function askAI(prompt: string, options: AiOptions = {}) {
  const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
  if (!settings) throw new Error("System settings not found");

  const priority = settings.aiProviderPriority
    ? settings.aiProviderPriority.split(",").map(p => p.trim().toUpperCase())
    : ["GROQ", "OPENAI", "GEMINI"];

  let lastError = null;

  for (const provider of priority) {
    try {
      console.log(`[AI Gateway] Attempting with: ${provider} (Vision: ${!!options.imageUrl})`);
      
      let content = "";
      switch (provider) {
        case "GROQ":
          if (settings.groqKey) {
            content = await callGroq(prompt, settings.groqKey, settings.groqModel, options);
          }
          break;

        case "OPENAI":
          if (settings.openaiApiKey) {
            content = await callOpenAI(prompt, settings.openaiApiKey, settings.openaiModel, options);
          }
          break;

        case "GEMINI":
          if (settings.geminiKey) {
            content = await callGemini(prompt, settings.geminiKey, settings.geminiModel, options);
          }
          break;

        case "DEEPSEEK":
          if (settings.deepseekKey && !options.imageUrl) {
            content = await callDeepSeek(prompt, settings.deepseekKey, settings.deepseekModel, options);
          }
          break;

        case "OPENROUTER":
          if (settings.openRouterKey) {
            content = await callOpenRouter(prompt, settings.openRouterKey, settings.openRouterModel, options);
          }
          break;
      }

      if (content) return { content, provider };
    } catch (error: any) {
      console.error(`[AI Gateway] ${provider} failed:`, error.message);
      lastError = error;
    }
  }

  throw lastError || new Error("All AI providers failed or are not configured.");
}

/**
 * Specialized Vision Gateway Wrapper
 */
export async function askAiVision(imageUrl: string, prompt: string, systemPrompt?: string) {
  return await askAI(prompt, { imageUrl, systemPrompt, jsonMode: true });
}

/**
 * DeepSeek Implementation
 */
async function callDeepSeek(prompt: string, apiKey: string, model: string, options: AiOptions) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
        { role: "user", content: prompt }
      ],
      max_tokens: options.maxTokens || 2048,
      response_format: options.jsonMode ? { type: "json_object" } : undefined
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
 * Groq Implementation (High Speed + Vision Support)
 */
async function callGroq(prompt: string, apiKey: string, model: string, options: AiOptions) {
  // If vision is requested, use a vision-capable model if the default isn't
  let finalModel = model;
  if (options.imageUrl && !model.includes("vision")) {
    finalModel = "llama-3.2-11b-vision-preview";
  }

  const messages: any[] = [];
  if (options.systemPrompt) messages.push({ role: "system", content: options.systemPrompt });
  
  if (options.imageUrl) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: options.imageUrl } }
      ]
    });
  } else {
    messages.push({ role: "user", content: prompt });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: finalModel,
      messages,
      max_tokens: options.maxTokens || 2048,
      response_format: options.jsonMode ? { type: "json_object" } : undefined
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
 * OpenRouter Implementation
 */
async function callOpenRouter(prompt: string, apiKey: string, model: string, options: AiOptions) {
  const messages: any[] = [];
  if (options.systemPrompt) messages.push({ role: "system", content: options.systemPrompt });
  
  if (options.imageUrl) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: options.imageUrl } }
      ]
    });
  } else {
    messages.push({ role: "user", content: prompt });
  }

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
      messages,
      max_tokens: options.maxTokens || 2048
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
 * OpenAI Implementation (Supports Vision)
 */
async function callOpenAI(prompt: string, apiKey: string, model: string, options: AiOptions) {
  const openai = new OpenAI({ apiKey });
  
  const messages: any[] = [];
  if (options.systemPrompt) messages.push({ role: "system", content: options.systemPrompt });
  
  if (options.imageUrl) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: options.imageUrl } }
      ]
    });
  } else {
    messages.push({ role: "user", content: prompt });
  }

  const response = await openai.chat.completions.create({
    model: model,
    messages,
    max_tokens: options.maxTokens || 2048,
    response_format: options.jsonMode ? { type: "json_object" } : undefined
  });
  return response.choices[0].message.content;
}

/**
 * Google Gemini Implementation (Supports Vision)
 */
async function callGemini(prompt: string, apiKey: string, model: string, options: AiOptions) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelInstance = genAI.getGenerativeModel({ 
    model: model,
    generationConfig: options.jsonMode ? { responseMimeType: "application/json" } : undefined
  });
  
  let result;
  if (options.imageUrl) {
    // Gemini handles base64 directly or via URL
    // For simplicity, we assume URL is provided or handled by the caller
    // In our case, NID extraction passes base64 data URLs
    const isBase64 = options.imageUrl.startsWith("data:");
    let part: any;
    
    if (isBase64) {
      const match = options.imageUrl.match(/^data:(.+);base64,(.+)$/);
      if (match) {
        part = {
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        };
      }
    }

    if (!part) {
      // Fallback for standard URLs (though Gemini prefers buffers/base64 for inline)
      // This is a simplification
      result = await modelInstance.generateContent([
        options.systemPrompt ? `${options.systemPrompt}\n\n${prompt}` : prompt,
        options.imageUrl
      ]);
    } else {
      result = await modelInstance.generateContent([
        options.systemPrompt ? `${options.systemPrompt}\n\n${prompt}` : prompt,
        part
      ]);
    }
  } else {
    const combinedPrompt = options.systemPrompt ? `${options.systemPrompt}\n\nUser Question: ${prompt}` : prompt;
    result = await modelInstance.generateContent(combinedPrompt);
  }

  const response = await result.response;
  return response.text();
}

