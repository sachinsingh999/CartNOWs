import React from "react";
import { Check } from "lucide-react";

const FeatureList = ({ product }) => {
  const hasFeatures = product?.attributes?.features && product.attributes.features.length > 0;

  if (!hasFeatures) {
    // Default fallback features for legacy products
    const defaultFeatures = ["Premium Fabric", "Breathable Material", "Comfortable Fit", "Lightweight"];
    return (
      <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4 text-left">
        <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
          Product Features
        </span>
        <div className="flex flex-wrap gap-2">
          {defaultFeatures.map((feat, index) => (
            <div 
              key={index} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs hover:scale-102 transition-transform duration-200"
            >
              <Check size={12} className="text-emerald-500 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter features (exclude false/no)
  const filteredFeatures = product.attributes.features.filter(feat => {
    const val = String(feat.value || "").toLowerCase().trim();
    return val !== "false" && val !== "no";
  });

  if (filteredFeatures.length === 0) return null;

  return (
    <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4 text-left">
      <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
        Product Features
      </span>
      <div className="flex flex-wrap gap-2">
        {filteredFeatures.map((feat, index) => {
          const valLower = String(feat.value || "").toLowerCase().trim();
          const isFlag = valLower === "true" || valLower === "yes" || typeof feat.value === "boolean";
          const displayLabel = isFlag ? feat.name : `${feat.name}: ${feat.value}`;
          return (
            <div 
              key={index} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs hover:scale-102 transition-transform duration-200"
            >
              <Check size={12} className="text-emerald-500 shrink-0" />
              <span>{displayLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureList;
