"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

interface FormData {
  name: string; email: string; phone: string;
  address: string; city: string; state: string; zip: string; country: string;
  notes: string;
}

const EMPTY: FormData = { name:"", email:"", phone:"", address:"", city:"", state:"", zip:"", country:"US", notes:"" };

const PROMO_CODES: Record<string, { discount: number; type: "percent" | "fixed"; label: string }> = {
  "WELCOME10": { discount: 10, type: "percent", label: "10% off — Welcome discount" },
  "KB15":      { discount: 15, type: "percent", label: "15% off" },
  "SAVE5":     { discount: 5,  type: "fixed",   label: "$5 off your order" },
  "KBVIP":     { discount: 20, type: "percent", label: "20% VIP discount" },
  "SUMMER":    { discount: 12, type: "percent", label: "12% Summer sale" },
};

function genOrderId() {
  return `KB-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
}

async function sendEmails(order: Record<string, unknown>, form: FormData, items: { name: string; price: number; quantity: number }[]) {
  const serviceId      = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const publicKey      = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const orderTemplate  = process.env.NEXT_PUBLIC_EMAILJS_ORDER_TEMPLATE;
  const adminTemplate  = process.env.NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE;
  if (!serviceId || !publicKey) return;

  const emailjs = (await import("@emailjs/browser")).default;
  emailjs.init(publicKey);

  const itemsList = items.map(i => `${i.quantity}x ${i.name} — $${(i.price * i.quantity).toFixed(2)}`).join("\n");
  const params = {
    order_id: order.id,
    customer_name: form.name,
    customer_email: form.email,
    customer_phone: form.phone,
    shipping_address: `${form.address}, ${form.city}, ${form.state} ${form.zip}, ${form.country}`,
    items_list: itemsList,
    order_total: `$${(order.total as number).toFixed(2)}`,
    order_notes: form.notes || "—",
  };

  if (orderTemplate) {
    await emailjs.send(serviceId, orderTemplate, { ...params, to_email: form.email }).catch(() => {});
  }
  if (adminTemplate) {
    await emailjs.send(serviceId, adminTemplate, { ...params, to_email: "admin@kareembaksh.com" }).catch(() => {});
  }
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [form, setForm]       = useState<FormData>(EMPTY);
  const [errors, setErrors]   = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Promo code
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<typeof PROMO_CODES[string] | null>(null);
  const [promoError, setPromoError] = useState("");

  const discountAmount = promoApplied
    ? promoApplied.type === "percent"
      ? totalPrice * promoApplied.discount / 100
      : Math.min(promoApplied.discount, totalPrice)
    : 0;
  const finalTotal = totalPrice - discountAmount;

  if (items.length === 0 && !submitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-zinc-400">
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p className="text-lg font-medium">Your cart is empty</p>
        <Link href="/products" className="text-rose-500 hover:text-rose-600 font-semibold text-sm">Browse Products</Link>
      </main>
    );
  }

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setPromoApplied(PROMO_CODES[code]);
      setPromoError("");
    } else {
      setPromoApplied(null);
      setPromoError("Invalid promo code");
    }
  }

  function validate() {
    const e: Partial<FormData> = {};
    if (!form.name.trim())    e.name    = "Full name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim())   e.phone   = "Phone is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim())    e.city    = "City is required";
    if (!form.state.trim())   e.state   = "State is required";
    if (!form.zip.trim())     e.zip     = "ZIP code is required";
    return e;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name as keyof FormData]) setErrors(er => ({ ...er, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    const id = genOrderId();
    const order = {
      id,
      date: new Date().toISOString(),
      customer: { name: form.name, email: form.email, phone: form.phone, address: form.address, city: form.city, state: form.state, zip: form.zip },
      items: items.map(i => ({ productId: i.id, name: i.name, price: i.price, qty: i.quantity, image: i.image })),
      total: finalTotal,
      status: "Pending",
      tracking: "",
      notes: [form.notes, promoApplied ? `Promo: ${promoInput.toUpperCase()} (${promoApplied.label})` : ""].filter(Boolean).join(" | "),
    };

    try {
      const existing = JSON.parse(localStorage.getItem("kb_orders") || "[]");
      localStorage.setItem("kb_orders", JSON.stringify([order, ...existing]));
    } catch { /* localStorage unavailable */ }

    await sendEmails(order, form, items).catch(() => {});

    setOrderId(id);
    clearCart();
    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Order Placed!</h1>
          <p className="text-zinc-500 mb-1">Thank you, <span className="font-semibold text-zinc-700">{form.name}</span>.</p>
          <p className="text-zinc-500 mb-6">
            Your order <span className="font-bold text-rose-500">{orderId}</span> has been received.
            We&apos;ll contact you at <span className="font-semibold">{form.email}</span> with payment details.
          </p>
          <div className="bg-zinc-50 rounded-2xl p-4 text-left text-sm text-zinc-600 mb-8 space-y-1.5">
            <p><span className="font-medium text-zinc-800">Shipping to:</span> {form.address}, {form.city}, {form.state} {form.zip}</p>
            <p><span className="font-medium text-zinc-800">Phone:</span> {form.phone}</p>
            <p><span className="font-medium text-zinc-800">Order total:</span> <span className="text-zinc-900 font-bold">${finalTotal.toFixed(2)}</span></p>
            <p><span className="font-medium text-zinc-800">Estimated delivery:</span> 7–15 business days</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products" className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors text-sm">
              Continue Shopping
            </Link>
            <Link href="/track-order" className="px-6 py-3 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold rounded-xl transition-colors text-sm">
              Track Order
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const Field = ({ label, name, type = "text", placeholder, half }: { label: string; name: keyof FormData; type?: string; placeholder?: string; half?: boolean }) => (
    <div className={half ? "col-span-1" : "col-span-2"}>
      <label className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>
      <input
        type={type} name={name} value={form[name]} onChange={handleChange} placeholder={placeholder}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 ${errors[name] ? "border-red-400 bg-red-50" : "border-zinc-200 bg-white"}`}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-zinc-400">
          <Link href="/" className="hover:text-zinc-600">Home</Link>
          <span>/</span>
          <span className="text-zinc-700">Checkout</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h1 className="text-2xl font-bold text-zinc-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Left: form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-zinc-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" name="name" placeholder="Jane Smith" />
                <Field label="Email Address" name="email" type="email" placeholder="jane@example.com" half />
                <Field label="Phone Number" name="phone" type="tel" placeholder="+1 555 000 0000" half />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-zinc-900 mb-4">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Street Address" name="address" placeholder="123 Main St, Apt 4B" />
                <Field label="City" name="city" placeholder="New York" half />
                <Field label="State / Province" name="state" placeholder="NY" half />
                <Field label="ZIP / Postal Code" name="zip" placeholder="10001" half />
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Country</label>
                  <select name="country" value={form.country} onChange={handleChange} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white">
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-zinc-900 mb-4">
                Order Notes <span className="text-zinc-400 font-normal text-sm">(optional)</span>
              </h2>
              <textarea
                name="notes" value={form.notes} onChange={handleChange}
                placeholder="Special instructions, delivery notes..."
                rows={3}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
              />
            </div>
          </div>

          {/* Right: order summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-4">
              <h2 className="text-base font-bold text-zinc-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-800 truncate">{item.name}</p>
                      <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-zinc-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Promo code */}
              <div className="border-t border-zinc-100 pt-4 mb-4">
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Promo Code</label>
                {promoApplied ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-xs font-bold text-green-700">{promoInput.toUpperCase()}</p>
                      <p className="text-xs text-green-600">{promoApplied.label}</p>
                    </div>
                    <button type="button" onClick={() => { setPromoApplied(null); setPromoInput(""); }} className="text-green-500 hover:text-green-700 text-xs font-medium">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), applyPromo())}
                      placeholder="Enter code"
                      className={`flex-1 px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 ${promoError ? "border-red-400" : "border-zinc-200"}`}
                    />
                    <button type="button" onClick={applyPromo} className="px-3 py-2 bg-zinc-900 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition-colors">Apply</button>
                  </div>
                )}
                {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm border-t border-zinc-100 pt-4">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-800">${totalPrice.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({promoInput.toUpperCase()})</span>
                    <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-zinc-900 text-base border-t border-zinc-100 pt-2">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-4 w-full py-3.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-100 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Placing order...
                  </>
                ) : (
                  `Place Order — $${finalTotal.toFixed(2)}`
                )}
              </button>

              <p className="text-xs text-zinc-400 text-center mt-3">
                By placing your order you agree to our{" "}
                <Link href="/returns" className="underline hover:text-zinc-600">return policy</Link>.
                We will contact you to arrange payment.
              </p>
              <div className="flex justify-center gap-4 mt-4 text-zinc-400 text-xs">
                <span>Free Shipping</span><span>·</span><span>Easy Returns</span><span>·</span><span>Secure</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
