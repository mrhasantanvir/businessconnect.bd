"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export type ReportType = "SALES" | "INVENTORY" | "LOGISTICS" | "PAYOUTS";

export async function getReportDataAction(filters: {
  type: ReportType;
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const start = filters.startDate ? startOfDay(new Date(filters.startDate)) : subDays(new Date(), 30);
  const end = filters.endDate ? endOfDay(new Date(filters.endDate)) : endOfDay(new Date());

  switch (filters.type) {
    case "SALES":
      return await getSalesReport(session.merchantStoreId, start, end, filters.status);
    case "INVENTORY":
      return await getInventoryReport(session.merchantStoreId);
    case "LOGISTICS":
      return await getLogisticsReport(session.merchantStoreId, start, end);
    default:
      throw new Error("Invalid report type");
  }
}

export async function getSalesReport(merchantStoreId: string, start: Date, end: Date, status?: string) {
  const orders = await prisma.order.findMany({
    where: {
      merchantStoreId,
      createdAt: { gte: start, lte: end },
      ...(status && status !== "ALL" ? { status } : {})
    },
    orderBy: { createdAt: "asc" }
  });

  // Calculate trends for charts
  const trends: Record<string, number> = {};
  orders.forEach(o => {
    const day = format(o.createdAt, "MMM dd");
    trends[day] = (trends[day] || 0) + o.total;
  });

  const chartData = Object.entries(trends).map(([name, amount]) => ({ name, amount }));

  return {
    tableData: orders.map(o => ({
      ID: o.id,
      Date: format(o.createdAt, "yyyy-MM-dd HH:mm"),
      Customer: o.customerName,
      Total: o.total,
      Status: o.status,
      Source: o.source,
      Payment: o.paymentStatus
    })),
    chartData,
    summary: {
      totalRevenue: orders.reduce((s, o) => s + o.total, 0),
      orderCount: orders.length,
      avgOrderValue: orders.length > 0 ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0
    }
  };
}

export async function getInventoryReport(merchantStoreId: string) {
  const products = await prisma.product.findMany({
    where: { merchantStoreId },
    include: {
      warehouseStocks: {
        include: { warehouse: true }
      }
    }
  });

  const tableData = products.map(p => ({
    SKU: p.sku,
    Name: p.name,
    Price: p.price,
    Stock: p.stock,
    Value: p.price * p.stock,
    Warehouses: p.warehouseStocks.map(s => `${s.warehouse.name}: ${s.quantity}`).join(", ")
  }));

  const totalValue = products.reduce((s, p) => s + (p.price * p.stock), 0);

  return {
    tableData,
    summary: {
      totalValue,
      itemCount: products.length,
      outOfStock: products.filter(p => p.stock <= 0).length
    }
  };
}

export async function getLogisticsReport(merchantStoreId: string, start: Date, end: Date) {
  const orders = await prisma.order.findMany({
    where: {
      merchantStoreId,
      createdAt: { gte: start, lte: end },
      preferredCourier: { not: null }
    }
  });

  const courierStats: Record<string, { count: number, revenue: number, delivered: number }> = {};
  
  orders.forEach(o => {
    const name = o.preferredCourier || "Other";
    if (!courierStats[name]) courierStats[name] = { count: 0, revenue: 0, delivered: 0 };
    courierStats[name].count++;
    courierStats[name].revenue += o.total;
    if (o.status === "DELIVERED") courierStats[name].delivered++;
  });

  const chartData = Object.entries(courierStats).map(([name, stats]) => ({
    name,
    successRate: (stats.delivered / stats.count) * 100,
    volume: stats.count
  }));

  return {
    tableData: Object.entries(courierStats).map(([name, stats]) => ({
      Courier: name,
      TotalShipments: stats.count,
      Delivered: stats.delivered,
      SuccessRate: `${((stats.delivered / stats.count) * 100).toFixed(1)}%`,
      Revenue: stats.revenue
    })),
    chartData,
    summary: {
      totalShipments: orders.length,
      avgSuccessRate: orders.length > 0 ? (orders.filter(o => o.status === "DELIVERED").length / orders.length) * 100 : 0
    }
  };
}
