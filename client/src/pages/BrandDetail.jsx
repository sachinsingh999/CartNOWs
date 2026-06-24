import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import ProductCard from "../pages/ProductCard";
import { toast } from "react-toastify";
import { ArrowLeft, ShieldCheck, SlidersHorizontal } from "lucide-react";

const BrandDetail = () => {
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
          const filtered = res.data.products.filter(
            (p) => (p.brand || "").toLowerCase() === slug.toLowerCase()
          );
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
      {/* Back to all brands */}
      <button
        onClick={() => navigate("/brands")}
        className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-550 dark:text-slate-400 hover:text-blue-650 dark:hover:text-blue-400 transition-colors border-none bg-transparent cursor-pointer mb-6"
      >
        <ArrowLeft size={14} className="stroke-[2.5]" />
        <span>All Brands</span>
      </button>

      {/* Header section */}
      <div className="mb-10">
        <span className="inline-flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider text-blue-650 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40 px-3 py-1 rounded-md mb-2">
          <ShieldCheck size={11} className="stroke-[2.5]" />
          Official Brand Store
        </span>
        <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 capitalize">
          {slug} Store
        </h1>
        <p className="text-xs font-bold text-slate-455 mt-1">
          Shop authentic items directly from {slug} brand inventory.
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
            We don't have any products registered under the "{slug}" brand name.
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

export default BrandDetail;
