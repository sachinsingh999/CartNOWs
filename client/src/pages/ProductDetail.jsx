import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import Rating from "../componenets/Rating";
import CostomersReviews from "../componenets/CostomersReviews";
import GiveReview from "../componenets/GiveReview";
import WriteReviewModal from "../componenets/WriteReviewModal";
import ProductCard from "./ProductCard";
import { getAverageRating, getReviewCount } from "../utils/productRatings";
import { trackView } from "../utils/engagement";
import { toast } from "react-toastify";
import { useLanguage } from "../context/LanguageContext";
import { 
  Sparkles, 
  ArrowLeft, 
  Star, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  ShoppingCart, 
  ShoppingBag,
  Plus,
  Minus,
  MessageSquare,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Send,
  HelpCircle,
  BarChart2,
  Users,
  ChevronDown,
  ChevronUp,
  Share2,
  Video,
  Rotate3d,
  FileText,
  Check,
  Eye,
  Flame,
  ShieldAlert,
  Award,
  Activity,
  Feather,
  Shield,
  Info
} from "lucide-react";
import { useComparison } from "../context/ComparisonContext";


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();


  const [product, setProduct] = useState(null);
  const [mainImg, setMainImg] = useState("");
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const { addToCompare, removeFromCompare, isInCompare } = useComparison();
  const isComparing = isInCompare(id);

  // Redesign state additions
  const [selectedColor, setSelectedColor] = useState("Midnight");
  const [selectedStorage, setSelectedStorage] = useState("256GB");
  const [mediaMode, setMediaMode] = useState("image"); 
  const [openAccordion, setOpenAccordion] = useState("overview"); 
  const [bundleChecked, setBundleChecked] = useState([true, true]); 
  const [showStickyBar, setShowStickyBar] = useState(false);
  // High-fidelity lightbox and interactive states
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImgIdx, setLightboxImgIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviewsFilter, setReviewsFilter] = useState("All Reviews");
  const [reviewsSortBy, setReviewsSortBy] = useState("Most Recent");
  const [relatedPage, setRelatedPage] = useState(0);

  useEffect(() => {
    if (product && product._id) {
      let list = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      list = list.filter(item => item._id !== product._id);
      list.unshift(product);
      if (list.length > 6) {
        list = list.slice(0, 6);
      }
      localStorage.setItem("recentlyViewed", JSON.stringify(list));
      setRecentlyViewed(list.filter(item => item._id !== product._id));
    }
  }, [product]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("wishlist")) || [];
    setIsFavorite(list.includes(id));
  }, [id]);

  const toggleFavorite = async () => {
    if (!product) return;
    const token = localStorage.getItem("token") || "";
    if (token) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/wishlist/toggle`,
          { productId: product._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          setIsFavorite(!isFavorite);
          const updatedList = response.data.wishlist || [];
          localStorage.setItem("wishlist", JSON.stringify(updatedList));
          toast.success(!isFavorite ? "Added to wishlist" : "Removed from wishlist");
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      const list = JSON.parse(localStorage.getItem("wishlist")) || [];
      const index = list.indexOf(product._id);
      if (index === -1) {
        list.push(product._id);
        setIsFavorite(true);
        toast.success("Added to wishlist");
      } else {
        list.splice(index, 1);
        setIsFavorite(false);
        toast.success("Removed from wishlist");
      }
      localStorage.setItem("wishlist", JSON.stringify(list));
    }
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const isFashionItem = (p) => {
    if (!p) return false;
    const cat = (p.category || "").toLowerCase();
    const col = (p.collection || "").toLowerCase();
    return (
      cat.includes("clothing") ||
      cat.includes("fashion") ||
      cat.includes("apparel") ||
      cat.includes("men") ||
      cat.includes("women") ||
      cat.includes("kid") ||
      cat.includes("footwear") ||
      cat.includes("accessories") ||
      col.includes("men") ||
      col.includes("women") ||
      col.includes("kid")
    );
  };

  useEffect(() => {
    if (showAssistant && chatMessages.length === 0 && product) {
      setChatMessages([
        {
          sender: "assistant",
          text: `Hello! I am your CartNOW AI Assistant. 🤖\n\nI can help you with details, specifications, or queries about **${product.name}**.\n\nWhat would you like to know?`,
        },
      ]);
    }
  }, [showAssistant, product]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const userMsg = { sender: "user", text: query };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const history = chatMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }));

      const res = await axios.post(`${backendUrl}/api/ai/chat`, {
        message: `${query} (Context: We are discussing the product ${product.name}, category: ${product.category}, price: ₹${product.price}, description: ${product.description})`,
        history
      });

      if (res.data && res.data.reply) {
        setChatMessages((prev) => [...prev, { sender: "assistant", text: res.data.reply }]);
      } else {
        setChatMessages((prev) => [...prev, { sender: "assistant", text: "I'm having trouble connecting right now. Please try again! 🛍️" }]);
      }
    } catch (error) {
      console.error("AI chat client error:", error);
      setChatMessages((prev) => [...prev, { sender: "assistant", text: "I'm having trouble connecting right now. Please try again! 🛍️" }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/product/single/${id}`);
        const data = await res.json();
        
        if (data.success && data.product) {
          setProduct(data.product);
          setMainImg(data.product.images[0]);
          trackView(data.product); // track for personalisation
          setRelatedPage(0);

          const listRes = await axios.get(`${backendUrl}/api/product/list?limit=100`);
          if (listRes.data.success) {
            let related = listRes.data.products.filter(
              (item) =>
                item._id !== data.product._id &&
                item.category?.toLowerCase() === data.product.category?.toLowerCase()
            );
            
            // Fallback: If not enough related products in same category, fill with others
            if (related.length < 5) {
              const others = listRes.data.products.filter(
                (item) =>
                  item._id !== data.product._id &&
                  item.category?.toLowerCase() !== data.product.category?.toLowerCase()
              );
              related = [...related, ...others].slice(0, 12);
            } else {
              related = related.slice(0, 12);
            }
            setRelatedProducts(related);
          }
        } else {
          setProduct(false);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (product === null) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading product experience...</span>
        </div>
      </div>
    );
  }

  if (product === false) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm max-w-sm">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <X size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Product Not Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">The item you are looking for might have been removed or is temporarily unavailable.</p>
          <button 
            onClick={() => navigate("/product")}
            className="mt-5 w-full py-2.5 bg-slate-950 dark:bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
          >
            Browse Catalog
          </button>
        </div>
      </div>
    );
  }

  const averageRating = getAverageRating(product);
  const reviewCount = getReviewCount(product);

  const isRedBg = product.category?.toLowerCase() === "sports" || product.name?.toLowerCase().includes("roller") || product.name?.toLowerCase().includes("nike") || product.name?.toLowerCase().includes("shoe");
  const emiAmount = Math.floor(product.price / 12);
  const discountPercent = 20;
  const originalPrice = Math.round(product.price / (1 - discountPercent / 100));

  const getHighlights = () => {
    const name = (product.name || "").toLowerCase();
    const cat = (product.category || "").toLowerCase();
    
    if (name.includes("roller") || name.includes("foam")) {
      return [
        { title: "Premium Quality", desc: "Top graded material" },
        { title: "Deep Tissue Relief", desc: "Targets muscle knots" },
        { title: "Lightweight", desc: "Easy to carry" },
        { title: "Durable Foam", desc: "Long lasting build" }
      ];
    }
    if (cat.includes("phone") || name.includes("phone") || name.includes("mobile")) {
      return [
        { title: "Flagship Performance", desc: "Fast multi-core processor" },
        { title: "Ultra-wide Display", desc: "Vibrant high-refresh panel" },
        { title: "Fast Charging", desc: "High-capacity all-day battery" },
        { title: "Pro Camera System", desc: "Capture crystal clear details" }
      ];
    }
    if (cat.includes("electr") || name.includes("headphone") || name.includes("speaker") || name.includes("audio")) {
      return [
        { title: "Hi-Res Audio", desc: "Premium high-fidelity drivers" },
        { title: "Ergonomic Fit", desc: "Comfy memory foam cushions" },
        { title: "Wireless Bluetooth", desc: "Instant low-latency pairing" },
        { title: "Long Battery Life", desc: "Up to 40 hours of playback" }
      ];
    }
    return [
      { title: "Premium Quality", desc: "Top graded materials used" },
      { title: "Durable Design", desc: "Built for longevity & daily" },
      { title: "Eco-Friendly", desc: "Sustainable & organic process" },
      { title: "1-Year Warranty", desc: "Full coverage support" }
    ];
  };
  const highlights = getHighlights();

  const handleBuyNow = () => {
    if (product.sizes && product.sizes.length > 0 && !size) {
      toast.warning("Please select a size first");
      return;
    }
    navigate("/placeorder", {
      state: { product, qty, size: size || "standard", total: product.price * qty },
    });
  };

  const handleCart = async () => {
    if (product.sizes && product.sizes.length > 0 && !size) {
      toast.warning("Please select a size first");
      return;
    }

    const token = localStorage.getItem("token");
    const cartSize = size || "standard";
    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      const key = `${product._id}_${cartSize}`;
      guestCart[key] = (guestCart[key] || 0) + qty;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      toast.success("Added to cart!");
      navigate("/cart");
      return;
    }

    try {
      await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId: product._id, size: cartSize, qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Added to cart!");
      navigate("/cart");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const handleReviewSubmit = async ({ rating, comment, pros = [], cons = [], anonymous = false }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.warning("Please login to write a review");
      navigate("/login");
      return false;
    }

    let formattedComment = comment;
    if (pros && pros.length > 0) {
      formattedComment += ` [PROS]: ${pros.join(", ")}`;
    }
    if (cons && cons.length > 0) {
      formattedComment += ` [CONS]: ${cons.join(", ")}`;
    }
    if (anonymous) {
      formattedComment += ` [ANONYMOUS]: true`;
    }

    try {
      setReviewLoading(true);
      const res = await axios.post(
        `${backendUrl}/api/product/review/${product._id}`,
        { rating, comment: formattedComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setProduct(res.data.product);
        toast.success("Review submitted successfully!");
        return true;
      }

      toast.error(res.data.message || "Review failed");
      return false;
    } catch (error) {
      toast.error(error.response?.data?.message || "Review failed");
      return false;
    } finally {
      setReviewLoading(false);
    }
  };
  const activeMainImgSrc = mainImg.startsWith("http") ? mainImg : `${backendUrl}/${mainImg}`;

  const triggerLightbox = (idx) => {
    setLightboxImgIdx(idx);
    setIsLightboxOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300 overflow-x-hidden pb-32">
      {/* Background radial overlays */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/4 w-[650px] h-[650px] bg-violet-500/5 dark:bg-violet-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 pt-6">
        {/* Premium Breadcrumb bar */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
          <span className="hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer" onClick={() => navigate("/")}>Home</span>
          <span>&gt;</span>
          <span className="hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer" onClick={() => navigate(`/product?category=${product.category}`)}>{product.category}</span>
          <span>&gt;</span>
          <span className="text-slate-600 dark:text-slate-300">{product.name}</span>
        </nav>

        {/* 2-Column Split Showcase layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          
          {/* COLUMN 1: 55% Media Gallery & Interactive Modes */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="flex gap-3.5">
              
              {/* Vertical Thumbnail Deck (Desktop) */}
              <div className="hidden sm:flex flex-col gap-2.5 w-16 shrink-0">
                {product.images?.map((img, i) => {
                  const isActive = mainImg === img && mediaMode === "image";
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setMainImg(img);
                        setMediaMode("image");
                      }}
                      className={`relative aspect-square overflow-hidden rounded-xl border-2 p-1 bg-white dark:bg-slate-900 transition-all cursor-pointer ${
                        isActive
                          ? "border-slate-950 dark:border-indigo-500 ring-2 ring-slate-950/10 dark:ring-indigo-500/20 scale-[0.98]"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600"
                      }`}
                    >
                      <img
                        src={img.startsWith("http") ? img : `${backendUrl}/${img}`}
                        className="h-full w-full object-contain"
                        alt="thumbnail"
                      />
                    </button>
                  );
                })}
                
                {/* Mock Video Thumbnail */}
                <button
                  onClick={() => setMediaMode("video")}
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 p-1.5 bg-white dark:bg-slate-900 transition-all flex flex-col items-center justify-center cursor-pointer ${
                    mediaMode === "video"
                      ? "border-slate-950 dark:border-indigo-500"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-400"
                  }`}
                >
                  <Video size={16} className="text-slate-500 dark:text-indigo-400" />
                  <span className="text-[8px] font-black uppercase mt-1">Video</span>
                </button>

                {/* Mock 360 Thumbnail */}
                <button
                  onClick={() => setMediaMode("360")}
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 p-1.5 bg-white dark:bg-slate-900 transition-all flex flex-col items-center justify-center cursor-pointer ${
                    mediaMode === "360"
                      ? "border-slate-950 dark:border-indigo-500"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-400"
                  }`}
                >
                  <Rotate3d size={16} className="text-slate-500 dark:text-indigo-400" />
                  <span className="text-[8px] font-black uppercase mt-1">360° View</span>
                </button>
              </div>

              {/* Main Media Showcase Window */}
              <div className={`flex-1 relative rounded-[32px] overflow-hidden ${isRedBg ? "bg-[#e81f30] dark:bg-[#c81222]" : "bg-white dark:bg-slate-900/30"} border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-center transition-colors duration-350`}>
                
                {/* Float overlays */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 shadow-sm">
                    <Sparkles size={10} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    <span>Premium Model</span>
                  </span>
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 shadow-sm animate-pulse">
                      Low Stock
                    </span>
                  )}
                </div>

                {/* Action buttons on image */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                  <button 
                    onClick={toggleFavorite}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:scale-105 active:scale-95 transition cursor-pointer"
                  >
                    <Heart size={16} className={isFavorite ? "fill-rose-500 stroke-rose-500 scale-105" : ""} />
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.info("Product link copied to clipboard!");
                    }}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 active:scale-95 transition cursor-pointer"
                  >
                    <Share2 size={16} />
                  </button>
                </div>

                {/* Image Zoom Mode */}
                {mediaMode === "image" && (
                  <div 
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onClick={() => triggerLightbox(product.images.indexOf(mainImg))}
                    className="relative flex h-[320px] sm:h-[420px] w-full items-center justify-center overflow-hidden bg-transparent cursor-zoom-in"
                  >
                    <img
                      src={activeMainImgSrc}
                      alt={product.name}
                      className={`max-h-[310px] max-w-[85%] object-contain p-4 pointer-events-none transition-transform duration-150 ease-out ${isRedBg ? "mix-blend-multiply" : ""}`}
                      style={{
                        transform: isZoomed ? "scale(1.85)" : "scale(1)",
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                      }}
                    />
                    <button 
                      onClick={() => triggerLightbox(product.images.indexOf(mainImg))}
                      className="absolute bottom-4 right-4 z-20 h-10 w-10 flex items-center justify-center rounded-xl bg-slate-950/80 backdrop-blur-md text-white hover:scale-105 active:scale-95 transition cursor-pointer shadow-md"
                    >
                      <Maximize2 size={15} />
                    </button>
                  </div>
                )}

                {/* Video Mode Container */}
                {mediaMode === "video" && (
                  <div className="relative flex h-[320px] sm:h-[420px] w-full items-center justify-center bg-slate-950 dark:bg-slate-900">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/25">
                        <Video size={28} className="text-white animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider">Product Showcase Walkthrough</h4>
                        <p className="text-[10px] text-slate-350 max-w-xs mt-1">Check out our visual model walkthrough showing fits, material quality, and real-time usage.</p>
                      </div>
                      <button 
                        onClick={() => setMediaMode("image")}
                        className="px-4 py-2 bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition active:scale-95"
                      >
                        Back to Images
                      </button>
                    </div>
                  </div>
                )}

                {/* 360° Interactive Canvas Mode */}
                {mediaMode === "360" && (
                  <div className="relative flex h-[320px] sm:h-[420px] w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800 dark:text-slate-100 p-6 text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-slate-200/50 dark:bg-slate-800/80 flex items-center justify-center border border-slate-300 dark:border-slate-700">
                        <Rotate3d size={28} className="text-slate-600 dark:text-indigo-400 animate-[spin_5s_linear_infinite]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider">360° Interactive Viewport</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-xs mt-1">Rotate this product in 3D to see details from every angle. Use your mouse to drag and rotate.</p>
                      </div>
                      <button 
                        onClick={() => setMediaMode("image")}
                        className="px-4 py-2 bg-slate-950 dark:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition active:scale-95"
                      >
                        Exit 3D View
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Horizontal Swipeable thumbnails (Mobile view) */}
            <div className="sm:hidden flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              {product.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMainImg(img);
                    setMediaMode("image");
                  }}
                  className={`relative aspect-square w-16 overflow-hidden rounded-xl border p-1 bg-white shrink-0 ${
                    mainImg === img && mediaMode === "image" ? "border-slate-950" : "border-slate-200"
                  }`}
                >
                  <img
                    src={img.startsWith("http") ? img : `${backendUrl}/${img}`}
                    className="h-full w-full object-contain"
                    alt="thumbnail"
                  />
                </button>
              ))}
              <button
                onClick={() => setMediaMode("video")}
                className={`w-16 h-16 rounded-xl border bg-white shrink-0 flex flex-col items-center justify-center ${
                  mediaMode === "video" ? "border-slate-950" : "border-slate-200"
                }`}
              >
                <Video size={14} className="text-slate-500" />
                <span className="text-[8px] font-black mt-1">VIDEO</span>
              </button>
              <button
                onClick={() => setMediaMode("360")}
                className={`w-16 h-16 rounded-xl border bg-white shrink-0 flex flex-col items-center justify-center ${
                  mediaMode === "360" ? "border-slate-950" : "border-slate-200"
                }`}
              >
                <Rotate3d size={14} className="text-slate-500" />
                <span className="text-[8px] font-black mt-1">360°</span>
              </button>
            </div>

            {/* Highlights Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {highlights.map((hl, index) => {
                const Icon = index === 0 ? Award : index === 1 ? Activity : index === 2 ? Feather : Shield;
                return (
                  <div key={index} className="flex items-center gap-2 bg-white/40 dark:bg-slate-900/20 border border-slate-200/80 dark:border-slate-800/85 rounded-2xl p-3 shadow-xs">
                    <Icon size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div className="text-left">
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{hl.title}</h5>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-snug mt-0.5">{hl.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* COLUMN 2: 45% Purchase Info Panel - transparent layout container */}
          <div className="space-y-4 text-left">
            
            {/* Header: Category Badge + SKU */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="px-3.5 py-2 rounded-full bg-slate-900 dark:bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-[9px] font-bold text-slate-400">SKU: {product.sku || `CN-${product._id?.substring(0,8).toUpperCase()}`}</span>
            </div>

            {/* Title Block */}
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span>{product.brand || "CartNOW Premium"}</span>
                <span>•</span>
                <span>{product.subCategory || "Catalog"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {product.name}
              </h1>

              {/* Review metrics */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <div className="flex items-center gap-1 bg-amber-500 text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                  <Star size={11} className="fill-white stroke-none" />
                  <span>{averageRating ? averageRating.toFixed(1) : "0.0"}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:underline cursor-pointer">{reviewCount} Reviews</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-black text-slate-700 dark:text-slate-300">120+ Ordered</span>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-slate-50/30 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 rounded-[20px] p-4 text-left space-y-3 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Total Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">₹{product.price}</span>
                    <span className="text-xs font-bold text-slate-400 line-through">₹{originalPrice.toLocaleString("en-IN")}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[9px] font-black">{discountPercent}% OFF</span>
                  </div>
                </div>
                
                {/* Stock status indicator */}
                <div>
                  {product.stock === 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 px-2.5 py-1 text-[9px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                      Sold Out
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 px-2.5 py-1 text-[9px] font-extrabold uppercase">
                      In Stock ({product.stock} left)
                    </span>
                  )}
                </div>
              </div>

              {/* Installment EMI info */}
              <div className="border-t border-slate-200/60 dark:border-slate-800 pt-2 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <span>EMI options starting at ₹{emiAmount.toLocaleString("en-IN")}/mo</span>
                  <Info size={11} className="text-slate-400 cursor-pointer" />
                </div>
                <span className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">View Plans</span>
              </div>
            </div>

            {/* Variant selections */}
            <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4 text-left">
              
              {/* Color swatches matching mockup circles */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest block">COLOR: {selectedColor.toUpperCase()}</span>
                <div className="flex gap-3">
                  {(isRedBg ? [
                    { name: "Midnight", class: "bg-[#121824]" },
                    { name: "Steel Blue", class: "bg-[#475569]" },
                    { name: "Cloud White", class: "bg-[#f1f5f9] border border-slate-200" },
                    { name: "Lavender", class: "bg-[#c7d2fe]" }
                  ] : [
                    { name: "Midnight", class: "bg-[#121824]" },
                    { name: "Space Gray", class: "bg-[#64748b]" },
                    { name: "Silver", class: "bg-[#cbd5e1] border border-slate-200" },
                    { name: "Sierra Blue", class: "bg-[#93c5fd]" }
                  ]).map((color) => {
                    const isActive = selectedColor === color.name;
                    return (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isActive 
                            ? "ring-2 ring-slate-950 dark:ring-white ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-xs" 
                            : "border border-slate-200 dark:border-slate-800 hover:scale-105"
                        }`}
                      >
                        <span className={`h-5 w-5 rounded-full ${color.class}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sizes capsule selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest block">Select Size</span>
                      <button
                        type="button"
                        onClick={() => setShowSizeGuide(true)}
                        className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        (Size Guide)
                      </button>
                    </div>
                    {!size && (
                      <span className="text-[9px] font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-900/30 animate-pulse">
                        REQUIRED
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {product.sizes?.map((s, i) => {
                      const isSelected = size === s;
                      return (
                        <button
                          key={i}
                          onClick={() => setSize(s)}
                          className={`h-10 px-4 rounded-xl border-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "border-slate-950 dark:border-indigo-500 bg-slate-950 dark:bg-indigo-600 text-white shadow scale-102"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest block">Quantity</span>
                <div className={`flex items-center justify-between rounded-lg border h-9 w-28 overflow-hidden ${
                  product.stock === 0 ? "border-slate-150 bg-slate-50 dark:bg-slate-900 text-slate-400" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                }`}>
                  <button
                    type="button"
                    disabled={product.stock === 0 || qty <= 1}
                    onClick={() => setQty(qty - 1)}
                    className="px-3 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="text-xs font-black text-slate-950 dark:text-white">
                    {product.stock === 0 ? 0 : qty}
                  </span>
                  <button
                    type="button"
                    disabled={product.stock === 0}
                    onClick={() => {
                      if (qty < product.stock) {
                        setQty(qty + 1);
                      } else {
                        toast.warning(`Only ${product.stock} items left in stock.`);
                      }
                    }}
                    className="px-3 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons & Assurances card matching mockup exactly */}
            <div className="grid gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCart}
                  disabled={product.stock === 0}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-xs font-black uppercase tracking-wider transition-all active:scale-98 cursor-pointer ${
                    product.stock === 0
                      ? "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed"
                      : "border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <ShoppingCart size={13} />
                  <span>{t("add_to_cart")}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider text-white transition-all active:scale-98 cursor-pointer ${
                    product.stock === 0
                      ? "bg-slate-200 dark:bg-slate-900 text-slate-400 cursor-not-allowed"
                      : "bg-slate-950 dark:bg-slate-900 hover:bg-slate-900 dark:hover:bg-slate-800 hover:shadow-md"
                  }`}
                >
                  <ShoppingBag size={13} />
                  <span>{t("buy_now")}</span>
                </button>
              </div>


              {/* Compare product, AI chatbot, and tryon triggers */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => {
                    if (isComparing) {
                      removeFromCompare(product._id);
                    } else {
                      addToCompare(product);
                    }
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 py-2 text-[11px] font-bold transition active:scale-98 cursor-pointer ${
                    isComparing
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350 hover:bg-slate-50"
                  }`}
                >
                  <BarChart2 size={12} />
                  <span className="truncate">{isComparing ? "In Compare" : "Compare Item"}</span>
                </button>

                <button
                  onClick={() => setShowAssistant(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/10 py-2 text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition active:scale-98 cursor-pointer"
                >
                  <MessageSquare size={12} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Ask AI Assistant</span>
                </button>
              </div>

              {/* Generative Tryon feature (Fashion items only) */}
              {isFashionItem(product) && (
                <button
                  onClick={() => navigate("/tryon", { state: { productId: product._id } })}
                  className="relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-[size:200%_auto] hover:bg-[position:right_center] py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-sm hover:shadow-md active:scale-98 transition-all duration-500 group overflow-hidden cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  <span>AI Interactive Try-On</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION: Horizontal Navigation Tabs */}
        <div className="mt-10">
          
          {/* Product Details Tabs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[32px] p-6 sm:p-8 text-left shadow-xs w-full">
            <div className="border-b border-slate-100 dark:border-slate-800 flex items-center gap-8 overflow-x-auto scrollbar-hide">
              {[
                { id: "description", label: "Description" },
                { id: "specifications", label: "Specifications" },
                { id: "reviews", label: `Reviews (${reviewCount})` },
                { id: "shipping", label: "Shipping & Returns" }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative pb-4 text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? "text-orange-600 dark:text-orange-500" 
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 dark:bg-orange-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 min-h-[150px]">
              {activeTab === "description" && (
                <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl animate-fade-in">
                  <p>
                    {isDescriptionExpanded 
                      ? product.description 
                      : `${product.description?.substring(0, 180)}...`}
                  </p>
                  {product.description?.length > 180 && (
                    <button 
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="text-xs font-black text-orange-600 dark:text-orange-500 hover:underline flex items-center gap-1 mt-2 cursor-pointer uppercase tracking-wider"
                    >
                      {isDescriptionExpanded ? "Read less" : "Read more"} 
                      {isDescriptionExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  )}
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-4">
                    Discover premium utility and luxury. Each CartNOW item undergoes stringent quality assurance diagnostics before shipment.
                  </p>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl text-xs sm:text-sm text-slate-600 dark:text-slate-400 animate-fade-in">
                  {product.specifications && product.specifications.length > 0 ? (
                    product.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{spec.key}:</span>
                        <span>{spec.value}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Category:</span>
                        <span className="capitalize">{product.category}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Sub-Category:</span>
                        <span className="capitalize">{product.subCategory || "Fitness"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Brand:</span>
                        <span>{product.brand || "CartNOW Active"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Stock Status:</span>
                        <span>{product.stock > 0 ? "In Stock" : "Out of Stock"}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6 animate-fade-in mt-2 text-left max-w-4xl">
                  {/* Reviews Header: Title, Sort, and Write Review Button */}
                  <div className="flex justify-between items-center gap-4 flex-wrap border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                        Customer Feedback
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Showing {reviewCount} product reviews
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Sorting select */}
                      <select
                        value={reviewsSortBy}
                        onChange={(e) => setReviewsSortBy(e.target.value)}
                        className="h-9 px-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                      >
                        <option>Most Recent</option>
                        <option>Most Helpful</option>
                        <option>Highest Rated</option>
                        <option>Lowest Rated</option>
                      </select>

                      <button
                        onClick={() => setShowWriteReview(true)}
                        className="py-2.5 px-4 bg-slate-950 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <MessageSquare size={13} />
                        <span>Write a Review</span>
                      </button>
                    </div>
                  </div>

                  {/* Feed Filters */}
                  <div className="flex flex-wrap gap-1.5">
                    {["All Reviews", "5 Star", "4 Star", "Verified Purchase"].map(chip => {
                      const isActive = reviewsFilter === chip;
                      return (
                        <button
                          key={chip}
                          onClick={() => setReviewsFilter(chip)}
                          className={`px-3 py-1 rounded-full text-[10.5px] font-bold transition-all duration-200 cursor-pointer ${
                            isActive
                              ? "bg-slate-950 dark:bg-indigo-600 text-white shadow-xs"
                              : "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800 hover:border-slate-350"
                          }`}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>

                  {/* Customers Reviews List */}
                  <CostomersReviews 
                    reviews={product.reviews || []} 
                    filter={reviewsFilter}
                    sortBy={reviewsSortBy}
                  />
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl animate-fade-in">
                  <p>At CartNOW, our logistic network operates standard express delivery across domestic zipcodes. Packages leave our regional hub within 24 hours of placement.</p>
                  <p className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">Expected Timelines:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Metros: 2-3 business days.</li>
                    <li>Regional hubs: 4-5 business days.</li>
                    <li>International: 7-10 business days.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION: Similar Products Recommendation Deck */}
        {relatedProducts.length > 0 && (() => {
          const itemsPerPage = 4;
          const totalPages = Math.ceil(relatedProducts.length / itemsPerPage);
          const visibleRelated = relatedProducts.slice(relatedPage * itemsPerPage, (relatedPage + 1) * itemsPerPage);

          return (
            <section className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-10">
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end text-left">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">Related items</span>
                  <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Customers Also Viewed
                  </h2>
                </div>
                
                <div className="flex items-center gap-4">
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-xs">
                      <button
                        type="button"
                        onClick={() => setRelatedPage(prev => Math.max(0, prev - 1))}
                        disabled={relatedPage === 0}
                        className="p-1 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer select-none text-slate-600 dark:text-slate-400"
                        aria-label="Previous related products"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[50px] text-center select-none">
                        {relatedPage + 1} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRelatedPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={relatedPage === totalPages - 1}
                        className="p-1 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer select-none text-slate-600 dark:text-slate-400"
                        aria-label="Next related products"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => navigate(`/product?category=${product.category}`)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-xs font-black text-slate-800 dark:text-slate-200 transition hover:border-slate-800 hover:bg-slate-50 cursor-pointer"
                  >
                    View Collection
                  </button>
                </div>
              </div>

              <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {visibleRelated.map((item) => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
            </section>
          );
        })()}

        {/* SECTION: Footer Features Bar */}
        <div className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-10 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: ShieldCheck,
                title: "100% Original Products",
                desc: "Original products with warranty",
                color: "indigo"
              },
              {
                icon: RotateCcw,
                title: "Easy Returns",
                desc: "7 days return policy",
                color: "emerald"
              },
              {
                icon: ShieldCheck,
                title: "Secure Payments",
                desc: "100% secure payments",
                color: "sky"
              },
              {
                icon: HelpCircle,
                title: "24/7 Support",
                desc: "Dedicated support",
                color: "amber"
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              const colorClasses = {
                indigo: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-100/40 dark:border-indigo-900/30",
                emerald: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-100/40 dark:border-emerald-900/30",
                sky: "bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-100/40 dark:border-sky-900/30",
                amber: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-100/40 dark:border-amber-900/30"
              }[feature.color];

              return (
                <div 
                  key={i} 
                  className="flex items-center gap-4 bg-white/60 dark:bg-slate-900/25 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4.5 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700 text-left"
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center border shrink-0 ${colorClasses}`}>
                    <Icon size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 block uppercase tracking-wider">
                      {feature.title}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-tight font-medium">
                      {feature.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-[fade-in_0.2s_ease-out]">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 z-[210] h-11 w-11 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 flex items-center justify-center transition cursor-pointer"
          >
            <X size={20} />
          </button>

          {product.images?.length > 1 && (
            <button 
              onClick={() => {
                const total = product.images.length;
                const nextIdx = (lightboxImgIdx - 1 + total) % total;
                setLightboxImgIdx(nextIdx);
                setMainImg(product.images[nextIdx]);
              }}
              className="absolute left-6 z-[210] h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div className="relative max-h-[85vh] max-w-[85vw] flex items-center justify-center select-none">
            <img 
              src={product.images[lightboxImgIdx]?.startsWith("http") ? product.images[lightboxImgIdx] : `${backendUrl}/${product.images[lightboxImgIdx]}`} 
              alt="lightbox"
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
            {product.images?.length > 1 && (
              <span className="absolute bottom-[-40px] text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                {lightboxImgIdx + 1} / {product.images.length}
              </span>
            )}
          </div>

          {product.images?.length > 1 && (
            <button 
              onClick={() => {
                const total = product.images.length;
                const nextIdx = (lightboxImgIdx + 1) % total;
                setLightboxImgIdx(nextIdx);
                setMainImg(product.images[nextIdx]);
              }}
              className="absolute right-6 z-[210] h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      )}



      {/* Floating AI Stylist trigger badge */}
      {!showAssistant && (
        <button
          onClick={() => setShowAssistant(true)}
          className="fixed bottom-6 right-6 z-[90] flex items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white shadow-xl hover:shadow-indigo-500/35 transition-all duration-300 group cursor-pointer"
        >
          <div className="relative">
            <MessageSquare size={20} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out font-black text-[10px] uppercase tracking-wider block">
            AI Stylist
          </span>
        </button>
      )}

      {/* STICKY BOTTOM VIEWPORT CTA BAR */}
      {showStickyBar && (
        <div className="fixed bottom-0 inset-x-0 z-[80] bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 px-6 py-4 shadow-xl backdrop-blur-md animate-[slide-up_0.35s_ease-out] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left">
            <img 
              src={activeMainImgSrc} 
              alt="sticky-thumbnail" 
              className="h-10 w-10 object-contain rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
            />
            <div className="hidden sm:block">
              <h5 className="text-xs font-black text-slate-900 dark:text-white truncate max-w-sm">{product.name}</h5>
              <p className="text-[10px] font-black text-slate-400 dark:text-indigo-400 mt-0.5">₹{product.price}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {product.sizes && product.sizes.length > 0 && (
              <select 
                value={size} 
                onChange={(e) => setSize(e.target.value)}
                className="h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-black outline-none focus:border-slate-950 dark:focus:border-indigo-500 text-slate-700 dark:text-slate-200"
              >
                <option value="">Size</option>
                {product.sizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}

            <button
              onClick={handleCart}
              className="px-6 py-3 bg-slate-950 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer shadow-md"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="hidden md:block px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer shadow-md"
            >
              Buy Now
            </button>
          </div>
        </div>
      )}

      {/* SIZE REFERENCE MODAL */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-2">Size Reference Guide</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Find your perfect fit with standard measurements for {product.category || "this catalog"}.</p>
            
            {product.category?.toLowerCase() === "kids" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                      <th className="py-2.5">Size/Age</th>
                      <th className="py-2.5">Height (in)</th>
                      <th className="py-2.5">Chest (in)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                    <tr><td className="py-3">2Y</td><td className="py-3">33" - 35"</td><td className="py-3">20" - 21"</td></tr>
                    <tr><td className="py-3">4Y</td><td className="py-3">39" - 41"</td><td className="py-3">22" - 23"</td></tr>
                    <tr><td className="py-3">6Y</td><td className="py-3">45" - 47"</td><td className="py-3">24" - 25"</td></tr>
                    <tr><td className="py-3">8Y</td><td className="py-3">50" - 52"</td><td className="py-3">26" - 27"</td></tr>
                    <tr><td className="py-3">10Y</td><td className="py-3">55" - 57"</td><td className="py-3">28" - 30"</td></tr>
                    <tr><td className="py-3">12Y</td><td className="py-3">60" - 62"</td><td className="py-3">31" - 33"</td></tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                      <th className="py-2.5">Size</th>
                      <th className="py-2.5">Chest (in)</th>
                      <th className="py-2.5">Waist (in)</th>
                      <th className="py-2.5">Hip (in)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                    <tr><td className="py-3 font-bold">XS</td><td className="py-3">32" - 34"</td><td className="py-3">26" - 28"</td><td className="py-3">32" - 34"</td></tr>
                    <tr><td className="py-3 font-bold">S</td><td className="py-3">35" - 37"</td><td className="py-3">29" - 31"</td><td className="py-3">35" - 37"</td></tr>
                    <tr><td className="py-3 font-bold">M</td><td className="py-3">38" - 40"</td><td className="py-3">32" - 34"</td><td className="py-3">38" - 40"</td></tr>
                    <tr><td className="py-3 font-bold">L</td><td className="py-3">41" - 43"</td><td className="py-3">35" - 37"</td><td className="py-3">41" - 43"</td></tr>
                    <tr><td className="py-3 font-bold">XL</td><td className="py-3">44" - 46"</td><td className="py-3">38" - 40"</td><td className="py-3">44" - 46"</td></tr>
                    <tr><td className="py-3 font-bold">XXL</td><td className="py-3">47" - 49"</td><td className="py-3">41" - 43"</td><td className="py-3">47" - 49"</td></tr>
                  </tbody>
                </table>
              </div>
            )}
            
            <button
              onClick={() => setShowSizeGuide(false)}
              className="mt-6 w-full py-3 bg-slate-950 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition active:scale-[0.98] cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

      {/* AI ASSISTANT SLIDE-OUT DRAWER PANEL */}
      <div 
        onClick={() => setShowAssistant(false)}
        className={`fixed inset-0 z-[99] bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ${
          showAssistant ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <div className={`fixed inset-y-0 right-0 z-[100] w-full sm:max-w-md bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
        showAssistant ? "translate-x-0" : "translate-x-full"
      }`}>
        
        <div className="flex items-center justify-between bg-gradient-to-r from-indigo-900 to-indigo-700 dark:from-slate-900 dark:to-indigo-950 px-6 py-5 text-white shadow-md border-b dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white shadow-inner">
              <Sparkles size={20} className="text-amber-300" />
            </div>
            <div className="text-left">
              <h3 className="font-black text-sm uppercase tracking-wider">CartNOW Stylist</h3>
              <p className="text-[10px] text-slate-350 mt-0.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Assistant Online
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAssistant(false)}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition active:scale-95 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
          {chatMessages.map((msg, i) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={i}
                className={`flex ${isUser ? "justify-end text-right" : "justify-start text-left"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-sm whitespace-pre-line leading-relaxed ${
                    isUser
                      ? "bg-slate-900 dark:bg-indigo-600 text-white rounded-tr-none shadow shadow-indigo-950/20"
                      : "bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-105 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {chatMessages.length === 1 && (
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-left">Suggested Questions</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Product Specifications?",
                "What is the price?",
                "Return & Shipping?",
                "Ratings & Reviews"
              ].map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(sug)}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/60 dark:border-indigo-900/50 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-950/80 transition cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="border-t border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 flex gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={`Ask about this product...`}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm outline-none focus:border-indigo-600 dark:focus:border-indigo-500 dark:text-white transition"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || chatLoading}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-4 text-xs font-black uppercase text-white tracking-wider transition disabled:opacity-50 active:scale-95 shrink-0 flex items-center justify-center cursor-pointer"
          >
            <Send size={14} className="mr-1" />
            <span>Send</span>
          </button>
        </form>

      </div>

      {/* WRITE REVIEW OVERLAY MODAL */}
      <WriteReviewModal
        isOpen={showWriteReview}
        onClose={() => setShowWriteReview(false)}
        onSubmit={handleReviewSubmit}
        loading={reviewLoading}
      />
    </div>
  );
};

export default ProductDetail;
