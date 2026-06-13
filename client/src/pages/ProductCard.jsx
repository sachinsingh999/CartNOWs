import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { Star, Eye, ShoppingCart, Heart, BarChart2 } from "lucide-react";
import { useComparison } from "../context/ComparisonContext";
import { getAverageRating, getReviewCount } from "../utils/productRatings";

const ProductCard = ({ product, compact = false }) => {
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

  const averageRating = getAverageRating(product);
  const reviewCount = getReviewCount(product);
  const images = product.images?.length ? product.images : [product.image].filter(Boolean);

  const getSrc = (idx = 0) => {
    const s = images[idx] || images[0];
    return s?.startsWith("http") ? s : `${backendUrl}/${s}`;
  };

  const isOOS = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Calculate original price & discount & EMI values dynamically
  const discountPercent = 20;
  const originalPrice = Math.round(product.price / (1 - discountPercent / 100));
  const emiAmount = Math.round(product.price / 12);

  return (
    <div
      onMouseEnter={() => images[1] && setImgIdx(1)}
      onMouseLeave={() => setImgIdx(0)}
      onClick={() => navigate(`/product/${product._id}`)}
      className="group flex flex-col bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-slate-950/80 transition-all duration-300 cursor-pointer text-left"
    >
      {/* Image Container with strict aspect-square */}
      <div className="aspect-square relative w-full overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <img
          src={getSrc(imgIdx)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Heart Favorite Button */}
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute top-2.5 right-2.5 h-8 w-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center shadow-sm z-10 cursor-pointer transition hover:scale-110 active:scale-95"
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
          className={`absolute top-11 right-2.5 h-8 w-8 backdrop-blur-md border rounded-full flex items-center justify-center shadow-sm z-10 cursor-pointer transition hover:scale-110 active:scale-95 ${
            isComparing
              ? "bg-indigo-600 border-indigo-500 text-white dark:bg-indigo-600"
              : "bg-white/90 dark:bg-slate-900/90 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600"
          }`}
          title="Compare product"
        >
          <BarChart2 size={13} className={isComparing ? "stroke-[2.5px]" : ""} />
        </button>

        {/* Badges Overlays */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.category && (
            <span className="px-2 py-0.5 text-[8.5px] font-extrabold tracking-wider uppercase text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded border border-slate-200/80 dark:border-slate-800">
              {product.category}
            </span>
          )}
          {isOOS ? (
            <span className="px-2 py-0.5 text-[8.5px] font-extrabold tracking-wider uppercase text-white bg-rose-500 rounded shadow-sm animate-pulse">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 text-[8.5px] font-extrabold tracking-wider uppercase text-white bg-amber-500 rounded shadow-sm">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>

        {/* New Badge Overlay */}
        <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 text-[8.5px] font-extrabold text-orange-600 bg-orange-50/90 dark:bg-orange-950/80 backdrop-blur-md border border-orange-200/60 dark:border-orange-900/40 rounded uppercase tracking-wider">
          New
        </span>

        {/* Quick View Glassmorphic Banner */}
        <div className="absolute inset-x-2.5 bottom-2.5 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
          <div className="flex h-9 w-full items-center justify-center gap-1 rounded-xl bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md border border-white/10 dark:border-slate-800 text-[10px] font-bold text-white uppercase tracking-wider hover:bg-slate-900 transition-colors duration-200">
            <Eye size={12} />
            Quick View
          </div>
        </div>
      </div>

      {/* Product Card Body */}
      <div className="flex flex-col flex-1 p-3.5 gap-2 bg-white dark:bg-transparent">
        {/* Subcat / Department info */}
        <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
          {product.subCategory || "Essentials"}
        </p>

        {/* Title */}
        <h3 className="font-bold text-[13px] text-slate-800 dark:text-slate-100 line-clamp-2 min-h-[36px] leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
          {product.name}
        </h3>

        {/* Brand / Collection */}
        {(product.brand || product.collection) && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-semibold">
            {[product.brand, product.collection].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* Sizes & Attributes Badge Chips */}
        <div className="flex flex-wrap gap-1 mt-0.5 min-h-[18px]">
          {product.sizes?.slice(0, 3).map((s) => (
            <span
              key={`size-${s}`}
              className="px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-md capitalize"
            >
              {s}
            </span>
          ))}
          {product.attributes?.slice(0, 2).map((attr) => (
            <span
              key={`attr-${attr.key}`}
              className="px-1.5 py-0.5 text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-md capitalize"
            >
              {attr.value}
            </span>
          ))}
        </div>

        {/* Pricing details */}
        <div className="flex flex-col gap-0.5 mt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[16px] font-black text-slate-900 dark:text-slate-100 tracking-tight">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-500">
              {discountPercent}% OFF
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            EMI from <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">₹{emiAmount.toLocaleString("en-IN")}</span>/mo
          </span>
        </div>

        {/* Rating Line */}
        <div className="flex items-center gap-1 text-[11px] mt-0.5">
          <Star size={11} className="text-amber-500 fill-amber-500 stroke-none" />
          <span className="font-extrabold text-slate-700 dark:text-slate-300">
            {averageRating ? averageRating.toFixed(1) : "New"}
          </span>
          <span className="text-slate-400 dark:text-slate-500 font-medium">
            ({reviewCount} reviews)
          </span>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product._id}`);
            }}
            className="py-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200 rounded-xl cursor-pointer"
          >
            Details
          </button>
          <button
            type="button"
            disabled={isOOS}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOOS) navigate(`/product/${product._id}`);
            }}
            className={`flex items-center justify-center gap-1 py-2 text-[11px] font-bold rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
              isOOS
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200/50 dark:border-slate-800/50"
                : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-sm hover:shadow"
            }`}
          >
            <ShoppingCart size={11} />
            <span>{isOOS ? "Sold Out" : "Buy Now"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
