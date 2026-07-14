import React, { useEffect, useState, useRef, useMemo } from "react";
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
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Copy,
  Check,
  Camera,
  Lock,
  RefreshCw,
  Bell,
  Edit3,
  CheckCircle,
  Clock,
  Truck,
  Heart,
  Percent,
  ShoppingBag,
  Info,
  Star
} from "lucide-react";
import { backendUrl } from "../config";
import { useLanguage } from "../context/LanguageContext";
import { cachedGet } from "../utils/apiCache";
import { toast } from "react-toastify";
import { ProfileSkeleton } from "../components/SkeletonLoader";
import { motion, AnimatePresence } from "framer-motion";

// Luxury Preset Avatars for SaaS Dashboard
const PRESET_AVATARS = [
  { id: "aurora", name: "Cosmic Aurora", gradient: "from-pink-500 via-purple-600 to-indigo-700" },
  { id: "gold", name: "Liquid Gold", gradient: "from-yellow-400 via-amber-500 to-orange-600" },
  { id: "neon", name: "Neon Crystal", gradient: "from-cyan-400 via-blue-500 to-indigo-600" },
  { id: "silver", name: "Silver Silk", gradient: "from-slate-300 via-slate-500 to-slate-700" },
  { id: "obsidian", name: "Obsidian Wave", gradient: "from-slate-900 via-purple-950 to-slate-950" },
  { id: "deep", name: "Deep Space", gradient: "from-indigo-900 via-purple-900 to-pink-900" }
];

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [activeShipments, setActiveShipments] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [allProducts, setAllProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // Tab State: dashboard | addresses | settings
  const [activeProfileTab, setActiveProfileTab] = useState("dashboard");

  // Address States
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

  // Credentials & Settings State
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [revealKey, setRevealKey] = useState(false);

  // Feedback State
  const [appRating, setAppRating] = useState(0);
  const [appComment, setAppComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditEmail(user.email || "");
      setSelectedAvatar(user.profilePhoto || "");
      if (user.appReview) {
        setAppRating(user.appReview.rating || 0);
        setAppComment(user.appReview.comment || "");
      }
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      toast.error("Name and Email are required.");
      return;
    }
    setSavingProfile(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${backendUrl}/api/user/update-profile`,
        {
          name: editName,
          email: editEmail,
          profilePhoto: selectedAvatar,
          password: editPassword || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setUser(res.data.user);
        setEditPassword("");
        toast.success("Profile credentials successfully updated! ✨");
      } else {
        toast.error(res.data.message || "Failed to update profile details.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile settings.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File is too large. Max limit is 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAvatar(reader.result);
        setShowAvatarSelector(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    toast.success("Verification Key copied to clipboard! 📋");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Fetch initial profile credentials, user orders, products catalog, and active coupons
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const [profileRes, ordersRes, productsRes, couponRes] = await Promise.all([
          axios.get(`${backendUrl}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.post(`${backendUrl}/api/order/userOrder`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          cachedGet(`${backendUrl}/api/product/list`),
          axios.get(`${backendUrl}/api/coupon/list`)
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

        if (productsRes.data?.success) {
          setAllProducts(productsRes.data.products || []);
        }

        if (couponRes.data?.success) {
          setCoupons((couponRes.data.coupons || []).filter(c => c.status !== "inactive"));
        }
      } catch (error) {
        console.error("PROFILE FETCH ERROR 👉", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();

    // Load initial wishlist
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlistIds(saved);
  }, [navigate]);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Synchronize Wishlist events
  const wishlistedItems = useMemo(() => {
    return allProducts.filter(p => wishlistIds.includes(p._id));
  }, [allProducts, wishlistIds]);

  const toggleFavorite = async (product) => {
    const productId = product._id || product;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        let list = JSON.parse(localStorage.getItem("wishlist")) || [];
        if (list.includes(productId)) {
          list = list.filter(id => id !== productId);
          toast.success("Removed from wishlist");
        } else {
          list.push(productId);
          toast.success("Added to wishlist ❤️");
        }
        localStorage.setItem("wishlist", JSON.stringify(list));
        window.dispatchEvent(new Event("wishlistUpdate"));
        setWishlistIds(list);
        return;
      }

      const res = await axios.post(
        `${backendUrl}/api/wishlist/toggle`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const updated = res.data.wishlist || [];
        localStorage.setItem("wishlist", JSON.stringify(updated));
        window.dispatchEvent(new Event("wishlistUpdate"));
        setWishlistIds(updated);
        toast.success("Wishlist updated!");
      }
    } catch (error) {
      console.error(error);
      let list = JSON.parse(localStorage.getItem("wishlist")) || [];
      if (list.includes(productId)) {
        list = list.filter(id => id !== productId);
      } else {
        list.push(productId);
      }
      localStorage.setItem("wishlist", JSON.stringify(list));
      window.dispatchEvent(new Event("wishlistUpdate"));
      setWishlistIds(list);
    }
  };

  const handleAddToCart = async (product, qty = 1, size = "Standard") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to add items to cart.");
        return;
      }
      const res = await axios.post(
        `${backendUrl}/api/cart/add`,
        { productId: product._id || product, qty, size },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Added to cart! 🛒");
        window.dispatchEvent(new Event("cartUpdate"));
      } else {
        toast.error(res.data.message || "Failed to add to cart.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add to cart.");
    }
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "";

  const getLoyaltyTier = () => {
    if (totalSpent > 30000) return { name: "Diamond VIP Member", color: "from-blue-600 via-indigo-700 to-slate-950", bg: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    if (totalSpent > 15000) return { name: "Platinum VIP Member", color: "from-indigo-600 via-purple-600 to-pink-500", bg: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
    if (totalSpent > 5000) return { name: "Gold Member", color: "from-amber-500 via-orange-500 to-slate-950", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    return { name: "Silver Member", color: "from-slate-500 via-slate-700 to-slate-950", bg: "bg-slate-50/10 text-slate-450 border-slate-250/20" };
  };

  const tier = getLoyaltyTier();

  const getProfileProgressInfo = () => {
    let nextTierName = "";
    let nextTierThreshold = 0;
    let unlockedBenefits = [];
    let rewardPreview = "";

    if (totalSpent < 5000) {
      nextTierName = "Gold Member";
      nextTierThreshold = 5000;
      unlockedBenefits = ["Standard Shipping", "1.0%"];
      rewardPreview = "Earn more points to unlock Gold Member benefits";
    } else if (totalSpent < 15000) {
      nextTierName = "Platinum VIP";
      nextTierThreshold = 15000;
      unlockedBenefits = ["Standard Shipping", "3.0%", "Priority Dispatch"];
      rewardPreview = "Earn more points to unlock Platinum VIP benefits";
    } else if (totalSpent < 30000) {
      nextTierName = "Diamond VIP";
      nextTierThreshold = 30000;
      unlockedBenefits = ["Free Express Shipping", "5.0%", "24/7 Premium Support", "AI Fitting Room PRO access"];
      rewardPreview = "Earn more points to unlock Diamond VIP benefits";
    } else {
      nextTierName = "Max Level";
      nextTierThreshold = 30005;
      unlockedBenefits = ["Free Express Shipping", "8.0%", "24/7 Dedicated Support Concierge"];
      rewardPreview = "All luxury benefits unlocked!";
    }

    const nextTierDiff = Math.max(nextTierThreshold - totalSpent, 0);
    
    // Non-linear progress mapping for Silver (0), Gold (33.3%), Platinum (66.6%), Diamond (100%)
    let progressPercent = 0;
    if (totalSpent <= 5000) {
      progressPercent = (totalSpent / 5000) * 33.3;
    } else if (totalSpent <= 15000) {
      progressPercent = 33.3 + ((totalSpent - 5000) / 10000) * 33.3;
    } else if (totalSpent <= 30000) {
      progressPercent = 66.6 + ((totalSpent - 15000) / 15000) * 33.4;
    } else {
      progressPercent = 100;
    }

    return { nextTierName, nextTierThreshold, nextTierDiff, progressPercent, unlockedBenefits, rewardPreview };
  };

  const progressInfo = getProfileProgressInfo();

  // Dynamic Avatar rendering
  const renderAvatarContent = (avatarStr, classes = "h-20 w-20 text-2xl") => {
    if (!avatarStr) {
      return (
        <div className={`flex items-center justify-center rounded-full bg-slate-900 text-slate-100 dark:text-white font-black border-2 border-white/10 ${classes}`}>
          {initial}
        </div>
      );
    }
    if (avatarStr.startsWith("data:") || avatarStr.startsWith("http")) {
      return (
        <img
          src={avatarStr}
          alt="Avatar"
          className={`rounded-full object-cover border-2 border-white/10 ${classes}`}
        />
      );
    }
    const preset = PRESET_AVATARS.find(p => p.id === avatarStr);
    if (preset) {
      return (
        <div className={`rounded-full bg-gradient-to-tr ${preset.gradient} border-2 border-white/10 ${classes} flex items-center justify-center font-black text-slate-100 dark:text-white`}>
          {initial}
        </div>
      );
    }
    return (
      <div className={`flex items-center justify-center rounded-full bg-slate-900 text-slate-100 dark:text-white font-black border-2 border-white/10 ${classes}`}>
        {initial}
      </div>
    );
  };

  // Compile spending breakdown dynamically from orders data
  const spendingBreakdown = useMemo(() => {
    const categoriesCount = {};
    let total = 0;
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        const cat = item.category || "Others";
        const amt = (item.price * item.qty) || 0;
        categoriesCount[cat] = (categoriesCount[cat] || 0) + amt;
        total += amt;
      });
    });
    
    if (total === 0) {
      return [
        { name: "Electronics", amount: 4250, percent: 50, color: "#6366f1" },
        { name: "Fashion", amount: 2550, percent: 30, color: "#3b82f6" },
        { name: "Home & Kitchen", amount: 1150, percent: 14, color: "#f97316" },
        { name: "Others", amount: 500, percent: 6, color: "#10b981" }
      ];
    }

    const mapped = Object.keys(categoriesCount).map(catName => {
      const amount = categoriesCount[catName];
      const percent = Math.round((amount / total) * 100);
      return {
        name: catName,
        amount,
        percent,
      };
    });

    mapped.sort((a, b) => b.amount - a.amount);

    const colorPalette = ["#6366f1", "#3b82f6", "#f97316", "#10b981", "#ec4899", "#8b5cf6"];
    return mapped.map((item, idx) => ({
      ...item,
      color: colorPalette[idx % colorPalette.length]
    }));
  }, [orders]);

  // Compile timeline activities dynamically from orders list
  const activitiesList = useMemo(() => {
    const list = [];
    orders.forEach((order) => {
      const orderDateStr = new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const status = order.orderStatus?.toLowerCase() || "processing";
      
      list.push({
        title: `Order #${order._id.slice(-8).toUpperCase()} placed`,
        desc: `Total amount: ₹${order.amount.toLocaleString("en-IN")}`,
        time: orderDateStr,
        badge: "bg-indigo-500"
      });
      
      if (status === "delivered") {
        list.push({
          title: `Order #${order._id.slice(-8).toUpperCase()} delivered`,
          desc: "Successfully delivered to shipping address",
          time: orderDateStr,
          badge: "bg-emerald-500"
        });
      } else if (status === "shipped") {
        list.push({
          title: `Order #${order._id.slice(-8).toUpperCase()} shipped`,
          desc: "Item is in transit and arriving soon",
          time: orderDateStr,
          badge: "bg-blue-500"
        });
      }
    });

    if (list.length === 0) {
      return [
        { title: "Account registered", desc: "Welcome to CartNow!", time: "Just now", badge: "bg-indigo-500" },
        { title: "First purchase coupon active", desc: "Use code CARTNOW10 on checkout", time: "Just now", badge: "bg-emerald-500" }
      ];
    }
    
    return list.slice(0, 4);
  }, [orders]);

  const renderDonutChart = () => {
    const circ = 238.7; // 2 * PI * r
    let currentOffset = 0;
    const totalSpentValue = spendingBreakdown.reduce((sum, item) => sum + item.amount, 0);

    return (
      <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
        <svg width="100" height="100" viewBox="0 0 100 100" className="overflow-visible select-none">
          {spendingBreakdown.map((item, idx) => {
            const strokeLength = (item.percent / 100) * circ;
            const strokeOffset = currentOffset;
            currentOffset -= strokeLength;

            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke={item.color}
                strokeWidth="11"
                strokeDasharray={`${strokeLength.toFixed(1)} ${circ}`}
                strokeDashoffset={strokeOffset.toFixed(1)}
                transform="rotate(-90 50 50)"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase leading-none">TOTAL</span>
          <span className="text-[13px] font-black text-slate-900 dark:text-white leading-none mt-1">₹{totalSpentValue.toLocaleString("en-IN")}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070A13] flex items-center justify-center">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070A13] px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-300 text-left relative overflow-hidden">
      {/* Background radial luxury mesh gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-orange-500/5 dark:bg-orange-500/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-purple-500/5 dark:bg-indigo-500/3 blur-[150px] pointer-events-none" />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 99px;
        }
      `}</style>

      <div className="w-full max-w-none space-y-8 relative z-10">

        {/* Main Grid Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          
          {/* LEFT SIDEBAR: PROFILE SUMMARY */}
          <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="space-y-6">
              {/* User Details */}
              <div className="flex flex-col items-center text-center space-y-3.5">
                <div className="relative group select-none cursor-pointer">
                  <div
                    onClick={() => setShowAvatarSelector(true)}
                    className="relative flex h-20 w-20 rounded-full overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800 active:scale-95 transition group"
                  >
                    {renderAvatarContent(user.profilePhoto)}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Camera size={18} className="text-slate-100 dark:text-white" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight flex items-center justify-center gap-1">
                    <span>{user.name}</span>
                    <Award size={14} className="text-orange-500" />
                  </h3>
                  <p className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 truncate max-w-[190px] mt-0.5">{user.email}</p>
                </div>
              </div>

              {/* Sidebar Tab Selectors */}
              <div className="space-y-1">
                {[
                  { id: "dashboard", label: "Overview", icon: User },
                  { id: "addresses", label: "Shipping Addresses", icon: MapPin },
                  { id: "settings", label: "Account Settings", icon: Settings },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeProfileTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveProfileTab(tab.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-250 relative cursor-pointer group ${isSelected ? "bg-slate-950 dark:bg-orange-500/10 border border-slate-950 dark:border-orange-500/20 text-slate-100 dark:text-white dark:text-orange-400 scale-[1.01]" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-805/50 hover:text-slate-800 dark:hover:text-slate-205 border border-transparent" }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={13} className={isSelected ? "text-orange-500" : "text-slate-400 group-hover:text-orange-400 transition-colors"} />
                        <span>{tab.label}</span>
                      </span>
                      <ChevronRight size={11} className={`text-slate-400/80 transition-transform duration-200 ${isSelected ? "translate-x-0.5" : "group-hover:translate-x-0.5"}`} />
                    </button>
                  );
                })}
              </div>

              {/* Profile Completion Indicator */}
              <div className="p-3.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-150 dark:border-slate-800 text-left space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-400">
                  <span>Profile Complete</span>
                  <span className="text-orange-500">
                    {user.name && user.email && user.addresses?.length > 0 && user.appReview ? "100%" : user.name && user.email && user.addresses?.length > 0 ? "75%" : "50%"}
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full animate-pulse" 
                    style={{ width: user.name && user.email && user.addresses?.length > 0 && user.appReview ? "100%" : user.name && user.email && user.addresses?.length > 0 ? "75%" : "50%" }}
                  />
                </div>
              </div>

              {/* Quick account stats wrapper */}
              <div className="pt-4.5 border-t border-slate-200/50 dark:border-slate-800/80 space-y-3.5">
                <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <span>Account Created</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently"}
                  </span>
                </div>

                {/* Secure verification key drawer */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <span>Verification Key</span>
                    <button
                      onClick={() => setRevealKey(!revealKey)}
                      className="text-[8.5px] font-black text-orange-500 hover:underline uppercase tracking-wider cursor-pointer bg-transparent border-none"
                    >
                      {revealKey ? "Hide" : "Reveal"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/80 p-2 rounded-lg justify-between">
                    <span className="font-mono text-[10px] font-black text-slate-700 dark:text-slate-300 tracking-wider pl-1">
                      {revealKey ? user.deliveryVerificationKey : "•••• ••••"}
                    </span>
                    <button
                      onClick={() => copyToClipboard(user.deliveryVerificationKey)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer pr-1 bg-transparent border-none"
                      title="Copy Key"
                    >
                      {copiedKey ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logoutHandler}
              className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-3 py-2.5 text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-500/10 dark:hover:text-red-400 hover:border-red-500 dark:hover:border-red-500/20 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              <LogOut size={12} />
              <span>{t("logout")}</span>
            </button>
          </div>

          {/* RIGHT VIEWPORT: MAIN DASHBOARD SECTIONS */}
          <div className="space-y-8 min-w-0">
            <AnimatePresence mode="wait">
              {/* Tab 1: Dashboard Overview */}
              {activeProfileTab === "dashboard" && (
                <motion.div
                  key="dashboard-overview"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6 text-left"
                >
                  {/* Welcome Message Header */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl sm:text-[26px] font-extrabold text-[#0B0F19] dark:text-white tracking-tight flex items-center gap-2">
                        Welcome back, {user.name.split(" ")[0]}! 👋
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Here's what's happening with your account today.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-2.5 px-4.5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.015)] select-none text-left shrink-0">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 flex items-center justify-center">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Security Status</p>
                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-450 leading-tight">Secure</p>
                      </div>
                    </div>
                  </div>

                  {/* Top Stats Overview (6 Columns exactly matching mockups) */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { label: "Total Orders", value: orders.length, trend: `${orders.length} placed`, icon: Package, color: "bg-indigo-50 text-indigo-500 dark:bg-indigo-950/20" },
                      { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}`, trend: `₹${(totalSpent * 0.12).toFixed(0)} saved`, icon: DollarSign, color: "bg-amber-50 text-amber-500 dark:bg-amber-955/20" },
                      { label: "Reward Points", value: Math.floor(totalSpent * 0.5).toLocaleString("en-IN"), trend: `+${Math.floor(totalSpent * 0.05).toFixed(0)} this month`, icon: Sparkles, color: "bg-purple-50 text-purple-500 dark:bg-purple-955/20" },
                      { label: "Active Deliveries", value: activeShipments, trend: activeShipments > 0 ? "In Transit" : "All Delivered", icon: Truck, color: "bg-blue-50 text-blue-500 dark:bg-blue-955/20" },
                      { label: "Wishlist Items", value: wishlistIds.length, trend: `${wishlistIds.length} items pinned`, icon: Heart, color: "bg-pink-50 text-pink-500 dark:bg-pink-955/20" },
                      { label: "Coupons", value: coupons.length, trend: coupons.length > 0 ? "Available" : "No active coupon", icon: Percent, color: "bg-emerald-50 text-emerald-500 dark:bg-emerald-955/20" }
                    ].map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                          <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center shrink-0`}>
                            <Icon size={16} />
                          </div>
                          <div className="text-left space-y-0.5 min-w-0">
                            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 block truncate">
                              {stat.label}
                            </span>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">
                              {stat.value}
                            </h3>
                            <span className={`text-[8.5px] font-black block truncate ${stat.trend.startsWith("↑") || stat.trend.includes("saved") || stat.trend.includes("+") ? "text-emerald-500" : "text-slate-400"}`}>
                              {stat.trend}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mid-section Grid split (40% Member, 60% Orders) */}
                  <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_2fr] gap-6 items-start">
                    
                    {/* VIP Member Centerpiece Card */}
                    <div className="rounded-[24px] bg-[#6366f1] text-white p-6 shadow-[0_15px_30px_-5px_rgba(99,102,241,0.25)] flex flex-col justify-between h-[300px] relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-600 opacity-90 z-0" />
                      
                      <span className="absolute right-[-40px] bottom-[-20px] text-[200px] font-black text-white/[0.04] uppercase leading-none select-none pointer-events-none z-0">
                        VIP
                      </span>

                      <div className="flex justify-between items-start relative z-10">
                        <div className="text-left space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Award size={16} className="text-amber-300" />
                            <span className="text-sm font-black tracking-wide uppercase">{tier.name}</span>
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-white/20 uppercase tracking-widest leading-none">VIP</span>
                          </div>
                          <p className="text-[11px] text-white/70 font-semibold">You are enjoying our highest membership tier.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 relative z-10 text-left mt-4">
                        <div>
                          <p className="text-[8px] font-black tracking-wider uppercase text-white/50 leading-none">Reward Points</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="h-3 w-3 rounded-full bg-amber-400 flex items-center justify-center border border-amber-300"><Star size={7} className="fill-amber-900 text-amber-900" /></span>
                            <span className="font-mono text-base sm:text-lg font-black tracking-wide">{Math.floor(totalSpent * 0.5).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[8px] font-black tracking-wider uppercase text-white/50 leading-none">Cashback Rate</p>
                          <p className="text-base sm:text-lg font-mono font-black text-emerald-350 mt-1.5">
                            {totalSpent > 30000 ? "8.0%" : totalSpent > 15000 ? "5.0%" : totalSpent > 5000 ? "3.0%" : "1.0%"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 relative z-10 text-left pt-3">
                        <div className="flex justify-between items-baseline text-[9.5px] font-bold text-white/80">
                          <span>Next Tier: {progressInfo.nextTierName}</span>
                          <span className="font-mono font-black">{progressInfo.progressPercent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${progressInfo.progressPercent}%` }} />
                        </div>
                        <p className="text-[9px] text-white/60 font-semibold tracking-wide">
                          {progressInfo.rewardPreview}
                        </p>
                      </div>
                    </div>

                    {/* Recent Orders List Cards */}
                    <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] h-[300px] flex flex-col justify-between text-left">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h4 className="text-sm font-black text-[#0B0F19] dark:text-white uppercase tracking-wider">Recent Orders</h4>
                        <button 
                          onClick={() => navigate("/orderdetail")}
                          className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline bg-transparent border-none cursor-pointer"
                        >
                          View All Orders
                        </button>
                      </div>

                      <div className="flex-1 mt-3 space-y-3.5 overflow-y-auto custom-scrollbar pr-1">
                        {orders.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
                            No recent orders found
                          </div>
                        ) : (
                          orders.slice(0, 2).map((order) => {
                            const status = order.orderStatus?.toLowerCase() || "processing";
                            const isDelivered = status === "delivered";
                            const isShipped = status === "shipped" || isDelivered;

                            return (
                              <div key={order._id} className="flex gap-4 items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-950/20 p-2 rounded-2xl transition duration-200">
                                <div className="h-14 w-14 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center p-1.5 shrink-0">
                                  <img 
                                    src={order.items?.[0]?.image?.startsWith("http") ? order.items[0].image : `${backendUrl}/${order.items?.[0]?.image || ""}`} 
                                    alt="" 
                                    className="h-full w-full object-contain" 
                                  />
                                </div>

                                <div className="flex-1 min-w-0 text-left">
                                  <h5 className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[180px]">{order.items?.[0]?.name || "Purchased Product"}</h5>
                                  <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Order #{order._id?.slice(-8).toUpperCase()}</p>
                                  <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">₹{order.amount.toLocaleString("en-IN")}</p>
                                </div>

                                <div className="text-right space-y-2 shrink-0">
                                  <div className="flex flex-col items-end">
                                    <span className={`px-2 py-0.5 text-[8.5px] font-black uppercase rounded ${isDelivered ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"}`}>
                                      {order.orderStatus || "Processing"}
                                    </span>
                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1 block">
                                      {isDelivered ? "Delivered successfully" : "Arriving soon"}
                                    </span>
                                  </div>

                                  {/* Progress pathway dots */}
                                  <div className="flex items-center gap-1.5 justify-end">
                                    {[1, 2, 3, 4].map((stepIdx) => {
                                      let stepActive = false;
                                      if (status === "delivered") stepActive = true;
                                      else if (status === "shipped") stepActive = stepIdx <= 3;
                                      else stepActive = stepIdx <= 2;
                                      
                                      return (
                                        <span 
                                          key={stepIdx} 
                                          className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${stepActive ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-800"}`} 
                                        />
                                      );
                                    })}
                                  </div>
                                </div>

                                <button 
                                  onClick={() => navigate(`/orderdetail`)}
                                  className="h-7 w-7 rounded-full bg-slate-100/50 hover:bg-slate-200 dark:bg-slate-800 text-slate-455 dark:text-slate-300 flex items-center justify-center border-none cursor-pointer"
                                >
                                  <ChevronRight size={14} />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Bottom Segment Layout (3 Columns matching mockups) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    
                    {/* Column 1: Wallet & Rewards */}
                    <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] text-left flex flex-col justify-between h-[310px]">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h4 className="text-sm font-black text-[#0B0F19] dark:text-white uppercase tracking-wider">Wallet & Rewards</h4>
                        <button 
                          onClick={() => setActiveProfileTab("settings")}
                          className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline bg-transparent border-none cursor-pointer"
                        >
                          View All
                        </button>
                      </div>

                      <div className="flex-1 mt-3.5 space-y-2.5">
                        {[
                          { label: "Cashback Balance", val: `₹${Math.floor(totalSpent * 0.05).toLocaleString("en-IN")}`, icon: CreditCard, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" },
                          { label: "Reward Points", val: `${Math.floor(totalSpent * 0.5).toLocaleString("en-IN")} pts`, icon: Sparkles, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20" },
                          { label: "Coupons Available", val: `${coupons.length} Coupon${coupons.length !== 1 ? 's' : ''}`, icon: Percent, color: "text-pink-500 bg-pink-50 dark:bg-pink-955/20" }
                        ].map((w, wIdx) => {
                          const Icon = w.icon;
                          return (
                            <div 
                              key={wIdx} 
                              onClick={() => {
                                toast.info(`${w.label}: ${w.val} available! 💸`);
                              }}
                              className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-150/40 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-950/10 hover:border-indigo-500/10 transition duration-200 cursor-pointer"
                            >
                              <div className={`h-9 w-9 rounded-xl ${w.color} flex items-center justify-center shrink-0`}>
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-none">{w.label}</p>
                                <p className="text-xs font-black text-slate-900 dark:text-white mt-1 leading-none">{w.val}</p>
                              </div>
                              <ChevronRight size={13} className="text-slate-400" />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Column 2: Recent Activity Timeline */}
                    <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] text-left flex flex-col justify-between h-[310px]">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h4 className="text-sm font-black text-[#0B0F19] dark:text-white uppercase tracking-wider">Recent Activity</h4>
                        <button 
                          onClick={() => {
                            toast.info("Log list synchronized! 📋");
                          }}
                          className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline bg-transparent border-none cursor-pointer"
                        >
                          View All
                        </button>
                      </div>

                      <div className="flex-1 mt-3.5 space-y-3 relative pl-3.5 border-l border-slate-200 dark:border-slate-800">
                        {activitiesList.map((act, aIdx) => (
                          <div key={aIdx} className="relative space-y-0.5 text-left">
                            <span className={`absolute left-[-20.5px] top-[3.5px] h-2 w-2 rounded-full border border-white dark:border-slate-900 ${act.badge}`} />
                            <div className="flex justify-between items-baseline">
                              <h6 className="text-[11px] font-black text-slate-900 dark:text-white leading-none">{act.title}</h6>
                              <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 font-mono shrink-0 pl-1">{act.time}</span>
                            </div>
                            <p className="text-[9.5px] text-slate-450 dark:text-slate-500 font-semibold leading-normal">{act.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Spending Overview Category breakdown */}
                    <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] text-left flex flex-col justify-between h-[310px]">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h4 className="text-sm font-black text-[#0B0F19] dark:text-white uppercase tracking-wider">Spending Overview</h4>
                        <select className="text-[9.5px] font-black uppercase text-slate-650 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-850 px-2 py-1 rounded-md outline-none cursor-pointer">
                          <option>This Month</option>
                          <option>Last 6 Months</option>
                        </select>
                      </div>

                      <div className="flex-1 mt-3.5 space-y-3.5">
                        <div className="flex justify-between items-center">
                          <div className="text-left space-y-1">
                            <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400">Total Spending</span>
                            <h3 className="text-base font-extrabold text-[#0B0F19] dark:text-white leading-none">₹{totalSpent.toLocaleString("en-IN")}</h3>
                            <span className="text-[9px] font-black text-emerald-500 block">
                              {orders.length > 0 ? "↑ 22% vs last month" : "No orders this month"}
                            </span>
                          </div>

                          {renderDonutChart()}
                        </div>

                        {/* Category legend splits with values and percentages */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                          {spendingBreakdown.slice(0, 4).map((leg, lIdx) => (
                            <div key={lIdx} className="flex justify-between items-center text-[10px] font-bold text-slate-700 dark:text-slate-300 select-none">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: leg.color }} />
                                <span className="font-semibold">{leg.name}</span>
                              </div>
                              <div className="flex gap-4 font-mono">
                                <span>₹{leg.amount.toLocaleString("en-IN")}</span>
                                <span className="text-slate-400">{leg.percent}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Horizontal Wishlist view is placed directly underneath the bottom layout components */}
                  {wishlistedItems.length > 0 && (
                    <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] text-left space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-[#0B0F19] dark:text-white flex items-center gap-1.5">
                            <Heart size={13} className="text-pink-500" />
                            <span>Your Curated Wishlist</span>
                          </h4>
                          <p className="text-[9.5px] text-slate-455 dark:text-slate-500 font-bold mt-0.5">Quick access to items you pinned for checkout.</p>
                        </div>
                        <button 
                          onClick={() => navigate("/wishlist")}
                          className="text-[9.5px] font-black uppercase bg-transparent text-orange-500 hover:underline cursor-pointer border-none"
                        >
                          View All
                        </button>
                      </div>

                      <div className="flex gap-4 overflow-x-auto py-2 custom-scrollbar">
                        {wishlistedItems.map((prod) => {
                          const img = prod.images?.[0]?.startsWith("http") ? prod.images[0] : `${backendUrl}/${prod.images?.[0]}`;
                          return (
                            <div key={prod._id} className="w-[180px] rounded-2xl border border-slate-200/40 dark:border-slate-800 bg-white dark:bg-slate-950/45 p-3 shrink-0 space-y-2 text-left hover:shadow-md transition duration-300 relative group/wishitem">
                              <button
                                onClick={() => toggleFavorite(prod)}
                                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-slate-100 hover:bg-red-500/10 dark:bg-slate-900 flex items-center justify-center text-red-500 transition cursor-pointer border-none z-10"
                              >
                                <Trash2 size={11} />
                              </button>
                              <div className="h-24 w-full bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2">
                                <img src={img} alt={prod.name} className="h-full w-full object-contain hover:scale-105 transition duration-300" />
                              </div>
                              <h6 className="text-[11px] font-black text-slate-900 dark:text-white leading-tight truncate">{prod.name}</h6>
                              <div className="flex justify-between items-baseline">
                                <span className="text-xs font-black text-slate-900 dark:text-white">₹{prod.price.toLocaleString("en-IN")}</span>
                                {prod.originalPrice > prod.price && (
                                  <span className="text-[8.5px] font-black text-red-500">-{Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}%</span>
                                )}
                              </div>
                              <button
                                onClick={() => handleAddToCart(prod)}
                                className="w-full text-[9px] font-black uppercase bg-slate-900 hover:bg-slate-800 dark:bg-orange-600 dark:hover:bg-orange-500 text-white py-1.5 rounded-lg border-none cursor-pointer"
                              >
                                Add to Cart
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 2: Saved Addresses */}
              {activeProfileTab === "addresses" && (
                <motion.div
                  key="saved-addresses"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6 text-left"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-900 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-[#0B0F19] dark:text-white tracking-tight uppercase">Saved Shipping Addresses</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">Manage details for fast, single-click checkout workflows.</p>
                    </div>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="self-start sm:self-center inline-flex items-center gap-2 rounded-2xl bg-[#6366f1] hover:bg-indigo-700 px-4.5 py-3 text-xs font-black uppercase tracking-wider text-slate-100 dark:text-white shadow-md active:scale-95 transition cursor-pointer border-none"
                    >
                      <Plus size={14} />
                      <span>Add Address</span>
                    </button>
                  </div>

                  {(!user.addresses || user.addresses.length === 0) ? (
                    <div className="rounded-[24px] border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900">
                      <MapPin size={28} className="mx-auto text-slate-400 mb-3" />
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">No saved addresses</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-semibold">Your address list is currently empty. Click "Add Address" to populate.</p>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2">
                      {user.addresses.map((addr) => (
                        <div
                          key={addr._id}
                          className="relative rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between group hover:border-[#6366f1]/20 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="space-y-2 pr-6 text-left break-words">
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                              {addr.firstName} {addr.lastName}
                            </p>
                            <div className="space-y-0.5 text-slate-700 dark:text-slate-300 text-xs font-bold leading-relaxed">
                              <p>{addr.street}</p>
                              <p>{addr.city}, {addr.state}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">{addr.country}</p>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-505 font-bold pt-2 border-t border-slate-100 dark:border-slate-800/80">
                              📞 {addr.phone}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-red-500 transition cursor-pointer bg-transparent border-none"
                            title="Delete Saved Address"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 3: Account Settings & Credentials */}
              {activeProfileTab === "settings" && (
                <motion.div
                  key="account-settings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-8 text-left"
                >
                  <div className="border-b border-slate-200/50 dark:border-slate-900 pb-4">
                    <h3 className="text-lg font-black text-[#0B0F19] dark:text-white tracking-tight uppercase">Profile Credentials & Settings</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">Edit credentials, security passwords, app reviews, and luxury visual settings.</p>
                  </div>

                  {/* Settings grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">

                    {/* Credentials form card */}
                    <div className="rounded-[24px] border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">Account Credentials</h4>

                      <form onSubmit={handleUpdateProfile} className="space-y-5">
                        {/* Name Input */}
                        <div className="relative group">
                          <User size={16} className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Display Name"
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#070A13]/20 text-xs font-semibold outline-none transition text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                          />
                        </div>

                        {/* Email Input */}
                        <div className="relative group">
                          <Mail size={16} className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="email"
                            required
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="Email Address"
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#070A13]/20 text-xs font-semibold outline-none transition text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                          />
                        </div>

                        {/* Password Input (Optional Update) */}
                        <div className="relative group">
                          <Lock size={16} className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="password"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            placeholder="Update Password (leave blank to keep current)"
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#070A13]/20 text-xs font-semibold outline-none transition text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={savingProfile}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6366f1] hover:bg-indigo-750 text-xs font-black uppercase tracking-wider text-slate-100 dark:text-white px-6 py-3.5 transition active:scale-95 disabled:opacity-50 shadow-md cursor-pointer border-none"
                          >
                            {savingProfile ? (
                              <>
                                <RefreshCw size={13} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              <span>Save Changes</span>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Preset Avatars & custom upload selection */}
                    <div className="rounded-[24px] border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">Luxury Avatar Presets</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">Select a premium gradient design or upload a custom image file.</p>
                      </div>

                      {/* Presets grid */}
                      <div className="grid grid-cols-3 gap-3 my-2">
                        {PRESET_AVATARS.map((avatar) => {
                          const isSelected = selectedAvatar === avatar.id;
                          return (
                            <button
                              key={avatar.id}
                              onClick={() => {
                                setSelectedAvatar(avatar.id);
                                toast.info(`Selected Preset: ${avatar.name} 🎨`);
                              }}
                              className={`h-11 rounded-xl bg-gradient-to-tr ${avatar.gradient} relative cursor-pointer border ${isSelected ? "border-indigo-500 ring-2 ring-indigo-500/25 scale-102" : "border-white/10" } hover:scale-102 transition`}
                              title={avatar.name}
                            >
                              {isSelected && (
                                <span className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                                  <Check size={14} className="text-slate-100 dark:text-white" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="border-t border-slate-200/40 dark:border-slate-800 pt-4 flex flex-col gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleAvatarFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition cursor-pointer"
                        >
                          <Camera size={13} />
                          <span>Upload Custom File</span>
                        </button>
                        {selectedAvatar && selectedAvatar.startsWith("data:") && (
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-855 shrink-0">
                              <img src={selectedAvatar} alt="Upload preview" className="h-full w-full object-cover" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Custom Image Linked</span>
                            <button
                              onClick={() => setSelectedAvatar("")}
                              className="text-red-500 hover:underline text-[9px] font-black uppercase ml-auto tracking-wider cursor-pointer bg-transparent border-none"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* App rating comment feedback section */}
                  <div className="rounded-[24px] border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">App Experience Feedback</h4>
                      <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-bold mt-1">
                        Tell us how we are doing! We use ratings to optimize routing speeds, fitting room maps, and pricing transparency.
                      </p>
                    </div>

                    <form onSubmit={handleAppReviewSubmit} className="space-y-5">
                      <div>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setAppRating(star)}
                              className="transition duration-150 hover:scale-110 active:scale-95 cursor-pointer text-slate-200 dark:text-slate-850 hover:text-amber-400 bg-transparent border-none outline-none"
                              title={`${star} Star${star > 1 ? 's' : ''}`}
                            >
                              <svg
                                className={`h-8 w-8 ${star <= appRating ? "text-amber-400 fill-amber-400 animate-pulse" : "text-current" }`}
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
                        <textarea
                          value={appComment}
                          onChange={(e) => setAppComment(e.target.value.slice(0, 500))}
                          rows={4}
                          maxLength={500}
                          placeholder="Share details about checkout speeds, product quality, or virtual fitting room options..."
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-55/30 dark:bg-[#070A13]/40 p-4 text-xs font-semibold outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-650 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        />
                        <div className="mt-1 flex justify-end text-[9px] text-slate-400 dark:text-slate-550 font-mono">
                          <span>{appComment.length} / 500 characters</span>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingReview || appRating === 0}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 dark:bg-orange-650 hover:bg-slate-800 dark:hover:bg-orange-500 text-slate-100 dark:text-white text-xs font-black uppercase tracking-wider px-5 py-3 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer border-none"
                        >
                          <span>{user.appReview ? "Update Feedback" : "Submit Feedback"}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>

      {/* Add Address Modal Overlay */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-55/50 dark:bg-slate-900/50 text-left">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Add Shipping Address</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Enter delivery credentials</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer bg-transparent border-none"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="p-6 space-y-4 text-left overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.firstName}
                    onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none transition text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newAddress.lastName}
                    onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none transition text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
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
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none transition text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-405 dark:text-slate-500 tracking-wider mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none transition text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none transition text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
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
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none transition text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none transition text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
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
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold outline-none transition text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-black uppercase tracking-wider text-slate-100 dark:text-white shadow-md active:scale-95 transition cursor-pointer disabled:opacity-50 border-none"
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
