import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Box, MapPin, Truck } from "lucide-react";
import { UnifiedLogisticsHub } from "./UnifiedLogisticsHub";

export default async function MerchantLogisticsPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const configs = await prisma.courierConfig.findMany({
    where: { merchantStoreId: session.merchantStoreId }
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
           <div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-2">
                 <Truck className="w-4 h-4" /> Logistics Intelligence Layer
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
                 Logistics <span className="text-indigo-600">Control</span> Center
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-2 italic opacity-80">
                Manage automated courier APIs and zone-based pricing strategies in one unified hub.
              </p>
           </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-none p-6 relative overflow-hidden border border-gray-100 shadow-sm text-gray-900">
          <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none">
             <img src="/images/courier_illustration.png" alt="" className="w-full h-full object-contain object-right" />
          </div>
          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">Custom Delivery Rules & Routing</h2>
            <p className="text-slate-600 font-medium max-w-2xl leading-relaxed text-sm">
              You can explicitly route individual products to specific couriers and districts right inside the "Add Product" module! 
              For example, you can enforce that "Rajshahi Mangoes" are strictly delivered via "STEADFAST" and only to "Dhaka, Rajshahi" districts. 
              These global API keys power those intelligent routing rules.
            </p>
          </div>
        </div>

        {/* The Unified Hub Component */}
        <UnifiedLogisticsHub existingConfigs={configs} />
        
      </div>
    </div>
  );
}

