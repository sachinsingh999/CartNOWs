import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Flame,
  Zap,
  ShoppingCart,
  Truck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Loader2
} from "lucide-react";
import { backendUrl } from "../../config";

// Default showcase deal matching the user's reference mockup
const DEFAULT_SHOWCASE_DEAL = {
  _id: "deal-celestial-necklace",
  name: "18K Gold Plated Layered Celestial Pendant Necklace",
  brand: "CARTNOW JEWELS",
  description:
    "Exquisite handcrafted dual-layer pendant necklace featuring a crescent moon and sunburst medallion. Dipped in 18K yellow gold over solid 925 sterling silver with anti-tarnish protective coating.",
  price: 1599,
  originalPrice: 2499,
  discountPercentage: 36,
  image: "/deals/celestial_necklace_stage.png",
  stageImage: "/deals/celestial_necklace_stage.png",
  claimedPercentage: 84
};

const DealOfTheDayBanner = ({
  deals = [],
  activeDeal = null,
  onAddToCart,
  wishlist = []
}) => {
  const navigate = useNavigate();

  // Exactly one deal per day: active campaign deal or daily deterministic rotation
  const currentDeal = useMemo(() => {
    if (activeDeal && activeDeal.isActive && activeDeal.productId) {
      return activeDeal.productId;
    }
    const now = new Date();
    const daySeed = Math.floor(
      (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(2025, 0, 1)) /
        (1000 * 60 * 60 * 24)
    );
    const available =
      Array.isArray(deals) && deals.length > 0
        ? [DEFAULT_SHOWCASE_DEAL, ...deals]
        : [DEFAULT_SHOWCASE_DEAL];
    return available[((daySeed % available.length) + available.length) % available.length] || DEFAULT_SHOWCASE_DEAL;
  }, [deals, activeDeal]);

  const [isAdding, setIsAdding] = useState(false);

  // Live countdown timer (Hours, Minutes, Seconds until midnight)
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 6, seconds: 50 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, midnight - now);

      return {
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const price = Number(currentDeal.price || 1599);
  const originalPrice = Number(
    currentDeal.originalPrice || (price > 0 ? Math.round(price * 1.36) : 2499)
  );
  const discountPercent =
    currentDeal.discountPercentage ||
    (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 36);

  const brandName = (currentDeal.brand || "CARTNOW JEWELS").toUpperCase();

  // Determine fallback stage image url
  const stageImgUrl =
    currentDeal.stageImage ||
    (currentDeal.image?.startsWith("/") || currentDeal.image?.startsWith("http")
      ? currentDeal.image
      : currentDeal.images?.[0]
        ? (currentDeal.images[0].startsWith("http")
            ? currentDeal.images[0]
            : `${backendUrl}/${currentDeal.images[0]}`)
        : "/deals/celestial_necklace_stage.png");

  // AI-Generated Product Image State (Cached by product name)
  const [aiImageUrl, setAiImageUrl] = useState(() => {
    try {
      const cacheKey = `ai_deal_img_${currentDeal.name || currentDeal._id}`;
      const cached = localStorage.getItem(cacheKey);
      // Automatically evict old static Unsplash placeholder mock images (like the sunglasses)
      if (cached && (cached.includes("unsplash.com") || cached.includes("celestial_necklace"))) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      return cached || null;
    } catch {
      return null;
    }
  });
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Auto-generate AI image from product name if not cached
  useEffect(() => {
    const productName = currentDeal?.name;
    if (!productName) return;

    const cacheKey = `ai_deal_img_${productName}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached && !cached.includes("unsplash.com")) {
        setAiImageUrl(cached);
        return;
      } else if (cached) {
        localStorage.removeItem(cacheKey);
      }
    } catch (e) {}

    let isMounted = true;
    const fetchAiImage = async () => {
      setIsGeneratingAi(true);
      try {
        const res = await axios.post(`${backendUrl}/api/ai/generate-image`, {
          name: productName,
          description: currentDeal.description || ""
        });
        if (isMounted && res.data?.success && res.data.imageUrl) {
          setAiImageUrl(res.data.imageUrl);
          try {
            localStorage.setItem(cacheKey, res.data.imageUrl);
          } catch (e) {}
        }
      } catch (err) {
        console.warn("AI deal image generation error:", err?.response?.data?.message || err.message);
      } finally {
        if (isMounted) setIsGeneratingAi(false);
      }
    };

    fetchAiImage();

    return () => {
      isMounted = false;
    };
  }, [currentDeal?.name, currentDeal?.description]);

  const handleRegenerateAi = async (e) => {
    e.stopPropagation();
    if (isGeneratingAi || !currentDeal?.name) return;
    setIsGeneratingAi(true);
    try {
      const res = await axios.post(`${backendUrl}/api/ai/generate-image`, {
        name: currentDeal.name,
        description: currentDeal.description || ""
      });
      if (res.data?.success && res.data.imageUrl) {
        setAiImageUrl(res.data.imageUrl);
        try {
          localStorage.setItem(`ai_deal_img_${currentDeal.name}`, res.data.imageUrl);
        } catch (e) {}
      }
    } catch (err) {
      console.warn("AI deal image regeneration error:", err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Final displayed image: AI-generated URL if ready, otherwise fallback stage image
  const displayImageUrl = aiImageUrl || stageImgUrl;

  const formatDigit = (num) => String(num).padStart(2, "0");

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);
    if (onAddToCart) {
      onAddToCart(currentDeal);
    }
    setTimeout(() => setIsAdding(false), 700);
  };

  const handleNavigate = () => {
    if (currentDeal._id && !currentDeal._id.startsWith("deal-")) {
      navigate(`/product/${currentDeal._id}`);
    }
  };

  return (
    <section className="w-full h-full max-w-full p-0 m-0 border-0 select-none block overflow-hidden">
      <div
        onClick={handleNavigate}
        className="group relative w-full h-full min-h-[380px] sm:min-h-[420px] lg:min-h-[470px] rounded-none overflow-hidden cursor-pointer border-0 shadow-none bg-[#FAF7F2] dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300 flex flex-col justify-between"
      >
        {/* Floating Top-Right Discount Badge */}
        <div className="absolute top-2.5 sm:top-3 right-3 sm:right-4 z-20 px-2.5 py-0.5 rounded-full bg-[#FF5722] text-white font-black text-[11px] sm:text-xs tracking-wide shadow-md pointer-events-none">
          -{discountPercent}%
        </div>

        {/* ── 1. TOP SECTION: Badges, Title & Subtitle ── */}
        <div className="relative z-10 w-full pt-3.5 sm:pt-4 px-3.5 sm:px-5 pr-14 text-left">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-500/80 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0">
              <Flame size={11} className="fill-amber-500 text-amber-500 shrink-0" />
              <span>DEAL OF THE DAY</span>
            </span>

            {aiImageUrl && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[9px] font-bold shrink-0">
                <Sparkles size={9} className="text-purple-500" />
                <span>AI Visual</span>
              </span>
            )}

            <span className="text-[10px] sm:text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:inline-block truncate">
              • {brandName}
            </span>
          </div>

          {/* Product Title */}
          <h2 className="text-sm sm:text-base lg:text-[17px] font-black text-slate-950 dark:text-white leading-snug tracking-tight line-clamp-1 mt-1.5">
            {currentDeal.name}
          </h2>

          {/* Short Subtitle */}
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 line-clamp-1 font-normal mt-0.5">
            {currentDeal.description || "Official brand deal with warranty & fast express delivery."}
          </p>
        </div>

        {/* ── 2. MIDDLE SECTION: AI Generated Image Centered (Pure image, no outer box) ── */}
        <div className="relative z-10 w-full flex-1 min-h-[170px] sm:min-h-[190px] max-h-[230px] mx-auto px-4 sm:px-6 py-1 flex items-center justify-center overflow-visible">
          {isGeneratingAi ? (
            <div className="flex flex-col items-center justify-center gap-2 p-3 text-center pointer-events-none select-none">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-500/20 via-pink-500/20 to-amber-500/20 animate-pulse flex items-center justify-center border border-purple-500/30">
                  <Sparkles className="w-5 h-5 text-purple-500 animate-spin" style={{ animationDuration: "3s" }} />
                </div>
                <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black tracking-wide text-purple-600 dark:text-purple-400 uppercase">
                  Generating AI Image
                </p>
                <p className="text-[8.5px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 max-w-[200px]">
                  from &quot;{currentDeal.name}&quot;
                </p>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={displayImageUrl}
                alt={currentDeal.name}
                className="w-full h-full max-h-[190px] sm:max-h-[210px] object-contain object-center transition-transform duration-500 group-hover:scale-105 select-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
                loading="eager"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/deals/celestial_necklace_stage.png";
                }}
              />

              {/* Floating AI Badge + Regenerate Button */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-1 right-2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/85 dark:bg-slate-800/90 text-white border border-white/10 text-[8.5px] sm:text-[9px] font-bold shadow-md backdrop-blur-md pointer-events-auto"
              >
                <Sparkles size={9} className="text-amber-400 fill-amber-400" />
                <span>AI Art</span>
                <button
                  type="button"
                  onClick={handleRegenerateAi}
                  disabled={isGeneratingAi}
                  title="Regenerate image from product name with AI"
                  className="p-0.5 hover:text-amber-400 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <RefreshCw size={8.5} className={isGeneratingAi ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. BOTTOM SECTION: Pricing, Timer, Claimed & Actions ── */}
        <div className="relative z-10 w-full px-3.5 sm:px-5 pb-3 pt-1 space-y-2 text-left">
          {/* Timer & Price Combined Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            {/* Price & Discount */}
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-xl font-black text-slate-950 dark:text-white font-mono tracking-tight leading-none">
                ₹{price.toLocaleString("en-IN")}
              </span>
              {originalPrice > price && (
                <span className="text-[11px] sm:text-xs text-slate-400 line-through font-mono leading-none">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>
              )}
              <span className="px-1.5 py-0.5 rounded bg-[#FF5722] text-white text-[9px] sm:text-[10px] font-black tracking-wide leading-none shadow-2xs">
                {discountPercent}% OFF
              </span>
            </div>

            {/* Countdown Digits */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs rounded px-1.5 py-0.5 min-w-[26px]">
                <span className="text-[11px] sm:text-xs font-black font-mono text-slate-950 dark:text-white leading-tight">
                  {formatDigit(timeLeft.hours)}
                </span>
                <span className="text-[6.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none mt-0.5">H</span>
              </div>
              <span className="text-amber-500 font-bold text-[10px] leading-none">:</span>
              <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs rounded px-1.5 py-0.5 min-w-[26px]">
                <span className="text-[11px] sm:text-xs font-black font-mono text-slate-950 dark:text-white leading-tight">
                  {formatDigit(timeLeft.minutes)}
                </span>
                <span className="text-[6.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none mt-0.5">M</span>
              </div>
              <span className="text-amber-500 font-bold text-[10px] leading-none">:</span>
              <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs rounded px-1.5 py-0.5 min-w-[26px]">
                <span className="text-[11px] sm:text-xs font-black font-mono text-[#FF5722] leading-tight">
                  {formatDigit(timeLeft.seconds)}
                </span>
                <span className="text-[6.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none mt-0.5">S</span>
              </div>
            </div>
          </div>

          {/* Claimed Progress Bar + Action Button Row */}
          <div className="flex items-center justify-between gap-3 pt-0.5">
            {/* Claimed Status */}
            <div className="space-y-1 flex-1 max-w-[170px]">
              <div className="flex justify-between text-[8.5px] sm:text-[9.5px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold">
                  <Flame size={10} className="fill-amber-500 text-amber-500" />
                  <span>84% Claimed</span>
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[8px]">Few left!</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-300/60 dark:border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF5722]"
                  style={{ width: "84%" }}
                />
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-md bg-gradient-to-r from-[#FF5722] via-[#FF6D00] to-[#FF9100] hover:brightness-105 text-white font-black text-[10.5px] sm:text-xs shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer border-none shrink-0"
              >
                <ShoppingCart size={12} />
                <span>{isAdding ? "Adding..." : "Claim Deal"}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate();
                }}
                className="hidden min-[420px]:flex px-2.5 py-1.5 sm:py-2 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-[10.5px] sm:text-xs transition-all duration-200 active:scale-95 items-center gap-1 cursor-pointer border border-slate-300/90 dark:border-slate-600 shadow-2xs shrink-0"
              >
                <span>Details</span>
                <ArrowRight size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. BOTTOM TRUST STRIP ── */}
        <div className="relative z-10 w-full border-t border-stone-200/80 dark:border-slate-800 bg-stone-100/70 dark:bg-black/50 px-3.5 sm:px-5 py-1.5 flex flex-wrap items-center justify-between text-[9px] sm:text-[9.5px] text-slate-600 dark:text-slate-300 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <Truck size={10} className="text-amber-600 dark:text-amber-400" />
              <span>Free Delivery</span>
            </span>
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hidden sm:inline-flex">
              <ShieldCheck size={10} className="text-emerald-600 dark:text-emerald-400" />
              <span>1-Year Warranty</span>
            </span>
          </div>

          <span className="text-amber-700 dark:text-amber-400 font-semibold tracking-wide flex items-center gap-1">
            <Zap size={9} className="text-amber-600 dark:text-amber-400" />
            <span>Refreshes at Midnight</span>
          </span>
        </div>

      </div>
    </section>
  );
};

export default DealOfTheDayBanner;
