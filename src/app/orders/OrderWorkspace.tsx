"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  ArrowLeftRight, 
  AlertTriangle,
  ChevronRight,
  MoreVertical,
  Printer,
  ExternalLink,
  Zap,
  Phone,
  ShieldCheck,
  User,
  ShoppingBag,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { updateOrderStatusAction } from "./actions";

type Order = any; // Will be properly typed

export function OrderWorkspace({ initialOrders, statsData }: { initialOrders: Order[], statsData: any[] }) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialOrders[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [isUpdating, setIsUpdating] = useState(false);

  const orders = useMemo(() => {
    let filtered = initialOrders;
    if (activeFilter !== "ALL") {
      filtered = filtered.filter(o => o.status === activeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(q) || 
        o.customerName?.toLowerCase().includes(q) ||
        o.customerPhone?.includes(q)
      );
    }
    return filtered;
  }, [initialOrders, activeFilter, searchQuery]);

  const selectedOrder = useMemo(() => 
    orders.find(o => o.id === selectedOrderId) || orders[0], 
  [orders, selectedOrderId]);

  const handleStatusUpdate = async (id: string, status: string) => {
    setIsUpdating(true);
    try {
      await updateOrderStatusAction(id, status);
      // In a real app, we'd use router.refresh() or a state update
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white border border-gray-200 rounded-none overflow-hidden shadow-xl">
      {/* Sidebar: Order List */}
      <div className="w-[380px] border-r border-gray-200 flex flex-col bg-gray-50/30">
        <div className="p-4 border-b border-gray-200 space-y-4 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Orders, Phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-none"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
             {["ALL", "PENDING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    "px-3 py-1 text-[9px] font-black uppercase tracking-widest whitespace-nowrap border transition-all",
                    activeFilter === f 
                      ? "bg-indigo-600 border-indigo-600 text-white" 
                      : "bg-white border-gray-200 text-gray-400 hover:border-indigo-600"
                  )}
                >
                  {f.replace(/_/g, " ")}
                </button>
             ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {orders.map((order) => (
            <div 
              key={order.id}
              onClick={() => setSelectedOrderId(order.id)}
              className={cn(
                "p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-white",
                selectedOrderId === order.id ? "bg-white border-l-4 border-l-indigo-600 shadow-sm" : ""
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-slate-900 uppercase">#{order.readableId || order.id.slice(-6)}</span>
                <span className={cn(
                  "text-[8px] font-black px-2 py-0.5 rounded-none uppercase tracking-tighter",
                  getStatusColors(order.status)
                )}>
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-3 h-3 text-gray-400" />
                <p className="text-[12px] font-bold text-slate-800 truncate">{order.customerName || "Walk-in Customer"}</p>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <ShoppingBag className="w-3 h-3 text-gray-400" />
                    <p className="text-[11px] font-bold text-indigo-600">৳{order.total.toLocaleString()}</p>
                 </div>
                 <p className="text-[9px] font-medium text-gray-400 uppercase">
                    {new Date(order.createdAt).toLocaleDateString()}
                 </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Panel: Order Details & Actions */}
      {selectedOrder ? (
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Action Header */}
          <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
             <div className="flex items-center gap-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Order Details <span className="text-indigo-600 ml-2">#{selectedOrder.readableId || selectedOrder.id.slice(-6)}</span></h2>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Live Context Active</span>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100"><Printer className="w-4 h-4" /></button>
                <Link href={`/orders/${selectedOrder.id}`} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100"><ExternalLink className="w-4 h-4" /></Link>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                {selectedOrder.status === "PENDING" && (
                   <button 
                    disabled={isUpdating}
                    onClick={() => handleStatusUpdate(selectedOrder.id, "READY_TO_SHIP")}
                    className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
                   >
                     Confirm & Prepare
                   </button>
                )}
                {selectedOrder.status === "READY_TO_SHIP" && (
                   <button 
                    disabled={isUpdating}
                    className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                   >
                     <Truck className="w-3.5 h-3.5" />
                     Book Courier (Live)
                   </button>
                )}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 flex gap-8">
             {/* Left Column: Context & Summary */}
             <div className="flex-1 space-y-8">
                {/* Customer Insight Card */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 border border-gray-100 p-4">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Customer Information</p>
                      <div className="space-y-3">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center text-indigo-600 font-black text-sm">
                               {selectedOrder.customerName?.charAt(0) || "U"}
                            </div>
                            <div>
                               <p className="text-[13px] font-black text-slate-800">{selectedOrder.customerName || "Walk-in Customer"}</p>
                               <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600">
                                  <Phone className="w-3 h-3" />
                                  {selectedOrder.customerPhone || "N/A"}
                               </div>
                            </div>
                         </div>
                         <div className="flex items-start gap-2 pt-2 border-t border-gray-200/50">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                            <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                               {selectedOrder.customerAddress || "No address provided"}
                            </p>
                         </div>
                      </div>
                   </div>

                   <div className="bg-indigo-600 p-4 text-white relative overflow-hidden">
                      <Zap className="absolute -right-2 -bottom-2 w-16 h-16 text-white/10" />
                      <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-3">AI Return Risk Analysis</p>
                      <div className="space-y-1 relative z-10">
                         <p className="text-2xl font-black">LOW RISK</p>
                         <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-100">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            98% Completion Probability
                         </div>
                         <p className="text-[9px] text-indigo-200/80 mt-2 italic">*Based on 14 previous orders</p>
                      </div>
                   </div>
                </div>

                {/* Items List */}
                <div className="bg-white border border-gray-200">
                   <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Order Items</span>
                      <span className="text-[10px] font-bold text-slate-400">{selectedOrder.items?.length || 0} Products</span>
                   </div>
                   <div className="divide-y divide-gray-100">
                      {selectedOrder.items?.map((item: any) => (
                         <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-all">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-gray-100 border border-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase">IMG</div>
                               <div>
                                  <p className="text-[12px] font-black text-slate-800">{item.product?.name || "Deleted Product"}</p>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">SKU: {item.product?.sku || "N/A"} | Price: ৳{item.price.toLocaleString()}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-[12px] font-black text-slate-800">x{item.quantity}</p>
                               <p className="text-[11px] font-black text-indigo-600">৳{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                         </div>
                      ))}
                   </div>
                   <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount Payable</p>
                         <p className="text-2xl font-black leading-none mt-1">৳{selectedOrder.total.toLocaleString()}</p>
                      </div>
                      <div className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                         Payment: {selectedOrder.paymentStatus}<br />
                         Method: {selectedOrder.paymentMethod}
                      </div>
                   </div>
                </div>
             </div>

             {/* Right Column: Timeline & Meta */}
             <div className="w-[280px] space-y-6 shrink-0">
                <div className="bg-white border border-gray-200 p-4">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Fulfillment Timeline</h3>
                   <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
                      <TimelineItem 
                        active={true} 
                        label="Order Placed" 
                        time={new Date(selectedOrder.createdAt).toLocaleTimeString()} 
                        date={new Date(selectedOrder.createdAt).toLocaleDateString()}
                      />
                      <TimelineItem 
                        active={selectedOrder.status !== "PENDING"} 
                        label="Processing" 
                        time={selectedOrder.status !== "PENDING" ? "Completed" : "Awaiting Action"} 
                      />
                      <TimelineItem 
                        active={selectedOrder.status === "SHIPPED" || selectedOrder.status === "DELIVERED"} 
                        label="Dispatched" 
                        time="Awaiting Logistics" 
                      />
                   </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-4">
                   <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Merchant Note</h4>
                   </div>
                   <textarea 
                    className="w-full h-24 bg-white/50 border border-amber-200 text-[11px] p-2 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-none"
                    placeholder="Add internal notes for staff..."
                   />
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/30 text-gray-400">
           <Package className="w-12 h-12 mb-4 opacity-20" />
           <p className="text-sm font-bold uppercase tracking-widest opacity-50">Select an order to view details</p>
        </div>
      )}
    </div>
  );
}

function TimelineItem({ active, label, time, date }: { active: boolean, label: string, time: string, date?: string }) {
  return (
    <div className="flex gap-4 relative z-10">
       <div className={cn(
         "w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shrink-0",
         active ? "bg-indigo-600 shadow-sm" : "bg-gray-200"
       )}>
          {active && <CheckCircle2 className="w-3 h-3 text-white" />}
       </div>
       <div>
          <p className={cn("text-[11px] font-black uppercase", active ? "text-slate-800" : "text-gray-400")}>{label}</p>
          <p className="text-[9px] font-bold text-gray-400 mt-0.5">{time} {date && `• ${date}`}</p>
       </div>
    </div>
  );
}

function getStatusColors(status: string) {
  switch (status) {
    case "PENDING": return "bg-amber-100 text-amber-700";
    case "READY_TO_SHIP": return "bg-blue-100 text-blue-700";
    case "SHIPPED": return "bg-indigo-100 text-indigo-700";
    case "DELIVERED": return "bg-emerald-100 text-emerald-700";
    case "CANCELLED": return "bg-rose-100 text-rose-700";
    default: return "bg-gray-100 text-gray-700";
  }
}
