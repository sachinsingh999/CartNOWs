import axios from "axios";

// In-memory cache map holding { promise, timestamp, ttl }
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
 * Perform a cached GET request.
 * - Deduplicates concurrent identical requests.
 * - Caches resolved data in-memory.
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
  const promise = axios.get(url, config);

  // Cache the promise immediately (acts as deduplicator for concurrent triggers)
  cache.set(key, {
    promise,
    timestamp: now,
    ttl
  });

  // Handle promise resolution/rejection
  promise.catch(() => {
    // Evict on error so retries can occur
    cache.delete(key);
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
  } else {
    cache.clear();
  }
};
