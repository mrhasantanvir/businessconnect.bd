import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
  
  if (settings && (settings.groqModel === "llama-3.1-70b-versatile" || !settings.groqModel)) {
    console.log("Updating Groq model from", settings.groqModel, "to llama-3.3-70b-versatile");
    await prisma.systemSettings.update({
      where: { id: "GLOBAL" },
      data: { groqModel: "llama-3.3-70b-versatile" }
    });
    console.log("Successfully updated Groq model.");
  } else {
    console.log("Groq model already updated or custom model in use.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
