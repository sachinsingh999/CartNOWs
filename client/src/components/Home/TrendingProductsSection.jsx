import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Eye,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  X,
  Check,
  Maximize2
} from "lucide-react";
import { toast } from "react-toastify";
import cartApi from "../../services/cartApi";
import { backendUrl } from "../../config";
import { cachedGet } from "../../utils/apiCache";

// Curated 3D Pedestal Product Images (Used as instant initial fallback while DB loads)
import airForce1Img from "../../assets/trending/air_force_1.jpg";
import sonyWh1000xm5Img from "../../assets/trending/sony_wh1000xm5.jpg";
import appleWatch9Img from "../../assets/trending/apple_watch_9.jpg";
import raybanWayfarerImg from "../../assets/trending/rayban_wayfarer.jpg";

export const mapDbProductToCard = (p, idx) => {
  if (!p) return null;
  const rawImages = Array.isArray(p.images) && p.images.length > 0 
    ? p.images 
    : (p.image ? [p.image] : []);

  const processedImages = rawImages
    .filter(Boolean)
    .map(img => {
      if (typeof img === "string" && (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:"))) {
        return img;
      }
      return `${backendUrl}${img.startsWith("/") ? img : `/${img}`}`;
    });

  if (p.bgRemovedImage) {
    const bgUrl = p.bgRemovedImage.startsWith("http") ? p.bgRemovedImage : `${backendUrl}/${p.bgRemovedImage}`;
    processedImages.unshift(bgUrl);
  }

  const galleryImages = processedImages.length > 0 ? processedImages : ["/favicon.webp"];
  while (galleryImages.length < 4) {
    galleryImages.push(galleryImages[galleryImages.length - 1]);
  }

  const price = Number(p.price || 0);
  const origPrice = Number(p.originalPrice || (price > 0 ? Math.round(price * 1.3) : 0));
  const discountPercent = p.discountPercentage || (origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 20);

  const colors = Array.isArray(p.variants) && p.variants.length > 0
    ? p.variants.filter(v => v.Color).map(v => {
        const cLower = (v.Color || "").toLowerCase();
        let hex = "#D4D4D8";
        if (cLower.includes("black")) hex = "#1C1C1E";
        else if (cLower.includes("white")) hex = "#FFFFFF";
        else if (cLower.includes("blue") || cLower.includes("navy")) hex = "#1E3A8A";
        else if (cLower.includes("red") || cLower.includes("rose")) hex = "#DC2626";
        else if (cLower.includes("green") || cLower.includes("olive")) hex = "#16A34A";
        else if (cLower.includes("grey") || cLower.includes("gray")) hex = "#6B7280";
        else if (cLower.includes("yellow") || cLower.includes("gold") || cLower.includes("amber")) hex = "#F59E0B";
        else if (cLower.includes("pink")) hex = "#F472B6";
        return { name: v.Color, hex, border: "#9CA3AF" };
      })
    : [
        { name: "Default", hex: "#1C1C1E", border: "#2E2E32" },
        { name: "Accent", hex: "#FF5722", border: "#E64A19" }
      ];

  const badges = [
    { text: "Bestseller", type: "orange" },
    { text: "Hot Pick", type: "orange" },
    { text: "New Launch", type: "peach" },
    { text: "AI Recommended", type: "peach" }
  ];
  const badgeInfo = badges[idx % badges.length];

  return {
    id: p._id?.toString() || `prod-${idx}`,
    badge: p.tag || p.badge || badgeInfo.text,
    badgeType: badgeInfo.type,
    brand: (p.brand || p.category || "CartNow").toUpperCase(),
    title: p.name || "Product",
    subtitle: p.subCategory || p.description?.slice(0, 42) || "Premium everyday essentials",
    categories: ["All", p.category || "All", p.audience || "All"].filter(Boolean),
    rating: Number(p.rating || 4.7),
    reviewCount: `${p.numReviews || p.reviews?.length || 120} reviews`,
    price: price,
    originalPrice: origPrice,
    discount: `${discountPercent}% OFF`,
    has360: idx === 0,
    isCutout: Boolean(p.bgRemovedImage) || Boolean(p.isCutout),
    aiTag: idx === 3 ? "Highly rated by shoppers" : null,
    images: galleryImages,
    colors: colors,
    rawProduct: p
  };
};

export const TRENDING_PRODUCTS_DATA = [
  {
    id: "nike-air-force-1-07",
    badge: "Bestseller",
    badgeType: "orange",
    brand: "NIKE",
    title: "Air Force 1 '07",
    subtitle: "Men's Lifestyle Sneakers",
    categories: ["All", "Men"],
    rating: 4.7,
    reviewCount: "2.1K reviews",
    price: 7999,
    originalPrice: 9999,
    discount: "20% OFF",
    has360: true,
    isCutout: true,
    aiTag: null,
    images: [
      airForce1Img,
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80",
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&q=80",
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&q=80"
    ],
    colors: [
      { name: "White/Cream", hex: "#FFFFFF", border: "#D4CDC3" },
      { name: "Triple Black", hex: "#1C1C1E", border: "#2E2E32" },
      { name: "Smoke Grey", hex: "#94979E", border: "#7E8188" },
      { name: "Pale Vanilla", hex: "#E2D5BE", border: "#CBBDA4" }
    ]
  },
  {
    id: "sony-wh-1000xm5",
    badge: "New Launch",
    badgeType: "peach",
    brand: "SONY",
    title: "WH-1000XM5",
    subtitle: "Wireless Noise Cancelling Headphones",
    categories: ["All", "Accessories", "Men"],
    rating: 4.8,
    reviewCount: "3.4K reviews",
    price: 29990,
    originalPrice: 34990,
    discount: "14% OFF",
    has360: false,
    isCutout: true,
    aiTag: null,
    images: [
      sonyWh1000xm5Img,
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80"
    ],
    colors: [
      { name: "Black", hex: "#1C1C1E", border: "#2C2C2E" },
      { name: "Silver Sand", hex: "#D6D1C7", border: "#BFB9AC" },
      { name: "Midnight Blue", hex: "#1E293B", border: "#0F172A" }
    ]
  },
  {
    id: "apple-watch-series-9",
    badge: "Hot Pick",
    badgeType: "orange",
    brand: "APPLE",
    title: "Watch Series 9",
    subtitle: "Smarter. Brighter. Mightier.",
    categories: ["All", "Accessories", "Men", "Women"],
    rating: 4.6,
    reviewCount: "1.8K reviews",
    price: 41900,
    originalPrice: 45900,
    discount: "9% OFF",
    has360: false,
    isCutout: true,
    aiTag: null,
    images: [
      appleWatch9Img,
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80"
    ],
    colors: [
      { name: "Starlight", hex: "#FAF5E9", border: "#E5DDD0" },
      { name: "Midnight", hex: "#1E2229", border: "#111418" },
      { name: "Pink", hex: "#F3CCD7", border: "#DFAEB9" }
    ]
  },
  {
    id: "ray-ban-wayfarer-classic",
    badge: "AI Recommended",
    badgeType: "peach",
    brand: "RAY-BAN",
    title: "Wayfarer Classic",
    subtitle: "Timeless Style for Every Look",
    categories: ["All", "Accessories", "Men", "Women"],
    rating: 4.5,
    reviewCount: "1.2K reviews",
    price: 10990,
    originalPrice: 13990,
    discount: "21% OFF",
    has360: false,
    isCutout: true,
    aiTag: "Looks great with casual outfits",
    images: [
      raybanWayfarerImg,
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80",
      "https://images.unsplash.com/photo-1577803645773-f96470509666?w=400&q=80"
    ],
    colors: [
      { name: "Polished Black", hex: "#141414", border: "#2E2E2E" },
      { name: "Havana Tortoise", hex: "#4A2B15", border: "#351C0C" },
      { name: "Military Green", hex: "#4B5548", border: "#394236" },
      { name: "Crystal Clear", hex: "#EBEBEB", border: "#CCCCCC" }
    ]
  }
];

const CATEGORIES = ["All", "Men", "Women", "Kids", "Accessories"];

const TrendingProductCard = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onOpen3DModal
}) => {
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const images = product.images || [product.image || "/favicon.png"];
  const currentImage = images[activeImageIndex] || images[0] || "/favicon.webp";

  // Check if current image is a cutout or has background removed
  const isImageCutout =
    Boolean(product.isCutout) ||
    Boolean(product.rawProduct?.bgRemovedImage && activeImageIndex === 0) ||
    (typeof currentImage === "string" &&
      (currentImage.endsWith(".png") ||
        currentImage.includes("cutout") ||
        currentImage.includes("bg_removed") ||
        currentImage.includes("bgRemoved")));

  // Local view mode state with smart default (cutout 3D stage vs full-bleed photo box)
  const [viewMode, setViewMode] = useState(isImageCutout ? "cutout" : "full");

  // Keep view mode in sync when active image or product changes
  useEffect(() => {
    setViewMode(isImageCutout ? "cutout" : "full");
  }, [isImageCutout, activeImageIndex]);

  const isCutoutView = viewMode === "cutout";

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-[3px] border border-slate-200/90 dark:border-slate-800 p-2.5 sm:p-3 shadow-2xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer select-none"
    >
      <div>
        {/* ── TOP ADAPTIVE CONTAINER (FULL-BOX PHOTO OR 3D PEDESTAL STAGE) ── */}
        <div
          className={`relative w-full h-[205px] sm:h-[215px] rounded-[2px] overflow-hidden border border-stone-200/60 dark:border-slate-800 transition-all duration-300 ${
            isCutoutView
              ? "bg-gradient-to-b from-[#FAF8F5] via-[#F6F1EA] to-[#EEE7DD] dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-850/90 flex items-center justify-center p-2.5"
              : "bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-0"
          }`}
        >
          {/* Studio Spotlight & Ambient Pedestal Shadow (Only rendered in Cutout Stage mode) */}
          {isCutoutView && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7)_0%,transparent_70%)] pointer-events-none" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-3.5 bg-stone-900/10 dark:bg-black/40 rounded-full blur-[6px] pointer-events-none" />
            </>
          )}

          {/* Top Left Badge */}
          <div className="absolute top-2 left-2 z-20">
            {product.badgeType === "orange" ? (
              <span className="inline-flex items-center gap-1 bg-[#FF5722] text-white font-bold text-[10px] px-2 py-0.5 rounded-[2px] shadow-2xs">
                {product.badge}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-[#FFF0EB] dark:bg-orange-950/70 text-[#FF5722] dark:text-orange-400 border border-[#FFD8CC] dark:border-orange-800/50 font-bold text-[10px] px-2 py-0.5 rounded-[2px] shadow-2xs">
                {product.badge === "AI Recommended" && (
                  <Sparkles size={11} className="stroke-[2.5] text-[#FF5722]" />
                )}
                {product.badge}
              </span>
            )}
          </div>

          {/* Top Right Wishlist Button (Sharp square box) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id, product.title);
            }}
            aria-label="Save to Wishlist"
            className="absolute top-2 right-2 z-20 w-7 h-7 rounded-[2px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-2xs border border-slate-200/80 dark:border-slate-700 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Heart
              size={14}
              className={`transition-colors duration-200 ${
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-slate-600 dark:text-slate-300 hover:text-red-500"
              }`}
            />
          </button>

          {/* AI Tooltip / Speech Bubble (if present on card) */}
          {product.aiTag && (
            <div className="absolute top-2 right-10 z-20 flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-200 text-[9.5px] font-semibold px-2 py-0.5 rounded-[2px] shadow-2xs border border-slate-200/80 dark:border-slate-700">
              <Sparkles size={10} className="text-purple-600 dark:text-purple-400 shrink-0" />
              <span>{product.aiTag}</span>
            </div>
          )}

          {/* Left / Right Chevron Stage Controls */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                aria-label="Previous angle"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-[2px] bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs shadow-2xs border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition hover:scale-105 opacity-70 group-hover:opacity-100 cursor-pointer"
              >
                <ChevronLeft size={13} className="stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label="Next angle"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-[2px] bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs shadow-2xs border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition hover:scale-105 opacity-70 group-hover:opacity-100 cursor-pointer"
              >
                <ChevronRight size={13} className="stroke-[2.5]" />
              </button>
            </>
          )}

          {/* ── PRODUCT IMAGE DISPLAY: 3D CUTOUT STAGE VS FULL-BOX PHOTO ── */}
          {isCutoutView ? (
            <div className="relative w-full h-full flex items-center justify-center z-10">
              <motion.img
                key={`cutout-${activeImageIndex}`}
                initial={{ opacity: 0.6, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                src={currentImage}
                alt={product.title}
                onError={(e) => {
                  if (e.currentTarget.src !== images[0] && images[0]) {
                    e.currentTarget.src = images[0];
                  }
                }}
                className="max-h-[175px] max-w-[90%] w-auto object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.14)] dark:drop-shadow-[0_14px_28px_rgba(0,0,0,0.45)] group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : (
            <div className="relative w-full h-full overflow-hidden">
              <motion.img
                key={`full-${activeImageIndex}`}
                initial={{ opacity: 0.85, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                src={currentImage}
                alt={product.title}
                onError={(e) => {
                  if (e.currentTarget.src !== images[0] && images[0]) {
                    e.currentTarget.src = images[0];
                  }
                }}
                className={`w-full h-full object-cover ${
                  product.brand?.toLowerCase().includes("shirt") ||
                  product.title?.toLowerCase().includes("shirt") ||
                  product.categories?.some((c) =>
                    ["men", "women", "apparel", "clothing"].includes(c?.toLowerCase())
                  )
                    ? "object-top"
                    : "object-center"
                } group-hover:scale-105 transition-transform duration-500 ease-out`}
                loading="lazy"
                decoding="async"
              />
              {/* Subtle top/bottom gradient scrim to guarantee badge legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/15 pointer-events-none" />
            </div>
          )}

          {/* 360 Rotation Curved Badge under Product (Card 1) */}
          {product.has360 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm px-2.5 py-0.5 rounded-[2px] border border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
              <span>‹</span>
              <span className="tracking-widest">360°</span>
              <span>›</span>
            </div>
          )}

          {/* Interactive Mode Switcher Pill (Toggle between Full Box and 3D Pedestal Stage) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewMode((prev) => (prev === "full" ? "cutout" : "full"));
            }}
            title={isCutoutView ? "Switch to Full Box photo view" : "Switch to 3D Pedestal Stage view"}
            className="absolute bottom-2 right-2 z-20 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-[2px] shadow-2xs border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#FF5722] hover:border-[#FF5722]/50 transition cursor-pointer"
          >
            {isCutoutView ? (
              <>
                <Maximize2 size={9.5} className="text-[#FF5722]" />
                <span>Full Box</span>
              </>
            ) : (
              <>
                <Sparkles size={9.5} className="text-purple-600" />
                <span>3D Stage</span>
              </>
            )}
          </button>
        </div>

        {/* ── 4 THUMBNAIL GALLERY PREVIEWS ── */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 pb-1.5">
          {images.slice(0, 4).map((thumb, idx) => (
            <div
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex(idx);
              }}
              className={`h-10 rounded-[2px] overflow-hidden flex items-center justify-center p-0 transition-all duration-200 cursor-pointer ${
                idx === activeImageIndex
                  ? "border-2 border-[#FF5722] bg-white dark:bg-slate-800 shadow-2xs"
                  : "border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 hover:border-slate-400"
              }`}
            >
              <img
                src={thumb}
                alt={`${product.title} angle ${idx + 1}`}
                onError={(e) => {
                  // Gracefully fall back if a remote thumbnail URL fails to load
                  if (e.currentTarget.src !== currentImage && currentImage) {
                    e.currentTarget.src = currentImage;
                  }
                }}
                className={`h-full w-full ${isCutoutView ? "object-contain p-0.5" : "object-cover"}`}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>

        {/* ── PRODUCT DETAILS: Brand + Title + Subtitle ── */}
        <div className="text-left pt-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {product.brand}
          </p>
          <h3 className="text-sm sm:text-[14.5px] font-bold text-slate-950 dark:text-white leading-tight line-clamp-1 mt-0.5">
            {product.title}
          </h3>
          <p className="text-[11px] sm:text-[11.5px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-normal">
            {product.subtitle}
          </p>

          {/* 5-Star Rating Row */}
          <div className="flex items-center gap-1 pt-1.5">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white ml-0.5">
              {product.rating}
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              ({product.reviewCount})
            </span>
          </div>

          {/* Pricing Row: Price + Strikethrough + Discount Badge */}
          <div className="flex items-center gap-2 pt-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-black text-[#FF5722]">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-medium">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-bold text-[#FF5722] bg-[#FFF0EB] dark:bg-orange-950/60 dark:text-orange-400 px-1.5 py-0.5 rounded-[2px]">
              {product.discount}
            </span>
          </div>

          {/* Color Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1.5 pb-0.5">
              {product.colors.map((color, idx) => (
                <button
                  key={idx}
                  type="button"
                  title={color.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColorIndex(idx);
                  }}
                  className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                    idx === selectedColorIndex
                      ? "ring-2 ring-[#FF5722] ring-offset-1 dark:ring-offset-slate-900 scale-110"
                      : "hover:scale-110"
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    border: `1px solid ${color.border || "#d1d5db"}`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ACTION BUTTONS: Add to Cart + 3D View ── */}
      <div className="grid grid-cols-[1fr_auto] gap-1.5 pt-2.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="bg-[#FF5722] hover:bg-[#E64A19] active:scale-95 text-white font-semibold text-xs py-2 px-3 rounded-[3px] flex items-center justify-center gap-1.5 shadow-2xs transition-all duration-200 cursor-pointer"
        >
          <ShoppingCart size={13} className="stroke-[2.5]" />
          <span>Add to Cart</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen3DModal(product);
          }}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs py-2 px-3 rounded-[3px] flex items-center justify-center gap-1.5 border border-slate-200/90 dark:border-slate-700 transition-all duration-200 cursor-pointer"
        >
          <Eye size={13} className="stroke-[2.5]" />
          <span>3D View</span>
        </button>
      </div>
    </div>
  );
};

export const TrendingProductsSection = ({
  homepageData,
  onAddToCartProp,
  wishlistProp
}) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [active3DProduct, setActive3DProduct] = useState(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [isDragging3D, setIsDragging3D] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  // Auto rotation timer when auto-spin is toggled
  useEffect(() => {
    if (!active3DProduct || !isAutoSpinning) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 1.8) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [active3DProduct, isAutoSpinning]);

  const handleStageMouseDown = (e) => {
    setIsDragging3D(true);
    setIsAutoSpinning(false);
    setDragStartX(e.clientX);
  };

  const handleStageMouseMove = (e) => {
    if (!isDragging3D) return;
    const deltaX = e.clientX - dragStartX;
    setRotationAngle((prev) => (prev + deltaX * 1.5) % 360);
    setDragStartX(e.clientX);
  };

  const handleStageMouseUp = () => {
    setIsDragging3D(false);
  };

  const handleStageTouchStart = (e) => {
    setIsDragging3D(true);
    setIsAutoSpinning(false);
    setDragStartX(e.touches[0].clientX);
  };

  const handleStageTouchMove = (e) => {
    if (!isDragging3D) return;
    const deltaX = e.touches[0].clientX - dragStartX;
    setRotationAngle((prev) => (prev + deltaX * 1.5) % 360);
    setDragStartX(e.touches[0].clientX);
  };

  const handleStageTouchEnd = () => {
    setIsDragging3D(false);
  };

  // Local Wishlist Tracking with sync
  const [localWishlist, setLocalWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cartnow_wishlist") || "[]");
    } catch (e) {
      return [];
    }
  });

  const toggleWishlist = (productId, title) => {
    setLocalWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem("cartnow_wishlist", JSON.stringify(next));
      } catch (e) {}
      toast.info(exists ? "Removed from wishlist" : `Added ${title || "item"} to wishlist ❤️`);
      return next;
    });
  };

  const handleAddToCart = async (product) => {
    try {
      if (onAddToCartProp) {
        onAddToCartProp({
          _id: product.id,
          name: product.title,
          price: product.price,
          images: product.images,
          image: product.images?.[0]
        });
      } else {
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existing = localCart.find((i) => i.productId === product.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          localCart.push({
            productId: product.id,
            name: product.title,
            price: product.price,
            image: product.images?.[0],
            quantity: 1,
            size: "Standard"
          });
        }
        localStorage.setItem("cart", JSON.stringify(localCart));
        window.dispatchEvent(new Event("cartUpdated"));
        toast.success(`Added ${product.title} to your cart! 🛍️`);
      }
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const [dbProducts, setDbProducts] = useState([]);
  const [loadingDb, setLoadingDb] = useState(false);

  // Fetch real database products from backend API / MongoDB
  useEffect(() => {
    let isMounted = true;
    const fetchRealProducts = async () => {
      try {
        setLoadingDb(true);
        let items = [];
        if (homepageData) {
          items = [
            ...(homepageData.trending || []),
            ...(homepageData.bestSellers || []),
            ...(homepageData.newArrivals || []),
            ...(homepageData.dealsOfDay || [])
          ];
        }

        if (items.length < 4) {
          const res = await cachedGet(`${backendUrl}/api/product/list?limit=30`);
          if (res.data?.success && Array.isArray(res.data.products)) {
            items = res.data.products;
          }
        }

        const seen = new Set();
        const validMapped = [];
        items.forEach((p) => {
          if (!p || !p.name) return;
          const id = p._id?.toString() || p.name;
          if (seen.has(id)) return;
          seen.add(id);
          const mapped = mapDbProductToCard(p, validMapped.length);
          if (mapped) validMapped.push(mapped);
        });

        if (isMounted && validMapped.length > 0) {
          setDbProducts(validMapped);
        }
      } catch (err) {
        console.warn("TrendingProducts DB fetch warning:", err);
      } finally {
        if (isMounted) setLoadingDb(false);
      }
    };

    fetchRealProducts();
    return () => {
      isMounted = false;
    };
  }, [homepageData]);

  // Product Pool Priority: Real database products take priority; fallback to curated mockup while loading or if offline
  const productPool = dbProducts.length > 0 ? dbProducts : TRENDING_PRODUCTS_DATA;

  // Filter products by selected category tab
  const categoryMatched = productPool.filter((p) => {
    if (activeCategory === "All") return true;
    const catLower = activeCategory.toLowerCase();
    return p.categories.some((c) => c && c.toLowerCase().includes(catLower));
  });

  // Graceful fallback if specific category has no DB items yet
  const filteredProducts = categoryMatched.length > 0
    ? categoryMatched
    : TRENDING_PRODUCTS_DATA.filter((p) => {
        if (activeCategory === "All") return true;
        const catLower = activeCategory.toLowerCase();
        return p.categories.some((c) => c && c.toLowerCase().includes(catLower));
      });

  const totalPages = Math.ceil(filteredProducts.length / 4) || 1;

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <section className="w-full bg-[#FAFAFA] dark:bg-slate-950 border-b border-slate-200/90 dark:border-slate-800 px-1 sm:px-1.5 md:px-2 pt-0 pb-3 sm:pb-3.5 select-none">
      <div className="relative group/carousel w-full">
        {/* Left Carousel Arrow */}
        {totalPages > 1 && (
          <button
            type="button"
            onClick={handlePrevPage}
            aria-label="Previous products"
            className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 z-30 w-8.5 h-8.5 rounded-[2px] bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 hover:scale-105 active:scale-95 border border-slate-200/90 dark:border-slate-700"
          >
            <ChevronLeft size={16} className="stroke-[2.5]" />
          </button>
        )}

        {/* ── 4 CARDS GRID (100% Full Width with tight gaps) ── */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
          {filteredProducts.slice(currentPage * 4, currentPage * 4 + 4).map((prod) => (
            <TrendingProductCard
              key={prod.id}
              product={prod}
              isWishlisted={localWishlist.includes(prod.id)}
              onToggleWishlist={toggleWishlist}
              onAddToCart={handleAddToCart}
              onOpen3DModal={(p) => {
                setActive3DProduct(p);
                setRotationAngle(0);
              }}
            />
          ))}
        </div>

        {/* Right Carousel Arrow */}
        {totalPages > 1 && (
          <button
            type="button"
            onClick={handleNextPage}
            aria-label="Next products"
            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 z-30 w-8.5 h-8.5 rounded-[2px] bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 hover:scale-105 active:scale-95 border border-slate-200/90 dark:border-slate-700"
          >
            <ChevronRight size={16} className="stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* ── INTERACTIVE 3D STUDIO MODAL VIEWER ── */}
      <AnimatePresence>
        {active3DProduct && (() => {
          const normalizedAngle = Math.round(((rotationAngle % 360) + 360) % 360);
          const totalModalImages = active3DProduct.images?.length || 1;
          const currentImgIdx = Math.floor(normalizedAngle / (360 / totalModalImages)) % totalModalImages;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md select-none"
              onClick={() => {
                setActive3DProduct(null);
                setIsAutoSpinning(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 15 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[4px] border border-slate-200/90 dark:border-slate-800 shadow-2xl flex flex-col text-left overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4.5 py-3 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="space-y-0.5 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-[#FF5722]/10 text-[#FF5722] text-[10px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-wider">
                        <Sparkles size={10} className="stroke-[2.5]" />
                        360° Studio View
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {active3DProduct.brand}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-[17px] font-bold text-slate-950 dark:text-white leading-tight line-clamp-1">
                      {active3DProduct.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActive3DProduct(null);
                      setIsAutoSpinning(false);
                    }}
                    aria-label="Close modal"
                    className="w-7.5 h-7.5 rounded-[2px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer transition border border-slate-200/80 dark:border-slate-700 active:scale-95 shrink-0"
                  >
                    <X size={15} className="stroke-[2.5]" />
                  </button>
                </div>

                {/* 3D Rotation Stage View */}
                <div className="px-4.5 pt-3 pb-2">
                  <div
                    className="relative w-full h-[310px] sm:h-[335px] rounded-[3px] bg-gradient-to-b from-[#FAF8F5] via-[#F4EFE7] to-[#E8E1D3] dark:from-slate-800/80 dark:via-slate-850 dark:to-slate-900 flex flex-col items-center justify-between overflow-hidden border border-stone-200/80 dark:border-slate-800 select-none cursor-grab active:cursor-grabbing"
                    onMouseDown={handleStageMouseDown}
                    onMouseMove={handleStageMouseMove}
                    onMouseUp={handleStageMouseUp}
                    onMouseLeave={handleStageMouseUp}
                    onTouchStart={handleStageTouchStart}
                    onTouchMove={handleStageTouchMove}
                    onTouchEnd={handleStageTouchEnd}
                  >
                    {/* Top Studio Controls Overlay */}
                    <div className="w-full flex items-center justify-between p-2.5 z-20 pointer-events-auto">
                      {/* Degree Badge */}
                      <div className="inline-flex items-center gap-1.5 bg-black/65 backdrop-blur-md text-white text-[10px] font-mono font-semibold px-2.5 py-1 rounded-[2px] border border-white/10 shadow-sm">
                        <RotateCw size={11} className="text-[#FF5722]" />
                        <span>{normalizedAngle}°</span>
                      </div>

                      {/* Auto Spin Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAutoSpinning(!isAutoSpinning);
                        }}
                        className={`inline-flex items-center gap-1 text-[10.5px] font-semibold px-2.5 py-1 rounded-[2px] transition shadow-2xs cursor-pointer border ${
                          isAutoSpinning
                            ? "bg-[#FF5722] text-white border-[#FF5722]"
                            : "bg-white/90 dark:bg-slate-900/90 hover:bg-white text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <span>{isAutoSpinning ? "⏸ Pause Spin" : "▶ Auto Spin"}</span>
                      </button>
                    </div>

                    {/* Center Product Image on 3D Studio Pedestal */}
                    <div className="relative w-full flex-1 flex items-center justify-center p-3 z-10 pointer-events-none">
                      {/* Pedestal Shadow Ring */}
                      <div className="absolute bottom-4 w-[60%] h-6 bg-black/15 dark:bg-black/40 rounded-full blur-md" />
                      <div className="absolute bottom-5 w-[50%] h-4 bg-gradient-to-r from-transparent via-[#DDD4C5] dark:via-slate-700 to-transparent rounded-full border-t border-white/50 dark:border-slate-600/50" />

                      <motion.img
                        key={currentImgIdx}
                        src={active3DProduct.images[currentImgIdx] || active3DProduct.images[0]}
                        alt={`${active3DProduct.title} angle ${currentImgIdx + 1}`}
                        className="max-h-[240px] sm:max-h-[265px] max-w-[85%] w-auto object-contain select-none drop-shadow-[0_16px_28px_rgba(0,0,0,0.18)]"
                        draggable={false}
                      />
                    </div>

                    {/* Bottom Stage Overlay: Thumbnails + Drag Hint */}
                    <div className="w-full flex items-center justify-between p-2 z-20 bg-gradient-to-t from-stone-900/15 dark:from-black/40 to-transparent pointer-events-auto">
                      {/* Angle Selector Thumbnails */}
                      <div className="flex items-center gap-1.5">
                        {active3DProduct.images.slice(0, 4).map((thumb, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsAutoSpinning(false);
                              setRotationAngle(idx * (360 / totalModalImages));
                            }}
                            className={`w-7.5 h-7.5 rounded-[2px] overflow-hidden p-0.5 border transition cursor-pointer ${
                              currentImgIdx === idx
                                ? "border-[#FF5722] bg-white ring-1 ring-[#FF5722]"
                                : "border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img src={thumb} alt="Angle" className="w-full h-full object-contain" />
                          </button>
                        ))}
                      </div>

                      {/* Drag Hint Overlay */}
                      <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[9.5px] font-medium px-2 py-1 rounded-[2px] border border-white/10">
                        <span>⟵ Drag to Rotate ⟶</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Details & Actions Footer */}
                <div className="px-4.5 py-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/70">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-[#FF5722]">
                        ₹{active3DProduct.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-medium">
                        ₹{active3DProduct.originalPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] font-bold text-[#FF5722] bg-[#FFF0EB] dark:bg-orange-950/60 px-1.5 py-0.5 rounded-[2px]">
                        {active3DProduct.discount}
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      ✓ In Stock • Express Delivery Available
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/product/${active3DProduct.id}`);
                        setActive3DProduct(null);
                        setIsAutoSpinning(false);
                      }}
                      className="px-3 py-2 rounded-[2px] border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold transition active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleAddToCart(active3DProduct);
                        setActive3DProduct(null);
                        setIsAutoSpinning(false);
                      }}
                      className="bg-[#FF5722] hover:bg-[#E64A19] active:scale-95 text-white font-semibold text-xs py-2 px-3.5 rounded-[2px] flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer whitespace-nowrap"
                    >
                      <ShoppingCart size={13} className="stroke-[2.5]" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
};

export default TrendingProductsSection;
