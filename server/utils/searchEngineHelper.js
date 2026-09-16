/**
 * Advanced Typo-Tolerant E-Commerce Search Engine Helper
 * Provides Levenshtein & Damerau distance calculation, phonetic normalization,
 * common typo correction, synonym expansion, and fuzzy regex generation for MongoDB.
 */

// Comprehensive E-Commerce Vocabulary & Synonyms
const VOCABULARY = [
  // Categories & Departments
  "shoes", "shoe", "footwear", "sneakers", "sneaker", "boots", "boot", "sandals", "sandal", "slippers", "heels", "loafers", "crocs",
  "fashion", "clothing", "apparel", "clothes", "wear", "outfit", "style",
  "shirt", "shirts", "t-shirt", "tshirt", "tshirts", "tee", "tees", "polo",
  "jacket", "jackets", "hoodie", "hoodies", "sweater", "sweatshirt", "coat", "blazer", "cardigan", "windbreaker",
  "jeans", "pants", "trousers", "joggers", "shorts", "cargos", "cargo", "leggings", "trackpants", "denim",
  "dress", "dresses", "kurta", "kurti", "saree", "ethnic", "gown", "top", "tops", "skirt", "suit",
  "electronics", "electronic", "gadget", "gadgets", "tech", "device",
  "laptop", "laptops", "notebook", "ultrabook", "macbook", "computer", "pc", "desktop", "monitor",
  "headphone", "headphones", "headset", "earphone", "earphones", "earbuds", "airpods", "audio", "speaker", "speakers", "soundbar",
  "smartphone", "smartphones", "mobile", "mobiles", "phone", "phones", "iphone", "android", "cellphone",
  "smartwatch", "smartwatches", "watch", "watches", "chronograph", "fitness", "tracker",
  "camera", "cameras", "dslr", "lens", "tripod", "webcam",
  "beauty", "skincare", "skin", "care", "cosmetics", "makeup", "wellness",
  "perfume", "perfumes", "fragrance", "fragrances", "cologne", "deodorant", "scent", "body spray",
  "serum", "lipstick", "cream", "lotion", "sunscreen", "shampoo", "conditioner", "facewash", "moisturizer",
  "bags", "bag", "backpack", "backpacks", "handbag", "handbags", "tote", "duffel", "luggage", "suitcase", "wallet", "wallets", "purse",
  "accessories", "accessory", "sunglasses", "sunglass", "glasses", "eyewear", "shades", "goggles",
  "cap", "caps", "hat", "hats", "beanie", "belt", "belts", "socks", "tie", "scarf", "jewelry", "jewellery", "ring", "necklace", "bracelet", "earrings",
  "home", "living", "kitchen", "cookware", "appliances", "appliance", "decor", "furniture",
  "air fryer", "mixer", "blender", "microwave", "toaster", "vacuum", "purifier", "kettle", "chimney",
  "sofa", "bed", "chair", "table", "cushion", "curtain", "lamp", "lights", "bedsheet", "mat",
  "sports", "sport", "fitness", "gym", "workout", "cricket", "football", "badminton", "dumbbell", "yoga", "mat",
  "books", "book", "novel", "fiction", "bestseller", "paperback", "hardcover",

  // Popular Brands
  "apple", "samsung", "sony", "nike", "adidas", "puma", "reebok", "under armour", "new balance", "skechers",
  "boat", "noise", "boult", "fire-boltt", "realme", "redmi", "xiaomi", "oneplus", "oppo", "vivo", "motorola", "google", "pixel",
  "dell", "hp", "lenovo", "asus", "acer", "msi", "razer", "logitech", "corsair",
  "zara", "h&m", "levis", "levi's", "roadster", "hrx", "allen solly", "van heusen", "louis philippe", "peter england", "flying machine",
  "casio", "fossil", "titan", "fastrack", "timex", "seiko", "tommy hilfiger", "daniel wellington",
  "nivea", "loreal", "maybelline", "mamaearth", "plum", "minimalist", "garnier", "biotique", "the ordinary",
  "philips", "prestige", "bajaj", "havells", "kent", "dyson", "eureka forbes", "milton", "cello"
];

// Direct Instant O(1) Typo Correction Mapping
const COMMON_TYPOS = {
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
  "footwer": "footwear",
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
  "soundbr": "soundbar",
  "electrnic": "electronics",
  "electrnics": "electronics",
  "electornics": "electronics",
  "electrinocs": "electronics",
  "gadgt": "gadget",
  "gadgts": "gadgets",

  // Mobiles & Gadgets
  "smartphon": "smartphone",
  "smartfone": "smartphone",
  "smrtphone": "smartphone",
  "mobil": "mobile",
  "mobiles": "mobile",
  "moble": "mobile",
  "mobils": "mobile",
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
  "xomi": "xiaomi",

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
  "sun glasses": "sunglasses",
  "gogles": "goggles",
  "gogel": "goggles",
  "gogls": "goggles",
  "chashma": "sunglasses",
  "walet": "wallet",
  "wallets": "wallet",
  "walett": "wallet",
  "pures": "purse",
  "jewlery": "jewelry",
  "jewellry": "jewelry",
  "jwellery": "jewelry",
  "jewelery": "jewelry",
  "braclet": "bracelet",
  "neckles": "necklace",
  "ering": "earrings",
  "earings": "earrings",

  // Apparel & Fashion
  "tshrt": "t-shirt",
  "t-shrt": "t-shirt",
  "t shrt": "t-shirt",
  "tshir": "t-shirt",
  "tshrts": "t-shirt",
  "tee shirt": "t-shirt",
  "teeshirt": "t-shirt",
  "shrt": "shirt",
  "shrts": "shirts",
  "jaket": "jacket",
  "jakets": "jackets",
  "jacet": "jacket",
  "jackt": "jacket",
  "hoddie": "hoodie",
  "hodi": "hoodie",
  "hodie": "hoodie",
  "hoody": "hoodie",
  "sweter": "sweater",
  "swater": "sweater",
  "sweeter": "sweater",
  "swatshirt": "sweatshirt",
  "jeens": "jeans",
  "jens": "jeans",
  "jeanz": "jeans",
  "jean": "jeans",
  "trouser": "trousers",
  "trousrs": "trousers",
  "jogger": "joggers",
  "joggar": "joggers",
  "cargos": "cargo",
  "kurtis": "kurti",
  "kurta": "kurti",
  "sari": "saree",
  "sary": "saree",
  "dres": "dress",
  "dresses": "dress",

  // Beauty & Perfume
  "perfum": "perfume",
  "parfum": "perfume",
  "perfumee": "perfume",
  "parfume": "perfume",
  "perfumse": "perfumes",
  "deodrant": "deodorant",
  "deodrent": "deodorant",
  "deo": "deodorant",
  "frgrance": "fragrance",
  "fragrnace": "fragrance",
  "colone": "cologne",
  "lipstik": "lipstick",
  "lipstic": "lipstick",
  "lipstck": "lipstick",
  "serum": "serum",
  "serm": "serum",
  "sunscren": "sunscreen",
  "suncreen": "sunscreen",
  "shampo": "shampoo",
  "shampuu": "shampoo",
  "facwash": "facewash",
  "face wash": "facewash",

  // Home & Kitchen
  "cookwer": "cookware",
  "cokware": "cookware",
  "airfryer": "air fryer",
  "airfrier": "air fryer",
  "blndr": "blender",
  "vacum": "vacuum",
  "vaccum": "vacuum",
  "sof": "sofa",
  "sofas": "sofa",
  "curtans": "curtain",
  "curtan": "curtains",
  "bedshets": "bedsheet",
  "bed shet": "bedsheet",

  // Brands
  "adidass": "adidas",
  "addidas": "adidas",
  "adiddas": "adidas",
  "adida": "adidas",
  "nkies": "nike",
  "nikes": "nike",
  "nik": "nike",
  "puam": "puma",
  "pumma": "puma",
  "rebok": "reebok",
  "rebook": "reebok",
  "skecher": "skechers",
  "skechrs": "skechers",
  "aple": "apple",
  "appl": "apple",
  "snoy": "sony",
  "bot": "boat",
  "boAt": "boat",
  "noice": "noise",
  "casioo": "casio",
  "titn": "titan",
  "fosiil": "fossil",
  "fosil": "fossil",
  "macbok": "macbook",
  "mackbook": "macbook"
};

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
 * Calculates Damerau-Levenshtein distance between two strings.
 * Handles insertions, deletions, substitutions, and adjacent transpositions.
 */
function damerauLevenshtein(a, b) {
  if (!a || !b) return (a || b || "").length;
  const s1 = a.toLowerCase();
  const s2 = b.toLowerCase();
  
  if (s1 === s2) return 0;
  const len1 = s1.length;
  const len2 = s2.length;

  const d = [];
  for (let i = 0; i <= len1; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,       // deletion
        d[i][j - 1] + 1,       // insertion
        d[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (i > 1 && j > 1 && s1[i - 1] === s2[j - 2] && s1[i - 2] === s2[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }

  return d[len1][len2];
}

/**
 * Simple Soundex implementation for phonetic similarity
 */
function soundex(str) {
  if (!str) return "";
  const s = str.toUpperCase().replace(/[^A-Z]/g, "");
  if (!s) return "";
  
  const map = {
    B: 1, F: 1, P: 1, V: 1,
    C: 2, G: 2, J: 2, K: 2, Q: 2, S: 2, X: 2, Z: 2,
    D: 3, T: 3,
    L: 4,
    M: 5, N: 5,
    R: 6
  };

  let firstChar = s[0];
  let res = firstChar;
  let prevCode = map[firstChar] || 0;

  for (let i = 1; i < s.length; i++) {
    const code = map[s[i]] || 0;
    if (code !== 0 && code !== prevCode) {
      res += code;
    }
    prevCode = code;
    if (res.length === 4) break;
  }

  return (res + "0000").slice(0, 4);
}

/**
 * Corrects a single misspelled word using known typos, Damerau-Levenshtein, and vocabulary.
 * Returns { correctedWord, isCorrected }
 */
function correctWord(word, customVocab = []) {
  if (!word || word.length < 2) return { correctedWord: word, isCorrected: false };
  const clean = word.toLowerCase().trim();

  // 1. Direct O(1) typo dictionary check
  if (COMMON_TYPOS[clean]) {
    return { correctedWord: COMMON_TYPOS[clean], isCorrected: true };
  }

  // Combine static and custom vocabulary
  const vocabList = [...new Set([...VOCABULARY, ...customVocab.map(w => w.toLowerCase())])];

  // If already exactly in vocabulary, return as is
  if (vocabList.includes(clean)) {
    return { correctedWord: clean, isCorrected: false };
  }

  // 2. Compute minimum edit distance across vocabulary
  let bestMatch = clean;
  let minDistance = Infinity;
  const cleanSoundex = soundex(clean);

  // Maximum allowed distance depends on word length
  const maxAllowedDist = clean.length <= 3 ? 1 : clean.length <= 6 ? 2 : 3;

  for (const candidate of vocabList) {
    // If length difference is larger than maxAllowedDist, skip
    if (Math.abs(candidate.length - clean.length) > maxAllowedDist) continue;

    const dist = damerauLevenshtein(clean, candidate);
    
    // Bonus for matching soundex
    const soundexBonus = soundex(candidate) === cleanSoundex ? -0.5 : 0;
    const effectiveScore = dist + soundexBonus;

    if (dist <= maxAllowedDist && effectiveScore < minDistance) {
      minDistance = effectiveScore;
      bestMatch = candidate;
    }
  }

  const isCorrected = bestMatch !== clean && minDistance <= maxAllowedDist;
  return {
    correctedWord: isCorrected ? bestMatch : clean,
    isCorrected
  };
}

/**
 * Analyzes full multi-word search string and returns:
 * - originalQuery: string
 * - correctedQuery: string
 * - didYouMean: string | null
 * - allKeywords: Array of unique terms (original + corrected + variations)
 */
export function analyzeSearchTerm(searchTerm, customVocab = []) {
  if (!searchTerm || typeof searchTerm !== "string") {
    return {
      originalQuery: "",
      correctedQuery: "",
      didYouMean: null,
      allKeywords: [],
      hasTypo: false
    };
  }

  const originalQuery = searchTerm.trim();
  const rawWords = originalQuery.split(/[\s,+/_-]+/).filter(w => w.length > 0);

  if (rawWords.length === 0) {
    return {
      originalQuery,
      correctedQuery: originalQuery,
      didYouMean: null,
      allKeywords: [],
      hasTypo: false
    };
  }

  // Check whole phrase direct typo first (e.g. "air fryer", "head phone", "t shirt")
  const lowerPhrase = originalQuery.toLowerCase();
  if (COMMON_TYPOS[lowerPhrase]) {
    const corrected = COMMON_TYPOS[lowerPhrase];
    return {
      originalQuery,
      correctedQuery: corrected,
      didYouMean: corrected,
      allKeywords: [originalQuery, corrected, ...corrected.split(/\s+/)],
      hasTypo: true
    };
  }

  let hasTypo = false;
  const correctedWords = [];
  const allTermsSet = new Set();

  rawWords.forEach((word) => {
    allTermsSet.add(word);
    const { correctedWord, isCorrected } = correctWord(word, customVocab);
    correctedWords.push(correctedWord);
    allTermsSet.add(correctedWord);

    if (isCorrected) {
      hasTypo = true;
    }
  });

  const correctedQuery = correctedWords.join(" ");
  const didYouMean = hasTypo && correctedQuery.toLowerCase() !== originalQuery.toLowerCase() ? correctedQuery : null;

  // Add domain synonyms to keywords
  Array.from(allTermsSet).forEach(t => {
    const low = t.toLowerCase();
    if (SYNONYMS[low]) {
      SYNONYMS[low].forEach(syn => allTermsSet.add(syn));
    }
  });

  return {
    originalQuery,
    correctedQuery,
    didYouMean,
    allKeywords: Array.from(allTermsSet),
    hasTypo
  };
}

/**
 * Builds an intelligent MongoDB query clause with:
 * 1. Exact term matching (matches name, description, category, subCategory, brand, tags, specifications)
 * 2. Typo-corrected term matching
 * 3. Fuzzy wildcard matching
 */
export function buildTypoTolerantQuery(searchTerm, customVocab = []) {
  if (!searchTerm || typeof searchTerm !== "string") return null;

  const analysis = analyzeSearchTerm(searchTerm, customVocab);
  const termsToSearch = analysis.allKeywords.filter(t => t.length >= 2);

  if (termsToSearch.length === 0) return null;

  const orConditions = [];

  termsToSearch.forEach((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const termRegex = new RegExp(escaped, "i");

    orConditions.push(
      { name: termRegex },
      { description: termRegex },
      { brand: termRegex },
      { category: termRegex },
      { subCategory: termRegex },
      { tags: { $in: [termRegex] } },
      { keywords: { $in: [termRegex] } },
      { collections: { $in: [termRegex] } },
      { audience: termRegex }
    );
  });

  // If search query is multi-word, also match the full phrase
  if (analysis.correctedQuery && analysis.correctedQuery !== searchTerm) {
    const fullPhraseEscaped = analysis.correctedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const fullPhraseRegex = new RegExp(fullPhraseEscaped, "i");
    orConditions.push(
      { name: fullPhraseRegex },
      { description: fullPhraseRegex },
      { brand: fullPhraseRegex },
      { category: fullPhraseRegex },
      { tags: { $in: [fullPhraseRegex] } }
    );
  }

  return {
    $or: orConditions,
    searchMeta: analysis
  };
}
