import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding clean system data...");

  // 1. Super Admin
  const superAdminEmail = "smmhasantanvir@gmail.com";
  const superAdminPassword = "adminp@ssword2026";
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
    create: {
      email: superAdminEmail,
      password: hashedPassword,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log("Super Admin updated/created");

  // 2. System Settings
  await prisma.systemSettings.upsert({
    where: { id: "GLOBAL" },
    update: {},
    create: {
      id: "GLOBAL",
      siteTitle: "BusinessConnect.bd",
      staffSubscriptionPrice: 300,
    },
  });
  console.log("Global System Settings updated/created");

  // 3. Basic Subscription Plans (Optional but recommended to keep the UI functional)
  const saasPlans = [
    { name: "Starter", monthlyPrice: 1000, maxProducts: 50, maxStaff: 2, badgeColor: "blue", features: ["Basic Analytics"] },
    { name: "Growth", monthlyPrice: 5000, maxProducts: 500, maxStaff: 10, badgeColor: "indigo", features: ["Advanced Insights"] },
    { name: "Enterprise", monthlyPrice: 15000, maxProducts: -1, maxStaff: -1, badgeColor: "emerald", features: ["Unlimited Everything"] }
  ];

  for (const plan of saasPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: {
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        maxProducts: plan.maxProducts,
        maxStaff: plan.maxStaff,
        badgeColor: plan.badgeColor,
        featuresData: JSON.stringify(plan.features)
      }
    });
  }
  console.log("Core Subscription Plans updated/created");

  console.log("Clean seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
