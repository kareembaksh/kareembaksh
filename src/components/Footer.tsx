import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">
              Kareem<span className="text-rose-400">Baksh</span>
            </h3>
            <p className="text-sm leading-relaxed">
              Premium products curated for modern living. Quality you can trust, style you will love.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products?category=Women%27s+Bags" className="hover:text-white transition-colors">Women&apos;s Bags</Link></li>
              <li><Link href="/products?category=Accessories" className="hover:text-white transition-colors">Accessories</Link></li>
              <li><Link href="/products?category=Beauty+%26+Fragrance" className="hover:text-white transition-colors">Beauty & Fragrance</Link></li>
              <li><Link href="/products?category=Home+%26+Living" className="hover:text-white transition-colors">Home & Living</Link></li>
              <li><Link href="/products?category=Kitchen+%26+Dining" className="hover:text-white transition-colors">Kitchen & Dining</Link></li>
              <li><Link href="/products?category=Outdoors+%26+Sports" className="hover:text-white transition-colors">Outdoors & Sports</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-zinc-400 leading-snug">31 Christie Street, Troy,<br />New York 12180, United States</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:3074301170" className="hover:text-white transition-colors">307 430 1170</a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:admin@kareembaksh.com" className="hover:text-white transition-colors">admin@kareembaksh.com</a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:support@kareembaksh.com" className="hover:text-white transition-colors">support@kareembaksh.com</a>
              </li>
              <li className="text-zinc-500 text-xs">Mon–Fri, 9am–5pm EST</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} Kareem Baksh LLC. All rights reserved.</p>
          <p>Secure payments · Free shipping · Easy returns</p>
        </div>
      </div>
    </footer>
  );
}
