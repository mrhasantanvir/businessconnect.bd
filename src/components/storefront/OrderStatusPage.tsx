"use client";

import React from "react";
import { 
  CheckCircle2, 
  Truck, 
  Package, 
  MapPin, 
  Printer, 
  Download,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Globe,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogisticsTrackingCard } from "@/components/merchant/orders/LogisticsTrackingCard";
import { requestReturnAction } from "@/app/s/[slug]/actions";

export function OrderStatusPage({ order, store, slug }: { order: any, store: any, slug: string }) {
  const router = useRouter();

  const steps = [
    { label: "Order Placed", date: order.createdAt, status: "completed", icon: CheckCircle2 },
    { label: "Processing", status: order.status === "PENDING" ? "current" : "completed", icon: Clock },
    { label: "Shipped", status: ["SHIPPED", "DELIVERED"].includes(order.status) ? "completed" : "pending", icon: Truck },
    { label: "Delivered", status: order.status === "DELIVERED" ? "completed" : "pending", icon: ShieldCheck },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 print:bg-white print:pb-0">
      
      {/* 1. Header (Hidden on Print) */}
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 lg:px-20 print:hidden">
         <button onClick={() => router.push(`/s/${slug}`)} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Store
         </button>
         <div className="flex items-center gap-4">
            <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
               <Printer className="w-4 h-4" /> Print Invoice
            </button>
         </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-8 lg:px-20 py-16 space-y-12">
         
         {/* 2. Success Banner (Hidden on Print) */}
         <div className="bg-indigo-600 rounded-[48px] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden print:hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10 space-y-4">
               <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
               </div>
               <h1 className="text-2xl font-bold tracking-tight uppercase">Order <span className="text-indigo-200">Confirmed</span></h1>
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Order ID: #{order.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="relative z-10 text-center md:text-right space-y-2">
               <p className="text-sm font-bold opacity-60 uppercase tracking-widest">Est. Delivery</p>
               <p className="text-2xl font-bold tracking-tight uppercase">3-5 Business Days</p>
            </div>
         </div>

         {/* 2.5 Live Tracking (New) */}
         {order.trackingCode && (
           <LogisticsTrackingCard 
             trackingCode={order.trackingCode} 
             courierName={order.preferredCourier} 
           />
         )}

         {/* 3. Tracking Timeline (Hidden on Print) */}
         <div className="bg-white border border-slate-100 rounded-[48px] p-12 shadow-sm space-y-10 print:hidden">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 text-center">Tracking Status</h3>
            <div className="relative flex justify-between">
               <div className="absolute top-6 left-10 right-10 h-0.5 bg-slate-100 -z-0" />
               {steps.map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center gap-4 group">
                     <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                        step.status === "completed" ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : 
                        step.status === "current" ? "bg-indigo-600 text-white animate-pulse" : "bg-slate-50 text-slate-300"
                     )}>
                        <step.icon className="w-6 h-6" />
                     </div>
                     <div className="text-center">
                        <p className={cn("text-[9px] font-bold uppercase tracking-widest", step.status !== "pending" ? "text-slate-900" : "text-slate-300")}>{step.label}</p>
                        {step.date && <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">{new Date(step.date).toLocaleDateString()}</p>}
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* 4. Digital Invoice (The actual printable part) */}
         <div id="invoice" className="bg-white border border-slate-200 rounded-[48px] p-16 shadow-2xl print:border-none print:shadow-none print:p-0 print:rounded-none">
            
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-12">
               <div className="space-y-6">
                  <h2 className="text-2xl font-bold tracking-tight uppercase text-indigo-600">{store.name}</h2>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Order Information</p>
                     <p className="text-xs font-bold text-slate-900">Invoice: #INV-{order.id.slice(-6).toUpperCase()}</p>
                     <p className="text-xs font-bold text-slate-900">Date: {new Date(order.createdAt).toLocaleDateString("en-US")}</p>
                  </div>
               </div>
               <div className="text-right space-y-4">
                  <div className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold uppercase tracking-widest inline-block border border-emerald-100">
                     {order.paymentStatus === "PAID" ? "Paid In Full" : "Cash On Delivery"}
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Customer Details</p>
                     <p className="text-xs font-bold text-slate-900 uppercase">{order.customerName}</p>
                     <p className="text-xs font-bold text-slate-900">{order.customerPhone}</p>
                  </div>
               </div>
            </div>

            {/* Address & Logistics */}
            <div className="grid grid-cols-2 gap-12 py-12 border-b border-slate-100">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <MapPin className="w-4 h-4 text-indigo-600" />
                     <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Shipping Address</h4>
                  </div>
                  <p className="text-xs font-bold text-slate-600 uppercase leading-relaxed max-w-[250px]">
                     {order.deliveryAddress}
                  </p>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <Globe className="w-4 h-4 text-indigo-600" />
                     <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Logistics Partner</h4>
                  </div>
                  <p className="text-xs font-bold text-slate-600 uppercase">
                     {order.preferredCourier || "Standard Local Shipping"}
                  </p>
                  {order.trackingCode && (
                     <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full inline-block">
                        Track: {order.trackingCode}
                     </p>
                  )}
               </div>
            </div>

            {/* Items Table */}
            <div className="py-12 space-y-8">
               <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Purchased Items</h4>
               <table className="w-full">
                  <thead>
                     <tr className="text-left border-b border-slate-50 pb-4">
                        <th className="text-[9px] font-bold uppercase tracking-widest text-slate-400 pb-4">Product Description</th>
                        <th className="text-[9px] font-bold uppercase tracking-widest text-slate-400 pb-4 text-center">Qty</th>
                        <th className="text-[9px] font-bold uppercase tracking-widest text-slate-400 pb-4 text-right">Unit Price</th>
                        <th className="text-[9px] font-bold uppercase tracking-widest text-slate-400 pb-4 text-right">Total</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {order.items.map((item: any, i: number) => (
                        <tr key={i} className="group">
                           <td className="py-6">
                              <p className="text-[11px] font-bold uppercase text-slate-900">{item.product?.name || item.name}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">SKU: {item.product?.sku || "N/A"}</p>
                           </td>
                           <td className="py-6 text-center text-[11px] font-bold text-slate-900">{item.quantity}</td>
                           <td className="py-6 text-right text-[11px] font-bold text-slate-900">৳{item.price.toLocaleString("en-US")}</td>
                           <td className="py-6 text-right text-[11px] font-bold text-indigo-600">৳{(item.price * item.quantity).toLocaleString("en-US")}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* Totals Section */}
            <div className="border-t border-slate-100 pt-12 flex justify-end">
               <div className="w-full max-w-[300px] space-y-4">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     <span>Subtotal</span>
                     <span className="text-slate-900 font-bold">৳{order.total.toLocaleString("en-US")}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     <span>Shipping Fee</span>
                     <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  <div className="pt-4 flex justify-between items-end border-t border-slate-100">
                     <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">Total Paid</span>
                     <span className="text-2xl font-bold text-indigo-600 tracking-tight leading-none">৳{order.total.toLocaleString("en-US")}</span>
                  </div>
               </div>
            </div>

            {/* Return Request Section */}
            {order.status === "DELIVERED" && (
               <div className="mt-12 p-8 bg-red-50 border-2 border-dashed border-red-200 rounded-[32px] space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                        <RotateCcw className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-red-900 uppercase">Not satisfied?</h4>
                        <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Initiate a return request within 7 days of delivery.</p>
                     </div>
                  </div>
                  
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const res = await requestReturnAction(order.id, {
                        reason: formData.get("reason") as string,
                        method: formData.get("method") as string,
                        details: formData.get("details") as string,
                        items: order.items
                      });
                      if (res.success) alert("Return request submitted. Our team will review it.");
                    }}
                    className="space-y-4"
                  >
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select name="reason" className="w-full p-4 rounded-2xl border-none ring-1 ring-red-100 text-sm font-bold uppercase tracking-widest" required>
                           <option value="">Select Reason</option>
                           <option value="DAMAGED">Damaged Product</option>
                           <option value="WRONG_ITEM">Wrong Item Received</option>
                           <option value="QUALITY_ISSUE">Quality Issues</option>
                        </select>
                        <select name="method" className="w-full p-4 rounded-2xl border-none ring-1 ring-red-100 text-sm font-bold uppercase tracking-widest" required>
                           <option value="">Refund Method</option>
                           <option value="BKASH">bKash</option>
                           <option value="NAGAD">Nagad</option>
                           <option value="BANK">Bank Transfer</option>
                        </select>
                     </div>
                     <input 
                        name="details" 
                        placeholder="Account details (e.g. 017XXXXXXXX or Account No)" 
                        className="w-full p-4 rounded-2xl border-none ring-1 ring-red-100 text-sm font-bold"
                        required
                     />
                     <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200">
                        Submit Return Request
                     </button>
                  </form>
               </div>
            )}

            {/* Footer */}
            <div className="mt-20 pt-12 border-t border-slate-100 text-center space-y-4">
               <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">Thank you for choosing {store.name}</p>
               <p className="text-[8px] font-bold text-slate-300 uppercase">Powered by BusinessConnect.bd - AI-First Business OS</p>
            </div>

         </div>

      </main>

    </div>
  );
}
