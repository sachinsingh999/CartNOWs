import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
  Flame,
  Truck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Maximize2,
  Clock,
  X
} from "lucide-react";
import { backendUrl } from "../../config";
import { cachedGet } from "../../utils/apiCache";
import { getOptimizedImageUrl } from "../../utils/imageOptimizer";

// Showcase Assets for HP Spectre Convertible Laptop (matched to reference mockup)
import spectreTent from "../../assets/new_home/spectre_tent.webp";
import spectreOpen from "../../assets/new_home/spectre_open.webp";
import spectreProfile from "../../assets/new_home/spectre_profile.webp";
import spectreStylus from "../../assets/new_home/spectre_stylus.webp";

// Helper: Calculate deterministic day seed based on calendar date
const getDaySeed = () => {
  const now = new Date();
  return Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(2025, 0, 1)) /
      (1000 * 60 * 60 * 24)
  );
};

const FeaturedDealsCarousel = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [viewMode, setViewMode] = useState("showcase"); // "showcase" or "all"
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
  const [timeUntilMidnight, setTimeUntilMidnight] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Reset selected image when carousel slide changes
  useEffect(() => {
    setSelectedImageIdx(0);
  }, [currentIndex]);

  // Live countdown to midnight for daily deal refresh
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, midnight.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilMidnight({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Touch swipe support
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const autoPlayTimerRef = useRef(null);

  // Fetch featured products from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await cachedGet(`${backendUrl}/api/product/featured?limit=12`);
        if (isMounted && res.data?.success && Array.isArray(res.data.products) && res.data.products.length > 0) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.warn("Featured deals fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  // Rotate products on a daily basis:
  // Sort primarily by priority, then rotate array by (daySeed % total) so each day a different product is showcased first
  const displayProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    const sorted = [...products].sort((a, b) => {
      return (b.featuredPriority || 0) - (a.featuredPriority || 0);
    });

    const totalCount = sorted.length;
    if (totalCount <= 1) return sorted;

    const daySeed = getDaySeed();
    const dailyOffset = ((daySeed % totalCount) + totalCount) % totalCount;

    // Daily shifted array: item at dailyOffset is index 0 for today
    return [...sorted.slice(dailyOffset), ...sorted.slice(0, dailyOffset)];
  }, [products]);

  const total = displayProducts.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // 12-Second Autoplay Loop with Pause-on-Hover
  useEffect(() => {
    if (isPaused || total <= 1 || viewMode === "all") {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      nextSlide();
    }, 12000);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPaused, total, nextSlide, viewMode]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (diff > minSwipeDistance) {
      nextSlide();
    } else if (diff < -minSwipeDistance) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Helper for product image URL
  const getImageUrl = (input) => {
    if (!input) return "/favicon.png";
    const raw = typeof input === "string" ? input : (input.bgRemovedImage || input.images?.[0] || input.image);
    if (!raw || typeof raw !== "string") return "/favicon.png";
    const rawUrl = raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `${backendUrl}${raw.startsWith("/") ? raw : `/${raw}`}`;
    return getOptimizedImageUrl(rawUrl, { width: 600, quality: 80 }) || rawUrl;
  };

  // Active product calculation
  const currentProduct = displayProducts[currentIndex] || displayProducts[0];

  const productImages = useMemo(() => {
    if (!currentProduct) return [];
    return Array.isArray(currentProduct.images) && currentProduct.images.length > 0
      ? currentProduct.images
      : [currentProduct.image].filter(Boolean);
  }, [currentProduct]);

  // 4-Image Mosaic Array
  const mosaicImages = useMemo(() => {
    if (!currentProduct) return [];
    if (currentProduct.name?.toLowerCase().includes("spectre") && (!currentProduct.images || currentProduct.images.length === 0)) {
      return [spectreTent, spectreOpen, spectreProfile, spectreStylus];
    }
    const imgs = productImages.map(getImageUrl);
    if (imgs.length >= 4) return [imgs[0], imgs[1], imgs[2], imgs[3]];
    if (imgs.length === 3) return [imgs[0], imgs[1], imgs[2], imgs[0]];
    if (imgs.length === 2) return [imgs[0], imgs[1], imgs[0], imgs[1]];
    if (imgs.length === 1) return [imgs[0], imgs[0], imgs[0], imgs[0]];
    return ["/favicon.png", "/favicon.png", "/favicon.png", "/favicon.png"];
  }, [currentProduct, productImages]);

  // Loading Skeleton State
  if (loading) {
    return (
      <section className="w-full px-3 sm:px-6 lg:px-8 py-1.5 select-none">
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 sm:p-4.5 lg:p-5 shadow-xs animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-1">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
            </div>
            <div className="flex gap-1.5">
              <div className="w-20 h-7 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="w-7 h-7 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="w-7 h-7 rounded-md bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-5 space-y-2.5">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-6 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-3.5 w-1/3 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
              <div className="h-7 w-36 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-8 w-full max-w-sm bg-slate-100 dark:bg-slate-800/60 rounded-md" />
              <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
            <div className="lg:col-span-7 h-[285px] sm:h-[300px] lg:h-[315px] bg-slate-100 dark:bg-slate-800/40 rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  // If no products returned, hide section
  if (!currentProduct || displayProducts.length === 0) {
    return null;
  }

  const price = Number(currentProduct.price || 0);
  const originalPrice = Number(currentProduct.originalPrice || 0);
  const discount = Number(currentProduct.discountPercentage || 0);

  // Slide transition variants
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (dir) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    })
  };

  return (
    <section className="w-full px-2 sm:px-4 lg:px-6 pt-0.5 pb-1 select-none">
      <div
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-3.5 sm:p-4.5 lg:p-5 shadow-xs hover:shadow-md transition-shadow duration-300 relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ════════════════════════════════════════════════════════
            HEADER: Featured Deals + Daily Spotlight Badge + Controls
            ════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Featured Deals
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-[#FF5500] dark:text-orange-400 border border-orange-200 dark:border-orange-800/60 text-[10px] font-black uppercase tracking-wider">
                <Flame size={11} className="stroke-[2.5]" />
                Daily Spotlight
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              Handpicked products at special prices • Refreshed daily
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            MODE 1: SINGLE PRODUCT SHOWCASE WITH 4-IMAGE MOSAIC
            ════════════════════════════════════════════════════════ */}
        {viewMode === "showcase" ? (
          <div className="relative min-h-[285px] sm:min-h-[300px] lg:min-h-[315px] flex items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentProduct._id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center text-left"
              >
                {/* ──────────────────────────────────────────────────────────
                    LEFT SIDE (~42%): Product Details
                    ────────────────────────────────────────────────────────── */}
                <div className="lg:col-span-5 space-y-2 flex flex-col justify-center order-2 lg:order-1 text-left">
                  {/* Category & Deal Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-[#FF5500] dark:text-orange-400 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 border border-orange-200/80 dark:border-orange-800/60">
                      <Sparkles size={11} className="stroke-[2.5]" />
                      TODAY'S DEAL
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider">
                      {currentProduct.category || "ELECTRONICS"}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h3
                    onClick={() => navigate(`/product/${currentProduct._id}`)}
                    className="text-lg sm:text-xl lg:text-[22px] font-black text-slate-900 dark:text-white leading-[1.2] tracking-tight hover:text-[#FF5500] transition-colors cursor-pointer"
                    title={currentProduct.name}
                  >
                    {currentProduct.name}
                  </h3>

                  {/* Rating Score & Stars */}
                  <div className="flex items-center gap-1.5 select-none">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={13}
                          className={`${
                            star <= Math.round(currentProduct.rating || 4.7)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 dark:fill-slate-700 text-slate-200 dark:text-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white ml-0.5">
                      {Number(currentProduct.rating || 4.7).toFixed(1)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium ml-0.5">
                      ({Number(currentProduct.reviewCount || 128).toLocaleString()} ratings)
                    </span>
                  </div>

                  {/* Price & Discount */}
                  <div className="flex items-baseline gap-2 flex-wrap pt-0.5">
                    <span className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      ₹{price.toLocaleString()}
                    </span>
                    {originalPrice > price && (
                      <span className="text-xs sm:text-sm text-slate-400 line-through font-semibold">
                        ₹{originalPrice.toLocaleString()}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider shadow-2xs">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Product Short Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-snug line-clamp-2 max-w-sm">
                    {currentProduct.shortDescription ||
                      currentProduct.description ||
                      "Elegantly crafted 2-in-1 touchscreen notebook featuring Intel Core Ultra 7, OLED display panel, and rechargeable stylus pen...."}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 pt-0.5">
                    <button
                      onClick={() => navigate(`/product/${currentProduct._id}`)}
                      className="inline-flex items-center gap-1.5 bg-[#FF5500] hover:bg-[#E04B00] active:scale-95 text-white font-bold text-xs sm:text-sm px-4.5 py-2 rounded-md shadow-xs hover:shadow transition cursor-pointer border-none"
                    >
                      <span>Shop Now</span>
                      <ArrowRight size={14} className="stroke-[2.5]" />
                    </button>

                    <button
                      onClick={() => navigate(`/product/${currentProduct._id}`)}
                      className="inline-flex items-center px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition cursor-pointer border-none"
                    >
                      <span>View Details</span>
                    </button>
                  </div>

                  {/* Benefits Strip */}
                  <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-5 pt-2 sm:pt-2.5 mt-1 sm:mt-1.5 border-t border-slate-100 dark:border-slate-800 text-left">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Truck size={14} className="text-emerald-500 stroke-[2.2] shrink-0" />
                      <div>
                        <p className="text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white leading-none">Free Delivery</p>
                        <p className="text-[8.5px] sm:text-[9.5px] text-slate-400 mt-0.5">All orders</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <RotateCcw size={13} className="text-blue-500 stroke-[2.2] shrink-0" />
                      <div>
                        <p className="text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white leading-none">Easy Returns</p>
                        <p className="text-[8.5px] sm:text-[9.5px] text-slate-400 mt-0.5">7-day</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <ShieldCheck size={14} className="text-orange-500 stroke-[2.2] shrink-0" />
                      <div>
                        <p className="text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white leading-none">Secure Pay</p>
                        <p className="text-[8.5px] sm:text-[9.5px] text-slate-400 mt-0.5">100% safe</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ──────────────────────────────────────────────────────────
                    RIGHT SIDE (~58%): ASYMMETRICAL 4-IMAGE MOSAIC GRID
                    ────────────────────────────────────────────────────────── */}
                <div className="lg:col-span-7 xl:col-span-7 w-full order-1 lg:order-2">
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5 h-[190px] min-[420px]:h-[220px] sm:h-[300px] lg:h-[315px]">
                    {/* Slot 0: Tall Main Image (Left Half) */}
                    <div
                      onClick={() => navigate(`/product/${currentProduct._id}`)}
                      className="group/s0 relative w-full h-full min-h-0 rounded-lg overflow-hidden bg-slate-950 shadow-xs hover:shadow-md transition-all cursor-pointer border border-slate-200/50 dark:border-slate-800"
                    >
                      {/* Discount Badge */}
                      {discount > 0 && (
                        <div className="absolute top-2.5 left-2.5 z-20 bg-[#FF5500] text-white text-[10px] sm:text-[11px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm tracking-wider flex items-center gap-1 pointer-events-none">
                          <Sparkles size={10} className="stroke-[2.5]" />
                          <span>{discount}% OFF</span>
                        </div>
                      )}

                      {/* Expand Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIdx(0);
                          setIsLightboxOpen(true);
                        }}
                        className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer border border-slate-200/60"
                        title="View Full Size"
                      >
                        <Maximize2 size={11} className="stroke-[2.5]" />
                      </button>

                      <img
                        src={mosaicImages[0]}
                        alt={`${currentProduct.name} - View 1`}
                        className="w-full h-full object-cover group-hover/s0:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/favicon.png";
                        }}
                      />
                    </div>

                    {/* Right Half: Grid of 2 rows (Top Wide + Bottom 2 Cards) */}
                    <div className="grid grid-rows-[1.15fr_1fr] gap-2 sm:gap-2.5 h-full min-h-0">
                      {/* Slot 1: Top Wide Card */}
                      <div
                        onClick={() => navigate(`/product/${currentProduct._id}`)}
                        className="group/s1 relative w-full h-full min-h-0 rounded-lg overflow-hidden bg-slate-950 shadow-xs hover:shadow-md transition-all cursor-pointer border border-slate-200/50 dark:border-slate-800"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIdx(1);
                            setIsLightboxOpen(true);
                          }}
                          className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer border border-slate-200/60"
                          title="View Full Size"
                        >
                          <Maximize2 size={11} className="stroke-[2.5]" />
                        </button>

                        <img
                          src={mosaicImages[1]}
                          alt={`${currentProduct.name} - View 2`}
                          className="w-full h-full object-cover group-hover/s1:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/favicon.png";
                          }}
                        />
                      </div>

                      {/* Bottom Row: 2 Cards Side-by-Side */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 h-full min-h-0">
                        {/* Slot 2: Bottom-Left Card */}
                        <div
                          onClick={() => navigate(`/product/${currentProduct._id}`)}
                          className="group/s2 relative w-full h-full min-h-0 rounded-lg overflow-hidden bg-slate-950 shadow-xs hover:shadow-md transition-all cursor-pointer border border-slate-200/50 dark:border-slate-800"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIdx(2);
                              setIsLightboxOpen(true);
                            }}
                            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer border border-slate-200/60"
                            title="View Full Size"
                          >
                            <Maximize2 size={10} className="stroke-[2.5]" />
                          </button>

                          <img
                            src={mosaicImages[2]}
                            alt={`${currentProduct.name} - View 3`}
                            className="w-full h-full object-cover group-hover/s2:scale-105 transition-transform duration-500 ease-out"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/favicon.png";
                            }}
                          />
                        </div>

                        {/* Slot 3: Bottom-Right Card */}
                        <div
                          onClick={() => navigate(`/product/${currentProduct._id}`)}
                          className="group/s3 relative w-full h-full min-h-0 rounded-lg overflow-hidden bg-slate-950 shadow-xs hover:shadow-md transition-all cursor-pointer border border-slate-200/50 dark:border-slate-800"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIdx(3);
                              setIsLightboxOpen(true);
                            }}
                            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer border border-slate-200/60"
                            title="View Full Size"
                          >
                            <Maximize2 size={10} className="stroke-[2.5]" />
                          </button>

                          <img
                            src={mosaicImages[3]}
                            alt={`${currentProduct.name} - View 4`}
                            className="w-full h-full object-cover group-hover/s3:scale-105 transition-transform duration-500 ease-out"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/favicon.png";
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          /* ════════════════════════════════════════════════════════
              MODE 2: SHOW ALL FEATURED PRODUCTS GRID
              ════════════════════════════════════════════════════════ */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 py-1">
            {displayProducts.map((p) => {
              const pPrice = Number(p.price || 0);
              const pOrigPrice = Number(p.originalPrice || 0);
              const pDisc = Number(p.discountPercentage || 0);
              const pImages = (Array.isArray(p.images) && p.images.length > 0) ? p.images : [p.image].filter(Boolean);

              return (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="group relative rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-3 flex flex-col justify-between hover:shadow-md hover:border-orange-200 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer text-left"
                >
                  <div>
                    {/* Product Main Image */}
                    <div className="relative w-full h-[180px] sm:h-[190px] rounded-md overflow-hidden bg-slate-900 mb-2.5">
                      {pDisc > 0 && (
                        <span className="absolute top-2 left-2 z-10 bg-[#FF5500] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                          {pDisc}% OFF
                        </span>
                      )}
                      <img
                        src={getImageUrl(pImages[0])}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/favicon.png";
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.category}</span>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#FF5500] transition-colors">
                        {p.name}
                      </h4>
                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          ₹{pPrice.toLocaleString()}
                        </span>
                        {pOrigPrice > pPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{pOrigPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          FULL SIZE LIGHTBOX MODAL (When clicking expand icon)
          ════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 select-none"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Top Toolbar */}
            <div
              className="w-full max-w-5xl flex items-center justify-between pb-3 text-white px-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base line-clamp-1">
                  {currentProduct.name}
                </span>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-slate-300 font-mono">
                  {selectedImageIdx + 1} / {mosaicImages.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/product/${currentProduct._id}`)}
                  className="px-3.5 py-1.5 rounded-md bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold transition cursor-pointer border-none"
                >
                  View Product
                </button>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  aria-label="Close Lightbox"
                  className="w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer border border-white/20"
                >
                  <X size={18} className="stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Main Full-Resolution Image Area */}
            <div
              className="relative max-w-5xl w-full flex-1 max-h-[75vh] flex items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={mosaicImages[selectedImageIdx] || mosaicImages[0]}
                alt={`${currentProduct.name} full size`}
                className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg shadow-2xl"
              />

              {/* Lightbox Prev / Next Arrows */}
              {mosaicImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImageIdx(
                        (prev) => (prev - 1 + mosaicImages.length) % mosaicImages.length
                      )
                    }
                    aria-label="Previous Image"
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition cursor-pointer border border-white/20 shadow-lg"
                  >
                    <ChevronLeft size={22} className="stroke-[2.5]" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImageIdx(
                        (prev) => (prev + 1) % mosaicImages.length
                      )
                    }
                    aria-label="Next Image"
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition cursor-pointer border border-white/20 shadow-lg"
                  >
                    <ChevronRight size={22} className="stroke-[2.5]" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Gallery Thumbnails */}
            {mosaicImages.length > 1 && (
              <div
                className="flex items-center gap-2 pt-3 max-w-5xl overflow-x-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {mosaicImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIdx(i)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition p-0 shrink-0 ${
                      i === selectedImageIdx
                        ? "border-[#FF5500] scale-105 shadow-md"
                        : "border-white/30 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeaturedDealsCarousel;
