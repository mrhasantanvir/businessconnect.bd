"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface StorefrontContextType {
  cartCount: number;
  cartTotal: number;
  currency: { code: string, symbol: string, rate: number };
  isInternational: boolean;
  setCurrency: (code: string) => void;
  formatPrice: (price: number) => string;
  addToCart: (product: any) => void;
}

const CURRENCIES: Record<string, { symbol: string, rate: number }> = {
  BDT: { symbol: "৳", rate: 1 },
  USD: { symbol: "$", rate: 0.0084 }, // Example static rate
  EUR: { symbol: "€", rate: 0.0078 },
  GBP: { symbol: "£", rate: 0.0066 }
};

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined);

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) throw new Error("useStorefront must be used within StorefrontProvider");
  return context;
}

export function StorefrontProvider({ children, storeId }: { children: React.ReactNode, storeId: string }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [currencyCode, setCurrencyCode] = useState("BDT");
  const [isInternational, setIsInternational] = useState(false);

  useEffect(() => {
    // Auto-detect currency based on IP (Simulation)
    const savedCurrency = localStorage.getItem("selected_currency");
    if (savedCurrency && CURRENCIES[savedCurrency]) {
      setCurrencyCode(savedCurrency);
      if (savedCurrency !== "BDT") setIsInternational(true);
    } else {
      // Simulate Geo-IP: If not in BD, default to USD
      // In real app: fetch from ipapi.co or similar
      const isInt = !window.location.hostname.includes(".bd");
      if (isInt) {
        setCurrencyCode("USD");
        setIsInternational(true);
      }
    }
  }, []);

  const setCurrency = (code: string) => {
    if (CURRENCIES[code]) {
      setCurrencyCode(code);
      setIsInternational(code !== "BDT");
      localStorage.setItem("selected_currency", code);
    }
  };

  const formatPrice = (price: number) => {
    const { symbol, rate } = CURRENCIES[currencyCode];
    const converted = price * rate;
    return `${symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: currencyCode === "BDT" ? 0 : 2, maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    // Sync with localStorage on mount
    const saved = localStorage.getItem(`cart_${storeId}`);
    if (saved) {
      const cart = JSON.parse(saved);
      setCartCount(cart.reduce((acc: number, item: any) => acc + item.quantity, 0));
      setCartTotal(cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0));
    }

    // Listen for changes
    const handleCartUpdate = () => {
      const updated = localStorage.getItem(`cart_${storeId}`);
      if (updated) {
        const cart = JSON.parse(updated);
        setCartCount(cart.reduce((acc: number, item: any) => acc + item.quantity, 0));
        setCartTotal(cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0));
      }
    };

    window.addEventListener("addToCart", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);
    return () => {
      window.removeEventListener("addToCart", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, [storeId]);

  const addToCart = (product: any) => {
    window.dispatchEvent(new CustomEvent("addToCart", { detail: product }));
  };

  return (
    <StorefrontContext.Provider value={{ 
      cartCount, 
      cartTotal, 
      currency: { code: currencyCode, ...CURRENCIES[currencyCode] },
      isInternational,
      setCurrency,
      formatPrice,
      addToCart 
    }}>
      {children}
    </StorefrontContext.Provider>
  );
}
