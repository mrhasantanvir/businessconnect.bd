import { db as prisma } from "./src/lib/db";

async function fix() {
  try {
    console.log("Dropping problematic indexes...");
    await prisma.$executeRawUnsafe(`ALTER TABLE Customer DROP INDEX Customer_readableId_key`);
    await prisma.$executeRawUnsafe(`ALTER TABLE MerchantSequence DROP INDEX MerchantSequence_merchantStoreId_key`);
    console.log("Done.");
  } catch (err) {
    console.error("Fix error:", err);
  } finally {
    process.exit(0);
  }
}

fix();
