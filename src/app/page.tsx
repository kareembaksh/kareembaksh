import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts, categories } from "@/lib/products";

const categoryImages: Record<string, string> = {
  "Women's Bags": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80",
  "Hand Sanitizers": "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=600&q=80",
  "Skincare": "https://images.unsplash.com/photo-1570194065650-d99fb4ee6c05?w=600&q=80",
  "Accessories": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80",
};

export default function Home() {
  const featured = getFeaturedProducts();
  const shopCategories = categories.filter((c) => c !== "All");

  return (
    <main>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-rose-50 via-white to-pink-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                New Collection 2025
              </span>
              <h1 className="text-5xl lg:text-6xl font-bold text-zinc-900 leading-tight mb-6">
                Elevate Your
                <span className="text-rose-500 block">Everyday Style</span>
              </h1>
              <p className="text-lg text-zinc-500 mb-8 max-w-md leading-relaxed">
                Discover premium women&apos;s bags, skincare essentials, hand sanitizers, and accessories — all curated for the modern woman.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-8 py-3.5 rounded-full transition-colors shadow-lg shadow-rose-200"
                >
                  Shop Now
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/products?category=Women%27s+Bags"
                  className="inline-flex items-center gap-2 bg-white hover:bg-zinc-50 text-zinc-900 font-semibold px-8 py-3.5 rounded-full border border-zinc-200 transition-colors"
                >
                  View Bags
                </Link>
              </div>
              <div className="flex gap-8 mt-10 text-sm">
                {[["500+", "Products"], ["10k+", "Happy Customers"], ["Free", "Shipping"]].map(([val, label]) => (
                  <div key={label}>
                    <p className="text-2xl font-bold text-zinc-900">{val}</p>
                    <p className="text-zinc-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[480px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80"
                  alt="Featured product"
                  fill
                  className="object-cover"
                  priority
                  sizes="50vw"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Premium Quality</p>
                  <p className="text-xs text-zinc-400">Curated for you</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-zinc-900">Shop by Category</h2>
            <p className="text-zinc-500 mt-2">Find exactly what you&apos;re looking for</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {shopCategories.map((cat) => (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="group relative rounded-2xl overflow-hidden h-44 bg-zinc-100"
              >
                <Image
                  src={categoryImages[cat]}
                  alt={cat}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-sm">{cat}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900">Best Sellers</h2>
              <p className="text-zinc-500 mt-1">Our most loved products</p>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              View all
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="py-16 bg-rose-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Free Shipping on All Orders</h2>
          <p className="text-rose-100 mb-8">No minimum order required. Shop now and save!</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-white text-rose-500 font-bold px-8 py-3.5 rounded-full hover:bg-rose-50 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
