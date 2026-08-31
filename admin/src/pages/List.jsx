import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import { 
  ClipboardList, 
  Box, 
  AlertTriangle, 
  Layers,
  Search,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Tag,
  Store,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchList = async () => {
    setIsRefreshing(true);
    setLoading(true);
    try {
      // 1. Primary: Try fetching via admin endpoint (retrieves ALL products regardless of approval status)
      const adminRes = await axios.get(`${backendUrl}/api/admin/products`, { headers: { token } });
      if (adminRes.data.success && Array.isArray(adminRes.data.products)) {
        setList(adminRes.data.products);
        return;
      }
    } catch {
      // 2. Fallback: Try public catalog endpoint
      try {
        const response = await axios.get(`${backendUrl}/api/product/list`);
        if (response.data.success && Array.isArray(response.data.products)) {
          setList(response.data.products);
        } else {
          toast.error(response.data.message || "Failed to load product catalog");
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to connect to backend");
      }
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [token]);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product listing from the platform?")) return;
    try {
      let data;
      try {
        const res = await axios.delete(`${backendUrl}/api/admin/product/${id}`, { headers: { token } });
        data = res.data;
      } catch {
        const res = await axios.post(`${backendUrl}/api/product/remove`, { id }, { headers: { token } });
        data = res.data;
      }

      if (data.success) {
        toast.success("Product deleted successfully");
        setList(prev => prev.filter(item => item._id !== id));
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch {
      toast.error("Failed to execute product deletion");
    }
  };

  // Derive unique categories dynamically
  const categoriesList = useMemo(() => {
    const set = new Set();
    list.forEach(item => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [list]);

  // Filter list based on search, category and status
  const filteredList = useMemo(() => {
    return list.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;

      // Status filter
      if (statusFilter === "outofstock" && (item.stock ?? 0) > 0) return false;
      if (statusFilter === "instock" && (item.stock ?? 0) <= 0) return false;
      if (statusFilter === "approved" && item.status !== "approved") return false;
      if (statusFilter === "pending" && item.status !== "pending") return false;

      // Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const inName = item.name?.toLowerCase().includes(query);
        const inBrand = (item.brand || "").toLowerCase().includes(query);
        const inCat = (item.category || "").toLowerCase().includes(query);
        const inSubCat = (item.subCategory || "").toLowerCase().includes(query);
        const inSku = (item.sku || "").toLowerCase().includes(query);
        const inSeller = (item.sellerId?.shopName || "").toLowerCase().includes(query);
        return inName || inBrand || inCat || inSubCat || inSku || inSeller;
      }

      return true;
    });
  }, [list, selectedCategory, statusFilter, searchQuery]);

  // Stats calculation
  const totalProducts = list.length;
  const outOfStock = list.filter((item) => (item.stock ?? 0) <= 0).length;
  const uniqueCategories = categoriesList.length;
  const inStockCount = totalProducts - outOfStock;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, statusFilter, itemsPerPage]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredList.length);

  const displayedItems = useMemo(() => {
    return filteredList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredList, startIndex, itemsPerPage]);

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* ── Single Consolidated Container: Header, Stats & Search Bar ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3.5 shrink-0">
        
        {/* Top: Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-blue-600 dark:bg-blue-500/10 text-white dark:text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/10 shadow-xs shrink-0">
              <ClipboardList size={16} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Master Inventory Catalog</h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Live merchandise inventory, stock counts, SKU specifications, and merchant products</p>
            </div>
          </div>

          <button
            onClick={fetchList}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin text-blue-500" : ""} />
            <span>Refresh Inventory</span>
          </button>
        </div>

        {/* Middle: Dashboard Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Merchandise", val: totalProducts, sub: "Catalog Items Logged", icon: Box, color: "text-blue-500 bg-blue-500/10" },
            { label: "In Stock Items", val: inStockCount, sub: "Available for Order", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
            { label: "Out of Stock", val: outOfStock, sub: "Action Required", icon: AlertTriangle, color: outOfStock > 0 ? "text-rose-500 bg-rose-500/10" : "text-slate-400 bg-slate-500/10" },
            { label: "Active Categories", val: uniqueCategories, sub: "Taxonomy Groups", icon: Layers, color: "text-indigo-500 bg-indigo-500/10" }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl border bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 flex items-center justify-between group relative overflow-hidden"
              >
                <div className="space-y-1 relative z-10 text-left">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {card.label}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{card.val}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    {card.sub}
                  </span>
                </div>
                <div className={`p-2 rounded-lg border ${card.color} border-slate-200/50 dark:border-slate-800 transition-transform duration-200 group-hover:scale-105 relative z-10`}>
                  <Icon size={14} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom: Filter Pills, Category Dropdown & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: "all", label: "All Items" },
              { id: "instock", label: "In Stock" },
              { id: "outofstock", label: "Out of Stock" },
              { id: "approved", label: "Approved" },
              { id: "pending", label: "Pending" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  statusFilter === tab.id 
                    ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs" 
                    : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Category Dropdown */}
            {categoriesList.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-[10px] bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider outline-none transition focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}

            {/* Search Input Box */}
            <div className="relative flex items-center w-full sm:w-72 shrink-0">
              <Search size={13} className="absolute left-3 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, brand, SKU, seller..."
                className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Catalog Grid */}
      <div className="space-y-2.5">
        {loading && list.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-20 text-center text-xs font-bold text-slate-400 animate-pulse">
            Loading catalog inventory...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 text-center text-xs text-slate-500 dark:text-slate-400 shadow-xs flex flex-col items-center justify-center gap-2">
            <Box size={28} className="text-slate-300 dark:text-slate-700 mb-1" />
            <p className="font-bold text-slate-800 dark:text-slate-200">No merchandise items match your criteria</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Try adjusting filters or search keywords.</p>
          </div>
        ) : (
          displayedItems.map((item) => {
            const isOutOfStock = (item.stock ?? 0) <= 0;
            const imageSrc = item.images?.[0] 
              ? (item.images[0].startsWith('http') ? item.images[0] : `${backendUrl}/${item.images[0]}`)
              : null;

            return (
              <div
                key={item._id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition duration-200 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                {/* Image & Basic Details */}
                <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
                  <div className="relative h-14 w-14 shrink-0 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden p-1 flex items-center justify-center">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={item.name}
                        className="h-full w-full object-contain rounded-lg"
                      />
                    ) : (
                      <Box size={20} className="text-slate-300 dark:text-slate-700" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-xs text-slate-900 dark:text-white truncate max-w-[220px]">{item.name}</span>
                      {isOutOfStock ? (
                        <span className="px-1.5 py-0.5 text-[8px] bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black uppercase tracking-wider rounded-md">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider rounded-md">
                          In Stock
                        </span>
                      )}
                      {item.status && (
                        <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border ${ item.status === "approved" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" }`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                        {item.category || "Uncategorized"}
                      </span>
                      {item.subCategory && (
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">
                          • {item.subCategory}
                        </span>
                      )}
                      {item.sellerId?.shopName && (
                        <span className="flex items-center gap-1 text-slate-500 font-semibold">
                          <Store size={10} className="text-blue-500" />
                          {item.sellerId.shopName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Technical Specs: SKU, Brand, Sizes */}
                <div className="flex items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400 font-medium flex-wrap sm:flex-nowrap shrink-0">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Brand</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{item.brand || "—"}</span>
                  </div>
                  <div className="space-y-0.5 text-left border-l border-slate-100 dark:border-slate-800 pl-4">
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">SKU</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono font-bold">{item.sku || "—"}</span>
                  </div>
                  <div className="space-y-0.5 text-left border-l border-slate-100 dark:border-slate-800 pl-4">
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Variants</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">
                      {item.sizes?.length ? (Array.isArray(item.sizes) ? item.sizes.join(", ") : item.sizes) : "Default"}
                    </span>
                  </div>
                </div>

                {/* Price, Stock Count & Delete Action */}
                <div className="flex items-center gap-4 shrink-0 sm:pl-4 sm:border-l sm:border-slate-100 sm:dark:border-slate-800 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right space-y-0.5">
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      ₹{parseFloat(item.price || 0).toLocaleString()}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider block ${!isOutOfStock ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      Qty: {item.stock ?? 0}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteProduct(item._id)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition cursor-pointer active:scale-95 shadow-xs"
                    title="Delete Product Listing"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer Controls */}
      {filteredList.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Status info & Rows Selector */}
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
            <span>
              Showing <strong className="text-slate-900 dark:text-white font-black">{filteredList.length > 0 ? startIndex + 1 : 0}</strong> to <strong className="text-slate-900 dark:text-white font-black">{endIndex}</strong> of <strong className="text-slate-900 dark:text-white font-black">{filteredList.length}</strong> items
            </span>

            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-[10px] font-black text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
              title="First Page"
            >
              <ChevronsLeft size={14} />
            </button>

            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
              title="Previous Page"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((page, idx, arr) => {
                  const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <span className="px-1 text-slate-400 dark:text-slate-600 font-bold text-[10px]">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
              title="Last Page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default List;
