const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const pending = await prisma.merchantStore.count({ where: { activationStatus: "PENDING" } });
  const docs = await prisma.merchantStore.count({ where: { activationStatus: "DOCUMENTS_REJECTED" } });
  console.log(`Pending Onboarding: ${pending}`);
  console.log(`Pending Documents: ${docs}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
