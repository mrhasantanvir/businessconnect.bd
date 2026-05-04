import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function backfillAllReadableIds() {
  const { generateReadableId } = await import("../lib/id-generator");

  // 1. Merchant Stores
  const stores = await prisma.merchantStore.findMany({ where: { readableId: null } });
  console.log(`Backfilling ${stores.length} Merchant Stores...`);
  for (const s of stores) {
    const rid = await generateReadableId("MERCHANT");
    await prisma.merchantStore.update({ where: { id: s.id }, data: { readableId: rid } });
    console.log(`Store ${s.id} -> ${rid}`);
    // Also ensure sequence exists
    await prisma.merchantSequence.upsert({
        where: { merchantStoreId: s.id },
        update: {},
        create: { merchantStoreId: s.id }
    });
  }

  // 2. Users
  const users = await prisma.user.findMany({ where: { readableId: null } });
  console.log(`Backfilling ${users.length} Users...`);
  for (const u of users) {
    const rid = await generateReadableId("MERCHANT"); // Default for existing users if role is merchant
    await prisma.user.update({ where: { id: u.id }, data: { readableId: rid } });
    console.log(`User ${u.id} -> ${rid}`);
  }

  // 3. Orders
  const orders = await prisma.order.findMany({ where: { readableId: null } });
  console.log(`Backfilling ${orders.length} Orders...`);
  for (const o of orders) {
    const rid = await generateReadableId("ORDER", o.merchantStoreId);
    await prisma.order.update({ where: { id: o.id }, data: { readableId: rid } });
    console.log(`Order ${o.id} -> ${rid}`);
  }

  console.log("Backfill complete.");
}

backfillAllReadableIds()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
