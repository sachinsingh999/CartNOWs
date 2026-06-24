import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import ProductCard from "../pages/ProductCard";
import { toast } from "react-toastify";
import { ArrowLeft, Award, SlidersHorizontal } from "lucide-react";

const CollectionDetail = () => {
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
          
          // Map slugs to filtering logic
          if (slug === "electronics") {
            filtered = filtered.filter(p => (p.category || "").toLowerCase() === "electronics");
          } else if (slug === "fashion") {
            filtered = filtered.filter(p => ["fashion", "shoes", "watches"].includes((p.category || "").toLowerCase()));
          } else if (slug === "home") {
            filtered = filtered.filter(p => ["home-kitchen", "furniture"].includes((p.category || "").toLowerCase()));
          } else if (slug === "trending-now") {
            // Trending: best sellers or highly rated
            filtered = filtered.filter(p => p.isBestSeller || (p.rating && p.rating >= 4.7));
          } else if (slug === "student-essentials") {
            filtered = filtered.filter(p => ["electronics", "books", "accessories"].includes((p.category || "").toLowerCase()));
          } else if (slug === "luxury-picks") {
            // Luxury: premium pricing
            filtered = filtered.filter(p => p.price && p.price >= 3000);
          } else {
            // General filter
            filtered = filtered.filter(p => (p.category || "").toLowerCase() === slug.toLowerCase());
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
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 sm:px-12 lg:px-20 py-12 text-left">
      {/* Back to all collections */}
      <button
        onClick={() => navigate("/collections")}
        className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-550 dark:text-slate-400 hover:text-purple-650 dark:hover:text-purple-400 transition-colors border-none bg-transparent cursor-pointer mb-6"
      >
        <ArrowLeft size={14} className="stroke-[2.5]" />
        <span>All Collections</span>
      </button>

      {/* Header section */}
      <div className="mb-10">
        <span className="inline-flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider text-purple-650 bg-purple-50 dark:text-purple-300 dark:bg-purple-950/40 px-3 py-1 rounded-md mb-2">
          <Award size={11} className="stroke-[2.5]" />
          Collection Catalogue
        </span>
        <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 capitalize">
          {slug.replace(/-/g, " ")}
        </h1>
        <p className="text-xs font-bold text-slate-455 mt-1">
          Explore products curated for this lookbook collection.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] p-4 flex flex-col justify-between animate-pulse h-[360px]">
              <div className="w-full aspect-square bg-slate-100 dark:bg-slate-850 rounded-[20px] mb-3" />
              <div className="h-4 bg-slate-100 dark:bg-slate-850 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-100 dark:bg-slate-855 rounded w-1/3 mb-4" />
              <div className="h-8 bg-slate-100 dark:bg-slate-850 rounded-[12px] w-full" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-white dark:bg-slate-900 text-center">
          <SlidersHorizontal size={36} className="text-slate-350 dark:text-slate-650 mb-3" />
          <h3 className="text-base font-black text-slate-800 dark:text-white">No Products Found</h3>
          <p className="text-xs text-slate-450 dark:text-slate-500 font-bold max-w-[280px] mt-1">
            There are currently no matching products inside the "{slug}" collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionDetail;
