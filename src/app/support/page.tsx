import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | Kareem Baksh Store",
  description: "Contact our support team for help with orders, products, or anything else.",
};

export default function SupportPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">How Can We Help?</h1>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto">
            Our team is here Monday–Friday, 9am–5pm EST. Reach out anytime and we'll get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-3 gap-6 mb-14">
          <a
            href="mailto:support@kareembaksh.com"
            className="border border-zinc-200 rounded-2xl p-6 hover:border-rose-300 hover:shadow-sm transition-all text-center group"
          >
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-rose-200 transition-colors">
              <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Email Support</h3>
            <p className="text-sm text-zinc-500 mb-2">We reply within 24 hours</p>
            <p className="text-sm text-rose-500 font-medium">support@kareembaksh.com</p>
          </a>

          <a
            href="tel:3074301170"
            className="border border-zinc-200 rounded-2xl p-6 hover:border-rose-300 hover:shadow-sm transition-all text-center group"
          >
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-rose-200 transition-colors">
              <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Phone Support</h3>
            <p className="text-sm text-zinc-500 mb-2">Mon–Fri, 9am–5pm EST</p>
            <p className="text-sm text-rose-500 font-medium">307 430 1170</p>
          </a>

          <div className="border border-zinc-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Our Address</h3>
            <p className="text-sm text-zinc-500 mb-2">Kareem Baksh LLC</p>
            <p className="text-sm text-zinc-600">31 Christie Street, Troy,<br />New York 12180, USA</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-zinc-50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Quick Links</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { href: "/track-order", label: "Track My Order", desc: "Check your order status via USPS" },
              { href: "/returns", label: "Returns & Refunds", desc: "Start a return or check refund status" },
              { href: "/shipping", label: "Shipping Policy", desc: "Delivery times and shipping info" },
              { href: "/faq", label: "FAQ", desc: "Answers to common questions" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 bg-white border border-zinc-200 rounded-xl p-4 hover:border-rose-300 hover:shadow-sm transition-all group"
              >
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900 text-sm group-hover:text-rose-500 transition-colors">{link.label}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{link.desc}</p>
                </div>
                <svg className="w-4 h-4 text-zinc-400 group-hover:text-rose-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
