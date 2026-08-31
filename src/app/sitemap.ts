import type { MetadataRoute } from "next";
import { getProductsServer, getCategoriesServer } from "@/lib/serverProducts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.kareembaksh.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/checkout`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/support`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/shipping`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/returns`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/track-order`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const products = await getProductsServer();
  const allCategories = await getCategoriesServer();

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/products/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = allCategories
    .filter((c) => c !== "All")
    .map((c) => ({
      url: `${base}/products?category=${encodeURIComponent(c)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...productEntries, ...categoryEntries];
}
