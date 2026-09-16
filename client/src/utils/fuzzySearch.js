/**
 * Client-side Typo-Tolerant & Fuzzy Search Engine Utility
 * Provides Damerau-Levenshtein calculation, common typo dictionary,
 * and high-accuracy product matching for frontend search and autocomplete.
 */

export const COMMON_TYPOS = {
  // Shoes & Footwear
  "shos": "shoes",
  "shose": "shoes",
  "shoos": "shoes",
  "shooes": "shoes",
  "sheos": "shoes",
  "shoess": "shoes",
  "soes": "shoes",
  "shoo": "shoes",
  "snekers": "sneakers",
  "sneekers": "sneakers",
  "snikers": "sneakers",
  "snekar": "sneakers",
  "sneekars": "sneakers",
  "snickers": "sneakers",
  "fotwear": "footwear",
  "footware": "footwear",
  "sandels": "sandals",
  "sandles": "sandals",
  "sandel": "sandals",
  "slipers": "slippers",
  "slipper": "slippers",

  // Tech & Electronics
  "lapotp": "laptop",
  "leptop": "laptop",
  "laptpo": "laptop",
  "loptop": "laptop",
  "labtop": "laptop",
  "lap top": "laptop",
  "laptap": "laptop",
  "hedphone": "headphone",
  "hedphones": "headphones",
  "headfone": "headphone",
  "headfones": "headphones",
  "hedfone": "headphone",
  "hedfones": "headphones",
  "headpones": "headphones",
  "headpone": "headphone",
  "headphons": "headphones",
  "erbuds": "earbuds",
  "earbud": "earbuds",
  "earbds": "earbuds",
  "earpods": "earbuds",
  "airpods": "earbuds",
  "erphone": "earphones",
  "earfone": "earphones",
  "speeker": "speaker",
  "spekers": "speakers",
  "speker": "speaker",
  "spkr": "speaker",
  "sondbar": "soundbar",
  "electrnic": "electronics",
  "electrnics": "electronics",
  "electornics": "electronics",
  "electrinocs": "electronics",
  "gadgt": "gadget",
  "gadgts": "gadgets",

  // Mobiles & Brands
  "smartphon": "smartphone",
  "smartfone": "smartphone",
  "smrtphone": "smartphone",
  "mobil": "mobile",
  "mobiles": "mobile",
  "moble": "mobile",
  "fone": "phone",
  "fones": "phones",
  "iphne": "iphone",
  "ipone": "iphone",
  "ifone": "iphone",
  "samsng": "samsung",
  "sumsung": "samsung",
  "samusng": "samsung",
  "samung": "samsung",
  "onepluse": "oneplus",
  "1plus": "oneplus",
  "one plus": "oneplus",
  "relme": "realme",
  "radmi": "redmi",
  "xiomi": "xiaomi",
  "xaomi": "xiaomi",

  // Watches & Accessories
  "watchs": "watches",
  "wach": "watch",
  "waches": "watches",
  "watche": "watch",
  "wtch": "watch",
  "smartwtch": "smartwatch",
  "smartwach": "smartwatch",
  "sunglas": "sunglasses",
  "sunglass": "sunglasses",
  "sunglases": "sunglasses",
  "sunglasess": "sunglasses",
  "gogles": "goggles",
  "gogel": "goggles",
  "walet": "wallet",
  "wallets": "wallet",
  "pures": "purse",
  "jewlery": "jewelry",
  "jewellry": "jewelry",
  "jwellery": "jewelry",

  // Apparel & Fashion
  "tshrt": "t-shirt",
  "t-shrt": "t-shirt",
  "t shrt": "t-shirt",
  "tshir": "t-shirt",
  "tshrts": "t-shirt",
  "tee shirt": "t-shirt",
  "shrt": "shirt",
  "shrts": "shirts",
  "jaket": "jacket",
  "jakets": "jackets",
  "jacet": "jacket",
  "jackt": "jacket",
  "hoddie": "hoodie",
  "hodi": "hoodie",
  "sweter": "sweater",
  "jeens": "jeans",
  "jens": "jeans",
  "jeanz": "jeans",
  "jean": "jeans",
  "trouser": "trousers",
  "jogger": "joggers",
  "kurtis": "kurti",
  "kurta": "kurti",
  "sari": "saree",
  "dres": "dress",

  // Beauty & Perfume
  "perfum": "perfume",
  "parfum": "perfume",
  "perfumee": "perfume",
  "parfume": "perfume",
  "deodrant": "deodorant",
  "deo": "deodorant",
  "frgrance": "fragrance",
  "lipstik": "lipstick",
  "serum": "serum",
  "serm": "serum",
  "sunscren": "sunscreen",
  "shampo": "shampoo",
  "facwash": "facewash",

  // Home & Kitchen
  "airfryer": "air fryer",
  "blndr": "blender",
  "vacum": "vacuum",
  "vaccum": "vacuum",
  "sof": "sofa",

  // Brands
  "adidass": "adidas",
  "addidas": "adidas",
  "adiddas": "adidas",
  "nkies": "nike",
  "nikes": "nike",
  "puam": "puma",
  "pumma": "puma",
  "rebok": "reebok",
  "rebook": "reebok",
  "aple": "apple",
  "snoy": "sony",
  "bot": "boat",
  "noice": "noise",
  "casioo": "casio",
  "titn": "titan",
  "fosiil": "fossil",
  "macbok": "macbook"
};

/**
 * Calculates Damerau-Levenshtein distance
 */
export function damerauLevenshtein(a = "", b = "") {
  if (!a || !b) return (a || b || "").length;
  const s1 = a.toLowerCase();
  const s2 = b.toLowerCase();
  if (s1 === s2) return 0;
  const len1 = s1.length;
  const len2 = s2.length;

  const d = [];
  for (let i = 0; i <= len1; i++) d[i] = [i];
  for (let j = 0; j <= len2; j++) d[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
      if (i > 1 && j > 1 && s1[i - 1] === s2[j - 2] && s1[i - 2] === s2[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }
  return d[len1][len2];
}

/**
 * Normalizes and corrects typos in a search term
 */
export function normalizeAndCorrectQuery(query = "") {
  if (!query || typeof query !== "string") return { original: "", corrected: "", didYouMean: null };

  const original = query.trim();
  const lower = original.toLowerCase();

  // 1. Direct match in dictionary
  if (COMMON_TYPOS[lower]) {
    return {
      original,
      corrected: COMMON_TYPOS[lower],
      didYouMean: COMMON_TYPOS[lower]
    };
  }

  // 2. Word by word check
  const words = original.split(/[\s,+/_-]+/).filter(Boolean);
  let hasCorrection = false;
  const correctedWords = words.map(w => {
    const cleanW = w.toLowerCase();
    if (COMMON_TYPOS[cleanW]) {
      hasCorrection = true;
      return COMMON_TYPOS[cleanW];
    }
    return w;
  });

  const corrected = correctedWords.join(" ");
  return {
    original,
    corrected,
    didYouMean: hasCorrection ? corrected : null
  };
}

// Domain E-Commerce Synonyms Mapping
export const SYNONYMS = {
  "laptop": ["macbook", "notebook", "ultrabook", "computer", "pc"],
  "laptops": ["macbook", "macbooks", "notebook", "notebooks", "laptop"],
  "macbook": ["laptop", "notebook", "apple"],
  "headphone": ["headphones", "earbuds", "earphones", "airpods", "headset", "audio"],
  "headphones": ["headphone", "earbuds", "earphones", "airpods", "headset", "audio"],
  "earbuds": ["airpods", "earphones", "headphone", "headphones"],
  "airpods": ["earbuds", "earphones", "headphones"],
  "phone": ["smartphone", "mobile", "iphone", "cellphone"],
  "phones": ["smartphone", "smartphones", "mobile", "mobiles", "iphone"],
  "smartphone": ["phone", "mobile", "iphone"],
  "smartphones": ["phones", "mobiles", "iphone", "smartphone"],
  "mobile": ["phone", "smartphone", "iphone"],
  "mobiles": ["phones", "smartphones", "mobile"],
  "iphone": ["apple", "smartphone", "mobile", "phone"],
  "shoes": ["sneakers", "footwear", "boots", "loafers", "sandals", "slippers"],
  "shoe": ["shoes", "sneakers", "footwear"],
  "sneakers": ["shoes", "footwear", "sneaker"],
  "sneaker": ["shoes", "sneakers", "footwear"],
  "footwear": ["shoes", "sneakers", "sandals", "slippers", "boots"],
  "jacket": ["hoodie", "coat", "blazer", "sweater", "sweatshirt", "jackets"],
  "jackets": ["jacket", "hoodie", "hoodies", "coat", "sweater"],
  "hoodie": ["jacket", "sweatshirt", "sweater", "hoodies"],
  "hoodies": ["hoodie", "jacket", "sweatshirt"],
  "t-shirt": ["tshirt", "tee", "shirt", "polo", "t-shirts"],
  "tshirt": ["t-shirt", "tee", "shirt", "polo"],
  "shirt": ["t-shirt", "tshirt", "shirts"],
  "perfume": ["fragrance", "cologne", "deodorant", "scent", "perfumes"],
  "perfumes": ["perfume", "fragrance", "cologne", "deodorant"],
  "fragrance": ["perfume", "cologne", "scent"],
  "watch": ["smartwatch", "watches", "chronograph"],
  "watches": ["watch", "smartwatch", "smartwatches"],
  "smartwatch": ["watch", "smartwatches", "fitness tracker"],
  "sunglasses": ["sunglass", "glasses", "goggles", "eyewear", "shades"],
  "bag": ["backpack", "handbag", "bags", "tote", "purse"],
  "bags": ["backpack", "backpacks", "handbag", "handbags", "bag", "purse"],
  "backpack": ["bag", "backpacks", "luggage"],
  "wallet": ["wallets", "purse"],
  "saree": ["sari", "ethnic", "dress"],
  "kurti": ["kurta", "ethnic", "dress"]
};

/**
 * Intelligent product fuzzy search matching algorithm
 * Checks if a product matches the query via exact substring, word tokens,
 * typo corrections, synonyms, or fuzzy edit-distance match.
 */
export function matchesFuzzySearch(product, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return true;
  if (!product) return false;

  const { original, corrected } = normalizeAndCorrectQuery(rawQuery);
  const words = Array.from(new Set([
    original.toLowerCase(),
    corrected.toLowerCase(),
    ...original.toLowerCase().split(/[\s,+/_-]+/).filter(w => w.length >= 2),
    ...corrected.toLowerCase().split(/[\s,+/_-]+/).filter(w => w.length >= 2)
  ]));

  // Expand with synonyms
  const synonymTerms = [];
  words.forEach(w => {
    if (SYNONYMS[w]) {
      synonymTerms.push(...SYNONYMS[w]);
    }
  });

  const qTerms = Array.from(new Set([...words, ...synonymTerms]));

  const pName = (product.name || "").toLowerCase();
  const pBrand = (product.brand || "").toLowerCase();
  const pCategory = (product.category || "").toLowerCase();
  const pSubCategory = (product.subCategory || "").toLowerCase();
  const pDesc = (product.description || "").toLowerCase();
  const pTags = Array.isArray(product.tags) ? product.tags.map(t => String(t).toLowerCase()) : [];
  const pKeywords = Array.isArray(product.keywords) ? product.keywords.map(k => String(k).toLowerCase()) : [];

  const productTokens = Array.from(new Set([
    ...pName.split(/[\s,+/_-]+/).filter(w => w.length >= 2),
    ...pBrand.split(/[\s,+/_-]+/).filter(w => w.length >= 2),
    ...pCategory.split(/[\s,+/_-]+/).filter(w => w.length >= 2),
    ...pSubCategory.split(/[\s,+/_-]+/).filter(w => w.length >= 2),
    ...pTags,
    ...pKeywords
  ]));

  // 1. Exact or Substring Matches (Highest Confidence)
  for (const term of qTerms) {
    if (
      pName.includes(term) ||
      pBrand.includes(term) ||
      pCategory.includes(term) ||
      pSubCategory.includes(term) ||
      pTags.some(t => t.includes(term)) ||
      pKeywords.some(k => k.includes(term)) ||
      pDesc.includes(term)
    ) {
      return true;
    }
  }

  // 2. Fuzzy Token Distance Match (For arbitrary user typos)
  // Run fuzzy edit-distance on normalized/corrected words
  const fuzzyWords = Array.from(new Set([
    corrected.toLowerCase(),
    ...corrected.toLowerCase().split(/[\s,+/_-]+/).filter(w => w.length >= 3)
  ]));

  for (const qWord of fuzzyWords) {
    if (qWord.length < 3) continue;
    // For words with length 3-4: allow max 1 edit (must share first char)
    // For words with length >= 5: allow max 1 edit, or max 2 edits if first char matches
    const maxDist = qWord.length <= 4 ? 1 : 2;

    for (const pToken of productTokens) {
      if (Math.abs(pToken.length - qWord.length) > maxDist) continue;
      // Precision guard: if first character differs, only allow distance of 1
      const firstCharMatches = qWord[0] === pToken[0];
      const effectiveMaxDist = firstCharMatches ? maxDist : 1;

      const dist = damerauLevenshtein(qWord, pToken);
      if (dist <= effectiveMaxDist) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Ranks and sorts an array of products by relevance score against search query
 */
export function rankProductsBySearchRelevance(products = [], rawQuery = "") {
  if (!rawQuery || !rawQuery.trim() || !Array.isArray(products)) return products;

  const { original, corrected } = normalizeAndCorrectQuery(rawQuery);
  const origLower = original.toLowerCase();
  const corrLower = corrected.toLowerCase();

  return [...products].sort((a, b) => {
    const scoreA = getRelevanceScore(a, origLower, corrLower);
    const scoreB = getRelevanceScore(b, origLower, corrLower);
    return scoreB - scoreA;
  });
}

function getRelevanceScore(product, origQuery, corrQuery) {
  let score = 0;
  const name = (product.name || "").toLowerCase();
  const brand = (product.brand || "").toLowerCase();
  const cat = (product.category || "").toLowerCase();
  const sub = (product.subCategory || "").toLowerCase();

  // Exact full title match
  if (name === origQuery || name === corrQuery) score += 100;
  else if (name.startsWith(origQuery) || name.startsWith(corrQuery)) score += 60;
  else if (name.includes(origQuery) || name.includes(corrQuery)) score += 40;

  // Exact Brand match
  if (brand === origQuery || brand === corrQuery) score += 50;
  else if (brand.includes(origQuery) || brand.includes(corrQuery)) score += 30;

  // Category match
  if (cat === origQuery || cat === corrQuery) score += 35;
  else if (cat.includes(origQuery) || cat.includes(corrQuery)) score += 20;

  // SubCategory match
  if (sub === origQuery || sub === corrQuery) score += 30;

  // Rating & Best seller boost
  if (product.isBestSeller || product.bestseller) score += 10;
  score += (product.averageRating || product.rating?.average || product.rating || 0) * 2;

  return score;
}
