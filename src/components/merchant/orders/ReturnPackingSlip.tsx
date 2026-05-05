
import React from "react";
import { Package, Truck, ShieldCheck, MapPin, Phone, User } from "lucide-react";

export function ReturnPackingSlip({ order, returnRequest }: { order: any, returnRequest: any }) {
  return (
    <div className="w-[800px] mx-auto bg-white p-10 border-2 border-slate-200 rounded-[32px] font-outfit shadow-2xl print:shadow-none print:border-none print:p-0">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">
            RETURN <span className="text-red-600">MANIFEST</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Authorized Reverse Logistics Document</p>
        </div>
        <div className="text-right">
          <div className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest mb-2">
            SLIP #{returnRequest.id.slice(-8).toUpperCase()}
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Date: {new Date().toLocaleDateString("en-US")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        {/* From: Customer */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
            <User className="w-4 h-4 text-red-600" /> Sender (Customer)
          </h3>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <p className="font-bold text-xl text-slate-900 mb-2">{order.customerName}</p>
            <p className="text-sm font-bold text-slate-500 flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4" /> {order.customerPhone}
            </p>
            <p className="text-sm font-bold text-slate-500 leading-relaxed">
              {order.deliveryAddress}
            </p>
          </div>
        </div>

        {/* To: Merchant Warehouse */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" /> Destination (Warehouse)
          </h3>
          <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
            <p className="font-bold text-xl text-indigo-900 mb-2">{order.merchantStore?.name || "Main Hub"}</p>
            <p className="text-sm font-bold text-indigo-600/80 flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4" /> {order.merchantStore?.phone || "Office Contact"}
            </p>
            <p className="text-sm font-bold text-indigo-600/80 leading-relaxed">
              {order.merchantStore?.address || "Registered Business Address"}
            </p>
          </div>
        </div>
      </div>

      {/* Return Contents */}
      <div className="space-y-6 mb-12">
        <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-900" /> Return Parcel Contents
        </h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest rounded-l-2xl">Item SKU</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest">Description</th>
              <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest rounded-r-2xl">Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item: any) => (
              <tr key={item.id}>
                <td className="px-6 py-4 font-mono text-xs font-bold">{item.product?.sku || "N/A"}</td>
                <td className="px-6 py-4 font-bold text-sm text-slate-900">{item.product?.name || item.name}</td>
                <td className="px-6 py-4 text-center font-bold text-slate-900">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Barcodes & Instructions */}
      <div className="grid grid-cols-3 gap-8 items-end">
        <div className="col-span-2 space-y-6">
          <div className="p-6 bg-amber-50 border-2 border-dashed border-amber-200 rounded-3xl">
            <h4 className="text-[10px] font-bold text-amber-700 uppercase mb-2">Instructions for Logistics</h4>
            <p className="text-xs font-bold text-amber-600 leading-relaxed">
              1. Ensure product is securely packed in original packaging.<br/>
              2. Attach this slip on the front of the parcel.<br/>
              3. Courier must verify the tracking code before pickup.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex-1 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Original Order ID</p>
              <p className="font-mono font-bold text-slate-900">#{order.id.slice(-12).toUpperCase()}</p>
            </div>
            <div className="flex-1 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Return Method</p>
              <p className="font-bold text-slate-900 uppercase">{returnRequest.method || "Standard Courier"}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
           <img 
             src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RETURN-${returnRequest.id}`} 
             alt="Return QR"
             className="w-32 h-32 border-4 border-slate-900 p-2 rounded-2xl"
           />
           <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900">SCAN TO RECEIVE</p>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center opacity-50">
         <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Verified Merchant Return</span>
         </div>
         <p className="text-[10px] font-bold text-slate-400">BusinessConnect.bd Reverse Logistics System v2.0</p>
      </div>
    </div>
  );
}
