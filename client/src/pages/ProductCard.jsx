import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { Star, Eye, ShoppingCart, Heart, BarChart2, Truck, CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useComparison } from "../context/ComparisonContext";
import { getAverageRating, getReviewCount } from "../utils/productRatings";
import { triggerFlyToCart } from "../utils/animation";

const ProductCard = ({ product, compact = false, onQuickView }) => {
  const [isBursting, setIsBursting] = useState(false);
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const token = localStorage.getItem("token") || "";
  const { addToCompare, removeFromCompare, isInCompare } = useComparison();

  const isComparing = isInCompare(product._id);

  useEffect(() => {
    setImgError(false);
    setImgIdx(0);
  }, [product]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("wishlist")) || [];
    setIsFavorite(list.includes(product._id));
  }, [product._id]);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    setIsBursting(true);
    setTimeout(() => setIsBursting(false), 450);
    if (token) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/wishlist/toggle`,
          { productId: product._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          setIsFavorite(!isFavorite);
          const updatedList = response.data.wishlist || [];
          localStorage.setItem("wishlist", JSON.stringify(updatedList));
          toast.success(!isFavorite ? "Added to wishlist" : "Removed from wishlist");
          window.dispatchEvent(new Event("wishlistUpdate"));
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      const list = JSON.parse(localStorage.getItem("wishlist")) || [];
      const index = list.indexOf(product._id);
      if (index === -1) {
        list.push(product._id);
        setIsFavorite(true);
        toast.success("Added to wishlist");
      } else {
        list.splice(index, 1);
        setIsFavorite(false);
        toast.success("Removed from wishlist");
      }
      localStorage.setItem("wishlist", JSON.stringify(list));
      window.dispatchEvent(new Event("wishlistUpdate"));
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isOOS) return;

    if (e.clientX && e.clientY) {
      triggerFlyToCart(e.clientX, e.clientY, getSrc(0));
    }

    const size = product.sizes?.length ? product.sizes[0] : "standard";

    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      const key = `${product._id}_${size}`;
      guestCart[key] = (guestCart[key] || 0) + 1;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      setTimeout(() => {
        window.dispatchEvent(new Event("cartUpdate"));
      }, 850);
      toast.success("Added to cart! 🛍️");
    } else {
      try {
        const res = await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId: product._id, size, qty: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setTimeout(() => {
            window.dispatchEvent(new Event("cartUpdate"));
          }, 850);
          toast.success("Added to cart! 🛍️");
        } else {
          toast.error(res.data.message);
        }
      } catch (err) {
        toast.error("Error adding to cart");
      }
    }
  };

  const averageRating = getAverageRating(product);
  const reviewCount = getReviewCount(product);

  // Filter out null/undefined/empty string images to prevent rendering broken image frames
  const images = (product.images?.length ? product.images : [product.image])
    .filter(Boolean)
    .map(s => s.trim())
    .filter(s => s !== "");

  const getSrc = (idx = 0) => {
    const s = images[idx] || images[0];
    if (!s) return "";
    if (s.startsWith("http")) return s;
    const cleanPath = s.startsWith("/") ? s.slice(1) : s;
    return `${backendUrl}/${cleanPath}`;
  };

  const isOOS = product.stock === 0;

  // Pricing calculations
  const originalVal = product.originalPrice || Math.round(product.price * 1.25);
  const discountPercent = Math.max(5, Math.round(((originalVal - product.price) / originalVal) * 100));

  const [deliveryEstimate, setDeliveryEstimate] = useState("");

  useEffect(() => {
    const updateEstimate = () => {
      const pCode = localStorage.getItem("delivery_pincode") || "";
      const loc = String(product.location || "Delhi").toLowerCase();

      if (!pCode) {
        if (loc === "delhi") setDeliveryEstimate("FREE Delivery Tomorrow");
        else if (loc === "mumbai") setDeliveryEstimate("FREE Delivery in 2 Days");
        else if (loc === "bangalore") setDeliveryEstimate("FREE Delivery in 3 Days");
        else setDeliveryEstimate("FREE Delivery in 4 Days");
        return;
      }

      if (pCode.startsWith("11") || pCode.startsWith("12") || pCode.startsWith("13") || pCode.startsWith("20")) {
        if (loc === "delhi") setDeliveryEstimate("⚡ Next-Day Delivery");
        else setDeliveryEstimate("📦 Delivery in 2 Days");
      } else if (pCode.startsWith("40") || pCode.startsWith("41") || pCode.startsWith("42") || pCode.startsWith("30")) {
        if (loc === "mumbai") setDeliveryEstimate("⚡ Next-Day Delivery");
        else setDeliveryEstimate("📦 Delivery in 2 Days");
      } else if (pCode.startsWith("56") || pCode.startsWith("57") || pCode.startsWith("60")) {
        if (loc === "bangalore") setDeliveryEstimate("⚡ Next-Day Delivery");
        else setDeliveryEstimate("📦 Delivery in 2-3 Days");
      } else {
        setDeliveryEstimate("📦 Delivery in 3-5 Days");
      }
    };

    updateEstimate();
    window.addEventListener("pincodeUpdated", updateEstimate);
    return () => window.removeEventListener("pincodeUpdated", updateEstimate);
  }, [product.location]);

  // Add listener for global wishlist updates to keep card state synchronized
  useEffect(() => {
    const updateFav = () => {
      const list = JSON.parse(localStorage.getItem("wishlist")) || [];
      setIsFavorite(list.includes(product._id));
    };
    updateFav();
    window.addEventListener("wishlistUpdate", updateFav);
    return () => window.removeEventListener("wishlistUpdate", updateFav);
  }, [product._id]);

  const hasImage = images.length > 0 && getSrc(0) !== "";
  const showSlider = images.length > 1;

  const prevIdx = (imgIdx - 1 + images.length) % images.length;
  const nextIdx = (imgIdx + 1) % images.length;

  return (
    <div
      onClick={() => {
        try {
          const list = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
          const next = [product._id, ...list.filter(id => id !== product._id)].slice(0, 8);
          localStorage.setItem("recently_viewed", JSON.stringify(next));
        } catch (e) { }
        navigate(`/product/${product._id}`);
      }}
      className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-md border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer text-left w-full h-full animate-fadeIn"
    >
      
      {/* Category Promo discount header row (Matches top of mockup card) */}
      <div className="px-4 pt-4 pb-2 text-left select-none">
        <h2 className="text-[14px] font-extrabold text-slate-900 dark:text-white tracking-tight line-clamp-2 leading-tight">
          Up to {discountPercent}% off | {product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase() : "Products"}, {product.brand || "CartNOW"} & more | CartNOW...
        </h2>
      </div>

      {/* Image Slider container with peek previews on sides (exactly like mockup) */}
      <div className="relative w-full h-[250px] bg-white dark:bg-slate-900 flex items-center justify-between px-3 select-none overflow-hidden group/slider border-b border-slate-100/50 dark:border-slate-800/50">

        {!hasImage || imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-955 text-slate-400 p-4 rounded-md">
            <Sparkles size={24} className="text-slate-400 animate-pulse mb-1" />
            <span className="text-[8px] uppercase tracking-widest font-black text-slate-500">No Image</span>
          </div>
        ) : showSlider ? (
          <>
            {/* Left Peek Image Preview with chevron arrow */}
            <div 
              onClick={(e) => { e.stopPropagation(); setImgIdx(prevIdx); }}
              className="w-[14%] h-[180px] opacity-35 hover:opacity-50 transition-all duration-300 flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-md p-1 scale-95 overflow-hidden relative cursor-pointer"
            >
              <img src={getSrc(prevIdx)} className="max-h-full max-w-full object-contain" alt="" />
              <div className="absolute inset-0 bg-black/5 flex items-center justify-end pr-0.5 text-slate-700 dark:text-white">
                <ChevronLeft className="h-6 w-6 stroke-[2]" />
              </div>
            </div>

            {/* Active Center Image Panel */}
            <div className="w-[66%] h-[210px] z-10 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-md p-2.5 shadow-sm relative">
              <img src={getSrc(imgIdx)} className="max-h-full max-w-full object-contain" alt="" onError={() => setImgError(true)} />
              
              {/* Wishlist Button Overlay */}
              <button
                type="button"
                onClick={toggleFavorite}
                className="absolute top-2.5 right-2.5 h-7 w-7 bg-white/95 dark:bg-slate-900/95 rounded-full flex items-center justify-center shadow-xs cursor-pointer transition-all duration-200 active:scale-90 z-30 border-none"
              >
                <Heart
                  size={12}
                  className={`transition-colors duration-300 ${ isFavorite ? "text-rose-500 fill-rose-500 stroke-none" : "text-slate-500 dark:text-slate-400 hover:text-rose-500" } ${isBursting ? "heart-burst" : ""}`}
                />
              </button>

              {/* Compare Overlay Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isComparing) {
                    removeFromCompare(product._id);
                  } else {
                    addToCompare(product);
                  }
                }}
                className={`absolute top-10.5 right-2.5 h-7 w-7 backdrop-blur-md rounded-full flex items-center justify-center shadow-xs z-30 cursor-pointer transition-all duration-200 active:scale-90 ${isComparing ? "bg-indigo-600 border-none text-white" : "bg-white/95 dark:bg-slate-900/95 border-none text-slate-500 dark:text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20" }`}
                title="Compare product"
              >
                <BarChart2 size={12} className={isComparing ? "stroke-[2.5px]" : ""} />
              </button>

              {/* Dynamic slider indicator dots inside center card */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                {images.map((_, i) => (
                  <span 
                    key={i} 
                    className={`w-1 h-1 rounded-full transition-all duration-300 ${i === imgIdx ? "bg-indigo-600 w-2.5" : "bg-slate-200"}`} 
                  />
                ))}
              </div>
            </div>

            {/* Right Peek Image Preview with chevron arrow */}
            <div 
              onClick={(e) => { e.stopPropagation(); setImgIdx(nextIdx); }}
              className="w-[14%] h-[180px] opacity-35 hover:opacity-50 transition-all duration-300 flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-md p-1 scale-95 overflow-hidden relative cursor-pointer"
            >
              <img src={getSrc(nextIdx)} className="max-h-full max-w-full object-contain" alt="" />
              <div className="absolute inset-0 bg-black/5 flex items-center justify-start pl-0.5 text-slate-700 dark:text-white">
                <ChevronRight className="h-6 w-6 stroke-[2]" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 bg-white dark:bg-slate-900 relative">
            <img src={getSrc(0)} className="max-h-full max-w-full object-contain p-2" alt="" onError={() => setImgError(true)} />

            {/* Wishlist Button Overlay */}
            <button
              type="button"
              onClick={toggleFavorite}
              className="absolute top-3 right-3 h-7 w-7 bg-white/95 dark:bg-slate-900/95 rounded-full flex items-center justify-center shadow-xs cursor-pointer transition-all duration-200 active:scale-90 z-30 border-none"
            >
              <Heart
                size={12}
                className={`transition-colors duration-300 ${ isFavorite ? "text-rose-500 fill-rose-500 stroke-none" : "text-slate-500 dark:text-slate-400 hover:text-rose-500" } ${isBursting ? "heart-burst" : ""}`}
              />
            </button>

            {/* Compare Overlay Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isComparing) {
                  removeFromCompare(product._id);
                } else {
                  addToCompare(product);
                }
              }}
              className={`absolute top-11 right-3 h-7 w-7 backdrop-blur-md rounded-full flex items-center justify-center shadow-xs z-30 cursor-pointer transition-all duration-200 active:scale-90 ${isComparing ? "bg-indigo-600 border-none text-white" : "bg-white/95 dark:bg-slate-900/95 border-none text-slate-500 dark:text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20" }`}
              title="Compare product"
            >
              <BarChart2 size={12} className={isComparing ? "stroke-[2.5px]" : ""} />
            </button>
          </div>
        )}
      </div>

      {/* Info Card Content */}
      <div className="flex flex-col flex-1 p-4 gap-2.5 bg-white dark:bg-slate-900">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500">
            {product.brand || "CartNOW"}
          </span>
          <h3 className="font-bold text-[13px] text-slate-800 dark:text-slate-200 line-clamp-2 min-h-[38px] leading-snug group-hover:text-indigo-600 transition-colors duration-200 mt-0.5">
            {product.name}
          </h3>
        </div>

        {/* Pricing block with superscript 00 decimals (Exactly matches mockup design) */}
        <div className="flex items-baseline gap-2 select-none leading-none">
          <div className="flex items-start text-slate-955 dark:text-white leading-none font-sans font-black">
            <span className="text-[10px] mt-0.5 mr-0.5 font-bold">₹</span>
            <span className="text-xl tracking-tight leading-none">{Math.floor(product.price)}</span>
            <span className="text-[10px] mt-0.5 ml-0.5 font-bold">00</span>
          </div>
          {originalVal > product.price && (
            <div className="text-[10px] text-slate-450 dark:text-slate-500 font-bold flex items-center gap-0.5 leading-none">
              <span>M.R.P.:</span>
              <span className="line-through">₹{originalVal.toLocaleString("en-IN")}.00</span>
              <span className="ml-1 text-rose-500 dark:text-rose-400 font-black">({discountPercent}% OFF)</span>
            </div>
          )}
        </div>

        {/* Ratings and reviews verified bar */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
          <Star size={11} className="fill-amber-500 text-amber-500 stroke-none" />
          <span className="font-extrabold text-slate-800 dark:text-slate-200">{averageRating.toFixed(1)}</span>
          <span className="text-slate-200 dark:text-slate-800">|</span>
          <span className="font-semibold">({reviewCount} reviews)</span>
          
          <div className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-extrabold ml-auto">
            <CheckCircle2 size={11} className="fill-emerald-600 text-white dark:fill-emerald-400 dark:text-slate-900 shrink-0 stroke-[2.5]" />
            <span className="text-[9px]">Verified</span>
          </div>
        </div>

        {/* Shipping Text */}
        <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 select-none">
          <Truck size={12} className="shrink-0" />
          <span>{deliveryEstimate}</span>
        </div>

        {/* Action button triggers */}
        <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            disabled={isOOS}
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-sm text-[10px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer border-none ${isOOS ? "bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-655 cursor-not-allowed" : "bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-3xs"}`}
          >
            <ShoppingCart size={11} className="stroke-[2.5]" />
            <span>{isOOS ? "Sold Out" : "Add to Cart"}</span>
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickView) onQuickView(product);
            }}
            className="h-8 w-8 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-sm flex items-center justify-center text-slate-600 dark:text-slate-300 transition duration-150 active:scale-95 border-none cursor-pointer"
            title="Quick View"
          >
            <Eye size={12} className="stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
