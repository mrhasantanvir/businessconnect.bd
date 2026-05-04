import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { 
  Truck, MapPin, Phone, CheckCircle2, 
  ChevronRight, Navigation, Package, DollarSign 
} from "lucide-react";
import { updateDeliveryStatusAction } from "./actions";
import { redirect } from "next/navigation";

export default async function DriverDashboard() {
  const session = await getSession();
  
  if (!session || session.role !== "STAFF") {
    // In a real app we'd check if they are specifically a "Driver" but role check is fine for now
    redirect("/login");
  }

  const assignedOrders = await prisma.order.findMany({
    where: { 
      assignedDriverId: session.id,
      deliveryStatus: { not: "DELIVERED" } 
    },
    include: {
       merchantStore: true,
       items: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const completedToday = await prisma.order.count({
    where: {
      assignedDriverId: session.id,
      deliveryStatus: "DELIVERED",
      createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
    }
  });

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-24">
      {/* Header */}
      <div className="bg-[#1E40AF] text-white p-6 rounded-b-[32px] shadow-lg">
         <div className="flex justify-between items-center mb-6">
            <div>
               <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Driver OS</p>
               <h1 className="text-2xl font-bold">{session.name}</h1>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
               <Truck className="w-6 h-6" />
            </div>
         </div>
         
         <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
               <p className="text-[10px] font-bold opacity-70 uppercase mb-1">Active tasks</p>
               <p className="text-xl font-bold">{assignedOrders.length}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
               <p className="text-[10px] font-bold opacity-70 uppercase mb-1">Today's Jobs</p>
               <p className="text-xl font-bold">{completedToday}</p>
            </div>
         </div>
      </div>

      {/* Delivery List */}
      <div className="p-6 space-y-6">
         <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Current Missions</h2>
         
         {assignedOrders.length === 0 ? (
           <div className="py-20 text-center opacity-30">
              <Package className="w-12 h-12 mx-auto mb-2" />
              <p className="font-bold">No active assignments.</p>
           </div>
         ) : (
           assignedOrders.map((order) => (
             <div key={order.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                   <div>
                      <div className="text-[10px] font-bold text-indigo-600 mb-1">#{order.id.slice(-6).toUpperCase()}</div>
                      <h3 className="font-bold text-gray-900">{order.customerName || "Guest Customer"}</h3>
                   </div>
                   <div className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full uppercase">
                      {order.deliveryStatus.replace("_", " ")}
                   </div>
                </div>

                <div className="space-y-3 py-4 border-y border-gray-50">
                   <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-gray-600 leading-relaxed">
                         {order.deliveryAddress}
                      </p>
                   </div>
                   <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <p className="text-xs font-bold text-gray-900">{order.customerPhone}</p>
                   </div>
                </div>

                <div className="flex gap-3 pt-2">
                   <a 
                     href={`tel:${order.customerPhone}`}
                     className="flex-1 h-12 bg-gray-50 text-gray-900 rounded-xl flex items-center justify-center gap-2 font-bold text-xs"
                   >
                      <Phone className="w-4 h-4" /> Call
                   </a>
                   <a 
                     href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress || "")}`}
                     target="_blank"
                     className="flex-1 h-12 bg-gray-50 text-gray-900 rounded-xl flex items-center justify-center gap-2 font-bold text-xs"
                   >
                      <Navigation className="w-4 h-4" /> Map
                   </a>
                </div>

                <form action={async () => {
                  "use server";
                  await updateDeliveryStatusAction(order.id, "DELIVERED", order.total);
                }}>
                  <button 
                    type="submit"
                    className="w-full h-14 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-green-600/20 active:scale-95 transition-transform"
                  >
                     <CheckCircle2 className="w-5 h-5" /> Mark as Delivered
                  </button>
                </form>
             </div>
           ))
         )}
      </div>

      {/* Fleet Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 flex justify-around items-center">
         <button className="flex flex-col items-center gap-1 text-indigo-600">
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">Jobs</span>
         </button>
         <button className="flex flex-col items-center gap-1 text-gray-400">
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">Balance</span>
         </button>
         <button className="flex flex-col items-center gap-1 text-gray-400">
            <ChevronRight className="w-5 h-5 rotate-90" />
            <span className="text-[10px] font-bold uppercase">Fleet</span>
         </button>
      </div>
    </div>
  );
}
