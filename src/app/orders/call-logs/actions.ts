"use server";

import { logCall, logOrderActivity } from "../intelligence";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveCallLogAction(data: {
  orderId?: string;
  from: string;
  to: string;
  duration: number;
  direction: "INBOUND" | "OUTBOUND";
  status: "COMPLETED" | "MISSED" | "BUSY";
}) {
  const session = await getSession();
  if (!session || !session.userId || !session.merchantStoreId) throw new Error("Unauthorized");

  const log = await logCall({
    ...data,
    merchantStoreId: session.merchantStoreId,
    userId: session.userId,
    recordingUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Mock recording for demo
  });

  if (data.orderId) {
    await logOrderActivity({
      orderId: data.orderId,
      userId: session.userId,
      type: "CALL_LOG",
      message: `Staff performed ${data.direction.toLowerCase()} verification call to ${data.to}. Duration: ${data.duration}s.`
    });
    revalidatePath(`/orders/${data.orderId}`);
  }

  return { success: true, logId: log.id };
}
