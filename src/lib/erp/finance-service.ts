import { db as prisma } from "@/lib/db";
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

/**
 * Finance & BI Service
 * Handles P&L calculations and VAT automation.
 */
export class FinanceService {
  
  /**
   * Generate P&L Statement
   * Calculates Revenue, COGS, and Net Profit for a specific period.
   */
  static async getPnL(merchantStoreId: string, startDate: Date, endDate: Date) {
    // 1. Total Revenue (Delivered Orders)
    const orders = await prisma.order.findMany({
      where: {
        merchantStoreId,
        status: "DELIVERED",
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        items: {
          include: { product: { select: { purchasePrice: true } } }
        }
      }
    });

    let totalRevenue = 0;
    let totalCOGS = 0; // Cost of Goods Sold

    orders.forEach(order => {
      totalRevenue += order.totalAmount;
      order.items.forEach(item => {
        const purchasePrice = item.product?.purchasePrice || 0;
        totalCOGS += (purchasePrice * item.quantity);
      });
    });

    // 2. Operating Expenses (Ledger Transactions)
    const expenses = await prisma.ledgerTransaction.findMany({
      where: {
        merchantStoreId,
        type: "EXPENSE",
        date: { gte: startDate, lte: endDate }
      },
      select: { amount: true }
    });

    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    // 3. Final Calculations
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;

    return {
      period: { start: startDate, end: endDate },
      revenue: totalRevenue,
      cogs: totalCOGS,
      grossProfit,
      operatingExpenses: totalExpenses,
      netProfit,
      margin: (netProfit / (totalRevenue || 1)) * 100
    };
  }

  /**
   * Calculate VAT Report
   */
  static async getVatReport(merchantStoreId: string, month: Date) {
    const start = startOfMonth(month);
    const end = endOfMonth(month);

    const store = await prisma.merchantStore.findUnique({
      where: { id: merchantStoreId },
      select: { isVatEnabled: true, vatRate: true }
    });

    if (!store?.isVatEnabled) return { error: "VAT is not enabled for this store" };

    const revenue = await prisma.order.aggregate({
      where: {
        merchantStoreId,
        status: "DELIVERED",
        createdAt: { gte: start, lte: end }
      },
      _sum: { totalAmount: true }
    });

    const totalRevenue = revenue._sum.totalAmount || 0;
    const vatPayable = (totalRevenue * (store.vatRate / 100));

    return {
      month: month.toISOString(),
      totalRevenue,
      vatRate: store.vatRate,
      vatPayable
    };
  }
}
