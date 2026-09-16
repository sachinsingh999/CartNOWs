import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { backendUrl } from "../../config";
import { cachedGet } from "../../utils/apiCache";
import { getOptimizedImageUrl } from "../../utils/imageOptimizer";
import {
  ArrowRight,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2
} from "lucide-react";

const SLIDE_DURATION = 6500; // 6.5 seconds per slide

const slideVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 30 : -30,
    scale: 0.99
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -30 : 30,
    scale: 0.99,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

// Precise brightness detection for custom background colors
const isDarkColor = (color) => {
  if (!color) return false;
  const darkPresets = ["#000000", "#0f172a", "#0b0f19", "#111827", "#1e1b4b", "#18181b", "#1e293b", "#312e81"];
  if (darkPresets.includes(color.toLowerCase())) return true;
  if (color.startsWith("#") && color.length >= 7) {
    const r = parseInt(color.slice(1, 3), 16) || 0;
    const g = parseInt(color.slice(3, 5), 16) || 0;
    const b = parseInt(color.slice(5, 7), 16) || 0;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }
  return false;
};

// Smart CTA text detection to prevent "Shop Electronics" on fashion/lifestyle banners
const getSmartCtaText = (banner) => {
  if (!banner) return "Shop Now";
  const cta = (banner.ctaText || "").trim();
  const textCorpus = `${banner.title || ""} ${banner.subtitle || ""} ${banner.tagline || ""} ${banner.category || ""}`.toLowerCase();
  const isFashionLifestyle =
    textCorpus.includes("style") ||
    textCorpus.includes("collection") ||
    textCorpus.includes("fragrance") ||
    textCorpus.includes("fashion") ||
    textCorpus.includes("season") ||
    textCorpus.includes("dress") ||
    textCorpus.includes("everyday") ||
    textCorpus.includes("glow") ||
    textCorpus.includes("beauty") ||
    textCorpus.includes("wear");

  if ((!cta || cta.toLowerCase().includes("electronics")) && isFashionLifestyle) {
    return "Explore Collection";
  }
  return cta || "Shop Now";
};

// Smart link detection matching the banner's true category
const getSmartLink = (banner) => {
  if (!banner) return "/product";
  const link = (banner.linkUrl || "").trim();
  const textCorpus = `${banner.title || ""} ${banner.subtitle || ""} ${banner.tagline || ""} ${banner.category || ""}`.toLowerCase();
  const isFashionLifestyle =
    textCorpus.includes("style") ||
    textCorpus.includes("collection") ||
    textCorpus.includes("fragrance") ||
    textCorpus.includes("fashion") ||
    textCorpus.includes("season") ||
    textCorpus.includes("dress") ||
    textCorpus.includes("everyday") ||
    textCorpus.includes("beauty") ||
    textCorpus.includes("wear");

  if (link.includes("category=electronics") && isFashionLifestyle) {
    return "/product?category=women";
  }
  return link || "/product";
};

// Theme styling palette generator based on banner content / category
const getBannerTheme = (banner) => {
  if (!banner) {
    return {
      bgGradient: "from-[#F8FAFF] via-[#EEF4FF] to-[#E0EBFF] dark:from-slate-900 dark:via-slate-850 dark:to-slate-900",
      glowColor: "from-blue-400/20 via-indigo-400/15 to-transparent",
      headlineGradient: "from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-300",
      ctaGradient: "from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
      ctaShadow: "shadow-[0_4px_18px_rgba(79,70,229,0.35)] hover:shadow-[0_6px_24px_rgba(79,70,229,0.48)]",
      tagBadge: "bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-purple-500/15 border-blue-400/50 dark:border-blue-400/30 text-blue-900 dark:text-blue-300",
      tagIcon: "text-blue-500 fill-blue-500/40"
    };
  }

  const textCorpus = `${banner.title || ""} ${banner.subtitle || ""} ${banner.tagline || ""} ${banner.category || ""}`.toLowerCase();

  // 1. Fashion / Apparel / Dress / Everyday / Lifestyle
  if (
    textCorpus.includes("style") ||
    textCorpus.includes("collection") ||
    textCorpus.includes("fashion") ||
    textCorpus.includes("season") ||
    textCorpus.includes("dress") ||
    textCorpus.includes("everyday") ||
    textCorpus.includes("festival") ||
    textCorpus.includes("wear") ||
    textCorpus.includes("women")
  ) {
    return {
      bgGradient: "from-[#FAF7FF] via-[#F3EEFF] to-[#EBE2FC] dark:from-slate-900 dark:via-slate-850 dark:to-purple-950/30",
      glowColor: "from-purple-400/25 via-pink-400/15 to-transparent",
      headlineGradient: "from-violet-600 via-purple-600 to-pink-600 dark:from-violet-400 dark:via-purple-300 dark:to-pink-300",
      ctaGradient: "from-violet-600 via-indigo-600 to-purple-700 hover:from-violet-700 hover:to-purple-800",
      ctaShadow: "shadow-[0_4px_18px_rgba(124,58,237,0.35)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.5)]",
      tagBadge: "bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-purple-500/15 border-amber-400/50 dark:border-amber-400/30 text-amber-900 dark:text-amber-300",
      tagIcon: "text-amber-500 fill-amber-500/40"
    };
  }

  // 2. Beauty / Cosmetic / Fragrance / Skincare
  if (
    textCorpus.includes("beauty") ||
    textCorpus.includes("skin") ||
    textCorpus.includes("fragrance") ||
    textCorpus.includes("perfume") ||
    textCorpus.includes("cosmetic") ||
    textCorpus.includes("glow")
  ) {
    return {
      bgGradient: "from-[#FFF5F8] via-[#FFEBF1] to-[#FCDCE6] dark:from-slate-900 dark:via-slate-850 dark:to-rose-950/30",
      glowColor: "from-rose-400/25 via-pink-400/15 to-transparent",
      headlineGradient: "from-rose-600 via-pink-600 to-purple-600 dark:from-rose-400 dark:via-pink-300 dark:to-purple-300",
      ctaGradient: "from-rose-600 via-pink-600 to-purple-600 hover:from-rose-700 hover:to-pink-700",
      ctaShadow: "shadow-[0_4px_18px_rgba(244,63,94,0.35)] hover:shadow-[0_6px_24px_rgba(244,63,94,0.48)]",
      tagBadge: "bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-purple-500/15 border-rose-400/50 dark:border-rose-400/30 text-rose-900 dark:text-rose-300",
      tagIcon: "text-rose-500 fill-rose-500/40"
    };
  }

  // 3. Watches / Luxury / Jewellery
  if (
    textCorpus.includes("watch") ||
    textCorpus.includes("jewel") ||
    textCorpus.includes("gold") ||
    textCorpus.includes("chrono") ||
    textCorpus.includes("luxury")
  ) {
    return {
      bgGradient: "from-[#FFFDF5] via-[#FEF7E6] to-[#FDE8BD] dark:from-slate-900 dark:via-slate-850 dark:to-amber-950/30",
      glowColor: "from-amber-400/25 via-yellow-400/15 to-transparent",
      headlineGradient: "from-amber-600 via-orange-600 to-yellow-600 dark:from-amber-400 dark:via-orange-300 dark:to-yellow-300",
      ctaGradient: "from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700",
      ctaShadow: "shadow-[0_4px_18px_rgba(217,119,6,0.35)] hover:shadow-[0_6px_24px_rgba(217,119,6,0.48)]",
      tagBadge: "bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-orange-500/15 border-amber-400/50 dark:border-amber-400/30 text-amber-900 dark:text-amber-300",
      tagIcon: "text-amber-500 fill-amber-500/40"
    };
  }

  // Default: Smart Tech / Electronics
  return {
    bgGradient: "from-[#F8FAFF] via-[#EEF4FF] to-[#E0EBFF] dark:from-slate-900 dark:via-slate-850 dark:to-slate-900",
    glowColor: "from-blue-400/20 via-indigo-400/15 to-transparent",
    headlineGradient: "from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-300",
    ctaGradient: "from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
    ctaShadow: "shadow-[0_4px_18px_rgba(79,70,229,0.35)] hover:shadow-[0_6px_24px_rgba(79,70,229,0.48)]",
    tagBadge: "bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-purple-500/15 border-blue-400/50 dark:border-blue-400/30 text-blue-900 dark:text-blue-300",
    tagIcon: "text-blue-500 fill-blue-500/40"
  };
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
    theme: "light",
    bgColor: "#FAF8FF",
    showPerks: true,
    isActive: true
  };

  const activeBanners = banners.length > 0 ? banners : [DEFAULT_FALLBACK_BANNER];
  const totalBanners = activeBanners.length;
  const currentBanner = activeBanners[currentIndex % totalBanners] || activeBanners[0];
  const theme = getBannerTheme(currentBanner);

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

  // Helper to format image URLs
  const getBannerImages = (b) => {
    if (!b) return [];
    const raw = b.images && Array.isArray(b.images) && b.images.length > 0
      ? b.images
      : (b.imageUrl ? [b.imageUrl] : []);
    
    return raw.map((img) => {
      const rawUrl = img.startsWith("http") ? img : `${backendUrl}${img.startsWith("/") ? "" : "/"}${img}`;
      return getOptimizedImageUrl(rawUrl, { width: 1000, quality: 85 }) || rawUrl;
    });
  };

  const currentImages = getBannerImages(currentBanner);
  const hasImages = currentImages.length > 0 && currentImages[0] !== "/favicon.png";

  const targetLink = getSmartLink(currentBanner);
  const title = currentBanner.title || "";
  const subtitle = currentBanner.subtitle || "";
  const tagline = currentBanner.tagline || "";
  const discountTag = currentBanner.discountTag || "";
  const smartCtaText = getSmartCtaText(currentBanner);
  const customBg = currentBanner.bgColor || "";
  const isCustomDark = isDarkColor(customBg);
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

  // Split title into firstPart (high-contrast base) and highlightPart (luxurious gradient)
  const titleWords = title.split(" ").filter(Boolean);
  let firstPart = "";
  let highlightPart = title;

  if (titleWords.length >= 3) {
    firstPart = titleWords.slice(0, -2).join(" ");
    highlightPart = titleWords.slice(-2).join(" ");
  } else if (titleWords.length === 2) {
    firstPart = titleWords[0];
    highlightPart = titleWords[1];
  }

  return (
    <section className="w-full px-2 sm:px-4 lg:px-6 pt-1 pb-1.5 select-none">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="group relative w-full rounded-none overflow-hidden cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.08)] transition-all duration-500 border border-slate-200/90 dark:border-slate-800"
        role="region"
        aria-label={title || "Promotional Banner"}
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/70 to-transparent opacity-80 z-20" />

        {/* Slideshow Content Container */}
        <div className="relative w-full overflow-hidden h-[210px] sm:h-[270px] md:h-[310px] lg:h-[340px] xl:h-[360px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentBanner._id || currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              onClick={handleAction}
              className={`absolute inset-0 w-full h-full ${
                !customBg
                  ? `bg-gradient-to-r ${theme.bgGradient}`
                  : ""
              }`}
              style={customBg ? { backgroundColor: customBg } : {}}
            >
              {/* Luminous Studio Stage Backlight */}
              <div className={`absolute top-0 right-[15%] w-[420px] h-[420px] bg-radial ${theme.glowColor} blur-[90px] pointer-events-none opacity-80 dark:opacity-40`} />
              <div className="absolute -bottom-10 right-[5%] w-[350px] h-[350px] bg-radial from-pink-400/20 via-purple-300/10 to-transparent blur-[80px] pointer-events-none" />

              {/* ═════════════════════════════════════════════════════════════
                  HIGH-FASHION EDITORIAL HERO (LEFT EDITORIAL + RIGHT RUNWAY)
                  ═════════════════════════════════════════════════════════════ */}
              <div className="relative z-10 w-full h-full flex items-center justify-between overflow-hidden">
                
                {/* ── LEFT COLUMN: EDITORIAL CONTENT & CTA (PINNED ON LEFT WITH GENEROUS ARROW CLEARANCE) ── */}
                {hasTextContent && (
                  <div className="relative z-20 w-full md:w-[54%] lg:w-[48%] xl:w-[45%] text-left flex flex-col justify-center pl-12 sm:pl-16 md:pl-16 lg:pl-20 pr-4 sm:pr-6 py-3 sm:py-6 pointer-events-auto h-full">
                    
                    {/* Eyebrow Tagline Badge */}
                    {tagline && (
                      <div className="inline-flex items-center gap-1.5 mb-1.5 sm:mb-2.5 w-fit">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-none text-[9.5px] sm:text-[11.5px] font-black tracking-wider uppercase backdrop-blur-md border shadow-2xs transition-all ${
                          isCustomDark
                            ? "bg-white/10 text-amber-300 border-white/15"
                            : theme.tagBadge
                        }`}>
                          <Sparkles size={12} className={`${theme.tagIcon} shrink-0 animate-pulse`} />
                          <span className="truncate max-w-[180px] sm:max-w-none">{tagline}</span>
                        </span>
                      </div>
                    )}

                    {/* Headline Title with High-Contrast Solid Base + Radiant Gradient Highlight */}
                    <h2 className={`text-lg sm:text-2xl md:text-3xl lg:text-[36px] xl:text-[40px] font-black tracking-tight leading-[1.1] ${
                      isCustomDark ? "text-white" : "text-slate-950 dark:text-white"
                    }`}>
                      {firstPart ? <span className="mr-2">{firstPart}</span> : null}
                      <span className={`bg-gradient-to-r ${theme.headlineGradient} bg-clip-text text-transparent drop-shadow-2xs`}>
                        {highlightPart}
                      </span>
                    </h2>

                    {/* Subtitle (Crisp & Legible) */}
                    {subtitle && (
                      <p className={`text-[11px] sm:text-xs md:text-[14px] font-medium line-clamp-2 mt-1 sm:mt-2.5 max-w-md leading-relaxed ${
                        isCustomDark ? "text-slate-200/90" : "text-slate-600 dark:text-slate-300"
                      }`}>
                        {subtitle}
                      </p>
                    )}

                    {/* Action Row: CTA Button + Discount Badge */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3.5 mt-2.5 sm:mt-4">
                      <button
                        type="button"
                        onClick={handleAction}
                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-none bg-gradient-to-r ${theme.ctaGradient} text-white font-black text-[11px] sm:text-xs md:text-sm ${theme.ctaShadow} hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer group/btn shrink-0`}
                      >
                        <span>{smartCtaText}</span>
                        <ArrowRight size={14} className="stroke-[2.5] group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </button>

                      {discountTag && (
                        <div className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-none bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 border border-amber-400/60 dark:border-amber-600/50 text-slate-900 dark:text-white shadow-2xs backdrop-blur-md">
                          <Flame size={13} className="text-orange-500 shrink-0 fill-orange-500" />
                          <span className="text-[10px] sm:text-[11.5px] font-black uppercase text-amber-900 dark:text-amber-300 tracking-wide">
                            {discountTag}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Trust Perks Highlights Strip */}
                    {showPerks && (
                      <div className={`hidden sm:flex items-center gap-2.5 lg:gap-3.5 mt-3.5 sm:mt-4.5 text-[10px] sm:text-[11.5px] font-bold ${
                        isCustomDark ? "text-slate-300/90" : "text-slate-700 dark:text-slate-300"
                      }`}>
                        <span className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2.5 py-1 rounded-none border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                          <Truck size={13} className="text-blue-600 dark:text-blue-400 shrink-0 stroke-[2.5]" />
                          <span>Free Delivery</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2.5 py-1 rounded-none border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                          <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                          <span>100% Authentic</span>
                        </span>
                        <span className="hidden lg:inline-flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2.5 py-1 rounded-none border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                          <RotateCcw size={13} className="text-violet-600 dark:text-violet-400 shrink-0 stroke-[2.5]" />
                          <span>Easy Returns</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── RIGHT COLUMN: PURE TRANSPARENT PNG RUNWAY STAGE (ABSOLUTE RIGHT ALIGNED) ── */}
                {hasImages ? (
                  <div className="absolute right-0 top-0 bottom-0 h-full w-[56%] sm:w-[58%] md:w-[62%] lg:w-[64%] xl:w-[66%] flex items-end justify-end pointer-events-none z-10 overflow-hidden pr-2 sm:pr-4 lg:pr-8">
                    {/* Floor Contact Shadow */}
                    <div className="absolute bottom-0 right-4 sm:right-8 w-3/4 h-5 bg-black/10 dark:bg-black/30 blur-md rounded-full pointer-events-none" />

                    {/* Staged Multi-Model Runway Presentation */}
                    <div
                      className={`relative z-10 h-full flex items-end justify-end ${
                        currentImages.length === 1
                          ? "w-full max-w-full"
                          : currentImages.length === 2
                          ? "gap-2 sm:gap-6"
                          : currentImages.length === 3
                          ? "gap-1 sm:gap-3"
                          : "-space-x-8 sm:-space-x-12 md:-space-x-14 lg:-space-x-16 xl:-space-x-20"
                      }`}
                    >
                      {currentImages.map((imgSrc, imgIdx) => {
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
                            className={`relative h-full flex items-end justify-end transition-all duration-700 ease-out shrink-0 ${scaleClass}`}
                            style={{
                              zIndex,
                              maxWidth:
                                total === 1
                                  ? "100%"
                                  : total === 2
                                  ? "48%"
                                  : total === 3
                                  ? "36%"
                                  : "32%",
                              height: isOverlappingGroup ? "96%" : "100%"
                            }}
                          >
                            <img
                              src={getOptimizedImageUrl(imgSrc, { width: 1000, quality: 85 })}
                              alt={`Banner Asset ${imgIdx + 1}`}
                              className="h-full w-auto max-h-full max-w-full object-contain object-bottom object-right select-none drop-shadow-[0_16px_28px_rgba(0,0,0,0.14)] dark:drop-shadow-[0_16px_32px_rgba(0,0,0,0.45)]"
                              loading="eager"
                              fetchPriority="high"
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
                ) : null}

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
              aria-label="Previous slide"
              className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-none bg-white/85 dark:bg-slate-900/85 text-slate-800 dark:text-slate-100 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 backdrop-blur-md border border-white/80 dark:border-slate-700/80 shadow-lg flex items-center justify-center transition-all duration-300 cursor-pointer opacity-0 group-hover:opacity-100 active:scale-90 hover:scale-105"
            >
              <ChevronLeft size={18} className="stroke-[2.5]" />
            </button>

            {/* Right Chevron Button */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next slide"
              className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-none bg-white/85 dark:bg-slate-900/85 text-slate-800 dark:text-slate-100 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 backdrop-blur-md border border-white/80 dark:border-slate-700/80 shadow-lg flex items-center justify-center transition-all duration-300 cursor-pointer opacity-0 group-hover:opacity-100 active:scale-90 hover:scale-105"
            >
              <ChevronRight size={18} className="stroke-[2.5]" />
            </button>

            {/* Modern Floating Pill Indicators (Aligned with Text Column) */}
            <div className="absolute bottom-3 sm:bottom-4 left-12 sm:left-16 md:left-16 lg:left-20 z-30 flex items-center gap-1.5 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-none border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
              {activeBanners.map((b, idx) => {
                const isActive = idx === currentIndex;
                const isPassed = idx < currentIndex;

                return (
                  <button
                    key={b._id || idx}
                    type="button"
                    onClick={(e) => handleDotClick(idx, e)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className="group/pill relative h-1.5 rounded-none overflow-hidden cursor-pointer transition-all duration-300 border-none p-0 bg-slate-200 dark:bg-slate-700"
                    style={{ width: isActive ? "26px" : "8px" }}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-none transition-all duration-100"
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
