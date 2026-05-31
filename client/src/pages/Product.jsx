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
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const maxPrice = 200000;
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    let active = true;
    setLoading(true);
    axios
      .get(`${backendUrl}/api/product/list`)
      .then((res) => {
        if (!active) return;
        if (res.data.success) setProductList(res.data.products);
        else toast.error(res.data.message);
        setLoading(false);
      })
      .catch((err) => { if (active) { toast.error(err.message); setLoading(false); } });
    return () => { active = false; };
  }, []);

  const categories = useMemo(
    () => ["all", ...new Set(productList.map((p) => p.category).filter(Boolean))],
    [productList]
  );
  const collections = useMemo(() => {
    const base = category === "all" ? productList : productList.filter((p) => p.category === category);
    return ["all", ...new Set(base.map((p) => p.collection).filter(Boolean))];
  }, [productList, category]);

  const filteredList = useMemo(() => {
    let data = [...productList];
    if (category !== "all") data = data.filter((p) => p.category === category);
    if (collection !== "all") data = data.filter((p) => p.collection === collection);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      data = data.filter((p) =>
        [p.name, p.category, p.subCategory, p.collection, p.brand, ...(p.tags || [])]
          .filter(Boolean).join(" ").toLowerCase().includes(q)
      );
    }
    data = data.filter((p) => Number(p.price) <= price);
    if (rating > 0) data = data.filter((p) => getAverageRating(p) >= rating);
    return data.sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return getAverageRating(b) - getAverageRating(a);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [productList, category, collection, price, rating, sortBy, searchQuery]);

  const handleCategoryChange = (val) => { setCategory(val); setCollection("all"); };
  const handleReset = () => {
    setCategory("all"); setCollection("all"); setPrice(maxPrice); setRating(0); setSortBy("featured");
    setSearchParams((cur) => { const n = new URLSearchParams(cur); n.delete("q"); return n; });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">

      {/* Top bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 py-3 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between flex-wrap gap-4 text-left">

          {/* Left: title + count */}
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-905 dark:text-slate-100">
              {searchQuery ? `"${searchQuery}"` : category === "all" ? "All Products" : category}
            </h1>
            <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900/50">
              {filteredList.length}
            </span>
          </div>

          {/* Right: sort dropdown */}
          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer shadow-sm"
            >
              <span>{showMobileFilters ? "Hide Filters" : "Show Filters"}</span>
            </button>

            <span className="text-xs text-slate-450 dark:text-slate-500 font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 cursor-pointer outline-none focus:border-indigo-650 dark:focus:border-indigo-500"
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

      {/* Layout Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">

        {/* Sidebar */}
        <div className={`${showMobileFilters ? "block" : "hidden"} md:block`}>
          <FilterSidebar
            categories={categories}
            collections={collections}
            category={category}
            collection={collection}
            price={price}
            rating={rating}
            maxPrice={maxPrice}
            onCategoryChange={handleCategoryChange}
            onCollectionChange={setCollection}
            onPriceChange={setPrice}
            onRatingChange={setRating}
            onReset={handleReset}
          />
        </div>

        {/* Products Display column */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900/40 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-pulse">
                  <div className="h-48 bg-slate-100 dark:bg-slate-950" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-950 rounded" />
                    <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-950 rounded" />
                    <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-950 rounded mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">No products found</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Try adjusting filters or changing your price boundaries.</p>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-md"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredList.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
