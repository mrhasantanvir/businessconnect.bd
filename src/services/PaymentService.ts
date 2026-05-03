import { db as prisma } from "@/lib/db";
import { InvoiceService } from "@/services/InvoiceService";
import { sendEmail } from "@/lib/mail";

export class PaymentService {
  /**
   * Initiates a bKash payment
   */
  static async initiateBkashPayment(storeId: string, amount: number, type: string, metadata: any) {
    const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
    if (!settings?.bkashAppKey || !settings?.bkashAppSecret) {
      throw new Error("bKash is not configured on this platform.");
    }

    // In a real implementation, you would:
    // 1. Get bKash Grant Token
    // 2. Create Payment via bKash API
    // 3. Return the bkashURL
    
    // For now, we will simulate the redirect but prepare the structure
    console.log(`[PaymentService] Initiating bKash payment for store ${storeId}, amount ${amount}`);
    
    return {
      success: true,
      gateway: "BKASH",
      redirectUrl: `/api/payments/bkash/simulate?amount=${amount}&type=${type}&storeId=${storeId}&invoiceId=${metadata.invoiceId || ''}&planId=${metadata.planId || ''}&credits=${metadata.credits || 0}`
    };
  }

  /**
   * Initiates a Nagad payment
   */
  static async initiateNagadPayment(storeId: string, amount: number, type: string, metadata: any) {
    const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
    if (!settings?.nagadMerchantId) {
      throw new Error("Nagad is not configured on this platform.");
    }

    console.log(`[PaymentService] Initiating Nagad payment for store ${storeId}, amount ${amount}`);

    return {
      success: true,
      gateway: "NAGAD",
      redirectUrl: `/api/payments/nagad/simulate?amount=${amount}&type=${type}&storeId=${storeId}&invoiceId=${metadata.invoiceId || ''}&planId=${metadata.planId || ''}&credits=${metadata.credits || 0}`
    };
  }

  /**
   * Verifies and completes a transaction
   */
  static async completeTransaction(storeId: string, userId: string, amount: number, type: string, gateway: string, trxId: string, metadata: any) {
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Create Transaction Record
      const txRecord = await tx.paymentTransaction.create({
        data: {
          merchantStoreId: storeId,
          userId: userId,
          amount: amount,
          credits: Number(metadata.credits) || 0,
          paymentMethod: gateway,
          trxId: trxId,
          status: "COMPLETED",
          type: type.startsWith("SUBSCRIPTION") ? "SAAS_PLAN" : type as any
        }
      });

      // 2. Apply Impact
      if (type === "SMS") {
        await tx.merchantStore.update({
          where: { id: storeId },
          data: { smsBalance: { increment: Number(metadata.credits) } }
        });
      } else if (type === "SIP") {
        await tx.merchantStore.update({
          where: { id: storeId },
          data: { sipBalance: { increment: Number(metadata.credits) } }
        });
      } else if (type === "SUBSCRIPTION_RENEW" || type === "SUBSCRIPTION_UPGRADE") {
        const planId = metadata.planId;
        if (!planId) throw new Error("Plan ID missing");
        
        const plan = await tx.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan) throw new Error("Plan not found");

        const store = await tx.merchantStore.findUnique({ where: { id: storeId } });
        let nextExpiry = new Date();
        nextExpiry.setDate(nextExpiry.getDate() + 30);

        if (type === "SUBSCRIPTION_RENEW" && store?.subscriptionExpiry && store.subscriptionExpiry > new Date()) {
          nextExpiry = new Date(store.subscriptionExpiry);
          nextExpiry.setDate(nextExpiry.getDate() + 30);
        }

        await tx.merchantStore.update({
          where: { id: storeId },
          data: {
            subscriptionPlanId: planId,
            subscriptionExpiry: nextExpiry,
            subscriptionStatus: "ACTIVE",
            plan: plan.name
          }
        });
      } else if (type === "INVOICE_PAY") {
        const invoiceId = metadata.invoiceId;
        if (!invoiceId) throw new Error("Invoice ID missing");
        
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "PAID",
            paidAt: new Date()
          }
        });
      }

      return txRecord;
    });

    // 3. Post-Transaction: Generate PDF & Send Email
    try {
      const store = await prisma.merchantStore.findUnique({ 
        where: { id: storeId },
        include: { user: true }
      });

      if (store) {
        const invoiceUrl = await InvoiceService.generateInvoicePdf(transaction, store);
        
        // Update transaction with invoice URL
        await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: { invoiceUrl }
        });

        // Send Email
        const merchantEmail = store.user?.email;
        if (merchantEmail) {
          const template = await prisma.emailTemplate.findUnique({ where: { type: "PAYMENT_SUCCESSFUL" } });
          let subject = template?.subject || "Payment Received - BusinessConnect";
          let html = template?.body || `<p>Hello ${store.ownerName}, Your payment of BDT ${amount} has been received.</p>`;

          // Replace variables
          html = html
            .replace(/{{merchant_name}}/g, store.ownerName || "Merchant")
            .replace(/{{store_name}}/g, store.name)
            .replace(/{{due_amount}}/g, amount.toString())
            .replace(/{{trx_id}}/g, trxId);

          await sendEmail({
            to: merchantEmail,
            subject,
            html,
            attachments: [
              {
                filename: `Invoice-${transaction.id}.pdf`,
                path: process.cwd() + '/public' + invoiceUrl
              }
            ]
          });
        }
      }
    } catch (err) {
      console.error("Error in post-transaction processing:", err);
    }

    return transaction;
  }
}
