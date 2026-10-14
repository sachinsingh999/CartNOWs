import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  Zap,
  ShoppingCart,
  Truck,
  ShieldCheck,
  ArrowRight
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

  // Determine stage image url
  const stageImgUrl =
    currentDeal.stageImage ||
    (currentDeal.image?.startsWith("/") || currentDeal.image?.startsWith("http")
      ? currentDeal.image
      : currentDeal.images?.[0]
        ? (currentDeal.images[0].startsWith("http")
            ? currentDeal.images[0]
            : `${backendUrl}/${currentDeal.images[0]}`)
        : "/deals/celestial_necklace_stage.png");

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
    <section className="w-full max-w-full p-0 m-0 border-0 select-none block overflow-hidden">
      <div
        onClick={handleNavigate}
        className="group relative w-full rounded-none overflow-hidden cursor-pointer border-0 shadow-none bg-[#FAF7F2] dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300"
      >
        {/* Floating Top-Right Discount Badge */}
        <div className="absolute top-2.5 sm:top-3 right-3 sm:right-6 z-20 px-2.5 py-0.5 rounded-full bg-[#FF5722] text-white font-black text-[11px] sm:text-xs tracking-wide shadow-md pointer-events-none">
          -{discountPercent}%
        </div>

        {/* ── MAIN HORIZONTAL BANNER CONTENT (Comfortable Height & Zero Edge Gaps) ── */}
        <div className="relative z-10 w-full min-h-[195px] sm:min-h-[230px] lg:min-h-[250px] flex items-stretch overflow-hidden">
          
          {/* Left Column: Details, Live Timer, Price, Progress & CTAs (Strictly constrained so no text runs behind image) */}
          <div className="relative z-10 w-[58%] min-[480px]:w-[62%] sm:w-[68%] md:w-[62%] lg:w-[58%] xl:w-[54%] max-w-[58%] min-[480px]:max-w-[62%] sm:max-w-none flex flex-col justify-center text-left py-2.5 sm:py-4.5 pl-3 sm:pl-7 lg:px-10 pr-1.5 sm:pr-6 space-y-1.5 sm:space-y-2.5 overflow-hidden">
            
            {/* 1. Badges Row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-500/80 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[9px] sm:text-[10.5px] font-black uppercase tracking-wider shrink-0">
                <Flame size={11} className="fill-amber-500 text-amber-500 shrink-0" />
                <span>DEAL OF THE DAY</span>
              </span>

              <span className="hidden min-[420px]:inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] sm:text-[10px] font-semibold shadow-2xs shrink-0">
                <Zap size={10} className="text-amber-500" />
                <span>Limited Stock</span>
              </span>

              <span className="text-[10px] sm:text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:inline-block truncate">
                • {brandName}
              </span>
            </div>

            {/* 2. Product Title (High-Impact Editorial Heading - strictly clamped within column) */}
            <h2 className="text-xs min-[400px]:text-sm sm:text-lg lg:text-xl xl:text-[22px] font-black text-slate-950 dark:text-white leading-snug tracking-tight line-clamp-2 break-words">
              {currentDeal.name}
            </h2>

            {/* 3. Subtitle / Description (Hidden on mobile collapse so it never runs behind image) */}
            <p className="hidden sm:block text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 font-normal max-w-xl">
              {currentDeal.description}
            </p>

            {/* 4. Timer & Price Row (Combined Horizontal) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-5 pt-0.5">
              
              {/* Countdown Digits */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs rounded px-1.5 sm:px-2 py-0.5 min-w-[28px] sm:min-w-[38px]">
                  <span className="text-[11px] sm:text-base font-black font-mono text-slate-950 dark:text-white leading-tight">
                    {formatDigit(timeLeft.hours)}
                  </span>
                  <span className="text-[6.5px] sm:text-[7px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none mt-0.5">HRS</span>
                </div>
                <span className="text-amber-500 font-bold text-[10px] sm:text-xs leading-none">:</span>
                <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs rounded px-1.5 sm:px-2 py-0.5 min-w-[28px] sm:min-w-[38px]">
                  <span className="text-[11px] sm:text-base font-black font-mono text-slate-950 dark:text-white leading-tight">
                    {formatDigit(timeLeft.minutes)}
                  </span>
                  <span className="text-[6.5px] sm:text-[7px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none mt-0.5">MIN</span>
                </div>
                <span className="text-amber-500 font-bold text-[10px] sm:text-xs leading-none">:</span>
                <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs rounded px-1.5 sm:px-2 py-0.5 min-w-[28px] sm:min-w-[38px]">
                  <span className="text-[11px] sm:text-base font-black font-mono text-[#FF5722] leading-tight">
                    {formatDigit(timeLeft.seconds)}
                  </span>
                  <span className="text-[6.5px] sm:text-[7px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none mt-0.5">SEC</span>
                </div>
              </div>

              {/* Price & Discount */}
              <div className="flex items-baseline gap-1.5 sm:gap-2 shrink-0">
                <span className="text-base min-[400px]:text-lg sm:text-2xl font-black text-slate-950 dark:text-white font-mono tracking-tight leading-none">
                  ₹{price.toLocaleString("en-IN")}
                </span>
                {originalPrice > price && (
                  <span className="text-[10px] sm:text-sm text-slate-400 line-through font-mono leading-none">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
                <span className="hidden min-[440px]:inline-block px-1.5 sm:px-2 py-0.5 rounded bg-[#FF5722] text-white text-[9px] sm:text-[11px] font-black tracking-wide leading-none shadow-2xs">
                  {discountPercent}% OFF
                </span>
              </div>

            </div>

            {/* 5. Claimed Bar + CTAs Group */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-5 pt-0.5 sm:pt-1">
              
              {/* Claimed Status */}
              <div className="space-y-0.5 w-full min-[400px]:w-auto min-w-[120px] sm:min-w-[170px] max-w-[190px] sm:max-w-[220px]">
                <div className="flex justify-between text-[8.5px] sm:text-[10.5px] font-semibold text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold">
                    <Flame size={10} className="fill-amber-500 text-amber-500" />
                    <span>84% Claimed</span>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[8px] sm:text-[9.5px]">Few units left!</span>
                </div>
                <div className="w-full h-1.5 sm:h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-300/60 dark:border-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF5722]"
                    style={{ width: "84%" }}
                  />
                </div>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-md bg-gradient-to-r from-[#FF5722] via-[#FF6D00] to-[#FF9100] hover:brightness-105 text-white font-black text-[10.5px] sm:text-xs shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer border-none shrink-0"
                >
                  <ShoppingCart size={12} />
                  <span>{isAdding ? "Adding..." : "Claim Deal Now"}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate();
                  }}
                  className="hidden sm:flex px-3 sm:px-4 py-2 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-[11px] sm:text-xs transition-all duration-200 active:scale-95 items-center gap-1.5 cursor-pointer border border-slate-300/90 dark:border-slate-600 shadow-2xs shrink-0"
                >
                  <span>View Details</span>
                  <ArrowRight size={12} />
                </button>
              </div>

            </div>

          </div>

          {/* Right Column: Stage / Product Image (Pinned Right with Smooth Fade to Canvas) */}
          <div className="absolute right-0 top-0 bottom-0 w-[42%] sm:w-[42%] md:w-[45%] lg:w-[48%] xl:w-[50%] overflow-hidden pointer-events-none">
            {/* Smooth Ambient Gradient Fade from Left Background to Image */}
            <div className="absolute inset-y-0 left-0 w-24 sm:w-36 md:w-52 bg-gradient-to-r from-[#FAF7F2] dark:from-slate-900 via-[#FAF7F2]/80 dark:via-slate-900/80 to-transparent z-10 pointer-events-none" />

            {/* Product Image */}
            <img
              src={stageImgUrl}
              alt={currentDeal.name}
              className="w-full h-full object-cover object-center sm:object-right transition-transform duration-700 group-hover:scale-105"
              loading="eager"
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/deals/celestial_necklace_stage.png";
              }}
            />
          </div>

        </div>

        {/* ── BOTTOM TRUST STRIP (Zero Gap, Clean Light Surface) ── */}
        <div className="relative z-10 w-full border-t border-stone-200/80 dark:border-slate-800 bg-stone-100/70 dark:bg-black/50 px-4 sm:px-7 lg:px-10 py-1.5 flex flex-wrap items-center justify-between text-[10px] sm:text-[10.5px] text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <Truck size={11} className="text-amber-600 dark:text-amber-400" />
              <span>Free Express Delivery Tomorrow</span>
            </span>
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hidden sm:inline-flex">
              <ShieldCheck size={11} className="text-emerald-600 dark:text-emerald-400" />
              <span>Official 1-Year Brand Warranty</span>
            </span>
          </div>

          <span className="text-amber-700 dark:text-amber-400 font-semibold tracking-wide flex items-center gap-1">
            <Zap size={9.5} className="text-amber-600 dark:text-amber-400" />
            <span>Refreshes Daily at Midnight</span>
          </span>
        </div>

      </div>
    </section>
  );
};

export default DealOfTheDayBanner;
