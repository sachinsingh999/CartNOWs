import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { backendUrl } from "../config";
import { cachedGet } from "../utils/apiCache";
import { CollectionsSkeleton } from "../components/SkeletonLoader";

// Curated High-Resolution Composite Assets
import electronicsImg from "../assets/electronics_collection_composite.webp";
import fashionImg from "../assets/fashion_collection_composite.webp";
import homeImg from "../assets/home_collection_composite.webp";
import beautyImg from "../assets/brand_asset_beauty.webp";
import newArrivalsHero from "../assets/new_arrivals_hero.webp";
import trendingHero from "../assets/trending_now_hero.webp";
import sneakersImg from "../assets/brand_asset_sneakers.webp";
import accessoriesImg from "../assets/brand_asset_accessories.webp";
import mensFashionImg from "../assets/brand_asset_mens_fashion_new.webp";
import jewelryImg from "../assets/cat_jewelry.webp";

import {
  Sparkles,
  ArrowRight,
  Flame,
  Shirt,
  Home,
  Laptop,
  Gem,
  ShoppingBag,
  Award,
  Search,
  CheckCircle,
  Star,
  Zap,
  Tag,
  Package,
  ChevronRight,
  ChevronLeft,
  Crown,
  X,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowUpDown,
  Layers,
  Heart,
  Grid3X3,
  LayoutGrid,
  Percent,
  Check,
  Compass,
  ArrowUpRight
} from "lucide-react";

const getCollectionFallbackImage = (name = "", slug = "") => {
  const lower = `${name} ${slug}`.toLowerCase();
  if (lower.includes("tech") || lower.includes("electro") || lower.includes("gadget") || lower.includes("phone") || lower.includes("laptop")) {
    return electronicsImg;
  }
  if (lower.includes("men") && (lower.includes("fashion") || lower.includes("wear") || lower.includes("cloth"))) {
    return mensFashionImg;
  }
  if (lower.includes("fashion") || lower.includes("wear") || lower.includes("streetwear") || lower.includes("lifestyle") || lower.includes("cloth") || lower.includes("style")) {
    return fashionImg;
  }
  if (lower.includes("home") || lower.includes("living") || lower.includes("decor") || lower.includes("kitchen")) {
    return homeImg;
  }
  if (lower.includes("beauty") || lower.includes("glow") || lower.includes("skin") || lower.includes("cosmetic")) {
    return beautyImg;
  }
  if (lower.includes("sport") || lower.includes("sneaker") || lower.includes("active") || lower.includes("fitness") || lower.includes("athletic")) {
    return sneakersImg;
  }
  if (lower.includes("accessory") || lower.includes("accessories") || lower.includes("chrono") || lower.includes("watch")) {
    return accessoriesImg;
  }
  if (lower.includes("jewelry") || lower.includes("gold") || lower.includes("silver") || lower.includes("gem")) {
    return jewelryImg;
  }
  if (lower.includes("new") || lower.includes("arrival") || lower.includes("drop")) {
    return newArrivalsHero;
  }
  if (lower.includes("best") || lower.includes("seller") || lower.includes("top-rated")) {
    return trendingHero;
  }
  if (lower.includes("deal") || lower.includes("offer") || lower.includes("discount") || lower.includes("save") || lower.includes("festival")) {
    return homeImg;
  }
  return trendingHero;
};

const getCollectionStyles = (name = "", slug = "") => {
  const lower = `${name} ${slug}`.toLowerCase();

  if (lower.includes("tech") || lower.includes("electro") || lower.includes("gadget") || lower.includes("phone") || lower.includes("laptop")) {
    return {
      accentRing: "hover:border-indigo-500/60 dark:hover:border-indigo-500/50 hover:shadow-indigo-500/10",
      badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
      btnGradient: "from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500",
      pillColor: "hover:text-indigo-600 dark:hover:text-indigo-400",
      glowColor: "from-indigo-500/20 to-blue-500/0",
      badgeIcon: Laptop,
      categoryTag: "Tech & Cyber",
      tags: ["#ProWorkstation", "#SmartDevices", "#Flagship"]
    };
  }
  if (lower.includes("fashion") || lower.includes("wear") || lower.includes("lifestyle") || lower.includes("cloth") || lower.includes("style") || lower.includes("streetwear")) {
    return {
      accentRing: "hover:border-rose-500/60 dark:hover:border-rose-500/50 hover:shadow-rose-500/10",
      badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
      btnGradient: "from-[#ff3f6c] via-rose-600 to-pink-600 hover:from-[#e0355c] hover:to-rose-500",
      pillColor: "hover:text-[#ff3f6c]",
      glowColor: "from-rose-500/20 to-pink-500/0",
      badgeIcon: Shirt,
      categoryTag: "Fashion & Luxury",
      tags: ["#HauteCouture", "#OversizedDrops", "#Runway"]
    };
  }
  if (lower.includes("home") || lower.includes("living") || lower.includes("decor") || lower.includes("kitchen")) {
    return {
      accentRing: "hover:border-amber-500/60 dark:hover:border-amber-500/50 hover:shadow-amber-500/10",
      badgeColor: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20",
      btnGradient: "from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400",
      pillColor: "hover:text-amber-600 dark:hover:text-amber-400",
      glowColor: "from-amber-500/20 to-orange-500/0",
      badgeIcon: Home,
      categoryTag: "Home & Living",
      tags: ["#NordicLiving", "#SmartAmbient", "#Ergonomic"]
    };
  }
  if (lower.includes("beauty") || lower.includes("glow") || lower.includes("skin") || lower.includes("cosmetic")) {
    return {
      accentRing: "hover:border-teal-500/60 dark:hover:border-teal-500/50 hover:shadow-teal-500/10",
      badgeColor: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
      btnGradient: "from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400",
      pillColor: "hover:text-teal-600 dark:hover:text-teal-400",
      glowColor: "from-teal-500/20 to-emerald-500/0",
      badgeIcon: Sparkles,
      categoryTag: "Skincare & Glow",
      tags: ["#ClinicalPeptides", "#GentleHydration", "#DermApproved"]
    };
  }
  if (lower.includes("accessory") || lower.includes("accessories") || lower.includes("chrono") || lower.includes("watch") || lower.includes("jewelry") || lower.includes("gold")) {
    return {
      accentRing: "hover:border-purple-500/60 dark:hover:border-purple-500/50 hover:shadow-purple-500/10",
      badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
      btnGradient: "from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-fuchsia-500",
      pillColor: "hover:text-purple-600 dark:hover:text-purple-400",
      glowColor: "from-purple-500/20 to-fuchsia-500/0",
      badgeIcon: Gem,
      categoryTag: "Chrono & Jewelry",
      tags: ["#AutomaticMovement", "#SapphireGlass", "#FineCraft"]
    };
  }
  if (lower.includes("deal") || lower.includes("offer") || lower.includes("discount") || lower.includes("save") || lower.includes("saving") || lower.includes("festival") || lower.includes("mega")) {
    return {
      accentRing: "hover:border-pink-500/60 dark:hover:border-pink-500/50 hover:shadow-pink-500/10",
      badgeColor: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
      btnGradient: "from-pink-600 via-rose-600 to-red-600 hover:from-pink-500 hover:to-rose-500",
      pillColor: "hover:text-pink-600 dark:hover:text-pink-400",
      glowColor: "from-pink-500/20 to-rose-500/0",
      badgeIcon: Percent,
      categoryTag: "Mega Deals & Offers",
      tags: ["#UpTo60%Off", "#FlashSavings", "#BundlePerks"]
    };
  }
  if (lower.includes("sport") || lower.includes("sneaker") || lower.includes("active") || lower.includes("fitness")) {
    return {
      accentRing: "hover:border-cyan-500/60 dark:hover:border-cyan-500/50 hover:shadow-cyan-500/10",
      badgeColor: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
      btnGradient: "from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-500 hover:to-teal-500",
      pillColor: "hover:text-cyan-600 dark:hover:text-cyan-400",
      glowColor: "from-cyan-500/20 to-sky-500/0",
      badgeIcon: Zap,
      categoryTag: "Sports & Footwear",
      tags: ["#HighRebound", "#LimitedEdition", "#Performance"]
    };
  }
  if (lower.includes("new") || lower.includes("arrival") || lower.includes("drop")) {
    return {
      accentRing: "hover:border-emerald-500/60 dark:hover:border-emerald-500/50 hover:shadow-emerald-500/10",
      badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
      btnGradient: "from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500",
      pillColor: "hover:text-emerald-600 dark:hover:text-emerald-400",
      glowColor: "from-emerald-500/20 to-teal-500/0",
      badgeIcon: Sparkles,
      categoryTag: "Fresh Drops",
      tags: ["#WeeklyDrop", "#VerifiedAuthentic", "#LimitedStock"]
    };
  }
  if (lower.includes("best") || lower.includes("seller") || lower.includes("top-rated")) {
    return {
      accentRing: "hover:border-amber-500/60 dark:hover:border-amber-500/50 hover:shadow-amber-500/10",
      badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
      btnGradient: "from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400",
      pillColor: "hover:text-amber-600 dark:hover:text-amber-400",
      glowColor: "from-amber-500/20 to-yellow-500/0",
      badgeIcon: Crown,
      categoryTag: "Hall of Fame",
      tags: ["#CustomerFavorite", "#5StarRated", "#TopRepurchase"]
    };
  }
  if (lower.includes("trending") || lower.includes("viral")) {
    return {
      accentRing: "hover:border-blue-500/60 dark:hover:border-blue-500/50 hover:shadow-blue-500/10",
      badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
      btnGradient: "from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500",
      pillColor: "hover:text-blue-600 dark:hover:text-blue-400",
      glowColor: "from-blue-500/20 to-indigo-500/0",
      badgeIcon: Flame,
      categoryTag: "Viral Trending",
      tags: ["#HighDemand", "#RealTimeVelocity", "#ViralPicks"]
    };
  }

  return {
    accentRing: "hover:border-purple-500/60 dark:hover:border-purple-500/50 hover:shadow-purple-500/10",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    btnGradient: "from-purple-600 via-indigo-600 to-rose-600 hover:from-purple-500 hover:to-rose-500",
    pillColor: "hover:text-purple-600 dark:hover:text-purple-400",
    glowColor: "from-purple-500/20 to-indigo-500/0",
    badgeIcon: Award,
    categoryTag: "Curated Special",
    tags: ["#VerifiedAuthentic", "#CuratedPick", "#WhiteGlove"]
  };
};

const getCollectionImage = (col) => {
  // 1. Image or banner configured by Admin on collection
  if (col.banner && typeof col.banner === "string" && col.banner.trim() !== "" && !col.banner.includes("photo-1511556532299")) {
    return col.banner.startsWith("http") ? col.banner : `${backendUrl}/${col.banner}`;
  }
  if (col.image && typeof col.image === "string" && col.image.trim() !== "" && !col.image.includes("photo-1511556532299")) {
    return col.image.startsWith("http") ? col.image : `${backendUrl}/${col.image}`;
  }

  // 2. Real product image from products in this collection (managed by admin/sellers in DB)
  if (col.sampleProducts && col.sampleProducts.length > 0) {
    const firstProdImg = col.sampleProducts[0]?.images?.[0] || col.sampleProducts[0]?.image;
    if (firstProdImg && typeof firstProdImg === "string" && firstProdImg.trim() !== "") {
      return firstProdImg.startsWith("http") ? firstProdImg : `${backendUrl}/${firstProdImg}`;
    }
  }

  // 3. Fallback to rich local composite asset
  return getCollectionFallbackImage(col.name, col.slug);
};

// Default typography/theme slide when no admin poster banner is active yet
const DEFAULT_COLLECTIONS_POSTER_SLIDE = {
  _id: "default_admin_poster",
  tagline: "ARCHIVAL CAPSULES // VOL. 26",
  title: "Curated Product Capsules",
  subtitle: "Hand-selected thematic wardrobes and engineering benchmarks. Authenticated directly from global design studios, archived weekly.",
  discountTag: "LIMITED RELEASES",
  ctaText: "Shop Capsules",
  linkUrl: "/collections",
  displayMode: "split",
  theme: "light",
  bgColor: "#FFFFFF",
  imageUrl: fashionImg,
  images: [fashionImg, electronicsImg],
  showPerks: true
};

const slideVariants = {
  enter: (dir) => ({
    opacity: 0,
    x: dir > 0 ? 30 : -30
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir > 0 ? -30 : 30,
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

const Collections = () => {
  const navigate = useNavigate();
  const collectionsGridRef = useRef(null);

  const [rawCollections, setRawCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [heroBanners, setHeroBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // "grid" (3/4 cols) | "compact" (2 cols wide)
  const [likedCollections, setLikedCollections] = useState(() => {
    try {
      const saved = localStorage.getItem("cartnow_fav_collections");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const itemsPerPage = 12;

  const toggleLike = (slug, e) => {
    e.stopPropagation();
    setLikedCollections((prev) => {
      const updated = { ...prev, [slug]: !prev[slug] };
      try {
        localStorage.setItem("cartnow_fav_collections", JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not save favorite collections:", err);
      }
      return updated;
    });
  };

  const scrollToGrid = () => {
    if (collectionsGridRef.current) {
      collectionsGridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 1. Fetch dynamic hero poster banners controlled by Admin
  useEffect(() => {
    cachedGet(`${backendUrl}/api/promo-banners/active?placement=collections_hero`, {}, 60000)
      .then((res) => {
        if (res.data?.success) {
          const list = Array.isArray(res.data.banners) && res.data.banners.length > 0
            ? res.data.banners
            : (res.data.banner ? [res.data.banner] : []);
          setHeroBanners(list);
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic collections hero banners:", err);
      });
  }, []);

  // 2. Compute active poster slides
  const slides = useMemo(() => {
    if (heroBanners.length > 0) {
      const flattened = [];
      heroBanners.forEach((b, bIdx) => {
        const rawImgs = Array.isArray(b.images) && b.images.length > 0
          ? b.images
          : (b.imageUrl ? [b.imageUrl] : []);

        const normalizedImages = rawImgs
          .filter((img) => img && typeof img === "string" && img.trim() !== "")
          .map((img) => (img.startsWith("http") ? img : `${backendUrl}/${img}`));

        if (b.displayMode === "full_image" && normalizedImages.length > 0) {
          normalizedImages.forEach((img, imgIdx) => {
            flattened.push({
              _id: `${b._id || bIdx}_${imgIdx}`,
              title: b.title,
              subtitle: b.subtitle,
              tagline: b.tagline,
              discountTag: b.discountTag,
              ctaText: b.ctaText,
              linkUrl: b.linkUrl,
              displayMode: "full_image",
              imageUrl: img,
              images: [img],
              theme: b.theme || "light",
              bgColor: b.bgColor && b.bgColor !== "#070c18" && b.bgColor !== "#070C18" ? b.bgColor : "#FFFFFF",
              showPerks: b.showPerks !== false
            });
          });
        } else {
          flattened.push({
            _id: b._id || `banner_${bIdx}`,
            title: b.title || "Curated Product Capsules",
            subtitle: b.subtitle || "Hand-selected thematic wardrobes and engineering benchmarks. Authenticated directly from global design studios.",
            tagline: b.tagline || "ARCHIVAL CAPSULES // VOL. 26",
            discountTag: b.discountTag || "LIMITED RELEASES",
            ctaText: b.ctaText || "Shop Capsules",
            linkUrl: b.linkUrl || "/collections",
            displayMode: b.displayMode || "split",
            theme: b.theme || "light",
            bgColor: b.bgColor && b.bgColor !== "#070c18" && b.bgColor !== "#070C18" ? b.bgColor : "#FFFFFF",
            imageUrl: normalizedImages[0] || fashionImg,
            images: normalizedImages.length > 0 ? normalizedImages : [fashionImg, electronicsImg],
            showPerks: b.showPerks !== false
          });
        }
      });
      return flattened.length > 0 ? flattened : [DEFAULT_COLLECTIONS_POSTER_SLIDE];
    }
    return [DEFAULT_COLLECTIONS_POSTER_SLIDE];
  }, [heroBanners]);

  const totalSlides = slides.length;
  const currentBanner = slides[currentSlide % totalSlides] || slides[0];
  const [slideDirection, setSlideDirection] = useState(1);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-advance slideshow every 6 seconds (paused on hover)
  useEffect(() => {
    if (totalSlides <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setSlideDirection(1);
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(timer);
  }, [totalSlides, isHovered]);

  const handlePrevSlide = (e) => {
    e?.stopPropagation();
    setSlideDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNextSlide = (e) => {
    e?.stopPropagation();
    setSlideDirection(1);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    if (swipeDistance > 45) {
      handleNextSlide();
    } else if (swipeDistance < -45) {
      handlePrevSlide();
    }
  };

  // 3. Fetch product collections from backend
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const { data } = await cachedGet(`${backendUrl}/api/product/collections`);
        if (data.success && Array.isArray(data.collections)) {
          setRawCollections(data.collections);
        }
      } catch (err) {
        console.error("Failed to load collections:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  // Format enriched collections
  const collections = useMemo(() => {
    return rawCollections.map((col) => {
      const styles = getCollectionStyles(col.name, col.slug);
      return {
        ...col,
        title: col.name,
        slug: col.slug || col.name.toLowerCase().replace(/\s+/g, "-"),
        subtitle: col.description || "Curated capsule of high quality verified products.",
        countNum: col.count || (col.sampleProducts?.length ? col.sampleProducts.length * 4 : 12),
        badge: col.name,
        badgeIcon: styles.badgeIcon,
        categoryTag: styles.categoryTag,
        accentRing: styles.accentRing,
        badgeColor: styles.badgeColor,
        btnGradient: styles.btnGradient,
        glowColor: styles.glowColor,
        tags: styles.tags,
        image: getCollectionImage(col),
        sampleProducts: col.sampleProducts || [],
        trending: true
      };
    });
  }, [rawCollections]);

  // Compute dynamic category item counts
  const categoryCounts = useMemo(() => {
    const counts = {
      all: collections.length,
      trending: 0,
      fashion: 0,
      electronics: 0,
      sports: 0,
      home: 0,
      beauty: 0,
      accessories: 0,
      deals: 0
    };
    collections.forEach((col) => {
      const slug = (col.slug || "").toLowerCase();
      const tag = (col.categoryTag || "").toLowerCase();
      if (slug.includes("trending") || slug.includes("new-arrival") || slug.includes("best-seller") || tag.includes("drops") || tag.includes("sellers") || tag.includes("viral")) counts.trending++;
      if (tag.includes("tech") || slug.includes("electro") || slug.includes("gadget")) counts.electronics++;
      if (tag.includes("fashion") || slug.includes("fashion") || slug.includes("wear") || slug.includes("style")) counts.fashion++;
      if (tag.includes("home") || slug.includes("home") || slug.includes("decor") || slug.includes("kitchen")) counts.home++;
      if (tag.includes("beauty") || tag.includes("skincare") || slug.includes("beauty") || slug.includes("glow")) counts.beauty++;
      if (tag.includes("sports") || tag.includes("footwear") || slug.includes("sports") || slug.includes("sneaker")) counts.sports++;
      if (tag.includes("chrono") || tag.includes("jewelry") || tag.includes("accessory") || slug.includes("accessories") || slug.includes("watch") || slug.includes("gold")) counts.accessories++;
      if (tag.includes("deals") || tag.includes("offers") || tag.includes("savings") || slug.includes("offer") || slug.includes("deal") || slug.includes("festival")) counts.deals++;
    });
    return counts;
  }, [collections]);

  // Filter collections based on search query and category filter pill
  const filteredCollections = useMemo(() => {
    let result = collections.filter((col) => {
      const matchesSearch =
        col.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        col.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (col.categoryTag && col.categoryTag.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedFilter === "all") return true;
      if (selectedFilter === "trending" && (col.slug?.includes("trending") || col.slug?.includes("new-arrival") || col.slug?.includes("best-seller") || col.categoryTag?.includes("Drops") || col.categoryTag?.includes("Sellers") || col.categoryTag?.includes("Viral"))) return true;
      if (selectedFilter === "electronics" && (col.categoryTag?.includes("Tech") || col.slug?.includes("electro") || col.slug?.includes("gadget"))) return true;
      if (selectedFilter === "fashion" && (col.categoryTag?.includes("Fashion") || col.slug?.includes("fashion") || col.slug?.includes("wear") || col.slug?.includes("style"))) return true;
      if (selectedFilter === "home" && (col.categoryTag?.includes("Home") || col.slug?.includes("home") || col.slug?.includes("decor") || col.slug?.includes("kitchen"))) return true;
      if (selectedFilter === "beauty" && (col.categoryTag?.includes("Beauty") || col.categoryTag?.includes("Skincare") || col.slug?.includes("beauty") || col.slug?.includes("glow"))) return true;
      if (selectedFilter === "sports" && (col.categoryTag?.includes("Sports") || col.categoryTag?.includes("Footwear") || col.slug?.includes("sports") || col.slug?.includes("sneaker"))) return true;
      if (selectedFilter === "accessories" && (col.categoryTag?.includes("Chrono") || col.categoryTag?.includes("Jewelry") || col.categoryTag?.includes("Accessory") || col.slug?.includes("accessories") || col.slug?.includes("watch") || col.slug?.includes("gold"))) return true;
      if (selectedFilter === "deals" && (col.categoryTag?.includes("Deals") || col.categoryTag?.includes("Offers") || col.categoryTag?.includes("Savings") || col.slug?.includes("offer") || col.slug?.includes("deal") || col.slug?.includes("festival"))) return true;

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "items-high") return (b.countNum || 0) - (a.countNum || 0);
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      if (sortBy === "name-desc") return b.title.localeCompare(a.title);
      // popular (default)
      return (b.countNum || 0) - (a.countNum || 0);
    });

    return result;
  }, [collections, searchQuery, selectedFilter, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilter, sortBy]);

  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);

  const paginatedCollections = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCollections.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCollections, currentPage, itemsPerPage]);

  const totalProductCount = useMemo(() => {
    return collections.reduce((sum, col) => sum + (col.countNum || 0), 0);
  }, [collections]);

  const categoryPills = [
    { id: "all", label: "All Capsules", icon: Layers, count: categoryCounts.all },
    { id: "trending", label: "Trending & Viral", icon: Flame, count: categoryCounts.trending },
    { id: "fashion", label: "Fashion & Luxury", icon: Shirt, count: categoryCounts.fashion },
    { id: "electronics", label: "Tech & Cyber", icon: Laptop, count: categoryCounts.electronics },
    { id: "sports", label: "Sneakers & Sports", icon: Zap, count: categoryCounts.sports },
    { id: "home", label: "Modern Home", icon: Home, count: categoryCounts.home },
    { id: "beauty", label: "Clean Beauty", icon: Sparkles, count: categoryCounts.beauty },
    { id: "accessories", label: "Chrono & Jewelry", icon: Gem, count: categoryCounts.accessories },
    { id: "deals", label: "Mega Deals", icon: Percent, count: categoryCounts.deals }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 text-left pb-20 relative selection:bg-rose-500 selection:text-white">
      
      {/* Background Subtle Ambient Mesh Gradients (desktop-only for 60+ FPS mobile) */}
      <div className="hidden md:block fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-rose-500/4 dark:bg-rose-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-indigo-500/4 dark:bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-amber-500/4 dark:bg-amber-600/10 rounded-full blur-[150px]" />
      </div>

      {/* ── MAIN CONTENT WRAPPER (FULL FLUID WIDTH) ── */}
      <div className="w-full px-2 sm:px-4 lg:px-6 py-3 sm:py-5 space-y-4 sm:space-y-6">

        {/* ═══════════════════════════════════════════════════════════════════
            1. CINEMATIC HERO SECTION (TALL, EDITORIAL 2-SIDED SPLIT)
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full rounded-none overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors duration-200 group touch-pan-y select-none bg-white dark:bg-slate-900"
          style={{ backgroundColor: currentBanner?.bgColor && currentBanner.bgColor !== "#070c18" && currentBanner.bgColor !== "#070C18" ? currentBanner.bgColor : undefined }}
        >
          {/* Navigation Chevrons */}
          {totalSlides > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevSlide}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-none bg-white/95 hover:bg-white text-slate-900 hover:text-black border border-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 dark:text-white dark:border-slate-700 flex items-center justify-center transition-all duration-150 cursor-pointer shadow-md active:scale-95 group/btn touch-manipulation"
                title="Previous Slide"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={18} className="transition-transform group-hover/btn:-translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={handleNextSlide}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-none bg-white/95 hover:bg-white text-slate-900 hover:text-black border border-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 dark:text-white dark:border-slate-700 flex items-center justify-center transition-all duration-150 cursor-pointer shadow-md active:scale-95 group/btn touch-manipulation"
                title="Next Slide"
                aria-label="Next Slide"
              >
                <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-0.5" />
              </button>
            </>
          )}

          {/* Animated Slide Content */}
          <AnimatePresence mode="popLayout" custom={slideDirection} initial={false}>
            <motion.div
              key={currentBanner?._id || currentSlide}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative z-10 w-full transform-gpu will-change-transform"
            >
              {currentBanner?.displayMode === "full_image" && (currentBanner.imageUrl || currentBanner.images?.[0]) ? (
                /* Mode A: Full Image Poster Uploaded by Admin (Balanced Height) */
                <div 
                  onClick={() => currentBanner.linkUrl && navigate(currentBanner.linkUrl)}
                  className="relative w-full h-[320px] sm:h-[380px] md:h-[440px] lg:h-[500px] xl:h-[540px] cursor-pointer overflow-hidden flex items-center justify-center"
                >
                  <img
                    src={currentBanner.imageUrl || currentBanner.images?.[0]}
                    alt={currentBanner.title || "Collections Poster"}
                    loading="eager"
                    decoding="async"
                    draggable="false"
                    className="w-full h-full object-cover object-center select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                  
                  <div className="absolute bottom-5 sm:bottom-8 left-5 sm:left-10 z-20 space-y-2 text-left max-w-2xl text-white">
                    {currentBanner.tagline && (
                      <span className="inline-block px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 rounded-none shadow-sm">
                        {currentBanner.tagline}
                      </span>
                    )}
                    <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[1.06] text-white drop-shadow-lg">
                      {currentBanner.title}
                    </h2>
                    {currentBanner.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-200 font-medium line-clamp-2 drop-shadow-md max-w-xl leading-relaxed">
                        {currentBanner.subtitle}
                      </p>
                    )}
                    <div className="pt-1.5">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-950 font-black text-xs uppercase tracking-wider rounded-none shadow-md">
                        <span>{currentBanner.ctaText || "Explore Drop"}</span>
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mode B: Elevated Editorial Light Split Showcase (Balanced Height) */
                <div className="flex flex-col w-full bg-white dark:bg-slate-900">
                  
                  <div className="grid grid-cols-12 min-h-[380px] sm:min-h-[440px] md:min-h-[480px] lg:min-h-[520px] xl:min-h-[560px] w-full items-stretch">
                    
                    {/* ── LEFT SIDE: EDITORIAL NARRATIVE & CTAS (Col 12 on mobile, Col 5 on desktop) ── */}
                    <div className="col-span-12 md:col-span-5 lg:col-span-5 flex flex-col justify-between p-4 sm:p-6 md:p-7 lg:p-9 text-left z-20 space-y-4">
                      
                      {/* Top Meta Tag & Slide Indicators */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#ff3f6c] animate-pulse" />
                          <span className="text-[9.5px] sm:text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                            {currentBanner?.tagline || "ARCHIVAL CAPSULES // VOL. 26"}
                          </span>
                        </div>

                        {totalSlides > 1 && (
                          <div className="flex items-center gap-1.5">
                            {slides.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSlideDirection(idx > currentSlide % totalSlides ? 1 : -1);
                                  setCurrentSlide(idx);
                                }}
                                className={`h-1.5 transition-all duration-200 cursor-pointer rounded-none ${
                                  idx === currentSlide % totalSlides
                                    ? "w-5 sm:w-6 bg-slate-950 dark:bg-white"
                                    : "w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300"
                                }`}
                                title={`Slide ${idx + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Main Center Typography Group */}
                      <div className="space-y-2.5 sm:space-y-3 my-auto">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-rose-50 text-[#ff3f6c] border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 rounded-none">
                          <Sparkles size={11} className="stroke-[2.5]" />
                          <span>Curated Exclusive Edits</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-950 dark:text-white leading-[1.04]">
                          Curated <br />
                          <span className="font-serif italic font-normal text-[#ff3f6c]">
                            Capsule
                          </span>{" "}
                          Edits
                        </h1>

                        <p className="text-xs sm:text-[13.5px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                          {currentBanner?.subtitle || "Hand-selected thematic wardrobes and engineering benchmarks. Authenticated directly from global design studios, archived weekly."}
                        </p>
                      </div>

                      {/* Bottom Actions & Trust Strip */}
                      <div className="space-y-3 pt-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                          <button
                            onClick={scrollToGrid}
                            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-none shadow-md active:scale-95 transition-all duration-150 cursor-pointer border-none touch-manipulation dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                          >
                            <ShoppingBag size={13} className="stroke-[2.5]" />
                            <span>Shop Capsules</span>
                            <ArrowRight size={12} className="stroke-[3]" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedFilter("trending");
                              scrollToGrid();
                            }}
                            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-900 text-xs font-black uppercase tracking-widest rounded-none border border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-700 active:scale-95 transition-all duration-150 cursor-pointer touch-manipulation"
                          >
                            <Flame size={13} className="text-rose-500 fill-rose-500" />
                            <span>Trending Drops</span>
                          </button>
                        </div>

                        {/* Inline Minimalist Guarantees */}
                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 text-[9.5px] sm:text-[10.5px] font-bold text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                            <CheckCircle size={11} className="text-emerald-500 stroke-[2.5]" />
                            <span>100% Genuine</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                            <Truck size={11} className="text-blue-500 stroke-[2.5]" />
                            <span>24H Concierge</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                            <RotateCcw size={11} className="text-amber-500 stroke-[2.5]" />
                            <span>Complimentary Returns</span>
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* ── RIGHT SIDE: TWO SIDE-BY-SIDE LUXURY LOOKBOOK CARDS ── */}
                    <div className="col-span-12 md:col-span-7 lg:col-span-7 p-3 sm:p-4 md:p-5 lg:p-6 bg-slate-50/70 dark:bg-slate-950/50 border-t md:border-t-0 md:border-l border-slate-200/80 dark:border-slate-800 flex items-center justify-center">
                      
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:gap-4 w-full h-full items-stretch">
                        
                        {/* ── CARD 1: FASHION & LUXURY COUTURE ── */}
                        <div 
                          onClick={() => { setSelectedFilter("fashion"); scrollToGrid(); }}
                          className="relative h-full min-h-[220px] sm:min-h-[280px] md:min-h-[340px] lg:min-h-[390px] rounded-none overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm group/c1 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
                        >
                          <img
                            src={currentBanner?.imageUrl || fashionImg}
                            alt="Fashion Lookbook"
                            loading="eager"
                            decoding="async"
                            draggable="false"
                            className="absolute inset-0 w-full h-full object-cover object-center group-hover/c1:scale-105 transition-transform duration-700 ease-out select-none transform-gpu"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                          
                          {/* Top Badge */}
                          <div className="relative z-10 p-2.5 sm:p-3.5 flex items-center justify-between">
                            <span className="px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-white/95 text-slate-950 border border-white/60 shadow-xs">
                              Lookbook #01
                            </span>
                            <span className="px-1.5 py-0.5 text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-wider bg-rose-500 text-white">
                              Couture
                            </span>
                          </div>

                          {/* Bottom Info Banner */}
                          <div className="relative z-10 p-2.5 sm:p-3.5 text-white flex items-end justify-between gap-1.5">
                            <div>
                              <span className="text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-widest text-rose-300 block">
                                Edition 2026
                              </span>
                              <h4 className="text-xs sm:text-sm lg:text-base font-black uppercase tracking-tight text-white leading-tight">
                                Fashion & Luxe
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 text-[8.5px] sm:text-[10px] font-black bg-white/20 px-1.5 py-0.5 border border-white/30 text-white shrink-0">
                              <span>4.9 ★</span>
                            </div>
                          </div>
                        </div>

                        {/* ── CARD 2: TECH & CYBER FLAGSHIP ── */}
                        <div 
                          onClick={() => { setSelectedFilter("electronics"); scrollToGrid(); }}
                          className="relative h-full min-h-[220px] sm:min-h-[280px] md:min-h-[340px] lg:min-h-[390px] rounded-none overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm group/c2 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
                        >
                          <img
                            src={currentBanner?.images?.[1] || electronicsImg}
                            alt="Tech Flagship"
                            loading="eager"
                            decoding="async"
                            draggable="false"
                            className="absolute inset-0 w-full h-full object-cover object-center group-hover/c2:scale-105 transition-transform duration-700 ease-out select-none transform-gpu"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                          
                          {/* Top Badge */}
                          <div className="relative z-10 p-2.5 sm:p-3.5 flex items-center justify-between">
                            <span className="px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-white/95 text-slate-950 border border-white/60 shadow-xs">
                              Flagship 2026
                            </span>
                            <span className="px-1.5 py-0.5 text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-wider bg-blue-500 text-white">
                              Verified
                            </span>
                          </div>

                          {/* Bottom Info Banner */}
                          <div className="relative z-10 p-2.5 sm:p-3.5 text-white flex items-end justify-between gap-1.5">
                            <div>
                              <span className="text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-widest text-blue-300 block">
                                Pro Audio & Devices
                              </span>
                              <h4 className="text-xs sm:text-sm lg:text-base font-black uppercase tracking-tight text-white leading-tight">
                                Tech & Cyber
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 text-[8.5px] sm:text-[10px] font-black bg-white/20 px-1.5 py-0.5 border border-white/30 text-white shrink-0">
                              <span>Verified</span>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            2. EDITORIAL CAPSULE SPECIFICATION RIBBON (CLEAN FULL-WIDTH)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-none shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-slate-800 grid grid-cols-2 lg:grid-cols-4">
          
          <div className="p-3.5 sm:p-4 lg:p-5 flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-none bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white shrink-0">
              <Layers size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 block">Live Capsules</span>
              <span className="text-sm sm:text-base font-black text-slate-950 dark:text-white leading-tight block mt-0.5">
                {collections.length} Curated Drops
              </span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 lg:p-5 flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-none bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white shrink-0">
              <Package size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 block">Archival Catalog</span>
              <span className="text-sm sm:text-base font-black text-slate-950 dark:text-white leading-tight block mt-0.5">
                {totalProductCount > 0 ? `${totalProductCount}+` : "250+"} Verified Pieces
              </span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 lg:p-5 flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-none bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-amber-500 shrink-0">
              <Star size={18} className="fill-amber-400 text-amber-400" />
            </div>
            <div>
              <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 block">Client Satisfaction</span>
              <span className="text-sm sm:text-base font-black text-slate-950 dark:text-white leading-tight block mt-0.5">
                4.9 ★ (18,400+ Reviews)
              </span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 lg:p-5 flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-none bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Truck size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 block">Dispatch Protocol</span>
              <span className="text-sm sm:text-base font-black text-slate-950 dark:text-white leading-tight block mt-0.5">
                White-Glove 24H Shipping
              </span>
            </div>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            3. DISCOVERY & FILTER HUB (SEARCH, PILLS WITH COUNTS, SORT)
        ═══════════════════════════════════════════════════════════════════ */}
        <div ref={collectionsGridRef} className="space-y-3 w-full">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 rounded-none shadow-xs space-y-3 w-full">
            
            {/* Top Toolbar: Search + Sort + Layout Toggle */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search capsules by title, category, or style tags..."
                  className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-white transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Controls Right */}
              <div className="flex items-center gap-2 justify-between md:justify-end shrink-0">
                
                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 px-3 py-1.5 rounded-none">
                  <ArrowUpDown size={12} className="text-slate-400 stroke-[2.5]" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="popular">Curator's Choice</option>
                    <option value="items-high">Largest Catalog</option>
                    <option value="name-asc">Alphabetical (A → Z)</option>
                    <option value="name-desc">Alphabetical (Z → A)</option>
                  </select>
                </div>

                {/* Grid vs Wide Showcase Switcher */}
                <div className="hidden sm:flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 p-0.5 rounded-none">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-none transition-all cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    }`}
                    title="Standard Grid (3/4 Columns)"
                  >
                    <Grid3X3 size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode("compact")}
                    className={`p-1.5 rounded-none transition-all cursor-pointer ${
                      viewMode === "compact"
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    }`}
                    title="Wide Showcase (2 Columns)"
                  >
                    <LayoutGrid size={14} />
                  </button>
                </div>

                {/* Capsule Count Pill */}
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-none shrink-0">
                  {filteredCollections.length} Capsules
                </div>
              </div>

            </div>

            {/* Category Filter Pills Bar with Dynamic Counts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar pt-0.5 touch-pan-x overscroll-x-contain select-none">
              {categoryPills.map((pill) => {
                const IconComponent = pill.icon;
                const isActive = selectedFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedFilter(pill.id)}
                    className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-colors duration-150 border cursor-pointer rounded-none flex items-center gap-1.5 shrink-0 active:scale-95 touch-manipulation ${
                      isActive
                        ? "bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-xs"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <IconComponent size={13} className={isActive ? "stroke-[2.5]" : ""} />
                    <span>{pill.label}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-none font-bold ${
                      isActive 
                        ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950" 
                        : "bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}>
                      {pill.count}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            4. CAPSULE CARDS GRID (EDITORIAL 4:5 HIGH-FASHION ASPECT)
        ═══════════════════════════════════════════════════════════════════ */}
        {loading ? (
          <CollectionsSkeleton count={viewMode === "compact" ? 4 : 8} />
        ) : filteredCollections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-none bg-white/60 dark:bg-slate-900/60 text-center space-y-3.5 w-full"
          >
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white rounded-none">
              <ShoppingBag size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Matching Capsules Found</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md">
                We couldn't find any collection matching "<span className="text-slate-800 dark:text-white font-bold">{searchQuery}</span>". Try clearing your search or picking another category.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedFilter("all");
              }}
              className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-none transition duration-200 border-none cursor-pointer shadow-md dark:bg-white dark:text-slate-950"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            
            <div className={`grid gap-4 sm:gap-5 lg:gap-6 w-full ${
              viewMode === "compact"
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}>
              {paginatedCollections.map((col, i) => {
                const isLiked = !!likedCollections[col.slug];
                const BadgeIconComponent = col.badgeIcon || Award;

                return (
                  <motion.div
                    key={col.slug || i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: Math.min(i * 0.02, 0.08), ease: "easeOut" }}
                    className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-none overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-xl sm:hover:-translate-y-1 transform-gpu w-full"
                  >
                    <div>
                      {/* ── CARD COVER IMAGE HERO (EDITORIAL 4:5 PORTRAIT RATIO) ── */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-950 cursor-pointer">
                        <img
                          src={col.image}
                          alt={col.title}
                          loading="lazy"
                          decoding="async"
                          draggable="false"
                          onClick={() => navigate(`/collections/${col.slug}`)}
                          className="w-full h-full object-cover object-center sm:group-hover:scale-105 transition-transform duration-700 ease-out select-none transform-gpu"
                        />
                        
                        {/* Gradient Vignette */}
                        <div 
                          onClick={() => navigate(`/collections/${col.slug}`)}
                          className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" 
                        />

                        {/* Top Overlays: Category Pill & Bookmark Heart */}
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-none bg-white/95 text-slate-950 shadow-md border border-white/60">
                            <BadgeIconComponent size={11} className="stroke-[2.5]" />
                            <span>{col.categoryTag || col.badge}</span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => toggleLike(col.slug, e)}
                            className={`w-8 h-8 rounded-none flex items-center justify-center transition-colors duration-150 bg-slate-950/80 cursor-pointer shadow-md active:scale-95 touch-manipulation ${
                              isLiked
                                ? "bg-rose-500 text-white"
                                : "hover:bg-slate-900 text-white border border-white/20"
                            }`}
                            title={isLiked ? "Remove from Saved" : "Save Capsule"}
                          >
                            <Heart size={14} className={isLiked ? "fill-white" : ""} />
                          </button>
                        </div>

                        {/* Bottom Overlay Info on Image */}
                        <div 
                          onClick={() => navigate(`/collections/${col.slug}`)}
                          className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-10 pointer-events-none"
                        >
                          <span className="text-[9px] font-black uppercase tracking-wider bg-slate-950/80 px-2 py-0.5 rounded-none border border-white/20 text-white flex items-center gap-1">
                            <Sparkles size={10} className="text-amber-300" />
                            <span>{col.countNum > 0 ? `${col.countNum}+ Pieces` : "12+ Pieces"}</span>
                          </span>

                          <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-200 flex items-center gap-1">
                            <span>Explore</span>
                            <ArrowUpRight size={13} className="text-white" />
                          </span>
                        </div>
                      </div>

                      {/* ── CARD CONTENT BODY ── */}
                      <div className="p-4 sm:p-5 space-y-3">
                        
                        {/* Title & Description */}
                        <div className="space-y-1">
                          <h3
                            onClick={() => navigate(`/collections/${col.slug}`)}
                            className="text-base sm:text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight hover:text-[#ff3f6c] dark:hover:text-[#ff3f6c] transition-colors cursor-pointer leading-tight"
                          >
                            {col.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                            {col.subtitle}
                          </p>
                        </div>

                        {/* Curated Tags Strip */}
                        {col.tags && col.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {col.tags.map((tg, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[8.5px] font-bold px-2 py-0.5 rounded-none bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800/80"
                              >
                                {tg}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* ── INTERACTIVE SAMPLE PRODUCTS DECK ── */}
                        {col.sampleProducts && col.sampleProducts.length > 0 && (
                          <div className="pt-1.5">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-400">
                                Featured In Capsule:
                              </span>
                              <span className="text-[8.5px] font-bold text-slate-400">
                                Quick preview
                              </span>
                            </div>

                            <div className="grid grid-cols-4 gap-1.5">
                              {col.sampleProducts.slice(0, 4).map((p, pIdx) => {
                                const pImg = p.images?.[0] || p.image;
                                const fullImgUrl = pImg ? (pImg.startsWith("http") ? pImg : `${backendUrl}/${pImg}`) : null;
                                return (
                                  <div
                                    key={p._id || pIdx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/product/${p._id}`);
                                    }}
                                    title={p.name}
                                    className="aspect-square bg-slate-50 dark:bg-slate-950 p-1 border border-slate-200/80 dark:border-slate-800 hover:border-slate-950 dark:hover:border-white cursor-pointer flex flex-col items-center justify-center transition-transform duration-150 rounded-none relative group/thumb shadow-2xs sm:hover:scale-105 active:scale-95 touch-manipulation transform-gpu"
                                  >
                                    {fullImgUrl ? (
                                      <img
                                        src={fullImgUrl}
                                        alt={p.name}
                                        loading="lazy"
                                        decoding="async"
                                        draggable="false"
                                        className="w-full h-full object-contain pointer-events-none select-none"
                                      />
                                    ) : (
                                      <Package size={15} className="text-slate-400" />
                                    )}
                                    {p.price && (
                                      <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 text-white text-[7.5px] font-black text-center py-0.5 rounded-none truncate opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-150">
                                        ₹{p.price}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* ── CARD FOOTER & ACTION ── */}
                    <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 flex items-center justify-between gap-3">
                      <div className="flex flex-col text-left">
                        <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-400">Authenticity</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle size={11} /> Verified
                        </span>
                      </div>

                      <button
                        onClick={() => navigate(`/collections/${col.slug}`)}
                        className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-black text-xs uppercase tracking-wider rounded-none transition-all duration-150 flex items-center gap-1.5 border-none cursor-pointer shadow-sm hover:shadow-md active:scale-95 touch-manipulation group/btn"
                      >
                        <ShoppingBag size={12} className="stroke-[2.5]" />
                        <span>Shop Capsule</span>
                        <ArrowRight size={12} className="stroke-[3] transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </div>

            {/* ═══════════════════════════════════════════════════════════════════
                5. VIP BESPOKE CURATION BANNER
            ═══════════════════════════════════════════════════════════════════ */}
            <div className="relative rounded-none overflow-hidden bg-slate-950 text-white border border-slate-800 p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl w-full">
              <div className="space-y-2 text-left max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest">
                  <Crown size={11} />
                  Private Client Sourcing
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                  Looking for a custom archival capsule?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  Tell our lead curators what you need. From bespoke corporate collections to private runway capsules, we source verified pieces directly from verified houses.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => navigate("/discover")}
                  className="px-6 py-3 bg-white text-slate-950 hover:bg-slate-100 text-xs font-black uppercase tracking-widest rounded-none shadow-md transition-all duration-150 cursor-pointer active:scale-95 border-none"
                >
                  Browse Global Catalog
                </button>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════════
                6. PAGINATION CONTROLS
            ═══════════════════════════════════════════════════════════════════ */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-200/90 dark:border-slate-800 w-full">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Showing <span className="text-slate-900 dark:text-white font-black">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-900 dark:text-white font-black">{Math.min(currentPage * itemsPerPage, filteredCollections.length)}</span> of <span className="text-slate-900 dark:text-white font-black">{filteredCollections.length}</span> Collections
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                      scrollToGrid();
                    }}
                    className="px-3.5 py-1.5 text-xs font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition duration-150 flex items-center gap-1 shadow-xs"
                  >
                    <ChevronLeft size={14} className="stroke-[3]" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          scrollToGrid();
                        }}
                        className={`w-8 h-8 text-xs font-black rounded-none transition duration-150 cursor-pointer border ${
                          currentPage === page
                            ? "bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 shadow-xs"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                      scrollToGrid();
                    }}
                    className="px-3.5 py-1.5 text-xs font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition duration-150 flex items-center gap-1 shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} className="stroke-[3]" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default Collections;
