import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { backendUrl } from "../config";
import { cachedGet, getSyncCachedData } from "../utils/apiCache";

// Critical above-the-fold components (Eagerly Loaded)
import HeroSplitBanner from "../components/Home/HeroSplitBanner";
import QuickViewModal from "../components/Home/QuickViewModal";
import PremiumDealBanner from "../components/Home/PremiumDealBanner";

// Lazy-loaded Home sections for optimal performance & fast initial load
const FlashDealsSection = React.lazy(() => import("../components/Home/FlashDealsSection"));
const FeaturedDealsCarousel = React.lazy(() => import("../components/Home/FeaturedDealsCarousel"));
const RecommendedCategories = React.lazy(() => import("../components/Home/RecommendedCategories"));
const ShopByBrands = React.lazy(() => import("../components/Home/ShopByBrands"));
const RecommendedProducts = React.lazy(() => import("../components/Home/RecommendedProducts"));
const TechAdBanner = React.lazy(() => import("../components/Home/TechAdBanner"));
const TrendingProducts = React.lazy(() => import("../components/Home/TrendingProducts"));
const ShopByCollections = React.lazy(() => import("../components/Home/ShopByCollections"));
const HistorySuggestions = React.lazy(() => import("../components/Home/HistorySuggestions"));
const BudgetStoreRadar = React.lazy(() => import("../components/Home/BudgetStoreRadar"));
const ProductDuel = React.lazy(() => import("../components/Home/ProductDuel"));
const DealOfTheDay = React.lazy(() => import("../components/Home/DealOfTheDay"));
const SellerSpotlight = React.lazy(() => import("../components/Home/SellerSpotlight"));
const AiRobotChat = React.lazy(() => import("../components/Home/AiRobotChat"));
const BenefitsStrip = React.lazy(() => import("../components/Home/BenefitsStrip"));

const LazySection = ({ children, height = "280px" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: `auto ${height}`
      }}
      className="w-full"
    >
      {isVisible ? (
        <Suspense fallback={<div style={{ height }} className="w-full" />}>
          {children}
        </Suspense>
      ) : (
        <div style={{ height }} className="w-full" />
      )}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();

  // Instant SWR state initialization from sessionStorage / memory cache
  const cachedInitial = useMemo(() => {
    const token = localStorage.getItem("token") || "";
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const cached = getSyncCachedData(`${backendUrl}/api/product/homepage`, { headers });
    return cached && cached.success ? cached : null;
  }, []);

  const [loading, setLoading] = useState(!cachedInitial);
  const [wishlist, setWishlist] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeDeal, setActiveDeal] = useState(() => cachedInitial?.activeDeal || null);
  const [showDeal, setShowDeal] = useState(false);
  const [isCampaignActive, setIsCampaignActive] = useState(false);
  const [homepageData, setHomepageData] = useState(() => cachedInitial || {
    newArrivals: [],
    trending: [],
    bestSellers: [],
    mostViewed: [],
    mostWishlisted: [],
    topRated: [],
    recentlyViewed: [],
    recommended: [],
    dealsOfDay: [],
    popularBrands: [],
    trendingCollections: [],
    popularCategories: [],
    searchSuggestions: []
  });

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    if (!cachedInitial) {
      setLoading(true);
    }

    cachedGet(`${backendUrl}/api/product/homepage`, { headers })
      .then((res) => {
        if (res?.data?.success) {
          setHomepageData(res.data);
          if (res.data.activeDeal) {
            setActiveDeal(res.data.activeDeal);
          } else {
            setActiveDeal(null);
          }
        }
      })
      .catch((err) => {
        console.error("Error loading homepage data:", err);
      })
      .finally(() => setLoading(false));

    // Load wishlist
    try {
      const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlist(saved);
    } catch (e) { }
  }, []);

  useEffect(() => {
    if (!activeDeal || !activeDeal.isActive) {
      setIsCampaignActive(false);
      return;
    }

    let startTimeout = null;
    let endTimeout = null;

    const checkActivity = () => {
      const now = Date.now();
      const startTime = new Date(activeDeal.startDate).getTime();
      const endTime = new Date(activeDeal.endDate).getTime();

      const isActiveNow = startTime <= now && endTime >= now;
      setIsCampaignActive(isActiveNow);

      if (isActiveNow) {
        const timeToExpiry = endTime - now;
        if (timeToExpiry > 0) {
          endTimeout = setTimeout(() => {
            setIsCampaignActive(false);
            setShowDeal(false); // Hide spotlight banner on expiry
          }, timeToExpiry);
        }
      } else if (startTime > now) {
        const timeToStart = startTime - now;
        if (timeToStart > 0) {
          startTimeout = setTimeout(() => {
            checkActivity();
          }, timeToStart);
        }
      } else {
        setIsCampaignActive(false);
        setShowDeal(false);
      }
    };

    checkActivity();

    return () => {
      if (startTimeout) clearTimeout(startTimeout);
      if (endTimeout) clearTimeout(endTimeout);
    };
  }, [activeDeal]);

  const onToggleFavorite = async (id) => {
    const token = localStorage.getItem("token") || "";
    if (token) {
      try {
        const res = await axios.post(
          `${backendUrl}/api/wishlist/toggle`,
          { productId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          const updated = res.data.wishlist || [];
          setWishlist(updated);
          localStorage.setItem("wishlist", JSON.stringify(updated));
          toast.success("Wishlist updated! ❤️");
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      let updated = [...wishlist];
      const idx = updated.indexOf(id);
      if (idx === -1) {
        updated.push(id);
        toast.success("Added to wishlist! ❤️");
      } else {
        updated.splice(idx, 1);
        toast.success("Removed from wishlist");
      }
      setWishlist(updated);
      localStorage.setItem("wishlist", JSON.stringify(updated));
    }
  };

  const [addingIds, setAddingIds] = useState({});

  const onAddToCart = async (product, qty = 1, size = "Standard") => {
    if (!product || addingIds[product._id]) return;
    const token = localStorage.getItem("token") || "";
    if (product.stock === 0) return;

    let guestCart = {};
    try {
      guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
    } catch (err) { }

    // Only check guest localStorage if user is not logged in
    if (!token) {
      const keyPrefix = `${product._id}_`;
      let alreadyInCart = false;
      for (const k in guestCart) {
        if ((k === `${product._id}_${size}` || k.startsWith(keyPrefix)) && guestCart[k] > 0) {
          alreadyInCart = true;
          break;
        }
      }

      if (alreadyInCart) {
        toast.info("Product is already in your cart");
        navigate("/cart");
        return;
      }
    }

    // Lock button & set loading state
    setAddingIds((prev) => ({ ...prev, [product._id]: true }));

    if (!token) {
      guestCart[`${product._id}_${size}`] = qty || 1;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      window.dispatchEvent(new Event("cartUpdate"));
      toast.success("Added to cart! 🛍️");
      setAddingIds((prev) => ({ ...prev, [product._id]: false }));
      navigate("/cart");
    } else {
      try {
        const res = await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId: product._id, size, qty: qty || 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          window.dispatchEvent(new Event("cartUpdate"));
          toast.success("Added to cart! 🛍️");
          setAddingIds((prev) => ({ ...prev, [product._id]: false }));
          navigate("/cart");
        } else {
          toast.error(res.data.message || "Failed to add to cart");
          setAddingIds((prev) => ({ ...prev, [product._id]: false }));
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error adding to cart");
        setAddingIds((prev) => ({ ...prev, [product._id]: false }));
      }
    }
  };

  const displayDeal = useMemo(() => {
    if (isCampaignActive && activeDeal) return activeDeal;

    // Fallback: highest discount product from dealsOfDay
    const fallbackProduct =
      homepageData.dealsOfDay?.[0] ||
      homepageData.bestSellers?.[0] ||
      homepageData.newArrivals?.[0];
    if (!fallbackProduct) return null;

    const originalVal =
      fallbackProduct.originalPrice || Math.round(fallbackProduct.price * 1.25);
    const discountPercent = Math.max(
      5,
      Math.round(((originalVal - fallbackProduct.price) / originalVal) * 100)
    );

    return {
      _id: "fallback_deal_of_the_day",
      productId: fallbackProduct,
      title: "Deal of the Day",
      subtitle: "Includes official brand warranty. Free express delivery within 24 hours.",
      discountLabel: `SAVE ${discountPercent}%`,
      startDate: new Date(),
      endDate: null,
      isActive: true,
      modelImage: fallbackProduct.images?.[0] || ""
    };
  }, [activeDeal, homepageData, isCampaignActive]);

  return (
    <div className="bg-[#F8FAFC] dark:bg-slate-950 min-h-screen text-[#0F172A] dark:text-slate-100 font-sans pb-16 antialiased text-left transition-colors duration-200">
      {/* Custom Keyframes */}
      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(12px) rotate(-1.5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-1 { animation: float-gentle 6s ease-in-out infinite; }
        .animate-float-2 { animation: float-reverse 7s ease-in-out infinite; }
        .animate-float-3 { animation: float-gentle 5s ease-in-out infinite 1.2s; }
        .animate-float-slow { animation: float-slow 4.5s ease-in-out infinite; }
      `}</style>

      {/* 1. SPLIT HERO BANNER (Campaign Models on Left + 2x2 Bazaar Deals on Right) */}
      <HeroSplitBanner homepageData={homepageData} />

      {/* 2. DYNAMIC TECH / PROMOTIONAL AD BANNER (Directly Below Hero Section) */}
      <LazySection height="360px">
        <TechAdBanner />
      </LazySection>

      {/* REVEALED PREMIUM DEAL SPOTLIGHT OVERLAY */}
      <AnimatePresence>
        {showDeal && displayDeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-center py-12 px-4 sm:px-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
            onClick={() => setShowDeal(false)}
          >
            <div
              className="relative w-full max-w-5xl my-auto select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <PremiumDealBanner
                deal={displayDeal}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
                wishlist={wishlist}
                onClose={() => setShowDeal(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. FEATURED DEALS CAROUSEL (Daily Spotlight & Interactive Angles) */}
      <LazySection height="520px">
        <FeaturedDealsCarousel />
      </LazySection>

      {/* 4. FLASH DEALS 3x3 MATRIX SECTION */}
      <LazySection height="480px">
        <FlashDealsSection homepageData={homepageData} />
      </LazySection>

      {/* 5. RECENTLY VIEWED & SMART HISTORY SUGGESTIONS (Pick Up Where You Left Off) */}
      <LazySection height="420px">
        <HistorySuggestions
          fallbackProducts={homepageData.recommended || []}
          onQuickView={setQuickViewProduct}
        />
      </LazySection>

      {/* 6. RECOMMENDED CATEGORIES 4-QUADRANT MATRICES */}
      <LazySection height="480px">
        <RecommendedCategories homepageData={homepageData} />
      </LazySection>

      {/* 7. POPULAR BRANDS */}
      <LazySection height="400px">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full px-2 sm:px-4 lg:px-6 py-0.5 sm:py-1 select-none"
        >
          <ShopByBrands popularBrands={homepageData.popularBrands} />
        </motion.section>
      </LazySection>

      {/* 8. UNIFIED DISCOVERY & RECOMMENDATION SHOWCASE */}
      <LazySection height="480px">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full px-2 sm:px-4 lg:px-6 py-0.5 sm:py-1 select-none"
        >
          <RecommendedProducts
            recommended={homepageData.recommended}
            trending={homepageData.trending}
            bestSellers={homepageData.bestSellers}
            topRated={homepageData.topRated}
            newArrivals={homepageData.newArrivals}
            mostViewed={homepageData.mostViewed}
            dealsOfDay={homepageData.dealsOfDay}
            mostWishlisted={homepageData.mostWishlisted}
            loading={loading}
            onQuickView={setQuickViewProduct}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            wishlist={wishlist}
          />
        </motion.section>
      </LazySection>

      {/* 9. CURATED THEME COLLECTIONS */}
      <LazySection height="480px">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full px-2 sm:px-4 lg:px-6 py-0.5 sm:py-1 select-none"
        >
          <ShopByCollections trendingCollections={homepageData.trendingCollections} />
        </motion.section>
      </LazySection>

      {/* 10. BUDGET STORE & PRICE DROP RADAR */}
      <LazySection height="460px">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full px-2 sm:px-4 lg:px-6 py-0.5 sm:py-1 select-none"
        >
          <BudgetStoreRadar
            homepageData={homepageData}
            onQuickView={setQuickViewProduct}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            wishlist={wishlist}
          />
        </motion.section>
      </LazySection>

      {/* 11. "THIS OR THAT?" COMMUNITY PRODUCT DUELS */}
      <LazySection height="520px">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full px-2 sm:px-4 lg:px-6 py-0.5 sm:py-1 select-none"
        >
          <ProductDuel
            homepageData={homepageData}
            onQuickView={setQuickViewProduct}
            onAddToCart={onAddToCart}
          />
        </motion.section>
      </LazySection>

      {/* 12. 3-COLUMN FEATURE HUB (Deal of Day, Seller Spotlight, AI Robot Chat) - BOTTOM PLACEMENT */}
      <LazySection height="540px">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full px-2 sm:px-4 lg:px-6 py-0.5 sm:py-1 select-none text-left"
        >
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-3.5 sm:p-4.5 lg:p-5 shadow-xs transition-colors duration-200">
            {/* Section Top Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 rounded-sm text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 shadow-2xs">
                    <span>DAILY HIGHLIGHTS</span>
                  </div>

                  <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                    3-in-1 Feature Hub
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Deals, Spotlight & AI Assistant</span>
                  <span className="h-1.5 w-1.5 rounded-sm bg-amber-500 dark:bg-amber-400 animate-pulse" />
                </h2>

                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Blockbuster deal of the day, verified top seller spotlight, and smart 24/7 AI shopping assistant.
                </p>
              </div>
            </div>

            {/* 3-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-4.5 text-left items-stretch">
              <DealOfTheDay
                deals={homepageData.dealsOfDay}
                activeDeal={activeDeal}
                onAddToCart={onAddToCart}
              />
              <SellerSpotlight />
              <AiRobotChat />
            </div>
          </div>
        </motion.section>
      </LazySection>

      {/* 13. BRAND BENEFITS & TRUST GUARANTEES */}
      <LazySection height="180px">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <BenefitsStrip />
        </motion.div>
      </LazySection>

      {/* 16. QUICK VIEW INTERACTIVE MODAL */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

export default Home;
