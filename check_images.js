const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  const products = await db.product.findMany({
    take: 10,
    select: { id: true, name: true, image: true }
  });
  console.log(JSON.stringify(products, null, 2));
}

main().catch(console.error).finally(() => db.$disconnect());
