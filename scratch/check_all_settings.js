const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllSettings() {
  const allSettings = await prisma.systemSettings.findMany();
  console.log("All SystemSettings Records:", JSON.stringify(allSettings, null, 2));
  process.exit(0);
}

checkAllSettings();
