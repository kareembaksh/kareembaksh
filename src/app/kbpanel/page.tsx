"use client";

import { useState, useEffect, useRef } from "react";
import { products as staticProducts, categories } from "@/lib/products";
import type { Product } from "@/lib/types";

const PASSWORD = "KBadmin2025";
const PROD_KEY  = "kb_admin_data";
const ORDER_KEY = "kb_orders";
const REV_KEY   = "kb_reviews";

// ── Types ──────────────────────────────────────────────────────────────────────
interface AdminData {
  overrides: Record<number, Partial<Product>>;
  added: Product[];
  deleted: number[];
}

type OrderStatus  = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
type ReviewStatus = "Pending" | "Approved" | "Rejected";

interface OrderItem { productId: number; name: string; price: number; qty: number; image: string; }

interface Order {
  id: string; date: string;
  customer: { name: string; email: string; phone: string; address: string; city: string; state: string; zip: string };
  items: OrderItem[]; total: number; status: OrderStatus; tracking?: string; notes?: string;
}

interface Review {
  id: string; date: string;
  productId: number; productName: string;
  author: string; email: string;
  rating: number; title: string; body: string;
  status: ReviewStatus;
  reply?: string;
}

// ── CSV helpers ────────────────────────────────────────────────────────────────
function csvEscape(v: unknown): string {
  const s = String(v ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}
function downloadCSV(filename: string, rows: unknown[][]) {
  const content = rows.map(r => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportProductsCSV(prods: Product[]) {
  const header = ["ID","Name","Category","Price","Original Price","Badge","Rating","Reviews","Stock","Description"];
  const rows   = prods.map(p => [p.id, p.name, p.category, p.price, p.originalPrice ?? "", p.badge ?? "", p.rating, p.reviews, p.quantity, p.description]);
  downloadCSV("kb_products.csv", [header, ...rows]);
}

function exportOrdersCSV(orders: Order[]) {
  const header = ["Order ID","Date","Customer","Email","Phone","Address","City","State","ZIP","Items","Total","Status","Tracking","Notes"];
  const rows   = orders.map(o => [
    o.id, o.date, o.customer.name, o.customer.email, o.customer.phone,
    o.customer.address, o.customer.city, o.customer.state, o.customer.zip,
    o.items.map(i => `${i.qty}x ${i.name}`).join(" | "),
    o.total, o.status, o.tracking ?? "", o.notes ?? "",
  ]);
  downloadCSV("kb_orders.csv", [header, ...rows]);
}

function exportReviewsCSV(reviews: Review[]) {
  const header = ["ID","Date","Product ID","Product","Author","Email","Rating","Title","Review","Status","Reply"];
  const rows   = reviews.map(r => [r.id, r.date, r.productId, r.productName, r.author, r.email, r.rating, r.title, r.body, r.status, r.reply ?? ""]);
  downloadCSV("kb_reviews.csv", [header, ...rows]);
}

// ── Seed data ──────────────────────────────────────────────────────────────────
const SEED_ORDERS: Order[] = [
  { id:"KB-2025-0001", date:"2025-05-10T09:23:00Z", customer:{name:"Sarah Johnson",email:"sarah.j@gmail.com",phone:"212-555-0192",address:"45 Maple Ave",city:"Albany",state:"NY",zip:"12201"}, items:[{productId:2,name:"Glossy Patent Leather Top Handle Bag",price:22.50,qty:1,image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80"},{productId:29,name:"Multi Pearl Beaded Bracelet Set",price:31.66,qty:2,image:"https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&q=80"}], total:85.82, status:"Delivered", tracking:"9400111899223197854392" },
  { id:"KB-2025-0002", date:"2025-05-11T14:10:00Z", customer:{name:"Emily Rodriguez",email:"emily.r@outlook.com",phone:"518-555-0341",address:"112 Pine Street",city:"Troy",state:"NY",zip:"12180"}, items:[{productId:8,name:"Graffiti Print Faux Leather Crossbody Bag",price:33.96,qty:1,image:"https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80"}], total:33.96, status:"Shipped", tracking:"9400111899223197821044" },
  { id:"KB-2025-0003", date:"2025-05-12T11:05:00Z", customer:{name:"Maria Chen",email:"mchen@yahoo.com",phone:"646-555-0874",address:"8 Park Blvd, Apt 3B",city:"New York",state:"NY",zip:"10001"}, items:[{productId:34,name:"Fragrance Mist Spray for Women",price:29.99,qty:1,image:"https://images.unsplash.com/photo-1594035910387-fea47794261f?w=200&q=80"},{productId:35,name:"Perfume and Lotion Gift Set for Women",price:49.00,qty:1,image:"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80"}], total:78.99, status:"Processing" },
  { id:"KB-2025-0004", date:"2025-05-13T08:50:00Z", customer:{name:"Lisa Thompson",email:"l.thompson@gmail.com",phone:"914-555-0662",address:"33 Oak Lane",city:"Yonkers",state:"NY",zip:"10701"}, items:[{productId:15,name:"Rhinestone Crossbody Bag with Coin Purse",price:49.00,qty:1,image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80"},{productId:30,name:"Faux Straw Wide Brim Sun Hat",price:49.10,qty:1,image:"https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=200&q=80"}], total:98.10, status:"Pending" },
  { id:"KB-2025-0005", date:"2025-05-13T16:30:00Z", customer:{name:"Amanda Foster",email:"afoster@hotmail.com",phone:"315-555-0228",address:"71 Elm Drive",city:"Syracuse",state:"NY",zip:"13201"}, items:[{productId:56,name:"8' Beach Umbrella",price:42.89,qty:1,image:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=80"},{productId:54,name:"Outdoor Picnic Blanket / Beach Mat",price:42.42,qty:1,image:"https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=200&q=80"}], total:85.31, status:"Pending" },
  { id:"KB-2025-0006", date:"2025-05-14T10:15:00Z", customer:{name:"Rachel Kim",email:"r.kim@gmail.com",phone:"917-555-0443",address:"220 West 42nd St, Apt 9A",city:"New York",state:"NY",zip:"10036"}, items:[{productId:19,name:"Tweed Plaid Tote Bag",price:69.35,qty:1,image:"https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=200&q=80"}], total:69.35, status:"Cancelled", notes:"Customer requested cancellation before shipment." },
];

const SEED_REVIEWS: Review[] = [
  { id:"REV-001", date:"2025-05-08T10:12:00Z", productId:2, productName:"Glossy Patent Leather Top Handle Bag", author:"Sarah Johnson", email:"sarah.j@gmail.com", rating:5, title:"Absolutely love it!", body:"This bag is even more beautiful in person. The leather feels premium and the top handle is very sturdy. I've gotten so many compliments on it!", status:"Approved" },
  { id:"REV-002", date:"2025-05-09T14:30:00Z", productId:8, productName:"Graffiti Print Faux Leather Crossbody Bag", author:"Emily Rodriguez", email:"emily.r@outlook.com", rating:5, title:"Super unique and great quality", body:"I was looking for something fun and different. This bag delivers! The print is vibrant and the material feels high quality. Shipping was fast too.", status:"Approved" },
  { id:"REV-003", date:"2025-05-10T09:00:00Z", productId:29, productName:"Multi Pearl Beaded Bracelet Set", author:"Jennifer Adams", email:"j.adams@gmail.com", rating:4, title:"Pretty and elegant", body:"These bracelets look gorgeous and stack beautifully. The pearl size is perfect. Knocked off one star because the clasp on one is a little fiddly, but overall really happy.", status:"Approved" },
  { id:"REV-004", date:"2025-05-11T16:45:00Z", productId:34, productName:"Fragrance Mist Spray for Women", author:"Maria Chen", email:"mchen@yahoo.com", rating:5, title:"Smells incredible", body:"I was not expecting such a beautiful scent for this price. Lasts all day and I keep getting compliments. Will definitely be ordering more.", status:"Approved" },
  { id:"REV-005", date:"2025-05-12T11:20:00Z", productId:56, productName:"8' Beach Umbrella", author:"Tom Wilson", email:"t.wilson@gmail.com", rating:4, title:"Great shade, easy setup", body:"Very good umbrella. Sets up quickly and provides excellent shade. Took to the beach last weekend and it held up well in the wind. Loses one star for the carry bag being a bit flimsy.", status:"Pending" },
  { id:"REV-006", date:"2025-05-12T15:00:00Z", productId:15, productName:"Rhinestone Crossbody Bag with Coin Purse", author:"Diana Prince", email:"d.prince@outlook.com", rating:5, title:"Stunning for evenings out", body:"Used this for a wedding and received so many compliments. The rhinestones sparkle beautifully and the matching coin purse is adorable. Feels very luxurious.", status:"Pending" },
  { id:"REV-007", date:"2025-05-13T08:10:00Z", productId:4, productName:"Pleated Faux Leather Shoulder Bag", author:"Anonymous", email:"no-reply@test.com", rating:1, title:"Poor quality", body:"SPAM SPAM BUY NOW at other website!!!", status:"Pending" },
  { id:"REV-008", date:"2025-05-13T12:30:00Z", productId:35, productName:"Perfume and Lotion Gift Set for Women", author:"Lisa Thompson", email:"l.thompson@gmail.com", rating:5, title:"Perfect gift set", body:"Bought this as a Mother's Day gift and my mom absolutely loved it. The packaging is beautiful and the lotion smells divine. Will definitely order again!", status:"Approved" },
];

// ── Storage ────────────────────────────────────────────────────────────────────
function loadProd(): AdminData {
  try { const r = localStorage.getItem(PROD_KEY); if (r) return JSON.parse(r); } catch {}
  return { overrides: {}, added: [], deleted: [] };
}
function saveProd(d: AdminData) { localStorage.setItem(PROD_KEY, JSON.stringify(d)); }

function loadOrders(): Order[] {
  try { const r = localStorage.getItem(ORDER_KEY); if (r) return JSON.parse(r); } catch {}
  localStorage.setItem(ORDER_KEY, JSON.stringify(SEED_ORDERS)); return SEED_ORDERS;
}
function saveOrders(o: Order[]) { localStorage.setItem(ORDER_KEY, JSON.stringify(o)); }

function loadReviews(): Review[] {
  try { const r = localStorage.getItem(REV_KEY); if (r) return JSON.parse(r); } catch {}
  localStorage.setItem(REV_KEY, JSON.stringify(SEED_REVIEWS)); return SEED_REVIEWS;
}
function saveReviews(r: Review[]) { localStorage.setItem(REV_KEY, JSON.stringify(r)); }

function mergeAll(d: AdminData): Product[] {
  const base = staticProducts.filter(p => !d.deleted.includes(p.id)).map(p => ({ ...p, ...(d.overrides[p.id] ?? {}) }));
  return [...base, ...d.added];
}

// ── Misc constants ─────────────────────────────────────────────────────────────
const BLANK: Omit<Product, "id"> = { name:"", category:"Women's Bags", price:0, originalPrice:undefined, image:"", description:"", badge:undefined, rating:4.5, reviews:0, quantity:100 };

const BADGE_STYLES: Record<string, string> = { Hot:"bg-red-100 text-red-600", New:"bg-blue-100 text-blue-600", Sale:"bg-amber-100 text-amber-600", Popular:"bg-purple-100 text-purple-600" };

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending:"bg-amber-100 text-amber-700", Processing:"bg-blue-100 text-blue-700",
  Shipped:"bg-purple-100 text-purple-700", Delivered:"bg-green-100 text-green-700", Cancelled:"bg-red-100 text-red-600",
};
const REV_STATUS_STYLES: Record<ReviewStatus, string> = {
  Pending:"bg-amber-100 text-amber-700", Approved:"bg-green-100 text-green-700", Rejected:"bg-red-100 text-red-600",
};

const STATUS_FLOW: OrderStatus[] = ["Pending","Processing","Shipped","Delivered","Cancelled"];
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
const Stars = ({ n }: { n: number }) => <span className="text-amber-400 text-sm">{"★".repeat(n)}{"☆".repeat(5-n)}</span>;

// ── Admin panel ────────────────────────────────────────────────────────────────
type Page = "dashboard"|"products"|"add"|"orders"|"order-detail"|"reviews"|"settings";

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState(""); const [pwError, setPwError] = useState(false);

  // Products
  const [prodData, setProdData]       = useState<AdminData>({ overrides:{}, added:[], deleted:[] });
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [search, setSearch]           = useState(""); const [catFilter, setCatFilter] = useState("All");
  const [editing, setEditing]         = useState<Product|null>(null);
  const [form, setForm]               = useState<Omit<Product,"id">>(BLANK);
  const [imgMode, setImgMode]         = useState<"url"|"upload">("url");
  const [deleteId, setDeleteId]       = useState<number|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Orders
  const [orders, setOrders]               = useState<Order[]>([]);
  const [orderSearch, setOrderSearch]     = useState("");
  const [orderFilter, setOrderFilter]     = useState<OrderStatus|"All">("All");
  const [selOrder, setSelOrder]           = useState<Order|null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [notesInput, setNotesInput]       = useState("");

  // Reviews
  const [reviews, setReviews]             = useState<Review[]>([]);
  const [revFilter, setRevFilter]         = useState<ReviewStatus|"All">("All");
  const [revSearch, setRevSearch]         = useState("");
  const [selReview, setSelReview]         = useState<Review|null>(null);
  const [replyInput, setReplyInput]       = useState("");

  // Nav + toast
  const [page, setPage] = useState<Page>("dashboard");
  const [toast, setToast] = useState("");

  useEffect(() => { if (sessionStorage.getItem("kb_auth")==="1") setAuthed(true); }, []);
  useEffect(() => {
    if (!authed) return;
    const d = loadProd(); setProdData(d); setAllProducts(mergeAll(d));
    setOrders(loadOrders()); setReviews(loadReviews());
  }, [authed]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const login = () => { if (pw===PASSWORD){ sessionStorage.setItem("kb_auth","1"); setAuthed(true); } else setPwError(true); };

  // Product helpers
  const updateProd = (d: AdminData) => { setProdData(d); saveProd(d); setAllProducts(mergeAll(d)); };
  const openAdd  = () => { setEditing(null); setForm(BLANK); setImgMode("url"); setPage("add"); };
  const openEdit = (p: Product) => { setEditing(p); setForm({...p}); setImgMode("url"); setPage("add"); };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader(); r.onload = () => setForm(f => ({...f, image: r.result as string})); r.readAsDataURL(file);
  };
  const handleSaveProd = () => {
    if (!form.name.trim()||!form.price){ showToast("Name and price required."); return; }
    if (editing){
      if (staticProducts.some(p=>p.id===editing.id)) updateProd({...prodData, overrides:{...prodData.overrides,[editing.id]:form}});
      else updateProd({...prodData, added:prodData.added.map(p=>p.id===editing.id?{...form,id:editing.id}:p)});
    } else {
      const newId = Math.max(...allProducts.map(p=>p.id),1000)+1;
      updateProd({...prodData, added:[...prodData.added,{...form,id:newId}]});
    }
    showToast(editing?"Product updated.":"Product added."); setPage("products"); setEditing(null);
  };
  const handleDeleteProd = (id: number) => {
    if (staticProducts.some(p=>p.id===id)) updateProd({...prodData, deleted:[...prodData.deleted,id]});
    else updateProd({...prodData, added:prodData.added.filter(p=>p.id!==id)});
    setDeleteId(null); showToast("Product hidden.");
  };

  // Order helpers
  const updateOrders = (o: Order[]) => { setOrders(o); saveOrders(o); };
  const setOrderStatus = (id: string, status: OrderStatus) => {
    updateOrders(orders.map(o=>o.id===id?{...o,status}:o));
    if (selOrder?.id===id) setSelOrder(p=>p?{...p,status}:null);
    showToast(`Order ${id} → ${status}`);
  };
  const saveOrderDetails = () => {
    if (!selOrder) return;
    updateOrders(orders.map(o=>o.id===selOrder.id?{...o,tracking:trackingInput||undefined,notes:notesInput||undefined}:o));
    setSelOrder(p=>p?{...p,tracking:trackingInput||undefined,notes:notesInput||undefined}:null);
    showToast("Order updated.");
  };
  const openOrder = (o: Order) => { setSelOrder(o); setTrackingInput(o.tracking??""); setNotesInput(o.notes??""); setPage("order-detail"); };

  // Review helpers
  const updateReviews = (r: Review[]) => { setReviews(r); saveReviews(r); };
  const setRevStatus = (id: string, status: ReviewStatus) => {
    updateReviews(reviews.map(r=>r.id===id?{...r,status}:r));
    if (selReview?.id===id) setSelReview(p=>p?{...p,status}:null);
    showToast(`Review ${status.toLowerCase()}.`);
  };
  const saveReply = () => {
    if (!selReview) return;
    updateReviews(reviews.map(r=>r.id===selReview.id?{...r,reply:replyInput||undefined}:r));
    setSelReview(p=>p?{...p,reply:replyInput||undefined}:null);
    showToast("Reply saved.");
  };
  const deleteReview = (id: string) => {
    updateReviews(reviews.filter(r=>r.id!==id));
    if (selReview?.id===id){ setSelReview(null); setPage("reviews"); }
    showToast("Review deleted.");
  };

  // Computed
  const filteredProducts = allProducts.filter(p=>(catFilter==="All"||p.category===catFilter)&&(!search||p.name.toLowerCase().includes(search.toLowerCase())));
  const filteredOrders   = orders.filter(o=>(orderFilter==="All"||o.status===orderFilter)&&(!orderSearch||o.id.toLowerCase().includes(orderSearch.toLowerCase())||o.customer.name.toLowerCase().includes(orderSearch.toLowerCase())||o.customer.email.toLowerCase().includes(orderSearch.toLowerCase())));
  const filteredReviews  = reviews.filter(r=>(revFilter==="All"||r.status===revFilter)&&(!revSearch||r.author.toLowerCase().includes(revSearch.toLowerCase())||r.productName.toLowerCase().includes(revSearch.toLowerCase())));

  const stats = {
    products: allProducts.length,
    orders:   orders.length,
    pending:  orders.filter(o=>o.status==="Pending").length,
    revenue:  orders.filter(o=>o.status!=="Cancelled").reduce((s,o)=>s+o.total,0),
    pendingRevs: reviews.filter(r=>r.status==="Pending").length,
  };

  // ── KB Icon ────────────────────────────────────────────────────────────────
  const KBIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-8 h-8 flex-shrink-0">
      <rect width="32" height="32" rx="7" fill="#f43f5e"/><rect x="16" width="16" height="32" fill="#18181b"/>
      <text x="2" y="23" fontFamily="Arial Black, Arial, sans-serif" fontSize="15" fontWeight="900" fill="white">K</text>
      <text x="17" y="23" fontFamily="Arial Black, Arial, sans-serif" fontSize="15" fontWeight="900" fill="white">B</text>
    </svg>
  );

  // ── Sidebar nav item ───────────────────────────────────────────────────────
  const NavBtn = ({ k, label, icon, badge }: { k: Page; label: string; icon: string; badge?: number }) => (
    <button onClick={() => setPage(k)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${(page===k||(page==="add"&&k==="products")||(page==="order-detail"&&k==="orders"))?"bg-rose-50 text-rose-600":"text-zinc-600 hover:bg-zinc-50"}`}>
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon}/></svg>
      {label}
      {!!badge && <span className="ml-auto bg-amber-400 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{badge}</span>}
    </button>
  );

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (!authed) return (
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
        <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setPwError(false);}} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Enter password"
          className={`w-full border rounded-xl px-4 py-3 text-sm mb-1 focus:outline-none focus:ring-2 ${pwError?"border-red-400 focus:ring-red-300":"border-zinc-300 focus:ring-rose-400"}`}/>
        {pwError&&<p className="text-red-500 text-xs mb-3">Incorrect password.</p>}
        {!pwError&&<div className="mb-3"/>}
        <button onClick={login} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-colors">Sign In</button>
      </div>
    </div>
  );

  // ── LAYOUT ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">

      {/* Header */}
      <header className="bg-zinc-900 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3"><KBIcon/><span className="font-bold text-base">KB Admin Panel</span></div>
        <div className="flex items-center gap-5 text-sm">
          <a href="/" target="_blank" className="text-zinc-400 hover:text-white transition-colors">View Store ↗</a>
          <button onClick={()=>{sessionStorage.removeItem("kb_auth");setAuthed(false);}} className="text-zinc-400 hover:text-white transition-colors">Sign Out</button>
        </div>
      </header>

      {/* Toast */}
      {toast&&<div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">{toast}</div>}

      <div className="flex flex-1">

        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-zinc-200 flex-shrink-0 hidden md:flex flex-col pt-6 pb-4 px-3">
          <nav className="space-y-1">
            <NavBtn k="dashboard" label="Dashboard"  icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            <NavBtn k="products" label="Products"    icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            <NavBtn k="orders"   label="Orders"      icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" badge={stats.pending||undefined}/>
            <NavBtn k="reviews"  label="Reviews"     icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" badge={stats.pendingRevs||undefined}/>
            <NavBtn k="settings" label="Settings"    icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </nav>

          <div className="mt-auto space-y-1 pt-4 border-t border-zinc-100">
            <button onClick={()=>exportProductsCSV(allProducts)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Export Products CSV
            </button>
            <button onClick={()=>exportOrdersCSV(orders)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Export Orders CSV
            </button>
            <button onClick={()=>exportReviewsCSV(reviews)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Export Reviews CSV
            </button>
            <button onClick={()=>{updateProd({overrides:{},added:[],deleted:[]});showToast("Products reset.");}} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              Reset to Defaults
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 overflow-auto">

          {/* ── DASHBOARD ─────────────────────────────────────────────── */}
          {page==="dashboard"&&(
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-6">Dashboard</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  {label:"Total Products", value:stats.products,     color:"text-zinc-900", bg:"bg-zinc-100",  icon:"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"},
                  {label:"Total Orders",   value:stats.orders,       color:"text-blue-600", bg:"bg-blue-50",   icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"},
                  {label:"Pending Orders", value:stats.pending,      color:"text-amber-600",bg:"bg-amber-50",  icon:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"},
                  {label:"Total Revenue",  value:`$${stats.revenue.toFixed(2)}`, color:"text-green-600", bg:"bg-green-50", icon:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"},
                ].map(({label,value,color,bg,icon})=>(
                  <div key={label} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                      <svg className={`w-5 h-5 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon}/></svg>
                    </div>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-zinc-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                {/* Recent orders */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                    <h3 className="font-bold text-zinc-900 text-sm">Recent Orders</h3>
                    <button onClick={()=>setPage("orders")} className="text-xs text-rose-500 font-semibold">View all →</button>
                  </div>
                  <div className="divide-y divide-zinc-50">
                    {orders.slice(0,5).map(o=>(
                      <div key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50 cursor-pointer" onClick={()=>openOrder(o)}>
                        <div><p className="text-xs font-semibold text-zinc-900">{o.customer.name}</p><p className="text-xs text-zinc-400">{o.id}</p></div>
                        <div className="flex items-center gap-3"><span className="text-xs font-semibold text-zinc-900">${o.total.toFixed(2)}</span><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[o.status]}`}>{o.status}</span></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending reviews */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                    <h3 className="font-bold text-zinc-900 text-sm">Pending Reviews</h3>
                    <button onClick={()=>{setRevFilter("Pending");setPage("reviews");}} className="text-xs text-rose-500 font-semibold">View all →</button>
                  </div>
                  <div className="divide-y divide-zinc-50">
                    {reviews.filter(r=>r.status==="Pending").slice(0,5).map(r=>(
                      <div key={r.id} className="flex items-start gap-3 px-5 py-3 hover:bg-zinc-50 cursor-pointer" onClick={()=>{setSelReview(r);setReplyInput(r.reply??"");setPage("reviews");}}>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 truncate">{r.productName}</p>
                          <p className="text-xs text-zinc-400">{r.author} · <Stars n={r.rating}/></p>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">{r.body}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={e=>{e.stopPropagation();setRevStatus(r.id,"Approved");}} className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded-lg font-semibold transition-colors">✓</button>
                          <button onClick={e=>{e.stopPropagation();setRevStatus(r.id,"Rejected");}} className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded-lg font-semibold transition-colors">✕</button>
                        </div>
                      </div>
                    ))}
                    {reviews.filter(r=>r.status==="Pending").length===0&&<p className="px-5 py-6 text-xs text-zinc-400 text-center">No pending reviews.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTS ──────────────────────────────────────────────── */}
          {page==="products"&&(
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="w-full border border-zinc-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"/>
                </div>
                <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} className="border border-zinc-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
                  {categories.map(c=><option key={c}>{c}</option>)}
                </select>
                <button onClick={openAdd} className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 whitespace-nowrap">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Add Product
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>{["Product","Category","Price","Stock","Badge","Actions"].map(h=><th key={h} className={`${h==="Actions"?"text-right":"text-left"} px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider`}>{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredProducts.map(p=>(
                        <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200">
                                {p.image&&<img src={p.image} alt={p.name} className="w-full h-full object-cover"/>}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-zinc-900 text-xs leading-snug truncate max-w-[180px]">{p.name}</p>
                                <p className="text-zinc-400 text-xs">#{p.id}{prodData.added.some(a=>a.id===p.id)&&<span className="text-blue-500 ml-1">• New</span>}{prodData.overrides[p.id]&&<span className="text-amber-500 ml-1">• Edited</span>}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">{p.category}</td>
                          <td className="px-4 py-3"><p className="font-semibold text-zinc-900 text-sm">${p.price.toFixed(2)}</p>{p.originalPrice&&<p className="line-through text-zinc-400 text-xs">${p.originalPrice.toFixed(2)}</p>}</td>
                          <td className="px-4 py-3 text-xs text-zinc-600">{p.quantity?.toLocaleString()}</td>
                          <td className="px-4 py-3">{p.badge&&<span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${BADGE_STYLES[p.badge]??""}`}>{p.badge}</span>}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={()=>openEdit(p)} className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                              <button onClick={()=>setDeleteId(p.id)} className="text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">Hide</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length===0&&<tr><td colSpan={6} className="px-5 py-12 text-center text-zinc-400 text-sm">No products found.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50 text-xs text-zinc-400">Showing {filteredProducts.length} of {allProducts.length} products</div>
              </div>
            </>
          )}

          {/* ── ADD/EDIT PRODUCT ──────────────────────────────────────── */}
          {page==="add"&&(
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={()=>{setPage("products");setEditing(null);}} className="text-zinc-400 hover:text-zinc-700"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button>
                <h2 className="text-xl font-bold text-zinc-900">{editing?"Edit Product":"Add New Product"}</h2>
              </div>
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                {/* Image */}
                <div className="p-6 border-b border-zinc-100">
                  <p className="text-sm font-semibold text-zinc-800 mb-3">Product Image</p>
                  <div className="flex gap-2 mb-4">
                    {(["url","upload"] as const).map(m=><button key={m} onClick={()=>setImgMode(m)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${imgMode===m?"bg-rose-500 text-white":"bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>{m==="url"?"Image URL":"Upload File"}</button>)}
                  </div>
                  <div className="flex gap-5 items-start">
                    <div className="flex-1">
                      {imgMode==="url"
                        ?<input type="text" value={form.image} onChange={e=>setForm(f=>({...f,image:e.target.value}))} placeholder="https://..." className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"/>
                        :<div><input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden"/><button onClick={()=>fileRef.current?.click()} className="w-full border-2 border-dashed border-zinc-300 rounded-xl py-8 text-sm text-zinc-400 hover:border-rose-400 hover:text-rose-400 transition-colors flex flex-col items-center gap-2"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>Click to upload</button></div>}
                    </div>
                    {form.image&&<img src={form.image} alt="preview" className="w-28 h-28 object-cover rounded-xl border border-zinc-200 flex-shrink-0"/>}
                  </div>
                </div>
                {/* Details */}
                <div className="p-6 border-b border-zinc-100 space-y-5">
                  <p className="text-sm font-semibold text-zinc-800">Product Details</p>
                  <div><label className="block text-xs font-medium text-zinc-600 mb-1.5">Name <span className="text-red-500">*</span></label><input type="text" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"/></div>
                  <div><label className="block text-xs font-medium text-zinc-600 mb-1.5">Category <span className="text-red-500">*</span></label><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">{categories.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}</select></div>
                  <div><label className="block text-xs font-medium text-zinc-600 mb-1.5">Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={4} className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"/></div>
                </div>
                {/* Pricing */}
                <div className="p-6 border-b border-zinc-100 space-y-5">
                  <p className="text-sm font-semibold text-zinc-800">Pricing & Inventory</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-medium text-zinc-600 mb-1.5">Price (USD) <span className="text-red-500">*</span></label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span><input type="number" step="0.01" min="0" value={form.price||""} onChange={e=>setForm(f=>({...f,price:parseFloat(e.target.value)||0}))} className="w-full border border-zinc-300 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"/></div></div>
                    <div><label className="block text-xs font-medium text-zinc-600 mb-1.5">Original Price</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span><input type="number" step="0.01" min="0" value={form.originalPrice||""} onChange={e=>setForm(f=>({...f,originalPrice:e.target.value?parseFloat(e.target.value):undefined}))} placeholder="Optional" className="w-full border border-zinc-300 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"/></div></div>
                    <div><label className="block text-xs font-medium text-zinc-600 mb-1.5">Stock Qty</label><input type="number" min="0" value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:parseInt(e.target.value)||0}))} className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"/></div>
                    <div><label className="block text-xs font-medium text-zinc-600 mb-1.5">Badge</label><select value={form.badge??""} onChange={e=>setForm(f=>({...f,badge:(e.target.value as Product["badge"])||undefined}))} className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"><option value="">No Badge</option><option>New</option><option>Sale</option><option>Popular</option><option>Hot</option></select></div>
                  </div>
                </div>
                {/* Ratings */}
                <div className="p-6 border-b border-zinc-100 space-y-4">
                  <p className="text-sm font-semibold text-zinc-800">Ratings</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-medium text-zinc-600 mb-1.5">Rating (1–5)</label><input type="number" step="0.1" min="1" max="5" value={form.rating} onChange={e=>setForm(f=>({...f,rating:parseFloat(e.target.value)||4.5}))} className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"/></div>
                    <div><label className="block text-xs font-medium text-zinc-600 mb-1.5">Review Count</label><input type="number" min="0" value={form.reviews} onChange={e=>setForm(f=>({...f,reviews:parseInt(e.target.value)||0}))} className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"/></div>
                  </div>
                </div>
                <div className="p-6 flex gap-3 justify-end bg-zinc-50">
                  <button onClick={()=>{setPage("products");setEditing(null);}} className="px-6 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors">Cancel</button>
                  <button onClick={handleSaveProd} className="px-8 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-colors">{editing?"Save Changes":"Add Product"}</button>
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS LIST ───────────────────────────────────────────── */}
          {page==="orders"&&(
            <>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {(["All","Pending","Processing","Shipped","Delivered","Cancelled"] as const).map(s=>{
                  const count = s==="All"?orders.length:orders.filter(o=>o.status===s).length;
                  return <button key={s} onClick={()=>setOrderFilter(s)} className={`rounded-xl p-3 text-left border transition-all ${orderFilter===s?"border-rose-300 bg-rose-50":"border-zinc-200 bg-white hover:border-zinc-300"}`}><p className={`text-xl font-bold ${s==="All"?"text-zinc-900":STATUS_STYLES[s as OrderStatus]?.split(" ")[1]}`}>{count}</p><p className="text-xs text-zinc-400 mt-0.5 truncate">{s==="All"?"All":s}</p></button>;
                })}
              </div>
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1"><svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg><input type="text" value={orderSearch} onChange={e=>setOrderSearch(e.target.value)} placeholder="Search order ID, customer name or email..." className="w-full border border-zinc-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"/></div>
              </div>
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>{["Order","Customer","Date","Items","Total","Status","Update"].map(h=><th key={h} className={`${h==="Update"?"text-right":"text-left"} px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider`}>{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredOrders.map(o=>(
                        <tr key={o.id} className="hover:bg-zinc-50 cursor-pointer transition-colors" onClick={()=>openOrder(o)}>
                          <td className="px-4 py-3"><p className="font-mono text-xs font-semibold text-zinc-900">{o.id}</p>{o.tracking&&<p className="text-xs text-zinc-400 truncate max-w-[130px]">🚚 {o.tracking}</p>}</td>
                          <td className="px-4 py-3"><p className="font-medium text-zinc-900 text-xs">{o.customer.name}</p><p className="text-zinc-400 text-xs">{o.customer.email}</p></td>
                          <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">{fmt(o.date)}</td>
                          <td className="px-4 py-3 text-xs text-zinc-600">{o.items.length} item{o.items.length!==1?"s":""}</td>
                          <td className="px-4 py-3 font-semibold text-zinc-900">${o.total.toFixed(2)}</td>
                          <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[o.status]}`}>{o.status}</span></td>
                          <td className="px-4 py-3 text-right" onClick={e=>e.stopPropagation()}>
                            <select value={o.status} onChange={e=>setOrderStatus(o.id,e.target.value as OrderStatus)} className="text-xs border border-zinc-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white">
                              {STATUS_FLOW.map(s=><option key={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length===0&&<tr><td colSpan={7} className="px-5 py-12 text-center text-zinc-400 text-sm">No orders found.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50 text-xs text-zinc-400">Showing {filteredOrders.length} of {orders.length} orders</div>
              </div>
            </>
          )}

          {/* ── ORDER DETAIL ──────────────────────────────────────────── */}
          {page==="order-detail"&&selOrder&&(
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={()=>setPage("orders")} className="text-zinc-400 hover:text-zinc-700"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button>
                <div className="flex-1"><h2 className="text-xl font-bold text-zinc-900">{selOrder.id}</h2><p className="text-sm text-zinc-400">{fmt(selOrder.date)}</p></div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${STATUS_STYLES[selOrder.status]}`}>{selOrder.status}</span>
              </div>
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                  <p className="text-sm font-semibold text-zinc-800 mb-4">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_FLOW.map(s=><button key={s} onClick={()=>setOrderStatus(selOrder.id,s)} className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${selOrder.status===s?STATUS_STYLES[s]+" border-transparent":"bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"}`}>{s}</button>)}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                  <p className="text-sm font-semibold text-zinc-800 mb-4">Customer</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-xs text-zinc-400 mb-0.5">Name</p><p className="font-medium text-zinc-900">{selOrder.customer.name}</p></div>
                    <div><p className="text-xs text-zinc-400 mb-0.5">Email</p><a href={`mailto:${selOrder.customer.email}`} className="font-medium text-rose-500 hover:underline">{selOrder.customer.email}</a></div>
                    <div><p className="text-xs text-zinc-400 mb-0.5">Phone</p><p className="font-medium text-zinc-900">{selOrder.customer.phone}</p></div>
                    <div><p className="text-xs text-zinc-400 mb-0.5">Ship To</p><p className="font-medium text-zinc-900">{selOrder.customer.address}, {selOrder.customer.city}, {selOrder.customer.state} {selOrder.customer.zip}</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                  <p className="text-sm font-semibold text-zinc-800 px-6 py-4 border-b border-zinc-100">Items</p>
                  <div className="divide-y divide-zinc-50">
                    {selOrder.items.map((item,i)=>(
                      <div key={i} className="flex items-center gap-4 px-6 py-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200"><img src={item.image} alt={item.name} className="w-full h-full object-cover"/></div>
                        <div className="flex-1 min-w-0"><p className="font-medium text-zinc-900 text-sm truncate">{item.name}</p><p className="text-xs text-zinc-400">Qty: {item.qty} × ${item.price.toFixed(2)}</p></div>
                        <p className="font-semibold text-zinc-900 text-sm flex-shrink-0">${(item.price*item.qty).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50"><span className="font-bold text-zinc-900">Total</span><span className="font-bold text-zinc-900 text-lg">${selOrder.total.toFixed(2)}</span></div>
                </div>
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-5">
                  <p className="text-sm font-semibold text-zinc-800">Shipping & Notes</p>
                  <div><label className="block text-xs font-medium text-zinc-600 mb-1.5">USPS Tracking Number</label><input type="text" value={trackingInput} onChange={e=>setTrackingInput(e.target.value)} placeholder="e.g. 9400111899223197854392" className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"/></div>
                  <div><label className="block text-xs font-medium text-zinc-600 mb-1.5">Internal Notes</label><textarea value={notesInput} onChange={e=>setNotesInput(e.target.value)} rows={3} className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"/></div>
                  <button onClick={saveOrderDetails} className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {/* ── REVIEWS ───────────────────────────────────────────────── */}
          {page==="reviews"&&(
            <>
              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2 mb-5">
                {(["All","Pending","Approved","Rejected"] as const).map(s=>{
                  const count = s==="All"?reviews.length:reviews.filter(r=>r.status===s).length;
                  return <button key={s} onClick={()=>setRevFilter(s)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${revFilter===s?"border-rose-300 bg-rose-50 text-rose-600":"border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"}`}>{s}<span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${revFilter===s?"bg-rose-200 text-rose-700":"bg-zinc-100 text-zinc-500"}`}>{count}</span></button>;
                })}
                <div className="relative ml-auto">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  <input type="text" value={revSearch} onChange={e=>setRevSearch(e.target.value)} placeholder="Search reviews..." className="border border-zinc-300 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"/>
                </div>
              </div>

              <div className="space-y-3">
                {filteredReviews.map(r=>(
                  <div key={r.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${selReview?.id===r.id?"border-rose-300":"border-zinc-200"}`}>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm flex-shrink-0">{r.author[0]}</div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-zinc-900 text-sm">{r.author}</p>
                              <Stars n={r.rating}/>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${REV_STATUS_STYLES[r.status]}`}>{r.status}</span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5">{r.email} · {fmt(r.date)} · <span className="text-zinc-500 font-medium">{r.productName}</span></p>
                          </div>
                        </div>
                        {/* Quick actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {r.status!=="Approved" &&<button onClick={()=>setRevStatus(r.id,"Approved")} className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg font-semibold transition-colors">Approve</button>}
                          {r.status!=="Rejected" &&<button onClick={()=>setRevStatus(r.id,"Rejected")} className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded-lg font-semibold transition-colors">Reject</button>}
                          <button onClick={()=>deleteReview(r.id)} className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded-lg font-semibold transition-colors">Delete</button>
                        </div>
                      </div>

                      <div className="pl-12">
                        <p className="font-semibold text-zinc-900 text-sm mb-1">{r.title}</p>
                        <p className="text-zinc-500 text-sm leading-relaxed">{r.body}</p>

                        {/* Existing reply */}
                        {r.reply&&(
                          <div className="mt-3 bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                            <p className="text-xs font-semibold text-zinc-700 mb-1">Store Reply</p>
                            <p className="text-xs text-zinc-500">{r.reply}</p>
                          </div>
                        )}

                        {/* Reply toggle */}
                        {selReview?.id===r.id ? (
                          <div className="mt-3 space-y-2">
                            <textarea value={replyInput} onChange={e=>setReplyInput(e.target.value)} rows={2} placeholder="Write a reply to this customer review..." className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"/>
                            <div className="flex gap-2">
                              <button onClick={saveReply} className="text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-lg transition-colors">Post Reply</button>
                              <button onClick={()=>setSelReview(null)} className="text-xs border border-zinc-300 text-zinc-600 hover:bg-zinc-50 px-4 py-2 rounded-lg transition-colors">Cancel</button>
                            </div>
                          </div>
                        ):(
                          <button onClick={()=>{setSelReview(r);setReplyInput(r.reply??"");}} className="mt-3 text-xs text-rose-500 hover:text-rose-600 font-semibold transition-colors flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                            {r.reply?"Edit Reply":"Reply"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredReviews.length===0&&<div className="bg-white rounded-2xl border border-zinc-200 py-16 text-center text-zinc-400 text-sm">No reviews match your filter.</div>}
              </div>
            </>
          )}

          {/* ── SETTINGS ─────────────────────────────────────────────── */}
          {page==="settings"&&(
            <div className="max-w-2xl space-y-6">
              <h2 className="text-xl font-bold text-zinc-900">Settings</h2>

              {/* Stripe Status Card */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100">
                  <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 text-sm">Stripe Payments</p>
                    <p className="text-xs text-zinc-400">Configure live payment processing</p>
                  </div>
                  <div className="ml-auto">
                    {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                        {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_live") ? "Live" : "Test Mode"}
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">Not Configured</span>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <p className="text-sm text-zinc-600">
                    To accept real payments, add the following environment variables in your{" "}
                    <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-violet-600 font-semibold hover:underline">Vercel Dashboard</a>{" "}
                    under <strong>Settings → Environment Variables</strong>.
                  </p>

                  {/* Env var rows */}
                  {[
                    { key:"NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", label:"Publishable Key", hint:"Starts with pk_live_...", secret:false },
                    { key:"STRIPE_SECRET_KEY",                  label:"Secret Key",      hint:"Starts with sk_live_...", secret:true },
                    { key:"STRIPE_WEBHOOK_SECRET",              label:"Webhook Secret",  hint:"Starts with whsec_...",  secret:true },
                    { key:"NEXT_PUBLIC_BASE_URL",               label:"Site URL",        hint:"https://www.kareembaksh.com", secret:false },
                  ].map(({key, label, hint, secret})=>(
                    <div key={key} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-xl">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${process.env[key] || (!secret && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) ? "bg-green-400" : "bg-zinc-300"}`}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-800 font-mono">{key}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{label} — {hint}</p>
                      </div>
                      {secret && <span className="text-xs bg-zinc-200 text-zinc-500 px-2 py-0.5 rounded font-medium">Server-only</span>}
                    </div>
                  ))}

                  {/* Where to find keys */}
                  <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-violet-800">Where to find your Stripe keys:</p>
                    <ol className="text-xs text-violet-700 space-y-1 list-decimal list-inside">
                      <li>Go to <strong>dashboard.stripe.com → Developers → API Keys</strong></li>
                      <li>Copy your <strong>Publishable key</strong> and <strong>Secret key</strong></li>
                      <li>For the Webhook Secret: go to <strong>Developers → Webhooks → Add endpoint</strong></li>
                      <li>Set endpoint URL to: <code className="bg-violet-100 px-1 rounded">https://www.kareembaksh.com/api/webhook</code></li>
                      <li>Select event: <code className="bg-violet-100 px-1 rounded">checkout.session.completed</code></li>
                      <li>Copy the <strong>Signing secret</strong> (whsec_...)</li>
                    </ol>
                  </div>

                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full justify-center py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    Open Stripe Dashboard
                  </a>
                </div>
              </div>

              {/* Promo codes card */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100">
                  <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 text-sm">Active Promo Codes</p>
                    <p className="text-xs text-zinc-400">Codes customers can use at checkout</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-2">
                    {[
                      { code:"WELCOME10", desc:"10% off — Welcome discount" },
                      { code:"KB15",      desc:"15% off" },
                      { code:"SAVE5",     desc:"$5 off any order" },
                      { code:"KBVIP",     desc:"20% VIP discount" },
                      { code:"SUMMER",    desc:"12% Summer sale" },
                    ].map(({code,desc})=>(
                      <div key={code} className="flex items-center gap-3 px-3 py-2.5 bg-zinc-50 rounded-xl">
                        <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded">{code}</span>
                        <span className="text-xs text-zinc-500">{desc}</span>
                        <span className="ml-auto text-xs bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded-full">Active</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 mt-4">To change promo codes, edit <code className="bg-zinc-100 px-1 rounded">src/app/checkout/page.tsx</code> → PROMO_CODES object.</p>
                </div>
              </div>

              {/* Contact card */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div><p className="font-bold text-zinc-900 text-sm">Store Info</p><p className="text-xs text-zinc-400">Business details</p></div>
                </div>
                <div className="p-6 space-y-2 text-sm text-zinc-600">
                  <p><span className="font-medium text-zinc-800">Business:</span> Kareem Baksh LLC</p>
                  <p><span className="font-medium text-zinc-800">Address:</span> 30 N Gould St #55212, Sheridan, WY 82801, USA</p>
                  <p><span className="font-medium text-zinc-800">Phone:</span> 307-430-1170</p>
                  <p><span className="font-medium text-zinc-800">Email:</span> admin@kareembaksh.com</p>
                  <p><span className="font-medium text-zinc-800">Site:</span> kareembaksh.com</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Delete product confirm */}
      {deleteId!==null&&(
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4"><svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg></div>
            <h3 className="font-bold text-zinc-900 text-lg mb-2">Hide This Product?</h3>
            <p className="text-sm text-zinc-500 mb-6">The product will be hidden from the store. Reset to defaults to restore.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
              <button onClick={()=>handleDeleteProd(deleteId)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors">Hide</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
