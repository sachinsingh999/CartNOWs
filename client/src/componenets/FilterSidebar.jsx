import React, { useState } from "react";

const FilterSidebar = ({
  categories = [],
  subCategories = [],
  brands = [],
  locations = [],
  selectedCategories = [],
  selectedSubCategories = [],
  selectedBrands = [],
  selectedLocations = [],
  price = 200000,
  maxPrice = 200000,
  rating = 0,
  minDiscount = 0,
  inStockOnly = false,
  onCategoryToggle,
  onSubCategoryToggle,
  onBrandToggle,
  onLocationToggle,
  onPriceChange,
  onRatingChange,
  onDiscountChange,
  onInStockOnlyChange,
  onReset,
  categoryCounts = {},
  subCategoryCounts = {},
  brandCounts = {},
  locationCounts = {},
  ratingCounts = {},
  discountCounts = {},
  inStockCount = 0,
  totalResultsCount = 0,
  onCloseMobileFilters,
}) => {
  const [expanded, setExpanded] = useState({
    category: true,
    subCategory: true,
    brand: true,
    price: true,
    rating: true,
    discount: true,
    location: true,
    availability: true,
  });

  const toggleSection = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const activeCount = [
    selectedCategories.length > 0,
    selectedSubCategories.length > 0,
    selectedBrands.length > 0,
    selectedLocations.length > 0,
    price < maxPrice,
    rating > 0,
    minDiscount > 0,
    inStockOnly,
  ].filter(Boolean).length;

  const percentage = (price / maxPrice) * 100;

  return (
    <aside className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 h-fit text-[13px] shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 text-left">
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Filters
          </span>
          {activeCount > 0 && (
            <span className="text-[10px] font-black text-white bg-indigo-600 dark:bg-indigo-500 px-2 py-0.5 rounded-full shadow-sm">
              {activeCount}
            </span>
          )}
        </div>
        <button
          onClick={onReset}
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-450 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-xl cursor-pointer hover:shadow-sm transition-all duration-200"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {/* Department / Category */}
        <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/35 dark:bg-slate-850/20 rounded-2xl p-3.5 transition-all">
          <button
            onClick={() => toggleSection("category")}
            className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
          >
            <span>Category</span>
            <svg
              className={`w-3 h-3 transform transition-transform duration-350 ${
                expanded.category ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded.category && (
            <div className="mt-3">
              <MultiSelectChecklist
                items={categories}
                selectedList={selectedCategories}
                onToggle={onCategoryToggle}
                counts={categoryCounts}
                searchPlaceholder="Search categories..."
              />
            </div>
          )}
        </div>

        {/* Subcategory */}
        {subCategories.length > 0 && (
          <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/35 dark:bg-slate-850/20 rounded-2xl p-3.5 transition-all">
            <button
              onClick={() => toggleSection("subCategory")}
              className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
            >
              <span>Subcategory</span>
              <svg
                className={`w-3 h-3 transform transition-transform duration-350 ${
                  expanded.subCategory ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expanded.subCategory && (
              <div className="mt-3">
                <MultiSelectChecklist
                  items={subCategories}
                  selectedList={selectedSubCategories}
                  onToggle={onSubCategoryToggle}
                  counts={subCategoryCounts}
                  searchPlaceholder="Search subcategories..."
                />
              </div>
            )}
          </div>
        )}

        {/* Brand */}
        {brands.length > 0 && (
          <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/35 dark:bg-slate-850/20 rounded-2xl p-3.5 transition-all">
            <button
              onClick={() => toggleSection("brand")}
              className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
            >
              <span>Brand</span>
              <svg
                className={`w-3 h-3 transform transition-transform duration-350 ${
                  expanded.brand ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expanded.brand && (
              <div className="mt-3">
                <MultiSelectChecklist
                  items={brands}
                  selectedList={selectedBrands}
                  onToggle={onBrandToggle}
                  counts={brandCounts}
                  searchPlaceholder="Search brands..."
                />
              </div>
            )}
          </div>
        )}

        {/* Shipping Location */}
        <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/35 dark:bg-slate-850/20 rounded-2xl p-3.5 transition-all">
          <button
            onClick={() => toggleSection("location")}
            className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
          >
            <span>Shipping Origin</span>
            <svg
              className={`w-3 h-3 transform transition-transform duration-350 ${
                expanded.location ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded.location && (
            <div className="mt-3">
              <MultiSelectChecklist
                items={locations}
                selectedList={selectedLocations}
                onToggle={onLocationToggle}
                counts={locationCounts}
                searchPlaceholder="Search cities..."
              />
            </div>
          )}
        </div>

        {/* Price Slider */}
        <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/35 dark:bg-slate-850/20 rounded-2xl p-3.5 transition-all">
          <button
            onClick={() => toggleSection("price")}
            className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
          >
            <span>Price Range</span>
            <svg
              className={`w-3 h-3 transform transition-transform duration-350 ${
                expanded.price ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded.price && (
            <div className="mt-3 text-left space-y-3">
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                <span>₹0</span>
                <span>₹{maxPrice.toLocaleString("en-IN")}+</span>
              </div>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={price}
                onChange={(e) => onPriceChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 transition-all focus:outline-none bg-slate-100 dark:bg-slate-800"
                style={{
                  background: `linear-gradient(to right, rgb(79, 70, 229) ${percentage}%, rgba(156, 163, 175, 0.2) ${percentage}%)`
                }}
              />
              
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-left">
                  <span className="text-[9px] text-slate-400 font-bold block">Min Price</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">₹0</span>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-left">
                  <span className="text-[9px] text-slate-400 font-bold block">Max Price</span>
                  <div className="flex items-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">₹</span>
                    <input
                      type="text"
                      value={price.toLocaleString("en-IN")}
                      onChange={(e) => {
                        const val = Number(e.target.value.replace(/[^0-9]/g, ""));
                        onPriceChange(val > maxPrice ? maxPrice : val);
                      }}
                      className="w-full bg-transparent border-none outline-none p-0 text-xs font-bold text-slate-700 dark:text-slate-350 focus:ring-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rating Checklist */}
        <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/35 dark:bg-slate-850/20 rounded-2xl p-3.5 transition-all">
          <button
            onClick={() => toggleSection("rating")}
            className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
          >
            <span>Customer Rating</span>
            <svg
              className={`w-3 h-3 transform transition-transform duration-350 ${
                expanded.rating ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded.rating && (
            <div className="mt-3 space-y-1.5">
              {[4, 3, 2, 1].map((r) => {
                const isActive = rating === r;
                const count = ratingCounts[r] || 0;
                return (
                  <label
                    key={r}
                    className="flex items-center justify-between w-full cursor-pointer py-0.5 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => onRatingChange(isActive ? 0 : r)}
                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500 text-xs tracking-tighter flex gap-0.5">
                          {"★".repeat(r)}
                          <span className="opacity-25">{"★".repeat(5 - r)}</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">& above</span>
                      </div>
                    </div>
                    {count !== undefined && (
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500">
                        {count.toLocaleString()}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Discount Percentage */}
        <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/35 dark:bg-slate-850/20 rounded-2xl p-3.5 transition-all">
          <button
            onClick={() => toggleSection("discount")}
            className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
          >
            <span>Discounts</span>
            <svg
              className={`w-3 h-3 transform transition-transform duration-350 ${
                expanded.discount ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded.discount && (
            <div className="mt-3 space-y-1.5">
              {[10, 20, 30, 40, 50].map((d) => {
                const isActive = minDiscount === d;
                const count = discountCounts[d] || 0;
                return (
                  <label
                    key={d}
                    className="flex items-center justify-between w-full cursor-pointer py-0.5 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => onDiscountChange(isActive ? 0 : d)}
                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                      />
                      <span className="text-xs font-semibold">{d}% Off & above</span>
                    </div>
                    {count !== undefined && (
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500">
                        {count.toLocaleString()}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/35 dark:bg-slate-850/20 rounded-2xl p-3.5 transition-all">
          <button
            onClick={() => toggleSection("availability")}
            className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
          >
            <span>Availability</span>
            <svg
              className={`w-3 h-3 transform transition-transform duration-350 ${
                expanded.availability ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded.availability && (
            <div className="mt-3">
              <label className="flex items-center justify-between w-full cursor-pointer py-0.5 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={() => onInStockOnlyChange(!inStockOnly)}
                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                  />
                  <span className="text-xs font-semibold">Exclude Out of Stock</span>
                </div>
                {inStockCount !== undefined && (
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500">
                    {inStockCount.toLocaleString()}
                  </span>
                )}
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => {
          if (onCloseMobileFilters) onCloseMobileFilters();
        }}
        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-98 shadow-md cursor-pointer text-center border border-indigo-500/20"
      >
        Apply & Close ({totalResultsCount.toLocaleString()})
      </button>
    </aside>
  );
};

const MultiSelectChecklist = ({
  items = [],
  selectedList = [],
  onToggle,
  counts = {},
  searchPlaceholder = "Search...",
}) => {
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) =>
    String(item).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {items.length > 5 && (
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none text-[11px] font-bold text-slate-700 dark:text-slate-350 focus:border-indigo-500 shadow-sm"
        />
      )}
      <div className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin pr-1 text-left">
        {filtered.map((item) => {
          const isChecked = selectedList.includes(item);
          const count = counts[item] || 0;

          return (
            <label
              key={item}
              className="flex items-center justify-between w-full cursor-pointer py-0.5 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(item)}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                />
                <span className="text-xs font-semibold capitalize">{item}</span>
              </div>
              {count !== undefined && (
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500">
                  {count.toLocaleString()}
                </span>
              )}
            </label>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-[11px] text-slate-400 font-medium py-1">No items found</p>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
