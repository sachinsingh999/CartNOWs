import React from "react";
import { 
  Edit3, 
  Trash2, 
  Eye, 
  Copy, 
  Plus, 
  Minus, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Tag
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const ProductsGridView = ({
  products = [],
  selectedIds = [],
  onToggleSelect,
  onOpenPreview,
  onOpenEdit,
  onDeleteProduct,
  onQuickStockUpdate,
  stockUpdatingId = null,
  loading = false
}) => {
  const copyToClipboard = (text, label = "Item") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
          <div key={idx} className="bg-white dark:bg-[#0F172A] rounded-xl p-3 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5 animate-pulse">
            <div className="h-36 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-3/4" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F172A] rounded-xl p-8 border border-slate-200/80 dark:border-slate-800/80 text-center space-y-2">
        <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-1">
          <Package size={24} />
        </div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white">No Products Found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No items match your active search or filter criteria. Try adjusting the filters or add a new product.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5">
      {products.map((item) => {
        const stock = parseInt(item.stock, 10) || 0;
        const price = parseFloat(item.price) || 0;
        const valuation = price * stock;
        const isSelected = selectedIds.includes(item._id);
        const isUpdatingStock = stockUpdatingId === item._id;

        const isOutOfStock = stock === 0;
        const isLowStock = stock > 0 && stock < 10;
        const isHealthy = stock >= 10;
        const progressPct = Math.min((stock / 20) * 100, 100);

        const imageSrc = item.images?.[0] || item.image?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400";
        const imagesCount = item.images?.length || item.image?.length || 1;

        return (
          <motion.div
            key={item._id}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className={`bg-white dark:bg-[#0F172A] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-all duration-200 ${
              isSelected ? "ring-2 ring-amber-500 border-amber-500/60 bg-amber-50/20 dark:bg-amber-950/20" : "hover:border-amber-300 dark:hover:border-amber-700/60"
            }`}
          >
            {/* Card Header: Checkbox & Status Badges */}
            <div className="flex items-center justify-between gap-1 pb-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(item._id)}
                  className="rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[110px]">
                  {item.category || "General"}
                </span>
              </div>

              {/* Stock Status Badge */}
              <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                isOutOfStock 
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" 
                  : isLowStock 
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}>
                {isOutOfStock ? "Out of Stock" : isLowStock ? `${stock} Left` : `${stock} Units`}
              </span>
            </div>

            {/* Product Image Showcase */}
            <div 
              onClick={() => onOpenPreview(item)}
              className="relative h-36 w-full rounded-lg bg-slate-100 dark:bg-slate-800/80 overflow-hidden cursor-pointer group mb-2 border border-slate-100 dark:border-slate-800"
            >
              <img 
                src={imageSrc} 
                alt={item.name} 
                className="h-full w-full object-cover group-hover:scale-105 transition duration-300" 
              />
              
              {/* Image Count Pill */}
              {imagesCount > 1 && (
                <span className="absolute bottom-1.5 right-1.5 bg-slate-950/80 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                  {imagesCount} Photos
                </span>
              )}

              {/* Hover Quick View Overlay */}
              <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center">
                <span className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2.5 py-1 rounded-md text-[10px] font-extrabold shadow-md flex items-center gap-1">
                  <Eye size={11} />
                  <span>Preview</span>
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-1 text-left flex-1">
              <h3 
                onClick={() => onOpenPreview(item)}
                className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-1 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition"
                title={item.name}
              >
                {item.name}
              </h3>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                {item.sku ? (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.sku, "SKU")}
                    className="font-mono font-bold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 px-1 py-0.2 rounded inline-flex items-center gap-1 cursor-pointer text-slate-500 dark:text-slate-400 text-[9px]"
                  >
                    <span>{item.sku}</span>
                    <Copy size={8} />
                  </button>
                ) : (
                  <span className="italic text-[9px]">No SKU</span>
                )}
                {item.brand && <span className="truncate max-w-[90px]">{item.brand}</span>}
              </div>

              {/* Price & Valuation */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-sm sm:text-base font-black text-amber-500 dark:text-amber-400">
                    ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400" title="Total Inventory Capital">
                  Val: ₹{valuation.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Stock Stepper & Progress Bar */}
              <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Stock Level
                  </span>

                  {/* Inline Stepper */}
                  <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
                    <button
                      type="button"
                      disabled={stock <= 0 || isUpdatingStock}
                      onClick={() => onQuickStockUpdate(item._id, Math.max(0, stock - 1))}
                      className="h-4.5 w-4.5 rounded bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white disabled:opacity-30 cursor-pointer active:scale-90 transition"
                      title="Decrease Stock (-1)"
                    >
                      <Minus size={10} />
                    </button>

                    <span className="text-[11px] font-black min-w-[24px] text-center px-0.5 text-slate-900 dark:text-slate-100">
                      {stock}
                    </span>

                    <button
                      type="button"
                      disabled={isUpdatingStock}
                      onClick={() => onQuickStockUpdate(item._id, stock + 1)}
                      className="h-4.5 w-4.5 rounded bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white disabled:opacity-30 cursor-pointer active:scale-90 transition"
                      title="Increase Stock (+1)"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${progressPct}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOutOfStock ? "bg-rose-500" : isLowStock ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Card Actions Footer */}
            <div className="flex items-center gap-1.5 pt-2.5 mt-1 border-t border-slate-100 dark:border-slate-800/60">
              <button
                type="button"
                onClick={() => onOpenPreview(item)}
                className="flex-1 py-1 px-2 rounded-lg bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Eye size={12} />
                <span>View</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenEdit(item)}
                className="flex-1 py-1 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Edit3 size={12} />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => onDeleteProduct(item._id)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                title="Delete Listing"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProductsGridView;
