/**
 * Image Optimizer Utility for CartNOW
 * 
 * Provides automated CDN URL optimization, smart dimension scaling,
 * next-gen format negotiation (WebP/AVIF), and preloading helpers.
 */

// In-memory cache set to track already loaded images across route changes
const loadedImagesCache = new Set();

// Fallback dictionary to heal known removed/404 Unsplash photos across DB products
const DEAD_UNSPLASH_MAP = {
  "photo-1695048133142-1a20484d2569": "photo-1592750475338-74b7b21085ab",
  "photo-1629470989153-65934c59b4e9": "photo-1511707171634-5f897ff02aa9",
  "photo-1530018607912-eff2df114f12": "photo-1523275335684-37898b6baf30",
  "photo-1622279457486-62dcc4a4b1fa": "photo-1505740420928-5e560c06d30e",
  "photo-1508098682722-e99c43a406b2": "photo-1546868871-7041f2a55e12",
  "photo-1520606407011-23c2f8fa678e": "photo-1542291026-7eec264c27ff",
  "photo-1617083934555-ac7d4feeae2e": "photo-1584308666744-24d5c474f2ae"
};

/**
 * Optimizes an image URL by applying modern responsive sizing, quality parameters, and WebP format.
 *
 * @param {string} url - Original image URL (Unsplash, Cloudinary, local, or external)
 * @param {Object} [options]
 * @param {number} [options.width=400] - Target width in pixels
 * @param {number} [options.height] - Target height in pixels
 * @param {number} [options.quality=75] - Compression quality (1-100)
 * @param {string} [options.fit='crop'] - Fit strategy for crop/contain
 * @returns {string} Optimized image URL
 */
export const optimizeImageUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url || '';

  const { width = 400, height, quality = 75, fit = 'crop' } = options;

  // 1. Unsplash CDN Optimization & Dead URL Healing
  if (url.includes('images.unsplash.com')) {
    let processedUrl = url;
    for (const [deadId, activeId] of Object.entries(DEAD_UNSPLASH_MAP)) {
      if (processedUrl.includes(deadId)) {
        processedUrl = processedUrl.replace(deadId, activeId);
        break;
      }
    }

    try {
      const urlObj = new URL(processedUrl);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', fit);
      urlObj.searchParams.set('q', String(quality));
      if (width) urlObj.searchParams.set('w', String(width));
      if (height) urlObj.searchParams.set('h', String(height));
      return urlObj.toString();
    } catch {
      // Fallback string append if URL parsing fails
      const sep = processedUrl.includes('?') ? '&' : '?';
      return `${processedUrl}${sep}auto=format&fit=${fit}&q=${quality}${width ? `&w=${width}` : ''}${height ? `&h=${height}` : ''}`;
    }
  }

  // 2. Cloudinary CDN Optimization
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    if (!url.includes('f_auto')) {
      const transform = `f_auto,q_${quality ? `${quality}` : 'auto'},w_${width || 1200},c_limit/`;
      return url.replace('/image/upload/', `/image/upload/${transform}`);
    }
    return url;
  }

  return url;
};

// Alias for backward compatibility
export const getOptimizedImageUrl = optimizeImageUrl;

/**
 * Checks if an image URL has already been loaded and cached in memory.
 * @param {string} src 
 * @returns {boolean}
 */
export const isImageCached = (src) => {
  return loadedImagesCache.has(src);
};

/**
 * Marks an image as cached.
 * @param {string} src 
 */
export const markImageCached = (src) => {
  if (src) loadedImagesCache.add(src);
};

/**
 * Preloads an image into the browser cache.
 * @param {string} src 
 * @param {Object} [options]
 * @returns {Promise<string>} Resolves with image src when loaded
 */
export const preloadImage = (src, options = {}) => {
  const optimized = optimizeImageUrl(src, options);
  if (!optimized) return Promise.resolve('');

  if (loadedImagesCache.has(optimized)) {
    return Promise.resolve(optimized);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = optimized;
    img.onload = () => {
      loadedImagesCache.add(optimized);
      resolve(optimized);
    };
    img.onerror = () => {
      resolve(optimized); // Resolve anyway so UI doesn't hang
    };
  });
};

/**
 * Preloads an array of image URLs in parallel.
 * @param {string[]} urls 
 * @param {Object} [options]
 * @returns {Promise<string[]>}
 */
export const preloadImages = (urls = [], options = {}) => {
  return Promise.all(urls.map((u) => preloadImage(u, options)));
};
