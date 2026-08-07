import React, { useState } from "react";

const FilterSidebar = ({
  categories = [],
  subCategories = [],
  brands = [],
  locations = [],
  selectedCollection = "all",
  onCollectionToggle,
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
  // Accent brand color matching Myntra: #ff3f6c
  const accentColor = "#ff3f6c";

  // Limit categories, brands, colors to 8 items, then show "+ more" link
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  return (
    <aside className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-left text-[#282c3f] dark:text-slate-100 transition-all duration-300 w-full overflow-hidden">
      
      {/* 1. Header: FILTERS / CLEAR ALL */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <span className="text-[13px] font-extrabold uppercase tracking-widest text-[#282c3f] dark:text-white">
          Filters
        </span>
        <button
          onClick={onReset}
          className="text-[11px] font-extrabold uppercase tracking-wider text-[#ff3f6c] hover:opacity-90 bg-transparent border-none cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* 2. Gender / Collection Section */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        {["men", "women", "boys", "girls"].map((gender) => {
          const isSelected = selectedCollection?.toLowerCase() === gender;
          return (
            <label
              key={gender}
              className="flex items-center gap-3 cursor-pointer group select-none text-xs font-bold text-slate-800 dark:text-slate-200 capitalize"
            >
              <input
                type="radio"
                name="gender-collection"
                checked={isSelected}
                onChange={() => onCollectionToggle(isSelected ? "all" : gender)}
                className="sr-only"
              />
              <div
                className="h-4 w-4 rounded-full border flex items-center justify-center transition-all duration-200"
                style={{
                  borderColor: isSelected ? accentColor : "#d4d5d9",
                }}
              >
                {isSelected && (
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </div>
              <span className="group-hover:text-[#ff3f6c] transition-colors">{gender}</span>
            </label>
          );
        })}
      </div>

      {/* 3. Categories Section */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#282c3f] dark:text-slate-300">
            Categories
          </span>
          <span className="text-[11px] text-slate-400">🔍</span>
        </div>
        <div className="space-y-2.5">
          {categories
            .slice(0, showAllCategories ? categories.length : 8)
            .map((cat) => {
              const isChecked = selectedCategories.includes(cat);
              const count = categoryCounts[cat] || 0;
              return (
                <label
                  key={cat}
                  className="flex items-center justify-between cursor-pointer select-none group text-xs text-slate-700 dark:text-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onCategoryToggle(cat)}
                      className="sr-only"
                    />
                    <div
                      className="h-4 w-4 rounded-[2px] border flex items-center justify-center transition-all duration-150"
                      style={{
                        borderColor: isChecked ? accentColor : "#d4d5d9",
                        backgroundColor: isChecked ? accentColor : "transparent",
                      }}
                    >
                      {isChecked && (
                        <svg className="w-2.5 h-2.5 text-slate-100 dark:text-white stroke-[4px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4.5" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="capitalize group-hover:text-[#ff3f6c] transition-colors font-medium">
                      {cat}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">({count})</span>
                </label>
              );
            })}
          {categories.length > 8 && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-[11px] font-extrabold text-[#ff3f6c] hover:opacity-80 bg-transparent border-none cursor-pointer mt-1"
            >
              {showAllCategories ? "Show Less" : `+ ${categories.length - 8} more`}
            </button>
          )}
        </div>
      </div>

      {/* 4. Brand Section */}
      {brands.length > 0 && (
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#282c3f] dark:text-slate-300">
              Brand
            </span>
            <span className="text-[11px] text-slate-400">🔍</span>
          </div>
          <div className="space-y-2.5">
            {brands
              .slice(0, showAllBrands ? brands.length : 8)
              .map((brand) => {
                const isChecked = selectedBrands.includes(brand);
                const count = brandCounts[brand] || 0;
                return (
                  <label
                    key={brand}
                    className="flex items-center justify-between cursor-pointer select-none group text-xs text-slate-700 dark:text-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onBrandToggle(brand)}
                        className="sr-only"
                      />
                      <div
                        className="h-4 w-4 rounded-[2px] border flex items-center justify-center transition-all duration-150"
                        style={{
                          borderColor: isChecked ? accentColor : "#d4d5d9",
                          backgroundColor: isChecked ? accentColor : "transparent",
                        }}
                      >
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 text-slate-100 dark:text-white stroke-[4px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4.5" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="capitalize group-hover:text-[#ff3f6c] transition-colors font-medium">
                        {brand}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">({count})</span>
                  </label>
                );
              })}
            {brands.length > 8 && (
              <button
                onClick={() => setShowAllBrands(!showAllBrands)}
                className="text-[11px] font-extrabold text-[#ff3f6c] hover:opacity-80 bg-transparent border-none cursor-pointer mt-1"
              >
                {showAllBrands ? "Show Less" : `+ ${brands.length - 8} more`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. Price Section */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#282c3f] dark:text-slate-300 block">
          Price
        </span>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max={maxPrice}
            value={price}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-[#ff3f6c] transition-all bg-slate-100 dark:bg-slate-800"
            style={{
              background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${(price / maxPrice) * 100}%, rgba(156, 163, 175, 0.2) ${(price / maxPrice) * 100}%)`,
            }}
          />
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            ₹0 - ₹{price.toLocaleString("en-IN")}+
          </div>
        </div>
      </div>

      {/* 6. Discount Range Section */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#282c3f] dark:text-slate-300 block">
          Discount Range
        </span>
        <div className="space-y-2.5">
          {[10, 20, 30, 40, 50].map((d) => {
            const isActive = minDiscount === d;
            return (
              <label
                key={d}
                className="flex items-center gap-3 cursor-pointer group select-none text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <input
                  type="radio"
                  name="discount-range"
                  checked={isActive}
                  onChange={() => onDiscountChange(isActive ? 0 : d)}
                  className="sr-only"
                />
                <div
                  className="h-4 w-4 rounded-full border flex items-center justify-center transition-all duration-200"
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
                <span className="group-hover:text-[#ff3f6c] transition-colors">{d}% and above</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 7. Extra details (Locations & Availability) */}
      <div className="px-5 py-4 space-y-3">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#282c3f] dark:text-slate-300 block">
          Availability
        </span>
        <label className="flex items-center gap-3 cursor-pointer select-none group text-xs text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={() => onInStockOnlyChange(!inStockOnly)}
            className="sr-only"
          />
          <div
            className="h-4 w-4 rounded-[2px] border flex items-center justify-center transition-all duration-150"
            style={{
              borderColor: inStockOnly ? accentColor : "#d4d5d9",
              backgroundColor: inStockOnly ? accentColor : "transparent",
            }}
          >
            {inStockOnly && (
              <svg className="w-2.5 h-2.5 text-slate-100 dark:text-white stroke-[4px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4.5" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="group-hover:text-[#ff3f6c] transition-colors font-medium">
            Exclude Out of Stock
          </span>
        </label>
      </div>

      {onCloseMobileFilters && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onCloseMobileFilters}
            className="w-full bg-[#ff3f6c] text-slate-100 dark:text-white py-2 rounded text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            Apply Filters ({totalResultsCount})
          </button>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
