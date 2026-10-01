import React from "react";
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  X, 
  ArrowUpDown, 
  Filter,
  Layers,
  DollarSign,
  Boxes
} from "lucide-react";

const ProductsFiltersBar = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  stockFilter,
  setStockFilter,
  priceRangeFilter,
  setPriceRangeFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  rowsPerPage,
  setRowsPerPage,
  categories = [],
  totalFilteredCount = 0,
  totalProductsCount = 0,
  onResetFilters
}) => {
  const isFiltered = searchQuery || categoryFilter !== "All" || stockFilter !== "All" || priceRangeFilter !== "All" || sortBy !== "newest";

  const priceRanges = [
    { id: "All", label: "All Prices" },
    { id: "under500", label: "Under ₹500" },
    { id: "500to2000", label: "₹500 - ₹2,000" },
    { id: "2000to5000", label: "₹2,000 - ₹5,000" },
    { id: "above5000", label: "₹5,000 & Above" }
  ];

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2.5 transition-all">
      {/* Top Row: Search & View Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU, brand, tags, category..."
            className="w-full pl-9 pr-8 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200/70 dark:border-slate-800 focus:border-amber-500/60 dark:focus:border-amber-500/60 focus:bg-white dark:focus:bg-slate-950 outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Right Action Switchers: View Mode, Results Count, Items per page */}
        <div className="flex items-center gap-2 justify-between lg:justify-end flex-wrap shrink-0">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-slate-100">{totalFilteredCount}</strong> of {totalProductsCount} items
          </div>

          {/* View Mode Toggle (Table / Grid) */}
          <div className="flex bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Table View (Data Grid)"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Grid View (Showcase Cards)"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Multi-Filter Selectors */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
        {/* Category Filter */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
          <Layers size={12} className="text-amber-500 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="All" className="dark:bg-slate-900">All Categories</option>
            {categories.filter(c => c !== "All").map(cat => (
              <option key={cat} value={cat} className="dark:bg-slate-900">{cat}</option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
          <Boxes size={12} className="text-emerald-500 shrink-0" />
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="All" className="dark:bg-slate-900">All Stock Levels</option>
            <option value="Healthy" className="dark:bg-slate-900">Healthy Stock (10+)</option>
            <option value="Low Stock" className="dark:bg-slate-900">Low Stock (&lt; 10)</option>
            <option value="Out of Stock" className="dark:bg-slate-900">Out of Stock (0)</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
          <DollarSign size={12} className="text-amber-500 shrink-0" />
          <select
            value={priceRangeFilter}
            onChange={(e) => setPriceRangeFilter(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            {priceRanges.map(pr => (
              <option key={pr.id} value={pr.id} className="dark:bg-slate-900">{pr.label}</option>
            ))}
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800 ml-auto">
          <ArrowUpDown size={12} className="text-indigo-500 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="newest" className="dark:bg-slate-900">Sort: Newest First</option>
            <option value="name-asc" className="dark:bg-slate-900">Name: A to Z</option>
            <option value="name-desc" className="dark:bg-slate-900">Name: Z to A</option>
            <option value="price-asc" className="dark:bg-slate-900">Price: Low to High</option>
            <option value="price-desc" className="dark:bg-slate-900">Price: High to Low</option>
            <option value="stock-asc" className="dark:bg-slate-900">Stock: Low to High</option>
            <option value="stock-desc" className="dark:bg-slate-900">Stock: High to Low</option>
          </select>
        </div>

        {/* Rows per page */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
          <span>Show:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value) || 20)}
            className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value={10} className="dark:bg-slate-900">10</option>
            <option value={20} className="dark:bg-slate-900">20</option>
            <option value={50} className="dark:bg-slate-900">50</option>
            <option value={100} className="dark:bg-slate-900">100</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition cursor-pointer"
          >
            <X size={11} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductsFiltersBar;
