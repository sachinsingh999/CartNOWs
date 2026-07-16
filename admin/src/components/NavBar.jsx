import React, { useState, useEffect, useRef } from "react";
import Logo from "./Logo";
import { User, Menu, Search, Bell, Settings, LogOut, ChevronDown, Sun, Moon, X, ClipboardList, ShoppingBag, RotateCcw, Users, FileText, Layers, Store, UserCheck, DollarSign, Megaphone, Ticket, MessageSquare, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";

const NavBar = ({ setToken, toggleSidebar, isCollapsed, theme, setTheme, token }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // Global command search keyboard handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch search data when command menu is opened
  useEffect(() => {
    if (!isSearchOpen || !token) return;
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [prodRes, orderRes] = await Promise.all([
          axios.get(`${backendUrl}/api/product/list`),
          axios.post(`${backendUrl}/api/order/list`, {}, { headers: { token } })
        ]);
        if (prodRes.data.success) setAllProducts(prodRes.data.products);
        if (orderRes.data.success) setAllOrders(orderRes.data.orders);
      } catch (e) {
        console.error("Failed to fetch search data:", e);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
    // Auto-focus input
    setTimeout(() => {
      if (searchInputRef.current) searchInputRef.current.focus();
    }, 100);
  }, [isSearchOpen, token]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Static Navigation Links for search
  const navLinks = [
    { path: "/", label: "Dashboard", category: "Navigation", icon: Settings },
    { path: "/orders", label: "Orders Board", category: "Navigation", icon: ShoppingBag },
    { path: "/returns", label: "Returns", category: "Navigation", icon: RotateCcw },
    { path: "/deliverymen", label: "Deliverymen", category: "Navigation", icon: Users },
    { path: "/invoices", label: "Invoices", category: "Navigation", icon: FileText },
    { path: "/list", label: "Product List", category: "Navigation", icon: ClipboardList },
    { path: "/categories", label: "Categories", category: "Navigation", icon: Layers },
    { path: "/sellers", label: "Sellers", category: "Navigation", icon: Store },
    { path: "/customers", label: "Customers", category: "Navigation", icon: UserCheck },
    { path: "/support", label: "Support Tickets", category: "Navigation", icon: MessageSquare },
    { path: "/logs", label: "Audit Logs", category: "Navigation", icon: Shield },
  ];

  // Filtering Logic
  const filteredNav = navLinks.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = searchQuery.trim() === "" ? [] : allProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 5);

  const filteredOrders = searchQuery.trim() === "" ? [] : allOrders.filter(o =>
    o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.address.firstName && o.address.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (o.address.lastName && o.address.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (o.address.phone && o.address.phone.includes(searchQuery))
  ).slice(0, 5);

  const handleNavigate = (path) => {
    navigate(path);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <nav className="w-full h-[60px] flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-white/[0.08] z-40 sticky top-0 shadow-xs transition-colors duration-250">
        
        {/* Left section: Logo & Collapse Toggle */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] transition duration-200 cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Menu size={18} />
          </button>

          <div 
            onClick={() => navigate("/")} 
            className="flex items-center cursor-pointer select-none group"
            title="Go to Dashboard"
          >
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition duration-200">CartNOW</span>
              <span className="text-[9px] text-blue-700 dark:text-blue-400 font-extrabold uppercase tracking-widest mt-0.5">Control Center</span>
            </div>
          </div>
        </div>

        {/* Middle section: Active Command Search Bar */}
        <div className="hidden md:flex items-center w-[360px] relative">
          <Search size={14} className="absolute left-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search logs, orders, or catalogs..."
            onClick={() => setIsSearchOpen(true)}
            readOnly
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] rounded-lg text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 cursor-pointer outline-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          />
          <span className="absolute right-3 text-[10px] text-slate-400 dark:text-slate-500 font-bold bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/[0.06] select-none font-mono">
            ⌘K
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] transition duration-200 cursor-pointer"
          >
            <Search size={16} />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] transition duration-200 cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button 
            onClick={() => navigate("/notifications")}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] transition duration-200 cursor-pointer relative"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-blue-500 rounded-full" />
          </button>

          {/* User profile actions */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white rounded-lg transition duration-200 cursor-pointer select-none"
            >
              <div className="h-5.5 w-5.5 rounded-full bg-blue-600 flex items-center justify-center text-slate-100 dark:text-white font-extrabold text-[10px] uppercase shadow-xs">
                A
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">System Admin</span>
              </div>
              <ChevronDown size={12} className="text-slate-500 dark:text-slate-400" />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-xl z-50 text-slate-800 dark:text-slate-200 py-1.5 animate-fadeIn">
                  <div className="px-4 py-1.5 text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                    Operational Control
                  </div>
                  <hr className="border-slate-100 dark:border-white/[0.06] my-1.5" />
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition cursor-pointer flex items-center gap-2"
                  >
                    <User size={13} className="text-slate-400" />
                    <span>Profile Settings</span>
                  </button>
                  <hr className="border-slate-100 dark:border-white/[0.06] my-1.5" />
                  <button
                    onClick={() => {
                      setToken("");
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer flex items-center gap-2"
                  >
                    <LogOut size={13} className="text-rose-500 dark:text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Spotlight / Command Search Dialog Overlay ── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity duration-200" 
            onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh] mx-4 animate-scaleUp">
            
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-white/[0.06]">
              <Search size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search orders, products, or views..."
                className="w-full bg-transparent border-0 outline-none text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500"
              />
              {loadingData && (
                <span className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
              )}
              <button 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Results list */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar text-xs">
              
              {/* Navigation Group */}
              {filteredNav.length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-bold text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 px-2">Navigation Views</p>
                  <div className="grid grid-cols-2 gap-1">
                    {filteredNav.map((link) => {
                      const Icon = link.icon;
                      return (
                        <button
                          key={link.path}
                          onClick={() => handleNavigate(link.path)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition duration-150 cursor-pointer"
                        >
                          <Icon size={14} className="text-slate-400" />
                          <span>{link.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Products Group */}
              {filteredProducts.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                  <p className="font-bold text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 px-2">Matched Products</p>
                  <div className="space-y-1">
                    {filteredProducts.map((prod) => (
                      <button
                        key={prod._id}
                        onClick={() => handleNavigate("/list")}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 transition duration-150 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img src={prod.image?.[0]} alt={prod.name} className="h-6 w-6 rounded-md object-cover bg-slate-50 dark:bg-slate-950" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">{prod.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{prod.category || "General"}</p>
                          </div>
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-white">₹{prod.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Group */}
              {filteredOrders.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                  <p className="font-bold text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 px-2">Matched Orders</p>
                  <div className="space-y-1">
                    {filteredOrders.map((ord) => (
                      <button
                        key={ord._id}
                        onClick={() => handleNavigate("/orders")}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 transition duration-150 cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">#{ord._id.slice(-6).toUpperCase()}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{ord.address.firstName} {ord.address.lastName} • {ord.address.phone}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-900 dark:text-white">₹{ord.amount}</span>
                          <p className="text-[9px] font-bold text-blue-500 mt-0.5">{ord.orderStatus}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {searchQuery.trim() !== "" && filteredNav.length === 0 && filteredProducts.length === 0 && filteredOrders.length === 0 && (
                <div className="py-8 text-center space-y-2">
                  <p className="font-bold text-slate-800 dark:text-slate-200">No results found</p>
                  <p className="text-slate-400 mt-1">No navigation views, products, or orders match "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-white/[0.06] text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between font-bold">
              <span>Press <kbd className="bg-white dark:bg-gray-900 px-1 py-0.5 rounded border border-slate-200 dark:border-white/[0.08] shadow-xs">ESC</kbd> to close</span>
              <span>⌘K Search Console</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
