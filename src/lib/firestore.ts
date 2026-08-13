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
import type { Product, Review, ReviewStatus } from "./types";

// ─── Collection names ───────────────────────────────────────────────────────
const ADMIN_COL   = "kb_admin_data";
const ORDERS_COL  = "kb_orders";
const REVIEWS_COL = "kb_reviews";
const PROMOS_COL  = "kb_promos";
const CATS_COL    = "kb_categories";

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

// ─── Categories ──────────────────────────────────────────────────────────────
export interface CategoryMeta { image: string; desc: string; media?: string[]; }

export async function loadCategoriesFS(): Promise<{ list: string[]; meta: Record<string,CategoryMeta> }> {
  const snap = await getDocs(collection(db, CATS_COL));
  const list: string[] = [];
  const meta: Record<string,CategoryMeta> = {};
  snap.docs.forEach(d => {
    list.push(d.id);
    meta[d.id] = d.data() as CategoryMeta;
  });
  return { list, meta };
}

export async function saveCategoryFS(name: string, data: CategoryMeta): Promise<void> {
  await setDoc(doc(db, CATS_COL, name), data);
}

export async function deleteCategoryFS(name: string): Promise<void> {
  await deleteDoc(doc(db, CATS_COL, name));
}
