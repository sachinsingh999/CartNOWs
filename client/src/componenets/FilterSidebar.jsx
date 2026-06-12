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
}) => {
  const [templateFields, setTemplateFields] = useState([]);
  const [expanded, setExpanded] = useState({
    category: true,
    collection: true,
    price: true,
    rating: true,
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

    // Number / Decimal range slider or range inputs
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
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none text-[11px] font-bold text-slate-700 dark:text-slate-330"
              />
            </div>
          </div>
        </div>
      );
    }

    // Toggle Checkbox
    if (field.fieldType === "Checkbox") {
      const isChecked = !!val;
      return (
        <button
          onClick={() => handleDynamicChange(field.fieldName, !isChecked)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border w-full text-left transition-all duration-200 mt-2 cursor-pointer ${
            isChecked
              ? "border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-650 text-white"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
          }`}
        >
          <span className="text-xs font-semibold">{field.label}</span>
          {isChecked && <span className="ml-auto text-xs font-black">✓</span>}
        </button>
      );
    }

    // Selectable options (Dropdown, Radio Button, Multi Select, Chips group)
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
                    ? "border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-505 text-white shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    // Default text filter input
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
          onClick={onReset}
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl cursor-pointer hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-4">
        {/* Department / Category */}
        <div className="border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl p-3.5 transition-all">
          <button
            onClick={() => toggleSection("category")}
            className="flex items-center justify-between w-full font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] cursor-pointer"
          >
            <span>Department</span>
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
              <ChipGroup
                items={categories}
                active={category}
                onSelect={onCategoryChange}
              />
            </div>
          )}
        </div>

        {/* Collection */}
        <div className="border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl p-3.5 transition-all">
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {expanded.collection && (
            <div className="mt-3.5 animate-fadeIn">
              <ChipGroup
                items={collections}
                active={collection}
                onSelect={onCollectionChange}
              />
            </div>
          )}
        </div>

        {/* Dynamic Template Fields/Attributes Filters */}
        {templateFields.map((field) => (
          <div
            key={field._id}
            className="border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl p-3.5 transition-all"
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {expanded[field.fieldName] && (
              <div className="mt-3.5 animate-fadeIn text-left">
                {renderDynamicWidget(field)}
              </div>
            )}
          </div>
        ))}

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
            <div className="mt-3.5 animate-fadeIn text-left">
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
                onChange={(e) => onPriceChange(Number(e.target.value))}
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
                    onClick={() => onRatingChange(rating === r ? 0 : r)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border w-full text-left transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
                      isActive
                        ? "border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-655 text-white shadow-sm shadow-indigo-100 dark:shadow-slate-950"
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

const ChipGroup = ({ items, active, onSelect }) => (
  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
    {items.map((item) => {
      const isActive = active === item;
      return (
        <button
          key={item}
          onClick={() => onSelect(item)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 capitalize ${
            isActive
              ? "border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-100 dark:shadow-slate-955 scale-102"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850"
          }`}
        >
          {item === "all" ? "All" : item}
        </button>
      );
    })}
  </div>
);

export default FilterSidebar;
