"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    id: 1,
    badge: "New Collection",
    title: "Premium Women's",
    highlight: "Bags & Purses",
    desc: "From evening clutches to everyday crossbody bags — 28 styles to match every mood and occasion.",
    cta: { label: "Shop Bags", href: "/products?category=Women%27s+Bags" },
    secondary: { label: "View All", href: "/products" },
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    bg: "from-rose-50 via-white to-pink-50",
  },
  {
    id: 2,
    badge: "Home Essentials",
    title: "Everything You Need",
    highlight: "For Your Home",
    desc: "Premium bedding, bath towels, kitchen supplies, and storage — quality you can feel every day.",
    cta: { label: "Shop Home", href: "/products?category=Home+%26+Living" },
    secondary: { label: "Kitchen & Dining", href: "/products?category=Kitchen+%26+Dining" },
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    bg: "from-blue-50 via-white to-indigo-50",
  },
  {
    id: 3,
    badge: "Beauty & Style",
    title: "Fragrance, Hats",
    highlight: "& Accessories",
    desc: "Discover perfume gift sets, sun hats, pearl bracelets, and more to complete your look.",
    cta: { label: "Shop Beauty", href: "/products?category=Beauty+%26+Fragrance" },
    secondary: { label: "Accessories", href: "/products?category=Accessories" },
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80",
    bg: "from-amber-50 via-white to-orange-50",
  },
  {
    id: 4,
    badge: "Outdoors & Sports",
    title: "Beach, Camping",
    highlight: "& Beyond",
    desc: "Beach chairs, umbrellas, picnic blankets, and golf gear — everything for your outdoor adventures.",
    cta: { label: "Shop Outdoors", href: "/products?category=Outdoors+%26+Sports" },
    secondary: { label: "View All", href: "/products" },
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    bg: "from-green-50 via-white to-teal-50",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => goTo((current + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [current]);

  function goTo(idx: number) {
    if (animating || idx === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 300);
  }

  const slide = slides[current];

  return (
    <section className={`relative bg-gradient-to-br ${slide.bg} overflow-hidden transition-all duration-700`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Text */}
          <div
            className={`transition-all duration-300 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
          >
            <span className="inline-block bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
              {slide.badge}
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold text-zinc-900 leading-tight mb-6">
              {slide.title}
              <span className="text-rose-500 block">{slide.highlight}</span>
            </h1>
            <p className="text-lg text-zinc-500 mb-8 max-w-md leading-relaxed">{slide.desc}</p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href={slide.cta.href}
                className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-8 py-3.5 rounded-full transition-colors shadow-lg shadow-rose-200"
              >
                {slide.cta.label}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href={slide.secondary.href}
                className="inline-flex items-center gap-2 bg-white hover:bg-zinc-50 text-zinc-900 font-semibold px-8 py-3.5 rounded-full border border-zinc-200 transition-colors"
              >
                {slide.secondary.label}
              </Link>
            </div>

            {/* Dots */}
            <div className="flex gap-2 mt-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? "w-8 bg-rose-500" : "w-2 bg-zinc-300 hover:bg-zinc-400"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative hidden lg:block">
            <div
              className={`relative w-full h-[480px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
                animating ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.highlight}
                fill
                className="object-cover"
                priority
                sizes="50vw"
              />
            </div>
            {/* Prev / Next arrows */}
            <button
              onClick={() => goTo((current - 1 + slides.length) % slides.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => goTo((current + 1) % slides.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900">Quality Guaranteed</p>
                <p className="text-xs text-zinc-400">Free shipping on all orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100">
        <div
          key={current}
          className="h-full bg-rose-400 animate-progress"
          style={{ animationDuration: "5s" }}
        />
      </div>
    </section>
  );
}
