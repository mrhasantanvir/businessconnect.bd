import { db as prisma } from "@/lib/db";

export async function logOrderActivity(data: {
  orderId: string;
  userId: string;
  type: "STATUS_CHANGE" | "CALL_LOG" | "LOGISTICS_UPDATE" | "PAYMENT_RECEIVED" | "NOTE";
  message: string;
}) {
  return await prisma.orderActivity.create({
    data: {
      orderId: data.orderId,
      userId: data.userId,
      type: data.type,
      message: data.message
    }
  });
}

export async function logCall(data: {
  merchantStoreId: string;
  userId: string;
  orderId?: string;
  from: string;
  to: string;
  duration: number;
  recordingUrl?: string;
  direction: "INBOUND" | "OUTBOUND";
  status: "COMPLETED" | "MISSED" | "BUSY";
}) {
  return await prisma.callLog.create({
    data: {
      merchantStoreId: data.merchantStoreId,
      userId: data.userId,
      orderId: data.orderId,
      from: data.from,
      to: data.to,
      duration: data.duration,
      recordingUrl: data.recordingUrl,
      direction: data.direction,
      status: data.status
    }
  });
}
