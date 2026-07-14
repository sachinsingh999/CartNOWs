import React, { useState, useEffect } from "react";
import { Star, ShoppingCart, Eye, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../../config";

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
  const finalModelImgUrl = rawModelImg?.startsWith("http") ? rawModelImg : `${backendUrl}/${rawModelImg}`;

  const productImg = dealProduct.images?.[0] || "";
  const finalProductImgUrl = productImg?.startsWith("http") ? productImg : `${backendUrl}/${productImg}`;

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
          <span className="text-[#f97316]">{lastWord}</span>
        </>
      );
    }
    return titleText;
  };

  return (
    <div className="group relative bg-gradient-to-br from-[#0c0f1d] via-[#070913] to-[#030409] border border-white/[0.08] text-slate-100 dark:text-white rounded-none p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-6 justify-between min-h-[500px] text-left transition-all duration-300 hover:border-white/20 overflow-hidden col-span-1 select-none">

      {/* Custom inline style for keyframes to support advanced float */}
      <style>{`
        @keyframes custom-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.01); }
        }
        .animate-custom-float {
          animation: custom-float 5s ease-in-out infinite;
        }
      `}</style>

      {/* Decorative Grid texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none rounded-none z-0" />

      {/* Ambient background decoration */}
      <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500 z-0" />
      <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 bg-blue-500/[0.04] rounded-full blur-2xl pointer-events-none z-0" />

      {/* LEFT CONTENT AREA */}
      <div className="flex-1 flex flex-col justify-between space-y-5 relative z-10 w-full sm:w-1/2 lg:w-full xl:w-1/2">
        <div className="space-y-3.5">
          {/* Animated Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-300 text-[9px] font-black uppercase tracking-widest w-fit animate-pulse">
            🔥 DEAL OF THE DAY
          </span>

          {/* Campaign Title & Featured Sub-info */}
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-slate-100 dark:text-white leading-tight tracking-tight group-hover:text-orange-400 transition-colors">
              {renderTitle()}
            </h3>
            {isCampaignActive && (
              <p className="text-[9px] uppercase font-black tracking-wider text-slate-400">
                Featured: {dealProduct.name}
              </p>
            )}
          </div>

          {/* Campaign Subtitle */}
          <p className="text-xs text-slate-300 font-semibold leading-relaxed line-clamp-3">
            {subtitle}
          </p>

          {/* Price Box */}
          <div className="space-y-1">
            <span className="text-[8px] uppercase tracking-widest text-slate-400 font-black">Deal Price</span>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-slate-100 dark:text-white text-xl">₹{displayPrice.toLocaleString("en-IN")}</span>
              {displayOriginalPrice > displayPrice && (
                <span className="text-xs text-slate-500 line-through font-medium">₹{displayOriginalPrice.toLocaleString("en-IN")}</span>
              )}
            </div>
          </div>

          {/* Ratings & Reviews */}
          <div className="flex items-center gap-1.5 text-[10.5px] text-amber-500 pt-0.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => {
                const filled = i < Math.round(dealProduct.averageRating || (typeof dealProduct.rating === "object" ? dealProduct.rating?.average : dealProduct.rating) || 4.5);
                return (
                  <Star
                    key={i}
                    size={10}
                    className={`${filled ? "fill-amber-400 text-amber-400" : "fill-white/10"} stroke-none`}
                  />
                );
              })}
            </div>
            <span className="font-bold text-slate-400">({dealProduct.totalReviews || dealProduct.reviews?.length || 12} Reviews)</span>
          </div>

          {/* Real Countdown Timer */}
          {endDate && (
            <div className="space-y-2 pt-2">
              <span className="text-[8px] uppercase tracking-widest text-slate-400 font-black">Ends In:</span>
              {timeLeft ? (
                <div className="flex gap-2 items-center">
                  <div className="flex flex-col items-center bg-white/[0.03] border border-white/[0.06] px-2.5 py-1.5 rounded-xl min-w-[38px] shadow-xs">
                    <span className="text-xs font-black text-slate-100 dark:text-white">{formatNumber(timeLeft.hours)}</span>
                    <span className="text-[6px] text-slate-400 font-bold uppercase tracking-wider">Hrs</span>
                  </div>
                  <div className="flex flex-col items-center bg-white/[0.03] border border-white/[0.06] px-2.5 py-1.5 rounded-xl min-w-[38px] shadow-xs">
                    <span className="text-xs font-black text-slate-100 dark:text-white">{formatNumber(timeLeft.minutes)}</span>
                    <span className="text-[6px] text-slate-400 font-bold uppercase tracking-wider">Min</span>
                  </div>
                  <div className="flex flex-col items-center bg-white/[0.03] border border-white/[0.06] px-2.5 py-1.5 rounded-xl min-w-[38px] shadow-xs">
                    <span className="text-xs font-black text-orange-400">{formatNumber(timeLeft.seconds)}</span>
                    <span className="text-[6px] text-slate-400 font-bold uppercase tracking-wider">Sec</span>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl w-fit uppercase tracking-wider animate-pulse">
                  Deal Ended
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA Buttons Row */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={dealProduct.stock === 0}
            className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-[10px] uppercase tracking-widest shadow-md transition-all border-none flex items-center justify-center gap-1.5 select-none ${dealProduct.stock === 0 ? "bg-white/5 text-white/30 cursor-not-allowed" : "bg-gradient-to-r from-[#ff0055] to-[#ff3377] hover:brightness-110 text-slate-100 dark:text-white cursor-pointer active:scale-95 shadow-xl shadow-pink-500/15"}`}
          >
            <ShoppingCart size={12} />
            <span>Shop Now</span>
          </button>

          <button
            onClick={handleViewProduct}
            className="py-2.5 px-4 rounded-xl bg-transparent hover:bg-white/5 text-slate-100 dark:text-white font-extrabold text-[10px] uppercase tracking-widest transition-all cursor-pointer active:scale-95 border border-white/20 flex items-center justify-center gap-1.5 select-none"
          >
            <Eye size={12} />
            <span>View Product</span>
          </button>
        </div>
      </div>

      {/* RIGHT SHOWCASE AREA */}
      <div className="w-full sm:w-1/2 lg:w-full xl:w-1/2 h-60 sm:h-auto lg:h-52 xl:h-auto min-h-[220px] rounded-none relative overflow-hidden bg-gradient-to-br from-[#0c0f20] to-[#04050a] border border-white/[0.06] flex items-center justify-center shadow-inner group z-10">

        {/* Soft background spotlight glow */}
        <div className="absolute w-36 h-36 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Custom model image with clipPath to avoid borders */}
        <img
          src={finalModelImgUrl}
          alt="Campaign Visual"
          className="w-full h-full object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.03] select-none pointer-events-none animate-custom-float relative z-0"
          style={{ clipPath: "inset(3px)" }}
        />

        {/* Overlay gradient to keep elements legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none z-10" />

        {/* Floating discount badge (top-left) */}
        {discountLabel && (
          <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-orange-500 to-pink-500 text-slate-100 dark:text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full shadow-lg border border-white/20 animate-pulse select-none">
            {discountLabel}
          </div>
        )}

        {/* Floating rating badge (bottom-left) */}
        <div className="absolute bottom-3 left-3 z-20 bg-black/75 backdrop-blur-md border border-white/10 rounded-none px-2.5 py-1.5 shadow-xl scale-90">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-slate-100 dark:text-white text-[9px]">
              {dealProduct.averageRating || (typeof dealProduct.rating === "object" ? dealProduct.rating?.average : dealProduct.rating) || 4.8}
            </span>
          </div>
        </div>

        {/* Floating product thumbnail card (bottom-right) */}
        {finalProductImgUrl && (
          <div
            onClick={handleViewProduct}
            className="absolute bottom-3 right-3 z-20 bg-slate-950/80 backdrop-blur-md border border-white/10 p-1.5 rounded-none flex items-center gap-2 shadow-xl hover:border-orange-500/40 cursor-pointer transition select-none active:scale-95"
          >
            <img
              src={finalProductImgUrl}
              alt={dealProduct.name}
              className="w-7 h-7 object-contain bg-white dark:bg-slate-900 rounded-none p-0.5 border border-slate-200/50"
            />
            <div className="text-[7.5px] font-bold text-slate-100 dark:text-white leading-tight pr-1.5 flex flex-col justify-center text-left">
              <span className="opacity-60 text-[5.5px] uppercase font-black tracking-widest">Product</span>
              <span className="font-black truncate max-w-[70px]">{dealProduct.name}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default DealOfTheDay;
