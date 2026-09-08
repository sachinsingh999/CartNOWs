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
  Star,
  Wifi,
  Cpu,
  Gift,
  Crown,
  Tag,
  LayoutDashboard,
  ExternalLink,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";
import { backendUrl } from "../config";
import { useLanguage } from "../context/LanguageContext";
import { cachedGet } from "../utils/apiCache";
import { toast } from "react-toastify";
import { ProfileSkeleton } from "../components/SkeletonLoader";
import VipCreditCard from "../components/VipCreditCard";
import VipCodeSettingsModal from "../components/VipCodeSettingsModal";
import { motion as Motion, AnimatePresence } from "framer-motion";

// Luxury Preset Avatars for Profile Customization
const PRESET_AVATARS = [
  { id: "aurora", name: "Cosmic Aurora", gradient: "from-pink-500 via-purple-600 to-indigo-700" },
  { id: "gold", name: "Liquid Gold", gradient: "from-yellow-400 via-amber-500 to-orange-600" },
  { id: "neon", name: "Neon Crystal", gradient: "from-cyan-400 via-blue-500 to-indigo-600" },
  { id: "emerald", name: "Emerald Glaze", gradient: "from-emerald-400 via-teal-500 to-cyan-700" },
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

  const formatCompactNumber = (val) => {
    if (typeof val !== "number") return val;
    if (val < 100000) return val.toLocaleString("en-IN");
    return new Intl.NumberFormat("en-IN", {
      notation: "compact",
      maximumFractionDigits: 2
    }).format(val);
  };

  const [allProducts, setAllProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // Pro Tabs: overview | orders | addresses | vip | settings
  const [activeProfileTab, setActiveProfileTab] = useState("overview");

  // VIP Security Code Modal state
  const [isVipCodeModalOpen, setIsVipCodeModalOpen] = useState(false);
  const [vipCodeModalMode, setVipCodeModalMode] = useState("change");

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
        toast.success("Address saved successfully!");
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
    if (!window.confirm("Are you sure you want to remove this address?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${backendUrl}/api/user/delete-address`, { addressId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUser(prev => ({ ...prev, addresses: res.data.addresses }));
        toast.success("Address removed successfully!");
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
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text, label = "Copied to clipboard!") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    toast.success(label);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Fetch initial profile credentials, user orders, products catalog, and active coupons
  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // 1. Fetch vital dashboard data first (Profile & Orders)
      try {
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
            spent += order.amount || 0;
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
        console.error("VITAL PROFILE FETCH ERROR 👉", error);
      } finally {
        setLoading(false);
      }

      // 2. Fetch large resources in the background (Products list & Coupons list)
      try {
        const [productsRes, couponRes] = await Promise.all([
          cachedGet(`${backendUrl}/api/product/list`),
          axios.get(`${backendUrl}/api/coupon/list`)
        ]);

        if (productsRes.data?.success) {
          setAllProducts(productsRes.data.products || []);
        }

        if (couponRes.data?.success) {
          setCoupons((couponRes.data.coupons || []).filter(c => c.status !== "inactive"));
        }
      } catch (error) {
        console.error("BACKGROUND PROFILE FETCH ERROR 👉", error);
      }
    };

    fetchProfileData();

    // Load initial wishlist
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlistIds(saved);
  }, [navigate]);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    toast.info("Logged out successfully");
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

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const getLoyaltyTier = () => {
    const qualSpend = (user?.membership && user.membership.qualifyingSpend) || totalSpent;
    if (qualSpend >= 30000) {
      return {
        name: "Diamond VIP",
        tag: "DIAMOND",
        color: "from-cyan-400 via-teal-400 to-emerald-400",
        badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        crownColor: "text-cyan-400",
        rate: "5.0%",
        multiplier: "3×"
      };
    }
    if (qualSpend >= 15000) {
      return {
        name: "Platinum VIP",
        tag: "PLATINUM",
        color: "from-purple-400 via-fuchsia-400 to-pink-400",
        badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        crownColor: "text-purple-400",
        rate: "3.0%",
        multiplier: "2×"
      };
    }
    if (qualSpend >= 5000) {
      return {
        name: "Gold Member",
        tag: "GOLD",
        color: "from-amber-400 via-yellow-400 to-orange-400",
        badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        crownColor: "text-amber-400",
        rate: "2.0%",
        multiplier: "1.5×"
      };
    }
    return {
      name: "Silver Member",
      tag: "SILVER",
      color: "from-slate-400 via-slate-300 to-slate-500",
      badgeBg: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      crownColor: "text-slate-400",
      rate: "1.0%",
      multiplier: "1×"
    };
  };

  const tier = getLoyaltyTier();

  // Dynamic Avatar rendering with subtle rounded corners
  const renderAvatarContent = (avatarStr, classes = "h-16 w-16 text-xl") => {
    if (!avatarStr) {
      return (
        <div className={`flex items-center justify-center rounded-md bg-gradient-to-tr from-slate-900 to-indigo-950 text-white font-black shadow-inner ${classes}`}>
          {initial}
        </div>
      );
    }
    if (avatarStr.startsWith("data:") || avatarStr.startsWith("http")) {
      return (
        <img
          src={avatarStr}
          alt="Avatar"
          className={`rounded-md object-cover border border-white/10 ${classes}`}
        />
      );
    }
    const preset = PRESET_AVATARS.find(p => p.id === avatarStr);
    if (preset) {
      return (
        <div className={`rounded-md bg-gradient-to-tr ${preset.gradient} border border-white/10 ${classes} flex items-center justify-center font-black text-white shadow-inner`}>
          {initial}
        </div>
      );
    }
    return (
      <div className={`flex items-center justify-center rounded-md bg-gradient-to-tr from-slate-900 to-indigo-950 text-white font-black shadow-inner ${classes}`}>
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
        { name: "Home & Decor", amount: 1150, percent: 14, color: "#f97316" },
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

    const colorPalette = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6"];
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
        desc: `Total: ₹${order.amount.toLocaleString("en-IN")}`,
        time: orderDateStr,
        badge: "bg-indigo-500",
        icon: Package
      });

      if (status === "delivered") {
        list.push({
          title: `Order #${order._id.slice(-8).toUpperCase()} delivered`,
          desc: "Safely handed over to recipient",
          time: orderDateStr,
          badge: "bg-emerald-500",
          icon: CheckCircle
        });
      } else if (status === "shipped") {
        list.push({
          title: `Order #${order._id.slice(-8).toUpperCase()} in transit`,
          desc: "Carrier tracking initiated",
          time: orderDateStr,
          badge: "bg-cyan-500",
          icon: Truck
        });
      }
    });

    if (list.length === 0) {
      return [
        { title: "Account registered", desc: "Welcome to CartNow Premium!", time: "Active", badge: "bg-indigo-500", icon: User },
        { title: "Welcome bonus active", desc: "Use coupon CARTNOW10 on checkout", time: "Ready", badge: "bg-emerald-500", icon: Gift }
      ];
    }

    return list.slice(0, 4);
  }, [orders]);

  const renderDonutChart = () => {
    const circ = 238.7; // 2 * PI * r (r=38)
    let currentOffset = 0;
    const totalSpentValue = spendingBreakdown.reduce((sum, item) => sum + item.amount, 0);

    return (
      <div className="relative h-24 w-24 shrink-0 flex items-center justify-center">
        <svg width="90" height="90" viewBox="0 0 100 100" className="overflow-visible select-none">
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
                className="transition-all duration-700 ease-out hover:opacity-85"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">TOTAL</span>
          <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none mt-0.5">₹{formatCompactNumber(totalSpentValue)}</span>
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

  const qualSpend = (user.membership && user.membership.qualifyingSpend) || totalSpent;
  const nextTierName = (user.membership && user.membership.nextLevelName) || (qualSpend < 5000 ? "Gold Member" : qualSpend < 15000 ? "Platinum VIP" : qualSpend < 30000 ? "Diamond VIP" : null);
  const amountToNext = (user.membership && user.membership.amountToNextLevel) || (qualSpend < 5000 ? 5000 - qualSpend : qualSpend < 15000 ? 15000 - qualSpend : qualSpend < 30000 ? 30000 - qualSpend : 0);
  const progressPercent = (user.membership && user.membership.progressPercent) || (qualSpend < 5000 ? (qualSpend / 5000) * 100 : qualSpend < 15000 ? ((qualSpend - 5000) / 10000) * 100 : qualSpend < 30000 ? ((qualSpend - 15000) / 15000) * 100 : 100);

  const navTabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders & Deliveries", icon: Package, badge: orders.length },
    { id: "addresses", label: "Saved Addresses", icon: MapPin, badge: user.addresses?.length || 0 },
    { id: "vip", label: "VIP & Rewards", icon: Crown, highlight: true },
    { id: "settings", label: "Account & Security", icon: Settings },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-[#070913] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden pb-4 sm:pb-6">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent blur-3xl opacity-60 dark:opacity-30" />
      <div className="pointer-events-none absolute top-[250px] -left-40 w-[450px] h-[450px] bg-orange-500/5 dark:bg-orange-500/3 blur-[140px]" />
      <div className="pointer-events-none absolute top-[500px] -right-40 w-[550px] h-[550px] bg-purple-500/5 dark:bg-purple-500/3 blur-[160px]" />

      {/* BALANCED OPEN FULL-WIDTH CANVAS WITH COMFORTABLE BREATHING ROOM */}
      <div className="w-full max-w-[1560px] mx-auto px-3 sm:px-5 lg:px-6 pt-3 sm:pt-4 relative z-10 space-y-3 sm:space-y-4">

        {/* ══════════════════════════════════════════════════════════
            HERO PROFILE IDENTITY BANNER & INTEGRATED TABS (COMBINED)
        ══════════════════════════════════════════════════════════ */}
        <div className="relative rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          
          {/* Cover gradient strip - open luxury height */}
          <div className="h-32 sm:h-40 md:h-44 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-30 mix-blend-screen bg-cover bg-center"
              style={{ backgroundImage: `url('/diamond_card_crystal_mesh.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Ambient shimmer line */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70" />

            {/* Top right badges */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-xs">
                <ShieldCheck size={12} />
                <span>Verified Customer</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/15 shadow-xs">
                <Clock size={11} className="text-slate-400" />
                <span>Since {user.createdAt ? new Date(user.createdAt).getFullYear() : "2024"}</span>
              </span>
            </div>
          </div>

          {/* Profile Details Bar - open comfortable padding */}
          <div className="px-4 pb-4 pt-1 sm:px-6 sm:pb-5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-10 sm:-mt-14">
              
              {/* Left: Avatar + Name + Badges */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3.5 text-center sm:text-left">
                
                {/* Avatar with subtle rounded status frame */}
                <div className="relative group cursor-pointer" onClick={() => setActiveProfileTab("settings")}>
                  <div className="relative p-1 rounded-md bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-300 dark:ring-slate-700 transition group-hover:border-indigo-500">
                    {renderAvatarContent(user.profilePhoto, "h-20 w-20 sm:h-24 sm:w-24 text-2xl")}
                    <div className="absolute inset-0 bg-black/60 rounded-md opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1 text-white">
                      <Camera size={16} />
                      <span className="text-[8.5px] font-black uppercase tracking-wider">Edit</span>
                    </div>
                  </div>
                  {/* VIP Crown Floating Badge */}
                  <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-sm bg-slate-950 border border-white/20 flex items-center justify-center shadow-md">
                    <Crown size={12} className={tier.crownColor} />
                  </div>
                </div>

                {/* Name & Contact meta */}
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                      {user.name}
                    </h1>
                    <div className={`px-2 py-0.5 rounded-sm text-[9.5px] font-black uppercase tracking-wider border flex items-center gap-1 ${tier.badgeBg}`}>
                      <Sparkles size={9} />
                      <span>{tier.name}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 truncate max-w-[280px]">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <span>{user.email}</span>
                    </span>
                    <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <span className="text-slate-400 uppercase text-[9px] font-bold">UID:</span>
                      <span>#{user._id ? user._id.slice(-6).toUpperCase() : "USR"}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Quick Action Controls */}
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                <button
                  onClick={() => setActiveProfileTab("settings")}
                  className="px-3.5 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 transition-all active:scale-98 cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Settings size={13} />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => {
                    setVipCodeModalMode("change");
                    setIsVipCodeModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-black uppercase tracking-wider transition-all active:scale-98 cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Lock size={13} />
                  <span>VIP PIN</span>
                </button>

                <button
                  onClick={logoutHandler}
                  className="px-3.5 py-2 rounded border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 text-xs font-black uppercase tracking-wider text-rose-500 dark:text-rose-400 transition-all active:scale-98 cursor-pointer flex items-center gap-1.5 shadow-xs"
                  title="Logout"
                >
                  <LogOut size={13} />
                  <span className="hidden sm:inline">{t("logout")}</span>
                </button>
              </div>

            </div>

            {/* Quick Hero Highlights Bar - open comfortable grid */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
              <div className="p-3 sm:p-3.5 rounded-md bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/70">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Spend</span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono block">₹{totalSpent.toLocaleString("en-IN")}</span>
              </div>
              <div className="p-3 sm:p-3.5 rounded-md bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/70">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Orders</span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono block">{orders.length} Placed</span>
              </div>
              <div className="p-3 sm:p-3.5 rounded-md bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/70">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Reward Points</span>
                <span className="text-sm sm:text-base font-black text-indigo-500 dark:text-indigo-400 font-mono block">{formatCompactNumber(Math.floor(totalSpent * 0.5))} Pts</span>
              </div>
              <div className="p-3 sm:p-3.5 rounded-md bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/70">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Cashback Rate</span>
                <span className="text-sm sm:text-base font-black text-cyan-500 dark:text-cyan-400 font-mono block">{tier.rate} VIP</span>
              </div>
              <div className="p-3 sm:p-3.5 rounded-md bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/70 col-span-2 sm:col-span-4 lg:col-span-1 flex items-center justify-between lg:block">
                <div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Active Shipments</span>
                  <span className="text-sm sm:text-base font-black text-emerald-500 font-mono block">{activeShipments} in Transit</span>
                </div>
                {activeShipments > 0 && (
                  <button 
                    onClick={() => setActiveProfileTab("orders")}
                    className="lg:hidden text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400"
                  >
                    Track →
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════
              INTEGRATED SEGMENTED TAB NAVIGATION (COMBINED AT BOTTOM)
          ══════════════════════════════════════════════════════════ */}
          <div className="border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeProfileTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveProfileTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 sm:py-2.5 rounded text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={14} className={isSelected ? (tab.highlight ? "text-amber-400" : "") : (tab.highlight ? "text-amber-500" : "text-slate-400")} />
                  <span>{tab.label}</span>
                  {typeof tab.badge === "number" && tab.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-mono font-black ${
                      isSelected ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════
            ACTIVE TAB CONTENT VIEWPORT
        ══════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          
          {/* ──────────────────────────────────────────────────────────
              TAB 1: OVERVIEW & ANALYTICS
          ────────────────────────────────────────────────────────── */}
          {activeProfileTab === "overview" && (
            <Motion.div
              key="tab-overview"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-3 sm:space-y-4"
            >
              {/* 6 KPI Metric Cards with comfortable open grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                {[
                  { label: "Total Orders", value: orders.length, sub: `${orders.length} total orders`, icon: Package, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" },
                  { label: "Total Spent", value: `₹${formatCompactNumber(totalSpent)}`, sub: `₹${formatCompactNumber(Math.floor(totalSpent * 0.12))} saved`, icon: DollarSign, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
                  { label: "Reward Points", value: formatCompactNumber(Math.floor(totalSpent * 0.5)), sub: `${tier.multiplier} multiplier active`, icon: Sparkles, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30" },
                  { label: "Active Deliveries", value: activeShipments, sub: activeShipments > 0 ? "In transit" : "All delivered", icon: Truck, color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30" },
                  { label: "Saved Items", value: wishlistIds.length, sub: `${wishlistIds.length} in wishlist`, icon: Heart, color: "text-pink-500 bg-pink-50 dark:bg-pink-950/30" },
                  { label: "Active Coupons", value: coupons.length, sub: coupons.length > 0 ? "Ready to apply" : "No coupons", icon: Percent, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" },
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 sm:p-4 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-all flex flex-col justify-between space-y-2 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{kpi.label}</span>
                        <div className={`h-7 w-7 rounded-sm flex items-center justify-center ${kpi.color}`}>
                          <Icon size={14} />
                        </div>
                      </div>
                      <div>
                        <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight leading-tight block">
                          {kpi.value}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 block truncate">
                          {kpi.sub}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* VIP Card & Milestone Journey + Recent Orders Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
                
                {/* Left (5 cols): VIP Credit Card + Milestone Progression */}
                <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                  <VipCreditCard user={user} token={localStorage.getItem("token") || ""} />

                  {/* Tier Milestones Progression Card */}
                  <div className="p-3.5 sm:p-4 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Qualifying VIP Spend</span>
                        <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                          ₹{qualSpend.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Tier Goal</span>
                        <p className="text-xs font-black text-amber-500 dark:text-amber-400 mt-0.5">
                          {nextTierName ? `₹${amountToNext.toLocaleString("en-IN")} to ${nextTierName}` : "Max Level Unlocked 💎"}
                        </p>
                      </div>
                    </div>

                    {/* Subtle Multi-tier Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div
                        className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-amber-400 h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, Math.max(8, progressPercent))}%` }}
                      />
                    </div>

                    {/* Tier Milestones Roadmap */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { label: "Silver", at: "₹0", active: true },
                        { label: "Gold", at: "₹5K", active: qualSpend >= 5000 },
                        { label: "Platinum", at: "₹15K", active: qualSpend >= 15000 },
                        { label: "Diamond", at: "₹30K+", active: qualSpend >= 30000 },
                      ].map((mStep, sIdx) => (
                        <div key={sIdx} className="space-y-1">
                          <span className={`h-1.5 w-full rounded-full block ${mStep.active ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-800"}`} />
                          <p className={`text-[9px] font-black uppercase ${mStep.active ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>{mStep.label}</p>
                          <p className="text-[8px] font-mono text-slate-400 leading-none">{mStep.at}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right (7 cols): Live Shipments & Recent Orders */}
                <div className="lg:col-span-7 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs text-left flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-indigo-500" />
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Recent Orders & Tracking</h3>
                    </div>
                    <button
                      onClick={() => setActiveProfileTab("orders")}
                      className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer bg-transparent border-none"
                    >
                      View All ({orders.length}) →
                    </button>
                  </div>

                  {/* Orders list with open spacing */}
                  <div className="space-y-2">
                    {orders.length === 0 ? (
                      <div className="py-8 text-center space-y-2">
                        <ShoppingBag size={26} className="mx-auto text-slate-300 dark:text-slate-700" />
                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">No orders placed yet</p>
                        <button
                          onClick={() => navigate("/product")}
                          className="text-[11px] font-black uppercase text-orange-500 hover:underline cursor-pointer bg-transparent border-none mt-1"
                        >
                          Start Shopping →
                        </button>
                      </div>
                    ) : (
                      orders.slice(0, 3).map((order) => {
                        const status = order.orderStatus?.toLowerCase() || "processing";
                        const isDelivered = status === "delivered";
                        const isShipped = status === "shipped";
                        const firstItem = order.items?.[0];
                        const imgUrl = firstItem?.image?.startsWith("http")
                          ? firstItem.image
                          : `${backendUrl}/${firstItem?.image || ""}`;

                        return (
                          <div
                            key={order._id}
                            className="p-2.5 sm:p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-11 w-11 rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                                <img
                                  src={imgUrl}
                                  alt={firstItem?.name || "Product"}
                                  className="h-full w-full object-contain group-hover:scale-105 transition"
                                  onError={(e) => { e.target.style.display = "none"; }}
                                />
                              </div>

                              <div className="min-w-0 space-y-0.5">
                                <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate max-w-[260px]">
                                  {firstItem?.name || "Order Product"}
                                </p>
                                <p className="text-[10px] font-mono font-bold text-slate-400">
                                  #{order._id.slice(-8).toUpperCase()} • {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </p>
                                <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                                  ₹{order.amount.toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>

                            {/* Status and Action */}
                            <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                              <span className={`px-2 py-0.5 rounded-sm text-[8.5px] font-black uppercase tracking-wider ${
                                isDelivered ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                isShipped ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20" :
                                "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              }`}>
                                {order.orderStatus || "Processing"}
                              </span>

                              <button
                                onClick={() => navigate("/orderdetail")}
                                className="h-7 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <span>Details</span>
                                <ChevronRight size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {orders.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px] font-medium">Need order assistance?</span>
                      <button
                        onClick={() => navigate("/help")}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer bg-transparent border-none flex items-center gap-1.5"
                      >
                        <Headset size={13} />
                        <span>Support Concierge</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* 3-Column Bottom Insights Row with open layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                
                {/* Column 1: Wallet & Rewards Overview */}
                <div className="rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs text-left space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <CreditCard size={14} className="text-cyan-500" />
                      <span>Wallet & Rewards</span>
                    </h4>
                    <button
                      onClick={() => setActiveProfileTab("vip")}
                      className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline bg-transparent border-none cursor-pointer"
                    >
                      View Perks →
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 sm:p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-sm bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <DollarSign size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Cashback Balance</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                            ₹{Math.floor(totalSpent * 0.05).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-500">
                        {tier.rate}
                      </span>
                    </div>

                    <div className="p-2.5 sm:p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-sm bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">CartNow Points</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                            {formatCompactNumber(Math.floor(totalSpent * 0.5))} Pts
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-purple-500/10 text-purple-500">
                        {tier.multiplier} Rate
                      </span>
                    </div>

                    <div className="p-2.5 sm:p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-sm bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                          <Percent size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Coupons Available</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                            {coupons.length} Active Offers
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveProfileTab("vip")}
                        className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 cursor-pointer bg-transparent border-none"
                      >
                        Claim
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    <span>Auto-applied at checkout when eligible.</span>
                  </div>
                </div>

                {/* Column 2: Recent Activity Timeline */}
                <div className="rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs text-left space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock size={14} className="text-indigo-500" />
                      <span>Account Timeline</span>
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-slate-400">Live</span>
                  </div>

                  <div className="space-y-2.5 relative pl-3 border-l border-slate-200 dark:border-slate-800 my-auto">
                    {activitiesList.map((act, aIdx) => (
                      <div key={aIdx} className="relative space-y-0.5">
                        <span className={`absolute -left-[17px] top-1.5 h-2 w-2 rounded-full ${act.badge}`} />
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{act.title}</p>
                          <span className="text-[9px] font-mono font-bold text-slate-400 shrink-0">{act.time}</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-normal">{act.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Events automatically synced</span>
                    <button 
                      onClick={() => toast.info("Activity log up-to-date! ✨")}
                      className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 cursor-pointer bg-transparent border-none"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Column 3: Category Spending Breakdown */}
                <div className="rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs text-left space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp size={14} className="text-amber-500" />
                      <span>Spending Analytics</span>
                    </h4>
                    <span className="text-[10px] font-bold uppercase text-emerald-500">
                      {orders.length > 0 ? "Active" : "New"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 my-auto">
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Spent</span>
                      <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">₹{formatCompactNumber(totalSpent)}</p>
                      <span className="text-[10px] font-semibold text-emerald-500 block">
                        {orders.length > 0 ? "↑ 18% vs prev period" : "First order eligible"}
                      </span>
                    </div>

                    {renderDonutChart()}
                  </div>

                  {/* Legend */}
                  <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {spendingBreakdown.slice(0, 3).map((leg, lIdx) => (
                      <div key={lIdx} className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: leg.color }} />
                          <span className="truncate max-w-[140px]">{leg.name}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10px]">
                          <span>₹{formatCompactNumber(leg.amount)}</span>
                          <span className="text-slate-400 w-6 text-right">{leg.percent}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Curated Wishlist Showcase with comfortable padding */}
              {wishlistedItems.length > 0 && (
                <div className="p-4 sm:p-5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                        <Heart size={14} className="text-pink-500" />
                        <span>Curated Wishlist ({wishlistedItems.length})</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">Quick access to pinned items ready for checkout.</p>
                    </div>
                    <button
                      onClick={() => navigate("/wishlist")}
                      className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer bg-transparent border-none"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="flex gap-2.5 overflow-x-auto py-1 custom-scrollbar no-scrollbar">
                    {wishlistedItems.map((prod) => {
                      const img = prod.images?.[0]?.startsWith("http") ? prod.images[0] : `${backendUrl}/${prod.images?.[0]}`;
                      return (
                        <div
                          key={prod._id}
                          className="w-[160px] rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-2 shrink-0 space-y-2 text-left hover:shadow-sm transition-all relative group"
                        >
                          <button
                            onClick={() => toggleFavorite(prod)}
                            className="absolute top-2.5 right-2.5 h-6 w-6 rounded-sm bg-white dark:bg-slate-900 shadow-xs flex items-center justify-center text-rose-500 hover:scale-105 transition cursor-pointer border border-slate-200 dark:border-slate-700 z-10"
                            title="Remove"
                          >
                            <Trash2 size={12} />
                          </button>

                          <div className="h-28 w-full bg-white dark:bg-slate-900 rounded-sm overflow-hidden flex items-center justify-center p-2 border border-slate-100 dark:border-slate-800">
                            <img src={img} alt={prod.name} className="h-full w-full object-contain group-hover:scale-105 transition duration-300" />
                          </div>

                          <div className="space-y-1">
                            <h5 className="text-xs font-black text-slate-900 dark:text-white truncate leading-tight">{prod.name}</h5>
                            <div className="flex items-baseline justify-between font-mono">
                              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">₹{prod.price.toLocaleString("en-IN")}</span>
                              {prod.originalPrice > prod.price && (
                                <span className="text-[9px] font-black text-rose-500">
                                  -{Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}%
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddToCart(prod)}
                            className="w-full py-1.5 rounded bg-slate-950 dark:bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider transition cursor-pointer border-none shadow-xs active:scale-98"
                          >
                            Add to Cart
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </Motion.div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 2: ORDERS & DELIVERIES
          ────────────────────────────────────────────────────────── */}
          {activeProfileTab === "orders" && (
            <Motion.div
              key="tab-orders"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-3 sm:space-y-4 text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Orders & Shipments</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Track live deliveries, review purchase history, and download receipts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-sm text-[10.5px] font-black uppercase bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    {orders.length} Total
                  </span>
                  <span className="px-2.5 py-0.5 rounded-sm text-[10.5px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {activeShipments} Active
                  </span>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-2">
                  <Package size={32} className="mx-auto text-slate-400 dark:text-slate-600" />
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">No Orders Placed Yet</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto font-medium">
                    Your order history is clean. Explore the latest catalogs and order items with express shipping.
                  </p>
                  <button
                    onClick={() => navigate("/product")}
                    className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer border-none shadow-xs mt-1"
                  >
                    Start Shopping Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {orders.map((order) => {
                    const status = order.orderStatus?.toLowerCase() || "processing";
                    const isDelivered = status === "delivered";
                    const isShipped = status === "shipped";
                    const isCancelled = status === "cancelled";

                    return (
                      <div
                        key={order._id}
                        className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-all space-y-3"
                      >
                        {/* Order Header Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                                #{order._id.slice(-8).toUpperCase()}
                              </span>
                              <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider ${
                                isDelivered ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                isShipped ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20" :
                                isCancelled ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                                "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              }`}>
                                {order.orderStatus || "Processing"}
                              </span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-400">
                              Placed on {new Date(order.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Total</span>
                              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                                ₹{order.amount.toLocaleString("en-IN")}
                              </span>
                            </div>

                            <button
                              onClick={() => navigate("/orderdetail")}
                              className="px-3 py-1.5 rounded-sm bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-[10.5px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 transition cursor-pointer border border-transparent shadow-2xs"
                            >
                              Details
                            </button>
                          </div>
                        </div>

                        {/* Order Items Preview Stack */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {order.items?.map((item, iIdx) => {
                            const img = item.image?.startsWith("http") ? item.image : `${backendUrl}/${item.image || ""}`;
                            return (
                              <div key={iIdx} className="flex items-center gap-2.5 p-2 rounded-md bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
                                <div className="h-10 w-10 rounded-sm bg-white dark:bg-slate-900 p-1 shrink-0 overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                                  <img src={img} alt={item.name} className="h-full w-full object-contain" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">{item.name}</p>
                                  <p className="text-[10px] font-semibold text-slate-400 font-mono">
                                    Qty: {item.qty} {item.size ? `• Size: ${item.size}` : ""} • ₹{(item.price || 0).toLocaleString("en-IN")}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Shipment Progress Indicator */}
                        <div className="pt-1.5">
                          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">
                            <span className={order.date ? "text-indigo-500" : ""}>1. Placed</span>
                            <span className={status !== "processing" ? "text-indigo-500" : ""}>2. Confirmed</span>
                            <span className={isShipped || isDelivered ? "text-cyan-500" : ""}>3. Shipped</span>
                            <span className={isDelivered ? "text-emerald-500" : ""}>4. Delivered</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isDelivered ? "w-full bg-emerald-500" :
                                isShipped ? "w-3/4 bg-cyan-500" :
                                status === "confirmed" ? "w-1/2 bg-indigo-500" :
                                isCancelled ? "w-full bg-rose-500" :
                                "w-1/4 bg-amber-500"
                              }`}
                            />
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </Motion.div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 3: SAVED ADDRESSES
          ────────────────────────────────────────────────────────── */}
          {activeProfileTab === "addresses" && (
            <Motion.div
              key="tab-addresses"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-3 sm:space-y-4 text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Saved Shipping Addresses</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Manage default delivery destinations for seamless 1-click checkout.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="px-3.5 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer border-none flex items-center gap-1.5 shadow-xs active:scale-98 self-start sm:self-auto"
                >
                  <Plus size={14} />
                  <span>Add Address</span>
                </button>
              </div>

              {(!user.addresses || user.addresses.length === 0) ? (
                <div className="p-8 rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-2">
                  <MapPin size={32} className="mx-auto text-slate-400" />
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">No Saved Addresses</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto font-medium">
                    Add your residence or office address so you can check out swiftly without re-typing details.
                  </p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer border-none shadow-xs mt-1"
                  >
                    Add Address Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {user.addresses.map((addr, aIdx) => (
                    <div
                      key={addr._id || aIdx}
                      className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-all relative flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between pr-8">
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-sm bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-[11px]">
                              {aIdx + 1}
                            </span>
                            <div>
                              <h5 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                {addr.firstName} {addr.lastName}
                              </h5>
                              <span className="text-[10px] font-bold text-slate-400">Primary Contact</span>
                            </div>
                          </div>

                          {aIdx === 0 && (
                            <span className="px-2 py-0.5 rounded-sm text-[8.5px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="p-2.5 sm:p-3 rounded-md bg-slate-50/60 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 space-y-1">
                          <p className="font-semibold text-slate-900 dark:text-white">{addr.street}</p>
                          <p>{addr.city}, {addr.state}</p>
                          <p className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[9.5px] tracking-wider">{addr.country}</p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                          <span>📞 {addr.phone}</span>
                          <button
                            onClick={() => copyToClipboard(`${addr.street}, ${addr.city}, ${addr.state}, ${addr.country}`, "Address copied to clipboard! 📋")}
                            className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer bg-transparent border-none flex items-center gap-1"
                          >
                            <Copy size={11} />
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>

                      {/* Delete action */}
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="absolute top-3 right-3 h-7 w-7 rounded-sm bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 transition cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs"
                        title="Remove Address"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Motion.div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 4: VIP MEMBERSHIP & REWARDS
          ────────────────────────────────────────────────────────── */}
          {activeProfileTab === "vip" && (
            <Motion.div
              key="tab-vip"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-3 sm:space-y-4 text-left"
            >
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Crown size={16} className="text-amber-500" />
                  <span>VIP Club & Membership Privileges</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Unlock exclusive cashback tiers, priority courier routing, and members-only flash deals.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
                
                {/* 3D VIP Card Showcase */}
                <div className="lg:col-span-6 space-y-3 sm:space-y-4">
                  <VipCreditCard user={user} token={localStorage.getItem("token") || ""} />

                  <div className="p-3 rounded-md bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-black uppercase text-cyan-600 dark:text-cyan-400 text-[10.5px]">
                      <Lock size={12} />
                      <span>Security Note</span>
                    </div>
                    <p className="text-[10.5px] leading-relaxed">
                      Double-click the card above anytime on desktop (or hold on mobile) to enter your security PIN and temporarily reveal your full unmasked VIP membership identifier.
                    </p>
                  </div>
                </div>

                {/* Tier Benefits Breakdown */}
                <div className="lg:col-span-6 space-y-3 sm:space-y-4">
                  <div className="p-4 sm:p-5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Membership Tier Benefits
                    </h4>

                    <div className="space-y-2">
                      {[
                        { name: "Silver Member", spend: "₹0+", perks: "1.0% Cashback • Standard Dispatch • Basic Support", current: tier.name === "Silver Member" },
                        { name: "Gold Member", spend: "₹5,000+", perks: "2.0% Cashback • 1.5× Reward Points • Priority Processing", current: tier.name === "Gold Member" },
                        { name: "Platinum VIP", spend: "₹15,000+", perks: "3.0% Cashback • 2× Reward Points • Free Express Shipping", current: tier.name === "Platinum VIP" },
                        { name: "Diamond VIP", spend: "₹30,000+", perks: "5.0% Cashback • 3× Points • 24/7 Dedicated Concierge • Early Access", current: tier.name === "Diamond VIP" },
                      ].map((lvl, lIdx) => (
                        <div
                          key={lIdx}
                          className={`p-2.5 sm:p-3 rounded-md border transition-all ${
                            lvl.current
                              ? "border-cyan-500/50 bg-cyan-500/5 shadow-xs ring-1 ring-cyan-500/20"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                              <span>{lvl.name}</span>
                              {lvl.current && (
                                <span className="px-2 py-0.5 rounded-sm text-[8px] font-black uppercase bg-cyan-500 text-slate-950">
                                  Current Tier
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-500">{lvl.spend}</span>
                          </div>
                          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-normal">
                            {lvl.perks}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Active Coupons Grid with open gap */}
              <div className="p-4 sm:p-5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <Tag size={14} className="text-pink-500" />
                      <span>Available Coupons & Discount Vouchers ({coupons.length})</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Click any voucher to copy coupon code to checkout.</p>
                  </div>
                </div>

                {coupons.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No active coupons available right now. Check back soon!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon._id}
                        onClick={() => copyToClipboard(coupon.code, `Copied coupon ${coupon.code}! 🎟️`)}
                        className="p-3 sm:p-3.5 rounded-md border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30 hover:border-indigo-500 hover:bg-indigo-500/5 transition cursor-pointer space-y-1 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
                            {coupon.code}
                          </span>
                          <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-indigo-500 flex items-center gap-1">
                            <Copy size={11} />
                            <span>Copy</span>
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT OFF`}
                        </p>
                        {coupon.minSpend && (
                          <p className="text-[10px] text-slate-400 font-mono">Min spend: ₹{coupon.minSpend.toLocaleString("en-IN")}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Motion.div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 5: ACCOUNT SETTINGS & CREDENTIALS
          ────────────────────────────────────────────────────────── */}
          {activeProfileTab === "settings" && (
            <Motion.div
              key="tab-settings"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-3 sm:space-y-4 text-left"
            >
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Profile Credentials & Security</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Update account credentials, luxury avatar presets, VIP PIN settings, and app feedback.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
                
                {/* Left (7 cols): Credentials Form */}
                <div className="lg:col-span-7 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-3">
                  <h4 className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                    <User size={14} className="text-indigo-500" />
                    <span>Personal Credentials</span>
                  </h4>

                  <form onSubmit={handleUpdateProfile} className="space-y-3 sm:space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Full Name *</label>
                      <div className="relative">
                        <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full pl-9 pr-3 py-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Email Address *</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="Your email address"
                          className="w-full pl-9 pr-3 py-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">New Password (Optional)</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Leave blank to keep current password"
                          className="w-full pl-9 pr-3 py-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 transition"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer border-none shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {savingProfile && <RefreshCw size={13} className="animate-spin" />}
                        <span>{savingProfile ? "Saving..." : "Save Credentials"}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right (5 cols): Avatar Customizer & Delivery Key */}
                <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                  
                  {/* Avatar Picker Card */}
                  <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-2.5">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                        <Camera size={14} className="text-purple-500" />
                        <span>Luxury Avatar Presets</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Choose a designer gradient or upload a photo.</p>
                    </div>

                    {/* Presets Grid */}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {PRESET_AVATARS.map((avatar) => {
                        const isSelected = selectedAvatar === avatar.id;
                        return (
                          <button
                            key={avatar.id}
                            type="button"
                            onClick={() => {
                              setSelectedAvatar(avatar.id);
                              toast.info(`Selected Preset: ${avatar.name} 🎨`);
                            }}
                            className={`h-9 sm:h-10 rounded-md bg-gradient-to-tr ${avatar.gradient} relative cursor-pointer border ${
                              isSelected ? "border-indigo-500 ring-2 ring-indigo-500/40" : "border-white/10"
                            } transition hover:opacity-90`}
                            title={avatar.name}
                          >
                            {isSelected && (
                              <span className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md">
                                <Check size={14} className="text-white" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
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
                        className="w-full py-2 rounded border border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Camera size={13} />
                        <span>Upload Custom Image</span>
                      </button>

                      {selectedAvatar && selectedAvatar.startsWith("data:") && (
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-emerald-500 font-bold text-[10.5px]">Custom Photo Loaded</span>
                          <button
                            type="button"
                            onClick={() => setSelectedAvatar("")}
                            className="text-rose-500 hover:underline text-[10px] font-black uppercase bg-transparent border-none cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Key Vault Card */}
                  <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span>Delivery Verification Key</span>
                      </h4>
                      <button
                        onClick={() => setRevealKey(!revealKey)}
                        className="text-[10px] font-black text-indigo-500 hover:underline uppercase tracking-wider cursor-pointer bg-transparent border-none"
                      >
                        {revealKey ? "Hide" : "Reveal"}
                      </button>
                    </div>

                    <p className="text-[10.5px] text-slate-400 font-medium">
                      Show this secret verification PIN to delivery agents to safely receive your VIP packages.
                    </p>

                    <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="font-mono text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-widest pl-1">
                        {revealKey ? (user.deliveryVerificationKey || "3849 2014") : "•••• ••••"}
                      </span>
                      <button
                        onClick={() => copyToClipboard(user.deliveryVerificationKey || "38492014", "Verification Key copied! 📋")}
                        className="p-1.5 rounded-sm hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer border-none bg-transparent"
                        title="Copy Key"
                      >
                        {copiedKey ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* VIP Security PIN Configuration Section */}
              <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                    <Lock size={14} className="text-cyan-500" />
                    <span>VIP Card Security PIN Configuration</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Guard your VIP Card unmasked numbers with a 4–6 digit security passcode.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setVipCodeModalMode("change");
                      setIsVipCodeModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer border border-slate-700 shadow-xs"
                  >
                    Change PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVipCodeModalMode("reset");
                      setIsVipCodeModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded bg-transparent text-cyan-500 hover:text-cyan-400 text-xs font-black uppercase tracking-wider transition cursor-pointer border border-cyan-500/30"
                  >
                    Forgot PIN?
                  </button>
                </div>
              </div>

              {/* App Feedback Rating Section */}
              <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-2.5">
                <div>
                  <h4 className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                    <Star size={14} className="text-amber-500" />
                    <span>App Experience Feedback</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Rate your overall experience with CartNow. Your feedback helps us fine-tune delivery speeds and catalog quality.
                  </p>
                </div>

                <form onSubmit={handleAppReviewSubmit} className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setAppRating(star)}
                        className="transition hover:scale-110 active:scale-95 cursor-pointer bg-transparent border-none text-slate-300 dark:text-slate-700 hover:text-amber-400"
                        title={`${star} Star${star > 1 ? "s" : ""}`}
                      >
                        <svg
                          className={`h-6 w-6 ${star <= appRating ? "text-amber-400 fill-amber-400" : "text-current"}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    {appRating > 0 && (
                      <span className="text-xs font-black text-slate-600 dark:text-slate-300 ml-1">
                        {appRating} of 5 Stars
                      </span>
                    )}
                  </div>

                  <div>
                    <textarea
                      value={appComment}
                      onChange={(e) => setAppComment(e.target.value.slice(0, 500))}
                      rows={3}
                      maxLength={500}
                      placeholder="Share details about checkout speeds, product quality, or delivery accuracy..."
                      className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition"
                    />
                    <div className="flex justify-end text-[10px] text-slate-400 font-mono mt-1">
                      <span>{appComment.length} / 500 characters</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReview || appRating === 0}
                      className="px-4 py-2 rounded bg-slate-950 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                    >
                      {submittingReview ? "Submitting..." : user.appReview ? "Update Feedback" : "Submit Feedback"}
                    </button>
                  </div>
                </form>
              </div>

            </Motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* ══════════════════════════════════════════════════════════
          ADD ADDRESS MODAL OVERLAY (SUBTLE ROUNDED CORNERS)
      ══════════════════════════════════════════════════════════ */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-3 animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-left">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Add Shipping Address</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Enter recipient delivery details</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer border-none bg-transparent"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="p-3 sm:p-4 space-y-2 text-left overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-0.5">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.firstName}
                    onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                    className="w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-0.5">Last Name</label>
                  <input
                    type="text"
                    value={newAddress.lastName}
                    onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                    className="w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-0.5">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={newAddress.email}
                    onChange={(e) => setNewAddress({ ...newAddress, email: e.target.value })}
                    className="w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-0.5">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="+91 9988776655"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 mb-0.5">Street Address *</label>
                <input
                  type="text"
                  required
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Apartment, suite, street name"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-0.5">City *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="New Delhi"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-0.5">State *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Delhi"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-0.5">Country *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    className="w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="India"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-3 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-3.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-xs disabled:opacity-50 border-none"
                >
                  {adding ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIP CODE SETTINGS & RESET MODAL */}
      <VipCodeSettingsModal
        isOpen={isVipCodeModalOpen}
        onClose={() => setIsVipCodeModalOpen(false)}
        mode={vipCodeModalMode}
        token={localStorage.getItem("token") || ""}
      />

    </div>
  );
};

export default Profile;
