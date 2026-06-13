import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";

const FilterSidebar = ({
  categories,
  collections,
  category,
  collection,
  price,
  rating,
  maxPrice,
  onCategoryChange,
  onCollectionChange,
  onPriceChange,
  onRatingChange,
  dynamicFilters,
  onDynamicFiltersChange,
  onReset,
  categoryCounts = {},
  collectionCounts = {},
  inStockOnly = false,
  onInStockOnlyChange,
  inStockCount = 0,
  ratingCounts = {},
  totalResultsCount = 0,
  onCloseMobileFilters,
}) => {
  const [templateFields, setTemplateFields] = useState([]);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [collectionQuery, setCollectionQuery] = useState("");

  const [expanded, setExpanded] = useState({
    category: true,
    collection: true,
    price: true,
    rating: true,
    availability: true,
  });

  // Fetch dynamic filters/attributes whenever the category changes
  useEffect(() => {
    if (category && category !== "all") {
      axios
        .get(`${backendUrl}/api/product/category/${category}/template`)
        .then((res) => {
          if (res.data.success && res.data.fields) {
            // Only use filterable fields
            const filterables = res.data.fields.filter(
              (f) => f.isFilterable && f.visibleOnSearch !== false
            );
            setTemplateFields(filterables);
            // Pre-expand section states
            const newExp = { ...expanded };
            filterables.forEach((f) => {
              newExp[f.fieldName] = true;
            });
            setExpanded(newExp);
          } else {
            setTemplateFields([]);
          }
        })
        .catch(() => {
          setTemplateFields([]);
        });
    } else {
      setTemplateFields([]);
    }
  }, [category]);

  const activeCount = [
    category !== "all",
    collection !== "all",
    price < maxPrice,
    rating > 0,
    inStockOnly,
    Object.keys(dynamicFilters || {}).some(
      (k) =>
        dynamicFilters[k] !== undefined &&
        dynamicFilters[k] !== "" &&
        (!Array.isArray(dynamicFilters[k]) || dynamicFilters[k].length > 0)
    ),
  ].filter(Boolean).length;

  const toggleSection = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleDynamicChange = (fieldName, val) => {
    if (!onDynamicFiltersChange) return;
    onDynamicFiltersChange({
      ...dynamicFilters,
      [fieldName]: val,
    });
  };

  const renderDynamicWidget = (field) => {
    const val = dynamicFilters?.[field.fieldName];

    if (field.fieldType === "Number" || field.fieldType === "Decimal") {
      const minVal = field.validationRules?.minVal ?? 0;
      const maxVal = field.validationRules?.maxVal ?? 10000;
      const currentMin = val?.min ?? minVal;
      const currentMax = val?.max ?? maxVal;

      return (
        <div className="space-y-3.5 mt-2">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Min</label>
              <input
                type="number"
                min={minVal}
                max={currentMax}
                value={currentMin}
                onChange={(e) =>
                  handleDynamicChange(field.fieldName, {
                    ...val,
                    min: Number(e.target.value),
                  })
                }
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none text-[11px] font-bold text-slate-700 dark:text-slate-300"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Max</label>
              <input
                type="number"
                min={currentMin}
                max={maxVal}
                value={currentMax}
                onChange={(e) =>
                  handleDynamicChange(field.fieldName, {
                    ...val,
                    max: Number(e.target.value),
                  })
                }
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none text-[11px] font-bold text-slate-700 dark:text-slate-300"
              />
            </div>
          </div>
        </div>
      );
    }

    if (field.fieldType === "Checkbox") {
      const isChecked = !!val;
      return (
        <button
          onClick={() => handleDynamicChange(field.fieldName, !isChecked)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border w-full text-left transition-all duration-200 mt-2 cursor-pointer ${
            isChecked
              ? "border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-650 text-white"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
          }`}
        >
          <span className="text-xs font-semibold">{field.label}</span>
          {isChecked && <span className="ml-auto text-xs font-black">✓</span>}
        </button>
      );
    }

    const options = field.selectOptions || [];
    if (options.length > 0) {
      const selectedList = Array.isArray(val) ? val : val ? [val] : [];

      return (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {options.map((opt) => {
            const isSelected = selectedList.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => {
                  let next;
                  if (field.fieldType === "Multi Select") {
                    next = isSelected
                      ? selectedList.filter((x) => x !== opt)
                      : [...selectedList, opt];
                  } else {
                    next = isSelected ? "" : opt;
                  }
                  handleDynamicChange(field.fieldName, next);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all duration-200 cursor-pointer capitalize ${
                  isSelected
                    ? "border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-650 text-white shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350 hover:bg-slate-50"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <input
        type="text"
        placeholder={field.placeholder || `Filter by ${field.label}`}
        value={val || ""}
        onChange={(e) => handleDynamicChange(field.fieldName, e.target.value)}
        className="w-full mt-2 px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none text-[11px] font-bold text-slate-700 dark:text-slate-300"
      />
    );
  };

  const percentage = (price / maxPrice) * 100;

  return (
    <aside className="sticky top-24 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 h-fit text-[13px] shadow-lg shadow-slate-100/50 dark:shadow-slate-950/80 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 text-left">
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">
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
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-450 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-xl cursor-pointer hover:shadow-sm transition-all duration-200"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3.5">
        {/* Department / Category */}
        <div className="border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl p-3 transition-all">
          <button
            onClick={() => toggleSection("category")}
            className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
          >
            <span>Department</span>
            <svg
              className={`w-3 h-3 transform transition-transform duration-300 ${
                expanded.category ? "rotate-180" : ""
              }`}
              fill="none; stroke=currentColor"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded.category && (
            <div className="mt-3 animate-fadeIn">
              <CheckboxList
                items={categories}
                active={category}
                onSelect={onCategoryChange}
                counts={categoryCounts}
                searchPlaceholder="Search departments..."
                searchValue={categoryQuery}
                onSearchChange={setCategoryQuery}
              />
            </div>
          )}
        </div>

        {/* Collection */}
        <div className="border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl p-3 transition-all">
          <button
            onClick={() => toggleSection("collection")}
            className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
          >
            <span>Collection</span>
            <svg
              className={`w-3 h-3 transform transition-transform duration-300 ${
                expanded.collection ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded.collection && (
            <div className="mt-3 animate-fadeIn">
              <CheckboxList
                items={collections}
                active={collection}
                onSelect={onCollectionChange}
                counts={collectionCounts}
                searchPlaceholder="Search collections..."
                searchValue={collectionQuery}
                onSearchChange={setCollectionQuery}
              />
            </div>
          )}
        </div>

        {/* Dynamic Template Fields/Attributes Filters */}
        {templateFields.map((field) => (
          <div
            key={field._id}
            className="border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl p-3 transition-all"
          >
            <button
              onClick={() => toggleSection(field.fieldName)}
              className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
            >
              <span>{field.label}</span>
              <svg
                className={`w-3 h-3 transform transition-transform duration-300 ${
                  expanded[field.fieldName] ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expanded[field.fieldName] && (
              <div className="mt-3 animate-fadeIn text-left">
                {renderDynamicWidget(field)}
              </div>
            )}
          </div>
        ))}

        {/* Price Slider */}
        <div className="border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl p-3 transition-all">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded.price && (
            <div className="mt-3 animate-fadeIn text-left space-y-2.5">
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
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 transition-all focus:outline-none"
                style={{
                  background: `linear-gradient(to right, rgb(79, 70, 229) ${percentage}%, rgba(156, 163, 175, 0.2) ${percentage}%)`
                }}
              />
              
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-left">
                  <span className="text-[9px] text-slate-400 font-bold block">Min</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">₹0</span>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-left">
                  <span className="text-[9px] text-slate-400 font-bold block">Max</span>
                  <div className="flex items-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">₹</span>
                    <input
                      type="text"
                      value={price.toLocaleString("en-IN")}
                      onChange={(e) => {
                        const val = Number(e.target.value.replace(/[^0-9]/g, ""));
                        onPriceChange(val > maxPrice ? maxPrice : val);
                      }}
                      className="w-full bg-transparent border-none outline-none p-0 text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl p-3 transition-all">
          <button
            onClick={() => toggleSection("rating")}
            className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
          >
            <span>Rating</span>
            <svg
              className={`w-3 h-3 transform transition-transform duration-300 ${
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
            <div className="mt-3 space-y-1.5 animate-fadeIn">
              {[4, 3, 2, 1].map((r) => {
                const isActive = rating === r;
                const count = ratingCounts[r] || 0;
                return (
                  <label
                    key={r}
                    className="flex items-center justify-between w-full cursor-pointer py-0.5 text-slate-700 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400"
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

        {/* Availability */}
        <div className="border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl p-3 transition-all">
          <button
            onClick={() => toggleSection("availability")}
            className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
          >
            <span>Availability</span>
            <svg
              className={`w-3 h-3 transform transition-transform duration-300 ${
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
            <div className="mt-3 animate-fadeIn">
              <label className="flex items-center justify-between w-full cursor-pointer py-0.5 text-slate-700 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={() => onInStockOnlyChange(!inStockOnly)}
                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                  />
                  <span className="text-xs font-semibold">In Stock</span>
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
        className="w-full mt-4 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all duration-200 active:scale-98 shadow-md hover:shadow shadow-indigo-150 dark:shadow-slate-950 cursor-pointer text-center"
      >
        Show {totalResultsCount.toLocaleString()} Results
      </button>
    </aside>
  );
};

const CheckboxList = ({
  items,
  active,
  onSelect,
  counts = {},
  searchPlaceholder,
  searchValue,
  onSearchChange,
}) => {
  const hasAll = items.includes("all");
  const otherItems = items.filter((item) => item !== "all");

  const filteredItems = otherItems.filter((item) =>
    item.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {otherItems.length > 5 && (
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none text-[11px] font-bold text-slate-700 dark:text-slate-350 focus:border-indigo-500 shadow-sm"
        />
      )}
      <div className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin pr-1 text-left">
        {hasAll && (
          <label className="flex items-center justify-between w-full cursor-pointer py-0.5 text-slate-700 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={active === "all"}
                onChange={() => onSelect("all")}
                className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
              />
              <span className="text-xs font-semibold capitalize">
                {searchPlaceholder.toLowerCase().includes("department")
                  ? "All Departments"
                  : "All Collections"}
              </span>
            </div>
          </label>
        )}
        {filteredItems.map((item) => {
          const isActive = active === item;
          const count = counts[item] || 0;

          return (
            <label
              key={item}
              className="flex items-center justify-between w-full cursor-pointer py-0.5 text-slate-700 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => onSelect(isActive ? "all" : item)}
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
      </div>
    </div>
  );
};

export default FilterSidebar;
