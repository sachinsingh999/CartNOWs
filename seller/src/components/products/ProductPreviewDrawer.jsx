import React, { useState } from "react";
import { 
  X, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Copy, 
  Package, 
  DollarSign, 
  Boxes, 
  Tag, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Plus,
  Minus,
  ShieldCheck,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const ProductPreviewDrawer = ({
  product,
  onClose,
  onOpenEdit,
  onDeleteProduct,
  onQuickStockUpdate,
  stockUpdatingId = null
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = product.images?.length > 0 
    ? product.images 
    : (product.image?.length > 0 ? product.image : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"]);

  const stock = parseInt(product.stock, 10) || 0;
  const price = parseFloat(product.price) || 0;
  const valuation = price * stock;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock < 10;
  const isHealthy = stock >= 10;
  const isUpdatingStock = stockUpdatingId === product._id;

  const copyToClipboard = (text, label = "Item") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const currentImage = images[activeImageIndex] || images[0];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
      />

      {/* Drawer Container */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] border-l border-slate-200 dark:border-slate-800 h-full shadow-2xl flex flex-col z-10 overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Package size={15} />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                Product Quick Preview
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Live SKU overview & marketplace status
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 space-y-4 text-left">
          {/* 1. Image Showcase Gallery */}
          <div className="space-y-2">
            <div className="relative h-56 sm:h-64 w-full rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-200/60 dark:border-slate-800">
              <img 
                src={typeof currentImage === "object" ? currentImage.imageUrl : currentImage} 
                alt={product.name} 
                className="h-full w-full object-contain p-2" 
              />
              <span className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                {activeImageIndex + 1} of {images.length} Photos
              </span>
            </div>

            {/* Thumbnails row */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {images.map((img, idx) => {
                  const url = typeof img === "object" ? img.imageUrl : img;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                        activeImageIndex === idx 
                          ? "border-amber-500 scale-105" 
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Title & Primary Badges */}
          <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {product.category || "General"}
              </span>
              {product.subCategory && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {product.subCategory}
                </span>
              )}
              {product.brand && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Brand: {product.brand}
                </span>
              )}
            </div>

            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
              {product.name}
            </h2>

            <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-400">
              {product.sku && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(product.sku, "SKU")}
                  className="font-mono font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 text-[10px]"
                >
                  <span>SKU: {product.sku}</span>
                  <Copy size={10} />
                </button>
              )}
              {product.audience && (
                <span className="text-[11px] font-medium text-slate-400">
                  Target: <strong>{product.audience}</strong>
                </span>
              )}
            </div>
          </div>

          {/* 3. Pricing & Inventory Card */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Selling Price</span>
                <h4 className="text-lg sm:text-xl font-black text-amber-500 dark:text-amber-400">
                  ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Asset Value</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  ₹{valuation.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                  isOutOfStock 
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" 
                    : isLowStock 
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}>
                  {isOutOfStock ? <XCircle size={11} /> : isLowStock ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                  <span>{isOutOfStock ? "Out of Stock" : isLowStock ? `Low: ${stock} Left` : `${stock} Units Healthy`}</span>
                </span>
              </div>

              {/* Quick Stepper */}
              <div className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  disabled={stock <= 0 || isUpdatingStock}
                  onClick={() => onQuickStockUpdate(product._id, Math.max(0, stock - 1))}
                  className="h-5 w-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                >
                  <Minus size={11} />
                </button>
                <span className="text-xs font-black min-w-[28px] text-center text-slate-900 dark:text-slate-100">
                  {stock}
                </span>
                <button
                  type="button"
                  disabled={isUpdatingStock}
                  onClick={() => onQuickStockUpdate(product._id, stock + 1)}
                  className="h-5 w-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Description Excerpt */}
          {product.description && (
            <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Description
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                {product.description}
              </p>
            </div>
          )}

          {/* 5. Feature Highlights */}
          {product.highlights && product.highlights.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Key Highlights
              </h4>
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(product.highlights) ? product.highlights : [product.highlights]).map((h, i) => (
                  <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    ✓ {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 6. Dynamic Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Technical Specifications
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="flex justify-between py-1.5 px-2.5">
                    <span className="font-bold text-slate-500 dark:text-slate-400">{spec.key}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between gap-2 shrink-0">
          <a
            href={`http://localhost:5173/product/${product._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
            title="Open customer product page"
          >
            <ExternalLink size={13} />
            <span>Storefront</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEdit(product);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-xs transition cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onDeleteProduct(product._id);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
              title="Delete Product"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductPreviewDrawer;
