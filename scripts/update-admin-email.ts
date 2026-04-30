import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const adminEmail = "smmhasantanvir@gmail.com";
  
  // Find any SUPER_ADMIN user
  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" }
  });

  if (!admin) {
    console.log("No SUPER_ADMIN found.");
    return;
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: { email: adminEmail }
  });

  console.log(`Updated Admin (ID: ${admin.id}) email to ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
