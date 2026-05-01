const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmins() {
  const admins = await prisma.user.findMany({ where: { role: "SUPER_ADMIN" } });
  console.log("Super Admins:", JSON.stringify(admins, null, 2));
  process.exit(0);
}

checkAdmins();
