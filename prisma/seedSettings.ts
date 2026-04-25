import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding System Settings...");

  const settings = await prisma.systemSettings.upsert({
    where: { id: "GLOBAL" },
    update: {},
    create: {
      id: "GLOBAL",
      isLiveChatEnabled: true,
      isFraudCheckEnabled: true,
      smsActiveProvider: "FIREBASE",
      // Placeholder credentials for the admin to update
      googleRedirectUri: "http://localhost:3030/api/auth/google/callback",
      fbRedirectUri: "http://localhost:3030/api/auth/facebook/callback",
      aiCreditPrice: 0.50
    }
  });

  console.log("Global System Settings initialized:", settings.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
