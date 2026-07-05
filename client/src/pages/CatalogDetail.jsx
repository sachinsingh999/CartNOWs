import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import ProductCard from "../pages/ProductCard";
import { toast } from "react-toastify";
import { ArrowLeft, Layers, Award, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { ProductGridSkeleton } from "../components/SkeletonLoader";

const CatalogDetail = ({ type }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${backendUrl}/api/product/list`);
        if (res.data.success) {
          let filtered = res.data.products;

          if (type === "category") {
            filtered = filtered.filter(
              (p) => (p.category || "").toLowerCase() === slug.toLowerCase()
            );
          } else if (type === "brand") {
            filtered = filtered.filter(
              (p) => (p.brand || "").toLowerCase() === slug.toLowerCase()
            );
          } else if (type === "collection") {
            // Map slugs to filtering logic
            if (slug === "electronics") {
              filtered = filtered.filter(p => (p.category || "").toLowerCase() === "electronics");
            } else if (slug === "fashion") {
              filtered = filtered.filter(p => ["fashion", "shoes", "watches"].includes((p.category || "").toLowerCase()));
            } else if (slug === "home") {
              filtered = filtered.filter(p => ["home-kitchen", "furniture"].includes((p.category || "").toLowerCase()));
            } else if (slug === "trending-now") {
              filtered = filtered.filter(p => p.isBestSeller || (p.rating && p.rating >= 4.7));
            } else if (slug === "student-essentials") {
              filtered = filtered.filter(p => ["electronics", "books", "accessories"].includes((p.category || "").toLowerCase()));
            } else if (slug === "luxury-picks") {
              filtered = filtered.filter(p => p.price && p.price >= 3000);
            } else {
              filtered = filtered.filter(p => (p.category || "").toLowerCase() === slug.toLowerCase());
            }
          }
          
          setProducts(filtered);
        } else {
          toast.error(res.data.message);
        }
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
        badgeColor: "text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40",
        backLabel: "All Brands",
        backPath: "/brands",
        title: `${slug} Store`,
        subtitle: `Shop authentic items directly from ${slug} brand inventory.`,
        emptyText: `We don't have any products registered under the "${slug}" brand name.`
      };
    } else if (type === "collection") {
      return {
        icon: Award,
        badgeLabel: "Collection Catalogue",
        badgeColor: "text-purple-600 bg-purple-50 dark:text-purple-300 dark:bg-purple-950/40",
        backLabel: "All Collections",
        backPath: "/collections",
        title: capitalizedSlug,
        subtitle: "Explore products curated for this lookbook collection.",
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 sm:px-12 lg:px-20 py-12 text-left transition-colors duration-350">
      {/* Back button */}
      <button
        onClick={() => navigate(meta.backPath)}
        className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-none bg-transparent cursor-pointer mb-6"
      >
        <ArrowLeft size={14} className="stroke-[2.5]" />
        <span>{meta.backLabel}</span>
      </button>

      {/* Header section */}
      <div className="mb-10">
        <span className={`inline-flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider px-3 py-1 rounded-md mb-2 ${meta.badgeColor}`}>
          <HeaderIcon size={11} className="stroke-[2.5]" />
          {meta.badgeLabel}
        </span>
        <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 capitalize">
          {meta.title}
        </h1>
        <p className="text-xs font-bold text-slate-500 mt-1">
          {meta.subtitle}
        </p>
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-white dark:bg-slate-900 text-center animate-fade-in">
          <SlidersHorizontal size={36} className="text-slate-300 dark:text-slate-600 mb-3 animate-bounce" />
          <h3 className="text-base font-black text-slate-800 dark:text-white">No Products Found</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold max-w-[320px] mt-1 leading-normal">
            {meta.emptyText}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogDetail;
