import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Cart<span className="text-gray-500">NOW</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
              A modern shopping experience with live product ratings, simple checkout, and clean order tracking.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link to="/" className="transition hover:text-white">Home</Link></li>
              <li><Link to="/about" className="transition hover:text-white">About</Link></li>
              <li><Link to="/product" className="transition hover:text-white">Products</Link></li>
              <li><Link to="/cart" className="transition hover:text-white">Cart</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">Categories</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link to="/product/men" className="transition hover:text-white">Men</Link></li>
              <li><Link to="/product/women" className="transition hover:text-white">Women</Link></li>
              <li><Link to="/product/kid" className="transition hover:text-white">Kids</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">Need help?</h3>
            <div className="mt-4 space-y-3 text-sm text-gray-400">
              <p>Email: support@cartnow.com</p>
              <p>Phone: +91 90000 00000</p>
              <p className="leading-6">
                Orders, reviews, profile, and cart are connected to your backend.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-sm text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} CartNOW. All rights reserved.</p>
          <p>Built for clean shopping and confident checkout.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
