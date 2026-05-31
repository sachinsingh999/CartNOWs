import React, { useEffect, useState } from "react";
import ProductCard from "../pages/ProductCard";
import FilterSidebar from "../componenets/CategoryFilterSidebar";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";

const Men = () => {
  const [menProducts, setMenProducts] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    axios.get(`${backendUrl}/api/product/list`).then((res) => {
      if (res.data.success) {
        const only = res.data.products.filter((p) => p.collection?.toLowerCase() === "men");
        setMenProducts(only);
        setFilteredList(only);
      } else toast.error(res.data.message);
    }).catch((e) => toast.error(e.message));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* Top bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 py-3 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-905 dark:text-slate-100">Men</h1>
            <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900/50">
              {filteredList.length}
            </span>
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer shadow-sm"
          >
            <span>{showMobileFilters ? "Hide Filters" : "Show Filters"}</span>
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
        <div className={`${showMobileFilters ? "block" : "hidden"} md:block`}>
          <FilterSidebar productList={menProducts} setFilteredList={setFilteredList} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item) => <ProductCard key={item._id} product={item} />)}
        </div>
      </div>
    </div>
  );
};

export default Men;
