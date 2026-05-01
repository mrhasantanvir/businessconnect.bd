const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "mysql://root:@localhost:3306/mysql"
      }
    }
  });
  try {
    const dbs = await prisma.$queryRawUnsafe(`SHOW DATABASES`);
    console.log('Databases:', dbs);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
