import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ShoppingBag, 
  Eye, 
  Check, 
  Plus, 
  ArrowRight, 
  Layers, 
  Flame, 
  Zap, 
  Tag, 
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Percent
} from "lucide-react";
import { toast } from "react-toastify";

/* Curated Lookbook Scenes with Product Hotspots */
const LOOKBOOK_SCENES = [
  {
    id: "desk",
    tabLabel: "Aesthetic Tech Desk",
    category: "Workspace & Audio",
    title: "Minimalist High-Output Workspace",
    subtitle: "Engineered for elite creators & developers. Ultra-clean aesthetics, tactile feedback & studio acoustics.",
    bgImage: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1400&q=80",
    bundleDiscountPercent: 28,
    products: [
      {
        id: "prod-desk-1",
        name: "Pro Studio ANC Wireless Headphones",
        category: "Audio & Acoustics",
        price: 12999,
        originalPrice: 18999,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        pinX: 28, // % from left
        pinY: 30, // % from top
        tag: "Hi-Res Audio"
      },
      {
        id: "prod-desk-2",
        name: "Ergonomic 75% Custom Mechanical Keyboard",
        category: "Peripherals",
        price: 6499,
        originalPrice: 8999,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
        pinX: 48,
        pinY: 66,
        tag: "Gateron Pro"
      },
      {
        id: "prod-desk-3",
        name: "Precision Wireless Ultra-Light Mouse",
        category: "Peripherals",
        price: 3299,
        originalPrice: 4999,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
        pinX: 76,
        pinY: 64,
        tag: "4000Hz Polling"
      },
      {
        id: "prod-desk-4",
        name: "Merino Wool Felt Dual Desk Mat",
        category: "Desk Accessories",
        price: 1499,
        originalPrice: 2499,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
        pinX: 58,
        pinY: 82,
        tag: "Eco Wool"
      }
    ]
  },
  {
    id: "streetwear",
    tabLabel: "Urban Cyber Capsule",
    category: "Streetwear & Apparel",
    title: "Cyberpunk Monochrome Street Capsule",
    subtitle: "Heavyweight drop-shoulder textiles with tactical weatherproof utility and chunky retro silhouettes.",
    bgImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80",
    bundleDiscountPercent: 32,
    products: [
      {
        id: "prod-street-1",
        name: "500GSM Heavyweight Oversized Hoodie",
        category: "Apparel",
        price: 2499,
        originalPrice: 4299,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
        pinX: 44,
        pinY: 32,
        tag: "100% French Terry"
      },
      {
        id: "prod-street-2",
        name: "Weatherproof Tactical Modular Cargo Pants",
        category: "Bottomwear",
        price: 2999,
        originalPrice: 4999,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80",
        pinX: 50,
        pinY: 62,
        tag: "Ripstop Fabric"
      },
      {
        id: "prod-street-3",
        name: "Retro Chunky Cloudstride Sneakers",
        category: "Footwear",
        price: 4499,
        originalPrice: 6999,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80",
        pinX: 56,
        pinY: 88,
        tag: "Cushioned Air"
      },
      {
        id: "prod-street-4",
        name: "Ballistic Cordura Crossbody Sling",
        category: "Accessories",
        price: 1299,
        originalPrice: 2199,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
        pinX: 32,
        pinY: 46,
        tag: "YKK Zippers"
      }
    ]
  },
  {
    id: "fitness",
    tabLabel: "Peak Performance Gear",
    category: "Athletics & Training",
    title: "Pro Hybrid Athletic Conditioning Kit",
    subtitle: "Precision telemetry, sweat-resistant audio, and ergonomic training essentials for peak daily output.",
    bgImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=80",
    bundleDiscountPercent: 30,
    products: [
      {
        id: "prod-fit-1",
        name: "Dual-GPS Rugged Fitness Matrix Watch",
        category: "Wearables",
        price: 7999,
        originalPrice: 12999,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        pinX: 38,
        pinY: 38,
        tag: "14-Day Battery"
      },
      {
        id: "prod-fit-2",
        name: "IPX8 Sweatproof Sports Active TWS",
        category: "Audio",
        price: 2499,
        originalPrice: 4499,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
        pinX: 62,
        pinY: 26,
        tag: "Secure Earhooks"
      },
      {
        id: "prod-fit-3",
        name: "Waterproof Pro Training Duffel Bag",
        category: "Bags",
        price: 1899,
        originalPrice: 3299,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
        pinX: 74,
        pinY: 66,
        tag: "Shoe Compartment"
      },
      {
        id: "prod-fit-4",
        name: "Double-Wall Vacuum Insulated Bottle (1L)",
        category: "Hydration",
        price: 999,
        originalPrice: 1799,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
        pinX: 24,
        pinY: 68,
        tag: "24h Cold / 12h Hot"
      }
    ]
  }
];

const ShopTheLook = ({ onQuickView, onAddToCart }) => {
  const navigate = useNavigate();
  const [activeSceneId, setActiveSceneId] = useState("desk");
  const [hoveredPinId, setHoveredPinId] = useState(null);
  const [activePinId, setActivePinId] = useState("prod-desk-1");
  const [selectedBundleItems, setSelectedBundleItems] = useState({});

  const activeScene = useMemo(() => {
    return LOOKBOOK_SCENES.find((s) => s.id === activeSceneId) || LOOKBOOK_SCENES[0];
  }, [activeSceneId]);

  // Initialize all products in scene as selected by default for bundle
  const currentSelection = useMemo(() => {
    const sceneItems = activeScene.products;
    const selection = {};
    sceneItems.forEach((p) => {
      selection[p.id] = selectedBundleItems[p.id] !== undefined ? selectedBundleItems[p.id] : true;
    });
    return selection;
  }, [activeScene, selectedBundleItems]);

  const toggleItemSelection = (prodId) => {
    setSelectedBundleItems((prev) => ({
      ...prev,
      [prodId]: currentSelection[prodId] ? false : true
    }));
  };

  // Bundle calculations
  const bundleSummary = useMemo(() => {
    let originalTotal = 0;
    let currentTotal = 0;
    let count = 0;

    activeScene.products.forEach((p) => {
      if (currentSelection[p.id]) {
        originalTotal += p.originalPrice;
        currentTotal += p.price;
        count += 1;
      }
    });

    const savings = originalTotal - currentTotal;
    const discountPercent = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;

    return { originalTotal, currentTotal, savings, discountPercent, count };
  }, [activeScene, currentSelection]);

  const handleSceneChange = (sceneId) => {
    setActiveSceneId(sceneId);
    const scene = LOOKBOOK_SCENES.find((s) => s.id === sceneId);
    if (scene && scene.products.length > 0) {
      setActivePinId(scene.products[0].id);
    }
  };

  const handleAddBundleToCart = () => {
    const selectedProducts = activeScene.products.filter((p) => currentSelection[p.id]);
    if (selectedProducts.length === 0) {
      toast.info("Please select at least 1 item from the lookbook!");
      return;
    }

    if (onAddToCart) {
      selectedProducts.forEach((p) => {
        onAddToCart({
          _id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          images: [p.image],
          category: p.category,
          stock: 25
        }, 1, "Standard");
      });
      toast.success(`🎉 Added ${selectedProducts.length} lookbook items to your cart!`);
    } else {
      toast.success(`🎉 Added ${selectedProducts.length} items to cart!`);
      navigate("/cart");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-3.5 sm:p-4.5 lg:p-5 shadow-xs select-none text-left transition-colors duration-200">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-50 dark:bg-purple-950/50 border border-purple-200/80 dark:border-purple-800/60 rounded-sm text-[9px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 shadow-2xs">
              <Sparkles size={11} className="stroke-[2.5]" />
              <span>LOOKBOOK 2026</span>
            </div>

            <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
              Interactive Hotspot Showcase
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Shop The Look & Aesthetic Bundles</span>
            <span className="h-1.5 w-1.5 rounded-sm bg-purple-600 dark:bg-purple-400 animate-pulse" />
          </h2>

          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Click pulsing hotspot pins on the lifestyle sets to inspect gear, or snag the entire bundle at bundle pricing.
          </p>
        </div>

        {/* Top Right Action */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            onClick={() => navigate("/product")}
            className="px-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-800 dark:text-slate-200 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 shadow-2xs"
          >
            <span>Explore All Looks</span>
            <ArrowRight size={12} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Dedicated Filter Tabs Strip */}
      <div 
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className="w-full flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden pb-2.5 pt-0.5 mb-4 border-b border-slate-100 dark:border-slate-800/80"
      >
        {LOOKBOOK_SCENES.map((scene) => {
          const isActive = activeSceneId === scene.id;
          return (
            <motion.button
              key={scene.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSceneChange(scene.id)}
              className={`px-3 py-1.5 rounded-sm text-[10.5px] font-black uppercase tracking-wider border transition-colors duration-150 cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0 select-none ${
                isActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                  : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700 hover:border-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <Layers size={12} className={isActive ? "text-purple-400 dark:text-purple-600" : "text-slate-400"} />
              <span>{scene.tabLabel}</span>
              <span className={`text-[9px] px-1 py-0.2 rounded-sm font-bold ${
                isActive ? "bg-purple-600 text-white dark:bg-purple-200 dark:text-purple-900" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
              }`}>
                {scene.products.length} Items
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Main Interactive Lookbook Container: 2-Column (Scene Viewport + Bundle Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
        
        {/* Left Column: Interactive Scene Viewport with Hotspots */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-sm overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 group shadow-inner">
            
            {/* Background Lifestyle Image */}
            <AnimatePresence mode="wait">
              <motion.img
                key={activeScene.id}
                src={activeScene.bgImage}
                alt={activeScene.title}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full h-full object-cover object-center"
              />
            </AnimatePresence>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/40 pointer-events-none" />

            {/* Top Scene Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
              <span className="px-2.5 py-1 bg-slate-900/85 backdrop-blur-md border border-white/20 rounded-sm text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1.5 shadow-sm">
                <Flame size={12} className="text-amber-400 animate-pulse" />
                {activeScene.category}
              </span>
            </div>

            {/* Pulsing Hotspot Pins */}
            {activeScene.products.map((p, idx) => {
              const isSelected = (hoveredPinId || activePinId) === p.id;
              return (
                <div
                  key={p.id}
                  style={{ left: `${p.pinX}%`, top: `${p.pinY}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                  onMouseEnter={() => setHoveredPinId(p.id)}
                  onMouseLeave={() => setHoveredPinId(null)}
                  onClick={() => setActivePinId(p.id)}
                >
                  {/* Radar Pulse Effect */}
                  <div className="relative flex items-center justify-center">
                    <span className={`absolute inline-flex h-8 w-8 rounded-full opacity-75 animate-ping ${
                      isSelected ? "bg-purple-500" : "bg-white"
                    }`} />
                    <button
                      type="button"
                      aria-label={p.name}
                      className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-black text-[11px] shadow-lg transition-transform duration-200 ${
                        isSelected
                          ? "bg-purple-600 border-white text-white scale-125 shadow-purple-500/50 ring-4 ring-purple-500/30"
                          : "bg-white/95 dark:bg-slate-900/95 border-slate-900 dark:border-white text-slate-900 dark:text-white hover:scale-110"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  </div>

                  {/* Glassmorphic Mini-Hover Floating Tooltip */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 w-48 sm:w-56 p-2.5 bg-slate-950/90 dark:bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-sm text-white shadow-2xl z-30 pointer-events-auto text-left"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-sm border border-slate-700 shrink-0 bg-slate-800"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-black text-purple-400 uppercase tracking-wide block truncate">
                            {p.tag || p.category}
                          </span>
                          <h4 className="text-[11px] font-black text-white line-clamp-1 leading-tight">
                            {p.name}
                          </h4>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-[12px] font-black text-white">₹{p.price.toLocaleString("en-IN")}</span>
                            <span className="text-[9px] line-through text-slate-400">₹{p.originalPrice.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}

            {/* Bottom Title Bar Inside Scene */}
            <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-sm text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black text-white truncate">{activeScene.title}</h3>
                <p className="text-[11px] text-slate-300 font-medium line-clamp-1">{activeScene.subtitle}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black rounded-sm uppercase tracking-wider">
                  Save {activeScene.bundleDiscountPercent}% in Bundle
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Product Breakdown & Instant Bundle Purchase */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-sm p-3.5 sm:p-4">
          
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-700/80 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-sm bg-purple-600 text-white flex items-center justify-center font-black text-[10px]">
                  <ShoppingBag size={11} className="stroke-[2.5]" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Lookbook Items ({activeScene.products.length})
                </h4>
              </div>

              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                Customize Bundle
              </span>
            </div>

            {/* Product Item Rows */}
            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {activeScene.products.map((p, idx) => {
                const isChecked = !!currentSelection[p.id];
                const isHighlighted = (hoveredPinId || activePinId) === p.id;

                return (
                  <div
                    key={p.id}
                    onMouseEnter={() => setHoveredPinId(p.id)}
                    onMouseLeave={() => setHoveredPinId(null)}
                    onClick={() => setActivePinId(p.id)}
                    className={`p-2 rounded-sm border transition-all duration-150 flex items-center gap-2.5 cursor-pointer ${
                      isHighlighted
                        ? "bg-purple-50/70 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 shadow-2xs"
                        : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItemSelection(p.id);
                      }}
                      className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                        isChecked
                          ? "bg-purple-600 border-purple-600 text-white"
                          : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent"
                      }`}
                    >
                      <Check size={10} className="stroke-[3]" />
                    </button>

                    {/* Thumbnail */}
                    <div className="relative w-11 h-11 rounded-sm overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shrink-0">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 bg-slate-900/90 text-white font-black text-[8px] px-1 py-0.2 rounded-tl-sm">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Product Details */}
                    <div className="min-w-0 flex-1 text-left">
                      <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate">
                        {p.name}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          ₹{p.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] line-through text-slate-400">
                          ₹{p.originalPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                          {Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                    </div>

                    {/* Quick View Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onQuickView) {
                          onQuickView({
                            _id: p.id,
                            name: p.name,
                            price: p.price,
                            originalPrice: p.originalPrice,
                            images: [p.image],
                            category: p.category,
                            rating: p.rating,
                            description: `Curated item from the ${activeScene.title} collection. Engineered with premium materials and backed by official warranty.`,
                            stock: 25
                          });
                        }
                      }}
                      title="Quick View"
                      className="w-6 h-6 rounded-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 transition-colors"
                    >
                      <Eye size={12} className="stroke-[2.5]" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bundle Pricing Summary & 1-Click Buy Action */}
          <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold">
                Items Selected ({bundleSummary.count}/{activeScene.products.length})
              </span>
              <span className="font-black text-slate-800 dark:text-slate-200 line-through text-[11px]">
                ₹{bundleSummary.originalTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                  Bundle Price (Save ₹{bundleSummary.savings.toLocaleString("en-IN")})
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  ₹{bundleSummary.currentTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-black rounded-sm">
                SAVE {bundleSummary.discountPercent}%
              </span>
            </div>

            {/* Instant Add Entire Bundle Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddBundleToCart}
              disabled={bundleSummary.count === 0}
              className={`w-full py-2.5 px-3 rounded-sm font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer shadow-xs ${
                bundleSummary.count > 0
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-purple-700 dark:hover:bg-purple-200 hover:shadow-purple-500/20"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              }`}
            >
              <ShoppingBag size={14} className="stroke-[2.5]" />
              <span>Shop Complete Look ({bundleSummary.count} Items)</span>
            </motion.button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ShopTheLook;
