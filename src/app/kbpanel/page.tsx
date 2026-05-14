"use client";

import { useState, useEffect, useRef } from "react";
import { products as staticProducts, categories } from "@/lib/products";
import type { Product } from "@/lib/types";

const PASSWORD = "KBadmin2025";
const STORAGE_KEY = "kb_admin_data";

interface AdminData {
  overrides: Record<number, Partial<Product>>;
  added: Product[];
  deleted: number[];
}

function loadData(): AdminData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { overrides: {}, added: [], deleted: [] };
}

function saveData(data: AdminData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function mergeAll(data: AdminData): Product[] {
  const base = staticProducts
    .filter((p) => !data.deleted.includes(p.id))
    .map((p) => ({ ...p, ...(data.overrides[p.id] ?? {}) }));
  return [...base, ...data.added];
}

const BLANK: Omit<Product, "id"> = {
  name: "",
  category: "Women's Bags",
  price: 0,
  originalPrice: undefined,
  image: "",
  description: "",
  badge: undefined,
  rating: 4.5,
  reviews: 0,
  quantity: 100,
};

const BADGE_STYLES: Record<string, string> = {
  Hot: "bg-red-100 text-red-600",
  New: "bg-blue-100 text-blue-600",
  Sale: "bg-amber-100 text-amber-600",
  Popular: "bg-purple-100 text-purple-600",
};

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  const [data, setData] = useState<AdminData>({ overrides: {}, added: [], deleted: [] });
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [activePage, setActivePage] = useState<"products" | "add">("products");

  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(BLANK);
  const [imgMode, setImgMode] = useState<"url" | "upload">("url");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("kb_auth") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    const d = loadData();
    setData(d);
    setAllProducts(mergeAll(d));
  }, [authed]);

  function update(d: AdminData) {
    setData(d);
    saveData(d);
    setAllProducts(mergeAll(d));
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function login() {
    if (pw === PASSWORD) {
      sessionStorage.setItem("kb_auth", "1");
      setAuthed(true);
    } else {
      setPwError(true);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm(BLANK);
    setImgMode("url");
    setActivePage("add");
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({ ...p });
    setImgMode("url");
    setActivePage("add");
  }

  function cancelForm() {
    setActivePage("products");
    setEditing(null);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!form.name.trim() || !form.price) {
      showToast("Name and price are required.");
      return;
    }
    if (editing) {
      const isStatic = staticProducts.some((p) => p.id === editing.id);
      if (isStatic) {
        update({ ...data, overrides: { ...data.overrides, [editing.id]: form } });
      } else {
        update({ ...data, added: data.added.map((p) => (p.id === editing.id ? { ...form, id: editing.id } : p)) });
      }
      showToast("Product updated.");
    } else {
      const newId = Math.max(...allProducts.map((p) => p.id), 1000) + 1;
      update({ ...data, added: [...data.added, { ...form, id: newId }] });
      showToast("Product added.");
    }
    setActivePage("products");
    setEditing(null);
  }

  function handleDelete(id: number) {
    if (staticProducts.some((p) => p.id === id)) {
      update({ ...data, deleted: [...data.deleted, id] });
    } else {
      update({ ...data, added: data.added.filter((p) => p.id !== id) });
    }
    setDeleteId(null);
    showToast("Product deleted.");
  }

  function restoreAll() {
    update({ overrides: {}, added: [], deleted: [] });
    showToast("All changes reset to defaults.");
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(allProducts, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = allProducts.filter((p) => {
    const mc = catFilter === "All" || p.category === catFilter;
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-11 h-11 flex-shrink-0">
              <rect width="32" height="32" rx="7" fill="#f43f5e" />
              <rect x="16" width="16" height="32" fill="#18181b" />
              <text x="2" y="23" fontFamily="Arial Black, Arial, sans-serif" fontSize="15" fontWeight="900" fill="white">K</text>
              <text x="17" y="23" fontFamily="Arial Black, Arial, sans-serif" fontSize="15" fontWeight="900" fill="white">B</text>
            </svg>
            <div>
              <p className="font-bold text-zinc-900 text-lg leading-tight">KB Admin Panel</p>
              <p className="text-xs text-zinc-400">Kareem Baksh Store</p>
            </div>
          </div>
          <p className="text-sm font-medium text-zinc-700 mb-2">Admin Password</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setPwError(false); }}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Enter password"
            className={`w-full border rounded-xl px-4 py-3 text-sm mb-1 focus:outline-none focus:ring-2 ${pwError ? "border-red-400 focus:ring-red-300" : "border-zinc-300 focus:ring-rose-400"}`}
          />
          {pwError && <p className="text-red-500 text-xs mb-3">Incorrect password. Try again.</p>}
          {!pwError && <div className="mb-3" />}
          <button onClick={login} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // ── ADMIN LAYOUT ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">

      {/* Header */}
      <header className="bg-zinc-900 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-8 h-8 flex-shrink-0">
            <rect width="32" height="32" rx="7" fill="#f43f5e" />
            <rect x="16" width="16" height="32" fill="#18181b" />
            <text x="2" y="23" fontFamily="Arial Black, Arial, sans-serif" fontSize="15" fontWeight="900" fill="white">K</text>
            <text x="17" y="23" fontFamily="Arial Black, Arial, sans-serif" fontSize="15" fontWeight="900" fill="white">B</text>
          </svg>
          <span className="font-bold text-base">KB Admin Panel</span>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <a href="/" target="_blank" className="text-zinc-400 hover:text-white transition-colors">
            View Store ↗
          </a>
          <button
            onClick={() => { sessionStorage.removeItem("kb_auth"); setAuthed(false); }}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex flex-1">

        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-zinc-200 flex-shrink-0 hidden md:flex flex-col pt-6 pb-4 px-3">
          <nav className="space-y-1">
            {[
              { key: "products", label: "All Products", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
              { key: "add", label: editing ? "Edit Product" : "Add Product", icon: "M12 4v16m8-8H4" },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => key === "add" ? openAdd() : setActivePage("products")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activePage === key ? "bg-rose-50 text-rose-600" : "text-zinc-600 hover:bg-zinc-50"}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-2 pt-4 border-t border-zinc-100">
            <button onClick={exportJSON} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export JSON
            </button>
            <button onClick={restoreAll} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset to Defaults
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Products", value: allProducts.length, color: "text-zinc-900" },
              { label: "Admin Added", value: data.added.length, color: "text-blue-600" },
              { label: "Overrides", value: Object.keys(data.overrides).length, color: "text-amber-600" },
              { label: "Hidden", value: data.deleted.length, color: "text-red-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-zinc-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* ── PRODUCT LIST PAGE ─────────────────────────────────────── */}
          {activePage === "products" && (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full border border-zinc-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  className="border border-zinc-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
                <button
                  onClick={openAdd}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
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
                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rating</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Badge</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filtered.map((p) => {
                        const isOverridden = !!data.overrides[p.id];
                        const isNew = data.added.some((a) => a.id === p.id);
                        return (
                          <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200">
                                  {p.image && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-zinc-900 text-xs leading-snug truncate max-w-[180px]">{p.name}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <p className="text-zinc-400 text-xs">#{p.id}</p>
                                    {isNew && <span className="text-blue-500 text-xs font-medium">• New</span>}
                                    {isOverridden && <span className="text-amber-500 text-xs font-medium">• Edited</span>}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">{p.category}</td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-zinc-900 text-sm">${p.price.toFixed(2)}</p>
                              {p.originalPrice && <p className="line-through text-zinc-400 text-xs">${p.originalPrice.toFixed(2)}</p>}
                            </td>
                            <td className="px-4 py-3 text-xs text-zinc-600">{p.quantity?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-xs text-zinc-600">
                              <span className="text-amber-400">★</span> {p.rating} <span className="text-zinc-400">({p.reviews})</span>
                            </td>
                            <td className="px-4 py-3">
                              {p.badge && (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${BADGE_STYLES[p.badge] ?? ""}`}>
                                  {p.badge}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEdit(p)}
                                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => setDeleteId(p.id)}
                                  className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  Hide
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center text-zinc-400 text-sm">
                            No products match your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50 flex justify-between text-xs text-zinc-400">
                  <span>Showing {filtered.length} of {allProducts.length} products</span>
                  <span>Changes saved to browser storage</span>
                </div>
              </div>
            </>
          )}

          {/* ── ADD / EDIT PRODUCT PAGE ───────────────────────────────── */}
          {activePage === "add" && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={cancelForm} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold text-zinc-900">{editing ? "Edit Product" : "Add New Product"}</h2>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">

                {/* Image section */}
                <div className="p-6 border-b border-zinc-100">
                  <p className="text-sm font-semibold text-zinc-800 mb-3">Product Image</p>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setImgMode("url")}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${imgMode === "url" ? "bg-rose-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                    >
                      Image URL
                    </button>
                    <button
                      onClick={() => setImgMode("upload")}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${imgMode === "upload" ? "bg-rose-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                    >
                      Upload File
                    </button>
                  </div>

                  <div className="flex gap-5 items-start">
                    <div className="flex-1">
                      {imgMode === "url" ? (
                        <input
                          type="text"
                          value={form.image}
                          onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                          placeholder="https://images.unsplash.com/photo-...?w=600&q=80"
                          className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      ) : (
                        <div>
                          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                          <button
                            onClick={() => fileRef.current?.click()}
                            className="w-full border-2 border-dashed border-zinc-300 rounded-xl py-8 text-sm text-zinc-400 hover:border-rose-400 hover:text-rose-400 transition-colors flex flex-col items-center gap-2"
                          >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Click to upload image
                          </button>
                        </div>
                      )}
                    </div>
                    {form.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.image} alt="preview" className="w-28 h-28 object-cover rounded-xl border border-zinc-200 flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* Core fields */}
                <div className="p-6 border-b border-zinc-100 space-y-5">
                  <p className="text-sm font-semibold text-zinc-800">Product Details</p>

                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Quilted Faux Leather Shoulder Bag"
                      className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">Category <span className="text-red-500">*</span></label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      {categories.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      rows={4}
                      placeholder="Write a detailed product description..."
                      className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="p-6 border-b border-zinc-100 space-y-5">
                  <p className="text-sm font-semibold text-zinc-800">Pricing & Inventory</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">Price (USD) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.price || ""}
                          onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                          className="w-full border border-zinc-300 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">Original Price (for Sale badge)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.originalPrice || ""}
                          onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined }))}
                          placeholder="Optional"
                          className="w-full border border-zinc-300 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">Stock Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={form.quantity}
                        onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 0 }))}
                        className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">Badge</label>
                      <select
                        value={form.badge ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, badge: (e.target.value as Product["badge"]) || undefined }))}
                        className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                      >
                        <option value="">No Badge</option>
                        <option>New</option>
                        <option>Sale</option>
                        <option>Popular</option>
                        <option>Hot</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ratings */}
                <div className="p-6 border-b border-zinc-100 space-y-5">
                  <p className="text-sm font-semibold text-zinc-800">Ratings & Reviews</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">Rating (1.0 – 5.0)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={form.rating}
                        onChange={(e) => setForm((f) => ({ ...f, rating: parseFloat(e.target.value) || 4.5 }))}
                        className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">Number of Reviews</label>
                      <input
                        type="number"
                        min="0"
                        value={form.reviews}
                        onChange={(e) => setForm((f) => ({ ...f, reviews: parseInt(e.target.value) || 0 }))}
                        className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 flex gap-3 justify-end bg-zinc-50">
                  <button
                    onClick={cancelForm}
                    className="px-6 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-8 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-colors shadow-sm"
                  >
                    {editing ? "Save Changes" : "Add Product"}
                  </button>
                </div>
              </div>

              <p className="text-xs text-zinc-400 text-center mt-4">
                Changes are saved to this browser. Use "Export JSON" in the sidebar to download the full product list.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Delete confirm dialog */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="font-bold text-zinc-900 text-lg mb-2">Hide This Product?</h3>
            <p className="text-sm text-zinc-500 mb-6">
              The product will be hidden from the store. You can restore it by clicking "Reset to Defaults" in the sidebar.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors"
              >
                Hide Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
