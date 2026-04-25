"use client";

import React, { useState } from "react";
import { Printer, Download, Loader2 } from "lucide-react";
import { OrderInvoice } from "./OrderInvoice";

export function InvoiceActions({ order, store }: { order: any, store: any }) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  return (
    <>
      <div className="flex items-center gap-3 no-print">
         <button 
           onClick={handlePrint}
           className="flex items-center gap-2 px-6 py-3 bg-white  border border-gray-100  rounded-2xl text-[10px] font-black uppercase hover:bg-gray-50 transition-all shadow-sm"
         >
            <Printer className="w-4 h-4" /> Print Invoice
         </button>
         <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-black transition-all shadow-xl shadow-gray-200">
            <Download className="w-4 h-4" /> Export PDF
         </button>
      </div>

      {/* Hidden Invoice for Printing */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999]">
         <OrderInvoice order={order} store={store} />
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .no-print {
            display: none !important;
          }
          .print\:block {
            display: block !important;
            visibility: visible !important;
          }
          .print\:block * {
            visibility: visible !important;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>
    </>
  );
}
