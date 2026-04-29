import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting SSL Commerz SMS Setup...");

  try {
    const settings = await prisma.systemSettings.upsert({
      where: { id: "GLOBAL" },
      update: {
        smsActiveProvider: "SSLCOMMERZ",
        smsApiKey: "TDZFVUpTZDUyWWpvN0JlYkJnTHBXOXhIZjAyVUNkRFg=",
        smsSenderId: "RAJBRAND",
        smsApiUrl: "https://smsplus.sslwireless.com/api/v3/send-sms"
      },
      create: {
        id: "GLOBAL",
        smsActiveProvider: "SSLCOMMERZ",
        smsApiKey: "TDZFVUpTZDUyWWpvN0JlYkJnTHBXOXhIZjAyVUNkRFg=",
        smsSenderId: "RAJBRAND",
        smsApiUrl: "https://smsplus.sslwireless.com/api/v3/send-sms"
      },
    });

    console.log("✅ SSL Commerz Credentials saved successfully!");
    console.log("Provider:", settings.smsActiveProvider);
    console.log("SID:", settings.smsSenderId);
  } catch (error) {
    console.error("❌ Error saving settings:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
