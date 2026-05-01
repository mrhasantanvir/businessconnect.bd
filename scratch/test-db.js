const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const stores = await prisma.merchantStore.findMany({ take: 1 });
    console.log('Connection successful. Found store:', stores[0]?.name);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
