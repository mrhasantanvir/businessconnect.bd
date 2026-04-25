"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

/**
 * Fetch a high-level overview of business performance
 */
export async function getBusinessOverviewAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const orders = await prisma.order.findMany({
    where: { 
      merchantStoreId: session.merchantStoreId,
      status: "DELIVERED"
    }
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Last 30 days growth logic (simplified)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentOrders = orders.filter(o => o.createdAt > thirtyDaysAgo);
  const recentRevenue = recentOrders.reduce((sum, o) => sum + o.total, 0);

  return {
    totalRevenue,
    totalOrders,
    aov,
    recentRevenue,
    growthRate: totalRevenue > 0 ? (recentRevenue / totalRevenue) * 100 : 0
  };
}

/**
 * Fetch ROI performance for all marketing campaigns
 */
export async function getMarketingROIAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const campaigns = await prisma.marketingCampaign.findMany({
    where: { merchantStoreId: session.merchantStoreId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" }
  });

  return campaigns.map(c => ({
    id: c.id,
    name: c.name,
    spent: c.totalCost,
    earned: c.revenueGenerated,
    roi: c.totalCost > 0 ? (c.revenueGenerated / (c.totalCost === 0 ? 1 : c.totalCost)) * 100 : 0
  }));
}

/**
 * Fetch top performing products
 */
export async function getTopProductsAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const orderItems = await prisma.orderItem.findMany({
    where: { 
      order: { merchantStoreId: session.merchantStoreId, status: "DELIVERED" } 
    },
    include: { product: true }
  });

  const productStats: Record<string, { name: string, quantity: number, revenue: number }> = {};

  orderItems.forEach(item => {
    if (item.productId && item.product) {
      if (!productStats[item.productId]) {
        productStats[item.productId] = { name: item.product.name, quantity: 0, revenue: 0 };
      }
      productStats[item.productId].quantity += item.quantity;
      productStats[item.productId].revenue += (item.price * item.quantity);
    }
  });

  return Object.values(productStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
}

/**
 * Create a new Discount Coupon for ROI Tracking
 */
export async function createCouponAction(data: {
  code: string;
  discountValue: number;
  type: "PERCENTAGE" | "FLAT";
  campaignId?: string;
  maxUsage?: number;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  return await prisma.coupon.create({
    data: {
      merchantStoreId: session.merchantStoreId,
      ...data
    }
  });
}
