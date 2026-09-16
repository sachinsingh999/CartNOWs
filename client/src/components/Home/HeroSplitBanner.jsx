import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Heart,
  Truck,
  Flame,
  Zap,
  ShieldCheck,
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

const BAZAAR_SLOT_THEMES = [
  {
    badgeLabel: "Bestseller",
    badgeIcon: Flame,
    badgeBg: "bg-emerald-600 text-white",
    badgeLightBg: "bg-emerald-50 text-emerald-800 border border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40",
    cardBg: "bg-gradient-to-br from-white via-[#F5FAF7] to-[#EBF6F0] dark:from-slate-800/90 dark:via-slate-850 dark:to-emerald-950/25",
    borderColor: "border-emerald-100/90 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-emerald-600/50",
    discountBg: "bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-900/50 dark:text-emerald-200",
    glowAccent: "bg-emerald-400/20"
  },
  {
    badgeLabel: "Premium",
    badgeIcon: Sparkles,
    badgeBg: "bg-amber-600 text-white",
    badgeLightBg: "bg-amber-50 text-amber-800 border border-amber-200/70 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40",
    cardBg: "bg-gradient-to-br from-white via-[#FEFAF3] to-[#FDF3E5] dark:from-slate-800/90 dark:via-slate-850 dark:to-amber-950/25",
    borderColor: "border-amber-100/90 dark:border-slate-700/60 hover:border-amber-300 dark:hover:border-amber-600/50",
    discountBg: "bg-amber-100/80 text-amber-900 border border-amber-200/60 dark:bg-amber-900/50 dark:text-amber-200",
    glowAccent: "bg-amber-400/20"
  },
  {
    badgeLabel: "Most Loved",
    badgeIcon: Heart,
    badgeBg: "bg-rose-600 text-white",
    badgeLightBg: "bg-rose-50 text-rose-800 border border-rose-200/70 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/40",
    cardBg: "bg-gradient-to-br from-white via-[#FFF5F7] to-[#FEEAEE] dark:from-slate-800/90 dark:via-slate-850 dark:to-rose-950/25",
    borderColor: "border-rose-100/90 dark:border-slate-700/60 hover:border-rose-300 dark:hover:border-rose-600/50",
    discountBg: "bg-rose-100/80 text-rose-900 border border-rose-200/60 dark:bg-rose-900/50 dark:text-rose-200",
    glowAccent: "bg-rose-400/20"
  },
  {
    badgeLabel: "Trending",
    badgeIcon: Zap,
    badgeBg: "bg-sky-600 text-white",
    badgeLightBg: "bg-sky-50 text-sky-800 border border-sky-200/70 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/40",
    cardBg: "bg-gradient-to-br from-white via-[#F3F9FE] to-[#E4F2FD] dark:from-slate-800/90 dark:via-slate-850 dark:to-sky-950/25",
    borderColor: "border-sky-100/90 dark:border-slate-700/60 hover:border-sky-300 dark:hover:border-sky-600/50",
    discountBg: "bg-sky-100/80 text-sky-900 border border-sky-200/60 dark:bg-sky-900/50 dark:text-sky-200",
    glowAccent: "bg-sky-400/20"
  }
];

const getProductImage = (product) => {
  if (!product) return "/favicon.webp";
  const raw = product.images?.[0] || product.image;
  if (!raw) return "/favicon.webp";
  const rawUrl = typeof raw === "string" && (raw.startsWith("http://") || raw.startsWith("https://"))
    ? raw
    : `${backendUrl}${raw.startsWith("/") ? raw : `/${raw}`}`;
  return getOptimizedImageUrl(rawUrl, { width: 220, quality: 70 }) || rawUrl;
};

const DEFAULT_MODEL_SLIDES = [
  {
    id: "tech",
    tag: "TECH EXTRAVAGANZA • GET UP TO 50% OFF",
    tagColor: "text-purple-600 dark:text-purple-400",
    tagPillBg: "bg-purple-100/90 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/40",
    title: ["Smart Tech", "Special", "Mega Deals"],
    highlightWord: "Mega Deals",
    subtitle: "Immersive audio, flagship wearables & cutting-edge electronics at unbeatable prices.",
    ctaText: "Shop Tech Deals",
    ctaLink: "/product?category=electronics",
    ctaBg: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-[0_4px_16px_rgba(147,51,234,0.35)]",
    bgGradient: "from-[#F7F5FF] via-[#EEE8FF] to-[#DFD5FE] dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900",
    borderColor: "border-purple-200/70 dark:border-slate-800",
    glowColor: "bg-purple-400/25 dark:bg-purple-500/15",
    image: heroSlide1,
    alt: "Tech Special Campaign"
  },
  {
    id: "beauty",
    tag: "ORGANIC GLOW • LUXURY MINERAL SCIENCE",
    tagColor: "text-rose-600 dark:text-rose-400",
    tagPillBg: "bg-rose-100/90 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/40",
    title: ["Organic Glow", "Skincare", "Collection"],
    highlightWord: "Collection",
    subtitle: "Revitalize your skin with natural mineral science & cellular restoration. 100% vegan formula.",
    ctaText: "Explore Beauty",
    ctaLink: "/product?category=beauty",
    ctaBg: "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-[0_4px_16px_rgba(244,63,94,0.35)]",
    bgGradient: "from-[#FFF2F5] via-[#FFE5EC] to-[#FCCCD7] dark:from-slate-900 dark:via-rose-950/40 dark:to-slate-900",
    borderColor: "border-rose-200/70 dark:border-slate-800",
    glowColor: "bg-rose-400/25 dark:bg-rose-500/15",
    image: heroSlide2,
    alt: "Organic Glow Collection"
  },
  {
    id: "watches",
    tag: "TIMELESS CRAFTSMANSHIP • OBSIDIAN EDIT",
    tagColor: "text-amber-700 dark:text-amber-400",
    tagPillBg: "bg-amber-100/90 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/40",
    title: ["Chrono Luxury", "Watches &", "Accessories"],
    highlightWord: "Accessories",
    subtitle: "Precision Swiss movement meets obsidian craftsmanship & timeless styling for the bold.",
    ctaText: "Shop Watches",
    ctaLink: "/product?category=watches",
    ctaBg: "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-[0_4px_16px_rgba(217,119,6,0.35)]",
    bgGradient: "from-[#FFFDF5] via-[#FEF8E3] to-[#FDE8B5] dark:from-slate-900 dark:via-amber-950/40 dark:to-slate-900",
    borderColor: "border-amber-200/70 dark:border-slate-800",
    glowColor: "bg-amber-400/25 dark:bg-amber-500/15",
    image: heroSlide3,
    alt: "Chrono Luxury Watch"
  },
  {
    id: "audio",
    tag: "ACOUSTIC FIDELITY • PRO WIRELESS SOUND",
    tagColor: "text-sky-600 dark:text-sky-400",
    tagPillBg: "bg-sky-100/90 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/40",
    title: ["Elite Audio", "Studio Sound", "Experience"],
    highlightWord: "Experience",
    subtitle: "Wireless high-fidelity audio with pro acoustic clarity & active noise canceling.",
    ctaText: "Shop Audio",
    ctaLink: "/product?category=electronics",
    ctaBg: "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-[0_4px_16px_rgba(2,132,199,0.35)]",
    bgGradient: "from-[#F2F9FF] via-[#E2F4FE] to-[#BFE7FD] dark:from-slate-900 dark:via-sky-950/40 dark:to-slate-900",
    borderColor: "border-sky-200/70 dark:border-slate-800",
    glowColor: "bg-sky-400/25 dark:bg-sky-500/15",
    image: heroSlide4,
    alt: "Elite Audio Series"
  }
];

const bazaarTransitionVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 32 : direction < 0 ? -32 : 0,
    opacity: 0,
    scale: 0.985,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -32 : direction < 0 ? 32 : 0,
    opacity: 0,
    scale: 0.985,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const HeroSplitBanner = ({ homepageData }) => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState(DEFAULT_MODEL_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 2x2 Bazaar Deal Products directly from DB with pure smooth transition
  const [bazaarPages, setBazaarPages] = useState([]);
  const [[currentBazaarPage, bazaarDirection], setBazaarPageState] = useState([0, 0]);
  const [bazaarLoading, setBazaarLoading] = useState(true);
  const [isBazaarPaused, setIsBazaarPaused] = useState(false);

  const paginateBazaar = (newDirection) => {
    if (bazaarPages.length <= 1) return;
    setBazaarPageState(([prevPage]) => {
      const nextPage = (prevPage + newDirection + bazaarPages.length) % bazaarPages.length;
      return [nextPage, newDirection];
    });
  };

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

  // Fetch real products from DB and chunk into pages of 4
  useEffect(() => {
    let isMounted = true;
    const fetchDbBazaarProducts = async () => {
      try {
        setBazaarLoading(true);
        const res = await cachedGet(`${backendUrl}/api/product/list?limit=20`);
        let products = [];

        if (res.data?.success && Array.isArray(res.data.products) && res.data.products.length > 0) {
          products = res.data.products;
        } else if (homepageData) {
          const hpItems = [
            ...(homepageData.dealsOfDay || []),
            ...(homepageData.trending || []),
            ...(homepageData.newArrivals || []),
            ...(homepageData.bestSellers || [])
          ];
          const seen = new Set();
          hpItems.forEach((p) => {
            if (p && p._id && !seen.has(p._id.toString())) {
              seen.add(p._id.toString());
              products.push(p);
            }
          });
        }

        // Filter valid products that have real images and name
        const seenNames = new Set();
        const seenImages = new Set();
        const valid = products.filter((p) => {
          if (!p || !p.name) return false;
          const firstImg = p.images?.[0] || p.image;
          if (!firstImg || typeof firstImg !== "string") return false;
          if (firstImg.startsWith("uploads/")) return false;
          if (firstImg.includes("example.com")) return false;
          const key = p.name.trim().toLowerCase();
          const imgKey = firstImg.trim().toLowerCase();
          if (seenNames.has(key) || seenImages.has(imgKey)) return false;
          seenNames.add(key);
          seenImages.add(imgKey);
          return true;
        });

        if (isMounted && valid.length > 0) {
          const pages = [];
          for (let i = 0; i < valid.length; i += 4) {
            const chunk = valid.slice(i, i + 4);
            if (chunk.length === 4) {
              pages.push(chunk);
            }
          }
          if (pages.length > 0) {
            setBazaarPages(pages);
          } else {
            setBazaarPages([valid.slice(0, 4)]);
          }
        }
      } catch (err) {
        console.warn("Hero Bazaar DB fetch error:", err);
      } finally {
        if (isMounted) setBazaarLoading(false);
      }
    };

    fetchDbBazaarProducts();
    return () => {
      isMounted = false;
    };
  }, [homepageData]);

  // Auto-rotate DB product pages every 6.5 seconds with forward direction
  useEffect(() => {
    if (isBazaarPaused || bazaarPages.length <= 1) return;
    const interval = setInterval(() => {
      paginateBazaar(1);
    }, 6500);
    return () => clearInterval(interval);
  }, [isBazaarPaused, bazaarPages.length]);

  const displayedBazaarProducts = bazaarPages[currentBazaarPage] || [];

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
              image: getOptimizedImageUrl(asset.imageUrl?.startsWith("http") ? asset.imageUrl : `${backendUrl}${asset.imageUrl}`, { width: 1000, quality: 80 }),
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
    <div
      className="w-full px-2 sm:px-4 lg:px-6 pt-1 pb-0.5 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 sm:gap-2 items-stretch">
        
        {/* ════════════════════════════════════════════════════════
            LEFT: MAIN HERO CAROUSEL BANNER (~58% width on desktop)
            ════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 xl:col-span-7 relative flex flex-col h-[370px] sm:h-[430px] lg:h-[490px]">
          <div
            className={`relative w-full h-full rounded-sm border ${activeSlide.borderColor} bg-gradient-to-r ${activeSlide.bgGradient} overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors duration-500`}
          >
            {/* Ambient Radial Backlight Glow Behind Cutout Model */}
            <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[360px] sm:w-[440px] h-[360px] sm:h-[440px] rounded-full blur-[80px] pointer-events-none transition-colors duration-700 opacity-80 dark:opacity-40">
              <div className={`w-full h-full rounded-full ${activeSlide.glowColor || "bg-orange-300/30"}`} />
            </div>

            {/* Subtle Luxury Pattern / Floating Sparkle Doodles */}
            <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-15 overflow-hidden">
              <svg className="absolute top-10 left-[42%] w-8 h-8 text-amber-500 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <svg className="absolute bottom-16 left-1/3 w-6 h-6 text-orange-400 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" />
              </svg>
            </div>

            {/* Slide Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 w-full h-full flex flex-col md:flex-row items-stretch justify-between z-10 pointer-events-none"
              >
                {/* Left Text Block */}
                <div className="w-[62%] sm:w-[54%] md:w-[50%] lg:w-[48%] text-left z-20 flex flex-col justify-center px-3.5 sm:px-8 lg:px-10 py-3 sm:py-6 pointer-events-auto h-full">
                  {/* Category Pill Tag */}
                  <div className="inline-flex items-center gap-1.5 mb-1.5 sm:mb-3">
                    <span className={`text-[9px] sm:text-xs font-black tracking-wider uppercase px-2 py-0.5 sm:py-1 rounded-sm border shadow-2xs backdrop-blur-md ${activeSlide.tagPillBg || "bg-white/90 text-slate-800 border-slate-200"}`}>
                      <Sparkles size={10} className="inline-block mr-1 text-amber-500 animate-pulse" />
                      {activeSlide.tag}
                    </span>
                  </div>

                  {/* High-Impact Headline (Concise & Limited) */}
                  <h1 className="text-lg sm:text-2xl lg:text-[32px] xl:text-[36px] font-black text-slate-950 dark:text-white leading-[1.14] tracking-tight line-clamp-2 max-w-[260px] sm:max-w-[340px]">
                    {Array.isArray(activeSlide.title) ? (
                      activeSlide.title.join(" ")
                    ) : (
                      <span>{activeSlide.title}</span>
                    )}
                  </h1>

                  {/* Subtitle (Strictly Clamped to 2 lines max) */}
                  <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-[240px] sm:max-w-[320px] mt-1 sm:mt-2.5 leading-snug line-clamp-2">
                    {activeSlide.subtitle}
                  </p>

                  {/* Trust Highlights Strip */}
                  <div className="hidden min-[380px]:flex items-center gap-2.5 sm:gap-4 mt-2 sm:mt-4 text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      Verified
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
                      Fast Delivery
                    </span>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-3 sm:mt-6">
                    <button
                      onClick={() => navigate(activeSlide.ctaLink)}
                      className={`inline-flex items-center gap-1.5 sm:gap-2.5 ${activeSlide.ctaBg} active:scale-95 font-black text-[11px] sm:text-sm px-4 sm:px-6 py-2 sm:py-3.5 rounded-sm cursor-pointer border-none transition-all duration-300 group`}
                    >
                      <span>{activeSlide.ctaText}</span>
                      <ArrowRight size={14} className="stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Right Model Cutout Block (Full Height & Full Width - Completely Visible & Clean) */}
                <div className="absolute right-0 bottom-0 top-0 h-full w-[54%] sm:w-[58%] md:w-[60%] lg:w-[62%] flex items-end justify-end pointer-events-none z-10 overflow-hidden">
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.alt}
                    className="h-full w-auto max-h-full max-w-full object-contain object-bottom select-none opacity-100"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Left / Right Carousel Arrow Buttons */}
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-9 sm:h-9 rounded-sm bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-md flex items-center justify-center cursor-pointer transition hover:scale-110 active:scale-95 border border-slate-200/70 dark:border-slate-800 backdrop-blur-md"
            >
              <ChevronLeft size={16} className="stroke-[2.5]" />
            </button>

            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-9 sm:h-9 rounded-sm bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-md flex items-center justify-center cursor-pointer transition hover:scale-110 active:scale-95 border border-slate-200/70 dark:border-slate-800 backdrop-blur-md"
            >
              <ChevronRight size={16} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            RIGHT: QUICK BAZAAR DEALS & PERKS WIDGET (2x2 GRID)
            High-Contrast, Ultra-Clean Light Mode Layout
            ════════════════════════════════════════════════════════ */}
        <div
          className="lg:col-span-5 xl:col-span-5 relative flex flex-col h-[370px] sm:h-[430px] lg:h-[490px] overflow-hidden"
          onMouseEnter={() => setIsBazaarPaused(true)}
          onMouseLeave={() => setIsBazaarPaused(false)}
        >
          <div className="w-full h-full bg-white dark:bg-slate-900 rounded-sm p-3 sm:p-3.5 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between overflow-hidden">
            
            {/* Header: Delivery Perks + Extra Cashback Banner */}
            <div className="flex items-center justify-between select-none mb-2 sm:mb-2.5 shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Yellow Amber Delivery Truck Icon */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-sm bg-gradient-to-br from-amber-400/20 to-orange-400/20 border border-amber-300/50 dark:border-amber-700/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
                  <Truck size={19} className="stroke-[2.5]" />
                </div>

                <div>
                  <div
                    onClick={() => {
                      toast.success("Free delivery & ₹100 cashback unlocked! 🎉");
                      navigate("/product");
                    }}
                    className="flex items-center gap-1 cursor-pointer group"
                  >
                    <h2 className="text-sm sm:text-base lg:text-[15px] xl:text-[16px] font-black text-slate-950 dark:text-white tracking-tight leading-tight group-hover:text-primary transition-colors">
                      Free delivery always <span className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent font-extrabold">+ Extra ₹100 cashback</span>
                    </h2>
                    <ChevronRight
                      size={15}
                      className="stroke-[3] text-slate-900 dark:text-white shrink-0 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-none mt-0.5">
                    Shop more. Save more. Exclusive CartNOW Bazaar.
                  </p>
                </div>
              </div>

              {/* DB Products Pagination Controls */}
              {bazaarPages.length > 1 && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => paginateBazaar(-1)}
                    aria-label="Previous Deals"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer border border-slate-200/80 dark:border-slate-700 shadow-2xs active:scale-95"
                  >
                    <ChevronLeft size={15} className="stroke-[2.5]" />
                  </button>
                  <button
                    onClick={() => paginateBazaar(1)}
                    aria-label="Next Deals"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-slate-950 hover:bg-black active:scale-95 text-white flex items-center justify-center transition cursor-pointer shadow-2xs"
                  >
                    <ChevronRight size={15} className="stroke-[2.5]" />
                  </button>
                </div>
              )}
            </div>

            {/* 2x2 Grid of 4 Real Products from DB with Pure Smooth Directional Transition */}
            {bazaarLoading && displayedBazaarProducts.length === 0 ? (
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 flex-1 min-h-0 animate-pulse">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="relative w-full h-full rounded-sm border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden"
                  >
                    <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                    <div className="space-y-1.5 my-auto">
                      <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 rounded-sm bg-slate-200 dark:bg-slate-800" />
                        <div className="h-2.5 w-14 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                      </div>
                      <div className="h-3.5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                      <div className="h-2.5 w-3/5 bg-slate-100 dark:bg-slate-800/60 rounded-sm" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-4 w-16 bg-slate-300 dark:bg-slate-700 rounded-sm" />
                      <div className="h-3 w-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative flex-1 min-h-0 w-full overflow-hidden">
                <AnimatePresence initial={false} custom={bazaarDirection}>
                  <motion.div
                    key={currentBazaarPage}
                    custom={bazaarDirection}
                    variants={bazaarTransitionVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 grid grid-cols-2 gap-1.5 sm:gap-2 h-full w-full"
                  >
                    {displayedBazaarProducts.map((product, idx) => {
                      const theme = BAZAAR_SLOT_THEMES[idx % BAZAAR_SLOT_THEMES.length];
                      const BadgeIcon = theme.badgeIcon;
                      const imgSrc = getProductImage(product);
                      const price = Number(product.price || 0);
                      const origPrice = Number(product.originalPrice || (price > 0 ? Math.round(price * 1.35) : 0));
                      const discountPercent = Number(
                        product.discountPercentage || (origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 30)
                      );
                      const isWishlisted = wishlist.includes(product._id);
                      const brandName = product.brand || product.category || "CartNOW";
                      const subtitle = product.shortDescription || product.description || "Everyday comfort & style.";

                      return (
                        <div
                          key={product._id || `bazaar-prod-${idx}`}
                          onClick={() => navigate(`/product/${product._id}`)}
                          className={`group relative w-full h-full rounded-sm border ${theme.borderColor} shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:shadow-none hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between select-none overflow-hidden cursor-pointer`}
                          title={product.name}
                        >
                          {/* Full Cover Background Image */}
                          <img
                            src={imgSrc}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out z-0"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/favicon.png";
                            }}
                          />

                          {/* Full Background Readability Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/20 dark:from-slate-950/95 dark:via-slate-950/80 dark:to-slate-950/20 z-10 pointer-events-none" />

                          {/* Foreground Product Content (Left Aligned) */}
                          <div className="relative z-20 w-[68%] sm:w-[62%] flex flex-col justify-between p-2.5 sm:p-3 h-full text-left">
                            {/* Top: Status Badge */}
                            <div className="flex items-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9px] sm:text-[10px] font-black tracking-wide shadow-2xs ${theme.badgeLightBg}`}
                              >
                                <BadgeIcon size={10} className="stroke-[2.5]" />
                                <span>{theme.badgeLabel}</span>
                              </span>
                            </div>

                            {/* Middle: Brand + Product Title */}
                            <div className="my-auto py-0.5">
                              <div className="flex items-center gap-1">
                                <BrandLogo
                                  brand={brandName}
                                  brandDomain={product.brandDomain}
                                  className="w-3.5 h-3.5 rounded-sm shrink-0"
                                />
                                <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-300 block truncate">
                                  {brandName}
                                </span>
                              </div>
                              <h3 className="text-xs sm:text-[13px] font-black text-slate-950 dark:text-white leading-[1.18] tracking-tight line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-medium line-clamp-1 mt-0.5 leading-snug">
                                {subtitle}
                              </p>
                            </div>

                            {/* Bottom: Price + Discount Badge */}
                            <div className="pt-0.5">
                              <div className="flex items-baseline gap-1.5 flex-wrap">
                                <span className="text-sm sm:text-base font-black text-slate-950 dark:text-white">
                                  ₹{price.toLocaleString()}
                                </span>
                                {origPrice > price && (
                                  <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 line-through font-semibold">
                                    ₹{origPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              {discountPercent > 0 && (
                                <span
                                  className={`inline-block text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-sm mt-0.5 shadow-2xs ${theme.discountBg}`}
                                >
                                  {discountPercent}% OFF
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Wishlist Heart Button (Top-Right z-30) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product._id);
                            }}
                            className="absolute top-2 right-2 z-30 w-6 h-6 sm:w-7 sm:h-7 rounded-sm bg-white/95 dark:bg-slate-900/95 shadow-xs flex items-center justify-center cursor-pointer border border-slate-200/80 dark:border-slate-700 hover:scale-110 active:scale-95 transition"
                            title="Add to Wishlist"
                          >
                            <Heart
                              size={12}
                              className={
                                isWishlisted
                                  ? "fill-rose-500 text-rose-500"
                                  : "text-slate-600 dark:text-slate-300 stroke-[2.2]"
                              }
                            />
                          </button>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroSplitBanner;
