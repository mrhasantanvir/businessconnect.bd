import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Warehouse, MapPin, Plus, CheckCircle2, Globe, Package } from "lucide-react";
import { WarehouseForm } from "./WarehouseForm";

export default async function WarehousesPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const warehouses = await prisma.warehouse.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: { _count: { select: { stocks: true } } },
    orderBy: { isDefault: "desc" }
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
           <div className="flex items-center gap-2 text-[#1E40AF] font-bold text-xs uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5" /> Logistics Control
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Physical Hubs</h1>
          <p className="text-[#64748B] text-sm max-w-xl leading-relaxed">
            Manage your globally distributed storage locations. Each hub can be assigned specific routing rules for automated fulfillment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hub Creation / Entry */}
        <div className="lg:col-span-1">
           <WarehouseForm />
        </div>

        {/* Hub List */}
        <div className="lg:col-span-2 space-y-4">
           {warehouses.map((wh) => (
             <div key={wh.id} className="bg-white border border-[#E5E7EB] p-6 rounded-[24px] shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                {wh.isDefault && (
                  <div className="absolute top-0 right-0 bg-[#BEF264] text-[#0F172A] px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
                    Primary Fulfillment Hub
                  </div>
                )}
                
                <div className="flex items-start justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                         <Warehouse className="w-7 h-7 text-[#1E40AF]" />
                      </div>
                      <div>
                         <h3 className="text-xl font-bold text-[#0F172A]">{wh.name}</h3>
                         <div className="flex items-center gap-2 text-sm text-[#64748B] mt-1 font-medium">
                            <MapPin className="w-3.5 h-3.5" /> {wh.location || "Global Coordinates"}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-8 flex items-center gap-8 border-t border-[#F1F5F9] pt-6">
                   <div>
                      <div className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-1">Stocked SKUs</div>
                      <div className="text-2xl font-bold text-[#0F172A]">{wh._count.stocks}</div>
                   </div>
                   <div>
                      <div className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-1">Status</div>
                      <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm">
                         <CheckCircle2 className="w-4 h-4" /> Operational
                      </div>
                   </div>
                </div>
             </div>
           ))}

           {warehouses.length === 0 && (
             <div className="h-48 border-2 border-dashed border-[#E5E7EB]  rounded-[32px] flex flex-col items-center justify-center text-[#A1A1AA]">
                <Package className="w-8 h-8 mb-2 opacity-20" />
                <span className="text-sm font-medium">No storage hubs found. Register your first location.</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

