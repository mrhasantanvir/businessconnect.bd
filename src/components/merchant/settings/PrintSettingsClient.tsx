"use client";

import React, { useState } from "react";
import { Printer, Layout, FileText, CheckCircle2, Save, Image as ImageIcon, Type, Square } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { updatePrintSettingsAction } from "@/app/merchant/settings/print/actions";

export default function PrintSettingsClient({ initialConfig }: { initialConfig: any }) {
  const { t } = useLanguage();
  const [config, setConfig] = useState(initialConfig || {
    paperSize: "A4",
    orientation: "portrait",
    showLogo: true,
    showStoreName: true,
    showFooter: true,
    footerText: "Thank you for shopping with us!",
    invoiceTitle: "TAX INVOICE",
    labelTitle: "PACKING SLIP",
    showQR: true,
    qrContent: "ORDER_LINK",
    showMerchantSignature: true,
    showCustomerSignature: false,
    showReturnPolicy: true,
    returnPolicy: "Items can be returned within 7 days in original condition.",
    primaryColor: "#4f46e5",
    autoPrint: false,
    showPaymentStatus: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const paperSizes = [
    { id: "A4", name: "A4 Standard", desc: "210 x 297 mm", icon: FileText },
    { id: "A5", name: "A5 Half", desc: "148 x 210 mm", icon: FileText },
    { id: "LETTER", name: "Letter", desc: "8.5 x 11 in", icon: FileText },
    { id: "LEGAL", name: "Legal", desc: "8.5 x 14 in", icon: FileText },
    { id: "THERMAL_80", name: "Thermal 80mm", desc: "Pos Printer", icon: Printer },
    { id: "THERMAL_58", name: "Thermal 58mm", desc: "Small Pos", icon: Printer },
    { id: "LABEL_4X6", name: "4 x 6 Label", desc: "Standard Shipping", icon: Layout },
    { id: "LABEL_100X150", name: "100x150 mm", desc: "E-comm Standard", icon: Layout },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updatePrintSettingsAction(config);
      if (res.success) {
        alert("Print configuration saved successfully!");
      }
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                 <Printer className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-[#0F172A] uppercase tracking-tighter italic">Document <span className="text-indigo-600">& Print Engine</span></h1>
           </div>
           <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Customize your invoices, labels and reports</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-100"
        >
          {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Configuration</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Paper Size Selection */}
           <section className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6 flex items-center gap-2">
                 <Square className="w-4 h-4 text-indigo-600" /> Page Size & Format
              </h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {paperSizes.map((size) => (
                     <button 
                        key={size.id}
                        onClick={() => setConfig({...config, paperSize: size.id})}
                        className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 group ${
                           config.paperSize === size.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-50 hover:border-indigo-200'
                        }`}
                     >
                        <size.icon className={`w-6 h-6 ${config.paperSize === size.id ? 'text-indigo-600' : 'text-gray-300 group-hover:text-indigo-400'}`} />
                        <div className="text-center">
                           <p className={`text-[10px] font-black uppercase tracking-tight ${config.paperSize === size.id ? 'text-indigo-900' : 'text-gray-500'}`}>{size.name}</p>
                           <p className="text-[8px] font-bold text-gray-400 mt-0.5">{size.desc}</p>
                        </div>
                     </button>
                  ))}
               </div>

               <div className="mt-8 flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="flex-1">
                     <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Page Orientation</p>
                     <p className="text-[9px] font-bold text-gray-500">Choose how the content is laid out on paper</p>
                  </div>
                  <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                     <button 
                        onClick={() => setConfig({...config, orientation: "portrait"})}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${config.orientation === "portrait" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-indigo-600"}`}
                     >
                        Portrait
                     </button>
                     <button 
                        onClick={() => setConfig({...config, orientation: "landscape"})}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${config.orientation === "landscape" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-indigo-600"}`}
                     >
                        Landscape
                     </button>
                  </div>
               </div>
           </section>

           {/* Brand & Content Controls */}
           <section className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6 flex items-center gap-2">
                 <Layout className="w-4 h-4 text-indigo-600" /> Branding & Visibility
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <ToggleCard 
                    title="Show Store Logo" 
                    desc="Include your brand identity in documents" 
                    icon={ImageIcon} 
                    enabled={config.showLogo}
                    onChange={(v) => setConfig({...config, showLogo: v})}
                 />
                 <ToggleCard 
                    title="Display Store Name" 
                    desc="Show business name as text header" 
                    icon={Type} 
                    enabled={config.showStoreName}
                    onChange={(v) => setConfig({...config, showStoreName: v})}
                 />
                 <ToggleCard 
                    title="Enable QR Codes" 
                    desc="Add scanable codes for tracking/RMA" 
                    icon={CheckCircle2} 
                    enabled={config.showQR}
                    onChange={(v) => setConfig({...config, showQR: v})}
                 />
                  <ToggleCard 
                     title="Footer Section" 
                     desc="Show custom message at the bottom" 
                     icon={Layout} 
                     enabled={config.showFooter}
                     onChange={(v) => setConfig({...config, showFooter: v})}
                  />
                  <ToggleCard 
                     title="Merchant Signature" 
                     desc="Add space for authorized signature" 
                     icon={FileText} 
                     enabled={config.showMerchantSignature}
                     onChange={(v) => setConfig({...config, showMerchantSignature: v})}
                  />
                  <ToggleCard 
                     title="Customer Signature" 
                     desc="Add 'Received By' signature area" 
                     icon={FileText} 
                     enabled={config.showCustomerSignature}
                     onChange={(v) => setConfig({...config, showCustomerSignature: v})}
                  />
                  <ToggleCard 
                     title="Automatic Printing" 
                     desc="Trigger print dialog on order confirm" 
                     icon={Printer} 
                     enabled={config.autoPrint}
                     onChange={(v) => setConfig({...config, autoPrint: v})}
                  />
               </div>

              <div className="pt-6 space-y-4">
                 <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">Invoice Title</label>
                    <input 
                       value={config.invoiceTitle}
                       onChange={(e) => setConfig({...config, invoiceTitle: e.target.value})}
                       className="w-full p-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-100 text-sm font-bold uppercase tracking-widest focus:ring-indigo-600 transition-all"
                    />
                 </div>
                  <div>
                     <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">Special Footnotes / Terms</label>
                     <textarea 
                        value={config.returnPolicy}
                        onChange={(e) => setConfig({...config, returnPolicy: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-100 text-[11px] font-bold focus:ring-indigo-600 transition-all h-20"
                        placeholder="e.g. Items can be returned within 7 days, Original receipt required..."
                     />
                  </div>
                  <div>
                     <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">Invoice Footer Message</label>
                     <textarea 
                        value={config.footerText}
                        onChange={(e) => setConfig({...config, footerText: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-100 text-[11px] font-bold focus:ring-indigo-600 transition-all h-20"
                        placeholder="e.g. Thank you for your business!"
                     />
                  </div>
               </div>
           </section>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
           <div className="sticky top-24 space-y-6">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Interactive Preview
              </h3>
              
              <div className={`bg-white border-2 border-slate-900 rounded-[32px] p-6 shadow-2xl transition-all duration-500 origin-top overflow-hidden ${
                 config.paperSize === 'A5' ? 'scale-90 aspect-[1/1.4]' : 
                 config.paperSize.startsWith('THERMAL') ? 'max-w-[280px] mx-auto' : 'aspect-[1/1.4]'
              }`}>
                 <div className="flex justify-between items-start border-b-2 border-slate-100 pb-4 mb-4">
                    <div className="space-y-2">
                       {config.showLogo && <div className="w-12 h-6 bg-indigo-100 rounded flex items-center justify-center text-[8px] font-black text-indigo-400">LOGO</div>}
                       {config.showStoreName && <p className="text-[10px] font-black text-slate-900">MY STORE</p>}
                    </div>
                    <p className="text-[9px] font-black text-indigo-600">{config.invoiceTitle}</p>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="h-2 w-full bg-slate-50 rounded" />
                    <div className="h-2 w-2/3 bg-slate-50 rounded" />
                    <div className="pt-4 border-t border-slate-50">
                       <div className="flex justify-between mb-2">
                          <div className="h-2 w-20 bg-slate-100 rounded" />
                          <div className="h-2 w-8 bg-indigo-100 rounded" />
                       </div>
                       <div className="flex justify-between">
                          <div className="h-2 w-24 bg-slate-100 rounded" />
                          <div className="h-2 w-8 bg-indigo-100 rounded" />
                       </div>
                    </div>
                 </div>

                  {config.showQR && (
                    <div className="mt-6 flex justify-center">
                       <div className="w-12 h-12 border-2 border-slate-900 p-1 rounded flex items-center justify-center">
                          <div className="grid grid-cols-3 gap-0.5 w-full h-full">
                             {[...Array(9)].map((_, i) => <div key={i} className="bg-slate-900 w-full h-full" />)}
                          </div>
                       </div>
                    </div>
                  )}

                  {config.showReturnPolicy && (
                     <div className="mt-4 p-2 bg-slate-50 rounded-lg">
                        <p className="text-[6px] font-bold text-slate-400 uppercase mb-1">Return Policy</p>
                        <p className="text-[6px] font-medium text-slate-500 leading-tight line-clamp-2">{config.returnPolicy}</p>
                     </div>
                  )}

                  <div className="mt-6 flex justify-between gap-4">
                     {config.showCustomerSignature && (
                        <div className="flex-1 border-t border-slate-900 pt-1">
                           <p className="text-[6px] font-black text-center uppercase">Customer Signature</p>
                        </div>
                     )}
                     {config.showMerchantSignature && (
                        <div className="flex-1 border-t border-slate-900 pt-1">
                           <p className="text-[6px] font-black text-center uppercase">Authorized Signature</p>
                        </div>
                     )}
                  </div>

                  {config.showFooter && (
                     <div className="mt-4 pt-2 border-t border-slate-100 text-center">
                        <p className="text-[7px] font-bold text-slate-300 leading-tight truncate">{config.footerText}</p>
                     </div>
                  )}
              </div>
              <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">WYSIWYG: Real-time rendering enabled</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function ToggleCard({ title, desc, icon: Icon, enabled, onChange }: any) {
   return (
      <button 
         onClick={() => onChange(!enabled)}
         className={`p-5 rounded-3xl border transition-all text-left group flex items-center justify-between ${
            enabled ? 'border-indigo-100 bg-indigo-50/20' : 'border-gray-50 bg-gray-50/30'
         }`}
      >
         <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
               enabled ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:text-indigo-400'
            }`}>
               <Icon className="w-5 h-5" />
            </div>
            <div>
               <p className={`text-xs font-black uppercase tracking-tight ${enabled ? 'text-indigo-900' : 'text-gray-500'}`}>{title}</p>
               <p className="text-[9px] font-bold text-gray-400 mt-0.5">{desc}</p>
            </div>
         </div>
         <div className={`w-10 h-6 rounded-full p-1 transition-all ${enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
         </div>
      </button>
   );
}
