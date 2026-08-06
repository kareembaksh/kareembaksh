"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PROD_KEY = "kb_admin_data";

interface Props {
  productId: number;
  children: React.ReactNode;
}

/**
 * Client-side guard that redirects to /products if the product
 * has been hidden or deleted by the admin.
 */
export default function ProductVisibilityGuard({ productId, children }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    function check() {
      try {
        const raw = localStorage.getItem(PROD_KEY);
        if (!raw) return;
        const d = JSON.parse(raw);
        const hidden: number[] = d.hidden || [];
        const deleted: number[] = d.deleted || [];
        if (hidden.includes(productId) || deleted.includes(productId)) {
          setVisible(false);
          router.replace("/products");
        }
      } catch {}
    }
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, [productId, router]);

  if (!visible) return null;
  return <>{children}</>;
}
