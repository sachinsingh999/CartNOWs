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
  TrendingUp,
  HelpCircle,
  Plus,
  Trash2,
  MapPin,
  X
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

  const [showModal, setShowModal] = useState(false);
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
        setShowModal(false);
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

        // Fetch user info and orders in parallel
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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-900 dark:border-slate-500 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-4">Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 transition-colors duration-200">
        <HelpCircle size={48} className="text-slate-400 animate-bounce" />
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-4">No user data found.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-550 px-5 py-2.5 text-xs font-bold text-white transition cursor-pointer"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const initial = user.name?.charAt(0)?.toUpperCase() || "U";
  
  // Calculate Loyalty Status based on spending thresholds
  const getLoyaltyTier = () => {
    if (totalSpent > 15000) return { name: "Platinum Member", color: "from-purple-500 to-indigo-500", text: "text-purple-600" };
    if (totalSpent > 5000) return { name: "Gold Member", color: "from-amber-500 to-orange-500", text: "text-amber-500" };
    return { name: "Silver Member", color: "from-slate-400 to-slate-600", text: "text-slate-500" };
  };

  const tier = getLoyaltyTier();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="mx-auto max-w-6xl space-y-8">
              {/* Page Header */}
        <div className="flex flex-col gap-1.5 text-left">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Customer Area</p>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{t("welcome")}, {user.name}</h1>
        </div>

        {/* TOP PROFILE BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-slate-800/10 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 h-40 w-40 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:text-left text-center">
              
              {/* Initials Avatar with glowing ring */}
              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 opacity-75 blur transition duration-500 group-hover:opacity-100" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-3xl font-black text-white shadow-lg border border-slate-800">
                  {initial}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h2 className="text-3xl font-extrabold tracking-tight text-white">{user.name}</h2>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>
                <p className="mt-1 text-slate-400 text-sm font-semibold">{user.email}</p>
                <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-extrabold text-slate-300 border border-slate-800">
                    Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently"}
                  </span>
                  <span className={`rounded-lg bg-gradient-to-r ${tier.color} px-3 py-1 text-xs font-black text-white`}>
                    {tier.name}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logoutHandler}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-700 hover:text-white active:scale-98 cursor-pointer"
            >
              <LogOut size={16} />
              <span>{t("logout")}</span>
            </button>
          </div>
        </div>

        {/* METRICS STATS GRID */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          
          {/* Card 1: Total Orders */}
          <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-slate-950 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("lifetime_orders")}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 transition group-hover:scale-110">
                <Package size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{orders.length}</span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">orders placed</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <button
                onClick={() => navigate("/orderdetail")}
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-655 transition cursor-pointer"
              >
                <span>View Order History</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Card 2: Total Spent */}
          <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-slate-950 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-405 dark:text-slate-500">{t("total_spent")}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 transition group-hover:scale-110">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">₹{totalSpent.toLocaleString("en-IN")}</span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">spent total</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {activeShipments > 0 ? `${activeShipments} item(s) in transit` : "All packages delivered"}
              </span>
            </div>
          </div>

          {/* Card 3: Account Tier */}
          <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-slate-950 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("membership_level")}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 transition group-hover:scale-110">
                <Award size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{tier.name.split(" ")[0]} Status</span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">tier benefits active</span>
            </div>
            <div className="mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-1000"
                  style={{ width: `${Math.min((totalSpent / 20000) * 100, 100)}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-mono">
                <span>Silver Tier</span>
                <span>Platinum Tier (₹15k+)</span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM PORTALS & DETAILS */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start text-left">
          
          <div className="space-y-8 w-full">
            {/* Account Details Box */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Security & Credentials</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">Review your core profile login detail values.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                
                {/* Name Field */}
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <User size={14} />
                    <span>Display Name</span>
                  </div>
                  <p className="mt-2 text-sm font-extrabold text-slate-800 dark:text-slate-200">{user.name}</p>
                </div>

                {/* Email Field */}
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <Mail size={14} />
                    <span>Verified Email</span>
                  </div>
                  <p className="mt-2 text-sm font-extrabold text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
                </div>

                {/* Status Field */}
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <ShieldCheck size={14} />
                    <span>Account State</span>
                  </div>
                  <p className="mt-2 text-sm font-extrabold text-slate-800 dark:text-slate-200">Verified Consumer</p>
                </div>

                {/* Joined Date Field */}
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <Calendar size={14} />
                    <span>Registry Date</span>
                  </div>
                  <p className="mt-2 text-sm font-extrabold text-slate-800 dark:text-slate-200">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                  </p>
                </div>

              </div>
            </div>

            {/* Saved Addresses Box */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Saved Addresses</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">Manage your delivery locations.</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-550 px-4 py-2 text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add Address</span>
                </button>
              </div>

              {(!user.addresses || user.addresses.length === 0) ? (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-slate-50/20 dark:bg-slate-950/10">
                  <MapPin size={24} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No saved addresses found.</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Add your shipping details for a faster checkout next time.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className="relative rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 p-4 flex flex-col justify-between group hover:border-slate-350 dark:hover:border-slate-700 transition"
                    >
                      <div className="space-y-1.5 pr-6">
                        <p className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                          {addr.firstName} {addr.lastName}
                        </p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {addr.street}
                        </p>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {addr.city}, {addr.state}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">
                          {addr.country}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-550 pt-1">
                          📞 {addr.phone}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Portal Shortcuts */}
          <div className="space-y-6">
            
            {/* AI Fitting Room Promo Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-6 text-white shadow-md group">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Sparkles size={160} />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
                <Sparkles size={10} />
                <span>Feature Showcase</span>
              </span>
              <h3 className="mt-4 text-2xl font-black leading-tight">Virtual Try-On Fitting Room</h3>
              <p className="mt-2 text-xs text-orange-50 leading-relaxed font-semibold">
                Upload your own photo or choose a model, select a product item, and let our Generative AI system fit it on you.
              </p>
              <button
                onClick={() => navigate("/tryon")}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-orange-500 transition hover:bg-orange-50 active:scale-98 shadow-sm cursor-pointer"
              >
                <span>Enter Fitting Room</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Quick Access Actions Links */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Quick Shortcuts</h4>
              
              <div className="grid gap-2">
                <button
                  onClick={() => navigate("/orderdetail")}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 transition hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Package size={16} className="text-slate-400" />
                    <span>Track & Manage Orders</span>
                  </span>
                  <ArrowRight size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => navigate("/help")}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 transition hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Headset size={16} className="text-slate-400" />
                    <span>Contact Help Support</span>
                  </span>
                  <ArrowRight size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => navigate("/product")}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 transition hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} className="text-slate-400" />
                    <span>Browse Collection Store</span>
                  </span>
                  <ArrowRight size={14} className="text-slate-400" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add New Address</h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold">Enter your shipping details below</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer animate-none"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddAddress} className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.firstName}
                    onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newAddress.lastName}
                    onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newAddress.email}
                    onChange={(e) => setNewAddress({ ...newAddress, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-black text-white shadow-md active:scale-95 transition cursor-pointer disabled:opacity-50"
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
