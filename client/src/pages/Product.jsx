import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProductCard from "../pages/ProductCard";
import FilterSidebar from "../components/FilterSidebar";
import { backendUrl } from "../config";
import { getAverageRating } from "../utils/productRatings";
import { Star, X, ShoppingCart, Eye, AlertTriangle, ArrowRight, Filter, ChevronLeft, ChevronRight, SlidersHorizontal, Search, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCardSkeleton } from "../components/SkeletonLoader";


const Product = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || searchParams.get("q") || "";

  // Page level states
  const [productList, setProductList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active filter state variables initialized from searchParams
  const [sortBy, setSortBy] = useState("featured");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [collection, setCollection] = useState(searchParams.get("collection") || "all");
  const [audience, setAudience] = useState(searchParams.get("audience") || "all");
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState(searchParams.get("brand") ? (searchParams.get("brand") || "").split(",") : []);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [price, setPrice] = useState(200000);
  const [rating, setRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(searchParams.get("categories") ? (searchParams.get("categories") || "").split(",") : []);

  // Mobile filters sidebar toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Quick view product states
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewActiveImg, setQuickViewActiveImg] = useState("");
  const [quickViewSelectedSize, setQuickViewSelectedSize] = useState("");
  const [quickViewFavorite, setQuickViewFavorite] = useState(false);

  // Search autocomplete states
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recent_searches") || "[]");
    } catch (e) {
      return [];
    }
  });

  const maxPrice = 200000;
  const prevFiltersRef = useRef(null);

  // Synchronize URL changes to React states (e.g. on navigation / back button)
  useEffect(() => {
    const qParam = searchParams.get("search") || searchParams.get("q") || "";
    const categoryParam = searchParams.get("category") || "all";
    const collectionParam = searchParams.get("collection") || "all";
    const audienceParam = searchParams.get("audience") || "all";
    const brandParam = searchParams.get("brand");
    const categoriesParam = searchParams.get("categories");

    if (categoryParam !== category) {
      setCategory(categoryParam);
    }
    if (collectionParam !== collection) {
      setCollection(collectionParam);
    }
    if (audienceParam !== audience) {
      setAudience(audienceParam);
    }
    
    const nextBrands = brandParam ? brandParam.split(",") : [];
    const brandsDiffers = selectedBrands.length !== nextBrands.length || selectedBrands.some((b, i) => b !== nextBrands[i]);
    if (brandsDiffers) {
      setSelectedBrands(nextBrands);
    }
    
    const nextCategoriesIds = categoriesParam ? categoriesParam.split(",") : [];
    const categoriesDiffer = selectedCategoryIds.length !== nextCategoriesIds.length || selectedCategoryIds.some((c, i) => c !== nextCategoriesIds[i]);
    if (categoriesDiffer) {
      setSelectedCategoryIds(nextCategoriesIds);
    }

    if (qParam !== searchValue) {
      setSearchValue(qParam);
    }
  }, [searchParams]);

  // Synchronize filter states to URL search parameters when modified via UI
  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      
      if (category && category !== "all") {
        next.set("category", category);
      } else {
        next.delete("category");
      }

      if (collection && collection !== "all") {
        next.set("collection", collection);
      } else {
        next.delete("collection");
      }

      if (audience && audience !== "all") {
        next.set("audience", audience);
      } else {
        next.delete("audience");
      }

      if (selectedBrands && selectedBrands.length > 0) {
        next.set("brand", selectedBrands.join(","));
      } else {
        next.delete("brand");
      }

      if (selectedCategoryIds && selectedCategoryIds.length > 0) {
        next.set("categories", selectedCategoryIds.join(","));
      } else {
        next.delete("categories");
      }

      if (searchQuery) {
        next.set("search", searchQuery);
      } else {
        next.delete("search");
        next.delete("q");
      }

      return next;
    }, { replace: true });
  }, [category, collection, audience, selectedBrands, selectedCategoryIds, searchQuery]);

  // Fetch admin created categories for pills
  const [adminCategories, setAdminCategories] = useState([]);
  const [baseProducts, setBaseProducts] = useState([]);

  useEffect(() => {
    axios.get(`${backendUrl}/api/product/categories`)
      .then(res => {
        if (res.data.success) {
          setAdminCategories(res.data.categories || []);
        }
      })
      .catch(err => console.log(err));
  }, []);

  // Fetch base products matching search term to compute filter metadata & counts locally
  useEffect(() => {
    const params = { q: searchQuery || undefined, limit: 10000 };
    axios.get(`${backendUrl}/api/product/list`, { params })
      .then((res) => {
        if (res.data.success) {
          setBaseProducts(res.data.products || []);
        }
      })
      .catch(() => {});
  }, [searchQuery]);

  // Main product loader
  const fetchProducts = async (pageToFetch) => {
    setLoading(true);
    setError(null);

    const params = {
      page: pageToFetch,
      limit: 20,
      price,
      q: searchQuery || undefined,
      sortBy
    };

    if (category !== "all") params.category = category;
    if (selectedCategoryIds.length > 0) params.categories = selectedCategoryIds.join(",");
    if (collection !== "all") params.collection = collection;
    if (audience && audience !== "all") params.audience = audience;
    if (rating > 0) params.rating = rating;
    if (inStockOnly) params.availability = "in-stock";
    if (minDiscount > 0) params.discount = minDiscount;

    if (selectedSubCategories.length > 0) {
      params.subCategory = selectedSubCategories.join(",");
    }
    if (selectedBrands.length > 0) {
      params.brand = selectedBrands.join(",");
    }
    if (selectedLocations.length > 0) {
      params.location = selectedLocations.join(",");
    }

    try {
      const res = await axios.get(`${backendUrl}/api/products`, { params });
      if (res.data.success) {
        const newProducts = res.data.products || [];
        setProductList(newProducts);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        setHasMore(res.data.hasMore ?? (newProducts.length === 20));
      } else {
        setError(res.data.message || "Failed to load products");
      }
    } catch (err) {
      console.error("Fetch products error:", err);
      setError(err.message || "Network connection failed");
    } finally {
      setLoading(false);
    }
  };

  // Manage pagination and filter synchronization to prevent double fetching
  useEffect(() => {
    const filtersObj = {
      category,
      selectedCategoryIds,
      collection,
      audience,
      selectedSubCategories,
      selectedBrands,
      selectedLocations,
      price,
      rating,
      minDiscount,
      inStockOnly,
      searchQuery,
      sortBy
    };
    const filtersStr = JSON.stringify(filtersObj);

    if (prevFiltersRef.current !== null && prevFiltersRef.current !== filtersStr) {
      // If a filter changed, reset page to 1
      prevFiltersRef.current = filtersStr;
      if (page !== 1) {
        setPage(1);
        return; // wait for next run triggered by page state change
      }
    }

    prevFiltersRef.current = filtersStr;
    fetchProducts(page);
  }, [
    page,
    category,
    selectedCategoryIds,
    collection,
    audience,
    selectedSubCategories,
    selectedBrands,
    selectedLocations,
    price,
    rating,
    minDiscount,
    inStockOnly,
    searchQuery,
    sortBy
  ]);

  // Pagination page generation helper
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }
    return pages;
  };

  const handlePageChange = (p) => {
    if (p === page || p === "...") return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Compute category/collection mapping configurations
  const { categoryMapping } = useMemo(() => {
    const mapping = {};
    adminCategories.forEach(c => {
      const subList = c.subcategories || [];
      const children = adminCategories.filter(child => child.parentCategoryId?.toString() === c._id?.toString());
      const allAllowed = [c.name, ...subList, ...children.map(child => child.name)];
      mapping[c.name] = allAllowed;
    });
    return { categoryMapping: mapping };
  }, [adminCategories]);

  // Dynamic filter checklists computed from search results
  const categoriesList = useMemo(() => {
    if (adminCategories.length > 0) {
      const unique = adminCategories.map(c => c.name);
      return ["all", ...unique.sort()];
    }
    const unique = [...new Set(baseProducts.map(p => p.category).filter(Boolean))];
    return ["all", ...unique.sort()];
  }, [adminCategories, baseProducts]);

  const baseFilteredByCategory = useMemo(() => {
    let base = baseProducts;
    
    if (selectedCategoryIds && selectedCategoryIds.length > 0) {
      let allowedNames = [];
      selectedCategoryIds.forEach(id => {
        const doc = adminCategories.find(c => c._id === id);
        if (doc) {
          allowedNames.push(doc.name);
          if (doc.subcategories) {
            allowedNames.push(...doc.subcategories);
          }
          const children = adminCategories.filter(c => c.parentCategoryId === id);
          allowedNames.push(...children.map(c => c.name));
        }
      });
      if (allowedNames.length > 0) {
        const lowerAllowed = allowedNames.map(n => n.toLowerCase());
        if (lowerAllowed.includes("fashion")) {
          allowedNames.push(
            "Fashion", "Men", "Women", "Kids", "Accessories", "Footwear",
            "Fashion (Men)", "Fashion (Women)", "Fashion (Kids)",
            "clothing", "apparel", "shirts", "trousers", "t-shirts", "jackets", "sportswear", "jeans"
          );
        }
        if (lowerAllowed.includes("electronics") || lowerAllowed.includes("electrinocs")) {
          allowedNames.push("Electronics", "Electrinocs");
        }
        base = base.filter(p => 
          allowedNames.some(name => name.toLowerCase() === p.category?.toLowerCase())
        );
      }
    } else if (category !== "all") {
      const allowed = categoryMapping[category] || [category];
      base = base.filter(p => allowed.some(a => a.toLowerCase() === p.category?.toLowerCase()));
    }
    
    return base;
  }, [baseProducts, category, selectedCategoryIds, categoryMapping, adminCategories]);

  const collectionsList = useMemo(() => {
    const unique = [...new Set(baseFilteredByCategory.map(p => p.collection).filter(Boolean))];
    return unique.sort();
  }, [baseFilteredByCategory]);

  const subCategoriesList = useMemo(() => {
    const unique = [...new Set(baseFilteredByCategory.map(p => p.subCategory).filter(Boolean))];
    return unique.sort();
  }, [baseFilteredByCategory]);

  const brandsList = useMemo(() => {
    const unique = [...new Set(baseFilteredByCategory.map(p => p.brand).filter(Boolean))];
    return unique.sort();
  }, [baseFilteredByCategory]);

  const locationsList = ["Delhi", "Mumbai", "Bangalore", "Chennai"];

  // Filter counters calculations
  const categoryCounts = useMemo(() => {
    const counts = {};
    baseProducts.forEach(p => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [baseProducts]);

  const subCategoryCounts = useMemo(() => {
    const counts = {};
    baseProducts.forEach(p => {
      if (p.subCategory) counts[p.subCategory] = (counts[p.subCategory] || 0) + 1;
    });
    return counts;
  }, [baseProducts]);

  const brandCounts = useMemo(() => {
    const counts = {};
    baseProducts.forEach(p => {
      if (p.brand) counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, [baseProducts]);

  const locationCounts = useMemo(() => {
    const counts = {};
    baseProducts.forEach(p => {
      const loc = p.location || "Delhi";
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return counts;
  }, [baseProducts]);

  const inStockCount = useMemo(() => {
    return baseProducts.filter(p => p.stock > 0).length;
  }, [baseProducts]);

  const ratingCounts = useMemo(() => {
    const counts = { 4: 0, 3: 0, 2: 0, 1: 0 };
    baseProducts.forEach(p => {
      const avg = getAverageRating(p);
      if (avg >= 4) counts[4]++;
      if (avg >= 3) counts[3]++;
      if (avg >= 2) counts[2]++;
      if (avg >= 1) counts[1]++;
    });
    return counts;
  }, [baseProducts]);

  const discountCounts = useMemo(() => {
    const counts = { 10: 0, 20: 0, 30: 0, 40: 0, 50: 0 };
    baseProducts.forEach(p => {
      const originalVal = p.originalPrice || Math.round(p.price * 1.25);
      const discount = Math.round(((originalVal - p.price) / originalVal) * 100);
      if (discount >= 10) counts[10]++;
      if (discount >= 20) counts[20]++;
      if (discount >= 30) counts[30]++;
      if (discount >= 40) counts[40]++;
      if (discount >= 50) counts[50]++;
    });
    return counts;
  }, [baseProducts]);

  // Multiselect toggle handlers
  const handleToggleCategory = (val) => {
    setSelectedCategories(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handleToggleSubCategory = (val) => {
    setSelectedSubCategories(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handleToggleBrand = (val) => {
    setSelectedBrands(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handleToggleLocation = (val) => {
    setSelectedLocations(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handleCategoryPillChange = (val) => {
    setCategory(val);
    setSelectedSubCategories([]);
    setSelectedBrands([]);
    setSelectedLocations([]);
  };

  const handleReset = () => {
    setCategory("all");
    setCollection("all");
    setSelectedCategoryIds([]);
    setSelectedSubCategories([]);
    setSelectedBrands([]);
    setSelectedLocations([]);
    setPrice(maxPrice);
    setRating(0);
    setMinDiscount(0);
    setInStockOnly(false);
    setSortBy("featured");
    setSearchParams((cur) => {
      const n = new URLSearchParams(cur);
      n.delete("q");
      return n;
    });
  };

  // Sync search input with URL query param and clear previous filters to look across entire catalogue
  useEffect(() => {
    setSearchValue(searchQuery);
    if (searchQuery) {
      setCategory("all");
      setCollection("all");
      setSelectedSubCategories([]);
      setSelectedBrands([]);
      setSelectedLocations([]);
      setPrice(maxPrice);
      setRating(0);
      setMinDiscount(0);
      setInStockOnly(false);
      setSortBy("featured");
    }
  }, [searchQuery]);

  // Autocomplete suggestion list logic
  const filteredSuggestions = useMemo(() => {
    if (!searchValue.trim()) return { products: [], categories: [], brands: [] };
    const query = searchValue.toLowerCase().trim();
    
    // Matched product names
    const matchedProducts = baseProducts
      .filter(p => p.name?.toLowerCase().includes(query))
      .slice(0, 5);
      
    // Matched categories
    const matchedCategories = categoriesList
      .filter(c => c !== "all" && c.toLowerCase().includes(query))
      .slice(0, 3);
      
    // Matched brands
    const matchedBrands = brandsList
      .filter(b => b.toLowerCase().includes(query))
      .slice(0, 3);

    return {
      products: matchedProducts,
      categories: matchedCategories,
      brands: matchedBrands
    };
  }, [searchValue, baseProducts, categoriesList, brandsList]);

  const submitSearch = (val) => {
    const term = (val !== undefined ? val : searchValue).trim();
    if (term) {
      setRecentSearches(prev => {
        const next = [term, ...prev.filter(x => x !== term)].slice(0, 5);
        localStorage.setItem("recent_searches", JSON.stringify(next));
        return next;
      });
    }
    setSearchParams(cur => {
      const n = new URLSearchParams(cur);
      if (term) {
        n.set("q", term);
      } else {
        n.delete("q");
      }
      return n;
    });
    setSearchFocused(false);
  };

  const handleSearchKeyDown = (e) => {
    const { products = [], categories = [], brands = [] } = filteredSuggestions;
    const flatSuggestions = [
      ...categories.map(c => ({ type: 'category', value: c })),
      ...brands.map(b => ({ type: 'brand', value: b })),
      ...products.map(p => ({ type: 'product', value: p.name, id: p._id }))
    ];
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIdx(prev => Math.min(prev + 1, flatSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIdx(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestionIdx >= 0 && activeSuggestionIdx < flatSuggestions.length) {
        const selected = flatSuggestions[activeSuggestionIdx];
        if (selected.type === 'category') {
          handleCategoryPillChange(selected.value);
        } else if (selected.type === 'brand') {
          setSelectedBrands([selected.value]);
        } else if (selected.type === 'product') {
          navigate(`/product/${selected.id}`);
        } else {
          submitSearch(selected.value);
        }
      } else {
        submitSearch();
      }
    } else if (e.key === "Escape") {
      setSearchFocused(false);
    }
  };

  // Sync wishlist status for the quick view product
  useEffect(() => {
    if (quickViewProduct) {
      const list = JSON.parse(localStorage.getItem("wishlist")) || [];
      setQuickViewFavorite(list.includes(quickViewProduct._id));
    }
  }, [quickViewProduct]);

  const toggleQuickViewFavorite = async () => {
    if (!quickViewProduct) return;
    const token = localStorage.getItem("token") || "";
    if (token) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/wishlist/toggle`,
          { productId: quickViewProduct._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          setQuickViewFavorite(!quickViewFavorite);
          const updatedList = response.data.wishlist || [];
          localStorage.setItem("wishlist", JSON.stringify(updatedList));
          toast.success(!quickViewFavorite ? "Added to wishlist" : "Removed from wishlist");
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      const list = JSON.parse(localStorage.getItem("wishlist")) || [];
      const index = list.indexOf(quickViewProduct._id);
      if (index === -1) {
        list.push(quickViewProduct._id);
        setQuickViewFavorite(true);
        toast.success("Added to wishlist");
      } else {
        list.splice(index, 1);
        setQuickViewFavorite(false);
        toast.success("Removed from wishlist");
      }
      localStorage.setItem("wishlist", JSON.stringify(list));
    }
    window.dispatchEvent(new Event("wishlistUpdate"));
  };

  // Compile active filter chips
  const activeFiltersChips = useMemo(() => {
    const chips = [];
    if (category !== "all") {
      chips.push({
        key: "category",
        label: `Dept: ${category}`,
        clear: () => setCategory("all")
      });
    }
    selectedCategoryIds.forEach(id => {
      const found = adminCategories.find(c => c._id === id);
      chips.push({
        key: `categories_${id}`,
        label: found ? found.name : "Category",
        clear: () => setSelectedCategoryIds(selectedCategoryIds.filter(x => x !== id))
      });
    });
    selectedSubCategories.forEach(s => {
      chips.push({
        key: `sub_${s}`,
        label: s,
        clear: () => handleToggleSubCategory(s)
      });
    });
    selectedBrands.forEach(b => {
      chips.push({
        key: `brand_${b}`,
        label: b,
        clear: () => handleToggleBrand(b)
      });
    });
    selectedLocations.forEach(l => {
      chips.push({
        key: `loc_${l}`,
        label: `${l} Origin`,
        clear: () => handleToggleLocation(l)
      });
    });
    if (price < maxPrice) {
      chips.push({
        key: "price",
        label: `Under ₹${price.toLocaleString("en-IN")}`,
        clear: () => setPrice(maxPrice)
      });
    }
    if (rating > 0) {
      chips.push({
        key: "rating",
        label: `${rating}★ & above`,
        clear: () => setRating(0)
      });
    }
    if (minDiscount > 0) {
      chips.push({
        key: "discount",
        label: `${minDiscount}% Off & above`,
        clear: () => setMinDiscount(0)
      });
    }
    if (inStockOnly) {
      chips.push({
        key: "availability",
        label: "In Stock",
        clear: () => setInStockOnly(false)
      });
    }
    return chips;
  }, [category, selectedSubCategories, selectedBrands, selectedLocations, price, rating, minDiscount, inStockOnly]);

  // Variant selector and cart trigger inside Quick View Modal
  const openQuickView = (p) => {
    setQuickViewProduct(p);
    setQuickViewSelectedSize(p.sizes?.length ? p.sizes[0] : "standard");
    const src = p.images?.[0] || p.image || "";
    setQuickViewActiveImg(src.startsWith("http") ? src : `${backendUrl}/${src}`);
  };

  const [isQuickViewAdding, setIsQuickViewAdding] = useState(false);

  const handleQuickViewAddToCart = async (p, size = "standard") => {
    const prod = p || quickViewProduct;
    if (!prod || isQuickViewAdding) return;
    const token = localStorage.getItem("token") || "";
    const chosenSize = size || quickViewSelectedSize || "standard";

    // 1. Check if product already exists in user's cart
    let guestCart = {};
    try {
      guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
    } catch (err) {}

    const keyPrefix = `${prod._id}_`;
    let alreadyInCart = false;
    for (const k in guestCart) {
      if ((k === `${prod._id}_${chosenSize}` || k.startsWith(keyPrefix)) && guestCart[k] > 0) {
        alreadyInCart = true;
        break;
      }
    }

    if (alreadyInCart) {
      toast.info("Product is already in your cart");
      setQuickViewProduct(null);
      navigate("/cart");
      return;
    }

    // 2. Lock button & set loading state
    setIsQuickViewAdding(true);

    if (!token) {
      guestCart[`${prod._id}_${chosenSize}`] = 1;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      window.dispatchEvent(new Event("cartUpdate"));
      toast.success("Added to cart! 🛍️");
      setIsQuickViewAdding(false);
      setQuickViewProduct(null);
      navigate("/cart");
    } else {
      try {
        const res = await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId: prod._id, size: chosenSize, qty: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          guestCart[`${prod._id}_${chosenSize}`] = 1;
          localStorage.setItem("cart", JSON.stringify(guestCart));
          window.dispatchEvent(new Event("cartUpdate"));
          toast.success("Added to cart! 🛍️");
          setIsQuickViewAdding(false);
          setQuickViewProduct(null);
          navigate("/cart");
        } else {
          toast.error(res.data.message || "Failed to add to cart");
          setIsQuickViewAdding(false);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error adding to cart");
        setIsQuickViewAdding(false);
      }
    }
  };

  const handleQuickViewBuyNow = async () => {
    await handleQuickViewAddToCart();
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative text-left pb-16">
      


      {/* ── Sticky Control Bar ── */}
      <div 
        className="sticky z-30 bg-white dark:bg-slate-950 border-b border-slate-200/40 dark:border-slate-800/40 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300"
        style={{ top: "var(--navbar-height, 80px)" }}
      >
        <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title & Count (Myntra style) */}
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Home / Products Catalog
            </span>
            <h2 className="text-sm sm:text-base font-black text-slate-800 dark:text-white uppercase tracking-wider mt-1.5">
              Products Collection <span className="text-xs font-normal text-slate-400 dark:text-slate-500 lowercase normal-case ml-1.5"> - {totalCount} items</span>
            </h2>
          </div>

          {/* Right Controls: Category, Sort, Results */}
          <div className="flex flex-wrap items-center gap-3 justify-end">
            
            {/* Category dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="hidden lg:inline text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Category:</span>
              <select
                value={category}
                onChange={(e) => handleCategoryPillChange(e.target.value)}
                className="border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-900 cursor-pointer outline-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                <option value="all">All Categories</option>
                {categoriesList.filter(c => c !== "all").map(c => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>

            {/* Sort selection dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="hidden lg:inline text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-900 cursor-pointer outline-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                <option value="featured">Best Matches</option>
                <option value="popularity">Popularity</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="highest-rated">Highest Rated</option>
              </select>
            </div>

            {/* Results Count indicator */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">Found</span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                {totalCount} items
              </span>
            </div>
          </div>
        </div>

        {/* Active Filter Chips block */}
        {activeFiltersChips.length > 0 && (
          <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-wrap gap-1.5 items-center mt-3 pt-3 border-t border-slate-200/30 dark:border-slate-800/30">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">Active:</span>
            {activeFiltersChips.map((chip) => (
              <button
                key={chip.key}
                onClick={chip.clear}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-900/30 text-[10.5px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:border-rose-500 hover:text-rose-500 transition-all cursor-pointer capitalize shadow-xs"
              >
                <span>{chip.label}</span>
                <X size={10} className="stroke-[3px]" />
              </button>
            ))}
            <button
              onClick={handleReset}
              className="text-[10px] font-black uppercase tracking-wider text-orange-500 hover:text-orange-600 cursor-pointer ml-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* ── Layout Grid Columns ── */}
      <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-start relative">
        
        {/* Desktop Sidebar filter card */}
        <div className="hidden md:block sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1 select-none scrollbar-hide">
          <FilterSidebar
            categories={categoriesList}
            subCategories={subCategoriesList}
            brands={brandsList}
            locations={locationsList}
            selectedCollection={collection}
            onCollectionToggle={setCollection}
            selectedCategories={[category]}
            onCategoryToggle={(val) => handleCategoryPillChange(val === category ? "all" : val)}
            selectedSubCategories={selectedSubCategories}
            selectedBrands={selectedBrands}
            selectedLocations={selectedLocations}
            price={price}
            maxPrice={maxPrice}
            rating={rating}
            minDiscount={minDiscount}
            inStockOnly={inStockOnly}
            onSubCategoryToggle={handleToggleSubCategory}
            onBrandToggle={handleToggleBrand}
            onLocationToggle={handleToggleLocation}
            onPriceChange={setPrice}
            onRatingChange={setRating}
            onDiscountChange={setMinDiscount}
            onInStockOnlyChange={setInStockOnly}
            onReset={handleReset}
            categoryCounts={categoryCounts}
            subCategoryCounts={subCategoryCounts}
            brandCounts={brandCounts}
            locationCounts={locationCounts}
            ratingCounts={ratingCounts}
            discountCounts={discountCounts}
            inStockCount={inStockCount}
            totalResultsCount={totalCount}
          />
        </div>

        {/* Mobile Filters bottom sheet Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full flex flex-col justify-between shadow-2xl relative animate-slide-left p-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Filter size={15} />
                  Filters Control Panel
                </span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                <FilterSidebar
                  categories={categoriesList}
                  subCategories={subCategoriesList}
                  brands={brandsList}
                  locations={locationsList}
                  selectedCollection={collection}
                  onCollectionToggle={setCollection}
                  selectedCategories={[category]}
                  onCategoryToggle={(val) => handleCategoryPillChange(val === category ? "all" : val)}
                  selectedSubCategories={selectedSubCategories}
                  selectedBrands={selectedBrands}
                  selectedLocations={selectedLocations}
                  price={price}
                  maxPrice={maxPrice}
                  rating={rating}
                  minDiscount={minDiscount}
                  inStockOnly={inStockOnly}
                  onSubCategoryToggle={handleToggleSubCategory}
                  onBrandToggle={handleToggleBrand}
                  onLocationToggle={handleToggleLocation}
                  onPriceChange={setPrice}
                  onRatingChange={setRating}
                  onDiscountChange={setMinDiscount}
                  onInStockOnlyChange={setInStockOnly}
                  onReset={handleReset}
                  categoryCounts={categoryCounts}
                  subCategoryCounts={subCategoryCounts}
                  brandCounts={brandCounts}
                  locationCounts={locationCounts}
                  ratingCounts={ratingCounts}
                  discountCounts={discountCounts}
                  inStockCount={inStockCount}
                  totalResultsCount={totalCount}
                  onCloseMobileFilters={() => setShowMobileFilters(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Product listing grid content area */}
        <div className="flex-1 w-full">
          {error ? (
            <div className="text-center py-16 px-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg max-w-xl mx-auto space-y-4">
              <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Failed to Retrieve Catalog</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
                {error}. Please check your internet connectivity or connection token and try again.
              </p>
              <button
                onClick={() => fetchProducts(page, page === 1)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-slate-100 dark:text-white rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 shadow cursor-pointer border border-indigo-500/20"
              >
                Retry Connection
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : productList.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[32px] border border-slate-200/50 dark:border-slate-800/80 shadow-md max-w-2xl mx-auto space-y-6 select-none"
            >
              <span className="text-5xl block animate-bounce">📦</span>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">No Products Located</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto leading-relaxed">
                  We couldn't locate any products matching your selected criteria. Wide your search terms, clear filters, or browse trending categories.
                </p>
              </div>

              {/* Suggested categories */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Popular Collections</span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Fashion", "Electronics", "Beauty", "Home"].map((dept) => (
                    <button
                      key={dept}
                      onClick={() => {
                        setCategory(dept);
                        setSelectedSubCategories([]);
                        setSelectedBrands([]);
                      }}
                      className="px-4 py-2 bg-white/70 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-200 cursor-pointer shadow-sm"
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset action */}
              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-slate-100 dark:text-white rounded-2xl text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-md cursor-pointer border-none"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-10">
              {/* Product Card grid - Animate items stagger entry */}
              <motion.div 
                layout
                className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {productList.map((item) => (
                  <motion.div
                    layout
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard 
                      product={item} 
                      onQuickView={openQuickView}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Premium Pill & Circle Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-10 pb-4 select-none">
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="h-11 px-5 rounded-full bg-[#B4B6F9] dark:bg-[#5659bf] text-white text-[12px] font-black uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border-none shadow-xs"
                  >
                    <ChevronLeft size={13} className="stroke-[3px]" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {getPageNumbers().map((p, idx) => {
                      if (p === "...") {
                        return (
                          <span key={`dots-${idx}`} className="px-1.5 text-slate-400 dark:text-slate-600 font-bold text-sm">
                            ...
                          </span>
                        );
                      }
                      const isCurrent = p === page;
                      return (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`h-11 w-11 flex items-center justify-center rounded-full text-xs font-black transition-all duration-200 cursor-pointer active:scale-90 shadow-sm border ${
                            isCurrent
                              ? "bg-[#6c3aed] text-white border-transparent shadow-[0_4px_12px_rgba(108,58,237,0.25)]"
                              : "border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#2C3E50] dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    className="h-11 px-5 rounded-full border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#2C3E50] dark:text-slate-300 text-[12px] font-black uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight size={13} className="stroke-[3px]" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* ── Quick View Modal overlay ── */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-[20px] z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-[32px] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative flex flex-col md:flex-row gap-8 text-left scrollbar-hide"
            >
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 h-9 w-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition cursor-pointer z-20 shadow-xs border border-slate-200/20"
              >
                <X size={16} />
              </button>

              {/* Left side: Images gallery with spotlight background */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="h-80 w-full bg-radial from-slate-100/50 via-slate-50 to-white dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-900 rounded-2xl flex items-center justify-center p-6 relative overflow-hidden border border-slate-200/40 dark:border-slate-800/80">
                  <div className="absolute inset-0 bg-indigo-500/5 blur-[50px] pointer-events-none" />
                  <img
                    src={quickViewActiveImg}
                    alt={quickViewProduct.name}
                    className="max-w-full max-h-full object-contain drop-shadow-md transition-transform duration-350"
                  />
                </div>

                {/* Thumbnails row */}
                <div className="flex gap-2.5 overflow-x-auto scrollbar-hide py-1.5 justify-center md:justify-start">
                  {(quickViewProduct.images || [quickViewProduct.image]).map((img, index) => {
                    const url = img?.startsWith("http") ? img : `${backendUrl}/${img}`;
                    const isSelected = quickViewActiveImg === url;
                    return (
                      <button
                        key={index}
                        onClick={() => setQuickViewActiveImg(url)}
                        className={`h-14 w-14 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 p-1 border shrink-0 transition-all duration-200 cursor-pointer ${ isSelected ? "border-indigo-600 dark:border-indigo-500 scale-105 ring-2 ring-indigo-500/20" : "border-slate-200 dark:border-slate-800 hover:border-indigo-300" }`}
                      >
                        <img src={url} alt={`thumbnail-${index}`} className="w-full h-full object-contain" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right side: Product specifications details */}
              <div className="flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
                      {quickViewProduct.brand || "CartNOW Curated"}
                    </span>
                    {quickViewProduct.stock > 0 && quickViewProduct.stock <= 5 && (
                      <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/15 uppercase tracking-wide">
                        Only {quickViewProduct.stock} Left
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
                    {quickViewProduct.name}
                  </h2>
                  
                  {/* Rating with review count */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded-md text-amber-500 font-bold">
                      <Star size={11} className="fill-amber-500 stroke-none" />
                      <span>{quickViewProduct.avgRating ? Number(quickViewProduct.avgRating).toFixed(1) : "New"}</span>
                    </div>
                    <span className="text-slate-400 dark:text-slate-500 font-bold">
                      ({quickViewProduct.reviewCount || 0} reviews)
                    </span>
                    <span className="text-slate-200 dark:text-slate-800">|</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md text-[10px] border border-emerald-500/10">
                      Verified Item
                    </span>
                  </div>

                  {/* Price block */}
                  <div className="flex items-baseline gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-50">
                      ₹{Number(quickViewProduct.price).toLocaleString("en-IN")}
                    </span>
                    {quickViewProduct.originalPrice > quickViewProduct.price && (
                      <>
                        <span className="text-sm text-slate-400 line-through">
                          ₹{Number(quickViewProduct.originalPrice).toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/5 px-2.5 py-0.5 rounded-md border border-emerald-500/15">
                          {quickViewProduct.discountPercent}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold line-clamp-4 pt-1">
                    {quickViewProduct.description}
                  </p>

                  {/* Size selection */}
                  {quickViewProduct.sizes?.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Select Sizing:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {quickViewProduct.sizes.map((sz) => {
                          const isSel = quickViewSelectedSize === sz;
                          return (
                            <button
                              key={sz}
                              onClick={() => setQuickViewSelectedSize(sz)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer capitalize active:scale-95 ${ isSel ? "border-indigo-600 bg-indigo-600 text-slate-100 dark:text-white shadow-md shadow-indigo-900/15" : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50" }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Free Delivery Tag */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-black select-none border border-emerald-500/10">
                    <span>✓</span>
                    <span>Free Delivery Tomorrow</span>
                  </div>
                </div>

                {/* Checkout & Wishlist actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Wishlist Icon Button */}
                  <button
                    onClick={toggleQuickViewFavorite}
                    className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-all duration-200 active:scale-90"
                    title="Add to Wishlist"
                  >
                    <Heart 
                      size={18} 
                      className={quickViewFavorite ? "text-rose-500 fill-rose-500 stroke-none" : "text-slate-500 dark:text-slate-400"}
                    />
                  </button>

                  <button
                    onClick={handleQuickViewAddToCart}
                    className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-wider active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <ShoppingCart size={13} className="stroke-[2.5]" />
                    <span>Add To Cart</span>
                  </button>

                  <button
                    onClick={handleQuickViewBuyNow}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-slate-100 dark:text-white rounded-2xl text-xs font-black uppercase tracking-wider active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-900/15 cursor-pointer border-none"
                  >
                    <span>Buy Now</span>
                    <ArrowRight size={13} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sticky Bottom Bar for Mobile View */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200/40 dark:border-slate-800/40 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] flex items-center justify-around gap-2 select-none">
        {/* Filter Trigger Button */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 text-xs font-extrabold text-slate-700 dark:text-slate-200 cursor-pointer shadow-xs active:scale-95 hover:bg-slate-50"
        >
          <SlidersHorizontal size={14} />
          <span>Filter</span>
        </button>

        {/* Sort Select */}
        <div className="flex-1 relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full text-center py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 text-xs font-extrabold text-slate-700 dark:text-slate-300 cursor-pointer outline-none shadow-xs appearance-none active:scale-95"
          >
            <option value="featured">Featured</option>
            <option value="popularity">Popularity</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price ↑</option>
            <option value="price-high">Price ↓</option>
            <option value="highest-rated">Rating</option>
          </select>
        </div>

        {/* Search Input Scroll & Focus */}
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            const searchInput = document.querySelector('input[placeholder*="Search products"]');
            if (searchInput) searchInput.focus();
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 text-xs font-extrabold text-slate-700 dark:text-slate-200 cursor-pointer shadow-xs active:scale-95"
        >
          <Search size={14} />
          <span>Search</span>
        </button>
      </div>

    </div>
  );
};

const AutocompleteSuggestions = ({
  searchValue,
  suggestions,
  recentSearches,
  activeIdx,
  onSelect,
  onClearRecent,
  onClose
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  const trendingList = ["iPhone", "Denim Jacket", "Sneakers", "Smartwatch", "Headphones", "Smartphones", "Curated Books"];
  const popularBrands = ["AOC", "ASUS", "SAMSUNG", "Nike", "Adidas"];

  const { products = [], categories = [], brands = [] } = suggestions;
  const showMatch = searchValue.trim().length > 0;

  const flatSuggestions = [
    ...categories.map(c => ({ type: 'category', value: c })),
    ...brands.map(b => ({ type: 'brand', value: b })),
    ...products.map(p => ({ type: 'product', value: p.name, id: p._id }))
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.15 }}
      className="absolute left-0 right-0 top-full mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-2xl p-4 z-50 text-left overflow-y-auto max-h-[400px]"
    >
      {!showMatch ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Recent Searches
              </span>
              {recentSearches.length > 0 && (
                <button
                  onClick={onClearRecent}
                  className="text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            {recentSearches.length > 0 ? (
              <div className="space-y-1">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => onSelect(s, 'query')}
                    className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 hover:text-indigo-600 transition"
                  >
                    <span>🔍</span>
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 italic">No recent searches</span>
            )}
          </div>

          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest block mb-2">
              Trending Searches
            </span>
            <div className="flex flex-wrap gap-1.5">
              {trendingList.map((t) => (
                <button
                  key={t}
                  onClick={() => onSelect(t, 'query')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                >
                  {t}
                </button>
              ))}
            </div>

            <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest block mt-4 mb-2">
              Popular Brands
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => onSelect(b, 'brand')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition cursor-pointer border border-indigo-100/40 dark:border-indigo-900/30"
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.length > 0 && (
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">
                Categories
              </span>
              <div className="space-y-1">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => onSelect(c, 'category')}
                    className="flex items-center justify-between w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 transition capitalize"
                  >
                    <span>{c}</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-400">Department</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {brands.length > 0 && (
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">
                Brands
              </span>
              <div className="space-y-1">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => onSelect(b, 'brand')}
                    className="flex items-center justify-between w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 transition capitalize"
                  >
                    <span>{b}</span>
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded text-indigo-500 font-bold border border-indigo-100/20">Brand</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {products.length > 0 && (
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">
                Product Suggestions
              </span>
              <div className="space-y-1">
                {products.map((p, idx) => {
                  const flatIdx = categories.length + brands.length + idx;
                  const isFocused = flatIdx === activeIdx;
                  return (
                    <button
                      key={p._id}
                      onClick={() => onSelect(p.name, 'product', p._id)}
                      className={`flex items-center gap-3 w-full text-left py-1.5 px-2 rounded-lg text-xs font-semibold hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 transition ${ isFocused ? "bg-indigo-50 dark:bg-slate-800/60 border border-indigo-200/50" : "" }`}
                    >
                      <img
                        src={p.image?.startsWith("http") ? p.image : `${backendUrl}/${p.image}`}
                        alt={p.name}
                        className="h-8 w-8 rounded-lg object-contain bg-white dark:bg-slate-900 p-0.5 border"
                      />
                      <div className="flex-1 truncate">
                        <span className="block truncate font-bold text-slate-800 dark:text-slate-200">{p.name}</span>
                        <span className="text-[10px] text-slate-400">in {p.category}</span>
                      </div>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100">₹{p.price.toLocaleString("en-IN")}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {categories.length === 0 && brands.length === 0 && products.length === 0 && (
            <div className="py-6 text-center text-slate-400 text-xs font-medium">
              No matching suggestions for "{searchValue}"
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Product;
