"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Truck, 
  CreditCard, 
  CheckCircle2,
  Loader2,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  Globe,
  Zap,
  ArrowRight
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { placeOrderAction } from "@/app/s/[slug]/actions";
import { initializePaymentAction } from "@/app/s/[slug]/checkout/paymentActions";
import { cn } from "@/lib/utils";
import { useStorefront } from "@/context/StorefrontContext";
import { Sparkles } from "lucide-react";

export function SinglePageCheckout({ paymentConfigs, slug }: { paymentConfigs: any[], slug: string }) {
  const router = useRouter();
  const { formatPrice, isInternational } = useStorefront();
  const [cart, setCart] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<any>({ id: "standard", name: "Standard Shipping", price: 0 });
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${slug}`);
    if (savedCart) setCart(JSON.parse(savedCart));
  }, [slug]);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);

    try {
      const result = await placeOrderAction({
        merchantStoreId: slug,
        total: total + shippingMethod.price,
        customerName: formData.get("name") as string,
        customerPhone: formData.get("phone") as string,
        customerEmail: formData.get("email") as string,
        deliveryAddress: formData.get("address") as string,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      if (result.success && result.orderId) {
        localStorage.removeItem(`cart_${slug}`);
        
        // If digital payment, initialize gateway
        if (paymentMethod !== "COD") {
          try {
            const paymentInit = await initializePaymentAction({
              orderId: result.orderId,
              providerName: paymentMethod,
              slug: slug
            });

            if (paymentInit.success && paymentInit.url) {
              window.location.href = paymentInit.url;
              return;
            }
          } catch (paymentErr: any) {
            console.error("Payment Init Error:", paymentErr);
            alert("Order placed but payment initialization failed. You will be redirected to the order page.");
          }
        }
        
        router.push(`/s/${slug}/order/${result.orderId}`);
      }
    } catch (err) {
      alert("Checkout failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine available payment methods for international users
  const hasStripe = paymentConfigs.find(c => c.provider === "STRIPE" && c.isActive);
  const hasPayPal = paymentConfigs.find(c => c.provider === "PAYPAL" && c.isActive);
  const hasSSL = paymentConfigs.find(c => c.provider === "SSLCOMMERZ" && c.isActive);

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
         <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center shadow-xl shadow-green-100">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
         </div>
         <div className="space-y-4">
            <h1 className="text-4xl font-black uppercase tracking-tighter">Order <span className="text-green-600">Confirmed</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest max-w-sm mx-auto">
               Your journey has begun. Order <span className="text-indigo-600">#{orderSuccess.slice(-6).toUpperCase()}</span> is being processed.
            </p>
         </div>
         <button onClick={() => router.push(`/s/${slug}`)} className="px-12 py-5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
            Return to Store
         </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#0F172A] font-sans selection:bg-indigo-100">
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 lg:px-20">
         <button onClick={() => router.back()} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Shopping
         </button>
         <h1 className="text-xl font-black tracking-tighter uppercase text-indigo-600">Checkout Portal</h1>
         <div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
            <Lock className="w-3.5 h-3.5" /> Secure Checkout
         </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-8 lg:px-20 py-20 grid grid-cols-1 lg:grid-cols-2 gap-20">
         <div className="space-y-12">
            <div>
               <h2 className="text-3xl font-black uppercase tracking-tighter">Shipping <span className="text-indigo-600">Destination</span></h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Where should we send your order?</p>
            </div>

            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
               <div className="space-y-6">
                  <div className="group space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 group-focus-within:text-indigo-600 transition-colors">Recipient Name</label>
                     <div className="flex items-center gap-4 bg-white border border-slate-100 p-5 rounded-[24px] focus-within:border-indigo-600 focus-within:shadow-2xl focus-within:shadow-indigo-600/5 transition-all">
                        <User className="w-5 h-5 text-slate-300" />
                        <input name="name" required placeholder="John Doe" className="bg-transparent border-none outline-none text-sm font-bold w-full" />
                     </div>
                  </div>

                  <div className="group space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 group-focus-within:text-indigo-600 transition-colors">Active Phone Number</label>
                     <div className="flex items-center gap-4 bg-white border border-slate-100 p-5 rounded-[24px] focus-within:border-indigo-600 focus-within:shadow-2xl focus-within:shadow-indigo-600/5 transition-all">
                        <Phone className="w-5 h-5 text-slate-300" />
                        <input name="phone" required placeholder="+880 1XXX XXXXXX" className="bg-transparent border-none outline-none text-sm font-bold w-full" />
                     </div>
                  </div>

                  <div className="group space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 group-focus-within:text-indigo-600 transition-colors">Email Address (Optional)</label>
                     <div className="flex items-center gap-4 bg-white border border-slate-100 p-5 rounded-[24px] focus-within:border-indigo-600 focus-within:shadow-2xl focus-within:shadow-indigo-600/5 transition-all">
                        <Globe className="w-5 h-5 text-slate-300" />
                        <input name="email" type="email" placeholder="customer@example.com" className="bg-transparent border-none outline-none text-sm font-bold w-full" />
                     </div>
                  </div>

                  <div className="group space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 group-focus-within:text-indigo-600 transition-colors">Detailed Address</label>
                     <div className="flex items-start gap-4 bg-white border border-slate-100 p-5 rounded-[24px] focus-within:border-indigo-600 focus-within:shadow-2xl focus-within:shadow-indigo-600/5 transition-all">
                        <MapPin className="w-5 h-5 text-slate-300 mt-1" />
                        <textarea name="address" required placeholder="House, Road, Area, City" rows={3} className="bg-transparent border-none outline-none text-sm font-bold w-full resize-none" />
                     </div>
                  </div>
               </div>

               <div className="pt-8 space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-tighter">Shipping <span className="text-indigo-600">Method</span></h3>
                  <div className="grid grid-cols-1 gap-4">
                     {[
                        { id: "standard", name: "Standard Shipping", price: 0, time: "3-5 Days", icon: Truck },
                        { id: "ems", name: "EMS International", price: 2500, time: "7-10 Days", icon: Globe },
                        { id: "dhl", name: "DHL Express", price: 4500, time: "2-3 Days", icon: Zap },
                        { id: "aramex", name: "Aramex Priority", price: 3800, time: "4-6 Days", icon: CheckCircle2 }
                     ].map((method) => (
                        <div 
                           key={method.id}
                           onClick={() => setShippingMethod(method)}
                           className={cn(
                              "p-6 rounded-[24px] border-2 cursor-pointer transition-all flex items-center justify-between",
                              shippingMethod.id === method.id ? "bg-white border-indigo-600 shadow-xl shadow-indigo-600/5" : "bg-white border-slate-100 hover:border-slate-200"
                           )}
                        >
                           <div className="flex items-center gap-6">
                              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", shippingMethod.id === method.id ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400")}>
                                 <method.icon className="w-6 h-6" />
                              </div>
                              <div>
                                 <h4 className="text-[10px] font-black uppercase tracking-widest">{method.name}</h4>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Delivery: {method.time}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <span className="text-xs font-black uppercase">{method.price === 0 ? "Free" : formatPrice(method.price)}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="pt-8 space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-tighter">Payment <span className="text-indigo-600">Gateway</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Cash on Delivery */}
                      <div 
                         onClick={() => setPaymentMethod("COD")}
                         className={cn(
                            "p-6 border-2 rounded-[24px] flex items-center justify-between cursor-pointer transition-all bg-white",
                            paymentMethod === "COD" ? "border-indigo-600 shadow-xl" : "border-slate-100 opacity-60"
                         )}
                      >
                         <div className="flex items-center gap-4">
                            <Truck className="w-6 h-6 text-indigo-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Cash on Delivery</span>
                         </div>
                         {paymentMethod === "COD" && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                      </div>

                      {/* Dynamic Payment Gateways */}
                      {paymentConfigs.map((config) => (
                        <div 
                           key={config.id}
                           onClick={() => setPaymentMethod(config.provider)}
                           className={cn(
                              "p-6 border-2 rounded-[24px] flex items-center justify-between cursor-pointer transition-all bg-white",
                              paymentMethod === config.provider ? "border-indigo-600 shadow-xl" : "border-slate-100 opacity-60"
                           )}
                        >
                           <div className="flex items-center gap-4">
                              <CreditCard className="w-6 h-6 text-slate-400" />
                              <div className="text-left">
                                 <span className="text-[10px] font-black uppercase tracking-widest block">{config.provider}</span>
                                 <span className="text-[8px] font-bold text-gray-400 uppercase">Secure Gateway</span>
                              </div>
                           </div>
                           {paymentMethod === config.provider && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                        </div>
                      ))}
                   </div>
               </div>
            </form>
         </div>

         <div className="space-y-10 lg:sticky lg:top-32 h-fit">
            <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-sm space-y-8">
               <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Order Summary</h3>
                  <div className="max-h-64 overflow-y-auto space-y-6 pr-4">
                     {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4 group">
                           <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                                 <img src={item.image} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                 <h4 className="text-[11px] font-black uppercase text-slate-900 leading-none">{item.name}</h4>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">Qty: {item.quantity}</p>
                              </div>
                           </div>
                           <span className="text-xs font-black text-slate-900">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-100 space-y-4">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     <span>Subtotal</span>
                     <span className="text-slate-900 font-black">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     <span>Shipping ({shippingMethod.name})</span>
                     <span className="text-emerald-600 font-black">{shippingMethod.price === 0 ? "FREE" : formatPrice(shippingMethod.price)}</span>
                  </div>
                  <div className="pt-4 flex justify-between items-end">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Total To Pay</span>
                     <span className="text-4xl font-black text-indigo-600 tracking-tighter leading-none">{formatPrice(total + shippingMethod.price)}</span>
                  </div>
               </div>

               <button 
                  form="checkout-form"
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-6 bg-slate-900 text-white rounded-[32px] text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-indigo-600 transition-all shadow-2xl hover:scale-105 disabled:opacity-50"
               >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Your Order"} <ArrowRight className="w-5 h-5" />
               </button>

               <div className="flex items-center justify-center gap-4 text-slate-400 pt-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Secure 256-bit Encryption</span>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
