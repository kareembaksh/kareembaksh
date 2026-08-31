/**
 * firestore.ts
 * Central data-access layer — all Firestore reads/writes go here.
 * Collections:
 *   kb_admin_data  – single doc "state" (overrides / added / deleted / hidden)
 *   kb_orders      – one doc per order
 *   kb_reviews     – one doc per review
 */
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product, Review, ReviewStatus, CartItem, HeroSlide } from "./types";

// ─── Collection names ───────────────────────────────────────────────────────
const ADMIN_COL    = "kb_admin_data";
const ORDERS_COL   = "kb_orders";
const REVIEWS_COL  = "kb_reviews";
const PROMOS_COL   = "kb_promos";
const CATS_COL     = "kb_categories";
const PRODUCTS_COL = "kb_products";
const CARTS_COL    = "kb_carts";
const NEWSLETTER_COL = "kb_subscribers";
const ADMINS_COL   = "kb_admins";
const HERO_COL     = "kb_heroslides";

// ─── Carts (kb_carts collection) ──────────────────────────────────────────────

export async function loadCartFS(userId: string): Promise<CartItem[]> {
  const snap = await getDoc(doc(db, CARTS_COL, userId));
  if (snap.exists()) {
    return snap.data().items as CartItem[];
  }
  return [];
}

export async function saveCartFS(userId: string, items: CartItem[]): Promise<void> {
  await setDoc(doc(db, CARTS_COL, userId), { items });
}

// ─── Products (kb_products collection) ────────────────────────────────────────
export async function loadProductsFS(): Promise<Product[]> {
  const snap = await getDocs(collection(db, PRODUCTS_COL));
  return snap.docs.map(d => ({ ...d.data(), id: Number(d.id) } as Product));
}

export async function saveProductFS(product: Product): Promise<void> {
  await setDoc(doc(db, PRODUCTS_COL, String(product.id)), product);
}

export async function deleteProductFS(id: number): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COL, String(id)));
}

// ─── Admin product data ─────────────────────────────────────────────────────
export interface AdminData {
  overrides: Record<number, Partial<Product>>;
  added:     Product[];
  deleted:   number[];
  hidden:    number[];
}

export async function loadAdminDataFS(): Promise<AdminData> {
  const ref = doc(db, ADMIN_COL, "state");
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const d = snap.data() as AdminData;
    return { overrides: d.overrides||{}, added: d.added||[], deleted: d.deleted||[], hidden: d.hidden||[] };
  }
  return { overrides: {}, added: [], deleted: [], hidden: [] };
}

export async function saveAdminDataFS(data: AdminData): Promise<void> {
  const ref = doc(db, ADMIN_COL, "state");
  await setDoc(ref, data);
}

/** Real-time listener — calls cb whenever admin product data changes */
export function onAdminDataChange(cb: (d: AdminData) => void): Unsubscribe {
  const ref = doc(db, ADMIN_COL, "state");
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const d = snap.data() as AdminData;
      cb({ overrides: d.overrides||{}, added: d.added||[], deleted: d.deleted||[], hidden: d.hidden||[] });
    } else {
      cb({ overrides: {}, added: [], deleted: [], hidden: [] });
    }
  });
}

// ─── Categories ─────────────────────────────────────────────────────────────
export interface CategoryState {
  list: string[];
  meta: Record<string, { image: string; desc: string; media?: string[] }>;
}

export async function loadCategoriesFS(): Promise<CategoryState> {
  const snap = await getDoc(doc(db, CATS_COL, "state"));
  if (snap.exists()) {
    return snap.data() as CategoryState;
  }
  return { list: [], meta: {} };
}

export async function saveCategoriesFS(state: CategoryState): Promise<void> {
  await setDoc(doc(db, CATS_COL, "state"), state);
}

// ─── Orders ─────────────────────────────────────────────────────────────────
export interface OrderItem { productId: number; name: string; price: number; qty: number; image: string; }
export type OrderStatus = "Pending"|"Processing"|"Shipped"|"Delivered"|"Cancelled";
export interface Order {
  id: string; date: string;
  customer: { name:string; email:string; phone:string; address:string; city:string; state:string; zip:string };
  items: OrderItem[]; total: number; status: OrderStatus; tracking?: string; notes?: string;
}

export async function loadOrdersFS(): Promise<Order[]> {
  const snap = await getDocs(collection(db, ORDERS_COL));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Order));
}

export async function saveOrderFS(order: Order): Promise<void> {
  const ref = doc(db, ORDERS_COL, order.id);
  await setDoc(ref, order);
}

export async function updateOrderFS(id: string, fields: Partial<Order>): Promise<void> {
  await updateDoc(doc(db, ORDERS_COL, id), fields as Record<string, unknown>);
}

export function onOrdersChange(cb: (orders: Order[]) => void): Unsubscribe {
  return onSnapshot(collection(db, ORDERS_COL), (snap) => {
    cb(snap.docs.map(d => ({ ...d.data(), id: d.id } as Order)));
  });
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
export async function loadReviewsFS(): Promise<Review[]> {
  const snap = await getDocs(collection(db, REVIEWS_COL));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Review));
}

export async function addReviewFS(review: Omit<Review,"id">): Promise<string> {
  const ref = await addDoc(collection(db, REVIEWS_COL), review);
  return ref.id;
}

export async function updateReviewFS(id: string, fields: Partial<Review>): Promise<void> {
  await updateDoc(doc(db, REVIEWS_COL, id), fields as Record<string, unknown>);
}

export async function deleteReviewFS(id: string): Promise<void> {
  await deleteDoc(doc(db, REVIEWS_COL, id));
}

export function onReviewsChange(cb: (reviews: Review[]) => void): Unsubscribe {
  return onSnapshot(collection(db, REVIEWS_COL), (snap) => {
    cb(snap.docs.map(d => ({ ...d.data(), id: d.id } as Review)));
  });
}

/** Approved reviews for a specific product — real-time */
export function onProductReviews(productId: number, cb: (reviews: Review[]) => void): Unsubscribe {
  const q = query(
    collection(db, REVIEWS_COL),
    where("productId", "==", productId),
    where("status", "==", "Approved")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ ...d.data(), id: d.id } as Review)));
  });
}

// ─── Promo Codes ─────────────────────────────────────────────────────────────
export interface PromoCode {
  id: string; code: string; description: string;
  type: "percent"|"fixed"; value: number; minOrder?: number;
  startAt?: string; expiresAt?: string; active: boolean;
}

export async function loadPromosFS(): Promise<PromoCode[]> {
  const snap = await getDocs(collection(db, PROMOS_COL));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as PromoCode));
}

export async function savePromoFS(promo: PromoCode): Promise<void> {
  const ref = doc(db, PROMOS_COL, promo.id);
  await setDoc(ref, promo);
}

export async function deletePromoFS(id: string): Promise<void> {
  await deleteDoc(doc(db, PROMOS_COL, id));
}



// --- Hero Slides (kb_heroslides collection) ----------------------------------
export async function loadHeroSlidesFS(): Promise<HeroSlide[]> {
  const snap = await getDocs(collection(db, HERO_COL));
  return snap.docs
    .map(d => ({ ...(d.data() as HeroSlide), id: Number(d.id) }))
    .sort((a, b) => a.id - b.id);
}

export async function saveHeroSlideFS(slide: HeroSlide): Promise<void> {
  await setDoc(doc(db, HERO_COL, String(slide.id)), slide);
}

export async function deleteHeroSlideFS(id: number): Promise<void> {
  await deleteDoc(doc(db, HERO_COL, String(id)));
}

/** Real-time listener - calls cb whenever hero slides change */
export function onHeroSlidesChange(cb: (slides: HeroSlide[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, HERO_COL),
    (snap) => {
      const slides = snap.docs
        .map(d => ({ ...(d.data() as HeroSlide), id: Number(d.id) }))
        .sort((a, b) => a.id - b.id);
      cb(slides);
    },
    (err) => {
      // Aborted streams / network hiccups / permission errors must not surface
      // as unhandled rejections (Next.js dev overlay shows them as AbortError).
      // The storefront gracefully falls back to the built-in default slides.
      console.warn("[hero-slides] listener error:", err?.message ?? err);
    }
  );
}
export async function subscribeNewsletterFS(email: string): Promise<void> {
  const ref = doc(db, NEWSLETTER_COL, email.toLowerCase());
  await setDoc(ref, { email, subscribedAt: new Date().toISOString() });
}

// ─── Admin Whitelist (kb_admins collection) ───────────────────────────────────
export async function loadAllowedAdminsFS(): Promise<string[]> {
  const snap = await getDoc(doc(db, ADMINS_COL, "whitelist"));
  if (snap.exists()) return (snap.data().emails as string[]) || [];
  // No whitelist document found — return empty (admin must create kb_admins/whitelist in Firestore Console)
  return [];
}

export async function saveAllowedAdminsFS(emails: string[]): Promise<void> {
  await setDoc(doc(db, ADMINS_COL, "whitelist"), { emails });
}

export function onAllowedAdminsChange(callback: (emails: string[]) => void): Unsubscribe {
  return onSnapshot(doc(db, ADMINS_COL, "whitelist"), (snap) => {
    if (snap.exists()) callback((snap.data().emails as string[]) || []);
    else callback([]);
  });
}
