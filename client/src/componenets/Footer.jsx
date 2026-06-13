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
    <footer className="relative bg-gradient-to-b from-[#0b0f19] to-[#030712] text-gray-300 overflow-hidden border-t border-slate-900">
      {/* Subtle background glow */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-orange-500/25 to-transparent" />
      
      {/* ── Value Props Section ── */}
      <div className="border-b border-slate-900 bg-slate-950/20 py-5">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Prop 1 */}
          <div className="flex items-center gap-3 transition-all duration-300 hover:translate-y-[-1px]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs tracking-wider uppercase">Free Shipping</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">On all orders over ₹999</p>
            </div>
          </div>
          {/* Prop 2 */}
          <div className="flex items-center gap-3 transition-all duration-300 hover:translate-y-[-1px]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs tracking-wider uppercase">Secure Checkout</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Stripe and Razorpay integrated</p>
            </div>
          </div>
          {/* Prop 3 */}
          <div className="flex items-center gap-3 transition-all duration-300 hover:translate-y-[-1px]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs tracking-wider uppercase">Hassle-Free Returns</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Easy 30-day self-service pickups</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Links & Newsletter ── */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr]">
          {/* Identity */}
          <div className="space-y-4">
            <Link to="/" className="group flex items-center gap-2 select-none">
              <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-950/40 w-10 h-10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(249,115,22,0.15)]">
                <Logo
                  variant="icon"
                  className="h-full w-full p-1 text-white transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white">
                  Cart<span className="text-orange-500 group-hover:text-orange-400 transition-colors duration-300">NOW</span>
                </span>
                <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-orange-400 group-hover:text-orange-300 transition-colors duration-300">
                  Everyday premium store
                </span>
              </span>
            </Link>
            <p className="max-w-xs text-xs leading-relaxed text-gray-400">
              Discover curated fashion, state-of-the-art AI Try-On experiences, simple checkout, and dynamic courier tracking.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-2.5">
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
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/40 border border-slate-700/50 text-gray-400 transition hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:-translate-y-0.5 duration-300"
                  aria-label={s.name}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">SHOPPING</h3>
            <ul className="mt-4 space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/product" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/tryon" className="text-orange-400 font-semibold hover:translate-x-1 transition-all duration-200 flex items-center gap-1">
                  <span>AI Try-On</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Need Help?
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">COLLECTIONS</h3>
            <ul className="mt-4 space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/product/men" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Men's Wardrobe
                </Link>
              </li>
              <li>
                <Link to="/product/women" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link to="/product/kid" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Kids' Selection
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  View Cart
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">SUBSCRIBE & SAVE</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Subscribe to receive styling updates and <strong>10% off</strong> your first checkout.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center max-w-sm">
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-slate-700/60 bg-slate-900/40 pl-4 pr-24 py-2 text-xs text-white outline-none placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 text-xs font-semibold text-white hover:brightness-105 hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all duration-200"
              >
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-gray-500">
              *Promotional updates only. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* ── Divider ── */}
        <hr className="mt-10 border-slate-900" />

        {/* ── Footer Bottom Bar ── */}
        <div className="mt-6 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left space-y-1">
            <p className="text-[11px] text-gray-500">
              © {new Date().getFullYear()} CartNOW Inc. All rights reserved.
            </p>
            <p className="text-[10px] text-gray-600">
              Secure processed payments. Sandbox simulated environments.
            </p>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-2">
            {["VISA", "MC", "STRIPE", "RZP"].map((badge) => (
              <div
                key={badge}
                className="flex h-6 w-10 items-center justify-center rounded bg-slate-950 border border-slate-900 text-gray-500 text-[9px] font-bold select-none tracking-wide hover:text-slate-300 hover:border-slate-700 transition-colors duration-200"
              >
                {badge}
              </div>
            ))}
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="group flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/30 border border-slate-700/60 text-gray-400 transition hover:bg-slate-800 hover:text-orange-400 hover:border-orange-500/40 hover:-translate-y-0.5 duration-250 cursor-pointer"
            title="Back to Top"
          >
            <svg className="h-4 w-4 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
