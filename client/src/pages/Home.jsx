import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";

// Import modular sub-components
import HomeHero from "../components/Home/HomeHero";
import FlashDeals from "../components/Home/FlashDeals";
import TrendingProducts from "../components/Home/TrendingProducts";
import TopCategories from "../components/Home/TopCategories";
import RecommendedProducts from "../components/Home/RecommendedProducts";
import DealOfTheDay from "../components/Home/DealOfTheDay";
import SellerSpotlight from "../components/Home/SellerSpotlight";
import AiRobotChat from "../components/Home/AiRobotChat";
import CustomerTestimonials from "../components/Home/CustomerTestimonials";
import QuickViewModal from "../components/Home/QuickViewModal";
import ShopByCollections from "../components/Home/ShopByCollections";
import ShopByBrands from "../components/Home/ShopByBrands";
import NewsletterCTA from "../components/Home/NewsletterCTA";
import BenefitsStrip from "../components/Home/BenefitsStrip";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
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

    axios.get(`${backendUrl}/api/product/homepage`, { headers })
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
  }, []);

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
      <HomeHero />

      {/* SECTION 2: FLASH DEALS + TRENDING PRODUCTS (FULL WIDTH) */}
      <section className="w-full px-6 sm:px-12 lg:px-20 py-6">
        <FlashDeals
          deals={homepageData.dealsOfDay}
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

      {/* SECTION 3: CATEGORIES + BRANDS + RECOMMENDATIONS */}
      <section className="w-full px-6 sm:px-12 lg:px-20 py-4 select-none">
        <div className="mb-8">
          <TopCategories popularCategories={homepageData.popularCategories} />
        </div>

        <div className="mb-10">
          <ShopByBrands popularBrands={homepageData.popularBrands} />
        </div>

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
      </section>

      {/* SECTION 4: SHOP BY COLLECTIONS */}
      <ShopByCollections trendingCollections={homepageData.trendingCollections} />


      {/* SECTION 5: DEAL OF THE DAY + SELLER SPOTLIGHT + AI CHAT */}
      <section className="w-full px-6 sm:px-12 lg:px-20 py-5 select-none">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          <DealOfTheDay deals={homepageData.dealsOfDay} onAddToCart={onAddToCart} />

          <SellerSpotlight />

          <AiRobotChat />
        </div>
      </section>

      {/* SECTION 6: CUSTOMER TESTIMONIALS */}
      <CustomerTestimonials />

      {/* SECTION 7: BENEFITS STRIP */}
      <BenefitsStrip />

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
