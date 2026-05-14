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
              <li><Link href="/products?category=Hand+Sanitizers" className="hover:text-white transition-colors">Hand Sanitizers</Link></li>
              <li><Link href="/products?category=Skincare" className="hover:text-white transition-colors">Skincare</Link></li>
              <li><Link href="/products?category=Accessories" className="hover:text-white transition-colors">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:admin@kareembaksh.com" className="hover:text-white transition-colors">
                  admin@kareembaksh.com
                </a>
              </li>
              <li className="text-zinc-500 text-xs mt-2">Mon–Fri, 9am–5pm EST</li>
            </ul>
            <div className="flex gap-3 mt-4">
              {["instagram", "facebook", "twitter"].map((s) => (
                <a key={s} href="#" className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors">
                  <span className="text-xs capitalize text-zinc-400">{s[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
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
