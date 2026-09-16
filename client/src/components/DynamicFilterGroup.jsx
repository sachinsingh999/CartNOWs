import React, { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, Check } from "lucide-react";
import BrandLogo from "./BrandLogo";

// Known color mappings for rich swatch rendering
const COLOR_MAP = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#EF4444",
  blue: "#3B82F6",
  navy: "#1E3A8A",
  green: "#10B981",
  olive: "#84CC16",
  yellow: "#FBBF24",
  orange: "#F97316",
  pink: "#EC4899",
  purple: "#8B5CF6",
  violet: "#7C3AED",
  brown: "#78350F",
  grey: "#6B7280",
  gray: "#6B7280",
  silver: "#D1D5DB",
  gold: "#EAB308",
  beige: "#F5F5DC",
  cream: "#FFFDD0",
  teal: "#14B8A6",
  cyan: "#06B6D4",
  maroon: "#800000",
  coral: "#F87171",
  tan: "#D2B48C",
  rose: "#F43F5E",
  "rose gold": "#B76E79",
  "space grey": "#4B5563",
  "space gray": "#4B5563",
  midnight: "#191970",
  starlight: "#F8F9FA"
};

/**
 * Helper to determine the best display mode for a filter group
 */
const detectFilterDisplayType = (groupKey, options = []) => {
  const keyLower = groupKey.toLowerCase().trim();

  // 1. Color swatches
  if (keyLower === "color" || keyLower === "colors" || keyLower === "colour") {
    return "color-swatch";
  }

  // 2. Compact button grid for sizes, RAM, Storage, etc.
  if (
    keyLower === "size" ||
    keyLower === "sizes" ||
    keyLower === "ram" ||
    keyLower === "storage" ||
    keyLower === "rom" ||
    keyLower === "shoe size"
  ) {
    return "compact-button";
  }

  // 3. Check if all values are short strings (<= 4 chars) like XS, S, M, 8GB
  const allShortValues = options.length > 0 && options.every(opt => String(opt.value).length <= 4);
  if (allShortValues && options.length <= 12) {
    return "compact-button";
  }

  // 4. Brand type (renders brand logos when available)
  if (keyLower === "brand" || keyLower === "brands") {
    return "brand-list";
  }

  // 5. Default checkbox list
  return "checkbox-list";
};

const DynamicFilterGroup = ({
  groupKey,
  options = [],
  selectedValues = [],
  onToggle,
  maxInitialItems = 7
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const displayType = useMemo(
    () => detectFilterDisplayType(groupKey, options),
    [groupKey, options]
  );

  // Filter options by local search query if provided
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(opt =>
      String(opt.value).toLowerCase().includes(q)
    );
  }, [options, searchQuery]);

  const visibleOptions = useMemo(() => {
    if (showAll || searchQuery.trim()) {
      return filteredOptions;
    }
    return filteredOptions.slice(0, maxInitialItems);
  }, [filteredOptions, showAll, searchQuery, maxInitialItems]);

  if (!options || options.length === 0) return null;

  const accentColor = "#ff3f6c";

  return (
    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer select-none group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 group-hover:text-[#ff3f6c] transition-colors">
          {groupKey}
        </span>
        <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
          {options.length > 8 && isExpanded && displayType === "checkbox-list" && (
            <span className="text-[10px] text-slate-400">({options.length})</span>
          )}
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-2.5 pt-0.5">
          {/* Search box for long lists */}
          {options.length > 8 && displayType !== "compact-button" && (
            <div className="relative mb-2">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${groupKey}...`}
                className="w-full pl-7 pr-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-[#ff3f6c]"
              />
            </div>
          )}

          {/* TYPE A: Compact Button Grid (Size, RAM, Storage, etc.) */}
          {displayType === "compact-button" && (
            <div className="flex flex-wrap gap-1.5">
              {options.map((opt) => {
                const isSelected = selectedValues.some(
                  v => String(v).toLowerCase() === String(opt.value).toLowerCase()
                );
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => onToggle(groupKey, opt.value)}
                    title={`${opt.value} (${opt.count} items)`}
                    className={`min-w-[38px] px-2.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border select-none ${
                      isSelected
                        ? "bg-[#ff3f6c] text-white border-[#ff3f6c] shadow-xs scale-105"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#ff3f6c] hover:text-[#ff3f6c]"
                    }`}
                  >
                    {opt.value}
                    {opt.count > 0 && !isSelected && (
                      <span className="text-[9px] text-slate-400 ml-1 font-normal">
                        ({opt.count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TYPE B: Color Swatches & Dots */}
          {displayType === "color-swatch" && (
            <div className="space-y-2">
              {visibleOptions.map((opt) => {
                const isSelected = selectedValues.some(
                  v => String(v).toLowerCase() === String(opt.value).toLowerCase()
                );
                const colorHex = COLOR_MAP[String(opt.value).toLowerCase().trim()] || "#CCCCCC";
                const isLight = colorHex.toUpperCase() === "#FFFFFF" || colorHex.toLowerCase() === "#fffdd0" || colorHex.toLowerCase() === "#f5f5dc";

                return (
                  <label
                    key={String(opt.value)}
                    onClick={() => onToggle(groupKey, opt.value)}
                    className="flex items-center justify-between cursor-pointer select-none group text-xs text-slate-700 dark:text-slate-300 py-0.5"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Color circle */}
                      <span
                        className="w-4 h-4 rounded-full inline-flex items-center justify-center shrink-0 shadow-xs border transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: colorHex,
                          borderColor: isLight ? "#CBD5E1" : "rgba(0,0,0,0.15)"
                        }}
                      >
                        {isSelected && (
                          <Check
                            size={10}
                            className={isLight ? "text-slate-900 stroke-[3]" : "text-white stroke-[3]"}
                          />
                        )}
                      </span>

                      <span className={`capitalize transition-colors ${isSelected ? "font-bold text-[#ff3f6c]" : "group-hover:text-[#ff3f6c]"}`}>
                        {opt.value}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400">({opt.count})</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* TYPE C: Brand List with Optional BrandLogos */}
          {displayType === "brand-list" && (
            <div className="space-y-2">
              {visibleOptions.map((opt) => {
                const isChecked = selectedValues.some(
                  v => String(v).toLowerCase() === String(opt.value).toLowerCase()
                );
                return (
                  <label
                    key={String(opt.value)}
                    className="flex items-center justify-between cursor-pointer select-none group text-xs text-slate-700 dark:text-slate-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle(groupKey, opt.value)}
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
                      <BrandLogo brand={opt.value} className="w-4 h-4 rounded-xs shrink-0" />
                      <span className={`capitalize group-hover:text-[#ff3f6c] transition-colors ${isChecked ? "font-bold text-[#ff3f6c]" : "font-medium"}`}>
                        {opt.value}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">({opt.count})</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* TYPE D: General Checkbox List (Material, Subcategory, Fit, Sleeve, Neckline, Pattern, etc.) */}
          {displayType === "checkbox-list" && (
            <div className="space-y-2">
              {visibleOptions.map((opt) => {
                const isChecked = selectedValues.some(
                  v => String(v).toLowerCase() === String(opt.value).toLowerCase()
                );
                return (
                  <label
                    key={String(opt.value)}
                    className="flex items-center justify-between cursor-pointer select-none group text-xs text-slate-700 dark:text-slate-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle(groupKey, opt.value)}
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
                        {opt.value}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">({opt.count})</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* "+ More / Show Less" Toggle Button */}
          {filteredOptions.length > maxInitialItems && !searchQuery.trim() && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-[11px] font-extrabold text-[#ff3f6c] hover:opacity-80 bg-transparent border-none cursor-pointer mt-1 block text-left"
            >
              {showAll ? "Show Less" : `+ ${filteredOptions.length - maxInitialItems} more`}
            </button>
          )}

          {filteredOptions.length === 0 && (
            <p className="text-[11px] text-slate-400 italic py-1">No matching options</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicFilterGroup;
