import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session || (session.role !== "MERCHANT" && session.role !== "STAFF")) {
    if (session?.role === "SUPER_ADMIN") redirect("/admin");
    redirect("/login");
  }

  const storeId = session.merchantStoreId;
  if (!storeId) {
    return (
       <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
             <h2 className="text-xl font-bold">No Store Linked</h2>
          </div>
       </div>
    );
  }

  const store = await prisma.merchantStore.findUnique({
    where: { id: storeId },
    include: {
      subscriptionPlan: true,
      _count: {
        select: { products: true, orders: true, branches: true }
      }
    }
  });

  // Redesign: No longer redirecting immediately to onboarding
  // We will show a prompt in the dashboard instead
  /*
  if (session.role === "MERCHANT" && store && store.isOnboarded === false) {
    redirect("/merchant/onboarding");
  }
  */

  /* 
  if (session.role === "STAFF") {
    const profile = await prisma.staffProfile.findUnique({ where: { userId: session.userId } });
    if (!profile || profile.status === "ONBOARDING" || profile.status === "PENDING_APPROVAL") {
      redirect("/merchant/staff/onboarding");
    }
  }
  */

  const recentOrders = await prisma.order.findMany({
    where: { merchantStoreId: storeId },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  const revenueResult = await prisma.order.aggregate({
    where: { merchantStoreId: storeId },
    _sum: { total: true }
  });
  
  const lowStockCount = await prisma.product.count({
    where: { merchantStoreId: storeId, stock: { lt: 20 } }
  });

  const daysLeft = store?.subscriptionExpiry 
    ? Math.ceil((new Date(store.subscriptionExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <DashboardClient 
      session={session}
      store={store}
      recentOrders={recentOrders}
      totalRevenue={revenueResult._sum.total || 0}
      totalSalesCount={store?._count.orders || 0}
      lowStockCount={lowStockCount}
      daysLeft={daysLeft}
    />
  );
}
