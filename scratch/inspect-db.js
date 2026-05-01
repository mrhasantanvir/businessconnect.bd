const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "mysql://root:@localhost:3306/sql_businessconnect_bd"
      }
    }
  });
  try {
    const tables = await prisma.$queryRawUnsafe(`SHOW TABLES`);
    console.log('Tables:', tables);
    
    const stores = await prisma.$queryRawUnsafe(`SELECT name FROM MerchantStore`);
    console.log('Stores:', stores);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
