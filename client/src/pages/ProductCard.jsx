import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { Star, Eye, ShoppingCart, Heart, BarChart2 } from "lucide-react";
import { useComparison } from "../context/ComparisonContext";
import { getAverageRating, getReviewCount } from "../utils/productRatings";

const ProductCard = ({ product, compact = false, onQuickView }) => {
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const token = localStorage.getItem("token") || "";
  const { addToCompare, removeFromCompare, isInCompare } = useComparison();

  const isComparing = isInCompare(product._id);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("wishlist")) || [];
    setIsFavorite(list.includes(product._id));
  }, [product._id]);

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
          toast.success(!isFavorite ? "Added to wishlist" : "Removed from wishlist");
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
    return s?.startsWith("http") ? s : `${backendUrl}/${s}`;
  };

  const isOOS = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Pricing calculations
  const originalVal = product.originalPrice || Math.round(product.price * 1.25);
  const discountPercent = Math.max(5, Math.round(((originalVal - product.price) / originalVal) * 100));
  const emiAmount = Math.round(product.price / 12);

  // Dynamic delivery estimate based on geographic location
  const getDeliveryEstimate = () => {
    const loc = String(product.location || "Delhi").toLowerCase();
    if (loc === "delhi") return "FREE Delivery by Tomorrow";
    if (loc === "mumbai") return "FREE Delivery in 2 Days";
    if (loc === "bangalore") return "FREE Delivery in 3 Days";
    return "FREE Delivery in 4 Days";
  };

  return (
    <div
      onMouseEnter={() => images[1] && setImgIdx(1)}
      onMouseLeave={() => setImgIdx(0)}
      onClick={() => navigate(`/product/${product._id}`)}
      className="group flex flex-col bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:shadow-xl hover:border-indigo-500/25 dark:hover:border-indigo-500/20 transition-all duration-350 cursor-pointer text-left relative"
    >
      {/* Image Container with strict aspect-square */}
      <div className="aspect-square relative w-full overflow-hidden bg-slate-50 dark:bg-slate-950/40 flex items-center justify-center">
        <img
          src={getSrc(imgIdx)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-4.5 transition-all duration-300"
        />

        {/* Heart Favorite Button */}
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute top-3 right-3 h-8 w-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/40 dark:border-slate-800 rounded-full flex items-center justify-center shadow-md z-10 cursor-pointer transition hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Save to favorites"
        >
          <Heart
            size={13}
            className={`transition duration-150 ${
              isFavorite ? "text-rose-500 fill-rose-500 scale-110" : "text-slate-400 hover:text-rose-500"
            }`}
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
          className={`absolute top-12 right-3 h-8 w-8 backdrop-blur-md border rounded-full flex items-center justify-center shadow-md z-10 cursor-pointer transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
            isComparing
              ? "bg-indigo-600 border-indigo-500 text-white"
              : "bg-white/90 dark:bg-slate-900/90 border-slate-200/40 dark:border-slate-800 text-slate-400 hover:text-indigo-600"
          }`}
          title="Compare product"
        >
          <BarChart2 size={13} className={isComparing ? "stroke-[2.5px]" : ""} />
        </button>

        {/* Badges Overlays */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          <span className="px-2 py-0.5 text-[8px] font-black tracking-widest uppercase text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded border border-slate-200/60 dark:border-slate-800">
            {discountPercent}% OFF
          </span>
          {isOOS ? (
            <span className="px-2 py-0.5 text-[8px] font-black tracking-widest uppercase text-white bg-rose-500 rounded shadow-sm animate-pulse">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 text-[8px] font-black tracking-widest uppercase text-white bg-amber-500 rounded shadow-sm">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>

        {/* Origin Hub badge */}
        <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[8.5px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/80 backdrop-blur-md border border-indigo-200/50 dark:border-indigo-900/40 rounded uppercase tracking-wider">
          {product.location || "Delhi"} Hub
        </span>

        {/* Quick View Glassmorphic Banner */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (onQuickView) onQuickView(product);
          }}
          className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10 cursor-pointer"
        >
          <div className="flex h-9 w-full items-center justify-center gap-1 rounded-xl bg-slate-950/85 hover:bg-slate-950 dark:bg-slate-950/85 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-wider text-white transition-all duration-200">
            <Eye size={12} />
            Quick View
          </div>
        </div>
      </div>

      {/* Product Card Body */}
      <div className="flex flex-col flex-1 p-4 gap-2 bg-white dark:bg-transparent">
        {/* Brand / Collection */}
        <p className="text-[10px] font-black tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
          {product.brand || "CartNOW Apparel"}
        </p>

        {/* Title */}
        <p className="font-bold text-[13px] text-slate-800 dark:text-slate-100 line-clamp-2 min-h-[36px] leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
          {product.name}
        </p>

        {/* Rating Line */}
        <div className="flex items-center gap-1 text-[11px] mt-0.5">
          <div className="flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded-md text-amber-500 font-extrabold">
            <Star size={11} className="fill-amber-500 stroke-none" />
            <span>{averageRating ? averageRating.toFixed(1) : "New"}</span>
          </div>
          <span className="text-slate-400 dark:text-slate-500 font-bold">
            ({reviewCount || 0} reviews)
          </span>
        </div>

        {/* Pricing details */}
        <div className="flex flex-col gap-0.5 mt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[17px] font-black text-slate-900 dark:text-slate-100 tracking-tight">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through">
              ₹{originalVal.toLocaleString("en-IN")}
            </span>
          </div>
          <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500">
            {getDeliveryEstimate()}
          </span>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product._id}`);
            }}
            className="py-2.5 text-[10.5px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-350 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 active:scale-95 transition-all duration-200 rounded-xl cursor-pointer"
          >
            Details
          </button>
          <button
            type="button"
            disabled={isOOS}
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-1 py-2.5 text-[10.5px] font-black uppercase tracking-wider rounded-xl transition-all duration-205 active:scale-95 cursor-pointer ${
              isOOS
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200/50 dark:border-slate-800/50"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow border border-indigo-500/20"
            }`}
          >
            <ShoppingCart size={11} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
