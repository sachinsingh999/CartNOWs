import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
let redisClient = null;
let isRedisConnected = false;

try {
  redisClient = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    showFriendlyErrorStack: false,
    lazyConnect: true,
    retryStrategy(times) {
      // Retry every 10 seconds
      return 10000;
    }
  });

  redisClient.on("error", (err) => {
    if (isRedisConnected) {
      console.log("[Cache] Redis disconnected. Falling back to memory cache.");
      isRedisConnected = false;
    }
  });

  redisClient.on("connect", () => {
    console.log("[Cache] Redis connected successfully.");
    isRedisConnected = true;
  });

  // Start connection asynchronously and handle errors
  redisClient.connect().catch((err) => {
    // Silent catch, offline message will be logged on error event
  });
} catch (e) {
  console.log("[Cache] Failed to initialize Redis. Using memory cache fallback.");
}

// In-Memory Cache Fallback
const memoryCache = new Map();

// Periodic cleanup of expired items in memory cache
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of memoryCache.entries()) {
    if (item.expiry < now) {
      memoryCache.delete(key);
    }
  }
}, 30000);

/**
 * Get value from cache (Redis or Memory)
 * @param {string} key 
 */
export const cacheGet = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      const val = await redisClient.get(key);
      return val ? JSON.parse(val) : null;
    } catch (err) {
      console.error("[Cache] Redis get error:", err);
    }
  }

  // Memory fallback
  const item = memoryCache.get(key);
  if (item) {
    if (item.expiry > Date.now()) {
      return item.value;
    }
    memoryCache.delete(key); // Remove expired item
  }
  return null;
};

/**
 * Set value in cache with TTL
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttlSeconds 
 */
export const cacheSet = async (key, value, ttlSeconds = 300) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return;
    } catch (err) {
      console.error("[Cache] Redis set error:", err);
    }
  }

  // Memory fallback
  memoryCache.set(key, {
    value,
    expiry: Date.now() + (ttlSeconds * 1000)
  });
};

/**
 * Delete value from cache
 * @param {string} key 
 */
export const cacheDel = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.del(key);
      return;
    } catch (err) {
      console.error("[Cache] Redis del error:", err);
    }
  }

  memoryCache.delete(key);
};
