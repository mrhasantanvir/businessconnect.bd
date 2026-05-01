const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:@localhost:3306/sql_businessconnect_bd"
    }
  }
});

async function main() {
  try {
    const users = await prisma.user.count();
    console.log('Users count:', users);
    const merchants = await prisma.merchantStore.count();
    console.log('Merchants count:', merchants);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
