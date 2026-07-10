import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { Star, Eye, ShoppingCart, Heart, BarChart2, Truck, CheckCircle2 } from "lucide-react";
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

  const savingsAmount = originalVal - product.price;

  return (
    <div
      onMouseEnter={() => images[1] && setImgIdx(1)}
      onMouseLeave={() => setImgIdx(0)}
      onClick={() => {
        try {
          const list = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
          const next = [product._id, ...list.filter(id => id !== product._id)].slice(0, 8);
          localStorage.setItem("recently_viewed", JSON.stringify(next));
        } catch (e) { }
        navigate(`/product/${product._id}`);
      }}
      className="group relative flex flex-col bg-white dark:bg-slate-900 overflow-hidden hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer text-left w-full h-full"
    >
      {/* Image Section */}
      <div className="relative w-full h-[290px] bg-slate-50 dark:bg-slate-950 flex items-center justify-center select-none overflow-hidden">

        {/* Discount Tag on Top Left (Matches screenshot: -30%) */}
        {originalVal > product.price && (
          <div className="absolute top-3 left-3 bg-[#F43F5E] text-slate-100 dark:text-white px-2 py-0.5 rounded-[4px] text-[10px] font-black tracking-tighter z-10 shadow-xs">
            -{discountPercent}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute top-3 right-3 h-8 w-8 bg-white/90 dark:bg-slate-900/90 rounded-full flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 active:scale-95 z-10"
        >
          <Heart
            size={14}
            className={`transition-colors duration-300 ${isFavorite ? "text-rose-500 fill-rose-500 stroke-none" : "text-slate-500 dark:text-slate-400 hover:text-rose-500"}`}
          />
        </button>

        {/* Dynamic Rating Overlay (Myntra Style: 4.3 ★ | 1.5k) */}
        {averageRating > 0 && (
          <div className="absolute bottom-2.5 left-2.5 bg-white/90 dark:bg-slate-900/90 px-1.5 py-0.5 rounded-[2px] text-[10px] font-black text-slate-800 dark:text-slate-200 flex items-center gap-1 z-10 shadow-xs border border-slate-200/20">
            <span>{averageRating.toFixed(1)}</span>
            <span className="text-[9px] text-teal-600 dark:text-teal-400">★</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400 font-bold">
              {reviewCount > 999 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount || "0"}
            </span>
          </div>
        )}

        {/* Dual Product Image - Smooth cross-fade secondary image swap & zoom hover */}
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={getSrc(0)}
            alt={product.name}
            loading="lazy"
            className={`max-h-full max-w-full object-cover w-full h-full transition-all duration-500 ease-out ${images[1] && imgIdx === 1 ? "opacity-0" : "opacity-100"}`}
          />
          {images[1] && (
            <img
              src={getSrc(1)}
              alt={`${product.name}-alt`}
              loading="lazy"
              className={`absolute max-h-full max-w-full object-cover w-full h-full transition-all duration-500 ease-out ${imgIdx === 1 ? "opacity-100" : "opacity-0"}`}
            />
          )}
        </div>

        {/* Quick Actions Hover Drawer (Slides up from bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-slate-900/70 to-transparent backdrop-blur-xs flex items-center justify-center gap-2 z-10 select-none">
          <button
            type="button"
            disabled={isOOS}
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[9px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer border-none ${isOOS ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-slate-100 dark:text-white shadow-sm"}`}
          >
            <ShoppingCart size={10} className="stroke-[2.5]" />
            <span>{isOOS ? "Sold Out" : "Add to Cart"}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickView) onQuickView(product);
            }}
            className="h-7 w-7 bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 backdrop-blur-md rounded flex items-center justify-center shadow-sm hover:bg-indigo-600 hover:text-white transition-all duration-200 cursor-pointer active:scale-90 border border-slate-200/20"
            title="Quick View"
          >
            <Eye size={11} className="stroke-[2.5]" />
          </button>

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
            className={`h-7 w-7 backdrop-blur-md rounded flex items-center justify-center shadow-sm cursor-pointer transition-all duration-200 active:scale-90 border border-slate-200/20 ${isComparing ? "bg-indigo-600 border-none text-white" : "bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white"}`}
            title="Compare product"
          >
            <BarChart2 size={11} className={isComparing ? "stroke-[2.5]" : ""} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-3 gap-1 bg-white dark:bg-slate-900 justify-between">
        <div>
          {/* Brand Name */}
          <h4 className="font-extrabold text-[13px] text-slate-900 dark:text-slate-100 truncate uppercase tracking-tight">
            {product.brand || "CartNOW"}
          </h4>
          {/* Product Name */}
          <p className="text-[11.5px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
            {product.name}
          </p>

          {/* Pricing Layout: Rs. price formatting replaced with Rupee symbol */}
          <div className="flex items-baseline gap-1.5 flex-wrap pt-0.5">
            <span className="text-[12.5px] font-black text-slate-900 dark:text-slate-50">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            {originalVal > product.price && (
              <>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through font-medium">
                  ₹{originalVal.toLocaleString("en-IN")}
                </span>
                <span className="hidden sm:inline text-[9.5px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-tight">
                  ({discountPercent}% OFF)
                </span>
              </>
            )}
          </div>

          {/* Low Stock Warning or Status info */}
          {(isLowStock || isOOS) && (
            <div className="text-[9.5px] font-extrabold text-rose-500 mt-0.5">
              {isOOS ? "Only Out of Stock!" : "Only Few Left!"}
            </div>
          )}
        </div>

        {/* Mobile-only Add to Cart Button (Always Visible at bottom of card) */}
        <button
          type="button"
          disabled={isOOS}
          onClick={handleAddToCart}
          className={`sm:hidden mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer border-none select-none z-10 ${isOOS ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed" : "bg-[#F43F5E] text-slate-100 dark:text-white shadow-sm shadow-[#F43F5E]/10"}`}
        >
          <ShoppingCart size={11} className="stroke-[2.5]" />
          <span>{isOOS ? "Sold Out" : "Add to Cart"}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
