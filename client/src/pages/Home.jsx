import React, { useEffect, useState, useMemo, Suspense } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { backendUrl } from "../config";
import { cachedGet } from "../utils/apiCache";

// Import helper component for viewport-based lazy loading
import LazySection from "../components/LazySection";

// Eagerly loaded modular components (critical above-the-fold content)
import HomeHero from "../components/Home/HomeHero";
import TopCategories from "../components/Home/TopCategories";
import QuickViewModal from "../components/Home/QuickViewModal";
import PremiumDealBanner from "../components/Home/PremiumDealBanner";

// Lazy loaded modular components (below-the-fold content)
const FlashDeals = React.lazy(() => import("../components/Home/FlashDeals"));
const TrendingProducts = React.lazy(() => import("../components/Home/TrendingProducts"));
const ShopByBrands = React.lazy(() => import("../components/Home/ShopByBrands"));
const RecommendedProducts = React.lazy(() => import("../components/Home/RecommendedProducts"));
const ShopByCollections = React.lazy(() => import("../components/Home/ShopByCollections"));
const DealOfTheDay = React.lazy(() => import("../components/Home/DealOfTheDay"));
const SellerSpotlight = React.lazy(() => import("../components/Home/SellerSpotlight"));
const AiRobotChat = React.lazy(() => import("../components/Home/AiRobotChat"));
const CustomerTestimonials = React.lazy(() => import("../components/Home/CustomerTestimonials"));
const BenefitsStrip = React.lazy(() => import("../components/Home/BenefitsStrip"));

// Import shared skeletons from SkeletonLoader library
import {
  ProductGridSkeleton,
  BrandsSkeleton,
  CollectionsSkeleton,
  DealRowSkeleton,
  TestimonialSkeleton,
  BenefitsSkeleton
} from "../components/SkeletonLoader";

const Home = () => {
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

    // Fetch active deal of the day
    cachedGet(`${backendUrl}/api/dealofday`)
      .then(res => {
        if (res.data.success && res.data.deal) {
          setActiveDeal(res.data.deal);
        }
      })
      .catch((err) => {
        console.error("Error loading active Deal of the Day:", err);
      });
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

  const onAddToCart = async (product, qty = 1, size = "Standard") => {
    const token = localStorage.getItem("token") || "";
    if (product.stock === 0) return;

    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      const key = `${product._id}_${size}`;
      guestCart[key] = (guestCart[key] || 0) + qty;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      window.dispatchEvent(new Event("cartUpdate"));
      toast.success("Added to cart! 🛍️");
    } else {
      try {
        const res = await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId: product._id, size, qty },
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

      {/* SECTION 2: TOP CATEGORIES (SHOP POPULAR) - Eager Loaded */}
      <section className="w-full px-6 sm:px-12 lg:px-20 py-6 select-none">
        <TopCategories popularCategories={homepageData.popularCategories} />
      </section>


      {/* SECTION 4: FLASH DEALS + TRENDING PRODUCTS - Lazy Loaded */}
      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <LazySection placeholderHeight="600px">
          <section className="w-full px-6 sm:px-12 lg:px-20 py-6">
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
          </section>
        </LazySection>
      </Suspense>

      {/* SECTION 5: BRANDS + RECOMMENDATIONS - Lazy Loaded */}
      <Suspense fallback={<BrandsSkeleton />}>
        <LazySection placeholderHeight="500px">
          <section className="w-full px-6 sm:px-12 lg:px-20 py-12 md:py-16 space-y-16 md:space-y-24 select-none">
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
          </section>
        </LazySection>
      </Suspense>

      {/* SECTION 4: SHOP BY COLLECTIONS - Lazy Loaded */}
      <Suspense fallback={<CollectionsSkeleton />}>
        <LazySection placeholderHeight="400px">
          <ShopByCollections trendingCollections={homepageData.trendingCollections} />
        </LazySection>
      </Suspense>


      {/* SECTION 5: DEAL OF THE DAY + SELLER SPOTLIGHT + AI CHAT - Lazy Loaded */}
      <Suspense fallback={<DealRowSkeleton />}>
        <LazySection placeholderHeight="350px">
          <section className="w-full px-6 sm:px-12 lg:px-20 py-5 select-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
              <DealOfTheDay 
                deals={homepageData.dealsOfDay} 
                activeDeal={activeDeal} 
                onAddToCart={onAddToCart} 
              />

              <SellerSpotlight />

              <AiRobotChat />
            </div>
          </section>
        </LazySection>
      </Suspense>

      {/* SECTION 6: CUSTOMER TESTIMONIALS - Lazy Loaded */}
      <Suspense fallback={<TestimonialSkeleton />}>
        <LazySection placeholderHeight="220px">
          <CustomerTestimonials />
        </LazySection>
      </Suspense>

      {/* SECTION 3: BENEFITS STRIP - Lazy Loaded */}
      <Suspense fallback={<BenefitsSkeleton />}>
        <LazySection placeholderHeight="100px">
          <BenefitsStrip />
        </LazySection>
      </Suspense>

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
