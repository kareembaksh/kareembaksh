"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId    = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!cleared) { clearCart(); setCleared(true); }
  }, [clearCart, cleared]);

  const orderId = sessionId ? `KB-${sessionId.slice(-8).toUpperCase()}` : "KB-ORDER";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-zinc-50">
      <div className="max-w-md w-full text-center">
        {/* Animated checkmark */}
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
          <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Payment Successful!</h1>
        <p className="text-zinc-500 mb-2">Your order has been confirmed and is being processed.</p>
        <p className="text-sm text-zinc-400 mb-6">
          Order reference: <span className="font-bold text-rose-500">{orderId}</span>
        </p>

        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm text-left mb-8 space-y-2.5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-800">Email confirmation</p>
              <p className="text-xs text-zinc-400">Stripe has sent a payment receipt to your email.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-800">Shipping timeline</p>
              <p className="text-xs text-zinc-400">Your order will ship within 1–3 business days. Delivery takes 7–15 days.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-800">Need help?</p>
              <p className="text-xs text-zinc-400">Contact us at <a href="mailto:support@kareembaksh.com" className="text-rose-500">support@kareembaksh.com</a></p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products" className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors text-sm">
            Continue Shopping
          </Link>
          <Link href="/track-order" className="px-6 py-3 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold rounded-xl transition-colors text-sm">
            Track Order
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
