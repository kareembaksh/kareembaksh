import type { Product } from "@/lib/types";
import { loadAdminDataFS, loadReviewsFS, loadCategoriesFS, loadProductsFS } from "@/lib/firestore";

/**
 * Server-side data fetching for Next.js Server Components.
 * Exclusively uses Firestore.
 * Admin overrides / added / hidden / deleted from kb_admin_data.state
 */

export async function getProductsServer(): Promise<Product[]> {
  try {
    const [firestoreProducts, adminData, reviewsData] = await Promise.all([
      loadProductsFS(),
      loadAdminDataFS(),
      loadReviewsFS(),
    ]);

    // Use Firestore products exclusively
    const baseSource: Product[] = firestoreProducts;

    const approvedReviews = reviewsData.filter(r => r.status === "Approved");
    const statsByProduct  = approvedReviews.reduce((acc, rev) => {
      if (!acc[rev.productId]) acc[rev.productId] = { totalRating: 0, count: 0 };
      acc[rev.productId].totalRating += rev.rating;
      acc[rev.productId].count      += 1;
      return acc;
    }, {} as Record<number, { totalRating: number; count: number }>);

    // Base: Firestore/static products, apply overrides, filter hidden/deleted
    const base = baseSource
      .filter(p => !adminData.deleted.includes(p.id) && !adminData.hidden.includes(p.id))
      .map(p => ({ ...p, ...(adminData.overrides[p.id] ?? {}) }));

    // Admin-added products (not in base)
    const baseIds = new Set(base.map(p => p.id));
    const added = adminData.added.filter(
      p => !adminData.deleted.includes(p.id) && !adminData.hidden.includes(p.id) && !baseIds.has(p.id)
    );

    return [...base, ...added].map(p => {
      const stats = statsByProduct[p.id];
      if (stats && stats.count > 0) {
        return { ...p, rating: Number((stats.totalRating / stats.count).toFixed(1)), reviews: stats.count };
      }
      return p;
    });
  } catch (error) {
    console.error("Failed to fetch products on server:", error);
    return [];
  }
}

export async function getProductByIdServer(id: number): Promise<Product | null> {
  const all = await getProductsServer();
  return all.find(p => p.id === id) || null;
}

export async function getCategoriesServer(): Promise<string[]> {
  try {
    const { list } = await loadCategoriesFS();
    return list;
  } catch {
    return [];
  }
}

export async function getCategoryMetaServer(): Promise<Record<string, { image: string; desc: string; media?: string[] }>> {
  try {
    const { meta } = await loadCategoriesFS();
    return meta;
  } catch {
    return {};
  }
}
