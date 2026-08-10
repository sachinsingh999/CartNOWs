import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import ProductCard from "../pages/ProductCard";
import { toast } from "react-toastify";
import { ArrowLeft, Layers, Award, ShieldCheck, SlidersHorizontal, Laptop, Flame } from "lucide-react";
import { ProductGridSkeleton } from "../components/SkeletonLoader";

const CatalogDetail = ({ type }) => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Parse cached catalog products from sessionStorage for 0ms instant display
  const getInitialProducts = () => {
    try {
      const cacheKey = `cached_catalog_${type}_${slug}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  };

  const initialProducts = getInitialProducts();
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);

  useEffect(() => {
    const fetchProducts = async () => {
      // Only trigger visible skeleton loading if we don't have cached initial products
      if (products.length === 0) {
        setLoading(true);
      }
      try {
        let apiUrl = `${backendUrl}/api/product/list`;
        if (type === "category" && slug) {
          apiUrl += `?category=${encodeURIComponent(slug)}`;
        } else if (type === "brand" && slug) {
          apiUrl += `?brand=${encodeURIComponent(slug)}`;
        }

        let res = await axios.get(apiUrl);
        let filtered = res.data.success ? res.data.products : [];

        // If targeted category/brand query returned 0 products, try fetching full list as a fallback
        if (filtered.length === 0) {
          const fallbackRes = await axios.get(`${backendUrl}/api/product/list`);
          if (fallbackRes.data.success) {
            const allProds = fallbackRes.data.products;

            if (type === "category") {
              const cleanSlug = slug ? slug.toLowerCase().replace(/-/g, " ") : "";
              filtered = allProds.filter((p) => {
                const cat = (p.category || "").toLowerCase().replace(/-/g, " ");
                return cat === cleanSlug || cat.includes(cleanSlug) || cleanSlug.includes(cat);
              });
            } else if (type === "brand") {
              filtered = allProds.filter(
                (p) => (p.brand || "").toLowerCase() === slug.toLowerCase()
              );
            } else if (type === "collection") {
              const cleanSlug = slug ? slug.toLowerCase().trim() : "";

              // Strict domain-based collection filtering logic
              if (cleanSlug.includes("gaming") || cleanSlug.includes("gamer") || cleanSlug.includes("playstation") || cleanSlug.includes("xbox")) {
                filtered = allProds.filter(p => {
                  const cat = (p.category || "").toLowerCase();
                  const sub = (p.subCategory || "").toLowerCase();
                  const name = (p.name || "").toLowerCase();
                  return cat === "electronics" || cat === "computers" || sub.includes("gaming") || sub.includes("tech") || name.includes("laptop") || name.includes("dell") || name.includes("hp") || name.includes("macbook") || name.includes("headphone") || name.includes("keyboard") || name.includes("mouse") || name.includes("monitor") || name.includes("pc");
                });
              } else if (cleanSlug.includes("festiv") || cleanSlug.includes("offer") || cleanSlug.includes("deal") || cleanSlug.includes("sale") || cleanSlug.includes("discount")) {
                filtered = allProds.filter(p => (p.originalPrice && p.originalPrice > p.price) || p.isBestSeller || (p.rating && p.rating >= 4.5));
              } else if (cleanSlug.includes("electro") || cleanSlug.includes("tech") || cleanSlug.includes("gadget")) {
                filtered = allProds.filter(p => (p.category || "").toLowerCase() === "electronics" || (p.subCategory || "").toLowerCase().includes("tech"));
              } else if (cleanSlug.includes("fashion") || cleanSlug.includes("lifestyle") || cleanSlug.includes("wear") || cleanSlug.includes("cloth")) {
                filtered = allProds.filter(p => ["fashion", "shoes", "watches", "men", "women"].includes((p.category || "").toLowerCase()));
              } else if (cleanSlug.includes("home") || cleanSlug.includes("living") || cleanSlug.includes("decor") || cleanSlug.includes("kitchen")) {
                filtered = allProds.filter(p => ["home-kitchen", "furniture", "home"].includes((p.category || "").toLowerCase()));
              } else if (cleanSlug.includes("beauty") || cleanSlug.includes("glow") || cleanSlug.includes("skin") || cleanSlug.includes("care")) {
                filtered = allProds.filter(p => ["beauty", "skincare", "skin"].includes((p.category || "").toLowerCase()));
              } else if (cleanSlug.includes("sport") || cleanSlug.includes("sneaker") || cleanSlug.includes("shoe") || cleanSlug.includes("active")) {
                filtered = allProds.filter(p => ["sports", "shoes", "sneakers"].includes((p.category || "").toLowerCase()));
              } else if (cleanSlug.includes("accessory") || cleanSlug.includes("luxur") || cleanSlug.includes("chrono") || cleanSlug.includes("watch")) {
                filtered = allProds.filter(p => ["accessories", "watches"].includes((p.category || "").toLowerCase()) || (p.price && p.price >= 2000));
              } else {
                const words = cleanSlug.split(/[-_\s]+/).filter(w => w.length > 2);
                filtered = allProds.filter(p => {
                  const pCat = (p.category || "").toLowerCase();
                  const pSub = (p.subCategory || "").toLowerCase();
                  const pCol = (p.collection || "").toLowerCase();
                  const pCols = (p.collections || []).map(c => String(c).toLowerCase());
                  const pName = (p.name || "").toLowerCase();

                  if (pCol === cleanSlug || pCol.includes(cleanSlug) || pCols.includes(cleanSlug)) return true;
                  if (words.length > 0) {
                    return words.some(w => pCat.includes(w) || pSub.includes(w) || pName.includes(w));
                  }
                  return pCat === cleanSlug;
                });
              }

              if (filtered.length === 0 && allProds.length > 0) {
                if (cleanSlug.includes("gaming") || cleanSlug.includes("electro") || cleanSlug.includes("tech") || cleanSlug.includes("gadget")) {
                  filtered = allProds.filter(p => (p.category || "").toLowerCase() === "electronics");
                } else if (cleanSlug.includes("fashion") || cleanSlug.includes("wear") || cleanSlug.includes("cloth")) {
                  filtered = allProds.filter(p => ["fashion", "shoes", "watches"].includes((p.category || "").toLowerCase()));
                } else if (cleanSlug.includes("home") || cleanSlug.includes("living") || cleanSlug.includes("decor")) {
                  filtered = allProds.filter(p => ["home-kitchen", "furniture"].includes((p.category || "").toLowerCase()));
                } else if (cleanSlug.includes("beauty") || cleanSlug.includes("skin")) {
                  filtered = allProds.filter(p => (p.category || "").toLowerCase() === "beauty");
                } else {
                  filtered = allProds.slice(0, 8);
                }
              }

              if (cleanSlug.includes("festiv") || cleanSlug.includes("offer") || cleanSlug.includes("deal")) {
                filtered.sort((a, b) => {
                  const savA = (a.originalPrice || a.price) - a.price;
                  const savB = (b.originalPrice || b.price) - b.price;
                  return savB - savA;
                });
              }
            }
          }
        }
        
        setProducts(filtered);
        try {
          sessionStorage.setItem(`cached_catalog_${type}_${slug}`, JSON.stringify(filtered));
        } catch (e) {}
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [slug, type]);

  // Dynamic layout metadata helper
  const getMetadata = () => {
    const capitalizedSlug = slug ? slug.replace(/-/g, " ") : "";
    if (type === "brand") {
      return {
        icon: ShieldCheck,
        badgeLabel: "Official Brand Store",
        badgeColor: "text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40",
        backLabel: "All Brands",
        backPath: "/brands",
        title: `${slug} Store`,
        subtitle: `Shop authentic items directly from ${slug} brand inventory.`,
        emptyText: `We don't have any products registered under the "${slug}" brand name.`
      };
    } else if (type === "collection") {
      const isGaming = slug && (slug.includes("gaming") || slug.includes("gamer"));
      const isFestive = slug && (slug.includes("festiv") || slug.includes("offer") || slug.includes("deal"));
      return {
        icon: isGaming ? Laptop : isFestive ? Flame : Award,
        badgeLabel: isGaming 
          ? "PRO GAMING BUNDLE CAPSULE" 
          : isFestive 
          ? "LIMITED TIME FESTIVAL OFFERS" 
          : "CURATED COLLECTION CAPSULE",
        badgeColor: isGaming
          ? "text-indigo-700 bg-indigo-50 border border-indigo-200 dark:text-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-900/40"
          : isFestive 
          ? "text-rose-700 bg-rose-50 border border-rose-200 dark:text-rose-300 dark:bg-rose-950/60 dark:border-rose-900/40" 
          : "text-purple-700 bg-purple-50 border border-purple-200 dark:text-purple-300 dark:bg-purple-950/60 dark:border-purple-900/40",
        backLabel: "All Collections",
        backPath: "/collections",
        title: isGaming ? "Gaming Setup" : isFestive ? "Festival Offers & Mega Deals" : capitalizedSlug,
        subtitle: isGaming
          ? "Pro-grade laptops, high-refresh displays, precision peripherals, and hardware."
          : isFestive 
          ? "Exclusive festive discounts, bundle offers, and verified mega savings." 
          : "Explore handpicked products curated for this lookbook collection.",
        emptyText: `There are currently no matching products inside the "${slug}" collection.`
      };
    } else {
      // Default: category
      return {
        icon: Layers,
        badgeLabel: "Category Catalog",
        badgeColor: "text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40",
        backLabel: "All Categories",
        backPath: "/categories",
        title: capitalizedSlug,
        subtitle: "Explore products available in this catalog.",
        emptyText: `We don't currently have products in the "${slug}" category. Please check back later.`
      };
    }
  };

  const meta = getMetadata();
  const HeaderIcon = meta.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-3 sm:px-6 lg:px-10 py-4 text-left transition-colors duration-350">
      {/* Back button */}
      <button
        onClick={() => navigate(meta.backPath)}
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-none bg-transparent cursor-pointer mb-2"
      >
        <ArrowLeft size={13} className="stroke-[2.5]" />
        <span>{meta.backLabel}</span>
      </button>

      {/* Header section */}
      <div className="mb-4">
        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md mb-1 ${meta.badgeColor}`}>
          <HeaderIcon size={10} className="stroke-[2.5]" />
          {meta.badgeLabel}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 capitalize leading-tight">
          {meta.title}
        </h1>
        <p className="text-[11px] font-bold text-slate-500 mt-0.5">
          {meta.subtitle}
        </p>
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-center animate-fade-in">
          <SlidersHorizontal size={32} className="text-slate-300 dark:text-slate-600 mb-2 animate-bounce" />
          <h3 className="text-sm font-black text-slate-800 dark:text-white">No Products Found</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold max-w-[320px] mt-0.5 leading-normal">
            {meta.emptyText}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogDetail;
