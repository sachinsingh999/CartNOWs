import React, { useState, useEffect, useRef } from "react";
import Logo from "./Logo";
import { 
  User, 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Sun, 
  Moon, 
  X, 
  ClipboardList, 
  ShoppingBag, 
  RotateCcw, 
  Users, 
  FileText, 
  Layers, 
  Store, 
  UserCheck, 
  Shield, 
  Box, 
  ExternalLink,
  Sliders,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import { useAuth } from "../context/AuthContext";

const NavBar = ({ setToken, toggleSidebar, isCollapsed, theme, setTheme, token }) => {
  const { adminData, isSuperAdmin, hasPermission, defaultRoute, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const displayName = adminData?.name || (isSuperAdmin ? "Superadmin" : "Staff Member");
  const displayEmail = adminData?.email || (isSuperAdmin ? "admin@cartnow.com" : "");
  const roleLabel = isSuperAdmin ? "Superadmin" : "Sub-Admin";
  const avatarLetter = (displayName.charAt(0) || "A").toUpperCase();

  // Global command search keyboard handler (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // Fetch search data when command menu opens
  useEffect(() => {
    if (!isSearchOpen || !token) return;
    const loadData = async () => {
      setLoadingData(true);
      try {
        const promises = [];
        if (isSuperAdmin || hasPermission("products")) {
          promises.push(axios.get(`${backendUrl}/api/product/list`));
        } else {
          promises.push(Promise.resolve({ data: { success: true, products: [] } }));
        }
        if (isSuperAdmin || hasPermission("orders")) {
          promises.push(axios.post(`${backendUrl}/api/order/list`, {}, { headers: { token } }));
        } else {
          promises.push(Promise.resolve({ data: { success: true, orders: [] } }));
        }
        const [prodRes, orderRes] = await Promise.all(promises);
        if (prodRes.data?.success) setAllProducts(prodRes.data.products || []);
        if (orderRes.data?.success) setAllOrders(orderRes.data.orders || []);
      } catch (e) {
        console.error("Failed to fetch search data:", e);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();

    const timer = setTimeout(() => {
      if (searchInputRef.current) searchInputRef.current.focus();
    }, 80);
    return () => clearTimeout(timer);
  }, [isSearchOpen, token, isSuperAdmin]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Navigation routes for quick access
  const navLinks = [
    { path: "/", label: "Dashboard", icon: Settings, superAdminOnly: true },
    { path: "/orders", label: "Orders Board", icon: ShoppingBag, permission: "orders" },
    { path: "/returns", label: "Returns & RMS", icon: RotateCcw, permission: "returns" },
    { path: "/deliverymen", label: "Delivery Fleet", icon: Users, permission: "deliverymen" },
    { path: "/invoices", label: "Invoices", icon: FileText, permission: "finance" },
    { path: "/list", label: "Product Catalog", icon: ClipboardList, permission: "products" },
    { path: "/categories", label: "Categories", icon: Layers, permission: "products" },
    { path: "/sellers", label: "Sellers & Vendors", icon: Store, permission: "sellers" },
    { path: "/customers", label: "Customers", icon: UserCheck, permission: "customers" },
    { path: "/sub-admins", label: "Sub-Admins & Team", icon: Users, permission: "subadmins" },
    { path: "/settings", label: "System Settings", icon: Sliders, superAdminOnly: true },
    { path: "/logs", label: "Audit Logs", icon: Shield, superAdminOnly: true },
  ];

  const filteredNav = navLinks
    .filter((item) => {
      if (isSuperAdmin) return true;
      if (item.superAdminOnly) return false;
      if (!item.permission) return true;
      return hasPermission(item.permission);
    })
    .filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredProducts = searchQuery.trim() === "" ? [] : allProducts.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 5);

  const filteredOrders = searchQuery.trim() === "" ? [] : allOrders.filter((o) =>
    o._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.address?.firstName && o.address.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (o.address?.lastName && o.address.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (o.address?.phone && o.address.phone.includes(searchQuery))
  ).slice(0, 5);

  const handleNavigate = (path) => {
    navigate(path);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <nav className="w-full h-16 flex items-center justify-between px-4 sm:px-6 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-40 backdrop-blur-md transition-colors duration-200 shadow-2xs">
        
        {/* Left Section: Sidebar Toggle & Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={toggleSidebar}
            type="button"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Sidebar"
          >
            <Menu size={19} />
          </button>

          <div 
            onClick={() => navigate(defaultRoute || "/")} 
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            title="Go to Home"
          >
            <Logo className="h-8 sm:h-9 w-auto" />
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
              Admin
            </span>
          </div>
        </div>

        {/* Middle Section: Command Bar Trigger (Desktop) */}
        <div className="hidden md:flex items-center w-[320px] lg:w-[400px]">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between pl-3.5 pr-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-2.5 text-xs">
              <Search size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
              <span className="truncate text-slate-500 dark:text-slate-400 font-normal">
                Search orders, products, views...
              </span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs font-mono">
              <span>⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Section: Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Mobile Search Icon Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            type="button"
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* View Storefront Link */}
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
            title="Open customer storefront in new tab"
          >
            <ExternalLink size={14} />
            <span>Storefront</span>
          </a>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Notifications */}
          <button 
            onClick={() => navigate("/notifications")}
            type="button"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer relative"
            title="Notifications"
            aria-label="View Notifications"
          >
            <Bell size={17} />
            <span className="absolute top-2 right-2 h-2 w-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              type="button"
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/70 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-colors cursor-pointer select-none"
              aria-label="User Menu"
            >
              <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                {avatarLetter}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                  {displayName}
                </span>
                <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                  {roleLabel}
                </span>
              </div>
              <ChevronDown size={13} className="text-slate-400 dark:text-slate-500 ml-0.5" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-black/60 z-50 text-slate-800 dark:text-slate-200 py-2 animate-in fade-in zoom-in-95 duration-150">
                {/* Account details */}
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold uppercase">
                      {roleLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {displayEmail}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowDropdown(false);
                    }}
                    type="button"
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <User size={14} className="text-slate-400" />
                    <span>Profile Settings</span>
                  </button>

                  {(isSuperAdmin || hasPermission("subadmins")) && (
                    <button
                      onClick={() => {
                        navigate("/sub-admins");
                        setShowDropdown(false);
                      }}
                      type="button"
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <Users size={14} className="text-slate-400" />
                      <span>Manage Staff</span>
                    </button>
                  )}

                  {isSuperAdmin && (
                    <button
                      onClick={() => {
                        navigate("/settings");
                        setShowDropdown(false);
                      }}
                      type="button"
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <Settings size={14} className="text-slate-400" />
                      <span>System Settings</span>
                    </button>
                  )}

                  {isSuperAdmin && (
                    <button
                      onClick={() => {
                        navigate("/logs");
                        setShowDropdown(false);
                      }}
                      type="button"
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <Shield size={14} className="text-slate-400" />
                      <span>Audit Logs</span>
                    </button>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => {
                      if (logout) logout();
                      else setToken("");
                      setShowDropdown(false);
                    }}
                    type="button"
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* Spotlight Command Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/50 dark:bg-black/75 backdrop-blur-xs transition-opacity" 
            onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[65vh] z-10 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <Search size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search views, orders, or products..."
                className="w-full bg-transparent border-0 outline-none text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500"
              />
              {loadingData && (
                <span className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
              )}
              <button 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                type="button"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs custom-scrollbar">
              
              {/* Navigation Views */}
              {filteredNav.length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-semibold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
                    Quick Navigation
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {filteredNav.map((link) => {
                      const Icon = link.icon;
                      return (
                        <button
                          key={link.path}
                          onClick={() => handleNavigate(link.path)}
                          type="button"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Icon size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate">{link.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matched Products */}
              {filteredProducts.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
                    Products
                  </p>
                  <div className="space-y-1">
                    {filteredProducts.map((prod) => (
                      <button
                        key={prod._id}
                        onClick={() => handleNavigate("/list")}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {prod.images?.[0] ? (
                            <img
                              src={prod.images[0].startsWith('http') ? prod.images[0] : `${backendUrl}/${prod.images[0]}`}
                              alt={prod.name}
                              className="h-7 w-7 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                              <Box size={14} />
                            </div>
                          )}
                          <div className="truncate">
                            <p className="font-bold text-slate-900 dark:text-white leading-tight truncate">{prod.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{prod.category || "General"}</p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-3">₹{prod.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Orders */}
              {filteredOrders.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
                    Orders
                  </p>
                  <div className="space-y-1">
                    {filteredOrders.map((ord) => (
                      <button
                        key={ord._id}
                        onClick={() => handleNavigate("/orders")}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">#{ord._id.slice(-6).toUpperCase()}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {ord.address?.firstName} {ord.address?.lastName} {ord.address?.phone && `• ${ord.address.phone}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 dark:text-white">₹{ord.amount}</span>
                          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{ord.orderStatus}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {searchQuery.trim() !== "" && filteredNav.length === 0 && filteredProducts.length === 0 && filteredOrders.length === 0 && (
                <div className="py-8 text-center space-y-1.5">
                  <p className="font-bold text-slate-800 dark:text-slate-200">No results found</p>
                  <p className="text-slate-400 text-xs">No views, products, or orders match "{searchQuery}"</p>
                </div>
              )}

            </div>

            {/* Footer Tips */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between font-medium">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[10px]">ESC</kbd> to exit</span>
              <span>Command Palette</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
