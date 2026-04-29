import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const secretKey = "TDZFVUpTZDUyWWpvN0JlYkJnTHBXOXhIZjAyVUNkRFg=";
  
  const settings = await prisma.systemSettings.upsert({
    where: { id: "GLOBAL" },
    update: {
      smsActiveProvider: "SSLCOMMERZ",
      smsApiKey: secretKey,
      smsSenderId: "RAJBRAND", 
      smsApiUrl: "https://smsplus.sslwireless.com/api/v3/send-sms"
    },
    create: {
      id: "GLOBAL",
      smsActiveProvider: "SSLCOMMERZ",
      smsApiKey: secretKey,
      smsSenderId: "RAJBRAND",
      smsApiUrl: "https://smsplus.sslwireless.com/api/v3/send-sms"
    }
  });

  console.log("Global System Settings Updated with SSLCommerz SMS Key.");
  console.log(settings);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
