"use client";

import { useState } from "react";

const faqs = [
  {
    category: "Orders & Shipping",
    items: [
      {
        q: "How long does shipping take?",
        a: "Standard shipping takes 7–15 business days. Expedited shipping takes 3–7 business days. All orders ship for free regardless of order size.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order ships, you'll receive a confirmation email with your USPS tracking number. You can also use our Track Order page to check your package status.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! We offer free shipping on every single order, no minimum purchase required. It's always free.",
      },
      {
        q: "Do you ship internationally?",
        a: "We currently ship within the United States only, including Alaska and Hawaii. We hope to expand internationally in the future.",
      },
      {
        q: "Can I change my shipping address after placing an order?",
        a: "Please contact us immediately at support@kareembaksh.com if you need to change your address. We can update it if the order hasn't shipped yet.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 30 days of delivery. Items must be in original, unused condition with all packaging and tags. Visit our Returns & Refunds page for full details.",
      },
      {
        q: "How long does a refund take?",
        a: "Once we receive and inspect your return (3–5 business days), we process the refund within 2 business days. It may take an additional 5–10 business days to appear on your bank statement.",
      },
      {
        q: "Who pays for return shipping?",
        a: "Customers are responsible for return shipping costs, except when the item arrived damaged or was incorrect — in that case we cover return shipping in full.",
      },
      {
        q: "I received a damaged item. What do I do?",
        a: "We're so sorry! Please email support@kareembaksh.com with a photo of the damage within 7 days of delivery. We'll send a replacement or issue a full refund at no cost to you.",
      },
    ],
  },
  {
    category: "Products",
    items: [
      {
        q: "Are the products authentic?",
        a: "Yes, all products in our store are genuine and sourced from verified suppliers. We stand behind every item we sell.",
      },
      {
        q: "How do I know which size to order?",
        a: "Product dimensions and sizing details are listed on each product page. If you have questions about a specific item, email support@kareembaksh.com and we'll help.",
      },
      {
        q: "Are product images accurate?",
        a: "We do our best to show accurate representations of our products. Colors may vary slightly depending on your screen's display settings.",
      },
    ],
  },
  {
    category: "Payment & Security",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) as well as PayPal. All payments are secured with SSL encryption.",
      },
      {
        q: "Is my payment information safe?",
        a: "Absolutely. We use industry-standard SSL encryption and never store your full card details. Your payment data is processed securely by our payment provider.",
      },
      {
        q: "Will I be charged sales tax?",
        a: "Sales tax is calculated at checkout based on your shipping address, in compliance with applicable state laws.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 group"
      >
        <span className="text-sm font-medium text-zinc-800 group-hover:text-rose-500 transition-colors">{q}</span>
        <svg
          className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="text-sm text-zinc-500 leading-relaxed pb-4">{a}</p>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <main className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-rose-50 to-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-zinc-500">Everything you need to know about shopping with us.</p>
        </div>
      </section>

      <section className="py-14 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-lg font-bold text-zinc-900 mb-4 pb-2 border-b border-zinc-200">{section.category}</h2>
            <div>
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        <div className="bg-zinc-50 rounded-2xl p-8 text-center">
          <p className="text-zinc-600 mb-4">Still have questions? We're happy to help.</p>
          <a
            href="mailto:support@kareembaksh.com"
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
          >
            Email Support
          </a>
        </div>
      </section>
    </main>
  );
}
