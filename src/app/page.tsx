export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-100 dark:border-zinc-800">
        <span className="text-xl font-bold tracking-tight">Kareem Baksh</span>
        <div className="flex gap-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <a href="#about" className="hover:text-zinc-900 dark:hover:text-white transition-colors">About</a>
          <a href="#services" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Services</a>
          <a href="#contact" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Contact</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
          Welcome to<br />
          <span className="text-blue-600 dark:text-blue-400">Kareem Baksh LLC</span>
        </h1>
        <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mb-10">
          Professional services and solutions tailored to your needs.
        </p>
        <a
          href="#contact"
          className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Get in Touch
        </a>
      </section>

      {/* About */}
      <section id="about" className="bg-zinc-50 dark:bg-zinc-900 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">About Us</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed max-w-2xl">
            Kareem Baksh LLC is a professional services firm committed to delivering excellence.
            We bring expertise, integrity, and dedication to every engagement.
          </p>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-10">Services</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { title: "Consulting", desc: "Strategic advice and solutions for your business challenges." },
              { title: "Management", desc: "End-to-end project and operations management." },
              { title: "Development", desc: "Custom digital solutions built for performance and scale." },
            ].map((s) => (
              <div key={s.title} className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-zinc-50 dark:bg-zinc-900 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Contact</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-2">
            Email: <a href="mailto:admin@kareembaksh.com" className="text-blue-600 dark:text-blue-400 hover:underline">admin@kareembaksh.com</a>
          </p>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm">We&apos;ll get back to you within one business day.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-zinc-400 dark:text-zinc-600 border-t border-zinc-100 dark:border-zinc-800">
        © {new Date().getFullYear()} Kareem Baksh LLC. All rights reserved.
      </footer>
    </main>
  );
}
