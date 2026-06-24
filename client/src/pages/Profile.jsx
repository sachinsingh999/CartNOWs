import React, { useEffect, useState, useRef } from "react";
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
  Key,
  Lock,
  RefreshCw,
  Bell,
  Edit3,
  CheckCircle,
  Clock,
  Truck
} from "lucide-react";
import { backendUrl } from "../config";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// Luxury Preset Avatars for SaaS Dashboard
const PRESET_AVATARS = [
  { id: "aurora", name: "Cosmic Aurora", gradient: "from-pink-500 via-purple-600 to-indigo-700" },
  { id: "gold", name: "Liquid Gold", gradient: "from-yellow-400 via-amber-500 to-orange-600" },
  { id: "neon", name: "Neon Crystal", gradient: "from-cyan-400 via-blue-500 to-indigo-600" },
  { id: "silver", name: "Silver Silk", gradient: "from-slate-350 via-slate-500 to-slate-700" },
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

  const formatCurrencyCompact = (num) => {
    if (num >= 10000000) return `₹${Number((num / 10000000).toFixed(2))}Cr`;
    if (num >= 100000) return `₹${Number((num / 100000).toFixed(1))}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
    return `₹${num}`;
  };

  const formatPointsCompact = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // Animated counters for stats
  const [animatedOrdersCount, setAnimatedOrdersCount] = useState(0);
  const [animatedSpent, setAnimatedSpent] = useState(0);
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [animatedDeliveries, setAnimatedDeliveries] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      let startO = 0;
      let startS = 0;
      let startP = 0;
      let startD = 0;
      
      const targetO = orders.length;
      const targetS = totalSpent;
      const targetP = Math.floor(totalSpent * 0.5);
      const targetD = activeShipments;

      const duration = 800; // ms
      const interval = 20; // ms
      const steps = duration / interval;
      
      const incrementO = targetO / steps;
      const incrementS = targetS / steps;
      const incrementP = targetP / steps;
      const incrementD = targetD / steps;

      const timer = setInterval(() => {
        startO += incrementO;
        startS += incrementS;
        startP += incrementP;
        startD += incrementD;

        if (startO >= targetO) {
          setAnimatedOrdersCount(targetO);
          setAnimatedSpent(targetS);
          setAnimatedPoints(targetP);
          setAnimatedDeliveries(targetD);
          clearInterval(timer);
        } else {
          setAnimatedOrdersCount(Math.floor(startO));
          setAnimatedSpent(Math.floor(startS));
          setAnimatedPoints(Math.floor(startP));
          setAnimatedDeliveries(Math.floor(startD));
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [loading, user, orders.length, totalSpent, activeShipments]);

  // 3D Tilt Card States
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Tab State: dashboard | addresses | settings | security
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

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const angleX = ((yc - y) / yc) * 10;
    const angleY = ((x - xc) / xc) * 10;
    setTilt({ x: angleX, y: angleY });

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlare({ x: glareX, y: glareY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-10 w-10 rounded-full border-4 border-orange-500 border-t-transparent"
        />
        <p className="text-sm font-black text-slate-500 dark:text-slate-400 mt-4 uppercase tracking-widest">Initialising Secure Workspace...</p>
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
          className="mt-4 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-xs font-bold text-white transition cursor-pointer"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const initial = user.name?.charAt(0)?.toUpperCase();

  const getLoyaltyTier = () => {
    if (totalSpent > 30000) return { name: "Diamond VIP Member", color: "from-blue-600 via-indigo-750 to-slate-955", bg: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    if (totalSpent > 15000) return { name: "Platinum VIP Member", color: "from-purple-650 via-indigo-655 to-slate-955", bg: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
    if (totalSpent > 5000) return { name: "Gold Member", color: "from-amber-500 via-orange-550 to-slate-955", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    return { name: "Silver Member", color: "from-slate-500 via-slate-700 to-slate-955", bg: "bg-slate-550/10 text-slate-400 border-slate-550/20" };
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
      unlockedBenefits = ["Standard Shipping", "1% Cashback"];
      rewardPreview = "Gold chip & 3% Cashback on all orders";
    } else if (totalSpent < 15000) {
      nextTierName = "Platinum VIP";
      nextTierThreshold = 15000;
      unlockedBenefits = ["Standard Shipping", "3% Cashback", "Priority Dispatch"];
      rewardPreview = "Platinum card sheen & 5% Cashback";
    } else if (totalSpent < 30000) {
      nextTierName = "Diamond VIP";
      nextTierThreshold = 30000;
      unlockedBenefits = ["Free Express Shipping", "5% Cashback", "24/7 Premium Support", "AI Fitting Room PRO access"];
      rewardPreview = "Diamond chip, early access to new designer collections & 8% Cashback";
    } else {
      nextTierName = "Max Level";
      nextTierThreshold = 30005;
      unlockedBenefits = ["Free Express Shipping", "8% Cashback", "24/7 Dedicated Support Concierge", "AI Fitting Room VIP unlimited renders", "Exclusive designer pre-orders"];
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
        <div className={`flex items-center justify-center rounded-full bg-slate-900 text-white font-black border-2 border-white/10 ${classes}`}>
          {initial}
        </div>
      );
    }
    // Check if base64 or url
    if (avatarStr.startsWith("data:") || avatarStr.startsWith("http")) {
      return (
        <img
          src={avatarStr}
          alt="Avatar"
          className={`rounded-full object-cover border-2 border-white/10 ${classes}`}
        />
      );
    }
    // Check if preset name
    const preset = PRESET_AVATARS.find(p => p.id === avatarStr);
    if (preset) {
      return (
        <div className={`rounded-full bg-gradient-to-tr ${preset.gradient} border-2 border-white/10 ${classes} flex items-center justify-center font-black text-white`}>
          {initial}
        </div>
      );
    }
    return (
      <div className={`flex items-center justify-center rounded-full bg-slate-900 text-white font-black border-2 border-white/10 ${classes}`}>
        {initial}
      </div>
    );
  };

  // Dynamic profile completion percent
  const getProfileCompletion = () => {
    let completion = 0;
    if (user.name) completion += 25;
    if (user.email) completion += 25;
    if (user.addresses && user.addresses.length > 0) completion += 25;
    if (user.appReview && user.appReview.rating > 0) completion += 25;
    return completion;
  };
  const completionPercent = getProfileCompletion();

  // Draw Dynamic Sparklines based on Orders
  const generateSparklinePath = (dataValues, width = 120, height = 40) => {
    const points = dataValues.length > 0 ? dataValues : [10, 15, 8, 20, 18, 30, 25];
    const padding = 4;
    const maxVal = Math.max(...points) || 1;
    const minVal = Math.min(...points) || 0;
    const range = maxVal - minVal || 1;

    return points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * (width - 2 * padding) + padding;
        const y = height - ((val - minVal) / range) * (height - 2 * padding) - padding;
        return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  // Calculate stats values arrays for Sparklines
  const orderAmounts = orders.map(o => o.amount).reverse();
  const orderCounts = orders.map((_, idx) => idx + 1);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good Morning";
    if (hrs < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const renderVIPCard = () => {
    let cardGradient = "from-slate-800 via-slate-900 to-slate-950 border-slate-700/60 shadow-black/40";
    let textGlow = "text-slate-400";
    let chipGradient = "from-orange-300 via-amber-600 to-orange-700 border-orange-500/85";
    let tierShadow = "shadow-[0_20px_50px_-10px_rgba(100,116,139,0.3)]";

    if (totalSpent > 30000) {
      cardGradient = "from-slate-955 via-blue-955 to-slate-900 border-blue-500/35";
      textGlow = "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]";
      chipGradient = "from-cyan-300 via-blue-500 to-indigo-655 border-cyan-400/85";
      tierShadow = "shadow-[0_20px_50px_-10px_rgba(59,130,246,0.35)]";
    } else if (totalSpent > 15000) {
      cardGradient = "from-purple-950 via-indigo-950 to-slate-950 border-purple-500/30";
      textGlow = "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]";
      chipGradient = "from-slate-100 via-slate-350 to-slate-200 border-slate-300/80";
      tierShadow = "shadow-[0_20px_50px_-10px_rgba(168,85,247,0.3)]";
    } else if (totalSpent > 5000) {
      cardGradient = "from-amber-950 via-orange-950 to-slate-950 border-amber-500/35";
      textGlow = "text-amber-455 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]";
      chipGradient = "from-yellow-300 via-amber-500 to-yellow-600 border-amber-400/80";
      tierShadow = "shadow-[0_20px_50px_-10px_rgba(245,158,11,0.35)]";
    }

    return (
      <div 
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
          transition: isHovered ? "transform 0.05s ease-out, shadow 0.15s ease" : "transform 0.5s ease, shadow 0.5s ease",
          transformStyle: "preserve-3d"
        }}
        className={`relative overflow-hidden rounded-[28px] bg-gradient-to-tr ${cardGradient} p-6 sm:p-7 text-white border border-white/[0.08] ${tierShadow} h-56 sm:h-60 w-full flex flex-col justify-between select-none cursor-pointer group`}
      >
        {/* Shine sweeping sweep */}
        <div className="shine-sweep-animation pointer-events-none absolute inset-0 z-0 opacity-40 mix-blend-overlay" />

        {/* Holographic moving sheen */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-50"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)`,
          }}
        />

        {/* Diagonal metallic linear waves */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-black/20 pointer-events-none" />

        {/* Top Segment */}
        <div className="flex justify-between items-start w-full relative z-10" style={{ transform: "translateZ(35px)" }}>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/95">CartNOW</span>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-white/15 border border-white/20 text-orange-400 tracking-wider">VIP</span>
            </div>
            <h3 className={`text-sm sm:text-base font-black tracking-widest mt-2 uppercase ${textGlow}`}>{tier.name}</h3>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Waves Icon */}
            <svg className="h-4 w-4 text-white/50 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 18a6 6 0 0 0 0-12" />
              <path d="M15 21a9 9 0 0 0 0-18" />
              <circle cx="6" cy="12" r="1.5" fill="currentColor" />
            </svg>

            {/* Smart Card Chip */}
            <div className={`h-8.5 w-11 sm:h-9 sm:w-12 rounded-lg bg-gradient-to-br ${chipGradient} shadow-md p-1 relative flex flex-col justify-between overflow-hidden border`}>
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px opacity-30">
                <div className="border-r border-b border-black" />
                <div className="border-r border-b border-black" />
                <div className="border-b border-black" />
                <div className="border-r border-b border-black" />
                <div className="border-r border-b border-black" />
                <div className="border-b border-black" />
              </div>
              <div className="h-2 w-4 rounded-xs bg-white/30 border border-white/20 z-10" />
            </div>
          </div>
        </div>

        {/* Center Card Number & Rewards Glass Tag */}
        <div className="flex justify-between items-center relative z-10 py-1" style={{ transform: "translateZ(25px)" }}>
          <div className="font-mono text-sm sm:text-base tracking-[0.25em] text-white/70">
            •••• {user._id ? user._id.slice(-4).toUpperCase() : "8828"}
          </div>
          {/* Glass tag for rewards points */}
          <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1 text-right flex flex-col justify-center">
            <span className="text-[7px] text-white/50 font-black uppercase tracking-wider">REWARD BALANCE</span>
            <span className="font-mono text-[11px] font-black text-amber-350">{animatedPoints.toLocaleString()} PTS</span>
          </div>
        </div>

        {/* Cashback Points and Card Holder Info */}
        <div className="flex justify-between items-end w-full relative z-10" style={{ transform: "translateZ(35px)" }}>
          <div className="text-left">
            <p className="text-[7.5px] font-black text-slate-450 uppercase tracking-widest leading-none">VIP CARD HOLDER</p>
            <p className="text-xs sm:text-sm font-black tracking-wider uppercase text-slate-100 mt-1">{user.name}</p>
          </div>

          <div className="text-right">
            <p className="text-[7.5px] font-black text-slate-450 uppercase tracking-widest leading-none">CASHBACK RATIO</p>
            <p className="text-xs sm:text-sm font-mono font-black text-emerald-400 mt-1">
              {totalSpent > 30000 ? "8.0% BACK" : totalSpent > 15000 ? "5.0% BACK" : totalSpent > 5000 ? "3.0% BACK" : "1.0% BACK"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-300 text-left relative overflow-hidden">
      {/* Background radial luxury mesh gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-orange-500/5 dark:bg-orange-500/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-purple-500/5 dark:bg-indigo-500/3 blur-[150px] pointer-events-none" />

      <style>{`
        @keyframes shine-sweep {
          0% { left: -150%; }
          50% { left: 150%; }
          100% { left: 150%; }
        }
        .shine-sweep-animation {
          position: absolute;
          top: 0;
          height: 100%;
          width: 50%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.25) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-20deg);
          animation: shine-sweep 6s infinite ease-in-out;
        }
        .glass-panel {
          backdrop-filter: blur(14px);
          background: rgba(255, 255, 255, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .dark .glass-panel {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .luxury-card-glow {
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04);
        }
        .dark .luxury-card-glow {
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
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
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">

          {/* LEFT SIDEBAR: PROFILE SUMMARY */}
          <div className="rounded-[32px] glass-panel p-6 space-y-8 luxury-card-glow">
            {/* User Details & Completion Progress */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative group select-none cursor-pointer">
                {/* SVG Progress Ring */}
                <svg className="absolute -inset-2.5 h-[98px] w-[98px] -rotate-90">
                  <circle
                    cx="49"
                    cy="49"
                    r="44"
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="3.5"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="49"
                    cy="49"
                    r="44"
                    className="stroke-orange-500 dark:stroke-orange-500"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 44}
                    initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - completionPercent / 100) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>

                {/* Avatar Display */}
                <div
                  onClick={() => setShowAvatarSelector(true)}
                  className="relative flex h-20 w-20 rounded-full overflow-hidden shadow-lg active:scale-95 transition group"
                >
                  {renderAvatarContent(user.profilePhoto)}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Camera size={18} className="text-white animate-pulse" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight flex items-center justify-center gap-1">
                  <span>{user.name}</span>
                  <Award size={15} className="text-orange-500" />
                </h3>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 truncate max-w-[200px] mt-0.5">{user.email}</p>
              </div>

              {/* Profile Completion Bar */}
              <div className="w-full bg-slate-200/50 dark:bg-slate-800/80 rounded-full p-2.5 flex items-center justify-between gap-2 border border-black/[0.03] dark:border-white/[0.02]">
                <div className="text-[9.5px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Profile Progress</div>
                <div className="text-[10px] font-black text-orange-500">{completionPercent}%</div>
              </div>
            </div>

            {/* Sidebar Tab Selectors */}
            <div className="space-y-1">
              {[
                { id: "dashboard", label: "Dashboard Overview", icon: User },
                { id: "addresses", label: "Shipping Addresses", icon: MapPin },
                { id: "settings", label: "Account Settings", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeProfileTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveProfileTab(tab.id)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wider transition-all duration-300 relative cursor-pointer group ${isSelected
                        ? "bg-slate-950 dark:bg-orange-500/10 border border-slate-950 dark:border-orange-550/20 text-white dark:text-orange-400 scale-[1.01] shadow-md"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-850/50 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent"
                      }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={14} className={isSelected ? "text-orange-500" : "text-slate-400 group-hover:text-orange-400 transition-colors"} />
                      <span>{tab.label}</span>
                    </span>
                    <ChevronRight size={12} className={`text-slate-400/80 transition-transform duration-300 ${isSelected ? "translate-x-0.5" : "group-hover:translate-x-0.5"}`} />
                  </button>
                );
              })}
            </div>

            {/* Quick account stats wrapper */}
            <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/80 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
                <span className="uppercase tracking-widest">Membership Tier</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${tier.bg}`}>
                  {tier.name.split(" ")[0]}
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
                <span className="uppercase tracking-widest">Client Age</span>
                <span className="font-mono text-slate-700 dark:text-slate-350">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently"}
                </span>
              </div>

              {/* Secure verification key drawer */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  <span className="uppercase tracking-widest">Verification Key</span>
                  <button
                    onClick={() => setRevealKey(!revealKey)}
                    className="text-[9px] font-black text-orange-500 hover:underline uppercase tracking-wider cursor-pointer"
                  >
                    {revealKey ? "Hide" : "Reveal"}
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/80 p-2.5 rounded-xl justify-between">
                  <span className="font-mono text-[10.5px] font-black text-slate-700 dark:text-slate-300 tracking-wider">
                    {revealKey ? user.deliveryVerificationKey : "•••• ••••"}
                  </span>
                  <button
                    onClick={() => copyToClipboard(user.deliveryVerificationKey)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logoutHandler}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3.5 text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-500/10 dark:hover:text-red-400 hover:border-red-500 dark:hover:border-red-500/20 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <LogOut size={13} />
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
                  className="space-y-8 text-left"
                >
                  {/* Welcome Message Header */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-500">CONSUMER ACCOUNT CONSOLE</p>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                        {getGreeting()}, {user.name.split(" ")[0]} ✨
                      </h2>
                    </div>
                    <span className="self-start sm:self-auto text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Security Active</span>
                    </span>
                  </div>

                  {/* Main Dashboard Layout Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-8 items-start">
                    
                    {/* LEFT COLUMN: WALLET & BENEFITS CARD */}
                    <div className="space-y-8 min-w-0">
                      
                      {/* 1. VIP Card */}
                      <div className="w-full relative z-10">
                        {renderVIPCard()}
                      </div>

                      {/* 2. Membership Progress Widget */}
                      <div className="rounded-[32px] glass-panel p-6 space-y-6 luxury-card-glow text-left flex flex-col justify-between border border-slate-200/40 dark:border-white/[0.03]">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                            <Award size={16} className="text-orange-500" />
                            <span>Membership Progression</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">Earn points and unlock luxury milestone incentives automatically.</p>
                        </div>

                        {/* Customized milestone slider bar */}
                        <div className="space-y-6 py-4">
                          <div className="relative">
                            {/* Track bar */}
                            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                              <motion.div
                                className="bg-gradient-to-r from-slate-400 via-amber-500 via-purple-500 to-blue-500 h-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressInfo.progressPercent}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                              />
                            </div>

                            {/* Level Pins */}
                            <div className="absolute top-[-3px] inset-x-0">
                              {/* Silver (0%) */}
                              <div className="absolute left-0 -translate-x-1/2 flex flex-col items-center">
                                <div className={`h-4.5 w-4.5 rounded-full border-2 transition-all duration-500 ${
                                  totalSpent >= 0 
                                    ? "bg-slate-400 border-white dark:border-slate-950 shadow-[0_0_12px_rgba(148,163,184,0.8)] ring-4 ring-slate-450/30 scale-110" 
                                    : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                                }`} />
                              </div>
                              {/* Gold (33.3%) */}
                              <div className="absolute left-[33.3%] -translate-x-1/2 flex flex-col items-center">
                                <div className={`h-4.5 w-4.5 rounded-full border-2 transition-all duration-500 ${
                                  totalSpent >= 5000 
                                    ? "bg-amber-500 border-white dark:border-slate-955 shadow-[0_0_12px_rgba(245,158,11,0.8)] ring-4 ring-amber-500/30 scale-110" 
                                    : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                                }`} />
                              </div>
                              {/* Platinum (66.6%) */}
                              <div className="absolute left-[66.6%] -translate-x-1/2 flex flex-col items-center">
                                <div className={`h-4.5 w-4.5 rounded-full border-2 transition-all duration-500 ${
                                  totalSpent >= 15000 
                                    ? "bg-purple-500 border-white dark:border-slate-955 shadow-[0_0_12px_rgba(168,85,247,0.8)] ring-4 ring-purple-500/30 scale-110" 
                                    : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                                }`} />
                              </div>
                              {/* Diamond (100%) */}
                              <div className="absolute left-[100%] -translate-x-1/2 flex flex-col items-center">
                                <div className={`h-4.5 w-4.5 rounded-full border-2 transition-all duration-500 ${
                                  totalSpent >= 30000 
                                    ? "bg-blue-500 border-white dark:border-slate-955 shadow-[0_0_12px_rgba(59,130,246,0.8)] ring-4 ring-blue-500/30 scale-110 animate-pulse" 
                                    : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                                }`} />
                              </div>
                            </div>
                          </div>

                          {/* Labels for level pins */}
                          <div className="flex justify-between text-[9px] text-slate-450 dark:text-slate-400 font-black uppercase tracking-wider font-mono">
                            <span className={totalSpent < 5000 ? "text-slate-650 dark:text-slate-300 font-extrabold" : ""}>Silver (₹0)</span>
                            <span className={totalSpent >= 5000 && totalSpent < 15000 ? "text-amber-500 font-extrabold" : ""}>Gold (₹5k)</span>
                            <span className={totalSpent >= 15000 && totalSpent < 30000 ? "text-purple-400 font-extrabold" : ""}>Platinum (₹15k)</span>
                            <span className={totalSpent >= 30000 ? "text-blue-400 font-extrabold" : ""}>Diamond (₹30k+)</span>
                          </div>
                        </div>

                        {/* Tier unlock cards grid */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          {[
                            { name: "Silver", threshold: 0, cashback: "1% Back", delivery: "Standard", color: "slate", icon: Award },
                            { name: "Gold", threshold: 5000, cashback: "3% Back", delivery: "Priority", color: "amber", icon: Sparkles },
                            { name: "Platinum", threshold: 15000, cashback: "5% Back", delivery: "Free Express", color: "purple", icon: CreditCard },
                            { name: "Diamond", threshold: 30000, cashback: "8% Back", delivery: "Free Express", color: "blue", icon: ShieldCheck }
                          ].map((tierItem, index) => {
                            const isUnlocked = totalSpent >= tierItem.threshold;
                            const currentTierIndex = totalSpent >= 30000 ? 3 : totalSpent >= 15000 ? 2 : totalSpent >= 5000 ? 1 : 0;
                            const isCurrent = currentTierIndex === index;
                            const Icon = tierItem.icon;
                            
                            let borderClass = "border-slate-200/40 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 opacity-50";
                            let ringClass = "";
                            let badgeBg = "bg-slate-200/50 text-slate-500 dark:bg-slate-850 dark:text-slate-400";
                            let badgeText = "Locked";
                            
                            if (isUnlocked) {
                              badgeText = "Unlocked";
                              if (tierItem.color === "slate") {
                                borderClass = "border-slate-400/30 bg-slate-400/5 text-slate-400";
                                badgeBg = "bg-slate-400/10 text-slate-400 border border-slate-400/20";
                              } else if (tierItem.color === "amber") {
                                borderClass = "border-amber-500/20 bg-amber-500/5 text-amber-400";
                                badgeBg = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                              } else if (tierItem.color === "purple") {
                                borderClass = "border-purple-500/20 bg-purple-500/5 text-purple-400";
                                badgeBg = "bg-purple-500/10 text-purple-400 border border-purple-500/20";
                              } else if (tierItem.color === "blue") {
                                borderClass = "border-blue-500/20 bg-blue-500/5 text-blue-400";
                                badgeBg = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                              }
                            }
                            
                            if (isCurrent) {
                              badgeText = "Active";
                              if (tierItem.color === "slate") {
                                ringClass = "ring-2 ring-slate-400 shadow-[0_0_12px_rgba(148,163,184,0.3)]";
                              } else if (tierItem.color === "amber") {
                                ringClass = "ring-2 ring-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]";
                              } else if (tierItem.color === "purple") {
                                ringClass = "ring-2 ring-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.3)]";
                              } else if (tierItem.color === "blue") {
                                ringClass = "ring-2 ring-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]";
                              }
                            }
                            
                            return (
                              <div key={tierItem.name} className={`rounded-2xl border p-3 flex flex-col justify-between space-y-3 transition-all duration-300 ${borderClass} ${ringClass}`}>
                                <div className="flex justify-between items-start">
                                  <div className={`p-1.5 rounded-lg ${isUnlocked ? "bg-white/10" : "bg-black/5 dark:bg-white/5"}`}>
                                    <Icon size={12} className={isUnlocked ? "" : "text-slate-500"} />
                                  </div>
                                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${badgeBg}`}>
                                    {badgeText}
                                  </span>
                                </div>
                                <div>
                                  <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200">{tierItem.name}</h5>
                                  <p className="text-[9px] text-slate-455 font-bold leading-normal mt-0.5">{tierItem.cashback} • {tierItem.delivery}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Milestone details footer summary */}
                        <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-800/80 flex flex-col justify-between items-stretch gap-3">
                          <div className="text-left">
                            <p className="text-xs font-black text-slate-850 dark:text-slate-250 uppercase tracking-wide">
                              {totalSpent >= 30000
                                ? "All luxury benefits unlocked!"
                                : totalSpent >= 15000
                                  ? `₹${(30000 - totalSpent).toLocaleString()} needed for Diamond VIP`
                                  : totalSpent >= 5000
                                    ? `₹${(15000 - totalSpent).toLocaleString()} needed for Platinum VIP`
                                    : `₹${(5000 - totalSpent).toLocaleString()} needed for Gold Tier`}
                            </p>
                            <p className="text-[10px] text-slate-455 dark:text-slate-550 font-bold mt-1 leading-normal">
                              {totalSpent >= 30000
                                ? "You are at the maximum level! Enjoy 8% cashback, free express shipping, and exclusive events."
                                : totalSpent >= 15000
                                  ? "Unlock 8% cashback, a dedicated support concierge, and early pre-order access."
                                  : totalSpent >= 5000
                                    ? "Unlock 5% cashback, free express shipping, and priority dispatch."
                                    : "Unlock 3% cashback, priority shipping, and member rewards."}
                            </p>
                          </div>
                          <span className="text-[9.5px] text-center font-black bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
                            {totalSpent >= 30000 ? "Maximum VIP Tier" : totalSpent >= 15000 ? "Diamond VIP Next" : totalSpent >= 5000 ? "Platinum VIP Next" : "Gold Tier Next"}
                          </span>
                        </div>
                      </div>

                      {/* 3. Rewards Dashboard Console */}
                      <div className="rounded-[32px] glass-panel p-6 space-y-5 luxury-card-glow text-left flex flex-col justify-between border border-slate-200/40 dark:border-slate-800">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                            <CreditCard size={15} className="text-emerald-400" />
                            <span>{t("rewards_dashboard")}</span>
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Manage available coupons & cashback rebates.</p>
                        </div>

                        <div className="space-y-3 flex-1 mt-2">
                          {/* Cashback Balance Row */}
                          <div className="p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800 bg-emerald-500/5 flex justify-between items-center">
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-500">{t("cashback_balance")}</p>
                              <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">₹{Math.floor(totalSpent * 0.05).toLocaleString("en-IN")}</p>
                            </div>
                            <span className="text-[9.5px] font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>
                          </div>

                          {/* Available Coupons Row */}
                          <div className="p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 flex justify-between items-center">
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-wider text-slate-455">{t("available_coupons")}</p>
                              <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">2 Coupons Available</p>
                            </div>
                            <span className="text-[9px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">VIP500</span>
                          </div>

                          {/* Perks Usage Analytics */}
                          <div className="p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 space-y-3">
                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-450">VIP Perks Usage</p>
                            
                            {/* Perk 1: AI Fitting Room Renders */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                <span>AI Fitting Room Renders</span>
                                <span className="font-mono text-[9px]">{totalSpent >= 30000 ? "Unlimited" : totalSpent >= 15000 ? "14/20 Used" : "3/5 Used"}</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-full h-1 overflow-hidden">
                                <div 
                                  className="bg-indigo-500 h-full rounded-full" 
                                  style={{ width: totalSpent >= 30000 ? "100%" : totalSpent >= 15000 ? "70%" : "60%" }} 
                                />
                              </div>
                            </div>

                            {/* Perk 2: Free Express Shipping */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                <span>Free Express Shipments</span>
                                <span className="font-mono text-[9px]">{totalSpent >= 15000 ? "Unlimited" : totalSpent >= 5000 ? "2/5 Used" : "0/1 Used"}</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-full h-1 overflow-hidden">
                                <div 
                                  className="bg-emerald-500 h-full rounded-full" 
                                  style={{ width: totalSpent >= 15000 ? "100%" : totalSpent >= 5000 ? "40%" : "0%" }} 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4. Curated Exclusives / Recommendations */}
                      <div className="rounded-[32px] glass-panel p-6 space-y-5 luxury-card-glow text-left flex flex-col justify-between border border-slate-200/40 dark:border-slate-800">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles size={15} className="text-indigo-400" />
                            <span>{t("fitting_room")} Exclusives</span>
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Premium items with tier-exclusive rates.</p>
                        </div>

                        <div className="space-y-3 flex-1 mt-2">
                          {[
                            { name: "Obsidian Smart Watch Pro", price: "₹24,999", discount: "5% VIP Reward", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150" },
                            { name: "Signature Amber Parfum 100ml", price: "₹12,200", discount: "Express Freebie", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=150" }
                          ].map((prod, pIdx) => (
                            <div key={pIdx} className="rounded-2xl border border-slate-200/40 dark:border-slate-800 overflow-hidden bg-slate-50/20 dark:bg-slate-900/10 flex p-2 gap-3 items-center group hover:shadow-md transition-all duration-300">
                              <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-900">
                                <img src={prod.image} alt={prod.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-[11.5px] font-black text-slate-900 dark:text-white truncate">{prod.name}</h5>
                                <p className="text-[9.5px] font-bold text-slate-455 dark:text-slate-500">{prod.price} • <span className="text-indigo-400 font-black">{prod.discount}</span></p>
                              </div>
                              <button onClick={() => navigate("/shop")} className="h-7 w-7 rounded-lg bg-slate-200/50 dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-350 hover:bg-orange-500 hover:text-white transition-all cursor-pointer shrink-0">
                                <ArrowRight size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: MAIN METRICS & HISTORY */}
                    <div className="space-y-8 min-w-0">
                      
                      {/* 1. Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        
                        {/* Stat 1: Lifetime Orders */}
                        <div className="group rounded-[24px] border border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-5 shadow-xs hover:shadow-md hover:border-orange-500/20 transition-all duration-300 flex items-stretch justify-between glass-panel luxury-card-glow min-h-[130px]">
                          <div className="flex flex-col justify-between text-left space-y-2 flex-1 min-w-0 pr-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block truncate" title={t("lifetime_orders")}>
                                {t("lifetime_orders")}
                              </span>
                              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                                {animatedOrdersCount}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500">
                              <TrendingUp size={12} className="shrink-0" />
                              <span className="truncate">+12.4% <span className="text-slate-400 dark:text-slate-555 font-normal">this month</span></span>
                            </div>
                          </div>
                          <div className="flex flex-col justify-between items-end shrink-0 w-20">
                            <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 text-white transition-all duration-300 group-hover:scale-110 shadow-md shadow-orange-500/10">
                              <Package size={12} />
                            </div>
                            <div className="w-full flex justify-end">
                              <svg className="w-16 h-7 text-orange-500 stroke-current fill-none opacity-80" viewBox="0 0 120 40" strokeWidth="3" strokeLinecap="round">
                                <path d={generateSparklinePath(orderCounts)} />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Stat 2: Total Spent */}
                        <div className="group rounded-[24px] border border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-5 shadow-xs hover:shadow-md hover:border-emerald-500/20 transition-all duration-300 flex items-stretch justify-between glass-panel luxury-card-glow min-h-[130px]">
                          <div className="flex flex-col justify-between text-left space-y-2 flex-1 min-w-0 pr-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block truncate" title={t("total_spent")}>
                                {t("total_spent")}
                              </span>
                              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                                {formatCurrencyCompact(animatedSpent)}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500">
                              <TrendingUp size={12} className="shrink-0" />
                              <span className="truncate">+18.7% <span className="text-slate-400 dark:text-slate-555 font-normal">this year</span></span>
                            </div>
                          </div>
                          <div className="flex flex-col justify-between items-end shrink-0 w-20">
                            <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-450 to-teal-550 text-white transition-all duration-300 group-hover:scale-110 shadow-md shadow-emerald-500/10">
                              <DollarSign size={12} />
                            </div>
                            <div className="w-full flex justify-end">
                              <svg className="w-16 h-7 text-emerald-500 stroke-current fill-none opacity-80" viewBox="0 0 120 40" strokeWidth="3" strokeLinecap="round">
                                <path d={generateSparklinePath(orderAmounts)} />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Stat 3: Reward Points */}
                        <div className="group rounded-[24px] border border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-5 shadow-xs hover:shadow-md hover:border-purple-500/20 transition-all duration-300 flex items-stretch justify-between glass-panel luxury-card-glow min-h-[130px]">
                          <div className="flex flex-col justify-between text-left space-y-2 flex-1 min-w-0 pr-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 block truncate" title={t("rewards")}>
                                {t("rewards")}
                              </span>
                              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                                {formatPointsCompact(animatedPoints)}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-500">
                              <Award size={12} className="shrink-0" />
                              <span className="truncate">{tier.name.split(" ")[0]} Perks</span>
                            </div>
                          </div>
                          <div className="flex flex-col justify-between items-end shrink-0 w-20">
                            <div className="flex h-7.5 w-7.5 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 text-white transition-all duration-300 group-hover:scale-110 shadow-md shadow-purple-500/10">
                              <Sparkles size={12} />
                            </div>
                            <div className="w-full flex justify-end">
                              <svg className="w-16 h-7 text-purple-500 stroke-current fill-none opacity-80" viewBox="0 0 120 40" strokeWidth="3" strokeLinecap="round">
                                <path d={generateSparklinePath(orderAmounts.map(v => v * 0.5))} />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Stat 4: Deliveries */}
                        <div className="group rounded-[24px] border border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-5 shadow-xs hover:shadow-md hover:border-blue-500/20 transition-all duration-300 flex items-stretch justify-between glass-panel luxury-card-glow min-h-[130px]">
                          <div className="flex flex-col justify-between text-left space-y-2 flex-1 min-w-0 pr-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block truncate" title={t("deliveries")}>
                                {t("deliveries")}
                              </span>
                              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                                {animatedDeliveries} <span className="text-xs font-normal text-slate-400">{t("active")}</span>
                              </h3>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-500">
                              <Truck size={12} className="shrink-0" />
                              <span className="truncate">
                                {activeShipments > 0 ? `${activeShipments} ${t("arriving_today")}` : t("all_delivered")}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col justify-between items-end shrink-0 w-20">
                            <div className="flex h-7.5 w-7.5 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 text-white transition-all duration-300 group-hover:scale-110 shadow-md shadow-blue-500/10">
                              <Truck size={12} />
                            </div>
                            <div className="w-full flex justify-end">
                              <svg className="w-16 h-7 text-blue-500 stroke-current fill-none opacity-80" viewBox="0 0 120 40" strokeWidth="3" strokeLinecap="round">
                                <path d={generateSparklinePath(orderAmounts.map((_, i) => (i % 2 === 0 ? 10 : 25)))} />
                              </svg>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* 2. Recent Deliveries */}
                      <div className="rounded-[32px] glass-panel p-6 space-y-6 luxury-card-glow text-left flex flex-col justify-between border border-slate-200/40 dark:border-slate-800">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                            <Clock size={16} className="text-orange-500 animate-spin-slow" />
                            <span>Recent Deliveries</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">Track the path of your active products.</p>
                        </div>

                        <div className="space-y-4 flex-1 mt-4 overflow-y-auto max-h-48 custom-scrollbar pr-1">
                          {orders.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
                              No orders placed yet
                            </div>
                          ) : (
                            orders.slice(0, 2).map((order, idx) => (
                              <div key={order._id || idx} className="rounded-2xl border border-slate-200/40 dark:border-slate-800/80 p-3 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-2 relative group hover:border-orange-500/10 transition-colors">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                  <span className="text-slate-450 dark:text-slate-500 font-mono">ID: #{order._id?.slice(-8).toUpperCase()}</span>
                                  <span className={`px-2 py-0.5 rounded-md ${order.orderStatus?.toLowerCase() === "delivered"
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                    }`}>
                                    {order.orderStatus || "Processing"}
                                  </span>
                                </div>

                                <div className="flex justify-between items-end">
                                  <div>
                                    <p className="text-xs font-black text-slate-900 dark:text-white">₹{order.amount.toLocaleString("en-IN")}</p>
                                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">{new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                                  </div>
                                  <button
                                    onClick={() => navigate("/orderdetail")}
                                    className="h-6 w-6 rounded-lg bg-slate-200/50 dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-350 group-hover:bg-orange-500 group-hover:text-white transition-all cursor-pointer"
                                  >
                                    <ArrowRight size={11} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* 3. Activity Feed */}
                      <div className="rounded-[32px] glass-panel p-6 space-y-5 luxury-card-glow text-left flex flex-col justify-between border border-slate-200/40 dark:border-slate-800">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                            <Bell size={15} className="text-purple-400 animate-bounce" />
                            <span>{t("recent_activity")}</span>
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Latest status updates of your account profile.</p>
                        </div>

                        <div className="space-y-3.5 flex-1 mt-2">
                          {[
                            { title: "Cashback Earned", desc: `₹${Math.floor(totalSpent * 0.05).toLocaleString()} added to rewards balance`, time: "Just Now", status: "emerald" },
                            { title: "VIP Tier Upgraded", desc: `Welcome to ${tier.name}!`, time: "1 day ago", status: "purple" },
                            { title: "Order Delivered", desc: "Item #CN-88394 has been delivered successfully", time: "3 days ago", status: "blue" },
                            { title: "Reward Redeemed", desc: "Redeemed 500 Points for discount voucher", time: "1 week ago", status: "orange" }
                          ].map((act, aIdx) => {
                            const statusColorMap = {
                              emerald: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
                              purple: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]",
                              blue: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]",
                              orange: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]",
                            };
                            return (
                              <div key={aIdx} className="flex gap-3 text-left">
                                <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${statusColorMap[act.status] || 'bg-slate-500'}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11.5px] font-black text-slate-900 dark:text-white leading-tight">{act.title}</p>
                                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-normal mt-0.5 truncate">{act.desc}</p>
                                </div>
                                <span className="text-[8.5px] font-bold text-slate-400 shrink-0 mt-0.5">{act.time}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 4. Loyalty Benefits */}
                      <div className="rounded-[32px] glass-panel p-6 space-y-5 luxury-card-glow text-left flex flex-col justify-between border border-slate-200/40 dark:border-slate-800">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck size={16} className="text-blue-400" />
                            <span>Active Loyalty Benefits</span>
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">VIP privileges active for your current status tier.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
                          {[
                            { title: "Insured Express Delivery", desc: "Priority delivery routes with zero shipping fees.", active: totalSpent >= 15000 },
                            { title: "AI Try-On Priority Queue", desc: "Unlimited VTON try-on renders with instant output.", active: totalSpent >= 15000 },
                            { title: "Exclusive Cash Rebates", desc: "Upto 8% cashback on all fashion & electronics.", active: true },
                            { title: "24/7 Dedicated Support", desc: "Direct access line to senior customer concierge.", active: totalSpent >= 30000 }
                          ].map((benefit, bIdx) => (
                            <div key={bIdx} className={`p-3 rounded-2xl border ${benefit.active ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-200/40 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 opacity-60'} flex gap-3 text-left items-start`}>
                              <div className={`p-1 rounded-full shrink-0 ${benefit.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                                <Check size={11} />
                              </div>
                              <div>
                                <h6 className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-tight">{benefit.title}</h6>
                                <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold mt-0.5 leading-normal">{benefit.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Quick-Jump Dashboard Settings previews */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200/50 dark:border-slate-800">
                    <div className="rounded-[28px] border border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-5 glass-panel text-left flex flex-col justify-between gap-4">
                      <div className="h-8.5 w-8.5 rounded-xl flex items-center justify-center bg-orange-500/10 border border-orange-500/20 text-orange-500">
                        <MapPin size={15} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white leading-tight">Addresses Management</h4>
                        <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-bold mt-1.5 leading-normal">You have {user.addresses?.length || 0} saved shipping address locations active.</p>
                      </div>
                      <button
                        onClick={() => setActiveProfileTab("addresses")}
                        className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-orange-500 hover:text-orange-655 cursor-pointer self-start"
                      >
                        <span>Manage Address</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>

                    <div className="rounded-[28px] border border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-5 glass-panel text-left flex flex-col justify-between gap-4">
                      <div className="h-8.5 w-8.5 rounded-xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Settings size={15} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white leading-tight">Credentials & Settings</h4>
                        <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-bold mt-1.5 leading-normal">Update email, name, custom SaaS profile avatar presets.</p>
                      </div>
                      <button
                        onClick={() => setActiveProfileTab("settings")}
                        className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-orange-500 hover:text-orange-655 cursor-pointer self-start"
                      >
                        <span>Edit profile Settings</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>

                    <div className="rounded-[28px] border border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-5 glass-panel text-left flex flex-col justify-between gap-4">
                      <div className="h-8.5 w-8.5 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <ShieldCheck size={15} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white leading-tight">Secure verification key</h4>
                        <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-bold mt-1.5 leading-normal">Generate or refresh your secure verification access keys.</p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveProfileTab("settings");
                          // Scroll to bottom (security section)
                          setTimeout(() => {
                            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                          }, 100);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-orange-500 hover:text-orange-655 cursor-pointer self-start"
                      >
                        <span>Check Security keys</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>

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
                      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">Saved Shipping Addresses</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">Manage details for fast, single-click checkout workflows.</p>
                    </div>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="self-start sm:self-center inline-flex items-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 px-4.5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md active:scale-95 transition cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add Address</span>
                    </button>
                  </div>

                  {(!user.addresses || user.addresses.length === 0) ? (
                    <div className="rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-slate-50/20 dark:bg-slate-950/10">
                      <MapPin size={28} className="mx-auto text-slate-400 mb-3" />
                      <p className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider">No saved addresses</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-semibold">Your address list is currently empty. Click "Add Address" to populate.</p>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2">
                      {user.addresses.map((addr) => (
                        <div
                          key={addr._id}
                          className="relative rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-5 flex flex-col justify-between group hover:border-orange-500/20 hover:shadow-lg transition-all duration-300 glass-panel"
                        >
                          <div className="space-y-2 pr-6 text-left break-words">
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
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">Profile Credentials & Settings</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">Edit credentials, security passwords, app reviews, and luxury visual settings.</p>
                  </div>

                  {/* Settings grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">

                    {/* Credentials form card */}
                    <div className="rounded-[32px] border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-6 glass-panel space-y-6">
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">Account Credentials</h4>

                      <form onSubmit={handleUpdateProfile} className="space-y-5">
                        {/* Name Input */}
                        <div className="relative group">
                          <User size={16} className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Display Name"
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100 placeholder-slate-400"
                          />
                        </div>

                        {/* Email Input */}
                        <div className="relative group">
                          <Mail size={16} className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                          <input
                            type="email"
                            required
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="Email Address"
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/20 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100 placeholder-slate-400"
                          />
                        </div>

                        {/* Password Input (Optional Update) */}
                        <div className="relative group">
                          <Lock size={16} className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                          <input
                            type="password"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            placeholder="Update Password (leave blank to keep current)"
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/20 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100 placeholder-slate-400"
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={savingProfile}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-xs font-black uppercase tracking-wider text-white px-6 py-3.5 transition active:scale-95 disabled:opacity-50 shadow-md cursor-pointer"
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
                    <div className="rounded-[32px] border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-6 glass-panel space-y-5 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">Luxury Avatar Presets</h4>
                        <p className="text-[10px] text-slate-450 dark:text-slate-550 font-bold mt-1">Select an premium gradient design or upload a custom image file.</p>
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
                              className={`h-11 rounded-xl bg-gradient-to-tr ${avatar.gradient} relative cursor-pointer border ${isSelected ? "border-orange-500 ring-2 ring-orange-500/25 scale-102" : "border-white/10"
                                } hover:scale-102 transition`}
                              title={avatar.name}
                            >
                              {isSelected && (
                                <span className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                                  <Check size={14} className="text-white" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="border-t border-slate-200/40 dark:border-slate-850 pt-4 flex flex-col gap-3">
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
                            <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                              <img src={selectedAvatar} alt="Upload preview" className="h-full w-full object-cover" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500">Custom Image Linked</span>
                            <button
                              onClick={() => setSelectedAvatar("")}
                              className="text-red-500 hover:underline text-[9px] font-black uppercase ml-auto tracking-wider cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* App rating comment feedback section inside tab settings */}
                  <div className="rounded-[32px] border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-6 sm:p-8 glass-panel space-y-6">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">App Experience Feedback</h4>
                      <p className="text-[10.5px] text-slate-450 dark:text-slate-500 font-bold mt-1">
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
                              className="transition duration-150 hover:scale-110 active:scale-95 cursor-pointer text-slate-200 dark:text-slate-800 hover:text-amber-400"
                              title={`${star} Star${star > 1 ? 's' : ''}`}
                            >
                              <svg
                                className={`h-8 w-8 ${star <= appRating
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

            <form onSubmit={handleAddAddress} className="p-6 space-y-4 text-left overflow-y-auto flex-1 custom-scrollbar">
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
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-955/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
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
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-955/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
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
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-955/40 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition text-slate-900 dark:text-slate-100"
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
