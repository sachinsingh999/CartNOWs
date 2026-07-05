import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  ShoppingCart,
  Heart,
  Star,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  Zap,
  Smartphone,
  Eye,
  Sliders,
  CheckCircle,
  HelpCircle,
  Copy,
  Info,
  Palette,
  Type,
  LayoutGrid,
  ShoppingBag,
  User,
  ArrowRight,
  Sun,
  Moon,
  Camera,
  Shirt,
  Headphones,
  Sparkle,
  Compass,
  ArrowUpRight,
  Clock,
  Trash2,
  Package,
  MapPin,
  QrCode,
  DollarSign
} from "lucide-react";

// Mock products database for showcase demo
const SHOWCASE_PRODUCTS = [
  {
    id: "p1",
    name: "Minimalist Leather Tote",
    price: 289,
    originalPrice: 420,
    rating: 4.8,
    reviews: 124,
    discount: "30% OFF",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80",
    description: "Premium full-grain Italian leather bag with hand-stitched detailing and spacious dual-compartments."
  },
  {
    id: "p2",
    name: "AeroPro ANC Earbuds",
    price: 199,
    originalPrice: 299,
    rating: 4.9,
    reviews: 342,
    discount: "33% OFF",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    description: "Hybrid active noise cancellation, custom spatial audio tracking, and up to 45 hours of ultra-low latency playback."
  },
  {
    id: "p3",
    name: "Chrono Titanium Watch",
    price: 520,
    originalPrice: 780,
    rating: 4.7,
    reviews: 89,
    discount: "33% OFF",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
    description: "Aerospace-grade brushed titanium case with scratch-resistant sapphire crystal and Japanese quartz movement."
  },
  {
    id: "p4",
    name: "Velvet Rose & Oud Eau",
    price: 145,
    originalPrice: 195,
    rating: 4.9,
    reviews: 215,
    discount: "25% OFF",
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80",
    description: "A decadent, mysterious blend of dark damask rose, rich agarwood smoke, and sweet praline undertones."
  },
  {
    id: "p5",
    name: "UltraLight Knit Runners",
    price: 160,
    originalPrice: 220,
    rating: 4.6,
    reviews: 156,
    discount: "27% OFF",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    description: "Responsive bio-foam cushioning wrapped in a single-thread breathable knit, designed for featherlight agility."
  },
  {
    id: "p6",
    name: "Nomad Matte Sunglasses",
    price: 110,
    originalPrice: 160,
    rating: 4.7,
    reviews: 73,
    discount: "31% OFF",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
    description: "Polarized lenses inside a lightweight matte cellulose acetate frame, offering absolute UV400 shield protection."
  }
];

const SHOWCASE_BRANDS = [
  { name: "Chanel", logo: "CH", font: "font-serif tracking-widest uppercase font-bold" },
  { name: "Apple", logo: "", font: "text-lg font-bold" },
  { name: "Nike", logo: "NIKE", font: "font-black italic tracking-tighter text-xl font-sans" },
  { name: "Prada", logo: "PRADA", font: "font-serif tracking-widest font-extrabold uppercase text-xs" },
  { name: "Dior", logo: "DIOR", font: "font-serif tracking-widest uppercase font-medium" }
];

const SHOWCASE_CATEGORIES = [
  { name: "Fashion", icon: Shirt, color: "from-[#FF6B6B]/20 to-[#FF8E8E]/10 border-[#FF6B6B]/30" },
  { name: "Electronics", icon: Headphones, color: "from-[#4D96FF]/20 to-[#6BCBFF]/10 border-[#4D96FF]/30" },
  { name: "Beauty", icon: Sparkles, color: "from-[#F07DEA]/20 to-[#E18FF0]/10 border-[#F07DEA]/30" },
  { name: "Kids", icon: Award, color: "from-[#6BCB77]/20 to-[#AFD68E]/10 border-[#6BCB77]/30" },
  { name: "Home", icon: Compass, color: "from-[#FFD93D]/20 to-[#FFE68C]/10 border-[#FFD93D]/30" }
];

export default function MobileShowcase() {
  // Simulator configuration states
  const [deviceColor, setDeviceColor] = useState("titanium"); // titanium, black, gold, silver
  const [isPhoneDark, setIsPhoneDark] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  
  // Simulated mobile state
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(["p1", "p4"]); // default pre-liked items
  const [activeTab, setActiveTab] = useState("home"); // home, categories, wishlist, orders, profile
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Custom Dynamic Island states
  const [islandState, setIslandState] = useState("idle"); // idle, cartNotify, offerNotify, notchExpand
  const [islandMessage, setIslandMessage] = useState("");
  const [islandSubtext, setIslandSubtext] = useState("");

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 34, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 4, minutes: 0, seconds: 0 }; // Loop/reset
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper: Trigger custom Dynamic Island message
  const triggerIslandAlert = (message, subtext = "", type = "cartNotify") => {
    setIslandMessage(message);
    setIslandSubtext(subtext);
    setIslandState(type);
    
    // Auto collapse after 3.5 seconds
    setTimeout(() => {
      setIslandState("idle");
    }, 3800);
  };

  // Simulated handlers
  const handleAddToCart = (product, size = "M") => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.size === size);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id && item.size === size 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
    
    triggerIslandAlert(
      "Added to Cart", 
      `${product.name} (Qty: 1) Added Successfully`, 
      "cartNotify"
    );
  };

  const handleToggleWishlist = (id) => {
    const product = SHOWCASE_PRODUCTS.find(p => p.id === id);
    setWishlist(prev => {
      const isLiked = prev.includes(id);
      if (isLiked) {
        triggerIslandAlert("Removed Wishlist", `${product?.name || "Item"} removed from saved items.`, "offerNotify");
        return prev.filter(item => item !== id);
      } else {
        triggerIslandAlert("Added to Wishlist ❤️", `${product?.name || "Item"} saved to favorites.`, "offerNotify");
        return [...prev, id];
      }
    });
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(""), 2000);
  };

  // Filter products by active category filter
  const filteredProducts = SHOWCASE_PRODUCTS.filter(p => {
    if (selectedCategory === "All") return true;
    return p.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Calculate cart metrics
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Device Border Styles depending on deviceColor
  const getDeviceFrameStyles = () => {
    switch (deviceColor) {
      case "titanium":
        return {
          frameColor: "border-[#C5B3A6] bg-[#8A7968]",
          ringColor: "ring-offset-2 ring-4 ring-[#8A7968]/50",
          shadowColor: "shadow-[0_25px_60px_-15px_rgba(138,121,104,0.4)]"
        };
      case "black":
        return {
          frameColor: "border-[#2d2e30] bg-[#1a1b1c]",
          ringColor: "ring-offset-2 ring-4 ring-[#2d2e30]/50",
          shadowColor: "shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55)]"
        };
      case "gold":
        return {
          frameColor: "border-[#E8D3B9] bg-[#CFB89A]",
          ringColor: "ring-offset-2 ring-4 ring-[#CFB89A]/50",
          shadowColor: "shadow-[0_25px_60px_-15px_rgba(207,184,154,0.4)]"
        };
      case "silver":
        return {
          frameColor: "border-[#E1E4E6] bg-[#BBC2C6]",
          ringColor: "ring-offset-2 ring-4 ring-[#BBC2C6]/50",
          shadowColor: "shadow-[0_25px_60px_-15px_rgba(187,194,198,0.35)]"
        };
      default:
        return {
          frameColor: "border-[#C5B3A6] bg-[#8A7968]",
          ringColor: "ring-offset-2 ring-4 ring-[#8A7968]/50",
          shadowColor: "shadow-[0_25px_60px_-15px_rgba(138,121,104,0.4)]"
        };
    }
  };

  const currentStyles = getDeviceFrameStyles();

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden font-sans antialiased">
      
      {/* Background Lighting Art */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-radial from-[#FF6B6B]/20 via-transparent to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-radial from-[#0B132B]/60 via-transparent to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] h-[700px] bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0 opacity-40" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-10 flex-1 flex flex-col justify-center">
        
        {/* Header section of showcase page */}
        <div className="w-full text-center lg:text-left mb-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF6B6B]/15 to-[#FF8E8E]/10 border border-[#FF6B6B]/30 backdrop-blur-md">
              <Sparkle className="w-4 h-4 text-[#FF6B6B] animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-xs font-semibold text-slate-100 dark:text-white tracking-wide uppercase">Award-Winning Mobile UI/UX</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-100 dark:text-white tracking-tight leading-none">
              CartNow <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FFA0A0] bg-clip-text text-transparent">Luxury Showcase</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-xl">
              An interactive, pixel-perfect simulation of the CartNow mobile e-commerce platform. Fully responsive and interactable inside an iPhone 16 Pro mockup frame.
            </p>
          </div>
          
          {/* Quick buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => triggerIslandAlert("Exclusive Discount Active", "Use code CARTNOW50 for 50% off select brands!", "offerNotify")}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#FF6B6B]/40 hover:bg-slate-800/80 transition-all duration-200 text-sm font-semibold flex items-center gap-2 text-[#FF6B6B] cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-[#FF6B6B]" />
              Simulate Flash Drop
            </button>
            <a 
              href="/"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:opacity-95 transition-all text-sm font-bold text-slate-100 dark:text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF6B6B]/20"
            >
              Go to Desktop Store
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Main Grid: Mockup Frame + Sidebar Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start justify-center">
          
          {/* Column 1: iPhone Mockup Container (6 cols on lg) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[920px]">
            
            {/* Phone Shadows and Glows */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[870px] rounded-[60px] blur-3xl pointer-events-none transition-all duration-700 opacity-60 z-0 bg-[#FF6B6B]/5 dark:bg-[#0B132B]/10`} />

            {/* Simulated iPhone 16 Pro Outer Frame */}
            <div className={`relative transition-all duration-500 w-[390px] h-[844px] rounded-[56px] border-[12px] ${currentStyles.frameColor} ${currentStyles.ringColor} ${currentStyles.shadowColor} bg-slate-950 flex flex-col justify-between overflow-hidden z-10 select-none`}>
              
              {/* iPhone Side Hardware Buttons Mock */}
              {/* Left Side: Volume Keys & Action Key */}
              <div className="absolute top-[160px] -left-[14px] w-[3px] h-[35px] bg-slate-700 rounded-l" />
              <div className="absolute top-[215px] -left-[14px] w-[3px] h-[55px] bg-slate-700 rounded-l" />
              <div className="absolute top-[280px] -left-[14px] w-[3px] h-[55px] bg-slate-700 rounded-l" />
              {/* Right Side: Power Button */}
              <div className="absolute top-[215px] -right-[14px] w-[3px] h-[75px] bg-slate-700 rounded-r" />

              {/* iPhone Screen Container (Independent Light/Dark mode) */}
              <div className={`w-full h-full relative flex flex-col justify-between transition-colors duration-300 overflow-hidden ${isPhoneDark ? "bg-[#0B0F19] text-white" : "bg-[#FAFAFA] text-[#0B132B]"}`}>
                
                {/* 1. Phone Top Bar (Dynamic Island & Network Status) */}
                <div className="absolute top-0 inset-x-0 h-10 flex items-center justify-between px-6 z-50 pointer-events-none">
                  {/* Left: Time */}
                  <span className={`text-[13px] font-bold tracking-tight ${isPhoneDark ? "text-slate-300" : "text-slate-700"}`}>12:26</span>
                  
                  {/* Center: Dynamic Island notch */}
                  <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 top-2.5 z-50">
                    <motion.div
                      layout
                      onClick={() => triggerIslandAlert("CartNow Dynamic Hub", "Tapped Dynamic Island notch. Smart gestures active.", "notchExpand")}
                      className={`h-[28px] rounded-full bg-slate-950 dark:bg-slate-900 cursor-pointer shadow-lg shadow-black/25 flex items-center px-3 justify-center gap-2 select-none`}
                      animate={{
                        width: islandState === "idle" ? 110 : islandState === "cartNotify" ? 220 : islandState === "offerNotify" ? 240 : 280,
                        height: islandState === "idle" ? 28 : 56,
                        borderRadius: islandState === "idle" ? 18 : 28,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                      {islandState === "idle" && (
                        <div className="w-full flex items-center justify-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                          <div className="w-1 h-1 rounded-full bg-amber-500/25" />
                        </div>
                      )}

                      {islandState !== "idle" && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-3 w-full text-left"
                        >
                          {islandState === "cartNotify" ? (
                            <div className="p-1.5 rounded-full bg-[#FF6B6B]/20 text-[#FF6B6B]">
                              <ShoppingCart className="w-4 h-4" />
                            </div>
                          ) : islandState === "offerNotify" ? (
                            <div className="p-1.5 rounded-full bg-amber-500/20 text-amber-400">
                              <Sparkles className="w-4 h-4 fill-amber-400" />
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-400">
                              <Smartphone className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex-1 overflow-hidden">
                            <p className="text-slate-100 dark:text-white text-xs font-bold leading-tight truncate">{islandMessage}</p>
                            <p className="text-slate-400 text-[10px] leading-none mt-0.5 truncate">{islandSubtext}</p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Right: Signal, Wifi, Battery */}
                  <div className={`flex items-center gap-1.5 text-[11px] font-medium ${isPhoneDark ? "text-slate-400" : "text-slate-600"}`}>
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 3c-1.2 0-2.4.3-3.6.8L12 8.4l3.6-4.6c-1.2-.5-2.4-.8-3.6-.8zm0 18c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8zm0-14c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6z"/></svg>
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    <div className="w-5 h-2.5 rounded-sm border border-current p-0.5 flex items-center">
                      <div className="h-full w-3 bg-current rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* 2. Sticky Glassmorphism Header */}
                <div className={`absolute top-0 inset-x-0 pt-9 pb-3.5 px-4 z-40 backdrop-blur-lg border-b flex flex-col gap-3 transition-colors ${ isPhoneDark ? "bg-[#0B0F19]/80 border-white/5" : "bg-[#FAFAFA]/85 border-slate-200" }`}>
                  <div className="flex items-center justify-between">
                    {/* Logo Wordmark */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FF6B6B] to-[#FF8E8E] flex items-center justify-center shadow-md shadow-[#FF6B6B]/25">
                        <ShoppingBag className="w-4 h-4 text-slate-100 dark:text-white" />
                      </div>
                      <span className="text-base font-black tracking-tight font-serif italic bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] bg-clip-text text-transparent">CartNow</span>
                    </div>

                    {/* Actions: Notifications & Cart */}
                    <div className="flex items-center gap-2">
                      {/* Bell icon */}
                      <button 
                        onClick={() => triggerIslandAlert("Exclusive Coupon Available", "Click Profile to redeem 10% cash back voucher.", "offerNotify")}
                        className={`p-2 rounded-xl border relative hover:scale-105 active:scale-95 transition-all ${ isPhoneDark ? "bg-slate-900 border-white/5 text-slate-300" : "bg-white border-slate-200 dark:border-slate-800 text-slate-600 shadow-xs" }`}
                      >
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF6B6B] animate-ping" />
                      </button>

                      {/* Cart icon */}
                      <button 
                        onClick={() => setActiveTab("wishlist")} // switches to interactive shopping cart/wishlist context
                        className={`p-2 rounded-xl border relative hover:scale-105 active:scale-95 transition-all ${ isPhoneDark ? "bg-slate-900 border-white/5 text-slate-300" : "bg-white border-slate-200 dark:border-slate-800 text-slate-600 shadow-xs" }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {cartTotalItems > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-[#FF6B6B] text-[9px] font-black text-slate-100 dark:text-white flex items-center justify-center shadow-md shadow-[#FF6B6B]/30"
                          >
                            {cartTotalItems}
                          </motion.span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Main Dynamic Screen Viewport */}
                <div className="flex-1 overflow-y-auto pt-25 pb-16 scrollbar-hide">
                  <AnimatePresence mode="wait">
                    
                    {/* TAB A: HOME SCREEN */}
                    {activeTab === "home" && (
                      <motion.div
                        key="tab-home"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-6"
                      >
                        {/* Immersive Luxury Hero Banner (60% Height) */}
                        <div className="relative w-full h-[360px] overflow-hidden">
                          {/* Hero Background Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-[#0B132B] via-[#1a233d] to-[#FF6B6B]/15 z-0" />
                          <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-radial from-[#FF6B6B]/25 to-transparent blur-2xl z-0" />
                          
                          {/* Luxury Lighting Glow Overlay */}
                          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />

                          {/* Model Photo (Occupies 60-70% space) */}
                          <img 
                            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80" 
                            alt="Fashion model"
                            className="absolute right-0 bottom-0 h-full w-[85%] object-cover object-center opacity-85 z-5 select-none"
                          />

                          {/* Soft overlay to make text highly readable */}
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/50 to-transparent z-6" />

                          {/* Hero Content Overlay */}
                          <div className="absolute bottom-6 left-5 right-5 z-20 flex flex-col items-start text-left gap-2 text-slate-100 dark:text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B6B] flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 fill-[#FF6B6B]" />
                              Summer Collection 2026
                            </span>
                            <h2 className="text-2xl font-black tracking-tight leading-none text-slate-100 dark:text-white drop-shadow-md">
                              Luxury Aesthetics.<br/>
                              <span className="text-[#FF8E8E]">Up to 50% OFF</span>
                            </h2>
                            <p className="text-[10px] text-slate-300 font-medium">
                              Free Shipping & Easy 30-Day Returns
                            </p>
                            <div className="flex items-center gap-2 mt-2 w-full">
                              <button 
                                onClick={() => {
                                  setSelectedCategory("Fashion");
                                  triggerIslandAlert("Premium Collection Mode", "Filtering to luxury garments and accessories.", "offerNotify");
                                }}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:scale-105 active:scale-95 transition-all text-xs font-extrabold text-slate-100 dark:text-white cursor-pointer shadow-md shadow-[#FF6B6B]/20"
                              >
                                Shop Now
                              </button>
                              <button 
                                onClick={() => {
                                  triggerIslandAlert("Showcase Mode Active", "Exploring luxury design elements & templates.", "notchExpand");
                                }}
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-semibold text-slate-100 dark:text-white border border-white/15 backdrop-blur-md cursor-pointer"
                              >
                                Explore
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Search Bar Input */}
                        <div className="px-4">
                          <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all ${ isPhoneDark ? "bg-slate-900/60 border-white/5 focus-within:border-[#FF6B6B]/40" : "bg-white border-slate-200 dark:border-slate-800 shadow-xs focus-within:border-[#FF6B6B]/40" }`}>
                            <Search className="w-4 h-4 text-slate-400" />
                            <input 
                              type="text" 
                              placeholder="Search products, brands, categories..."
                              className="bg-transparent text-xs w-full outline-hidden border-hidden font-medium text-slate-400 placeholder:text-slate-400"
                              onFocus={() => triggerIslandAlert("Smart search system active", "Type to search index of 14,000 items.", "offerNotify")}
                            />
                          </div>
                        </div>

                        {/* Horizontal Category Cards */}
                        <div className="flex flex-col gap-3 px-4 select-none">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-black tracking-tight ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>Luxury Categories</span>
                            <span className="text-[10px] font-bold text-[#FF6B6B] flex items-center gap-0.5 cursor-pointer">
                              View all <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
                            <button 
                              onClick={() => setSelectedCategory("All")}
                              className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all border ${ selectedCategory === "All" ? "bg-[#0B132B] dark:bg-white text-slate-100 dark:text-white dark:text-[#0B132B] border-transparent" : isPhoneDark ? "bg-slate-900 border-white/5 text-slate-400" : "bg-white border-slate-200 dark:border-slate-800 text-slate-600 shadow-2xs" }`}
                            >
                              All Items
                            </button>
                            {SHOWCASE_CATEGORIES.map((cat, idx) => {
                              const IconComponent = cat.icon;
                              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                              return (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedCategory(cat.name)}
                                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all border ${ isSelected ? "bg-[#0B132B] dark:bg-white text-slate-100 dark:text-white dark:text-[#0B132B] border-transparent" : isPhoneDark ? "bg-slate-900 border-white/5 text-slate-400" : "bg-white border-slate-200 dark:border-slate-800 text-slate-600 shadow-2xs" }`}
                                >
                                  <IconComponent className="w-3.5 h-3.5" />
                                  {cat.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Flash Sale Banner with Countdown */}
                        <div className="px-4 select-none">
                          <div className="relative rounded-3xl overflow-hidden p-5 bg-gradient-to-br from-[#0B132B] to-[#1D2B53] border border-white/10 text-slate-100 dark:text-white flex items-center justify-between">
                            {/* Decorative lighting */}
                            <div className="absolute right-0 top-0 w-32 h-32 bg-[#FF6B6B]/20 rounded-full blur-xl pointer-events-none" />
                            
                            <div className="flex flex-col gap-1 z-10">
                              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B6B] flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-[#FF6B6B]" />
                                Flash Sale Live
                              </span>
                              <h3 className="text-lg font-black tracking-tight leading-none text-slate-100 dark:text-white mt-1">Midnight Drop</h3>
                              
                              {/* Countdown timer */}
                              <div className="flex items-center gap-1 mt-2.5">
                                <div className="px-2 py-1 rounded-lg bg-white/10 border border-white/15 text-[11px] font-bold tracking-tight">
                                  {timeLeft.hours.toString().padStart(2, "0")}h
                                </div>
                                <span className="text-xs font-bold text-white/60">:</span>
                                <div className="px-2 py-1 rounded-lg bg-white/10 border border-white/15 text-[11px] font-bold tracking-tight">
                                  {timeLeft.minutes.toString().padStart(2, "0")}m
                                </div>
                                <span className="text-xs font-bold text-white/60">:</span>
                                <div className="px-2 py-1 rounded-lg bg-white/10 border border-white/15 text-[11px] font-bold tracking-tight text-[#FF6B6B]">
                                  {timeLeft.seconds.toString().padStart(2, "0")}s
                                </div>
                              </div>
                            </div>

                            {/* Promotional percentage tag */}
                            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center z-10 shrink-0">
                              <span className="text-2xl font-black text-[#FF6B6B] leading-none">50%</span>
                              <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-300 mt-1">OFF</span>
                            </div>
                          </div>
                        </div>

                        {/* Trending Products Grid (Interactive Cards) */}
                        <div className="flex flex-col gap-4.5 px-4">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className={`text-sm font-black tracking-tight ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>Trending Showcase</span>
                              <span className="text-[9px] font-bold text-slate-400">Curated by CartNow algorithms</span>
                            </div>
                            <span className="text-[10px] font-bold text-[#FF6B6B] flex items-center gap-0.5 cursor-pointer">
                              View all <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {filteredProducts.map((product) => {
                              const isLiked = wishlist.includes(product.id);
                              return (
                                <div 
                                  key={product.id}
                                  className={`group flex flex-col rounded-3xl overflow-hidden border p-3 relative transition-all duration-300 hover:-translate-y-1 ${ isPhoneDark ? "bg-[#111625] border-white/5 shadow-black/30" : "bg-white border-slate-100 shadow-md shadow-slate-100/50" }`}
                                >
                                  {/* Heart Button */}
                                  <button 
                                    onClick={() => handleToggleWishlist(product.id)}
                                    className={`absolute top-5 right-5 p-1.5 rounded-full backdrop-blur-md border z-20 cursor-pointer transition-all hover:scale-110 active:scale-95 ${ isLiked ? "bg-[#FF6B6B]/15 border-[#FF6B6B]/30 text-[#FF6B6B]" : "bg-black/20 border-white/10 text-slate-100 dark:text-white hover:bg-black/35" }`}
                                  >
                                    <Heart className="w-3.5 h-3.5" fill={isLiked ? "#FF6B6B" : "transparent"} />
                                  </button>

                                  {/* Discount Percentage Badge */}
                                  <span className="absolute top-5 left-5 px-2 py-1 rounded-lg bg-[#FF6B6B] text-[8px] font-extrabold text-slate-100 dark:text-white tracking-wide uppercase z-20 shadow-sm shadow-[#FF6B6B]/20">
                                    {product.discount}
                                  </span>

                                  {/* Image Container */}
                                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-900 mb-3 relative">
                                    <img 
                                      src={product.image} 
                                      alt={product.name}
                                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 select-none"
                                    />
                                  </div>

                                  {/* Product Specs */}
                                  <div className="flex-1 flex flex-col justify-between text-left">
                                    <div>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{product.category}</span>
                                      <h4 className={`text-xs font-black truncate mt-1 ${isPhoneDark ? "text-slate-200" : "text-[#0B132B]"}`}>
                                        {product.name}
                                      </h4>
                                      
                                      {/* Ratings */}
                                      <div className="flex items-center gap-1 mt-1.5">
                                        <div className="flex items-center text-amber-400">
                                          <Star className="w-3.5 h-3.5 fill-amber-400 text-transparent" />
                                        </div>
                                        <span className={`text-[10px] font-black ${isPhoneDark ? "text-slate-300" : "text-slate-600"}`}>
                                          {product.rating}
                                        </span>
                                        <span className="text-[9px] text-slate-400">({product.reviews})</span>
                                      </div>
                                    </div>

                                    {/* Pricing & Add to Cart */}
                                    <div className="flex items-center justify-between mt-3">
                                      <div className="flex flex-col">
                                        <span className={`text-sm font-black leading-none ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>
                                          ${product.price}
                                        </span>
                                        <span className="text-[10px] text-slate-400 line-through mt-0.5">
                                          ${product.originalPrice}
                                        </span>
                                      </div>
                                      
                                      <button 
                                        onClick={() => handleAddToCart(product)}
                                        className="p-2 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-slate-100 dark:text-white hover:opacity-95 active:scale-90 transition-all cursor-pointer shadow-md shadow-[#FF6B6B]/25"
                                      >
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Deal of the Day Banner */}
                        <div className="px-4">
                          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0B132B] to-[#1c2a4f] border border-white/5 p-5 text-slate-100 dark:text-white flex flex-col gap-4 text-left">
                            <div className="absolute right-0 bottom-0 top-0 w-1/2 overflow-hidden pointer-events-none opacity-80 z-0">
                              <img 
                                src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80" 
                                alt="Bag detail"
                                className="w-full h-full object-cover object-left-bottom select-none"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-[#0B132B] via-[#0B132B]/60 to-transparent" />
                            </div>

                            <div className="max-w-[60%] flex flex-col gap-1 z-10">
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#FF6B6B] flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 fill-[#FF6B6B] text-transparent" />
                                Deal of the Day
                              </span>
                              <h3 className="text-base font-black tracking-tight leading-tight mt-1 text-slate-100 dark:text-white">Italian Leather Carryall</h3>
                              <p className="text-[10px] text-slate-300 font-medium">Free express courier shipping in 24 hours.</p>
                            </div>

                            <div className="flex items-center gap-3 z-10">
                              <div className="flex flex-col text-left">
                                <span className="text-lg font-black text-slate-100 dark:text-white">$289</span>
                                <span className="text-[9px] text-slate-400 line-through">was $420</span>
                              </div>
                              <button 
                                onClick={() => handleAddToCart(SHOWCASE_PRODUCTS[0])}
                                className="px-4.5 py-2 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-xs font-bold text-slate-100 dark:text-white hover:opacity-95 cursor-pointer shadow-md shadow-[#FF6B6B]/20"
                              >
                                Claim Offer
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Recommended for You Carousel */}
                        <div className="flex flex-col gap-3 px-4">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-black tracking-tight ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>Recommended for You</span>
                            <span className="text-[10px] font-bold text-[#FF6B6B] flex items-center gap-0.5 cursor-pointer">
                              Explore More <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>

                          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide py-1 select-none">
                            {SHOWCASE_PRODUCTS.slice(3, 6).map((product) => (
                              <div 
                                key={product.id + "-rec"}
                                className={`flex items-center gap-3.5 p-3 rounded-2xl border shrink-0 w-[240px] text-left transition-all hover:scale-98 ${ isPhoneDark ? "bg-[#111625] border-white/5" : "bg-white border-slate-100 shadow-xs shadow-slate-100/50" }`}
                              >
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-16 h-16 rounded-xl object-cover shrink-0 select-none"
                                />
                                <div className="overflow-hidden flex flex-col justify-between h-14">
                                  <h4 className={`text-[11px] font-black truncate leading-none ${isPhoneDark ? "text-slate-200" : "text-[#0B132B]"}`}>
                                    {product.name}
                                  </h4>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mt-1">{product.category}</span>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-xs font-black ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>
                                      ${product.price}
                                    </span>
                                    <button 
                                      onClick={() => handleAddToCart(product)}
                                      className="text-[#FF6B6B] text-[10px] font-extrabold flex items-center gap-0.5 hover:underline cursor-pointer"
                                    >
                                      + Add
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Brands Showcase */}
                        <div className="flex flex-col gap-3 px-4">
                          <span className={`text-sm font-black tracking-tight text-left ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>Top Brands Showcase</span>
                          <div className="grid grid-cols-5 gap-2.5 py-1">
                            {SHOWCASE_BRANDS.map((brand, idx) => (
                              <button 
                                key={idx}
                                onClick={() => triggerIslandAlert(`Explore ${brand.name}`, `Opening ${brand.name} official luxury outlet.`, "offerNotify")}
                                className={`h-12 rounded-xl flex items-center justify-center border transition-all hover:scale-105 cursor-pointer ${ isPhoneDark ? "bg-[#111625] border-white/5 text-slate-300" : "bg-white border-slate-100 text-slate-700 shadow-2xs" }`}
                              >
                                <span className={brand.font}>{brand.logo}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Customer Rating Badges / Limited-time offer cards */}
                        <div className="px-4 mb-6">
                          <div className={`p-4 rounded-3xl border flex flex-col gap-3 ${ isPhoneDark ? "bg-slate-900/40 border-white/5" : "bg-slate-100/50 border-slate-200" }`}>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-green-500/10 text-green-500">
                                <CheckCircle className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <h4 className={`text-xs font-black ${isPhoneDark ? "text-slate-200" : "text-[#0B132B]"}`}>CartNow Secured Delivery</h4>
                                <p className="text-[9px] text-slate-400">Guaranteed secure checkout with zero-liability insurance.</p>
                              </div>
                            </div>
                            
                            <hr className={isPhoneDark ? "border-white/5" : "border-slate-200"} />

                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                <Star className="w-5 h-5 fill-amber-500 text-transparent" />
                              </div>
                              <div className="text-left">
                                <h4 className={`text-xs font-black ${isPhoneDark ? "text-slate-200" : "text-[#0B132B]"}`}>Rated 4.9/5 by Customers</h4>
                                <p className="text-[9px] text-slate-400">Based on over 120,000 certified checkout reviews worldwide.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB B: CATEGORIES GRID */}
                    {activeTab === "categories" && (
                      <motion.div
                        key="tab-categories"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="px-4 py-4 flex flex-col gap-6"
                      >
                        <div className="text-left">
                          <h2 className={`text-xl font-black ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>Taxonomies</h2>
                          <p className="text-[10px] text-slate-400">Browse trending departments & brand collections.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {SHOWCASE_CATEGORIES.map((cat, idx) => {
                            const IconComp = cat.icon;
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedCategory(cat.name);
                                  setActiveTab("home");
                                  triggerIslandAlert("Department Selected", `Filtered Home products to ${cat.name}`, "offerNotify");
                                }}
                                className={`p-4 rounded-3xl border flex flex-col items-start gap-4 text-left cursor-pointer transition-all hover:scale-98 ${ isPhoneDark ? "bg-[#111625] border-white/5" : "bg-white border-slate-100 shadow-xs text-[#0B132B]" }`}
                              >
                                <div className={`p-3 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                                  <IconComp className={`w-5 h-5 ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`} />
                                </div>
                                <div>
                                  <h4 className={`text-xs font-black ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>{cat.name}</h4>
                                  <span className="text-[9px] text-slate-400">1,200+ Products</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Featured catalog display */}
                        <div className="relative rounded-3xl overflow-hidden p-5 bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] text-slate-100 dark:text-white text-left">
                          <div className="absolute right-0 bottom-0 top-0 w-2/5 opacity-80 pointer-events-none">
                            <img 
                              src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80" 
                              alt="Glasses category"
                              className="w-full h-full object-cover object-center select-none"
                            />
                          </div>
                          
                          <div className="max-w-[65%] flex flex-col gap-1.5 z-10 relative">
                            <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 text-slate-100 dark:text-white px-2 py-0.5 rounded-md w-fit">Summer Special</span>
                            <h3 className="text-base font-black tracking-tight leading-tight mt-1">Premium Sunglasses & Eyewear</h3>
                            <button 
                              onClick={() => {
                                setSelectedCategory("Fashion");
                                setActiveTab("home");
                                triggerIslandAlert("Summer Eyewear Filtered", "Loaded premium optical catalog.", "offerNotify");
                              }}
                              className="mt-3 px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-[10px] font-bold rounded-lg w-fit transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                            >
                              Explore Items
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB C: WISHLIST / CART (State Sync) */}
                    {activeTab === "wishlist" && (
                      <motion.div
                        key="tab-wishlist"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="px-4 py-4 flex flex-col gap-6"
                      >
                        {/* Live Shopping Bag Summary */}
                        <div className={`p-4 rounded-3xl border text-left flex flex-col gap-3.5 ${ isPhoneDark ? "bg-[#111625] border-white/5" : "bg-white border-slate-100 shadow-sm" }`}>
                          <div className="flex items-center justify-between">
                            <h3 className={`text-xs font-black ${isPhoneDark ? "text-slate-300" : "text-[#0B132B]"}`}>Shopping Bag</h3>
                            <span className="text-[10px] font-bold text-slate-400">Total Items: {cartTotalItems}</span>
                          </div>
                          
                          {cart.length === 0 ? (
                            <p className="text-[10px] text-slate-400 py-2">Cart is empty. Add items from the trending grid!</p>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {cart.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 justify-between">
                                  <div className="flex items-center gap-2.5 overflow-hidden">
                                    <img 
                                      src={item.product.image} 
                                      alt={item.product.name} 
                                      className="w-10 h-10 rounded-lg object-cover shrink-0 select-none"
                                    />
                                    <div className="overflow-hidden">
                                      <h4 className={`text-[11px] font-black truncate ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>{item.product.name}</h4>
                                      <span className="text-[9px] text-slate-400">Qty: {item.quantity} • Size: {item.size}</span>
                                    </div>
                                  </div>
                                  <span className={`text-xs font-black ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>
                                    ${item.product.price * item.quantity}
                                  </span>
                                </div>
                              ))}
                              
                              <hr className={isPhoneDark ? "border-white/5" : "border-slate-100"} />
                              
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold ${isPhoneDark ? "text-slate-400" : "text-slate-600"}`}>Estimated Total:</span>
                                <span className={`text-sm font-black ${isPhoneDark ? "text-[#FF8E8E]" : "text-[#FF6B6B]"}`}>${cartSubtotal}</span>
                              </div>
                              <button 
                                onClick={() => {
                                  setCart([]);
                                  triggerIslandAlert("Checkout Initiated", "Simulating secure banking checkout panel.", "cartNotify");
                                }}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-slate-100 dark:text-white text-xs font-black text-center cursor-pointer shadow-md shadow-[#FF6B6B]/25 hover:opacity-95 transition-all"
                              >
                                Checkout Order
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Live Favorites (Wishlist) items */}
                        <div className="text-left flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className={`text-sm font-black ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>Saved Favorites</h3>
                              <span className="text-[9px] text-slate-400">Synced dynamically with home screen likes</span>
                            </div>
                            {wishlist.length > 0 && (
                              <button 
                                onClick={() => setWishlist([])}
                                className="text-[10px] font-bold text-slate-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Clear all
                              </button>
                            )}
                          </div>

                          {wishlist.length === 0 ? (
                            <div className="py-10 text-center flex flex-col items-center justify-center gap-3 bg-white/5 rounded-3xl border border-white/5">
                              <div className="p-3.5 rounded-full bg-slate-800 text-slate-500">
                                <Heart className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className={`text-xs font-black ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>No saved items yet</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">Explore collections and tap heart badges to save items.</p>
                              </div>
                              <button 
                                onClick={() => setActiveTab("home")}
                                className="mt-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-[#FF6B6B] cursor-pointer hover:bg-slate-800 transition-all"
                              >
                                Browse Home
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {wishlist.map(id => {
                                const prod = SHOWCASE_PRODUCTS.find(p => p.id === id);
                                if (!prod) return null;
                                return (
                                  <div 
                                    key={prod.id}
                                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${ isPhoneDark ? "bg-[#111625] border-white/5" : "bg-white border-slate-100 shadow-xs" }`}
                                  >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                      <img 
                                        src={prod.image} 
                                        alt={prod.name} 
                                        className="w-12 h-12 rounded-xl object-cover shrink-0 select-none"
                                      />
                                      <div className="overflow-hidden">
                                        <h4 className={`text-xs font-black truncate ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>{prod.name}</h4>
                                        <span className="text-[9px] font-bold text-[#FF6B6B]">{prod.discount}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => handleAddToCart(prod)}
                                        className="p-2 rounded-lg bg-[#FF6B6B]/15 hover:bg-[#FF6B6B]/25 text-[#FF6B6B] transition-all cursor-pointer"
                                      >
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleToggleWishlist(prod.id)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* TAB D: SIMULATED ORDERS TIMELINE */}
                    {activeTab === "orders" && (
                      <motion.div
                        key="tab-orders"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="px-4 py-4 flex flex-col gap-6"
                      >
                        <div className="text-left flex items-center justify-between">
                          <div>
                            <h2 className={`text-xl font-black ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>Active Shipping</h2>
                            <p className="text-[10px] text-slate-400">Track and manage your luxury dispatches.</p>
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20">
                            Secure Transit
                          </span>
                        </div>

                        {/* Simulated active order tracking */}
                        <div className={`p-4 rounded-3xl border text-left ${isPhoneDark ? "bg-[#111625] border-white/5" : "bg-white border-slate-100 shadow-xs"}`}>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-slate-400">CN-2026-9831</span>
                            <span className="text-[10px] font-black text-[#FF6B6B]">Estimated: Tomorrow</span>
                          </div>
                          
                          {/* Timeline design */}
                          <div className="flex flex-col gap-6 relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                            
                            {/* Step 1 */}
                            <div className="relative">
                              <span className="absolute -left-[20px] top-0.5 w-4 h-4 rounded-full bg-green-500 border-4 border-slate-900 flex items-center justify-center" />
                              <div className="flex flex-col gap-0.5">
                                <h4 className={`text-xs font-black ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>Parcel In Transit</h4>
                                <span className="text-[9px] text-slate-400">Hub Mumbai, IN - Carrier Dispatching</span>
                              </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative">
                              <span className="absolute -left-[20px] top-0.5 w-4 h-4 rounded-full bg-green-500 border-4 border-slate-900 flex items-center justify-center" />
                              <div className="flex flex-col gap-0.5">
                                <h4 className={`text-xs font-black ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>Undergoing Custom Check</h4>
                                <span className="text-[9px] text-slate-400">Passed safety evaluation check.</span>
                              </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative">
                              <span className="absolute -left-[20px] top-0.5 w-4 h-4 rounded-full bg-slate-700 border-4 border-slate-900 flex items-center justify-center" />
                              <div className="flex flex-col gap-0.5 opacity-60">
                                <h4 className={`text-xs font-black ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>Out for Delivery</h4>
                                <span className="text-[9px] text-slate-400">Assigned to local delivery associate.</span>
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* Historical invoices list */}
                        <div className="text-left flex flex-col gap-3">
                          <h3 className={`text-xs font-black ${isPhoneDark ? "text-slate-300" : "text-[#0B132B]"}`}>Past Dispatches</h3>
                          
                          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isPhoneDark ? "bg-[#111625] border-white/5" : "bg-white border-slate-100 shadow-2xs"}`}>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                                <Package className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className={`text-xs font-black ${isPhoneDark ? "text-slate-200" : "text-[#0B132B]"}`}>Luxury Fragrance Pack</h4>
                                <p className="text-[9px] text-slate-400">Delivered June 24, 2026 • Verified Sign</p>
                              </div>
                            </div>
                            <span className={`text-xs font-black ${isPhoneDark ? "text-white" : "text-[#0B132B]"}`}>$145</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB E: PROFILE & LOYALTY CARD */}
                    {activeTab === "profile" && (
                      <motion.div
                        key="tab-profile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="px-4 py-4 flex flex-col gap-6"
                      >
                        {/* Elite User Profile Card */}
                        <div className="relative rounded-3xl overflow-hidden p-5 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] border border-white/10 text-slate-100 dark:text-white text-left flex flex-col gap-6 shadow-xl shadow-black/40">
                          {/* Holographic chip design */}
                          <div className="absolute right-6 top-6 w-9 h-11 bg-radial from-amber-400/30 to-amber-600/10 border border-amber-500/20 rounded-lg pointer-events-none" />

                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#FF6B6B] flex items-center gap-1">
                              <Sparkle className="w-3.5 h-3.5 fill-[#FF6B6B] text-transparent" />
                              CartNow Elite Member
                            </span>
                            <h3 className="text-lg font-black tracking-tight leading-none text-slate-100 dark:text-white mt-1">Alexander Mercer</h3>
                            <span className="text-[9px] text-slate-400">VIP Member tier ID: #CN-8809-ALEX</span>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-500 uppercase">Available points</span>
                              <span className="text-xl font-black text-amber-400 leading-none mt-1">12,450 pts</span>
                            </div>
                            <QrCode className="w-8 h-8 text-white/40" />
                          </div>
                        </div>

                        {/* Interactive loyalty status strip */}
                        <div className={`p-4 rounded-3xl border text-left flex flex-col gap-3.5 ${ isPhoneDark ? "bg-[#111625] border-white/5" : "bg-white border-slate-100 shadow-sm" }`}>
                          <h3 className={`text-xs font-black ${isPhoneDark ? "text-slate-300" : "text-[#0B132B]"}`}>Loyalty Perks Status</h3>
                          
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                              <Award className="w-4 h-4 fill-amber-500 text-transparent" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className={isPhoneDark ? "text-slate-300" : "text-slate-600"}>Elite Black Tier Progress</span>
                                <span>85%</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1.5">
                                <div className="h-full bg-gradient-to-r from-amber-400 to-[#FF6B6B] rounded-full" style={{ width: '85%' }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Profile Settings links */}
                        <div className="flex flex-col gap-2.5">
                          {[
                            { name: "My Shipping Address", icon: MapPin, text: "Colaba, Mumbai, MH - 400005" },
                            { name: "Payments Methods", icon: DollarSign, text: "HDFC Credit Card **** 8920" }
                          ].map((item, idx) => {
                            const IconComp = item.icon;
                            return (
                              <button 
                                key={idx}
                                onClick={() => triggerIslandAlert("Mock Settings Access", `Simulating ${item.name} settings page.`, "notchExpand")}
                                className={`p-3.5 rounded-2xl border flex items-center justify-between text-left cursor-pointer transition-all hover:scale-99 ${ isPhoneDark ? "bg-[#111625] border-white/5" : "bg-white border-slate-100 shadow-2xs" }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-xl bg-slate-800/10 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                    <IconComp className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className={`text-xs font-black ${isPhoneDark ? "text-slate-200" : "text-[#0B132B]"}`}>{item.name}</h4>
                                    <p className="text-[9px] text-slate-400 mt-0.5">{item.text}</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. Glassmorphism Sticky Bottom Tab Navigation Bar */}
                <div className={`absolute bottom-0 inset-x-0 pt-2 pb-5 px-4 z-40 backdrop-blur-lg border-t flex items-center justify-around transition-colors ${ isPhoneDark ? "bg-[#0B0F19]/80 border-white/5" : "bg-[#FAFAFA]/85 border-slate-200" }`}>
                  {[
                    { key: "home", label: "Home", icon: Home },
                    { key: "categories", label: "Categories", icon: LayoutGrid },
                    { key: "wishlist", label: "Saved", icon: Heart },
                    { key: "orders", label: "Orders", icon: Package },
                    { key: "profile", label: "Profile", icon: User }
                  ].map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setActiveTab(tab.key);
                          triggerIslandAlert(`Navigated to ${tab.label}`, `Viewing mobile simulator tab ${tab.label}.`, "notchExpand");
                        }}
                        className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 ${ isActive ? "text-[#FF6B6B] scale-105" : isPhoneDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900" }`}
                      >
                        <TabIcon className="w-5 h-5" />
                        <span className="text-[9px] font-bold tracking-tight">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* iPhone Screen Home Indicator Bar */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[120px] h-[4px] rounded-full bg-slate-500/30 z-50 pointer-events-none" />

              </div>
            </div>
          </div>

          {/* Column 2: Presentation & Spec Sidebar (6 cols on lg) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Box A: Quick Specs */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#FF6B6B]/15 text-[#FF6B6B]">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-100 dark:text-white">Visual Identity Tokens</h3>
                  <p className="text-xs text-slate-400">Award-winning color models & typography standards</p>
                </div>
              </div>

              {/* Color Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                {[
                  { name: "Coral Pink Highlight", value: "#FF6B6B", role: "Primary CTA & badges" },
                  { name: "Dark Navy Accent", value: "#0B132B", role: "Headers & brand tags" },
                  { name: "Pearl White Canvas", value: "#FAFAFA", role: "App background (Light Mode)" },
                  { name: "Elite Midnight Dark", value: "#0B0F19", role: "App background (Dark Mode)" }
                ].map((color, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col gap-2 relative group overflow-hidden">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border border-slate-700 shadow-inner" style={{ backgroundColor: color.value }} />
                      <span className="text-xs font-black text-slate-100 dark:text-white">{color.value}</span>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-300 leading-none">{color.name}</h4>
                      <p className="text-[9px] text-slate-500 mt-1 leading-none">{color.role}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(color.value, `color-${idx}`)}
                      className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      {copiedText === `color-${idx}` ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Typography Specs */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                <Type className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-100 dark:text-white">Typography Hierarchy</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Primary Serif Logo: Custom brand typography, heavy display tracking.
                    Secondary Body: Clean grotesque sans-serif (system-ui scale) with 16px border-radius system parameters.
                  </p>
                </div>
              </div>
            </div>

            {/* Box B: Interactive Sandbox Controls */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-100 dark:text-white">UX Interaction Console</h3>
                  <p className="text-xs text-slate-400">Test mockup parameters and states in real-time</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Control item 1: Theme Selector */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800/60">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black text-slate-100 dark:text-white">Independent App Theme</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">Toggle phone theme separate from page wrapper</span>
                  </div>
                  <button
                    onClick={() => setIsPhoneDark(prev => !prev)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-xs font-bold"
                  >
                    {isPhoneDark ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-400" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-[#FF6B6B]" />
                        Dark Mode
                      </>
                    )}
                  </button>
                </div>

                {/* Control item 2: Device Color Selector */}
                <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/60">
                  <div className="flex flex-col text-left mb-1">
                    <span className="text-xs font-black text-slate-100 dark:text-white">iPhone 16 Pro Material Color</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">Choose metal finishing for mockup frame</span>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { key: "titanium", label: "Natural Titanium", class: "bg-[#C5B3A6]" },
                      { key: "black", label: "Space Black", class: "bg-[#2D2E30]" },
                      { key: "gold", label: "Desert Gold", class: "bg-[#E8D3B9]" },
                      { key: "silver", label: "Polished Silver", class: "bg-[#E1E4E6]" }
                    ].map((col) => (
                      <button
                        key={col.key}
                        onClick={() => setDeviceColor(col.key)}
                        className={`flex-1 py-2 px-1 rounded-xl text-[10px] font-bold border transition-all text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer ${ deviceColor === col.key ? "bg-slate-900 border-white/20 text-white" : "bg-slate-950 border-slate-800 hover:bg-slate-900/40 text-slate-400" }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${col.class} border border-white/10`} />
                        <span className="hidden sm:inline">{col.key.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Control item 3: Simulators */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => triggerIslandAlert(
                      "New AirDrop Coupon Incoming!",
                      "Code: ELITEDROP09 (Get 20% off accessories)",
                      "offerNotify"
                    )}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/30 hover:bg-slate-900 transition-all flex flex-col items-start gap-1 text-left cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-slate-100 dark:text-white mt-1">Holo Voucher drop</span>
                    <span className="text-[8px] text-slate-500">Expands dynamic island</span>
                  </button>

                  <button
                    onClick={() => triggerIslandAlert(
                      "Order Shipped Update",
                      "Carrier dispatched parcel CN-2026-9831",
                      "cartNotify"
                    )}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-[#FF6B6B]/30 hover:bg-slate-900 transition-all flex flex-col items-start gap-1 text-left cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-[#FF6B6B]" />
                    <span className="text-xs font-black text-slate-100 dark:text-white mt-1">Transit alert</span>
                    <span className="text-[8px] text-slate-500">iOS layout animations</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Box C: State Diagnostics (Check metrics) */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left space-y-4">
              <h3 className="text-sm font-black text-slate-100 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                Showcase Status Inspector
              </h3>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/60">
                  <span className="block text-xl font-black text-slate-100 dark:text-white leading-none">{cartTotalItems}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-1.5">Cart Items</span>
                </div>
                
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/60">
                  <span className="block text-xl font-black text-slate-100 dark:text-white leading-none">${cartSubtotal}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-1.5">Cart Value</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/60">
                  <span className="block text-xl font-black text-slate-100 dark:text-white leading-none">{wishlist.length}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-1.5">Wishlist Items</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
