"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, X, Plus, Minus, User, Phone, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { placeOrderAction } from "@/app/s/[slug]/actions";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string | null;
}

interface CartItem extends Product {
  quantity: number;
}

export function CartAndCheckout({ storeId }: { storeId: string }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Listen for Add to Cart events from siblings
  useEffect(() => {
    const handleAddToCart = (e: any) => {
      const product = e.detail as Product;
      setCart((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
      setIsOpen(true);
    };

    window.addEventListener("addToCart", handleAddToCart);
    window.addEventListener("toggleCart", () => setIsOpen(true));
    return () => {
      window.removeEventListener("addToCart", handleAddToCart);
      window.removeEventListener("toggleCart", () => setIsOpen(true));
    };
  }, []);

  // Sync with LocalStorage for Single Page Checkout
  useEffect(() => {
    localStorage.setItem(`cart_${storeId}`, JSON.stringify(cart));
  }, [cart, storeId]);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleCheckout = () => {
    const params = new URLSearchParams(window.location.search);
    window.location.href = window.location.pathname + "/checkout";
  };

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);

    try {
      const result = await placeOrderAction({
        merchantStoreId: storeId,
        total,
        customerName: formData.get("name") as string,
        customerPhone: formData.get("phone") as string,
        deliveryAddress: formData.get("address") as string,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      if (result.success) {
        setOrderSuccess(result.orderId);
        setCart([]);
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-[32px] p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-300 shadow-2xl">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 mb-6 font-medium">Your Order ID is <span className="text-indigo-600">#{orderSuccess.slice(-6).toUpperCase()}</span>. The merchant will call you shortly.</p>
          <button 
            onClick={() => { setOrderSuccess(null); setIsOpen(false); setIsCheckingOut(false); }}
            className="w-full h-12 bg-gray-900 text-white rounded-2xl font-bold transition-transform active:scale-95"
          >
            Wonderful, Thank You!
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[60] bg-gray-950 text-white flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all group border border-white/10"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="font-bold text-sm tracking-tight">{cart.length} Items</span>
        <span className="h-4 w-px bg-white/20 mx-1"></span>
        <span className="font-bold text-sm">৳{total.toLocaleString()}</span>
      </button>

      {/* Cart Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setIsOpen(false)}></div>
          
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-6 border-b flex items-center justify-between">
               <h3 className="text-xl font-black text-gray-900">Your Shopping Bag</h3>
               <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                   <ShoppingCart className="w-16 h-16 mb-4" />
                   <p className="font-bold">Your bag is empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 group">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                       {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <ShoppingCart className="w-6 h-6 text-gray-300" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
                      <p className="text-sm font-bold text-indigo-600 mt-1">৳{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center bg-gray-50 rounded-xl border p-1">
                       <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded-lg transition-colors"><Minus className="w-4 h-4" /></button>
                       <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                       <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t">
              {!isCheckingOut ? (
                 <>
                   <div className="flex justify-between items-center mb-6">
                      <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">Total Amount</span>
                      <span className="text-2xl font-black text-gray-900">৳{total.toLocaleString()}</span>
                   </div>
                   <button 
                     disabled={cart.length === 0}
                     onClick={handleCheckout}
                     className="w-full h-14 bg-gray-950 text-white rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-50 hover:bg-black transition-all shadow-xl shadow-gray-950/20"
                   >
                     Proceed To Checkout
                   </button>
                 </>
              ) : (
                <form onSubmit={handlePlaceOrder} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button type="button" onClick={() => setIsCheckingOut(false)} className="text-xs font-bold text-indigo-600">Back to bag</button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-2xl focus-within:border-indigo-500 transition-colors">
                      <User className="w-5 h-5 text-gray-400" />
                      <input name="name" required placeholder="Full Name" className="flex-1 bg-transparent border-none outline-none text-sm font-medium" />
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-2xl focus-within:border-indigo-500 transition-colors">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <input name="phone" required placeholder="Phone Number" className="flex-1 bg-transparent border-none outline-none text-sm font-medium" />
                    </div>
                    <div className="flex items-start gap-3 bg-white border border-gray-200 p-3 rounded-2xl focus-within:border-indigo-500 transition-colors">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <textarea name="address" required placeholder="Full Delivery Address" rows={2} className="flex-1 bg-transparent border-none outline-none text-sm font-medium resize-none"></textarea>
                    </div>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="w-full h-14 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-green-700 transition-all shadow-xl shadow-green-600/20 mt-4"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Cash on Delivery"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
