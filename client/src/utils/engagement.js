// Engagement tracker — persists user browsing behaviour in localStorage

const STORAGE_KEYS = {
  VIEWED: "cn_viewed_products",     // [{id, name, category, image, price, ts}]
  CAT_COUNTS: "cn_cat_counts",      // {category: count}
  SEARCHES: "cn_searches",          // [string]
};

// ── Track a product view ──────────────────────────────────────────────────────
export const trackView = (product) => {
  if (!product?._id) return;

  // recently viewed list (max 20)
  const viewed = getViewed();
  const filtered = viewed.filter((p) => p.id !== product._id);
  const entry = {
    id: product._id,
    name: product.name,
    category: product.category,
    collection: product.collection,
    price: product.price,
    image: product.images?.[0] || product.image || "",
    ts: Date.now(),
  };
  filtered.unshift(entry);
  localStorage.setItem(STORAGE_KEYS.VIEWED, JSON.stringify(filtered.slice(0, 20)));

  // category frequency map
  if (product.category) {
    const counts = getCatCounts();
    counts[product.category] = (counts[product.category] || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.CAT_COUNTS, JSON.stringify(counts));
  }
};

// ── Track a search query ──────────────────────────────────────────────────────
export const trackSearch = (query) => {
  if (!query?.trim()) return;
  const searches = getSearches();
  const filtered = searches.filter((s) => s !== query.trim());
  filtered.unshift(query.trim());
  localStorage.setItem(STORAGE_KEYS.SEARCHES, JSON.stringify(filtered.slice(0, 10)));
};

// ── Getters ───────────────────────────────────────────────────────────────────
export const getViewed = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.VIEWED) || "[]"); }
  catch { return []; }
};

export const getCatCounts = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CAT_COUNTS) || "{}"); }
  catch { return {}; }
};

export const getSearches = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCHES) || "[]"); }
  catch { return []; }
};

// ── Derived helpers ───────────────────────────────────────────────────────────
// Returns top N preferred categories sorted by view count
export const getTopCategories = (n = 3) => {
  const counts = getCatCounts();
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([cat]) => cat);
};

// Given a full product list, return up to `n` recommended products
// based on user's preferred categories, excluding already viewed IDs
export const getRecommended = (products, n = 8) => {
  const topCats = getTopCategories(3);
  const viewedIds = new Set(getViewed().map((p) => p.id));

  if (topCats.length === 0) return products.slice(0, n); // cold-start fallback

  const priority = products.filter(
    (p) => topCats.includes(p.category) && !viewedIds.has(p._id)
  );
  const rest = products.filter(
    (p) => !topCats.includes(p.category) && !viewedIds.has(p._id)
  );

  return [...priority, ...rest].slice(0, n);
};

// Is this a returning user (has any engagement)?
export const isReturningUser = () => getViewed().length > 0;
