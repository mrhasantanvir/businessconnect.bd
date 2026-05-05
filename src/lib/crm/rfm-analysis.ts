import { db as prisma } from "@/lib/db";
import { differenceInDays } from "date-fns";

export type RFMSegment = "CHAMPIONS" | "LOYAL" | "AT_RISK" | "HIBERNATING" | "NEW";

/**
 * CRM RFM Analysis Engine
 * Segments customers based on their buying behavior.
 */
export class RFMAnalysis {
  
  /**
   * Calculate RFM Segment for a customer
   */
  static async getSegment(customerId: string): Promise<RFMSegment> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          where: { status: "DELIVERED" },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (!customer || customer.orderCount === 0) return "NEW";

    const lastOrder = customer.orders[0];
    const recency = lastOrder ? differenceInDays(new Date(), lastOrder.createdAt) : 365;
    const frequency = customer.orderCount;
    const monetary = customer.totalSpend;

    // Logic: CHAMPIONS
    if (recency <= 30 && frequency >= 5 && monetary >= 5000) return "CHAMPIONS";
    
    // Logic: LOYAL
    if (recency <= 90 && frequency >= 3) return "LOYAL";

    // Logic: AT_RISK
    if (recency > 90 && recency <= 180 && frequency >= 2) return "AT_RISK";

    // Logic: HIBERNATING
    if (recency > 180) return "HIBERNATING";

    return "NEW";
  }

  /**
   * Get Customer 360 Profile
   * Aggregates all touchpoints for a customer.
   */
  static async getCustomer360(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        unifiedConversations: {
          include: { messages: { orderBy: { createdAt: "desc" }, take: 5 } },
          take: 3
        }
      }
    });

    if (!customer) return null;

    const segment = await this.getSegment(customerId);

    return {
      ...customer,
      segment,
      insights: {
        averageOrderValue: customer.totalSpend / (customer.orderCount || 1),
        loyaltyTier: segment === "CHAMPIONS" ? "GOLD" : segment === "LOYAL" ? "SILVER" : "BRONZE"
      }
    };
  }
}
