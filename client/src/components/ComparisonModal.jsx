import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useComparison } from "../context/ComparisonContext";
import {
  X,
  ShoppingCart,
  Plus,
  ArrowLeftRight,
  Check,
  Tag,
  Award,
  Layers,
  Star,
  Boxes,
  Sliders,
  ExternalLink,
  Sparkles,
  Loader2
} from "lucide-react";
import { backendUrl } from "../config";
import axios from "axios";
import { toast } from "react-toastify";
import { getAverageRating } from "../utils/productRatings";
import BrandLogo from "./BrandLogo";

const ComparisonModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { compareList, removeFromCompare } = useComparison();
  const [addingCart, setAddingCart] = useState({});
  const token = localStorage.getItem("token") || "";

  // Collect all unique specification keys across all selected products
  const specKeys = Array.from(
    new Set(
      compareList.flatMap((p) => (p.specifications || []).map((s) => s.key))
    )
  );

  // Determine best price and highest rating to display subtle "Best Value" and "Top Rated" chips
  const validPrices = compareList.map((p) => p.price).filter((p) => typeof p === "number" && p > 0);
  const lowestPrice = validPrices.length > 1 ? Math.min(...validPrices) : null;

  const validRatings = compareList.map((p) => getAverageRating(p));
  const highestRating = validRatings.length > 1 ? Math.max(...validRatings) : null;

  const handleAddToCart = async (product) => {
    const chosenSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "Standard";
    setAddingCart((prev) => ({ ...prev, [product._id]: true }));

    const cartItem = {
      productId: product._id,
      size: chosenSize,
      qty: 1
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
          window.dispatchEvent(new Event("cartUpdate"));
          onClose();
          navigate("/cart");
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
        window.dispatchEvent(new Event("cartUpdate"));
        toast.success(`Added ${product.name.split(" ")[0]} to cart!`);
        onClose();
        navigate("/cart");
      } catch (err) {
        toast.error("Failed to add to cart");
      } finally {
        setAddingCart((prev) => ({ ...prev, [product._id]: false }));
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-[fade-in_0.2s_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-2xl w-full max-w-5xl max-h-[88vh] overflow-hidden flex flex-col transition-all duration-200">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-xs">
              <ArrowLeftRight size={16} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">
                  Product Comparison Matrix
                </h3>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {compareList.length} / 3 Items
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Side-by-side technical evaluation and feature breakdown
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison modal"
            className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Table Body */}
        <div className="flex-1 overflow-auto scrollbar-thin">
          <table className="w-full border-collapse min-w-[780px] text-left">
            <thead>
              <tr className="border-b border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                {/* Parameters Column Header */}
                <th className="p-4.5 font-black text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider w-48 align-middle border-r border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Sliders size={13} className="text-indigo-600 dark:text-indigo-400" />
                    <span>Specifications</span>
                  </div>
                </th>
                
                {/* Products Column Headers */}
                {Array.from({ length: 3 }).map((_, idx) => {
                  const product = compareList[idx];
                  if (!product) {
                    return (
                      <th key={`empty-head-${idx}`} className="p-4 w-[250px] align-middle border-r border-slate-200/50 dark:border-slate-800/80 last:border-r-0">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            navigate("/product");
                          }}
                          className="w-full group/empty flex flex-col items-center justify-center py-6 px-3 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-md bg-slate-50/40 dark:bg-slate-950/20 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all cursor-pointer text-center"
                        >
                          <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 group-hover/empty:bg-indigo-600 text-slate-400 group-hover/empty:text-white flex items-center justify-center transition-colors mb-1.5 shadow-2xs">
                            <Plus size={16} className="stroke-[2.5]" />
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover/empty:text-indigo-600 dark:group-hover/empty:text-indigo-400 transition-colors">
                            Add Product
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            Select item to compare
                          </span>
                        </button>
                      </th>
                    );
                  }

                  const imgUrl = product.image
                    ? Array.isArray(product.image)
                      ? product.image[0]
                      : product.image
                    : product.images?.[0];

                  const isBestPrice = lowestPrice !== null && product.price === lowestPrice;
                  const isTopRated = highestRating !== null && getAverageRating(product) === highestRating;

                  return (
                    <th key={product._id} className="p-4 w-[250px] relative group align-top border-r border-slate-200/70 dark:border-slate-800 last:border-r-0 bg-white dark:bg-slate-900">
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCompare(product._id)}
                        className="absolute top-2.5 right-2.5 h-6 w-6 rounded bg-slate-100 hover:bg-rose-500 hover:text-white dark:bg-slate-800 dark:hover:bg-rose-600 text-slate-400 flex items-center justify-center transition-colors cursor-pointer z-10"
                        title="Remove product from comparison"
                      >
                        <X size={12} />
                      </button>

                      <div className="space-y-2.5">
                        {/* Highlights badge */}
                        <div className="h-5 flex items-center gap-1.5">
                          {isBestPrice && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                              <Sparkles size={10} />
                              Best Price
                            </span>
                          )}
                          {isTopRated && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded">
                              <Star size={10} className="fill-amber-400" />
                              Top Rated
                            </span>
                          )}
                        </div>

                        {/* Product Thumbnail */}
                        <div
                          onClick={() => {
                            onClose();
                            navigate(`/product/${product._id}`);
                          }}
                          className="h-28 w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-md p-2.5 border border-slate-200/80 dark:border-slate-800 overflow-hidden cursor-pointer group-hover:border-indigo-400 dark:group-hover:border-indigo-600 transition-colors"
                        >
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>

                        {/* Product Title */}
                        <h4
                          onClick={() => {
                            onClose();
                            navigate(`/product/${product._id}`);
                          }}
                          className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title={product.name}
                        >
                          {product.name}
                        </h4>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              
              {/* Row: Add to Cart Action */}
              <tr className="bg-slate-50/40 dark:bg-slate-950/20">
                <td className="p-3.5 pl-5 font-bold text-xs text-slate-500 dark:text-slate-400 border-r border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <ShoppingCart size={13} className="text-slate-400" />
                    <span>Purchase Action</span>
                  </div>
                </td>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const product = compareList[idx];
                  if (!product) {
                    return (
                      <td key={`action-${idx}`} className="p-3.5 text-center text-slate-300 dark:text-slate-700 border-r border-slate-200/50 dark:border-slate-800/80 last:border-r-0">
                        —
                      </td>
                    );
                  }
                  const isOOS = product.stock === 0;
                  return (
                    <td key={`action-${idx}`} className="p-3.5 border-r border-slate-200/70 dark:border-slate-800 last:border-r-0">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={isOOS || addingCart[product._id]}
                        className={`w-full py-2 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                          isOOS
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                        }`}
                      >
                        {addingCart[product._id] ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Adding...</span>
                          </>
                        ) : isOOS ? (
                          <span>Out of Stock</span>
                        ) : (
                          <>
                            <ShoppingCart size={13} />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>

              {/* Row: Price */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                <td className="p-3.5 pl-5 font-bold text-xs text-slate-500 dark:text-slate-400 border-r border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Tag size={13} className="text-slate-400" />
                    <span>Price</span>
                  </div>
                </td>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const product = compareList[idx];
                  if (!product) {
                    return (
                      <td key={`price-${idx}`} className="p-3.5 text-center text-slate-300 dark:text-slate-700 border-r border-slate-200/50 dark:border-slate-800/80 last:border-r-0">
                        —
                      </td>
                    );
                  }
                  return (
                    <td key={`price-${idx}`} className="p-3.5 border-r border-slate-200/70 dark:border-slate-800 last:border-r-0">
                      <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Row: Brand */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                <td className="p-3.5 pl-5 font-bold text-xs text-slate-500 dark:text-slate-400 border-r border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Award size={13} className="text-slate-400" />
                    <span>Brand</span>
                  </div>
                </td>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const product = compareList[idx];
                  if (!product) {
                    return (
                      <td key={`brand-${idx}`} className="p-3.5 text-center text-slate-300 dark:text-slate-700 border-r border-slate-200/50 dark:border-slate-800/80 last:border-r-0">
                        —
                      </td>
                    );
                  }
                  return (
                    <td key={`brand-${idx}`} className="p-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 capitalize border-r border-slate-200/70 dark:border-slate-800 last:border-r-0">
                      <div className="inline-flex items-center gap-1.5">
                        <BrandLogo
                          brand={product.brand || "CartNOW"}
                          brandDomain={product.brandDomain}
                          className="w-4 h-4 rounded-xs shrink-0"
                        />
                        <span>{product.brand || "CartNOW"}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row: Category */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                <td className="p-3.5 pl-5 font-bold text-xs text-slate-500 dark:text-slate-400 border-r border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Layers size={13} className="text-slate-400" />
                    <span>Category</span>
                  </div>
                </td>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const product = compareList[idx];
                  if (!product) {
                    return (
                      <td key={`cat-${idx}`} className="p-3.5 text-center text-slate-300 dark:text-slate-700 border-r border-slate-200/50 dark:border-slate-800/80 last:border-r-0">
                        —
                      </td>
                    );
                  }
                  return (
                    <td key={`cat-${idx}`} className="p-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize border-r border-slate-200/70 dark:border-slate-800 last:border-r-0">
                      {product.category || "General"}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Rating */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                <td className="p-3.5 pl-5 font-bold text-xs text-slate-500 dark:text-slate-400 border-r border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Star size={13} className="text-slate-400" />
                    <span>Rating</span>
                  </div>
                </td>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const product = compareList[idx];
                  if (!product) {
                    return (
                      <td key={`rate-${idx}`} className="p-3.5 text-center text-slate-300 dark:text-slate-700 border-r border-slate-200/50 dark:border-slate-800/80 last:border-r-0">
                        —
                      </td>
                    );
                  }
                  const rating = getAverageRating(product);
                  return (
                    <td key={`rate-${idx}`} className="p-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200/70 dark:border-slate-800 last:border-r-0">
                      {rating > 0 ? (
                        <div className="inline-flex items-center gap-1.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 px-2 py-0.5 rounded">
                          <Star size={11} className="fill-amber-400 stroke-amber-400" />
                          <span className="text-amber-800 dark:text-amber-300 font-bold">{rating.toFixed(1)}</span>
                          <span className="text-slate-400 text-[10px]">/ 5</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">No reviews</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Availability */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                <td className="p-3.5 pl-5 font-bold text-xs text-slate-500 dark:text-slate-400 border-r border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Boxes size={13} className="text-slate-400" />
                    <span>Availability</span>
                  </div>
                </td>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const product = compareList[idx];
                  if (!product) {
                    return (
                      <td key={`avail-${idx}`} className="p-3.5 text-center text-slate-300 dark:text-slate-700 border-r border-slate-200/50 dark:border-slate-800/80 last:border-r-0">
                        —
                      </td>
                    );
                  }
                  const isOOS = product.stock === 0;
                  return (
                    <td key={`avail-${idx}`} className="p-3.5 border-r border-slate-200/70 dark:border-slate-800 last:border-r-0">
                      {isOOS ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/40">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">
                          <Check size={11} className="stroke-[3]" />
                          In Stock ({product.stock})
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Technical Specifications Section Divider */}
              <tr className="bg-slate-100/70 dark:bg-slate-950/60 border-y border-slate-200 dark:border-slate-800">
                <td colSpan={4} className="p-2.5 pl-5 font-black text-[10px] text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">
                  Technical Specifications
                </td>
              </tr>

              {/* Dynamic Specifications keys */}
              {specKeys.length > 0 ? (
                specKeys.map((key) => (
                  <tr key={key} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="p-3.5 pl-5 font-bold text-xs text-slate-500 dark:text-slate-400 capitalize border-r border-slate-200/70 dark:border-slate-800">
                      {key}
                    </td>
                    {Array.from({ length: 3 }).map((_, idx) => {
                      const product = compareList[idx];
                      if (!product) {
                        return (
                          <td key={`spec-${key}-${idx}`} className="p-3.5 text-center text-slate-300 dark:text-slate-700 border-r border-slate-200/50 dark:border-slate-800/80 last:border-r-0">
                            —
                          </td>
                        );
                      }
                      const matched = (product.specifications || []).find((s) => s.key === key);
                      return (
                        <td key={`spec-${key}-${idx}`} className="p-3.5 text-xs text-slate-700 dark:text-slate-300 font-medium border-r border-slate-200/70 dark:border-slate-800 last:border-r-0">
                          {matched ? matched.value : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                  <td className="p-3.5 pl-5 font-bold text-xs text-slate-500 dark:text-slate-400 border-r border-slate-200/70 dark:border-slate-800">
                    Additional Specs
                  </td>
                  <td colSpan={3} className="p-3.5 text-xs text-slate-400 dark:text-slate-500 italic">
                    Standard manufacturer warranty and certification apply.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* Modal Sticky Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>Compare up to 3 products simultaneously</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          >
            Close Matrix
          </button>
        </div>

      </div>
    </div>
  );
};

export default ComparisonModal;
