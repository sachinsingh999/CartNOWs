/**
 * Helper utility to optimize Cloudinary URLs directly.
 * Adds f_auto, q_auto, and specified width transformations.
 */
export const optimizeCloudinaryUrl = (url, width = 400, options = {}) => {
  if (!url || typeof url !== "string") return "";
  const { quality = "auto", format = "auto", crop = "limit" } = options;

  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    // Avoid double transformation if already transformed
    if (url.includes("/f_auto") || url.includes("/q_auto") || url.includes("/w_")) {
      if (url.includes("/w_")) {
        return url.replace(/\/w_\d+/, `/w_${width}`);
      }
      return url;
    }
    const transform = `f_${format},q_${quality},w_${width},c_${crop}`;
    return url.replace("/upload/", `/upload/${transform}/`);
  }

  return url;
};

/**
 * Universal helper utility to optimize image URLs for performance.
 * Supports Cloudinary, Unsplash, and standard image URLs.
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || typeof url !== "string") return "";

  const { width = 400, quality = "auto", format = "auto" } = options;

  // 1. Cloudinary URLs
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    return optimizeCloudinaryUrl(url, width, { quality, format });
  }

  // 2. Unsplash URLs
  if (url.includes("images.unsplash.com")) {
    if (url.includes("&w=") || url.includes("?w=")) {
      return url.replace(/([?&])w=\d+/, `$1w=${width}`);
    }
    const hasQuery = url.includes("?");
    const qVal = typeof quality === "number" ? quality : 75;
    return `${url}${hasQuery ? "&" : "?"}auto=format&fit=crop&w=${width}&q=${qVal}`;
  }

  // 3. Local/Other URLs
  return url;
};

/**
 * Generates a responsive srcset string for <img> tags
 */
export const getImageSrcSet = (url, widths = [300, 600, 900]) => {
  if (!url || typeof url !== "string") return undefined;
  if (!url.includes("cloudinary.com") && !url.includes("images.unsplash.com")) {
    return undefined;
  }

  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(", ");
};
