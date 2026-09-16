import React, { useState, useEffect, useMemo } from "react";

/**
 * High-confidence domain mapping for common brands to maximize Logo.dev lookup accuracy.
 * If brandDomain is not explicitly provided in the product document, this dictionary
 * provides the official domain fallback.
 */
const COMMON_BRAND_DOMAINS = {
  apple: "apple.com",
  samsung: "samsung.com",
  nike: "nike.com",
  adidas: "adidas.com",
  sony: "sony.com",
  dell: "dell.com",
  hp: "hp.com",
  lenovo: "lenovo.com",
  boat: "boat-lifestyle.com",
  "boat lifestyle": "boat-lifestyle.com",
  jbl: "jbl.com",
  bose: "bose.com",
  logitech: "logitech.com",
  puma: "puma.com",
  razer: "razer.com",
  casio: "casio.com",
  oppo: "oppo.com",
  xiaomi: "mi.com",
  asus: "asus.com",
  oneplus: "oneplus.com",
  acer: "acer.com",
  intel: "intel.com",
  microsoft: "microsoft.com",
  canon: "canon.com",
  lg: "lg.com",
  philips: "philips.com",
  viewsonic: "viewsonic.com",
  reebok: "reebok.com",
  uniqlo: "uniqlo.com",
  gucci: "gucci.com",
  prada: "prada.com",
  raymond: "raymond.in",
  vivo: "vivo.com",
  realme: "realme.com",
  google: "google.com",
  motorola: "motorola.com",
  sennheiser: "sennheiser.com",
  skullcandy: "skullcandy.com",
  marshall: "marshall.com",
  beats: "beatsbydre.com",
  anker: "anker.com",
  seiko: "seiko.com",
  citizen: "citizenwatch.com",
  tissot: "tissotwatches.com",
  "ray-ban": "ray-ban.com",
  "american tourister": "americantourister.com",
  "the ordinary": "theordinary.com",
  lakme: "lakmeindia.com",
  "l'oreal": "loreal.com",
  loreal: "loreal.com",
  nivea: "nivea.com",
  fashionaura: "cartnow.com",
  "cartnow fashion": "cartnow.com",
  wildcraft: "wildcraft.com",
  mamaearth: "mamaearth.in",
  "bella vita": "bellavitaorganic.com",
  campus: "campusshoes.com",
  safari: "safaribags.com",
  zara: "zara.com",
  "h&m": "hm.com",
  hm: "hm.com",
  levi: "levi.com",
  "levi's": "levi.com",
  skechers: "skechers.com",
  underarmour: "underarmour.com",
  "under armour": "underarmour.com",
  noise: "gonoise.com",
  fastrack: "fastrack.in",
  titan: "titan.co.in",
  fossil: "fossil.com"
};

/**
 * Constructs the official Logo.dev Brand/Logo API URL.
 * Prefers brandDomain when available, falling back to name-based lookup.
 */
export const getLogoDevUrl = (brand, brandDomain, options = {}) => {
  const cleanBrand = (typeof brand === "string" ? brand : brand?.name || "").trim();
  const cleanExplicitDomain = (brandDomain || (typeof brand === "object" ? brand?.domain : "") || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "");

  if (!cleanBrand && !cleanExplicitDomain) return "";

  const token = import.meta.env.VITE_LOGO_DEV_KEY || "";
  const queryParams = new URLSearchParams();

  // Attach publishable API token if configured
  if (token && token !== "your_publishable_key") {
    queryParams.append("token", token);
  }

  // Optional format & size parameters
  if (options.format) queryParams.append("format", options.format);
  if (options.size) queryParams.append("size", String(options.size));

  const qs = queryParams.toString() ? `?${queryParams.toString()}` : "";

  // 1. Prefer explicit brandDomain if provided
  if (cleanExplicitDomain) {
    return `https://img.logo.dev/${encodeURIComponent(cleanExplicitDomain)}${qs}`;
  }

  // 2. Check known high-confidence domain mapping
  const knownDomain = COMMON_BRAND_DOMAINS[cleanBrand.toLowerCase()];
  if (knownDomain) {
    return `https://img.logo.dev/${encodeURIComponent(knownDomain)}${qs}`;
  }

  // 3. Fall back to name-based endpoint: https://img.logo.dev/name/{brand}
  return `https://img.logo.dev/name/${encodeURIComponent(cleanBrand)}${qs}`;
};

/**
 * Reusable BrandLogo Component
 * Dynamically fetches official brand logos via Logo.dev with seamless dark/light mode
 * adaptation and graceful letter/initials fallback.
 *
 * @param {string|object} brand - Brand name or object
 * @param {string} [brandDomain] - Optional official domain (e.g. "apple.com")
 * @param {string} [className] - Tailwind/CSS classes for container (e.g. "w-6 h-6")
 * @param {string} [imageClassName] - Optional classes for the <img> tag
 * @param {string} [alt] - Optional custom image alt text
 * @param {string} [fallbackText] - Optional custom fallback initial/text
 * @param {object} [style] - Optional inline styles
 */
const BrandLogo = ({
  brand = "",
  brandDomain = "",
  className = "w-5 h-5",
  imageClassName = "",
  alt,
  fallbackText,
  fallbackClassName = "",
  style = {}
}) => {
  const [hasError, setHasError] = useState(false);

  // Normalize brand name string
  const brandName = useMemo(() => {
    if (!brand) return "";
    return (typeof brand === "string" ? brand : brand.name || "").trim();
  }, [brand]);

  // Compute Logo.dev URL
  const logoUrl = useMemo(() => {
    return getLogoDevUrl(brandName, brandDomain);
  }, [brandName, brandDomain]);

  // Reset error state when brand changes
  useEffect(() => {
    setHasError(false);
  }, [brandName, brandDomain]);

  // Fallback initial
  const displayInitial = useMemo(() => {
    if (fallbackText) return fallbackText;
    if (!brandName) return "B";
    return brandName.charAt(0).toUpperCase();
  }, [fallbackText, brandName]);

  if (!brandName && !brandDomain) {
    return null;
  }

  const hasCustomBg = className.includes("bg-");
  const hasCustomBorder = className.includes("border-") || className.includes("border-0");
  const hasCustomShadow = className.includes("shadow-");
  const hasCustomRounded = className.includes("rounded-");

  const baseClasses = [
    "inline-flex items-center justify-center shrink-0 overflow-hidden select-none transition-colors",
    !hasCustomRounded ? "rounded-xs sm:rounded-sm" : "",
    !hasCustomBg ? "bg-white dark:bg-slate-800" : "",
    !hasCustomBorder ? "border border-slate-200/90 dark:border-slate-700/80" : "",
    !hasCustomShadow ? "shadow-2xs" : ""
  ].filter(Boolean).join(" ");

  return (
    <div
      className={`${baseClasses} ${className}`}
      style={style}
      title={brandName}
    >
      {!hasError && logoUrl ? (
        <img
          src={logoUrl}
          alt={alt || `${brandName} logo`}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className={`w-full h-full object-contain transform-gpu ${imageClassName}`}
        />
      ) : (
        <span className={`font-black uppercase tracking-tight text-slate-700 dark:text-slate-200 leading-none flex items-center justify-center ${fallbackClassName || "text-[10px]"}`}>
          {displayInitial}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
