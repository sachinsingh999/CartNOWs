import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Zap,
  Tag,
  Clock,
  Flame,
  Percent,
  BadgePercent,
  ShieldCheck,
  Eye,
  ShoppingCart,
  Heart,
  Star,
  CheckCircle2,
  SlidersHorizontal,
  Radar
} from "lucide-react";
import { toast } from "react-toastify";

/* Curated Fallback Data for Budget Radar Tiers */
const BUDGET_FALLBACKS = {
  under499: [
    {
      _id: "budget_499_1",
      name: "Braided 65W Fast Charging Type-C Cable (2M)",
      price: 349,
      originalPrice: 899,
      category: "Electronics",
      images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 250,
      dropText: "Dropped ₹250 today",
      stock: 50,
      rating: 4.8,
      reviewsCount: 320
    },
    {
      _id: "budget_499_2",
      name: "Minimalist Matte Stainless Cardholder Wallet",
      price: 449,
      originalPrice: 1199,
      category: "Accessories",
      images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 400,
      dropText: "Lowest in 30 Days",
      stock: 35,
      rating: 4.7,
      reviewsCount: 190
    },
    {
      _id: "budget_499_3",
      name: "Magnetic Car Air Vent Phone Mount",
      price: 399,
      originalPrice: 999,
      category: "Automotive",
      images: ["https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 300,
      dropText: "Dropped ₹300 today",
      stock: 42,
      rating: 4.6,
      reviewsCount: 145
    },
    {
      _id: "budget_499_4",
      name: "Ergonomic Memory Foam Mouse Wrist Rest",
      price: 499,
      originalPrice: 1299,
      category: "Peripherals",
      images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 450,
      dropText: "62% Price Drop",
      stock: 28,
      rating: 4.9,
      reviewsCount: 410
    }
  ],
  under999: [
    {
      _id: "budget_999_1",
      name: "Bluetooth 5.3 Deep Bass Neckband Earphones",
      price: 899,
      originalPrice: 2499,
      category: "Audio",
      images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 800,
      dropText: "Dropped ₹800 today",
      stock: 30,
      rating: 4.8,
      reviewsCount: 540
    },
    {
      _id: "budget_999_2",
      name: "Ultra-Compact 10000mAh Power Bank 22.5W",
      price: 949,
      originalPrice: 2199,
      category: "Electronics",
      images: ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 650,
      dropText: "57% Price Drop",
      stock: 45,
      rating: 4.7,
      reviewsCount: 290
    },
    {
      _id: "budget_999_3",
      name: "Water-Resistant Anti-Theft Urban Daypack",
      price: 799,
      originalPrice: 1999,
      category: "Bags",
      images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 600,
      dropText: "Dropped ₹600 today",
      stock: 20,
      rating: 4.9,
      reviewsCount: 380
    },
    {
      _id: "budget_999_4",
      name: "Smart RGB Ambient LED Monitor Light Bar",
      price: 999,
      originalPrice: 2899,
      category: "Lighting",
      images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 900,
      dropText: "66% Price Drop",
      stock: 18,
      rating: 4.8,
      reviewsCount: 460
    }
  ],
  under1999: [
    {
      _id: "budget_1999_1",
      name: "Active Noise Cancelling Wireless Over-Ear Headphones",
      price: 1799,
      originalPrice: 4999,
      category: "Audio",
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 1800,
      dropText: "Dropped ₹1,800 today",
      stock: 22,
      rating: 4.9,
      reviewsCount: 820
    },
    {
      _id: "budget_1999_2",
      name: "1.96\" AMOLED Bluetooth Calling Smartwatch",
      price: 1899,
      originalPrice: 5999,
      category: "Wearables",
      images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 2100,
      dropText: "68% Mega Drop",
      stock: 26,
      rating: 4.8,
      reviewsCount: 650
    },
    {
      _id: "budget_1999_3",
      name: "Retro Mechanical Gaming Keyboard Hot-Swappable",
      price: 1699,
      originalPrice: 4299,
      category: "Peripherals",
      images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 1200,
      dropText: "Dropped ₹1,200 today",
      stock: 15,
      rating: 4.8,
      reviewsCount: 310
    },
    {
      _id: "budget_1999_4",
      name: "Ultralight Breathable Cushion Running Shoes",
      price: 1499,
      originalPrice: 3999,
      category: "Footwear",
      images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 1500,
      dropText: "63% Price Drop",
      stock: 35,
      rating: 4.9,
      reviewsCount: 920
    }
  ],
  drops50: [
    {
      _id: "budget_drop_1",
      name: "True 65W GaN Fast Charger 3-Port Matrix",
      price: 1299,
      originalPrice: 3499,
      category: "Electronics",
      images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 2200,
      dropText: "63% Off Deal",
      stock: 19,
      rating: 4.9,
      reviewsCount: 440
    },
    {
      _id: "budget_drop_2",
      name: "Titanium Polarized UV400 Wayfarer Sunglasses",
      price: 899,
      originalPrice: 2999,
      category: "Fashion",
      images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 2100,
      dropText: "70% Price Drop",
      stock: 40,
      rating: 4.8,
      reviewsCount: 510
    },
    {
      _id: "budget_drop_3",
      name: "Wireless Magnetic Charging Station 3-in-1",
      price: 1499,
      originalPrice: 4499,
      category: "Electronics",
      images: ["https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 3000,
      dropText: "Dropped ₹3,000 today",
      stock: 14,
      rating: 4.9,
      reviewsCount: 780
    },
    {
      _id: "budget_drop_4",
      name: "Waterproof Travel Grooming & Trimmer Kit Pro",
      price: 999,
      originalPrice: 2799,
      category: "Grooming",
      images: ["https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 1800,
      dropText: "64% Price Drop",
      stock: 28,
      rating: 4.7,
      reviewsCount: 260
    }
  ],
  under299: [
    {
      _id: "budget_299_1",
      name: "High-Speed MicroSD / USB-C Card Reader",
      price: 199,
      originalPrice: 599,
      category: "Electronics",
      images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 200,
      dropText: "67% Price Drop",
      stock: 60,
      rating: 4.6,
      reviewsCount: 190
    },
    {
      _id: "budget_299_2",
      name: "Microfiber Display & Lens Cleaning Kit",
      price: 249,
      originalPrice: 699,
      category: "Accessories",
      images: ["https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 250,
      dropText: "Dropped ₹250 today",
      stock: 75,
      rating: 4.8,
      reviewsCount: 310
    },
    {
      _id: "budget_299_3",
      name: "Silicone Cable Management Organizer (5-Pack)",
      price: 179,
      originalPrice: 499,
      category: "Peripherals",
      images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 180,
      dropText: "64% Off Steal",
      stock: 80,
      rating: 4.9,
      reviewsCount: 420
    },
    {
      _id: "budget_299_4",
      name: "Anti-Blue Light Computer Gaming Glasses",
      price: 299,
      originalPrice: 999,
      category: "Eyewear",
      images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80"],
      dropAmount: 450,
      dropText: "70% Price Drop",
      stock: 35,
      rating: 4.7,
      reviewsCount: 280
    }
  ]
};

const BudgetStoreRadar = ({
  homepageData = {},
  onQuickView,
  onAddToCart,
  onToggleFavorite,
  wishlist = []
}) => {
  const navigate = useNavigate();
  const [activeTier, setActiveTier] = useState("under499");
  const [hoveredCardId, setHoveredCardId] = useState(null);

  const TIERS = [
    { id: "under499", label: "Under ₹499", tag: "⚡ STEALS", icon: Zap, iconColor: "text-amber-500" },
    { id: "under999", label: "Under ₹999", tag: "🔥 VALUE", icon: Tag, iconColor: "text-blue-500" },
    { id: "under1999", label: "Under ₹1,999", tag: "💎 PREMIUM", icon: Sparkles, iconColor: "text-purple-500" },
    { id: "drops50", label: "Flat 50%+ Off", tag: "📉 50%+ OFF", icon: TrendingDown, iconColor: "text-rose-500" },
    { id: "under299", label: "Under ₹299", tag: "🪙 POCKET", icon: BadgePercent, iconColor: "text-emerald-500" }
  ];

  // Dynamic products filtering from available catalog + fallback items
  const displayProducts = useMemo(() => {
    const allCatalog = [
      ...(homepageData.dealsOfDay || []),
      ...(homepageData.bestSellers || []),
      ...(homepageData.newArrivals || []),
      ...(homepageData.trending || []),
      ...(homepageData.recommended || [])
    ];

    let filtered = [];
    if (activeTier === "under299") {
      filtered = allCatalog.filter((p) => p.price <= 299);
    } else if (activeTier === "under499") {
      filtered = allCatalog.filter((p) => p.price <= 499);
    } else if (activeTier === "under999") {
      filtered = allCatalog.filter((p) => p.price <= 999);
    } else if (activeTier === "under1999") {
      filtered = allCatalog.filter((p) => p.price <= 1999);
    } else if (activeTier === "drops50") {
      filtered = allCatalog.filter((p) => {
        const orig = p.originalPrice || Math.round(p.price * 1.5);
        return ((orig - p.price) / orig) >= 0.5;
      });
    }

    // Merge with high-yield fallback items if catalog has few items
    const fallbacks = BUDGET_FALLBACKS[activeTier] || BUDGET_FALLBACKS.under499;
    if (filtered.length < 4) {
      const combined = [...filtered];
      fallbacks.forEach((fb) => {
        if (!combined.some((c) => c._id === fb._id || c.name === fb.name)) {
          combined.push(fb);
        }
      });
      return combined;
    }

    return filtered;
  }, [homepageData, activeTier]);

  useEffect(() => {
    const el = document.getElementById("budget-radar-slider");
    if (el) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [activeTier]);

  const scrollSlider = (direction) => {
    const el = document.getElementById("budget-radar-slider");
    if (el) {
      const card = el.querySelector(".snap-start");
      const cardWidth = card?.offsetWidth || 280;
      const gap = 12;
      const scrollAmt = direction === "left" ? -(cardWidth + gap) : (cardWidth + gap);
      el.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  const handleProductCardClick = (product) => {
    if (product._id && !product._id.startsWith("budget_")) {
      navigate(`/product/${product._id}`);
    } else if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-3.5 sm:p-4.5 lg:p-5 shadow-xs select-none text-left transition-colors duration-200">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 rounded-sm text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 shadow-2xs">
              <TrendingDown size={11} className="stroke-[2.5]" />
              <span>PRICE RADAR</span>
            </div>

            <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
              Live Algorithmic Drops
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Budget Store & Live Price Drops</span>
            <span className="h-1.5 w-1.5 rounded-sm bg-amber-500 dark:bg-amber-400 animate-ping" />
          </h2>

          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Real-time price drop detector & certified budget tiers. Snag verified markdowns before stock runs out.
          </p>
        </div>

        {/* Top Right Action & Slider Navigation Chevrons */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            onClick={() => navigate("/product")}
            className="px-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-800 dark:text-slate-200 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 shadow-2xs"
          >
            <span>Explore Budget Zone</span>
            <ArrowRight size={12} className="stroke-[2.5]" />
          </button>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => scrollSlider("left")}
              aria-label="Previous budget items"
              className="w-8 h-8 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronLeft size={15} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => scrollSlider("right")}
              aria-label="Next budget items"
              className="w-8 h-8 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronRight size={15} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Radar Status Pill Strip */}
      <div className="w-full flex items-center justify-between p-2 px-3 bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 dark:border-amber-800/40 rounded-sm mb-3.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-black text-amber-900 dark:text-amber-200 text-[11px] tracking-wide">
            RADAR ACTIVE: <span className="font-semibold text-slate-700 dark:text-slate-300">142 items dropped in price today in your area</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
          <Clock size={11} className="text-amber-500" />
          <span>Next price audit in 18m 40s</span>
        </div>
      </div>

      {/* Dedicated Filter Tabs Strip (Horizontal scrollable) */}
      <div 
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className="w-full flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden pb-2.5 pt-0.5 mb-3.5 border-b border-slate-100 dark:border-slate-800/80"
      >
        {TIERS.map((tier) => {
          const isActive = activeTier === tier.id;
          return (
            <motion.button
              key={tier.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTier(tier.id)}
              className={`px-3 py-1.5 rounded-sm text-[10.5px] font-black uppercase tracking-wider border transition-colors duration-150 cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0 select-none ${
                isActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                  : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700 hover:border-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              {React.createElement(tier.icon, {
                size: 12,
                className: `${isActive ? "text-amber-400 dark:text-amber-600" : tier.iconColor} shrink-0 stroke-[2.5]`
              })}
              <span>{tier.label}</span>
              <span className={`text-[8.5px] px-1 py-0.2 rounded-sm font-bold ${
                isActive ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
              }`}>
                {tier.tag}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Product Cards Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTier}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          id="budget-radar-slider"
          className="flex gap-3 sm:gap-3.5 overflow-x-hidden scroll-smooth snap-x snap-mandatory pb-1"
        >
          {displayProducts.map((p) => {
            const isFav = wishlist.includes(p._id);
            const origVal = p.originalPrice || Math.round(p.price * 1.4);
            const discountPct = Math.round(((origVal - p.price) / origVal) * 100);
            const dropBadge = p.dropText || `Dropped ₹${Math.max(50, origVal - p.price)} today`;

            return (
              <div
                key={p._id}
                className="min-w-[72vw] max-w-[290px] sm:min-w-[calc((100%-0.875rem)/2)] sm:max-w-[calc((100%-0.875rem)/2)] md:min-w-[calc((100%-1.75rem)/3)] md:max-w-[calc((100%-1.75rem)/3)] lg:min-w-[calc((100%-2.625rem)/4)] lg:max-w-[calc((100%-2.625rem)/4)] snap-start flex-shrink-0"
              >
                <div
                  onClick={() => handleProductCardClick(p)}
                  onMouseEnter={() => setHoveredCardId(p._id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 rounded-sm p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs h-full"
                >
                  <div>
                    {/* Top Image Container with Badges */}
                    <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-800 rounded-sm overflow-hidden mb-2.5 border border-slate-100 dark:border-slate-800">
                      <img
                        src={p.images?.[0] || p.image || ""}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Price Drop Indicator Tag */}
                      <div className="absolute top-2 left-2 z-10">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider rounded-sm shadow-sm">
                          <TrendingDown size={10} className="stroke-[3]" />
                          <span>{dropBadge}</span>
                        </span>
                      </div>

                      {/* Discount % Pill */}
                      <div className="absolute bottom-2 left-2 z-10">
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md text-emerald-400 font-black text-[9px] rounded-sm">
                          {discountPct}% OFF
                        </span>
                      </div>

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleFavorite) onToggleFavorite(p._id);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shadow-2xs z-10"
                      >
                        <Heart
                          size={13}
                          className={isFav ? "fill-rose-500 text-rose-500" : "stroke-[2.5]"}
                        />
                      </button>
                    </div>

                    {/* Category & Title */}
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        {p.category || "Deals"}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {p.name}
                      </h4>
                    </div>
                  </div>

                  {/* Pricing and Action Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          ₹{p.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] line-through text-slate-400">
                          ₹{origVal.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 font-black text-[10px]">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <span>{p.rating || 4.8}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAddToCart) onAddToCart(p, 1, "Standard");
                          else toast.success("Added to cart! 🛍️");
                        }}
                        className="flex-1 py-1.5 px-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-amber-600 dark:hover:bg-amber-400 font-black text-[11px] uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      >
                        <ShoppingCart size={12} className="stroke-[2.5]" />
                        <span>Add To Cart</span>
                      </motion.button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onQuickView) onQuickView(p);
                        }}
                        title="Quick View"
                        className="w-7 h-7 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-sm flex items-center justify-center shrink-0 transition-colors shadow-2xs"
                      >
                        <Eye size={13} className="stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

    </div>
  );
};

export default BudgetStoreRadar;
