import axios from "axios";

// In-memory cache map holding { promise, data, timestamp, ttl }
const cache = new Map();

/**
 * Generate a unique cache key based on URL and options
 */
const generateCacheKey = (url, config) => {
  try {
    return JSON.stringify({ url, params: config?.params, headers: config?.headers });
  } catch (e) {
    return `${url}_${Date.now()}`;
  }
};

/**
 * Synchronously retrieve cached data if available (from memory or sessionStorage)
 * Allows components to render immediately in 0ms without waiting for network.
 */
export const getSyncCachedData = (url, config = {}) => {
  const key = generateCacheKey(url, config);
  const now = Date.now();

  // 1. Check in-memory cache
  const memCached = cache.get(key);
  if (memCached && memCached.data && now - memCached.timestamp < memCached.ttl) {
    return memCached.data;
  }

  // 2. Check sessionStorage cache
  try {
    const raw = sessionStorage.getItem(`cartnow_api_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && now - parsed.timestamp < (parsed.ttl || 300000)) {
        return parsed.data;
      }
    }
  } catch (e) {}

  return null;
};

/**
 * Perform a cached GET request with Stale-While-Revalidate semantics.
 * - Deduplicates concurrent identical requests.
 * - Caches resolved data in-memory and in sessionStorage.
 * - Auto-invalidates after TTL (default 5 minutes).
 */
export const cachedGet = (url, config = {}, ttl = 300000) => {
  const key = generateCacheKey(url, config);
  const now = Date.now();
  const cached = cache.get(key);

  // If a valid cache item exists and has not expired, return it
  if (cached && now - cached.timestamp < cached.ttl) {
    return cached.promise;
  }

  // Create new request promise
  const promise = axios.get(url, config).then((res) => {
    // Store resolved response data in memory & sessionStorage
    if (res?.data) {
      cache.set(key, {
        promise: Promise.resolve(res),
        data: res.data,
        timestamp: Date.now(),
        ttl
      });
      try {
        sessionStorage.setItem(
          `cartnow_api_${key}`,
          JSON.stringify({ data: res.data, timestamp: Date.now(), ttl })
        );
      } catch (e) {}
    }
    return res;
  });

  // Cache the promise immediately (acts as deduplicator for concurrent triggers)
  cache.set(key, {
    promise,
    data: cached?.data || null,
    timestamp: now,
    ttl
  });

  // Handle promise rejection
  promise.catch(() => {
    // Evict on error so retries can occur
    cache.delete(key);
    try {
      sessionStorage.removeItem(`cartnow_api_${key}`);
    } catch (e) {}
  });

  return promise;
};

/**
 * Clear a specific cache entry or the entire cache.
 */
export const clearApiCache = (url = null, config = {}) => {
  if (url) {
    const key = generateCacheKey(url, config);
    cache.delete(key);
    try {
      sessionStorage.removeItem(`cartnow_api_${key}`);
    } catch (e) {}
  } else {
    cache.clear();
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach((k) => {
        if (k.startsWith("cartnow_api_")) {
          sessionStorage.removeItem(k);
        }
      });
    } catch (e) {}
  }
};

