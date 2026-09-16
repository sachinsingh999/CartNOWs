import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { backendUrl } from "../../config";
import { cachedGet } from "../../utils/apiCache";
import { getOptimizedImageUrl } from "../../utils/imageOptimizer";
import { getDailyRotatedItems } from "../../utils/dailyRotation";

// Curated Category Imagery Assets (Used for initial render and robust fallbacks)
import catMobiles from "../../assets/new_home/cat_mobiles.webp";
import catLaptops from "../../assets/new_home/deal_laptop.webp";
import catMens from "../../assets/new_home/cat_black_hoodie.webp";
import catWomens from "../../assets/cat_womens_new.webp";
import catFootwear from "../../assets/new_home/promo_footwear.webp";
import catWatches from "../../assets/new_home/deal_smartwatch.webp";
import catBags from "../../assets/new_home/deal_backpack.webp";
import dealBackpack from "../../assets/new_home/deal_backpack.webp";
import catJewelry from "../../assets/cat_jewelry.webp";
import catBeauty from "../../assets/cat_beauty.webp";
import promoBeauty from "../../assets/new_home/promo_beauty.webp";
import catHome from "../../assets/new_home/promo_home.webp";
import catKids from "../../assets/brand_asset_kids.webp";
import catSports from "../../assets/brand_asset_sportswear.webp";

// Additional imagery assets for 3x3 matrix collections
import dealEarbuds from "../../assets/new_home/deal_earbuds.webp";
import promoElectronics from "../../assets/new_home/promo_electronics.webp";
import catElectronics from "../../assets/cat_electronics.webp";
import brandElectronics from "../../assets/brand_asset_electronics_new.webp";

import brandSneakers from "../../assets/brand_asset_sneakers.webp";
import dealPerfume from "../../assets/new_home/deal_perfume.webp";
import catHeadwear from "../../assets/cat_headwear_new.webp";
import catAccessories from "../../assets/cat_accessories_new.webp";

import brandGroceries from "../../assets/brand_asset_groceries.webp";
import brandBooks from "../../assets/brand_asset_books.webp";
import dealShoes from "../../assets/new_home/deal_shoes.webp";
import catBagsNew from "../../assets/cat_bags_new.webp";

import brandBeauty from "../../assets/brand_asset_beauty.webp";
import brandAccessories from "../../assets/brand_asset_accessories.webp";

const FALLBACK_CATEGORY_GROUPS = [
  {
    id: "tech_gadgets",
    title: "Electronics, Gadgets & Tech",
    tag: "High Tech",
    link: "/product?category=Electronics",
    cta: "Explore all Tech",
    categoryRegex: /electronics|computer|laptop|gadget|mobile|gaming|audio|phone/i,
    items: [
      { id: "mobiles", label: "Mobiles & Tech", image: catMobiles, fallbackImage: catMobiles, link: "/product?category=Electronics", badge: "Hot" },
      { id: "laptops", label: "Laptops", image: catLaptops, fallbackImage: catLaptops, link: "/product?category=Electronics" },
      { id: "watches", label: "Smart Watches", image: catWatches, fallbackImage: catWatches, link: "/product?category=Electronics" },
      { id: "earbuds", label: "Wireless Audio", image: dealEarbuds, fallbackImage: dealEarbuds, link: "/product?category=Electronics", badge: "Top" },
      { id: "gaming", label: "Gaming Gear", image: promoElectronics, fallbackImage: promoElectronics, link: "/product?category=Electronics" },
      { id: "audio", label: "Audio & Sound", image: catElectronics, fallbackImage: catElectronics, link: "/product?category=Electronics" },
      { id: "devices", label: "Smart Devices", image: brandElectronics, fallbackImage: brandElectronics, link: "/product?category=Electronics" },
      { id: "bags", label: "Tech Bags", image: dealBackpack, fallbackImage: dealBackpack, link: "/product?category=Electronics" },
      { id: "travel_bags", label: "Travel Cases", image: catBagsNew, fallbackImage: catBagsNew, link: "/product?category=Electronics" }
    ]
  },
  {
    id: "fashion_style",
    title: "Fashion, Style & Footwear",
    tag: "Curated Style",
    link: "/product?category=Fashion",
    cta: "Shop all Fashion",
    categoryRegex: /fashion|men|women|clothing|apparel|shoe|footwear|accessories|jewellery|hoodie/i,
    items: [
      { id: "womens", label: "Women's Fashion", image: catWomens, fallbackImage: catWomens, link: "/product?category=Fashion", badge: "Trending" },
      { id: "mens", label: "Men's Apparel", image: catMens, fallbackImage: catMens, link: "/product?category=Fashion" },
      { id: "sneakers", label: "Street Sneakers", image: brandSneakers, fallbackImage: brandSneakers, link: "/product?category=Fashion", badge: "Hot" },
      { id: "runners", label: "Running Shoes", image: dealShoes, fallbackImage: dealShoes, link: "/product?category=Fashion" },
      { id: "footwear", label: "Premium Footwear", image: catFootwear, fallbackImage: catFootwear, link: "/product?category=Fashion" },
      { id: "jewelry", label: "Jewelry & Rings", image: catJewelry, fallbackImage: catJewelry, link: "/product?category=Fashion" },
      { id: "headwear", label: "Caps & Headwear", image: catHeadwear, fallbackImage: catHeadwear, link: "/product?category=Fashion" },
      { id: "accessories", label: "Style Accessories", image: catAccessories, fallbackImage: catAccessories, link: "/product?category=Fashion" },
      { id: "bags_fash", label: "Designer Bags", image: catBags, fallbackImage: catBags, link: "/product?category=Fashion" }
    ]
  },
  {
    id: "beauty_home",
    title: "Beauty, Home & Decor",
    tag: "Living & Glow",
    link: "/product?category=Beauty",
    cta: "Discover Home & Beauty",
    categoryRegex: /beauty|home|kitchen|furniture|grocery|groceries|book/i,
    items: [
      { id: "beauty_care", label: "Beauty & Skincare", image: catBeauty, fallbackImage: catBeauty, link: "/product?category=Beauty", badge: "Popular" },
      { id: "fragrance", label: "Luxury Perfumes", image: dealPerfume, fallbackImage: dealPerfume, link: "/product?category=Beauty" },
      { id: "makeup", label: "Cosmetics", image: promoBeauty, fallbackImage: promoBeauty, link: "/product?category=Beauty" },
      { id: "home_decor", label: "Home Decor", image: catHome, fallbackImage: catHome, link: "/product?category=Home%20%26%20Kitchen" },
      { id: "kids_fashion", label: "Kids & Baby", image: catKids, fallbackImage: catKids, link: "/product?category=Beauty" },
      { id: "groceries", label: "Gourmet Foods", image: brandGroceries, fallbackImage: brandGroceries, link: "/product?category=Groceries" },
      { id: "books", label: "Best Novels", image: brandBooks, fallbackImage: brandBooks, link: "/product?category=Books" },
      { id: "personal_care", label: "Body Care", image: brandBeauty, fallbackImage: brandBeauty, link: "/product?category=Beauty" },
      { id: "home_acc", label: "Living Essentials", image: brandAccessories, fallbackImage: brandAccessories, link: "/product?category=Home%20%26%20Kitchen" }
    ]
  },
  {
    id: "sports_active",
    title: "Sports, Fitness & Outdoor",
    tag: "Active Living",
    link: "/product?category=Sports",
    cta: "Explore Activewear",
    categoryRegex: /sport|fitness|gym|outdoor/i,
    items: [
      { id: "sportswear", label: "Gym & Activewear", image: catSports, fallbackImage: catSports, link: "/product?category=Sports", badge: "Best" },
      { id: "athletic_shoes", label: "Trainer Shoes", image: dealShoes, fallbackImage: dealShoes, link: "/product?category=Sports" },
      { id: "running_kicks", label: "Pro Sneakers", image: brandSneakers, fallbackImage: brandSneakers, link: "/product?category=Sports" },
      { id: "fit_watches", label: "Fitness Trackers", image: catWatches, fallbackImage: catWatches, link: "/product?category=Sports" },
      { id: "sport_audio", label: "Workout Earbuds", image: dealEarbuds, fallbackImage: dealEarbuds, link: "/product?category=Sports" },
      { id: "gym_bags", label: "Gym Backpacks", image: dealBackpack, fallbackImage: dealBackpack, link: "/product?category=Sports" },
      { id: "sport_caps", label: "Sports Caps", image: catHeadwear, fallbackImage: catHeadwear, link: "/product?category=Sports" },
      { id: "outdoor_duffle", label: "Duffle Bags", image: catBagsNew, fallbackImage: catBagsNew, link: "/product?category=Sports" },
      { id: "fresh_fragrance", label: "Sport Cologne", image: dealPerfume, fallbackImage: dealPerfume, link: "/product?category=Sports" }
    ]
  }
];

const resolveCategoryProductImage = (img, fallback) => {
  if (!img) return fallback;
  const rawUrl = img.startsWith("http") ? img : `${backendUrl}/${img.replace(/^\//, "")}`;
  return getOptimizedImageUrl(rawUrl, { width: 280, quality: 80 }) || fallback;
};

const BADGES = ["Hot", "Top", "New", "Best", "Trending"];

const RecommendedCategories = ({ homepageData }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [dbProducts, setDbProducts] = useState([]);

  // Fetch real products from the database
  useEffect(() => {
    let isMounted = true;

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

    cachedGet(`${backendUrl}/api/product/list?limit=250`)
      .then((res) => {
        if (isMounted && res?.data?.success && Array.isArray(res.data.products) && res.data.products.length > 0) {
          setDbProducts(res.data.products);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch database products for recommended categories:", err?.message);
      });

    return () => {
      isMounted = false;
    };
  }, [homepageData]);

  // Construct 4 collections each housing 4 real products in a 2x2 matrix (rotated on a daily basis)
  const categoryGroups = useMemo(() => {
    if (!dbProducts || dbProducts.length === 0) {
      return FALLBACK_CATEGORY_GROUPS.map((group) => ({
        ...group,
        items: getDailyRotatedItems(group.items, group.id).slice(0, 4)
      }));
    }

    return FALLBACK_CATEGORY_GROUPS.map((group) => {
      // Find matching real products from DB
      const matchingProducts = dbProducts.filter((p) => {
        const catStr = `${p.category || ""} ${p.subCategory || ""} ${p.name || ""}`;
        return group.categoryRegex.test(catStr);
      });

      // Deterministically rotate product pool daily based on calendar date + group id
      const rotatedProducts = getDailyRotatedItems(matchingProducts, group.id);

      const realItems = rotatedProducts.map((p, idx) => {
        const rawImg = p.images?.[0] || p.media?.[0]?.url || "";
        const fallback = group.items[idx % group.items.length]?.fallbackImage || catMobiles;

        return {
          id: p._id,
          label: p.name,
          image: resolveCategoryProductImage(rawImg, fallback),
          fallbackImage: fallback,
          link: `/product/${p._id}`,
          badge: idx % 4 === 0 ? BADGES[idx % BADGES.length] : undefined,
          isRealDbProduct: true
        };
      });

      // Pick up to 4 real items, padding with daily-rotated fallback items if necessary
      const finalItems = [];
      const usedIds = new Set();

      for (const item of realItems) {
        if (!usedIds.has(item.id) && finalItems.length < 4) {
          usedIds.add(item.id);
          finalItems.push(item);
        }
      }

      const rotatedFallbacks = getDailyRotatedItems(group.items, `${group.id}_fallback`);
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
        ...group,
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
  }, [categoryGroups]);

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.95;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  return (
    <section className="w-full px-2 sm:px-4 lg:px-6 pt-1 pb-1 select-none text-left">
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-3.5 sm:p-4.5 lg:p-5 shadow-xs transition-shadow duration-300">
        {/* Section Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-orange-50 dark:bg-orange-950/50 border border-orange-200/80 dark:border-orange-800/60 rounded-sm text-[9px] font-black uppercase tracking-wider text-[#FF5500] dark:text-orange-300 shadow-2xs">
                <Sparkles size={11} className="stroke-[2.5]" />
                <span>POPULAR CATEGORIES</span>
              </div>

              <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                Curated Collections
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Explore Categories</span>
              <span className="h-1.5 w-1.5 rounded-sm bg-[#FF5500] dark:bg-orange-400 animate-pulse" />
            </h2>

            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Browse top trending collections and curated categories handpicked for you.
            </p>
          </div>

          {/* Top Right Action & Navigation */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              onClick={() => navigate("/categories")}
              className="px-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-800 dark:text-slate-200 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 shadow-2xs"
            >
              <span>See All</span>
              <ArrowRight size={12} className="stroke-[2.5]" />
            </button>

            {/* Slider Navigation Chevrons */}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                aria-label="Previous categories"
                className="w-8 h-8 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft size={15} className="stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                aria-label="Next categories"
                className="w-8 h-8 rounded-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight size={15} className="stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* 2x2 Matrix Collections in a smooth horizontal carousel */}
        <div className="relative group/carousel">
          {/* Floating Left Button on Carousel (Hidden on touch mobile) */}
          <button
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous categories"
            className={`hidden md:flex absolute -left-2.5 sm:-left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-800 dark:text-white transition-all cursor-pointer ${
              canScrollLeft
                ? "hover:bg-[#FF5500] hover:text-white hover:border-[#FF5500] hover:scale-105 active:scale-95 opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronLeft size={17} className="stroke-[2.5]" />
          </button>

          {/* Floating Right Button on Carousel (Hidden on touch mobile) */}
          <button
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Next categories"
            className={`hidden md:flex absolute -right-2.5 sm:-right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-800 dark:text-white transition-all cursor-pointer ${
              canScrollRight
                ? "hover:bg-[#FF5500] hover:text-white hover:border-[#FF5500] hover:scale-105 active:scale-95 opacity-100"
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
            {categoryGroups.map((group) => (
              <div
                key={group.id}
                className="w-[85vw] max-w-[370px] sm:w-[330px] md:w-[360px] lg:w-[calc((100%-32px)/3)] shrink-0 snap-start bg-slate-50/70 dark:bg-slate-800/50 rounded-sm border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between select-none"
              >
                {/* Parent Box Header */}
                <div className="mb-2.5 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-[#FF5500] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-sm inline-block border border-orange-200/60 dark:border-orange-900/40">
                      {group.tag}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Categories
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base md:text-[17px] font-black text-slate-950 dark:text-white tracking-tight leading-snug truncate">
                    {group.title}
                  </h3>
                </div>

                {/* 4 Inner Category Boxes in a 2x2 Matrix */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-3 w-full">
                  {group.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(item.link)}
                      className="group/item cursor-pointer flex flex-col items-center select-none"
                    >
                      {/* Inner Box Image as Box */}
                      <div className="w-full aspect-square rounded-sm overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 relative group-hover/item:border-[#FF5500] dark:group-hover/item:border-orange-400 group-hover/item:shadow-xs transition-all duration-200 p-2.5 sm:p-3.5 flex items-center justify-center">
                        {item.badge && (
                          <span className="absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded-sm text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-tight bg-[#FF5500] text-white shadow-2xs leading-none pointer-events-none">
                            {item.badge}
                          </span>
                        )}
                        <img
                          src={item.image}
                          alt={item.label}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = item.fallbackImage || catMobiles;
                          }}
                          className="w-full h-full object-contain group-hover/item:scale-108 transition-transform duration-300 filter drop-shadow-2xs"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>

                      {/* Inner Box Label */}
                      <span
                        className="mt-1.5 text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white group-hover/item:text-[#FF5500] dark:group-hover/item:text-orange-400 transition-colors line-clamp-1 text-center w-full truncate"
                        title={item.label}
                      >
                        {item.label}
                      </span>
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

export default RecommendedCategories;
