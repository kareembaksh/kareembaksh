import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts, categories } from "@/lib/products";

const categoryMeta: Record<string, { image: string; desc: string }> = {
  "Women's Bags": {
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
    desc: "28 styles",
  },
  "Accessories": {
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
    desc: "Hats, wallets & more",
  },
  "Beauty & Fragrance": {
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80",
    desc: "Perfumes & gift sets",
  },
  "Home & Living": {
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    desc: "Bedding, bath & more",
  },
  "Kitchen & Dining": {
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    desc: "Cookware & supplies",
  },
  "Outdoors & Sports": {
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    desc: "Beach, camping & sport",
  },
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
                58 Products · Free Shipping
              </span>
              <h1 className="text-5xl lg:text-6xl font-bold text-zinc-900 leading-tight mb-6">
                Premium Finds
                <span className="text-rose-500 block">For Every Day</span>
              </h1>
              <p className="text-lg text-zinc-500 mb-8 max-w-md leading-relaxed">
                Women&apos;s bags, beauty, home essentials, kitchen, and outdoor gear — all in one store with unbeatable prices.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-8 py-3.5 rounded-full transition-colors shadow-lg shadow-rose-200"
                >
                  Shop All 58 Products
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/products?category=Women%27s+Bags"
                  className="inline-flex items-center gap-2 bg-white hover:bg-zinc-50 text-zinc-900 font-semibold px-8 py-3.5 rounded-full border border-zinc-200 transition-colors"
                >
                  Women&apos;s Bags
                </Link>
              </div>
              <div className="flex gap-8 mt-10 text-sm">
                {[["58", "Products"], ["6", "Categories"], ["Free", "Shipping"]].map(([val, label]) => (
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
                  src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80"
                  alt="Featured bags collection"
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
                  <p className="text-xs font-bold text-zinc-900">Quality Guaranteed</p>
                  <p className="text-xs text-zinc-400">Curated premium products</p>
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
            <p className="text-zinc-500 mt-2">Browse all 6 collections</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {shopCategories.map((cat) => (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="group relative rounded-2xl overflow-hidden h-40 bg-zinc-100"
              >
                <Image
                  src={categoryMeta[cat]?.image ?? ""}
                  alt={cat}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-semibold text-xs leading-tight">{cat}</p>
                  <p className="text-white/60 text-xs mt-0.5">{categoryMeta[cat]?.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900">Best Sellers</h2>
              <p className="text-zinc-500 mt-1">Our most popular picks right now</p>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1"
            >
              View all 58
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

      {/* Trust banner */}
      <section className="py-12 bg-white border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🚚", title: "Free Shipping", desc: "On every order, always" },
              { icon: "↩️", title: "Easy Returns", desc: "Hassle-free 30-day returns" },
              { icon: "🔒", title: "Secure Checkout", desc: "Your data is protected" },
              { icon: "⭐", title: "Top Rated", desc: "Thousands of happy customers" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <span className="text-3xl">{icon}</span>
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">{title}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-rose-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Everything You Need, One Store</h2>
          <p className="text-rose-100 mb-8 max-w-lg mx-auto">
            From women&apos;s fashion bags to home essentials and outdoor gear — 58 premium products waiting for you.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-white text-rose-500 font-bold px-8 py-3.5 rounded-full hover:bg-rose-50 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </section>
    </main>
  );
}
