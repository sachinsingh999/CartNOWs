import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Heart,
  ArrowRight,
  ShoppingBag,
  Trash2,
  Sparkles,
  Search,
  SlidersHorizontal,
  Tag,
  PackageCheck,
  Zap,
  Check,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Filter,
  ShoppingCart
} from "lucide-react";
import { backendUrl } from "../config";
import { cachedGet } from "../utils/apiCache";
import { WishlistSkeleton } from "../components/SkeletonLoader";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // 'all', 'inStock', 'onSale'
  const [sortBy, setSortBy] = useState("latest"); // 'latest', 'priceLow', 'priceHigh'
  const [movingAll, setMovingAll] = useState(false);
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();

  const fetchWishlistData = async () => {
    setLoading(true);
    try {
      if (token) {
        const response = await axios.post(
          `${backendUrl}/api/wishlist/get`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          setWishlist(response.data.products || []);
        } else {
          toast.error(response.data.message);
        }
      } else {
        // Guest mode
        const localWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        if (localWishlist.length > 0) {
          const productsRes = await cachedGet(`${backendUrl}/api/product/list`);
          if (productsRes.data?.success) {
            const filtered = productsRes.data.products.filter((p) =>
              localWishlist.includes(p._id)
            );
            setWishlist(filtered);
          }
        } else {
          setWishlist([]);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load favorites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistData();
  }, [token]);

  useEffect(() => {
    const handleWishlistUpdateEvent = () => {
      try {
        const localList = JSON.parse(localStorage.getItem("wishlist")) || [];
        if (!token) {
          setWishlist((prevList) => prevList.filter((item) => localList.includes(item._id)));
        } else {
          fetchWishlistData();
        }
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener("wishlistUpdate", handleWishlistUpdateEvent);
    return () => window.removeEventListener("wishlistUpdate", handleWishlistUpdateEvent);
  }, [token]);

  // Derived metrics
  const totalValue = useMemo(() => {
    return wishlist.reduce((acc, item) => acc + (item.price || 0), 0);
  }, [wishlist]);

  const inStockCount = useMemo(() => {
    return wishlist.filter((item) => item.inStock !== false && (item.stock === undefined || item.stock > 0)).length;
  }, [wishlist]);

  // Filtered & Sorted wishlist items
  const filteredWishlist = useMemo(() => {
    return wishlist
      .filter((product) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const nameMatch = product.name?.toLowerCase().includes(query);
          const categoryMatch = product.category?.toLowerCase().includes(query);
          if (!nameMatch && !categoryMatch) return false;
        }

        // Status filter
        if (selectedFilter === "inStock") {
          const isOOS = product.inStock === false || product.stock === 0;
          if (isOOS) return false;
        } else if (selectedFilter === "onSale") {
          const hasDiscount = product.discount > 0 || product.bestseller || product.popular;
          if (!hasDiscount) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priceLow") return (a.price || 0) - (b.price || 0);
        if (sortBy === "priceHigh") return (b.price || 0) - (a.price || 0);
        return 0; // default latest
      });
  }, [wishlist, searchQuery, selectedFilter, sortBy]);

  // Move All In-Stock items to Cart
  const handleMoveAllToCart = async () => {
    const availableItems = wishlist.filter((p) => p.inStock !== false && (p.stock === undefined || p.stock > 0));
    if (availableItems.length === 0) {
      toast.info("No in-stock items available to add.");
      return;
    }

    setMovingAll(true);
    let guestCart = {};
    try {
      guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
    } catch (e) {}

    let addedCount = 0;

    for (const product of availableItems) {
      const size = product.sizes?.length ? product.sizes[0] : "standard";
      const cartKey = `${product._id}_${size}`;

      if (!token) {
        guestCart[cartKey] = (guestCart[cartKey] || 0) + 1;
        addedCount++;
      } else {
        try {
          const res = await axios.post(
            `${backendUrl}/api/cart/add`,
            { itemId: product._id, size, qty: 1 },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.data.success) {
            guestCart[cartKey] = (guestCart[cartKey] || 0) + 1;
            addedCount++;
          }
        } catch (err) {
          console.error("Cart add error:", err);
        }
      }
    }

    localStorage.setItem("cart", JSON.stringify(guestCart));
    window.dispatchEvent(new Event("cartUpdate"));
    setMovingAll(false);

    if (addedCount > 0) {
      toast.success(`Moved ${addedCount} item${addedCount > 1 ? "s" : ""} to your cart! 🛍️`);
      navigate("/cart");
    } else {
      toast.error("Failed to add items to cart.");
    }
  };

  // Clear entire wishlist
  const handleClearWishlist = async () => {
    if (!window.confirm("Are you sure you want to clear your saved items?")) return;
    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/wishlist/clear`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => {});
      } catch (err) {}
    }
    localStorage.setItem("wishlist", JSON.stringify([]));
    setWishlist([]);
    window.dispatchEvent(new Event("wishlistUpdate"));
    toast.info("Wishlist cleared");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#050508] px-4 sm:px-8 py-10">
        <div className="max-w-[1536px] mx-auto">
          <WishlistSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#050508] px-4 sm:px-6 lg:px-10 py-8 text-[#121217] dark:text-[#FFFFFF] transition-colors duration-200 text-left">
      <div className="max-w-[1536px] mx-auto space-y-6">

        {/* BREADCRUMB & COMBINED HEADER / TOOLBAR CARD */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-emerald-500 transition no-underline text-inherit">Home</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-extrabold">Wishlist</span>
          </div>

          {/* COMBINED HERO HEADER & TOOLBAR CARD */}
          <div className="rounded-md border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0C0F16] p-5 shadow-sm space-y-4">
            
            {/* TOP HALF: Title, Info & Quick Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-4 z-10">
                <div className="h-12 w-12 rounded-md bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shrink-0 shadow-2xs">
                  <Heart size={24} className="fill-rose-500 text-rose-500 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      My Saved Wishlist
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-sm bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-extrabold border border-rose-500/20">
                      {wishlist.length} Item{wishlist.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Save your favorite items, track price drops, and add directly to your bag.
                  </p>
                </div>
              </div>

              {/* QUICK STATS CHIPS */}
              {wishlist.length > 0 && (
                <div className="flex items-center gap-3 shrink-0 flex-wrap z-10">
                  <div className="px-3.5 py-2 rounded-md bg-slate-50 dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                    <PackageCheck size={16} className="text-emerald-500" />
                    <div className="text-left">
                      <span className="text-[9px] font-black uppercase text-slate-400 block leading-tight">In Stock</span>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{inStockCount} Available</span>
                    </div>
                  </div>

                  <div className="px-3.5 py-2 rounded-md bg-slate-50 dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                    <Tag size={16} className="text-amber-500" />
                    <div className="text-left">
                      <span className="text-[9px] font-black uppercase text-slate-400 block leading-tight">Total Value</span>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">₹{totalValue.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BOTTOM HALF: Search, Filter Tabs & Action Buttons */}
            {wishlist.length > 0 && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                {/* Search & Filter Tabs */}
                <div className="flex flex-wrap items-center gap-3 grow">
                  {/* Search Box */}
                  <div className="relative shrink-0 w-full sm:w-60">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search wishlist..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111622] text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {[
                      { id: "all", label: `All (${wishlist.length})` },
                      { id: "inStock", label: `In Stock (${inStockCount})` },
                      { id: "onSale", label: "Deals & Offers" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-md text-xs font-extrabold transition cursor-pointer whitespace-nowrap border ${
                          selectedFilter === tab.id
                            ? "bg-[#10B981] border-[#10B981] text-white shadow-xs"
                            : "bg-slate-50 dark:bg-[#111622] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions: Sort & Bulk Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal size={14} className="text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111622] px-3 py-1.5 text-xs font-extrabold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="latest">Sort: Latest</option>
                      <option value="priceLow">Price: Low to High</option>
                      <option value="priceHigh">Price: High to Low</option>
                    </select>
                  </div>

                  {/* Move All to Cart */}
                  <button
                    onClick={handleMoveAllToCart}
                    disabled={movingAll || inStockCount === 0}
                    className="px-4 py-1.5 rounded-md bg-[#10B981] hover:bg-emerald-600 active:scale-95 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <ShoppingCart size={14} />
                    <span>{movingAll ? "Adding..." : "Add All to Bag"}</span>
                  </button>

                  {/* Clear Wishlist */}
                  <button
                    onClick={handleClearWishlist}
                    className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111622] hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-500 hover:text-rose-500 transition cursor-pointer"
                    title="Clear Wishlist"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* WISHLIST PRODUCT GRID */}
        <AnimatePresence mode="wait">
          {wishlist.length === 0 ? (
            /* EMPTY STATE */
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="py-20 px-6 text-center max-w-lg mx-auto bg-white dark:bg-[#0C0F16] border border-slate-200/80 dark:border-slate-800 rounded-md shadow-sm space-y-6"
            >
              <div className="h-20 w-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20 shadow-xs">
                <Heart size={36} className="fill-rose-500/30 text-rose-500" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Your Wishlist is Empty</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed max-w-sm mx-auto">
                  Explore our top collections and save your favorite electronics, apparel, and accessories for later.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/product"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-md cursor-pointer transition no-underline shadow-xs"
                >
                  <ShoppingBag size={15} />
                  <span>Browse Catalog</span>
                </Link>

                <Link
                  to="/discover"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-[#111622] hover:bg-slate-200 dark:hover:bg-[#1F2937] text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-md cursor-pointer transition no-underline border border-slate-200/80 dark:border-slate-800"
                >
                  <Sparkles size={15} className="text-amber-500" />
                  <span>Discover Deals</span>
                </Link>
              </div>
            </motion.div>
          ) : filteredWishlist.length === 0 ? (
            /* NO SEARCH RESULTS */
            <div className="py-16 text-center bg-white dark:bg-[#0C0F16] border border-slate-200/80 dark:border-slate-800 rounded-md p-8 space-y-4">
              <AlertCircle size={36} className="mx-auto text-slate-400" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">No items found matching your filters</h3>
              <p className="text-xs text-slate-500">Try adjusting your search query or filter options.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFilter("all");
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-[#111622] text-slate-800 dark:text-slate-200 text-xs font-black rounded-md hover:bg-slate-200 transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* PRODUCT GRID */
            <motion.div
              key="favorites-grid"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.04
                  }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {filteredWishlist.map((product) => (
                <motion.div
                  key={product._id}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Wishlist;
