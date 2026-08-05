import React from "react";
import { Check } from "lucide-react";

const FeatureList = ({ product }) => {
  if (!product) return null;

  let featuresToDisplay = [];

  // 1. Check explicit product.attributes.features
  if (product?.attributes?.features && Array.isArray(product.attributes.features) && product.attributes.features.length > 0) {
    product.attributes.features.forEach((feat) => {
      const valLower = String(feat.value || "").toLowerCase().trim();
      if (valLower !== "false" && valLower !== "no") {
        const isFlag = valLower === "true" || valLower === "yes" || typeof feat.value === "boolean";
        const label = isFlag ? feat.name : `${feat.name}: ${feat.value}`;
        featuresToDisplay.push(label);
      }
    });
  }

  // 2. Check product.highlights array
  if (product?.highlights && Array.isArray(product.highlights) && product.highlights.length > 0) {
    product.highlights.forEach((hl) => {
      if (hl && typeof hl === "string" && !featuresToDisplay.includes(hl)) {
        featuresToDisplay.push(hl);
      }
    });
  }

  // 3. Extract dynamic features from real product fields
  if (featuresToDisplay.length === 0) {
    if (product.material) featuresToDisplay.push(`Material: ${product.material}`);
    if (product.fabric && product.fabric !== product.material) featuresToDisplay.push(`Fabric: ${product.fabric}`);
    if (product.occasion) featuresToDisplay.push(`Occasion: ${product.occasion}`);
    if (product.warranty) featuresToDisplay.push(`Warranty: ${product.warranty}`);
    if (product.origin) featuresToDisplay.push(`Origin: ${product.origin}`);
    if (product.subCategory || product.subcategory) featuresToDisplay.push(`${product.subCategory || product.subcategory}`);
  }

  // Hide section cleanly if no real features exist for this product
  if (featuresToDisplay.length === 0) return null;

  return (
    <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4 text-left">
      <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
        Product Features
      </span>
      <div className="flex flex-wrap gap-2">
        {featuresToDisplay.map((feat, index) => (
          <div 
            key={index} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs"
          >
            <Check size={12} className="text-emerald-500 shrink-0" />
            <span>{feat}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureList;
