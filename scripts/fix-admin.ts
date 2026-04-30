import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const targetEmail = "smmhasantanvir@gmail.com";
  
  const existingUsers = await prisma.user.findMany({
    where: { email: targetEmail }
  });

  console.log("Users with email:", JSON.stringify(existingUsers, null, 2));

  if (existingUsers.length > 0) {
     // Make the first one SUPER_ADMIN
     await prisma.user.update({
       where: { id: existingUsers[0].id },
       data: { role: "SUPER_ADMIN" }
     });
     console.log(`User ${existingUsers[0].id} is now SUPER_ADMIN`);
  } else {
     // Change the current admin's email
     const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
     if (admin) {
        await prisma.user.update({
          where: { id: admin.id },
          data: { email: targetEmail }
        });
        console.log(`Admin email updated to ${targetEmail}`);
     }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
