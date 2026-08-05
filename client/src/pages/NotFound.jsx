import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Home,
  Sparkles,
  TrendingUp,
  Package,
  Zap,
  Flame,
  Copy,
  Check,
  Tag
} from "lucide-react";

// Floating Marketplace Items with magnetic cursor interaction
const FLOATING_ITEMS = [
  { id: 1, name: "Urban Sneakers", emoji: "👟", path: "/product?search=sneakers", initialX: 12, initialY: 22 },
  { id: 2, name: "Wireless Audio", emoji: "🎧", path: "/product?search=headphones", initialX: 84, initialY: 18 },
  { id: 3, name: "Smart Watches", emoji: "⌚", path: "/product?search=smartwatch", initialX: 16, initialY: 72 },
  { id: 4, name: "Designer Apparel", emoji: "👕", path: "/product?search=hoodies", initialX: 82, initialY: 76 },
  { id: 5, name: "Luxury Bags", emoji: "👜", path: "/product?search=bags", initialX: 25, initialY: 48 },
  { id: 6, name: "Sunglasses", emoji: "🕶️", path: "/product?search=sunglasses", initialX: 74, initialY: 46 }
];

const NotFound = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);

  // Cursor tracking state
  const [cursorPos, setCursorPos] = useState({ x: -300, y: -300 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [activeHoverItem, setActiveHoverItem] = useState(null);

  // Interactive Cursor Sparkle Trail
  const [trail, setTrail] = useState([]);

  // Secret Coupon State
  const [isCouponCopied, setIsCouponCopied] = useState(false);
  const [showSecretCoupon, setShowSecretCoupon] = useState(false);

  // Mouse move handler for magnetic attraction physics & cursor trail
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    setCursorPos({ x: clientX, y: clientY });
    setIsHovering(true);

    // Calculate magnetic 3D tilt rotation relative to screen center (-6deg to +6deg)
    const rx = ((clientY - innerHeight / 2) / (innerHeight / 2)) * -6;
    const ry = ((clientX - innerWidth / 2) / (innerWidth / 2)) * 6;
    setTilt({ rx, ry });

    // Generate lightweight cursor particle trail
    if (Math.random() > 0.4) {
      const newParticle = {
        id: Math.random() + "-" + Date.now(),
        x: clientX + (Math.random() * 12 - 6),
        y: clientY + (Math.random() * 12 - 6),
        size: Math.random() * 4 + 3,
        color: Math.random() > 0.5 ? "#2563EB" : "#F59E0B"
      };
      setTrail((prev) => [...prev.slice(-14), newParticle]);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ rx: 0, ry: 0 });
    setActiveHoverItem(null);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/product?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCopyCoupon = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText("CART404");
    setIsCouponCopied(true);
    setTimeout(() => setIsCouponCopied(false), 2400);
  };

  const quickLinks = [
    { label: "Deals", path: "/product?sort=deals", icon: Flame },
    { label: "New Arrivals", path: "/product?sort=new", icon: Sparkles },
    { label: "Electronics", path: "/category/electronics", icon: Zap },
    { label: "Fashion", path: "/category/fashion", icon: ShoppingBag },
    { label: "Grocery", path: "/category/grocery", icon: Package },
    { label: "Mobiles", path: "/category/mobiles", icon: TrendingUp }
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-6 selection:bg-blue-500 selection:text-white transition-colors duration-300 relative overflow-hidden select-none"
    >
      {/* Background Soft Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Dynamic Cursor Spotlight Beam */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(550px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(37, 99, 235, 0.14), transparent 75%)`
        }}
      />

      {/* Floating Sparkle Trail Particles */}
      {trail.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: "fixed",
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: "50%",
            zIndex: 40,
            pointerEvents: "none"
          }}
        />
      ))}

      {/* Custom High-Tech Cursor Lens Ring */}
      <div
        className="fixed w-10 h-10 rounded-full border-2 border-blue-500/50 dark:border-blue-400/50 bg-blue-500/5 pointer-events-none transition-transform duration-75 ease-out z-50 hidden md:flex items-center justify-center shadow-lg backdrop-blur-xs"
        style={{
          transform: `translate(${cursorPos.x - 20}px, ${cursorPos.y - 20}px) scale(${activeHoverItem ? 1.4 : isHovering ? 1 : 0})`,
          borderColor: activeHoverItem ? "#F59E0B" : "#2563EB"
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
      </div>

      {/* ========================================================================= */}
      {/* MAGNETIC FLOATING MARKETPLACE ITEMS (Attract towards cursor) */}
      {/* ========================================================================= */}
      {FLOATING_ITEMS.map((item) => {
        // Calculate distance from cursor to item position
        const screenW = typeof window !== "undefined" ? window.innerWidth : 1200;
        const screenH = typeof window !== "undefined" ? window.innerHeight : 800;
        const itemXPx = (item.initialX / 100) * screenW;
        const itemYPx = (item.initialY / 100) * screenH;

        const dx = cursorPos.x - itemXPx;
        const dy = cursorPos.y - itemYPx;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Magnetic pull offset (pulls item towards cursor when within 260px)
        const maxDist = 260;
        const pullFactor = dist < maxDist ? (1 - dist / maxDist) * 35 : 0;
        const offsetX = dist > 0 ? (dx / dist) * pullFactor : 0;
        const offsetY = dist > 0 ? (dy / dist) * pullFactor : 0;
        const isNear = dist < 140;

        return (
          <motion.div
            key={item.id}
            onClick={() => navigate(item.path)}
            onMouseEnter={() => setActiveHoverItem(item.id)}
            onMouseLeave={() => setActiveHoverItem(null)}
            animate={{
              x: offsetX,
              y: offsetY + Math.sin(Date.now() / 1000 + item.id) * 6,
              scale: isNear ? 1.25 : 1
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{
              position: "absolute",
              left: `${item.initialX}%`,
              top: `${item.initialY}%`
            }}
            className="z-20 hidden lg:flex flex-col items-center cursor-pointer group select-none"
          >
            <div className={`p-3 rounded-sm bg-white/90 dark:bg-slate-900/90 border transition-all duration-300 shadow-lg flex items-center justify-center text-2xl ${isNear
              ? "border-amber-500 shadow-amber-500/20 ring-4 ring-amber-500/10 scale-110"
              : "border-slate-200 dark:border-slate-800 hover:border-blue-500"
              }`}>
              <span>{item.emoji}</span>
            </div>
            <span className={`mt-1.5 px-2 py-0.5 rounded-sm text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md transition-all duration-200 ${isNear ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
              }`}>
              {item.name}
            </span>
          </motion.div>
        );
      })}

      {/* Secret Floating Discount Voucher Tag */}
      <motion.div
        animate={{
          y: [0, -8, 0]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", right: "12%", top: "28%" }}
        className="z-20 hidden xl:block"
      >
        {!showSecretCoupon ? (
          <button
            onClick={() => setShowSecretCoupon(true)}
            className="px-3 py-1.5 rounded-sm bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:scale-105 transition cursor-pointer"
          >
            <Tag size={13} />
            <span>Found Hidden 10% Coupon?</span>
          </button>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-sm p-2.5 flex items-center gap-2 shadow-2xl animate-fade-in text-white text-xs">
            <span className="font-mono font-bold text-amber-400">CART404</span>
            <button
              onClick={handleCopyCoupon}
              className="px-2.5 py-1 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold transition active:scale-95 cursor-pointer flex items-center gap-1"
            >
              {isCouponCopied ? <Check size={12} /> : <Copy size={12} />}
              <span>{isCouponCopied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* ========================================================================= */}
      {/* MAIN CONTENT CARD (Responds with 3D Tilt) */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: "transform 0.15s ease-out"
        }}
        className="relative z-10 w-full max-w-lg text-center space-y-6 flex flex-col items-center"
      >
        {/* Large 404 Heading */}
        <h1 className="text-8xl sm:text-9xl font-black tracking-tight leading-none text-slate-900 dark:text-white">
          4<span className="text-blue-600 dark:text-blue-400">0</span>4
        </h1>

        {/* Headline & Concise Subtitle */}
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            The page you requested doesn't exist or has been moved.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full space-y-3">
          <div className="relative shadow-xs rounded-sm">
            <input
              type="text"
              placeholder="Search products or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={16} />
            </div>
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-sm bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              Search
            </button>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-1.5 items-center justify-center pt-1">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => navigate(link.path)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  <Icon size={12} className="text-slate-400" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => navigate("/product")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide shadow-md transition active:scale-95 cursor-pointer"
          >
            <ShoppingBag size={15} />
            <span>Continue Shopping</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            <Home size={15} />
            <span>Go Home</span>
          </button>
        </div>
      </motion.div>

    </div>
  );
};

export default NotFound;
