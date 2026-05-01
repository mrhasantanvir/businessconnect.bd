const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDb() {
  // 1. Delete all staff profiles
  const deletedProfiles = await prisma.staffProfile.deleteMany();
  console.log(`Deleted ${deletedProfiles.count} staff profiles.`);

  // 2. Delete users with role STAFF
  const deletedUsers = await prisma.user.deleteMany({
    where: { role: "STAFF" }
  });
  console.log(`Deleted ${deletedUsers.count} staff users.`);

  // 3. Clear other related logs if they exist
  try {
     await prisma.staffActivityFrame.deleteMany();
     await prisma.staffWorkLog.deleteMany();
     await prisma.staffDocument.deleteMany();
     console.log("Related staff logs cleared.");
  } catch (e) {
     console.log("No related logs found to clear.");
  }

  process.exit(0);
}

cleanDb();
