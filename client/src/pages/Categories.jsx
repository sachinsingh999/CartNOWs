import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { backendUrl } from "../config";
import { systemApi, productApi } from "../services";
import { optimizeImageUrl, preloadImages } from "../utils/imageOptimizer";
import {
  Search,
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  LayoutGrid,
  Shirt,
  Smartphone,
  Home,
  Sparkles,
  Tv,
  Activity,
  Gamepad2,
  BookOpen,
  Car,
  HeartPulse,
  ShoppingBag,
  Luggage,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Curated Category Icon Bubbles List (14 items identical to mockup)
const QUICK_BUBBLE_CATEGORIES = [
  { id: "all", label: "All", icon: LayoutGrid, color: "text-blue-600", bg: "bg-blue-50/80" },
  { id: "fashion", label: "Fashion", icon: Shirt, color: "text-rose-500", bg: "bg-rose-50/80" },
  { id: "electronics", label: "Electronics", icon: Smartphone, color: "text-blue-500", bg: "bg-blue-50/80" },
  { id: "home-living", label: "Home & Living", icon: Home, color: "text-emerald-500", bg: "bg-emerald-50/80" },
  { id: "beauty", label: "Beauty", icon: Sparkles, color: "text-pink-500", bg: "bg-pink-50/80" },
  { id: "appliances", label: "Appliances", icon: Tv, color: "text-indigo-500", bg: "bg-indigo-50/80" },
  { id: "sports", label: "Sports", icon: Activity, color: "text-slate-700", bg: "bg-slate-100/80" },
  { id: "toys-games", label: "Toys & Games", icon: Gamepad2, color: "text-sky-500", bg: "bg-sky-50/80" },
  { id: "books", label: "Books", icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50/80" },
  { id: "automotive", label: "Automotive", icon: Car, color: "text-blue-600", bg: "bg-blue-50/80" },
  { id: "health", label: "Health", icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-50/80" },
  { id: "accessories", label: "Accessories", icon: ShoppingBag, color: "text-purple-500", bg: "bg-purple-50/80" },
  { id: "bags-luggage", label: "Bags & Luggage", icon: Luggage, color: "text-teal-600", bg: "bg-teal-50/80" },
  { id: "more", label: "More", icon: MoreHorizontal, color: "text-slate-600", bg: "bg-slate-100" }
];

// Visual Photography & Handwritten Quotes Map for Any Category Name/Keyword
const CATEGORY_VISUAL_MAP = {
  "mens-fashion": {
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=420&auto=format&fit=crop&q=75",
    quote: "Style for every move",
    hasHeart: false
  },
  "womens-fashion": {
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=420&auto=format&fit=crop&q=75",
    quote: "Trendy looks for every you",
    hasHeart: true
  },
  "fashion": {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=420&auto=format&fit=crop&q=75",
    quote: "Style for every move",
    hasHeart: true
  },
  "mobiles-tablets": {
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=420&auto=format&fit=crop&q=75",
    quote: "Stay Connected Always",
    hasBurst: true
  },
  "mobile": {
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=420&auto=format&fit=crop&q=75",
    quote: "Stay Connected Always",
    hasBurst: true
  },
  "electronics": {
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=420&auto=format&fit=crop&q=75",
    quote: "Power your Possibilities",
    hasBurst: true
  },
  "laptops-computers": {
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=420&auto=format&fit=crop&q=75",
    quote: "Power your Possibilities",
    hasBurst: true
  },
  "laptop": {
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=420&auto=format&fit=crop&q=75",
    quote: "Power your Possibilities"
  },
  "home-living": {
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=420&auto=format&fit=crop&q=75",
    quote: "Make it feel like home",
    hasHeart: true
  },
  "furniture": {
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=420&auto=format&fit=crop&q=75",
    quote: "Crafted for Comfort",
    hasHeart: true
  },
  "kitchen-dining": {
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=420&auto=format&fit=crop&q=75",
    quote: "Cook Serve Celebrate",
    hasBurst: true
  },
  "food": {
    image: "https://images.unsplash.com/photo-1506484381205-f7945653044d?w=420&auto=format&fit=crop&q=75",
    quote: "Freshness in Every Bite",
    hasBurst: true
  },
  "groceries": {
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=420&auto=format&fit=crop&q=75",
    quote: "Handpicked Daily Essentials",
    hasHeart: true
  },
  "beauty-care": {
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=420&auto=format&fit=crop&q=75",
    quote: "Care for a Brighter You",
    hasHeart: true
  },
  "beauty": {
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=420&auto=format&fit=crop&q=75",
    quote: "Care for a Brighter You",
    hasHeart: true
  },
  "sports-fitness": {
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=420&auto=format&fit=crop&q=75",
    quote: "Stronger Everyday",
    hasBurst: true
  },
  "sports": {
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=420&auto=format&fit=crop&q=75",
    quote: "Stronger Everyday",
    hasBurst: true
  },
  "accessories": {
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=420&auto=format&fit=crop&q=75",
    quote: "The Details Make the Look",
    hasHeart: true
  },
  "books": {
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=420&auto=format&fit=crop&q=75",
    quote: "Feed Your Imagination",
    hasBurst: true
  },
  "gaming": {
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=420&auto=format&fit=crop&q=75",
    quote: "Level Up Your Game",
    hasBurst: true
  },
  "toys-games": {
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=420&auto=format&fit=crop&q=75",
    quote: "Joy in Every Moment",
    hasHeart: true
  },
  "footwear": {
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=420&auto=format&fit=crop&q=75",
    quote: "Step Up Your Game",
    hasBurst: true
  },
  "automotive": {
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=420&auto=format&fit=crop&q=75",
    quote: "Drive Your Passion",
    hasBurst: true
  },
  "appliances": {
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=420&auto=format&fit=crop&q=75",
    quote: "Smart Living Made Easy",
    hasHeart: true
  },
  "health": {
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=420&auto=format&fit=crop&q=75",
    quote: "Wellness for Life",
    hasHeart: true
  },
  "bags-luggage": {
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=420&auto=format&fit=crop&q=75",
    quote: "Pack Your Next Adventure",
    hasBurst: true
  }
};

const DISTINCT_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=420&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=420&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=420&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=420&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=420&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=420&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=420&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=420&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=420&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=420&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=420&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=420&auto=format&fit=crop&q=75"
];

const DISTINCT_FALLBACK_QUOTES = [
  "Style for every move",
  "Trendy looks for every you ♡",
  "Stay Connected Always",
  "Power your Possibilities",
  "Make it feel like home ♡",
  "Cook Serve Celebrate ✧",
  "Care for a Brighter You ♡",
  "Stronger Everyday ✧",
  "The Details Make the Look ♡",
  "Feed Your Imagination ✧",
  "Level Up Your Game ✧",
  "Step Up Your Game ✧"
];

// Helper to resolve unique photo & quote for any category
const resolveCategoryMeta = (cat, index = 0) => {
  const name = cat.name || "";
  const nameLower = name.toLowerCase().trim();
  const slug = (cat.slug || nameLower.replace(/[^a-z0-9]+/g, "-")).trim();

  // If custom image from admin exists and is not the old fallback
  const hasAdminImage = cat.bannerImage && cat.bannerImage.startsWith("http") && !cat.bannerImage.includes("1472851294608");

  // Lookup in visual dictionary
  let matched = CATEGORY_VISUAL_MAP[slug] || CATEGORY_VISUAL_MAP[nameLower];
  if (!matched) {
    for (const key of Object.keys(CATEGORY_VISUAL_MAP)) {
      if (nameLower.includes(key) || slug.includes(key) || key.includes(nameLower)) {
        matched = CATEGORY_VISUAL_MAP[key];
        break;
      }
    }
  }

  const fallbackImg = DISTINCT_FALLBACK_IMAGES[index % DISTINCT_FALLBACK_IMAGES.length];
  const fallbackQuote = DISTINCT_FALLBACK_QUOTES[index % DISTINCT_FALLBACK_QUOTES.length];

  const image = hasAdminImage ? cat.bannerImage : (matched?.image || fallbackImg);
  const rawQuote = (cat.quote && cat.quote.trim() && !cat.quote.startsWith("Explore "))
    ? cat.quote
    : (matched?.quote || fallbackQuote);

  const hasHeart = rawQuote.includes("♡") || matched?.hasHeart;
  const hasBurst = rawQuote.includes("✧") || matched?.hasBurst;
  const quote = rawQuote.replace(/♡|✧/g, "").trim();

  return {
    id: cat._id || slug || `cat-${index}`,
    name: name || "Category",
    slug: slug,
    query: name,
    quote,
    hasHeart,
    hasBurst,
    itemsCount: cat.count ? `${cat.count.toLocaleString()}+ items` : (cat.itemsCount || `${Math.floor((index * 137 + 340) % 900 + 120)}+ items`),
    image
  };
};

// Default Category Hero Banner Slides for High-End Dynamic Showcase
const DEFAULT_CATEGORY_SLIDES = [
  {
    id: "default-slide-1",
    tagline: "EXPLORE. SHOP. BELONG.",
    title: "Shop by Category",
    subtitle: "Discover a wide range of products in your favorite categories. From everyday essentials to the latest trends — everything in one place.",
    ctaText: "Start Shopping",
    linkUrl: "/product",
    image: "/categories_hero_model.webp",
    leftScript: "Good Things Belong Here",
    rightScript: "Discover Shop Repeat ♡",
    gradient: "from-[#EFF6FF] via-[#F3F4FD] to-[#E9EFFD] dark:from-[#0F172A] dark:via-[#111C38] dark:to-[#0B132B]",
    showPerks: true
  },
  {
    id: "default-slide-2",
    tagline: "NEW SEASON ARRIVALS",
    title: "Trending Fashion & Looks",
    subtitle: "Upgrade your style with premium apparel, designer sneakers, and chic accessories tailored for every occasion.",
    ctaText: "Explore Fashion",
    linkUrl: "/products?category=fashion",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
    leftScript: "Style That Speaks",
    rightScript: "Wear Confidence ✧",
    gradient: "from-[#FFF1F2] via-[#FDF2F8] to-[#F5F3FF] dark:from-[#1C0F1A] dark:via-[#1E1128] dark:to-[#0F172A]",
    showPerks: true
  },
  {
    id: "default-slide-3",
    tagline: "INNOVATION & POWER",
    title: "Next-Gen Electronics",
    subtitle: "Explore the newest flagship smartphones, noise-cancelling audio, high-performance laptops, and wearable tech.",
    ctaText: "Shop Gadgets",
    linkUrl: "/products?category=electronics",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&auto=format&fit=crop&q=80",
    leftScript: "Future Is Here",
    rightScript: "Power In Hand ✧",
    gradient: "from-[#EEF2FF] via-[#E0E7FF] to-[#EDE9FE] dark:from-[#0B132B] dark:via-[#111C38] dark:to-[#0F172A]",
    showPerks: true
  },
  {
    id: "default-slide-4",
    tagline: "COMFORT & ELEVATION",
    title: "Elevate Your Home",
    subtitle: "Transform your space with stylish furniture, atmospheric lighting, smart kitchenware, and cozy comfort.",
    ctaText: "Explore Home",
    linkUrl: "/products?category=home-living",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80",
    leftScript: "Make It Home",
    rightScript: "Live Beautifully ♡",
    gradient: "from-[#ECFDF5] via-[#F0FDF4] to-[#EFF6FF] dark:from-[#061A14] dark:via-[#0D2218] dark:to-[#0F172A]",
    showPerks: true
  }
];

// Popular Categories Mockup Default Baseline (8 distinct cards)
const POPULAR_CATEGORY_CARDS = [
  {
    id: "mens-fashion",
    name: "Men's Fashion",
    quote: "Style for every move",
    itemsCount: "1,240+ items",
    slug: "mens-fashion",
    query: "fashion",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=420&auto=format&fit=crop&q=75"
  },
  {
    id: "womens-fashion",
    name: "Women's Fashion",
    quote: "Trendy looks for every you",
    hasHeart: true,
    itemsCount: "1,850+ items",
    slug: "womens-fashion",
    query: "fashion",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=420&auto=format&fit=crop&q=75"
  },
  {
    id: "mobiles-tablets",
    name: "Mobiles & Tablets",
    quote: "Stay Connected Always",
    itemsCount: "620+ items",
    slug: "mobiles-tablets",
    query: "mobile",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=420&auto=format&fit=crop&q=75"
  },
  {
    id: "laptops-computers",
    name: "Laptops & Computers",
    quote: "Power your Possibilities",
    itemsCount: "410+ items",
    slug: "laptops-computers",
    query: "laptop",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=420&auto=format&fit=crop&q=75"
  },
  {
    id: "home-living",
    name: "Home & Living",
    quote: "Make it feel like home",
    hasHeart: true,
    itemsCount: "780+ items",
    slug: "home-living",
    query: "home",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=420&auto=format&fit=crop&q=75"
  },
  {
    id: "kitchen-dining",
    name: "Kitchen & Dining",
    quote: "Cook Serve Celebrate",
    hasBurst: true,
    itemsCount: "530+ items",
    slug: "kitchen-dining",
    query: "kitchen",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=420&auto=format&fit=crop&q=75"
  },
  {
    id: "beauty-care",
    name: "Beauty & Personal Care",
    quote: "Care for a Brighter You",
    hasHeart: true,
    itemsCount: "940+ items",
    slug: "beauty-care",
    query: "beauty",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=420&auto=format&fit=crop&q=75"
  },
  {
    id: "sports-fitness",
    name: "Sports & Fitness",
    quote: "Stronger Everyday",
    hasBurst: true,
    itemsCount: "360+ items",
    slug: "sports-fitness",
    query: "sports",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=420&auto=format&fit=crop&q=75"
  }
];

const Categories = () => {
  const navigate = useNavigate();

  // Dynamic Categories Hero Banners with instant session cache
  const [heroBanners, setHeroBanners] = useState(() => {
    try {
      const cached = sessionStorage.getItem("cached_category_banners");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic Category Cards from DB with instant session cache
  const [dbCategories, setDbCategories] = useState(() => {
    try {
      const cached = sessionStorage.getItem("cached_categories_list");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBubble, setSelectedBubble] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  // Parallel Fast Fetch for Banners & Categories
  useEffect(() => {
    let isMounted = true;

    const loadCategoryData = async () => {
      try {
        const [bannerData, categoryData] = await Promise.all([
          systemApi.getActivePromoBanner("categories_hero").catch(() => null),
          productApi.getCategories().catch(() => null),
        ]);

        if (isMounted) {
          if (bannerData?.success) {
            const list = bannerData.banners?.length > 0
              ? bannerData.banners
              : (bannerData.banner ? [bannerData.banner] : []);
            setHeroBanners(list);
            try { sessionStorage.setItem("cached_category_banners", JSON.stringify(list)); } catch { }
          }

          if (categoryData?.success && Array.isArray(categoryData.categories)) {
            setDbCategories(categoryData.categories);
            try { sessionStorage.setItem("cached_categories_list", JSON.stringify(categoryData.categories)); } catch { }
          }
        }
      } catch (err) {
        console.warn("Could not load categories data:", err);
      }
    };

    loadCategoryData();
    return () => { isMounted = false; };
  }, []);

  // Compute all active category slides
  const slides = useMemo(() => {
    if (heroBanners.length > 0) {
      const list = [];
      heroBanners.forEach((b, bIdx) => {
        const bannerImages = (b.images && b.images.length > 0) ? b.images : (b.imageUrl ? [b.imageUrl] : ["/categories_hero_model.webp"]);
        bannerImages.forEach((rawImg, imgIdx) => {
          const img = optimizeImageUrl(rawImg, { width: 1200, quality: 80 });
          list.push({
            id: b._id ? `${b._id}-${imgIdx}` : `banner-${bIdx}-${imgIdx}`,
            tagline: b.tagline || (bIdx === 0 ? "EXPLORE. SHOP. BELONG." : "TRENDING DEALS"),
            title: b.title || "Shop by Category",
            subtitle: b.subtitle || "Discover a wide range of products in your favorite categories. From everyday essentials to the latest trends — everything in one place.",
            ctaText: b.ctaText || "Start Shopping",
            linkUrl: b.linkUrl || "/product",
            bgColor: b.bgColor || undefined,
            gradient: b.gradient || (bIdx % 3 === 0
              ? "from-[#EFF6FF] via-[#F3F4FD] to-[#E9EFFD] dark:from-[#0F172A] dark:via-[#111C38] dark:to-[#0B132B]"
              : bIdx % 3 === 1
                ? "from-[#FFF1F2] via-[#FDF2F8] to-[#F5F3FF] dark:from-[#1C0F1A] dark:via-[#1E1128] dark:to-[#0F172A]"
                : "from-[#EEF2FF] via-[#E0E7FF] to-[#EDE9FE] dark:from-[#0B132B] dark:via-[#111C38] dark:to-[#0F172A]"),
            showPerks: b.showPerks !== false,
            image: img || "/categories_hero_model.webp",
            leftScript: b.leftScript || (bIdx % 2 === 0 ? "Good Things Belong Here" : "Made For You"),
            rightScript: b.rightScript || (bIdx % 2 === 0 ? "Discover Shop Repeat ♡" : "Find Your Style ✧")
          });
        });
      });
      return list;
    }
    return DEFAULT_CATEGORY_SLIDES.map(s => ({
      ...s,
      image: optimizeImageUrl(s.image, { width: 1200, quality: 80 })
    }));
  }, [heroBanners]);

  // Auto-advance slideshow every 5 seconds (paused when user hovers)
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, isHovered]);

  // Preload only the NEXT slide image lazily (avoids downloading 20MB upfront)
  useEffect(() => {
    if (slides.length > 1) {
      const nextSlide = slides[(currentSlide + 1) % slides.length];
      if (nextSlide?.image) {
        const img = new Image();
        img.decoding = "async";
        img.src = nextSlide.image;
      }
    }
  }, [currentSlide, slides]);

  const activeSlide = slides[currentSlide % slides.length] || slides[0];

  const handlePrevSlide = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Filtered Visual Cards based on Search & Selected Bubble (Guaranteed Unique Distinct Photos & Quotes)
  const displayCards = useMemo(() => {
    let list = [];

    if (dbCategories.length > 0) {
      list = dbCategories.map((cat, idx) => resolveCategoryMeta(cat, idx));
    } else {
      list = POPULAR_CATEGORY_CARDS.map((cat, idx) => resolveCategoryMeta(cat, idx));
    }

    // Filter by quick bubble if not "all"
    if (selectedBubble !== "all") {
      const bubble = selectedBubble.toLowerCase().trim();
      const filtered = list.filter((card) => {
        return (
          card.id.toLowerCase().includes(bubble) ||
          card.slug.toLowerCase().includes(bubble) ||
          card.name.toLowerCase().includes(bubble) ||
          (card.query && card.query.toLowerCase().includes(bubble))
        );
      });
      list = filtered.length > 0 ? filtered : list.filter((c) => c.name.toLowerCase().includes(bubble));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.quote.toLowerCase().includes(q) ||
        c.itemsCount.toLowerCase().includes(q)
      );
    }

    // Sort by preference
    if (sortBy === "alphabetical") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "count") {
      list.sort((a, b) => parseInt(b.itemsCount.replace(/\D/g, "") || 0) - parseInt(a.itemsCount.replace(/\D/g, "") || 0));
    }

    return list;
  }, [dbCategories, selectedBubble, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07090E] px-2 sm:px-4 lg:px-6 py-2.5 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 pb-12 w-full">
      <div className="w-full space-y-5">

        {/* ================= 1. CATEGORIES TOP HERO BANNER SLIDESHOW (COMPACT HALF HEIGHT, FULL WIDTH & SHARP CORNERS) ================= */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ backgroundColor: activeSlide?.bgColor || undefined }}
          className={`relative overflow-hidden rounded-sm bg-gradient-to-r ${activeSlide?.gradient || "from-[#EFF6FF] via-[#F3F4FD] to-[#E9EFFD] dark:from-[#0F172A] dark:via-[#111C38] dark:to-[#0B132B]"} border border-blue-100/90 dark:border-slate-800 shadow-xs w-full transition-colors duration-700`}
        >
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-100/40 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-1/3 h-full bg-gradient-to-l from-pink-100/30 via-indigo-100/20 to-transparent pointer-events-none" />

          {/* Slideshow Previous / Next Navigation Chevrons */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevSlide}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200/90 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer opacity-80 hover:opacity-100"
                title="Previous Banner"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={handleNextSlide}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200/90 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer opacity-80 hover:opacity-100"
                title="Next Banner"
                aria-label="Next Slide"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Slide Content with AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide?.id || currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center min-h-[280px] sm:min-h-[310px] lg:min-h-[270px] px-4 sm:px-6 lg:px-8 py-0 gap-4"
            >
              {/* Left Content (lg:col-span-5): Tagline, Headline, Subtitle, CTA, Perks */}
              <div className="lg:col-span-5 xl:col-span-5 space-y-2 sm:space-y-2.5 text-left z-20 py-3 sm:py-4">

                {/* Tagline */}
                <p className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">
                  {activeSlide?.tagline || "EXPLORE. SHOP. BELONG."}
                </p>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                  {activeSlide?.title === "Shop by Category" ? (
                    <>
                      Shop by <br className="hidden sm:block" />
                      <span className="text-[#3B5AFE] dark:text-[#5373FF]">Category</span>
                    </>
                  ) : (
                    activeSlide?.title
                  )}
                </h1>

                {/* Subtitle */}
                <p className="text-[11.5px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed line-clamp-2 max-w-md">
                  {activeSlide?.subtitle}
                </p>

                {/* CTA Button */}
                <div className="pt-0.5">
                  <button
                    onClick={() => navigate(activeSlide?.linkUrl || "/product")}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-sm bg-[#4361EE] hover:bg-[#3451D1] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer group"
                  >
                    <span>{activeSlide?.ctaText || "Start Shopping"}</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* 3 Assurance Perks Row */}
                {activeSlide?.showPerks !== false && (
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-slate-200/60 dark:border-slate-800/80">
                    {/* Perk 1 */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-sm bg-blue-500/10 text-[#4361EE] dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Truck size={13} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-900 dark:text-white leading-none">Free Delivery</p>
                        <p className="text-[8.5px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">on select items</p>
                      </div>
                    </div>

                    {/* Perk 2 */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-sm bg-blue-500/10 text-[#4361EE] dark:text-blue-400 flex items-center justify-center shrink-0">
                        <ShieldCheck size={13} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-900 dark:text-white leading-none">100% Protected</p>
                        <p className="text-[8.5px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">secure checkout</p>
                      </div>
                    </div>

                    {/* Perk 3 */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-sm bg-blue-500/10 text-[#4361EE] dark:text-blue-400 flex items-center justify-center shrink-0">
                        <RotateCcw size={13} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-900 dark:text-white leading-none">Easy Returns</p>
                        <p className="text-[8.5px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">hassle free</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Middle & Right Content (lg:col-span-7): Full Unclipped Banner/Model Photography */}
              <div className="lg:col-span-7 xl:col-span-7 relative flex items-center lg:items-end justify-center h-full min-h-[260px] sm:min-h-[300px] lg:min-h-[280px] py-2 sm:py-0">

                {/* Handwritten Script Flanking Left of Model (Hidden on small mobile so image has full space) */}
                <div className="hidden md:block absolute top-2 left-2 sm:left-4 md:left-6 z-20 select-none text-left pointer-events-none">
                  <p className="font-handwriting text-2xl sm:text-3xl lg:text-[32px] font-bold text-slate-900 dark:text-slate-100 leading-[0.95] drop-shadow-xs">
                    {activeSlide?.leftScript ? (
                      activeSlide.leftScript.split(" ").map((w, idx) => (
                        <React.Fragment key={idx}>
                          {w} <br />
                        </React.Fragment>
                      ))
                    ) : (
                      <>Good <br />Things <br />Belong <br />Here</>
                    )}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 pl-1">
                    <span className="w-2.5 h-0.5 bg-orange-400 rotate-12 rounded-full inline-block" />
                    <span className="w-2 h-0.5 bg-orange-400 -rotate-12 rounded-full inline-block" />
                  </div>
                </div>

                {/* Center Banner / Model Image (Fully Visible, Zero Cropping, Zero Clipping) */}
                <div className="relative z-10 w-full max-w-full flex items-center justify-center mx-auto px-2">
                  <img
                    src={activeSlide?.image || "/categories_hero_model.webp"}
                    alt={activeSlide?.title || "Category Banner"}
                    className="max-h-[260px] sm:max-h-[300px] lg:max-h-[280px] w-auto max-w-full object-contain drop-shadow-md select-none mx-auto block"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </div>

                {/* Handwritten Script Flanking Right of Model (Hidden on small mobile so image has full space) */}
                <div className="hidden md:block absolute top-2 right-2 sm:right-4 md:right-6 z-20 select-none text-center pointer-events-none">
                  <p className="font-handwriting text-xl sm:text-2xl lg:text-[26px] font-bold text-slate-900 dark:text-slate-100 leading-tight drop-shadow-xs">
                    {activeSlide?.rightScript ? (
                      activeSlide.rightScript.replace(/♡|✧/g, "").trim().split(" ").map((w, idx) => (
                        <React.Fragment key={idx}>
                          {w} <br />
                        </React.Fragment>
                      ))
                    ) : (
                      <>Discover <br />Shop <br />Repeat</>
                    )}
                  </p>
                  <div className="mt-0.5">
                    <span className="font-handwriting text-xl sm:text-2xl text-orange-500 font-bold inline-block">
                      {activeSlide?.rightScript?.includes("✧") ? "✧" : "♡"}
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Slideshow Pagination Indicator Dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/10 dark:bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-full">
              {slides.map((_, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => setCurrentSlide(sIdx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${currentSlide === sIdx
                    ? "w-5 bg-[#3B5AFE] dark:bg-blue-400"
                    : "w-1.5 bg-slate-300/80 dark:bg-slate-600 hover:bg-slate-400"
                    }`}
                  aria-label={`Go to slide ${sIdx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ================= 2. HORIZONTAL CATEGORY ICON BUBBLES BAR (MOVING LEFT-TO-RIGHT INFINITE TICKER, NO SCROLLBAR) ================= */}
        <div className="w-full overflow-hidden py-2.5 sm:py-3.5 select-none relative group/marquee">
          {/* Subtle ambient fade on left and right edges */}
          <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-r from-[#F8FAFC] dark:from-[#07090E] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-l from-[#F8FAFC] dark:from-[#07090E] to-transparent z-10 pointer-events-none" />

          <div
            className="flex items-center gap-4 sm:gap-6 lg:gap-7 w-max category-marquee-track cursor-pointer hover:[animation-play-state:paused] py-1.5 px-2"
            style={{
              animation: "marquee-left-to-right 34s linear infinite"
            }}
          >
            {[...QUICK_BUBBLE_CATEGORIES, ...QUICK_BUBBLE_CATEGORIES].map((item, idx) => {
              const IconComp = item.icon;
              const isActive = selectedBubble === item.id;

              return (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => setSelectedBubble(item.id)}
                  className="flex flex-col items-center gap-2 cursor-pointer group select-none transition-transform duration-200 hover:-translate-y-1 shrink-0"
                >
                  {/* Circular Bubble */}
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-[72px] lg:h-[72px] rounded-full flex items-center justify-center transition-all duration-300 shadow-xs ${isActive
                      ? "bg-blue-50/90 dark:bg-blue-950/70 border-[2px] border-[#3B5AFE] text-[#3B5AFE] shadow-md scale-105 ring-3 ring-blue-500/20"
                      : "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 hover:shadow-xs"
                      }`}
                  >
                    <IconComp
                      size={26}
                      strokeWidth={1.8}
                      className={`transition-transform duration-300 group-hover:scale-110 w-6 h-6 sm:w-7 sm:h-7 lg:w-[30px] lg:h-[30px] ${isActive ? "text-[#3B5AFE]" : item.color
                        }`}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[11px] sm:text-xs font-semibold tracking-tight text-center transition-colors duration-200 ${isActive
                      ? "font-bold text-[#3B5AFE] dark:text-[#5373FF]"
                      : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                      }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= 3. POPULAR CATEGORIES SECTION (SHARP CORNERS) ================= */}
        <div className="space-y-3.5">

          {/* Section Header with Title, Search & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">

            {/* Title & Subtitle */}
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Popular Categories
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Discover our most loved departments
              </p>
            </div>

            {/* Right Controls: Search + Sort Dropdown + View All */}
            <div className="flex flex-wrap items-center gap-2">

              {/* Search Bar */}
              <div className="relative min-w-[220px] sm:min-w-[280px]">
                <Search size={14} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories or departments..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm pl-9 pr-8 py-1.5 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs">
                <span className="text-slate-400 font-medium mr-1">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer text-xs font-bold text-slate-900 dark:text-slate-200"
                >
                  <option value="popular" className="bg-white dark:bg-slate-900">Popular</option>
                  <option value="count" className="bg-white dark:bg-slate-900">Items Count</option>
                  <option value="alphabetical" className="bg-white dark:bg-slate-900">Alphabetical</option>
                </select>
              </div>

              {/* View All Link */}
              <button
                onClick={() => {
                  setSelectedBubble("all");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-1 text-xs font-black text-[#4361EE] hover:text-blue-700 transition ml-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>

            </div>

          </div>

          {/* 2x4 Visual Photography Cards Grid (Sharp Corners) */}
          {displayCards.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-10 text-center space-y-2">
              <ShoppingBag size={32} className="mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No categories found</h3>
              <p className="text-xs text-slate-500">We couldn't find any category matching "{searchQuery}".</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedBubble("all");
                }}
                className="mt-2 px-4 py-1.5 bg-[#4361EE] text-white rounded-sm text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <AnimatePresence>
                {displayCards.map((card, idx) => (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    onClick={() => navigate(`/categories/${card.slug || card.id}`)}
                    className="group relative overflow-hidden rounded-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
                  >
                    {/* Top Photo Frame with Cursive Quote Overlay */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">

                      {/* High-res Photography */}
                      <img
                        src={optimizeImageUrl(card.image, { width: 420, quality: 75 })}
                        alt={card.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />

                      {/* Subtle Light Top Vignette for Typography Readability */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent pointer-events-none" />

                      {/* Handwritten Cursive Quote Top-Left */}
                      <div className="absolute top-3 left-3 z-10 select-none max-w-[85%] text-left">
                        <p className="font-handwriting text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-900 drop-shadow-xs leading-tight">
                          {card.quote}
                          {card.hasHeart && <span className="text-pink-500 font-handwriting ml-1">♡</span>}
                          {card.hasBurst && <span className="text-orange-500 font-handwriting ml-1">✧</span>}
                        </p>
                      </div>

                    </div>

                    {/* Bottom Details Row */}
                    <div className="p-3 flex items-center justify-between bg-white dark:bg-slate-900 text-left">
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-[#4361EE] transition-colors">
                          {card.name}
                        </h3>
                        <p className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                          {card.itemsCount}
                        </p>
                      </div>

                      {/* Circular Action Button */}
                      <div className="w-6.5 h-6.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-[#4361EE] text-slate-700 dark:text-slate-300 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs shrink-0">
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Categories;
