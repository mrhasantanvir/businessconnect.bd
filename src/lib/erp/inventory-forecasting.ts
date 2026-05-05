import { db as prisma } from "@/lib/db";
import { subMonths, differenceInDays } from "date-fns";

/**
 * Inventory Forecasting Engine
 * Uses AI-driven historical analysis to predict stock depletion.
 */
export class InventoryForecasting {
  
  /**
   * Predict Stock Depletion
   * Returns the estimated days left before a product goes out of stock.
   */
  static async predictDaysLeft(productId: string, merchantStoreId: string): Promise<number | null> {
    const threeMonthsAgo = subMonths(new Date(), 3);
    
    // 1. Get all orders for this product in the last 3 months
    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId,
        order: {
          merchantStoreId,
          createdAt: { gte: threeMonthsAgo },
          status: "DELIVERED"
        }
      },
      select: {
        quantity: true
      }
    });

    const totalSold = orderItems.reduce((acc, item) => acc + item.quantity, 0);
    const daysAnalyzed = differenceInDays(new Date(), threeMonthsAgo);
    
    if (totalSold === 0 || daysAnalyzed === 0) return null;

    // 2. Calculate Daily Burn Rate (DBR)
    const dailyBurnRate = totalSold / daysAnalyzed;

    // 3. Get current stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true }
    });

    if (!product || product.stock === 0) return 0;

    // 4. Calculate Days Left
    const daysLeft = Math.floor(product.stock / dailyBurnRate);

    return daysLeft;
  }

  /**
   * Get Low Stock AI Insights
   * Returns a list of products that will go out of stock within the given threshold.
   */
  static async getLowStockAlerts(merchantStoreId: string, thresholdDays: number = 7) {
    const products = await prisma.product.findMany({
      where: { merchantStoreId, stock: { gt: 0 } },
      select: { id: true, name: true, stock: true }
    });

    const alerts = [];

    for (const product of products) {
      const daysLeft = await this.predictDaysLeft(product.id, merchantStoreId);
      
      if (daysLeft !== null && daysLeft <= thresholdDays) {
        alerts.push({
          productId: product.id,
          name: product.name,
          currentStock: product.stock,
          predictedDaysLeft: daysLeft,
          status: daysLeft <= 2 ? "CRITICAL" : "WARNING"
        });
      }
    }

    return alerts;
  }
}
