"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CommunicationService } from "@/services/CommunicationService";

/**
 * Fetch all campaigns for a merchant
 */
export async function getCampaignsAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  return await prisma.marketingCampaign.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { logs: true } } }
  });
}

/**
 * Create a draft campaign
 */
export async function createCampaignAction(data: {
  name: string;
  type: string;
  content: string;
  targetCriteria: any;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  // Calculate target count based on criteria
  const targetCustomers = await prisma.customer.findMany({
    where: {
      merchantStoreId: session.merchantStoreId,
      totalSpend: { gte: data.targetCriteria.minSpend || 0 },
      // Add more filters as needed
    }
  });

  const campaign = await prisma.marketingCampaign.create({
    data: {
      merchantStoreId: session.merchantStoreId,
      name: data.name,
      type: data.type,
      content: data.content,
      targetCriteria: JSON.stringify(data.targetCriteria),
      totalTarget: targetCustomers.length,
      status: "DRAFT",
      createdBy: session.userId,
      updatedBy: session.userId
    }
  });

  revalidatePath("/merchant/campaigns");
  return campaign;
}

/**
 * Execute a campaign: BROADCAST
 */
export async function executeCampaignAction(campaignId: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const campaign = await prisma.marketingCampaign.findUnique({
    where: { id: campaignId, merchantStoreId: session.merchantStoreId }
  });

  if (!campaign) throw new Error("Campaign not found");
  if (campaign.status === "SENDING" || campaign.status === "COMPLETED") {
    throw new Error("Campaign already executed");
  }

  // 1. Fetch Target Customers based on Criteria
  const criteria = typeof campaign.targetCriteria === 'string' ? JSON.parse(campaign.targetCriteria || "{}") : (campaign.targetCriteria as any);
  
  let customers: any[] = [];

  if (criteria.type === "ALL") {
    customers = await prisma.customer.findMany({
      where: { merchantStoreId: session.merchantStoreId }
    });
  } else if (criteria.type === "PRODUCT") {
    const ordersWithProduct = await prisma.order.findMany({
      where: { 
        merchantStoreId: session.merchantStoreId,
        items: { some: { productId: criteria.productId } }
      },
      select: { customerPhone: true }
    });
    const phones = Array.from(new Set(ordersWithProduct.map(o => o.customerPhone).filter(Boolean)));
    customers = await prisma.customer.findMany({
      where: { merchantStoreId: session.merchantStoreId, phone: { in: phones as string[] } }
    });
  } else if (criteria.type === "CATEGORY") {
    const ordersWithCategory = await prisma.order.findMany({
      where: { 
        merchantStoreId: session.merchantStoreId,
        items: { some: { product: { categoryId: criteria.categoryId } } }
      },
      select: { customerPhone: true }
    });
    const phones = Array.from(new Set(ordersWithCategory.map(o => o.customerPhone).filter(Boolean)));
    customers = await prisma.customer.findMany({
      where: { merchantStoreId: session.merchantStoreId, phone: { in: phones as string[] } }
    });
  } else if (criteria.type === "TOP_SELLING") {
    // Logic: Customers who spent more than 5000 (Top Segment)
    customers = await prisma.customer.findMany({
      where: { merchantStoreId: session.merchantStoreId, totalSpend: { gte: 5000 } }
    });
  } else if (criteria.type === "RANGE") {
    customers = await prisma.customer.findMany({
      where: { merchantStoreId: session.merchantStoreId },
      orderBy: { createdAt: criteria.order === "FIRST" ? "asc" : "desc" },
      take: criteria.limit || 1000
    });
  } else if (criteria.type === "BULK_UPLOAD") {
    // Map external numbers to temporary customer-like objects
    customers = (criteria.externalNumbers || []).map((phone: string, index: number) => ({
      id: `ext-${index}`,
      phone,
      name: "Customer", // Default for personalization
      merchantStoreId: session.merchantStoreId
    }));
  }

  if (customers.length === 0) throw new Error("No customers match your criteria");

  // 2. Initial Balance Check
  const store = await prisma.merchantStore.findUnique({ 
    where: { id: session.merchantStoreId } 
  });

  if (!store) throw new Error("Store not found");

  const requiredBalance = store.smsRate * customers.length;
  if (store.smsBalance < requiredBalance) {
    throw new Error(`Insufficient balance. Required: ৳${requiredBalance.toFixed(2)}, Available: ৳${store.smsBalance.toFixed(2)}`);
  }

  // 3. Mark Sending
  await prisma.marketingCampaign.update({
    where: { id: campaignId },
    data: { status: "SENDING" }
  });

  let sentCount = 0;
  let totalCost = 0;

  // 4. Send Loop
  for (const customer of customers) {
    try {
      // Add a small delay to prevent gateway overload (300ms)
      await new Promise(resolve => setTimeout(resolve, 300));

      // Personalization: Replace {name}
      const personalizedContent = campaign.content.replace(/{name}/g, customer.name || "Customer");
      
      const result = await CommunicationService.sendSms(
        session.merchantStoreId,
        customer.phone,
        personalizedContent
      );

      if (result.success) {
        sentCount++;
        // Use result.cost if available, else fallback to store rate
        totalCost += (result as any).cost || store.smsRate;
        await prisma.campaignLog.create({
          data: {
            campaignId,
            customerId: customer.id,
            status: "SUCCESS",
            userId: session.userId
          }
        });
      }
    } catch (error: any) {
      await prisma.campaignLog.create({
        data: {
          campaignId,
          customerId: customer.id,
          status: "FAILED",
          error: error.message,
          userId: session.userId
        }
      });
    }
  }

  // 5. Finalize
  const finalCampaign = await prisma.marketingCampaign.update({
    where: { id: campaignId },
    data: { 
      status: "COMPLETED",
      sentCount,
      totalCost,
      totalTarget: customers.length
    }
  });

  revalidatePath("/merchant/campaigns");
  return finalCampaign;
}
