import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { Star, Eye, ShoppingCart, Heart, BarChart2 } from "lucide-react";
import { useComparison } from "../context/ComparisonContext";
import { useCoShop } from "../context/CoShopContext";
import { getAverageRating, getReviewCount } from "../utils/productRatings";

const ProductCard = ({ product, compact = false }) => {
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const token = localStorage.getItem("token") || "";
  const { addToCompare, removeFromCompare, isInCompare } = useComparison();
  const { activeRoomId, suggestProduct } = useCoShop();
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

  const averageRating = getAverageRating(product);
  const reviewCount = getReviewCount(product);
  const images = product.images?.length ? product.images : [product.image].filter(Boolean);
  
  const getSrc = (idx = 0) => {
    const s = images[idx] || images[0];
    return s?.startsWith("http") ? s : `${backendUrl}/${s}`;
  };

  const isOOS = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div
      onMouseEnter={() => images[1] && setImgIdx(1)}
      onMouseLeave={() => setImgIdx(0)}
      onClick={() => navigate(`/product/${product._id}`)}
      className="group flex flex-col bg-white dark:bg-slate-900/40 rounded-2xl border border-gray-200/80 dark:border-slate-800 overflow-hidden hover:shadow-xl dark:hover:shadow-slate-950/80 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* ── Image Container ── */}
      <div 
        className={`relative w-full overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center ${
          compact ? "h-44 md:h-48" : "h-52 md:h-56"
        }`}
      >
        <img
          src={getSrc(imgIdx)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Heart Favorite Overlay */}
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute top-3 right-3 h-8.5 w-8.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center shadow-sm z-10 cursor-pointer transition hover:scale-110 active:scale-95"
          title="Save to favorites"
        >
          <Heart size={14} className={`transition duration-150 ${isFavorite ? "text-rose-500 fill-rose-500 scale-110" : "text-slate-400 hover:text-rose-500"}`} />
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
          className={`absolute top-13 right-3 h-8.5 w-8.5 backdrop-blur-md border rounded-full flex items-center justify-center shadow-sm z-10 cursor-pointer transition hover:scale-110 active:scale-95 ${
            isComparing 
              ? "bg-indigo-650 border-indigo-500 text-white dark:bg-indigo-600" 
              : "bg-white/80 dark:bg-slate-900/80 border-slate-100 dark:border-slate-850 text-slate-455 hover:text-indigo-600"
          }`}
          title="Compare product"
        >
          <BarChart2 size={14} className={isComparing ? "stroke-[2.5px]" : ""} />
        </button>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.category && (
            <span className="px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-sm border border-slate-100 dark:border-slate-800">
              {product.category}
            </span>
          )}
          {isOOS ? (
            <span className="px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase text-white bg-rose-500 rounded-full shadow-sm animate-pulse">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase text-white bg-amber-500 rounded-full shadow-sm">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>

        {/* Quick View Glassmorphic Banner */}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
          <div className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md border border-white/10 dark:border-slate-800 text-[11px] font-bold text-white uppercase tracking-wider hover:bg-slate-900 transition-colors duration-200">
            <Eye size={13} />
            Quick View
          </div>
        </div>
      </div>

      {/* ── Product Body ── */}
      <div className="flex flex-col flex-1 p-4 gap-2 text-left bg-white dark:bg-transparent">
        
        {/* Subcat & Rating Header */}
        <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
          <span>{product.subCategory || "Essentials"}</span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/30 font-semibold">
            <Star size={10} className="fill-amber-600 dark:fill-amber-500 stroke-none" />
            <span>{averageRating ? averageRating.toFixed(1) : "New"}</span>
          </div>
        </div>

        {/* Name */}
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-105 line-clamp-2 min-h-[40px] leading-tight group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-200">
          {product.name}
        </h3>

        {/* Brand/Collection */}
        {(product.brand || product.collection) && (
          <p className="text-[11px] text-slate-405 dark:text-slate-400 truncate font-semibold">
            {[product.brand, product.collection].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* Sizes Bar */}
        {product.sizes?.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mt-1">
            {product.sizes.slice(0, 3).map((s) => (
              <span 
                key={s} 
                className="px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200/50 dark:border-slate-700/60"
              >
                {s}
              </span>
            ))}
            {product.sizes.length > 3 && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded">
                +{product.sizes.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price & Primary CTA Row */}
        <div className="mt-auto pt-3 border-t border-slate-100/80 dark:border-slate-800/80">
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              ({reviewCount} reviews)
            </span>
          </div>

          {activeRoomId && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                suggestProduct(product);
              }}
              className="w-full mb-2 py-2 px-3 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white text-[11px] font-extrabold transition-all duration-200 cursor-pointer shadow-md shadow-indigo-650/15 active:scale-95"
            >
              Suggest to Group
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product._id}`);
              }}
              className="py-2.5 text-xs font-bold text-slate-600 dark:text-slate-350 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200 rounded-xl cursor-pointer"
            >
              Details
            </button>
            <button
              disabled={isOOS}
              onClick={(e) => {
                e.stopPropagation();
                if (!isOOS) navigate(`/product/${product._id}`);
              }}
              className={`flex items-center justify-center gap-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
                isOOS
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-450 dark:text-slate-600 border border-slate-200/50 dark:border-slate-800/50 cursor-not-allowed"
                  : "bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-550 text-white shadow-sm hover:shadow"
              }`}
            >
              <ShoppingCart size={12} />
              <span>{isOOS ? "Sold Out" : "Buy Now"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;
