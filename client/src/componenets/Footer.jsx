import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Logo from "./Logo";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Subscribed successfully! Check your inbox for the 10% discount code 🎁");
    setEmail("");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#0f172a] to-[#020617] text-gray-300 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      
      {/* ── Value Props Section ── */}
      <div className="border-b border-slate-800/60 bg-slate-900/30 py-8">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          {/* Prop 1 */}
          <div className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-lg bg-slate-900/20 border border-slate-800/30 hover:border-orange-500/20 transition-colors duration-300">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm tracking-wide">FREE STANDARD SHIPPING</h4>
              <p className="mt-1 text-xs text-gray-400">Complimentary delivery on all orders over ₹999</p>
            </div>
          </div>
          {/* Prop 2 */}
          <div className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-lg bg-slate-900/20 border border-slate-800/30 hover:border-orange-500/20 transition-colors duration-300">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm tracking-wide">SECURE SSL CHECKOUT</h4>
              <p className="mt-1 text-xs text-gray-400">Stripe and Razorpay verification protocols enabled</p>
            </div>
          </div>
          {/* Prop 3 */}
          <div className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-lg bg-slate-900/20 border border-slate-800/30 hover:border-orange-500/20 transition-colors duration-300">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm tracking-wide">HASSLE-FREE RETURNS</h4>
              <p className="mt-1 text-xs text-gray-400">Easy 30-day online self-service return pickups</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Links & Newsletter ── */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.8fr]">
          {/* Identity */}
          <div className="space-y-6">
            <Link to="/" className="group flex items-center gap-3 select-none">
              <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <Logo
                  variant="icon"
                  className="h-full w-full p-1.5 text-white transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-white">
                  Cart<span className="text-orange-500 group-hover:text-orange-400 transition-colors duration-300">NOW</span>
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-orange-400 group-hover:text-orange-300 transition-colors duration-300">
                  Everyday premium store
                </span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-6 text-gray-400">
              Discover curated fashion, state-of-the-art AI Try-On experiences, simple checkout, and dynamic courier tracking. Elevating standard shopping into a premium lifestyle.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3.5">
              {[
                { name: "Facebook", path: "https://facebook.com", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                { name: "Instagram", path: "https://instagram.com", icon: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z M17.5 6.5h.01" },
                { name: "Twitter", path: "https://twitter.com", icon: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" }
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/40 border border-slate-700/50 text-gray-400 transition hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:-translate-y-1 duration-300"
                  aria-label={s.name}
                >
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">SHOPPING</h3>
            <ul className="mt-5 space-y-3.5 text-sm font-medium">
              <li><Link to="/" className="hover:text-orange-400 transition-colors duration-250 flex items-center gap-1.5"><span>Home</span></Link></li>
              <li><Link to="/about" className="hover:text-orange-400 transition-colors duration-250 flex items-center gap-1.5"><span>About Us</span></Link></li>
              <li><Link to="/product" className="hover:text-orange-400 transition-colors duration-250 flex items-center gap-1.5"><span>All Products</span></Link></li>
              <li><Link to="/tryon" className="hover:text-orange-400 transition-colors duration-250 flex items-center gap-1.5 text-orange-400 font-semibold"><span className="flex items-center gap-1">AI Try-On <span className="text-[9px] bg-orange-500 text-white rounded px-1 animate-pulse">NEW</span></span></Link></li>
              <li><Link to="/help" className="hover:text-orange-400 transition-colors duration-250 flex items-center gap-1.5"><span>Need Help?</span></Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">COLLECTIONS</h3>
            <ul className="mt-5 space-y-3.5 text-sm font-medium">
              <li><Link to="/product/men" className="hover:text-orange-400 transition-colors duration-250">Men's Wardrobe</Link></li>
              <li><Link to="/product/women" className="hover:text-orange-400 transition-colors duration-250">Women's Collection</Link></li>
              <li><Link to="/product/kid" className="hover:text-orange-400 transition-colors duration-250">Kids' Selection</Link></li>
              <li><Link to="/cart" className="hover:text-orange-400 transition-colors duration-250">View Cart</Link></li>
              <li><Link to="/profile" className="hover:text-orange-400 transition-colors duration-250">My Profile</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">SUBSCRIBE & SAVE</h3>
            <p className="text-sm text-gray-400 leading-6">
              Subscribe to the CartNOW inner circle to receive styling tips, stock updates, and <strong>10% off</strong> your first checkout.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
              />
              <button
                type="submit"
                className="shrink-0 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:brightness-105 active:scale-95"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-500">
              *By signing up, you agree to receive promotional updates. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* ── Divider ── */}
        <hr className="mt-14 border-slate-800/80" />

        {/* ── Footer Bottom Bar ── */}
        <div className="mt-8 flex flex-col-reverse items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left space-y-1.5">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} CartNOW Inc. All rights reserved.
            </p>
            <p className="text-[11px] text-gray-600">
              Payments processed securely. Simulated sandbox configurations in development mode.
            </p>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-3">
            {/* Visa */}
            <div className="flex h-7 w-11 items-center justify-center rounded bg-slate-900 border border-slate-800 text-gray-400 text-[10px] font-bold select-none tracking-wide">VISA</div>
            {/* Mastercard */}
            <div className="flex h-7 w-11 items-center justify-center rounded bg-slate-900 border border-slate-800 text-gray-400 text-[10px] font-bold select-none tracking-wide">MC</div>
            {/* Stripe */}
            <div className="flex h-7 w-11 items-center justify-center rounded bg-slate-900 border border-slate-800 text-gray-400 text-[10px] font-bold select-none tracking-wide">STRIPE</div>
            {/* Razorpay */}
            <div className="flex h-7 w-11 items-center justify-center rounded bg-slate-900 border border-slate-800 text-gray-400 text-[10px] font-bold select-none tracking-wide">RZP</div>
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="group flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/30 border border-slate-700/60 text-gray-400 transition hover:bg-slate-800 hover:text-orange-400 hover:border-orange-500/40 hover:-translate-y-0.5 duration-250 cursor-pointer"
            title="Back to Top"
          >
            <svg className="h-4.5 w-4.5 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
