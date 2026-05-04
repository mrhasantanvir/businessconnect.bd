import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Truck, ArrowRight, MapPin, Box, Send, Calendar } from "lucide-react";
import { TransferForm } from "./TransferForm";

export default async function StockTransfersPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const transfers = await prisma.stockTransfer.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: { fromWarehouse: true, toWarehouse: true },
    orderBy: { createdAt: "desc" }
  });

  const warehouses = await prisma.warehouse.findMany({
    where: { merchantStoreId: session.merchantStoreId }
  });

  const products = await prisma.product.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: { warehouseStocks: true }
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="space-y-1">
         <div className="flex items-center gap-2 text-orange-600  font-bold text-xs uppercase tracking-widest">
            <Truck className="w-3.5 h-3.5" /> Logistics Routing
         </div>
         <h1 className="text-4xl font-extrabold text-[#0F172A]  tracking-tight">Stock Movements</h1>
         <p className="text-[#64748B]  text-sm max-w-xl leading-relaxed">
            Digitally coordinate product transfers between your fulfillment hubs with full audit traceability.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1">
            <TransferForm warehouses={warehouses} products={products} />
         </div>

         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white  border border-[#E5E7EB]  rounded-[32px] overflow-hidden shadow-sm">
               <div className="p-6 border-b border-[#F1F5F9]  flex items-center justify-between bg-gray-50/50 ">
                  <div className="flex items-center gap-3">
                     <Send className="w-5 h-5 text-orange-500" />
                     <h3 className="font-extrabold text-[#0F172A] ">Active & Past Transfers</h3>
                  </div>
               </div>
               
               <div className="divide-y divide-[#F1F5F9] ">
                  {transfers.map(tr => {
                    const items = JSON.parse(tr.items);
                    return (
                      <div key={tr.id} className="p-6 hover:bg-gray-50  transition-colors group">
                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-6 flex-1">
                               <div className="flex flex-col items-center">
                                  <div className="bg-gray-100  p-3 rounded-2xl">
                                     <MapPin className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <div className="text-[10px] font-bold text-gray-500 mt-1 uppercase text-center w-16">{tr.fromWarehouse.name.split(' ')[0]}</div>
                               </div>
                               <ArrowRight className="w-5 h-5 text-orange-400 animate-pulse" />
                               <div className="flex flex-col items-center">
                                  <div className="bg-orange-50  p-3 rounded-2xl">
                                     <MapPin className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <div className="text-[10px] font-bold text-gray-500 mt-1 uppercase text-center w-16">{tr.toWarehouse.name.split(' ')[0]}</div>
                               </div>
                               <div className="ml-4 flex-1">
                                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Transfer ID</div>
                                  <div className="font-bold text-[#0F172A] ">#TR-{tr.id.slice(-6).toUpperCase()}</div>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-8">
                               <div className="text-right">
                                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Items</div>
                                  <div className="flex items-center gap-2 font-bold text-[#0F172A] ">
                                     <Box className="w-4 h-4 text-gray-400" /> {items.length} SKUs
                                  </div>
                               </div>
                               <div className="text-right min-w-[100px]">
                                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</div>
                                  <div className="flex items-center justify-end gap-2 text-xs font-medium text-gray-500">
                                     <Calendar className="w-3.5 h-3.5" /> {new Date(tr.createdAt).toLocaleDateString()}
                                  </div>
                               </div>
                               <div className="bg-green-50  text-green-600  px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border border-green-100 ">
                                  {tr.status}
                               </div>
                            </div>
                         </div>
                         {tr.notes && (
                           <p className="mt-4 text-[10px] text-gray-400 font-medium px-4 py-2 bg-gray-50  border-l-2 border-gray-200 rounded-r-lg">
                             Note: {tr.notes}
                           </p>
                         )}
                      </div>
                    );
                  })}
                  {transfers.length === 0 && (
                    <div className="p-20 text-center space-y-3">
                       <Truck className="w-12 h-12 text-gray-200 mx-auto" />
                       <div className="text-sm font-medium text-gray-400">No stock transfers initiated in this cycle.</div>
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

