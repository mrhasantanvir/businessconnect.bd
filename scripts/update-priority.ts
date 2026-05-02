import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating AI provider priority to GROQ,OPENAI,GEMINI...");
  await prisma.systemSettings.upsert({
    where: { id: "GLOBAL" },
    update: { aiProviderPriority: "GROQ,OPENAI,GEMINI,DEEPSEEK" },
    create: { 
      id: "GLOBAL",
      aiProviderPriority: "GROQ,OPENAI,GEMINI,DEEPSEEK"
    }
  });
  console.log("Successfully updated priority.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
