import categoryModel from "../models/categoryModel.js";

// Cache category definitions to avoid redundant database roundtrips
let taxonomyCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

/**
 * Normalizes category/subcategory strings into consistent lowercase slug format
 * e.g. "Mobile Phones" -> "mobile-phones", "Women's Dresses" -> "womens-dresses"
 */
export const slugify = (text) => {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Loads and caches taxonomy definitions from MongoDB categoryModel
 */
export const getTaxonomyIndex = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && taxonomyCache && now - lastCacheTime < CACHE_TTL_MS) {
    return taxonomyCache;
  }

  try {
    const categories = await categoryModel.find({}).lean();

    const categoryMap = new Map(); // slug -> category doc
    const subcategoryMap = new Map(); // subcategory slug -> { name, parentCategory, parentSlug }
    const nameToDocMap = new Map(); // lower name -> category doc

    categories.forEach((cat) => {
      const catSlug = cat.slug || slugify(cat.name);
      const catLower = cat.name.toLowerCase().trim();

      categoryMap.set(catSlug, cat);
      nameToDocMap.set(catLower, cat);

      if (Array.isArray(cat.subcategories)) {
        cat.subcategories.forEach((sub) => {
          if (!sub || typeof sub !== "string") return;
          const subSlug = slugify(sub);
          const subLower = sub.toLowerCase().trim();

          const subInfo = {
            name: sub,
            slug: subSlug,
            parentCategory: cat.name,
            parentSlug: catSlug,
          };

          subcategoryMap.set(subSlug, subInfo);
          subcategoryMap.set(subLower, subInfo);
        });
      }
    });

    taxonomyCache = {
      categories,
      categoryMap,
      subcategoryMap,
      nameToDocMap,
    };
    lastCacheTime = now;
    return taxonomyCache;
  } catch (error) {
    console.error("Error fetching taxonomy from MongoDB:", error);
    return {
      categories: [],
      categoryMap: new Map(),
      subcategoryMap: new Map(),
      nameToDocMap: new Map(),
    };
  }
};

/**
 * Common product type & subcategory synonym dictionary
 * Allows "mobile-phones", "smartphones", "phones", "mobile" to resolve uniformly
 */
const SYNONYMS = {
  "mobile-phones": ["Smartphones", "Mobile Phones", "Mobile", "Smartphone", "Phone", "Mobiles"],
  smartphones: ["Smartphones", "Mobile Phones", "Mobile", "Smartphone", "Phone", "Mobiles"],
  smartphone: ["Smartphones", "Mobile Phones", "Mobile", "Smartphone", "Phone", "Mobiles"],
  "mobile-phone": ["Smartphones", "Mobile Phones", "Mobile", "Smartphone", "Phone", "Mobiles"],
  mobiles: ["Smartphones", "Mobile Phones", "Mobile", "Smartphone", "Phone", "Mobiles"],
  mobile: ["Smartphones", "Mobile Phones", "Mobile", "Smartphone", "Phone", "Mobiles"],
  phones: ["Smartphones", "Mobile Phones", "Mobile", "Smartphone", "Phone", "Mobiles"],
  phone: ["Smartphones", "Mobile Phones", "Mobile", "Smartphone", "Phone", "Mobiles"],

  laptops: ["Laptops", "Laptop", "Notebooks", "Notebook", "Ultrabooks", "MacBook"],
  laptop: ["Laptops", "Laptop", "Notebooks", "Notebook", "Ultrabooks", "MacBook"],

  dresses: ["Dresses", "Dress", "Party Dresses", "Women's Dresses", "Maxi Dress", "Midi Dress"],
  dress: ["Dresses", "Dress", "Party Dresses", "Women's Dresses", "Maxi Dress", "Midi Dress"],
  "party-dresses": ["Party Dresses", "Dresses", "Women's Dresses"],

  skirts: ["Skirts", "Skirt", "Mini Skirt", "Midi Skirt", "Maxi Skirt", "Pleated Skirt"],
  skirt: ["Skirts", "Skirt", "Mini Skirt", "Midi Skirt", "Maxi Skirt", "Pleated Skirt"],

  tops: ["Tops", "Top", "Tops & Tees", "Shirts & Blouses", "Blouses", "Crop Top", "Tunics"],
  top: ["Tops", "Top", "Tops & Tees", "Shirts & Blouses", "Blouses"],

  sarees: ["Sarees", "Saree", "Sari", "Ethnic Wear"],
  saree: ["Sarees", "Saree", "Sari", "Ethnic Wear"],

  headphones: ["Headphones", "Headphone", "Audio", "Earphones", "Earbuds", "Audio Devices"],
  headphone: ["Headphones", "Headphone", "Audio", "Earphones", "Earbuds", "Audio Devices"],
  audio: ["Audio", "Headphones", "Speakers", "Earbuds", "Audio Devices"],

  footwear: ["Footwear", "Shoes", "Running Shoes", "Sneakers", "Boots", "Sandals", "Heels"],
  shoes: ["Running Shoes", "Shoes", "Sneakers", "Footwear"],
  "running-shoes": ["Running Shoes", "Shoes", "Sneakers", "Footwear"],

  tshirts: ["T-Shirts", "T-Shirt", "Tshirts", "Tee", "Tees", "Men's T-Shirts"],
  "t-shirts": ["T-Shirts", "T-Shirt", "Tshirts", "Tee", "Tees", "Men's T-Shirts"],
  shirts: ["Shirts", "Shirt", "Casual Shirts", "Formal Shirts"],

  jeans: ["Jeans", "Denim", "Trousers", "Pants"],
  trousers: ["Trousers", "Pants", "Jeans", "Chinos"],
  blazers: ["Blazers", "Blazer", "Suits", "Jackets"],
};

/**
 * Resolves a requested category/subcategory slug or name into:
 * 1. Canonical Category Metadata
 * 2. Precise MongoDB Query Filter
 *
 * Example:
 * resolveCategoryQuery("mobile-phones") ->
 * {
 *   meta: { name: "Mobile Phones", slug: "mobile-phones", parentCategory: "Electronics", level: "subcategory" },
 *   condition: {
 *     $or: [
 *       { subCategory: { $in: [/Smartphones/i, /Mobile Phones/i] } },
 *       { "attributes.productType": { $in: [/Smartphones/i, /Mobile Phones/i] } },
 *       { specifications: { $elemMatch: { key: /product\s*type/i, value: /smartphones|mobile/i } } }
 *     ]
 *   }
 * }
 */
export const resolveCategoryQuery = async (rawCategory, rawSubCategory) => {
  if ((!rawCategory || rawCategory === "all") && (!rawSubCategory || rawSubCategory === "all")) {
    return {
      meta: null,
      condition: null,
    };
  }

  const taxonomy = await getTaxonomyIndex();
  const inputCategory = String(rawCategory || "").trim();
  const inputSubCategory = String(rawSubCategory || "").trim();

  // If both category and subcategory are provided (e.g. category=women&subCategory=Skirts)
  if (inputCategory && inputCategory !== "all" && inputSubCategory && inputSubCategory !== "all") {
    const catSlug = slugify(inputCategory);
    const subSlug = slugify(inputSubCategory);

    const subSynonyms = SYNONYMS[subSlug] || [inputSubCategory];
    const subRegexList = subSynonyms.map((s) => new RegExp(`^${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"));
    const subFuzzyRegex = new RegExp(subSynonyms.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");

    const condition = {
      $and: [
        buildCategoryMatchBranch(inputCategory, catSlug, taxonomy),
        {
          $or: [
            { subCategory: { $in: subRegexList } },
            { subCategory: subFuzzyRegex },
            { "attributes.productType": subFuzzyRegex },
            { "attributes.product_type": subFuzzyRegex },
            {
              attributes: {
                $elemMatch: {
                  $or: [
                    { key: /product\s*type|subcategory/i, value: subFuzzyRegex },
                    { name: /product\s*type|subcategory/i, values: { $in: [subFuzzyRegex] } },
                  ],
                },
              },
            },
            {
              specifications: {
                $elemMatch: {
                  key: /product\s*type|subcategory|type/i,
                  value: subFuzzyRegex,
                },
              },
            },
          ],
        },
      ],
    };

    return {
      meta: {
        name: inputSubCategory,
        slug: subSlug,
        parentCategory: inputCategory,
        parentSlug: catSlug,
        level: "subcategory",
      },
      condition,
    };
  }

  // Target query item (either subcategory or category)
  const target = inputCategory && inputCategory !== "all" ? inputCategory : inputSubCategory;
  const targetSlug = slugify(target);
  const targetLower = target.toLowerCase();

  // 1. Check if target is a known subcategory in taxonomy or synonyms
  const subInfo = taxonomy.subcategoryMap.get(targetSlug) || taxonomy.subcategoryMap.get(targetLower);
  const synonyms = SYNONYMS[targetSlug] || (subInfo ? [subInfo.name] : null);

  // If it's a specific subcategory / product type (e.g. "Mobile Phones", "Laptops", "Skirts", "Smartphones")
  if (subInfo || synonyms) {
    const allNames = Array.from(new Set([...(synonyms || []), ...(subInfo ? [subInfo.name] : []), target]));
    const regexList = allNames.map((n) => new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"));
    const fuzzyRegex = new RegExp(allNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");

    const orBranches = [
      { subCategory: { $in: regexList } },
      { subCategory: fuzzyRegex },
      { category: { $in: regexList } },
      { "attributes.productType": fuzzyRegex },
      { "attributes.product_type": fuzzyRegex },
      { "attributes.type": fuzzyRegex },
      {
        attributes: {
          $elemMatch: {
            $or: [
              { key: /product\s*type|subcategory/i, value: fuzzyRegex },
              { name: /product\s*type|subcategory/i, values: { $in: [fuzzyRegex] } },
            ],
          },
        },
      },
      {
        specifications: {
          $elemMatch: {
            key: /product\s*type|subcategory|type/i,
            value: fuzzyRegex,
          },
        },
      },
    ];

    return {
      meta: {
        name: subInfo?.name || allNames[0],
        slug: targetSlug,
        parentCategory: subInfo?.parentCategory || null,
        parentSlug: subInfo?.parentSlug || null,
        level: "subcategory",
      },
      condition: { $or: orBranches },
    };
  }

  // 2. Check if target is a known top-level / parent category doc (e.g. "Electronics", "Fashion", "Women", "Men")
  const catDoc = taxonomy.categoryMap.get(targetSlug) || taxonomy.nameToDocMap.get(targetLower);
  const condition = buildCategoryMatchBranch(target, targetSlug, taxonomy, catDoc);

  return {
    meta: {
      name: catDoc?.name || target,
      slug: targetSlug,
      parentCategory: null,
      parentSlug: null,
      level: "category",
      subcategories: catDoc?.subcategories || [],
    },
    condition,
  };
};

/**
 * Helper to build MongoDB matching branch for a category
 */
const buildCategoryMatchBranch = (rawName, slug, taxonomy, catDoc = null) => {
  const doc = catDoc || taxonomy.categoryMap.get(slug) || taxonomy.nameToDocMap.get(rawName.toLowerCase());
  const allowedNames = new Set([rawName]);

  if (doc) {
    allowedNames.add(doc.name);
    if (Array.isArray(doc.subcategories)) {
      doc.subcategories.forEach((s) => allowedNames.add(s));
    }
  }

  // Demographic / Gender categories (Women, Men, Kids)
  const isDemographic = ["women", "men", "kids", "kid", "boys", "girls"].includes(slug);
  if (isDemographic) {
    const cleanGen = slug === "kid" || slug === "boys" || slug === "girls" ? "kids" : slug;
    const genRegex = new RegExp(`^${cleanGen}$`, "i");
    const rawRegex = new RegExp(`^${rawName}$`, "i");

    const demoBranches = [
      { category: rawRegex },
      { category: genRegex },
      { audience: genRegex },
      { audience: rawRegex },
      { collection: genRegex },
      { collection: rawRegex },
      { collections: { $in: [genRegex, rawRegex] } },
    ];

    // If Women or Men, also match common demographic apparel subcategories
    if (slug === "women") {
      demoBranches.push({
        subCategory: {
          $in: [/women/i, /dress/i, /skirt/i, /saree/i, /kurti/i, /lehenga/i, /blouse/i],
        },
      });
    } else if (slug === "men") {
      demoBranches.push({
        subCategory: {
          $in: [/men/i, /shirt/i, /trouser/i, /jeans/i, /suit/i],
        },
      });
    }

    return { $or: demoBranches };
  }

  // General Categories (Electronics, Fashion, Beauty, Furniture, etc.)
  const regexList = Array.from(allowedNames).map((n) => new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"));
  const broadRegex = new RegExp(`^${rawName.replace(/-/g, "[\\s-]*")}$`, "i");

  return {
    $or: [
      { category: broadRegex },
      { category: { $in: regexList } },
      { subCategory: { $in: regexList } },
    ],
  };
};

export default {
  resolveCategoryQuery,
  getTaxonomyIndex,
  slugify,
};
