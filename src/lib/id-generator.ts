import { db as prisma } from "./db";
import crypto from "crypto";

export type IdType = "ADMIN" | "MERCHANT" | "STAFF" | "CUSTOMER" | "TASK" | "ORDER";

export async function generateReadableId(type: IdType, merchantStoreId?: string): Promise<string> {
  // 1. Handle Global IDs (Admin, Merchant)
  if (type === "ADMIN" || type === "MERCHANT") {
    const sequence = await prisma.systemSequence.upsert({
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
      return `BC-ADM${sequence.adminCount.toString().padStart(2, "0")}`;
    } else {
      return `BC-MR${sequence.merchantCount.toString().padStart(3, "0")}`;
    }
  }

  // 2. Handle Scoped IDs (Staff, Customer, Task, Order)
  let ownerPrefix = "BC-SYS";

  if (merchantStoreId) {
    const merchant = await prisma.merchantStore.findUnique({
      where: { id: merchantStoreId },
      select: { readableId: true }
    });

    if (merchant?.readableId) {
      ownerPrefix = merchant.readableId;
    } else {
      // Fallback for merchants without readableId
      const sequence = await prisma.systemSequence.upsert({
        where: { id: "GLOBAL" },
        update: { merchantCount: { increment: 1 } },
        create: { id: "GLOBAL", merchantCount: 1 }
      });
      ownerPrefix = `BC-MR${sequence.merchantCount.toString().padStart(3, "0")}`;
      await prisma.merchantStore.update({
        where: { id: merchantStoreId },
        data: { readableId: ownerPrefix }
      });
    }
  } else {
    // If no merchantStoreId, it might be a Super Admin staff/task
    const admin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
      select: { readableId: true }
    });
    if (admin?.readableId) {
      ownerPrefix = admin.readableId;
    }
  }

  const mSeq = await prisma.merchantSequence.upsert({
    where: { merchantStoreId: merchantStoreId || "GLOBAL_ADMIN" },
    update: {
      customerSeq: type === "CUSTOMER" ? { increment: 1 } : undefined,
      taskSeq: type === "TASK" ? { increment: 1 } : undefined,
      staffSeq: type === "STAFF" ? { increment: 1 } : undefined,
      orderSeq: type === "ORDER" ? { increment: 1 } : undefined,
    },
    create: {
      id: crypto.randomUUID(),
      merchantStoreId: merchantStoreId || "GLOBAL_ADMIN",
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

  const padSize = (type === "STAFF" || type === "CUSTOMER") ? 2 : 4;
  return `${ownerPrefix}-${suffix}${val.toString().padStart(padSize, "0")}`;
}
