import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../config";
import Logo from "./Logo";
import { 
  User, BarChart3, Package, ShoppingBag, DollarSign, TrendingUp, 
  MessageSquare, Bell, Settings, Search, PlusCircle, Layers, 
  FileText, Menu, ChevronLeft, Sun, Moon, RotateCcw, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SellerLayout = () => {
  const { token, seller, setSeller, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  let activeSubTab = "dashboard";
  if (location.pathname === "/products") activeSubTab = "products";
  else if (location.pathname === "/add-product") activeSubTab = "add-product";
  else if (location.pathname === "/orders") activeSubTab = "orders";
  else if (location.pathname === "/inventory") activeSubTab = "inventory";
  else if (location.pathname === "/revenue") activeSubTab = "revenue";
  else if (location.pathname === "/analytics") activeSubTab = "analytics";
  else if (location.pathname === "/invoices") activeSubTab = "invoices";
  else if (location.pathname === "/reviews") activeSubTab = "reviews";
  else if (location.pathname === "/notifications") activeSubTab = "notifications";
  else if (location.pathname === "/returns") activeSubTab = "returns";
  else if (location.pathname === "/profile" || location.pathname === "/settings") activeSubTab = "settings";

  const fetchProducts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/seller/products`, {
        headers: { token }
      });
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.log("Could not fetch products from server:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/seller/orders`, {
        headers: { token }
      });
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.log("Could not fetch orders from server:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData) => {
    try {
      let data = productData;
      let headers = { token };

      if ((productData.images && productData.images.length > 0) || productData.existingImages) {
        const formData = new FormData();
        Object.entries(productData).forEach(([key, val]) => {
          if (key !== "images") {
            formData.append(key, val);
          }
        });

        if (productData.images && productData.images.length > 0) {
          productData.images.forEach((file) => {
            formData.append("images", file);
          });
        }

        data = formData;
        headers = {
          token,
          "Content-Type": "multipart/form-data"
        };
      }

      const response = await axios.post(`${backendUrl}/api/seller/add-product`, data, {
        headers
      });
      if (response.data.success) {
        toast.success("Product published successfully!");
        fetchProducts();
        return true;
      } else {
        toast.error(response.data.message || "Failed to add product");
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await axios.post(`${backendUrl}/api/seller/delete-product`, { id }, {
        headers: { token }
      });
      if (response.data.success) {
        toast.success("Product deleted");
        fetchProducts();
      } else {
        setProducts(prev => prev.filter(p => p._id !== id));
        toast.success("Demo Product removed");
      }
    } catch (error) {
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success("Demo Product removed");
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchOrders();
    }
  }, [token]);

  const contextValues = {
    token,
    seller,
    setSeller,
    products,
    orders,
    loading,
    fetchProducts,
    fetchOrders,
    addProduct,
    deleteProduct,
    logout
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden relative bg-slate-50 dark:bg-slate-950 w-full">
      {/* Top Full-Width Header / Navigation Bar */}
      <header className="h-14 md:h-16 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md pl-1.5 sm:pl-3 pr-3 md:pr-6 flex items-center justify-between shrink-0 z-40 relative shadow-xs">
        {/* Subtle Ambient Bottom Glow Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent pointer-events-none" />

        {/* Left Side: Brand Logo & Navigation Title */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => navigate("/")}
            className="-ml-1 flex items-center gap-2 cursor-pointer group select-none"
          >
            <Logo className="h-8 sm:h-10 w-32 sm:w-40 text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-200" />
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span className="px-2.5 py-1 bg-orange-500/10 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              {activeSubTab.replace("-", " ")}
            </span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="relative w-44 sm:w-80 group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="Search catalog, orders..."
            className="w-full bg-slate-100/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 rounded-xl pl-9 pr-12 py-1.5 text-xs font-semibold outline-none transition-all duration-200 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-orange-500/25"
          />
          <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-white dark:bg-slate-950 rounded-md shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 font-semibold">
          {/* Notifications Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/notifications")}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-200/80 dark:hover:bg-slate-850 transition cursor-pointer"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
          </motion.button>

          {/* Theme Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-200/80 dark:hover:bg-slate-850 transition cursor-pointer"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-600" />}
          </motion.button>

          {/* Profile Dropdown Toggle */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1.5 pl-1.5 pr-3 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-200/80 dark:hover:bg-slate-850 transition cursor-pointer"
            >
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs relative">
                {seller?.name ? seller.name[0].toUpperCase() : "S"}
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-white dark:ring-slate-950" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:block max-w-[100px] truncate">
                {seller?.shopName || seller?.name || "Merchant"}
              </span>
              <ChevronLeft size={13} className={`text-slate-400 transition-transform duration-200 hidden md:block ${showDropdown ? "rotate-90" : "-rotate-90"}`} />
            </motion.button>

            {/* Profile Menu Popup */}
            <AnimatePresence>
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl py-1.5 z-50 text-left overflow-hidden"
                  >
                    <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/40">
                      <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">{seller?.name || "Merchant User"}</p>
                      <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{seller?.email}</p>
                    </div>
                    
                    <button 
                      onClick={() => { navigate("/profile"); setShowDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer flex items-center gap-2.5"
                    >
                      <Settings size={14} className="text-slate-400" />
                      <span>Store Settings</span>
                    </button>
                    
                    <button 
                      onClick={() => { navigate("/notifications"); setShowDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer flex items-center gap-2.5"
                    >
                      <Bell size={14} className="text-slate-400" />
                      <span>Notifications</span>
                    </button>

                    <div className="my-1" />

                    <button 
                      onClick={() => { logout(); setShowDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-extrabold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer flex items-center gap-2.5"
                    >
                      <User size={14} className="text-red-500 dark:text-red-400" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle Button */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-900 transition cursor-pointer shadow-2xs"
            title="Open Navigation"
          >
            <Menu size={18} />
          </motion.button>
        </div>
      </header>

      {/* Main Body Below Navbar */}
      <div className="flex flex-1 overflow-hidden relative w-full">
        {/* Mobile Overlay backdrop */}
        <div 
          className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity md:hidden ${ isMobileSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none" }`}
          onClick={() => setIsMobileSidebarOpen(false)}
        />

        {/* Sidebar Panel (Framer Motion Controlled Width & Collapse) */}
        <motion.aside 
          animate={{
            width: isMobile 
              ? (isMobileSidebarOpen ? 288 : 0) 
              : (isSidebarCollapsed ? 72 : 240)
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 bottom-0 right-0 z-50 md:static bg-white dark:bg-[#0B0F17] flex flex-col justify-between text-slate-600 dark:text-slate-300 shrink-0 overflow-hidden h-full shadow-2xl md:shadow-none"
        >
          <div className="p-2 space-y-2 flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Mobile Header Inside Drawer */}
            <div className="flex items-center justify-between px-1 pb-2 md:hidden">
              <div className="flex items-center gap-2">
                <Logo className="h-6 w-auto text-slate-900 dark:text-white" />
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Nav Links Grouped */}
            <nav className="space-y-1 flex-1 overflow-y-auto pr-0.5 custom-scrollbar overscroll-y-contain">
              {[
                {
                  group: "Overview",
                  items: [
                    { label: "Dashboard", path: "/", icon: BarChart3, tab: "dashboard" },
                    { label: "Analytics", path: "/analytics", icon: TrendingUp, tab: "analytics" },
                  ]
                },
                {
                  group: "Catalog & Inventory",
                  items: [
                    { label: "Products", path: "/products", icon: Layers, tab: "products" },
                    { label: "Add Product", path: "/add-product", icon: PlusCircle, tab: "add-product" },
                    { label: "Inventory", path: "/inventory", icon: Package, tab: "inventory" },
                  ]
                },
                {
                  group: "Sales & Fulfillment",
                  items: [
                    { label: "Orders", path: "/orders", icon: ShoppingBag, tab: "orders" },
                    { label: "Returns", path: "/returns", icon: RotateCcw, tab: "returns" },
                    { label: "Reviews", path: "/reviews", icon: MessageSquare, tab: "reviews" },
                  ]
                },
                {
                  group: "Finance & Config",
                  items: [
                    { label: "Revenue", path: "/revenue", icon: DollarSign, tab: "revenue" },
                    { label: "Invoices", path: "/invoices", icon: FileText, tab: "invoices" },
                    { label: "Notifications", path: "/notifications", icon: Bell, tab: "notifications" },
                    { label: "Settings", path: "/profile", icon: Settings, tab: "settings" },
                  ]
                }
              ].map((section) => (
                <div key={section.group} className="space-y-0.5">
                  <div className="h-4 px-2.5 flex items-center overflow-hidden select-none my-1">
                    <AnimatePresence initial={false}>
                      {(!isSidebarCollapsed || isMobile) && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap"
                        >
                          {section.group}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSubTab === item.tab;
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          navigate(item.path);
                          setIsMobileSidebarOpen(false);
                        }}
                        title={isSidebarCollapsed && !isMobile ? item.label : undefined}
                        className={`group w-full flex items-center h-8.5 px-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-200 cursor-pointer relative overflow-hidden ${
                          isActive
                            ? "bg-orange-500/10 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold shadow-xs"
                            : "hover:bg-slate-100 dark:hover:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r bg-orange-500 transition-all duration-200" />
                        )}
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <Icon size={16} className={`transition-transform duration-200 ${isActive ? "text-orange-500 scale-110" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200"}`} />
                        </div>
                        
                        <AnimatePresence initial={false}>
                          {(!isSidebarCollapsed || isMobile) && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="whitespace-nowrap overflow-hidden ml-2.5"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          {/* Bottom Collapse/Expand Toggle */}
          <div className="p-2 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex w-full items-center h-8.5 px-2.5 bg-slate-100/80 dark:bg-slate-900 hover:bg-slate-200/80 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-black uppercase tracking-wider transition-colors duration-200 active:scale-[0.98] cursor-pointer shadow-xs overflow-hidden relative"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <motion.div
                animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-5 h-5 flex items-center justify-center shrink-0"
              >
                <ChevronLeft size={16} className={isSidebarCollapsed ? "text-orange-500" : "text-slate-500"} />
              </motion.div>

              <AnimatePresence initial={false}>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap overflow-hidden ml-2.5"
                  >
                    Collapse Sidebar
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.aside>

        {/* Right Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950 pb-16 sm:pb-0 p-1.5 sm:p-2.5 h-full">
          <div className="w-full">
            <Outlet context={contextValues} />
          </div>
        </main>
      </div>

      {/* Sticky Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 flex justify-around items-center py-2.5 shadow-lg sm:hidden">
        {[
          { label: "Dashboard", path: "/", icon: BarChart3, tab: "dashboard" },
          { label: "Products", path: "/products", icon: Layers, tab: "products" },
          { label: "Orders", path: "/orders", icon: ShoppingBag, tab: "orders" },
          { label: "Profile", path: "/profile", icon: User, tab: "settings" }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.tab;
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-extrabold uppercase tracking-wider transition ${ isActive ? "text-brand" : "text-slate-400 hover:text-slate-600" }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SellerLayout;
