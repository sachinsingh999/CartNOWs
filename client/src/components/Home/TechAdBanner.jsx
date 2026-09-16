import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { backendUrl } from "../../config";
import { cachedGet } from "../../utils/apiCache";
import { getOptimizedImageUrl } from "../../utils/imageOptimizer";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight,
  Flame,
  Tag,
  CheckCircle2
} from "lucide-react";

const SLIDE_DURATION = 6500; // 6.5 seconds per slide

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.99
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.48,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: (direction) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
    scale: 0.99,
    transition: {
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

// Contrast helper to detect dark background colors
const isDarkColor = (color) => {
  if (!color) return false;
  const darkPresets = ["#000000", "#0f172a", "#0b0f19", "#111827", "#1e1b4b", "#18181b", "#1e293b", "#312e81"];
  if (darkPresets.includes(color.toLowerCase())) return true;
  if (color.startsWith("#") && color.length >= 7) {
    const r = parseInt(color.slice(1, 3), 16) || 0;
    const g = parseInt(color.slice(3, 5), 16) || 0;
    const b = parseInt(color.slice(5, 7), 16) || 0;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 130;
  }
  return false;
};

const TechAdBanner = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  // Fetch active promotional banners from server
  useEffect(() => {
    let isMounted = true;
    const fetchActiveBanners = async () => {
      try {
        const res = await cachedGet(`${backendUrl}/api/promo-banners/active`, {}, 30000);
        if (isMounted && res?.data?.success) {
          const list = Array.isArray(res.data.banners) && res.data.banners.length > 0
            ? res.data.banners
            : (res.data.banner ? [res.data.banner] : []);
          
          const activeList = list.filter(b => b && b.isActive !== false);
          setBanners(activeList);
        }
      } catch (err) {
        console.error("Failed to load active promo banners:", err);
      }
    };

    fetchActiveBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  const DEFAULT_FALLBACK_BANNER = {
    _id: "default_tech_ad_banner",
    title: "Upgrade Your Digital Life",
    subtitle: "Top brands. Latest gadgets. Great prices.",
    tagline: "TECH FOR A BETTER TOMORROW",
    discountTag: "UP TO 50% OFF",
    ctaText: "Shop Electronics",
    linkUrl: "/product?category=electronics",
    imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80"
    ],
    displayMode: "overlay",
    theme: "dark",
    bgColor: "#F6F4FF",
    showPerks: true,
    isActive: true
  };

  const activeBanners = banners.length > 0 ? banners : [DEFAULT_FALLBACK_BANNER];
  const totalBanners = activeBanners.length;
  const currentBanner = activeBanners[currentIndex % totalBanners] || activeBanners[0];

  // Handle smooth auto-progress bar timer
  useEffect(() => {
    if (totalBanners <= 1 || isPaused) {
      clearInterval(progressIntervalRef.current);
      return;
    }

    setProgress(0);
    const intervalTime = 50; // update progress every 50ms
    const step = (intervalTime / SLIDE_DURATION) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setDirection(1);
          setCurrentIndex((current) => (current + 1) % totalBanners);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(progressIntervalRef.current);
  }, [totalBanners, isPaused, currentIndex]);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    setProgress(0);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalBanners) % totalBanners);
  }, [totalBanners]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    setProgress(0);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalBanners);
  }, [totalBanners]);

  const handleDotClick = (idx, e) => {
    if (e) e.stopPropagation();
    if (idx === currentIndex) return;
    setProgress(0);
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  // Drag/Swipe handler on mobile
  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  // Helper to format image URLs
  const getBannerImages = (b) => {
    if (!b) return [];
    const raw = b.images && Array.isArray(b.images) && b.images.length > 0
      ? b.images
      : (b.imageUrl ? [b.imageUrl] : []);
    
    return raw.map((img) => {
      const rawUrl = img.startsWith("http") ? img : `${backendUrl}${img.startsWith("/") ? "" : "/"}${img}`;
      return getOptimizedImageUrl(rawUrl, { width: 650, quality: 80 }) || rawUrl;
    });
  };

  const currentImages = getBannerImages(currentBanner);
  const hasImages = currentImages.length > 0 && currentImages[0] !== "/favicon.png";

  const targetLink = currentBanner.linkUrl || "/product";
  const title = currentBanner.title || "";
  const subtitle = currentBanner.subtitle || "";
  const tagline = currentBanner.tagline || "";
  const discountTag = currentBanner.discountTag || "";
  const ctaText = currentBanner.ctaText || "Shop Now";
  const customBg = currentBanner.bgColor || "";
  const isDarkTheme = currentBanner.theme === "light" || isDarkColor(customBg);
  const showPerks = currentBanner.showPerks !== false;
  const hasTextContent = Boolean(title || subtitle || tagline || discountTag);

  const handleAction = (e) => {
    if (e) e.stopPropagation();
    if (!targetLink) return;
    if (targetLink.startsWith("http://") || targetLink.startsWith("https://")) {
      window.open(targetLink, "_blank", "noopener,noreferrer");
    } else {
      navigate(targetLink);
    }
  };

  // Split title to highlight last 2 words with accent gradient
  const titleWords = title.split(" ");
  const firstPart = titleWords.length > 2 ? titleWords.slice(0, -2).join(" ") : "";
  const highlightPart = titleWords.length > 2 ? titleWords.slice(-2).join(" ") : title;

  return (
    <section className="w-full px-2 sm:px-4 lg:px-6 pt-1 pb-1.5 select-none">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="group relative w-full rounded-sm overflow-hidden cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all duration-500 border border-slate-200/90 dark:border-slate-800 bg-gradient-to-r from-[#F8FAFC] via-[#EEF4FF] to-[#E2ECFF]"
        title={`${tagline ? tagline + " - " : ""}${title || "Promotional Banner"}`}
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent opacity-70 z-20" />

        {/* Slideshow Content Container */}
        <div className="relative w-full overflow-hidden h-[160px] sm:h-[220px] md:h-[260px] lg:h-[290px] xl:h-[310px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentBanner._id || currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              onClick={handleAction}
              className={`absolute inset-0 w-full h-full ${
                !customBg
                  ? "bg-gradient-to-r from-[#F8FAFC] via-[#EEF4FF] to-[#E2ECFF] dark:from-slate-900 dark:via-slate-850 dark:to-slate-900"
                  : ""
              }`}
              style={customBg ? { backgroundColor: customBg } : {}}
            >
              {/* Subtle Atmospheric Backlight Orbs */}
              <div className="absolute -top-1/4 -left-1/6 w-1/2 h-full bg-blue-400/15 dark:bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />
              <div className="absolute -bottom-1/4 -right-1/6 w-1/2 h-full bg-purple-400/15 dark:bg-purple-500/10 rounded-full blur-[90px] pointer-events-none" />

              {/* ═════════════════════════════════════════════════════════════
                  PREMIUM EDITORIAL HERO LAYOUT (TEXT LEFT + SEAMLESS PNG RIGHT)
                  ═════════════════════════════════════════════════════════════ */}
              <div className="relative z-10 w-full h-full flex items-stretch justify-between overflow-hidden">
                
                {/* ── LEFT COLUMN: EDITORIAL CONTENT & CTA ── */}
                {hasTextContent ? (
                  <div className="w-[60%] sm:w-[50%] md:w-[46%] xl:w-[44%] text-left z-20 flex flex-col justify-center px-3 sm:px-7 lg:px-9 py-2 sm:py-4 pointer-events-auto h-full">
                    {/* Eyebrow Tagline Badge */}
                    {tagline && (
                      <div className="inline-flex items-center gap-1.5 mb-1 sm:mb-2 w-fit">
                        <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-sm text-[8.5px] sm:text-[10px] font-black tracking-wider uppercase backdrop-blur-md border shadow-2xs ${
                          isDarkTheme
                            ? "bg-white/10 text-slate-100 border-white/20"
                            : "bg-blue-100/80 text-blue-900 border-blue-200/80 dark:bg-slate-800 dark:text-blue-300 dark:border-slate-700"
                        }`}>
                          <Sparkles size={10} className="text-amber-500 shrink-0" />
                          <span className="truncate max-w-[130px] sm:max-w-none">{tagline}</span>
                        </span>
                      </div>
                    )}

                    {/* Headline Title */}
                    <h2 className={`text-sm sm:text-2xl md:text-3xl lg:text-[32px] font-black tracking-tight leading-[1.14] ${
                      isDarkTheme ? "text-white" : "text-slate-950 dark:text-white"
                    }`}>
                      {firstPart ? `${firstPart} ` : ""}
                      <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {highlightPart}
                      </span>
                    </h2>

                    {/* Subtitle */}
                    {subtitle && (
                      <p className={`text-[10px] sm:text-xs md:text-sm font-medium line-clamp-1 sm:line-clamp-2 mt-0.5 sm:mt-1.5 max-w-md leading-snug ${
                        isDarkTheme ? "text-slate-200/90" : "text-slate-600 dark:text-slate-300"
                      }`}>
                        {subtitle}
                      </p>
                    )}

                    {/* Action Row: CTA Button + Discount Badge */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-1.5 sm:mt-3.5">
                      <button
                        type="button"
                        onClick={handleAction}
                        className="inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1 sm:py-2.5 rounded-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-[10px] sm:text-xs md:text-sm shadow-xs transition-all active:scale-95 cursor-pointer group/btn shrink-0"
                      >
                        <span>{ctaText}</span>
                        <ArrowRight size={12} className="stroke-[2.5] group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>

                      {discountTag && (
                        <div className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-1 rounded-sm bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-300/80 dark:border-amber-700/60 text-slate-900 dark:text-white shadow-2xs backdrop-blur-md">
                          <Flame size={10} className="text-rose-500 shrink-0 fill-rose-500" />
                          <span className="text-[9px] sm:text-[11px] font-black uppercase text-amber-700 dark:text-amber-300">
                            {discountTag}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Trust Perks Highlights Strip */}
                    {showPerks && (
                      <div className={`hidden sm:flex items-center gap-3 lg:gap-4 mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] font-bold ${
                        isDarkTheme ? "text-slate-300/80" : "text-slate-600 dark:text-slate-400"
                      }`}>
                        <span className="flex items-center gap-1">
                          <Truck size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>Free Express Delivery</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>100% Authentic Quality</span>
                        </span>
                        <span className="hidden lg:flex items-center gap-1">
                          <RotateCcw size={12} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span>Easy 7-Day Returns</span>
                        </span>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* ── RIGHT COLUMN: SEAMLESS PNG RUNWAY STAGE (NO WHITE BOXES & NO TEXT OVERLAYS) ── */}
                {hasImages ? (
                  <div
                    className={`relative h-full flex items-end justify-center overflow-hidden pointer-events-none ${
                      hasTextContent
                        ? "w-[50%] md:w-[52%] lg:w-[58%] xl:w-[60%]"
                        : "w-full max-w-5xl mx-auto"
                    }`}
                  >
                    {/* Staged Multi-Model Runway Presentation */}
                    <div
                      className={`relative z-10 w-full h-full flex items-end px-2 sm:px-4 ${
                        currentImages.length === 1
                          ? "justify-center md:justify-end pr-4 sm:pr-8"
                          : currentImages.length === 2
                          ? "justify-center gap-2 sm:gap-6"
                          : currentImages.length === 3
                          ? "justify-center gap-1 sm:gap-3"
                          : "justify-end sm:justify-center -space-x-8 sm:-space-x-12 md:-space-x-14 lg:-space-x-16 xl:-space-x-20 pr-2 sm:pr-6"
                      }`}
                    >
                      {currentImages.map((imgSrc, imgIdx) => {
                        // Dynamic z-index and elevation styling for multi-model overlapping stage
                        const total = currentImages.length;
                        const isOverlappingGroup = total >= 4;
                        const zIndex = isOverlappingGroup ? 10 + imgIdx * 5 : 10;
                        const scaleClass =
                          total === 1
                            ? "scale-100"
                            : total === 2
                            ? "scale-98"
                            : total === 3
                            ? imgIdx === 1
                              ? "scale-105 z-20"
                              : "scale-95 z-10"
                            : imgIdx % 2 === 0
                            ? "scale-95 opacity-95"
                            : "scale-102 opacity-100";

                        return (
                          <div
                            key={imgIdx}
                            className={`relative h-full flex items-end justify-center group/model transition-all duration-500 ease-out shrink-0 ${scaleClass}`}
                            style={{
                              zIndex,
                              maxWidth:
                                total === 1
                                  ? "85%"
                                  : total === 2
                                  ? "48%"
                                  : total === 3
                                  ? "36%"
                                  : "32%",
                              height: isOverlappingGroup ? "96%" : "100%"
                            }}
                          >
                            <img
                              src={getOptimizedImageUrl(imgSrc, { width: 800, quality: 80 })}
                              alt={`${title || "Promotional Model"} - ${imgIdx + 1}`}
                              className="h-full w-auto max-h-full max-w-full object-contain object-bottom select-none transition-all duration-500 ease-out group-hover/model:scale-105"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Fallback Graphic Mode if No Images Uploaded */
                  <div className="w-full h-full flex items-center justify-center p-6 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Promotional Collection
                    </p>
                  </div>
                )}

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── SLIDESHOW CONTROLS & PAGINATION ── */}
        {totalBanners > 1 && (
          <>
            {/* Left Chevron Button */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous promotional slide"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100 active:scale-95"
            >
              <ChevronLeft size={16} className="stroke-[2.5]" />
            </button>

            {/* Right Chevron Button */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next promotional slide"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100 active:scale-95"
            >
              <ChevronRight size={16} className="stroke-[2.5]" />
            </button>

            {/* Modern Floating Pill Indicators (Bottom Left - Away from Models) */}
            <div className="absolute bottom-2.5 left-4 sm:left-7 lg:left-9 z-30 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-sm border border-slate-200/80 dark:border-slate-700 shadow-sm">
              {banners.map((b, idx) => {
                const isActive = idx === currentIndex;
                const isPassed = idx < currentIndex;

                return (
                  <button
                    key={b._id || idx}
                    type="button"
                    onClick={(e) => handleDotClick(idx, e)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className="group/pill relative h-1.5 rounded-sm overflow-hidden cursor-pointer transition-all duration-300 border-none p-0 bg-slate-200 dark:bg-slate-700"
                    style={{ width: isActive ? "24px" : "8px" }}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-sm transition-all duration-100"
                      style={{
                        width: isActive ? `${progress}%` : isPassed ? "100%" : "0%"
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default TechAdBanner;
