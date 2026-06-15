import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { Star, Eye, ShoppingCart, Heart, BarChart2, Truck } from "lucide-react";
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

  return (
    <div
      onMouseEnter={() => images[1] && setImgIdx(1)}
      onMouseLeave={() => setImgIdx(0)}
      onClick={() => {
        try {
          const list = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
          const next = [product._id, ...list.filter(id => id !== product._id)].slice(0, 8);
          localStorage.setItem("recently_viewed", JSON.stringify(next));
        } catch (e) {}
        navigate(`/product/${product._id}`);
      }}
      className="group flex flex-col bg-white dark:bg-slate-900/30 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 overflow-hidden hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-all duration-300 cursor-pointer text-left relative"
    >
      {/* Image Container with portrait ratio */}
      <div className="aspect-[3/4] relative w-full overflow-hidden bg-slate-50/70 dark:bg-slate-950/20 flex items-center justify-center">
        <img
          src={getSrc(imgIdx)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />

        {/* Heart Favorite Button with click spring feedback */}
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute top-3.5 right-3.5 h-8.5 w-8.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center shadow-md z-10 cursor-pointer transition-all active:scale-90 hover:scale-105"
          title="Save to favorites"
        >
          <Heart
            size={14}
            className={`transition-all duration-300 ${
              isFavorite ? "text-rose-500 fill-rose-500 scale-110 animate-bounce" : "text-slate-400 hover:text-rose-500"
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
          className={`absolute top-13 right-3.5 h-8.5 w-8.5 backdrop-blur-md border rounded-full flex items-center justify-center shadow-md z-10 cursor-pointer transition-all active:scale-90 hover:scale-105 ${
            isComparing
              ? "bg-indigo-600 border-indigo-500 text-white"
              : "bg-white/95 dark:bg-slate-900/95 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600"
          }`}
          title="Compare product"
        >
          <BarChart2 size={13} className={isComparing ? "stroke-[2.5px]" : ""} />
        </button>

        {/* Badges Overlays */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
          <span className="px-2.5 py-0.5 text-[8.5px] font-black tracking-wider uppercase text-white bg-orange-500 rounded-lg shadow-sm">
            {discountPercent}% OFF
          </span>
          {averageRating >= 4.5 && (
            <span className="px-2.5 py-0.5 text-[8.5px] font-black tracking-wider uppercase text-slate-800 dark:text-slate-100 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-200/50 dark:border-slate-800">
              🔥 Bestseller
            </span>
          )}
          {isOOS ? (
            <span className="px-2.5 py-0.5 text-[8.5px] font-black tracking-wider uppercase text-white bg-red-650 rounded-lg shadow-sm animate-pulse">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-0.5 text-[8.5px] font-black tracking-wider uppercase text-white bg-amber-500 rounded-lg shadow-sm">
              Only {product.stock} Left
            </span>
          ) : (
            <span className="px-2.5 py-0.5 text-[8.5px] font-black tracking-wider uppercase text-white bg-emerald-600 rounded-lg shadow-sm">
              In Stock
            </span>
          )}
        </div>

        {/* Verified Seller Badge */}
        <span className="absolute bottom-3.5 left-3.5 px-2 py-0.5 text-[8px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/80 backdrop-blur-md border border-indigo-200/40 dark:border-indigo-900/30 rounded uppercase tracking-wider">
          ✓ Verified Seller
        </span>

        {/* Quick View Glassmorphic Banner */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (onQuickView) onQuickView(product);
          }}
          className="absolute inset-x-3.5 bottom-3.5 opacity-0 group-hover:opacity-100 transition-all duration-350 ease-out z-10 cursor-pointer"
        >
          <div className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-950 dark:bg-slate-950/85 backdrop-blur-md border border-white/10 text-[10.5px] font-black uppercase tracking-wider text-white transition-all duration-200">
            <Eye size={12} />
            Quick View
          </div>
        </div>
      </div>

      {/* Product Card Body */}
      <div className="flex flex-col flex-1 p-4.5 gap-2.5 bg-white dark:bg-transparent">
        {/* Brand / Collection */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            {product.brand || "CartNOW Apparel"}
          </p>
          <span className="text-[9.5px] font-bold text-slate-450 dark:text-slate-500 uppercase">
            {product.location || "Delhi"} Hub
          </span>
        </div>

        {/* Title */}
        <p className="font-bold text-[13.5px] text-slate-800 dark:text-slate-100 line-clamp-2 min-h-[36px] leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
          {product.name}
        </p>

        {/* Rating Line */}
        <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
          <div className="flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded-md text-amber-500 font-black">
            <Star size={11} className="fill-amber-500 stroke-none" />
            <span>{averageRating ? averageRating.toFixed(1) : "New"}</span>
          </div>
          <span className="text-slate-400 dark:text-slate-500 font-bold">
            ({reviewCount || 0} reviews)
          </span>
        </div>

        {/* Pricing details */}
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[18px] font-black text-slate-900 dark:text-slate-100 tracking-tight">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            <span className="text-[11.5px] text-slate-400 dark:text-slate-500 line-through">
              ₹{originalVal.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-450 dark:text-slate-500">
            <Truck size={12} className="text-slate-400" />
            <span>{deliveryEstimate}</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-1 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            disabled={isOOS}
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-1.5 py-2.5 text-[10.5px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-95 cursor-pointer w-full ${
              isOOS
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200/50 dark:border-slate-800/50"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow border border-indigo-500/20"
            }`}
          >
            <ShoppingCart size={11} />
            <span>{isOOS ? "Sold Out" : "Add to Cart"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
