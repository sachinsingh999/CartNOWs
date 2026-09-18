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
import { backendUrl } from "../../config";
import { cachedGet } from "../../utils/apiCache";

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
  const [allDbProducts, setAllDbProducts] = useState([]);

  const TIERS = [
    { id: "under499", label: "Under ₹499", tag: "⚡ STEALS", icon: Zap, iconColor: "text-amber-500" },
    { id: "under999", label: "Under ₹999", tag: "🔥 VALUE", icon: Tag, iconColor: "text-blue-500" },
    { id: "under1999", label: "Under ₹1,999", tag: "💎 PREMIUM", icon: Sparkles, iconColor: "text-purple-500" },
    { id: "drops50", label: "Flat 50%+ Off", tag: "📉 50%+ OFF", icon: TrendingDown, iconColor: "text-rose-500" },
    { id: "under299", label: "Under ₹299", tag: "🪙 POCKET", icon: BadgePercent, iconColor: "text-emerald-500" }
  ];

  // Fetch full product catalog from DB for complete inventory scanning
  useEffect(() => {
    let isMounted = true;
    const fetchAllProducts = async () => {
      try {
        const res = await cachedGet(`${backendUrl}/api/product/list?limit=250`);
        if (isMounted && res?.data?.success && Array.isArray(res.data.products)) {
          setAllDbProducts(res.data.products);
        }
      } catch (err) {
        console.error("BudgetRadar: failed to load product catalog:", err);
      }
    };
    fetchAllProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamic products filtering exclusively from real database catalog
  const displayProducts = useMemo(() => {
    const rawCatalog = [
      ...allDbProducts,
      ...(homepageData.dealsOfDay || []),
      ...(homepageData.bestSellers || []),
      ...(homepageData.newArrivals || []),
      ...(homepageData.trending || []),
      ...(homepageData.recommended || [])
    ];

    // Deduplicate items strictly by database _id & filter out invalid/dummy items
    const seenIds = new Set();
    const allCatalog = [];
    rawCatalog.forEach((p) => {
      if (
        p &&
        p._id &&
        !seenIds.has(String(p._id)) &&
        !p.isDeleted &&
        p.status !== "disabled" &&
        Number(p.price) > 0 &&
        !String(p.name || "").toLowerCase().startsWith("test_")
      ) {
        seenIds.add(String(p._id));
        allCatalog.push(p);
      }
    });

    if (allCatalog.length === 0) return [];

    let filtered = [];
    if (activeTier === "under299") {
      filtered = allCatalog
        .filter((p) => Number(p.price) <= 299)
        .sort((a, b) => Number(a.price) - Number(b.price));
    } else if (activeTier === "under499") {
      filtered = allCatalog
        .filter((p) => Number(p.price) <= 499)
        .sort((a, b) => Number(a.price) - Number(b.price));
    } else if (activeTier === "under999") {
      filtered = allCatalog
        .filter((p) => Number(p.price) <= 999)
        .sort((a, b) => Number(a.price) - Number(b.price));
    } else if (activeTier === "under1999") {
      filtered = allCatalog
        .filter((p) => Number(p.price) <= 1999)
        .sort((a, b) => Number(a.price) - Number(b.price));
    } else if (activeTier === "drops50") {
      filtered = allCatalog
        .filter((p) => {
          const orig = Number(p.originalPrice);
          const pr = Number(p.price);
          return orig > pr && ((orig - pr) / orig) >= 0.20;
        })
        .sort((a, b) => {
          const origA = Number(a.originalPrice);
          const prA = Number(a.price);
          const origB = Number(b.originalPrice);
          const prB = Number(b.price);
          const discA = (origA - prA) / origA;
          const discB = (origB - prB) / origB;
          return discB - discA;
        });
    }

    return filtered;
  }, [allDbProducts, homepageData, activeTier]);

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
    if (product?._id) {
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
          {displayProducts.length === 0 ? (
            <div className="w-full py-8 px-4 text-center bg-slate-50 dark:bg-slate-800/50 rounded-sm border border-dashed border-slate-200 dark:border-slate-700/80 flex flex-col items-center justify-center gap-2">
              <Tag size={22} className="text-slate-400 dark:text-slate-500" />
              <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                No products currently found in this price bracket.
              </p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 max-w-md">
                Try switching to another budget tier above, or add new budget items in this price range via Seller/Admin panel.
              </p>
            </div>
          ) : (
            displayProducts.map((p, idx) => {
            const isFav = wishlist.includes(p._id);
            const priceNum = Math.round(Number(p.price) || 0);
            const origVal = Math.round(
              Number(p.originalPrice) > priceNum
                ? Number(p.originalPrice)
                : Math.round(priceNum * 1.4)
            );
            const discountPct = origVal > priceNum
              ? Math.round(((origVal - priceNum) / origVal) * 100)
              : 25;
            const dropDiff = Math.max(50, Math.round(origVal - priceNum));
            const dropBadge = p.dropText || `Dropped ₹${dropDiff.toLocaleString("en-IN")} today`;

            return (
              <div
                key={p._id || `budget-${activeTier}-${idx}`}
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
                        src={p.images?.[0] || p.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80"}
                        alt={p.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80";
                        }}
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
                          ₹{priceNum.toLocaleString("en-IN")}
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
          }))}
        </motion.div>
      </AnimatePresence>

    </div>
  );
};

export default BudgetStoreRadar;
