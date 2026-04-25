"use client";

import React, { useTransition } from "react";
import { Search, User, MapPin, Truck, ExternalLink, Box, CheckCircle2, QrCode, ArrowUpRight, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { bookCourierAction } from "./actions";
import { useLanguage } from "@/context/LanguageContext";
import { HydratedDate } from "@/components/ui/HydratedDate";

export function OrdersTableV2({ orders }: { orders: any[] }) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleBookCourier = (orderId: string) => {
    startTransition(async () => {
      try {
        const res = await bookCourierAction(orderId, "STEADFAST");
        if (res.success) {
           alert(`Success! Tracking Code: ${res.trackingCode}`);
        }
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const getTimeLeft = (confirmedAt: string | null) => {
    if (!confirmedAt) return null;
    const deadline = new Date(confirmedAt).getTime() + 24 * 60 * 60 * 1000;
    const now = new Date().getTime();
    const diff = deadline - now;
    
    if (diff <= 0) return { label: "OVERDUE", isOverdue: true };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { label: `${hours}h ${minutes}m`, isOverdue: false };
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[32px] overflow-hidden shadow-sm bc-orders-table-v3">
         <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
               <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input placeholder={t("search_placeholder")} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
               </div>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-[#F8F9FA] text-[10px] uppercase font-bold text-[#A1A1AA] tracking-widest">
                  <tr>
                     <th className="px-6 py-4">{t("order_details")}</th>
                     <th className="px-6 py-4">{t("customer")}</th>
                     <th className="px-6 py-4">{t("fulfillment")}</th>
                     <th className="px-6 py-4 text-right">{t("amount")}</th>
                     <th className="px-6 py-4 text-center">{t("action")}</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#F1F5F9]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F8F9FA]/50 transition-colors group">
                       <td className="px-6 py-6 align-top">
                          <div className="flex flex-col">
                             <div className="font-bold text-[#0F172A] flex items-center gap-2">
                                <Link href={`/orders/${order.id}`} className="hover:text-indigo-600 transition-all flex items-center gap-2">
                                   ORD-{order.id.slice(-6).toUpperCase()}
                                   <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                 <div className="group relative ml-2">
                                    <QrCode className="w-6 h-6 text-indigo-500 cursor-pointer hover:scale-110 transition-all" />
                                   <div className="absolute left-0 top-6 hidden group-hover:flex flex-col items-center z-50 p-6 bg-white border border-gray-200 rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200 min-w-[220px]">
                                      <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${order.id}`} 
                                        alt="Order QR"
                                        className="w-48 h-48 object-contain"
                                      />
                                      <div className="text-[9px] font-black text-center mt-3 text-gray-500 uppercase tracking-widest">Scan for RMA</div>
                                   </div>
                                </div>
                             </div>
                             <div className="text-[10px] font-medium text-gray-400 mb-3 flex items-center gap-4">
                                <HydratedDate date={order.createdAt} />
                                {order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.confirmedAt && (
                                   <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight ${
                                      getTimeLeft(order.confirmedAt)?.isOverdue 
                                         ? 'bg-red-500 text-white animate-pulse' 
                                         : 'bg-amber-50 text-amber-700 border border-amber-200'
                                   }`}>
                                      {getTimeLeft(order.confirmedAt)?.isOverdue ? <AlertTriangle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                                      {getTimeLeft(order.confirmedAt)?.isOverdue ? "Overdue" : `Ship in: ${getTimeLeft(order.confirmedAt)?.label}`}
                                   </div>
                                )}
                             </div>
                          </div>
                          <div className="space-y-1">
                             {order.items.map((item: any) => (
                               <div key={item.id} className="text-xs text-gray-600 flex items-center gap-2">
                                  <span className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold">{item.quantity}</span>
                                  <span className="truncate max-w-[150px]">{item.product.name}</span>
                                </div>
                             ))}
                          </div>
                       </td>
                       <td className="px-6 py-6 align-top">
                          <div className="font-bold text-[#0F172A] flex items-center gap-2 mb-1">
                             <User className="w-3 h-3 text-gray-400" />
                             {order.customerName || "Guest"}
                          </div>
                          <div className="text-xs text-gray-400 font-medium mb-3">{order.customerPhone}</div>
                          <div className="flex items-start gap-2 max-w-[200px]">
                             <MapPin className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                             <span className="text-[10px] text-gray-500 leading-tight">{order.deliveryAddress}</span>
                          </div>
                       </td>
                       <td className="px-6 py-6 align-top">
                          <div className="flex flex-col gap-3">
                             {order.deliveryStatus !== 'PENDING' ? (
                                <div className="flex flex-col gap-1.5">
                                   <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-xl w-fit text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> {order.preferredCourier || 'EXTERNAL COURIER'}
                                   </div>
                                   {order.trackingCode && (
                                     <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-2 py-1 rounded w-fit text-[9px] font-mono border border-gray-100">
                                        <ExternalLink className="w-2.5 h-2.5" /> {order.trackingCode}
                                     </div>
                                   )}
                                   <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded w-fit ${
                                      order.deliveryStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                   }`}>
                                      {order.deliveryStatus.replace("_", " ")}
                                   </span>
                                </div>
                             ) : (
                                  <div className="flex flex-col gap-2">
                                     {(order.status === 'READY_TO_SHIP' || order.status === 'PROCESSING' || order.status === 'PARTIAL_SHIPPED' || order.status === 'CONFIRMED') ? (
                                        <>
                                           <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Awaiting Manual Booking</div>
                                           <button 
                                              onClick={() => handleBookCourier(order.id)}
                                              disabled={isPending}
                                              className="text-[10px] font-black bg-white text-slate-900 border border-slate-100 px-4 py-2.5 rounded-xl uppercase hover:bg-black hover:text-white transition-all shadow-lg shadow-gray-200 active:scale-95 disabled:opacity-50 flex items-center gap-2 w-fit"
                                           >
                                              {isPending ? <Box className="w-3.5 h-3.5 animate-bounce" /> : <Truck className="w-3.5 h-3.5" />}
                                              {isPending ? "Connecting..." : t("book_courier")}
                                           </button>
                                        </>
                                     ) : (
                                        <div className="flex flex-col gap-1.5 opacity-60">
                                           <div className="flex items-center gap-2 bg-gray-100 text-gray-500 px-2.5 py-1.5 rounded-xl w-fit text-[10px] font-black uppercase tracking-widest border border-gray-200">
                                              <Clock className="w-3.5 h-3.5" /> Awaiting Confirmation
                                           </div>
                                           <p className="text-[8px] font-bold text-gray-400">Accept the order first to enable booking.</p>
                                        </div>
                                     )}
                                  </div>
                             )}
                          </div>
                       </td>
                        <td className="px-6 py-6 align-top text-right pr-8">
                           <div className="font-black text-[#0F172A]">৳{order.total.toLocaleString()}</div>
                           <div className="mt-2 flex flex-col items-end gap-1.5">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                                 order.status === 'DELIVERED' ? 'border-green-600 bg-green-50 text-green-700' : 
                                 order.status === 'CANCELLED' ? 'border-red-600 bg-red-50 text-red-700' :
                                 order.status === 'READY_TO_SHIP' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' :
                                 'border-orange-600 bg-orange-50 text-orange-700'
                              }`}>
                                 {order.status.replace("_", " ")}
                              </span>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                                 order.paymentStatus === 'PAID' ? 'bg-[#BEF264] text-green-900' : 'bg-gray-100 text-gray-500'
                              }`}>
                                 {order.paymentStatus}
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-6 align-top text-center">
                           <Link 
                             href={`/orders/${order.id}`}
                             target="_blank"
                             className="inline-flex items-center gap-2 bg-white text-slate-900 border border-slate-100 hover:bg-black hover:text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
                           >
                              {t("manage")}
                              <ArrowUpRight className="w-3.5 h-3.5" />
                           </Link>
                        </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
  );
}
