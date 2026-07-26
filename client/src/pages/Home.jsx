import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { backendUrl } from "../config";
import { cachedGet } from "../utils/apiCache";

// Eagerly loaded modular components (critical above-the-fold content)
import HomeHero from "../components/Home/HomeHero";
import TopCategories from "../components/Home/TopCategories";
import QuickViewModal from "../components/Home/QuickViewModal";
import PremiumDealBanner from "../components/Home/PremiumDealBanner";

// Eagerly loaded modular components (below-the-fold content)
import FlashDeals from "../components/Home/FlashDeals";
import TrendingProducts from "../components/Home/TrendingProducts";
import ShopByBrands from "../components/Home/ShopByBrands";
import RecommendedProducts from "../components/Home/RecommendedProducts";
import ShopByCollections from "../components/Home/ShopByCollections";
import DealOfTheDay from "../components/Home/DealOfTheDay";
import SellerSpotlight from "../components/Home/SellerSpotlight";
import AiRobotChat from "../components/Home/AiRobotChat";
import CustomerTestimonials from "../components/Home/CustomerTestimonials";
import BenefitsStrip from "../components/Home/BenefitsStrip";

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

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full px-6 sm:px-12 lg:px-20 pt-4 pb-2 select-none will-change-[transform,opacity] transform-gpu"
      >
        <TopCategories popularCategories={homepageData.popularCategories} />
      </motion.section>

      {/* SECTION 5: BRANDS + RECOMMENDATIONS - Eager Loaded */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full px-6 sm:px-12 lg:px-20 py-4 md:py-6 space-y-6 md:space-y-8 select-none will-change-[transform,opacity] transform-gpu"
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


      {/* SECTION 4: FLASH DEALS + TRENDING PRODUCTS - Eager Loaded */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full px-6 sm:px-12 lg:px-20 py-2 will-change-[transform,opacity] transform-gpu"
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

      

      {/* SECTION 4: SHOP BY COLLECTIONS - Eager Loaded */}
      <motion.div
        className="will-change-[transform,opacity] transform-gpu"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <ShopByCollections trendingCollections={homepageData.trendingCollections} />
      </motion.div>


      {/* SECTION 5: DEAL OF THE DAY + SELLER SPOTLIGHT + AI CHAT - Eager Loaded */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full px-6 sm:px-12 lg:px-20 py-2 select-none will-change-[transform,opacity] transform-gpu"
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

      {/* SECTION 6: CUSTOMER TESTIMONIALS - Eager Loaded */}
      <motion.div
        className="will-change-[transform,opacity] transform-gpu"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <CustomerTestimonials />
      </motion.div>

      {/* SECTION 3: BENEFITS STRIP - Eager Loaded */}
      <motion.div
        className="will-change-[transform,opacity] transform-gpu"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <BenefitsStrip />
      </motion.div>

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
