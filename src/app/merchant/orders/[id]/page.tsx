import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Package, 
  Truck, 
  MapPin, 
  User, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Calendar,
  ShieldCheck,
  FileText,
  Printer
} from "lucide-react";
import Link from "next/link";
import { 
  confirmOrderAction, 
  markReadyToShipAction, 
  cancelOrderAction 
} from "../fulfillmentActions";
import { InvoiceActions } from "@/components/merchant/InvoiceActions";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const orderId = (await params).id;

  const order = await prisma.order.findUnique({
    where: { id: orderId, merchantStoreId: session.merchantStoreId },
    include: {
      items: { include: { product: true } },
      activities: { orderBy: { createdAt: "desc" } },
      assignedDriver: true
    }
  });

  const store = await prisma.merchantStore.findUnique({
    where: { id: session.merchantStoreId }
  });

  if (!order) redirect("/orders");

  const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"];
  const currentStatusIndex = statuses.indexOf(order.status);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* 1. Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <Link href="/orders" className="p-3 bg-white  border border-gray-100  rounded-2xl hover:bg-gray-50 transition-all">
               <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
               <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-[#0F172A]  tracking-tight">Order #{order.id.slice(-6).toUpperCase()}</h1>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    order.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-[#BEF264]/10 text-green-700  border-[#BEF264]/30'
                  }`}>
                     {order.status.replace("_", " ")}
                  </div>
               </div>
               <div className="flex items-center gap-4 mt-2 text-xs font-bold text-gray-400">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Ordered on {new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleTimeString()}</span>
               </div>
            </div>
         </div>
         <InvoiceActions order={order} store={store} />
      </div>

      {/* 2. Professional Status Tracker */}
      <div className="bg-white  border border-[#E5E7EB]  rounded-[48px] p-10 shadow-sm overflow-hidden">
         <div className="relative flex items-center justify-between">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100  -translate-y-1/2 -z-0" />
            <div className={`absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 -z-0 transition-all duration-1000`} style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }} />
            
            {statuses.map((s, i) => (
               <div key={s} className="relative z-10 flex flex-col items-center gap-3 group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                    i <= currentStatusIndex 
                      ? 'bg-indigo-500 border-indigo-100 ' 
                      : 'bg-white  border-gray-100 '
                  }`}>
                     {i < currentStatusIndex ? <CheckCircle2 className="w-5 h-5 text-white" /> : <div className={`w-3 h-3 rounded-full ${i === currentStatusIndex ? 'bg-white animate-pulse' : 'bg-gray-200 '}`} />}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${i <= currentStatusIndex ? 'text-indigo-500' : 'text-gray-400'}`}>{s.replace("_", " ")}</span>
               </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* 3. Main Content: Items & Timeline */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Items Card */}
            <div className="bg-white  border border-[#E5E7EB]  rounded-[48px] overflow-hidden shadow-sm">
               <div className="p-8 border-b border-[#F1F5F9]  bg-[#F8F9FA] ">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-500" /> Ordered Items ({order.items.length})
                  </h3>
               </div>
               <div className="p-8 divide-y divide-[#F1F5F9] ">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex items-center justify-between group">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-gray-50  rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100  group-hover:scale-105 transition-all">
                             {item.product?.image ? (
                               <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                             ) : (
                               <Package className="w-6 h-6 text-gray-400" />
                             )}
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-[#0F172A] ">{item.product?.name || "Deleted Product"}</h4>
                             <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">SKU: {item.product?.id.slice(0, 8) || "N/A"} • Qty: {item.quantity}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-sm font-bold text-[#0F172A] ">৳{item.price.toLocaleString()}</div>
                          <div className="text-[10px] font-bold text-gray-400">Unit Price</div>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-8 bg-[#F8F9FA]  border-t border-[#F1F5F9]  flex justify-end">
                  <div className="w-full max-w-xs space-y-4">
                     <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                        <span>Items Subtotal</span>
                        <span>৳{order.total.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                        <span>Shipping Fee</span>
                        <span>৳0</span>
                     </div>
                     <div className="pt-4 border-t border-[#F1F5F9]  flex justify-between">
                        <span className="text-sm font-bold text-[#0F172A]  uppercase">Grand Total</span>
                        <span className="text-xl font-bold text-indigo-600">৳{order.total.toLocaleString()}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Timeline Experience */}
            <div className="bg-white  border border-[#E5E7EB]  rounded-[48px] p-8 shadow-sm">
               <h3 className="text-sm font-bold mb-10 flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-green-500" /> Professional Audit Trail
               </h3>
               <div className="space-y-12 relative">
                  <div className="absolute top-0 left-6 h-full w-0.5 bg-gray-50  -z-0" />
                  {order.activities.map((activity, idx) => (
                    <div key={activity.id} className="relative z-10 flex items-start gap-8 group">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all group-hover:scale-110 ${
                         idx === 0 ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-white  text-gray-400 border border-gray-100 '
                       }`}>
                          <Clock className="w-5 h-5" />
                       </div>
                       <div className="flex-1 pt-1">
                          <div className="flex items-center justify-between mb-1">
                             <h4 className="text-xs font-bold uppercase tracking-widest">{activity.type.replace("_", " ")}</h4>
                             <span className="text-[9px] font-bold text-gray-400">{new Date(activity.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs font-medium text-gray-500 leading-relaxed">{activity.message}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

         </div>

         {/* 4. Sidebar: Fulfillment Actions & Customer Meta */}
         <div className="space-y-8">
            
            {/* Action Center */}
            <div className="bg-white  border border-[#E5E7EB]  rounded-[48px] p-8 shadow-sm space-y-6">
               <h3 className="text-xs font-bold uppercase text-gray-400 tracking-[0.2em] mb-6">Fulfillment Actions</h3>
               
               {order.status === "PENDING" && (
                 <form action={async () => { "use server"; await confirmOrderAction(orderId); }} className="w-full">
                   <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-3xl font-bold text-[11px] uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Confirm & Reserve Stock
                   </button>
                 </form>
               )}

               {order.status === "CONFIRMED" && (
                 <form action={async () => { "use server"; await markReadyToShipAction(orderId); }} className="w-full">
                    <button type="submit" className="w-full py-4 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-3xl font-bold text-[11px] uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-2">
                       <Package className="w-4 h-4" /> Mark as Ready to Ship
                    </button>
                 </form>
               )}

               {order.status === "READY_TO_SHIP" && (
                 <div className="space-y-4">
                    <div className="p-5 bg-indigo-50  rounded-3xl border border-indigo-100 ">
                       <h4 className="text-[10px] font-bold text-indigo-700 uppercase mb-2">Automated Dispatch</h4>
                       <p className="text-[9px] font-medium text-indigo-600/80">Package is packed. Ready for courier pickup.</p>
                    </div>
                    <button className="w-full py-4 bg-green-600 text-white rounded-3xl font-bold text-[11px] uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-green-200 transition-all flex items-center justify-center gap-2">
                       <Truck className="w-4 h-4" /> Quick Book Steadfast
                    </button>
                 </div>
               )}

               {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                 <button className="w-full py-4 bg-white  border border-red-100  text-red-600 rounded-3xl font-bold text-[11px] uppercase tracking-widest hover:bg-red-50 transition-all">
                    Cancel Order
                 </button>
               )}
            </div>

            {/* Customer Insight Card */}
            <div className="bg-[#F8F9FA]  border border-[#E5E7EB]  rounded-[48px] p-8 space-y-8">
               <h3 className="text-xs font-bold uppercase text-indigo-500 tracking-[0.2em]">Customer Profile</h3>
               
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white  rounded-2xl flex items-center justify-center border border-indigo-100  shadow-sm">
                     <User className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div>
                     <h4 className="text-sm font-bold">{order.customerName || "Guest Customer"}</h4>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-none mt-1">{order.customerPhone}</p>
                  </div>
               </div>

               <div className="space-y-6 pt-6 border-t border-gray-100 ">
                  <div className="space-y-4">
                     <div className="flex items-start gap-4">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                        <div>
                           <h5 className="text-[9px] font-bold uppercase text-gray-400 mb-1">Shipping Address</h5>
                           <p className="text-[11px] font-bold text-gray-600  leading-relaxed">{order.deliveryAddress || "Not Provided"}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <CreditCard className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                        <div>
                           <h5 className="text-[9px] font-bold uppercase text-gray-400 mb-1">Payment Method</h5>
                           <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-gray-600 ">Cash on Delivery</span>
                              <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                 order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                                 {order.paymentStatus}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-6 bg-white  rounded-[32px] border border-indigo-50 ">
                  <div className="flex items-center gap-2 mb-2">
                     <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                     <span className="text-[10px] font-bold">Fraud Protection</span>
                  </div>
                  <p className="text-[9px] font-medium text-gray-400">Customer has successfuly completed 0 orders before. Verified Phone.</p>
               </div>
            </div>

         </div>

      </div>

    </div>
  );
}
