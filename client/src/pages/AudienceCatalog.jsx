import React, { useEffect, useState } from "react";
import ProductCard from "../pages/ProductCard";
import FilterSidebar from "../components/CategoryFilterSidebar";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";

const AudienceCatalog = ({ audience }) => {
  const [products, setProducts] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Capitalize title: "kid" -> "Kids", "men" -> "Men", "women" -> "Women"
  const getTitle = () => {
    if (!audience) return "Catalog";
    const lower = audience.toLowerCase();
    if (lower === "kid" || lower === "kids") return "Kids";
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  useEffect(() => {
    setLoading(true);
    axios.get(`${backendUrl}/api/product/list`)
      .then((res) => {
        if (res.data.success) {
          const target = audience.toLowerCase();
          const targets = target === "kid" || target === "kids" ? ["kid", "kids"] : [target];
          
          const filtered = res.data.products.filter((p) => {
            const col = p.collection?.toLowerCase();
            const cols = p.collections?.map(c => c.toLowerCase()) || [];
            const audVal = p.audience?.toLowerCase();
            
            return targets.includes(col) || cols.some(c => targets.includes(c)) || targets.includes(audVal);
          });
          
          setProducts(filtered);
          setFilteredList(filtered);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((e) => {
        toast.error(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [audience]);

  const displayTitle = getTitle();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* Top bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 py-3 transition-colors duration-200">
        <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{displayTitle}</h1>
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-sm"
          >
            <span>{showMobileFilters ? "Hide Filters" : "Show Filters"}</span>
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-start">
        <div className={`${showMobileFilters ? "block" : "hidden"} md:block md:sticky md:top-24 md:max-h-[calc(100vh-8rem)] md:overflow-y-auto pr-2`}>
          {!loading && <FilterSidebar productList={products} setFilteredList={setFilteredList} />}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] p-4 flex flex-col justify-between animate-pulse h-[360px]">
                <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-[20px] mb-3" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-1/3 mb-4" />
                <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-[12px] w-full" />
              </div>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-white dark:bg-slate-900 text-center">
            <h3 className="text-base font-black text-slate-800 dark:text-white">No Products Found</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">
              There are currently no matching products inside the {displayTitle} catalog.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {filteredList.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudienceCatalog;
