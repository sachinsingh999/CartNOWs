import React, { useState, useEffect, useMemo } from "react";
import { getAverageRating } from "../utils/productRatings";

const CategoryFilterSidebar = ({ productList, setFilteredList }) => {
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState(200000);
  const [rating, setRating] = useState(0);
  const maxPrice = 200000;

  // Track expanded state for clean accordion layout
  const [expanded, setExpanded] = useState({
    category: true,
    price: true,
    rating: true,
  });

  const toggleSection = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const categories = useMemo(() => [
    "all", ...new Set(productList.map((item) => item.category).filter(Boolean)),
  ], [productList]);

  const applyFilter = (cat, pr, rat) => {
    let data = [...productList];
    if (cat !== "all") data = data.filter((item) => item.category?.toLowerCase() === cat.toLowerCase());
    data = data.filter((item) => item.price <= pr);
    if (rat > 0) data = data.filter((item) => getAverageRating(item) >= rat);
    setFilteredList(data);
  };

  useEffect(() => {
    applyFilter(category, price, rating);
  }, [productList, category, price, rating]);

  const handleReset = () => {
    setCategory("all");
    setPrice(maxPrice);
    setRating(0);
    setFilteredList(productList);
  };

  const activeCount = [
    category !== "all",
    price < maxPrice,
    rating > 0,
  ].filter(Boolean).length;

  return (
    <aside className="sticky top-24 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 h-fit text-[13px] shadow-lg shadow-slate-100/50 dark:shadow-slate-950/80 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 text-left">
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Filters
          </span>
          {activeCount > 0 && (
            <span className="text-[10px] font-black text-white bg-indigo-600 dark:bg-indigo-500 px-2 py-0.5 rounded-full shadow-sm animate-pulse">
              {activeCount}
            </span>
          )}
        </div>
        <button
          onClick={handleReset}
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl cursor-pointer hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-4 text-left">
        {/* Category */}
        <div className="border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl p-3.5 transition-all">
          <button
            onClick={() => toggleSection("category")}
            className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
          >
            <span>Category</span>
            <svg
              className={`w-3 h-3 transform transition-transform duration-300 ${
                expanded.category ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {expanded.category && (
            <div className="mt-3.5 animate-fadeIn">
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => {
                  const isActive = category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        applyFilter(cat, price, rating);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 capitalize ${
                        isActive
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-100 dark:shadow-slate-950 scale-102"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-355 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                    >
                      {cat === "all" ? "All" : cat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Price Slider */}
        <div className="border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl p-3.5 transition-all">
          <button
            onClick={() => toggleSection("price")}
            className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
          >
            <span>Price Range</span>
            <svg
              className={`w-3 h-3 transform transition-transform duration-300 ${
                expanded.price ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {expanded.price && (
            <div className="mt-3.5 animate-fadeIn">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  Max Budget
                </span>
                <span className="text-sm font-extrabold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-200/50 dark:border-indigo-900/50">
                  ₹{price.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={price}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPrice(v);
                  applyFilter(category, v, rating);
                }}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 transition-all focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-bold">
                <span>₹0</span>
                <span>₹{maxPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl p-3.5 transition-all">
          <button
            onClick={() => toggleSection("rating")}
            className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
          >
            <span>Min Rating</span>
            <svg
              className={`w-3 h-3 transform transition-transform duration-300 ${
                expanded.rating ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {expanded.rating && (
            <div className="mt-3.5 space-y-2 animate-fadeIn">
              {[4, 3, 2].map((r) => {
                const isActive = rating === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      const next = rating === r ? 0 : r;
                      setRating(next);
                      applyFilter(category, price, next);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border w-full text-left transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
                      isActive
                        ? "border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm shadow-indigo-100 dark:shadow-slate-950"
                        : "border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-350 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <span className="text-amber-500 text-sm tracking-tighter flex gap-0.5">
                      {"★".repeat(r)}
                      <span className="opacity-25">{"★".repeat(5 - r)}</span>
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isActive
                          ? "text-white"
                          : "text-slate-650 dark:text-slate-400"
                      }`}
                    >
                      {r}+ stars
                    </span>
                    {isActive && (
                      <span className="ml-auto text-white text-xs font-black">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default CategoryFilterSidebar;
