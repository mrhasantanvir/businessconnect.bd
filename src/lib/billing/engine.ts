import { db as prisma } from "@/lib/db";
import { startOfMonth, endOfMonth, differenceInDays, getDaysInMonth, format } from "date-fns";

export async function generateMonthlyInvoices() {
  const stores = await prisma.merchantStore.findMany({
    where: { isArchived: false },
    include: { users: { where: { role: "STAFF" } } }
  });

  const sysSettings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
  const baseRate = sysSettings?.staffSubscriptionPrice || 300;

  const now = new Date();
  const billingCycle = format(now, "yyyy-MM");
  const cycleStart = startOfMonth(now);
  const cycleEnd = endOfMonth(now);
  const daysInMonth = getDaysInMonth(now);

  for (const store of stores) {
    let totalAmount = 0;
    const invoiceItems = [];

    // Get all staff who were active at any point in this month
    const staff = await prisma.user.findMany({
      where: {
        merchantStoreId: store.id,
        role: "STAFF",
        OR: [
          { isActive: true },
          { updatedAt: { gte: cycleStart } } // Was updated (deactivated) this month
        ]
      }
    });

    for (const user of staff) {
      // Get the first "ACTIVE" log for this user in this month or before
      const firstActiveLog = await prisma.userStatusLog.findFirst({
        where: { userId: user.id, status: "ACTIVE", timestamp: { lte: cycleEnd } },
        orderBy: { timestamp: "asc" }
      });

      if (!firstActiveLog) continue;

      let daysCharged = 30; // Default for deactivations or full month
      let amount = baseRate;

      const activeDate = new Date(firstActiveLog.timestamp);
      
      // If joined mid-month
      if (activeDate > cycleStart) {
         const remainingDays = differenceInDays(cycleEnd, activeDate) + 1;
         daysCharged = remainingDays;
         amount = Math.round((baseRate / daysInMonth) * remainingDays);
      }

      totalAmount += amount;
      invoiceItems.push({
        userId: user.id,
        name: `Staff Subscription - ${user.name || user.email}`,
        amount,
        days: daysCharged
      });
    }

    if (totalAmount > 0) {
      // Create Invoice
      await prisma.invoice.create({
        data: {
          merchantStoreId: store.id,
          amount: totalAmount,
          billingCycle,
          status: "PENDING",
          dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 5), // Next month 5th
          items: {
            create: invoiceItems
          }
        }
      });
    }
  }

  return { success: true };
}
