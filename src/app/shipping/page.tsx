import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy | Kareem Baksh Store",
  description: "Free shipping on every order. Learn about delivery times, carriers, and shipping details.",
};

export default function ShippingPage() {
  return (
    <main className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-rose-50 to-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">Shipping Policy</h1>
          <p className="text-zinc-500">Last updated: May 2025</p>
        </div>
      </section>

      <section className="py-14 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-rose-700 text-lg">Free Shipping on Every Order</p>
            <p className="text-rose-600 text-sm">No minimum purchase required. Free shipping always.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Processing Time</h2>
          <p className="text-zinc-600 leading-relaxed">
            Orders are processed within <strong>1–3 business days</strong> of payment confirmation (Monday–Friday, excluding US federal holidays). You will receive a shipping confirmation email with a tracking number once your order has shipped.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Estimated Delivery Times</h2>
          <div className="overflow-hidden border border-zinc-200 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-zinc-700">Shipping Method</th>
                  <th className="text-left px-5 py-3 font-semibold text-zinc-700">Estimated Delivery</th>
                  <th className="text-left px-5 py-3 font-semibold text-zinc-700">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="px-5 py-3 text-zinc-700">Standard Shipping</td>
                  <td className="px-5 py-3 text-zinc-600">7–15 business days</td>
                  <td className="px-5 py-3 text-rose-600 font-semibold">FREE</td>
                </tr>
                <tr className="bg-zinc-50/50">
                  <td className="px-5 py-3 text-zinc-700">Expedited Shipping</td>
                  <td className="px-5 py-3 text-zinc-600">3–7 business days</td>
                  <td className="px-5 py-3 text-rose-600 font-semibold">FREE</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-400 mt-3">Delivery times are estimates and may vary due to carrier delays, weather, or peak seasons.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Carriers</h2>
          <p className="text-zinc-600 leading-relaxed">
            We ship via <strong>USPS</strong>, <strong>UPS</strong>, and <strong>FedEx</strong>. The carrier is selected based on your location and the size of your order. All shipments include tracking, which will be emailed to you at time of dispatch.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Shipping Destinations</h2>
          <p className="text-zinc-600 leading-relaxed">
            We currently ship to all <strong>50 US states</strong>, including Alaska and Hawaii. We do not ship to US territories (Puerto Rico, Guam, etc.) or internationally at this time.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Order Tracking</h2>
          <p className="text-zinc-600 leading-relaxed mb-4">
            Once your order ships, you'll receive a tracking number by email. You can track your package directly on the USPS website or via our Track Order page.
          </p>
          <a
            href="/track-order"
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
          >
            Track Your Order
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Missing or Delayed Packages</h2>
          <p className="text-zinc-600 leading-relaxed">
            If your tracking shows "delivered" but you haven't received your package, please check with neighbors and your building mailroom first. If you still cannot locate your package, contact us at{" "}
            <a href="mailto:support@kareembaksh.com" className="text-rose-500 hover:underline">support@kareembaksh.com</a>{" "}
            within <strong>7 days</strong> of the delivery date and we will investigate immediately.
          </p>
        </div>

        <div className="border-t border-zinc-100 pt-8">
          <p className="text-sm text-zinc-500">
            Questions about your shipment?{" "}
            <a href="/support" className="text-rose-500 hover:underline font-medium">Contact our support team</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
