import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.merchantStoreId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, amount, trxId, method } = await req.json();

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId, merchantStoreId: session.merchantStoreId }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 1. Update Order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        advancePaid: { increment: amount },
        paymentStatus: order.total <= (order.advancePaid + amount) ? "PAID" : "PARTIAL"
      }
    });

    // 2. Log Transaction
    await prisma.paymentTransaction.create({
      data: {
        merchantStoreId: session.merchantStoreId,
        userId: session.userId,
        amount: amount,
        type: "ORDER_ADVANCE",
        paymentMethod: method,
        trxId: trxId,
        status: "COMPLETED"
      }
    });

    // 3. Log Activity
    await prisma.orderActivity.create({
      data: {
        orderId,
        userId: session.userId,
        type: "LOGISTICS_UPDATE",
        message: `Advance payment of ৳${amount} recorded via ${method} (Ref: ${trxId}).`
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Advance Payment Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
