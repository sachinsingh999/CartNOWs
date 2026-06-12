import React, { useEffect, useState } from "react";
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
  RotateCcw
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login";
import SignUp from "./pages/SignUp";
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

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("seller_token") || ""
  );
  const [seller, setSeller] = useState(
    JSON.parse(localStorage.getItem("seller_info")) || null
  );

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

      if (productData.images && productData.images.length > 0) {
        const formData = new FormData();
        Object.entries(productData).forEach(([key, val]) => {
          if (key !== "images") {
            formData.append(key, val);
          }
        });

        productData.images.forEach((file) => {
          formData.append("images", file);
        });

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

  const logout = () => {
    setToken("");
    setSeller(null);
    navigate("/login");
  };

  return (
    <div className="bg-slate-50/50 min-h-screen flex flex-col antialiased">
      <ToastContainer position="top-right" autoClose={3000} />
      {token === "" ? (
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} setSeller={setSeller} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <div className="flex flex-1 h-screen overflow-hidden relative">
          
          {/* Mobile Overlay backdrop */}
          <div 
            className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-xs transition-opacity lg:hidden ${
              isMobileSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
            }`}
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Left Sidebar */}
          <aside 
            className={`fixed inset-y-0 left-0 z-50 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between text-slate-300 shrink-0 transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
              isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            } ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
          >
            <div className="p-4 lg:p-6 space-y-6 flex-1 flex flex-col min-h-0">
              
              {/* Logo Section */}
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0">
                  <Logo variant="icon" className="h-full w-full p-1 text-white" />
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex flex-col leading-none transition-opacity duration-200">
                    <span className="text-sm font-extrabold text-white tracking-tight">CartNOW</span>
                    <span className="text-[10px] text-orange-500 font-black uppercase tracking-wider mt-0.5">Seller Hub</span>
                  </div>
                )}
                
                {/* Collapse / Expand Toggle for Desktop */}
                <button 
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  className="hidden lg:flex h-6 w-6 rounded-lg bg-slate-800 border border-slate-700 items-center justify-center text-slate-400 hover:text-white transition shadow-sm ml-auto cursor-pointer"
                  title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                </button>

                {/* Close Drawer Button for Mobile */}
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg transition ml-auto cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="space-y-1 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {[
                  { label: "Dashboard", path: "/", icon: BarChart3, tab: "dashboard" },
                  { label: "Products", path: "/products", icon: Layers, tab: "products" },
                  { label: "Add Product", path: "/add-product", icon: PlusCircle, tab: "add-product" },
                  { label: "Orders", path: "/orders", icon: ShoppingBag, tab: "orders" },
                  { label: "Inventory", path: "/inventory", icon: Package, tab: "inventory" },
                  { label: "Revenue", path: "/revenue", icon: DollarSign, tab: "revenue" },
                  { label: "Analytics", path: "/analytics", icon: TrendingUp, tab: "analytics" },
                  {label: "Invoices", path: "/invoices", icon: FileText, tab: "invoices"},
                  {label: "Reviews", path: "/reviews", icon: MessageSquare, tab: "reviews"},
                  {label: "Returns", path: "/returns", icon: RotateCcw, tab: "returns"},
                  {label: "Notifications", path: "/notifications", icon: Bell, tab: "notifications"},
                  {label: "Settings", path: "/profile", icon: Settings, tab: "settings"},
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
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-[#FF5100] text-white shadow-md shadow-orange-600/25"
                          : "hover:bg-slate-800 hover:text-white text-slate-400"
                      } ${isSidebarCollapsed ? "justify-center" : ""}`}
                    >
                      <Icon size={14} className="shrink-0" />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Profile / Quick Info */}
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => {
                  navigate("/profile");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl bg-slate-955 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition cursor-pointer ${
                  isSidebarCollapsed ? "justify-center" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-[#FF5100] flex items-center justify-center text-white font-black text-xs uppercase shrink-0">
                    {seller?.name ? seller.name[0] : "M"}
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="flex flex-col text-left leading-none min-w-0 transition-opacity duration-200">
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {seller?.shopName || "My Store"}
                      </span>
                      <span className="text-[9px] text-orange-400 font-semibold mt-0.5 truncate">
                        {seller?.name || "Merchant"}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </aside>

          {/* Right Main Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/20 pb-16 sm:pb-0">
            {/* Top Header */}
            <header className="h-16 border-b border-slate-200/80 bg-white px-4 md:px-6 flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-20">
              
              {/* Left Side: Title & Menu toggle */}
              <div className="flex items-center">
                <button 
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition cursor-pointer mr-2"
                  title="Open Navigation"
                >
                  <Menu size={18} />
                </button>
                <h1 className="text-sm font-black text-slate-900 tracking-tight capitalize hidden sm:block">
                  {activeSubTab.replace("-", " ")} Hub
                </h1>
              </div>

              {/* Center: Search */}
              <div className="relative w-48 sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search references..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3.5 py-1.5 text-xs font-semibold outline-none focus:border-slate-800 transition"
                />
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/notifications")}
                  className="relative p-2 text-slate-500 hover:text-slate-800 transition cursor-pointer rounded-xl hover:bg-slate-50"
                  title="Logs Feed"
                >
                  <Bell size={16} />
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#FF5100]" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex h-8 w-8 rounded-xl bg-slate-900 border border-slate-850 items-center justify-center text-white font-black text-xs uppercase cursor-pointer hover:bg-slate-800 transition shadow-sm"
                  >
                    {seller?.name ? seller.name[0] : "M"}
                  </button>

                  {showDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 text-slate-800 py-1.5 animate-fadeIn">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2"
                        >
                          <User size={14} className="text-slate-400" />
                          <span>Profile Settings</span>
                        </button>
                        <hr className="border-slate-100 my-1" />
                        <button
                          onClick={() => {
                            logout();
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-red-650 hover:bg-red-50/50 transition cursor-pointer flex items-center gap-2"
                        >
                          <User size={14} className="text-red-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </header>

            {/* Main scrollable section */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
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
                      <Reviews token={token} />
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
          <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex justify-around items-center py-2.5 shadow-lg sm:hidden">
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
                  className={`flex flex-col items-center gap-0.5 text-[9px] font-extrabold uppercase tracking-wider transition ${
                    isActive ? "text-[#FF5100]" : "text-slate-400 hover:text-slate-600"
                  }`}
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
