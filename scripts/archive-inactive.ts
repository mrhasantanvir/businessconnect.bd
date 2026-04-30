import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting automatic archival check...");
  
  // 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  console.log(`Searching for users inactive since: ${sixMonthsAgo.toISOString()}`);

  // Find users who haven't been active for 6 months and are not already archived
  const inactiveUsers = await prisma.user.findMany({
    where: {
      lastActiveAt: {
        lt: sixMonthsAgo
      },
      isArchived: false,
      role: "MERCHANT"
    },
    select: {
      id: true,
      merchantStoreId: true,
      name: true
    }
  });

  console.log(`Found ${inactiveUsers.length} inactive merchants.`);

  for (const user of inactiveUsers) {
    if (!user.merchantStoreId) continue;

    console.log(`Archiving store ${user.merchantStoreId} for user ${user.name}...`);
    
    await prisma.$transaction([
      prisma.merchantStore.update({
        where: { id: user.merchantStoreId },
        data: { isArchived: true, archivedAt: new Date() }
      }),
      prisma.user.updateMany({
        where: { merchantStoreId: user.merchantStoreId },
        data: { isArchived: true, archivedAt: new Date() }
      })
    ]);
  }

  console.log("Archival process completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
