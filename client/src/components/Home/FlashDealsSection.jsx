import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowRight, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { backendUrl } from "../../config";
import { cachedGet } from "../../utils/apiCache";
import { getOptimizedImageUrl } from "../../utils/imageOptimizer";
import { getDailyRotatedItems, getTimeUntilMidnight } from "../../utils/dailyRotation";

// Fallback Asset Imagery
import dealLaptop from "../../assets/new_home/deal_laptop.webp";
import dealEarbuds from "../../assets/new_home/deal_earbuds.webp";
import dealSmartwatch from "../../assets/new_home/deal_smartwatch.webp";
import dealShoes from "../../assets/new_home/deal_shoes.webp";
import dealPerfume from "../../assets/new_home/deal_perfume.webp";
import dealBackpack from "../../assets/new_home/deal_backpack.webp";

import catMobiles from "../../assets/new_home/cat_mobiles.webp";
import promoElectronics from "../../assets/new_home/promo_electronics.webp";
import catElectronics from "../../assets/cat_electronics.webp";
import brandElectronics from "../../assets/brand_asset_electronics_new.webp";
import catBagsNew from "../../assets/cat_bags_new.webp";

import catWomens from "../../assets/cat_womens_new.webp";
import catBlackHoodie from "../../assets/new_home/cat_black_hoodie.webp";
import brandSneakers from "../../assets/brand_asset_sneakers.webp";
import catFootwear from "../../assets/new_home/promo_footwear.webp";
import catJewelry from "../../assets/cat_jewelry.webp";
import catHeadwear from "../../assets/cat_headwear_new.webp";
import catAccessories from "../../assets/cat_accessories_new.webp";
import catSports from "../../assets/brand_asset_sportswear.webp";

import promoBeauty from "../../assets/new_home/promo_beauty.webp";
import catBeauty from "../../assets/cat_beauty.webp";
import brandBeauty from "../../assets/brand_asset_beauty.webp";
import promoHome from "../../assets/new_home/promo_home.webp";
import catKids from "../../assets/brand_asset_kids.webp";
import brandGroceries from "../../assets/brand_asset_groceries.webp";
import brandBooks from "../../assets/brand_asset_books.webp";
import brandAccessories from "../../assets/brand_asset_accessories.webp";

// Curated fallback deal collections with exactly 9 items (3x3 matrix) per box
const FALLBACK_DEAL_COLLECTIONS = [
  {
    id: "tech_deals",
    title: "Mega Electronics & Tech Deals",
    tag: "Up to 70% Off",
    link: "/product?category=Electronics",
    cta: "Explore Tech Deals",
    categoryRegex: /electronics|computer|laptop|gadget|mobile|gaming|audio|phone/i,
    items: [
      { id: "fb-t-1", title: "Lenovo IdeaPad 1 Laptop", discount: "47% off", price: "₹34,990", originalPrice: "₹65,990", image: dealLaptop, fallbackImage: dealLaptop, link: "/product?category=Electronics" },
      { id: "fb-t-2", title: "boAt Airdopes 141", discount: "62% off", price: "₹1,499", originalPrice: "₹3,999", image: dealEarbuds, fallbackImage: dealEarbuds, link: "/product?category=Electronics" },
      { id: "fb-t-3", title: "Noise Pulse Go Watch", discount: "55% off", price: "₹1,799", originalPrice: "₹3,999", image: dealSmartwatch, fallbackImage: dealSmartwatch, link: "/product?category=Electronics" },
      { id: "fb-t-4", title: "OnePlus 12 5G Phone", discount: "38% off", price: "₹54,999", originalPrice: "₹89,999", image: catMobiles, fallbackImage: catMobiles, link: "/product?category=Electronics" },
      { id: "fb-t-5", title: "Sony PS5 Controller", discount: "32% off", price: "₹4,499", originalPrice: "₹6,599", image: promoElectronics, fallbackImage: promoElectronics, link: "/product?category=Electronics" },
      { id: "fb-t-6", title: "JBL Flip 6 Speaker", discount: "40% off", price: "₹8,999", originalPrice: "₹14,999", image: catElectronics, fallbackImage: catElectronics, link: "/product?category=Electronics" },
      { id: "fb-t-7", title: "Apple iPad 10th Gen", discount: "28% off", price: "₹32,999", originalPrice: "₹44,999", image: brandElectronics, fallbackImage: brandElectronics, link: "/product?category=Electronics" },
      { id: "fb-t-8", title: "Safari 30L Tech Bag", discount: "50% off", price: "₹1,299", originalPrice: "₹2,599", image: dealBackpack, fallbackImage: dealBackpack, link: "/product?category=Electronics" },
      { id: "fb-t-9", title: "Tourister Luggage", discount: "45% off", price: "₹3,499", originalPrice: "₹6,499", image: catBagsNew, fallbackImage: catBagsNew, link: "/product?category=Electronics" }
    ]
  },
  {
    id: "fashion_deals",
    title: "Trending Fashion & Footwear",
    tag: "Min. 40% Off",
    link: "/product?category=Fashion",
    cta: "Shop Fashion Deals",
    categoryRegex: /fashion|men|women|clothing|apparel|shoe|footwear|accessories|jewellery|hoodie/i,
    items: [
      { id: "fb-f-1", title: "Campus Running Shoes", discount: "40% off", price: "₹2,399", originalPrice: "₹3,999", image: dealShoes, fallbackImage: dealShoes, link: "/product?category=Fashion" },
      { id: "fb-f-2", title: "Puma RS-X Sneakers", discount: "52% off", price: "₹3,799", originalPrice: "₹7,999", image: brandSneakers, fallbackImage: brandSneakers, link: "/product?category=Fashion" },
      { id: "fb-f-3", title: "Nike Club Hoodie", discount: "45% off", price: "₹2,199", originalPrice: "₹3,999", image: catBlackHoodie, fallbackImage: catBlackHoodie, link: "/product?category=Fashion" },
      { id: "fb-f-4", title: "Oversized Street Tee", discount: "60% off", price: "₹799", originalPrice: "₹1,999", image: catFootwear, fallbackImage: catFootwear, link: "/product?category=Fashion" },
      { id: "fb-f-5", title: "Floral Midi Dress", discount: "48% off", price: "₹1,699", originalPrice: "₹3,299", image: catWomens, fallbackImage: catWomens, link: "/product?category=Fashion" },
      { id: "fb-f-6", title: "Elegant Leather Bag", discount: "55% off", price: "₹1,999", originalPrice: "₹4,499", image: catBagsNew, fallbackImage: catBagsNew, link: "/product?category=Fashion" },
      { id: "fb-f-7", title: "Classic Chrono Watch", discount: "50% off", price: "₹2,499", originalPrice: "₹4,999", image: dealSmartwatch, fallbackImage: dealSmartwatch, link: "/product?category=Fashion" },
      { id: "fb-f-8", title: "Heart Pendant Gold", discount: "35% off", price: "₹1,299", originalPrice: "₹1,999", image: catJewelry, fallbackImage: catJewelry, link: "/product?category=Fashion" },
      { id: "fb-f-9", title: "Casual Cotton Cap", discount: "42% off", price: "₹499", originalPrice: "₹899", image: catHeadwear, fallbackImage: catHeadwear, link: "/product?category=Fashion" }
    ]
  },
  {
    id: "beauty_deals",
    title: "Beauty, Home & Essentials",
    tag: "Flat 50% Off",
    link: "/product?category=Beauty",
    cta: "Shop Essentials",
    categoryRegex: /beauty|home|kitchen|furniture|grocery|groceries|book/i,
    items: [
      { id: "fb-b-1", title: "Bella Vita Perfume", discount: "58% off", price: "₹599", originalPrice: "₹1,399", image: dealPerfume, fallbackImage: dealPerfume, link: "/product?category=Beauty" },
      { id: "fb-b-2", title: "Mamaearth Face Care", discount: "40% off", price: "₹499", originalPrice: "₹849", image: promoBeauty, fallbackImage: promoBeauty, link: "/product?category=Beauty" },
      { id: "fb-b-3", title: "Minimalist Serum", discount: "30% off", price: "₹549", originalPrice: "₹799", image: catBeauty, fallbackImage: catBeauty, link: "/product?category=Beauty" },
      { id: "fb-b-4", title: "Ceramic Vase & Planter", discount: "50% off", price: "₹899", originalPrice: "₹1,799", image: promoHome, fallbackImage: promoHome, link: "/product?category=Home%20%26%20Kitchen" },
      { id: "fb-b-5", title: "Philips Digital Air Fryer", discount: "45% off", price: "₹5,499", originalPrice: "₹9,999", image: catElectronics, fallbackImage: catElectronics, link: "/product?category=Home%20%26%20Kitchen" },
      { id: "fb-b-6", title: "Organic Cotton Kids Set", discount: "55% off", price: "₹799", originalPrice: "₹1,799", image: catKids, fallbackImage: catKids, link: "/product?category=Beauty" },
      { id: "fb-b-7", title: "Dry Fruits Nut Pack 1kg", discount: "42% off", price: "₹1,199", originalPrice: "₹2,099", image: brandGroceries, fallbackImage: brandGroceries, link: "/product?category=Groceries" },
      { id: "fb-b-8", title: "Atomic Habits Hardcover", discount: "35% off", price: "₹499", originalPrice: "₹799", image: brandBooks, fallbackImage: brandBooks, link: "/product?category=Books" },
      { id: "fb-b-9", title: "Genuine Leather Belt", discount: "50% off", price: "₹699", originalPrice: "₹1,399", image: brandAccessories, fallbackImage: brandAccessories, link: "/product?category=Beauty" }
    ]
  },
  {
    id: "sports_deals",
    title: "Sports, Fitness & Outdoor",
    tag: "Special Offers",
    link: "/product?category=Sports",
    cta: "Explore Sports Deals",
    categoryRegex: /sport|fitness|gym|outdoor/i,
    items: [
      { id: "fb-s-1", title: "Dry-Fit Gym Tee", discount: "50% off", price: "₹999", originalPrice: "₹2,299", image: catSports, fallbackImage: catSports, link: "/product?category=Sports" },
      { id: "fb-s-2", title: "Puma Flyer Trainers", discount: "45% off", price: "₹1,999", originalPrice: "₹3,599", image: dealShoes, fallbackImage: dealShoes, link: "/product?category=Sports" },
      { id: "fb-s-3", title: "Nike Air Max Excee", discount: "40% off", price: "₹4,799", originalPrice: "₹7,999", image: brandSneakers, fallbackImage: brandSneakers, link: "/product?category=Sports" },
      { id: "fb-s-4", title: "Garmin Smart Watch", discount: "30% off", price: "₹14,990", originalPrice: "₹20,990", image: dealSmartwatch, fallbackImage: dealSmartwatch, link: "/product?category=Sports" },
      { id: "fb-s-5", title: "Sony WF-C500 Earbuds", discount: "50% off", price: "₹4,499", originalPrice: "₹8,990", image: dealEarbuds, fallbackImage: dealEarbuds, link: "/product?category=Sports" },
      { id: "fb-s-6", title: "Wildcraft 45L Pack", discount: "48% off", price: "₹2,199", originalPrice: "₹4,199", image: catBagsNew, fallbackImage: catBagsNew, link: "/product?category=Sports" },
      { id: "fb-s-7", title: "Decathlon Gym Duffle", discount: "40% off", price: "₹899", originalPrice: "₹1,499", image: dealBackpack, fallbackImage: dealBackpack, link: "/product?category=Sports" },
      { id: "fb-s-8", title: "Nike Dri-FIT Aerobill", discount: "25% off", price: "₹899", originalPrice: "₹1,199", image: catHeadwear, fallbackImage: catHeadwear, link: "/product?category=Sports" },
      { id: "fb-s-9", title: "Davidoff Cool Water", discount: "35% off", price: "₹3,599", originalPrice: "₹5,500", image: dealPerfume, fallbackImage: dealPerfume, link: "/product?category=Sports" }
    ]
  }
];

// Helper to format real image URL safely
const resolveProductImage = (img, fallback) => {
  if (!img) return fallback;
  const rawUrl = img.startsWith("http") ? img : `${backendUrl}/${img.replace(/^\//, "")}`;
  return getOptimizedImageUrl(rawUrl, { width: 300, quality: 80 }) || fallback;
};

const FlashDealsSection = ({ homepageData }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [dbProducts, setDbProducts] = useState([]);

  // Live ticking countdown timer synchronized to midnight daily rotation reset
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight);

  // Fetch real products from the database
  useEffect(() => {
    let isMounted = true;

    // Use products from homepageData if present
    if (homepageData) {
      const combined = [
        ...(homepageData.dealsOfDay || []),
        ...(homepageData.newArrivals || []),
        ...(homepageData.trending || []),
        ...(homepageData.bestSellers || []),
        ...(homepageData.topRated || []),
        ...(homepageData.mostViewed || [])
      ];
      if (combined.length > 0) {
        setDbProducts(combined);
      }
    }

    // Always fetch full database catalogue for complete 3x3 category matrices
    cachedGet(`${backendUrl}/api/product/list?limit=250`)
      .then((res) => {
        if (isMounted && res?.data?.success && Array.isArray(res.data.products) && res.data.products.length > 0) {
          setDbProducts(res.data.products);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch database products for flash deals:", err?.message);
      });

    return () => {
      isMounted = false;
    };
  }, [homepageData]);

  // Construct the 4 collections with 4 real products in each 2x2 matrix (rotated daily)
  const collections = useMemo(() => {
    if (!dbProducts || dbProducts.length === 0) {
      return FALLBACK_DEAL_COLLECTIONS.map((colGroup) => ({
        ...colGroup,
        items: getDailyRotatedItems(colGroup.items, colGroup.id).slice(0, 4)
      }));
    }

    return FALLBACK_DEAL_COLLECTIONS.map((colGroup) => {
      // Filter real DB products matching this category regex
      const matchingProducts = dbProducts.filter((p) => {
        const catStr = `${p.category || ""} ${p.subCategory || ""} ${p.name || ""}`;
        return colGroup.categoryRegex.test(catStr);
      });

      // Deterministically rotate DB products for this collection by calendar day
      const rotatedProducts = getDailyRotatedItems(matchingProducts, colGroup.id);

      // Format real DB items
      const realItems = rotatedProducts.map((p, idx) => {
        const priceNum = Number(p.price) || 999;
        const origNum =
          p.originalPrice && Number(p.originalPrice) > priceNum
            ? Number(p.originalPrice)
            : Math.round(priceNum * (1.25 + ((idx * 5) % 25) / 100));

        const discountPct = Math.max(10, Math.round(((origNum - priceNum) / origNum) * 100));
        const rawImg = p.images?.[0] || p.media?.[0]?.url || "";
        const fallback = colGroup.items[idx % colGroup.items.length]?.fallbackImage || dealLaptop;

        return {
          id: p._id,
          title: p.name,
          discount: `${discountPct}% off`,
          price: `₹${priceNum.toLocaleString("en-IN")}`,
          originalPrice: `₹${origNum.toLocaleString("en-IN")}`,
          image: resolveProductImage(rawImg, fallback),
          fallbackImage: fallback,
          link: `/product/${p._id}`,
          isRealDbProduct: true
        };
      });

      // Take top 4 real items, and pad with daily-rotated fallbacks if fewer than 4
      const finalItems = [];
      const usedIds = new Set();

      for (const item of realItems) {
        if (!usedIds.has(item.id) && finalItems.length < 4) {
          usedIds.add(item.id);
          finalItems.push(item);
        }
      }

      const rotatedFallbacks = getDailyRotatedItems(colGroup.items, `${colGroup.id}_fallback`);
      let padIdx = 0;
      while (finalItems.length < 4 && padIdx < rotatedFallbacks.length) {
        const fallbackItem = rotatedFallbacks[padIdx];
        if (!usedIds.has(fallbackItem.id)) {
          finalItems.push(fallbackItem);
          usedIds.add(fallbackItem.id);
        }
        padIdx++;
      }

      return {
        ...colGroup,
        items: finalItems
      };
    });
  }, [dbProducts]);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [collections]);

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigits = (val) => String(val).padStart(2, "0");

  return (
    <section className="w-full px-2 sm:px-4 lg:px-6 py-0.5 sm:py-1 select-none text-left">
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-3.5 sm:p-4.5 lg:p-5 shadow-xs transition-shadow duration-300">
        {/* Section Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-800/60 rounded-sm text-[9px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 shadow-2xs">
                <Zap size={11} className="stroke-[2.5]" />
                <span>FLASH DEALS</span>
              </div>

              {/* Countdown timer pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold shadow-2xs">
                <span className="text-slate-500 dark:text-slate-400">Ends in</span>
                <div className="flex items-center gap-0.5 font-mono font-black text-rose-600 dark:text-rose-400">
                  <span>{formatDigits(timeLeft.hours)}</span>
                  <span>:</span>
                  <span>{formatDigits(timeLeft.minutes)}</span>
                  <span>:</span>
                  <span>{formatDigits(timeLeft.seconds)}</span>
                </div>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Deals For You</span>
              <span className="h-1.5 w-1.5 rounded-sm bg-rose-600 dark:bg-rose-400 animate-pulse" />
            </h2>

            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Unbeatable limited-time discounts and curated flash bundles across top categories.
            </p>
          </div>

          {/* Top Right Action & Navigation */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              onClick={() => navigate("/discover")}
              className="px-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-800 dark:text-slate-200 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 shadow-2xs"
            >
              <span>All Deals</span>
              <ArrowRight size={12} className="stroke-[2.5]" />
            </button>

            {/* Slider Navigation Chevrons */}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                aria-label="Previous deals"
                className="w-8 h-8 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft size={15} className="stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                aria-label="Next deals"
                className="w-8 h-8 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight size={15} className="stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* 2x2 Matrix Deal Collections in Small Size Carousel */}
        <div className="relative group/dealsCarousel">
          {/* Floating Left Button on Carousel (Hidden on touch mobile) */}
          <button
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous deals"
            className={`hidden md:flex absolute -left-2.5 sm:-left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-800 dark:text-white transition-all cursor-pointer ${
              canScrollLeft
                ? "hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:scale-105 active:scale-95 opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronLeft size={17} className="stroke-[2.5]" />
          </button>

          {/* Floating Right Button on Carousel (Hidden on touch mobile) */}
          <button
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Next deals"
            className={`hidden md:flex absolute -right-2.5 sm:-right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-800 dark:text-white transition-all cursor-pointer ${
              canScrollRight
                ? "hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:scale-105 active:scale-95 opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronRight size={17} className="stroke-[2.5]" />
          </button>

          {/* Horizontal Carousel Track */}
          <div
            ref={scrollContainerRef}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            className="flex gap-3 sm:gap-3.5 lg:gap-4 overflow-x-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden pb-1 snap-x snap-mandatory scroll-smooth"
          >
            {collections.map((group) => (
              <div
                key={group.id}
                className="w-full sm:w-[330px] md:w-[360px] lg:w-[calc((100%-32px)/3)] shrink-0 snap-start bg-slate-50/70 dark:bg-slate-800/50 rounded-sm border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between select-none"
              >
                {/* Parent Deal Box Header */}
                <div className="mb-2.5 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-sm inline-block border border-rose-200/60 dark:border-rose-900/40">
                      {group.tag}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Flash Deals
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base md:text-[17px] font-black text-slate-950 dark:text-white tracking-tight leading-snug truncate">
                    {group.title}
                  </h3>
                </div>

                {/* 4 Inner Deal Boxes in a 2x2 Matrix */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-3 w-full">
                  {group.items.slice(0, 4).map((deal) => (
                    <div
                      key={deal.id}
                      onClick={() => navigate(deal.link)}
                      className="group/item cursor-pointer flex flex-col items-center select-none"
                    >
                      {/* Inner Deal Image Box */}
                      <div className="w-full aspect-square rounded-sm overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 relative group-hover/item:border-rose-500 dark:group-hover/item:border-rose-400 group-hover/item:shadow-xs transition-all duration-200 flex items-center justify-center">
                        {/* Discount Tag */}
                        <span className="absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded-sm text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-tight bg-rose-600 text-white shadow-2xs leading-none pointer-events-none">
                          {deal.discount}
                        </span>
                        <img
                          src={deal.image}
                          alt={deal.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = deal.fallbackImage || dealLaptop;
                          }}
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>

                      {/* Product Title */}
                      <span
                        className="mt-1.5 text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white group-hover/item:text-rose-600 dark:group-hover/item:text-rose-400 transition-colors line-clamp-1 text-center w-full truncate"
                        title={deal.title}
                      >
                        {deal.title}
                      </span>

                      {/* Price Row */}
                      <div className="flex items-baseline justify-center gap-1.5 w-full mt-0.5">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">
                          {deal.price}
                        </span>
                        <span className="text-[9.5px] sm:text-[10.5px] text-slate-400 line-through leading-none">
                          {deal.originalPrice}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Parent Box Footer Link */}
                <button
                  onClick={() => navigate(group.link)}
                  className="group/btn w-full py-2 px-3 rounded-sm bg-white dark:bg-slate-900 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-slate-700 dark:text-slate-200 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer mt-auto shadow-2xs"
                >
                  <span>{group.cta}</span>
                  <ArrowRight size={13} className="stroke-[2.5] group-hover/btn:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashDealsSection;
