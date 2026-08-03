import React, { useEffect, useState, useCallback } from "react";
import { Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
import { 
  User, 
  BarChart3, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  MessageSquare, 
  Bell, 
  Settings, 
  Search, 
  PlusCircle, 
  Layers,
  FileText,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sun,
  Moon,
  PanelLeft
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login";
import SignUp from "./pages/SignUp";
import Landing from "./pages/Landing";
import Logo from "./components/Logo";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Inventory from "./pages/Inventory";
import Revenue from "./pages/Revenue";
import Analytics from "./pages/Analytics";
import Reviews from "./pages/Reviews";
import Notifications from "./pages/Notifications";
import SellerInvoices from "./pages/SellerInvoices";
import Returns from "./pages/Returns";
import { backendUrl } from "./config";

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("seller_token") || ""
  );
  const [seller, setSeller] = useState(
    JSON.parse(localStorage.getItem("seller_info")) || null
  );

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  useEffect(() => {
    localStorage.setItem("seller_token", token);
    if (seller) {
      localStorage.setItem("seller_info", JSON.stringify(seller));
    } else {
      localStorage.removeItem("seller_info");
    }
  }, [token, seller]);

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
      console.log("Could not fetch products from server, using demo items:", error.message);
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

  const logout = useCallback(() => {
    setToken("");
    setSeller(null);
    localStorage.removeItem("seller_token");
    localStorage.removeItem("seller_info");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        toast.error("Session expired. Please log in again.");
        logout();
      } else {
        fetchProducts();
        fetchOrders();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, logout]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          if (localStorage.getItem("seller_token")) {
            toast.error(error.response.data?.message || "Session expired. Please log in again.");
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  return (
    <div className={`bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen flex flex-col antialiased transition-colors duration-200 ${token ? "h-[100dvh] overflow-hidden" : ""}`}>
      <ToastContainer position="top-right" autoClose={3000} theme={theme} />
      {token === "" ? (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login setToken={setToken} setSeller={setSeller} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <div className="flex flex-col h-screen overflow-hidden relative bg-slate-50 dark:bg-slate-950">
          
          {/* Top Full-Width Header / Navigation Bar */}
          <header className="h-16 border-b border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-xs z-40 relative">
            
            {/* Left Side: Brand Logo & Navigation Title */}
            <div className="flex items-center gap-3">
              {/* Mobile Drawer Toggle */}
              <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Open Navigation"
              >
                <Menu size={18} />
              </button>

              {/* Navbar Brand Logo */}
              <div 
                onClick={() => navigate("/")}
                className="flex items-center gap-2.5 cursor-pointer group select-none"
              >
                <div className="h-9 w-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-xs">
                  <Logo variant="icon" className="h-full w-full p-1 text-orange-600 dark:text-orange-400" />
                </div>
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
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
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
          <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden relative">
            
            {/* Mobile Overlay backdrop */}
            <div 
              className={`fixed inset-0 top-16 z-30 bg-slate-950/45 backdrop-blur-xs transition-opacity lg:hidden ${ isMobileSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none" }`}
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            {/* Left Sidebar Under Navbar */}
            <aside 
              className={`fixed top-16 bottom-0 left-0 z-30 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 flex flex-col justify-between text-slate-600 dark:text-slate-300 shrink-0 transform transition-all duration-300 ease-in-out lg:static ${ isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0" } ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64 overscroll-y-contain overflow-hidden h-full`}
            >
              <div className={`p-3 ${isSidebarCollapsed ? "lg:px-3 lg:py-4" : "lg:p-4"} space-y-4 flex-1 flex flex-col min-h-0`}>
                
                {/* Nav Links */}
                <nav className="space-y-1 flex-1 overflow-y-auto pr-1 custom-scrollbar overscroll-y-contain">
                  {[
                    { label: "Dashboard", path: "/", icon: BarChart3, tab: "dashboard" },
                    { label: "Products", path: "/products", icon: Layers, tab: "products" },
                    { label: "Add Product", path: "/add-product", icon: PlusCircle, tab: "add-product" },
                    { label: "Orders", path: "/orders", icon: ShoppingBag, tab: "orders" },
                    { label: "Inventory", path: "/inventory", icon: Package, tab: "inventory" },
                    { label: "Revenue", path: "/revenue", icon: DollarSign, tab: "revenue" },
                    { label: "Analytics", path: "/analytics", icon: TrendingUp, tab: "analytics" },
                    { label: "Invoices", path: "/invoices", icon: FileText, tab: "invoices" },
                    { label: "Reviews", path: "/reviews", icon: MessageSquare, tab: "reviews" },
                    { label: "Returns", path: "/returns", icon: RotateCcw, tab: "returns" },
                    { label: "Notifications", path: "/notifications", icon: Bell, tab: "notifications" },
                    { label: "Settings", path: "/profile", icon: Settings, tab: "settings" },
                  ].map((item) => {
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
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ease-in-out cursor-pointer ${ isActive ? "bg-brand text-white shadow-md shadow-orange-600/25" : "hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400" }`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <Icon size={16} className="transition-transform duration-300" />
                        </div>
                        <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "max-w-0 opacity-0 translate-x-[-10px] pointer-events-none" : "max-w-xs opacity-100 translate-x-0"}`}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Collapse/Expand Toggle */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden lg:flex w-full items-center gap-3 py-2.5 px-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden"
                  title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <ChevronLeft size={16} className={`transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180 text-orange-500" : "rotate-0"}`} />
                  </div>
                  <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "max-w-0 opacity-0 translate-x-[-10px] pointer-events-none" : "max-w-xs opacity-100 translate-x-0"}`}>
                    Collapse Sidebar
                  </span>
                </button>
              </div>
            </aside>

            {/* Right Main Content */}
            <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950 pb-16 sm:pb-0 p-4 md:p-8">
              <div className="mx-auto w-full max-w-[1600px]">
                <Routes>
                  <Route 
                    path="/" 
                    element={
                      <Dashboard 
                        token={token} 
                        seller={seller} 
                        products={products}
                        orders={orders}
                      />
                    } 
                  />
                  <Route 
                    path="/products" 
                    element={
                      <Products 
                        token={token} 
                        products={products}
                        deleteProduct={deleteProduct}
                        loading={loading}
                        fetchProducts={fetchProducts}
                      />
                    } 
                  />
                  <Route 
                    path="/add-product" 
                    element={
                      <AddProduct 
                        token={token} 
                        addProduct={addProduct}
                        products={products}
                        fetchProducts={fetchProducts}
                      />
                    } 
                  />
                  <Route 
                    path="/orders" 
                    element={
                      <Orders 
                        orders={orders}
                      />
                    } 
                  />
                  <Route 
                    path="/inventory" 
                    element={
                      <Inventory 
                        token={token}
                        products={products}
                        fetchProducts={fetchProducts}
                      />
                    } 
                  />
                  <Route 
                    path="/revenue" 
                    element={
                      <Revenue 
                        token={token}
                        seller={seller}
                        orders={orders}
                      />
                    } 
                  />
                  <Route 
                    path="/analytics" 
                    element={
                      <Analytics 
                        products={products}
                        orders={orders}
                      />
                    } 
                  />
                  <Route 
                    path="/invoices" 
                    element={
                      <SellerInvoices token={token} />
                    } 
                  />
                  <Route 
                    path="/reviews" 
                    element={
                      <Reviews token={token} products={products} />
                    } 
                  />
                  <Route 
                    path="/returns" 
                    element={
                      <Returns token={token} />
                    } 
                  />
                  <Route 
                    path="/notifications" 
                    element={
                      <Notifications 
                        token={token}
                        products={products}
                        orders={orders}
                      />
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <Profile 
                        token={token} 
                        seller={seller}
                        setSeller={setSeller}
                      />
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
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
      )}
    </div>
  );
};

export default App;
