import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Headset, 
  LogOut, 
  Mail, 
  Package, 
  ShieldCheck, 
  User, 
  Sparkles, 
  DollarSign, 
  Award, 
  Calendar, 
  ArrowRight,
  Plus,
  Trash2,
  MapPin,
  X,
  CreditCard,
  Settings,
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import { backendUrl } from "../config";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "react-toastify";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [activeShipments, setActiveShipments] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Tab State: dashboard | addresses | feedback | security
  const [activeProfileTab, setActiveProfileTab] = useState("dashboard");

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
  });
  const [adding, setAdding] = useState(false);

  const [appRating, setAppRating] = useState(0);
  const [appComment, setAppComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (user && user.appReview) {
      setAppRating(user.appReview.rating || 0);
      setAppComment(user.appReview.comment || "");
    }
  }, [user]);

  const handleAppReviewSubmit = async (e) => {
    e.preventDefault();
    if (appRating === 0) {
      toast.error("Please select a rating of at least 1 star.");
      return;
    }
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${backendUrl}/api/user/app-review`,
        { rating: appRating, comment: appComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setUser(prev => ({ ...prev, appReview: res.data.appReview }));
        toast.success("Thank you for your feedback! 🌟");
      } else {
        toast.error(res.data.message || "Failed to submit feedback.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit feedback.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { firstName, email, phone, street, city, state, country } = newAddress;
    if (!firstName || !email || !phone || !street || !city || !state || !country) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${backendUrl}/api/user/add-address`, newAddress, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUser(prev => ({ ...prev, addresses: res.data.addresses }));
        setShowAddressModal(false);
        setNewAddress({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          country: "",
        });
        toast.success("Address added successfully!");
      } else {
        toast.error(res.data.message || "Failed to add address.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add address.");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${backendUrl}/api/user/delete-address`, { addressId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUser(prev => ({ ...prev, addresses: res.data.addresses }));
        toast.success("Address deleted successfully!");
      } else {
        toast.error(res.data.message || "Failed to delete address.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete address.");
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const [profileRes, ordersRes] = await Promise.all([
          axios.get(`${backendUrl}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.post(`${backendUrl}/api/order/userOrder`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (profileRes.data.success) {
          setUser(profileRes.data.user);
        }

        if (ordersRes.data.success) {
          const fetchedOrders = ordersRes.data.orders;
          setOrders(fetchedOrders);

          let spent = 0;
          let active = 0;
          fetchedOrders.forEach((order) => {
            spent += order.amount;
            if (
              order.orderStatus &&
              order.orderStatus.toLowerCase() !== "delivered" &&
              order.orderStatus.toLowerCase() !== "cancelled"
            ) {
              active += 1;
            }
          });
          setTotalSpent(spent);
          setActiveShipments(active);
        }
      } catch (error) {
        console.log("PROFILE FETCH ERROR 👉", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-200">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-900 dark:border-slate-800 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-550 dark:text-slate-400 mt-4">Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 transition-colors duration-200">
        <MapPin size={48} className="text-slate-400 animate-bounce" />
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-4">No user data found.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 px-5 py-2.5 text-xs font-bold text-white transition cursor-pointer"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const initial = user.name?.charAt(0)?.toUpperCase() || "U";
  
  const getLoyaltyTier = () => {
    if (totalSpent > 15000) return { name: "Platinum VIP Member", color: "from-purple-600 to-indigo-650", text: "text-purple-500" };
    if (totalSpent > 5000) return { name: "Gold Member", color: "from-amber-500 to-orange-550", text: "text-amber-500" };
    return { name: "Silver Member", color: "from-slate-500 to-slate-700", text: "text-slate-500" };
  };

  const tier = getLoyaltyTier();

  const renderVIPCard = () => {
    let cardGradient = "from-slate-800 via-slate-900 to-slate-950 border-slate-700/60 shadow-black/40";
    let textGlow = "text-slate-400";
    if (totalSpent > 15000) {
      cardGradient = "from-purple-900 via-indigo-950 to-slate-950 border-purple-500/30 shadow-purple-500/10";
      textGlow = "text-indigo-400";
    } else if (totalSpent > 5000) {
      cardGradient = "from-amber-600 via-orange-850 to-slate-950 border-amber-500/35 shadow-orange-500/10";
      textGlow = "text-amber-400";
    }

    return (
      <div className={`relative overflow-hidden rounded-[28px] bg-gradient-to-tr ${cardGradient} p-6 sm:p-7 text-white border border-white/5 shadow-2xl h-52 w-full sm:w-96 max-w-sm sm:max-w-none flex flex-col justify-between select-none`}>
        {/* Glow ball overlays */}
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 h-36 w-36 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />

        <div className="flex justify-between items-start w-full relative z-10 text-left">
          <div>
            <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Loyalty Tier card</p>
            <h3 className={`text-base font-black tracking-wide mt-1.5 uppercase ${textGlow}`}>{tier.name}</h3>
          </div>
          {/* Card chip */}
          <div className="h-7 w-10 rounded-md bg-amber-400/20 border border-amber-400/30 flex items-center justify-center relative overflow-hidden shrink-0">
            <div className="absolute inset-x-2.5 top-0 bottom-0 border-x border-amber-400/40" />
            <div className="absolute inset-y-2.5 top-0 bottom-0 border-y border-amber-400/40" />
          </div>
        </div>

        <div className="flex justify-between items-end w-full relative z-10 text-left">
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Card Holder</p>
            <p className="text-xs font-black tracking-wider uppercase text-slate-100 mt-0.5">{user.name}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Member Since</p>
            <p className="text-xs font-mono font-black uppercase text-slate-200 mt-0.5">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-200 text-left">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Main Grid Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          
          {/* LEFT SIDEBAR: PROFILE SUMMARY */}
          <div className="rounded-[32px] border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 space-y-8 shadow-sm">
            {/* User Details */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative group select-none">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-orange-500 to-indigo-500 opacity-75 blur transition duration-500 group-hover:opacity-100" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-2xl font-black text-white border border-slate-800 shadow-md">
                  {initial}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{user.name}</h3>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 truncate max-w-[200px] mt-0.5">{user.email}</p>
              </div>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span>Active Account</span>
              </span>
            </div>

            {/* Sidebar Tab Selectors */}
            <div className="space-y-1">
              {[
                { id: "dashboard", label: "Dashboard Overview", icon: User },
                { id: "addresses", label: "Shipping Addresses", icon: MapPin },
                { id: "feedback", label: "Submit Feedback", icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeProfileTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveProfileTab(tab.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-slate-950 dark:bg-orange-500/10 border border-slate-950 dark:border-orange-550/20 text-white dark:text-orange-400 scale-[1.02] shadow-sm font-extrabold"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon size={14} className={isSelected ? "text-orange-500" : "text-slate-400"} />
                      <span>{tab.label}</span>
                    </span>
                    <ChevronRight size={12} className={`text-slate-400/80 transition-transform ${isSelected ? "translate-x-0.5" : ""}`} />
                  </button>
                );
              })}
            </div>

            {/* Logout button wrapper */}
            <button
              onClick={logoutHandler}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 px-4 py-3 text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-500/10 dark:hover:text-red-400 hover:border-red-500 dark:hover:border-red-500/20 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <LogOut size={13} />
              <span>{t("logout")}</span>
            </button>
          </div>

          {/* RIGHT VIEWPORT: MAIN DASHBOARD SECTIONS */}
          <div className="space-y-8 min-w-0">
            
            {/* Dashboard tab content */}
            {activeProfileTab === "dashboard" && (
              <div className="space-y-8 animate-fade-in text-left">
                {/* upper grid details */}
                <div className="flex flex-col xl:flex-row gap-6 items-stretch">
                  
                  {/* Left stats cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                    
                    <div className="group rounded-[28px] border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 shadow-xs relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t("lifetime_orders")}</span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 transition group-hover:scale-110">
                          <Package size={18} />
                        </div>
                      </div>
                      <div className="mt-4 text-left">
                        <p className="text-3xl font-black text-slate-955 dark:text-white">{orders.length}</p>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">total orders</p>
                      </div>
                      <div className="mt-4 border-t border-slate-100 dark:border-slate-850/80 pt-4">
                        <button
                          onClick={() => navigate("/orderdetail")}
                          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-orange-500 hover:text-orange-655 transition cursor-pointer"
                        >
                          <span>Manage Orders</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="group rounded-[28px] border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 shadow-xs relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-505">{t("total_spent")}</span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 transition group-hover:scale-110">
                          <DollarSign size={18} />
                        </div>
                      </div>
                      <div className="mt-4 text-left">
                        <p className="text-3xl font-black text-slate-955 dark:text-white">₹{totalSpent.toLocaleString("en-IN")}</p>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">amount spent</p>
                      </div>
                      <div className="mt-4 border-t border-slate-100 dark:border-slate-850/80 pt-4 text-xs font-bold text-slate-505 dark:text-slate-400">
                        {activeShipments > 0 ? `⚡ ${activeShipments} delivery active` : "✓ Deliveries complete"}
                      </div>
                    </div>

                  </div>

                  {/* Right visual loyalty card */}
                  <div className="w-full xl:w-96 shrink-0 flex items-center justify-center xl:justify-end">
                    {renderVIPCard()}
                  </div>
                </div>

                {/* Loyalty Tier Progress Bar Widget */}
                <div className="rounded-[28px] border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10.5px] font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Award size={14} className="text-orange-500" />
                      <span>Membership Progression Benefits</span>
                    </h4>
                    <span className="text-[10.5px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{tier.name.split(" ")[0]} Tier</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-indigo-500 h-full transition-all duration-1000"
                      style={{ width: `${Math.min((totalSpent / 20000) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider font-mono">
                    <span>Silver Member</span>
                    <span>Gold (₹5k+)</span>
                    <span>Platinum VIP (₹15k+)</span>
                  </div>
                </div>

                {/* Credentials & Registry Details Box */}
                <div className="rounded-[28px] border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 sm:p-7 space-y-6">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Account Credentials</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-505 mt-0.5 font-bold">Details about your registry settings.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-150 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/25 p-4 flex items-center gap-3">
                      <User size={18} className="text-slate-400" />
                      <div className="text-left leading-normal font-semibold">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Display Name</p>
                        <p className="text-xs font-black text-slate-850 dark:text-slate-200 mt-0.5">{user.name}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-150 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/25 p-4 flex items-center gap-3">
                      <Mail size={18} className="text-slate-400" />
                      <div className="text-left leading-normal font-semibold">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Verified Email</p>
                        <p className="text-xs font-black text-slate-850 dark:text-slate-200 mt-0.5 truncate max-w-44 sm:max-w-none">{user.email}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-150 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/25 p-4 flex items-center gap-3">
                      <ShieldCheck size={18} className="text-slate-400" />
                      <div className="text-left leading-normal font-semibold">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Security State</p>
                        <p className="text-xs font-black text-slate-850 dark:text-slate-200 mt-0.5">Verified Consumer</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-150 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/25 p-4 flex items-center gap-3">
                      <Calendar size={18} className="text-slate-400" />
                      <div className="text-left leading-normal font-semibold">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Registry Date</p>
                        <p className="text-xs font-black text-slate-850 dark:text-slate-200 mt-0.5">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Portal shortcuts grids */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "Track Shipments", desc: "View estimates, delivery tracking links, and order details.", to: "/orderdetail", action: "Go to Orders", icon: Package, style: "text-orange-500 bg-orange-50 dark:bg-orange-950/20 border border-orange-500/10" },
                    { title: "AI Fitting Room", desc: "Upload standing models and generate clothing maps instantly.", to: "/tryon", action: "Open Fitting Room", icon: Sparkles, style: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-500/10" },
                    { title: "Help & Support", desc: "Submit return questions or check logistics hub operations.", to: "/help", action: "Open Help desk", icon: Headset, style: "text-slate-700 bg-slate-50 dark:bg-slate-900/35 border border-slate-100 dark:border-slate-800" },
                  ].map((port, pIdx) => {
                    const Icon = port.icon;
                    return (
                      <div key={pIdx} className="rounded-[28px] border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 flex flex-col justify-between items-start gap-4">
                        <div className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center shrink-0 ${port.style}`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white leading-tight">{port.title}</h4>
                          <p className="text-[10.5px] text-slate-400 dark:text-slate-505 font-bold mt-1 leading-normal">{port.desc}</p>
                        </div>
                        <button
                          onClick={() => navigate(port.to)}
                          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-orange-500 hover:text-orange-655 cursor-pointer"
                        >
                          <span>{port.action}</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* Address tab content */}
            {activeProfileTab === "addresses" && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-900 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Saved Shipments Addresses</h3>
                    <p className="text-xs text-slate-450 dark:text-slate-500 font-bold mt-0.5">Manage details for fast, single-click checkout workflows.</p>
                  </div>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-655 dark:bg-orange-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md active:scale-95 transition cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Address</span>
                  </button>
                </div>

                {(!user.addresses || user.addresses.length === 0) ? (
                  <div className="rounded-[32px] border border-dashed border-slate-200 dark:border-slate-850 p-12 text-center bg-slate-50/20 dark:bg-slate-950/10">
                    <MapPin size={28} className="mx-auto text-slate-400 mb-3" />
                    <p className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider">No saved addresses</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-semibold">Your address list is currently empty. Click "Add Address" to populate.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {user.addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className="relative rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 flex flex-col justify-between group hover:border-orange-500/20 dark:hover:border-orange-500/20 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="space-y-2 pr-6 text-left">
                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            {addr.firstName} {addr.lastName}
                          </p>
                          <div className="space-y-0.5 text-slate-655 dark:text-slate-350 text-xs font-bold leading-relaxed">
                            <p>{addr.street}</p>
                            <p>{addr.city}, {addr.state}</p>
                            <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest">{addr.country}</p>
                          </div>
                          <p className="text-xs text-slate-455 dark:text-slate-500 font-bold pt-2 border-t border-slate-100 dark:border-slate-850/80">
                            📞 {addr.phone}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="absolute top-5 right-5 text-slate-400 hover:text-red-500 transition cursor-pointer"
                          title="Delete Saved Address"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Feedback tab content */}
            {activeProfileTab === "feedback" && (
              <div className="rounded-[28px] border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 sm:p-8 space-y-6 animate-fade-in text-left">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">App Experience Feedback</h3>
                  <p className="text-xs text-slate-455 dark:text-slate-500 font-bold mt-1">
                    Tell us how we are doing! We use ratings to optimize routing speeds, fitting room maps, and pricing transparency.
                  </p>
                </div>

                <form onSubmit={handleAppReviewSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider mb-2.5">
                      Application Score Rating *
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setAppRating(star)}
                          className="transition duration-150 hover:scale-110 active:scale-95 cursor-pointer text-slate-255 dark:text-slate-800 hover:text-amber-300"
                          title={`${star} Star${star > 1 ? 's' : ''}`}
                        >
                          <svg
                            className={`h-8 w-8 ${
                              star <= appRating
                                ? "text-amber-400 fill-amber-400 animate-pulse"
                                : "text-current"
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                      {appRating > 0 && (
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400 ml-3">
                          {appRating} / 5 Rating
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider mb-2">
                      Comment Description
                    </label>
                    <textarea
                      value={appComment}
                      onChange={(e) => setAppComment(e.target.value.slice(0, 500))}
                      rows={4}
                      maxLength={500}
                      placeholder="Share details about checkout speeds, product quality, or virtual fitting room options..."
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/40 p-4 text-xs font-semibold outline-none focus:border-orange-500 dark:focus:border-orange-500/80 transition text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 resize-none"
                    />
                    <div className="mt-1 flex justify-end text-[9px] text-slate-400 dark:text-slate-505 font-mono">
                      <span>{appComment.length} / 500 characters</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReview || appRating === 0}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 dark:bg-orange-600 hover:bg-slate-850 dark:hover:bg-orange-550 text-white text-xs font-black uppercase tracking-wider px-5 py-3 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
                    >
                      <span>{user.appReview ? "Update Feedback" : "Submit Feedback"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Add Address Modal Overlay */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-left">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Add Shipping Address</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Enter delivery credentials</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-805 text-slate-500 dark:text-slate-400 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="p-6 space-y-4 text-left">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.firstName}
                    onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newAddress.lastName}
                    onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={newAddress.email}
                    onChange={(e) => setNewAddress({ ...newAddress, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-955/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-955/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                    placeholder="e.g. +91 9988776655"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                  placeholder="Apartment, block, street details"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-955/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-955/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-955/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-150 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-black uppercase tracking-wider text-white shadow-md active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  {adding ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
