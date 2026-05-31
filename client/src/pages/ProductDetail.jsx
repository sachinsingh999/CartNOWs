import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import Rating from "../componenets/Rating";
import CostomersReviews from "../componenets/CostomersReviews";
import GiveReview from "../componenets/GiveReview";
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
  Users
} from "lucide-react";
import { useComparison } from "../context/ComparisonContext";
import { useCoShop } from "../context/CoShopContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { activeRoomId, suggestProduct } = useCoShop();

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

  // High-fidelity lightbox and interactive states
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImgIdx, setLightboxImgIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

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

    setTimeout(() => {
      let reply = "";
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes("price") || lowerQuery.includes("cost") || lowerQuery.includes("rupee")) {
        reply = `The price for **${product.name}** is **₹${product.price}**. It is inclusive of all taxes. Let me know if you want me to help you add it to the cart!`;
      } else if (lowerQuery.includes("spec") || lowerQuery.includes("material") || lowerQuery.includes("size") || lowerQuery.includes("fit") || lowerQuery.includes("care") || lowerQuery.includes("origin")) {
        const sizeList = product.sizes?.join(", ") || "standard sizes";
        reply = `Here are the specifications for **${product.name}**:\n\n` +
                `- **Category**: ${product.category}\n` +
                `- **Sub-Category**: ${product.subCategory || "Fashion"}\n` +
                `- **Sizes**: ${sizeList}\n` +
                `- **Material**: Premium quality materials\n` +
                `- **Care Instructions**: Machine wash cold or as recommended on the label.\n\nLet me know if you need more details!`;
      } else if (lowerQuery.includes("shipping") || lowerQuery.includes("delivery") || lowerQuery.includes("days") || lowerQuery.includes("return")) {
        reply = `At CartNOW, we offer:\n\n` +
                `- **Free Shipping**: Available for all domestic orders.\n` +
                `- **Delivery Time**: Usually delivered within 3-5 business days.\n` +
                `- **Easy Returns**: We have a 7-day hassle-free returns policy. No questions asked.`;
      } else if (lowerQuery.includes("review") || lowerQuery.includes("rating") || lowerQuery.includes("stars") || lowerQuery.includes("good")) {
        const rating = getAverageRating(product);
        const count = getReviewCount(product);
        reply = `**${product.name}** has an average rating of **${rating ? rating.toFixed(1) : "0.0"} / 5.0** stars based on **${count}** customer reviews.\n\nOverall, customers appreciate its performance, build quality, and value.`;
      } else if (lowerQuery.includes("features") || lowerQuery.includes("about") || lowerQuery.includes("what is") || lowerQuery.includes("describe")) {
        reply = `**${product.name}** is a premium item in our **${product.category}** category.\n\n**Description**:\n${product.description}\n\nKey Highlights:\n- Highly rated by shoppers.\n- Comes with secure packing and free shipping.\n- Easy returns and checkout.`;
      } else {
        reply = `I can tell you that **${product.name}** is priced at **₹${product.price}** and belongs to the **${product.category}** category. It features:\n\n` +
                `- ${product.description.substring(0, 100)}...\n\n` +
                `Feel free to ask about its specifications, shipping policies, price, or customer ratings!`;
      }

      setChatMessages((prev) => [...prev, { sender: "assistant", text: reply }]);
      setChatLoading(false);
    }, 1000);
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

          const listRes = await axios.get(`${backendUrl}/api/product/list`);
          if (listRes.data.success) {
            const related = listRes.data.products
               .filter(
                (item) =>
                  item._id !== data.product._id &&
                  item.category?.toLowerCase() === data.product.category?.toLowerCase()
              )
              .slice(0, 3);
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
          <div className="h-10 w-10 border-4 border-indigo-650 dark:border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading product experience...</span>
        </div>
      </div>
    );
  }

  if (product === false) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm max-w-sm">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-450 flex items-center justify-center mx-auto mb-4">
            <X size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Product Not Found</h3>
          <p className="text-xs text-slate-550 dark:text-slate-450 mt-1.5">The item you are looking for might have been removed or is temporarily unavailable.</p>
          <button 
            onClick={() => navigate("/product")}
            className="mt-5 w-full py-2.5 bg-slate-950 dark:bg-indigo-650 text-white rounded-xl text-xs font-bold hover:bg-slate-850 dark:hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
          >
            Browse Catalog
          </button>
        </div>
      </div>
    );
  }

  const averageRating = getAverageRating(product);
  const reviewCount = getReviewCount(product);

  const handleBuyNow = () => {
    if (!size) {
      toast.warning("Please select a size first");
      return;
    }
    navigate("/placeorder", {
      state: { product, qty, size, total: product.price * qty },
    });
  };

  const handleCart = async () => {
    if (!size) {
      toast.warning("Please select a size first");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      const key = `${product._id}_${size}`;
      guestCart[key] = (guestCart[key] || 0) + qty;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      toast.success("Added to cart!");
      navigate("/cart");
      return;
    }

    try {
      await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId: product._id, size, qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Added to cart!");
      navigate("/cart");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.warning("Please login to write a review");
      navigate("/login");
      return false;
    }

    try {
      setReviewLoading(true);
      const res = await axios.post(
        `${backendUrl}/api/product/review/${product._id}`,
        { rating, comment },
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
    <div className="relative min-h-screen bg-gradient-to-tr from-slate-50 via-indigo-50/10 to-rose-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 pb-20 font-sans text-slate-700 dark:text-slate-300 transition-colors duration-300 overflow-x-hidden">
      {/* Decorative Blur Lighting */}
      <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-indigo-200/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-orange-100/25 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs / Controls Row */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-xs font-black text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            <span>BACK TO CATALOG</span>
          </button>
        </div>

        {/* Core Product Layout: asymmetric split grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] items-start">
          
          {/* LEFT COLUMN: Media Showcase & Thumbnail Deck */}
          <div className="space-y-6 lg:sticky lg:top-24">
            
            {/* Interactive Showcase Frame */}
            <div className="relative rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-md dark:shadow-slate-950/50 overflow-hidden group select-none">
              
              {/* Overlay Interactive Badge */}
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-650 dark:text-slate-350 shadow-sm transition-transform duration-300 group-hover:scale-95">
                  <Sparkles size={11} className="text-orange-500 animate-pulse" />
                  <span>Interactive Zoom</span>
                </span>
                
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 shadow-sm animate-pulse">
                    LOW STOCK
                  </span>
                )}
              </div>

              {/* Heart Wishlist Trigger */}
              <button 
                onClick={toggleFavorite}
                className="absolute top-4 right-4 z-20 h-10 w-10 flex items-center justify-center rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-850 shadow-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                <Heart size={18} className={isFavorite ? "fill-rose-500 stroke-rose-500 scale-110" : "transition-transform"} />
              </button>

              {/* Maximize Lightbox Trigger */}
              <button 
                onClick={() => triggerLightbox(product.images.indexOf(mainImg))}
                className="absolute bottom-4 right-4 z-20 h-10 w-10 flex items-center justify-center rounded-2xl bg-slate-900/80 dark:bg-slate-950/80 border border-white/10 dark:border-slate-850 text-white hover:bg-slate-900 hover:scale-105 active:scale-95 transition cursor-pointer shadow-md"
              >
                <Maximize2 size={16} />
              </button>

              {/* Hover Zoom Frame */}
              <div 
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onClick={() => triggerLightbox(product.images.indexOf(mainImg))}
                className="relative flex h-[480px] sm:h-[540px] w-full items-center justify-center overflow-hidden bg-white dark:bg-slate-900 transition-colors cursor-zoom-in"
              >
                <img
                  src={activeMainImgSrc}
                  alt={product.name}
                  className="max-h-[460px] max-w-[90%] object-contain p-6 pointer-events-none transition-transform duration-150 ease-out"
                  style={{
                    transform: isZoomed ? "scale(1.85)" : "scale(1)",
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                  }}
                />
              </div>
            </div>

            {/* Thumbnail Carousel Deck */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, i) => {
                  const imgThumbSrc = img.startsWith("http") ? img : `${backendUrl}/${img}`;
                  const isActive = mainImg === img;
                  return (
                    <button
                      key={i}
                      onClick={() => setMainImg(img)}
                      className={`relative overflow-hidden rounded-2xl border-2 p-2 bg-white dark:bg-slate-900/30 transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "border-indigo-600 dark:border-indigo-500 ring-4 ring-indigo-650/10 dark:ring-indigo-500/20 scale-95 shadow shadow-indigo-100 dark:shadow-slate-950"
                          : "border-slate-200/80 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-650 hover:shadow"
                      }`}
                    >
                      <img
                        src={imgThumbSrc}
                        className="h-16 w-full object-contain transition duration-200 hover:scale-105"
                        alt={`${product.name} thumbnail ${i + 1}`}
                      />
                      {isActive && (
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Buying Desk panel */}
          <div className="space-y-8 bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-md dark:shadow-slate-950/50 backdrop-blur-md text-slate-700 dark:text-slate-350 transition-colors duration-300">
            
            {/* Header branding / collection path */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-900/50 text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400">
                {product.category}
              </span>
              
              <div className="flex items-center gap-1.5 text-xs text-slate-450 dark:text-slate-500 font-bold">
                <span>{product.subCategory || "Essentials"}</span>
              </div>
            </div>

            {/* Title & Reviews Scroll Trigger */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <button
                  onClick={() => {
                    const element = document.getElementById("reviews-panel");
                    if (element) element.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 px-3 py-1.5 font-black text-amber-700 dark:text-amber-400 shadow-sm transition hover:bg-amber-100/60 dark:hover:bg-amber-950/40 hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <Star size={12} className="fill-amber-500 stroke-amber-500 transition-transform group-hover:rotate-12" />
                  <span>{averageRating ? averageRating.toFixed(1) : "0.0"}</span>
                </button>

                <span className="text-slate-400 dark:text-slate-655 font-bold">•</span>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">{reviewCount} customer reviews</span>
                <span className="text-slate-400 dark:text-slate-655 font-bold">•</span>
                <button
                  onClick={() => {
                    const element = document.getElementById("reviews-panel");
                    if (element) element.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-indigo-650 dark:text-indigo-400 font-bold hover:text-indigo-800 dark:hover:text-indigo-300 transition hover:underline"
                >
                  See reviews
                </button>
              </div>
            </div>

            {/* Pricing / Tax and Stock status box */}
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black tracking-widest text-slate-450 dark:text-slate-500 uppercase">Retail Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-slate-100">₹{product.price}</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">Incl. Taxes</span>
                </div>
              </div>

              <div>
                {product.stock === 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-3.5 py-2 text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    <span>{t("sold_out")}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-3.5 py-2 text-xs font-black text-emerald-700 dark:text-emerald-450 uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-450 animate-[pulse_1.5s_infinite]" />
                    <span>{product.stock} items left</span>
                  </span>
                )}
              </div>
            </div>

            {/* Specifications & Shipping Tabs */}
            <div className="space-y-4">
              {/* Tab headers segment bar */}
              <div className="flex p-1 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800">
                {["description", "details", "shipping"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-xs font-black capitalize rounded-xl transition-all cursor-pointer ${
                      activeTab === tab
                        ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 shadow-sm border border-slate-200/30 dark:border-slate-700/50"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Contents Frame */}
              <div className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 leading-relaxed min-h-24 px-1 py-2">
                {activeTab === "description" && (
                  <p className="animate-[fade-in_0.2s_ease-out] text-left">{product.description}</p>
                )}
                
                {activeTab === "details" && (
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 animate-[fade-in_0.2s_ease-out] text-left">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-950 dark:bg-slate-100" />
                      <span className="font-bold text-slate-850 dark:text-slate-200">Category:</span>
                      <span className="capitalize text-slate-600 dark:text-slate-400">{product.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-950 dark:bg-slate-100" />
                      <span className="font-bold text-slate-855 dark:text-slate-200">Sub-Cat:</span>
                      <span className="capitalize text-slate-600 dark:text-slate-400">{product.subCategory || "Fashion"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-950 dark:bg-slate-100" />
                      <span className="font-bold text-slate-850 dark:text-slate-200">Season:</span>
                      <span className="capitalize text-slate-600 dark:text-slate-400">{product.collection || "General"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-950 dark:bg-slate-100" />
                      <span className="font-bold text-slate-850 dark:text-slate-200">Materials:</span>
                      <span className="text-slate-600 dark:text-slate-400">Premium Blend</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-950 dark:bg-slate-100" />
                      <span className="font-bold text-slate-850 dark:text-slate-200">Care Instructions:</span>
                      <span className="text-slate-600 dark:text-slate-400">Machine Wash Cold / Air Dry</span>
                    </div>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-3 animate-[fade-in_0.2s_ease-out] text-left">
                    <div className="flex items-start gap-3 text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <Truck size={16} className="text-indigo-650 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Free Express Shipping</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-0.5">Delivered to your doorstep within 3-5 working days.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <RotateCcw size={16} className="text-indigo-650 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">7-Day Hassle-Free Returns</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-0.5">No questions asked return process initiated directly from dashboard.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <ShieldCheck size={16} className="text-indigo-650 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Secure SSL Encryption</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-0.5">Payments processed securely with Razorpay checkout gateways.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Option Selectors (Sizes & Quantity) */}
            <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr] gap-6 border-t border-slate-100 dark:border-slate-800 pt-6">
              
              {/* Sizes capsule selector */}
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Select Size</span>
                  {!size && (
                    <span className="text-[9px] font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-900/30 animate-pulse">
                      SIZE REQUIRED
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
                        className={`h-11 px-4 rounded-xl border-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-slate-950 dark:border-indigo-500 bg-slate-950 dark:bg-indigo-650 text-white shadow shadow-slate-950/20 dark:shadow-slate-950 scale-102"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-350 hover:border-slate-405 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Stepper selector */}
              <div className="space-y-3 text-left">
                <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest block">Quantity</span>
                
                <div className={`flex items-center justify-between rounded-xl border-2 h-11 overflow-hidden ${
                  product.stock === 0 ? "border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 text-slate-400" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40"
                }`}>
                  <button
                    type="button"
                    disabled={product.stock === 0 || qty <= 1}
                    onClick={() => setQty(qty - 1)}
                    className="px-4.5 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-100 disabled:text-slate-350 dark:disabled:text-slate-700 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  
                  <span className="text-sm font-black text-slate-950 dark:text-slate-100">
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
                    className="px-4.5 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-100 disabled:text-slate-350 dark:disabled:text-slate-700 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Premium CTA Buttons row */}
            <div className="grid gap-3.5 border-t border-slate-100 dark:border-slate-800 pt-6">
              
              {activeRoomId && (
                <button
                  type="button"
                  onClick={() => suggestProduct(product)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-650 hover:bg-indigo-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-indigo-650/15 hover:shadow-lg active:scale-98 transition-all cursor-pointer"
                >
                  <Users size={14} />
                  <span>Suggest to Group Shopping Room</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-3.5">
                {/* Add to Cart button */}
                <button
                  onClick={handleCart}
                  disabled={product.stock === 0}
                  className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-3.5 text-xs font-black uppercase tracking-wider transition-all active:scale-98 cursor-pointer ${
                    product.stock === 0
                      ? "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/30 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                      : "border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <ShoppingCart size={14} />
                  <span>{t("add_to_cart")}</span>
                </button>

                {/* Buy Now button */}
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all active:scale-98 cursor-pointer ${
                    product.stock === 0
                      ? "bg-slate-200 dark:bg-slate-900/30 text-slate-400 dark:text-slate-650 cursor-not-allowed border border-slate-200/50 dark:border-slate-855"
                      : "bg-slate-950 dark:bg-indigo-650 hover:bg-slate-855 dark:hover:bg-indigo-700 hover:shadow-lg shadow-slate-950/15 dark:shadow-indigo-900/30"
                  }`}
                >
                  <ShoppingBag size={14} />
                  <span>{t("buy_now")}</span>
                </button>
              </div>

              {/* Compare toggle button */}
              <button
                onClick={() => {
                  if (isComparing) {
                    removeFromCompare(product._id);
                  } else {
                    addToCompare(product);
                  }
                }}
                className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-3.5 text-xs font-black uppercase tracking-wider transition-all active:scale-98 cursor-pointer ${
                  isComparing
                    ? "border-indigo-600 bg-indigo-600 text-white shadow shadow-indigo-100 dark:shadow-slate-950"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300"
                }`}
              >
                <BarChart2 size={14} className={isComparing ? "stroke-[2.5px]" : ""} />
                <span>{isComparing ? "Remove From Compare" : "Compare This Product"}</span>
              </button>

              {/* Generative Feature Trigger button */}
              {isFashionItem(product) ? (
                <button
                  onClick={() => navigate("/tryon", { state: { productId: product._id } })}
                  className="relative flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-[size:200%_auto] hover:bg-[position:right_center] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 active:scale-98 transition-all duration-500 group overflow-hidden cursor-pointer"
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                  <Sparkles className="h-4 w-4 animate-[pulse_2s_infinite]" />
                  <span>AI Interactive Try-On</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAssistant(true)}
                  className="relative flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-650 via-blue-600 to-indigo-650 bg-[size:200%_auto] hover:bg-[position:right_center] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-98 transition-all duration-500 group overflow-hidden cursor-pointer"
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                  <MessageSquare className="h-4 w-4" />
                  <span>Product AI Assistant</span>
                </button>
              )}
            </div>

            {/* Quick trust assurances line */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-550 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950/20 transition">
                <Truck size={14} className="text-slate-400 dark:text-indigo-400/80" />
                <span className="font-bold text-slate-850 dark:text-slate-200">Free Express Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950/20 transition">
                <RotateCcw size={14} className="text-slate-400 dark:text-indigo-400/80" />
                <span className="font-bold text-slate-850 dark:text-slate-200">7-Day Simple Returns</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950/20 transition">
                <ShieldCheck size={14} className="text-slate-400 dark:text-indigo-400/80" />
                <span className="font-bold text-slate-855 dark:text-slate-200">Fully Encrypted checkout</span>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM SECTION: Customer Ratings and Feedback panel */}
        <section id="reviews-panel" className="mt-16 rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 sm:p-8 shadow-md dark:shadow-slate-950/50 backdrop-blur-md transition-colors duration-300">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-slate-100 dark:border-slate-800 pb-6 text-left">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-650 dark:text-indigo-400">Reviews & Scores</p>
              <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Verified Shoppers Feedback
              </h2>
            </div>
            <p className="max-w-md text-xs sm:text-sm text-slate-450 dark:text-slate-400 font-medium leading-relaxed">
              Customer reviews and rating details posted by verified buyers of this specific product.
            </p>
          </div>

          <div className="space-y-8">
            <Rating reviews={product.reviews || []} />

            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] border-t border-slate-100 dark:border-slate-800 pt-8 text-left">
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Product Customer Reviews
                  </h3>
                  <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full">
                    {(product.reviews || []).length} Reviews
                  </span>
                </div>
                <CostomersReviews reviews={product.reviews || []} />
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl p-5 border border-slate-150 dark:border-slate-800 h-fit">
                <GiveReview onSubmit={handleReviewSubmit} loading={reviewLoading} />
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM SECTION: Related items carousel */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-slate-205 dark:border-slate-800 pt-16">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end text-left">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-650 dark:text-indigo-400">Recommendations</p>
                <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  Related Products
                </h2>
              </div>
              <button
                onClick={() => navigate(`/product?category=${product.category}`)}
                className="rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-xs font-black text-slate-800 dark:text-slate-200 transition hover:border-slate-850 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 cursor-pointer shadow-sm"
              >
                VIEW FULL COLLECTION
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* FULLSCREEN GALLERY LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 dark:bg-slate-950/95 backdrop-blur-md p-4 animate-[fade-in_0.2s_ease-out]">
          {/* Close trigger */}
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 z-[210] h-11 w-11 rounded-full bg-white/10 dark:bg-slate-900/60 text-white hover:bg-white/20 active:scale-95 flex items-center justify-center transition cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Left Arrow */}
          {product.images?.length > 1 && (
            <button 
              onClick={() => {
                const total = product.images.length;
                const nextIdx = (lightboxImgIdx - 1 + total) % total;
                setLightboxImgIdx(nextIdx);
                setMainImg(product.images[nextIdx]);
              }}
              className="absolute left-6 z-[210] h-12 w-12 rounded-full bg-white/10 dark:bg-slate-900/60 text-white hover:bg-white/20 active:scale-95 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Image Display */}
          <div className="relative max-h-[85vh] max-w-[85vw] flex items-center justify-center select-none">
            <img 
              src={product.images[lightboxImgIdx]?.startsWith("http") ? product.images[lightboxImgIdx] : `${backendUrl}/${product.images[lightboxImgIdx]}`} 
              alt="High resolution showcase"
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
            {product.images?.length > 1 && (
              <span className="absolute bottom-[-40px] text-xs font-bold text-slate-400 dark:text-slate-500 bg-white/5 dark:bg-slate-900/50 border border-white/10 dark:border-slate-800 px-3 py-1 rounded-full">
                {lightboxImgIdx + 1} / {product.images.length}
              </span>
            )}
          </div>

          {/* Right Arrow */}
          {product.images?.length > 1 && (
            <button 
              onClick={() => {
                const total = product.images.length;
                const nextIdx = (lightboxImgIdx + 1) % total;
                setLightboxImgIdx(nextIdx);
                setMainImg(product.images[nextIdx]);
              }}
              className="absolute right-6 z-[210] h-12 w-12 rounded-full bg-white/10 dark:bg-slate-900/60 text-white hover:bg-white/20 active:scale-95 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      )}

      {/* AI ASSISTANT SLIDE-OUT DRAWER PANEL */}
      {/* Background shadow Dim */}
      <div 
        onClick={() => setShowAssistant(false)}
        className={`fixed inset-0 z-[99] bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ${
          showAssistant ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-out Drawer */}
      <div className={`fixed inset-y-0 right-0 z-[100] w-full sm:max-w-md bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-850 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
        showAssistant ? "translate-x-0" : "translate-x-full"
      }`}>
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-indigo-900 to-indigo-750 dark:from-slate-900 dark:to-indigo-955 px-6 py-5 text-white shadow-md border-b dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white shadow-inner">
              <Sparkles size={20} className="animate-[pulse_2s_infinite] text-amber-300" />
            </div>
            <div className="text-left">
              <h3 className="font-black text-sm uppercase tracking-wider">CartNOW Stylist</h3>
              <p className="text-[10px] text-indigo-250 dark:text-slate-400 font-bold mt-0.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-450 animate-pulse inline-block" />
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

        {/* Drawer chat feed */}
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
                      ? "bg-slate-900 dark:bg-indigo-650 text-white rounded-tr-none shadow shadow-indigo-950/20"
                      : "bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-900 border border-slate-155 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion tags strip */}
        {chatMessages.length === 1 && (
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-950">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-2 text-left">Suggested Questions</p>
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
                  className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/60 dark:border-indigo-900/50 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-950/80 transition cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="border-t border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-950 p-4 flex gap-2"
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
            className="rounded-xl bg-indigo-650 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-4 text-xs font-black uppercase text-white tracking-wider transition disabled:opacity-50 active:scale-95 shrink-0 flex items-center justify-center cursor-pointer"
          >
            <Send size={14} className="mr-1" />
            <span>Send</span>
          </button>
        </form>

      </div>
    </div>
  );
};

export default ProductDetail;
