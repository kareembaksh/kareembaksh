"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { Product } from "@/lib/types";

export default function AddToCartSection({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Quantity */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-zinc-700">Quantity</span>
        <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 text-zinc-700 font-bold text-lg transition-colors"
          >−</button>
          <span className="w-10 h-10 flex items-center justify-center text-sm font-semibold text-zinc-900 border-x border-zinc-200">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(10, q + 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 text-zinc-700 font-bold text-lg transition-colors"
          >+</button>
        </div>
        <span className="text-xs text-zinc-400">Max 10 per order</span>
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAdd}
        className={`w-full py-4 font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg ${
          added
            ? "bg-green-500 shadow-green-100 text-white"
            : "bg-rose-500 hover:bg-rose-600 shadow-rose-200 text-white"
        }`}
      >
        {added ? (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Added to Cart!
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Add to Cart — ${(product.price * qty).toFixed(2)}
          </>
        )}
      </button>
    </div>
  );
}
