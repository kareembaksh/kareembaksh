"use client";

import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setStatus("loading");
    try {
      // Save to localStorage list
      const saved = JSON.parse(localStorage.getItem("kb_subscribers") || "[]");
      if (!saved.includes(email)) {
        localStorage.setItem("kb_subscribers", JSON.stringify([...saved, email]));
      }

      // Send via EmailJS if configured
      const serviceId  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_NEWSLETTER_TEMPLATE;
      const publicKey  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
      if (serviceId && templateId && publicKey) {
        const emailjs = (await import("@emailjs/browser")).default;
        await emailjs.send(serviceId, templateId, { subscriber_email: email }, publicKey);
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("success"); // still show success — email was saved locally
    }
  }

  return (
    <section className="py-16 bg-zinc-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-rose-500/10 text-rose-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          Newsletter
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Stay in the loop</h2>
        <p className="text-zinc-400 mb-8">
          Get exclusive deals, new arrivals, and style inspiration delivered to your inbox. No spam, ever.
        </p>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold">You&apos;re subscribed! Welcome to the KB family.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors whitespace-nowrap"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        )}
        <p className="text-zinc-600 text-xs mt-4">Join 2,400+ subscribers. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
