import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import ProductCard from "./ProductCard";
import { getAverageRating, getReviewCount } from "../utils/productRatings";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import {
  ArrowRight,
  Sparkles,
  Truck,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
  ShoppingBag,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Heart,
  Eye,
  Star,
  CheckCircle2,
  X,
  Plus,
  Minus,
  MapPin,
  Volume2
} from "lucide-react";
import { toast } from "react-toastify";

// Animated counter utility
const StatCounter = ({ target, suffix = "", trigger = false }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const duration = 1500;
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const increment = Math.ceil(target / totalSteps);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, trigger]);
  return <span>{count.toLocaleString("en-IN")}{suffix}</span>;
};

const Home = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick view and state triggers
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [quickViewSize, setQuickViewSize] = useState("M");
  const [quickViewPincode, setQuickViewPincode] = useState("");
  const [quickViewDeliveryEstimate, setQuickViewDeliveryEstimate] = useState("");

  const [activeTab, setActiveTab] = useState("trending"); // trending | bestseller | recommended | wishlisted
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [fomoNotification, setFomoNotification] = useState(null);

  // Flash Sale Timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 44, seconds: 58 });

  // Fetch product list
  useEffect(() => {
    axios.get(`${backendUrl}/api/product/list`)
      .then(res => {
        if (res.data.success) {
          setAllProducts(res.data.products || []);
        }
      })
      .catch((err) => console.log("Failed to fetch products:", err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch Recently Viewed
  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
      if (list.length > 0 && allProducts.length > 0) {
        const matched = list
          .map(id => allProducts.find(p => p._id === id))
          .filter(Boolean);
        setRecentlyViewed(matched);
      }
    } catch (e) {}
  }, [allProducts]);

  // Flash sale timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 3, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Purchase Notifications (FOMO Feed)
  const mockPurchases = useMemo(() => [
    { name: "Aarav", location: "Delhi", time: "2m ago" },
    { name: "Priya", location: "Mumbai", time: "5m ago" },
    { name: "Rohan", location: "Bangalore", time: "1m ago" },
    { name: "Neha", location: "Pune", time: "3m ago" },
    { name: "Siddharth", location: "Kolkata", time: "8m ago" },
    { name: "Sneha", location: "Chennai", time: "4m ago" },
    { name: "Vikram", location: "Hyderabad", time: "6m ago" },
    { name: "Ananya", location: "Ahmedabad", time: "7m ago" },
  ], []);

  useEffect(() => {
    if (allProducts.length === 0) return;
    const showNotification = () => {
      const randomBuyer = mockPurchases[Math.floor(Math.random() * mockPurchases.length)];
      const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
      setFomoNotification({ buyer: randomBuyer, product: randomProduct });
      setTimeout(() => setFomoNotification(null), 5000);
    };

    const initialTimer = setTimeout(showNotification, 12000);
    const interval = setInterval(showNotification, 28000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [allProducts, mockPurchases]);

  // Tab calculations
  const trendingProducts = useMemo(() => {
    return [...allProducts]
      .filter(p => p.stock > 0)
      .sort((a, b) => getAverageRating(b) - getAverageRating(a))
      .slice(0, 4);
  }, [allProducts]);

  const bestSellers = useMemo(() => {
    return [...allProducts]
      .filter(p => p.stock > 0 && getAverageRating(p) >= 4.5)
      .slice(0, 4);
  }, [allProducts]);

  const recommendedProducts = useMemo(() => {
    return [...allProducts]
      .filter(p => p.stock > 0)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, [allProducts]);

  const wishlistedProducts = useMemo(() => {
    return [...allProducts]
      .filter(p => getReviewCount(p) > 0)
      .sort((a, b) => getReviewCount(b) - getReviewCount(a))
      .slice(0, 4);
  }, [allProducts]);

  const displayProducts = useMemo(() => {
    if (activeTab === "trending") return trendingProducts;
    if (activeTab === "bestseller") return bestSellers;
    if (activeTab === "recommended") return recommendedProducts;
    return wishlistedProducts;
  }, [activeTab, trendingProducts, bestSellers, recommendedProducts, wishlistedProducts]);

  const newArrivals = useMemo(() => {
    return [...allProducts].slice(-8).reverse();
  }, [allProducts]);

  // Premium Curated Testimonials
  const staticReviews = useMemo(() => [
    {
      id: 1,
      name: "Aarav Sharma",
      rating: 5,
      comment: "Absolutely in love with the quality of their organic cotton hoodies. They are so soft, durable, and look extremely high-end. Free shipping is an added bonus!",
      product: "Organic Heavyweight Hoodie",
      date: "2 days ago",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      id: 2,
      name: "Priya Patel",
      rating: 5,
      comment: "The contemporary cuts on the women's jackets fit perfectly. The dark mode theme of this website and premium checkout experience is top-notch.",
      product: "Structured Denim Blazer",
      date: "1 week ago",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    {
      id: 3,
      name: "Vikram Malhotra",
      rating: 4,
      comment: "Fast delivery, and returns were super smooth. The technical joggers are my absolute favorite for everyday wear now. Will definitely buy again.",
      product: "Technical Everyday Joggers",
      date: "3 days ago",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    },
    {
      id: 4,
      name: "Sneha Reddy",
      rating: 5,
      comment: "Excellent support! Had an issue with sizes, and customer support resolved it instantly. Kids collection is so adorable and gentle on skin.",
      product: "Kids Organic Cotton Set",
      date: "5 days ago",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    }
  ], []);

  // Intersection Observers for animations
  const [reviewsInView, setReviewsInView] = useState(false);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setReviewsInView(true);
      },
      { threshold: 0.1 }
    );
    const element = document.getElementById("community-reviews-section");
    if (element) observer.observe(element);
    return () => element && observer.unobserve(element);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsInView(true);
      },
      { threshold: 0.1 }
    );
    const element = document.getElementById("stats-section");
    if (element) observer.observe(element);
    return () => element && observer.unobserve(element);
  }, []);

  // Scroll logic for New Arrivals carousel
  const carouselRef = useRef(null);
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  // Quick View pincode checking
  const handleQuickViewPincodeCheck = (e) => {
    e.preventDefault();
    const val = quickViewPincode.trim();
    if (!/^\d{6}$/.test(val)) {
      toast.error("Please enter a valid 6-digit Pincode.");
      return;
    }
    const loc = String(quickViewProduct?.location || "Delhi").toLowerCase();
    if (val.startsWith("11") || val.startsWith("12") || val.startsWith("13") || val.startsWith("20")) {
      setQuickViewDeliveryEstimate(loc === "delhi" ? "⚡ Next-Day Delivery" : "📦 Delivery in 2 Days");
    } else if (val.startsWith("40") || val.startsWith("41") || val.startsWith("42") || val.startsWith("30")) {
      setQuickViewDeliveryEstimate(loc === "mumbai" ? "⚡ Next-Day Delivery" : "📦 Delivery in 2 Days");
    } else if (val.startsWith("56") || val.startsWith("57") || val.startsWith("60")) {
      setQuickViewDeliveryEstimate(loc === "bangalore" ? "⚡ Next-Day Delivery" : "📦 Delivery in 2-3 Days");
    } else {
      setQuickViewDeliveryEstimate("📦 Delivery in 3-5 Days");
    }
    toast.success("Delivery estimate updated.");
  };

  // Add to cart from quick view
  const handleQuickViewAddToCart = async () => {
    const token = localStorage.getItem("token") || "";
    if (quickViewProduct.stock === 0) return;

    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      const key = `${quickViewProduct._id}_${quickViewSize}`;
      guestCart[key] = (guestCart[key] || 0) + quickViewQty;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      window.dispatchEvent(new Event("cartUpdate"));
      toast.success("Added to cart! 🛍️");
    } else {
      try {
        const res = await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId: quickViewProduct._id, size: quickViewSize, qty: quickViewQty },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          window.dispatchEvent(new Event("cartUpdate"));
          toast.success("Added to cart! 🛍️");
        } else {
          toast.error(res.data.message);
        }
      } catch (err) {
        toast.error("Error adding to cart");
      }
    }
    setQuickViewProduct(null);
  };

  const categoryCards = [
    {
      name: "Men's Collection",
      path: "/product?category=men",
      image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600",
      desc: "Architectural lines & premium technical styles",
      count: "180+ Items",
      badge: "🔥 Trending"
    },
    {
      name: "Women's Collection",
      path: "/product?category=women",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600",
      desc: "Contemporary cuts & elegant modern silhouettes",
      count: "240+ Items",
      badge: "✨ Popular"
    },
    {
      name: "Kids' Collection",
      path: "/product?category=kid",
      image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600",
      desc: "Playful designs in ultra-soft organic cotton",
      count: "95+ Items",
      badge: "🌱 Organic"
    },
  ];

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen text-slate-700 dark:text-slate-300 font-sans pb-16 transition-colors duration-300 text-left">
      
      {/* ── promo alerts ticker (urgency) ── */}
      <div className="bg-slate-900 text-white py-2 px-4 border-b border-slate-800 text-center select-none text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 overflow-hidden">
        <Sparkles size={11} className="text-orange-500 animate-pulse" />
        <span>⚡ Flash Sale: Get 10% Off + free shipping with code <span className="text-orange-400">CART10</span></span>
        <span className="hidden sm:inline">·</span>
        <span className="flex items-center gap-1 text-orange-400">
          <Clock size={11} />
          Ends In: {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m {String(timeLeft.seconds).padStart(2, "0")}s
        </span>
      </div>

      {/* ── RETHOUGHT PREMIUM HERO SECTION ── */}
      <section className="relative min-h-[620px] lg:h-[calc(100vh-84px)] w-full overflow-hidden flex items-center bg-slate-950 px-6 sm:px-12 py-12 lg:py-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 lg:opacity-60 mix-blend-luminosity"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent z-10" />
        
        <div className="relative z-20 mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          {/* Left Text details */}
          <div className="space-y-6 text-left max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9.5px] font-black tracking-widest text-orange-400 uppercase">
              <Sparkles size={12} className="animate-spin duration-3000" />
              Next-Gen AI Commerce Experience
            </span>
            
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-[1.08] tracking-tight">
              Shop Smart. <br />
              Try Virtual. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-indigo-300">Wear Premium.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-350 leading-relaxed font-semibold">
              CartNOW matches a verified manufacturer ecosystem with state-of-the-art Generative AI Try-On. Upload your standing photo and preview garments instantly before checkout.
            </p>

            <div className="flex flex-wrap gap-4 pt-3">
              <button
                id="btn-hero-catalog"
                onClick={() => navigate("/product")}
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold tracking-wider uppercase hover:brightness-105 active:scale-95 transition shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                <span>Browse Fashion Catalog</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                id="btn-hero-tryon"
                onClick={() => navigate("/tryon")}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold tracking-wider uppercase active:scale-95 transition cursor-pointer"
              >
                <Sparkles size={13} className="text-orange-400" />
                <span>Launch AI Fitting Room</span>
              </button>
            </div>

            {/* verified value badges row */}
            <div className="pt-6 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-400">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider">
                <CheckCircle2 size={13} className="text-orange-500 shrink-0" />
                <span>Verified Sellers</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider">
                <Truck size={13} className="text-orange-500 shrink-0" />
                <span>Superfast Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck size={13} className="text-orange-500 shrink-0" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider">
                <RotateCcw size={13} className="text-orange-500 shrink-0" />
                <span>30-Day Returns</span>
              </div>
            </div>
          </div>

          {/* Right graphics (Interactive models previews) */}
          <div className="hidden lg:flex justify-end relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4 max-w-sm">
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden border border-white/10 bg-slate-900/60 p-2 transform -rotate-2 hover:rotate-0 transition duration-300 shadow-xl">
                  <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400" className="rounded-2xl aspect-[3/4] object-cover" alt="" />
                  <p className="text-[10px] font-bold text-white mt-2 text-center uppercase tracking-wide">Structured Fit</p>
                </div>
                <div className="rounded-3xl overflow-hidden border border-white/10 bg-slate-900/60 p-2 transform rotate-1 hover:rotate-0 transition duration-300 shadow-xl">
                  <img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400" className="rounded-2xl aspect-[3/4] object-cover" alt="" />
                  <p className="text-[10px] font-bold text-white mt-2 text-center uppercase tracking-wide">Linen Coordinate</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-3xl overflow-hidden border border-white/10 bg-slate-900/60 p-2 transform rotate-3 hover:rotate-0 transition duration-300 shadow-xl">
                  <img src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400" className="rounded-2xl aspect-[3/4] object-cover" alt="" />
                  <p className="text-[10px] font-bold text-white mt-2 text-center uppercase tracking-wide">Technical Wear</p>
                </div>
                <div className="rounded-3xl overflow-hidden border border-white/10 bg-slate-900/60 p-2 rounded-br-2xl transform -rotate-1 hover:rotate-0 transition duration-300 shadow-xl relative">
                  <span className="absolute top-4 right-4 bg-orange-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-md z-10 animate-pulse">Try On</span>
                  <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400" className="rounded-2xl aspect-[3/4] object-cover" alt="" />
                  <p className="text-[10px] font-bold text-white mt-2 text-center uppercase tracking-wide">Street Cargo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEDICATED AI TRY-ON INTERACTIVE SHOWCASE ── */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-12 items-center">
          
          {/* Left instructions timeline */}
          <div className="space-y-6 text-left">
            <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase block">
              Feature Spotlight
            </span>
            <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
              Revolutionary AI Fitting Room
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-2 font-semibold leading-relaxed">
              No more guessing sizes. Our high-fidelity neural texture alignment engine overlays garments on your portrait photo while preserving creases, shadows, and body metrics.
            </p>

            {/* timeline checklist cards */}
            <div className="space-y-4 pt-2">
              {[
                { step: "01", title: "Upload Standing Portrait", desc: "Use a clear, front-facing standing photo under standard lighting." },
                { step: "02", title: "Select Apparel Styles", desc: "Select any certified outfit from our catalog containing the 'Try On' badge." },
                { step: "03", title: "Generative Mapping", desc: "Our AI model overlays texture patterns and contours in less than 8 seconds." },
                { step: "04", title: "Add to Checkout", desc: "Add matching garments directly from the fit screen with verified size metrics." }
              ].map((timeline) => (
                <div key={timeline.step} className="flex gap-4 items-start relative group">
                  <div className="h-8.5 w-8.5 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 text-orange-500 text-xs font-black flex items-center justify-center shrink-0 shadow-sm transition group-hover:scale-105">
                    {timeline.step}
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">{timeline.title}</h4>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-505 font-bold mt-0.5">{timeline.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                id="btn-tryon-showcase-landing"
                onClick={() => navigate("/tryon")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                <Sparkles size={13} className="animate-pulse" />
                <span>Open Virtual Studio</span>
              </button>
            </div>
          </div>

          {/* Right before/after interactive slider */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-indigo-550/5 blur-3xl pointer-events-none rounded-3xl" />
            <BeforeAfterSlider
              beforeImage="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop"
              afterImage="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-between z-40 select-none">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0 text-white">
                  <Volume2 size={13} className="animate-wiggle" />
                </div>
                <div className="text-left font-bold text-[10px] text-white">
                  <p>Slide back & forth</p>
                  <p className="text-slate-400 mt-0.5 font-medium">To test precision fit alignment</p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                Garment: structured blazer
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ── BRAND STATISTICS SHOWCASE ── */}
      <section id="stats-section" className="border-y border-slate-200/50 dark:border-slate-900 bg-white/40 dark:bg-slate-900/10 py-10 mt-6">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              <StatCounter target={15000} suffix="+" trigger={statsInView} />
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
              Happy Customers
            </p>
          </div>

          <div className="text-center md:text-left space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              <StatCounter target={45000} suffix="+" trigger={statsInView} />
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
              Successful Orders
            </p>
          </div>

          <div className="text-center md:text-left space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              <StatCounter target={100} suffix="%" trigger={statsInView} />
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
              Verified Seller Hubs
            </p>
          </div>

          <div className="text-center md:text-left space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              <StatCounter target={99.8} suffix="%" trigger={statsInView} />
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
              Delivery Success SLA
            </p>
          </div>

        </div>
      </section>

      {/* ── BROWSE BY CURATED CATEGORY ── */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-left">
          <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase block">
            Curated Collections
          </span>
          <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
            Browse By Category
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-semibold">
            Explore premium catalogs backed by regional hub logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categoryCards.map((cat, index) => (
            <div
              key={cat.name}
              id={`cat-card-${index}`}
              onClick={() => navigate(cat.path)}
              className="group relative h-80 rounded-[32px] overflow-hidden border border-slate-200/50 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-2xl transition duration-300"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-transparent z-10" />

              {/* Tag indicator overlay */}
              <div className="absolute top-4 left-4 z-20">
                <span className="px-2.5 py-1 text-[8.5px] font-black tracking-wider uppercase text-slate-950 bg-white/95 backdrop-blur-md rounded-lg shadow">
                  {cat.badge}
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 z-20 text-white space-y-1">
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{cat.count}</p>
                <h3 className="text-xl font-black tracking-tight">{cat.name}</h3>
                <p className="text-[10.5px] font-medium text-slate-300 leading-snug mt-1">{cat.desc}</p>
                <div className="inline-flex items-center gap-1 text-[10.5px] font-black text-indigo-400 mt-3 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition duration-200">
                  <span>Shop Collection</span>
                  <ArrowRight size={11} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONVERSION-OPTIMIZED TABBED SECTION ── */}
      {allProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-12">
          
          {/* tab selectors list */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200/50 dark:border-slate-800 pb-4 mb-8">
            <div className="text-left">
              <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase block">
                Top Rated Selections
              </span>
              <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
                Curated For You
              </h2>
            </div>
            
            {/* tab selector buttons list */}
            <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-0.5 rounded-2xl flex-wrap sm:flex-nowrap">
              {[
                { id: "trending", label: "Trending Items", icon: TrendingUp },
                { id: "bestseller", label: "Best Sellers", icon: Award },
                { id: "recommended", label: "Recommended", icon: Sparkles },
                { id: "wishlisted", label: "Most Reviewed", icon: Heart },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10.5px] font-black uppercase transition-all duration-300 cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-100 shadow-md"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon size={12} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-orange-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product._id} product={product} onQuickView={setQuickViewProduct} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── NEW ARRIVALS HORIZONTAL SCROLL SLIDER ── */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-6 flex justify-between items-end">
            <div className="text-left">
              <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase block">
                Just Released
              </span>
              <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
                New Arrivals
              </h2>
            </div>
            
            {/* navigation arrows */}
            <div className="flex gap-2">
              <button
                onClick={() => scrollCarousel("left")}
                className="h-9 w-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center shadow hover:bg-slate-50 active:scale-95 transition cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scrollCarousel("right")}
                className="h-9 w-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center shadow hover:bg-slate-50 active:scale-95 transition cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide py-4 px-1 snap-x snap-mandatory"
          >
            {newArrivals.map((product) => (
              <div key={product._id} className="min-w-[240px] w-[240px] sm:min-w-[280px] sm:w-[280px] snap-start">
                <ProductCard product={product} onQuickView={setQuickViewProduct} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── RECENTLY VIEWED SHELF ── */}
      {recentlyViewed.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-12 border-t border-slate-200/50 dark:border-slate-900">
          <div className="mb-6 text-left">
            <span className="text-[10px] font-black tracking-widest text-orange-500 uppercase block">
              Your History
            </span>
            <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
              Recently Viewed Products
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recentlyViewed.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        </section>
      )}

      {/* ── REAL TESTIMONIALS (Loved by Community) ── */}
      <section
        id="community-reviews-section"
        className="mx-auto max-w-7xl px-6 py-16 overflow-hidden border-t border-slate-200/50 dark:border-slate-900"
      >
        <div className="mb-12 text-center">
          <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase block">
            What Our Customers Say
          </span>
          <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
            Loved by our Community
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-1 font-semibold">
            Real stories from verified customers around the globe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left testimonial cards */}
          <div className="space-y-6 flex flex-col justify-between">
            {staticReviews.slice(0, 2).map((rev, idx) => (
              <div
                key={rev.id}
                id={`reviews-card-${rev.id}`}
                className={`transform transition-all duration-1000 ease-out ${
                  reviewsInView ? "translate-x-0 opacity-100" : "-translate-x-24 opacity-0"
                }`}
              >
                <div className={`bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-[28px] p-6 shadow-sm relative hover:shadow-md hover:border-indigo-500/20 text-left ${
                  idx % 2 === 0 ? "animate-float-slow" : "animate-float-slow [animation-delay:2s]"
                }`}>
                  <div className="absolute top-4 right-6 text-slate-100 dark:text-slate-800/50 font-serif text-6xl leading-none select-none pointer-events-none">
                    “
                  </div>

                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-800'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-250 leading-relaxed font-semibold italic pr-6">
                    "{rev.comment}"
                  </p>

                  <div className="mt-5 flex items-center gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    <img src={rev.avatar} alt={rev.name} className="h-9.5 w-9.5 rounded-full object-cover shadow-sm" />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        {rev.name}
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[7px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full uppercase">
                          ✓ Verified Buyer
                        </span>
                      </h4>
                      <p className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-0.5 font-bold">
                        Purchased: <span className="font-extrabold text-slate-500 dark:text-slate-400">{rev.product}</span> · {rev.date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right testimonial cards */}
          <div className="space-y-6 flex flex-col justify-between">
            {staticReviews.slice(2, 4).map((rev, idx) => (
              <div
                key={rev.id}
                id={`reviews-card-${rev.id}`}
                className={`transform transition-all duration-1000 ease-out ${
                  reviewsInView ? "translate-x-0 opacity-100" : "translate-x-24 opacity-0"
                }`}
              >
                <div className={`bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-[28px] p-6 shadow-sm relative hover:shadow-md hover:border-indigo-500/20 text-left ${
                  idx % 2 === 0 ? "animate-float-slow [animation-delay:1s]" : "animate-float-slow [animation-delay:3s]"
                }`}>
                  <div className="absolute top-4 right-6 text-slate-100 dark:text-slate-800/50 font-serif text-6xl leading-none select-none pointer-events-none">
                    “
                  </div>

                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-800'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-250 leading-relaxed font-semibold italic pr-6">
                    "{rev.comment}"
                  </p>

                  <div className="mt-5 flex items-center gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    <img src={rev.avatar} alt={rev.name} className="h-9.5 w-9.5 rounded-full object-cover shadow-sm" />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        {rev.name}
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[7px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full uppercase">
                          ✓ Verified Buyer
                        </span>
                      </h4>
                      <p className="text-[9.5px] text-slate-400 dark:text-slate-505 mt-0.5 font-bold">
                        Purchased: <span className="font-extrabold text-slate-500 dark:text-slate-400">{rev.product}</span> · {rev.date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES BAR ── */}
      <section className="border-t border-slate-200/50 dark:border-slate-900 bg-white/40 dark:bg-slate-900/10 py-12 mt-12">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-150/40 dark:border-indigo-900/30">
              <Truck size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Free Shipping</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">On orders above ₹999</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-150/40 dark:border-emerald-900/30">
              <RotateCcw size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">30 Day Returns</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Easy, hassle-free returns</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-150/40 dark:border-amber-900/30">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Secure Checkout</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">SSL secure checkout</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-150/40 dark:border-sky-900/30">
              <HelpCircle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">24/7 Support</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Dedicated customer help</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── SIMULATED LIVE FOMO TOAST POPUP ── */}
      {fomoNotification && (
        <div
          onClick={() => {
            navigate(`/product/${fomoNotification.product._id}`);
            setFomoNotification(null);
          }}
          className="fixed bottom-16 sm:bottom-6 left-4 right-4 sm:right-auto sm:left-6 z-50 overflow-hidden max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl p-3.5 flex items-center gap-3 cursor-pointer animate-in slide-in-from-bottom-6 fade-in duration-300 hover:border-orange-500/35 select-none"
        >
          <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-850 shrink-0 border border-slate-100 dark:border-slate-800">
            <img
              src={fomoNotification.product.images?.[0]?.startsWith("http") ? fomoNotification.product.images[0] : `${backendUrl}/${fomoNotification.product.images?.[0]}`}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1 text-left text-[11px] leading-snug font-bold">
            <p className="text-slate-850 dark:text-slate-100 flex items-center gap-1">
              <span className="text-orange-500">{fomoNotification.buyer.name}</span>
              <span>from {fomoNotification.buyer.location} bought this!</span>
            </p>
            <p className="text-slate-400 mt-0.5 text-[10px] truncate max-w-56 font-semibold">
              {fomoNotification.product.name}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFomoNotification(null);
            }}
            className="h-5 w-5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── GLASSMORPHIC QUICK VIEW OVERLAY MODAL ── */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <div
            onClick={() => setQuickViewProduct(null)}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-8 text-left z-10 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition flex items-center justify-center cursor-pointer font-black"
            >
              <X size={15} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Product Image Panel */}
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-50/80 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-6 flex items-center justify-center">
                <img
                  src={quickViewProduct.images?.[0]?.startsWith("http") ? quickViewProduct.images[0] : `${backendUrl}/${quickViewProduct.images?.[0]}`}
                  alt={quickViewProduct.name}
                  className="max-h-72 object-contain"
                />
              </div>

              {/* Product Details Panel */}
              <div className="space-y-5">
                <div>
                  <span className="text-[9px] font-black tracking-widest text-indigo-650 dark:text-indigo-400 uppercase">
                    {quickViewProduct.brand || "CartNOW Apparel"}
                  </span>
                  <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
                    {quickViewProduct.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] mt-1.5">
                    <div className="flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded text-amber-500 font-black">
                      <Star size={11} className="fill-amber-500 stroke-none" />
                      <span>{getAverageRating(quickViewProduct) ? getAverageRating(quickViewProduct).toFixed(1) : "New"}</span>
                    </div>
                    <span className="text-slate-400 dark:text-slate-500 font-bold">
                      ({getReviewCount(quickViewProduct) || 0} customer reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-2xl font-black text-slate-950 dark:text-white">
                    ₹{Number(quickViewProduct.price).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                    ₹{Math.round(quickViewProduct.price * 1.25).toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Size Selector */}
                {quickViewProduct.sizes?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-505">Select Size</p>
                    <div className="flex gap-2">
                      {quickViewProduct.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setQuickViewSize(size)}
                          className={`h-8 px-3 rounded-lg text-xs font-black uppercase transition border cursor-pointer ${
                            quickViewSize === size
                              ? "bg-slate-950 border-slate-950 text-white dark:bg-orange-500 dark:border-orange-500"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-350"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-505">Quantity</p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setQuickViewQty(prev => Math.max(1, prev - 1))}
                      className="h-8.5 w-8.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs font-black">{quickViewQty}</span>
                    <button
                      onClick={() => setQuickViewQty(prev => prev + 1)}
                      className="h-8.5 w-8.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Regional Deliverability */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-505 flex items-center gap-1">
                    <MapPin size={11} className="text-orange-500" />
                    <span>Check Deliverability</span>
                  </p>
                  <form onSubmit={handleQuickViewPincodeCheck} className="flex gap-2 max-w-xs">
                    <input
                      type="text"
                      maxLength={6}
                      value={quickViewPincode}
                      onChange={(e) => setQuickViewPincode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-digit Pincode"
                      className="w-full h-8.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-2.5 text-xs outline-none focus:border-orange-500 transition-colors"
                    />
                    <button
                      type="submit"
                      className="h-8.5 rounded-lg bg-slate-950 dark:bg-slate-800 hover:brightness-105 text-white font-bold text-[10px] px-3 active:scale-95 transition-all select-none cursor-pointer"
                    >
                      Check
                    </button>
                  </form>
                  {quickViewDeliveryEstimate && (
                    <p className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 transition-all">
                      {quickViewDeliveryEstimate}
                    </p>
                  )}
                </div>

                {/* Action CTA */}
                <div className="pt-4">
                  <button
                    onClick={handleQuickViewAddToCart}
                    disabled={quickViewProduct.stock === 0}
                    className={`flex items-center justify-center gap-1.5 w-full h-11 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md active:scale-98 transition duration-200 cursor-pointer ${
                      quickViewProduct.stock === 0
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                        : "bg-indigo-650 hover:bg-indigo-700 shadow-indigo-500/10"
                    }`}
                  >
                    <ShoppingBag size={13} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
