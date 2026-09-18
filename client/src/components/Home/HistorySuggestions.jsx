import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, History, Sparkles, ArrowRight, Trash2, RefreshCw, X } from "lucide-react";
import ProductCard from "../../pages/ProductCard";
import { toast } from "react-toastify";
import { cachedGet } from "../../utils/apiCache";
import { backendUrl } from "../../config";

const HistorySuggestions = ({ fallbackProducts = [], onQuickView }) => {
  const navigate = useNavigate();
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [shuffleIndex, setShuffleIndex] = useState(0);

  const isValidProduct = useCallback((item) => {
    if (!item || !item._id || typeof item._id !== "string") return false;
    if (item._id.startsWith("budget_") || item._id.startsWith("mock_")) return false;
    const name = String(item.name || "").toLowerCase();
    if (name.startsWith("test_") || name.startsWith("test ai")) return false;
    if (item.images && Array.isArray(item.images) && item.images[0]?.includes("example.com")) return false;
    return true;
  }, []);

  // Load recently viewed from localStorage and sanitize
  const loadHistory = useCallback(() => {
    try {
      const list = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      const validList = Array.isArray(list) ? list.filter(isValidProduct) : [];
      if (Array.isArray(list) && list.length !== validList.length) {
        localStorage.setItem("recentlyViewed", JSON.stringify(validList));
      }
      setRecentlyViewed(validList);
    } catch {
      setRecentlyViewed([]);
    }
  }, [isValidProduct]);

  useEffect(() => {
    loadHistory();

    const handleStorage = (e) => {
      if (e.key === "recentlyViewed") loadHistory();
    };

    const handleCustomUpdate = () => {
      loadHistory();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("recentlyViewedUpdate", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("recentlyViewedUpdate", handleCustomUpdate);
    };
  }, [loadHistory]);

  // Fetch diverse catalog products to ensure fresh recommendations from DB
  useEffect(() => {
    let isMounted = true;
    cachedGet(`${backendUrl}/api/product/list?limit=250`, {}, 300000)
      .then((res) => {
        if (isMounted && res?.data?.success && Array.isArray(res.data.products)) {
          const validOnly = res.data.products.filter(isValidProduct);
          setCatalogProducts(validOnly);

          // Synchronize recentlyViewed with live DB catalog
          try {
            const rawStored = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
            const catalogMap = new Map(validOnly.map((p) => [String(p._id), p]));
            const refreshedHistory = [];

            rawStored.forEach((item) => {
              if (item && item._id && catalogMap.has(String(item._id))) {
                refreshedHistory.push(catalogMap.get(String(item._id)));
              }
            });

            localStorage.setItem("recentlyViewed", JSON.stringify(refreshedHistory));
            setRecentlyViewed(refreshedHistory);
          } catch {}
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isValidProduct]);

  const handleClearHistory = () => {
    localStorage.removeItem("recentlyViewed");
    setRecentlyViewed([]);
    window.dispatchEvent(new Event("recentlyViewedUpdate"));
    toast.info("Browsing history cleared");
  };

  const handleRemoveSingleItem = (e, productId) => {
    if (e) e.stopPropagation();
    try {
      const updated = recentlyViewed.filter((item) => item && item._id !== productId);
      localStorage.setItem("recentlyViewed", JSON.stringify(updated));
      setRecentlyViewed(updated);
      window.dispatchEvent(new Event("recentlyViewedUpdate"));
      toast.info("Item removed from history");
    } catch {
      // ignore
    }
  };

  // Extract available distinct categories from catalog & history
  const allPool = useMemo(() => {
    const combined = [...catalogProducts, ...fallbackProducts.filter(isValidProduct)];
    const map = new Map();
    combined.forEach((p) => {
      if (p && p._id && !map.has(p._id.toString())) {
        map.set(p._id.toString(), p);
      }
    });
    return Array.from(map.values());
  }, [catalogProducts, fallbackProducts, isValidProduct]);

  const categories = useMemo(() => {
    const set = new Set();
    allPool.forEach((p) => {
      if (p?.category && typeof p.category === "string" && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return ["all", ...Array.from(set).slice(0, 6)];
  }, [allPool]);

  // Combine and diversify products
  const displayedProducts = useMemo(() => {
    const seen = new Set();
    const result = [];

    // Filter pool by active category if selected
    const pool = activeCategory === "all"
      ? allPool
      : allPool.filter((p) => (p?.category || "").toLowerCase() === activeCategory.toLowerCase());

    // 1. If in "all" view, show recently viewed items first (only valid real DB items)
    if (activeCategory === "all") {
      recentlyViewed.forEach((p) => {
        if (p && p._id && !seen.has(p._id.toString()) && isValidProduct(p)) {
          seen.add(p._id.toString());
          result.push({ ...p, _historyTag: "Recently Viewed", _isRecentlyViewed: true });
        }
      });
    }

    // 2. Identify categories user explored
    const historyCategories = new Set(
      recentlyViewed.map((p) => (p?.category || "").toLowerCase()).filter(Boolean)
    );

    // 3. Add category-matched suggestions from pool (rotated by shuffleIndex)
    if (pool.length > 0) {
      const byCategory = {};
      pool.forEach((p) => {
        const cat = (p?.category || "Other").toLowerCase();
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(p);
      });

      const catKeys = Object.keys(byCategory);
      let maxLen = Math.max(...catKeys.map((k) => byCategory[k].length), 0);
      for (let i = 0; i < maxLen; i++) {
        for (let k = 0; k < catKeys.length; k++) {
          const cat = catKeys[(k + shuffleIndex) % catKeys.length];
          const item = byCategory[cat]?.[(i + shuffleIndex) % byCategory[cat].length];
          if (item && item._id && !seen.has(item._id.toString()) && result.length < 15) {
            seen.add(item._id.toString());
            const isRelated = historyCategories.has(cat);
            result.push({
              ...item,
              _historyTag: isRelated ? "Related Pick" : "Suggested For You",
              _isRecentlyViewed: false
            });
          }
        }
      }
    }

    return result.slice(0, 15);
  }, [recentlyViewed, allPool, activeCategory, shuffleIndex, isValidProduct]);

  const scrollSlider = (direction) => {
    const el = document.getElementById("history-products-slider");
    if (el) {
      const card = el.querySelector(".snap-start");
      const cardWidth = card?.offsetWidth || 260;
      const gap = 8;
      const scrollAmt = direction === "left" ? -(cardWidth + gap) * 2 : (cardWidth + gap) * 2;
      el.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  if (!displayedProducts.length) return null;

  const hasHistory = recentlyViewed.length > 0;

  return (
    <section className="w-full px-2 sm:px-4 lg:px-6 py-0.5 sm:py-1 select-none text-left">
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-3.5 sm:p-4.5 lg:p-5 shadow-xs transition-shadow duration-300">
        
        {/* Section Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 rounded-sm text-[9px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 shadow-2xs">
                {hasHistory ? (
                  <History size={11} className="stroke-[2.5]" />
                ) : (
                  <Sparkles size={11} className="stroke-[2.5]" />
                )}
                <span>{hasHistory ? "Your Browsing History" : "Curated Discovery"}</span>
              </div>

              {hasHistory && (
                <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                  {recentlyViewed.length} Viewed {recentlyViewed.length === 1 ? "Item" : "Items"}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{hasHistory ? "Pick Up Where You Left Off" : "Inspired By Your Interests"}</span>
              <span className="h-1.5 w-1.5 rounded-sm bg-blue-600 dark:bg-blue-400 animate-pulse" />
            </h2>

            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {hasHistory
                ? "Items you've viewed recently and tailored recommendations from related collections."
                : "Explore trending discoveries and popular selections tailored for you."}
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
            {/* Shuffle button */}
            <button
              type="button"
              onClick={() => setShuffleIndex((prev) => prev + 1)}
              className="px-2.5 py-1.5 rounded-sm border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 shadow-2xs"
              title="Shuffle & see different product suggestions"
            >
              <RefreshCw size={11} className="stroke-[2.5]" />
              <span className="hidden sm:inline">Different Products</span>
            </button>

            {hasHistory && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-2.5 py-1.5 rounded-sm border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700/60 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 shadow-2xs"
                title="Clear Browsing History"
              >
                <Trash2 size={11} className="stroke-[2.5]" />
                <span className="hidden sm:inline">Clear History</span>
              </button>
            )}

            <button
              onClick={() => navigate("/product")}
              className="px-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-800 dark:text-slate-200 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 shadow-2xs"
            >
              <span>Explore All</span>
              <ArrowRight size={12} className="stroke-[2.5]" />
            </button>

            {/* Slider Navigation Chevrons */}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => scrollSlider("left")}
                aria-label="Previous suggestions"
                className="w-8 h-8 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft size={15} className="stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => scrollSlider("right")}
                aria-label="Next suggestions"
                className="w-8 h-8 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight size={15} className="stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated Category Filter Strip */}
        {categories.length > 2 && (
          <div 
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            className="w-full flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden pb-2.5 pt-0.5 mb-3 border-b border-slate-100 dark:border-slate-800/80"
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <motion.button
                  key={cat}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-sm text-[10.5px] font-black uppercase tracking-wider border transition-colors duration-150 cursor-pointer shadow-2xs shrink-0 select-none ${
                    isActive
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                      : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700 hover:border-slate-400 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  {cat === "all" ? "All Picks" : cat}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Product Carousel Slider with Motion Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}_${shuffleIndex}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            id="history-products-slider"
            className="flex gap-3 sm:gap-3.5 overflow-x-hidden scroll-smooth snap-x snap-mandatory pb-1"
          >
            {displayedProducts.map((product) => (
              <div
                key={product._id}
                className="min-w-[72vw] max-w-[290px] sm:min-w-[calc((100%-0.875rem)/2)] sm:max-w-[calc((100%-0.875rem)/2)] md:min-w-[calc((100%-1.75rem)/3)] md:max-w-[calc((100%-1.75rem)/3)] lg:min-w-[calc((100%-2.625rem)/4)] lg:max-w-[calc((100%-2.625rem)/4)] snap-start flex-shrink-0 relative group"
              >
                <ProductCard
                  product={product}
                  onQuickView={onQuickView}
                />
                {/* Optional Quick Remove button on Recently Viewed cards */}
                {product._isRecentlyViewed && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSingleItem(e, product._id)}
                    className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-500 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    title="Remove from history"
                  >
                    <X size={12} className="stroke-[2.5]" />
                  </button>
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};

export default HistorySuggestions;
