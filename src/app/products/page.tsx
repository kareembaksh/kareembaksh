import type { Metadata } from "next";
import { getProductsServer, getCategoriesServer } from "@/lib/serverProducts";
import ProductsClientShell from "./ProductsClientShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Products | Kareem Baksh Store",
  description: "Browse our full collection of women's bags, accessories, fragrances, jewelry and outdoor gear.",
};

export default async function ProductsPage() {
  const [allProducts, allCategories] = await Promise.all([
    getProductsServer(),
    getCategoriesServer(),
  ]);

  return (
    <ProductsClientShell
      initialProducts={allProducts}
      allCategories={allCategories}
    />
  );
}
