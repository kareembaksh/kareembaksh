"use client";

import { useState, useEffect } from "react";
import { products as staticProducts } from "@/lib/products";
import type { Product, Review } from "@/lib/types";

const PROD_KEY = "kb_admin_data";
const REV_KEY  = "kb_reviews";

interface AdminData {
  overrides: Record<number, Partial<Product>>;
  added: Product[];
  deleted: number[];
  hidden: number[];
}

function loadAdminData(): AdminData {
  try {
    const raw = localStorage.getItem(PROD_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return { overrides: p.overrides || {}, added: p.added || [], deleted: p.deleted || [], hidden: p.hidden || [] };
    }
  } catch {}
  return { overrides: {}, added: [], deleted: [], hidden: [] };
}

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

export function useAdminCategoryMeta() {
  const [meta, setMeta] = useState<Record<string, { image: string; desc: string; media?: string[] }>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem("kb_category_meta");
      if (raw) {
        setMeta(JSON.parse(raw));
      }
    } catch {}
  }, []);
  return meta;
}

/**
 * Returns the visible products for the storefront,
 * respecting admin hide/delete/overrides/added products.
 */
export function useAdminProducts(): Product[] {
  const [visibleProducts, setVisibleProducts] = useState<Product[]>(staticProducts);

  useEffect(() => {
    function computeProducts() {
      const d = loadAdminData();
      
      // Load real reviews to calculate rating & count
      let reviewsData: Review[] = [];
      try {
        const rawRev = localStorage.getItem(REV_KEY);
        if (rawRev) reviewsData = JSON.parse(rawRev);
      } catch {}

      const approvedReviews = reviewsData.filter(r => r.status === "Approved");
      
      const statsByProduct = approvedReviews.reduce((acc, rev) => {
        if (!acc[rev.productId]) acc[rev.productId] = { totalRating: 0, count: 0 };
        acc[rev.productId].totalRating += rev.rating;
        acc[rev.productId].count += 1;
        return acc;
      }, {} as Record<number, { totalRating: number, count: number }>);

      // Filter out deleted + hidden static products, apply overrides
      const base = staticProducts
        .filter(p => !d.deleted.includes(p.id) && !d.hidden.includes(p.id))
        .map(p => ({ ...p, ...(d.overrides[p.id] ?? {}) }));
        
      // Filter out hidden/deleted added products too
      const added = d.added.filter(p => !d.deleted.includes(p.id) && !d.hidden.includes(p.id));
      
      // Merge all and apply real review stats
      const allProducts = [...base, ...added].map(p => {
        const stats = statsByProduct[p.id];
        if (stats) {
          return {
            ...p,
            rating: Number((stats.totalRating / stats.count).toFixed(1)),
            reviews: stats.count
          };
        } else {
          return { ...p, rating: 0, reviews: 0 }; // No reviews = 0 rating
        }
      });
      
      setVisibleProducts(allProducts);
    }

    computeProducts();

    // Re-compute whenever localStorage changes (e.g. admin makes a change in another tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROD_KEY || e.key === REV_KEY) computeProducts();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return visibleProducts;
}

export function useProductReviews(productId: number): Review[] {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    function loadReviews() {
      try {
        const raw = localStorage.getItem(REV_KEY);
        if (raw) {
          const all: Review[] = JSON.parse(raw);
          setReviews(all.filter(r => r.productId === productId && r.status === "Approved"));
        }
      } catch {}
    }
    
    loadReviews();
    
    const onStorage = (e: StorageEvent) => {
      if (e.key === REV_KEY) loadReviews();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [productId]);

  return reviews;
}
