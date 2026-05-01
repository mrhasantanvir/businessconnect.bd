const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSettings() {
  const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
  console.log("GLOBAL Settings:", JSON.stringify(settings, null, 2));
  process.exit(0);
}

checkSettings();
