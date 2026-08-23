import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShoppingCart,
  User,
  LogOut,
  Package,
  Search,
  MapPin,
  Navigation,
  Sparkles,
  Sun,
  Moon,
  Heart,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  Tag,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Globe,
  Bell,
  CheckCheck,
  PackageCheck,
  KeyRound,
  Truck,
  Check,
  Copy,
  Mic,
  LayoutGrid,
} from "lucide-react";
import axios from "axios";
import { backendUrl } from "../config";
import { cachedGet } from "../utils/apiCache";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "react-toastify";
import Logo from "./Logo";

/* ─────────────── Mobile Bottom Nav items ─────────────── */
const BOTTOM_NAV = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Categories", icon: LayoutGrid, to: "/categories" },
  { label: "Wishlist", icon: Heart, to: "/wishlist" },
  { label: "Orders", icon: Package, to: "/orderdetail" },
  { label: "Account", icon: User, to: null, isProfile: true },
];

/* ─────────────── Main Component ─────────────── */
const DEFAULT_CATEGORIES = [
  { label: "Electronics", to: "/category/electronics", emoji: "🔌" },
  { label: "Fashion", to: "/category/fashion", emoji: "👗" },
  { label: "Home", to: "/category/home", emoji: "🏠" },
  { label: "Beauty", to: "/category/beauty", emoji: "💄" },
];
const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();
  const { language, changeLanguage, t } = useLanguage();

  /* State */
  const [navCategories, setNavCategories] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [open, setOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [username, setUsername] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [locationLabel, setLocationLabel] = useState(() => {
    return localStorage.getItem("delivery_location") || "Use location";
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [cartBump, setCartBump] = useState(false);

  useEffect(() => {
    cachedGet(`${backendUrl}/api/product/categories`)
      .then(res => {
        if (res.data.success) {
          const topCats = (res.data.categories || [])
            .filter(c => !c.parentCategoryId && c.status === "active")
            .map(c => ({
              label: c.name,
              to: `/category/${c.slug || c.name.toLowerCase()}`,
              emoji: c.icon || "📦"
            }));
          setNavCategories(topCats);
        }
      })
      .catch(err => console.error("Failed to load categories in navbar:", err));
  }, []);
  const [activeTab, setActiveTab] = useState("all");
  const [copiedNotiId, setCopiedNotiId] = useState(null);
  const [expandedNotis, setExpandedNotis] = useState({});
  const [pincodeInput, setPincodeInput] = useState(() => {
    return localStorage.getItem("delivery_pincode") || "";
  });
  const [pincodeOpen, setPincodeOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchCategory, setSearchCategory] = useState("all");

  /* Search autocomplete */
  const [allProducts, setAllProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recent_searches") || "[]");
    } catch {
      return [];
    }
  });
  const [trendingSearches, setTrendingSearches] = useState(["iPhone", "Denim Jacket", "Sneakers", "Smartwatch", "Headphones"]);

  /* Mobile search overlay */
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  /* Refs */
  const profileRef = useRef(null);
  const notiRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  /* Dark mode */
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const token = localStorage.getItem("token");

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${backendUrl}/api/user/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount((res.data.notifications || []).filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.log("Error fetching notifications:", err);
    }
  }, [token]);

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      const res = await axios.post(
        `${backendUrl}/api/user/notifications/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.log("Error marking notifications read:", err);
    }
  };

  const handleMarkSingleRead = async (notiId, e) => {
    if (e) e.stopPropagation();
    if (!token) return;
    try {
      const res = await axios.post(
        `${backendUrl}/api/user/notifications/read`,
        { notificationId: notiId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notiId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.log("Error marking notification read:", err);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, activeTab]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications, location.pathname]);

  const query = useMemo(
    () => new URLSearchParams(location.search).get("q") || "",
    [location.search]
  );

  const initials = useMemo(() => {
    if (!username) return "";
    return username.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }, [username]);

  /* ── Click outside ── */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpen(false);
        setPincodeOpen(false);
      }
      if (notiRef.current && !notiRef.current.contains(e.target)) setNotiOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Fetch products for autocomplete ── */
  const fetchAllProducts = useCallback(async () => {
    if (allProducts.length > 0) return;
    try {
      const res = await cachedGet(`${backendUrl}/api/product/list`);
      if (res.data.success) setAllProducts(res.data.products || []);
    } catch { }
  }, [allProducts.length]);

  /* ── Fetch trending searches from analytics ── */
  const fetchTrendingSearches = useCallback(async () => {
    try {
      const res = await cachedGet(`${backendUrl}/api/product/search-suggestions`);
      if (res.data.success && res.data.suggestions && res.data.suggestions.length > 0) {
        setTrendingSearches(res.data.suggestions);
      }
    } catch (err) {
      console.log("Error fetching search suggestions:", err);
    }
  }, []);

  // Fetch search suggestions and list only when focused (or mobile overlay open) and user typed >= 2 characters
  useEffect(() => {
    if ((searchFocused || mobileSearchOpen) && searchValue.trim().length >= 2) {
      fetchAllProducts();
      fetchTrendingSearches();
    }
  }, [searchValue, searchFocused, mobileSearchOpen, fetchAllProducts, fetchTrendingSearches]);

  const suggestions = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return [];
    return allProducts
      .filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [searchValue, allProducts]);

  /* ── Profile & cart count ── */
  useEffect(() => {
    if (!token) {
      setUsername("");
      const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      setCartCount(Object.values(guestCart).reduce((s, q) => s + q, 0));
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setUsername(res.data.user.name);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setUsername("");
          setCartCount(0);
        }
      }
    };
    const fetchCartCount = async () => {
      try {
        const res = await axios.post(`${backendUrl}/api/cart/get`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const cartData = res.data.cartData || {};
          setCartCount(Object.values(cartData).reduce((s, q) => s + q, 0));
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setUsername("");
          setCartCount(0);
        }
      }
    };
    fetchProfile();
    fetchCartCount();
  }, [token, location.pathname]);

  /* ── Real-time cart sync ── */
  useEffect(() => {
    const handleCartUpdate = () => {
      setCartBump(true);
      setTimeout(() => setCartBump(false), 600);
      if (!token) {
        const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
        setCartCount(Object.values(guestCart).reduce((s, q) => s + q, 0));
      } else {
        axios.post(`${backendUrl}/api/cart/get`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
          if (res.data.success) {
            const cartData = res.data.cartData || {};
            setCartCount(Object.values(cartData).reduce((s, q) => s + q, 0));
          }
        }).catch(() => { });
      }
    };
    window.addEventListener("storage", handleCartUpdate);
    window.addEventListener("cartUpdate", handleCartUpdate);

    const handleCartBounce = () => {
      setIsCartBouncing(true);
      setTimeout(() => setIsCartBouncing(false), 800);
    };
    window.addEventListener("cartAddAnimComplete", handleCartBounce);

    return () => {
      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener("cartUpdate", handleCartUpdate);
      window.removeEventListener("cartAddAnimComplete", handleCartBounce);
    };
  }, [token]);

  useEffect(() => { setSearchValue(query); }, [query]);
  useEffect(() => { setOpen(false); setNotiOpen(false); setMobileSearchOpen(false); }, [location.pathname]);

  /* ── Handlers ── */
  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const submitSearch = (val) => {
    const trimmed = (val ?? searchValue).trim();
    if (trimmed) {
      setRecentSearches((prev) => {
        const next = [trimmed, ...prev.filter((x) => x !== trimmed)].slice(0, 5);
        localStorage.setItem("recent_searches", JSON.stringify(next));
        return next;
      });
    }
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    const catQuery = searchCategory && searchCategory !== "all" ? `&category=${encodeURIComponent(searchCategory)}` : "";
    navigate(`/product${trimmed ? `?q=${encodeURIComponent(trimmed)}${catQuery}` : catQuery ? `?${catQuery.slice(1)}` : ""}`);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { setLocationLabel("Unavailable"); return; }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`
          );
          const data = await res.json();
          const a = data.address || {};
          const cityStr = a.city || a.town || a.state_district || a.state || a.country || `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`;
          const pCode = a.postcode || "";
          localStorage.setItem("delivery_location", cityStr);
          if (pCode) {
            localStorage.setItem("delivery_pincode", pCode);
            setPincodeInput(pCode);
          }
          setLocationLabel(cityStr);
          window.dispatchEvent(new Event("pincodeUpdated"));
          toast.success(`Location set to: ${cityStr}`);
        } catch {
          const coordsStr = `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`;
          localStorage.setItem("delivery_location", coordsStr);
          setLocationLabel(coordsStr);
          window.dispatchEvent(new Event("pincodeUpdated"));
        } finally { setLocationLoading(false); }
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === 1) {
          setLocationLabel("Denied");
          toast.error("Location permission denied. Please verify macOS System Settings > Privacy & Security > Location Services is enabled for your browser.");
        } else if (err.code === 3) {
          setLocationLabel("Timeout");
          toast.error("Location request timed out. Please try again.");
        } else {
          setLocationLabel("Unavailable");
          toast.error("Location unavailable. Make sure your Wi-Fi is turned on to help locate your device.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice search is not supported in this browser. Please use Chrome or Safari.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : language === "es" ? "es-ES" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening... Speak now 🎙️");
    };

    recognition.onerror = (e) => {
      console.error("Speech error", e);
      setIsListening(false);
      toast.error("Could not understand voice. Try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setSearchValue(speechToText);
      submitSearch(speechToText);
      toast.success(`Searching for: "${speechToText}"`);
    };

    recognition.start();
  };

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + "/");

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <>
      {/* Backdrop Dimming Overlay */}
      {showSuggestions && (
        <div
          onClick={() => {
            setShowSuggestions(false);
            setSearchFocused(false);
          }}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* ═══════════ TOP NAV BAR ═══════════ */}
      <header id="main-navbar-header" className="sticky top-0 z-50 w-full">

        {/* ── Main bar ── */}
        <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 backdrop-blur-xl shadow-xs transition-all duration-300">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
            <div className="flex h-16 items-center gap-3 lg:gap-4 w-full">

              {/* ── Logo ── */}
              <Link
                to="/"
                className="group flex shrink-0 items-center select-none"
              >
                <Logo
                  className="h-8 sm:h-9 w-auto text-slate-900 dark:text-white transition-transform duration-300"
                />
              </Link>

              {/* ── Delivery Location Widget (Amazon Style) ── */}
              <button
                type="button"
                onClick={() => setPincodeOpen(true)}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer text-left select-none shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 bg-transparent"
              >
                <MapPin size={17} className="text-amber-500 shrink-0 stroke-[2.5]" />
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                    Deliver to {username ? username.split(" ")[0] : "Sachin"}
                  </span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-0.5 leading-none mt-0.5">
                    {locationLabel && locationLabel !== "Use location" ? locationLabel : "Vaghodia 391760"}
                    <ChevronDown size={10} className="text-slate-400" />
                  </span>
                </div>
              </button>

              {/* ── Desktop Search (Minimalist Capsule) ── */}
              <div
                ref={searchRef}
                className={`relative hidden md:flex flex-1 min-w-0 mx-2 lg:mx-4 transition-all duration-300 ease-in-out z-50 ${searchFocused ? "max-w-3xl" : "max-w-xl lg:max-w-2xl"}`}
              >
                <form
                  onSubmit={(e) => { e.preventDefault(); submitSearch(); }}
                  className={`flex w-full items-center overflow-hidden rounded-sm border transition-all duration-300 ${searchFocused ? "border-amber-500/90 bg-white dark:bg-slate-900 shadow-md ring-2 ring-amber-500/20" : "border-slate-300 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/90"}`}
                >
                  <Search className="ml-3 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500 stroke-[2.5]" />

                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => {
                      setSearchFocused(true);
                      setShowSuggestions(true);
                    }}
                    placeholder="Search CartNow..."
                    className="h-10 w-full bg-transparent px-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none font-medium"
                  />

                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => { setSearchValue(""); setShowSuggestions(false); }}
                      className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer border-none"
                    >
                      <X size={10} />
                    </button>
                  )}
                  {/* Voice Search Mic Button */}
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    aria-label="Search by voice"
                    className={`mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-slate-400 dark:text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 transition cursor-pointer border-none ${isListening ? "bg-red-500/10 text-red-500" : ""}`}
                    title="Search by Voice"
                  >
                    <Mic size={13} className={isListening ? "animate-pulse" : ""} />
                  </button>

                  {/* Orange Search Icon Button */}
                  <button
                    type="submit"
                    aria-label="Submit product search"
                    className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black transition flex items-center justify-center shrink-0 cursor-pointer border-none rounded-r-sm"
                  >
                    <Search size={16} className="text-slate-950 stroke-[2.5]" />
                    <span className="sr-only">Search</span>
                  </button>
                </form>

                {/* Autocomplete dropdown */}
                {showSuggestions && (
                  <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 overflow-hidden rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-4 space-y-4">
                    {/* If search query is empty, show Recents and Trendings */}
                    {!searchValue.trim() ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        {/* Quick Category Shortcuts */}
                        <div className="md:col-span-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                            <Tag size={11} className="text-orange-500" /> Category Shortcuts
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: "Men's Apparel", to: "/product?category=men", emoji: "🤵" },
                              { label: "Women's Apparel", to: "/product?category=women", emoji: "💃" },
                              { label: "Kids' Collection", to: "/product?category=kid", emoji: "👦" },
                              { label: "Electronics", to: "/product?category=electronics", emoji: "🔌" },
                              { label: "Home Decor", to: "/product?category=home", emoji: "🏠" },
                              { label: "Beauty & Care", to: "/product?category=beauty", emoji: "💄" },
                            ].map((item) => (
                              <button
                                key={item.label}
                                type="button"
                                onMouseDown={() => {
                                  setShowSuggestions(false);
                                  navigate(item.to);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-orange-500 hover:bg-orange-50/10 dark:hover:bg-orange-950/10 hover:text-orange-500 dark:hover:text-orange-400 transition cursor-pointer"
                              >
                                <span>{item.emoji}</span>
                                <span>{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Recent Searches */}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                            <RotateCcw size={11} /> Recent Searches
                          </p>
                          {recentSearches.length === 0 ? (
                            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 italic pl-1">No recent searches</p>
                          ) : (
                            <div className="space-y-1">
                              {recentSearches.map((item, index) => (
                                <div key={index} className="flex items-center justify-between group">
                                  <button
                                    type="button"
                                    onMouseDown={() => {
                                      setSearchValue(item);
                                      submitSearch(item);
                                    }}
                                    className="flex-1 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 py-1 transition-colors cursor-pointer"
                                  >
                                    {item}
                                  </button>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      const next = recentSearches.filter((_, i) => i !== index);
                                      setRecentSearches(next);
                                      localStorage.setItem("recent_searches", JSON.stringify(next));
                                    }}
                                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition px-1 opacity-0 group-hover:opacity-100"
                                  >
                                    Clear
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Trending Searches */}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                            <TrendingUp size={11} className="text-orange-500" /> Trending Now
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {trendingSearches.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onMouseDown={() => {
                                  setSearchValue(item);
                                  submitSearch(item);
                                }}
                                className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-orange-500 hover:bg-orange-50/20 dark:hover:bg-orange-950/20 hover:text-orange-500 dark:hover:text-orange-400 transition cursor-pointer"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* If search query has value, show matching suggestions list */
                      <div className="text-left space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Matching Products
                          </p>
                          <span className="text-[10px] font-bold text-slate-400">{suggestions.length} suggestions</span>
                        </div>

                        {suggestions.length === 0 ? (
                          <p className="text-xs text-slate-400 dark:text-slate-500 py-2">No matching products found. Press Enter to search anyway.</p>
                        ) : (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {suggestions.map((p) => (
                              <button
                                key={p._id}
                                onMouseDown={() => submitSearch(p.name)}
                                className="flex w-full items-center gap-3 py-2 text-left hover:bg-orange-50/40 dark:hover:bg-slate-800/40 transition rounded-xl px-1.5 group cursor-pointer"
                              >
                                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                                  <img
                                    src={p.images?.[0]?.startsWith("http") ? p.images[0] : `${backendUrl}/${p.images?.[0]}`}
                                    alt={p.name}
                                    className="h-full w-full object-contain"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                                    {p.name}
                                  </p>
                                  <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                    {p.category}{p.brand ? ` · ${p.brand}` : ""}
                                  </p>
                                </div>
                                <span className="shrink-0 text-xs font-black text-slate-800 dark:text-slate-200">₹{p.price.toLocaleString("en-IN")}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5">
                          <button
                            onMouseDown={() => submitSearch()}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 py-2.5 text-xs font-bold text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-700 transition cursor-pointer"
                          >
                            <Search size={12} />
                            Search all results for "{searchValue}"
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Right Actions ── */}
              <div className="flex items-center gap-1.5 sm:gap-2 ml-auto lg:ml-0">

                {/* Language Selector */}
                <button
                  type="button"
                  onClick={() => changeLanguage(language === "en" ? "hi" : "en")}
                  className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-800/60 text-xs font-extrabold text-slate-800 dark:text-slate-100 transition cursor-pointer bg-transparent shrink-0"
                >
                  <span className="text-sm">🇮🇳</span>
                  <span className="uppercase">{language || "EN"}</span>
                  <ChevronDown size={10} className="text-slate-400" />
                </button>

                {/* Returns & Orders */}
                <Link
                  to={token ? "/orderdetail" : "/login"}
                  className="hidden md:flex flex-col text-left px-2.5 py-1 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-800/60 transition cursor-pointer select-none shrink-0"
                >
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold leading-none">Returns</span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 leading-none mt-0.5">& Orders</span>
                </Link>

                {/* Cart Icon Button (White BG, Sharp Icon) */}
                <Link
                  to="/cart"
                  title="Shopping Cart"
                  className="relative flex h-10 w-10 items-center justify-center rounded-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer select-none shrink-0 group"
                >
                  <ShoppingCart size={19} className="text-slate-900 dark:text-white stroke-[2.2] group-hover:scale-110 transition-transform duration-200" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-white dark:bg-slate-950 text-slate-950 dark:text-white text-[10px] font-black rounded-xs flex items-center justify-center shadow-sm border border-slate-300 dark:border-slate-700">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Notifications Bell */}
                {token && (
                  <div ref={notiRef} className="relative">
                    <button
                      onClick={() => setNotiOpen((p) => !p)}
                      title="Notifications"
                      className={`relative flex h-10 w-10 items-center justify-center rounded-sm border transition-all duration-200 cursor-pointer ${notiOpen ? "border-amber-500/80 bg-amber-500/10 text-amber-500 shadow-sm" : "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-850 hover:text-amber-500 dark:hover:text-amber-400"}`}
                    >
                      <div className="relative flex items-center justify-center h-4 w-4">
                        <Bell size={16} className={unreadCount > 0 ? "animate-wiggle" : ""} />
                        <span className={`absolute -top-1 -right-1 flex h-2.5 w-2.5 transition-all duration-300 pointer-events-none ${unreadCount > 0 ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                        </span>
                      </div>
                    </button>

                    {/* Notifications Dropdown */}
                    {notiOpen && (
                      <div data-lenis-prevent className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-[calc(100%+12px)] sm:w-96 overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in slide-in-from-top-3 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50 dark:bg-slate-900/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Notifications</span>
                            {unreadCount > 0 && (
                              <span className="bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-500 text-[10px] font-black px-2 py-0.5 rounded-full">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-[10px] font-bold text-orange-500 hover:text-orange-600 dark:hover:text-orange-500 flex items-center gap-1 transition cursor-pointer"
                            >
                              <CheckCheck size={12} />
                              <span>Mark all read</span>
                            </button>
                          )}
                        </div>

                        {/* Filter Tabs Header */}
                        <div className="flex gap-1.5 px-4 py-2 border-b border-slate-100/50 dark:border-slate-800/30 bg-slate-50/30 dark:bg-slate-900/10">
                          <button
                            onClick={() => setActiveTab("all")}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "all" ? "bg-slate-900 text-slate-100 dark:text-white dark:bg-white dark:text-slate-950 shadow-sm scale-105" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/20"}`}
                          >
                            All {notifications.length > 0 && `(${notifications.length})`}
                          </button>
                          <button
                            onClick={() => setActiveTab("unread")}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "unread" ? "bg-orange-500 text-slate-100 dark:text-white shadow-sm scale-105" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/20"}`}
                          >
                            Unread {unreadCount > 0 && `(${unreadCount})`}
                          </button>
                        </div>

                        {/* List */}
                        <div className="max-h-[60vh] sm:max-h-[350px] overflow-y-auto divide-y divide-slate-100/50 dark:divide-slate-800/30 scrollbar-hide">
                          {filteredNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                              <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-900/40 text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-slate-800/50 shadow-md">
                                <Bell size={24} className="text-slate-400 dark:text-slate-500" />
                                {notifications.length === 0 && (
                                  <span className="absolute -top-1 -right-1 flex h-3 w-3 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 ring-2 ring-white dark:ring-slate-950" />
                                )}
                              </div>
                              <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                                {activeTab === "unread" ? "No unread alerts" : "Inbox Clean & Clear"}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                                {activeTab === "unread"
                                  ? "You have read all notifications. Switch to 'All' to view history."
                                  : "You're all caught up! When order updates arrive, you'll see them here."}
                              </p>
                            </div>
                          ) : (
                            filteredNotifications.map((n) => {
                              const getNotificationIcon = (title) => {
                                const t = title.toLowerCase();
                                if (t.includes("promo") || t.includes("coupon") || t.includes("discount")) {
                                  return (
                                    <div className="h-8.5 w-8.5 rounded-2xl bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20 shrink-0 shadow-sm animate-pulse">
                                      <Tag size={15} className="stroke-[2.5]" />
                                    </div>
                                  );
                                }
                                if (t.includes("delivered")) {
                                  return (
                                    <div className="h-8.5 w-8.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0 shadow-sm">
                                      <PackageCheck size={15} className="stroke-[2.5]" />
                                    </div>
                                  );
                                }
                                if (t.includes("key") || t.includes("code")) {
                                  return (
                                    <div className="h-8.5 w-8.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0 shadow-sm animate-pulse">
                                      <KeyRound size={15} className="stroke-[2.5]" />
                                    </div>
                                  );
                                }
                                if (t.includes("delivery") || t.includes("shipped") || t.includes("claimed")) {
                                  return (
                                    <div className="h-8.5 w-8.5 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0 shadow-sm">
                                      <Truck size={15} className="stroke-[2.5]" />
                                    </div>
                                  );
                                }
                                return (
                                  <div className="h-8.5 w-8.5 rounded-2xl bg-slate-500/10 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-500/20 shrink-0 shadow-sm">
                                    <Package size={15} className="stroke-[2.5]" />
                                  </div>
                                );
                              };

                              const extractCode = (msg) => {
                                if (!msg) return null;
                                const parts = msg.split("code ");
                                if (parts.length > 1) {
                                  return parts[1].split(" ")[0].replace(/"/g, "");
                                }
                                return null;
                              };

                              const extractPromoCode = (msg) => {
                                if (!msg) return null;
                                const parts = msg.split("code ");
                                if (parts.length > 1) {
                                  return parts[1].split(" ")[0].replace(/"/g, "");
                                }
                                return null;
                              };

                              return (
                                <div
                                  key={n._id}
                                  onClick={() => {
                                    if (n.orderId) {
                                      navigate(`/order/${n.orderId}`);
                                    } else {
                                      navigate("/product");
                                    }
                                    setNotiOpen(false);
                                  }}
                                  className={`px-5 py-4 flex gap-3.5 text-left transition cursor-pointer hover:bg-orange-500/[0.03] dark:hover:bg-orange-500/[0.03] relative group border-l-4 ${!n.isRead ? "bg-orange-500/[0.01] dark:bg-orange-500/[0.01] border-orange-500" : "border-transparent"}`}
                                >
                                  {getNotificationIcon(n.title)}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-start gap-1">
                                      <p className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">{n.title}</p>
                                      <div className="flex items-center justify-center w-5 h-5 shrink-0 relative">
                                        {!n.isRead && (
                                          <>
                                            <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_#ff5100] animate-pulse group-hover:scale-0 transition-transform duration-200 absolute" />
                                            <button
                                              onClick={(e) => handleMarkSingleRead(n._id, e)}
                                              className="scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 p-0.5 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/30 hover:bg-orange-200/50 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer absolute flex items-center justify-center"
                                              title="Mark as read"
                                            >
                                              <Check size={11} className="stroke-[2.5]" />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    {(() => {
                                      const isExpanded = !!expandedNotis[n._id];
                                      const shouldTruncate = n.message.length > 60;
                                      const displayText = shouldTruncate && !isExpanded
                                        ? `${n.message.slice(0, 60)}...`
                                        : n.message;
                                      return (
                                        <div>
                                          <p
                                            onClick={(e) => {
                                              if (shouldTruncate) {
                                                e.stopPropagation();
                                                setExpandedNotis(prev => ({
                                                  ...prev,
                                                  [n._id]: !prev[n._id]
                                                }));
                                              }
                                            }}
                                            className={`text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words ${shouldTruncate ? "cursor-pointer hover:text-slate-700 dark:hover:text-slate-300" : ""}`}
                                            title={shouldTruncate ? (isExpanded ? "Click to collapse" : "Click to view more") : undefined}
                                          >
                                            {displayText}
                                          </p>
                                          {shouldTruncate && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedNotis(prev => ({
                                                  ...prev,
                                                  [n._id]: !prev[n._id]
                                                }));
                                              }}
                                              className="mt-1 text-[9px] font-extrabold text-orange-500 hover:text-orange-600 transition cursor-pointer select-none inline-flex items-center gap-0.5"
                                            >
                                              {isExpanded ? "View Less" : "View More"}
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })()}

                                    {/* Verification Key copyable widget */}
                                    {n.title.toLowerCase().includes("verification") && (() => {
                                      const code = extractCode(n.message);
                                      if (!code) return null;
                                      const isCopied = copiedNotiId === n._id;
                                      return (
                                        <div
                                          onClick={(e) => e.stopPropagation()}
                                          className="mt-2.5 flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 dark:border-amber-500/30 px-3 py-2"
                                        >
                                          <div className="flex items-center gap-2">
                                            <KeyRound size={12} className="text-amber-500 animate-pulse" />
                                            <span className="font-bold text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400">Key:</span>
                                            <span className="font-mono font-black text-xs tracking-wider bg-amber-500/25 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/35">{code}</span>
                                          </div>
                                          <button
                                            onClick={() => {
                                              navigator.clipboard.writeText(code);
                                              setCopiedNotiId(n._id);
                                              toast.success("Verification code copied!");
                                              setTimeout(() => setCopiedNotiId(null), 2000);
                                            }}
                                            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded bg-amber-500 text-slate-100 dark:text-white hover:bg-amber-600 active:scale-95 transition cursor-pointer shadow-sm shadow-amber-500/20"
                                          >
                                            {isCopied ? <Check size={10} /> : <Copy size={10} />}
                                            <span>{isCopied ? "Copied" : "Copy"}</span>
                                          </button>
                                        </div>
                                      );
                                    })()}

                                    {/* Promo Code copyable widget */}
                                    {(n.title.toLowerCase().includes("promo") || n.message.toLowerCase().includes("code")) && (() => {
                                      const code = extractPromoCode(n.message);
                                      if (!code) return null;
                                      const isCopied = copiedNotiId === n._id;
                                      return (
                                        <div
                                          onClick={(e) => e.stopPropagation()}
                                          className="mt-2.5 flex items-center justify-between rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 dark:border-orange-500/30 px-3 py-2"
                                        >
                                          <div className="flex items-center gap-2">
                                            <Tag size={12} className="text-orange-500" />
                                            <span className="font-bold text-[9px] uppercase tracking-wider text-orange-600 dark:text-orange-400">Coupon:</span>
                                            <span className="font-mono font-black text-xs tracking-wider bg-orange-500/25 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded border border-orange-500/35">{code}</span>
                                          </div>
                                          <button
                                            onClick={() => {
                                              navigator.clipboard.writeText(code);
                                              setCopiedNotiId(n._id);
                                              toast.success("Promo code copied!");
                                              setTimeout(() => setCopiedNotiId(null), 2000);
                                            }}
                                            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded bg-orange-500 text-slate-100 dark:text-white hover:bg-orange-600 active:scale-95 transition cursor-pointer shadow-sm shadow-orange-500/20"
                                          >
                                            {isCopied ? <Check size={10} /> : <Copy size={10} />}
                                            <span>{isCopied ? "Copied" : "Copy"}</span>
                                          </button>
                                        </div>
                                      );
                                    })()}

                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-bold tracking-wide">
                                      {new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hello [User] | Account & Lists (MOST RIGHT) */}
                <div ref={profileRef} className="relative hidden md:block shrink-0">
                  <button
                    type="button"
                    onClick={() => { setOpen((p) => !p); setPincodeOpen(false); }}
                    className="flex flex-col text-left px-2.5 py-1 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-800/60 transition cursor-pointer select-none bg-transparent"
                  >
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold leading-none">
                      Hello, {username ? username.split(" ")[0] : "Sign in"}
                    </span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-0.5 leading-none mt-0.5">
                      Account & Lists
                      <ChevronDown size={10} className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  {open && (
                    <div className="absolute right-0 top-[calc(100%+4px)] w-64 overflow-hidden rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                      {token ? (
                        <>
                          {/* User Header */}
                          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5 border-b border-slate-200/80 dark:border-slate-800/80">
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-sm bg-rose-600 text-xs font-black text-white shrink-0 shadow-2xs">
                              {initials || <User size={15} />}
                              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 block leading-none">WELCOME BACK</span>
                              <p className="text-xs font-black text-slate-900 dark:text-white truncate capitalize mt-1 leading-none">{username || "My Account"}</p>
                            </div>
                          </div>

                          {/* Nav Items */}
                          <div className="p-1 space-y-0.5">
                            {[
                              { icon: User, label: t("profile"), to: "/profile" },
                              { icon: Package, label: t("orders"), to: "/orderdetail" },
                              { icon: Heart, label: "Wishlist", to: "/wishlist" },
                              { icon: Globe, label: "Social Feed", to: "/social" },
                              { icon: HelpCircle, label: "Help & Support", to: "/help" },
                            ].map(({ icon: Icon, label, to }) => (
                              <button
                                key={to}
                                onClick={() => { setOpen(false); navigate(to); }}
                                className="flex w-full items-center justify-between px-3 py-1.5 rounded-sm text-left text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-150 cursor-pointer group border-none bg-transparent"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Icon size={14} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                                  <span>{label}</span>
                                </div>
                                <ChevronRight size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150" />
                              </button>
                            ))}
                          </div>

                          {/* Settings Section */}
                          <div className="mx-1 my-1 p-2.5 rounded-sm border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/30 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {isDarkMode ? <Moon size={12} className="text-amber-400" /> : <Sun size={12} className="text-amber-500" />}
                                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">INTERFACE THEME</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                aria-label="Toggle interface theme"
                                className={`relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer border-none ${isDarkMode ? "bg-slate-700" : "bg-slate-300"}`}
                              >
                                <span className={`absolute top-0.5 left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow transition-transform duration-200 ${isDarkMode ? "translate-x-4" : "translate-x-0"}`}>
                                  {isDarkMode ? <Moon size={9} className="text-slate-800" /> : <Sun size={9} className="text-amber-500" />}
                                </span>
                              </button>
                            </div>

                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
                              <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">LANGUAGE</span>
                              <select
                                value={language}
                                onChange={(e) => changeLanguage(e.target.value)}
                                className="h-6 rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 text-[10px] font-extrabold text-slate-800 dark:text-slate-200 cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400"
                              >
                                <option value="en">English (EN)</option>
                                <option value="hi">Hindi (HI)</option>
                                <option value="es">Español (ES)</option>
                              </select>
                            </div>
                          </div>

                          {/* Logout */}
                          <div className="p-1 border-t border-slate-100 dark:border-slate-900/80">
                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center justify-between px-3 py-1.5 rounded-sm text-left text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150 cursor-pointer border-none bg-transparent group"
                            >
                              <div className="flex items-center gap-2.5">
                                <LogOut size={14} className="text-rose-500" />
                                <span>{t("logout")}</span>
                              </div>
                              <ChevronRight size={12} className="text-rose-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 space-y-3">
                          <div className="text-center pb-2 border-b border-slate-100 dark:border-slate-900">
                            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800">
                              <User size={18} />
                            </div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-white">Welcome Guest!</h4>
                            <p className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">Sign in to track orders & details</p>
                          </div>

                          <div className="space-y-1.5">
                            <button
                              onClick={() => { setOpen(false); navigate("/login", { state: { from: location } }); }}
                              className="w-full py-2 rounded-sm bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-center text-xs font-black active:scale-95 transition-all cursor-pointer border-none uppercase tracking-wider shadow-2xs"
                            >
                              {t("login")}
                            </button>
                            <button
                              onClick={() => { setOpen(false); navigate("/signup", { state: { from: location } }); }}
                              className="w-full py-2 rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                            >
                              Create Account
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </nav>

      </header>

      {/* ═══════════ MOBILE SEARCH OVERLAY ═══════════ */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-slate-950 flex flex-col lg:hidden">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-orange-400 bg-orange-50/40 dark:bg-slate-900 ring-2 ring-orange-500/15 px-3 py-2">
              <Search size={16} className="text-orange-500 shrink-0" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
                placeholder="Search products, brands…"
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none font-medium"
              />
              {searchValue && (
                <button onClick={() => setSearchValue("")} className="text-slate-400 cursor-pointer hover:text-slate-600 transition">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => { setMobileSearchOpen(false); setSearchValue(""); }}
              className="text-sm font-bold text-orange-500 cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {suggestions.length > 0 ? (
              <div className="py-2">
                <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <TrendingUp size={10} /> Suggestions
                </p>
                {suggestions.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => { submitSearch(p.name); }}
                    className="flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                      <img
                        src={p.images?.[0]?.startsWith("http") ? p.images[0] : `${backendUrl}/${p.images?.[0]}`}
                        alt={p.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wide">{p.category}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-slate-700 dark:text-slate-300">₹{p.price}</span>
                  </button>
                ))}
              </div>
            ) : searchValue ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                <Search size={40} className="text-slate-200 dark:text-slate-800 mb-4" />
                <p className="text-sm font-semibold text-slate-500">No results for "<span className="text-orange-500">{searchValue}</span>"</p>
              </div>
            ) : (
              <div className="px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                  <TrendingUp size={10} /> Popular Categories
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(navCategories.length > 0 ? navCategories : DEFAULT_CATEGORIES).slice(0, 4).map(({ label, to, emoji }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileSearchOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 p-3 hover:border-orange-300 dark:hover:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950/10 transition cursor-pointer"
                    >
                      <span className="text-xl">{emoji}</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {searchValue && (
              <div className="border-t border-slate-100 dark:border-slate-800 p-4">
                <button
                  onClick={() => submitSearch()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-slate-100 dark:text-white hover:bg-orange-600 active:scale-95 transition cursor-pointer"
                >
                  <Search size={14} />
                  Search all results for "{searchValue}"
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ MOBILE BOTTOM NAV ═══════════ */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.4)]">
        <div className="flex h-16 items-end justify-around pb-2 px-2 safe-area-inset-bottom">
          {BOTTOM_NAV.map(({ label, icon: Icon, to, isProfile }) => {
            if (isProfile) {
              const active = location.pathname === "/profile" || location.pathname === "/login" || location.pathname === "/signup";
              return (
                <button
                  key="profile"
                  onClick={() => {
                    if (token) {
                      navigate("/profile");
                    } else {
                      navigate("/login", { state: { from: { pathname: "/profile" } } });
                    }
                  }}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${active ? "text-[#F43F5E]" : "text-slate-500 dark:text-slate-400"}`}
                >
                  <div className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all ${active ? "bg-[#F43F5E] text-slate-100 dark:text-white shadow-md shadow-[#F43F5E]/30" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                    {token && initials
                      ? <span className="text-[11px] font-black">{initials}</span>
                      : <Icon size={14} />
                    }
                  </div>
                  <span className={`text-[9px] font-bold transition-colors ${active ? "text-[#F43F5E]" : "text-slate-400 dark:text-slate-600"}`}>{label}</span>
                </button>
              );
            }
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${active ? "text-[#F43F5E]" : "text-slate-500 dark:text-slate-400"}`}
              >
                <div className={`relative flex h-7 w-7 items-center justify-center rounded-xl transition-all ${active ? "bg-rose-100 dark:bg-rose-950/30 text-[#F43F5E]" : ""}`}>
                  <Icon size={17} />
                  {label === "Orders" && token && (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#F43F5E]" />
                  )}
                </div>
                <span className={`text-[9px] font-bold transition-colors ${active ? "text-[#F43F5E]" : "text-slate-400 dark:text-slate-500"}`}>{label}</span>
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-[#F43F5E]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;
