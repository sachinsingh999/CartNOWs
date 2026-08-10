/**
 * Helper utility to optimize image URLs for performance.
 * Supports Cloudinary, Unsplash, and standard image URLs by adding
 * dynamic width, quality, and format parameters.
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || typeof url !== "string") return "";

  const { width = 400, quality = 75, format = "auto" } = options;

  // 1. Cloudinary URLs
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    // Avoid double transformation if already transformed
    if (url.includes("/f_auto") || url.includes("/w_")) {
      return url;
    }
    const transform = `f_${format},q_${quality},w_${width},c_limit`;
    return url.replace("/upload/", `/upload/${transform}/`);
  }

  // 2. Unsplash URLs
  if (url.includes("images.unsplash.com")) {
    if (url.includes("&w=") || url.includes("?w=")) {
      return url.replace(/([?&])w=\d+/, `$1w=${width}`);
    }
    const hasQuery = url.includes("?");
    return `${url}${hasQuery ? "&" : "?"}auto=format&fit=crop&w=${width}&q=${quality}`;
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
