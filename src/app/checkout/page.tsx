"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

interface FormData {
  name: string; email: string; phone: string;
  address: string; city: string; state: string; zip: string; country: string;
  notes: string;
}

const EMPTY: FormData = { name:"", email:"", phone:"", address:"", city:"", state:"", zip:"", country:"US", notes:"" };

function genOrderId() {
  const n = String(Date.now()).slice(-6);
  return `KB-${new Date().getFullYear()}-${n}`;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm]       = useState<FormData>(EMPTY);
  const [errors, setErrors]   = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId]     = useState("");

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const id = genOrderId();
    const order = {
      id,
      date: new Date().toISOString(),
      customer: {
        name: form.name, email: form.email, phone: form.phone,
        address: form.address, city: form.city, state: form.state, zip: form.zip,
      },
      items: items.map(i => ({ productId: i.id, name: i.name, price: i.price, qty: i.quantity, image: i.image })),
      total: totalPrice,
      status: "Pending",
      tracking: "",
      notes: form.notes,
    };

    try {
      const existing = JSON.parse(localStorage.getItem("kb_orders") || "[]");
      localStorage.setItem("kb_orders", JSON.stringify([order, ...existing]));
    } catch { /* localStorage unavailable */ }

    setOrderId(id);
    clearCart();
    setSubmitted(true);
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
            We&apos;ll email you at <span className="font-semibold">{form.email}</span> with updates.
          </p>
          <div className="bg-zinc-50 rounded-2xl p-4 text-left text-sm text-zinc-600 mb-8 space-y-1">
            <p><span className="font-medium text-zinc-800">Shipping to:</span> {form.address}, {form.city}, {form.state} {form.zip}</p>
            <p><span className="font-medium text-zinc-800">Phone:</span> {form.phone}</p>
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
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
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
            {/* Contact */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-zinc-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" name="name" placeholder="Jane Smith" />
                <Field label="Email Address" name="email" type="email" placeholder="jane@example.com" half />
                <Field label="Phone Number" name="phone" type="tel" placeholder="+1 555 000 0000" half />
              </div>
            </div>

            {/* Shipping */}
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

            {/* Notes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-zinc-900 mb-4">Order Notes <span className="text-zinc-400 font-normal text-sm">(optional)</span></h2>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
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
              <div className="space-y-3 mb-4">
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
              <div className="border-t border-zinc-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-800">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-zinc-900 text-base border-t border-zinc-100 pt-2">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-100"
              >
                Place Order — ${totalPrice.toFixed(2)}
              </button>

              <p className="text-xs text-zinc-400 text-center mt-3">
                By placing your order you agree to our{" "}
                <Link href="/returns" className="underline hover:text-zinc-600">return policy</Link>.
                We will contact you to arrange payment.
              </p>

              {/* Trust badges */}
              <div className="flex justify-center gap-4 mt-4 text-zinc-400 text-xs">
                <span>Free Shipping</span>
                <span>·</span>
                <span>Easy Returns</span>
                <span>·</span>
                <span>Secure</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
