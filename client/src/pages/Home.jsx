import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { backendUrl } from "../config";
import { cachedGet } from "../utils/apiCache";

// Eagerly loaded modular components (critical above-the-fold content)
import HomeHero from "../components/Home/HomeHero";
import TopCategories from "../components/Home/TopCategories";
import QuickViewModal from "../components/Home/QuickViewModal";
import PremiumDealBanner from "../components/Home/PremiumDealBanner";

// Lazy loaded below-the-fold components to reduce main-thread script evaluation & layout blocking
const FlashDeals = React.lazy(() => import("../components/Home/FlashDeals"));
const TrendingProducts = React.lazy(() => import("../components/Home/TrendingProducts"));
const ShopByBrands = React.lazy(() => import("../components/Home/ShopByBrands"));
const RecommendedProducts = React.lazy(() => import("../components/Home/RecommendedProducts"));
const ShopByCollections = React.lazy(() => import("../components/Home/ShopByCollections"));
const DealOfTheDay = React.lazy(() => import("../components/Home/DealOfTheDay"));
const SellerSpotlight = React.lazy(() => import("../components/Home/SellerSpotlight"));
const AiRobotChat = React.lazy(() => import("../components/Home/AiRobotChat"));
const CustomerTestimonials = React.lazy(() => import("../components/Home/CustomerTestimonials"));
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
      { rootMargin: "350px 0px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: isVisible ? undefined : height }}>
      {isVisible ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeDeal, setActiveDeal] = useState(null);
  const [showDeal, setShowDeal] = useState(false);
  const [isCampaignActive, setIsCampaignActive] = useState(false);
  const [homepageData, setHomepageData] = useState({
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
    setLoading(true);
    const token = localStorage.getItem("token") || "";
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    cachedGet(`${backendUrl}/api/product/homepage`, { headers })
      .then(res => {
        if (res.data.success) {
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
    } catch (err) {}

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
    setAddingIds(prev => ({ ...prev, [product._id]: true }));

    if (!token) {
      guestCart[`${product._id}_${size}`] = qty || 1;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      window.dispatchEvent(new Event("cartUpdate"));
      toast.success("Added to cart! 🛍️");
      setAddingIds(prev => ({ ...prev, [product._id]: false }));
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
          setAddingIds(prev => ({ ...prev, [product._id]: false }));
          navigate("/cart");
        } else {
          toast.error(res.data.message || "Failed to add to cart");
          setAddingIds(prev => ({ ...prev, [product._id]: false }));
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error adding to cart");
        setAddingIds(prev => ({ ...prev, [product._id]: false }));
      }
    }
  };

  const displayDeal = useMemo(() => {
    if (isCampaignActive && activeDeal) return activeDeal;

    // Fallback: highest discount product from dealsOfDay
    const fallbackProduct = homepageData.dealsOfDay?.[0] || homepageData.bestSellers?.[0] || homepageData.newArrivals?.[0];
    if (!fallbackProduct) return null;

    const originalVal = fallbackProduct.originalPrice || Math.round(fallbackProduct.price * 1.25);
    const discountPercent = Math.max(5, Math.round(((originalVal - fallbackProduct.price) / originalVal) * 100));

    return {
      _id: "fallback_deal_of_the_day",
      productId: fallbackProduct,
      title: "Deal of the Day",
      subtitle: "Includes official brand warranty. Free express delivery within 24 hours.",
      discountLabel: `SAVE ${discountPercent}%`,
      startDate: new Date(),
      endDate: null, // Hide timer in fallback mode
      isActive: true,
      modelImage: fallbackProduct.images?.[0] || ""
    };
  }, [activeDeal, homepageData, isCampaignActive]);

  const handleShowDeal = () => {
    setShowDeal(true);
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-slate-950 min-h-screen text-[#0F172A] dark:text-slate-100 font-sans pb-16 antialiased text-left transition-colors duration-200">

      {/* Custom Keyframes & Styles */}
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

      {/* SECTION 1: PREMIUM HERO SECTION */}
      <HomeHero onShowDealOfDay={handleShowDeal} hasActiveDeal={!!displayDeal} />

      {/* REVEALED PREMIUM DEAL OF THE DAY SPOTLIGHT OVERLAY */}
      <AnimatePresence>
        {showDeal && displayDeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-center py-12 px-4 sm:px-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
            onClick={() => setShowDeal(false)}
          >
            {/* Click-stop container */}
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

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full px-4 sm:px-8 lg:px-12 pt-4 pb-2 select-none"
      >
        <TopCategories popularCategories={homepageData.popularCategories} />
      </motion.section>

      {/* BELOW-THE-FOLD SECTIONS (Lazy Loaded on Scroll for Minimal Main-Thread Execution Time) */}
      <LazySection height="320px">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full px-4 sm:px-8 lg:px-12 py-4 md:py-6 space-y-6 md:space-y-8 select-none"
        >
          <div>
            <ShopByBrands popularBrands={homepageData.popularBrands} />
          </div>

          <div>
            <RecommendedProducts
              recommended={homepageData.recommended}
              trending={homepageData.trending}
              topRated={homepageData.topRated}
              newArrivals={homepageData.newArrivals}
              onQuickView={setQuickViewProduct}
              onAddToCart={onAddToCart}
              onToggleFavorite={onToggleFavorite}
              wishlist={wishlist}
            />
          </div>
        </motion.section>
      </LazySection>

      <LazySection height="320px">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full px-4 sm:px-8 lg:px-12 py-2"
        >
          <FlashDeals
            deals={(() => {
              const seen = new Set();
              const combined = [];
              [...(homepageData.dealsOfDay || []), ...(homepageData.trending || [])].forEach(p => {
                if (p && p._id && !seen.has(p._id.toString())) {
                  seen.add(p._id.toString());
                  combined.push(p);
                }
              });
              return combined;
            })()}
            onQuickView={setQuickViewProduct}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            wishlist={wishlist}
          />

          <TrendingProducts
            bestSellers={homepageData.bestSellers}
            newArrivals={homepageData.newArrivals}
            mostViewed={homepageData.mostViewed}
            loading={loading}
            onQuickView={setQuickViewProduct}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            wishlist={wishlist}
          />
        </motion.section>
      </LazySection>

      <LazySection height="250px">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <ShopByCollections trendingCollections={homepageData.trendingCollections} />
        </motion.div>
      </LazySection>

      <LazySection height="350px">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full px-4 sm:px-8 lg:px-12 py-2 select-none"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            <DealOfTheDay 
              deals={homepageData.dealsOfDay} 
              activeDeal={activeDeal} 
              onAddToCart={onAddToCart} 
            />

            <SellerSpotlight />

            <AiRobotChat />
          </div>
        </motion.section>
      </LazySection>

      <LazySection height="250px">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <CustomerTestimonials />
        </motion.div>
      </LazySection>

      <LazySection height="180px">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <BenefitsStrip />
        </motion.div>
      </LazySection>

      {/* QUICK VIEW INTERACTIVE MODAL */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

export default Home;
