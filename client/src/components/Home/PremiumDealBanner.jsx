

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { backendUrl } from "../../config";
import { triggerFlyToCart } from "../../utils/animation";
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

const PremiumDealBanner = ({
  deal,
  onAddToCart,
  onToggleFavorite,
  wishlist = [],
  onClose
}) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(null);
  const [isBursting, setIsBursting] = useState(false);

  const product = deal?.productId || {};
  const isWishlisted = wishlist.includes(product._id);

  useEffect(() => {
    if (!deal || !deal.endDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(deal.endDate) - Date.now();

      if (difference <= 0) {
        return {
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true
        };
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

  if (!deal || !product._id || timeLeft?.expired) {
    return null;
  }

  const getClaimedPercentage = (id) => {
    if (!id) return 82;

    let hash = 0;

    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    return 75 + (Math.abs(hash) % 20);
  };

  const claimedPercent = getClaimedPercentage(deal._id);

  const stockLeft =
    Math.max(2, Math.round(product.stock * 0.12)) || 5;

  const originalVal =
    product.originalPrice ||
    Math.round(product.price * 1.3);

  const discountPercent = Math.max(
    5,
    Math.round(
      ((originalVal - product.price) / originalVal) * 100
    )
  );

  const modelImg = deal.modelImage || "";

  const finalModelImgUrl = modelImg.startsWith("http")
    ? modelImg
    : `${backendUrl}${
        modelImg.startsWith("/") ? "" : "/"
      }${modelImg}`;

  const productImg = product.images?.[0] || "";

  const finalProductImgUrl = productImg.startsWith("http")
    ? productImg
    : `${backendUrl}/${productImg}`;

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

  const formatNumber = (num) =>
    String(num || 0).padStart(2, "0");

  const renderTitle = () => {
    const titleText = deal.title || "";
    const words = titleText.split(" ");

    if (words.length > 1) {
      const lastWord = words.pop();

      return (
        <>
          {words.join(" ")}{" "}
          <span className="text-[#f97316]">
            {lastWord}
          </span>
        </>
      );
    }

    return titleText;
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.05,
        x: "35vw",
        y: 0
      }}
      animate={{
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0
      }}
      exit={{
        opacity: 0,
        scale: 0.05,
        x: "35vw",
        y: 0
      }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }}
      id="deal-of-the-day-banner"
      className="light-sweep-container group relative w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col border border-white/[0.08] text-white bg-gradient-to-br from-[#0c0f1d] via-[#070913] to-[#030409] p-5 sm:p-6 mb-4 text-left select-none animate-fade-in"
    >
      {/* Decorative Grid texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none rounded-2xl z-0" />

      {/* Editorial Decorative Glows */}
      <div className="absolute left-[-20px] top-[10%] w-48 h-48 bg-[#f97316]/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute right-[10%] bottom-0 w-64 h-64 bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none z-0" />

      {/* Floating Close Button */}
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-40 bg-white/[0.06] hover:bg-white/[0.15] border border-white/10 text-slate-350 hover:text-white rounded-none p-2 cursor-pointer flex items-center justify-center transition-all active:scale-95 shadow-md backdrop-blur-md"
          title="Close Spotlight"
        >
          <X size={14} />
        </button>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="w-full flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-5 lg:gap-6 relative z-10">

        {/* LEFT CONTENT SECTION */}
        <div className="w-full lg:w-[58%] flex flex-col justify-between space-y-4 lg:pr-2">
          <div className="space-y-3.5">

            {/* Deal Badges & Timer Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none bg-orange-500/10 border border-orange-500/25 text-orange-400 text-[9px] font-black uppercase tracking-wider shadow-sm">
                <Flame
                  size={10}
                  className="fill-orange-400 text-orange-400 animate-bounce"
                />
                <span>DEAL OF THE DAY</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none bg-red-500/10 border border-red-500/25 text-red-400 text-[9px] font-black uppercase tracking-wider shadow-sm">
                <Zap
                  size={10}
                  className="text-red-400 animate-pulse"
                />
                <span>{discountPercent}% OFF</span>
              </span>

              {timeLeft && (
                <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md border border-white/[0.04] rounded-none p-1.5 shadow-inner">
                  {/* Hours */}
                  <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.06] rounded-none w-9 h-9 sm:w-10 sm:h-10 shadow-sm">
                    <span className="font-mono text-xs sm:text-sm font-black text-white">{formatNumber(timeLeft.hours)}</span>
                    <span className="text-[5.5px] font-black uppercase text-slate-400 tracking-wider leading-none mt-0.5">HRS</span>
                  </div>
                  <span className="text-[#f97316]/80 font-bold text-xs animate-pulse">:</span>
                  {/* Minutes */}
                  <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.06] rounded-none w-9 h-9 sm:w-10 sm:h-10 shadow-sm">
                    <span className="font-mono text-xs sm:text-sm font-black text-white">{formatNumber(timeLeft.minutes)}</span>
                    <span className="text-[5.5px] font-black uppercase text-slate-400 tracking-wider leading-none mt-0.5">MINS</span>
                  </div>
                  <span className="text-[#f97316]/80 font-bold text-xs animate-pulse">:</span>
                  {/* Seconds */}
                  <div className="flex flex-col items-center justify-center bg-[#f97316]/10 border border-[#f97316]/25 rounded-none w-9 h-9 sm:w-10 sm:h-10 shadow-inner shadow-[#f97316]/5">
                    <span className="font-mono text-xs sm:text-sm font-black text-[#f97316]">{formatNumber(timeLeft.seconds)}</span>
                    <span className="text-[5.5px] font-black uppercase text-[#f97316]/85 tracking-wider leading-none mt-0.5">SECS</span>
                  </div>
                </div>
              )}
            </div>

            {/* Brand & Product Title */}
            <div className="space-y-1 mt-2 max-w-[95%] lg:max-w-[88%]">
              <span className="text-[8.5px] uppercase tracking-[0.25em] font-black text-slate-400 block">
                {product.brand || "GENERIC"}
              </span>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent select-text">
                {renderTitle()}
              </h2>

              {deal.subtitle && (
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-relaxed select-text mt-1">
                  {deal.subtitle}
                </p>
              )}
            </div>

            {/* Stock Progress */}
            <div className="space-y-2 pt-1 max-w-[95%] lg:max-w-[88%]">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-350">
                <ShoppingBag
                  size={11}
                  className="text-orange-400"
                />
                <span className="text-orange-400 font-black">
                  Hurry! Only {stockLeft} Left
                </span>
                <span>•</span>
                <span className="text-slate-300 font-black">
                  {claimedPercent}% Sold
                </span>
              </div>

              <div className="h-2 w-full bg-slate-950/80 rounded-none overflow-hidden border border-white/5 relative p-[1px]">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 rounded-none relative shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${claimedPercent}%` }}
                  transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                >
                  <div
                    className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] translate-x-[-100%] animate-pulse"
                    style={{
                      animationDuration: "1.5s"
                    }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Price Box & Rating */}
            <div className="flex items-center gap-3 pt-2.5 max-w-[95%] lg:max-w-[88%] border-t border-white/[0.06]">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-[0.2em] text-slate-400 font-extrabold">
                  Spotlight Price
                </span>
                <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-orange-500 select-text drop-shadow-[0_4px_20px_rgba(249,115,22,0.25)]">
                    ₹{product.price?.toLocaleString("en-IN")}
                  </span>

                  {originalVal > product.price && (
                    <span className="text-xs line-through text-slate-500 font-medium select-text">
                      ₹{originalVal?.toLocaleString("en-IN")}
                    </span>
                  )}

                  {originalVal > product.price && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-none bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[8.5px] font-black uppercase tracking-wider">
                      Save ₹
                      {(originalVal - product.price).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  )}

                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-none bg-white/[0.03] border border-white/[0.06] shadow-sm text-slate-355">
                    <Star
                      size={10}
                      className="fill-amber-400 text-amber-400"
                    />
                    <span className="text-[10px] font-black text-white">
                      {product.averageRating ||
                        product.rating?.average ||
                        4.5}
                    </span>
                    <span className="text-slate-550 font-bold text-[9px] ml-1">
                      ({product.totalReviews || 12} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 max-w-[95%] lg:max-w-[92%]">
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="px-4 py-2.5 rounded-none bg-gradient-to-r from-[#ff0055] to-[#ff3377] hover:brightness-110 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-lg shadow-pink-500/15 transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-1px] active:translate-y-[0px] active:scale-98 border-none cursor-pointer flex items-center gap-1.5 select-none"
            >
              <Zap
                size={11}
                className="fill-white animate-pulse"
              />
              <span>Buy Now</span>
            </button>

            <button
              onClick={(e) => {
                if (e.clientX && e.clientY) {
                  triggerFlyToCart(e.clientX, e.clientY, finalProductImgUrl);
                }
                setTimeout(() => {
                  onAddToCart(product, 1);
                }, 850);
              }}
              disabled={product.stock === 0}
              className="px-4 py-2.5 rounded-none bg-transparent hover:bg-white/5 border border-white/20 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-1px] active:translate-y-[0px] active:scale-98 cursor-pointer flex items-center gap-1.5 select-none"
            >
              <ShoppingCart size={11} />
              <span>Add To Cart</span>
            </button>

            <button
              onClick={() => {
                setIsBursting(true);
                setTimeout(() => setIsBursting(false), 450);
                onToggleFavorite(product._id);
              }}
              className={`p-2.5 rounded-none border transition-all duration-300 hover:scale-[1.05] hover:translate-y-[-1px] active:translate-y-[0px] active:scale-98 cursor-pointer flex items-center justify-center select-none ${isBursting ? "heart-burst" : ""} ${
                isWishlisted
                  ? "bg-rose-500/20 border-rose-500/30 text-rose-500"
                  : "bg-transparent border-white/20 hover:bg-rose-500/10 hover:border-rose-500/25 hover:text-rose-500"
              }`}
              title={
                isWishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
            >
              <Heart
                size={12}
                className={
                  isWishlisted ? "fill-rose-500 text-rose-500 stroke-none" : ""
                }
              />
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-none bg-transparent border border-white/20 hover:bg-white/5 text-white transition-all duration-300 hover:scale-[1.05] hover:translate-y-[-1px] active:translate-y-[0px] active:scale-98 cursor-pointer flex items-center justify-center select-none"
              title="Share campaign product"
            >
              <Share2 size={12} />
            </button>

            <button
              onClick={() => {
                onClose();
                navigate(`/product/${product._id}`);
              }}
              className="px-3 py-2.5 text-slate-400 hover:text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all duration-200 hover:translate-x-[2px] cursor-pointer border-none bg-transparent flex items-center gap-1 select-none"
            >
              <span>View Details</span>
              <ArrowRight
                size={11}
                className="stroke-[3]"
              />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE SECTION */}
        <div className="w-full lg:w-[42%] h-[280px] lg:h-[400px] relative overflow-visible flex items-end justify-center mt-4 lg:mt-0 select-none">

          {/* Giant Background Text */}
          <span className="absolute text-[60px] sm:text-[80px] lg:text-[100px] font-black text-white/[0.02] uppercase tracking-tighter pointer-events-none z-0 rotate-[-12deg]">
            DEAL
          </span>

          {/* Main Glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[300px] h-[300px] rounded-full bg-orange-500/20 blur-[100px]" />
          </div>

          {/* Secondary Glow */}
          <div className="absolute bottom-0 right-0 w-[200px] h-[200px] rounded-full bg-orange-500/10 blur-[80px]" />
          <div className="absolute top-0 right-[15%] w-[150px] h-[150px] rounded-full bg-blue-500/[0.04] blur-[60px]" />

          {/* Model Image */}
          {deal.modelImage && (
            <img
              src={finalModelImgUrl}
              alt="Premium Fashion Model"
              draggable={false}
              className="
                absolute
                bottom-0
                right-[-10px]
                h-[100%]
                lg:h-[110%]
                w-auto
                object-contain
                object-bottom
                select-none
                pointer-events-none
                z-10
                animate-float-slow
                drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]
                transition-transform
                duration-700
                ease-out
                group-hover:scale-[1.03]
              "
            />
          )}

          {/* Review Badge */}
          <div
            className="
              absolute
              bottom-6
              left-2
              z-20
              bg-black/70
              backdrop-blur-xl
              border
              border-white/10
              rounded-none
              px-3
              py-2
              shadow-xl
              scale-90
            "
          >
            <div className="flex items-center gap-1.5">
              <Star
                size={14}
                className="fill-yellow-400 text-yellow-400"
              />
              <span className="font-bold text-white text-xs">
                {product.averageRating ||
                  product.rating?.average ||
                  4.8}
              </span>
              <span className="text-slate-400 text-[10px]">
                {product.totalReviews || "2.1k"} Reviews
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Trust Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/[0.06] pt-4 mt-5 w-full z-10 text-[9px] text-slate-400">
        <div className="flex items-center gap-2.5 bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.04] p-2.5 rounded-none border border-white/[0.05] hover:border-white/[0.1] hover:shadow-[0_6px_15px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="p-1.5 bg-orange-500/10 rounded-none text-orange-400 border border-orange-500/15">
            <Truck size={14} />
          </div>
          <div>
            <div className="font-extrabold text-slate-200">
              Free Shipping
            </div>
            <div className="opacity-60 text-[8px]">
              On all orders
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.04] p-2.5 rounded-none border border-white/[0.05] hover:border-white/[0.1] hover:shadow-[0_6px_15px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="p-1.5 bg-orange-500/10 rounded-none text-orange-400 border border-orange-500/15">
            <ShieldCheck size={14} />
          </div>
          <div>
            <div className="font-extrabold text-slate-200">
              Secure Payment
            </div>
            <div className="opacity-60 text-[8px]">
              100% protected
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.04] p-2.5 rounded-none border border-white/[0.05] hover:border-white/[0.1] hover:shadow-[0_6px_15px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="p-1.5 bg-orange-500/10 rounded-none text-orange-400 border border-orange-500/15">
            <RotateCcw size={14} />
          </div>
          <div>
            <div className="font-extrabold text-slate-200">
              Easy Returns
            </div>
            <div className="opacity-60 text-[8px]">
              7-day return policy
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumDealBanner;