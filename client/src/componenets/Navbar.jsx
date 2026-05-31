import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Home,
  Tag,
  HelpCircle,
  TrendingUp,
  Globe,
} from "lucide-react";
import axios from "axios";
import { backendUrl } from "../config";
import { useLanguage } from "../context/LanguageContext";

/* ─────────────── Mobile Bottom Nav items ─────────────── */
const BOTTOM_NAV = [
  { label: "Home",    icon: Home,         to: "/" },
  { label: "Shop",    icon: Tag,          to: "/product" },
  { label: "Wishlist",icon: Heart,        to: "/wishlist" },
  { label: "Orders",  icon: Package,      to: "/orderdetail" },
  { label: "Account", icon: User,         to: null, isProfile: true },
];

/* ─────────────── Main Component ─────────────── */
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, changeLanguage, t } = useLanguage();

  /* State */
  const [cartCount, setCartCount]         = useState(0);
  const [open, setOpen]                   = useState(false);
  const [username, setUsername]           = useState("");
  const [searchValue, setSearchValue]     = useState("");
  const [locationLabel, setLocationLabel] = useState("Use location");
  const [locationLoading, setLocationLoading] = useState(false);
  const [cartBump, setCartBump]           = useState(false);

  /* Search autocomplete */
  const [allProducts, setAllProducts]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  /* Mobile search overlay */
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  /* Refs */
  const profileRef  = useRef(null);
  const searchRef   = useRef(null);
  const mobileSearchInputRef = useRef(null);

  /* Dark mode */
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem("theme") === "dark" ||
    document.documentElement.classList.contains("dark")
  );

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
      if (profileRef.current && !profileRef.current.contains(e.target)) setOpen(false);
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
      const res = await axios.get(`${backendUrl}/api/product/list`);
      if (res.data.success) setAllProducts(res.data.products || []);
    } catch {}
  }, [allProducts.length]);

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
        }).catch(() => {});
      }
    };
    window.addEventListener("storage", handleCartUpdate);
    window.addEventListener("cartUpdate", handleCartUpdate);
    return () => {
      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener("cartUpdate", handleCartUpdate);
    };
  }, [token]);

  useEffect(() => { setSearchValue(query); }, [query]);
  useEffect(() => { setOpen(false); setMobileSearchOpen(false); }, [location.pathname]);

  /* ── Handlers ── */
  const handleLogout = () => {
    localStorage.removeItem("token");
    setOpen(false);
    navigate("/login");
  };

  const submitSearch = (val) => {
    const trimmed = (val ?? searchValue).trim();
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    navigate(`/product${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`);
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
          setLocationLabel(a.city || a.town || a.state_district || a.state || a.country || `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`);
        } catch {
          setLocationLabel(`${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`);
        } finally { setLocationLoading(false); }
      },
      () => { setLocationLoading(false); setLocationLabel("Denied"); },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + "/");

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <>
      {/* ═══════════ TOP NAV BAR ═══════════ */}
      <header className="sticky top-0 z-50 w-full">

        {/* ── Main bar ── */}
        <nav className="border-b border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-[0_1px_3px_0_rgb(0,0,0,0.07)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
            <div className="flex h-16 items-center gap-3 lg:gap-4">

              {/* ── Logo ── */}
              <Link
                to="/"
                className="group flex shrink-0 items-center gap-2.5 select-none"
              >
                <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-500/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-orange-500/30">
                  <img
                    src="/cartnow-logo.svg"
                    alt="CartNOW"
                    className="h-full w-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <span className="absolute text-white font-black text-sm hidden [img:not([src])~&]:flex">C</span>
                </div>
                <div className="hidden sm:flex flex-col leading-none">
                  <span className="text-[18px] font-black tracking-tight text-slate-900 dark:text-white">
                    Cart<span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">NOW</span>
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 group-hover:text-orange-400 transition-colors">
                    Everyday store
                  </span>
                </div>
              </Link>

              {/* ── Desktop Search ── */}
              <div ref={searchRef} className="relative hidden lg:flex flex-1 min-w-0">
                <form
                  onSubmit={(e) => { e.preventDefault(); submitSearch(); }}
                  className={`flex w-full items-center overflow-hidden rounded-2xl border transition-all duration-300 ${
                    searchFocused
                      ? "border-orange-400 bg-white dark:bg-slate-900 shadow-lg shadow-orange-500/10 ring-3 ring-orange-500/15"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60"
                  }`}
                >
                  <Search className="ml-4 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => { setSearchFocused(true); setShowSuggestions(true); fetchAllProducts(); }}
                    placeholder={t("search_placeholder")}
                    className="h-11 w-full bg-transparent px-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none font-medium"
                  />
                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => { setSearchValue(""); setShowSuggestions(false); }}
                      className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="h-11 shrink-0 rounded-r-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 text-[13px] font-bold text-white hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all cursor-pointer select-none"
                  >
                    {t("search_button")}
                  </button>
                </form>

                {/* Autocomplete dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
                    <div className="px-3 pt-3 pb-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <TrendingUp size={10} /> Suggestions
                      </p>
                    </div>
                    {suggestions.map((p) => (
                      <button
                        key={p._id}
                        onMouseDown={() => submitSearch(p.name)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-orange-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                          <img
                            src={p.images?.[0]?.startsWith("http") ? p.images[0] : `${backendUrl}/${p.images?.[0]}`}
                            alt={p.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                            {p.category}{p.brand ? ` · ${p.brand}` : ""}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-slate-700 dark:text-slate-300">₹{p.price}</span>
                      </button>
                    ))}
                    <div className="border-t border-slate-100 dark:border-slate-800 p-2">
                      <button
                        onMouseDown={() => submitSearch()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 py-2 text-xs font-bold text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        <Search size={11} />
                        Search all results for "{searchValue}"
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right Actions ── */}
              <div className="flex items-center gap-1.5 sm:gap-2 ml-auto lg:ml-0">

                {/* Mobile search trigger */}
                <button
                  onClick={() => { setMobileSearchOpen(true); setTimeout(() => mobileSearchInputRef.current?.focus(), 50); fetchAllProducts(); }}
                  className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:scale-105 active:scale-95 transition cursor-pointer"
                  title="Search"
                >
                  <Search size={17} />
                </button>

                {/* Location (desktop) */}
                <button
                  onClick={handleGetLocation}
                  title={locationLabel}
                  className="hidden xl:flex items-center gap-1.5 h-9 rounded-xl border border-slate-200 dark:border-slate-800 px-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:scale-105 active:scale-95 transition cursor-pointer"
                >
                  {locationLoading
                    ? <Navigation size={14} className="animate-spin text-orange-500" />
                    : <MapPin size={14} className="text-orange-500" />
                  }
                  <span className="max-w-24 truncate text-[11px] font-semibold">
                    {locationLoading ? "Locating…" : locationLabel}
                  </span>
                </button>

                {/* AI Try-On */}
                <Link
                  to="/tryon"
                  className="hidden sm:inline-flex items-center gap-1.5 h-9 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3 text-[12px] font-bold text-white shadow-md shadow-orange-500/15 hover:shadow-orange-500/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer select-none whitespace-nowrap"
                >
                  <Sparkles size={13} className="shrink-0" />
                  <span>{t("ai_tryon")}</span>
                </Link>

                {/* Language (desktop) */}
                <div className="hidden lg:flex items-center h-9 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <Globe size={13} className="ml-2.5 text-slate-400 shrink-0" />
                  <select
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="h-full bg-transparent pl-1 pr-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="en">EN</option>
                    <option value="hi">HI</option>
                    <option value="es">ES</option>
                  </select>
                </div>

                {/* Theme toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  title={isDarkMode ? "Light Mode" : "Dark Mode"}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:scale-105 active:scale-95 transition cursor-pointer"
                >
                  {isDarkMode
                    ? <Sun size={16} className="text-amber-400" />
                    : <Moon size={16} />
                  }
                </button>

                {/* Wishlist (desktop) */}
                <Link
                  to="/wishlist"
                  title="My Wishlist"
                  className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-200 dark:hover:border-rose-900/40 hover:scale-105 active:scale-95 transition cursor-pointer"
                >
                  <Heart size={16} className="text-rose-500" />
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:scale-105 active:scale-95 transition cursor-pointer"
                >
                  <ShoppingCart size={16} />
                  {cartCount > 0 && (
                    <span
                      className={`absolute -right-1.5 -top-1.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 px-[3px] text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-950 shadow-md transition-transform ${
                        cartBump ? "scale-125" : "scale-100"
                      }`}
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>

                {/* Profile dropdown */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setOpen((p) => !p)}
                    className={`flex h-9 items-center gap-2 rounded-xl border px-2.5 font-bold text-sm transition-all cursor-pointer select-none ${
                      open
                        ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400"
                        : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-[10px] font-black text-white shadow-sm">
                      {token && initials ? initials : <User size={12} />}
                    </span>
                    <span className="hidden sm:block max-w-[70px] truncate capitalize text-[12px]">
                      {token ? username || t("account") : t("login")}
                    </span>
                    <ChevronDown size={12} className={`hidden sm:block transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown */}
                  {open && (
                    <div className="absolute right-0 top-[calc(100%+8px)] w-60 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in slide-in-from-top-2 duration-150">
                      {token ? (
                        <>
                          {/* User greeting */}
                          <div className="flex items-center gap-3 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-sm font-black text-white shadow-md shadow-orange-500/20">
                              {initials || <User size={16} />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate capitalize">{username || "My Account"}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">CartNOW Member</p>
                            </div>
                          </div>

                          {/* Nav items */}
                          {[
                            { icon: User, label: t("profile"), to: "/profile" },
                            { icon: Package, label: t("orders"), to: "/orderdetail" },
                            { icon: Heart, label: "Wishlist", to: "/wishlist" },
                            { icon: HelpCircle, label: "Help & Support", to: "/help" },
                          ].map(({ icon: Icon, label, to }) => (
                            <button
                              key={to}
                              onClick={() => { setOpen(false); navigate(to); }}
                              className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                            >
                              <Icon size={15} className="text-slate-400 dark:text-slate-500 group-hover:text-orange-500 transition-colors" />
                              <span>{label}</span>
                            </button>
                          ))}

                          {/* Settings section */}
                          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 bg-slate-50/60 dark:bg-slate-900/60">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Theme</span>
                              <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`relative h-6 w-11 rounded-full transition-all cursor-pointer ${isDarkMode ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-700"}`}
                              >
                                <span className={`absolute top-0.5 left-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform ${isDarkMode ? "translate-x-5" : "translate-x-0"}`}>
                                  {isDarkMode ? <Moon size={10} className="text-orange-500" /> : <Sun size={10} className="text-amber-500" />}
                                </span>
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Language</span>
                              <select
                                value={language}
                                onChange={(e) => changeLanguage(e.target.value)}
                                className="h-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                              >
                                <option value="en">EN</option>
                                <option value="hi">HI</option>
                                <option value="es">ES</option>
                              </select>
                            </div>
                          </div>

                          {/* Logout */}
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/15 transition-colors cursor-pointer border-t border-slate-100 dark:border-slate-800"
                          >
                            <LogOut size={15} className="text-red-500" />
                            <span>{t("logout")}</span>
                          </button>
                        </>
                      ) : (
                        <div className="p-4 space-y-3">
                          <div className="text-center pb-2">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                              <User size={22} className="text-slate-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Welcome!</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Sign in to access your account</p>
                          </div>
                          <button
                            onClick={() => { setOpen(false); navigate("/login"); }}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-center text-sm font-bold text-white hover:from-orange-600 hover:to-amber-600 active:scale-95 transition cursor-pointer"
                          >
                            {t("login")}
                          </button>
                          <button
                            onClick={() => { setOpen(false); navigate("/signup"); }}
                            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition cursor-pointer"
                          >
                            Create Account
                          </button>
                          {/* Settings for guests */}
                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={() => setIsDarkMode(!isDarkMode)}
                              className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                            >
                              {isDarkMode ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
                              {isDarkMode ? "Light Mode" : "Dark Mode"}
                            </button>
                            <select
                              value={language}
                              onChange={(e) => changeLanguage(e.target.value)}
                              className="h-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                            >
                              <option value="en">EN</option>
                              <option value="hi">HI</option>
                              <option value="es">ES</option>
                            </select>
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
                  {CATEGORIES.slice(0, 4).map(({ label, to, emoji }) => (
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 active:scale-95 transition cursor-pointer"
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
              return (
                <button
                  key="profile"
                  onClick={() => setOpen((p) => !p)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    open ? "text-orange-500" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <div className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                    open
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}>
                    {token && initials
                      ? <span className="text-[11px] font-black">{initials}</span>
                      : <Icon size={14} />
                    }
                  </div>
                  <span className={`text-[9px] font-bold transition-colors ${open ? "text-orange-500" : "text-slate-400 dark:text-slate-500"}`}>{label}</span>
                </button>
              );
            }
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${
                  active ? "text-orange-500" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <div className={`relative flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
                  active ? "bg-orange-100 dark:bg-orange-950/30" : ""
                }`}>
                  <Icon size={17} />
                  {label === "Wishlist" && (
                    <></>
                  )}
                  {label === "Orders" && token && (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-orange-500" />
                  )}
                </div>
                <span className={`text-[9px] font-bold transition-colors ${active ? "text-orange-500" : "text-slate-400 dark:text-slate-500"}`}>{label}</span>
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-orange-500" />
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
