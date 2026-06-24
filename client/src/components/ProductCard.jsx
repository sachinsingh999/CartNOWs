import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../config";
import { motion } from "framer-motion";
import {
  Truck,
  Heart,
  Eye,
  Star,
  CheckCircle2,
  ShoppingCart,
  Sparkles
} from "lucide-react";
import { getAverageRating, getReviewCount } from "../utils/productRatings";

const ProductCard = ({ product, onQuickView, onAddToCart, onToggleFavorite, isFavorite }) => {
  const navigate = useNavigate();
  const images = product.images?.length ? product.images : [product.image].filter(Boolean);
  const originalVal = product.originalPrice || Math.round(product.price * 1.25);
  const discountPercent = Math.max(5, Math.round(((originalVal - product.price) / originalVal) * 100));
  
  // Safe parsing of reviews and ratings to avoid crashes with mixed API and mock schemas
  const avgRating = typeof product.rating === 'number' ? product.rating : (getAverageRating(product) || 4.5);
  const reviews = typeof product.reviewCount === 'number' ? product.reviewCount : (getReviewCount(product) || 12);

  const getSrc = () => {
    const s = images[0] || "";
    if (!s) return "";
    return s.startsWith("http") ? s : `${backendUrl}/${s}`;
  };

  const [deliveryEstimate, setDeliveryEstimate] = useState("");

  useEffect(() => {
    const updateEstimate = () => {
      const pCode = localStorage.getItem("delivery_pincode") || "";
      const loc = String(product.location || "Delhi").toLowerCase();

      if (!pCode) {
        if (loc === "delhi") setDeliveryEstimate("Free Delivery Tomorrow");
        else if (loc === "mumbai") setDeliveryEstimate("Free Delivery in 2 Days");
        else if (loc === "bangalore") setDeliveryEstimate("Free Delivery in 3 Days");
        else setDeliveryEstimate("Free Delivery in 4 Days");
        return;
      }

      if (pCode.startsWith("11") || pCode.startsWith("12") || pCode.startsWith("13") || pCode.startsWith("20")) {
        if (loc === "delhi") setDeliveryEstimate("Free Delivery Tomorrow");
        else setDeliveryEstimate("Free Delivery in 2 Days");
      } else if (pCode.startsWith("40") || pCode.startsWith("41") || pCode.startsWith("42") || pCode.startsWith("30")) {
        if (loc === "mumbai") setDeliveryEstimate("Free Delivery Tomorrow");
        else setDeliveryEstimate("Free Delivery in 2 Days");
      } else if (pCode.startsWith("56") || pCode.startsWith("57") || pCode.startsWith("60")) {
        if (loc === "bangalore") setDeliveryEstimate("Free Delivery Tomorrow");
        else setDeliveryEstimate("Free Delivery in 2-3 Days");
      } else {
        setDeliveryEstimate("Free Delivery in 3-5 Days");
      }
    };

    updateEstimate();
    window.addEventListener("pincodeUpdated", updateEstimate);
    return () => window.removeEventListener("pincodeUpdated", updateEstimate);
  }, [product.location]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100/80 dark:border-slate-800/80 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.012)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-350 ease-out cursor-pointer text-left w-full h-full"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      {/* Centered white image container */}
      <div className="relative w-full h-[280px] bg-slate-50/40 dark:bg-slate-950/20 flex items-center justify-center p-6 border-b border-slate-50 dark:border-slate-800/50 select-none overflow-hidden">
        
        {/* Soft reflection light effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product._id);
          }}
          className="absolute top-4 right-4 h-9 w-9 bg-white/95 dark:bg-slate-800/95 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_20px_rgba(244,63,94,0.25)] hover:scale-110 cursor-pointer transition-all duration-250 active:scale-90 z-30 border border-slate-100 dark:border-slate-700/50"
        >
          <Heart
            size={14}
            className={`transition-colors duration-300 ${
              isFavorite ? "text-rose-500 fill-rose-500" : "text-slate-400 dark:text-slate-500 hover:text-rose-500"
            }`}
          />
        </button>

        {/* Discount Badge */}
        <span className="absolute top-4 left-4 px-2.5 py-1 text-[9px] font-black text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-lg z-30 uppercase tracking-widest shadow-md">
          {discountPercent}% OFF
        </span>

        {/* Product Image */}
        {!getSrc() ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 p-4 rounded-xl">
            <Sparkles size={24} className="text-slate-350 dark:text-slate-650 animate-pulse mb-1" />
            <span className="text-[8px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">No Image</span>
          </div>
        ) : (
          <img
            src={getSrc()}
            alt=""
            loading="lazy"
            className="max-h-full max-w-full object-contain p-2 group-hover:scale-[1.06] transition-transform duration-500 ease-out"
          />
        )}

        {/* Interactive Indicator Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 transition-all duration-300 group-hover:w-3" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3 bg-white dark:bg-slate-900">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-extrabold tracking-widest uppercase text-blue-600 dark:text-blue-400">
            {product.brand || "CartNOW"}
          </span>
          <h3 className="font-extrabold text-[14px] text-slate-850 dark:text-slate-100 line-clamp-2 min-h-[38px] leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 mt-0.5">
            {product.name}
          </h3>
        </div>

        {/* Rating Row with divider and Verified badge */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          <Star size={12} className="fill-amber-500 text-amber-500 stroke-none" />
          <span className="font-extrabold text-slate-800 dark:text-slate-200">{avgRating.toFixed(1)}</span>
          <span className="text-slate-200 dark:text-slate-800">|</span>
          <span className="text-slate-400 dark:text-slate-500 font-bold">
            ({reviews >= 1000 ? `${(reviews/1000).toFixed(1)}k` : reviews})
          </span>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold ml-auto">
            <CheckCircle2 size={12} className="fill-emerald-600 text-white dark:fill-emerald-400 dark:text-slate-900 shrink-0 stroke-[2.5]" />
            <span className="text-[9px] font-black uppercase tracking-wider">Verified</span>
          </div>
        </div>

        {/* Price Row */}
        <div className="flex flex-col gap-0.5 mt-1">
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 dark:text-slate-500 line-through font-medium">
              ₹{originalVal.toLocaleString("en-IN")}
            </span>
            <span className="text-emerald-500 dark:text-emerald-400 font-extrabold">
              {discountPercent}% OFF
            </span>
          </div>
        </div>

        {/* Delivery Estimate */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider w-fit mt-1 select-none border border-emerald-500/10">
          <Truck size={12} className="shrink-0" />
          <span>{deliveryEstimate}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-50 text-white dark:text-slate-900 font-extrabold text-[11px] uppercase tracking-widest transition-all duration-200 cursor-pointer shadow-sm active:scale-95 border-none"
          >
            <ShoppingCart size={13} />
            <span>Add to Cart</span>
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="h-11 w-11 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-full flex items-center justify-center shadow-inner transition-all duration-200 cursor-pointer shrink-0 active:scale-95 border border-slate-200/40 dark:border-slate-700"
            title="Quick View"
          >
            <Eye size={15} className="text-slate-600 dark:text-slate-350" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
