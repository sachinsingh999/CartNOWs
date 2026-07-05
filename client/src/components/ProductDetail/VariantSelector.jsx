import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const VariantSelector = ({
  product,
  selectedAttributes,
  setSelectedAttributes,
  isOptionAvailable,
  setShowSizeGuide,
  size,
  setSize
}) => {
  const getVariantAttributes = () => {
    if (!product?.attributes) return [];
    let attrs = product.attributes;
    if (typeof attrs === "string") {
      try {
        attrs = JSON.parse(attrs);
      } catch (e) {}
    }

    const legacyVariantKeys = ["color", "size", "ram", "storage", "length", "capacity", "lens type"];
    const isLegacyVariant = (key) => legacyVariantKeys.includes(String(key).toLowerCase().trim());

    let flatAttrs = [];
    if (Array.isArray(attrs)) {
      flatAttrs = attrs;
    } else if (attrs.variants && Array.isArray(attrs.variants)) {
      flatAttrs = attrs.variants;
    } else if (typeof attrs === "object") {
      Object.entries(attrs).forEach(([key, val]) => {
        flatAttrs.push({ key, value: val });
      });
    }

    return flatAttrs
      .map(attr => {
        if (!attr || typeof attr !== "object") return null;
        const name = attr.name || attr.key || "Unknown";
        const displayType = attr.displayType || (isLegacyVariant(name) ? "variant" : "specification");
        if (displayType !== "variant") return null;

        let values = [];
        if (Array.isArray(attr.values)) {
          values = attr.values;
        } else if (Array.isArray(attr.value)) {
          values = attr.value;
        } else {
          const valueStr = String(attr.value || attr.values || "");
          values = valueStr.split(",").map(v => v.trim()).filter(Boolean);
        }

        return {
          name,
          displayType,
          inputType: attr.inputType || (name.toLowerCase().trim() === "color" ? "Color Picker" : "Dropdown"),
          value: attr.value || (values[0] || ""),
          values
        };
      })
      .filter(Boolean);
  };

  const variantAttributes = getVariantAttributes();
  const hasVariants = variantAttributes.length > 0;
  const hasSizesFallback = product?.sizes && product.sizes.length > 0;

  const getColorHex = (c) => {
    const name = c?.toLowerCase().trim() || "";
    const map = {
      gold: "#ffd700",
      rose_gold: "#b76e79",
      "rose gold": "#b76e79",
      silver: "#c0c0c0",
      pink: "#f472b6",
      blue: "#3b82f6",
      white: "#ffffff",
      red: "#ef4444",
      black: "#000000",
      green: "#22c55e",
      yellow: "#eab308",
      gray: "#6b7280",
      grey: "#6b7280",
      purple: "#a855f7",
      orange: "#f97316",
      navy: "#1e3a8a",
      beige: "#f5f5dc",
      brown: "#78350f",
      // Tech-specific colorways
      "onyx black": "#1b1c1e",
      onyx: "#1b1c1e",
      "storm grey": "#707a8a",
      "storm gray": "#707a8a",
      "space grey": "#5e6266",
      "space gray": "#5e6266",
      starlight: "#f0ebe6",
      midnight: "#2e3641"
    };
    return map[name] || name;
  };

  if (hasVariants) {
    return (
      <div className="space-y-4">
        {variantAttributes.map((attr) => {
          const attrName = attr.name;
          const values = attr.values || [];
          if (values.length === 0) return null;

          const isColorPicker = attr.inputType === "Color Picker" || attrName.toLowerCase().includes("color");
          const isSizeAttr = attrName.toLowerCase().includes("size");

          return (
            <div key={attrName} className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Select {attrName}
                </span>
                {isSizeAttr && setShowSizeGuide && (
                  <button 
                    type="button" 
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline cursor-pointer"
                  >
                    Size Guide
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {values.map((val) => {
                  const isSelected = selectedAttributes[attrName] === val;
                  const isAvailable = isOptionAvailable(attrName, val);
                  const hex = getColorHex(val);

                  return (
                    <motion.button
                      key={val}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedAttributes(prev => ({ ...prev, [attrName]: val }))}
                      whileHover={isAvailable ? { y: -1, boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)" } : {}}
                      whileTap={isAvailable ? { scale: 0.98 } : {}}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border ${ isSelected ? "bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300" : !isAvailable ? "bg-slate-50/30 dark:bg-slate-900/20 border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-35 line-through" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer" }`}
                    >
                      {isColorPicker && (
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs" 
                          style={{ backgroundColor: hex }} 
                        />
                      )}
                      <span>
                        {val}
                      </span>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        >
                          <Check size={12} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (hasSizesFallback) {
    return (
      <div className="space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Select Size
          </span>
          {setShowSizeGuide && (
            <button 
              type="button" 
              onClick={() => setShowSizeGuide(true)}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline cursor-pointer"
            >
              Size Guide
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((item) => {
            const isSelected = size === item;
            return (
              <motion.button
                key={item}
                type="button"
                onClick={() => setSize && setSize(item)}
                whileHover={{ y: -1, boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border cursor-pointer ${ isSelected ? "bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50" }`}
              >
                <span>{item}</span>
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  >
                    <Check size={12} className="text-indigo-600 dark:text-indigo-400 shrink-0 ml-auto" />
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

export default VariantSelector;
