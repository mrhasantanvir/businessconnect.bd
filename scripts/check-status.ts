import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const merchants = await prisma.merchantStore.findMany({
    select: { id: true, name: true, activationStatus: true, isArchived: true }
  });
  console.log("MERCHANTS_STATUS:", JSON.stringify(merchants, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
