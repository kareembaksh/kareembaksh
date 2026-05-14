"use client";

import { useState } from "react";

export default function TrackOrderPage() {
  const [trackingNumber, setTrackingNumber] = useState("");

  function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    const cleaned = trackingNumber.trim().replace(/\s+/g, "");
    window.open(`https://tools.usps.com/go/TrackConfirmAction?tLabels=${cleaned}`, "_blank");
  }

  return (
    <main className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-rose-50 to-white py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">Track Your Order</h1>
          <p className="text-zinc-500">
            Enter your USPS tracking number below to check your shipment status.
          </p>
        </div>
      </section>

      <section className="py-14 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Tracking form */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-zinc-900">USPS Tracking</h2>
          </div>

          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label htmlFor="tracking" className="block text-sm font-medium text-zinc-700 mb-2">
                Tracking Number
              </label>
              <input
                id="tracking"
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. 9400111899223407706985"
                className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
              />
              <p className="text-xs text-zinc-400 mt-2">
                Your tracking number was included in your shipping confirmation email.
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Track Package
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </form>
        </div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          <div className="border border-zinc-100 rounded-xl p-5">
            <p className="font-semibold text-zinc-900 text-sm mb-2">Where is my tracking number?</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Your tracking number is in the shipping confirmation email we sent you. Check your spam folder if you don&apos;t see it. It typically starts with "9400" for USPS.
            </p>
          </div>
          <div className="border border-zinc-100 rounded-xl p-5">
            <p className="font-semibold text-zinc-900 text-sm mb-2">When will tracking update?</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Tracking information may take up to 24–48 hours to appear after your label is created. If there's no update after 3 business days, contact us.
            </p>
          </div>
        </div>

        {/* Direct USPS link */}
        <div className="bg-zinc-50 rounded-2xl p-6 text-center">
          <p className="text-sm text-zinc-600 mb-4">
            Prefer to track directly on the USPS website?
          </p>
          <a
            href="https://tools.usps.com/go/TrackConfirmAction"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-zinc-300 hover:border-rose-400 bg-white text-zinc-700 hover:text-rose-500 font-semibold px-6 py-3 rounded-full transition-all text-sm"
          >
            Go to USPS.com
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-500">
            Package lost or not moving?{" "}
            <a href="/support" className="text-rose-500 hover:underline font-medium">Contact our support team</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
