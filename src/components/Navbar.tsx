"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const { totalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-zinc-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-zinc-900">
                Kareem<span className="text-rose-500">Baksh</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
              <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
              <Link href="/products" className="hover:text-zinc-900 transition-colors">Shop</Link>
              <Link href="/products?category=Women%27s+Bags" className="hover:text-zinc-900 transition-colors">Bags</Link>
              <Link href="/products?category=Skincare" className="hover:text-zinc-900 transition-colors">Skincare</Link>
              <Link href="/products?category=Accessories" className="hover:text-zinc-900 transition-colors">Accessories</Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-zinc-100 transition-colors"
                aria-label="Open cart"
              >
                <svg className="w-6 h-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile menu */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100"
              >
                <svg className="w-6 h-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {menuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden pb-4 flex flex-col gap-3 text-sm font-medium text-zinc-600 border-t border-zinc-100 pt-3">
              <Link href="/" onClick={() => setMenuOpen(false)} className="hover:text-zinc-900">Home</Link>
              <Link href="/products" onClick={() => setMenuOpen(false)} className="hover:text-zinc-900">Shop All</Link>
              <Link href="/products?category=Women%27s+Bags" onClick={() => setMenuOpen(false)} className="hover:text-zinc-900">Women&apos;s Bags</Link>
              <Link href="/products?category=Hand+Sanitizers" onClick={() => setMenuOpen(false)} className="hover:text-zinc-900">Hand Sanitizers</Link>
              <Link href="/products?category=Skincare" onClick={() => setMenuOpen(false)} className="hover:text-zinc-900">Skincare</Link>
              <Link href="/products?category=Accessories" onClick={() => setMenuOpen(false)} className="hover:text-zinc-900">Accessories</Link>
            </div>
          )}
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
