import React from "react";

const SpecificationTable = ({ product }) => {
  const allowedKeys = ["material", "plating", "stone type", "pearl type", "weight", "occasion"];
  const isAllowed = (key) => allowedKeys.includes(String(key || "").toLowerCase().trim());

  let specsToRender = [];

  if (product?.attributes?.specifications && Array.isArray(product.attributes.specifications)) {
    specsToRender = product.attributes.specifications
      .filter(spec => isAllowed(spec.name))
      .map(spec => ({ key: spec.name, value: spec.value }));
  } else if (product?.specifications && Array.isArray(product.specifications)) {
    specsToRender = product.specifications
      .filter(spec => isAllowed(spec.key))
      .map(spec => ({ key: spec.key, value: spec.value }));
  } else {
    // Fallback: check legacy direct product fields
    const fallbackSpecs = [
      { key: "Material", value: product?.material },
      { key: "Weight", value: product?.weight },
      { key: "Occasion", value: product?.occasion }
    ];
    specsToRender = fallbackSpecs.filter(spec => spec.value && isAllowed(spec.key));
  }

  if (specsToRender.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-left shadow-xs">
      <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
        Specifications
      </h4>
      <div className="space-y-2.5 text-xs">
        {specsToRender.map((spec, index) => (
          <div key={index} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-none last:pb-0">
            <span className="font-bold text-slate-500 dark:text-slate-400">{spec.key}</span>
            <span className="text-right text-slate-800 dark:text-slate-200 font-semibold">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecificationTable;
