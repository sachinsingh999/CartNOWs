import React from "react";

const SpecificationTable = ({ product }) => {
  if (!product) return null;

  const blacklist = new Set([
    "_id", "id", "createdat", "updatedat", "images", "reviews", "v", "__v", 
    "variants", "variant", "status", "price", "originalprice", "name", "description", 
    "shortdescription", "stock", "rating", "searchkeywords"
  ]);

  let specsToRender = [];
  const seenKeys = new Set();

  const addSpec = (rawKey, rawVal) => {
    if (!rawKey || rawVal === undefined || rawVal === null || rawVal === "") return;
    const keyStr = String(rawKey).trim();
    const normalizedKey = keyStr.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!keyStr || blacklist.has(normalizedKey) || seenKeys.has(normalizedKey)) return;

    let valStr = "";
    if (Array.isArray(rawVal)) {
      valStr = rawVal.join(", ");
    } else if (typeof rawVal === "object") {
      valStr = JSON.stringify(rawVal);
    } else {
      valStr = String(rawVal).trim();
    }

    if (valStr && valStr !== "[object Object]") {
      seenKeys.add(normalizedKey);
      specsToRender.push({ key: keyStr, value: valStr });
    }
  };

  // 1. Check product.attributes.specifications (array)
  if (product?.attributes?.specifications && Array.isArray(product.attributes.specifications)) {
    product.attributes.specifications.forEach(spec => {
      if (spec && typeof spec === "object") {
        addSpec(spec.name || spec.key || spec.title, spec.value || spec.values);
      }
    });
  }

  // 2. Check product.specifications (array or object)
  if (product?.specifications) {
    if (Array.isArray(product.specifications)) {
      product.specifications.forEach(spec => {
        if (spec && typeof spec === "object") {
          addSpec(spec.key || spec.name || spec.title, spec.value || spec.values);
        } else if (typeof spec === "string" && spec.includes(":")) {
          const [k, v] = spec.split(":");
          addSpec(k, v);
        }
      });
    } else if (typeof product.specifications === "object") {
      Object.entries(product.specifications).forEach(([k, v]) => addSpec(k, v));
    }
  }

  // 3. Check product.attributes (object format)
  if (product?.attributes && typeof product.attributes === "object" && !Array.isArray(product.attributes)) {
    Object.entries(product.attributes).forEach(([k, v]) => {
      if (k !== "specifications" && k !== "variants") {
        addSpec(k, v);
      }
    });
  }

  // 4. Fallback product top-level properties
  addSpec("Brand", product.brand);
  addSpec("Category", product.category);
  addSpec("Subcategory", product.subcategory);
  addSpec("Material", product.material);
  addSpec("Fabric", product.fabric);
  addSpec("Weight", product.weight);
  addSpec("Dimensions", product.dimensions);
  addSpec("Occasion", product.occasion);
  addSpec("Warranty", product.warranty);
  addSpec("Country of Origin", product.origin || product.countryOfOrigin);

  if (specsToRender.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-5 text-left shadow-2xs space-y-3">
      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
        <span>Product Specifications</span>
        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-xs border border-amber-500/20">
          Verified Specs
        </span>
      </h4>
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
        {specsToRender.map((spec, index) => (
          <div key={index} className="py-2 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
            <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0 capitalize">{spec.key}</span>
            <span className="text-right text-slate-900 dark:text-slate-100 font-semibold break-words leading-tight">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecificationTable;
