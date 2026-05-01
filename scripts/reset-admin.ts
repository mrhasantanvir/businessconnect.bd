import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "smmhasantanvir@gmail.com";
  const password = "adminp@ssword2026";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
      emailVerified: new Date()
    },
    create: {
      email,
      name: "Super Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
      emailVerified: new Date()
    }
  });

  console.log(`Super Admin password reset for: ${user.email}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
