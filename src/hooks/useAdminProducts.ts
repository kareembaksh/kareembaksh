"use client";

import { useState, useEffect } from "react";
import { products as staticProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

const PROD_KEY = "kb_admin_data";

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
      // Filter out deleted + hidden static products, apply overrides
      const base = staticProducts
        .filter(p => !d.deleted.includes(p.id) && !d.hidden.includes(p.id))
        .map(p => ({ ...p, ...(d.overrides[p.id] ?? {}) }));
      // Filter out hidden/deleted added products too
      const added = d.added.filter(p => !d.deleted.includes(p.id) && !d.hidden.includes(p.id));
      setVisibleProducts([...base, ...added]);
    }

    computeProducts();

    // Re-compute whenever localStorage changes (e.g. admin makes a change in another tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROD_KEY) computeProducts();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return visibleProducts;
}
