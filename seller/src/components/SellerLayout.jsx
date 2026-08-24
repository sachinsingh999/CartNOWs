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
  FileText, Menu, ChevronLeft, Sun, Moon, RotateCcw
} from "lucide-react";

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
      <header className="h-16 border-b border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-xs z-40 relative">
        {/* Left Side: Brand Logo & Navigation Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Open Navigation"
          >
            <Menu size={18} />
          </button>

          <div 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="flex flex-col text-left leading-none">
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">CartNOW</span>
              <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-0.5">Seller Hub</span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

          <h1 className="text-xs font-black text-slate-500 dark:text-slate-400 tracking-wider uppercase hidden sm:block text-left">
            {activeSubTab.replace("-", " ")}
          </h1>
        </div>

        {/* Center: Search */}
        <div className="relative w-48 sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search references..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl pl-8 pr-3.5 py-1.5 text-xs font-semibold outline-none transition focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 font-semibold">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white transition cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => navigate("/notifications")}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Logs Feed"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex h-8 w-8 rounded-xl bg-slate-900 border border-slate-800 items-center justify-center text-slate-100 dark:text-white font-black text-xs uppercase cursor-pointer hover:bg-slate-800 transition shadow-xs"
            >
              {seller?.name ? seller.name[0] : "M"}
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 text-slate-800 dark:text-slate-100 py-1.5 animate-fadeIn">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-2"
                  >
                    <User size={14} className="text-slate-450 dark:text-slate-500" />
                    <span>Profile Settings</span>
                  </button>
                  <hr className="border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer flex items-center gap-2"
                  >
                    <User size={14} className="text-red-500 dark:text-red-450" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Below Navbar */}
      <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden relative w-full">
        {/* Mobile Overlay backdrop */}
        <div 
          className={`fixed inset-0 top-16 z-30 bg-slate-950/45 backdrop-blur-xs transition-opacity lg:hidden ${ isMobileSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none" }`}
          onClick={() => setIsMobileSidebarOpen(false)}
        />

        {/* Left Sidebar Under Navbar */}
        <aside 
          className={`fixed top-16 bottom-0 left-0 z-30 bg-white dark:bg-[#0B0F17] border-r border-slate-200/80 dark:border-slate-850 flex flex-col justify-between text-slate-600 dark:text-slate-300 shrink-0 transition-all duration-300 ease-in-out lg:static ${ isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0" } ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64 overscroll-y-contain overflow-hidden h-full shadow-2xs`}
        >
          <div className="p-3 space-y-4 flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Nav Links Grouped */}
            <nav className="space-y-3 flex-1 overflow-y-auto pr-0.5 custom-scrollbar overscroll-y-contain">
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
                <div key={section.group} className="space-y-1">
                  <div className={`px-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-all duration-300 overflow-hidden whitespace-nowrap select-none ${isSidebarCollapsed ? "opacity-0 max-h-0 my-0 py-0" : "opacity-100 max-h-6 mt-2 mb-1"}`}>
                    {section.group}
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
                        title={isSidebarCollapsed ? item.label : undefined}
                        className={`group w-full flex items-center h-10 px-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-200 cursor-pointer relative overflow-hidden ${
                          isActive
                            ? "bg-orange-500/10 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold border border-orange-500/25 shadow-xs"
                            : "hover:bg-slate-100 dark:hover:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent"
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-orange-500" />
                        )}
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <Icon size={16} className={`transition-transform duration-200 ${isActive ? "text-orange-500 scale-110" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200"}`} />
                        </div>
                        <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[180px] ml-3"}`}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          {/* Bottom Collapse/Expand Toggle */}
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-850 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex w-full items-center h-10 px-3 bg-slate-100/80 dark:bg-slate-900 hover:bg-slate-200/80 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-black uppercase tracking-wider transition-colors duration-200 cursor-pointer border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden relative"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <ChevronLeft size={16} className={`transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180 text-orange-500" : "rotate-0 text-slate-500"}`} />
              </div>
              <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[180px] ml-3"}`}>
                Collapse Sidebar
              </span>
            </button>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950 pb-16 sm:pb-0 p-4 md:p-8 h-full">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet context={contextValues} />
          </div>
        </main>
      </div>

      {/* Sticky Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center py-2.5 shadow-lg sm:hidden">
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
