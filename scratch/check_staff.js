const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStaff() {
  const staff = await prisma.staffProfile.findMany({
    include: { user: true }
  });
  console.log("Current Staff Profiles:", JSON.stringify(staff, null, 2));
  process.exit(0);
}

checkStaff();
