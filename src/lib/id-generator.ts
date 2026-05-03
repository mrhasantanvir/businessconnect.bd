import { db as prisma } from "./db";

export type IdType = "ADMIN" | "MERCHANT" | "STAFF" | "CUSTOMER" | "TASK" | "ORDER";

export async function generateReadableId(type: IdType, merchantStoreId?: string): Promise<string> {
  // 1. Handle Global IDs (Admin, Merchant)
  if (type === "ADMIN" || type === "MERCHANT") {
    const sequence = await prisma.systemsequence.upsert({
      where: { id: "GLOBAL" },
      update: {
        adminCount: type === "ADMIN" ? { increment: 1 } : undefined,
        merchantCount: type === "MERCHANT" ? { increment: 1 } : undefined,
      },
      create: {
        id: "GLOBAL",
        adminCount: type === "ADMIN" ? 1 : 0,
        merchantCount: type === "MERCHANT" ? 1 : 0,
      },
    });

    if (type === "ADMIN") {
      return `BC-ADM-${sequence.adminCount.toString().padStart(4, "0")}`;
    } else {
      return `BC-MR-${sequence.merchantCount.toString().padStart(4, "0")}`;
    }
  }

  // 2. Handle Merchant-Scoped IDs (Staff, Customer, Task, Order)
  if (!merchantStoreId) {
    throw new Error(`MerchantStoreId is required for type: ${type}`);
  }

  // Get merchant readable ID first
  const merchant = await prisma.merchantstore.findUnique({
    where: { id: merchantStoreId },
    select: { readableId: true }
  });

  // If merchant doesn't have a readableId yet, they should probably get one
  let mPrefix = merchant?.readableId;
  if (!mPrefix) {
     // Generate one for the merchant if missing (fallback)
     // This is useful during migration
     const sequence = await prisma.systemsequence.upsert({
        where: { id: "GLOBAL" },
        update: { merchantCount: { increment: 1 } },
        create: { id: "GLOBAL", merchantCount: 1 }
     });
     mPrefix = `BC-MR-${sequence.merchantCount.toString().padStart(4, "0")}`;
     await prisma.merchantstore.update({
        where: { id: merchantStoreId },
        data: { readableId: mPrefix }
     });
  }

  const mSeq = await prisma.merchantsequence.upsert({
    where: { merchantStoreId },
    update: {
      customerSeq: type === "CUSTOMER" ? { increment: 1 } : undefined,
      taskSeq: type === "TASK" ? { increment: 1 } : undefined,
      staffSeq: type === "STAFF" ? { increment: 1 } : undefined,
      orderSeq: type === "ORDER" ? { increment: 1 } : undefined,
    },
    create: {
      id: crypto.randomUUID(), // Manual ID since merchantsequence doesn't have cuid() default in db pull
      merchantStoreId,
      customerSeq: type === "CUSTOMER" ? 1 : 0,
      taskSeq: type === "TASK" ? 1 : 0,
      staffSeq: type === "STAFF" ? 1 : 0,
      orderSeq: type === "ORDER" ? 1 : 0,
    },
  });

  const suffix = {
    "CUSTOMER": "CU",
    "STAFF": "ST",
    "TASK": "TK",
    "ORDER": "ORD"
  }[type as keyof typeof suffix];

  const val = {
    "CUSTOMER": mSeq.customerSeq,
    "STAFF": mSeq.staffSeq,
    "TASK": mSeq.taskSeq,
    "ORDER": mSeq.orderSeq
  }[type as keyof typeof val];

  return `${mPrefix}-${suffix}-${val.toString().padStart(4, "0")}`;
}
