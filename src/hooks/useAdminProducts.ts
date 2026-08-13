"use client";

import { useState, useEffect } from "react";
import { products as staticProducts } from "@/lib/products";
import type { Product, Review } from "@/lib/types";
import { onAdminDataChange, onReviewsChange, onProductReviews, type AdminData } from "@/lib/firestore";

// ─── helper: merge static + admin data → visible product list ───────────────
function computeVisible(d: AdminData, reviews: Review[]): Product[] {
  const approvedReviews = reviews.filter(r => r.status === "Approved");
  const statsByProduct  = approvedReviews.reduce((acc, rev) => {
    if (!acc[rev.productId]) acc[rev.productId] = { totalRating: 0, count: 0 };
    acc[rev.productId].totalRating += rev.rating;
    acc[rev.productId].count      += 1;
    return acc;
  }, {} as Record<number, { totalRating: number; count: number }>);

  const base  = staticProducts
    .filter(p => !d.deleted.includes(p.id) && !d.hidden.includes(p.id))
    .map(p    => ({ ...p, ...(d.overrides[p.id] ?? {}) }));

  const added = d.added.filter(p => !d.deleted.includes(p.id) && !d.hidden.includes(p.id));

  return [...base, ...added].map(p => {
    const stats = statsByProduct[p.id];
    if (stats) {
      return { ...p, rating: Number((stats.totalRating / stats.count).toFixed(1)), reviews: stats.count };
    }
    return { ...p, rating: 0, reviews: 0 };
  });
}

// ─── useAdminProducts ────────────────────────────────────────────────────────
export function useAdminProducts(): Product[] {
  const [visibleProducts, setVisibleProducts] = useState<Product[]>(staticProducts);

  useEffect(() => {
    let adminData:  AdminData  = { overrides: {}, added: [], deleted: [], hidden: [] };
    let reviewsArr: Review[]   = [];

    const refresh = () => setVisibleProducts(computeVisible(adminData, reviewsArr));

    // Real-time listeners on Firestore
    const unsubAdmin   = onAdminDataChange(d => { adminData   = d;   refresh(); });
    const unsubReviews = onReviewsChange(r  => { reviewsArr  = r;   refresh(); });

    return () => { unsubAdmin(); unsubReviews(); };
  }, []);

  return visibleProducts;
}

// ─── useProductReviews ───────────────────────────────────────────────────────
export function useProductReviews(productId: number): Review[] {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const unsub = onProductReviews(productId, setReviews);
    return () => unsub();
  }, [productId]);

  return reviews;
}

// ─── useAdminCategories ──────────────────────────────────────────────────────
// Still uses localStorage for categories (migrated later if needed)
export function useAdminCategories() {
  const [cats, setCats] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("kb_categories");
      const staticCats = staticProducts.reduce((acc, p) => {
        if (!acc.includes(p.category) && p.category !== "All") acc.push(p.category);
        return acc;
      }, [] as string[]);

      if (raw) {
        let parsed = JSON.parse(raw);
        if (!parsed.some((c: string) => staticCats.includes(c))) {
          parsed = [...staticCats, ...parsed];
          localStorage.setItem("kb_categories", JSON.stringify(parsed));
        }
        setCats(parsed);
      } else {
        setCats(staticCats);
        localStorage.setItem("kb_categories", JSON.stringify(staticCats));
      }
    } catch {}
  }, []);
  return cats;
}

// ─── useAdminCategoryMeta ────────────────────────────────────────────────────
export function useAdminCategoryMeta() {
  const [meta, setMeta] = useState<Record<string, { image: string; desc: string; media?: string[] }>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem("kb_category_meta");
      if (raw) setMeta(JSON.parse(raw));
    } catch {}
  }, []);
  return meta;
}
