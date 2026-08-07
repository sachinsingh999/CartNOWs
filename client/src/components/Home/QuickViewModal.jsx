import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Star, Plus, Minus, ShoppingCart, Heart, BarChart2, Share2, 
  CheckCircle2, Truck, RotateCcw, ShieldCheck, Lock, ChevronLeft, 
  ChevronRight, Headset, CreditCard 
} from "lucide-react";
import { backendUrl } from "../../config";
import { getAverageRating, getReviewCount } from "../../utils/productRatings";
import { toast } from "react-toastify";

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  const [qvQty, setQvQty] = useState(1);
  const [qvSize, setQvSize] = useState("Standard");
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) return null;

  const averageRating = (typeof product.rating === 'number' ? product.rating : getAverageRating(product)) || 5.0;
  const reviewCount = (typeof product.reviewCount === 'number' ? product.reviewCount : getReviewCount(product)) || 1;

  // Extract and clean images
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

  const originalVal = product.originalPrice || Math.round(product.price * 1.25);
  const discountPercent = Math.max(5, Math.round(((originalVal - product.price) / originalVal) * 100));

  const renderStars = (rating) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<Star key={i} size={12} className="fill-amber-500 text-amber-500 stroke-none" />);
      } else {
        stars.push(<Star key={i} size={12} className="text-slate-350 dark:text-slate-700 fill-transparent" />);
      }
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const displayedThumbnails = images.slice(0, 4);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
        />
        
        {/* Modal container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#F8F9FC] dark:bg-[#0B0F19] rounded-md overflow-hidden max-w-4xl w-full shadow-2xl relative border border-[#DFE4EE] dark:border-slate-800 z-10 text-left text-slate-800 dark:text-slate-200"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 bg-slate-100 dark:bg-[#1e293b]/30 hover:bg-slate-200 dark:hover:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white rounded-full flex items-center justify-center cursor-pointer transition z-30"
          >
            <X size={14} />
          </button>

          {/* Main Content Area */}
          <div className="p-6 flex flex-col md:flex-row gap-6">
            
            {/* Left Column - Product Gallery */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              {/* Active Image Box */}
              <div className="relative w-full h-[360px] bg-slate-100 dark:bg-[#1a202c]/30 rounded border border-slate-200 dark:border-slate-800/80 flex items-center justify-center p-6 overflow-hidden">
                {/* Discount Tag */}
                {discountPercent > 0 && (
                  <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded shadow-xs uppercase z-20">
                    {discountPercent}% OFF
                  </div>
                )}

                {/* Main Product Image */}
                {images.length > 0 && getSrc(activeImgIdx) !== "" ? (
                  <img
                    src={getSrc(activeImgIdx)}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain p-2 rounded transition-all duration-300"
                  />
                ) : (
                  <div className="text-xs text-slate-400">No Image Available</div>
                )}

                {/* Chevron Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveImgIdx((prev) => (prev - 1 + images.length) % images.length); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-white dark:bg-[#1e293b] text-slate-800 dark:text-white rounded-full flex items-center justify-center shadow-md border-none cursor-pointer hover:scale-105 active:scale-95 transition duration-150 z-20"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveImgIdx((prev) => (prev + 1) % images.length); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-white dark:bg-[#1e293b] text-slate-800 dark:text-white rounded-full flex items-center justify-center shadow-md border-none cursor-pointer hover:scale-105 active:scale-95 transition duration-150 z-20"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails list */}
              {images.length > 0 && (
                <div className="flex gap-3">
                  {displayedThumbnails.map((_, idx) => {
                    const isActive = idx === activeImgIdx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveImgIdx(idx)}
                        className={`h-14 w-14 rounded bg-white dark:bg-[#0C0F16] border flex items-center justify-center p-1 cursor-pointer transition-all duration-150 relative overflow-hidden ${
                          isActive 
                            ? "border-2 border-emerald-500 ring-1 ring-emerald-500/25" 
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-450 dark:hover:border-slate-650"
                        }`}
                      >
                        <img src={getSrc(idx)} className="max-h-full max-w-full object-contain rounded-xs" alt="" />
                        {idx === 3 && images.length > 4 && (
                          <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-white text-[11px] font-black">
                            +{images.length - 3}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column - Product Details */}
            <div className="flex-1 flex flex-col justify-between gap-4">
              <div className="text-left space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
                  {product.brand || "SONY"}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-snug">
                  {product.name}
                </h3>
                
                {/* Ratings Row */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  {renderStars(averageRating)}
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                    {averageRating.toFixed(1)} &nbsp;
                    <span className="text-emerald-600 dark:text-emerald-500 font-extrabold hover:underline cursor-pointer">({reviewCount} review{reviewCount > 1 ? "s" : ""})</span>
                  </span>
                </div>
              </div>

              {/* Pricing section */}
              <div className="text-left space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-slate-400 dark:text-slate-500 line-through font-bold leading-none">
                    ₹{originalVal.toLocaleString("en-IN")}
                  </span>
                </div>
                {discountPercent > 0 && (
                  <span className="inline-block text-[9px] font-black px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 rounded border border-emerald-500/20 leading-none">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Grid of Key Features */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-slate-50/60 dark:bg-[#0f172a]/30 border border-slate-200 dark:border-slate-800/80 rounded p-3 text-left">
                <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-650 dark:text-slate-350">
                  <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                  <span>In Stock</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-650 dark:text-slate-350">
                  <RotateCcw size={12} className="text-emerald-500 shrink-0" />
                  <span>7-Day Returns</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-650 dark:text-slate-350">
                  <Truck size={12} className="text-emerald-500 shrink-0" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-650 dark:text-slate-350">
                  <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
                  <span>1 Year Warranty</span>
                </div>
              </div>

              {/* Selection Options */}
              <div className="space-y-3.5 text-left pt-1">
                {product.sizes?.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[55px]">Size:</span>
                    <div className="flex gap-1.5">
                      {product.sizes.map((sz, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setQvSize(sz)}
                          className={`px-2.5 py-1 text-[10px] font-extrabold border rounded cursor-pointer transition-all duration-150 ${ qvSize === sz ? "bg-[#10B981] border-[#10B981] text-white shadow-xs" : "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity selector row */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Quantity</span>
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-[#0C0F16] overflow-hidden h-9 w-32 justify-between p-0.5">
                    <button
                      type="button"
                      onClick={() => setQvQty(Math.max(1, qvQty - 1))}
                      className="w-8 h-full bg-slate-200 hover:bg-slate-300 dark:bg-[#1e293b]/40 dark:hover:bg-[#1e293b]/85 flex items-center justify-center text-slate-700 dark:text-slate-350 cursor-pointer active:scale-95 border-none rounded-xs"
                    >
                      <Minus size={10} className="stroke-[2.5]" />
                    </button>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{qvQty}</span>
                    <button
                      type="button"
                      onClick={() => setQvQty(qvQty + 1)}
                      className="w-8 h-full bg-slate-200 hover:bg-slate-300 dark:bg-[#1e293b]/40 dark:hover:bg-[#1e293b]/85 flex items-center justify-center text-slate-700 dark:text-slate-350 cursor-pointer active:scale-95 border-none rounded-xs"
                    >
                      <Plus size={10} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Cart CTA Button & Secure checkout */}
              <div className="pt-2 text-left space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, qvQty, qvSize);
                    onClose();
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded transition cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1.5 border-none"
                >
                  <ShoppingCart size={12} className="stroke-[2.5]" />
                  <span>Add to Cart</span>
                </button>
                <div className="text-[10px] text-slate-500 dark:text-slate-500 font-semibold flex items-center justify-center gap-1.5 select-none leading-none">
                  <Lock size={10} className="text-slate-450" />
                  <span>Secure checkout</span>
                </div>
              </div>

              {/* Bottom Actions Suite: Wishlist, Compare, Share */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFavorite(!isFavorite);
                    toast.success(!isFavorite ? "Added to Wishlist!" : "Removed from Wishlist!");
                  }}
                  className={`flex-1 py-2 px-3 border rounded text-[11px] font-black cursor-pointer transition flex items-center justify-center gap-1.5 ${
                    isFavorite 
                      ? "bg-rose-500/10 border-rose-500/25 text-rose-500" 
                      : "bg-white dark:bg-transparent border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Heart size={11} className={isFavorite ? "fill-rose-500 stroke-none" : ""} />
                  <span>Wishlist</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.info("Comparison list updated! 📊");
                  }}
                  className="flex-1 py-2 px-3 bg-white dark:bg-transparent border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white rounded text-[11px] font-black cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  <BarChart2 size={11} />
                  <span>Compare</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + `/product/${product._id}`);
                    toast.success("Product link copied to clipboard! 🔗");
                  }}
                  className="flex-1 py-2 px-3 bg-white dark:bg-transparent border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white rounded text-[11px] font-black cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  <Share2 size={11} />
                  <span>Share</span>
                </button>
              </div>

            </div>
          </div>

          {/* Bottom Ribbon / Trust Highlights */}
          <div className="border-t border-[#DFE4EE] dark:border-slate-800/60 bg-slate-100/50 dark:bg-[#070b13] py-4 px-6 flex flex-wrap justify-between gap-4 select-none rounded-b-md">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
              <div>
                <h4 className="text-[10px] font-black text-slate-850 dark:text-slate-200 leading-none">Authentic Products</h4>
                <p className="text-[9px] text-slate-500 dark:text-slate-500 font-semibold mt-1 leading-none">100% original products</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Headset size={16} className="text-emerald-500 shrink-0" />
              <div>
                <h4 className="text-[10px] font-black text-slate-850 dark:text-slate-200 leading-none">Customer Support</h4>
                <p className="text-[9px] text-slate-500 dark:text-slate-500 font-semibold mt-1 leading-none">24/7 support available</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <CreditCard size={16} className="text-emerald-500 shrink-0" />
              <div>
                <h4 className="text-[10px] font-black text-slate-850 dark:text-slate-200 leading-none">Secure Payments</h4>
                <p className="text-[9px] text-slate-500 dark:text-slate-500 font-semibold mt-1 leading-none">Multiple payment options</p>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
