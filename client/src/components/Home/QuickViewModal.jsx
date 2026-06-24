import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Plus, Minus, ShoppingCart } from "lucide-react";
import { backendUrl } from "../../config";
import { getAverageRating, getReviewCount } from "../../utils/productRatings";

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  const [qvQty, setQvQty] = useState(1);
  const [qvSize, setQvSize] = useState("Standard");

  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
        />
        
        {/* Modal container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden max-w-2xl w-full shadow-2xl relative border border-slate-100 dark:border-slate-800 z-10 p-6 flex flex-col md:flex-row gap-6 text-left text-slate-800 dark:text-slate-200"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 h-9 w-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705 rounded-full flex items-center justify-center cursor-pointer transition active:scale-90 border-none"
          >
            <X size={14} className="text-slate-600 dark:text-slate-400" />
          </button>

          {/* Product Visual */}
          <div className="w-full md:w-1/2 h-64 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center p-4 border border-slate-100 dark:border-slate-800/80">
            {(() => {
              const src = product.images?.[0] || product.image || "";
              if (!src) return <div className="text-xs text-slate-400">No Image</div>;
              const fullSrc = src.startsWith("http") ? src : `${backendUrl}/${src}`;
              return (
                <img
                  src={fullSrc}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain p-2"
                />
              );
            })()}
          </div>

          {/* Description & Action */}
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {product.brand || "CartNOW"}
              </span>
              <h3 className="text-lg font-black text-slate-850 dark:text-slate-100 leading-snug mt-1">
                {product.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-amber-500 mt-2 font-black">
                <Star size={11} className="fill-amber-500 stroke-none" />
                <span>{(typeof product.rating === 'number' ? product.rating : getAverageRating(product)) || 4.5}</span>
                <span className="text-slate-400 dark:text-slate-550 font-bold">({(typeof product.reviewCount === 'number' ? product.reviewCount : getReviewCount(product)) || 8} reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-550 line-through font-bold">
                ₹{Math.round(product.price * 1.25).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="space-y-3">
              {product.sizes?.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-455 dark:text-slate-400">Size:</span>
                  <div className="flex gap-1.5">
                    {product.sizes.map((sz, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setQvSize(sz)}
                        className={`px-2.5 py-1 text-[10px] font-extrabold border rounded-lg cursor-pointer ${
                          qvSize === sz
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-extrabold uppercase text-slate-455 dark:text-slate-400">Quantity:</span>
                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden h-8">
                  <button
                    type="button"
                    onClick={() => setQvQty(Math.max(1, qvQty - 1))}
                    className="w-8 h-full bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 cursor-pointer active:scale-95 border-none"
                  >
                    <Minus size={10} />
                  </button>
                  <span className="px-3 text-xs font-bold">{qvQty}</span>
                  <button
                    type="button"
                    onClick={() => setQvQty(qvQty + 1)}
                    className="w-8 h-full bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 cursor-pointer active:scale-95 border-none"
                  >
                    <Plus size={10} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, qvQty, qvSize);
                  onClose();
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer active:scale-98 flex items-center justify-center gap-1.5 border-none"
              >
                <ShoppingCart size={12} />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
