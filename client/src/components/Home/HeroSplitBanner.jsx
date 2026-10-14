import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Heart,
  Flame,
  Zap,
  CheckCircle2
} from "lucide-react";
import { backendUrl } from "../../config";
import { cachedGet } from "../../utils/apiCache";
import { getOptimizedImageUrl } from "../../utils/imageOptimizer";
import BrandLogo from "../BrandLogo";
import { toast } from "react-toastify";

// Hero Model Cutout Assets
import heroSlide1 from "../../assets/hero_slide_1.webp";
import heroSlide2 from "../../assets/hero_slide_2.webp";
import heroSlide3 from "../../assets/hero_slide_3.webp";
import heroSlide4 from "../../assets/hero_slide_4.webp";

const DEFAULT_MODEL_SLIDES = [
  {
    id: "style-limits",
    tag: "NEW SEASON COLLECTION",
    line1: "Style",
    accentWord: "Without",
    line2Remainder: "Limits",
    title: ["Style", "Without Limits."],
    subtitle: "Discover premium fashion, curated collections and everyday essentials for a better you — only at CartNow.",
    ctaText: "Shop Now",
    ctaLink: "/product",
    secondaryCtaText: "Explore Collection",
    secondaryCtaLink: "/product",
    bgGradient: "from-[#FAF7F2] via-[#FAF7F2] to-[#FAF7F2] dark:from-slate-950 dark:via-slate-950 dark:to-slate-950",
    borderColor: "border-stone-200/60 dark:border-slate-800",
    glowColor: "bg-orange-300/20",
    image: heroSlide1,
    alt: "New Season Collection"
  },
  {
    id: "tech-extravaganza",
    tag: "SMART TECH COLLECTION",
    line1: "Future",
    accentWord: "Beyond",
    line2Remainder: "Reality",
    title: ["Future", "Beyond Reality."],
    subtitle: "Immersive audio, flagship wearables & cutting-edge electronics at unbeatable prices.",
    ctaText: "Shop Now",
    ctaLink: "/product?category=electronics",
    secondaryCtaText: "Explore Collection",
    secondaryCtaLink: "/product",
    bgGradient: "from-[#FAF7F2] via-[#FAF7F2] to-[#FAF7F2] dark:from-slate-950 dark:via-slate-950 dark:to-slate-950",
    borderColor: "border-stone-200/60 dark:border-slate-800",
    glowColor: "bg-purple-300/20",
    image: heroSlide4,
    alt: "Smart Tech Collection"
  },
  {
    id: "organic-glow",
    tag: "LUXURY MINERAL SCIENCE",
    line1: "Radiant",
    accentWord: "Natural",
    line2Remainder: "Glow",
    title: ["Radiant", "Natural Glow."],
    subtitle: "Revitalize your skin with cellular restoration and clean organic formulas curated for true vitality.",
    ctaText: "Shop Now",
    ctaLink: "/product?category=beauty",
    secondaryCtaText: "Explore Collection",
    secondaryCtaLink: "/product",
    bgGradient: "from-[#FAF7F2] via-[#FAF7F2] to-[#FAF7F2] dark:from-slate-950 dark:via-slate-950 dark:to-slate-950",
    borderColor: "border-stone-200/60 dark:border-slate-800",
    glowColor: "bg-rose-300/20",
    image: heroSlide2,
    alt: "Organic Glow Collection"
  },
  {
    id: "chrono-luxury",
    tag: "TIMELESS HOROLOGY EDIT",
    line1: "Timeless",
    accentWord: "Modern",
    line2Remainder: "Craft",
    title: ["Timeless", "Modern Craft."],
    subtitle: "Precision Swiss movement meets obsidian craftsmanship & timeless styling for the bold.",
    ctaText: "Shop Now",
    ctaLink: "/product?category=watches",
    secondaryCtaText: "Explore Collection",
    secondaryCtaLink: "/product",
    bgGradient: "from-[#FAF7F2] via-[#FAF7F2] to-[#FAF7F2] dark:from-slate-950 dark:via-slate-950 dark:to-slate-950",
    borderColor: "border-stone-200/60 dark:border-slate-800",
    glowColor: "bg-amber-300/20",
    image: heroSlide3,
    alt: "Chrono Luxury Watch"
  }
];

const renderEditorialTitle = (slide) => {
  if (slide.line1 && slide.accentWord) {
    return (
      <>
        <span className="block">{slide.line1}</span>
        <span className="block mt-0.5">
          <span className="text-[#FF5722]">{slide.accentWord}</span>{" "}
          <span>{slide.line2Remainder}</span>
          <span className="text-[#FF5722]">.</span>
        </span>
      </>
    );
  }

  const titleStr = Array.isArray(slide.title)
    ? slide.title.join(" ")
    : String(slide.title || "Style Without Limits");
  const words = titleStr.replace(/\.$/, "").split(/\s+/).filter(Boolean);

  if (words.length <= 1) {
    return (
      <span>
        {words[0] || "Style"}
        <span className="text-[#FF5722]">.</span>
      </span>
    );
  }
  if (words.length === 2) {
    return (
      <>
        <span className="block">{words[0]}</span>
        <span className="block mt-0.5">
          <span className="text-[#FF5722]">{words[1]}</span>
          <span className="text-[#FF5722]">.</span>
        </span>
      </>
    );
  }
  return (
    <>
      <span className="block">{words[0]}</span>
      <span className="block mt-0.5">
        <span className="text-[#FF5722]">{words[1]}</span>{" "}
        <span>{words.slice(2).join(" ")}</span>
        <span className="text-[#FF5722]">.</span>
      </span>
    </>
  );
};

const HeroSplitBanner = ({ homepageData, onAddToCart, wishlist: externalWishlist }) => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState(DEFAULT_MODEL_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Local Wishlist Tracking
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cartnow_wishlist") || "[]");
    } catch (e) {
      return [];
    }
  });

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem("cartnow_wishlist", JSON.stringify(next));
      } catch (e) {}
      toast.info(exists ? "Removed from wishlist" : "Added to wishlist ❤️");
      return next;
    });
  };

  // Load dynamic hero models from /api/system/hero-assets (Admin Hero Slideshow)
  useEffect(() => {
    let isMounted = true;

    const fetchHeroAssets = async () => {
      try {
        // Direct fetch to always get latest admin-published models
        const res = await cachedGet(`${backendUrl}/api/system/hero-assets`, {}, 30000);

        if (res.data?.success && Array.isArray(res.data.assets) && res.data.assets.length > 0) {
          const dynamicSlides = res.data.assets.map((asset, idx) => {
            const catLower = (asset.category || "").toLowerCase();

            // Rich themed backgrounds tailored to the model asset category
            let theme;
            if (catLower.includes("fashion") || catLower.includes("women") || catLower.includes("apparel") || catLower.includes("dress")) {
              theme = {
                tagColor: "text-orange-600 dark:text-orange-400",
                tagPillBg: "bg-orange-100/90 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/80 dark:border-orange-800/40",
                ctaBg: "bg-gradient-to-r from-[#FF6A00] to-[#E65100] hover:from-[#E55F00] hover:to-[#CC4400] text-white shadow-[0_4px_16px_rgba(255,106,0,0.35)]",
                bgGradient: "from-[#FFF8F2] via-[#FEEDDF] to-[#FCE0CA] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
                borderColor: "border-orange-200/70 dark:border-slate-800",
                glowColor: "bg-orange-400/25 dark:bg-orange-500/15",
                ctaText: "Shop Fashion",
                ctaLink: "/product?category=women"
              };
            } else if (catLower.includes("elect") || catLower.includes("tech") || catLower.includes("gadget") || catLower.includes("phone")) {
              theme = {
                tagColor: "text-purple-600 dark:text-purple-400",
                tagPillBg: "bg-purple-100/90 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/40",
                ctaBg: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-[0_4px_16px_rgba(147,51,234,0.35)]",
                bgGradient: "from-[#F7F5FF] via-[#EEE8FF] to-[#DFD5FE] dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900",
                borderColor: "border-purple-200/70 dark:border-slate-800",
                glowColor: "bg-purple-400/25 dark:bg-purple-500/15",
                ctaText: "Shop Electronics",
                ctaLink: "/product?category=electronics"
              };
            } else if (catLower.includes("beauty") || catLower.includes("skin") || catLower.includes("care") || catLower.includes("cosmetic")) {
              theme = {
                tagColor: "text-rose-600 dark:text-rose-400",
                tagPillBg: "bg-rose-100/90 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/40",
                ctaBg: "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-[0_4px_16px_rgba(244,63,94,0.35)]",
                bgGradient: "from-[#FFF2F5] via-[#FFE5EC] to-[#FCCCD7] dark:from-slate-900 dark:via-rose-950/40 dark:to-slate-900",
                borderColor: "border-rose-200/70 dark:border-slate-800",
                glowColor: "bg-rose-400/25 dark:bg-rose-500/15",
                ctaText: "Explore Beauty",
                ctaLink: "/product?category=beauty"
              };
            } else if (catLower.includes("watch") || catLower.includes("jewel") || catLower.includes("luxury")) {
              theme = {
                tagColor: "text-amber-700 dark:text-amber-400",
                tagPillBg: "bg-amber-100/90 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/40",
                ctaBg: "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-[0_4px_16px_rgba(217,119,6,0.35)]",
                bgGradient: "from-[#FFFDF5] via-[#FEF8E3] to-[#FDE8B5] dark:from-slate-900 dark:via-amber-950/40 dark:to-slate-900",
                borderColor: "border-amber-200/70 dark:border-slate-800",
                glowColor: "bg-amber-400/25 dark:bg-amber-500/15",
                ctaText: "Shop Watches",
                ctaLink: "/product?category=watches"
              };
            } else {
              const fallbackPalettes = [
                {
                  tagColor: "text-sky-600 dark:text-sky-400",
                  tagPillBg: "bg-sky-100/90 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/40",
                  ctaBg: "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-[0_4px_16px_rgba(2,132,199,0.35)]",
                  bgGradient: "from-[#F2F9FF] via-[#E2F4FE] to-[#BFE7FD] dark:from-slate-900 dark:via-sky-950/40 dark:to-slate-900",
                  borderColor: "border-sky-200/70 dark:border-slate-800",
                  glowColor: "bg-sky-400/25 dark:bg-sky-500/15",
                  ctaText: `Explore ${asset.category || "Deals"}`,
                  ctaLink: `/product?category=${encodeURIComponent(asset.category || "all")}`
                },
                {
                  tagColor: "text-emerald-600 dark:text-emerald-400",
                  tagPillBg: "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40",
                  ctaBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-[0_4px_16px_rgba(5,150,105,0.35)]",
                  bgGradient: "from-[#F0FDF4] via-[#DCFCE7] to-[#BBF7D0] dark:from-slate-900 dark:via-emerald-950/40 dark:to-slate-900",
                  borderColor: "border-emerald-200/70 dark:border-slate-800",
                  glowColor: "bg-emerald-400/25 dark:bg-emerald-500/15",
                  ctaText: `Discover ${asset.category || "Now"}`,
                  ctaLink: `/product?category=${encodeURIComponent(asset.category || "all")}`
                }
              ];
              theme = fallbackPalettes[idx % fallbackPalettes.length];
            }

            // Clean concise title extraction (Max 2-3 punchy words for the headline)
            const rawName = (asset.name || "Exclusive Collection").trim();
            let cleanTitle = rawName;
            if (cleanTitle.includes("—")) {
              cleanTitle = cleanTitle.split("—")[0].trim();
            } else if (cleanTitle.includes(" - ")) {
              cleanTitle = cleanTitle.split(" - ")[0].trim();
            }

            if (cleanTitle.toLowerCase().includes(" designed for")) {
              cleanTitle = cleanTitle.split(/ designed for/i)[0].trim();
            } else if (cleanTitle.toLowerCase().includes(" for ")) {
              const parts = cleanTitle.split(/ for /i);
              if (parts[0].trim().length >= 6) cleanTitle = parts[0].trim();
            }

            // Clean common suffix artifacts
            cleanTitle = cleanTitle.replace(/\s+(Campaign|Lifestyle Shoot)$/i, "").trim();

            // Limit headline to at most 3 words so it never over-expands
            const titleWords = cleanTitle.split(/\s+/).slice(0, 3);
            const displayTitle = titleWords.join(" ");

            // Clean concise subtitle (at most 1-2 lines)
            let displaySubtitle = (asset.tagline || "").trim();
            if (!displaySubtitle) {
              if (rawName.length > cleanTitle.length + 8) {
                displaySubtitle = rawName;
              } else {
                displaySubtitle = "Discover verified quality items, exclusive designs & best prices.";
              }
            }

              const rawImgUrl = asset.imageUrl?.startsWith("http") ? asset.imageUrl : `${backendUrl}${asset.imageUrl}`;
              // Deliver high-res uncut image without trimming any borders or subjects
              const trimmedImgUrl = rawImgUrl.includes("res.cloudinary.com") && rawImgUrl.includes("/image/upload/")
                ? rawImgUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_1100/")
                : getOptimizedImageUrl(rawImgUrl, { width: 1100, quality: 85 });

              return {
                id: asset._id || `hero-asset-${idx}`,
                tag: asset.tagline
                  ? `${asset.category?.toUpperCase() || "FEATURED"} • SPECIAL`
                  : `${asset.category?.toUpperCase() || "FEATURED"} CAMPAIGN`,
                tagColor: theme.tagColor,
                tagPillBg: theme.tagPillBg,
                title: displayTitle,
                subtitle: displaySubtitle,
                ctaText: theme.ctaText,
                ctaLink: theme.ctaLink,
                ctaBg: theme.ctaBg,
                bgGradient: theme.bgGradient,
                borderColor: theme.borderColor,
                glowColor: theme.glowColor,
                image: trimmedImgUrl,
                alt: asset.name || "Hero Model"
              };
          });

          if (isMounted && dynamicSlides.length > 0) {
            setSlides(dynamicSlides);
          }
        }
      } catch (err) {
        console.warn("Hero dynamic assets fetch error:", err);
      }
    };

    fetchHeroAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto slide timer
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  // Preload only the next slide image lazily
  useEffect(() => {
    if (slides.length > 1) {
      const next = slides[(currentSlide + 1) % slides.length];
      if (next?.image) {
        const img = new Image();
        img.decoding = "async";
        img.src = next.image;
      }
    }
  }, [currentSlide, slides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const activeSlide = slides[currentSlide] || slides[0];

  return (
    <div className="w-full px-0 py-0 select-none flex flex-col">
      {/* ════════════════════════════════════════════════════════
          1. FULL-WIDTH HERO CAROUSEL BANNER (100% Page Width)
          ════════════════════════════════════════════════════════ */}
      <div
        className="relative w-full h-[47vh] min-h-[390px] md:min-h-[420px] max-h-[530px] overflow-hidden group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="relative w-full h-full rounded-none border-b-0 bg-[#FAF7F2] dark:bg-slate-950 overflow-hidden shadow-none transition-colors duration-500"
        >
          {/* Subtle Ambient Radial Backlight Glow Centered Behind Cutout Model */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[440px] md:w-[540px] h-[340px] sm:h-[440px] md:h-[540px] rounded-full blur-[90px] sm:blur-[120px] pointer-events-none transition-colors duration-700 opacity-60 dark:opacity-30">
            <div className={`w-full h-full rounded-full ${activeSlide.glowColor || "bg-orange-300/20"}`} />
          </div>

          {/* Slide Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full flex flex-row items-center justify-between z-10 pointer-events-none"
            >
              {/* Left Column: Tagline + Grand Editorial Headline */}
              <div className="relative w-[48%] sm:w-[32%] md:w-[32%] lg:w-[30%] text-left z-20 flex flex-col justify-center items-start pl-3 sm:pl-5 md:pl-7 lg:pl-10 pr-1 py-4 pointer-events-auto h-full">
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-left max-w-[380px]">
                  {/* Orange Dash + Tagline */}
                  <div className="flex items-center gap-2">
                    <span className="w-4 sm:w-5 h-[2px] bg-[#FF5722] rounded-full shrink-0" />
                    <span className="text-[9.5px] sm:text-[10.5px] md:text-[11.5px] font-bold tracking-[0.2em] uppercase text-[#FF5722]">
                      {activeSlide.tag || "NEW SEASON COLLECTION"}
                    </span>
                  </div>

                  {/* Editorial Serif Headline */}
                  <h1 className="font-editorial text-2xl min-[400px]:text-3xl sm:text-4xl md:text-[46px] lg:text-[54px] xl:text-[62px] font-bold text-slate-950 dark:text-white leading-[0.98] tracking-tight">
                    {renderEditorialTitle(activeSlide)}
                  </h1>
                </div>
              </div>

              {/* Center Model Cutout: Standing proudly in the exact middle of the banner */}
              <div className="absolute inset-0 w-full h-full flex items-end justify-center pointer-events-none z-10 overflow-hidden">
                <img
                  src={activeSlide.image}
                  alt={activeSlide.alt}
                  className="h-full max-h-full max-w-[210px] min-[440px]:max-w-[260px] sm:max-w-[400px] md:max-w-[460px] w-auto object-contain object-bottom select-none opacity-100 drop-shadow-[0_16px_36px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_20px_42px_rgba(0,0,0,0.55)] transition-transform duration-500 scale-100 group-hover:scale-[1.02]"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>

              {/* Center Spacer: Ensures model has visual breathing room on wider viewports */}
              <div className="hidden sm:block sm:w-[36%] md:w-[38%] lg:w-[42%] pointer-events-none" />

              {/* Right Column: Subtitle + Dual Action Buttons (Pushed more to the right edge) */}
              <div className="relative w-[48%] sm:w-[32%] md:w-[30%] lg:w-[28%] z-20 flex flex-col justify-center items-end pr-3 sm:pr-8 md:pr-12 lg:pr-16 pl-1 py-4 pointer-events-auto h-full ml-auto">
                <div className="space-y-2.5 sm:space-y-3.5 md:space-y-4 max-w-[330px] text-left ml-auto">
                  {/* Subtitle (Hidden on small mobile collapse so text does not collide with model) */}
                  <p className="hidden min-[480px]:block text-[11px] sm:text-xs md:text-[13px] text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
                    {activeSlide.subtitle || "Discover premium fashion, curated collections and everyday essentials for a better you — only at CartNow."}
                  </p>

                  {/* Dual Action Pill Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2.5 pt-0.5 relative z-30">
                    {/* Button 1: Solid Orange Pill */}
                    <button
                      type="button"
                      onClick={() => navigate(activeSlide.ctaLink || "/product")}
                      className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[#FF5722] hover:bg-[#E64A19] active:scale-95 text-white font-semibold text-[11px] sm:text-[12.5px] px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 group whitespace-nowrap"
                    >
                      <span>{activeSlide.ctaText || "Shop Now"}</span>
                      <ArrowRight size={12} className="stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Button 2: Outline Pill */}
                    <button
                      type="button"
                      onClick={() => navigate(activeSlide.secondaryCtaLink || "/product")}
                      className="hidden min-[420px]:inline-flex sm:inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-transparent hover:bg-slate-900/5 dark:hover:bg-white/10 active:scale-95 text-slate-950 dark:text-white border border-slate-900 dark:border-white font-semibold text-[11px] sm:text-[12.5px] px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full cursor-pointer transition-all duration-200 group whitespace-nowrap"
                    >
                      <span>{activeSlide.secondaryCtaText || "Explore"}</span>
                      <ArrowRight size={12} className="stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>



          {/* Left / Right Carousel Arrow Buttons */}
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 dark:bg-slate-900/85 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 opacity-0 group-hover:opacity-90 hover:scale-105 active:scale-95 border border-slate-200/70 dark:border-slate-800 backdrop-blur-md"
          >
            <ChevronLeft size={16} className="stroke-[2.5]" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 dark:bg-slate-900/85 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 opacity-0 group-hover:opacity-90 hover:scale-105 active:scale-95 border border-slate-200/70 dark:border-slate-800 backdrop-blur-md"
          >
            <ChevronRight size={16} className="stroke-[2.5]" />
          </button>

        </div>
      </div>
    </div>
  );
};

export default HeroSplitBanner;

