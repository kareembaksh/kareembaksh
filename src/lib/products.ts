import { Product } from "./types";

export const products: Product[] = [
  // Women's Bags
  {
    id: 1,
    name: "Luxury Leather Tote Bag",
    category: "Women's Bags",
    price: 89.99,
    originalPrice: 129.99,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80",
    description: "Crafted from premium full-grain leather, this spacious tote features a structured silhouette, gold-tone hardware, and interior organizer pockets. Perfect for work or weekend.",
    badge: "Sale",
    rating: 4.8,
    reviews: 124,
  },
  {
    id: 2,
    name: "Crossbody Shoulder Bag",
    category: "Women's Bags",
    price: 54.99,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
    description: "A versatile crossbody bag with adjustable strap, multiple compartments, and a secure zip closure. Fits your phone, wallet, keys, and essentials with ease.",
    badge: "Popular",
    rating: 4.6,
    reviews: 89,
  },
  {
    id: 3,
    name: "Evening Clutch Bag",
    category: "Women's Bags",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80",
    description: "Elegant satin clutch with a crystal embellished clasp. The perfect companion for evenings out, weddings, and special occasions.",
    badge: "New",
    rating: 4.7,
    reviews: 56,
  },
  {
    id: 4,
    name: "Canvas Tote Bag",
    category: "Women's Bags",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1614179924047-e1ab49a0a0cf?w=600&q=80",
    description: "Eco-friendly heavy-duty canvas tote with reinforced handles and a spacious interior. Great for groceries, beach days, or everyday carry.",
    rating: 4.4,
    reviews: 203,
  },
  {
    id: 5,
    name: "Mini Bucket Bag",
    category: "Women's Bags",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",
    description: "Trendy mini bucket bag with a drawstring top and detachable chain strap. Fits the essentials and makes a bold fashion statement.",
    badge: "Hot",
    rating: 4.9,
    reviews: 178,
  },
  {
    id: 6,
    name: "Quilted Chain Bag",
    category: "Women's Bags",
    price: 79.99,
    originalPrice: 99.99,
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80",
    description: "Classic quilted design with a gold chain strap and signature turn-lock closure. Timeless elegance that transitions from day to night.",
    badge: "Sale",
    rating: 4.8,
    reviews: 91,
  },

  // Hand Sanitizers
  {
    id: 7,
    name: "Lavender Hand Sanitizer 500ml",
    category: "Hand Sanitizers",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=600&q=80",
    description: "Hospital-grade 70% ethyl alcohol formula infused with calming lavender essential oil. Kills 99.9% of germs without drying out your skin.",
    badge: "Popular",
    rating: 4.7,
    reviews: 312,
  },
  {
    id: 8,
    name: "Rose Hand Sanitizer 250ml",
    category: "Hand Sanitizers",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&q=80",
    description: "Delicately scented with natural rose extracts. This compact sanitizer fits in any bag and keeps your hands clean and moisturized on the go.",
    badge: "New",
    rating: 4.5,
    reviews: 145,
  },
  {
    id: 9,
    name: "Aloe Vera Sanitizer Gel",
    category: "Hand Sanitizers",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1604335398980-ededcall85d7?w=600&q=80",
    description: "Enriched with pure aloe vera extract to soothe and protect. The non-sticky gel formula dries quickly and leaves hands feeling fresh.",
    rating: 4.6,
    reviews: 267,
  },
  {
    id: 10,
    name: "Antibacterial Sanitizer Spray",
    category: "Hand Sanitizers",
    price: 7.99,
    originalPrice: 10.99,
    image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=600&q=80",
    description: "Easy-to-use spray bottle with 75% isopropyl alcohol. Great for sanitizing hands, surfaces, and high-touch areas. Travel-friendly size.",
    badge: "Sale",
    rating: 4.4,
    reviews: 198,
  },

  // Skincare
  {
    id: 11,
    name: "Vitamin C Brightening Serum",
    category: "Skincare",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4ee6c05?w=600&q=80",
    description: "20% stabilized Vitamin C serum that visibly brightens skin, reduces dark spots, and boosts collagen production. Suitable for all skin types.",
    badge: "Hot",
    rating: 4.9,
    reviews: 421,
  },
  {
    id: 12,
    name: "Hydrating Face Mask",
    category: "Skincare",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80",
    description: "Deep hydration mask with hyaluronic acid, ceramides, and niacinamide. Plumps and restores moisture in just 15 minutes.",
    badge: "New",
    rating: 4.7,
    reviews: 234,
  },
  {
    id: 13,
    name: "Daily Moisturizing Cream",
    category: "Skincare",
    price: 24.99,
    originalPrice: 34.99,
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80",
    description: "Lightweight yet deeply nourishing cream with SPF 15, shea butter, and peptides. Your all-in-one daily moisturizer and sun protection.",
    badge: "Sale",
    rating: 4.6,
    reviews: 189,
  },

  // Accessories
  {
    id: 14,
    name: "Pure Silk Scarf",
    category: "Accessories",
    price: 44.99,
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80",
    description: "100% mulberry silk scarf with a vibrant botanical print. Wear it as a headscarf, neck tie, or bag charm for instant elegance.",
    rating: 4.8,
    reviews: 76,
  },
  {
    id: 15,
    name: "Pearl Necklace Set",
    category: "Accessories",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80",
    description: "Freshwater pearl necklace and earring set with sterling silver clasps. A classic set that elevates any outfit from casual to formal.",
    badge: "Popular",
    rating: 4.9,
    reviews: 143,
  },
  {
    id: 16,
    name: "UV400 Fashion Sunglasses",
    category: "Accessories",
    price: 34.99,
    originalPrice: 49.99,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80",
    description: "Oversized cat-eye sunglasses with UV400 polarized lenses and a lightweight acetate frame. Style meets protection.",
    badge: "Sale",
    rating: 4.5,
    reviews: 112,
  },
];

export const categories = ["All", "Women's Bags", "Hand Sanitizers", "Skincare", "Accessories"];

export function getProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") return products;
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.badge === "Popular" || p.badge === "Hot").slice(0, 4);
}
