import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles,
  Flame,
  Award,
  TrendingUp,
  Cpu,
  ShoppingBag,
  ArrowRight,
  ShoppingCart,
  Eye,
  Heart,
  Star,
  Laptop,
  Smartphone,
  Watch,
  Headphones,
  Camera,
  Shirt,
  Glasses,
  Luggage,
  Utensils,
  Tv,
  ChefHat,
  Wind,
  Home,
  UtensilsCrossed,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { backendUrl } from "../config";
import { ProductGridSkeleton } from "../components/SkeletonLoader";

const Discover = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  
  // Database taxonomy states
  const [dbCategories, setDbCategories] = useState([]);
  const [dbCollections, setDbCollections] = useState([]);
  const [dbBrands, setDbBrands] = useState([]);

  const getBrandStyles = (name) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const styles = [
      { color: "bg-slate-900 border-slate-800 text-white" },
      { color: "bg-[#1E3A8A] border-[#1E40AF]/30 text-white" },
      { color: "bg-[#1E293B] border-slate-800 text-white" },
      { color: "bg-slate-950 border-slate-800 text-white" },
      { color: "bg-[#991B1B] border-[#B91C1C]/30 text-white" },
      { color: "bg-[#D97706] border-[#EA580C]/30 text-white" },
      { color: "bg-[#7F1D1D] border-red-950 text-white" },
      { color: "bg-[#0F172A] border-slate-800 text-white" }
    ];
    return styles[hash % styles.length];
  };
  
  // Active states for filters - initialized from URL parameters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") || "All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedDiscount, setSelectedDiscount] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  
  // Recommended Active Tab
  const [activeRecommendedTab, setActiveRecommendedTab] = useState("foryou");

  // Sync state with URL query parameters when they change
  useEffect(() => {
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");

    if (category !== null) setSelectedCategory(category);
    if (brand !== null) setSelectedBrand(brand);
    if (search !== null) setSearchQuery(search);
  }, [searchParams]);

  // Update URL search parameters when local state changes
  useEffect(() => {
    const params = {};
    if (selectedCategory && selectedCategory !== "All") params.category = selectedCategory;
    if (selectedBrand && selectedBrand !== "All") params.brand = selectedBrand;
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedBrand, searchQuery]);

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState(null); // 'brand' | 'price' | 'rating' | 'availability' | 'discount'

  // Curated database fallback
  const curatedProducts = useMemo(() => [
    {
      _id: "mock_eb_1",
      name: "boAt Airdopes 141 Wireless Earbuds",
      price: 1299,
      originalPrice: 2990,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
      brand: "boAt",
      category: "electronics",
      stock: 15,
      sizes: ["Standard"],
      rating: 4.5,
      reviewCount: 45,
      isBestSeller: true,
      specs: "8mm Drivers • 42h Playback"
    },
    {
      _id: "mock_watch_1",
      name: "Skagen Dress Watch Minimalist Edition",
      price: 3965,
      originalPrice: 7999,
      image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
      brand: "Skagen",
      category: "fashion",
      stock: 8,
      sizes: ["Standard"],
      rating: 4.6,
      reviewCount: 32,
      isTopRated: true,
      specs: "Leather Strap • 3ATM Water Resistant"
    },
    {
      _id: "mock_shoes_1",
      name: "Nike Air Max Sports Sneakers",
      price: 4999,
      originalPrice: 7999,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      brand: "Nike",
      category: "sports",
      stock: 5,
      sizes: ["8", "9", "10"],
      rating: 4.8,
      reviewCount: 120,
      isAiPick: true,
      specs: "Mesh Knit • Air Cushion Sole"
    },
    {
      _id: "mock_bag_1",
      name: "Urban Explorer Travel Backpack",
      price: 1899,
      originalPrice: 3499,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
      brand: "Wildcraft",
      category: "fashion",
      stock: 12,
      sizes: ["Standard"],
      rating: 4.4,
      reviewCount: 54,
      isNewArrival: true,
      specs: "Waterproof Nylon • 30L Capacity"
    },
    {
      _id: "mock_perf_1",
      name: "Signature Blue Premium Eau de Parfum",
      price: 999,
      originalPrice: 1999,
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80",
      brand: "Park Avenue",
      category: "beauty",
      stock: 20,
      sizes: ["55ml", "100ml"],
      rating: 4.7,
      reviewCount: 88,
      isBestSeller: true,
      specs: "Long Lasting • Woody Aquatic Note"
    },
    {
      _id: "mock_airpods",
      name: "Apple AirPods Pro (2nd Gen)",
      price: 24900,
      originalPrice: 26900,
      image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
      brand: "Apple",
      category: "electronics",
      stock: 10,
      sizes: ["Standard"],
      rating: 4.9,
      reviewCount: 195,
      isAiPick: true,
      specs: "H2 Chip • Active Noise Cancellation"
    },
    {
      _id: "mock_iphone",
      name: "iPhone 15 Pro Max (256 GB)",
      price: 144900,
      originalPrice: 159900,
      image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80",
      brand: "Apple",
      category: "electronics",
      stock: 4,
      sizes: ["128GB", "256GB"],
      rating: 4.9,
      reviewCount: 340,
      isNewArrival: true,
      specs: "A17 Pro Chip • Telephoto Camera"
    },
    {
      _id: "mock_macbook",
      name: "MacBook Air M2 (13-inch, 8GB RAM)",
      price: 89990,
      originalPrice: 114900,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
      brand: "Apple",
      category: "electronics",
      stock: 6,
      sizes: ["256GB", "512GB"],
      rating: 4.8,
      reviewCount: 220,
      isTopRated: true,
      specs: "Liquid Retina Display • Fanless Design"
    }
  ], []);

  // Fetch initial data
  useEffect(() => {
    setLoading(true);
    axios.get(`${backendUrl}/api/product/list`)
      .then(res => {
        if (res.data.success && res.data.products?.length > 0) {
          // Merge dynamic specs if not present
          const enhanced = res.data.products.map((p, idx) => ({
            ...p,
            specs: p.specs || (idx % 2 === 0 ? "Premium Quality • High Rated" : "Best-Seller Choice"),
            isBestSeller: idx % 4 === 0,
            isTopRated: idx % 4 === 1,
            isAiPick: idx % 4 === 2,
            isNewArrival: idx % 4 === 3
          }));
          setAllProducts(enhanced);
        } else {
          setAllProducts(curatedProducts);
        }
      })
      .catch(() => {
        setAllProducts(curatedProducts);
      })
      .finally(() => {
        setTimeout(() => setLoading(false), 500); // Faux loader delay for skeleton experience
      });

    // Fetch dynamic categories
    axios.get(`${backendUrl}/api/product/categories`)
      .then(res => {
        if (res.data.success) {
          setDbCategories(res.data.categories);
        }
      })
      .catch(err => console.error("Failed to load categories in Discover:", err));

    // Fetch dynamic collections
    axios.get(`${backendUrl}/api/product/collections`)
      .then(res => {
        if (res.data.success) {
          setDbCollections(res.data.collections);
        }
      })
      .catch(err => console.error("Failed to load collections in Discover:", err));

    // Fetch dynamic brands
    axios.get(`${backendUrl}/api/product/brands`)
      .then(res => {
        if (res.data.success) {
          setDbBrands(res.data.brands);
        }
      })
      .catch(err => console.error("Failed to load brands in Discover:", err));

    // Load wishlist
    try {
      const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlist(saved);
    } catch (e) { }
  }, [curatedProducts]);

  // Wishlist toggle
  const onToggleFavorite = async (id) => {
    const token = localStorage.getItem("token") || "";
    if (token) {
      try {
        const res = await axios.post(
          `${backendUrl}/api/wishlist/toggle`,
          { productId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          const updated = res.data.wishlist || [];
          setWishlist(updated);
          localStorage.setItem("wishlist", JSON.stringify(updated));
          toast.success("Wishlist updated! ❤️");
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      let updated = [...wishlist];
      const idx = updated.indexOf(id);
      if (idx === -1) {
        updated.push(id);
        toast.success("Added to wishlist! ❤️");
      } else {
        updated.splice(idx, 1);
        toast.success("Removed from wishlist");
      }
      setWishlist(updated);
      localStorage.setItem("wishlist", JSON.stringify(updated));
    }
  };

  const [addingIds, setAddingIds] = useState({});

  // Add to cart
  const onAddToCart = async (product, qty = 1, size = "Standard") => {
    if (!product || addingIds[product._id]) return;
    const token = localStorage.getItem("token") || "";
    if (product.stock === 0) return;

    let guestCart = {};
    try {
      guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
    } catch (err) {}

    // Only check guest localStorage if user is not logged in
    if (!token) {
      const keyPrefix = `${product._id}_`;
      let alreadyInCart = false;
      for (const k in guestCart) {
        if ((k === `${product._id}_${size}` || k.startsWith(keyPrefix)) && guestCart[k] > 0) {
          alreadyInCart = true;
          break;
        }
      }

      if (alreadyInCart) {
        toast.info("Product is already in your cart");
        navigate("/cart");
        return;
      }
    }

    // Lock button & set loading state
    setAddingIds(prev => ({ ...prev, [product._id]: true }));

    if (!token) {
      guestCart[`${product._id}_${size}`] = qty || 1;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      window.dispatchEvent(new Event("cartUpdate"));
      toast.success("Added to cart! 🛍️");
      setAddingIds(prev => ({ ...prev, [product._id]: false }));
      navigate("/cart");
    } else {
      try {
        const res = await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId: product._id, size, qty: qty || 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          window.dispatchEvent(new Event("cartUpdate"));
          toast.success("Added to cart! 🛍️");
          setAddingIds(prev => ({ ...prev, [product._id]: false }));
          navigate("/cart");
        } else {
          toast.error(res.data.message || "Failed to add to cart");
          setAddingIds(prev => ({ ...prev, [product._id]: false }));
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error adding to cart");
        setAddingIds(prev => ({ ...prev, [product._id]: false }));
      }
    }
  };

  // DYNAMIC COLLECTIONS LIST
  const collectionsData = useMemo(() => {
    if (dbCollections.length === 0) {
      return [
        { id: "electronics", title: "Electronics Collection", subtitle: "Curated shopping experiences.", count: "1,250 Products", growth: "+24% Growth", tag: "🔥 Trending", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80" },
        { id: "fashion", title: "Fashion Lookbook", subtitle: "Curated shopping experiences.", count: "890 Products", growth: "+18% Growth", tag: "✨ New Style", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&auto=format&fit=crop&q=80" },
        { id: "beauty", title: "Beauty Secrets", subtitle: "Curated shopping experiences.", count: "670 Products", growth: "+12% Growth", tag: "💎 Luxury", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&auto=format&fit=crop&q=80" }
      ];
    }
    return dbCollections.map(col => ({
      id: col.slug,
      title: col.name,
      subtitle: col.description || "Curated shopping experiences.",
      count: `${col.count || 0} Products`,
      growth: "+15% Growth",
      tag: "🔥 Collection",
      image: col.banner || "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&auto=format&fit=crop&q=80"
    }));
  }, [dbCollections]);

  // DYNAMIC CATEGORIES LIST
  const categoriesData = useMemo(() => {
    if (dbCategories.length === 0) {
      return [
        { name: "Electronics", count: "1,450 Products", growth: "+24%", tag: "🔥 Trending", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&auto=format&fit=crop&q=80" },
        { name: "Fashion", count: "890 Products", growth: "+18%", tag: "👔 Stylish", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&auto=format&fit=crop&q=80" },
        { name: "Beauty", count: "670 Products", growth: "+12%", tag: "💄 Glamour", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&auto=format&fit=crop&q=80" }
      ];
    }
    return dbCategories.map(cat => ({
      name: cat.name,
      count: `${cat.count || 0} Products`,
      growth: cat.growth || "+12%",
      tag: cat.isFeatured ? "🔥 Featured" : "✨ Curated",
      img: cat.bannerImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80"
    }));
  }, [dbCategories]);

  // DYNAMIC BRANDS LIST
  const brandsData = useMemo(() => {
    if (dbBrands.length === 0) {
      return [
        { name: "Apple", count: "1,250 Products", rating: "4.9", discount: "Up To 40% Off", logo: "", banner: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&auto=format&fit=crop&q=80", color: "bg-slate-900 border-slate-800 text-white" },
        { name: "Samsung", count: "1,180 Products", rating: "4.8", discount: "Up To 30% Off", logo: "SAMSUNG", banner: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&auto=format&fit=crop&q=80", color: "bg-blue-900 border-blue-800 text-white" },
        { name: "Nike", count: "890 Products", rating: "4.7", discount: "Up To 25% Off", logo: "NIKE", banner: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80", color: "bg-neutral-900 border-slate-800 text-white" }
      ];
    }
    return dbBrands.map(brand => {
      const styles = getBrandStyles(brand.name);
      return {
        name: brand.name,
        count: `${brand.count || 0} Products`,
        rating: brand.rating || "4.8",
        discount: "Authorized",
        logo: brand.name,
        banner: brand.logo || brand.banner || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80",
        color: styles.color
      };
    });
  }, [dbBrands]);

  const categoryPillsList = useMemo(() => {
    if (dbCategories.length > 0) {
      return ["All", ...dbCategories.map(c => c.name)];
    }
    return ["All", "Electronics", "Fashion", "Beauty", "Sports", "Furniture", "Books"];
  }, [dbCategories]);

  const brandOptionsList = useMemo(() => {
    if (dbBrands.length > 0) {
      return ["All", ...dbBrands.map(b => b.name)];
    }
    return ["All", "Apple", "Samsung", "Nike", "Adidas", "boAt"];
  }, [dbBrands]);

  // INTELLECTUAL DYNAMIC FILTERING & SMART SEARCH
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // 1. Smart Search matching query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(query);
        const matchesBrand = product.brand?.toLowerCase().includes(query);
        const matchesCategory = product.category?.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesCategory) return false;
      }

      // 2. Global category pill selection
      if (selectedCategory !== "All") {
        if (product.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // 3. Dropdown Brand selection
      if (selectedBrand !== "All") {
        if (product.brand?.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      }

      // 4. Dropdown Price range matching
      if (selectedPrice !== "All") {
        const val = product.price;
        if (selectedPrice === "under-500") { if (val >= 500) return false; }
        else if (selectedPrice === "500-2000") { if (val < 500 || val > 2000) return false; }
        else if (selectedPrice === "2000-5000") { if (val < 2000 || val > 5000) return false; }
        else if (selectedPrice === "above-5000") { if (val <= 5000) return false; }
      }

      // 5. Dropdown Rating matching
      if (selectedRating !== "All") {
        const ratingVal = Number(typeof product.rating === 'object' && product.rating ? product.rating.average : (product.rating || 4.5));
        if (selectedRating === "4plus" && ratingVal < 4.0) return false;
        if (selectedRating === "4.5plus" && ratingVal < 4.5) return false;
      }

      // 6. Dropdown Availability matching
      if (selectedAvailability !== "All") {
        if (selectedAvailability === "instock" && product.stock === 0) return false;
      }

      // 7. Dropdown Discount matching
      if (selectedDiscount !== "All") {
        const originalVal = product.originalPrice || Math.round(product.price * 1.25);
        const discountVal = Math.round(((originalVal - product.price) / originalVal) * 100);
        if (selectedDiscount === "10plus" && discountVal < 10) return false;
        if (selectedDiscount === "25plus" && discountVal < 25) return false;
      }

      return true;
    });
  }, [allProducts, searchQuery, selectedCategory, selectedBrand, selectedPrice, selectedRating, selectedAvailability, selectedDiscount]);

  // Dynamically update sub-sections based on category or search
  const displayCollections = useMemo(() => {
    if (selectedCategory === "All") return collectionsData;
    return collectionsData.filter(c => c.id.toLowerCase() === selectedCategory.toLowerCase() || selectedCategory.toLowerCase().includes(c.id.toLowerCase()));
  }, [selectedCategory, collectionsData]);

  const displayCategories = useMemo(() => {
    if (selectedCategory === "All") return categoriesData;
    return categoriesData.filter(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
  }, [selectedCategory, categoriesData]);

  const displayBrands = useMemo(() => {
    if (selectedCategory === "All") return brandsData;
    const brandsInCat = allProducts
      .filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase())
      .map(p => p.brand?.toLowerCase());
    
    if (brandsInCat.length > 0) {
      return brandsData.filter(b => brandsInCat.includes(b.name.toLowerCase()));
    }
    return brandsData;
  }, [selectedCategory, brandsData, allProducts]);

  // Recommended Products Tab filter
  const displayRecommended = useMemo(() => {
    if (activeRecommendedTab === "trending") {
      return filteredProducts.slice().sort((a, b) => {
        const rB = typeof b.rating === 'object' && b.rating ? b.rating.average : (b.rating || 0);
        const rA = typeof a.rating === 'object' && a.rating ? a.rating.average : (a.rating || 0);
        return rB - rA;
      }).slice(0, 4);
    }
    if (activeRecommendedTab === "rated") {
      return filteredProducts.filter(p => {
        const rVal = typeof p.rating === 'object' && p.rating ? p.rating.average : (p.rating || 0);
        return rVal >= 4.5;
      }).slice(0, 4);
    }
    if (activeRecommendedTab === "arrivals") {
      return filteredProducts
        .slice()
        .sort((a, b) => {
          const tA = a.date ? new Date(a.date).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const tB = b.date ? new Date(b.date).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return tB - tA;
        })
        .slice(0, 4);
    }
    return filteredProducts.slice(0, 4);
  }, [filteredProducts, activeRecommendedTab]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (selectedBrand !== "All") count++;
    if (selectedPrice !== "All") count++;
    if (selectedRating !== "All") count++;
    if (selectedDiscount !== "All") count++;
    if (selectedAvailability !== "All") count++;
    return count;
  }, [selectedCategory, selectedBrand, selectedPrice, selectedRating, selectedDiscount, selectedAvailability]);

  const resetAllFilters = () => {
    setSelectedCategory("All");
    setSelectedBrand("All");
    setSelectedPrice("All");
    setSelectedRating("All");
    setSelectedDiscount("All");
    setSelectedAvailability("All");
    setSearchQuery("");
    toast.success("Filters reset successfully!");
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-slate-950 min-h-screen pb-20 select-none text-left font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. PREMIUM HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 px-6 sm:px-12 lg:px-20 py-20 lg:py-28 border-b border-slate-200/40 dark:border-slate-800/40">
        {/* Glow Blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute -bottom-10 -right-20 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest">
              <Sparkles size={12} className="fill-current animate-pulse" />
              AI-Powered Personalization
            </span>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-none text-slate-900 dark:text-white">
              Discover Everything <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                You Love
              </span>
            </h1>
            <p className="text-base sm:text-lg font-bold text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
              Explore dynamic collections, premium brands, and handpicked product categories curated tailored exactly to your unique preferences.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  const el = document.getElementById("search-anchor");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-slate-100 dark:text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all duration-200 border-none cursor-pointer"
              >
                Explore Now
              </button>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setActiveRecommendedTab("trending");
                  const el = document.getElementById("recommended-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-sm active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Trending Today
              </button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200/50 dark:border-slate-800/60">
              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">500K+</p>
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mt-1">Products Available</p>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">50K+</p>
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mt-1">Happy Customers</p>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">1000+</p>
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mt-1">Global Brands</p>
              </div>
            </div>
          </div>

          {/* Side visual banner */}
          <div className="hidden lg:block relative justify-self-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-[380px] rounded-[32px] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-2xl relative"
            >
              {/* Blur accent */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-purple-500/5 pointer-events-none" />

              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 border border-slate-100 dark:border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=80"
                  alt="Feature Visual"
                  className="max-h-[90%] max-w-[90%] object-contain"
                />
              </div>
              <div className="mt-4 text-left">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Top AI Pick</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">98% Match</span>
                </div>
                <h3 className="font-extrabold text-[15px] text-slate-800 dark:text-white">AirPods Pro Minimalist</h3>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Rs. 24,900 • Apple Store</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. GLOBAL SMART SEARCH & FILTERS */}
      <div id="search-anchor" className="sticky top-[79px] z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-4 flex flex-col gap-3">
          
          {/* Search bar */}
          <div className="relative w-full flex items-center">
            <Search className="absolute left-4.5 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, categories, brands, collections..."
              className="w-full pl-12 pr-10 py-3.5 bg-slate-100/75 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 dark: transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4.5 p-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 transition"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Sticky horizontal filters strip */}
          <div className="flex items-center justify-between gap-6 overflow-x-auto no-scrollbar py-1">
            {/* Category pills */}
            <div className="flex gap-2">
              {categoryPillsList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4.5 py-2.5 rounded-xl text-[10.5px] font-extrabold uppercase tracking-wider transition-all duration-200 border-none cursor-pointer shrink-0 ${ selectedCategory === cat ? "bg-blue-600 text-slate-100 dark:text-white shadow-md shadow-blue-500/10" : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800" }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dropdowns controls */}
            <div className="flex gap-2 shrink-0">
              {/* Brand Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === "brand" ? null : "brand")}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-98 transition-all"
                >
                  <span>Brand</span>
                  <ChevronDown size={12} className={`transition-transform ${openDropdown === "brand" ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === "brand" && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50">
                    {brandOptionsList.map((b) => (
                      <button
                        key={b}
                        onClick={() => {
                          setSelectedBrand(b);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition ${ selectedBrand === b ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-extrabold" : "" }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === "price" ? null : "price")}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-98 transition-all"
                >
                  <span>Price</span>
                  <ChevronDown size={12} className={`transition-transform ${openDropdown === "price" ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === "price" && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50">
                    {[
                      { id: "All", label: "All Prices" },
                      { id: "under-500", label: "Under ₹500" },
                      { id: "500-2000", label: "₹500 - ₹2,000" },
                      { id: "2000-5000", label: "₹2,000 - ₹5,000" },
                      { id: "above-5000", label: "Above ₹5,000" }
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedPrice(p.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition ${ selectedPrice === p.id ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-extrabold" : "" }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === "rating" ? null : "rating")}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-98 transition-all"
                >
                  <span>Rating</span>
                  <ChevronDown size={12} className={`transition-transform ${openDropdown === "rating" ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === "rating" && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50">
                    {[
                      { id: "All", label: "All Ratings" },
                      { id: "4plus", label: "4★ & Up" },
                      { id: "4.5plus", label: "4.5★ & Up" }
                    ].map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setSelectedRating(r.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition ${ selectedRating === r.id ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-extrabold" : "" }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === "availability" ? null : "availability")}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-98 transition-all"
                >
                  <span>Availability</span>
                  <ChevronDown size={12} className={`transition-transform ${openDropdown === "availability" ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === "availability" && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50">
                    {[
                      { id: "All", label: "All Items" },
                      { id: "instock", label: "In Stock Only" }
                    ].map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setSelectedAvailability(a.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition ${ selectedAvailability === a.id ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-extrabold" : "" }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Filter Chips row */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-900">
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mr-1">Active Filters:</span>
              
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 text-[10px] font-black uppercase">
                  {selectedCategory}
                  <X size={10} className="cursor-pointer" onClick={() => setSelectedCategory("All")} />
                </span>
              )}
              {selectedBrand !== "All" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 text-[10px] font-black uppercase">
                  {selectedBrand}
                  <X size={10} className="cursor-pointer" onClick={() => setSelectedBrand("All")} />
                </span>
              )}
              {selectedPrice !== "All" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 text-[10px] font-black uppercase">
                  Price Filter
                  <X size={10} className="cursor-pointer" onClick={() => setSelectedPrice("All")} />
                </span>
              )}
              {selectedRating !== "All" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 text-[10px] font-black uppercase">
                  {selectedRating === "4plus" ? "4★ & Up" : "4.5★ & Up"}
                  <X size={10} className="cursor-pointer" onClick={() => setSelectedRating("All")} />
                </span>
              )}
              {selectedAvailability !== "All" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 text-[10px] font-black uppercase">
                  In Stock
                  <X size={10} className="cursor-pointer" onClick={() => setSelectedAvailability("All")} />
                </span>
              )}
              
              <button
                onClick={resetAllFilters}
                className="ml-auto text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase bg-transparent border-none cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
         {/* 3. CURATED COLLECTIONS */}
        <section className="text-left select-none">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Explore Collections</h2>
            <p className="text-xs font-bold text-slate-400 mt-1">Handpicked lifestyle and product bundles.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCollections.map((col) => (
              <div
                key={col.id}
                onClick={() => {
                  navigate(`/product?category=${col.id.toLowerCase()}`);
                  toast.info(`Opening ${col.title}! 📦`);
                }}
                className="group relative rounded-[32px] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-350 cursor-pointer h-[260px] flex flex-col justify-between p-6"
              >
                <div className="absolute inset-0 z-0">
                  <img
                    src={col.image}
                    alt={col.title}
                    className="w-full h-full object-cover opacity-80 dark:opacity-60 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/10" />
                </div>

                <div className="z-10 flex justify-between items-start">
                  <span className="px-2.5 py-1 text-[9px] font-black uppercase text-slate-100 dark:text-white bg-blue-600 rounded-lg shadow-sm">
                    {col.tag}
                  </span>
                  <span className="text-[10px] font-black text-emerald-400 bg-black/40 px-2 py-0.5 rounded">
                    {col.growth}
                  </span>
                </div>

                <div className="z-10 text-left text-slate-100 dark:text-white space-y-1">
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{col.count}</span>
                  <h3 className="text-lg font-black">{col.title}</h3>
                  <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-400 group-hover:text-blue-300 transition-colors mt-2 bg-transparent border-none cursor-pointer">
                    <span>Explore Collection</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. TOP CATEGORIES */}
        <section className="text-left select-none">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Top Categories</h2>
            <p className="text-xs font-bold text-slate-400 mt-1">Browse and find products by category capsules.</p>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
            {displayCategories.map((cat, i) => (
              <div
                key={i}
                onClick={() => {
                  navigate(`/product?category=${cat.name.toLowerCase()}`);
                  toast.info(`Opening ${cat.name} Category! 🛍️`);
                }}
                className="group shrink-0 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-[28px] text-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-350"
              >
                <div className="aspect-[5/6] rounded-[20px] overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-3 relative shadow-inner">
                  <span className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400">
                    {cat.growth}
                  </span>
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="max-h-[85%] max-w-[85%] object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mt-3">{cat.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{cat.count}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. SHOP BY BRANDS */}
        <section className="text-left select-none">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Shop By Brands</h2>
              <p className="text-xs font-bold text-slate-500 mt-1">Top global manufacturers and official stores.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {displayBrands.map((brand, i) => (
              <div
                key={i}
                onClick={() => {
                  navigate(`/product?search=${brand.name}`);
                  toast.info(`Opening ${brand.name} Store! 🏷️`);
                }}
                className={`group relative flex flex-col justify-between border rounded-[28px] p-4 transition-all duration-350 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer overflow-hidden ${brand.colorClass}`}
              >
                {/* Brand header */}
                <div className="flex justify-between items-center mb-3 z-10">
                  <span className="font-black text-sm tracking-tight">{brand.logo}</span>
                  <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-rose-600 text-slate-100 dark:text-white">
                    {brand.discount}
                  </span>
                </div>

                {/* Cover visual overlay */}
                <div className="w-full aspect-[16/10] flex items-center justify-center my-3 relative overflow-hidden bg-white/5 rounded-xl p-1.5">
                  <img
                    src={brand.banner}
                    alt={brand.name}
                    className="max-h-[90%] max-w-[90%] object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Brand Footer Info */}
                <div className="mt-2 z-10">
                  <div className="flex justify-between items-center text-[10px] font-bold mb-3">
                    <span className="text-slate-300">{brand.count}</span>
                    <span className="flex items-center gap-0.5 text-amber-400">
                      <Star size={10} className="fill-current text-amber-400" />
                      {brand.rating}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 w-full py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-wider">Visit Store</span>
                    <ChevronRight size={10} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. RECOMMENDED FOR YOU SECTION */}
        <section id="recommended-section" className="text-left select-none">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40 px-3 py-1 rounded-md mb-2">
                <Sparkles size={11} className="stroke-[2.5] text-blue-600" />
                AI RECOMMENDATIONS
              </span>
              <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Recommended</span>
                <span className="text-blue-600 dark:text-blue-400">For You</span>
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-1">
                Handpicked options chosen by CartNow AI.
              </p>
            </div>

            {/* Recommended tabs */}
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex gap-1 border border-slate-200/50 dark:border-slate-800 w-fit">
              {[
                { id: "foryou", label: "For You" },
                { id: "trending", label: "Trending" },
                { id: "rated", label: "Top Rated" },
                { id: "arrivals", label: "New Arrivals" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRecommendedTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer border-none ${ activeRecommendedTab === tab.id ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300" }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : filteredProducts.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-white dark:bg-slate-900 text-center p-6 shadow-sm">
              <AlertCircle size={36} className="text-slate-300 dark:text-slate-600 animate-bounce mb-3" />
              <h3 className="text-base font-black text-slate-800 dark:text-white">No Products Found</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold max-w-[280px] leading-relaxed mt-1">
                Your filters or search keywords didn't yield any matches. Try clearing some selections.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-slate-100 dark:text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer border-none"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Products display Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {displayRecommended.map((product, idx) => {
                const isFav = wishlist?.includes(product._id);
                const finalImg = product.image?.startsWith("http")
                  ? product.image
                  : `${backendUrl}/${product.image}`;

                const originalVal = product.originalPrice || Math.round(product.price * 1.25);
                const discountPercent = Math.max(5, Math.round(((originalVal - product.price) / originalVal) * 100));

                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[28px] p-4 flex flex-col justify-between transition-all duration-350 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer relative"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    {/* Image Container with floating widgets */}
                    <div className="relative w-full aspect-square bg-[#F8FAFC] dark:bg-slate-950/20 rounded-[20px] overflow-hidden flex items-center justify-center p-5 border border-slate-50 dark:border-slate-800/50 shadow-inner">
                      {/* Float Badge (Top Left) */}
                      <span className={`absolute top-3.5 left-3.5 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider border rounded-lg bg-red-50 text-[#EF4444] border-red-100`}>
                        {product.isBestSeller ? "Best Seller" : product.isTopRated ? "Top Rated" : "AI Pick"}
                      </span>

                      {/* Favorite Heart (Top Right) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(product._id);
                        }}
                        className="absolute top-3.5 right-3.5 h-8.5 w-8.5 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700/50 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                      >
                        <Heart
                          size={13}
                          className={`transition-colors duration-300 stroke-[2.5] ${ isFav ? "text-rose-500 fill-rose-500" : "text-slate-500 dark:text-slate-400" }`}
                        />
                      </button>

                      {/* Product Image */}
                      <img
                        src={finalImg || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80"}
                        alt={product.name}
                        loading="lazy"
                        className="max-h-[90%] max-w-[90%] object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      {/* Floating social tag */}
                      <span className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 text-[8px] font-black px-2 py-0.5 rounded shadow-xs border border-slate-100/30 flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                        🔥 92% Match
                      </span>
                    </div>

                    {/* Product Info content */}
                    <div className="mt-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Rating Row */}
                        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Star size={12} className="fill-amber-500 text-amber-500 stroke-none" />
                            <span className="text-slate-800 dark:text-slate-200 font-extrabold">{typeof product.rating === 'object' && product.rating ? product.rating.average || "4.8" : product.rating || "4.8"}</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              ({product.reviewCount || "120"} reviews)
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-extrabold text-[14px] text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 mt-1">
                          {product.name}
                        </h3>

                        {/* Specifications subtext */}
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-none mt-1 mb-3">
                          {product.specs || "Premium Choice"}
                        </p>
                      </div>

                      {/* Price and CTA row */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-slate-400 line-through font-semibold">
                            ₹{originalVal.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] font-black text-red-500">
                            {discountPercent}% OFF
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-100 dark:text-white font-extrabold text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm active:scale-95 border-none"
                          >
                            <ShoppingCart size={11} className="stroke-[2.5]" />
                            <span>Add to Cart</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickView ? onQuickView(product) : navigate(`/product/${product._id}`);
                            }}
                            className="px-3 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1 transition-all cursor-pointer bg-transparent"
                          >
                            <Eye size={11} className="stroke-[2.5]" />
                            <span>View</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Discover;
