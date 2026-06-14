import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProductCard from "../pages/ProductCard";
import FilterSidebar from "../componenets/FilterSidebar";
import { backendUrl } from "../config";
import { getAverageRating } from "../utils/productRatings";
import { Star, X, ShoppingCart, Eye, AlertTriangle, ArrowRight, Filter, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

const Product = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  // Page level states
  const [productList, setProductList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active filter state variables
  const [sortBy, setSortBy] = useState("featured");
  const [category, setCategory] = useState("all");
  const [collection, setCollection] = useState("all");
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [price, setPrice] = useState(200000);
  const [rating, setRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Mobile filters sidebar toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Quick view product states
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewActiveImg, setQuickViewActiveImg] = useState("");
  const [quickViewSelectedSize, setQuickViewSelectedSize] = useState("");

  const maxPrice = 200000;
  const prevFiltersRef = useRef(null);

  // Fetch admin created categories for pills
  const [adminCategories, setAdminCategories] = useState([]);
  const [baseProducts, setBaseProducts] = useState([]);

  useEffect(() => {
    axios.get(`${backendUrl}/api/product/categories`)
      .then(res => {
        if (res.data.success) {
          setAdminCategories(res.data.categories || []);
        }
      })
      .catch(err => console.log(err));
  }, []);

  // Fetch base products matching search term to compute filter metadata & counts locally
  useEffect(() => {
    const params = { q: searchQuery || undefined, limit: 10000 };
    axios.get(`${backendUrl}/api/product/list`, { params })
      .then((res) => {
        if (res.data.success) {
          setBaseProducts(res.data.products || []);
        }
      })
      .catch(() => {});
  }, [searchQuery]);

  // Main product loader
  const fetchProducts = async (pageToFetch) => {
    setLoading(true);
    setError(null);

    const params = {
      page: pageToFetch,
      limit: 20,
      price,
      q: searchQuery || undefined,
      sortBy
    };

    if (category !== "all") params.category = category;
    if (collection !== "all") params.collection = collection;
    if (rating > 0) params.rating = rating;
    if (inStockOnly) params.availability = "in-stock";
    if (minDiscount > 0) params.discount = minDiscount;

    if (selectedSubCategories.length > 0) {
      params.subCategory = selectedSubCategories.join(",");
    }
    if (selectedBrands.length > 0) {
      params.brand = selectedBrands.join(",");
    }
    if (selectedLocations.length > 0) {
      params.location = selectedLocations.join(",");
    }

    try {
      const res = await axios.get(`${backendUrl}/api/products`, { params });
      if (res.data.success) {
        const newProducts = res.data.products || [];
        setProductList(newProducts);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        setHasMore(res.data.hasMore ?? (newProducts.length === 20));
      } else {
        setError(res.data.message || "Failed to load products");
      }
    } catch (err) {
      console.error("Fetch products error:", err);
      setError(err.message || "Network connection failed");
    } finally {
      setLoading(false);
    }
  };

  // Manage pagination and filter synchronization to prevent double fetching
  useEffect(() => {
    const filtersObj = {
      category,
      collection,
      selectedSubCategories,
      selectedBrands,
      selectedLocations,
      price,
      rating,
      minDiscount,
      inStockOnly,
      searchQuery,
      sortBy
    };
    const filtersStr = JSON.stringify(filtersObj);

    if (prevFiltersRef.current !== null && prevFiltersRef.current !== filtersStr) {
      // If a filter changed, reset page to 1
      prevFiltersRef.current = filtersStr;
      if (page !== 1) {
        setPage(1);
        return; // wait for next run triggered by page state change
      }
    }

    prevFiltersRef.current = filtersStr;
    fetchProducts(page);
  }, [
    page,
    category,
    collection,
    selectedSubCategories,
    selectedBrands,
    selectedLocations,
    price,
    rating,
    minDiscount,
    inStockOnly,
    searchQuery,
    sortBy
  ]);

  // Pagination page generation helper
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }
    return pages;
  };

  const handlePageChange = (p) => {
    if (p === page || p === "...") return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Compute category/collection mapping configurations
  const { categoryMapping } = useMemo(() => {
    const mapping = {};
    adminCategories.forEach(c => {
      const subList = c.subcategories || [];
      const children = adminCategories.filter(child => child.parentCategoryId?.toString() === c._id?.toString());
      const allAllowed = [c.name, ...subList, ...children.map(child => child.name)];
      mapping[c.name] = allAllowed;
    });
    return { categoryMapping: mapping };
  }, [adminCategories]);

  // Dynamic filter checklists computed from search results
  const categoriesList = useMemo(() => {
    if (adminCategories.length > 0) {
      const unique = adminCategories.map(c => c.name);
      return ["all", ...unique.sort()];
    }
    const unique = [...new Set(baseProducts.map(p => p.category).filter(Boolean))];
    return ["all", ...unique.sort()];
  }, [adminCategories, baseProducts]);

  const collectionsList = useMemo(() => {
    const allowed = categoryMapping[category] || [category];
    const base = category === "all" ? baseProducts : baseProducts.filter(p => allowed.some(a => a.toLowerCase() === p.category?.toLowerCase()));
    const unique = [...new Set(base.map(p => p.collection).filter(Boolean))];
    return unique.sort();
  }, [baseProducts, category, categoryMapping]);

  const subCategoriesList = useMemo(() => {
    const allowed = categoryMapping[category] || [category];
    const base = category === "all" ? baseProducts : baseProducts.filter(p => allowed.some(a => a.toLowerCase() === p.category?.toLowerCase()));
    const unique = [...new Set(base.map(p => p.subCategory).filter(Boolean))];
    return unique.sort();
  }, [baseProducts, category, categoryMapping]);

  const brandsList = useMemo(() => {
    const allowed = categoryMapping[category] || [category];
    const base = category === "all" ? baseProducts : baseProducts.filter(p => allowed.some(a => a.toLowerCase() === p.category?.toLowerCase()));
    const unique = [...new Set(base.map(p => p.brand).filter(Boolean))];
    return unique.sort();
  }, [baseProducts, category, categoryMapping]);

  const locationsList = ["Delhi", "Mumbai", "Bangalore", "Chennai"];

  // Filter counters calculations
  const categoryCounts = useMemo(() => {
    const counts = {};
    baseProducts.forEach(p => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [baseProducts]);

  const subCategoryCounts = useMemo(() => {
    const counts = {};
    baseProducts.forEach(p => {
      if (p.subCategory) counts[p.subCategory] = (counts[p.subCategory] || 0) + 1;
    });
    return counts;
  }, [baseProducts]);

  const brandCounts = useMemo(() => {
    const counts = {};
    baseProducts.forEach(p => {
      if (p.brand) counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, [baseProducts]);

  const locationCounts = useMemo(() => {
    const counts = {};
    baseProducts.forEach(p => {
      const loc = p.location || "Delhi";
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return counts;
  }, [baseProducts]);

  const inStockCount = useMemo(() => {
    return baseProducts.filter(p => p.stock > 0).length;
  }, [baseProducts]);

  const ratingCounts = useMemo(() => {
    const counts = { 4: 0, 3: 0, 2: 0, 1: 0 };
    baseProducts.forEach(p => {
      const avg = getAverageRating(p);
      if (avg >= 4) counts[4]++;
      if (avg >= 3) counts[3]++;
      if (avg >= 2) counts[2]++;
      if (avg >= 1) counts[1]++;
    });
    return counts;
  }, [baseProducts]);

  const discountCounts = useMemo(() => {
    const counts = { 10: 0, 20: 0, 30: 0, 40: 0, 50: 0 };
    baseProducts.forEach(p => {
      const originalVal = p.originalPrice || Math.round(p.price * 1.25);
      const discount = Math.round(((originalVal - p.price) / originalVal) * 100);
      if (discount >= 10) counts[10]++;
      if (discount >= 20) counts[20]++;
      if (discount >= 30) counts[30]++;
      if (discount >= 40) counts[40]++;
      if (discount >= 50) counts[50]++;
    });
    return counts;
  }, [baseProducts]);

  // Multiselect toggle handlers
  const handleToggleCategory = (val) => {
    setSelectedCategories(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handleToggleSubCategory = (val) => {
    setSelectedSubCategories(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handleToggleBrand = (val) => {
    setSelectedBrands(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handleToggleLocation = (val) => {
    setSelectedLocations(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handleCategoryPillChange = (val) => {
    setCategory(val);
    setSelectedSubCategories([]);
    setSelectedBrands([]);
    setSelectedLocations([]);
  };

  const handleReset = () => {
    setCategory("all");
    setCollection("all");
    setSelectedSubCategories([]);
    setSelectedBrands([]);
    setSelectedLocations([]);
    setPrice(maxPrice);
    setRating(0);
    setMinDiscount(0);
    setInStockOnly(false);
    setSortBy("featured");
    setSearchParams((cur) => {
      const n = new URLSearchParams(cur);
      n.delete("q");
      return n;
    });
  };

  // Compile active filter chips
  const activeFiltersChips = useMemo(() => {
    const chips = [];
    if (category !== "all") {
      chips.push({
        key: "category",
        label: `Dept: ${category}`,
        clear: () => setCategory("all")
      });
    }
    selectedSubCategories.forEach(s => {
      chips.push({
        key: `sub_${s}`,
        label: s,
        clear: () => handleToggleSubCategory(s)
      });
    });
    selectedBrands.forEach(b => {
      chips.push({
        key: `brand_${b}`,
        label: b,
        clear: () => handleToggleBrand(b)
      });
    });
    selectedLocations.forEach(l => {
      chips.push({
        key: `loc_${l}`,
        label: `${l} Origin`,
        clear: () => handleToggleLocation(l)
      });
    });
    if (price < maxPrice) {
      chips.push({
        key: "price",
        label: `Under ₹${price.toLocaleString("en-IN")}`,
        clear: () => setPrice(maxPrice)
      });
    }
    if (rating > 0) {
      chips.push({
        key: "rating",
        label: `${rating}★ & above`,
        clear: () => setRating(0)
      });
    }
    if (minDiscount > 0) {
      chips.push({
        key: "discount",
        label: `${minDiscount}% Off & above`,
        clear: () => setMinDiscount(0)
      });
    }
    if (inStockOnly) {
      chips.push({
        key: "availability",
        label: "In Stock",
        clear: () => setInStockOnly(false)
      });
    }
    return chips;
  }, [category, selectedSubCategories, selectedBrands, selectedLocations, price, rating, minDiscount, inStockOnly]);

  // Variant selector and cart trigger inside Quick View Modal
  const openQuickView = (p) => {
    setQuickViewProduct(p);
    setQuickViewSelectedSize(p.sizes?.length ? p.sizes[0] : "standard");
    const src = p.images?.[0] || p.image || "";
    setQuickViewActiveImg(src.startsWith("http") ? src : `${backendUrl}/${src}`);
  };

  const handleQuickViewAddToCart = async () => {
    if (!quickViewProduct) return;
    const token = localStorage.getItem("token") || "";

    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      const key = `${quickViewProduct._id}_${quickViewSelectedSize}`;
      guestCart[key] = (guestCart[key] || 0) + 1;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      window.dispatchEvent(new Event("cartUpdate"));
      toast.success("Added to cart! 🛍️");
    } else {
      try {
        const res = await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId: quickViewProduct._id, size: quickViewSelectedSize, qty: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          window.dispatchEvent(new Event("cartUpdate"));
          toast.success("Added to cart! 🛍️");
        } else {
          toast.error(res.data.message);
        }
      } catch (err) {
        toast.error("Error adding to cart");
      }
    }
    setQuickViewProduct(null);
  };

  const handleQuickViewBuyNow = async () => {
    await handleQuickViewAddToCart();
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative text-left">
      


      {/* ── Active filters bar & statistics summary ── */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/30 py-3 transition-colors duration-250">
        <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                Showing results
              </span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {productList.length} of {totalCount} items
              </span>
            </div>

            {/* Chips block */}
            {activeFiltersChips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center mt-2.5">
                {activeFiltersChips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={chip.clear}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900/30 text-[10.5px] font-black text-indigo-600 dark:text-indigo-400 hover:border-rose-400 dark:hover:border-rose-900 hover:text-rose-500 transition-all cursor-pointer capitalize shadow-xs"
                  >
                    <span>{chip.label}</span>
                    <X size={10} className="stroke-[3px]" />
                  </button>
                ))}
                <button
                  onClick={handleReset}
                  className="text-[10px] font-black uppercase tracking-wider text-orange-500 hover:text-orange-600 cursor-pointer ml-2"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-sm"
            >
              <SlidersHorizontal size={12} />
              <span>Filters</span>
            </button>

            {/* Sort selection dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-250 bg-white dark:bg-slate-900 cursor-pointer outline-none focus:border-indigo-500 shadow-sm"
              >
                <option value="featured">Best Matches</option>
                <option value="popularity">Popularity</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="highest-rated">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layout Grid Columns ── */}
      <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-start relative">
        
        {/* Desktop Sidebar filter card */}
        <div className="hidden md:block sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1 select-none scrollbar-hide">
          <FilterSidebar
            categories={categoriesList}
            subCategories={subCategoriesList}
            brands={brandsList}
            locations={locationsList}
            selectedCategories={[]}
            selectedSubCategories={selectedSubCategories}
            selectedBrands={selectedBrands}
            selectedLocations={selectedLocations}
            price={price}
            maxPrice={maxPrice}
            rating={rating}
            minDiscount={minDiscount}
            inStockOnly={inStockOnly}
            onSubCategoryToggle={handleToggleSubCategory}
            onBrandToggle={handleToggleBrand}
            onLocationToggle={handleToggleLocation}
            onPriceChange={setPrice}
            onRatingChange={setRating}
            onDiscountChange={setMinDiscount}
            onInStockOnlyChange={setInStockOnly}
            onReset={handleReset}
            categoryCounts={categoryCounts}
            subCategoryCounts={subCategoryCounts}
            brandCounts={brandCounts}
            locationCounts={locationCounts}
            ratingCounts={ratingCounts}
            discountCounts={discountCounts}
            inStockCount={inStockCount}
            totalResultsCount={totalCount}
          />
        </div>

        {/* Mobile Filters bottom sheet Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full flex flex-col justify-between shadow-2xl relative animate-slide-left p-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Filter size={15} />
                  Filters Control Panel
                </span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                <FilterSidebar
                  categories={categoriesList}
                  subCategories={subCategoriesList}
                  brands={brandsList}
                  locations={locationsList}
                  selectedCategories={[]}
                  selectedSubCategories={selectedSubCategories}
                  selectedBrands={selectedBrands}
                  selectedLocations={selectedLocations}
                  price={price}
                  maxPrice={maxPrice}
                  rating={rating}
                  minDiscount={minDiscount}
                  inStockOnly={inStockOnly}
                  onSubCategoryToggle={handleToggleSubCategory}
                  onBrandToggle={handleToggleBrand}
                  onLocationToggle={handleToggleLocation}
                  onPriceChange={setPrice}
                  onRatingChange={setRating}
                  onDiscountChange={setMinDiscount}
                  onInStockOnlyChange={setInStockOnly}
                  onReset={handleReset}
                  categoryCounts={categoryCounts}
                  subCategoryCounts={subCategoryCounts}
                  brandCounts={brandCounts}
                  locationCounts={locationCounts}
                  ratingCounts={ratingCounts}
                  discountCounts={discountCounts}
                  inStockCount={inStockCount}
                  totalResultsCount={totalCount}
                  onCloseMobileFilters={() => setShowMobileFilters(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Product listing grid content area */}
        <div className="flex-1 w-full">
          {error ? (
            <div className="text-center py-16 px-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg max-w-xl mx-auto space-y-4">
              <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Failed to Retrieve Catalog</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
                {error}. Please check your internet connectivity or connection token and try again.
              </p>
              <button
                onClick={() => fetchProducts(page, page === 1)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 shadow cursor-pointer border border-indigo-500/20"
              >
                Retry Connection
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : productList.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto space-y-4">
              <span className="text-3xl block">📦</span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">No Matching Items Found</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto leading-relaxed">
                We couldn't locate any products matching your filters. Try clearing some checklists, widening your price slider, or view our suggested departments below.
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {["Fashion", "Electronics", "Beauty", "Home"].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      setCategory(dept);
                      setSelectedSubCategories([]);
                    }}
                    className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-[10.5px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 rounded-xl hover:bg-indigo-600 hover:text-white transition duration-200 cursor-pointer"
                  >
                    {dept} Collection
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 shadow cursor-pointer border border-indigo-500/20"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Product Card grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {productList.map((item) => (
                  <ProductCard 
                    key={item._id} 
                    product={item} 
                    onQuickView={openQuickView}
                  />
                ))}
              </div>

              {/* Traditional Page-by-Page Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-10 pb-4">
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <ChevronLeft size={14} className="stroke-[2.5px]" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {getPageNumbers().map((p, idx) => {
                      if (p === "...") {
                        return (
                          <span key={`dots-${idx}`} className="px-2 text-slate-400 dark:text-slate-600 font-bold text-sm">
                            ...
                          </span>
                        );
                      }
                      const isCurrent = p === page;
                      return (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`h-9 w-9 flex items-center justify-center rounded-xl text-xs font-black transition-all cursor-pointer active:scale-90 ${
                            isCurrent
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                              : "border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={14} className="stroke-[2.5px]" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── Quick View Modal overlay ── */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col md:flex-row gap-6 text-left">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 h-8 w-8 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer z-20"
            >
              <X size={16} />
            </button>

            {/* Left side: Images gallery and thumbnailstrip */}
            <div className="flex-1 flex flex-col gap-3.5">
              <div className="h-72 w-full bg-slate-50 dark:bg-slate-950/40 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden border border-slate-150 dark:border-slate-800">
                <img
                  src={quickViewActiveImg}
                  alt={quickViewProduct.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Thumbnails row */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide py-0.5">
                {(quickViewProduct.images || [quickViewProduct.image]).map((img, index) => {
                  const url = img.startsWith("http") ? img : `${backendUrl}/${img}`;
                  const isSelected = quickViewActiveImg === url;
                  return (
                    <button
                      key={index}
                      onClick={() => setQuickViewActiveImg(url)}
                      className={`h-14 w-14 rounded-xl overflow-hidden bg-slate-50 p-1 border shrink-0 transition-all cursor-pointer ${
                        isSelected 
                          ? "border-indigo-600 dark:border-indigo-500 scale-102 ring-2 ring-indigo-600/20" 
                          : "border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                      }`}
                    >
                      <img src={url} alt={`thumbnail-${index}`} className="w-full h-full object-contain" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side: Product specifications details */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <span className="text-[10px] font-black tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
                  {quickViewProduct.brand || "CartNOW Selection"}
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                  {quickViewProduct.name}
                </h2>
                
                {/* Rating */}
                <div className="flex items-center gap-1 text-xs">
                  <div className="flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded-md text-amber-500 font-bold">
                    <Star size={11} className="fill-amber-500 stroke-none" />
                    <span>{quickViewProduct.avgRating ? Number(quickViewProduct.avgRating).toFixed(1) : "New"}</span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold">
                    ({quickViewProduct.reviewCount || 0} customer reviews)
                  </span>
                </div>

                {/* Price block */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    ₹{Number(quickViewProduct.price).toLocaleString("en-IN")}
                  </span>
                  {quickViewProduct.originalPrice > quickViewProduct.price && (
                    <>
                      <span className="text-sm text-slate-400 line-through">
                        ₹{Number(quickViewProduct.originalPrice).toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/15">
                        {quickViewProduct.discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light line-clamp-4 pt-1">
                  {quickViewProduct.description}
                </p>

                {/* Size selections */}
                {quickViewProduct.sizes?.length > 0 && (
                  <div className="space-y-1.5 pt-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Select Sizing:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {quickViewProduct.sizes.map((sz) => {
                        const isSel = quickViewSelectedSize === sz;
                        return (
                          <button
                            key={sz}
                            onClick={() => setQuickViewSelectedSize(sz)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer capitalize ${
                              isSel 
                                ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-900/15" 
                                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout actions */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleQuickViewAddToCart}
                  className="py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-250 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-wider active:scale-98 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart size={13} />
                  <span>Add To Cart</span>
                </button>
                <button
                  onClick={handleQuickViewBuyNow}
                  className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider active:scale-98 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-900/15"
                >
                  <span>Buy Now</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 overflow-hidden p-3.5 space-y-4 animate-pulse">
    <div className="aspect-square w-full bg-slate-100 dark:bg-slate-850 rounded-xl" />
    <div className="space-y-2">
      <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-850 rounded" />
      <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-850 rounded" />
      <div className="h-3.5 w-1/2 bg-slate-100 dark:bg-slate-850 rounded mt-3" />
      <div className="h-8 w-full bg-slate-100 dark:bg-slate-850 rounded mt-4" />
    </div>
  </div>
);

export default Product;
