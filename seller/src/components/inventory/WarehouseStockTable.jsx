import React, { useState, useMemo } from "react";
import { 
  Search, 
  Layers, 
  ArrowUpDown, 
  Filter, 
  Plus, 
  Minus, 
  Check, 
  X, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Truck,
  Boxes,
  RotateCcw
} from "lucide-react";
import { toast } from "react-toastify";

const WarehouseStockTable = ({
  products = [],
  orders = [],
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  onQuickRestock,
  restockUpdatingId = null,
  onOpenSinglePO,
  loading = false
}) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [sortBy, setSortBy] = useState("stock-asc"); // "stock-asc" | "stock-desc" | "val-desc" | "name-asc"

  const [editingStockId, setEditingStockId] = useState(null);
  const [inputStockVal, setInputStockVal] = useState(0);

  const categories = useMemo(() => {
    return ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
  }, [products]);

  // Compute sales velocity map (units sold in past orders)
  const salesVelocityMap = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      if (o.orderStatus === "Cancelled") return;
      (o.items || []).forEach(item => {
        const pid = item.productId || item._id;
        if (pid) {
          map[pid] = (map[pid] || 0) + (Number(item.qty || item.quantity || 1));
        }
      });
    });
    return map;
  }, [orders]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(p => {
        const name = (p.name || "").toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        const cat = (p.category || "").toLowerCase();
        return name.includes(q) || sku.includes(q) || cat.includes(q);
      });
    }

    if (categoryFilter !== "All") {
      result = result.filter(p => p.category === categoryFilter);
    }

    if (urgencyFilter !== "All") {
      result = result.filter(p => {
        const s = parseInt(p.stock, 10) || 0;
        if (urgencyFilter === "oos") return s === 0;
        if (urgencyFilter === "low") return s > 0 && s < 10;
        if (urgencyFilter === "healthy") return s >= 10;
        return true;
      });
    }

    result.sort((a, b) => {
      const stockA = parseInt(a.stock, 10) || 0;
      const stockB = parseInt(b.stock, 10) || 0;
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      const valA = priceA * stockA;
      const valB = priceB * stockB;
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();

      if (sortBy === "stock-asc") return stockA - stockB;
      if (sortBy === "stock-desc") return stockB - stockA;
      if (sortBy === "val-desc") return valB - valA;
      if (sortBy === "name-asc") return nameA.localeCompare(nameB);
      return 0;
    });

    return result;
  }, [products, search, categoryFilter, urgencyFilter, sortBy]);

  const isAllSelected = filteredProducts.length > 0 && selectedIds.length === filteredProducts.length;

  const handleInlineInputSubmit = async (productId) => {
    if (inputStockVal < 0) {
      toast.error("Stock cannot be negative.");
      return;
    }
    await onQuickRestock(productId, inputStockVal);
    setEditingStockId(null);
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2.5 p-3 sm:p-4 text-left transition-all">
      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search warehouse SKUs, product title, category..."
            className="w-full pl-9 pr-8 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200/70 dark:border-slate-800 focus:border-amber-500/60 outline-none transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filters & Sorting */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          {/* Category */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <Layers size={12} className="text-amber-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              {categories.map(c => (
                <option key={c} value={c} className="dark:bg-slate-900">{c === "All" ? "All Categories" : c}</option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <Filter size={12} className="text-rose-500" />
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="All" className="dark:bg-slate-900">All Stock Statuses</option>
              <option value="oos" className="dark:bg-slate-900">Out of Stock (0 Units)</option>
              <option value="low" className="dark:bg-slate-900">Low Stock (&lt;10 Units)</option>
              <option value="healthy" className="dark:bg-slate-900">Optimal Buffer (10+ Units)</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <ArrowUpDown size={12} className="text-indigo-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="stock-asc" className="dark:bg-slate-900">Stock: Low to High</option>
              <option value="stock-desc" className="dark:bg-slate-900">Stock: High to Low</option>
              <option value="val-desc" className="dark:bg-slate-900">Locked Capital: High to Low</option>
              <option value="name-asc" className="dark:bg-slate-900">SKU Title: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Warehouse Ledger Table */}
      <div className="overflow-x-auto custom-scrollbar border border-slate-100 dark:border-slate-800/80 rounded-xl">
        <table className="w-full text-left border-collapse min-w-[780px]">
          <thead>
            <tr className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/60">
              <th className="py-2.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
                  title="Select all items"
                />
              </th>
              <th className="py-2.5 px-3">Item & SKU Identification</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-right">Locked Capital</th>
              <th className="py-2.5 px-3 text-center">Stock on Hand</th>
              <th className="py-2.5 px-3 text-center">Replenishment Quick Presets</th>
              <th className="py-2.5 px-3 text-right pr-3.5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400 font-semibold">
                  No warehouse inventory items found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const stock = parseInt(p.stock, 10) || 0;
                const price = parseFloat(p.price) || 0;
                const valuation = price * stock;
                const isSelected = selectedIds.includes(p._id);
                const isUpdating = restockUpdatingId === p._id;
                const isEditingThis = editingStockId === p._id;

                const isOut = stock === 0;
                const isLow = stock > 0 && stock < 10;
                const isOptimal = stock >= 10;
                const unitsSold = salesVelocityMap[p._id] || 0;

                const imageSrc = p.images?.[0] || p.image?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100";

                return (
                  <tr
                    key={p._id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors ${
                      isSelected ? "bg-amber-50/30 dark:bg-amber-950/20" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(p._id)}
                        className="rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
                      />
                    </td>

                    {/* Item & SKU */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 overflow-hidden shrink-0 shadow-2xs">
                          <img src={imageSrc} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate max-w-[200px]" title={p.name}>
                            {p.name}
                          </p>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.2 rounded">
                              SKU: {p.sku || `#${p._id.slice(-6).toUpperCase()}`}
                            </span>
                            {unitsSold > 0 && (
                              <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                                • {unitsSold} Sold Recently
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {p.category || "General"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white text-xs">
                      ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                    </td>

                    {/* Locked Capital */}
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-xs font-black text-amber-500 dark:text-amber-400">
                        ₹{valuation.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                    </td>

                    {/* Stock on Hand + Status */}
                    <td className="py-2.5 px-3 text-center">
                      {isEditingThis ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={inputStockVal}
                            onChange={(e) => setInputStockVal(Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className="w-16 px-1.5 py-0.5 text-center text-xs font-black rounded bg-slate-100 dark:bg-slate-800 border border-amber-500 outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleInlineInputSubmit(p._id)}
                            className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer"
                            title="Save"
                          >
                            <Check size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStockId(null)}
                            className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                            title="Cancel"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          <span 
                            onClick={() => {
                              setEditingStockId(p._id);
                              setInputStockVal(stock);
                            }}
                            className={`text-xs font-black cursor-pointer hover:underline ${
                              isOut 
                                ? "text-rose-600 dark:text-rose-400" 
                                : isLow 
                                ? "text-amber-600 dark:text-amber-400" 
                                : "text-slate-900 dark:text-white"
                            }`}
                            title="Click to edit stock exact count"
                          >
                            {stock} Units
                          </span>

                          <span className={`inline-flex items-center gap-1 text-[8.5px] font-extrabold px-1.5 py-0.2 rounded ${
                            isOut 
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" 
                              : isLow 
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}>
                            {isOut ? "Out of Stock" : isLow ? "Low Buffer" : "Optimal"}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Replenishment Presets */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        {[10, 25, 50, 100].map((qty) => (
                          <button
                            key={qty}
                            type="button"
                            disabled={isUpdating}
                            onClick={() => onQuickRestock(p._id, stock + qty)}
                            className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 transition cursor-pointer active:scale-90"
                            title={`Instantly add +${qty} units`}
                          >
                            +{qty}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Action: PO Slip */}
                    <td className="py-2.5 px-3 text-right pr-3.5">
                      <button
                        type="button"
                        onClick={() => onOpenSinglePO && onOpenSinglePO(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition cursor-pointer"
                        title="Generate Supplier Restock Purchase Order"
                      >
                        <Truck size={11} />
                        <span>PO Slip</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WarehouseStockTable;
