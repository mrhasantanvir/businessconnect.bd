import { db as prisma } from "../../src/lib/db";

async function checkSettings() {
  const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
  console.log("AI Settings:", {
    priority: settings?.aiProviderPriority,
    groq: !!settings?.groqKey,
    openai: !!settings?.openaiApiKey,
    gemini: !!settings?.geminiKey,
    groqModel: settings?.groqModel,
    openaiModel: settings?.openaiModel,
    geminiModel: settings?.geminiModel
  });
}

checkSettings();
