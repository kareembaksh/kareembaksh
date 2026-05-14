import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import AddToCartSection from "./AddToCartSection";
import ReviewForm from "./ReviewForm";
import ImageGallery from "./ImageGallery";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(Number(id));
  if (!product) return { title: "Product Not Found | Kareem Baksh Store" };

  return {
    title: `${product.name} | Kareem Baksh Store`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image, width: 600, height: 600, alt: product.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(Number(id));

  if (!product) notFound();

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <main>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-zinc-400">
          <Link href="/" className="hover:text-zinc-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-zinc-600">Products</Link>
          <span>/</span>
          <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-zinc-600">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-zinc-700 truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Product detail */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image gallery */}
          <ImageGallery
            images={product.images?.length ? product.images : [product.image]}
            name={product.name}
            badge={product.badge}
          />

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-rose-500 uppercase tracking-wider mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl font-bold text-zinc-900 leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-current" : "fill-zinc-200"}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-zinc-500">{product.rating} ({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-zinc-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-zinc-400 line-through">${product.originalPrice.toFixed(2)}</span>
                  <span className="bg-rose-100 text-rose-600 text-sm font-bold px-2.5 py-1 rounded-full">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-zinc-500 leading-relaxed mb-6">{product.description}</p>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="flex flex-col items-center gap-2 p-3 bg-zinc-50 rounded-xl text-center">
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
                <span className="text-xs font-medium text-zinc-600">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-zinc-50 rounded-xl text-center">
                <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="8" width="28" height="24" rx="4" fill="#42A5F5"/>
                  <path d="M14 20 L20 14 L20 18 L26 18 L26 22 L20 22 L20 26 Z" fill="white"/>
                </svg>
                <span className="text-xs font-medium text-zinc-600">Easy Returns</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-zinc-50 rounded-xl text-center">
                <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="18" width="20" height="16" rx="3" fill="#FFA726"/>
                  <rect x="13" y="21" width="14" height="10" rx="2" fill="#FFE0B2"/>
                  <path d="M14 18v-5a6 6 0 0112 0v5" stroke="#795548" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="20" cy="26" r="2.5" fill="#E65100"/>
                  <rect x="19" y="26" width="2" height="3" rx="1" fill="#E65100"/>
                </svg>
                <span className="text-xs font-medium text-zinc-600">Secure Pay</span>
              </div>
            </div>

            {/* Add to cart (client) */}
            <AddToCartSection product={product} />

            <Link
              href="/products"
              className="mt-4 flex items-center justify-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Continue Shopping
            </Link>

            {/* Review form (client) */}
            <ReviewForm productId={product.id} productName={product.name} />
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="bg-zinc-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-8">You May Also Like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
