import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Sparkles, 
  Eye, 
  Check, 
  Loader2,
  ShieldCheck,
  Truck
} from "lucide-react";
import { useComparison } from "../context/ComparisonContext";
import { getAverageRating, getReviewCount } from "../utils/productRatings";
import { triggerFlyToCart } from "../utils/animation";
import { getOptimizedImageUrl } from "../utils/imageOptimizer";

const ProductListCard = ({ product, onQuickView }) => {
  const navigate = useNavigate();
  const [isBursting, setIsBursting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
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
        console.error(error);
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
    if (e && e.stopPropagation) e.stopPropagation();
    if (isOOS || isAdding) return;

    const size = product.sizes?.length ? product.sizes[0] : "standard";

    let guestCart = {};
    try {
      guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
    } catch (err) {}

    if (!token) {
      const keyPrefix = `${product._id}_`;
      let alreadyInCart = false;
      for (const k in guestCart) {
        if ((k === `${product._id}_${size}` || k.startsWith(keyPrefix)) && guestCart[k] > 0) {
          alreadyInCart = true;
          break;
        }
      }

      if (alreadyInCart) {
        toast.info("Product is already in your cart");
        navigate("/cart");
        return;
      }
    }

    setIsAdding(true);

    if (e?.clientX && e?.clientY) {
      triggerFlyToCart(e.clientX, e.clientY, getSrc());
    }

    if (!token) {
      guestCart[`${product._id}_${size}`] = 1;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      window.dispatchEvent(new Event("cartUpdate"));
      toast.success("Added to cart! 🛍️");
      setIsAdding(false);
      navigate("/cart");
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
          setIsAdding(false);
          navigate("/cart");
        } else {
          toast.error(res.data.message || "Failed to add to cart");
          setIsAdding(false);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error adding to cart");
        setIsAdding(false);
      }
    }
  };

  const averageRating = getAverageRating(product);
  const reviewCount = getReviewCount(product);

  const getSrc = () => {
    let s = "";
    if (product.bgRemovedImage) {
      s = product.bgRemovedImage;
    } else if (product.images && product.images.length > 0) {
      s = product.images[0];
    } else if (product.image) {
      s = product.image;
    }
    if (!s) return "";
    const rawUrl = s.startsWith("http") ? s : `${backendUrl}/${s.startsWith("/") ? s.slice(1) : s}`;
    return getOptimizedImageUrl(rawUrl, { width: 400, quality: 85 });
  };

  const isOOS = product.stock === 0;
  const originalVal = product.originalPrice || Math.round(product.price * 1.25);
  const discountPercent = Math.max(5, Math.round(((originalVal - product.price) / originalVal) * 100));

  // Build bullet specifications dynamically from MongoDB product fields
  const specsList = useMemo(() => {
    // 1. If explicit highlights exist from backend
    if (product.highlights && Array.isArray(product.highlights) && product.highlights.length > 0) {
      return product.highlights.filter(Boolean).slice(0, 6);
    }

    // 2. If specifications array exists [{ key, value }]
    if (product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0) {
      const validSpecs = product.specifications
        .filter(s => s && (s.value || s.key))
        .map(s => (s.key && s.value ? `${s.key}: ${s.value}` : s.value || s.key));
      if (validSpecs.length > 0) return validSpecs.slice(0, 6);
    }

    // 3. If dynamic attributes exist
    if (product.attributes && typeof product.attributes === "object") {
      const entries = Object.entries(product.attributes)
        .filter(([k, v]) => v && typeof v !== "object" && !Array.isArray(v) && k !== "hidden");
      if (entries.length > 0) {
        return entries.slice(0, 6).map(([k, v]) => `${k.replace(/([A-Z])/g, " $1").trim()}: ${v}`);
      }
    }

    // 4. Extract real features from product description and MongoDB fields
    const list = [];
    if (product.brand) {
      list.push(`Brand: ${product.brand}`);
    }
    if (product.category) {
      list.push(`Category: ${product.category}${product.subCategory ? ` | ${product.subCategory}` : ""}`);
    }
    if (product.sizes && product.sizes.length > 0) {
      list.push(`Available Sizes / Options: ${product.sizes.join(", ")}`);
    }

    // Extract sentences from product.description
    if (product.description) {
      const sentences = product.description
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 10 && s.length < 90);
      for (const sent of sentences) {
        if (list.length < 5) list.push(sent);
      }
    }

    if (product.location) {
      list.push(`Ships from ${product.location} Fulfillment Center`);
    }
    list.push("7 Days Replacement & Return Policy");

    return list.slice(0, 6);
  }, [product]);

  const handleCardClick = () => {
    try {
      const list = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
      const next = [product._id, ...list.filter(id => id !== product._id)].slice(0, 8);
      localStorage.setItem("recently_viewed", JSON.stringify(next));
    } catch (e) {}
    navigate(`/product/${product._id}`);
  };

  const exchangeAmount = Math.max(800, Math.floor(product.price * 0.65));

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col md:flex-row items-stretch bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-200 cursor-pointer p-4 sm:p-5 select-none w-full text-left"
    >
      {/* ── LEFT COLUMN: Image, Wishlist & Add to Compare ── */}
      <div className="w-full md:w-[220px] lg:w-[240px] shrink-0 flex flex-col items-center justify-between pb-3 md:pb-0 md:pr-4">
        <div className="relative w-full h-[200px] sm:h-[220px] flex items-center justify-center p-2">
          {/* Wishlist Button */}
          <button
            type="button"
            onClick={toggleFavorite}
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-1 right-1 h-8 w-8 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors z-20 cursor-pointer border-none shadow-2xs"
          >
            <Heart
              size={17}
              className={`transition-colors duration-200 ${
                isFavorite ? "text-rose-500 fill-rose-500 stroke-none" : "text-slate-300 dark:text-slate-600 hover:text-rose-500"
              } ${isBursting ? "heart-burst" : ""}`}
            />
          </button>

          {/* Product Image */}
          <img
            src={getSrc()}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Gemini / AI Badge if applicable */}
        <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 my-1">
          <Sparkles size={11} className="text-amber-500" />
          <span>with CartNOW AI</span>
        </div>

        {/* Add to Compare Checkbox */}
        <label
          onClick={(e) => e.stopPropagation()}
          className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            checked={isComparing}
            onChange={() => {
              if (isComparing) {
                removeFromCompare(product._id);
              } else {
                addToCompare(product);
              }
            }}
            className="h-3.5 w-3.5 rounded-none border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
          />
          <span>Add to Compare</span>
        </label>
      </div>

      {/* ── MIDDLE COLUMN: Title, Ratings, Feature Bullets ── */}
      <div className="flex-1 min-w-0 md:px-4 py-2 flex flex-col justify-start">
        {/* Title */}
        <h3 className="text-base sm:text-[17px] font-bold text-slate-900 dark:text-white group-hover:text-[#2874f0] dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Rating Pill + Review Counts (100% Real Database Values) */}
        <div className="flex items-center gap-2 mt-1.5 mb-2.5 select-none">
          {averageRating > 0 ? (
            <>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] bg-[#388e3c] text-white text-[11px] font-extrabold leading-none">
                <span>{averageRating.toFixed(1)}</span>
                <Star size={9} className="fill-white stroke-none" />
              </span>

              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {reviewCount} {reviewCount === 1 ? "Rating & Review" : "Ratings & Reviews"}
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span className="px-1.5 py-0.5 rounded-[3px] bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">New</span>
              <span>No ratings yet</span>
            </span>
          )}
        </div>

        {/* Feature Bullets List (Flipkart Style) */}
        <ul className="space-y-1.5 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300">
          {specsList.map((spec, i) => (
            <li key={i} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-400 dark:text-slate-500 font-bold select-none">•</span>
              <span className="line-clamp-1">{spec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── RIGHT COLUMN: Pricing, Assured Badge, Urgency & Offers ── */}
      <div className="w-full md:w-[240px] lg:w-[260px] shrink-0 md:pl-4 pt-3 md:pt-2 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800">
        <div>
          {/* Price & Assured Badge Row */}
          <div className="flex items-center flex-wrap gap-2 select-none">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              ₹{Math.floor(product.price).toLocaleString("en-IN")}
            </span>

            {/* Stylized Flipkart-style Assured Badge */}
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 select-none">
              <span className="flex items-center justify-center h-3 w-3 rounded-full bg-[#2874f0] text-amber-300">
                <Sparkles size={8} className="fill-amber-300 stroke-none" />
              </span>
              <span className="text-[10.5px] font-black tracking-tight italic text-[#2874f0] dark:text-blue-400 leading-none">
                Assured
              </span>
            </div>
          </div>

          {/* Original MRP & Discount % */}
          <div className="flex items-center gap-2 mt-1.5 text-xs select-none">
            <span className="line-through text-slate-400 dark:text-slate-500 font-semibold">
              ₹{originalVal.toLocaleString("en-IN")}
            </span>
            <span className="font-extrabold text-[#388e3c] dark:text-emerald-400">
              {discountPercent}% off
            </span>
          </div>

          {/* Stock Urgency */}
          {product.stock !== undefined && product.stock <= 5 && (
            <p className="text-xs font-bold text-[#c2185b] dark:text-rose-400 mt-1 select-none">
              {product.stock <= 2 ? `Only ${product.stock || 2} left` : "Only few left"}
            </p>
          )}

          {/* Exchange / Bank Offer Line */}
          <p className="text-[12px] font-medium text-slate-800 dark:text-slate-200 mt-1 select-none">
            Upto <span className="font-bold">₹{exchangeAmount.toLocaleString("en-IN")}</span> Off on Exchange
          </p>

          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1 select-none">
            <Truck size={12} className="stroke-[2.5]" />
            <span>Free delivery</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            disabled={isOOS || isAdding}
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-none text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer border-none ${
              isOOS || isAdding
                ? "bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                : "bg-[#ff9f00] hover:bg-[#f39700] text-slate-950 font-black shadow-2xs"
            }`}
          >
            {isAdding ? (
              <>
                <Loader2 size={13} className="animate-spin stroke-[2.5]" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart size={13} className="stroke-[2.5]" />
                <span>{isOOS ? "Sold Out" : "Add to Cart"}</span>
              </>
            )}
          </button>

          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="h-8.5 w-8.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-none flex items-center justify-center text-slate-600 dark:text-slate-300 transition duration-150 active:scale-95 border-none cursor-pointer shrink-0"
              title="Quick View"
            >
              <Eye size={14} className="stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListCard;
