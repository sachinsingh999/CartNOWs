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
    <div className="bg-slate-100/70 dark:bg-slate-900/60 rounded-none p-6 text-left space-y-4">
      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider pb-1.5 flex items-center justify-between">
        <span>Product Specifications</span>
        <span className="text-[9.5px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/15 px-3 py-1 rounded-none">
          Verified Specs
        </span>
      </h4>
      <div className="space-y-2.5 text-xs">
        {specsToRender.map((spec, index) => (
          <div key={index} className="py-2.5 flex items-start justify-between gap-4">
            <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0 capitalize">{spec.key}</span>
            <span className="text-right text-slate-900 dark:text-slate-100 font-semibold break-words leading-relaxed">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecificationTable;
