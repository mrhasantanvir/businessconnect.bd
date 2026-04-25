import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { paymentFactory } from "@/lib/payments/factory";

export async function POST(req: NextRequest) {
  return handleCallback(req);
}

export async function GET(req: NextRequest) {
  return handleCallback(req);
}

async function handleCallback(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const providerName = searchParams.get("provider");
  const orderId = searchParams.get("orderId");
  const slug = searchParams.get("slug");

  if (!providerName || !orderId || !slug) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // 1. Fetch Order and Payment Config
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { merchantStore: true }
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const config = await prisma.paymentConfig.findUnique({
    where: {
      merchantStoreId_provider: {
        merchantStoreId: order.merchantStoreId,
        provider: providerName
      }
    }
  });

  if (!config) return NextResponse.json({ error: "Payment config not found" }, { status: 404 });

  // 2. Get Provider Instance
  const provider = paymentFactory.getProvider(providerName);
  if (!provider) return NextResponse.json({ error: "Provider not supported" }, { status: 400 });

  // 3. Verify Payment
  // For some gateways, the payment ID is in the body, for others in the query.
  // SSLCommerz uses 'val_id' in query/body. bKash uses 'paymentID' in query.
  let paymentId = searchParams.get("paymentID") || searchParams.get("val_id") || searchParams.get("pay_id");
  
  // If not in query, try body
  if (!paymentId && req.method === "POST") {
    try {
      const body = await req.formData();
      paymentId = body.get("val_id")?.toString() || body.get("paymentID")?.toString();
    } catch (e) {}
  }

  if (!paymentId) {
    // If we still don't have it, some providers like AamarPay use the transaction ID we sent
    paymentId = order.id;
  }

  const verification = await provider.verifyPayment(config as any, paymentId);

  if (verification.success && verification.status === "SUCCESS") {
    // 4. Update Order and Transaction
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { 
          paymentStatus: "PAID",
          status: "CONFIRMED",
          confirmedAt: new Date()
        }
      }),
      prisma.paymentTransaction.create({
        data: {
          merchantStoreId: order.merchantStoreId,
          amount: verification.amount,
          trxId: verification.trxId,
          status: "SUCCESS",
          type: "SALE",
          paymentMethod: providerName,
          currency: "BDT"
        }
      }),
      prisma.orderActivity.create({
        data: {
          orderId,
          type: "PAYMENT_SUCCESS",
          message: `Payment of ৳${verification.amount} confirmed via ${providerName}. TrxID: ${verification.trxId}`
        }
      })
    ]);

    // Redirect to success page
    return NextResponse.redirect(new URL(`/s/${slug}/order/${orderId}/success`, req.url));
  } else {
    // Redirect to failure page
    return NextResponse.redirect(new URL(`/s/${slug}/order/${orderId}/failed?reason=${verification.status}`, req.url));
  }
}
