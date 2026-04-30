import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
  console.log("SETTINGS:", JSON.stringify(settings, null, 2));

  const merchants = await prisma.merchantStore.findMany({
    take: 5,
    select: { id: true, name: true, tradeLicenseUrl: true, nidFrontUrl: true, nidBackUrl: true }
  });
  console.log("MERCHANTS:", JSON.stringify(merchants, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
