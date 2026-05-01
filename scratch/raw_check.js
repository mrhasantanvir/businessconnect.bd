const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function rawCheck() {
  try {
    const result = await prisma.$queryRaw`SELECT * FROM SystemSettings`;
    console.log("Raw SystemSettings Rows:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Error running raw query:", e);
  }
  process.exit(0);
}

rawCheck();
