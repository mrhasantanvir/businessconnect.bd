import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function backfillOrderReadableIds() {
  const { generateReadableId } = await import("../lib/id-generator");
  
  const orders = await prisma.order.findMany({
    where: { readableId: null }
  });

  console.log(`Backfilling ${orders.length} orders...`);

  for (const order of orders) {
    const readableId = await generateReadableId("ORDER", order.merchantStoreId);
    await prisma.order.update({
      where: { id: order.id },
      data: { readableId }
    });
    console.log(`Updated Order ${order.id} -> ${readableId}`);
  }

  console.log("Backfill complete.");
}

backfillOrderReadableIds()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
