import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { 
  ClipboardList, 
  Box, 
  AlertTriangle, 
  Layers,
  Search
} from "lucide-react";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Filter list based on search
  const filteredList = list.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      (item.brand || "").toLowerCase().includes(query) ||
      (item.category || "").toLowerCase().includes(query) ||
      (item.sku || "").toLowerCase().includes(query)
    );
  });

  // Stats calculation
  const totalProducts = list.length;
  const outOfStock = list.filter((item) => (item.stock ?? 0) <= 0).length;
  const uniqueCategories = new Set(list.map((item) => item.category).filter(Boolean)).size;

  return (
    <div className="space-y-5">
      {/* Header and Stats */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Inventory Management
          </p>
          <div className="flex items-center gap-2.5 mt-1">
            <ClipboardList size={18} className="text-blue-500" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Product Catalog</h2>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          Viewing {totalProducts} products listed live on the storefront
        </p>
      </div>

      {/* Dashboard Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
        {/* Stat 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4 flex items-center gap-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/85 transition duration-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300">
            <Box size={16} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Items</p>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{totalProducts}</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4 flex items-center gap-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/85 transition duration-200">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${outOfStock > 0 ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300"}`}>
            <AlertTriangle size={16} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Out of Stock</p>
            <p className={`text-base font-bold mt-0.5 ${outOfStock > 0 ? "text-rose-500" : "text-slate-900 dark:text-white"}`}>{outOfStock}</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4 flex items-center gap-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/85 transition duration-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300">
            <Layers size={16} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Categories</p>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{uniqueCategories}</p>
          </div>
        </div>
      </div>

      {/* Search Filter Bar (Sticky) */}
      <div className="sticky top-[-20px] z-10 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xs py-3.5 border-b border-slate-200/60 dark:border-white/[0.05]">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name, brand, SKU, category..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none transition dark: font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          />
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid gap-4.5">
        {filteredList.length === 0 ? (
          <div className="rounded-xl border border-slate-200/85 dark:border-white/[0.08] bg-white dark:bg-slate-900 py-16 text-center text-xs text-slate-500 dark:text-slate-400 shadow-xs flex flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-400">
              <Box size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">No products match your search</p>
              <p className="text-slate-400 dark:text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
            </div>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-white/[0.08] p-4.5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80 transition duration-200 flex flex-col sm:flex-row items-center sm:items-stretch gap-5"
            >
              {/* Product Image */}
              <div className="relative h-18 w-18 flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/[0.08] rounded-lg overflow-hidden p-1.5 flex items-center justify-center shadow-inner">
                <img
                  src={item.images?.[0]?.startsWith('http') ? item.images[0] : `${backendUrl}/${item.images?.[0]}`}
                  alt={item.name}
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Title & Category info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between text-center sm:text-left">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">{item.name}</p>
                  <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-1.5">
                    {item.stock === 0 && (
                      <span className="rounded bg-rose-500/10 text-rose-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border border-rose-500/20 animate-pulse">
                        Out of Stock
                      </span>
                    )}
                    <span className="rounded bg-slate-100 dark:bg-slate-900 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-white/[0.06]">
                      {item.category}
                    </span>
                    {item.subCategory && (
                      <span className="rounded bg-slate-100 dark:bg-slate-900 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-white/[0.06]">
                        {item.subCategory}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Specs */}
              <div className="flex-1 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col justify-center border-y border-slate-100 dark:border-white/[0.04] sm:border-y-0 py-3 sm:py-0 font-medium">
                <p><span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[8px] tracking-widest block mb-0.5">Brand</span> <span className="text-slate-800 dark:text-slate-200 font-bold">{item.brand || "—"}</span></p>
                <p><span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[8px] tracking-widest block mb-0.5">SKU</span> <span className="text-slate-800 dark:text-slate-200 font-mono font-bold">{item.sku || "—"}</span></p>
                <p>
                  <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[8px] tracking-widest block mb-0.5">Sizes / Variants</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">
                    {item.sizes?.length ? (Array.isArray(item.sizes) ? item.sizes.join(", ") : item.sizes) : "—"}
                  </span>
                </p>
              </div>

              {/* Price & Stock Display Panel */}
              <div className="flex flex-col justify-center text-center sm:text-left min-w-[120px] shrink-0 border-l border-slate-100 dark:border-white/[0.06] pl-4">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Unit Price</span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-1">₹{item.price}</span>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase ${item.stock > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${item.stock > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                    Stock: {item.stock ?? 0}
                  </span>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default List;
