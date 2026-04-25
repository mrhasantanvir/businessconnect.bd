"use client";

import React from "react";
import { Plus } from "lucide-react";

export function AddToCartButton({ product }: { product: any }) {
  const handleAdd = () => {
    // Dispatch custom event to communicate with floating cart
    const event = new CustomEvent("addToCart", { detail: product });
    window.dispatchEvent(event);
  };

  return (
    <button 
      onClick={handleAdd}
      className="w-full h-12 bg-gray-50 text-gray-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
    >
      <Plus className="w-4 h-4" /> Add to Bag
    </button>
  );
}
