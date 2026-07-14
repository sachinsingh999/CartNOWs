import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { Star, Eye, ShoppingCart, Heart, BarChart2, Truck, Sparkles, CheckCircle2 } from "lucide-react";
import { useComparison } from "../context/ComparisonContext";
import { getAverageRating, getReviewCount } from "../utils/productRatings";

const HomeProductCard = ({ product, onQuickView }) => {
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);
  const token = localStorage.getItem("token") || "";
  const { addToCompare, removeFromCompare, isInCompare } = useComparison();

  const isComparing = isInCompare(product._id);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem("wishlist")) || [];
      setIsFavorite(list.includes(product._id));
    } catch (e) {
      console.error(e);
    }
  }, [product._id]);

  useEffect(() => {
    setImgError(false);
    setImgIdx(0);
  }, [product]);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
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
          toast.success(!isFavorite ? "Added to wishlist ❤️" : "Removed from wishlist");
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
        toast.success("Added to wishlist ❤️");
      } else {
        list.splice(index, 1);
        setIsFavorite(false);
        toast.success("Removed from wishlist");
      }
      localStorage.setItem("wishlist", JSON.stringify(list));
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isOOS) return;

    const size = product.sizes?.length ? product.sizes[0] : "standard";

    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      const key = `${product._id}_${size}`;
      guestCart[key] = (guestCart[key] || 0) + 1;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      window.dispatchEvent(new Event("cartUpdate"));
      toast.success("Added to cart! 🛍️");
    } else {
      try {
        const res = await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId: product._id, size, qty: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          window.dispatchEvent(new Event("cartUpdate"));
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
  const images = product.images?.length ? product.images : [product.image].filter(Boolean);

  const getSrc = (idx = 0) => {
    const s = images[idx] || images[0];
    if (!s) return "";
    return s?.startsWith("http") ? s : `${backendUrl}/${s}`;
  };

  const isOOS = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

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

  const hasImage = images.length > 0 && getSrc(0) !== "";

  return (
    <div
      onMouseEnter={() => !imgError && images[1] && setImgIdx(1)}
      onMouseLeave={() => !imgError && setImgIdx(0)}
      onClick={() => {
        try {
          const list = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
          const next = [product._id, ...list.filter(id => id !== product._id)].slice(0, 8);
          localStorage.setItem("recently_viewed", JSON.stringify(next));
        } catch (e) { }
        navigate(`/product/${product._id}`);
      }}
      className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-none border border-slate-100 dark:border-slate-800/80 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out cursor-pointer text-left w-full h-full"
    >
      {/* 300px centered white image container */}
      <div className="relative w-full h-[280px] bg-white dark:bg-slate-900 flex items-center justify-center p-6 border-b border-slate-50 select-none">
        
        {/* Wishlist Button */}
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute top-4 right-4 h-9 w-9 bg-white/95 dark:bg-slate-900/95 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-pointer transition-all duration-200 active:scale-90 z-30 border-none"
        >
          <Heart
            size={16}
            className={`transition-colors duration-300 ${ isFavorite ? "text-rose-500 fill-rose-500" : "text-slate-600 dark:text-slate-400 hover:text-rose-500" }`}
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
          className={`absolute top-15 right-4 h-9 w-9 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] z-30 cursor-pointer transition-all duration-200 active:scale-90 ${isComparing ? "bg-indigo-600 border-none text-white" : "bg-white/95 dark:bg-slate-900/95 border-none text-slate-500 dark:text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20" }`}
          title="Compare product"
        >
          <BarChart2 size={14} className={isComparing ? "stroke-[2.5px]" : ""} />
        </button>

        {/* Discount Badge */}
        <span className="absolute top-4 left-4 px-2.5 py-1 text-[10px] font-black text-slate-100 dark:text-white bg-[#ff3b30] rounded-md z-30 uppercase tracking-wide">
          -{discountPercent}% OFF
        </span>

        {/* Product Image - Contain aspect ratio, no crop, no zoom */}
        {!hasImage || imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 p-4 rounded-xl">
            <Sparkles size={24} className="text-slate-400 animate-pulse mb-1" />
            <span className="text-[8px] uppercase tracking-widest font-black text-slate-500">No Image</span>
          </div>
        ) : (
          <img
            src={getSrc(imgIdx)}
            alt=""
            onError={() => setImgError(true)}
            loading="lazy"
            className="max-h-full max-w-full object-contain p-2"
          />
        )}

        {/* Mock/Dynamic slider indicator dots under image */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-2.5 bg-white dark:bg-slate-900">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500">
            {product.brand || "CartNOW"}
          </span>
          <h3 className="font-bold text-[14.5px] text-slate-900 dark:text-slate-600 line-clamp-2 min-h-[38px] leading-snug group-hover:text-blue-600 transition-colors duration-200 mt-0.5">
            {product.name}
          </h3>
        </div>

        {/* Rating Row with divider and green Verified badge */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          <Star size={13} className="fill-amber-500 text-amber-500 stroke-none" />
          <span className="font-extrabold text-slate-800 dark:text-slate-200">{averageRating.toFixed(1)}</span>
          <span className="text-slate-200 dark:text-slate-800">|</span>
          <span className="text-slate-500 dark:text-slate-500 font-medium">
            ({reviewCount || 0} reviews)
          </span>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold ml-auto">
            <CheckCircle2 size={13} className="fill-emerald-600 text-slate-100 dark:text-white dark:fill-emerald-400 dark:text-slate-900 shrink-0 stroke-[2.5]" />
            <span className="text-[11px]">Verified</span>
          </div>
        </div>

        {/* Price Row: main price, original line-through and discount label */}
        <div className="flex flex-col gap-0.5 mt-1">
          <span className="text-xl font-black text-slate-900 dark:text-slate-500 tracking-tight">
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

        {/* Green pill delivery estimate */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-black w-fit mt-1 select-none">
          <Truck size={13} className="shrink-0" />
          <span>{deliveryEstimate}</span>
        </div>

        {/* Side-by-side action buttons: Left Add to Cart, Right Quick View */}
        <div className="flex items-center gap-3 mt-3 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            disabled={isOOS}
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[11px] font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer border-none ${isOOS ? "bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-slate-100 dark:text-white shadow-sm" }`}
          >
            <ShoppingCart size={13} />
            <span>{isOOS ? "Sold Out" : "Add to Cart"}</span>
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickView) onQuickView(product);
            }}
            className="h-11 w-11 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer shrink-0 active:scale-95 border border-slate-100 dark:border-slate-800"
            title="Quick View"
          >
            <Eye size={16} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeProductCard;
