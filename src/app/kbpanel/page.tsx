"use client";

import { useState, useEffect, useRef } from "react";
import { products as staticProducts, categories } from "@/lib/products";
import type { Product } from "@/lib/types";

const PASSWORD = "KBadmin2025";
const PROD_KEY = "kb_admin_data";
const ORDER_KEY = "kb_orders";

// ── Types ──────────────────────────────────────────────────────────────────────
interface AdminData {
  overrides: Record<number, Partial<Product>>;
  added: Product[];
  deleted: number[];
}

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

interface OrderItem {
  productId: number;
  name: string;
  price: number;
  qty: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  customer: { name: string; email: string; phone: string; address: string; city: string; state: string; zip: string };
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  tracking?: string;
  notes?: string;
}

// ── Seed orders shown on first load ───────────────────────────────────────────
const SEED_ORDERS: Order[] = [
  {
    id: "KB-2025-0001",
    date: "2025-05-10T09:23:00Z",
    customer: { name: "Sarah Johnson", email: "sarah.j@gmail.com", phone: "212-555-0192", address: "45 Maple Ave", city: "Albany", state: "NY", zip: "12201" },
    items: [
      { productId: 2, name: "Glossy Patent Leather Top Handle Bag", price: 22.50, qty: 1, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80" },
      { productId: 29, name: "Multi Pearl Beaded Bracelet Set", price: 31.66, qty: 2, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&q=80" },
    ],
    total: 85.82,
    status: "Delivered",
    tracking: "9400111899223197854392",
  },
  {
    id: "KB-2025-0002",
    date: "2025-05-11T14:10:00Z",
    customer: { name: "Emily Rodriguez", email: "emily.r@outlook.com", phone: "518-555-0341", address: "112 Pine Street", city: "Troy", state: "NY", zip: "12180" },
    items: [
      { productId: 8, name: "Graffiti Print Faux Leather Crossbody Bag", price: 33.96, qty: 1, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80" },
    ],
    total: 33.96,
    status: "Shipped",
    tracking: "9400111899223197821044",
  },
  {
    id: "KB-2025-0003",
    date: "2025-05-12T11:05:00Z",
    customer: { name: "Maria Chen", email: "mchen@yahoo.com", phone: "646-555-0874", address: "8 Park Blvd, Apt 3B", city: "New York", state: "NY", zip: "10001" },
    items: [
      { productId: 34, name: "Fragrance Mist Spray for Women", price: 29.99, qty: 1, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=200&q=80" },
      { productId: 35, name: "Perfume and Lotion Gift Set for Women", price: 49.00, qty: 1, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80" },
    ],
    total: 78.99,
    status: "Processing",
  },
  {
    id: "KB-2025-0004",
    date: "2025-05-13T08:50:00Z",
    customer: { name: "Lisa Thompson", email: "l.thompson@gmail.com", phone: "914-555-0662", address: "33 Oak Lane", city: "Yonkers", state: "NY", zip: "10701" },
    items: [
      { productId: 15, name: "Rhinestone Crossbody Bag with Coin Purse", price: 49.00, qty: 1, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80" },
      { productId: 30, name: "Faux Straw Wide Brim Sun Hat", price: 49.10, qty: 1, image: "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=200&q=80" },
    ],
    total: 98.10,
    status: "Pending",
  },
  {
    id: "KB-2025-0005",
    date: "2025-05-13T16:30:00Z",
    customer: { name: "Amanda Foster", email: "afoster@hotmail.com", phone: "315-555-0228", address: "71 Elm Drive", city: "Syracuse", state: "NY", zip: "13201" },
    items: [
      { productId: 56, name: "8' Beach Umbrella", price: 42.89, qty: 1, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=80" },
      { productId: 54, name: "Outdoor Picnic Blanket / Beach Mat", price: 42.42, qty: 1, image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=200&q=80" },
    ],
    total: 85.31,
    status: "Pending",
  },
  {
    id: "KB-2025-0006",
    date: "2025-05-14T10:15:00Z",
    customer: { name: "Rachel Kim", email: "r.kim@gmail.com", phone: "917-555-0443", address: "220 West 42nd St, Apt 9A", city: "New York", state: "NY", zip: "10036" },
    items: [
      { productId: 19, name: "Tweed Plaid Tote Bag", price: 69.35, qty: 1, image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=200&q=80" },
    ],
    total: 69.35,
    status: "Cancelled",
    notes: "Customer requested cancellation before shipment.",
  },
];

// ── Storage helpers ────────────────────────────────────────────────────────────
function loadProd(): AdminData {
  try { const r = localStorage.getItem(PROD_KEY); if (r) return JSON.parse(r); } catch {}
  return { overrides: {}, added: [], deleted: [] };
}
function saveProd(d: AdminData) { localStorage.setItem(PROD_KEY, JSON.stringify(d)); }

function loadOrders(): Order[] {
  try { const r = localStorage.getItem(ORDER_KEY); if (r) return JSON.parse(r); } catch {}
  const seeded = SEED_ORDERS;
  localStorage.setItem(ORDER_KEY, JSON.stringify(seeded));
  return seeded;
}
function saveOrders(o: Order[]) { localStorage.setItem(ORDER_KEY, JSON.stringify(o)); }

function mergeAll(d: AdminData): Product[] {
  const base = staticProducts.filter(p => !d.deleted.includes(p.id)).map(p => ({ ...p, ...(d.overrides[p.id] ?? {}) }));
  return [...base, ...d.added];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const BLANK: Omit<Product, "id"> = { name: "", category: "Women's Bags", price: 0, originalPrice: undefined, image: "", description: "", badge: undefined, rating: 4.5, reviews: 0, quantity: 100 };

const BADGE_STYLES: Record<string, string> = { Hot: "bg-red-100 text-red-600", New: "bg-blue-100 text-blue-600", Sale: "bg-amber-100 text-amber-600", Popular: "bg-purple-100 text-purple-600" };

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending:    "bg-amber-100 text-amber-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped:    "bg-purple-100 text-purple-700",
  Delivered:  "bg-green-100 text-green-700",
  Cancelled:  "bg-red-100 text-red-600",
};

const STATUS_FLOW: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  // Products state
  const [prodData, setProdData] = useState<AdminData>({ overrides: {}, added: [], deleted: [] });
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(BLANK);
  const [imgMode, setImgMode] = useState<"url" | "upload">("url");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | "All">("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  // Nav
  type Page = "dashboard" | "products" | "add" | "orders" | "order-detail";
  const [page, setPage] = useState<Page>("dashboard");
  const [toast, setToast] = useState("");

  useEffect(() => { if (sessionStorage.getItem("kb_auth") === "1") setAuthed(true); }, []);

  useEffect(() => {
    if (!authed) return;
    const d = loadProd(); setProdData(d); setAllProducts(mergeAll(d));
    setOrders(loadOrders());
  }, [authed]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  function login() {
    if (pw === PASSWORD) { sessionStorage.setItem("kb_auth", "1"); setAuthed(true); }
    else setPwError(true);
  }

  // Product helpers
  function updateProd(d: AdminData) { setProdData(d); saveProd(d); setAllProducts(mergeAll(d)); }

  function openAdd() { setEditing(null); setForm(BLANK); setImgMode("url"); setPage("add"); }
  function openEdit(p: Product) { setEditing(p); setForm({ ...p }); setImgMode("url"); setPage("add"); }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader(); r.onload = () => setForm(f => ({ ...f, image: r.result as string })); r.readAsDataURL(file);
  }

  function handleSaveProd() {
    if (!form.name.trim() || !form.price) { showToast("Name and price are required."); return; }
    if (editing) {
      const isStatic = staticProducts.some(p => p.id === editing.id);
      if (isStatic) updateProd({ ...prodData, overrides: { ...prodData.overrides, [editing.id]: form } });
      else updateProd({ ...prodData, added: prodData.added.map(p => p.id === editing.id ? { ...form, id: editing.id } : p) });
    } else {
      const newId = Math.max(...allProducts.map(p => p.id), 1000) + 1;
      updateProd({ ...prodData, added: [...prodData.added, { ...form, id: newId }] });
    }
    showToast(editing ? "Product updated." : "Product added."); setPage("products"); setEditing(null);
  }

  function handleDeleteProd(id: number) {
    if (staticProducts.some(p => p.id === id)) updateProd({ ...prodData, deleted: [...prodData.deleted, id] });
    else updateProd({ ...prodData, added: prodData.added.filter(p => p.id !== id) });
    setDeleteId(null); showToast("Product hidden.");
  }

  // Order helpers
  function updateOrders(o: Order[]) { setOrders(o); saveOrders(o); }

  function setOrderStatus(id: string, status: OrderStatus) {
    updateOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null);
    showToast(`Order ${id} marked as ${status}.`);
  }

  function saveOrderDetails() {
    if (!selectedOrder) return;
    updateOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, tracking: trackingInput || undefined, notes: notesInput || undefined } : o));
    setSelectedOrder(prev => prev ? { ...prev, tracking: trackingInput || undefined, notes: notesInput || undefined } : null);
    showToast("Order updated.");
  }

  function openOrder(o: Order) {
    setSelectedOrder(o); setTrackingInput(o.tracking ?? ""); setNotesInput(o.notes ?? ""); setPage("order-detail");
  }

  function exportOrders() {
    const blob = new Blob([JSON.stringify(orders, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "orders.json"; a.click(); URL.revokeObjectURL(url);
  }

  const filteredProducts = allProducts.filter(p => {
    return (catFilter === "All" || p.category === catFilter) && (!search || p.name.toLowerCase().includes(search.toLowerCase()));
  });

  const filteredOrders = orders.filter(o => {
    const matchStatus = orderStatusFilter === "All" || o.status === orderStatusFilter;
    const matchSearch = !orderSearch || o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) || o.customer.email.toLowerCase().includes(orderSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    shipped: orders.filter(o => o.status === "Shipped").length,
    revenue: orders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0),
  };

  // ── LOGIN ────────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-11 h-11 flex-shrink-0">
              <rect width="32" height="32" rx="7" fill="#f43f5e"/><rect x="16" width="16" height="32" fill="#18181b"/>
              <text x="2" y="23" fontFamily="Arial Black, Arial, sans-serif" fontSize="15" fontWeight="900" fill="white">K</text>
              <text x="17" y="23" fontFamily="Arial Black, Arial, sans-serif" fontSize="15" fontWeight="900" fill="white">B</text>
            </svg>
            <div><p className="font-bold text-zinc-900 text-lg leading-tight">KB Admin Panel</p><p className="text-xs text-zinc-400">Kareem Baksh Store</p></div>
          </div>
          <p className="text-sm font-medium text-zinc-700 mb-2">Admin Password</p>
          <input type="password" value={pw} onChange={e => { setPw(e.target.value); setPwError(false); }} onKeyDown={e => e.key === "Enter" && login()} placeholder="Enter password"
            className={`w-full border rounded-xl px-4 py-3 text-sm mb-1 focus:outline-none focus:ring-2 ${pwError ? "border-red-400 focus:ring-red-300" : "border-zinc-300 focus:ring-rose-400"}`} />
          {pwError && <p className="text-red-500 text-xs mb-3">Incorrect password.</p>}
          {!pwError && <div className="mb-3" />}
          <button onClick={login} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-colors">Sign In</button>
        </div>
      </div>
    );
  }

  // ── LAYOUT ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">

      {/* Header */}
      <header className="bg-zinc-900 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-8 h-8 flex-shrink-0">
            <rect width="32" height="32" rx="7" fill="#f43f5e"/><rect x="16" width="16" height="32" fill="#18181b"/>
            <text x="2" y="23" fontFamily="Arial Black, Arial, sans-serif" fontSize="15" fontWeight="900" fill="white">K</text>
            <text x="17" y="23" fontFamily="Arial Black, Arial, sans-serif" fontSize="15" fontWeight="900" fill="white">B</text>
          </svg>
          <span className="font-bold text-base">KB Admin Panel</span>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <a href="/" target="_blank" className="text-zinc-400 hover:text-white transition-colors">View Store ↗</a>
          <button onClick={() => { sessionStorage.removeItem("kb_auth"); setAuthed(false); }} className="text-zinc-400 hover:text-white transition-colors">Sign Out</button>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">{toast}</div>
      )}

      <div className="flex flex-1">

        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-zinc-200 flex-shrink-0 hidden md:flex flex-col pt-6 pb-4 px-3">
          <nav className="space-y-1">
            {[
              { key: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { key: "products", label: "Products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
              { key: "orders", label: "Orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
            ].map(({ key, label, icon }) => (
              <button key={key} onClick={() => setPage(key as Page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${(page === key || (page === "add" && key === "products") || (page === "order-detail" && key === "orders")) ? "bg-rose-50 text-rose-600" : "text-zinc-600 hover:bg-zinc-50"}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
                {label}
                {key === "orders" && orderStats.pending > 0 && (
                  <span className="ml-auto bg-amber-400 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{orderStats.pending}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-1 pt-4 border-t border-zinc-100">
            <button onClick={() => { const b = new Blob([JSON.stringify(allProducts, null, 2)], { type: "application/json" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "products.json"; a.click(); URL.revokeObjectURL(u); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export Products
            </button>
            <button onClick={exportOrders}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export Orders
            </button>
            <button onClick={() => { updateProd({ overrides: {}, added: [], deleted: [] }); showToast("Products reset."); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Reset to Defaults
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 overflow-auto">

          {/* ── DASHBOARD ──────────────────────────────────────────────── */}
          {page === "dashboard" && (
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-6">Dashboard</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Products", value: allProducts.length, color: "text-zinc-900", bg: "bg-zinc-100", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
                  { label: "Total Orders", value: orderStats.total, color: "text-blue-600", bg: "bg-blue-50", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
                  { label: "Pending Orders", value: orderStats.pending, color: "text-amber-600", bg: "bg-amber-50", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                  { label: "Total Revenue", value: `$${orderStats.revenue.toFixed(2)}`, color: "text-green-600", bg: "bg-green-50", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                ].map(({ label, value, color, bg, icon }) => (
                  <div key={label} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                      <svg className={`w-5 h-5 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
                    </div>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-zinc-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders on dashboard */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                  <h3 className="font-bold text-zinc-900">Recent Orders</h3>
                  <button onClick={() => setPage("orders")} className="text-xs text-rose-500 hover:text-rose-600 font-semibold">View all →</button>
                </div>
                <div className="divide-y divide-zinc-50">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center justify-between px-6 py-3 hover:bg-zinc-50 cursor-pointer transition-colors" onClick={() => openOrder(o)}>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{o.customer.name}</p>
                        <p className="text-xs text-zinc-400">{o.id} · {fmt(o.date)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-zinc-900">${o.total.toFixed(2)}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTS LIST ───────────────────────────────────────────── */}
          {page === "products" && (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full border border-zinc-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="border border-zinc-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
                <button onClick={openAdd} className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 whitespace-nowrap">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Product
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Product</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Price</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Stock</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Badge</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200">
                                {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-zinc-900 text-xs leading-snug truncate max-w-[180px]">{p.name}</p>
                                <p className="text-zinc-400 text-xs">#{p.id}{prodData.added.some(a => a.id === p.id) && <span className="text-blue-500 ml-1">• New</span>}{prodData.overrides[p.id] && <span className="text-amber-500 ml-1">• Edited</span>}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">{p.category}</td>
                          <td className="px-4 py-3"><p className="font-semibold text-zinc-900 text-sm">${p.price.toFixed(2)}</p>{p.originalPrice && <p className="line-through text-zinc-400 text-xs">${p.originalPrice.toFixed(2)}</p>}</td>
                          <td className="px-4 py-3 text-xs text-zinc-600">{p.quantity?.toLocaleString()}</td>
                          <td className="px-4 py-3">{p.badge && <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${BADGE_STYLES[p.badge] ?? ""}`}>{p.badge}</span>}</td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openEdit(p)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                              <button onClick={() => setDeleteId(p.id)} className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">Hide</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-zinc-400 text-sm">No products match your search.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50 text-xs text-zinc-400">Showing {filteredProducts.length} of {allProducts.length} products</div>
              </div>
            </>
          )}

          {/* ── ADD / EDIT PRODUCT ──────────────────────────────────────── */}
          {page === "add" && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => { setPage("products"); setEditing(null); }} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="text-xl font-bold text-zinc-900">{editing ? "Edit Product" : "Add New Product"}</h2>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                {/* Image */}
                <div className="p-6 border-b border-zinc-100">
                  <p className="text-sm font-semibold text-zinc-800 mb-3">Product Image</p>
                  <div className="flex gap-2 mb-4">
                    <button onClick={() => setImgMode("url")} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${imgMode === "url" ? "bg-rose-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>Image URL</button>
                    <button onClick={() => setImgMode("upload")} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${imgMode === "upload" ? "bg-rose-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>Upload File</button>
                  </div>
                  <div className="flex gap-5 items-start">
                    <div className="flex-1">
                      {imgMode === "url"
                        ? <input type="text" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://images.unsplash.com/..." className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                        : <div><input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" /><button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-zinc-300 rounded-xl py-8 text-sm text-zinc-400 hover:border-rose-400 hover:text-rose-400 transition-colors flex flex-col items-center gap-2"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Click to upload</button></div>
                      }
                    </div>
                    {form.image && <img src={form.image} alt="preview" className="w-28 h-28 object-cover rounded-xl border border-zinc-200 flex-shrink-0" />}
                  </div>
                </div>

                {/* Core fields */}
                <div className="p-6 border-b border-zinc-100 space-y-5">
                  <p className="text-sm font-semibold text-zinc-800">Product Details</p>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Quilted Faux Leather Shoulder Bag" className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">Category <span className="text-red-500">*</span></label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
                      {categories.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">Description</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Write a detailed product description..." className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
                  </div>
                </div>

                {/* Pricing */}
                <div className="p-6 border-b border-zinc-100 space-y-5">
                  <p className="text-sm font-semibold text-zinc-800">Pricing & Inventory</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">Price (USD) <span className="text-red-500">*</span></label>
                      <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span><input type="number" step="0.01" min="0" value={form.price || ""} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} className="w-full border border-zinc-300 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" /></div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">Original Price (sale)</label>
                      <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span><input type="number" step="0.01" min="0" value={form.originalPrice || ""} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined }))} placeholder="Optional" className="w-full border border-zinc-300 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" /></div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">Stock Quantity</label>
                      <input type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">Badge</label>
                      <select value={form.badge ?? ""} onChange={e => setForm(f => ({ ...f, badge: (e.target.value as Product["badge"]) || undefined }))} className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
                        <option value="">No Badge</option><option>New</option><option>Sale</option><option>Popular</option><option>Hot</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ratings */}
                <div className="p-6 border-b border-zinc-100 space-y-5">
                  <p className="text-sm font-semibold text-zinc-800">Ratings</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">Rating (1.0–5.0)</label>
                      <input type="number" step="0.1" min="1" max="5" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: parseFloat(e.target.value) || 4.5 }))} className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">Number of Reviews</label>
                      <input type="number" min="0" value={form.reviews} onChange={e => setForm(f => ({ ...f, reviews: parseInt(e.target.value) || 0 }))} className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                    </div>
                  </div>
                </div>

                <div className="p-6 flex gap-3 justify-end bg-zinc-50">
                  <button onClick={() => { setPage("products"); setEditing(null); }} className="px-6 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors">Cancel</button>
                  <button onClick={handleSaveProd} className="px-8 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-colors shadow-sm">{editing ? "Save Changes" : "Add Product"}</button>
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS LIST ─────────────────────────────────────────────── */}
          {page === "orders" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {(["All", "Pending", "Processing", "Shipped", "Delivered"] as const).map(s => {
                  const count = s === "All" ? orders.length : orders.filter(o => o.status === s).length;
                  return (
                    <button key={s} onClick={() => setOrderStatusFilter(s)}
                      className={`rounded-xl p-4 text-left border transition-all ${orderStatusFilter === s ? "border-rose-300 bg-rose-50" : "border-zinc-200 bg-white hover:border-zinc-300"}`}>
                      <p className={`text-2xl font-bold ${s === "All" ? "text-zinc-900" : STATUS_STYLES[s as OrderStatus].split(" ")[1]}`}>{count}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{s === "All" ? "All Orders" : s}</p>
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Search by order ID, customer name or email..." className="w-full border border-zinc-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Order</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Customer</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Items</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredOrders.map(o => (
                        <tr key={o.id} className="hover:bg-zinc-50 transition-colors cursor-pointer" onClick={() => openOrder(o)}>
                          <td className="px-5 py-3">
                            <p className="font-mono text-xs font-semibold text-zinc-900">{o.id}</p>
                            {o.tracking && <p className="text-xs text-zinc-400 truncate max-w-[120px]">🚚 {o.tracking}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-zinc-900 text-xs">{o.customer.name}</p>
                            <p className="text-zinc-400 text-xs">{o.customer.email}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">{fmt(o.date)}</td>
                          <td className="px-4 py-3 text-xs text-zinc-600">{o.items.length} item{o.items.length !== 1 ? "s" : ""}</td>
                          <td className="px-4 py-3 font-semibold text-zinc-900">${o.total.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                          </td>
                          <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                            <select value={o.status} onChange={e => setOrderStatus(o.id, e.target.value as OrderStatus)}
                              className="text-xs border border-zinc-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white">
                              {STATUS_FLOW.map(s => <option key={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-zinc-400 text-sm">No orders found.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50 text-xs text-zinc-400">Showing {filteredOrders.length} of {orders.length} orders</div>
              </div>
            </>
          )}

          {/* ── ORDER DETAIL ────────────────────────────────────────────── */}
          {page === "order-detail" && selectedOrder && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setPage("orders")} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-zinc-900">{selectedOrder.id}</h2>
                  <p className="text-sm text-zinc-400">{fmt(selectedOrder.date)}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${STATUS_STYLES[selectedOrder.status]}`}>{selectedOrder.status}</span>
              </div>

              <div className="space-y-5">
                {/* Status control */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                  <p className="text-sm font-semibold text-zinc-800 mb-4">Update Order Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_FLOW.map(s => (
                      <button key={s} onClick={() => setOrderStatus(selectedOrder.id, s)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${selectedOrder.status === s ? STATUS_STYLES[s] + " border-transparent" : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                  <p className="text-sm font-semibold text-zinc-800 mb-4">Customer Information</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-xs text-zinc-400 mb-0.5">Name</p><p className="font-medium text-zinc-900">{selectedOrder.customer.name}</p></div>
                    <div><p className="text-xs text-zinc-400 mb-0.5">Email</p><a href={`mailto:${selectedOrder.customer.email}`} className="font-medium text-rose-500 hover:underline">{selectedOrder.customer.email}</a></div>
                    <div><p className="text-xs text-zinc-400 mb-0.5">Phone</p><p className="font-medium text-zinc-900">{selectedOrder.customer.phone}</p></div>
                    <div><p className="text-xs text-zinc-400 mb-0.5">Ship To</p><p className="font-medium text-zinc-900">{selectedOrder.customer.address}, {selectedOrder.customer.city}, {selectedOrder.customer.state} {selectedOrder.customer.zip}</p></div>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                  <p className="text-sm font-semibold text-zinc-800 px-6 py-4 border-b border-zinc-100">Order Items</p>
                  <div className="divide-y divide-zinc-50">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 px-6 py-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-900 text-sm truncate">{item.name}</p>
                          <p className="text-xs text-zinc-400">Qty: {item.qty} × ${item.price.toFixed(2)}</p>
                        </div>
                        <p className="font-semibold text-zinc-900 text-sm flex-shrink-0">${(item.price * item.qty).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50">
                    <span className="font-bold text-zinc-900">Total</span>
                    <span className="font-bold text-zinc-900 text-lg">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Tracking & Notes */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-5">
                  <p className="text-sm font-semibold text-zinc-800">Shipping & Notes</p>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">USPS Tracking Number</label>
                    <input type="text" value={trackingInput} onChange={e => setTrackingInput(e.target.value)} placeholder="e.g. 9400111899223197854392" className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">Internal Notes</label>
                    <textarea value={notesInput} onChange={e => setNotesInput(e.target.value)} rows={3} placeholder="Any notes about this order..." className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
                  </div>
                  <button onClick={saveOrderDetails} className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">Save Changes</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Delete product confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            </div>
            <h3 className="font-bold text-zinc-900 text-lg mb-2">Hide This Product?</h3>
            <p className="text-sm text-zinc-500 mb-6">The product will be hidden from the store. Reset to defaults to restore it.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
              <button onClick={() => handleDeleteProd(deleteId)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors">Hide</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
