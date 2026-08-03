import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Logo from "./Logo";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [openSections, setOpenSections] = useState({
    support: false,
    sellers: false,
    company: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
    <footer className="relative bg-[#09090B] text-gray-300 overflow-hidden border-t border-[#242A3B]">
      {/* Subtle background glow */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-[#2D3550] to-transparent" />
      
      {/* ── Value Props Section ── */}
      <div className="border-b border-[#242A3B] bg-[#0F1117] py-4 sm:py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-6 text-center sm:text-left">
          {/* Prop 1 */}
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 transition-all duration-300 hover:translate-y-[-1px]">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-[#151823] border border-[#242A3B] text-orange-400">
              <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-slate-100 dark:text-white text-[10px] sm:text-xs tracking-wider uppercase">Free Shipping</h4>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-0.5">On all orders over ₹999</p>
            </div>
          </div>
          {/* Prop 2 */}
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 transition-all duration-300 hover:translate-y-[-1px]">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-[#151823] border border-[#242A3B] text-orange-400">
              <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-slate-100 dark:text-white text-[10px] sm:text-xs tracking-wider uppercase">Secure Pay</h4>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-0.5">Stripe and Razorpay integrated</p>
            </div>
          </div>
          {/* Prop 3 */}
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 transition-all duration-300 hover:translate-y-[-1px]">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-[#151823] border border-[#242A3B] text-orange-400">
              <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-slate-100 dark:text-white text-[10px] sm:text-xs tracking-wider uppercase">Easy Returns</h4>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-0.5">Easy 30-day self-service pickups</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Links & Newsletter ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1.2fr] md:gap-8">
          {/* Identity */}
          <div className="space-y-4">
            <Link to="/" className="group flex items-center select-none">
              <Logo
                variant="horizontal"
                forceWhite={true}
                className="h-9 w-auto text-slate-100 dark:text-white"
              />
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
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B2030] border border-[#242A3B] text-gray-400 transition hover:bg-[#242A3B] hover:text-white hover:border-[#2D3550] hover:-translate-y-0.5 duration-300"
                  aria-label={s.name}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Customer Support */}
          <div className="border-b border-[#242A3B] md:border-b-0 pb-3 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection("support")}
              className="w-full md:cursor-default flex justify-between items-center md:block text-left outline-none cursor-pointer group"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100 dark:text-white">SUPPORT</h3>
              <span className="md:hidden text-gray-400 group-hover:text-white transition font-mono font-bold text-xs pr-1">
                {openSections.support ? "−" : "+"}
              </span>
            </button>
            <ul className={`mt-3 md:mt-4 space-y-2.5 text-xs font-medium transition-all duration-300 md:block ${openSections.support ? "block" : "hidden"}`}>
              <li>
                <Link to="/help" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Help Center & FAQ
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Refund & Returns
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  About Our Hubs
                </Link>
              </li>
            </ul>
          </div>

          {/* Seller Program */}
          <div className="border-b border-[#242A3B] md:border-b-0 pb-3 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection("sellers")}
              className="w-full md:cursor-default flex justify-between items-center md:block text-left outline-none cursor-pointer group"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100 dark:text-white">SELLERS</h3>
              <span className="md:hidden text-gray-400 group-hover:text-white transition font-mono font-bold text-xs pr-1">
                {openSections.sellers ? "−" : "+"}
              </span>
            </button>
            <ul className={`mt-3 md:mt-4 space-y-2.5 text-xs font-medium transition-all duration-300 md:block ${openSections.sellers ? "block" : "hidden"}`}>
              <li>
                <a href="/seller/login" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Seller Dashboard
                </a>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Seller Program Details
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Verification Badges
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Partner Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="border-b border-[#242A3B] md:border-b-0 pb-3 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection("company")}
              className="w-full md:cursor-default flex justify-between items-center md:block text-left outline-none cursor-pointer group"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100 dark:text-white">COMPANY</h3>
              <span className="md:hidden text-gray-400 group-hover:text-white transition font-mono font-bold text-xs pr-1">
                {openSections.company ? "−" : "+"}
              </span>
            </button>
            <ul className={`mt-3 md:mt-4 space-y-2.5 text-xs font-medium transition-all duration-300 md:block ${openSections.company ? "block" : "hidden"}`}>
              <li>
                <Link to="/about" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 inline-block">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-4 pt-2 md:pt-0">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100 dark:text-white">SUBSCRIBE & SAVE</h3>
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
                className="w-full rounded-full border border-[#242A3B] bg-[#151823] pl-4 pr-24 py-2 text-xs text-slate-100 dark:text-white outline-none placeholder:text-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#2D3550]"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 text-xs font-semibold text-slate-100 dark:text-white hover:brightness-105 hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all duration-200"
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
        <hr className="mt-10 border-[#242A3B]" />

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
                className="flex h-6 w-10 items-center justify-center rounded bg-[#1B2030] border border-[#242A3B] text-slate-400 text-[9px] font-bold select-none tracking-wide hover:text-slate-200 hover:border-[#2D3550] transition-colors duration-200"
              >
                {badge}
              </div>
            ))}
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="group flex h-8 w-8 items-center justify-center rounded-full bg-[#1B2030] border border-[#242A3B] text-gray-400 transition hover:bg-[#242A3B] hover:text-orange-400 hover:border-[#2D3550] hover:-translate-y-0.5 duration-250 cursor-pointer"
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
