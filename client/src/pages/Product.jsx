import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../pages/ProductCard";
import FilterSidebar from "../componenets/FilterSidebar";
import { backendUrl } from "../config";
import { getAverageRating } from "../utils/productRatings";

const Product = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productList, setProductList] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [category, setCategory] = useState("all");
  const [collection, setCollection] = useState("all");
  const [price, setPrice] = useState(200000);
  const [rating, setRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [dynamicFilters, setDynamicFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const maxPrice = 200000;
  const searchQuery = searchParams.get("q") || "";

  const [adminCategories, setAdminCategories] = useState([]);
  const [baseProducts, setBaseProducts] = useState([]);

  // Fetch admin created categories
  useEffect(() => {
    axios.get(`${backendUrl}/api/product/categories`)
      .then(res => {
        if (res.data.success) {
          setAdminCategories(res.data.categories || []);
        }
      })
      .catch(err => console.log(err));
  }, []);

  // Fetch base products matching only the search query to calculate category/collection item counts
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

  // Compute category counts from base items
  const categoryCounts = useMemo(() => {
    const counts = {};
    baseProducts.forEach((p) => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [baseProducts]);

  // Compute collection counts from base items
  const collectionCounts = useMemo(() => {
    const counts = {};
    baseProducts.forEach((p) => {
      if (p.collection) counts[p.collection] = (counts[p.collection] || 0) + 1;
    });
    return counts;
  }, [baseProducts]);

  // Compute in stock count from base items
  const inStockCount = useMemo(() => {
    return baseProducts.filter((p) => p.stock > 0).length;
  }, [baseProducts]);

  // Compute rating counts from base items
  const ratingCounts = useMemo(() => {
    const counts = { 4: 0, 3: 0, 2: 0, 1: 0 };
    baseProducts.forEach((p) => {
      const avg = getAverageRating(p);
      if (avg >= 4) counts[4]++;
      if (avg >= 3) counts[3]++;
      if (avg >= 2) counts[2]++;
      if (avg >= 1) counts[1]++;
    });
    return counts;
  }, [baseProducts]);

  // Fetch filtered list of products
  const fetchProductsFiltered = () => {
    setLoading(true);
    const params = {
      price,
      q: searchQuery || undefined,
      limit: 10000,
    };

    if (category !== "all") {
      params.category = category;
    }
    if (collection !== "all") {
      params.collection = collection;
    }
    if (rating > 0) {
      params.rating = rating;
    }

    // Include dynamic attributes
    const activeAttrs = {};
    Object.keys(dynamicFilters).forEach((k) => {
      const val = dynamicFilters[k];
      if (val !== undefined && val !== "") {
        if (Array.isArray(val) && val.length === 0) return;
        activeAttrs[k] = val;
      }
    });

    if (Object.keys(activeAttrs).length > 0) {
      params.attributes = JSON.stringify(activeAttrs);
    }

    axios
      .get(`${backendUrl}/api/product/list`, { params })
      .then((res) => {
        if (res.data.success) {
          setProductList(res.data.products);
        } else {
          toast.error(res.data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProductsFiltered();
  }, [category, collection, price, rating, searchQuery, dynamicFilters]);

  // Mapping configurations
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

  // Compute categories & collections lists
  const categoriesList = useMemo(() => {
    if (adminCategories.length > 0) {
      const unique = adminCategories.map(c => c.name);
      unique.sort((a, b) => a.localeCompare(b));
      return ["all", ...unique];
    }
    const unique = [...new Set(productList.map((p) => p.category).filter(Boolean))];
    unique.sort((a, b) => a.localeCompare(b));
    return ["all", ...unique];
  }, [adminCategories, productList]);

  const collectionsList = useMemo(() => {
    const allowed = categoryMapping[category] || [category];
    const base = category === "all" ? productList : productList.filter((p) => allowed.some(a => a.toLowerCase() === p.category?.toLowerCase()));
    const unique = [...new Set(base.map((p) => p.collection).filter(Boolean))];
    unique.sort((a, b) => a.localeCompare(b));
    return ["all", ...unique];
  }, [productList, category, categoryMapping]);

  // Client-side Sorting & Stock filtering
  const sortedList = useMemo(() => {
    let list = [...productList];
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }
    return list.sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return getAverageRating(b) - getAverageRating(a);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [productList, sortBy, inStockOnly]);

  const handleCategoryChange = (val) => {
    setCategory(val);
    setCollection("all");
    setDynamicFilters({});
  };

  const handleReset = () => {
    setCategory("all");
    setCollection("all");
    setPrice(maxPrice);
    setRating(0);
    setInStockOnly(false);
    setSortBy("featured");
    setDynamicFilters({});
    setSearchParams((cur) => {
      const n = new URLSearchParams(cur);
      n.delete("q");
      return n;
    });
  };

  // Compile active filter chips
  const activeFiltersList = useMemo(() => {
    const list = [];
    if (category !== "all") {
      list.push({
        key: "category",
        label: `${category}`,
        clear: () => handleCategoryChange("all")
      });
    }
    if (collection !== "all") {
      list.push({
        key: "collection",
        label: `${collection}`,
        clear: () => setCollection("all")
      });
    }
    if (price < maxPrice) {
      list.push({
        key: "price",
        label: `Under ₹${price.toLocaleString("en-IN")}`,
        clear: () => setPrice(maxPrice)
      });
    }
    if (rating > 0) {
      list.push({
        key: "rating",
        label: `${rating}★ & above`,
        clear: () => setRating(0)
      });
    }
    if (inStockOnly) {
      list.push({
        key: "availability",
        label: "In Stock",
        clear: () => setInStockOnly(false)
      });
    }
    Object.keys(dynamicFilters).forEach((k) => {
      const val = dynamicFilters[k];
      if (val !== undefined && val !== "") {
        if (Array.isArray(val) && val.length === 0) return;
        list.push({
          key: `dyn_${k}`,
          label: `${k}: ${Array.isArray(val) ? val.join(", ") : val}`,
          clear: () => {
            const next = { ...dynamicFilters };
            delete next[k];
            setDynamicFilters(next);
          }
        });
      }
    });
    return list;
  }, [category, collection, price, rating, dynamicFilters, maxPrice]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      
      {/* ── Category Bar: Compact Horizontal Pills ── */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 py-2 transition-colors duration-200">
        <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
            {categoriesList.map((cat) => {
              const isActive = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer capitalize ${
                    isActive
                      ? "bg-slate-900 dark:bg-indigo-650 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat === "all" ? "All Departments" : cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Sorting and Results Summary bar ── */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/10 py-2.5 transition-colors duration-200 text-left">
        <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between flex-wrap gap-3">
          
          {/* Left: Result statistics & applied filter chips */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Discovery Dashboard
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ({sortedList.length} {sortedList.length === 1 ? "product" : "products"} available)
              </span>
            </div>
            
            {/* Active Filter Chips */}
            {activeFiltersList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center mt-1">
                {activeFiltersList.map((f) => (
                  <button
                    key={f.key}
                    onClick={f.clear}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/40 text-[10px] font-black text-indigo-700 dark:text-indigo-400 hover:border-red-400 dark:hover:border-red-900 hover:text-red-650 dark:hover:text-red-400 transition-colors cursor-pointer capitalize"
                  >
                    <span>{f.label}</span>
                    <span className="font-extrabold ml-0.5">×</span>
                  </button>
                ))}
                <button
                  onClick={handleReset}
                  className="text-[10px] font-extrabold text-orange-500 hover:text-orange-600 cursor-pointer ml-1.5"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Right: Sort controls & mobile toggle */}
          <div className="flex items-center gap-2">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-750 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-sm"
            >
              <span>{showMobileFilters ? "Hide Filters" : "Filters"}</span>
            </button>

            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 cursor-pointer outline-none focus:border-indigo-650 dark:focus:border-indigo-500 shadow-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">A – Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Main Layout Columns ── */}
      <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 py-4 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">
        
        {/* Compact Sticky Sidebar */}
        <div className={`${showMobileFilters ? "block" : "hidden"} md:block md:sticky md:top-20 md:max-h-[calc(100vh-6.5rem)] md:overflow-y-auto pr-1`}>
          <FilterSidebar
            categories={categoriesList}
            collections={collectionsList}
            category={category}
            collection={collection}
            price={price}
            rating={rating}
            maxPrice={maxPrice}
            onCategoryChange={handleCategoryChange}
            onCollectionChange={setCollection}
            onPriceChange={setPrice}
            onRatingChange={setRating}
            dynamicFilters={dynamicFilters}
            onDynamicFiltersChange={setDynamicFilters}
            onReset={handleReset}
            categoryCounts={categoryCounts}
            collectionCounts={collectionCounts}
            inStockOnly={inStockOnly}
            onInStockOnlyChange={setInStockOnly}
            inStockCount={inStockCount}
            ratingCounts={ratingCounts}
            totalResultsCount={sortedList.length}
            onCloseMobileFilters={() => setShowMobileFilters(false)}
          />
        </div>

        {/* High-density Product Display Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900/40 rounded-xl overflow-hidden border border-slate-150 dark:border-slate-800 animate-pulse">
                  <div className="aspect-square bg-slate-100 dark:bg-slate-950" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-950 rounded" />
                    <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-950 rounded" />
                    <div className="h-5 w-1/3 bg-slate-100 dark:bg-slate-955 rounded mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedList.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">No products found</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Try adjusting filters or changing your price boundaries.</p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer shadow"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {sortedList.map((item) => (
                <ProductCard key={item._id} product={item} compact={true} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Product;
