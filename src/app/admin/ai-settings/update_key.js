import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const apiKey = "REPLACE_WITH_YOUR_KEY";
  
  const updated = await prisma.systemSettings.upsert({
    where: { id: "GLOBAL" },
    update: {
      openaiApiKey: apiKey,
      openaiModel: "gpt-4o"
    },
    create: {
      id: "GLOBAL",
      openaiApiKey: apiKey,
      openaiModel: "gpt-4o"
    }
  });

  console.log("System Settings updated with new OpenAI API Key");
  console.log("ID:", updated.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
