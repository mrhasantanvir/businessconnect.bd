import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { executeBkashPayment } from "@/lib/bkash";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentID = searchParams.get("paymentID");
    const status = searchParams.get("status");

    if (!paymentID || status !== "success") {
      return NextResponse.redirect(new URL("/merchant/billing?error=PaymentFailedOrCancelled", req.url));
    }

    // Attempt to execute the payment with bKash
    const executionResponse = await executeBkashPayment(paymentID);

    // If already executed or failed during execution
    if (executionResponse.statusCode !== "0000" || executionResponse.transactionStatus !== "Completed") {
      console.error("Execute Failed:", executionResponse);
      return NextResponse.redirect(new URL(`/merchant/billing?error=${executionResponse.statusMessage || "ExecutionFailed"}`, req.url));
    }

    const trxID = executionResponse.trxID;
    const amount = parseFloat(executionResponse.amount);
    const merchantInvoiceNumber = executionResponse.merchantInvoiceNumber;

    // Parse payload: "merchantId_type_count" OR "merchantId_SaaS_planId"
    const parts = (merchantInvoiceNumber || "").split("_");
    const merchantStoreId = parts[0];
    const type = parts[1];
    const identifier = parts[2];

    if (!merchantStoreId || !type || !identifier) {
      return NextResponse.redirect(new URL("/merchant/billing?error=InvalidPayload", req.url));
    }

    // Prevent duplicate processing
    const existingTrx = await prisma.paymentTransaction.findUnique({
      where: { trxId: trxID }
    });
    
    if (existingTrx) {
      return NextResponse.redirect(new URL("/merchant/billing?message=AlreadyProcessed", req.url));
    }

    // Process Ledger
    await prisma.$transaction(async (tx) => {
      // 1. Record the receipt
      await tx.paymentTransaction.create({
        data: {
          trxId: trxID,
          merchantStoreId,
          amount,
          currency: "BDT",
          type: type === "SaaS" ? "SAAS_SUBSCRIPTION" : (type === "SMS" ? "SMS_CREDIT" : "SIP_CREDIT"),
          status: "SUCCESS"
        }
      });

      // 2. Add the Credits or Plan
      if (type === "SaaS") {
         const plan = await tx.subscriptionPlan.findUnique({ where: { id: identifier } });
         if (plan) {
            const newExpiry = new Date();
            newExpiry.setDate(newExpiry.getDate() + 30); // 30 days renewal
            
            await tx.merchantStore.update({
              where: { id: merchantStoreId },
              data: {
                subscriptionPlanId: plan.id,
                plan: plan.name.toUpperCase(),
                subscriptionStatus: "ACTIVE",
                subscriptionExpiry: newExpiry
              }
            });
         }
      } else if (type === "SMS") {
        await tx.merchantStore.update({
          where: { id: merchantStoreId },
          data: { smsBalance: { increment: parseInt(identifier) } }
        });
      } else if (type === "SIP") {
        await tx.merchantStore.update({
          where: { id: merchantStoreId },
          data: { sipBalance: { increment: parseInt(identifier) } }
        });
      }
    });

    // Send back to dashboard with success
    return NextResponse.redirect(new URL("/merchant/billing?success=PaymentCompleted", req.url));

  } catch (error) {
    console.error("bKash Webhook Error:", error);
    return NextResponse.redirect(new URL("/merchant/billing?error=InternalServerError", req.url));
  }
}
