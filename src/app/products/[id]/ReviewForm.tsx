"use client";

import { useState } from "react";

interface Props {
  productId: number;
  productName: string;
}

export default function ReviewForm({ productId, productName }: Props) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", title: "", body: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.title.trim()) e.title = "Review title is required";
    if (!form.body.trim() || form.body.length < 10) e.body = "Please write at least 10 characters";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const review = {
      id: `rv-${Date.now()}`,
      date: new Date().toISOString(),
      productId,
      productName,
      author: form.name,
      email: form.email,
      rating,
      title: form.title,
      body: form.body,
      status: "Pending",
      reply: "",
    };

    try {
      const existing = JSON.parse(localStorage.getItem("kb_reviews") || "[]");
      localStorage.setItem("kb_reviews", JSON.stringify([review, ...existing]));
    } catch { /* localStorage unavailable */ }

    setSubmitted(true);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Write a Review
      </button>
    );
  }

  if (submitted) {
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
        <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm font-semibold text-green-800">Review submitted!</p>
        <p className="text-xs text-green-600 mt-1">Your review will appear after approval. Thank you!</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-900">Write a Review</h3>
        <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Star rating */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Your Rating</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className="focus:outline-none"
              >
                <svg className={`w-7 h-7 transition-colors ${s <= (hover || rating) ? "text-amber-400 fill-current" : "text-zinc-200 fill-current"}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Your Name", key: "name", placeholder: "Jane Smith" },
            { label: "Email", key: "email", placeholder: "jane@example.com" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-zinc-600 mb-1">{label}</label>
              <input
                type={key === "email" ? "email" : "text"}
                value={form[key as keyof typeof form]}
                onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: "" })); }}
                placeholder={placeholder}
                className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 ${errors[key] ? "border-red-400 bg-red-50" : "border-zinc-200 bg-white"}`}
              />
              {errors[key] && <p className="text-xs text-red-500 mt-0.5">{errors[key]}</p>}
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Review Title</label>
          <input
            type="text"
            value={form.title}
            onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(er => ({ ...er, title: "" })); }}
            placeholder="Summarize your experience"
            className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 ${errors.title ? "border-red-400 bg-red-50" : "border-zinc-200 bg-white"}`}
          />
          {errors.title && <p className="text-xs text-red-500 mt-0.5">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Your Review</label>
          <textarea
            value={form.body}
            onChange={e => { setForm(f => ({ ...f, body: e.target.value })); setErrors(er => ({ ...er, body: "" })); }}
            placeholder="Tell others about your experience with this product..."
            rows={4}
            className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none ${errors.body ? "border-red-400 bg-red-50" : "border-zinc-200 bg-white"}`}
          />
          {errors.body && <p className="text-xs text-red-500 mt-0.5">{errors.body}</p>}
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Submit Review
        </button>
        <p className="text-xs text-zinc-400 text-center">Reviews are moderated and appear after approval.</p>
      </form>
    </div>
  );
}
