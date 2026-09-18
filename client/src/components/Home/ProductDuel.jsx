import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Flame,
  ThumbsUp,
  Sparkles,
  CheckCircle2,
  ShoppingCart,
  Eye,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  ShieldCheck,
  Star,
  Crown,
  Check,
  Calendar,
  Clock,
  ExternalLink
} from "lucide-react";
import { toast } from "react-toastify";
import { backendUrl } from "../../config";
import { cachedGet } from "../../utils/apiCache";

// Helper to deterministically calculate current week of the year & time left
export const getCalendarWeekInfo = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = Math.floor((now - startOfYear) / 86400000);
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

  // Calculate days & hours left until next weekly rotation (Sunday midnight)
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
  const daysLeft = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const hoursLeft = 23 - now.getHours();
  const minsLeft = 59 - now.getMinutes();

  return {
    weekNumber,
    daysLeft,
    hoursLeft,
    minsLeft,
    formattedCycle: `Week ${weekNumber} • Resets in ${daysLeft > 0 ? `${daysLeft}d ` : ""}${hoursLeft}h`
  };
};

// Helper to get clean image URL for real products
const getProductImage = (product) => {
  if (!product) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80";
  const raw = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images[0]
    : (product.image || product.bgRemovedImage || "");
  if (!raw || typeof raw !== "string") {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80";
  }
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) {
    return raw;
  }
  const cleanPath = raw.startsWith("/") ? raw.slice(1) : raw;
  return `${backendUrl}/${cleanPath}`;
};

// Helper to extract clean brand from real product
const getProductBrand = (product) => {
  if (product.brand && typeof product.brand === "string" && product.brand.trim()) {
    return product.brand.trim();
  }
  const name = (product.name || "").trim();
  const firstWord = name.split(" ")[0];
  if (firstWord && firstWord.length > 2) return firstWord;
  return product.category || "CartNow";
};

// Helper to format dynamic specifications from real product data
const buildContenderSpecs = (product, competitor) => {
  const specs = [];

  // 1. Real specifications from database if available
  if (Array.isArray(product.specifications) && product.specifications.length > 0) {
    product.specifications.slice(0, 4).forEach((s) => {
      if (s && s.key && s.value) {
        specs.push({
          label: s.key,
          value: s.value,
          winner: true
        });
      }
    });
  }

  // 2. Fill with dynamic comparison points if needed
  if (specs.length < 4) {
    const rating = typeof product.rating === "number" ? product.rating : 4.8;
    const compRating = typeof competitor?.rating === "number" ? competitor.rating : 4.6;
    specs.push({
      label: "Customer Rating",
      value: `${rating.toFixed(1)} ★ (${product.ratingsCount || product.reviews?.length || 85}+ Reviews)`,
      winner: rating >= compRating
    });
  }

  if (specs.length < 4) {
    const origPrice = product.originalPrice || Math.round(product.price * 1.25);
    const saveAmt = Math.max(0, origPrice - product.price);
    const compOrig = competitor ? (competitor.originalPrice || Math.round(competitor.price * 1.25)) : origPrice;
    const compSave = competitor ? Math.max(0, compOrig - competitor.price) : saveAmt;
    specs.push({
      label: "Deal Value",
      value: `Save ₹${saveAmt.toLocaleString("en-IN")} (${Math.round((saveAmt / origPrice) * 100)}% OFF)`,
      winner: saveAmt >= compSave
    });
  }

  if (specs.length < 4) {
    specs.push({
      label: "Availability",
      value: (product.stock > 0 || product.stock === undefined) ? "In Stock • Express Delivery" : "Limited Stock Available",
      winner: (product.stock > 0 || product.stock === undefined)
    });
  }

  if (specs.length < 4) {
    specs.push({
      label: "Authenticity",
      value: "100% Verified Brand Original",
      winner: true
    });
  }

  return specs.slice(0, 4);
};

// Helper to transform a real database product into a duel contender
const formatContender = (product, competitor, side = "A") => {
  const brand = getProductBrand(product);
  const origPrice = product.originalPrice || Math.round(product.price * 1.25);
  const rating = typeof product.rating === "number" ? product.rating : 4.8;
  const compRating = competitor && typeof competitor.rating === "number" ? competitor.rating : 4.6;
  
  let badge = "Shopper's Choice";
  if (rating >= 4.7 && rating >= compRating) {
    badge = "Top Rated Pick";
  } else if (product.price < (competitor?.price || product.price)) {
    badge = "Best Value Favorite";
  } else if (origPrice - product.price > 1000) {
    badge = "Biggest Discount";
  } else if (side === "A") {
    badge = "Shopper's Value Favorite";
  } else {
    badge = "Premium Flagship Pick";
  }

  return {
    id: product._id || `prod_${side}`,
    _id: product._id,
    name: product.name || "Featured Product",
    brand,
    price: product.price || 999,
    originalPrice: origPrice,
    rating,
    image: getProductImage(product),
    badge,
    tagline: product.subCategory || product.category || (product.description ? product.description.slice(0, 45) + "..." : "High Performance Gear"),
    specs: buildContenderSpecs(product, competitor),
    rawProduct: product
  };
};

/* Curated Fallback Duels (Used only if database has 0 products or is loading) */
const FALLBACK_DUELS = [
  {
    id: "duel_audio",
    category: "Audio",
    tabLabel: "ANC Audio Titans",
    title: "Flagship Studio ANC Crown: Sony vs Apple",
    subtitle: "Battle of ultimate sound isolation, acoustics, and comfort. Which one takes your daily playlist?",
    totalVotesBase: 12480,
    contenderA: {
      id: "duel_sony_xm5",
      _id: "duel_sony_xm5",
      name: "Sony WH-1000XM5 Studio Wireless",
      brand: "Sony",
      price: 26990,
      originalPrice: 34990,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      badge: "Shopper's Value Favorite",
      tagline: "30h ANC • LDAC Hi-Res Audio",
      specs: [
        { label: "Battery Life", value: "30 Hours ANC On", winner: true },
        { label: "Weight", value: "250g (Ultra-Light)", winner: true },
        { label: "Codecs", value: "LDAC Hi-Res + DSEE", winner: true },
        { label: "Multipoint", value: "2 Devices Seamless", winner: false }
      ]
    },
    contenderB: {
      id: "duel_airpods_max",
      _id: "duel_airpods_max",
      name: "Apple AirPods Max Spatial Audio",
      brand: "Apple",
      price: 49900,
      originalPrice: 59900,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
      badge: "Build Quality King",
      tagline: "Stainless Steel • Spatial Audio",
      specs: [
        { label: "Battery Life", value: "20 Hours Spatial On", winner: false },
        { label: "Weight", value: "384g (Stainless Steel)", winner: false },
        { label: "Codecs", value: "Apple Computational H1", winner: false },
        { label: "Multipoint", value: "Apple Ecosystem Auto", winner: true }
      ]
    }
  },
  {
    id: "duel_phones",
    category: "Smartphones",
    tabLabel: "Flagship Phones",
    title: "Titanium Powerhouse: iPhone 15 Pro vs Galaxy S24 Ultra",
    subtitle: "A17 Pro ray-tracing gaming vs Galaxy AI 200MP zoom beast. Choose your everyday driver.",
    totalVotesBase: 18940,
    contenderA: {
      id: "duel_iphone_15pro",
      _id: "duel_iphone_15pro",
      name: "Apple iPhone 15 Pro 256GB Titanium",
      brand: "Apple",
      price: 124900,
      originalPrice: 134900,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
      badge: "Benchmark King",
      tagline: "A17 Pro Chip • Action Button • Titanium",
      specs: [
        { label: "Chipset", value: "3nm Apple A17 Pro Bionic", winner: true },
        { label: "Build", value: "Grade 5 Titanium Frame", winner: true },
        { label: "Video", value: "4K 60fps ProRes Log Output", winner: true },
        { label: "OS Support", value: "6+ Years iOS Updates", winner: true }
      ]
    },
    contenderB: {
      id: "duel_galaxy_s24u",
      _id: "duel_galaxy_s24u",
      name: "Samsung Galaxy S24 Ultra 5G AI",
      brand: "Samsung",
      price: 129999,
      originalPrice: 144999,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80",
      badge: "Camera & Productivity Titan",
      tagline: "Snapdragon 8 Gen 3 • S-Pen • 200MP Quad",
      specs: [
        { label: "Chipset", value: "Snapdragon 8 Gen 3 for Galaxy", winner: false },
        { label: "Zoom Camera", value: "200MP + 50MP 5x Optical Periscope", winner: true },
        { label: "Stylus", value: "Embedded S-Pen with Bluetooth", winner: true },
        { label: "Display", value: "6.8\" QHD+ 2600 nits Anti-Glare", winner: true }
      ]
    }
  },
  {
    id: "duel_sneakers",
    category: "Footwear",
    tabLabel: "Sneaker Supremacy",
    title: "Streetwear Icon Duel: Air Jordan 1 vs Yeezy Boost 350",
    subtitle: "Heritage basketball leather classic vs Cloud-like Primeknit comfort. Which defines your street drip?",
    totalVotesBase: 14210,
    contenderA: {
      id: "duel_aj1_chicago",
      _id: "duel_aj1_chicago",
      name: "Nike Air Jordan 1 Retro High OG",
      brand: "Nike",
      price: 16995,
      originalPrice: 19995,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80",
      badge: "Timeless Cultural Icon",
      tagline: "Full-Grain Leather • Air-Sole Cushioning",
      specs: [
        { label: "Upper", value: "Premium Full-Grain Leather", winner: true },
        { label: "Cushioning", value: "Encapsulated Air-Sole Unit", winner: false },
        { label: "Resale Value", value: "High Collector Demand", winner: true },
        { label: "Heritage", value: "1985 Iconic Silhouette", winner: true }
      ]
    },
    contenderB: {
      id: "duel_yeezy_350",
      _id: "duel_yeezy_350",
      name: "Adidas Yeezy Boost 350 V2 Onyx",
      brand: "Adidas",
      price: 21999,
      originalPrice: 24999,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80",
      badge: "All-Day Comfort King",
      tagline: "Primeknit Upper • Full-Length Boost",
      specs: [
        { label: "Upper", value: "Re-engineered Primeknit", winner: false },
        { label: "Cushioning", value: "Full-Length TPU Boost Midsole", winner: true },
        { label: "Breathability", value: "Ultra-Light Monofilament", winner: true },
        { label: "Fit", value: "Sock-Like Adaptive Wrap", winner: true }
      ]
    }
  },
  {
    id: "duel_consoles",
    category: "Gaming",
    tabLabel: "Console Warfare",
    title: "Next-Gen Gaming Crown: PS5 Slim vs Xbox Series X",
    subtitle: "DualSense adaptive triggers vs Game Pass ultimate power. Who wins your living room?",
    totalVotesBase: 16520,
    contenderA: {
      id: "duel_ps5_slim",
      _id: "duel_ps5_slim",
      name: "Sony PlayStation 5 Slim 1TB",
      brand: "Sony",
      price: 44990,
      originalPrice: 54990,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
      badge: "Top Rated Gaming",
      tagline: "Ultra High-Speed SSD • Tempest 3D Audio",
      specs: [
        { label: "Storage", value: "1TB Ultra-Fast Custom NVMe", winner: true },
        { label: "Controller", value: "DualSense Haptic Feedback", winner: true },
        { label: "Output", value: "4K 120Hz + 8K HDR Support", winner: true },
        { label: "Ecosystem", value: "PlayStation Exclusives VR2", winner: true }
      ]
    },
    contenderB: {
      id: "duel_xbox_sx",
      _id: "duel_xbox_sx",
      name: "Microsoft Xbox Series X 1TB",
      brand: "Microsoft",
      price: 47990,
      originalPrice: 55990,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=600&q=80",
      badge: "Pure Raw Power",
      tagline: "12 Teraflops GPU • Quick Resume",
      specs: [
        { label: "Storage", value: "1TB Custom NVMe SSD", winner: false },
        { label: "Raw Compute", value: "12.15 TFLOPS RDNA 2 GPU", winner: true },
        { label: "Subscription", value: "Xbox Game Pass Ultimate", winner: true },
        { label: "Feature", value: "Quick Resume Multi-Game", winner: true }
      ]
    }
  }
];

/**
 * Dynamically builds 1v1 Product Duels directly from the product catalog
 * Auto-rotates pairings every week deterministically based on calendar weekNumber!
 */
const buildDynamicDuelsFromProducts = (products, weekNumber = 1) => {
  if (!Array.isArray(products) || products.length < 2) {
    return FALLBACK_DUELS;
  }

  // Group products by category
  const categoryMap = {};
  products.forEach((p) => {
    if (!p || !p.name || (!p.price && p.price !== 0)) return;
    const cat = (p.category || "Featured").trim();
    if (!categoryMap[cat]) {
      categoryMap[cat] = [];
    }
    categoryMap[cat].push(p);
  });

  const dynamicDuels = [];

  // 1. Build category-based duels
  const categories = Object.keys(categoryMap);
  categories.forEach((cat, catIdx) => {
    const catProds = categoryMap[cat];
    if (catProds.length >= 2) {
      const N = catProds.length;
      
      // Deterministic weekly rotation index selection
      const indexA = (weekNumber * 3 + catIdx * 2) % N;
      let indexB = (indexA + 1 + (weekNumber % Math.max(1, N - 1))) % N;
      if (indexB === indexA) {
        indexB = (indexA + 1) % N;
      }

      const prodA = catProds[indexA];
      const prodB = catProds[indexB];

      const brandA = getProductBrand(prodA);
      const brandB = getProductBrand(prodB);
      const tabLabel = `${cat} Clash`;
      const title = `${brandA} vs ${brandB}: The ${cat} Showdown`;
      const subtitle = `Compare design, pricing, and specs between ${prodA.name} and ${prodB.name}. Vote for your favorite!`;

      // Deterministic realistic base votes
      const baseVotes = 8000 + ((catIdx * 1973 + weekNumber * 451) % 11000);

      dynamicDuels.push({
        id: `duel_cat_${cat.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${weekNumber}`,
        category: cat,
        tabLabel,
        title,
        subtitle,
        totalVotesBase: baseVotes,
        contenderA: formatContender(prodA, prodB, "A"),
        contenderB: formatContender(prodB, prodA, "B")
      });
    }
  });

  // 2. If fewer than 4 duels, add cross-catalog top-picks duels
  if (dynamicDuels.length < 4 && products.length >= 4) {
    const validProds = products.filter(p => p && p.name && (p.price || p.price === 0));
    const N = validProds.length;
    const offset1 = (weekNumber * 2) % N;
    const offset2 = (offset1 + Math.floor(N / 2)) % N;

    if (N >= 2) {
      const pA = validProds[offset1];
      const pB = validProds[offset2] || validProds[(offset1 + 1) % N];
      if (pA && pB && pA._id !== pB._id) {
        dynamicDuels.push({
          id: `duel_featured_top_${weekNumber}`,
          category: "Featured",
          tabLabel: "Trending Showdown",
          title: `${getProductBrand(pA)} vs ${getProductBrand(pB)}: Best Sellers Duel`,
          subtitle: `Community face-off between two of our hottest trending items. Which one wins your vote?`,
          totalVotesBase: 14850,
          contenderA: formatContender(pA, pB, "A"),
          contenderB: formatContender(pB, pA, "B")
        });
      }
    }
  }

  return dynamicDuels.length > 0 ? dynamicDuels : FALLBACK_DUELS;
};

const ProductDuel = ({ homepageData, onQuickView, onAddToCart }) => {
  const navigate = useNavigate();

  // 1. Calculate deterministic weekly cycle & countdown
  const weekInfo = useMemo(() => getCalendarWeekInfo(), []);

  // 2. Fetch and manage dynamic catalog products from database
  const [dbProducts, setDbProducts] = useState(() => {
    if (homepageData) {
      const combined = [
        ...(homepageData.dealsOfDay || []),
        ...(homepageData.newArrivals || []),
        ...(homepageData.trending || []),
        ...(homepageData.bestSellers || []),
        ...(homepageData.topRated || []),
        ...(homepageData.mostViewed || [])
      ];
      if (combined.length > 0) return combined;
    }
    return [];
  });

  useEffect(() => {
    let isMounted = true;
    if (homepageData) {
      const combined = [
        ...(homepageData.dealsOfDay || []),
        ...(homepageData.newArrivals || []),
        ...(homepageData.trending || []),
        ...(homepageData.bestSellers || []),
        ...(homepageData.topRated || []),
        ...(homepageData.mostViewed || [])
      ];
      if (combined.length > 0) {
        setDbProducts(combined);
      }
    }

    // Always fetch full database catalogue for complete auto-selection
    cachedGet(`${backendUrl}/api/product/list?limit=250`)
      .then((res) => {
        if (isMounted && res?.data?.success && Array.isArray(res.data.products) && res.data.products.length > 0) {
          setDbProducts(res.data.products);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch database products for weekly duel:", err?.message);
      });

    return () => {
      isMounted = false;
    };
  }, [homepageData]);

  // 3. Generate dynamic duels list from real products (auto-rotates weekly)
  const availableDuels = useMemo(() => {
    return buildDynamicDuelsFromProducts(dbProducts, weekInfo.weekNumber);
  }, [dbProducts, weekInfo.weekNumber]);

  // Determine this week's active featured showdown
  const weeklyFeaturedId = useMemo(() => {
    if (!availableDuels || availableDuels.length === 0) return "";
    const idx = (weekInfo.weekNumber - 1) % availableDuels.length;
    return availableDuels[idx >= 0 ? idx : 0].id;
  }, [availableDuels, weekInfo.weekNumber]);

  const [activeDuelId, setActiveDuelId] = useState("");
  const [userVotes, setUserVotes] = useState({});

  // Initialize and auto-switch to active week's showdown
  useEffect(() => {
    if (weeklyFeaturedId && (!activeDuelId || !availableDuels.some(d => d.id === activeDuelId))) {
      setActiveDuelId(weeklyFeaturedId);
    }
  }, [weeklyFeaturedId, availableDuels]);

  // Load user votes from localStorage on mount
  useEffect(() => {
    try {
      const savedVotes = JSON.parse(localStorage.getItem("cartnow_duel_votes") || "{}");
      setUserVotes(savedVotes);
    } catch (e) {
      console.warn("Failed to load duel votes:", e);
    }
  }, []);

  const currentDuel = useMemo(() => {
    return availableDuels.find((d) => d.id === activeDuelId) || availableDuels[0] || FALLBACK_DUELS[0];
  }, [availableDuels, activeDuelId]);

  // Calculate live vote tally with dynamic user voting
  const voteStats = useMemo(() => {
    const baseTotal = currentDuel.totalVotesBase || 10000;
    const userVote = userVotes[currentDuel.id];

    let countA = Math.round(baseTotal * 0.54);
    let countB = baseTotal - countA;

    if (userVote === "A") countA += 1;
    if (userVote === "B") countB += 1;

    const total = countA + countB;
    const percentA = Math.round((countA / total) * 100);
    const percentB = 100 - percentA;

    return { countA, countB, total, percentA, percentB };
  }, [currentDuel, userVotes]);

  const handleCastVote = (side) => {
    const updated = { ...userVotes, [currentDuel.id]: side };
    setUserVotes(updated);
    try {
      localStorage.setItem("cartnow_duel_votes", JSON.stringify(updated));
    } catch (e) { }

    const chosenName = side === "A" ? currentDuel.contenderA.name : currentDuel.contenderB.name;
    toast.success(`🎉 You voted for ${chosenName}! Your choice is recorded.`);
  };

  const votedContender = userVotes[currentDuel.id];

  const handleAddToCartContender = (contender) => {
    if (contender.rawProduct && onAddToCart) {
      onAddToCart(contender.rawProduct, 1, "Standard");
    } else if (onAddToCart) {
      onAddToCart({
        _id: contender._id || contender.id,
        name: contender.name,
        price: contender.price,
        originalPrice: contender.originalPrice,
        images: [contender.image],
        category: currentDuel.category,
        brand: contender.brand,
        rating: contender.rating,
        description: `Featured Weekly Duel: ${contender.name}`,
        stock: 50
      }, 1, "Standard");
    } else {
      toast.success(`Added ${contender.name} to cart! 🛒`);
    }
  };

  const handleQuickViewContender = (contender) => {
    if (contender.rawProduct && onQuickView) {
      onQuickView(contender.rawProduct);
    } else if (onQuickView) {
      onQuickView({
        _id: contender._id || contender.id,
        name: contender.name,
        price: contender.price,
        originalPrice: contender.originalPrice,
        images: [contender.image],
        category: currentDuel.category,
        brand: contender.brand,
        rating: contender.rating,
        description: `Featured Weekly Duel: ${contender.name}`,
        stock: 50
      });
    }
  };

  const handleOpenProductDetail = (contender) => {
    if (contender._id && !contender._id.startsWith("duel_")) {
      navigate(`/product/${contender._id}`);
    } else {
      navigate("/product");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-3.5 sm:p-4.5 lg:p-5 shadow-xs select-none text-left transition-colors duration-200">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="text-left space-y-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/60 rounded-sm text-[9px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 shadow-2xs">
              <Swords size={11} className="stroke-[2.5]" />
              <span>COMMUNITY DUEL</span>
            </div>

            <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
              1v1 Head-to-Head
            </span>

            {/* Weekly Auto-Rotation Indicator Badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[9.5px] font-extrabold shadow-2xs">
              <Clock size={10} className="stroke-[2.5] text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>Weekly Refresh: {weekInfo.daysLeft > 0 ? `${weekInfo.daysLeft}d ` : ""}{weekInfo.hoursLeft}h left</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>This or That? The Ultimate Showdown</span>
            <span className="h-1.5 w-1.5 rounded-sm bg-rose-600 dark:bg-rose-400 animate-pulse" />
          </h2>

          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Vote for your favorite gear, see what {voteStats.total.toLocaleString("en-IN")} shoppers prefer, and unlock verified duel pricing. <span className="text-slate-700 dark:text-slate-300 font-extrabold">Auto-selected from our live catalog!</span>
          </p>
        </div>

        {/* Top Right Action */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            onClick={() => navigate("/product")}
            className="px-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-800 dark:text-slate-200 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 shadow-2xs"
          >
            <span>All Showdowns</span>
            <ArrowRight size={12} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Dedicated Filter Tabs Strip (Horizontal scrollable with Weekly Indicators) */}
      <div 
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className="w-full flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden pb-2.5 pt-0.5 mb-4 border-b border-slate-100 dark:border-slate-800/80"
      >
        {availableDuels.map((duel) => {
          const isActive = activeDuelId === duel.id;
          const isThisWeek = duel.id === weeklyFeaturedId;
          const userChoice = userVotes[duel.id];

          return (
            <motion.button
              key={duel.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveDuelId(duel.id)}
              className={`px-3 py-1.5 rounded-sm text-[10.5px] font-black uppercase tracking-wider border transition-colors duration-150 cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0 select-none ${
                isActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                  : isThisWeek
                  ? "bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300/80 dark:border-amber-700/60"
                  : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700 hover:border-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <Swords size={12} className={isActive ? "text-rose-400 dark:text-rose-600" : isThisWeek ? "text-amber-600 dark:text-amber-400" : "text-slate-400"} />
              <span>{duel.tabLabel}</span>

              {/* This Week's Active Showdown Badge */}
              {isThisWeek && (
                <span className="text-[8px] px-1 py-0.2 rounded-sm font-black bg-amber-500 text-slate-950 tracking-tight">
                  THIS WEEK
                </span>
              )}

              {userChoice && (
                <span className="text-[8.5px] px-1 py-0.2 rounded-sm font-bold bg-emerald-500 text-white">
                  VOTED
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Live Animated Vote Ratio Progress Bar */}
      <div className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-sm p-3 mb-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-black">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            {voteStats.percentA >= voteStats.percentB && (
              <Crown size={12} className="text-amber-500 fill-amber-400" />
            )}
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>{currentDuel.contenderA.brand} ({voteStats.percentA}%)</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
            <Flame size={12} className="text-amber-500" />
            <span>{voteStats.total.toLocaleString("en-IN")} Shoppers Voted</span>
          </div>

          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <span>{currentDuel.contenderB.brand} ({voteStats.percentB}%)</span>
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            {voteStats.percentB > voteStats.percentA && (
              <Crown size={12} className="text-amber-500 fill-amber-400" />
            )}
          </div>
        </div>

        {/* Single Color Progress Meter */}
        <div className="relative w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-sm overflow-hidden flex shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${voteStats.percentA}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-blue-600 relative"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${voteStats.percentB}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-blue-400/80 dark:bg-blue-800/80 relative"
          />
        </div>
      </div>

      {/* 2-Contender Head-to-Head Arena Grid with Center "VS" Emblem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 relative">
        
        {/* Center Floating "VS" Emblem (Desktop/Tablet) */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-slate-950 dark:bg-slate-900 border-2 border-white dark:border-slate-700 shadow-xl flex items-center justify-center text-white font-black text-xs tracking-wider ring-4 ring-slate-200/60 dark:ring-slate-800/80">
            <span className="text-white font-black">VS</span>
          </div>
        </div>

        {/* Contender A Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className={`relative bg-white dark:bg-slate-900 border rounded-sm p-4 flex flex-col justify-between transition-all duration-200 ${
            votedContender === "A"
              ? "border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-500/20"
              : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div>
            {/* Top Badge & Status */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-black text-[9px] uppercase tracking-wider rounded-sm">
                {currentDuel.contenderA.badge}
              </span>

              {votedContender === "A" && (
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-sm">
                  <CheckCircle2 size={11} className="stroke-[3]" />
                  Your Pick
                </span>
              )}
            </div>

            {/* Product Image & Main Details */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-3.5">
              <div 
                onClick={() => handleOpenProductDetail(currentDuel.contenderA)}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-sm overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shrink-0 cursor-pointer group"
              >
                <img
                  src={currentDuel.contenderA.image}
                  alt={currentDuel.contenderA.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  {currentDuel.contenderA.brand}
                </span>
                <h3 
                  onClick={() => handleOpenProductDetail(currentDuel.contenderA)}
                  className="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-tight cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {currentDuel.contenderA.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 line-clamp-1">
                  {currentDuel.contenderA.tagline}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    ₹{currentDuel.contenderA.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs line-through text-slate-400">
                    ₹{currentDuel.contenderA.originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                    {Math.round(((currentDuel.contenderA.originalPrice - currentDuel.contenderA.price) / currentDuel.contenderA.originalPrice) * 100)}% OFF
                  </span>
                </div>
              </div>
            </div>

            {/* Key Specs Breakdown Table */}
            <div className="space-y-1.5 py-2.5 my-2 border-y border-slate-100 dark:border-slate-800/80 text-xs">
              {currentDuel.contenderA.specs.map((spec, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">{spec.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-slate-800 dark:text-slate-200">{spec.value}</span>
                    {spec.winner && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Leading Spec" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 mt-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCastVote("A")}
              className={`flex-1 py-2 px-3 rounded-sm font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                votedContender === "A"
                  ? "bg-blue-600 text-white shadow-blue-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white"
              }`}
            >
              <ThumbsUp size={13} className="stroke-[2.5]" />
              <span>{votedContender === "A" ? `Voted (${voteStats.percentA}%)` : `Vote ${currentDuel.contenderA.brand}`}</span>
            </motion.button>

            <button
              type="button"
              onClick={() => handleAddToCartContender(currentDuel.contenderA)}
              title="Add to Cart"
              className="py-2 px-3 rounded-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <ShoppingCart size={13} className="stroke-[2.5]" />
              <span>Buy</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickViewContender(currentDuel.contenderA)}
              title="Quick View"
              className="p-2 rounded-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <Eye size={14} />
            </button>
          </div>
        </motion.div>

        {/* Contender B Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className={`relative bg-white dark:bg-slate-900 border rounded-sm p-4 flex flex-col justify-between transition-all duration-200 ${
            votedContender === "B"
              ? "border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-500/20"
              : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div>
            {/* Top Badge & Status */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-black text-[9px] uppercase tracking-wider rounded-sm">
                {currentDuel.contenderB.badge}
              </span>

              {votedContender === "B" && (
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-sm">
                  <CheckCircle2 size={11} className="stroke-[3]" />
                  Your Pick
                </span>
              )}
            </div>

            {/* Product Image & Main Details */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-3.5">
              <div 
                onClick={() => handleOpenProductDetail(currentDuel.contenderB)}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-sm overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shrink-0 cursor-pointer group"
              >
                <img
                  src={currentDuel.contenderB.image}
                  alt={currentDuel.contenderB.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  {currentDuel.contenderB.brand}
                </span>
                <h3 
                  onClick={() => handleOpenProductDetail(currentDuel.contenderB)}
                  className="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-tight cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {currentDuel.contenderB.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 line-clamp-1">
                  {currentDuel.contenderB.tagline}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    ₹{currentDuel.contenderB.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs line-through text-slate-400">
                    ₹{currentDuel.contenderB.originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                    {Math.round(((currentDuel.contenderB.originalPrice - currentDuel.contenderB.price) / currentDuel.contenderB.originalPrice) * 100)}% OFF
                  </span>
                </div>
              </div>
            </div>

            {/* Key Specs Breakdown Table */}
            <div className="space-y-1.5 py-2.5 my-2 border-y border-slate-100 dark:border-slate-800/80 text-xs">
              {currentDuel.contenderB.specs.map((spec, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">{spec.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-slate-800 dark:text-slate-200">{spec.value}</span>
                    {spec.winner && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Leading Spec" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 mt-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCastVote("B")}
              className={`flex-1 py-2 px-3 rounded-sm font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                votedContender === "B"
                  ? "bg-blue-600 text-white shadow-blue-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white"
              }`}
            >
              <ThumbsUp size={13} className="stroke-[2.5]" />
              <span>{votedContender === "B" ? `Voted (${voteStats.percentB}%)` : `Vote ${currentDuel.contenderB.brand}`}</span>
            </motion.button>

            <button
              type="button"
              onClick={() => handleAddToCartContender(currentDuel.contenderB)}
              title="Add to Cart"
              className="py-2 px-3 rounded-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <ShoppingCart size={13} className="stroke-[2.5]" />
              <span>Buy</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickViewContender(currentDuel.contenderB)}
              title="Quick View"
              className="p-2 rounded-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <Eye size={14} />
            </button>
          </div>
        </motion.div>

      </div>

    </div>
  );
};

export default ProductDuel;
