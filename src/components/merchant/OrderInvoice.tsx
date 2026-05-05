"use client";

import React from "react";
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Globe, 
  CheckCircle2, 
  ShieldCheck,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

export function OrderInvoice({ order, store }: { order: any, store: any }) {
  const subtotal = order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const vat = store.isVatEnabled ? (subtotal * store.vatRate / 100) : 0;
  const grandTotal = subtotal + vat;

  return (
    <div id="invoice-capture" className="w-[800px] bg-white p-16 font-sans text-slate-900 border border-slate-100 mx-auto shadow-2xl">
      
      {/* Invoice Header */}
      <div className="flex justify-between items-start border-b-4 border-indigo-600 pb-12 mb-12">
         <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                  <ShoppingBag className="w-7 h-7" />
               </div>
               <h1 className="text-2xl font-bold tracking-tight uppercase text-indigo-600">{store.name}</h1>
            </div>
            <div className="space-y-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
               <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Rajshahi HQ, Bangladesh</p>
               <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +880 1XXX XXXXXX</p>
               <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> {store.slug}.businessconnect.bd</p>
            </div>
         </div>
         <div className="text-right space-y-2">
            <h2 className="text-2xl font-bold text-slate-100 uppercase tracking-tight absolute right-16 top-16 opacity-50">{store.printSettings?.invoiceTitle || "INVOICE"}</h2>
            <div className="relative z-10 pt-10">
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Invoice Number</p>
               <p className="text-2xl font-bold text-slate-900 tracking-tight">#{order.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="relative z-10">
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date Issued</p>
               <p className="text-sm font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString("en-US")}</p>
            </div>
         </div>
      </div>

      {/* Billing Info */}
      <div className="grid grid-cols-2 gap-20 mb-16">
         <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-600">Bill To</h4>
            <div className="space-y-2">
               <h5 className="text-xl font-bold text-slate-900 uppercase flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-300" /> {order.customerName || "Guest Customer"}
               </h5>
               <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed max-w-xs">
                  {order.deliveryAddress}
               </p>
               <p className="text-xs font-bold text-slate-900">{order.customerPhone}</p>
            </div>
         </div>
         <div className="space-y-4 p-8 bg-slate-50 rounded-[32px] border border-slate-100">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Payment Status</h4>
            <div className="flex items-center gap-3">
               <div className={cn(
                 "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                 order.paymentStatus === 'PAID' ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
               )}>
                  {order.paymentStatus}
               </div>
               <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">via Cash on Delivery</span>
            </div>
            <div className="flex items-center gap-2 pt-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
               <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Secured by BusinessConnect.bd
            </div>
         </div>
      </div>

      {/* Order Items Table */}
      <div className="mb-16">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="border-b-2 border-slate-100">
                  <th className="py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Description</th>
                  <th className="py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-center">Qty</th>
                  <th className="py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Unit Price</th>
                  <th className="py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Total</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {order.items.map((item: any) => (
                 <tr key={item.id} className="group">
                    <td className="py-8">
                       <h6 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{item.product.name}</h6>
                       <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">SKU: {item.product.id.slice(0, 8)}</p>
                    </td>
                    <td className="py-8 text-center text-xs font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-8 text-right text-xs font-bold text-slate-500">৳{item.price.toLocaleString("en-US")}</td>
                    <td className="py-8 text-right text-sm font-bold text-slate-900">৳{(item.price * item.quantity).toLocaleString("en-US")}</td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Totals & Notes */}
      <div className="grid grid-cols-2 gap-12 pt-8 border-t-2 border-slate-100">
         <div className="space-y-6">
            {store.printSettings?.showReturnPolicy && (
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-2">Special Footnotes / Terms</h4>
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                     {store.printSettings?.returnPolicy || "Standard terms and conditions apply."}
                  </p>
               </div>
            )}
            <div className="flex gap-4 pt-4">
               {store.printSettings?.showCustomerSignature && (
                  <div className="flex-1 border-t border-slate-900 pt-2">
                     <p className="text-[9px] font-bold text-center uppercase tracking-widest text-slate-400">Customer Signature</p>
                  </div>
               )}
               {store.printSettings?.showMerchantSignature && (
                  <div className="flex-1 border-t border-slate-900 pt-2">
                     <p className="text-[9px] font-bold text-center uppercase tracking-widest text-slate-400">Authorized Signature</p>
                  </div>
               )}
            </div>
         </div>
         <div className="space-y-6">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               <span>Subtotal</span>
               <span className="text-slate-900">৳{subtotal.toLocaleString("en-US")}</span>
            </div>
            {store.isVatEnabled && (
               <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>VAT ({store.vatRate}%)</span>
                  <span className="text-slate-900">৳{vat.toLocaleString("en-US")}</span>
               </div>
            )}
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               <span>Shipping Fee</span>
               <span className="text-emerald-600">FREE</span>
            </div>
            <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
               <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-600">Total Amount</span>
               <span className="text-2xl font-bold text-slate-900 tracking-tight leading-none">৳{grandTotal.toLocaleString("en-US")}</span>
            </div>
         </div>
      </div>

      {/* Footer Note */}
      <div className="mt-20 pt-8 border-t border-slate-100 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
               {store.printSettings?.showFooter ? store.printSettings.footerText : "This is a system generated invoice"}
            </p>
         </div>
         <p className="text-[10px] font-bold text-slate-900 uppercase">
            #{order.id.slice(-6).toUpperCase()}
         </p>
      </div>

    </div>
  );
}
