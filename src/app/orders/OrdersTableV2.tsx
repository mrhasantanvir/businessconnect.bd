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
    <div className="bg-white border border-[#E5E7EB] rounded-[16px] overflow-hidden shadow-sm bc-orders-table-v3">
         <div className="p-3 border-b border-[#F1F5F9] flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
               <div className="relative w-full max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input placeholder={t("search_placeholder")} className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[12px] outline-none focus:ring-1 focus:ring-blue-100 transition-all" />
               </div>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-[12px] text-left">
               <thead className="bg-[#F8F9FA] text-[9px] uppercase font-bold text-[#A1A1AA] tracking-widest">
                  <tr>
                     <th className="px-4 py-2.5">{t("order_details")}</th>
                     <th className="px-4 py-2.5">{t("customer")}</th>
                     <th className="px-4 py-2.5">{t("fulfillment")}</th>
                     <th className="px-4 py-2.5 text-right">{t("amount")}</th>
                     <th className="px-4 py-2.5 text-center">{t("action")}</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#F1F5F9]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F8F9FA]/50 transition-colors group">
                       <td className="px-4 py-3 align-top">
                          <div className="flex flex-col">
                             <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                                <Link href={`/orders/${order.id}`} className="hover:text-indigo-600 transition-all flex items-center gap-1">
                                   ORD-{order.id.slice(-6).toUpperCase()}
                                   <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                 <div className="group relative ml-1">
                                    <QrCode className="w-4 h-4 text-indigo-500 cursor-pointer hover:scale-110 transition-all" />
                                    <div className="absolute left-0 top-5 hidden group-hover:flex flex-col items-center z-50 p-4 bg-white border border-gray-200 rounded-[20px] shadow-2xl animate-in zoom-in-95 duration-200 min-w-[160px]">
                                       <img 
                                         src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${order.id}`} 
                                         alt="Order QR"
                                         className="w-32 h-32 object-contain"
                                       />
                                       <div className="text-[8px] font-black text-center mt-2 text-gray-500 uppercase tracking-widest">RMA Scan</div>
                                    </div>
                                </div>
                             </div>
                             <div className="text-[9px] font-medium text-gray-400 mb-1 flex items-center gap-3">
                                <HydratedDate date={order.createdAt} />
                                {order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.confirmedAt && (
                                   <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${
                                      getTimeLeft(order.confirmedAt)?.isOverdue 
                                         ? 'bg-red-500 text-white animate-pulse' 
                                         : 'bg-amber-50 text-amber-700 border border-amber-200'
                                   }`}>
                                      {getTimeLeft(order.confirmedAt)?.isOverdue ? <AlertTriangle className="w-2 h-2" /> : <Clock className="w-2 h-2" />}
                                      {getTimeLeft(order.confirmedAt)?.isOverdue ? "Overdue" : `${getTimeLeft(order.confirmedAt)?.label}`}
                                   </div>
                                )}
                             </div>
                          </div>
                          <div className="space-y-0.5">
                             {order.items.slice(0, 2).map((item: any) => (
                               <div key={item.id} className="text-[10px] text-gray-500 flex items-center gap-1.5">
                                  <span className="w-3 h-3 bg-gray-100 rounded flex items-center justify-center text-[8px] font-bold">{item.quantity}</span>
                                  <span className="truncate max-w-[120px]">{item.product.name}</span>
                                </div>
                             ))}
                             {order.items.length > 2 && <div className="text-[8px] text-indigo-500 font-bold ml-4">+{order.items.length - 2} more items</div>}
                          </div>
                       </td>
                       <td className="px-4 py-3 align-top">
                          <div className="font-bold text-[#0F172A] flex items-center gap-1.5 mb-0.5">
                             <User className="w-3 h-3 text-gray-400" />
                             {order.customerName || "Guest"}
                          </div>
                          <div className="text-[10px] text-gray-400 font-medium mb-1.5">{order.customerPhone}</div>
                          <div className="flex items-start gap-1.5 max-w-[160px]">
                             <MapPin className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                             <span className="text-[9px] text-gray-500 leading-tight line-clamp-1">{order.deliveryAddress}</span>
                          </div>
                       </td>
                       <td className="px-4 py-3 align-top">
                          <div className="flex flex-col gap-1.5">
                             {order.deliveryStatus !== 'PENDING' ? (
                                <div className="flex flex-col gap-1">
                                   <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg w-fit text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                                      <CheckCircle2 className="w-3 h-3" /> {order.preferredCourier?.slice(0, 10) || 'EXTERNAL'}
                                   </div>
                                   <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded w-fit ${
                                      order.deliveryStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                   }`}>
                                      {order.deliveryStatus.replace("_", " ")}
                                   </span>
                                </div>
                             ) : (
                                   <div className="flex flex-col gap-1">
                                      {(order.status === 'READY_TO_SHIP' || order.status === 'PROCESSING' || order.status === 'PARTIAL_SHIPPED' || order.status === 'CONFIRMED') ? (
                                            <button 
                                               onClick={() => handleBookCourier(order.id)}
                                               disabled={isPending}
                                               className="text-[9px] font-black bg-white text-slate-900 border border-slate-100 px-3 py-1.5 rounded-lg uppercase hover:bg-black hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5 w-fit"
                                            >
                                               {isPending ? <Box className="w-3 h-3 animate-bounce" /> : <Truck className="w-3 h-3" />}
                                               {isPending ? "..." : t("book_courier")}
                                            </button>
                                      ) : (
                                         <div className="opacity-60 text-[8px] font-bold text-gray-400">
                                            Accept to book
                                         </div>
                                      )}
                                   </div>
                             )}
                          </div>
                       </td>
                       <td className="px-4 py-3 align-top text-right">
                          <div className="font-black text-[#0F172A]">৳{order.total.toLocaleString("en-US")}</div>
                          <div className="mt-1 flex flex-col items-end gap-1">
                             <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
                                order.status === 'DELIVERED' ? 'border-green-600 bg-green-50 text-green-700' : 
                                order.status === 'CANCELLED' ? 'border-red-600 bg-red-50 text-red-700' :
                                'border-orange-600 bg-orange-50 text-orange-700'
                             }`}>
                                {order.status}
                             </span>
                             <span className={`text-[8px] font-black px-1 py-0.5 rounded-full ${
                                order.paymentStatus === 'PAID' ? 'bg-[#BEF264] text-green-900' : 'bg-gray-100 text-gray-500'
                             }`}>
                                {order.paymentStatus}
                             </span>
                          </div>
                       </td>
                       <td className="px-4 py-3 align-top text-center">
                          <Link 
                            href={`/orders/${order.id}`}
                            className="inline-flex items-center gap-1.5 bg-white text-slate-900 border border-slate-100 hover:bg-black hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 whitespace-nowrap"
                          >
                             {t("manage")}
                             <ArrowUpRight className="w-3 h-3" />
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
