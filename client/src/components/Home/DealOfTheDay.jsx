import React, { useState, useEffect } from "react";
import { Star, ShoppingCart, Eye, ArrowRight, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../../config";
import { getOptimizedImageUrl } from "../../utils/imageOptimizer";

const DealOfTheDay = ({ deals = [], activeDeal = null, onAddToCart }) => {
  const navigate = useNavigate();

  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const now = new Date();
  const isCampaignActive = activeDeal && activeDeal.isActive &&
    new Date(activeDeal.startDate) <= now &&
    new Date(activeDeal.endDate) >= now &&
    !isExpired;

  const dealProduct = isCampaignActive
    ? (activeDeal.productId || null)
    : (deals && deals.length > 0 ? deals[0] : null);

  const endDate = isCampaignActive ? activeDeal.endDate : null;

  useEffect(() => {
    if (!endDate) {
      setTimeLeft(null);
      setIsExpired(false);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(endDate) - Date.now();
      if (difference <= 0) {
        setIsExpired(true);
        return { hours: 0, minutes: 0, seconds: 0, expired: true };
      }
      setIsExpired(false);
      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      const val = calculateTimeLeft();
      if (val.expired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  if (!dealProduct || typeof dealProduct === "string" || !dealProduct.price) {
    return null;
  }

  // Fallbacks
  const title = isCampaignActive ? (activeDeal.title || "Deal of the Day") : "Deal of the Day";
  const subtitle = isCampaignActive ? (activeDeal.subtitle || "Limited Time Offer") : "Includes official brand warranty. Free express delivery within 24 hours.";

  const originalVal = dealProduct.originalPrice || Math.round(dealProduct.price * 1.25);
  const displayPrice = Number(dealProduct.price || 0);
  const displayOriginalPrice = Number(originalVal || 0);
  const discountPercent = Math.max(5, Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100));

  const discountLabel = isCampaignActive
    ? (activeDeal.discountLabel || `SAVE ${discountPercent}%`)
    : `SAVE ${discountPercent}%`;

  const rawModelImg = isCampaignActive ? (activeDeal.modelImage || dealProduct.images?.[0] || "") : (dealProduct.images?.[0] || "");
  const rawModelUrl = rawModelImg?.startsWith("http") ? rawModelImg : `${backendUrl}/${rawModelImg}`;
  const finalModelImgUrl = getOptimizedImageUrl(rawModelUrl, { width: 1000, quality: 80 });

  const productImg = dealProduct.images?.[0] || "";
  const rawProdUrl = productImg?.startsWith("http") ? productImg : `${backendUrl}/${productImg}`;
  const finalProductImgUrl = getOptimizedImageUrl(rawProdUrl, { width: 200, quality: 75 });

  const handleAddToCart = () => {
    if (isExpired && isCampaignActive) return;
    onAddToCart(dealProduct);
  };

  const handleViewProduct = () => {
    navigate(`/product/${dealProduct._id}`);
  };

  const formatNumber = (num) => String(num || 0).padStart(2, "0");

  const renderTitle = () => {
    const titleText = title || "";
    const words = titleText.split(" ");
    if (words.length > 1) {
      const lastWord = words.pop();
      return (
        <>
          {words.join(" ")}{" "}
          <span className="text-amber-400">{lastWord}</span>
        </>
      );
    }
    return titleText;
  };

  return (
    <div className="group relative w-full rounded-sm overflow-hidden border border-slate-800 text-white shadow-md flex flex-col justify-between min-h-[500px] transition-all duration-300 hover:border-slate-700 select-none p-6 sm:p-8">

      {/* FULL CARD BACKGROUND COVER IMAGE */}
      <img
        src={finalModelImgUrl}
        alt="Campaign Background"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 z-0 pointer-events-none"
      />

      {/* DARK GRADIENT OVERLAY FOR HIGH CONTRAST READABILITY */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/40 z-0 pointer-events-none" />

      {/* FLOATING DISCOUNT BADGE TOP RIGHT */}
      {discountLabel && (
        <div className="absolute top-4 right-4 z-20 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-sm shadow-xl border border-amber-300 select-none">
          {discountLabel}
        </div>
      )}

      {/* INNER CONTENT OVERLAY */}
      <div className="relative z-10 w-full lg:w-3/5 flex flex-col justify-between h-full space-y-6">
        <div className="space-y-4">
          {/* Animated Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-black uppercase tracking-widest w-fit">
            <Flame size={13} className="fill-amber-500 text-amber-500" />
            DEAL OF THE DAY
          </span>

          {/* Campaign Title */}
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight group-hover:text-amber-400 transition-colors">
              {renderTitle()}
            </h3>
            {isCampaignActive && (
              <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                Featured: {dealProduct.name}
              </p>
            )}
          </div>

          {/* Campaign Subtitle */}
          <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-md">
            {subtitle}
          </p>

          {/* Price Box */}
          <div className="space-y-1 pt-1">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-black">Deal Price</span>
            <div className="flex items-baseline gap-2.5">
              <span className="font-black text-white text-2xl sm:text-3xl font-mono">₹{displayPrice.toLocaleString("en-IN")}</span>
              {displayOriginalPrice > displayPrice && (
                <span className="text-xs text-slate-500 line-through font-medium font-mono">₹{displayOriginalPrice.toLocaleString("en-IN")}</span>
              )}
            </div>
          </div>

          {/* Ratings & Reviews */}
          <div className="flex items-center gap-2 text-xs text-amber-500 pt-0.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => {
                const filled = i < Math.round(dealProduct.averageRating || (typeof dealProduct.rating === "object" ? dealProduct.rating?.average : dealProduct.rating) || 4.5);
                return (
                  <Star
                    key={i}
                    size={12}
                    className={`${filled ? "fill-amber-400 text-amber-400" : "fill-white/10 text-transparent"} stroke-none`}
                  />
                );
              })}
            </div>
            <span className="font-bold text-slate-400 text-[11px]">({dealProduct.totalReviews || dealProduct.reviews?.length || 12} Reviews)</span>
          </div>

          {/* Real Countdown Timer */}
          {endDate && (
            <div className="space-y-2 pt-2">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-black">Ends In:</span>
              {timeLeft ? (
                <div className="flex gap-2 items-center">
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm min-w-[42px] shadow-xs">
                    <span className="text-xs font-black text-white font-mono">{formatNumber(timeLeft.hours)}</span>
                    <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">Hrs</span>
                  </div>
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm min-w-[42px] shadow-xs">
                    <span className="text-xs font-black text-white font-mono">{formatNumber(timeLeft.minutes)}</span>
                    <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">Min</span>
                  </div>
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm min-w-[42px] shadow-xs">
                    <span className="text-xs font-black text-amber-400 font-mono">{formatNumber(timeLeft.seconds)}</span>
                    <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">Sec</span>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-sm w-fit uppercase tracking-wider">
                  Deal Ended
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA Buttons Row */}
        <div className="flex items-center gap-3 pt-4 max-w-md">
          <button
            onClick={handleAddToCart}
            disabled={dealProduct.stock === 0}
            className={`flex-1 py-3 px-5 rounded-sm font-extrabold text-xs uppercase tracking-wider shadow-md transition-all border-none flex items-center justify-center gap-2 select-none cursor-pointer ${
              dealProduct.stock === 0
                ? "bg-white/5 text-white/30 cursor-not-allowed"
                : "bg-white hover:bg-slate-100 text-slate-950 active:scale-95 shadow-sm"
            }`}
          >
            <ShoppingCart size={14} />
            <span>Shop Now</span>
          </button>

          <button
            onClick={handleViewProduct}
            className="py-3 px-5 rounded-sm bg-slate-900/80 hover:bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 border border-white/20 flex items-center justify-center gap-2 select-none backdrop-blur-md"
          >
            <Eye size={14} />
            <span>View Product</span>
          </button>
        </div>
      </div>

      {/* FLOATING PRODUCT PREVIEW CARD BOTTOM RIGHT */}
      {finalProductImgUrl && (
        <div
          onClick={handleViewProduct}
          className="absolute bottom-4 right-4 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 p-2 rounded-sm flex items-center gap-2.5 shadow-xl hover:border-amber-400 cursor-pointer transition select-none active:scale-95"
        >
          <img
            src={finalProductImgUrl}
            alt={dealProduct.name}
            loading="lazy"
            decoding="async"
            className="w-10 h-10 object-cover bg-slate-900 rounded-xs border border-slate-800 shrink-0"
          />
          <div className="text-[10px] font-bold text-white leading-tight pr-1 flex flex-col justify-center text-left">
            <span className="text-slate-400 text-[8px] uppercase font-bold tracking-wider">PRODUCT</span>
            <span className="font-bold truncate max-w-[120px]">{dealProduct.name}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default DealOfTheDay;
