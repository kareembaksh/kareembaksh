export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description: string;
  badge?: "New" | "Sale" | "Popular" | "Hot";
  rating: number;
  reviews: number;
  quantity: number;
  sortOrder?: number; // lower = appears first (0 = top)
}

export interface CartItem extends Product {
  quantity: number;
  selected?: boolean; // when false the item is excluded from checkout (legacy carts default to selected)
}

export type ReviewStatus = "Pending" | "Approved" | "Rejected";

export interface Review {
  id: string; date: string;
  productId: number; productName: string;
  author: string; email: string;
  rating: number; title: string; body: string;
  status: ReviewStatus;
  reply?: string;
}

export interface HeroSlide {
  id: number;
  badge: string;
  title: string;
  highlight: string;
  desc: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
  image: string;
  bg: string;      // Tailwind gradient classes, e.g. "from-rose-50 via-white to-pink-50"
  active: boolean; // false = slide hidden from the storefront slider
}