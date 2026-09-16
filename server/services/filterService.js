import mongoose from "mongoose";
import productModel from "../models/productModel.js";

// Canonical list of standard keys to exclude from dynamic attribute facets
const IGNORED_ATTR_KEYS = new Set([
  "_id",
  "id",
  "name",
  "description",
  "shortdescription",
  "slug",
  "price",
  "originalprice",
  "images",
  "image",
  "media",
  "status",
  "isdeleted",
  "deletedat",
  "isfake",
  "isfeatured",
  "featuredpriority",
  "featureddiscount",
  "featuredstartdate",
  "featuredenddate",
  "sellerid",
  "sku",
  "barcode",
  "stock",
  "views",
  "viewcount",
  "wishlistcount",
  "cartcount",
  "purchasecount",
  "totalsold",
  "totalreviews",
  "averagerating",
  "rating",
  "reviews",
  "highlights",
  "careinstructions",
  "createdat",
  "updatedat",
  "date",
  "tags",
  "keywords",
  "model" // often contains unique product name string
]);

/**
 * Normalizes attribute keys into clean, human-friendly titles
 * e.g., "ram" -> "RAM", "screensize" / "screen_size" -> "Screen Size"
 */
export const normalizeAttributeKey = (rawKey) => {
  if (!rawKey || typeof rawKey !== "string") return "";
  const trimmed = rawKey.trim();
  const lower = trimmed.toLowerCase();

  const acronyms = {
    ram: "RAM",
    rom: "ROM",
    ssd: "SSD",
    hdd: "HDD",
    cpu: "CPU",
    gpu: "GPU",
    usb: "USB",
    os: "OS",
    led: "LED",
    oled: "OLED",
    qled: "QLED",
    fhd: "FHD",
    uhd: "UHD",
    fps: "FPS",
    dpi: "DPI",
    mrp: "MRP",
    sku: "SKU"
  };

  if (acronyms[lower]) return acronyms[lower];

  // Replace camelCase, underscores, and hyphens with spaces
  return trimmed
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(w => acronyms[w.toLowerCase()] || (w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
};

/**
 * Natural sort helper for sizes, numbers, and general values
 */
export const sortFilterValues = (key, values) => {
  const lowerKey = key.toLowerCase();
  
  if (lowerKey === "size" || lowerKey === "sizes") {
    const sizeOrder = ["xxs", "xs", "s", "m", "l", "xl", "xxl", "2xl", "3xl", "4xl", "5xl", "free", "free size", "standard", "one size"];
    return values.sort((a, b) => {
      const aVal = String(a.value).toLowerCase().trim();
      const bVal = String(b.value).toLowerCase().trim();
      const aIdx = sizeOrder.indexOf(aVal);
      const bIdx = sizeOrder.indexOf(bVal);

      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;

      // Numeric size sort (e.g., shoe sizes 6, 7, 8, 9, 10, 11)
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;

      return b.count - a.count;
    });
  }

  // General sort: highest count first, then alphabetical
  return values.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return String(a.value).localeCompare(String(b.value));
  });
};

/**
 * Build MongoDB Query conditions for dynamic attribute filters
 * Supports:
 * - attributes.key: value / [values]
 * - structured attributes array: [{ name: key, values: [...] }]
 * - specifications: [{ key: key, value: ... }]
 * - sizes array & variant Size/Color
 */
export const buildDynamicAttributeConditions = (attrFilters = {}) => {
  if (!attrFilters || typeof attrFilters !== "object") return [];

  const conditions = [];

  Object.entries(attrFilters).forEach(([rawKey, rawValue]) => {
    if (!rawValue) return;

    const values = Array.isArray(rawValue)
      ? rawValue.map(v => String(v).trim()).filter(Boolean)
      : String(rawValue).split(",").map(v => v.trim()).filter(Boolean);

    if (values.length === 0) return;

    const keyLower = rawKey.toLowerCase();
    const keyRegex = new RegExp(`^${rawKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

    const orBranches = [];

    // Regex matchers for atomic value and comma/JSON enclosed values
    const valueMatchRegexes = values.map(v => {
      const escaped = v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[\\[\\s,"])${escaped}([\\]\\s,"]|$)`, "i");
    });

    // 1. Direct dynamic attribute object lookup
    orBranches.push({
      [`attributes.${rawKey}`]: { $in: valueMatchRegexes }
    });
    orBranches.push({
      [`attributes.${keyLower}`]: { $in: valueMatchRegexes }
    });

    // 2. Structured dynamic attributes array lookup [{ name, values }]
    orBranches.push({
      attributes: {
        $elemMatch: {
          name: keyRegex,
          $or: [
            { values: { $in: valueMatchRegexes } },
            { value: { $in: valueMatchRegexes } }
          ]
        }
      }
    });

    // 3. Specifications array lookup [{ key, value }]
    orBranches.push({
      specifications: {
        $elemMatch: {
          key: keyRegex,
          value: { $in: valueMatchRegexes }
        }
      }
    });

    // 4. Special cases for common e-commerce top-level arrays/variants
    if (keyLower === "size" || keyLower === "sizes") {
      orBranches.push({ sizes: { $in: valueMatchRegexes } });
      orBranches.push({ "variants.Size": { $in: valueMatchRegexes } });
    }

    if (keyLower === "color" || keyLower === "colors") {
      orBranches.push({ "variants.Color": { $in: valueMatchRegexes } });
    }

    if (orBranches.length > 0) {
      conditions.push({ $or: orBranches });
    }
  });

  return conditions;
};

/**
 * Fully dynamic, context-aware filter generation using MongoDB aggregation.
 * Inspects only matching products and extracts every available attribute key, unique values, and counts.
 */
export const generateDynamicFilters = async (matchQuery = {}, selectedFilters = {}) => {
  try {
    const pipeline = [
      { $match: matchQuery },
      {
        $facet: {
          // 1. Price Range
          priceStats: [
            {
              $group: {
                _id: null,
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" },
                count: { $sum: 1 }
              }
            }
          ],

          // 2. SubCategories (Category Drill-down)
          subCategories: [
            { $match: { subCategory: { $exists: true, $ne: "", $ne: null } } },
            { $group: { _id: "$subCategory", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } }
          ],

          // 3. Categories (if broad query)
          categories: [
            { $match: { category: { $exists: true, $ne: "", $ne: null } } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } }
          ],

          // 4. Brands
          brands: [
            { $match: { brand: { $exists: true, $ne: "", $ne: null } } },
            { $group: { _id: "$brand", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } }
          ],

          // 5. Sizes array
          sizes: [
            { $unwind: { path: "$sizes", preserveNullAndEmptyArrays: false } },
            { $match: { sizes: { $exists: true, $ne: "", $ne: null } } },
            { $group: { _id: "$sizes", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],

          // 6. Specifications array [{ key, value }]
          specifications: [
            { $unwind: { path: "$specifications", preserveNullAndEmptyArrays: false } },
            {
              $match: {
                "specifications.key": { $exists: true, $ne: "", $ne: null },
                "specifications.value": { $exists: true, $ne: "", $ne: null }
              }
            },
            {
              $group: {
                _id: {
                  key: "$specifications.key",
                  value: "$specifications.value"
                },
                count: { $sum: 1 }
              }
            }
          ],

          // 7. Dynamic attributes object & array
          dynamicAttributes: [
            {
              $project: {
                attributes: 1
              }
            },
            {
              $project: {
                // If attributes is object, convert to array of {k, v}
                attrArray: {
                  $cond: {
                    if: { $isArray: "$attributes" },
                    then: "$attributes",
                    else: {
                      $cond: {
                        if: { $and: [{ $ne: ["$attributes", null] }, { $eq: [{ $type: "$attributes" }, "object"] }] },
                        then: { $objectToArray: "$attributes" },
                        else: []
                      }
                    }
                  }
                }
              }
            },
            { $unwind: "$attrArray" },
            {
              $project: {
                key: {
                  $ifNull: ["$attrArray.name", "$attrArray.k"]
                },
                val: {
                  $ifNull: ["$attrArray.values", { $ifNull: ["$attrArray.value", "$attrArray.v"] }]
                }
              }
            },
            {
              $unwind: {
                path: "$val",
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $match: {
                key: { $exists: true, $ne: "", $ne: null },
                val: { $exists: true, $ne: "", $ne: null }
              }
            },
            {
              $group: {
                _id: {
                  key: "$key",
                  value: "$val"
                },
                count: { $sum: 1 }
              }
            }
          ],

          // 8. Variant Colors
          variantColors: [
            { $unwind: { path: "$variants", preserveNullAndEmptyArrays: false } },
            { $match: { "variants.Color": { $exists: true, $ne: "", $ne: null } } },
            { $group: { _id: "$variants.Color", count: { $sum: 1 } } }
          ],

          // 9. Variant Sizes
          variantSizes: [
            { $unwind: { path: "$variants", preserveNullAndEmptyArrays: false } },
            { $match: { "variants.Size": { $exists: true, $ne: "", $ne: null } } },
            { $group: { _id: "$variants.Size", count: { $sum: 1 } } }
          ]
        }
      }
    ];

    const result = await productModel.aggregate(pipeline);
    const facetData = result[0] || {};

    const totalMatching = facetData.priceStats?.[0]?.count || 0;
    const minPrice = facetData.priceStats?.[0]?.minPrice ?? 0;
    const maxPrice = facetData.priceStats?.[0]?.maxPrice ?? 200000;

    // Build unified dynamic filter dictionary
    const filterGroups = {};

    // Helper to add a value into a group (handles atomic values, arrays, stringified JSON, and comma-separated lists)
    const addFacetValue = (groupKey, value, count) => {
      if (!groupKey || value === undefined || value === null) return;
      
      const normKey = normalizeAttributeKey(groupKey);
      const lowerKey = normKey.toLowerCase();

      // Check against ignored keys
      if (IGNORED_ATTR_KEYS.has(lowerKey)) return;

      // Extract individual atomic values
      let items = [];

      if (Array.isArray(value)) {
        items = value;
      } else if (typeof value === "string") {
        const trimmed = value.trim();
        // Check if string is a JSON array e.g. '["S", "M", "L"]'
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              items = parsed;
            } else {
              items = [trimmed];
            }
          } catch (e) {
            items = [trimmed];
          }
        } else if (trimmed.includes(",") && (lowerKey === "size" || lowerKey === "sizes" || lowerKey === "color" || lowerKey === "colors" || lowerKey === "occasion")) {
          // If comma-separated in multi-value attribute groups, split by comma e.g. "S,M,XL,L"
          items = trimmed.split(",").map(s => s.trim()).filter(Boolean);
        } else {
          items = [trimmed];
        }
      } else {
        items = [String(value)];
      }

      items.forEach(rawItem => {
        let strVal = String(rawItem).trim();
        // Clean outer quotes if any
        strVal = strVal.replace(/^["']|["']$/g, "").trim();

        if (!strVal || strVal === "undefined" || strVal === "null" || strVal === "[object Object]") return;
        if (strVal === "true" || strVal === "false") return; // skip bare boolean values

        // Format standard alphanumeric sizes consistently (e.g. s -> S, xs -> XS)
        if (lowerKey === "size" || lowerKey === "sizes") {
          if (["xs", "s", "m", "l", "xl", "xxl", "xxxs", "xxs", "2xl", "3xl", "4xl", "5xl"].includes(strVal.toLowerCase())) {
            strVal = strVal.toUpperCase();
          } else if (strVal.toLowerCase() === "free" || strVal.toLowerCase() === "free size") {
            strVal = "FREE";
          }
        }

        if (!filterGroups[normKey]) {
          filterGroups[normKey] = new Map();
        }

        const map = filterGroups[normKey];
        const existingCount = map.get(strVal) || 0;
        map.set(strVal, existingCount + count);
      });
    };

    // 0. Categories
    if (Array.isArray(facetData.categories)) {
      facetData.categories.forEach(item => {
        addFacetValue("Category", item._id, item.count);
      });
    }

    // 1. SubCategory
    if (Array.isArray(facetData.subCategories)) {
      facetData.subCategories.forEach(item => {
        addFacetValue("Subcategory", item._id, item.count);
      });
    }

    // 2. Brand
    if (Array.isArray(facetData.brands)) {
      facetData.brands.forEach(item => {
        addFacetValue("Brand", item._id, item.count);
      });
    }

    // 3. Sizes
    if (Array.isArray(facetData.sizes)) {
      facetData.sizes.forEach(item => {
        addFacetValue("Size", item._id, item.count);
      });
    }

    // 4. Variant Sizes & Colors
    if (Array.isArray(facetData.variantColors)) {
      facetData.variantColors.forEach(item => addFacetValue("Color", item._id, item.count));
    }
    if (Array.isArray(facetData.variantSizes)) {
      facetData.variantSizes.forEach(item => addFacetValue("Size", item._id, item.count));
    }

    // 5. Specifications
    if (Array.isArray(facetData.specifications)) {
      facetData.specifications.forEach(item => {
        const k = item._id?.key;
        const v = item._id?.value;
        if (k && v) addFacetValue(k, v, item.count);
      });
    }

    // 6. Dynamic Attributes
    if (Array.isArray(facetData.dynamicAttributes)) {
      facetData.dynamicAttributes.forEach(item => {
        const k = item._id?.key;
        const v = item._id?.value;
        if (k && v) addFacetValue(k, v, item.count);
      });
    }

    // Convert Map structures to final array output with intelligent noise reduction
    const finalizedFilters = {};

    Object.entries(filterGroups).forEach(([key, valueMap]) => {
      const entries = Array.from(valueMap.entries()).map(([value, count]) => ({
        value,
        count
      }));

      // Noise reduction rules:
      // If an attribute has only 1 unique value AND that single value matches 100% of the products,
      // skip it only if it is a secondary specification and not an active filter or primary key (Brand/Subcategory/Size/Color).
      const primaryKeys = new Set(["brand", "subcategory", "category", "size", "color"]);
      const isPrimaryKey = primaryKeys.has(key.toLowerCase());
      const isCurrentlyActive = Boolean(
        selectedFilters[key] ||
        selectedFilters[key.toLowerCase()] ||
        selectedFilters[key.toUpperCase()]
      );

      if (entries.length <= 1 && totalMatching > 1 && !isCurrentlyActive && !isPrimaryKey) {
        if (entries[0]?.count >= totalMatching) {
          return;
        }
      }

      if (entries.length > 0) {
        finalizedFilters[key] = sortFilterValues(key, entries);
      }
    });

    return {
      priceRange: {
        min: minPrice,
        max: maxPrice
      },
      filters: finalizedFilters,
      totalMatching
    };
  } catch (error) {
    console.error("generateDynamicFilters error:", error);
    return {
      priceRange: { min: 0, max: 200000 },
      filters: {},
      totalMatching: 0
    };
  }
};
