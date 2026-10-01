import React, { useState } from "react";
import { 
  Edit3, 
  Trash2, 
  Eye, 
  ExternalLink, 
  Copy, 
  Plus, 
  Minus, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const ProductsTableView = ({
  products = [],
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  onOpenPreview,
  onOpenEdit,
  onDeleteProduct,
  onQuickStockUpdate,
  stockUpdatingId = null,
  loading = false
}) => {
  const isAllSelected = products.length > 0 && selectedIds.length === products.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < products.length;

  const copyToClipboard = (text, label = "Item") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
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
    <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden transition-all">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/60">
              <th className="py-2.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => el && (el.indeterminate = isIndeterminate)}
                  onChange={onSelectAll}
                  className="rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
                  title="Select all products"
                />
              </th>
              <th className="py-2.5 px-3">Product</th>
              <th className="py-2.5 px-3">Category & Brand</th>
              <th className="py-2.5 px-3 text-right">Price (₹)</th>
              <th className="py-2.5 px-3 text-center">Stock / Inventory</th>
              <th className="py-2.5 px-3 text-right">Total Valuation</th>
              <th className="py-2.5 px-3 text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {products.map((item) => {
              const stock = parseInt(item.stock, 10) || 0;
              const price = parseFloat(item.price) || 0;
              const valuation = price * stock;
              const isSelected = selectedIds.includes(item._id);
              const isUpdatingStock = stockUpdatingId === item._id;

              const isOutOfStock = stock === 0;
              const isLowStock = stock > 0 && stock < 10;
              const isHealthy = stock >= 10;

              const imageSrc = item.images?.[0] || item.image?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120";

              return (
                <tr 
                  key={item._id}
                  className={`hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors ${
                    isSelected ? "bg-amber-50/40 dark:bg-amber-950/20" : ""
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-2 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(item._id)}
                      className="rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
                    />
                  </td>

                  {/* Product Thumbnail & Details */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2.5">
                      <div 
                        onClick={() => onOpenPreview(item)}
                        className="relative h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer group shadow-2xs"
                        title="Click to preview item"
                      >
                        <img 
                          src={imageSrc} 
                          alt={item.name} 
                          className="h-full w-full object-cover group-hover:scale-110 transition duration-200" 
                        />
                        {(item.images?.length > 1 || item.image?.length > 1) && (
                          <span className="absolute bottom-0.5 right-0.5 bg-slate-950/80 text-white text-[8px] font-black px-1 rounded">
                            {item.images?.length || item.image?.length}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p 
                          onClick={() => onOpenPreview(item)}
                          className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition max-w-[220px] sm:max-w-xs"
                          title={item.name}
                        >
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          {item.sku ? (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(item.sku, "SKU")}
                              className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 px-1.5 py-0.2 rounded inline-flex items-center gap-1 cursor-pointer"
                              title="Click to copy SKU"
                            >
                              <span>{item.sku}</span>
                              <Copy size={9} />
                            </button>
                          ) : (
                            <span className="text-[9px] text-slate-400 italic">No SKU</span>
                          )}
                          {item.audience && (
                            <span className="text-[9px] font-semibold text-slate-400">
                              • {item.audience}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category & Brand */}
                  <td className="py-2 px-3">
                    <div className="space-y-0.5">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.category || "General"}
                      </span>
                      {item.brand && (
                        <p className="text-[10px] font-semibold text-slate-400 pl-0.5">
                          {item.brand}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-2 px-3 text-right">
                    <span className="text-xs font-black text-amber-500 dark:text-amber-400">
                      ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </td>

                  {/* Stock with Inline Stepper */}
                  <td className="py-2 px-3">
                    <div className="flex flex-col items-center gap-1">
                      {/* Stepper + Quick Update */}
                      <div className="inline-flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
                        <button
                          type="button"
                          disabled={stock <= 0 || isUpdatingStock}
                          onClick={() => onQuickStockUpdate(item._id, Math.max(0, stock - 1))}
                          className="h-5 w-5 rounded bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white disabled:opacity-30 cursor-pointer active:scale-95 transition"
                          title="Decrease Stock (-1)"
                        >
                          <Minus size={11} />
                        </button>

                        <span className={`text-xs font-black min-w-[28px] text-center px-1 ${
                          isOutOfStock 
                            ? "text-rose-600 dark:text-rose-400" 
                            : isLowStock 
                            ? "text-amber-600 dark:text-amber-400" 
                            : "text-slate-900 dark:text-slate-100"
                        }`}>
                          {stock}
                        </span>

                        <button
                          type="button"
                          disabled={isUpdatingStock}
                          onClick={() => onQuickStockUpdate(item._id, stock + 1)}
                          className="h-5 w-5 rounded bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white disabled:opacity-30 cursor-pointer active:scale-95 transition"
                          title="Increase Stock (+1)"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Stock Health Pill */}
                      <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                        isOutOfStock 
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" 
                          : isLowStock 
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {isOutOfStock ? (
                          <>
                            <XCircle size={9} />
                            <span>Out of Stock</span>
                          </>
                        ) : isLowStock ? (
                          <>
                            <AlertTriangle size={9} />
                            <span>Low: {stock} Left</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={9} />
                            <span>Healthy</span>
                          </>
                        )}
                      </span>
                    </div>
                  </td>

                  {/* Valuation */}
                  <td className="py-2 px-3 text-right">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      ₹{valuation.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-3 text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={() => onOpenPreview(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Quick View Details"
                      >
                        <Eye size={14} />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => onOpenEdit(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 transition cursor-pointer"
                        title="Edit Full Listing"
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(item._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTableView;
