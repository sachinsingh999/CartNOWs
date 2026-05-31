import React, { useState } from "react";
import { useComparison } from "../context/ComparisonContext";
import { X, ShoppingCart, HelpCircle } from "lucide-react";
import { backendUrl } from "../config";
import axios from "axios";
import { toast } from "react-toastify";
import { getAverageRating } from "../utils/productRatings";

const ComparisonModal = ({ onClose }) => {
  const { compareList, removeFromCompare } = useComparison();
  const [addingCart, setAddingCart] = useState({});
  const token = localStorage.getItem("token") || "";

  // Collect all unique specification keys across all selected products
  const specKeys = Array.from(
    new Set(
      compareList.flatMap((p) => (p.specifications || []).map((s) => s.key))
    )
  );

  const handleAddToCart = async (product) => {
    const chosenSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "Standard";
    setAddingCart((prev) => ({ ...prev, [product._id]: true }));

    const cartItem = {
      productId: product._id,
      size: chosenSize,
      qty: 1,
    };

    if (token) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/cart/add`,
          cartItem,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          toast.success(`Added ${product.name.split(" ")[0]} to cart!`);
        } else {
          toast.error(response.data.message || "Failed to add to cart");
        }
      } catch (error) {
        toast.error("Failed to add to cart");
      } finally {
        setAddingCart((prev) => ({ ...prev, [product._id]: false }));
      }
    } else {
      try {
        let guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
        const key = `${product._id}_${chosenSize}`;
        guestCart[key] = (guestCart[key] || 0) + 1;
        localStorage.setItem("cart", JSON.stringify(guestCart));
        toast.success(`Added ${product.name.split(" ")[0]} to cart!`);
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        toast.error("Failed to add to cart");
      } finally {
        setAddingCart((prev) => ({ ...prev, [product._id]: false }));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">
              Product Comparison Matrix
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8.5 w-8.5 rounded-full bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Table Body */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20">
                {/* Parameters Column Header */}
                <th className="p-5 font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest w-48 align-middle">
                  Specifications
                </th>
                
                {/* Products Column Headers */}
                {Array.from({ length: 3 }).map((_, idx) => {
                  const product = compareList[idx];
                  if (!product) {
                    return (
                      <th key={`empty-head-${idx}`} className="p-5 w-[250px] align-middle">
                        <div className="flex flex-col items-center justify-center py-6 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/10 dark:bg-slate-950/5">
                          <HelpCircle size={24} className="text-slate-300 dark:text-slate-700 mb-1.5 animate-pulse" />
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                            Empty Slot
                          </span>
                        </div>
                      </th>
                    );
                  }

                  const imgUrl = product.images?.[0]?.startsWith("http")
                    ? product.images[0]
                    : `${backendUrl}/${product.images?.[0]}`;

                  return (
                    <th key={product._id} className="p-5 w-[250px] relative group align-middle">
                      <button
                        onClick={() => removeFromCompare(product._id)}
                        className="absolute top-3 right-3 h-6 w-6 bg-slate-100 hover:bg-rose-500 hover:text-white dark:bg-slate-800 dark:hover:bg-rose-500 rounded-full flex items-center justify-center text-slate-450 dark:text-slate-500 shadow-sm transition-all cursor-pointer z-10"
                        title="Remove product"
                      >
                        <X size={11} />
                      </button>
                      <div className="flex flex-col gap-3">
                        <div className="h-24 w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-xl p-2 border border-slate-150/80 dark:border-slate-850 overflow-hidden">
                          <img src={imgUrl} alt={product.name} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" />
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-white line-clamp-2 leading-tight">
                          {product.name}
                        </h4>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              
              {/* Row: Add to Cart button controls (Moved to top under header) */}
              <tr className="bg-slate-50/20 dark:bg-slate-950/10">
                <td className="p-4 font-bold text-xs uppercase text-slate-400 dark:text-slate-500">Actions</td>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const product = compareList[idx];
                  if (!product) return <td key={`action-${idx}`} className="p-4">—</td>;
                  const isOOS = product.stock === 0;
                  return (
                    <td key={`action-${idx}`} className="p-4">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isOOS || addingCart[product._id]}
                        className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                          isOOS
                            ? "bg-slate-105 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200/50 dark:border-slate-700"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow shadow-indigo-100 dark:shadow-slate-950 active:scale-95"
                        }`}
                      >
                        <ShoppingCart size={13} />
                        <span>{addingCart[product._id] ? "Adding..." : "Add to Cart"}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>

              {/* Row: Price */}
              <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-xs uppercase text-slate-450 dark:text-slate-500">Price</td>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const product = compareList[idx];
                  return (
                    <td key={`price-${idx}`} className="p-4 font-black text-sm text-indigo-600 dark:text-indigo-400">
                      {product ? `₹${product.price.toLocaleString("en-IN")}` : "—"}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Brand */}
              <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-xs uppercase text-slate-450 dark:text-slate-500">Brand</td>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const product = compareList[idx];
                  return (
                    <td key={`brand-${idx}`} className="p-4 text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">
                      {product ? (product.brand || "CartNOW Studio") : "—"}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Category */}
              <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-xs uppercase text-slate-450 dark:text-slate-500">Category</td>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const product = compareList[idx];
                  return (
                    <td key={`cat-${idx}`} className="p-4 text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">
                      {product ? product.category : "—"}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Rating */}
              <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-xs uppercase text-slate-450 dark:text-slate-500">Rating</td>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const product = compareList[idx];
                  const rating = product ? getAverageRating(product) : 0;
                  return (
                    <td key={`rate-${idx}`} className="p-4 text-xs font-bold text-slate-750 dark:text-slate-350">
                      {product ? (
                        rating > 0 ? (
                          <span className="flex items-center gap-1">
                            <span className="text-amber-500">★</span>
                            <span>{rating.toFixed(1)}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">No reviews</span>
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Availability */}
              <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-xs uppercase text-slate-450 dark:text-slate-500">Availability</td>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const product = compareList[idx];
                  if (!product) return <td key={`avail-${idx}`} className="p-4">—</td>;
                  const isOOS = product.stock === 0;
                  return (
                    <td key={`avail-${idx}`} className="p-4 text-xs font-black">
                      {isOOS ? (
                        <span className="text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-900/30">Out of Stock</span>
                      ) : (
                        <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">In Stock ({product.stock})</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row section: Technical specs header */}
              <tr className="bg-slate-50/50 dark:bg-slate-950/30">
                <td colSpan={4} className="p-3.5 pl-5 font-black text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  Technical Specifications
                </td>
              </tr>

              {/* Rows: Dynamic Specifications keys mapping */}
              {specKeys.map((key) => (
                <tr key={key} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
                  <td className="p-4 font-bold text-xs uppercase text-slate-450 dark:text-slate-500 capitalize">{key}</td>
                  {Array.from({ length: 3 }).map((_, idx) => {
                    const product = compareList[idx];
                    if (!product) return <td key={`spec-${key}-${idx}`} className="p-4">—</td>;
                    const matched = (product.specifications || []).find((s) => s.key === key);
                    return (
                      <td key={`spec-${key}-${idx}`} className="p-4 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {matched ? matched.value : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default ComparisonModal;
