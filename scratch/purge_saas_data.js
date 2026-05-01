const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function purgeData() {
  console.log("Starting deep SaaS data purge...");

  try {
    // 1. Delete dependent models first to avoid FK constraints
    console.log("Deleting dependent records...");
    
    // Order related
    await prisma.shipmentItem.deleteMany({});
    await prisma.shipment.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.orderActivity.deleteMany({});
    await prisma.order.deleteMany({});
    
    // Catalog related
    await prisma.warehouseStock.deleteMany({});
    await prisma.inventoryLog.deleteMany({});
    await prisma.warehouse.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.brand.deleteMany({});
    
    // CRM related
    await prisma.customer.deleteMany({});
    await prisma.customerProfile.deleteMany({});
    
    // Finance related
    await prisma.ledgerTransaction.deleteMany({});
    await prisma.accountCategory.deleteMany({});
    await prisma.businessAccount.deleteMany({});
    
    // Staff related (Already deleted by non-admin user delete but just in case)
    await prisma.staffProfile.deleteMany({});
    
    // Store Structure
    await prisma.branch.deleteMany({});
    await prisma.role.deleteMany({});
    
    // Other configs
    await prisma.courierConfig.deleteMany({});
    await prisma.payoutRequest.deleteMany({});

    // 2. Delete all non-admin users
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: {
          not: "SUPER_ADMIN"
        }
      }
    });
    console.log(`Deleted ${deletedUsers.count} non-admin users.`);

    // 3. Delete all MerchantStore records
    const deletedStores = await prisma.merchantStore.deleteMany({});
    console.log(`Deleted ${deletedStores.count} merchant stores.`);

    console.log("Purge completed successfully.");
    
    // 4. Verify Super Admin remains
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
