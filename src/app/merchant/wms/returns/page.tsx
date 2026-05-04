import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RotateCcw, Search, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { ReturnProcessingForm } from "./ReturnProcessingForm";

export default async function ReturnsHubPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const returns = await prisma.returnRequest.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: { order: true, warehouse: true },
    orderBy: { createdAt: "desc" }
  });

  const warehouses = await prisma.warehouse.findMany({
    where: { merchantStoreId: session.merchantStoreId }
  });

  const shippedOrders = await prisma.order.findMany({
    where: { 
      merchantStoreId: session.merchantStoreId,
      deliveryStatus: { in: ['SHIPPED', 'DELIVERED'] }
    },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="space-y-1">
         <div className="flex items-center gap-2 text-rose-600  font-bold text-xs uppercase tracking-widest">
            <RotateCcw className="w-3.5 h-3.5" /> RMA Engine
         </div>
         <h1 className="text-4xl font-extrabold text-[#0F172A]  tracking-tight">Returns & Inspections</h1>
         <p className="text-[#64748B]  text-sm max-w-xl leading-relaxed">
            Process customer returns and automate inventory restock logic based on quality inspection results.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1">
            <ReturnProcessingForm warehouses={warehouses} orders={shippedOrders} />
         </div>

         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white  border border-[#E5E7EB]  rounded-[32px] overflow-hidden shadow-sm">
               <div className="p-6 border-b border-[#F1F5F9]  flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="w-5 h-5 text-rose-500" />
                     <h3 className="font-extrabold text-[#0F172A] ">RMA Activity Log</h3>
                  </div>
               </div>

               <div className="divide-y divide-[#F1F5F9] ">
                  {returns.map(ret => {
                    const items = JSON.parse(ret.items);
                    return (
                      <div key={ret.id} className="p-6 hover:bg-gray-50  transition-colors group">
                         <div className="flex items-start justify-between">
                            <div className="space-y-1">
                               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RMA-#{ret.id.slice(-6).toUpperCase()}</div>
                               <div className="font-bold text-[#0F172A]  flex items-center gap-2">
                                  Order: ORD-{ret.order.id.slice(-6).toUpperCase()}
                                  <ExternalLink className="w-3 h-3 text-gray-400" />
                               </div>
                               <div className="text-sm text-gray-500 font-medium">Reason: {ret.reason}</div>
                            </div>
                            <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                               ret.status === 'RESTOCKED' ? 'bg-green-50 text-green-700 border-green-100' :
                               ret.status === 'DAMAGED' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                               'bg-red-50 text-red-700 border-red-100'
                            }`}>
                               {ret.status}
                            </div>
                         </div>
                         
                         <div className="mt-4 flex flex-wrap gap-2 text-xs">
                            {items.map((item: any) => (
                              <div key={item.productId} className="bg-gray-100  px-3 py-1 rounded-lg text-gray-600  font-bold">
                                 {item.quantity}x Units
                              </div>
                            ))}
                         </div>
                         <div className="mt-4 text-[10px] text-gray-400">
                            Received at Hub: {ret.warehouse?.name || 'TBD'} • {new Date(ret.createdAt).toLocaleString()}
                         </div>
                      </div>
                    );
                  })}
                  {returns.length === 0 && (
                    <div className="p-20 text-center space-y-2 opacity-30">
                       <AlertCircle className="w-12 h-12 mx-auto" />
                       <div className="text-sm font-bold uppercase tracking-widest">No Returns Processed</div>
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

