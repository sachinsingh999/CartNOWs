import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import Rating from "../components/Rating";
import CostomersReviews from "../components/CostomersReviews";
import GiveReview from "../components/GiveReview";
import WriteReviewModal from "../components/WriteReviewModal";
import ProductCard from "./ProductCard";
import { getAverageRating, getReviewCount } from "../utils/productRatings";
import { trackView } from "../utils/engagement";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { ProductDetailSkeleton } from "../components/SkeletonLoader";
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
  Info,
  Clock,
  Droplets,
  Sun,
  Wind,
  Shirt
} from "lucide-react";
import { useComparison } from "../context/ComparisonContext";
import BadgeChips from "../components/ProductDetail/BadgeChips";
import FeatureList from "../components/ProductDetail/FeatureList";
import SpecificationTable from "../components/ProductDetail/SpecificationTable";
import VariantSelector from "../components/ProductDetail/VariantSelector";
import { motion, AnimatePresence } from "framer-motion";


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();


  const [product, setProduct] = useState(null);
  const [mainImg, setMainImg] = useState("");
  const [qty, setQty] = useState(1);
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
  const [mediaMode, setMediaMode] = useState("image"); 
  const [openAccordion, setOpenAccordion] = useState("overview"); 
  const [bundleChecked, setBundleChecked] = useState([true, true]); 
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [size, setSize] = useState("");
  const relatedSliderRef = React.useRef(null);
  const recentlySliderRef = React.useRef(null);

  const scrollSlider = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 340;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  // Dynamic Selection Attributes State
  const [selectedAttributes, setSelectedAttributes] = useState({});

  const parseProductJSONFields = (prod) => {
    if (!prod) return prod;
    const p = { ...prod };

    if (typeof p.attributes === "string") {
      try {
        p.attributes = JSON.parse(p.attributes);
      } catch (e) {
        console.error("Error parsing attributes:", e);
      }
    }

    if (typeof p.variants === "string") {
      try {
        p.variants = JSON.parse(p.variants);
      } catch (e) {
        console.error("Error parsing variants:", e);
        p.variants = [];
      }
    }

    if (Array.isArray(p.variants)) {
      p.variants = p.variants.map(v => {
        const variant = { ...v };
        if (typeof variant.attributes === "string") {
          try {
            variant.attributes = JSON.parse(variant.attributes);
          } catch (e) {
            console.error("Error parsing variant attributes:", e);
          }
        }
        if (typeof variant.images === "string") {
          try {
            variant.images = JSON.parse(variant.images);
          } catch (e) {
            console.error("Error parsing variant images:", e);
          }
        }
        return variant;
      });
    }

    if (typeof p.sizes === "string") {
      try {
        p.sizes = JSON.parse(p.sizes);
      } catch (e) {
        try {
          p.sizes = p.sizes.split(",").map(s => s.trim()).filter(Boolean);
        } catch (_) {
          p.sizes = [];
        }
      }
    }

    if (typeof p.images === "string") {
      try {
        p.images = JSON.parse(p.images);
      } catch (e) {
        console.error("Error parsing product images:", e);
      }
    }

    return p;
  };

  const parseAttributes = (prod) => {
    if (!prod) return {};
    let attrs = prod.attributes;
    if (typeof attrs === "string") {
      try {
        attrs = JSON.parse(attrs);
      } catch (e) {
        console.error("Failed to parse attributes:", e);
      }
    }
    let parsed = {};
    const legacyVariantKeys = ["color", "size", "ram", "storage", "length", "capacity", "lens type"];
    const isLegacyVariant = (key) => legacyVariantKeys.includes(String(key).toLowerCase().trim());

    let flatAttrs = [];
    if (attrs) {
      if (Array.isArray(attrs)) {
        flatAttrs = attrs;
      } else if (attrs.variants && Array.isArray(attrs.variants)) {
        flatAttrs = attrs.variants;
      } else if (typeof attrs === "object") {
        Object.entries(attrs).forEach(([key, val]) => {
          flatAttrs.push({ key, value: val });
        });
      }
    }

    flatAttrs.forEach(attr => {
      if (attr && typeof attr === "object") {
        const key = (attr.name || attr.key || "").trim();
        if (!key) return;

        const displayType = attr.displayType || (isLegacyVariant(key) ? "variant" : "specification");
        if (displayType !== "variant") return;

        let valArray = [];
        if (Array.isArray(attr.values)) {
          valArray = attr.values;
        } else if (Array.isArray(attr.value)) {
          valArray = attr.value;
        } else {
          const valueStr = String(attr.value || attr.values || "");
          valArray = valueStr.split(",").map(v => v.trim()).filter(Boolean);
        }
        parsed[key] = valArray;
      }
    });

    // Fallback: If no attributes parsed and product has sizes array, map it to 'Size'
    if (Object.keys(parsed).length === 0 && prod.sizes && prod.sizes.length > 0) {
      parsed["Size"] = prod.sizes;
    }

    // Clean up empty or invalid (object-based or metadata-based) attribute values
    const blacklist = [
      "shortdescription",
      "searchkeywords",
      "highlights",
      "specifications",
      "description",
      "name",
      "price",
      "stock",
      "images",
      "sku",
      "brand",
      "category",
      "subcategory",
      "weight",
      "dimensions",
      "location",
      "seller",
      "reviews",
      "rating",
      "variants",
      "variant",
      "createdat",
      "updatedat",
      "_id",
      "id",
      "status"
    ];

    Object.keys(parsed).forEach(key => {
      const normalizedKey = key.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
      if (blacklist.includes(normalizedKey)) {
        delete parsed[key];
        return;
      }
      if (!parsed[key] || parsed[key].length === 0) {
        delete parsed[key];
        return;
      }
      if (Array.isArray(parsed[key])) {
        parsed[key] = parsed[key].filter(v => v && typeof v !== "object");
        if (parsed[key].length === 0) {
          delete parsed[key];
        }
      }
    });

    return parsed;
  };

  const parsedAttributes = product ? parseAttributes(product) : {};
  const hasDynamicAttrs = Object.keys(parsedAttributes).length > 0;

  useEffect(() => {
    if (hasDynamicAttrs) {
      const initial = {};
      Object.entries(parsedAttributes).forEach(([key, values]) => {
        if (Array.isArray(values) && values.length === 1) {
          initial[key] = values[0];
        } else {
          initial[key] = "";
        }
      });
      setSelectedAttributes(initial);
    } else {
      setSelectedAttributes({});
    }
  }, [product]);

  const getVariantAttributeValue = (variant, keyName) => {
    if (!variant || !variant.attributes) return undefined;
    let attrs = variant.attributes;
    if (typeof attrs === "string") {
      try {
        attrs = JSON.parse(attrs);
      } catch (e) {}
    }
    
    if (Array.isArray(attrs)) {
      const match = attrs.find(attr => {
        const name = (attr.name || attr.key || "").trim().toLowerCase();
        return name === keyName.toLowerCase();
      });
      return match ? match.value : undefined;
    } else if (typeof attrs === "object") {
      const targetKey = Object.keys(attrs).find(k => k.toLowerCase() === keyName.toLowerCase());
      return targetKey ? attrs[targetKey] : undefined;
    }
    return undefined;
  };

  const isOptionAvailable = (attrName, optionValue) => {
    if (!product || !product.variants || product.variants.length === 0) return true;
    const testSelection = { ...selectedAttributes, [attrName]: optionValue };
    return product.variants.some(variant => {
      const match = Object.entries(testSelection).every(([key, val]) => {
        if (!val) return true;
        const varVal = getVariantAttributeValue(variant, key);
        return varVal === val;
      });
      return match && variant.stock > 0;
    });
  };

  const getSelectedVariant = () => {
    if (!product || !product.variants || product.variants.length === 0) return null;
    const attrKeys = Object.keys(parsedAttributes);
    const allSelected = attrKeys.every(k => selectedAttributes[k]);
    if (!allSelected) return null;
    return product.variants.find(variant => {
      return attrKeys.every(k => {
        const varVal = getVariantAttributeValue(variant, k);
        return varVal === selectedAttributes[k];
      });
    });
  };

  const currentVariant = getSelectedVariant();
  const displayPrice = currentVariant ? currentVariant.price : (product ? product.price : 0);
  const displayStock = currentVariant ? currentVariant.stock : (product ? product.stock : 0);
  const displaySku = currentVariant ? (currentVariant.sku || product?.sku) : product?.sku;
  const displayImages = currentVariant?.images && currentVariant.images.length > 0 ? currentVariant.images : (product?.images || []);
  const isAvailable = currentVariant 
    ? (currentVariant.availability !== false && currentVariant.stock > 0) 
    : (product ? (product.stock > 0) : false);
  const isPurchaseDisabled = !isAvailable || (hasDynamicAttrs && !currentVariant);

  useEffect(() => {
    if (currentVariant && currentVariant.images && currentVariant.images.length > 0) {
      setMainImg(currentVariant.images[0]);
    } else if (product && product.images && product.images.length > 0) {
      if (!product.images.includes(mainImg)) {
        setMainImg(product.images[0]);
      }
    }
  }, [currentVariant, product]);

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
          const parsedProd = parseProductJSONFields(data.product);
          setProduct(parsedProd);
          setMainImg(parsedProd.images?.[0] || "");
          trackView(parsedProd); // track for personalisation
          setRelatedPage(0);

          const listRes = await axios.get(`${backendUrl}/api/product/list?limit=100`);
          if (listRes.data.success) {
            let related = listRes.data.products.map(p => parseProductJSONFields(p)).filter(
              (item) =>
                item._id !== parsedProd._id &&
                item.category?.toLowerCase() === parsedProd.category?.toLowerCase()
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <ProductDetailSkeleton />
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
            className="mt-5 w-full py-2.5 bg-slate-950 dark:bg-indigo-600 text-slate-100 dark:text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
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
  const emiAmount = Math.floor(displayPrice / 12);
  const discountPercent = 20;
  const originalPrice = Math.round(displayPrice / (1 - discountPercent / 100));

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
    if (hasDynamicAttrs) {
      const attrKeys = Object.keys(parsedAttributes);
      const missing = attrKeys.filter(k => !selectedAttributes[k]);
      if (missing.length > 0) {
        toast.warning(`Please select ${missing.join(", ")} first`);
        return;
      }
    } else if (product.sizes && product.sizes.length > 0 && !size) {
      toast.warning("Please select a size first");
      return;
    }

    const cartSize = hasDynamicAttrs
      ? Object.keys(selectedAttributes).sort().map(k => `${k}:${selectedAttributes[k]}`).join(",")
      : (size || "standard");

    navigate("/placeorder", {
      state: { 
        product, 
        qty, 
        size: cartSize, 
        selectedAttributes: hasDynamicAttrs ? selectedAttributes : undefined,
        total: displayPrice * qty 
      },
    });
  };

  const handleCart = async () => {
    if (hasDynamicAttrs) {
      const attrKeys = Object.keys(parsedAttributes);
      const missing = attrKeys.filter(k => !selectedAttributes[k]);
      if (missing.length > 0) {
        toast.warning(`Please select ${missing.join(", ")} first`);
        return;
      }
    } else if (product.sizes && product.sizes.length > 0 && !size) {
      toast.warning("Please select a size first");
      return;
    }

    const token = localStorage.getItem("token");
    const cartSize = hasDynamicAttrs
      ? Object.keys(selectedAttributes).sort().map(k => `${k}:${selectedAttributes[k]}`).join(",")
      : (size || "standard");

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
        { 
          itemId: product._id, 
          size: cartSize, 
          qty,
          selectedAttributes: hasDynamicAttrs ? selectedAttributes : undefined
        },
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
        setProduct(parseProductJSONFields(res.data.product));
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
  const activeMainImgSrc = (mainImg && typeof mainImg === "string")
    ? (mainImg.startsWith("http") ? mainImg : `${backendUrl}/${mainImg}`)
    : "";

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
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">
          <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer" onClick={() => navigate("/")}>Home</span>
          <span>&gt;</span>
          <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer" onClick={() => navigate(`/product?category=${product.category}`)}>{product.category}</span>
          <span>&gt;</span>
          <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer" onClick={() => navigate(`/product?category=${product.category}&subCategory=${product.subCategory}`)}>{product.subCategory || "Dresses"}</span>
          <span>&gt;</span>
          <span className="text-slate-600 dark:text-slate-300 truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* 3-Column Split Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.1fr_0.8fr] gap-8 items-start">
          {/* COLUMN 1: E-commerce Image Showcase */}
          <div className="flex flex-col gap-6">
            <div className="flex gap-2.5 items-stretch">
              
              {/* Vertical Thumbnail Deck (Desktop) */}
              <div className="hidden sm:flex flex-col gap-2 w-20 shrink-0 justify-between">
                {displayImages?.map((img, i) => {
                  const isActive = mainImg === img && mediaMode === "image";
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setMainImg(img);
                        setMediaMode("image");
                      }}
                      className={`relative w-full aspect-[3/4] overflow-hidden border transition-all cursor-pointer ${ isActive ? "border-slate-950 dark:border-white border-2" : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600" }`}
                    >
                      <img
                        src={img.startsWith("http") ? img : `${backendUrl}/${img}`}
                        className="h-full w-full object-cover"
                        alt="thumbnail"
                      />
                    </button>
                  );
                })}
                
                {/* Mock Video Thumbnail */}
                <button
                  onClick={() => setMediaMode("video")}
                  className={`relative w-full aspect-[3/4] overflow-hidden border transition-all flex flex-col items-center justify-center cursor-pointer ${ mediaMode === "video" ? "border-slate-950 dark:border-white border-2" : "border-slate-200 dark:border-slate-800 hover:border-slate-400" }`}
                >
                  <Video size={16} className="text-slate-500 dark:text-indigo-400" />
                  <span className="text-[8px] font-bold uppercase mt-1">Video</span>
                </button>

                {/* Mock 360 Thumbnail */}
                <button
                  onClick={() => setMediaMode("360")}
                  className={`relative w-full aspect-[3/4] overflow-hidden border transition-all flex flex-col items-center justify-center cursor-pointer ${ mediaMode === "360" ? "border-slate-950 dark:border-white border-2" : "border-slate-200 dark:border-slate-800 hover:border-slate-400" }`}
                >
                  <Rotate3d size={16} className="text-slate-500 dark:text-indigo-400" />
                  <span className="text-[8px] font-bold uppercase mt-1">360° View</span>
                </button>
              </div>

              {/* Main Media Showcase Window */}
              <div className="flex-1 relative aspect-[3/4] overflow-hidden rounded-none">
                
                {/* Float overlays */}
                <div className="absolute top-4 left-4 z-25 flex gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 shadow-xs">
                    <Sparkles size={10} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    <span>Premium Model</span>
                  </span>
                  {displayStock <= 5 && displayStock > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 shadow-xs animate-pulse">
                      Low Stock
                    </span>
                  )}
                </div>

                {/* Action buttons on image */}
                <div className="absolute top-4 right-4 z-25 flex flex-col gap-2">
                  <button 
                    onClick={toggleFavorite}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:scale-105 active:scale-95 transition cursor-pointer"
                  >
                    <Heart size={16} className={isFavorite ? "fill-rose-500 stroke-rose-500 scale-105" : ""} />
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.info("Product link copied to clipboard!");
                    }}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 active:scale-95 transition cursor-pointer"
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
                    onClick={() => triggerLightbox(displayImages.indexOf(mainImg))}
                    className="relative flex h-full w-full items-center justify-center overflow-hidden bg-transparent cursor-zoom-in rounded-none"
                  >
                    <motion.img
                      key={activeMainImgSrc}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      src={activeMainImgSrc}
                      alt={product.name}
                      className="w-full h-full object-contain pointer-events-none transition-transform duration-150 ease-out"
                      style={{
                        transform: isZoomed ? "scale(1.85)" : "scale(1)",
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                      }}
                    />
                    <button 
                      onClick={() => triggerLightbox(displayImages.indexOf(mainImg))}
                      className="absolute bottom-4 right-4 z-25 h-10 w-10 flex items-center justify-center rounded-none bg-slate-950/80 backdrop-blur-md text-slate-100 dark:text-white hover:scale-105 active:scale-95 transition cursor-pointer shadow-md"
                    >
                      <Maximize2 size={15} />
                    </button>
                  </div>
                )}

                {/* Video Mode Container */}
                {mediaMode === "video" && (
                  <div className="relative flex h-full w-full items-center justify-center bg-slate-950 dark:bg-slate-900">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-slate-100 dark:text-white p-6 text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/25">
                        <Video size={28} className="text-slate-100 dark:text-white animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider">Product Showcase Walkthrough</h4>
                        <p className="text-[10px] text-slate-300 max-w-xs mt-1">Check out our visual model walkthrough showing fits, material quality, and real-time usage.</p>
                      </div>
                      <button 
                        onClick={() => setMediaMode("image")}
                        className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition active:scale-95"
                      >
                        Back to Images
                      </button>
                    </div>
                  </div>
                )}

                {/* 360° Interactive Canvas Mode */}
                {mediaMode === "360" && (
                  <div className="relative flex h-full w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
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
                        className="px-4 py-2 bg-slate-950 dark:bg-indigo-600 text-slate-100 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition active:scale-95"
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
              {displayImages?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMainImg(img);
                    setMediaMode("image");
                  }}
                  className={`relative aspect-[3/4] w-14 overflow-hidden border shrink-0 ${ mainImg === img && mediaMode === "image" ? "border-slate-950 dark:border-white border-2" : "border-slate-200 dark:border-slate-800" }`}
                >
                  <img
                    src={img.startsWith("http") ? img : `${backendUrl}/${img}`}
                    className="h-full w-full object-cover"
                    alt="thumbnail"
                  />
                </button>
              ))}
              <button
                onClick={() => setMediaMode("video")}
                className={`w-14 aspect-[3/4] border shrink-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900 ${ mediaMode === "video" ? "border-slate-950 dark:border-white border-2" : "border-slate-200 dark:border-slate-800" }`}
              >
                <Video size={14} className="text-slate-500" />
                <span className="text-[8px] font-bold mt-1">VIDEO</span>
              </button>
              <button
                onClick={() => setMediaMode("360")}
                className={`w-14 aspect-[3/4] border shrink-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900 ${ mediaMode === "360" ? "border-slate-950 dark:border-white border-2" : "border-slate-200 dark:border-slate-800" }`}
              >
                <Rotate3d size={14} className="text-slate-500" />
                <span className="text-[8px] font-bold mt-1">360°</span>
              </button>
            </div>

            {/* Nav Tabs Section (Under Images) */}
            <div className="w-full text-left mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-8 overflow-x-auto scrollbar-hide">
                {[
                  { id: "description", label: "Description" },
                  { id: "care", label: "Care Instructions" },
                  { id: "shipping", label: "Shipping & Returns" },
                  { id: "reviews", label: `Reviews (${reviewCount})` }
                ].map((tab) => {
                  const isActive = activeTab === tab.id || (tab.id === "care" && activeTab === "care_instructions");
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative pb-3 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${ isActive ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200" }`}
                    >
                      {tab.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 dark:bg-indigo-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 min-h-[140px]">
                {(activeTab === "description" || activeTab === "care_instructions") && (
                  <div className="space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed animate-fade-in">
                    {activeTab === "description" && (
                      <>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{product.description}</p>
                        <div className="mt-6 mb-8">
                          <SpecificationTable product={product} />
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-6 mt-6">
                          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Care Instructions</h4>
                          <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                              <RotateCcw size={14} className="text-slate-400" />
                              <span>Machine wash cold</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Droplets size={14} className="text-slate-400" />
                              <span>Do not bleach</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Flame size={14} className="text-slate-400" />
                              <span>Iron at low temperature</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Sun size={14} className="text-slate-400" />
                              <span>Dry in shade</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shirt size={14} className="text-slate-400" />
                              <span>Wash with similar colors</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === "care" && (
                  <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed animate-fade-in">
                    <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">Garment Care Guide</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-xs">
                      <div className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <RotateCcw size={16} className="text-slate-400 shrink-0" />
                        <span>Machine Wash Cold (Gentle cycle)</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <Droplets size={16} className="text-slate-400 shrink-0" />
                        <span>Do Not Bleach</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <Flame size={16} className="text-slate-400 shrink-0" />
                        <span>Iron Low Temperature (Max 110°C)</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <Sun size={16} className="text-slate-400 shrink-0" />
                        <span>Dry in shade / Hang to dry</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl col-span-1 sm:col-span-2">
                        <Shirt size={16} className="text-slate-400 shrink-0" />
                        <span>Wash inside out with similar colors to preserve texture</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-400 leading-relaxed animate-fade-in text-left">
                    <p>At CartNOW, our logistic network operates standard express delivery across domestic zipcodes. Packages leave our regional hub within 24 hours of placement.</p>
                    <p className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">Expected Timelines:</p>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
                      <li>Metros: 2-3 business days.</li>
                      <li>Regional hubs: 4-5 business days.</li>
                      <li>International: 7-10 business days.</li>
                    </ul>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6 animate-fade-in text-left w-full">
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

                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Sorting select */}
                        <select
                          value={reviewsSortBy}
                          onChange={(e) => setReviewsSortBy(e.target.value)}
                          className="h-8 px-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-[10.5px] font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                        >
                          <option>Most Recent</option>
                          <option>Most Helpful</option>
                          <option>Highest Rated</option>
                          <option>Lowest Rated</option>
                        </select>

                        <button
                          onClick={() => setShowWriteReview(true)}
                          className="py-2 px-3 bg-slate-950 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-slate-100 dark:text-white text-[10.5px] font-black uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <MessageSquare size={12} />
                          <span>Write Review</span>
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
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-200 cursor-pointer ${ isActive ? "bg-slate-950 dark:bg-indigo-600 text-slate-100 dark:text-white shadow-xs" : "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-900 hover:border-slate-300" }`}
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
              </div>
            </div>

          </div>

          {/* COLUMN 2: Center Details Panel & Buying CTA options */}
          <div className="space-y-5 text-left lg:sticky lg:top-24 lg:self-start">
            
            {/* Store brand / Category Badge */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span 
                onClick={() => navigate(`/brand/${encodeURIComponent(product.brand || "FashionAura")}`)}
                className="text-xs font-black text-blue-500 hover:underline cursor-pointer tracking-wider"
              >
                {product.brand || "FashionAura"}
              </span>
              <span className="text-[9px] font-bold text-slate-400">SKU: {displaySku || `CN-${product._id?.substring(0,8).toUpperCase()}`}</span>
            </div>

            {/* Title & Review stars metrics */}
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {product.name}
              </h1>

              {/* Badge Chips */}
              <BadgeChips product={product} />

              {/* Review metrics */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{averageRating ? averageRating.toFixed(1) : "4.6"}</span>
                <div className="flex text-amber-500">
                  <Star size={11} className="fill-amber-500 stroke-none" />
                  <Star size={11} className="fill-amber-500 stroke-none" />
                  <Star size={11} className="fill-amber-500 stroke-none" />
                  <Star size={11} className="fill-amber-500 stroke-none" />
                  <Star size={11} className="fill-amber-500 stroke-none" />
                </div>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-bold text-slate-400 hover:underline cursor-pointer">{reviewCount || "245"} Reviews</span>
              </div>
            </div>

            {/* Pricing Info block */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-500">₹{displayPrice.toLocaleString("en-IN")}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-400 line-through">₹{originalPrice.toLocaleString("en-IN")}</span>
                <span className="px-2 py-0.5 rounded border border-rose-200 bg-rose-50 text-rose-600 dark:text-rose-400 text-[10px] font-bold">{discountPercent}% OFF</span>
              </div>
              <p className="text-[10px] text-slate-400">Inclusive of all taxes</p>
            </div>

            {/* Availability & Stock status block */}
            <div className="flex flex-wrap items-center gap-3 text-xs border-t border-slate-200 dark:border-slate-800/80 pt-3.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${ isAvailable ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30" : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 animate-pulse" }`}>
                {isAvailable ? "In Stock" : "Out of Stock"}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className={`font-bold ${ !isAvailable ? "text-slate-400 dark:text-slate-500" : displayStock <= 5 ? "text-rose-600 dark:text-rose-400 animate-pulse" : "text-slate-600 dark:text-slate-300" }`}>
                {!isAvailable 
                  ? "Currently Unavailable" 
                  : displayStock <= 5 
                  ? `Only ${displayStock} left in stock!` 
                  : `${displayStock} units available`}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Ships from {product.location || "Delhi"}
              </span>
            </div>

            {/* Trust Badges Card */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-950/20 grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 text-center gap-1">
              <div className="flex flex-col items-center justify-center p-1">
                <Truck size={16} className="text-slate-500 dark:text-indigo-400 mb-1" />
                <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 leading-tight">Free Shipping</span>
                <span className="text-[8.5px] text-slate-400 leading-none mt-0.5">On all orders</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1">
                <Clock size={16} className="text-slate-500 dark:text-indigo-400 mb-1" />
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 leading-tight">
                  {!isAvailable ? "No Delivery" : "3-5 Days Delivery"}
                </span>
                <span className="text-[8.5px] text-slate-400 leading-none mt-0.5">
                  {!isAvailable ? "Out of stock" : "Estimated delivery"}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-1">
                <RotateCcw size={16} className="text-slate-500 dark:text-indigo-400 mb-1" />
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 leading-tight">Easy Returns</span>
                <span className="text-[8.5px] text-slate-400 leading-none mt-0.5">Within 7 days</span>
              </div>
            </div>

            {/* Feature List (Product Features / Highlights) */}
            <FeatureList product={product} />

            {/* Natural Variant Selector attributes in the purchase area */}
            <div className="space-y-4 pt-3">
              <VariantSelector
                product={product}
                selectedAttributes={selectedAttributes}
                setSelectedAttributes={setSelectedAttributes}
                isOptionAvailable={isOptionAvailable}
                setShowSizeGuide={setShowSizeGuide}
                size={size}
                setSize={setSize}
              />

              {/* Dynamic Selected Variant Card */}
              {hasDynamicAttrs && (
                <div className="relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/30 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800/60 shadow-2xs mt-3">
                  {/* Premium left accent bar */}
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />
                  
                  <div className="flex items-center justify-between mb-2.5 pl-2">
                    <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                      Selected Variant
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(parsedAttributes).map((key) => {
                        const val = selectedAttributes[key];
                        if (!val) return null;
                        return (
                          <span key={key} className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100/60 dark:border-indigo-900/40">
                            {val}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pl-2">
                    {!currentVariant ? (
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-500 animate-pulse block bg-amber-50/30 dark:bg-amber-950/10 py-1.5 px-3 rounded-lg border border-amber-100/60 dark:border-amber-900/30 text-center">
                        Please select the remaining options
                      </span>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-[11px] font-black text-slate-800 dark:text-white flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold tracking-wider">Selected Combination:</span>
                          <span>{Object.keys(parsedAttributes).map(k => selectedAttributes[k]).filter(Boolean).join(" • ")}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-900 text-xs">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[8px] uppercase font-bold tracking-wider mb-0.5">SKU Reference</span>
                            <span className="font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800 font-bold tracking-wider truncate block text-[10px]">{displaySku}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[8px] uppercase font-bold tracking-wider mb-0.5">Retail Price</span>
                            <span className="font-black text-rose-600 dark:text-rose-500 block text-xs">₹{displayPrice.toLocaleString("en-IN")}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[8px] uppercase font-bold tracking-wider mb-0.5">Stock Status</span>
                            <span className={`font-bold block text-[10px] uppercase ${displayStock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                              {displayStock > 0 ? `${displayStock} Available` : "Out of Stock"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector: rounded segmented control */}
            <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-800 pt-4.5 flex items-center gap-4 text-left">
              <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider block">Quantity:</span>
              <div className="flex items-center justify-between rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-1 w-32 shadow-inner">
                <button
                  type="button"
                  disabled={isPurchaseDisabled || qty <= 1}
                  onClick={() => setQty(qty - 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-xs"
                >
                  <Minus size={12} />
                </button>
                <span className="text-xs font-black text-slate-950 dark:text-white select-none">
                  {isPurchaseDisabled ? 0 : qty}
                </span>
                <button
                  type="button"
                  disabled={isPurchaseDisabled}
                  onClick={() => {
                    if (qty < displayStock) {
                      setQty(qty + 1);
                    } else {
                      toast.warning(`Only ${displayStock} items left in stock.`);
                    }
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-xs"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* Buying Action buttons */}
            <div className="grid gap-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={!isPurchaseDisabled ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!isPurchaseDisabled ? { scale: 0.98 } : {}}
                  onClick={handleCart}
                  disabled={isPurchaseDisabled}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${ isPurchaseDisabled ? "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-50" : "border-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-100 dark:hover:text-slate-900 hover:shadow-xs" }`}
                >
                  <ShoppingCart size={13} />
                  <span>Add to Cart</span>
                </motion.button>

                <motion.button
                  whileHover={!isPurchaseDisabled ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!isPurchaseDisabled ? { scale: 0.98 } : {}}
                  onClick={handleBuyNow}
                  disabled={isPurchaseDisabled}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider text-slate-100 dark:text-white transition-all cursor-pointer ${ isPurchaseDisabled ? "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-50" : "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:shadow-[0_4px_15px_rgba(245,158,11,0.45)]" }`}
                >
                  <ShoppingBag size={13} />
                  <span>Buy Now</span>
                </motion.button>
              </div>

              {/* Extra interactivity buttons: Compare + AI Assistant drawer */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => {
                    if (isComparing) {
                      removeFromCompare(product._id);
                    } else {
                      addToCompare(product);
                    }
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2 text-[10.5px] font-black transition active:scale-98 cursor-pointer uppercase ${ isComparing ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50" }`}
                >
                  <BarChart2 size={12} />
                  <span className="truncate">{isComparing ? "In Compare" : "Compare"}</span>
                </button>

                <button
                  onClick={() => setShowAssistant(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/10 py-2 text-[10.5px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition active:scale-98 cursor-pointer"
                >
                  <MessageSquare size={12} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Ask AI Assistant</span>
                </button>
              </div>

              {/* Interactive AR tryon (Fashion items only) */}
              {isFashionItem(product) && (
                <button
                  onClick={() => navigate("/tryon", { state: { productId: product._id } })}
                  className="relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-[size:200%_auto] hover:bg-[position:right_center] py-2.5 text-xs font-black uppercase tracking-wider text-slate-100 dark:text-white shadow-xs hover:shadow-sm active:scale-98 transition-all duration-500 group overflow-hidden cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  <span>AI Interactive Try-On</span>
                </button>
              )}
            </div>

          </div>

          {/* COLUMN 3: Seller, and Shipping Sidebar cards */}
          <div className="space-y-4">

            {/* 2. Seller Info card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-2xl p-5 text-left shadow-xs">
              <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">
                Seller Information
              </h4>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-sm font-black text-slate-900 dark:text-white">
                    {product.brand || "Fashion Aura Store"}
                  </h5>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span>{averageRating ? averageRating.toFixed(1) : "4.6"}</span>
                    <div className="flex text-amber-500">
                      <Star size={10} className="fill-amber-500 stroke-none" />
                      <Star size={10} className="fill-amber-500 stroke-none" />
                      <Star size={10} className="fill-amber-500 stroke-none" />
                      <Star size={10} className="fill-amber-500 stroke-none" />
                      <Star size={10} className="fill-amber-500 stroke-none" />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/brand/${encodeURIComponent(product.brand || "FashionAura")}`)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-slate-950 dark:hover:border-indigo-400 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  View Store
                </button>
              </div>
            </div>

            {/* 3. Shipping Information card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-2xl p-5 text-left shadow-xs">
              <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                Shipping Information
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">Weight</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{product.weight || "350g"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">Free Shipping</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">On all orders</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">Estimated Delivery</span>
                  <span className={`font-semibold ${!isAvailable ? "text-rose-500" : "text-slate-800 dark:text-slate-200"}`}>
                    {!isAvailable ? "Unavailable (Out of stock)" : "3-5 Days"}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* SECTION: Related Products Horizontal Carousel Slider */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-10 text-left">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">Related items</span>
                <h2 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Customers Also Viewed
                </h2>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-xs">
                  <button
                    type="button"
                    onClick={() => scrollSlider(relatedSliderRef, "left")}
                    className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer select-none text-slate-600 dark:text-slate-400"
                    aria-label="Previous related products"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollSlider(relatedSliderRef, "right")}
                    className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer select-none text-slate-600 dark:text-slate-400"
                    aria-label="Next related products"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
                
                <button
                  onClick={() => navigate(`/product?category=${product.category}`)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-black text-slate-800 dark:text-slate-200 transition hover:border-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  View Collection
                </button>
              </div>
            </div>

            {/* Carousel Container */}
            <div 
              ref={relatedSliderRef}
              className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
            >
              {relatedProducts.map((item) => (
                <div 
                  key={item._id} 
                  className="min-w-[220px] sm:min-w-[260px] md:min-w-[285px] max-w-[285px] scroll-snap-align-start flex-shrink-0"
                >
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: Recently Viewed Products Horizontal Carousel Slider */}
        {recentlyViewed.length > 0 && (
          <section className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-8 text-left">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Personal history</span>
                <h2 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Recently Viewed
                </h2>
              </div>
              
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-xs">
                <button
                  type="button"
                  onClick={() => scrollSlider(recentlySliderRef, "left")}
                  className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer select-none text-slate-600 dark:text-slate-400"
                  aria-label="Previous recently viewed products"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider(recentlySliderRef, "right")}
                  className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer select-none text-slate-600 dark:text-slate-400"
                  aria-label="Next recently viewed products"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Carousel Container */}
            <div 
              ref={recentlySliderRef}
              className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
            >
              {recentlyViewed.map((item) => (
                <div 
                  key={item._id} 
                  className="min-w-[220px] sm:min-w-[260px] md:min-w-[285px] max-w-[285px] scroll-snap-align-start flex-shrink-0"
                >
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: Footer Features Bar */}
        <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 pb-4">
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
                  className="flex items-center gap-4 bg-white/60 dark:bg-slate-900/25 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700 text-left"
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
            className="absolute top-6 right-6 z-[210] h-11 w-11 rounded-full bg-white/10 text-slate-100 dark:text-white hover:bg-white/20 active:scale-95 flex items-center justify-center transition cursor-pointer"
          >
            <X size={20} />
          </button>

          {displayImages?.length > 1 && (
            <button 
              onClick={() => {
                const total = displayImages.length;
                const nextIdx = (lightboxImgIdx - 1 + total) % total;
                setLightboxImgIdx(nextIdx);
                setMainImg(displayImages[nextIdx]);
              }}
              className="absolute left-6 z-[210] h-12 w-12 rounded-full bg-white/10 text-slate-100 dark:text-white hover:bg-white/20 active:scale-95 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div className="relative max-h-[85vh] max-w-[85vw] flex items-center justify-center select-none">
            <img 
              src={(displayImages?.[lightboxImgIdx] && typeof displayImages[lightboxImgIdx] === "string")
                ? (displayImages[lightboxImgIdx].startsWith("http") ? displayImages[lightboxImgIdx] : `${backendUrl}/${displayImages[lightboxImgIdx]}`)
                : ""} 
              alt="lightbox"
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
            {displayImages?.length > 1 && (
              <span className="absolute bottom-[-40px] text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                {lightboxImgIdx + 1} / {displayImages.length}
              </span>
            )}
          </div>

          {displayImages?.length > 1 && (
            <button 
              onClick={() => {
                const total = displayImages.length;
                const nextIdx = (lightboxImgIdx + 1) % total;
                setLightboxImgIdx(nextIdx);
                setMainImg(displayImages[nextIdx]);
              }}
              className="absolute right-6 z-[210] h-12 w-12 rounded-full bg-white/10 text-slate-100 dark:text-white hover:bg-white/20 active:scale-95 flex items-center justify-center transition cursor-pointer"
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
          className="fixed bottom-6 right-6 z-[90] flex items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-slate-100 dark:text-white shadow-xl hover:shadow-indigo-500/35 transition-all duration-300 group cursor-pointer"
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
              <p className="text-[10px] font-black text-slate-400 dark:text-indigo-400 mt-0.5">₹{displayPrice}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {hasDynamicAttrs && (
              <span className="hidden lg:inline text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {Object.keys(parsedAttributes).every(k => selectedAttributes[k]) ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold normal-case">
                    Selected: {Object.entries(selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(" • ")}
                  </span>
                ) : (
                  <span className="text-orange-600 dark:text-orange-400 animate-pulse">
                    Please Select Options
                  </span>
                )}
              </span>
            )}

            <button
              onClick={handleCart}
              disabled={isPurchaseDisabled}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition active:scale-95 shadow-md ${ isPurchaseDisabled ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60" : "bg-slate-950 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-slate-100 dark:text-white cursor-pointer" }`}
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isPurchaseDisabled}
              className={`hidden md:block px-6 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition active:scale-95 shadow-md ${ isPurchaseDisabled ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60" : "bg-violet-600 hover:bg-violet-700 text-slate-100 dark:text-white cursor-pointer" }`}
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
              className="mt-6 w-full py-3 bg-slate-950 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-slate-100 dark:text-white rounded-2xl text-xs font-black uppercase tracking-wider transition active:scale-[0.98] cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

      {/* AI ASSISTANT SLIDE-OUT DRAWER PANEL */}
      <div 
        onClick={() => setShowAssistant(false)}
        className={`fixed inset-0 z-[99] bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ${ showAssistant ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none" }`}
      />

      <div className={`fixed inset-y-0 right-0 z-[100] w-full sm:max-w-md bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${ showAssistant ? "translate-x-0" : "translate-x-full" }`}>
        
        <div className="flex items-center justify-between bg-gradient-to-r from-indigo-900 to-indigo-700 dark:from-slate-900 dark:to-indigo-950 px-6 py-5 text-slate-100 dark:text-white shadow-md border-b dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-slate-100 dark:text-white shadow-inner">
              <Sparkles size={20} className="text-amber-300" />
            </div>
            <div className="text-left">
              <h3 className="font-black text-sm uppercase tracking-wider">CartNOW Stylist</h3>
              <p className="text-[10px] text-slate-300 mt-0.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Assistant Online
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAssistant(false)}
            className="rounded-full bg-white/10 p-2 text-slate-100 dark:text-white hover:bg-white/20 transition active:scale-95 cursor-pointer"
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
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-sm whitespace-pre-line leading-relaxed ${ isUser ? "bg-slate-900 dark:bg-indigo-600 text-slate-100 dark:text-white rounded-tr-none shadow shadow-indigo-950/20" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none" }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm">
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
          className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 flex gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={`Ask about this product...`}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm outline-none dark: dark:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || chatLoading}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-4 text-xs font-black uppercase text-slate-100 dark:text-white tracking-wider transition disabled:opacity-50 active:scale-95 shrink-0 flex items-center justify-center cursor-pointer"
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
