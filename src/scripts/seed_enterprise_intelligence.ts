import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedIntelligence() {
  console.log("Seeding Omni-Channel Intelligence...");

  const orders = await prisma.order.findMany({
    take: 5
  });

  const staff = await prisma.user.findFirst({
    where: { role: "MERCHANT" }
  });

  if (!staff) {
    console.error("No merchant found to associate logs.");
    return;
  }

  const activities = [
    { type: "STATUS_CHANGE", message: "Order status moved from PENDING to PROCESSING by Staff." },
    { type: "CALL_LOG", message: "Verification call successful. Customer confirmed home delivery." },
    { type: "LOGISTICS_UPDATE", message: "Parcel handed over to Terminal Hub. Dispatch ID: TG-8842." },
    { type: "PAYMENT_RECEIVED", message: "Advanced payment of ৳500 received via bKash." }
  ];

  for (const order of orders) {
    console.log(`Populating Intelligence for Order: ${order.id}`);

    // Create random activities
    for (const act of activities) {
      await prisma.orderActivity.create({
        data: {
          orderId: order.id,
          userId: staff.id,
          type: act.type,
          message: act.message,
          createdAt: new Date(Date.now() - Math.random() * 100000000)
        }
      });
    }

    // Create Call Logs
    await prisma.callLog.create({
      data: {
        merchantStoreId: order.merchantStoreId,
        userId: staff.id,
        orderId: order.id,
        from: "OFFICE_PBX_01",
        to: order.customerPhone || "01711223344",
        duration: Math.floor(Math.random() * 300) + 30,
        recordingUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        direction: "OUTBOUND",
        status: "COMPLETED"
      }
    });

    await prisma.callLog.create({
      data: {
        merchantStoreId: order.merchantStoreId,
        userId: staff.id,
        orderId: order.id,
        from: order.customerPhone || "01711223344",
        to: "SUPPORT_EXT_04",
        duration: Math.floor(Math.random() * 120) + 10,
        recordingUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        direction: "INBOUND",
        status: "COMPLETED"
      }
    });
  }

  console.log("Enterprise Intelligence Seeding Complete.");
}

seedIntelligence()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
