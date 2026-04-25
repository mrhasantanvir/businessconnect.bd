// [CACHE_BREAKER]: Forced Re-compilation at 2026-04-22T14:52:00Z
import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { OrderStepper } from "./OrderStepper";
import { HydratedDate } from "@/components/ui/HydratedDate";
import { redirect } from "next/navigation";

import { 
  Box, 
  Send, 
  Map, 
  Contact, 
  Wallet, 
  History, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft,
  CalendarDays,
  FileSignature,
  Printer,
  ChevronRight,
  ExternalLink,
  Phone,
  RotateCw,
  X,
  Clock,
  MapPin,
  Package,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Truck
} from "lucide-react";
import Link from "next/link";
import { AdvancePaymentControl } from "@/components/merchant/orders/AdvancePaymentControl";
import { LogisticsTrackingCard } from "@/components/merchant/orders/LogisticsTrackingCard";
import { OrderFulfillmentHub } from "@/components/merchant/orders/OrderFulfillmentHub";
import { getCombinedTrustInsightAction } from "@/app/merchant/orders/trustActions";
import { CallAction } from "@/components/dialer/CallAction";
import { CallAuditTimeline } from "@/components/dialer/CallAuditTimeline";
import { OrderChatSidebar } from "@/app/merchant/staff/chat/OrderChatSidebar";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const orderId = (await params).id;

  const order = await prisma.order.findUnique({
    where: { id: orderId, merchantStoreId: session.merchantStoreId },
    include: {
      items: { include: { product: true } },
      activities: { include: { user: true }, orderBy: { createdAt: "desc" } },
      customerEntity: true,
      callLogs: { include: { user: true }, orderBy: { createdAt: "desc" } },
      shipments: { include: { items: { include: { orderItem: { include: { product: true } } } } }, orderBy: { createdAt: "desc" } }
    }
  });
  const configs = await prisma.courierConfig.findMany({
    where: { merchantStoreId: session.merchantStoreId, isActive: true }
  });

  if (!order) redirect("/orders");

  const trustInsights = await getCombinedTrustInsightAction(order.customerPhone || "", session.merchantStoreId);

  const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"];
  const currentStatusIndex = statuses.indexOf(order.status);

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4 md:px-0">
      
      {/* 1. Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/orders" className="p-3 bg-white  border border-gray-100  rounded-2xl hover:bg-gray-50 transition-all">
               <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
               <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h1 className="text-2xl md:text-3xl font-black text-[#0F172A]  tracking-tight">Order #{order.id.slice(-6).toUpperCase()}</h1>
                   <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    order.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-[#BEF264]/10 text-green-700  border-[#BEF264]/30'
                  }`}>
                     {order.status.replace("_", " ")}
                  </div>
                  {order.confirmedAt && order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                     <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50  border border-amber-100  rounded-full text-[10px] font-black uppercase text-amber-700 ">
                        <Clock className="w-3.5 h-3.5" /> 24h Deadline
                     </div>
                  )}
               </div>
               <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2 text-[10px] md:text-xs font-bold text-gray-400">
                  <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> <HydratedDate date={order.createdAt} options={{ dateStyle: 'medium' }} /></span>
                  <span className="hidden md:block w-1 h-1 rounded-full bg-gray-300" />
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> <HydratedDate date={order.createdAt} options={{ timeStyle: 'short' }} /></span>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-2 md:gap-3">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white  border border-gray-100  rounded-2xl text-[9px] md:text-[10px] font-black uppercase hover:bg-gray-50 transition-all shadow-sm">
               <Printer className="w-4 h-4" /> Invoice
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white text-slate-900 border border-slate-100 hover:bg-black hover:text-white rounded-2xl text-[9px] md:text-[10px] font-black uppercase transition-all shadow-xl shadow-gray-200">
               <FileSignature className="w-4 h-4" /> Label
            </button>
         </div>
      </div>

      {/* 2. Professional Status Tracker */}
      <div className="bg-white  border border-[#E5E7EB]  rounded-3xl md:rounded-[48px] p-4 md:p-10 shadow-sm overflow-x-auto relative group no-scrollbar">
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent  opacity-0 group-hover:opacity-100 transition-all duration-700" />
         <div className="min-w-[600px] md:min-w-0">
            <OrderStepper currentStatus={order.status} />
          </div>
          {order.status === "SHIPPED" && (
            <div className="mt-8 flex items-center gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 animate-pulse">
               <Truck className="w-5 h-5 text-indigo-600" />
               <div>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Parcel is on the way</p>
                  <p className="text-xs font-bold text-[#0F172A] mt-1">Expected Delivery: 2-3 Business Days</p>
               </div>
            </div>
          )}
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#0F172A] ">
         
         <div className="lg:col-span-2 space-y-8">
            
            {/* Items Card */}
            <div className="bg-white  border border-[#E5E7EB]  rounded-3xl md:rounded-[48px] overflow-hidden shadow-sm">
               <div className="p-4 md:p-8 border-b border-[#F1F5F9]  bg-[#F8F9FA] ">
                  <h3 className="text-[10px] md:text-sm font-black flex items-center gap-2 uppercase tracking-widest">
                    <Box className="w-5 h-5 text-indigo-500" /> Fulfillment Manifest ({order.items.length})
                  </h3>
               </div>
               <div className="p-4 md:p-8 divide-y divide-[#F1F5F9] ">
                  {order.items.length === 0 && (
                    <div className="py-12 text-center space-y-4">
                       <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                          <Package className="w-8 h-8 text-gray-300" />
                       </div>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No individual items found in manifest.</p>
                    </div>
                  )}
                  {order.items.map((item) => (
                    <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex items-center justify-between group gap-4">
                       <div className="flex items-center gap-4 md:gap-6">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50  rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100  group-hover:scale-105 transition-all">
                             {item.product?.image ? (
                               <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                             ) : (
                               <Package className="w-6 h-6 text-gray-400" />
                             )}
                          </div>
                          <div>
                             <h4 className="text-xs md:text-sm font-black text-[#0F172A] ">{item.product?.name || item.name || "Product Deleted"}</h4>
                             <p className="text-[9px] md:text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">
                                ৳{item.price.toLocaleString()} • Qty: {item.quantity} 
                             </p>
                          </div>
                       </div>
                       <div className="text-right shrink-0">
                          <div className="text-xs md:text-sm font-black text-[#0F172A] ">৳{(item.price * item.quantity).toLocaleString()}</div>
                          <div className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase">Item Value</div>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-6 md:p-8 bg-[#F8F9FA]  border-t border-[#F1F5F9]  flex justify-end">
                  <div className="w-full max-w-xs space-y-3 md:space-y-4 text-right">
                     <div className="flex justify-between text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <span>Items Value</span>
                        <span>৳{order.total.toLocaleString('en-US')}</span>
                     </div>
                     <div className="flex justify-between text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <span>Logistics Fee</span>
                        <span>৳0</span>
                     </div>
                     <div className="pt-4 border-t border-[#F1F5F9]  flex justify-between items-end">
                        <span className="text-xs md:text-sm font-black text-[#0F172A]  uppercase tracking-widest">Grand Total</span>
                        <span className="text-xl md:text-2xl font-black text-indigo-600">৳{order.total.toLocaleString('en-US')}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Audit Logs Experience */}
            <div className="bg-white border border-gray-100 p-6 md:p-10 rounded-3xl md:rounded-[48px] shadow-sm space-y-8 md:space-y-12">
               <h3 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-[#BEF264]">
                 <ShieldCheck className="w-5 h-5" /> Immutable Audit Trail
               </h3>
               <div className="space-y-10 relative">
                  <div className="absolute top-0 left-6 h-full w-0.5 bg-white/5 -z-0" />
                  
                  {/* Unified Audit & Call Timeline */}
                  <CallAuditTimeline 
                    auditorId={session.userId}
                    logs={([...order.activities.map(a => ({ ...a, direction: 'ACTIVITY', from: '', to: '' })), ...(order.callLogs || [])] as any)
                      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())} 
                  />
               </div>
            </div>

             {(order.status === "SHIPPED" || order.status === "PARTIAL_SHIPPED" || order.status === "DELIVERED") && (
               <div className="space-y-6">
                  <h3 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-indigo-500">
                    <Send className="w-5 h-5" /> Shipment History ({order.shipments.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {order.shipments.map((shipment) => (
                        <div key={shipment.id} className="bg-white  border border-gray-100  p-6 rounded-3xl space-y-4">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 bg-indigo-50  rounded-lg flex items-center justify-center text-indigo-600">
                                    <Send className="w-4 h-4" />
                                 </div>
                                 <span className="text-[10px] font-black uppercase tracking-widest">{shipment.courierName}</span>
                              </div>
                              <span className="text-[9px] font-mono font-bold text-gray-400">{new Date(shipment.shippedAt).toLocaleDateString()}</span>
                           </div>
                           <div className="px-4 py-2 bg-gray-50  rounded-xl border border-gray-100  font-mono text-[10px] text-gray-500 flex items-center justify-between">
                              {shipment.trackingCode}
                              <ExternalLink className="w-3 h-3" />
                           </div>
                           <div className="space-y-1.5">
                              {shipment.items.map((si) => (
                                 <div key={si.id} className="flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-gray-500">{si.orderItem.product?.name || si.orderItem.productId}</span>
                                    <span className="font-black text-indigo-600">x{si.quantity}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {(order.status === "SHIPPED" || order.status === "DELIVERED") && order.courierTrxId && (
               <LogisticsTrackingCard 
                 trackingCode={order.courierTrxId} 
                 courierName={order.preferredCourier} 
               />
            )}

         </div>

         {/* Sidebar Controls */}
         <div className="space-y-8">
            
             <OrderFulfillmentHub order={order} configs={configs} />

            {/* Customer Intelligence Blueprint */}
            <div className="bg-[#F8F9FA]  border border-[#E5E7EB]  rounded-3xl md:rounded-[48px] p-6 md:p-8 space-y-6 md:space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-indigo-500 tracking-[0.2em]">CRM 360° Insight</h3>
                  {order.customerEntityId && (
                     <Link href={`/merchant/customers/${order.customerEntityId}`}>
                        <ExternalLink className="w-4 h-4 text-gray-400 hover:text-indigo-500 transition-all" />
                     </Link>
                  )}
               </div>
               
               <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm font-black text-xl ${
                    trustInsights.riskLevel === 'HIGH' ? 'bg-red-50 border-red-100 text-red-400' : 'bg-white  border-indigo-100  text-indigo-400'
                  }`}>
                     {order.customerName?.[0].toUpperCase() || "G"}
                  </div>
                  <div className="flex-1">
                     <h4 className="text-sm font-black flex items-center gap-2">
                       {order.customerName || "Guest Customer"}
                       {trustInsights.riskLevel === 'HIGH' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                     </h4>
                     <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">{order.customerPhone}</p>
                  </div>
                  <CallAction phone={order.customerPhone || ""} name={order.customerName || ""} />
               </div>

               {/* Trust Score & Metrics */}
               <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                  {(order.status === 'RETURNED' || order.returnRequest) && (
                    <Link 
                      href={`/orders/${order.id}/return-slip`}
                      className="w-full py-4 bg-white border border-red-100 text-red-600 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Printer className="w-4 h-4" /> Print Return Manifest
                    </Link>
                  )}
                  <button className="w-full py-4 bg-white  border border-red-100  text-red-600 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-red-50 transition-all">
                      Cancel Fulfillment
                  </button>
               </div>

               <div className="space-y-6">
                  <div className="relative h-2 w-full bg-gray-100  rounded-full overflow-hidden">
                     <div 
                       className={`absolute top-0 left-0 h-full transition-all duration-1000 ${
                         trustInsights.trustScore < 50 ? 'bg-red-500' : trustInsights.trustScore < 75 ? 'bg-amber-500' : 'bg-[#BEF264]'
                       }`} 
                       style={{ width: `${trustInsights.trustScore}%` }} 
                     />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                     <span className="text-gray-400">Trust Score</span>
                     <span className={trustInsights.trustScore < 50 ? 'text-red-600' : 'text-indigo-600'}>{trustInsights.trustScore}% / 100</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-white  rounded-2xl border border-gray-50 ">
                        <div className="text-[8px] font-black text-gray-400 uppercase mb-1">Local Success</div>
                        <div className="flex items-baseline gap-1">
                           <span className="text-sm font-black text-indigo-600">{trustInsights.localStats.delivered}</span>
                           <span className="text-[8px] text-gray-400">/ {trustInsights.localStats.total}</span>
                        </div>
                     </div>
                     <div className="p-4 bg-white  rounded-2xl border border-gray-50 ">
                        <div className="text-[8px] font-black text-gray-400 uppercase mb-1">Global Success</div>
                        <div className="flex items-baseline gap-1">
                           <span className="text-sm font-black text-[#65A30D]">{trustInsights.globalStats.delivered}</span>
                           <span className="text-[8px] text-gray-400">/ {trustInsights.globalStats.total}</span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white  p-4 rounded-2xl border border-dashed border-gray-200 ">
                     <h5 className="text-[9px] font-black uppercase text-gray-400 mb-2 flex items-center gap-1">
                       <ShieldCheck className="w-3 h-3" /> Intelligence Recommendation
                     </h5>
                     <p className={`text-[11px] font-bold leading-relaxed ${trustInsights.riskLevel === 'HIGH' ? 'text-red-600' : 'text-gray-500'}`}>
                       {trustInsights.recommendation}
                     </p>
                  </div>

                  {/* Advance Payment Control */}
                  <AdvancePaymentControl 
                    orderId={orderId} 
                    currentAdvance={order.advancePaid} 
                    totalAmount={order.total} 
                  />
                  
                  <div className="flex items-start gap-4">
                     <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                     <div>
                        <h5 className="text-[9px] font-black uppercase text-gray-400 mb-1">Dispatch Destination</h5>
                        <p className="text-[11px] font-bold text-gray-500  leading-relaxed">{order.deliveryAddress || "Awaiting Data"}</p>
                     </div>
                  </div>
               </div>

               <div className="p-6 bg-white  rounded-[32px] border border-indigo-50  flex items-center gap-4 group">
                  <ShieldCheck className="w-8 h-8 text-[#BEF264] shrink-0" />
                  <div>
                     <span className="text-[10px] font-black text-[#0F172A] ">Verified Identity</span>
                     <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Automated Fraud Sync: Passed</p>
                  </div>
               </div>
            </div>

         </div>

      </div>
      
      <OrderChatSidebar orderId={orderId} orderNumber={order.id} />
    </div>
  );
}

