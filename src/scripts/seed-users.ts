import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateReadableId } from "../lib/id-generator";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding users...");
  
  const passwordHash = await bcrypt.hash("12345678", 10);

  // 1. Create Super Admin
  const adminId = await generateReadableId("ADMIN");
  const admin = await prisma.user.upsert({
    where: { id: "admin-1" },
    update: {},
    create: {
      id: "admin-1",
      email: "admin@businessconnect.bd",
      phone: "01711111111",
      password: passwordHash,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      isActive: true,
      readableId: adminId,
      updatedAt: new Date(),
    }
  });
  console.log("Created Super Admin:", admin.email, "Password: 12345678");

  // 2. Create Store for Merchant
  const merchantId = await generateReadableId("MERCHANT");
  const store = await prisma.merchantstore.upsert({
    where: { id: "store-1" },
    update: {},
    create: {
      id: "store-1",
      name: "Demo Store",
      slug: "demo-store",
      phone: "01321141788",
      address: "Dhaka, Bangladesh",
      readableId: merchantId, // Store gets the same readable ID as merchant
    }
  });

  const merchant = await prisma.user.upsert({
    where: { id: "merchant-1" },
    update: {},
    create: {
      id: "merchant-1",
      email: "merchant@businessconnect.bd",
      phone: "01321141788", // The one from the screenshot
      password: passwordHash,
      name: "Demo Merchant",
      role: "MERCHANT",
      isActive: true,
      readableId: merchantId,
      merchantStoreId: store.id,
      updatedAt: new Date(),
    }
  });
  console.log("Created Merchant:", merchant.email, "Password: 12345678");

  // 3. Create Staff 1
  const staff1Id = await generateReadableId("STAFF", store.id);
  const staff1 = await prisma.user.upsert({
    where: { id: "staff-1" },
    update: {},
    create: {
      id: "staff-1",
      email: "staff1@businessconnect.bd",
      phone: "01811111111",
      password: passwordHash,
      name: "Staff One",
      role: "STAFF",
      isActive: true,
      readableId: staff1Id,
      merchantStoreId: store.id,
      updatedAt: new Date(),
    }
  });
  console.log("Created Staff 1:", staff1.email, "Password: 12345678");

  // 4. Create Staff 2
  const staff2Id = await generateReadableId("STAFF", store.id);
  const staff2 = await prisma.user.upsert({
    where: { id: "staff-2" },
    update: {},
    create: {
      id: "staff-2",
      email: "staff2@businessconnect.bd",
      phone: "01911111111",
      password: passwordHash,
      name: "Staff Two",
      role: "STAFF",
      isActive: true,
      readableId: staff2Id,
      merchantStoreId: store.id,
      updatedAt: new Date(),
    }
  });
  console.log("Created Staff 2:", staff2.email, "Password: 12345678");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding users:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
