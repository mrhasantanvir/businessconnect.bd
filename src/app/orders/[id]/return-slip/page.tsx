
import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReturnPackingSlip } from "@/components/merchant/orders/ReturnPackingSlip";

export default async function ReturnSlipPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const orderId = (await params).id;

  const order = await prisma.order.findUnique({
    where: { id: orderId, merchantStoreId: session.merchantStoreId },
    include: {
      items: { include: { product: true } },
      merchantStore: true
    }
  });

  if (!order) redirect("/orders");

  const returnRequest = await prisma.returnRequest.findFirst({
    where: { orderId: orderId },
    orderBy: { createdAt: "desc" }
  }) || { id: "NEW", method: "MANUAL" };

  return (
    <div className="min-h-screen bg-slate-50 py-20 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-center print:hidden">
          <button 
            onClick={() => window.print()}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-200"
          >
            Download & Print Slip
          </button>
        </div>
        <ReturnPackingSlip order={order} returnRequest={returnRequest} />
      </div>
    </div>
  );
}
