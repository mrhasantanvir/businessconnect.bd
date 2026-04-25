import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrdersTableV2 } from "../OrdersTableV2";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function OrderListPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ status?: string, today?: string }> 
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const resolvedParams = await searchParams;
  const status = resolvedParams.status;
  const todayFilter = resolvedParams.today === "true";

  let whereClause: any = { 
    merchantStoreId: session.merchantStoreId 
  };

  if (status && status !== "DAMAGED") {
    whereClause.status = status;
  }

  if (todayFilter) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    whereClause.createdAt = { gte: today };
  }

  // If "DAMAGED", it's a bit specialized. Typically we would query return requests.
  // For now, if someone clicks damaged, we show returned orders that have damaged items 
  // or just empty array if it's strictly a ReturnRequest UI.
  // We will map DAMAGED as an empty list for the standard OrdersTable until a dedicated ReturnsList is made,
  // or just show returned ones for now as an example fallback.
  if (status === "DAMAGED") {
    const damagedReturns = await prisma.returnRequest.findMany({
      where: { merchantStoreId: session.merchantStoreId, status: "DAMAGED" },
      select: { orderId: true }
    });
    whereClause.id = { in: damagedReturns.map((r: any) => r.orderId) };
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
       items: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const getStatusLabel = (s?: string) => {
    if (!s) return "All";
    if (s === "READY_TO_SHIP") return "Ready To Ship";
    return s.charAt(0) + s.slice(1).toLowerCase();
  };

  const titlePrefix = todayFilter ? "Today's " : "";
  const title = `${titlePrefix}${getStatusLabel(status)} Orders`;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <Link 
              href="/orders" 
              className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                {title}
              </h1>
              <p className="text-[#64748B] text-sm font-medium mt-1">Viewing list of {orders.length} order(s).</p>
            </div>
         </div>
      </div>

      <OrdersTableV2 orders={orders} />
    </div>
  );
}
