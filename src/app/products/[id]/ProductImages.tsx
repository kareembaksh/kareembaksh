"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ImageGallery from "./ImageGallery";
import type { Product } from "@/lib/types";

const PROD_KEY = "kb_admin_data";

interface AdminData {
  overrides: Record<number, Partial<Product>>;
  added: Product[];
  deleted: number[];
}

interface Props {
  product: Product;
}

export default function ProductImages({ product }: Props) {
  const [images, setImages] = useState<string[]>(product.images ?? [product.image]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROD_KEY);
      if (!raw) return;
      const data: AdminData = JSON.parse(raw);
      const override = data.overrides[product.id];
      if (override) {
        const overrideImages = override.images ?? [];
        const primaryImage = override.image ?? product.image;
        if (overrideImages.length > 0) {
          setImages([primaryImage, ...overrideImages]);
        } else {
          setImages([primaryImage]);
        }
        return;
      }
      const added = data.added.find(p => p.id === product.id);
      if (added) {
        const addedImages = added.images ?? [];
        if (addedImages.length > 0) {
          setImages([added.image, ...addedImages]);
        } else {
          setImages([added.image]);
        }
      }
    } catch {}
  }, [product.id, product.image]);

  // Always use ImageGallery so zoom works even with a single image
  return <ImageGallery images={images} name={product.name} badge={product.badge} />;
}
