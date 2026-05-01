const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function purgeData() {
  console.log("Starting full SaaS data purge...");

  try {
    // 1. Delete all MerchantStores (This should trigger cascades for related models if configured)
    // Note: In some setups, manual deletion of child records is safer to avoid constraint errors.
    
    const stores = await prisma.merchantStore.findMany({ select: { id: true } });
    console.log(`Found ${stores.length} merchant stores to remove.`);

    // 2. Delete all Users that are not SUPER_ADMIN
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: {
          not: "SUPER_ADMIN"
        }
      }
    });
    console.log(`Deleted ${deletedUsers.count} non-admin users (Merchants, Staff, etc.).`);

    // 3. Delete all MerchantStore records
    const deletedStores = await prisma.merchantStore.deleteMany({});
    console.log(`Deleted ${deletedStores.count} merchant stores.`);

    // 4. Reset some global settings if needed
    await prisma.systemSettings.updateMany({
      where: { id: "GLOBAL" },
      data: {
        // Any reset logic
      }
    }).catch(e => console.log("System settings reset skipped or failed (might not exist)."));

    console.log("Purge completed successfully.");
    
    // 5. Verify Super Admin remains
    const admins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
    console.log("Current Super Admins:");
    admins.forEach(a => console.log(`- ${a.name} (${a.email})`));

  } catch (error) {
    console.error("Purge failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

purgeData();
