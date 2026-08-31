"use client";

import { useState, useEffect } from "react";
import { onAdminDataChange, onReviewsChange, onProductReviews, type AdminData, loadProductsFS, loadCategoriesFS } from "@/lib/firestore";
import type { Product, Review } from "@/lib/types";

// ─── helper: merge static + admin data → visible product list ───────────────
function computeVisible(d: AdminData, reviews: Review[], firestoreProds: Product[]): Product[] {
  const approvedReviews = reviews.filter(r => r.status === "Approved");
  const statsByProduct  = approvedReviews.reduce((acc, rev) => {
    if (!acc[rev.productId]) acc[rev.productId] = { totalRating: 0, count: 0 };
    acc[rev.productId].totalRating += rev.rating;
    acc[rev.productId].count      += 1;
    return acc;
  }, {} as Record<number, { totalRating: number; count: number }>);

  const base  = firestoreProds
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
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);

  useEffect(() => {
    let adminData:  AdminData  = { overrides: {}, added: [], deleted: [], hidden: [] };
    let reviewsArr: Review[]   = [];

    let fsProds: Product[] = [];
    
    const refresh = () => setVisibleProducts(computeVisible(adminData, reviewsArr, fsProds));

    loadProductsFS().then(ps => {
      fsProds = ps;
      refresh();
    }).catch(console.error);

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
export function useAdminCategories() {
  const [cats, setCats] = useState<string[]>([]);
  useEffect(() => {
    loadCategoriesFS().then(state => setCats(state.list)).catch(console.error);
  }, []);
  return cats;
}

// ─── useAdminCategoryMeta ────────────────────────────────────────────────────
export function useAdminCategoryMeta() {
  const [meta, setMeta] = useState<Record<string, { image: string; desc: string; media?: string[] }>>({});
  useEffect(() => {
    loadCategoriesFS().then(state => setMeta(state.meta)).catch(console.error);
  }, []);
  return meta;
}
