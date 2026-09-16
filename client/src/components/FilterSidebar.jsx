import React, { useState, useMemo } from "react";
import { X, SlidersHorizontal, RotateCcw, Sparkles, Search, ChevronDown, ChevronUp } from "lucide-react";
import DynamicFilterGroup from "./DynamicFilterGroup";
import BrandLogo from "./BrandLogo";

const FilterSidebar = ({
  category = "all",
  searchQuery = "",
  dynamicFilters = {},
  selectedAttributes = {},
  selectedBrands = [],
  selectedSubCategories = [],
  onAttributeToggle = () => {},
  activeFilterChips = [],
  categories = [],
  selectedCategories = [],
  onCategoryToggle = () => {},
  categoryCounts = {},
  price = 200000,
  minPrice = 0,
  maxPrice = 200000,
  onPriceChange = () => {},
  rating = 0,
  onRatingChange = () => {},
  minDiscount = 0,
  onDiscountChange = () => {},
  inStockOnly = false,
  onInStockOnlyChange = () => {},
  onReset = () => {},
  totalResultsCount = 0,
  onCloseMobileFilters,
}) => {
  const accentColor = "#ff3f6c";
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);

  // Check if we are browsing the broad/all catalog (no specific category or search active)
  const isBroadCatalog =
    (!category || category === "all" || category === "") &&
    (!searchQuery || searchQuery.trim() === "") &&
    (!selectedSubCategories || selectedSubCategories.length === 0) &&
    (!selectedAttributes || Object.keys(selectedAttributes).length === 0);

  // Prepare categories list without the "all" placeholder
  const rawCategories = useMemo(() => {
    const set = new Set();
    
    // First from dynamicFilters if available
    if (dynamicFilters.Category && Array.isArray(dynamicFilters.Category)) {
      dynamicFilters.Category.forEach(item => {
        if (item.value && item.value !== "all") set.add(item.value);
      });
    }

    // Then from passed categories prop
    if (categories && Array.isArray(categories)) {
      categories.forEach(c => {
        if (c && c !== "all") set.add(c);
      });
    }

    return Array.from(set).sort();
  }, [dynamicFilters.Category, categories]);

  // Filter categories by local search
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return rawCategories;
    const q = categorySearch.toLowerCase().trim();
    return rawCategories.filter(c => c.toLowerCase().includes(q));
  }, [rawCategories, categorySearch]);

  const visibleCategories = useMemo(() => {
    if (showAllCategories || categorySearch.trim()) {
      return filteredCategories;
    }
    return filteredCategories.slice(0, 8);
  }, [filteredCategories, showAllCategories, categorySearch]);

  // Dynamic filter entries to display
  // We exclude Category, Subcategory, and Brand from generic loop because they have dedicated components/sections
  const dynamicAttributeEntries = useMemo(() => {
    if (isBroadCatalog) {
      // In broad catalog mode (/product with no category/search), keep it simple!
      return [];
    }

    if (!dynamicFilters || typeof dynamicFilters !== "object") return [];

    const excludedKeys = new Set(["category", "categories", "subcategory", "subcategories", "brand", "brands"]);
    return Object.entries(dynamicFilters).filter(
      ([key]) => !excludedKeys.has(key.toLowerCase())
    );
  }, [dynamicFilters, isBroadCatalog]);

  return (
    <aside className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-left text-[#282c3f] dark:text-slate-100 transition-all duration-300 w-full overflow-hidden shadow-xs select-none">
      
      {/* 1. Header: FILTERS / CLEAR ALL */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-[#ff3f6c]" />
          <span className="text-[13px] font-black uppercase tracking-wider text-[#282c3f] dark:text-white">
            Filters
          </span>
          {totalResultsCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {totalResultsCount}
            </span>
          )}
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#ff3f6c] hover:opacity-80 bg-transparent border-none cursor-pointer transition-opacity"
        >
          <RotateCcw size={11} className="stroke-[2.5]" />
          <span>Clear All</span>
        </button>
      </div>

      {/* 2. CATEGORIES SECTION */}
      {rawCategories.length > 0 && (
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div
            className="flex items-center justify-between cursor-pointer select-none group"
            onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
          >
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 group-hover:text-[#ff3f6c] transition-colors">
              Categories
            </span>
            <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              {rawCategories.length > 8 && isCategoryExpanded && (
                <span className="text-[10px] text-slate-400">({rawCategories.length})</span>
              )}
              {isCategoryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </div>

          {isCategoryExpanded && (
            <div className="space-y-2.5 pt-0.5">
              {/* Category Search box if more than 8 categories */}
              {rawCategories.length > 8 && (
                <div className="relative mb-2">
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full pl-7 pr-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-[#ff3f6c]"
                  />
                </div>
              )}

              <div className="space-y-2">
                {visibleCategories.map((cat) => {
                  const isChecked = selectedCategories.some(
                    c => String(c).toLowerCase() === String(cat).toLowerCase()
                  );
                  const count = categoryCounts[cat] || categoryCounts[cat.toLowerCase()] || 0;

                  return (
                    <label
                      key={cat}
                      className="flex items-center justify-between cursor-pointer select-none group text-xs text-slate-700 dark:text-slate-300"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onCategoryToggle(cat)}
                          className="sr-only"
                        />
                        <div
                          className="h-4 w-4 rounded-[2px] border flex items-center justify-center transition-all duration-150 shrink-0"
                          style={{
                            borderColor: isChecked ? accentColor : "#d4d5d9",
                            backgroundColor: isChecked ? accentColor : "transparent",
                          }}
                        >
                          {isChecked && (
                            <svg className="w-2.5 h-2.5 text-white stroke-[4px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4.5" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`capitalize group-hover:text-[#ff3f6c] transition-colors ${isChecked ? "font-bold text-[#ff3f6c]" : "font-medium"}`}>
                          {cat}
                        </span>
                      </div>
                      {count > 0 && <span className="text-[10px] text-slate-400">({count})</span>}
                    </label>
                  );
                })}
              </div>

              {/* Show More / Show Less */}
              {filteredCategories.length > 8 && !categorySearch.trim() && (
                <button
                  type="button"
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="text-[11px] font-extrabold text-[#ff3f6c] hover:opacity-80 bg-transparent border-none cursor-pointer mt-1 block text-left"
                >
                  {showAllCategories ? "Show Less" : `+ ${filteredCategories.length - 8} more`}
                </button>
              )}

              {filteredCategories.length === 0 && (
                <p className="text-[11px] text-slate-400 italic py-1">No matching categories</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. SUBCATEGORY SECTION (if available) */}
      {dynamicFilters.Subcategory && dynamicFilters.Subcategory.length > 0 && (
        <DynamicFilterGroup
          key="Subcategory"
          groupKey="Subcategory"
          options={dynamicFilters.Subcategory}
          selectedValues={selectedSubCategories}
          onToggle={(key, val) => onAttributeToggle("Subcategory", val)}
        />
      )}

      {/* 4. CONTEXTUAL DYNAMIC ATTRIBUTE FILTER GROUPS (Shown when filtered by Category/Search/Subcategory) */}
      {dynamicAttributeEntries.map(([groupKey, options]) => {
        const lowerGroupKey = groupKey.toLowerCase();
        const selectedVals =
          selectedAttributes[groupKey] ||
          selectedAttributes[lowerGroupKey] ||
          [];
        return (
          <DynamicFilterGroup
            key={groupKey}
            groupKey={groupKey}
            options={options}
            selectedValues={Array.isArray(selectedVals) ? selectedVals : [selectedVals]}
            onToggle={(key, val) => onAttributeToggle(key, val)}
          />
        );
      })}

      {/* 5. BRAND SECTION (if available) */}
      {dynamicFilters.Brand && dynamicFilters.Brand.length > 0 && (
        <DynamicFilterGroup
          key="Brand"
          groupKey="Brand"
          options={dynamicFilters.Brand}
          selectedValues={selectedBrands}
          onToggle={(key, val) => onAttributeToggle("Brand", val)}
        />
      )}

      {/* 6. Dynamic Price Range Slider */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#282c3f] dark:text-slate-300">
            Price Range
          </span>
          <span className="text-[11px] font-bold text-[#ff3f6c]">
            Up to ₹{Number(price || maxPrice).toLocaleString("en-IN")}
          </span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min={minPrice || 0}
            max={maxPrice || 200000}
            step={Math.max(10, Math.round((maxPrice - minPrice) / 100))}
            value={price}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#ff3f6c] transition-all bg-slate-200 dark:bg-slate-700"
            style={{
              background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${Math.min(100, Math.max(0, ((price - minPrice) / (maxPrice - minPrice || 1)) * 100))}%, rgba(156, 163, 175, 0.3) ${Math.min(100, Math.max(0, ((price - minPrice) / (maxPrice - minPrice || 1)) * 100))}%)`,
            }}
          />
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>₹{(minPrice || 0).toLocaleString("en-IN")}</span>
            <span>₹{(maxPrice || 200000).toLocaleString("en-IN")}+</span>
          </div>
        </div>
      </div>

      {/* 7. Discount Range */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#282c3f] dark:text-slate-300 block">
          Discount
        </span>
        <div className="space-y-2">
          {[10, 20, 30, 40, 50].map((d) => {
            const isActive = minDiscount === d;
            return (
              <label
                key={d}
                className="flex items-center gap-2.5 cursor-pointer group select-none text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <input
                  type="radio"
                  name="discount-range"
                  checked={isActive}
                  onChange={() => onDiscountChange(isActive ? 0 : d)}
                  className="sr-only"
                />
                <div
                  className="h-3.5 w-3.5 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0"
                  style={{
                    borderColor: isActive ? accentColor : "#d4d5d9",
                  }}
                >
                  {isActive && (
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                  )}
                </div>
                <span className={`group-hover:text-[#ff3f6c] transition-colors ${isActive ? "text-[#ff3f6c]" : ""}`}>
                  {d}% and above
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 8. Customer Rating */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#282c3f] dark:text-slate-300 block">
          Customer Rating
        </span>
        <div className="space-y-2">
          {[4, 3, 2].map((r) => {
            const isActive = rating === r;
            return (
              <label
                key={r}
                className="flex items-center gap-2.5 cursor-pointer group select-none text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <input
                  type="radio"
                  name="rating-range"
                  checked={isActive}
                  onChange={() => onRatingChange(isActive ? 0 : r)}
                  className="sr-only"
                />
                <div
                  className="h-3.5 w-3.5 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0"
                  style={{
                    borderColor: isActive ? accentColor : "#d4d5d9",
                  }}
                >
                  {isActive && (
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                  )}
                </div>
                <span className={`flex items-center gap-1 group-hover:text-[#ff3f6c] transition-colors ${isActive ? "text-[#ff3f6c]" : ""}`}>
                  <span>{r}★ & above</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 9. Availability (In-Stock Only) */}
      <div className="px-5 py-4 space-y-3">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#282c3f] dark:text-slate-300 block">
          Availability
        </span>
        <label className="flex items-center gap-2.5 cursor-pointer select-none group text-xs text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={() => onInStockOnlyChange(!inStockOnly)}
            className="sr-only"
          />
          <div
            className="h-4 w-4 rounded-[2px] border flex items-center justify-center transition-all duration-150 shrink-0"
            style={{
              borderColor: inStockOnly ? accentColor : "#d4d5d9",
              backgroundColor: inStockOnly ? accentColor : "transparent",
            }}
          >
            {inStockOnly && (
              <svg className="w-2.5 h-2.5 text-white stroke-[4px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4.5" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className={`group-hover:text-[#ff3f6c] transition-colors ${inStockOnly ? "font-bold text-[#ff3f6c]" : "font-medium"}`}>
            Exclude Out of Stock
          </span>
        </label>
      </div>

      {/* Mobile Drawer Bottom Action */}
      {onCloseMobileFilters && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onCloseMobileFilters}
            className="w-full bg-[#ff3f6c] hover:bg-[#e0355e] text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer shadow-md transition-all border-none"
          >
            Apply Filters {totalResultsCount > 0 ? `(${totalResultsCount})` : ""}
          </button>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
