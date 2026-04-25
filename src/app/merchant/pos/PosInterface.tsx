"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  ShoppingCart, 
  User, 
  Plus, 
  Minus, 
  Trash2, 
  Zap, 
  CheckCircle2, 
  X,
  CreditCard,
  Banknote,
  Smartphone,
  RefreshCw,
  Printer,
  Settings,
  Percent,
  Calculator,
  Layout,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createPosOrderAction, searchPosProductsAction } from "./actions";
import { useLanguage } from "@/context/LanguageContext";

export function PosInterface({ initialProducts }: { initialProducts: any[] }) {
  const { t } = useLanguage();
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  
  // Advanced Features
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(5); // 5% default VAT
  const [showPrintSettings, setShowPrintSettings] = useState(false);
  const [printConfig, setPrintConfig] = useState({
    storeName: "BusinessConnect Store",
    showLogo: true,
    footerText: "Thank you for shopping with us!",
    paperSize: "THERMAL", // THERMAL, A4
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount - discount;

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.length > 1) {
        setLoading(true);
        const results = await searchPosProductsAction(search);
        setProducts(results);
        setLoading(false);
      } else if (search.length === 0) {
        setProducts(initialProducts);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setCheckoutLoading(true);
    
    const result = await createPosOrderAction({
      items: cart.map(item => ({ 
        productId: item.id, 
        quantity: item.quantity, 
        price: item.price,
        name: item.name 
      })),
      total: grandTotal,
      paymentMethod,
      customerName: customer.name || "Guest Customer",
      customerPhone: customer.phone || "00000000000",
    });

    if (result.success) {
      handlePrint();
      setCart([]);
      setCustomer({ name: "", phone: "" });
      setDiscount(0);
    } else {
      alert(`Error: ${result.error}`);
    }
    setCheckoutLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 p-4">
      
      {/* 1. Product Explorer */}
      <div className="flex-1 bg-white  border border-slate-100  rounded-[40px] p-8 flex flex-col space-y-6 shadow-sm overflow-hidden">
         <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900  uppercase italic flex items-center gap-3">
               <Calculator className="w-6 h-6 text-indigo-600" /> POS Terminal
            </h2>
            <div className="flex items-center gap-3">
               <button 
                  onClick={() => setShowPrintSettings(true)}
                  className="p-3 bg-slate-50  rounded-2xl hover:bg-indigo-50 transition-all text-slate-400 hover:text-indigo-600"
               >
                  <Settings className="w-5 h-5" />
               </button>
               <div className="relative w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    placeholder={t("search_placeholder")} 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50  rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
                  />
               </div>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => (
              <button 
                key={p.id}
                onClick={() => addToCart(p)}
                className="group p-4 bg-slate-50  rounded-[32px] text-left hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all border border-transparent hover:border-indigo-100 flex flex-col items-center text-center"
              >
                 <div className="w-full aspect-square bg-white  rounded-[24px] mb-4 overflow-hidden relative">
                    <img src={p.images?.[0] || 'https://via.placeholder.com/150'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-all" />
                 </div>
                 <h3 className="text-[11px] font-black uppercase text-slate-900  line-clamp-2 leading-tight">{p.name}</h3>
                 <p className="text-sm font-black text-indigo-600 mt-2">৳{p.price}</p>
                 <div className="mt-3 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                    <Plus className="w-4 h-4" />
                 </div>
              </button>
            ))}
         </div>
      </div>

      {/* 2. Billing & Cart Side */}
      <div className="w-full lg:w-[450px] bg-white border border-slate-100 text-slate-900 rounded-[48px] p-8 flex flex-col space-y-8 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-20 transform translate-x-1/2 -translate-y-1/2 bg-indigo-500/5 w-64 h-64 rounded-full blur-3xl" />
         
         <div className="flex items-center justify-between relative z-10">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
               <ShoppingCart className="w-5 h-5 text-indigo-600" /> {t("active_cart")}
            </h2>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-600">{cart.length} Items</span>
         </div>

         {/* Cart Items */}
         <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-[200px] relative z-10">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl group">
                 <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <img src={item.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black uppercase truncate">{item.name}</div>
                    <div className="text-[10px] font-bold text-indigo-600 mt-1">৳{item.price}</div>
                 </div>
                 <div className="flex items-center gap-2 bg-white rounded-2xl p-1 border border-slate-100">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-slate-50 rounded-lg transition-all"><Minus className="w-3 h-3 text-slate-400" /></button>
                    <span className="text-[10px] font-black w-4 text-center text-slate-700">{item.quantity}</span>
                    <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center hover:bg-slate-50 rounded-lg transition-all"><Plus className="w-3 h-3 text-slate-400" /></button>
                 </div>
                 <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 py-20">
                 <Layout className="w-12 h-12 opacity-20" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Cart is Empty</p>
              </div>
            )}
         </div>

         {/* Customer & Discounts */}
         <div className="space-y-4 pt-6 border-t border-slate-100 relative z-10">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">{t("name")}</label>
                  <input 
                    placeholder="Guest" 
                    value={customer.name}
                    onChange={(e) => setCustomer({...customer, name: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 rounded-2xl text-[10px] font-black outline-none border border-transparent focus:border-indigo-500/50 transition-all text-slate-900" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">{t("phone")}</label>
                  <input 
                    placeholder="017..." 
                    value={customer.phone}
                    onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 rounded-2xl text-[10px] font-black outline-none border border-transparent focus:border-indigo-500/50 transition-all text-slate-900" 
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Discount (৳)</label>
                  <input 
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full h-12 px-5 bg-slate-50 rounded-2xl text-[10px] font-black outline-none border border-transparent focus:border-indigo-500/50 transition-all text-indigo-600" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">VAT/Tax (%)</label>
                  <input 
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full h-12 px-5 bg-slate-50 rounded-2xl text-[10px] font-black outline-none border border-transparent focus:border-indigo-500/50 transition-all text-orange-600" 
                  />
               </div>
            </div>
         </div>

         {/* Totals */}
         <div className="bg-slate-50 p-8 rounded-[40px] space-y-4 relative z-10 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               <span>{t("subtotal")}</span>
               <span>৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               <span>VAT ({taxRate}%)</span>
               <span>৳{taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-red-500 uppercase tracking-widest">
               <span>{t("discount")}</span>
               <span>- ৳{discount.toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
               <div>
                  <p className="text-[9px] font-black uppercase text-indigo-600 tracking-widest leading-none mb-1">{t("total_payable")}</p>
                  <h3 className="text-4xl font-black tracking-tighter text-slate-900">৳{grandTotal.toLocaleString()}</h3>
               </div>
               <div className="flex gap-2">
                  {[
                    { id: "CASH", icon: Banknote },
                    { id: "CARD", icon: CreditCard },
                    { id: "BKASH", icon: Smartphone }
                  ].map(m => (
                    <button 
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border",
                        paymentMethod === m.id ? "bg-indigo-600 border-indigo-500 text-white shadow-xl" : "bg-white border-slate-200 text-slate-400"
                      )}
                    >
                       <m.icon className="w-5 h-5" />
                    </button>
                  ))}
               </div>
            </div>

            <button 
               onClick={handleCheckout}
               disabled={checkoutLoading || cart.length === 0}
               className="w-full h-16 bg-slate-900 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
            >
               {checkoutLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
               {t("complete_checkout")}
            </button>
         </div>
      </div>

      {/* 3. Printing Settings Modal */}
      {showPrintSettings && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowPrintSettings(false)} />
            <div className="bg-white w-full max-w-lg rounded-[48px] p-12 relative z-10 shadow-2xl border border-slate-100 space-y-10">
               <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-900">Printing <span className="text-indigo-600">Preferences</span></h2>
                  <button onClick={() => setShowPrintSettings(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X className="w-5 h-5" /></button>
               </div>

               <div className="space-y-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Store Name on Receipt</label>
                     <input 
                        value={printConfig.storeName}
                        onChange={(e) => setPrintConfig({...printConfig, storeName: e.target.value})}
                        className="w-full h-14 px-6 bg-slate-50  rounded-2xl text-sm font-bold outline-none" 
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Footer Message</label>
                     <input 
                        value={printConfig.footerText}
                        onChange={(e) => setPrintConfig({...printConfig, footerText: e.target.value})}
                        className="w-full h-14 px-6 bg-slate-50  rounded-2xl text-sm font-bold outline-none" 
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <button 
                        onClick={() => setPrintConfig({...printConfig, paperSize: 'THERMAL'})}
                        className={cn(
                           "p-6 rounded-[32px] border text-left transition-all",
                           printConfig.paperSize === 'THERMAL' ? "bg-indigo-600 text-white border-indigo-500 shadow-xl" : "bg-slate-50  border-transparent text-slate-500"
                        )}
                     >
                        <Printer className="w-6 h-6 mb-3" />
                        <div className="text-[10px] font-black uppercase">Thermal Receipt</div>
                        <div className="text-[9px] opacity-60">80mm Wide</div>
                     </button>
                     <button 
                        onClick={() => setPrintConfig({...printConfig, paperSize: 'A4'})}
                        className={cn(
                           "p-6 rounded-[32px] border text-left transition-all",
                           printConfig.paperSize === 'A4' ? "bg-indigo-600 text-white border-indigo-500 shadow-xl" : "bg-slate-50  border-transparent text-slate-500"
                        )}
                     >
                        <FileText className="w-6 h-6 mb-3" />
                        <div className="text-[10px] font-black uppercase">A4 Invoice</div>
                        <div className="text-[9px] opacity-60">Full Page</div>
                     </button>
                  </div>
               </div>

               <button 
                  onClick={() => setShowPrintSettings(false)}
                  className="w-full h-16 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em]"
               >
                  Save Configuration
               </button>
            </div>
         </div>
      )}

      {/* Hidden Receipt for Printing */}
      <div id="receipt-print" className="hidden print:block p-8 text-black bg-white w-[80mm] text-[10px]">
         <div className="text-center space-y-2 border-b border-dashed border-black pb-4 mb-4">
            <h1 className="text-lg font-bold uppercase">{printConfig.storeName}</h1>
            <p>Customer: {customer.name || 'Guest'}</p>
            <p suppressHydrationWarning>{new Date().toLocaleString()}</p>
         </div>
         <div className="space-y-2 mb-4">
            {cart.map(item => (
               <div key={item.id} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>৳{item.price * item.quantity}</span>
               </div>
            ))}
         </div>
         <div className="border-t border-dashed border-black pt-4 space-y-1">
            <div className="flex justify-between"><span>Subtotal:</span><span>৳{subtotal}</span></div>
            <div className="flex justify-between"><span>Tax ({taxRate}%):</span><span>৳{taxAmount}</span></div>
            <div className="flex justify-between font-bold"><span>Total:</span><span>৳{grandTotal}</span></div>
            <div className="flex justify-between italic"><span>Method:</span><span>{paymentMethod}</span></div>
         </div>
         <div className="text-center mt-8 pt-4 border-t border-dashed border-black">
            <p className="italic">{printConfig.footerText}</p>
            <p className="mt-2 text-[8px]">Powered by BusinessConnect.bd</p>
         </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-print, #receipt-print * {
            visibility: visible;
          }
          #receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: ${printConfig.paperSize === 'THERMAL' ? '80mm' : '210mm'};
          }
        }
      `}</style>

    </div>
  );
}

