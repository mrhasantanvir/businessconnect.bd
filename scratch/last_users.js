const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function lastUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("Latest Users:", JSON.stringify(users, null, 2));
  process.exit(0);
}

lastUsers();
