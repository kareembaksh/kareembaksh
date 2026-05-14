import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Refunds | Kareem Baksh Store",
  description: "Easy 30-day returns. Learn how to return a product and get your refund.",
};

export default function ReturnsPage() {
  return (
    <main className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-rose-50 to-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">Returns & Refunds</h1>
          <p className="text-zinc-500">Last updated: May 2025</p>
        </div>
      </section>

      <section className="py-14 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-rose-700 text-lg">30-Day Hassle-Free Returns</p>
            <p className="text-rose-600 text-sm">Not satisfied? Return it within 30 days for a full refund.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Return Eligibility</h2>
          <p className="text-zinc-600 leading-relaxed mb-4">
            We accept returns within <strong>30 days</strong> of the delivery date. To be eligible for a return, your item must be:
          </p>
          <ul className="space-y-2">
            {[
              "In its original, unused condition",
              "In the original packaging with all tags attached",
              "Not damaged, stained, or altered in any way",
              "Accompanied by proof of purchase (order number or receipt)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-zinc-600 text-sm">
                <svg className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Non-Returnable Items</h2>
          <p className="text-zinc-600 leading-relaxed mb-3">The following items cannot be returned:</p>
          <ul className="space-y-2">
            {[
              "Opened beauty and fragrance products (for hygiene reasons)",
              "Items marked as Final Sale at time of purchase",
              "Damaged items due to customer misuse or accidents",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-zinc-600 text-sm">
                <svg className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-4">How to Start a Return</h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Contact Us", desc: "Email support@kareembaksh.com with your order number and reason for return. We'll respond within 24 hours with a Return Merchandise Authorization (RMA) number." },
              { step: "2", title: "Pack Your Item", desc: "Securely package the item in its original packaging with all included accessories and documentation." },
              { step: "3", title: "Ship It Back", desc: "Ship the item to our address using any trackable carrier. Customers are responsible for return shipping costs unless the item arrived damaged or incorrect." },
              { step: "4", title: "Receive Your Refund", desc: "Once we receive and inspect your return (typically 3–5 business days), we will process your refund to the original payment method." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 text-sm mb-1">{title}</p>
                  <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Refund Timeline</h2>
          <div className="overflow-hidden border border-zinc-200 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-zinc-700">Step</th>
                  <th className="text-left px-5 py-3 font-semibold text-zinc-700">Timeframe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="px-5 py-3 text-zinc-700">Return inspection</td>
                  <td className="px-5 py-3 text-zinc-600">3–5 business days after receipt</td>
                </tr>
                <tr className="bg-zinc-50/50">
                  <td className="px-5 py-3 text-zinc-700">Refund processed</td>
                  <td className="px-5 py-3 text-zinc-600">Within 2 business days of approval</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 text-zinc-700">Refund posted to account</td>
                  <td className="px-5 py-3 text-zinc-600">5–10 business days (bank dependent)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Damaged or Incorrect Items</h2>
          <p className="text-zinc-600 leading-relaxed">
            If you received a damaged, defective, or incorrect item, please contact us immediately at{" "}
            <a href="mailto:support@kareembaksh.com" className="text-rose-500 hover:underline">support@kareembaksh.com</a>{" "}
            with a photo of the item. We will send a replacement or issue a full refund at no cost to you, including covering return shipping.
          </p>
        </div>

        <div className="border-t border-zinc-100 pt-8">
          <p className="text-sm text-zinc-500">
            Need help with a return?{" "}
            <a href="/support" className="text-rose-500 hover:underline font-medium">Contact our support team</a> and we'll guide you through the process.
          </p>
        </div>
      </section>
    </main>
  );
}
