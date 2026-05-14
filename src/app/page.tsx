import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
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
      {/* Hero Slider */}
      <HeroSlider />

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

            {/* Free Shipping */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="12" width="24" height="16" rx="2" fill="#FFA726"/>
                  <rect x="6" y="16" width="16" height="8" rx="1" fill="#FFE0B2"/>
                  <path d="M26 16h6l4 8v4h-10V16z" fill="#EF6C00"/>
                  <rect x="8" y="16" width="10" height="8" rx="1" fill="#64B5F6"/>
                  <circle cx="10" cy="29" r="3" fill="#37474F"/>
                  <circle cx="10" cy="29" r="1.5" fill="#90A4AE"/>
                  <circle cx="30" cy="29" r="3" fill="#37474F"/>
                  <circle cx="30" cy="29" r="1.5" fill="#90A4AE"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-zinc-900 text-sm">Free Shipping</p>
                <p className="text-zinc-400 text-xs mt-0.5">On every order, always</p>
              </div>
            </div>

            {/* Easy Returns */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="8" width="28" height="24" rx="4" fill="#42A5F5"/>
                  <path d="M14 20 L20 14 L20 18 L26 18 L26 22 L20 22 L20 26 Z" fill="white"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-zinc-900 text-sm">Easy Returns</p>
                <p className="text-zinc-400 text-xs mt-0.5">Hassle-free 30-day returns</p>
              </div>
            </div>

            {/* Secure Checkout */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="18" width="20" height="16" rx="3" fill="#FFA726"/>
                  <rect x="13" y="21" width="14" height="10" rx="2" fill="#FFE0B2"/>
                  <path d="M14 18v-5a6 6 0 0112 0v5" stroke="#795548" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="20" cy="26" r="2.5" fill="#E65100"/>
                  <rect x="19" y="26" width="2" height="3" rx="1" fill="#E65100"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-zinc-900 text-sm">Secure Checkout</p>
                <p className="text-zinc-400 text-xs mt-0.5">Your data is protected</p>
              </div>
            </div>

            {/* Top Rated */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6 L23.5 14.5 L33 15.3 L26.5 21.5 L28.5 31 L20 26.5 L11.5 31 L13.5 21.5 L7 15.3 L16.5 14.5 Z" fill="#FFD600" stroke="#F9A825" strokeWidth="1"/>
                  <path d="M20 9 L22.8 15.8 L30 16.5 L24.7 21.3 L26.4 28.5 L20 25 L13.6 28.5 L15.3 21.3 L10 16.5 L17.2 15.8 Z" fill="#FFEE58"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-zinc-900 text-sm">Top Rated</p>
                <p className="text-zinc-400 text-xs mt-0.5">Thousands of happy customers</p>
              </div>
            </div>

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
