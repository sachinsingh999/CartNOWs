import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { backendUrl } from "../../config";
import {
  Flame,
  Clock,
  ShoppingCart,
  Zap,
  Heart,
  Share2,
  ArrowRight,
  Star,
  X,
  Truck,
  ShieldCheck,
  RotateCcw,
  ShoppingBag
} from "lucide-react";

const PremiumDealBanner = ({ deal, onAddToCart, onToggleFavorite, wishlist = [], onClose }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(null);

  const product = deal?.productId || {};
  const isWishlisted = wishlist.includes(product._id);

  // Digital countdown calculation
  useEffect(() => {
    if (!deal || !deal.endDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(deal.endDate) - Date.now();
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, expired: true };
      }
      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [deal]);

  if (!deal || !product._id || timeLeft?.expired) return null;

  // Stable claimed percentage based on deal ID
  const getClaimedPercentage = (id) => {
    if (!id) return 82;
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return 75 + (Math.abs(hash) % 20); // 75% to 94%
  };

  const claimedPercent = getClaimedPercentage(deal._id);
  const stockLeft = Math.max(2, Math.round(product.stock * 0.12)) || 5;

  const originalVal = product.originalPrice || Math.round(product.price * 1.3);
  const discountPercent = Math.max(5, Math.round(((originalVal - product.price) / originalVal) * 100));

  const modelImg = deal.modelImage || "";
  const finalModelImgUrl = modelImg.startsWith("http") ? modelImg : `${backendUrl}${modelImg.startsWith("/") ? "" : "/"}${modelImg}`;

  const productImg = product.images?.[0] || "";
  const finalProductImgUrl = productImg.startsWith("http") ? productImg : `${backendUrl}/${productImg}`;

  // Actions
  const handleBuyNow = () => {
    onAddToCart(product, 1);
    navigate("/cart");
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/product/${product._id}`;
    navigator.clipboard.writeText(url);
    toast.success("Product link copied to clipboard! 🔗");
  };

  const formatNumber = (num) => String(num || 0).padStart(2, "0");

  const renderTitle = () => {
    const titleText = deal.title || "";
    const words = titleText.split(" ");
    if (words.length > 1) {
      const lastWord = words.pop();
      return (
        <>
          {words.join(" ")}{" "}
          <span className="text-[#f97316]">{lastWord}</span>
        </>
      );
    }
    return titleText;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      id="deal-of-the-day-banner"
      className="relative w-full rounded-[32px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col border border-white/[0.08] text-slate-100 dark:text-white bg-gradient-to-br from-[#0c0f1d] via-[#070913] to-[#030409] p-4 sm:p-5 lg:p-6 mb-4 text-left select-none"
    >
      {/* Decorative Grid texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none rounded-[32px] z-0" />

      {/* Editorial Decorative Glows */}
      <div className="absolute left-[-20px] top-[10%] w-60 h-60 bg-[#f97316]/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute right-[10%] bottom-0 w-80 h-80 bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none z-0" />

      {/* Floating Close Button */}
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-6 right-6 z-40 bg-white/[0.06] hover:bg-white/[0.15] border border-white/10 text-slate-300 hover:text-white rounded-full p-2.5 cursor-pointer flex items-center justify-center transition-all active:scale-95 shadow-lg backdrop-blur-md"
          title="Close Spotlight"
        >
          <X size={15} />
        </button>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="w-full flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-4 lg:gap-6 relative z-10">

        {/* LEFT CONTENT SECTION */}
        <div className="w-full lg:w-[58%] flex flex-col justify-between space-y-3 lg:pr-2">
          <div className="space-y-2">
            {/* Deal Badges & Timer Row */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-300 text-[10px] font-black uppercase tracking-wider shadow-md">
                <Flame size={12} className="fill-orange-400 text-orange-400 animate-bounce" />
                <span>DEAL OF THE DAY</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-[10px] font-black uppercase tracking-wider shadow-md">
                <Zap size={11} className="text-red-400 animate-pulse" />
                <span>{discountPercent}% OFF</span>
              </span>

              {timeLeft && (
                <div className="flex flex-col items-center bg-black/40 backdrop-blur-md border border-red-500/30 rounded-xl px-4 py-1.5 shadow-[0_0_20px_rgba(239,68,68,0.15)] min-w-[90px]">
                  <span className="text-[6px] font-black uppercase text-red-400 tracking-[0.2em] leading-none mb-1">Ends In</span>
                  <div className="flex items-center gap-1 font-mono text-[13px] font-black text-slate-100 dark:text-white leading-none">
                    <span>{formatNumber(timeLeft.hours)}</span>
                    <span className="text-red-500 animate-pulse">:</span>
                    <span>{formatNumber(timeLeft.minutes)}</span>
                    <span className="text-red-500 animate-pulse">:</span>
                    <span>{formatNumber(timeLeft.seconds)}</span>
                  </div>
                  <div className="flex justify-between w-full text-[5.5px] font-black text-slate-500 tracking-wider mt-1 px-0.5">
                    <span>HRS</span>
                    <span>MINS</span>
                    <span>SECS</span>
                  </div>
                </div>
              )}
            </div>

            {/* Brand & Product Title */}
            <div className="space-y-2 mt-4 max-w-[95%] lg:max-w-[88%]">
              <span className="text-[9px] uppercase tracking-[0.3em] font-black text-slate-400 block">
                {product.brand || "GENERIC"}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent select-text">
                {renderTitle()}
              </h2>
              {deal.subtitle && (
                <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed select-text mt-1.5">
                  {deal.subtitle}
                </p>
              )}
            </div>

            {/* Stock Progress */}
            <div className="space-y-2.5 pt-2 max-w-[95%] lg:max-w-[88%]">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                <ShoppingBag size={13} className="text-orange-400" />
                <span className="text-orange-400 font-black">Hurry! Only {stockLeft} Left</span>
                <span>•</span>
                <span className="text-slate-300 font-black">{claimedPercent}% Sold</span>
              </div>
              <div className="h-2 w-full bg-slate-950/80 rounded-full overflow-hidden border border-white/5 relative p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000 relative shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                  style={{ width: `${claimedPercent}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] translate-x-[-100%] animate-pulse" style={{ animationDuration: '1.5s' }} />
                </div>
              </div>
            </div>

            {/* Price Box & Rating */}
            <div className="flex items-center gap-4 pt-3.5 max-w-[95%] lg:max-w-[88%] border-t border-white/[0.06]">
              <div className="flex flex-col">
                <span className="text-[8.5px] uppercase tracking-[0.25em] text-slate-400 font-extrabold">Spotlight Price</span>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-4xl sm:text-5xl font-black text-orange-500 select-text drop-shadow-[0_4px_20px_rgba(249,115,22,0.25)]">
                    ₹{product.price?.toLocaleString("en-IN")}
                  </span>
                  {originalVal > product.price && (
                    <span className="text-sm line-through text-slate-500 font-medium select-text">
                      ₹{originalVal?.toLocaleString("en-IN")}
                    </span>
                  )}
                  {originalVal > product.price && (
                    <span className="inline-flex items-center px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9.5px] font-black uppercase tracking-wider">
                      Save ₹{(originalVal - product.price).toLocaleString("en-IN")}
                    </span>
                  )}

                  {/* Rating block */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] shadow-md text-slate-300">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black text-slate-100 dark:text-white">{product.averageRating || product.rating?.average || 4.5}</span>
                    <span className="text-slate-500 font-bold">({product.totalReviews || 12} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 max-w-[95%] lg:max-w-[92%]">
            {/* Buy Now */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff0055] to-[#ff3377] hover:brightness-110 text-slate-100 dark:text-white text-[11px] sm:text-xs font-black uppercase tracking-widest shadow-xl shadow-pink-500/20 transition-all duration-300 hover:scale-[1.03] hover:translate-y-[-1px] active:translate-y-[0px] active:scale-98 border-none cursor-pointer flex items-center gap-2 select-none"
            >
              <Zap size={13} className="fill-white animate-pulse" />
              <span>Buy Now</span>
            </button>

            {/* Add to Cart */}
            <button
              onClick={() => onAddToCart(product, 1)}
              disabled={product.stock === 0}
              className="px-5 py-2.5 rounded-xl bg-transparent hover:bg-white/5 border border-white/20 text-slate-100 dark:text-white text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-1px] active:translate-y-[0px] active:scale-98 cursor-pointer flex items-center gap-2 select-none"
            >
              <ShoppingCart size={13} />
              <span>Add To Cart</span>
            </button>

            {/* Add to Wishlist */}
            <button
              onClick={() => onToggleFavorite(product._id)}
              className={`p-3 rounded-xl border transition-all duration-300 hover:scale-[1.05] hover:translate-y-[-1px] active:translate-y-[0px] active:scale-98 cursor-pointer flex items-center justify-center select-none ${isWishlisted ? "bg-rose-500/20 border-rose-500/30 text-rose-500" : "bg-transparent border-white/20 hover:bg-rose-500/10 hover:border-rose-500/25 hover:text-rose-500" }`}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={14} className={isWishlisted ? "fill-rose-500" : ""} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-3 rounded-xl bg-transparent border border-white/20 hover:bg-white/5 text-slate-100 dark:text-white transition-all duration-300 hover:scale-[1.05] hover:translate-y-[-1px] active:translate-y-[0px] active:scale-98 cursor-pointer flex items-center justify-center select-none"
              title="Share campaign product"
            >
              <Share2 size={14} />
            </button>

            {/* View Details */}
            <button
              onClick={() => {
                onClose();
                navigate(`/product/${product._id}`);
              }}
              className="px-3 py-2 text-slate-400 hover:text-white text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all duration-200 hover:translate-x-[2px] cursor-pointer border-none bg-transparent flex items-center gap-1.5 select-none"
            >
              <span>View Details</span>
              <ArrowRight size={12} className="stroke-[3.5]" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE SECTION */}
        <div className="w-full lg:w-[42%] h-[160px] lg:h-auto lg:self-stretch relative overflow-visible flex items-end justify-center mt-6 lg:mt-0 select-none">

          {/* Giant Background Text */}
          <span className="absolute text-[60px] sm:text-[80px] lg:text-[100px] font-black text-white/[0.02] uppercase tracking-tighter pointer-events-none z-0 rotate-[-12deg]">
            DEAL
          </span>

          {/* Glow effects behind model */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[300px] h-[300px] rounded-full bg-orange-500/20 blur-[100px]" />
          </div>
          <div className="absolute bottom-0 right-0 w-[200px] h-[200px] rounded-full bg-orange-500/10 blur-[80px] pointer-events-none" />
          <div className="absolute top-0 right-[15%] w-[150px] h-[150px] rounded-full bg-blue-500/[0.04] blur-[60px] pointer-events-none" />

          {/* Model Image */}
          {deal.modelImage && (
            <img
              src={finalModelImgUrl}
              alt="Premium Fashion Model"
              draggable={false}
              className="absolute top-[-16px] bottom-[-16px] sm:top-[-20px] sm:bottom-[-20px] lg:top-[-24px] lg:bottom-[-24px] right-[-10px] w-auto object-contain object-bottom select-none pointer-events-none z-10 animate-float-slow drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
              style={{ clipPath: "inset(3px)" }}
            />
          )}

          {/* Left-side Floating Review Badge */}
          <div className="absolute bottom-4 left-1.5 z-20 bg-black/75 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 shadow-2xl scale-90">
            <div className="flex items-center gap-1.5">
              <Star size={13} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-slate-100 dark:text-white text-xs">
                {product.averageRating || product.rating?.average || 4.8}
              </span>
              <span className="text-slate-400 text-[10px]">
                ({product.totalReviews || "2.1k"})
              </span>
            </div>
          </div>

          {/* Right-side Floating catalog item card */}
          {productImg && (
            <div
              onClick={() => {
                onClose();
                navigate(`/product/${product._id}`);
              }}
              className="absolute bottom-2 right-1.5 lg:right-3 z-20 bg-slate-950/80 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl flex items-center gap-2.5 shadow-2xl hover:border-[#f97316]/40 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group max-w-[200px] scale-90"
            >
              <img
                src={finalProductImgUrl}
                alt=""
                className="w-12 h-12 object-contain bg-white dark:bg-slate-900 rounded-xl p-1.5 border border-slate-200/50 group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
              />
              <div className="text-slate-100 dark:text-white text-[10px] font-bold tracking-tight pr-2 flex flex-col justify-center text-left">
                <span className="opacity-50 text-[7px] uppercase font-black tracking-widest leading-none">Featured Product</span>
                <span className="leading-tight truncate font-black mt-1 max-w-[120px]">{product.name}</span>
                <div className="flex items-center gap-1 mt-1 text-[8px] text-amber-400">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={8} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-slate-400 font-bold ml-1">{product.averageRating || product.rating?.average || 4.5}</span>
                </div>
                <span className="text-orange-500 text-[10px] font-black mt-1">₹{product.price?.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );
};

export default PremiumDealBanner;
