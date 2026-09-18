import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { backendUrl } from "../config";
import {
  Sparkles,
  Flame,
  Clock,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Tag,
  ExternalLink
} from "lucide-react";
import BrandLogo from "./BrandLogo";

// Default High-Resolution Visual Assets for Fallback
import dealLaptop from "../assets/new_home/deal_laptop.webp";
import dealEarbuds from "../assets/new_home/deal_earbuds.webp";
import dealSmartwatch from "../assets/new_home/deal_smartwatch.webp";
import dealShoes from "../assets/new_home/deal_shoes.webp";
import catMobiles from "../assets/new_home/cat_mobiles.webp";

// Default Curated Fallback Brand Campaigns (Clean, Non-Gradient Solid Palette)
const DEFAULT_BRAND_CAMPAIGNS = [
  {
    id: "apple-days",
    brand: "Apple",
    brandDomain: "apple.com",
    slug: "apple",
    headline: "Apple Official Brand Days",
    subheadline: "Titanium Craftsmanship. Pro-Grade M-Series Performance & Certified Accessories.",
    offerBadge: "FLAT ₹5,000 OFF",
    offerSub: "With Leading Bank Cards + No Cost EMI",
    couponCode: "APPLEPRO5K",
    dealTag: "Limited Window Deal",
    rating: "4.9★",
    warrantyText: "Official AppleCare Assurance",
    perks: ["Genuine Accessories", "Instant Dispatch", "No Cost EMI", "Zero-Risk Return"],
    image: dealLaptop,
    imageAlt: "Apple MacBook Pro & Studio Display"
  },
  {
    id: "samsung-carnival",
    brand: "Samsung",
    brandDomain: "samsung.com",
    slug: "samsung",
    headline: "Samsung Galaxy AI Carnival",
    subheadline: "Galaxy Smartphones, Neo QLED Displays, Smart Wearables & Audio Gear.",
    offerBadge: "UP TO 35% OFF",
    offerSub: "Plus Free Galaxy SmartTag on Orders Above ₹25k",
    couponCode: "SAMSUNG25",
    dealTag: "Trending Flagship",
    rating: "4.8★",
    warrantyText: "Official Samsung Warranty",
    perks: ["Free Express Delivery", "Direct Exchange", "24/7 Priority Support", "Genuine Parts"],
    image: catMobiles,
    imageAlt: "Samsung Galaxy Flagship"
  },
  {
    id: "sony-fiesta",
    brand: "Sony",
    brandDomain: "sony.com",
    slug: "sony",
    headline: "Sony Acoustic & Cinema Fest",
    subheadline: "Industry-Leading WH-1000XM5 ANC Headphones, Alpha Cameras & Bravia OLEDs.",
    offerBadge: "UP TO 40% OFF",
    offerSub: "Instant Cashback on All Premium Audio & Gaming Gear",
    couponCode: "SONYBEATS",
    dealTag: "Audiophile Choice",
    rating: "4.9★",
    warrantyText: "2-Yr Extended Sony Warranty",
    perks: ["Hi-Res Audio Certified", "Bravia Sync", "Original Spares Included", "Express Shipping"],
    image: dealEarbuds,
    imageAlt: "Sony Wireless Audio"
  },
  {
    id: "nike-drop",
    brand: "Nike",
    brandDomain: "nike.com",
    slug: "nike",
    headline: "Nike Performance & Street Drop",
    subheadline: "Air Max, Pegasus Runners & Dri-FIT Athletic Training Apparel.",
    offerBadge: "MIN. 30% OFF",
    offerSub: "Extra 10% Off Automatically on 2+ Apparel Items",
    couponCode: "JUSTDOIT",
    dealTag: "Iconic Sportswear",
    rating: "4.8★",
    warrantyText: "100% Authentic Guaranteed",
    perks: ["Official Nike Sizing", "Easy 7-Day Exchange", "Authenticity Verified", "Fast Dispatch"],
    image: dealShoes,
    imageAlt: "Nike Air Running Shoes"
  },
  {
    id: "boat-fiesta",
    brand: "boAt",
    brandDomain: "boat-lifestyle.com",
    slug: "boat",
    headline: "boAt Bass Carnival 2025",
    subheadline: "True Wireless Airdopes, BT Calling Smartwatches & Powerful Soundbars.",
    offerBadge: "UP TO 65% OFF",
    offerSub: "Extra ₹300 Off on Prepaid UPI/Card Orders",
    couponCode: "BOATBLAST",
    dealTag: "Bestseller Audio",
    rating: "4.7★",
    warrantyText: "1-Yr boAt Replacement Warranty",
    perks: ["Signature boAt Bass", "IPX Water Resistance", "Doorstep Pickup", "Express Delivery"],
    image: dealSmartwatch,
    imageAlt: "boAt Smartwatch and Wireless Audio"
  }
];

const getFullImageUrl = (img) => {
  if (!img) return "";
  if (typeof img === "object") return img;
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
    return img;
  }
  return `${backendUrl}${img.startsWith("/") ? "" : "/"}${img}`;
};

// Motion Variants for Staggered Orchestration
const contentContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

const itemFadeUpVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] }
  }
};

const imageSlideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 1.06,
    filter: "blur(4px)"
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.48,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: (direction) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    scale: 0.96,
    filter: "blur(4px)",
    transition: {
      duration: 0.32,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

const BrandAdBanner = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState(DEFAULT_BRAND_CAMPAIGNS);
  const [[activeSlide, direction], setSlideState] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");

  // Fetch dynamic posters exclusively from dedicated Admin Brand Posters endpoint (/api/brand-posters)
  useEffect(() => {
    const fetchDynamicBrandPosters = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/brand-posters`);

        if (data.success && Array.isArray(data.posters) && data.posters.length > 0) {
          const dynamicList = data.posters.map((poster) => ({
            id: poster._id,
            brand: poster.brand,
            brandDomain: poster.brandDomain || `${poster.slug || poster.brand.toLowerCase()}.com`,
            slug: poster.slug || poster.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            headline: poster.headline,
            subheadline: poster.subheadline || `Discover official authentic collections from ${poster.brand} with direct brand warranty.`,
            offerBadge: poster.offerBadge || "EXCLUSIVE OFFER",
            offerSub: poster.offerSub || "Direct Brand Warranty & Express Delivery",
            couponCode: poster.couponCode || "PROMO",
            dealTag: poster.dealTag || "Official Flagship",
            rating: poster.rating || "4.9★",
            warrantyText: poster.warrantyText || "Official Brand Assurance",
            perks: Array.isArray(poster.perks) && poster.perks.length > 0
              ? poster.perks
              : ["100% Genuine", "Instant Dispatch", "Free Returns", "Manufacturer Warranty"],
            image: getFullImageUrl(poster.imageUrl),
            imageAlt: poster.imageAlt || poster.headline
          }));

          setCampaigns(dynamicList);
        } else {
          // If no admin posters are uploaded yet, use curated default brand campaigns
          setCampaigns(DEFAULT_BRAND_CAMPAIGNS);
        }
      } catch (err) {
        console.error("Failed to fetch brand posters:", err);
        setCampaigns(DEFAULT_BRAND_CAMPAIGNS);
      }
    };

    fetchDynamicBrandPosters();
  }, []);

  const paginate = (newDirection) => {
    setSlideState(([prev]) => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) nextIndex = campaigns.length - 1;
      if (nextIndex >= campaigns.length) nextIndex = 0;
      return [nextIndex, newDirection];
    });
  };

  const setDirectSlide = (index) => {
    setSlideState(([prev]) => [index, index > prev ? 1 : -1]);
  };

  // Live Countdown calculation (dynamic 14-hour cycle)
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 42,
    seconds: 18
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Slideshow auto-rotation
  useEffect(() => {
    if (isPaused || campaigns.length <= 1) return;
    const interval = setInterval(() => {
      paginate(1);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused, campaigns.length]);

  const current = campaigns[activeSlide] || DEFAULT_BRAND_CAMPAIGNS[0];

  const handleCopyCoupon = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode("");
    }, 2500);
  };

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full rounded-none overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm select-none flex flex-col lg:h-[calc(100vh-var(--navbar-height,80px)-24px)] min-h-[520px]"
    >
      {/* ── AUTO-ROTATION PROGRESS BAR TIMER ── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-slate-100 dark:bg-slate-800 z-30 overflow-hidden">
        <motion.div
          key={activeSlide + (isPaused ? "-paused" : "-running")}
          initial={{ width: "0%" }}
          animate={{ width: isPaused ? undefined : "100%" }}
          transition={{ duration: 6.5, ease: "linear" }}
          className="h-full bg-blue-600 dark:bg-blue-400"
        />
      </div>

      {/* ── TWO-SIDE SPLIT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 h-full min-h-0">

        {/* ════════════ SIDE A: CLEAN IMAGE HERO (TOUCHING BOTTOM BASELINE, NO UNWANTED TEXTS) ════════════ */}
        <div
          onClick={() => navigate(`/brands/${current.slug}`)}
          className="relative lg:col-span-5 h-80 sm:h-96 md:h-[420px] lg:h-full overflow-hidden bg-slate-100 dark:bg-slate-800/80 cursor-pointer group flex items-end justify-center border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 rounded-none"
        >
          {/* Ambient Blurred Background (Matches Current Poster Colors Naturally) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={current.image}
              alt=""
              className="w-full h-full object-cover blur-2xl scale-125 opacity-30 dark:opacity-20"
            />
            <div className="absolute inset-0 bg-slate-950/10 dark:bg-slate-950/30" />
          </div>

          {/* Foreground Campaign Image - Touching the Lower Edge */}
          <div className="relative z-10 w-full h-full flex items-end justify-center pt-6 px-4 pb-0">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.img
                key={current.id || current.image}
                custom={direction}
                variants={imageSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                src={current.image}
                alt={current.imageAlt}
                className="max-h-full max-w-full w-auto h-full object-contain object-bottom drop-shadow-xl group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
            </AnimatePresence>
          </div>
        </div>

        {/* ════════════ SIDE B: LUXURY FLAGSHIP SHOWCASE & DETAILS PANEL ════════════ */}
        <div
          className="relative lg:col-span-7 h-full flex flex-col justify-between bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 sm:p-8 lg:p-10 xl:p-12 transition-colors duration-200 overflow-hidden rounded-none"
        >
          {/* Top & Middle Section: Staggered Dynamic Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id || current.headline}
              variants={contentContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-5 sm:space-y-6 flex-1 flex flex-col justify-center"
            >
              
              {/* Row 1: Brand Flagship Header Strip */}
              <motion.div
                variants={itemFadeUpVariants}
                className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3.5">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-13 h-13 sm:w-14 sm:h-14 bg-white dark:bg-slate-800 rounded-none p-2.5 flex items-center justify-center shadow-xs shrink-0 border border-slate-200/90 dark:border-slate-700/80"
                  >
                    <BrandLogo
                      brand={current.brand}
                      brandDomain={current.brandDomain}
                      className="w-full h-full object-contain rounded-none"
                      fallbackText={current.brand.substring(0, 2)}
                    />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-black text-slate-950 dark:text-white tracking-tight">
                        {current.brand}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-[10.5px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
                        <span>Official Flagship</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-none border border-amber-200 dark:border-amber-800">
                        <span>★</span> {current.rating ? current.rating.replace("★", "") : "4.9"}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      Direct Authorized Brand Partner
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/80 shadow-2xs">
                    <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                    <span>{current.warrantyText}</span>
                  </span>
                </div>
              </motion.div>

              {/* Row 2: Campaign Headline & Story */}
              <motion.div variants={itemFadeUpVariants} className="space-y-2">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[40px] font-black text-slate-950 dark:text-white tracking-tight leading-[1.12]">
                  {current.headline}
                </h2>
                {current.subheadline && (
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl">
                    {current.subheadline}
                  </p>
                )}
              </motion.div>

              {/* Row 3: Unified Luxury Voucher & Deal Card */}
              <motion.div
                variants={itemFadeUpVariants}
                className="relative rounded-none bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-4 sm:p-5 shadow-lg border border-slate-800 overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
              >
                {/* Ambient subtle glow */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Left: Offer Details */}
                <div className="space-y-1 relative z-10 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>Exclusive Brand Deal</span>
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-3xl font-black text-white tracking-tight leading-none">
                    {current.offerBadge}
                  </div>
                  {current.offerSub && (
                    <div className="text-xs font-medium text-slate-300">
                      {current.offerSub}
                    </div>
                  )}
                </div>

                {/* Ticket Divider for desktop */}
                <div className="hidden sm:block w-px self-stretch bg-gradient-to-b from-transparent via-slate-700 to-transparent relative z-10 mx-2" />

                {/* Right: Interactive 1-Click Voucher Code Pass */}
                {current.couponCode && (
                  <div className="relative z-10 flex flex-col justify-center shrink-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
                      <Tag size={11} className="text-amber-400" />
                      <span>Promo Voucher</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => handleCopyCoupon(current.couponCode, e)}
                      title="Click to copy voucher code"
                      className="group relative flex items-center justify-between gap-3 bg-white/10 hover:bg-white/15 border border-dashed border-amber-400/70 hover:border-amber-400 px-4 py-2.5 rounded-none text-left transition cursor-pointer backdrop-blur-md shadow-xs"
                    >
                      <div>
                        <span className="text-xs sm:text-sm font-mono font-black text-amber-300 tracking-wider">
                          {current.couponCode}
                        </span>
                      </div>
                      
                      <span className="p-1.5 bg-amber-400/20 text-amber-300 rounded-none group-hover:bg-amber-400/30 transition-colors">
                        {copiedCode === current.couponCode ? (
                          <Check size={13} className="text-emerald-400 stroke-[3]" />
                        ) : (
                          <Copy size={13} className="group-hover:scale-110 transition-transform text-amber-300" />
                        )}
                      </span>

                      <AnimatePresence>
                        {copiedCode === current.couponCode && (
                          <motion.span
                            initial={{ opacity: 0, y: 5, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-none shadow-md flex items-center gap-1 whitespace-nowrap z-30"
                          >
                            <Check size={11} className="stroke-[3]" />
                            <span>Code Copied!</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                )}
              </motion.div>

              {/* Row 4: Perks & Trust Highlights */}
              {Array.isArray(current.perks) && current.perks.length > 0 && (
                <motion.div
                  variants={itemFadeUpVariants}
                  className="flex items-center gap-2 sm:gap-2.5 flex-wrap text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  {current.perks.map((perk, idx) => (
                    <motion.span
                      key={idx}
                      whileHover={{ scale: 1.03 }}
                      className="inline-flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/80 px-3 py-1.5 rounded-none border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
                    >
                      <Check size={13} className="text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                      <span>{perk}</span>
                    </motion.span>
                  ))}
                </motion.div>
              )}

              {/* Row 5: Action Buttons */}
              <motion.div variants={itemFadeUpVariants} className="pt-2 flex items-center gap-3.5 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/brands/${current.slug}`)}
                  className="px-8 py-3.5 rounded-none text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 shadow-md bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span>Shop {current.brand} Store</span>
                  <ArrowRight size={15} className="stroke-[2.5]" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/product?brand=${current.brand}`)}
                  className="px-6 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-none text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-2xs"
                >
                  <span>View Products</span>
                  <ExternalLink size={14} />
                </motion.button>
              </motion.div>

            </motion.div>
          </AnimatePresence>

          {/* Bottom Navigation: Gliding Brand Switcher Tabs & Slide Arrows */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Brand Switcher Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none max-w-full relative py-0.5">
              <span className="text-[10.5px] font-black uppercase tracking-widest text-slate-400 mr-1 shrink-0">
                Featured Partners:
              </span>
              {campaigns.map((camp, idx) => {
                const isActive = idx === activeSlide;
                return (
                  <button
                    key={camp.id || camp.brand + idx}
                    onClick={() => setDirectSlide(idx)}
                    className={`relative px-3.5 py-2 rounded-none text-xs sm:text-[13px] font-bold transition-colors cursor-pointer shrink-0 border z-10 ${
                      isActive
                        ? "text-white dark:text-slate-900 border-transparent font-black"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeBrandPill"
                        className="absolute inset-0 bg-slate-900 dark:bg-white rounded-none -z-10 shadow-xs"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{camp.brand}</span>
                  </button>
                );
              })}
            </div>

            {/* Prev / Next Controls */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-mono text-slate-400">
                <strong className="text-slate-900 dark:text-white font-bold">{activeSlide + 1}</strong> / {campaigns.length}
              </span>

              <div className="flex items-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => paginate(-1)}
                  className="w-8 h-8 rounded-none bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer shadow-2xs"
                  title="Previous Campaign"
                >
                  <ChevronLeft size={16} className="stroke-[2.5]" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => paginate(1)}
                  className="w-8 h-8 rounded-none bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer shadow-2xs"
                  title="Next Campaign"
                >
                  <ChevronRight size={16} className="stroke-[2.5]" />
                </motion.button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default BrandAdBanner;


