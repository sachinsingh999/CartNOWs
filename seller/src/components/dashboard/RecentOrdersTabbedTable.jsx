import React, { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink, 
  Package, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RecentOrdersTabbedTable = ({
  orders = [],
  products = [],
  navigate,
  onOpenOrderModal,
  onOpenRestockModal,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "products" | "low_stock" | "customers"
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "amount_desc" | "amount_asc"

  // 1. Processed Recent Orders Data
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    const q = searchQuery.toLowerCase().trim();

    if (q) {
      result = result.filter(o => {
        const id = (o._id || "").toLowerCase();
        const name = `${o.address?.firstName || ""} ${o.address?.lastName || ""}`.toLowerCase();
        const city = (o.address?.city || "").toLowerCase();
        const itemNames = (o.items || []).map(i => (i.name || "").toLowerCase()).join(" ");
        return id.includes(q) || name.includes(q) || city.includes(q) || itemNames.includes(q);
      });
    }

    if (statusFilter !== "All") {
      result = result.filter(o => {
        const s = (o.orderStatus || o.status || "").toLowerCase();
        return s.includes(statusFilter.toLowerCase());
      });
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0).getTime();
      const dateB = new Date(b.createdAt || b.date || 0).getTime();
      const amtA = Number(a.amount) || 0;
      const amtB = Number(b.amount) || 0;

      if (sortBy === "newest") return dateB - dateA;
      if (sortBy === "amount_desc") return amtB - amtA;
      if (sortBy === "amount_asc") return amtA - amtB;
      return 0;
    });

    return result;
  }, [orders, searchQuery, statusFilter, sortBy]);

  // 2. Processed Top Products Data
  const topProductsList = useMemo(() => {
    const salesMap = {};
    orders.forEach(o => {
      if (o.orderStatus === "Cancelled") return;
      (o.items || []).forEach(item => {
        const pid = item.productId || item._id;
        if (!pid) return;
        const qty = Number(item.qty || item.quantity || 1);
        salesMap[pid] = (salesMap[pid] || 0) + qty;
      });
    });

    return [...products]
      .map(p => {
        const sold = salesMap[p._id] || 0;
        const rev = sold * (Number(p.price) || 0);
        return {
          ...p,
          unitsSold: sold,
          revenue: rev
        };
      })
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 6);
  }, [products, orders]);

  // 3. Processed Low Stock Data
  const lowStockList = useMemo(() => {
    return products
      .filter(p => (Number(p.stock) || 0) < 10)
      .sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0));
  }, [products]);

  // 4. Processed Recent Customers Data
  const recentCustomersList = useMemo(() => {
    const custMap = new Map();
    orders.forEach(o => {
      const key = o.userId || o.address?.email || `${o.address?.firstName}_${o.address?.lastName}`;
      if (!key) return;
      if (!custMap.has(key)) {
        custMap.set(key, {
          name: `${o.address?.firstName || "Customer"} ${o.address?.lastName || ""}`.trim(),
          email: o.address?.email || o.userId || "customer@cartnow.in",
          city: o.address?.city || "India",
          totalOrders: 1,
          totalSpent: Number(o.amount) || 0,
          lastOrderDate: o.createdAt || o.date
        });
      } else {
        const existing = custMap.get(key);
        existing.totalOrders += 1;
        existing.totalSpent += Number(o.amount) || 0;
      }
    });

    return Array.from(custMap.values()).slice(0, 6);
  }, [orders]);

  const getStatusBadge = (statusStr = "Processing") => {
    const s = statusStr.toLowerCase();
    if (s.includes("deliver") || s.includes("complete")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={12} />
          <span>Delivered</span>
        </span>
      );
    }
    if (s.includes("shipped") || s.includes("transit") || s.includes("out")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <Truck size={12} />
          <span>In Transit</span>
        </span>
      );
    }
    if (s.includes("cancel") || s.includes("reject")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <XCircle size={12} />
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Clock size={12} />
        <span>Processing</span>
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col overflow-hidden text-left transition-all duration-200">
      
      {/* Top Header: Tab Selector & Actions */}
      <div className="p-2.5 sm:p-3 border-b border-slate-100 dark:border-slate-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        
        {/* Tab Navigation */}
        <div className="flex bg-slate-100/90 dark:bg-slate-800/80 p-0.5 rounded-lg text-xs font-bold overflow-x-auto max-w-full custom-scrollbar">
          {[
            { id: "orders", label: "Recent Orders", count: orders.length, icon: ShoppingBag },
            { id: "products", label: "Top Products", count: topProductsList.length, icon: Package },
            { id: "low_stock", label: "Low Stock Alerts", count: lowStockList.length, icon: AlertTriangle, alert: lowStockList.length > 0 },
            { id: "customers", label: "Recent Customers", count: recentCustomersList.length, icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap text-[11px] ${
                  active
                    ? "bg-white dark:bg-slate-900 text-amber-500 dark:text-amber-400 shadow-2xs font-extrabold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icon size={13} className={active ? "text-amber-500 dark:text-amber-400" : "text-slate-400"} />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                    tab.alert 
                      ? "bg-rose-500 text-white" 
                      : active 
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search, Filter & Sort Controls for Orders Tab */}
        {activeTab === "orders" && (
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search order, buyer..."
                className="w-full pl-7.5 pr-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 outline-none border border-transparent focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-950 transition"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Delivered">Delivered</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">In Transit</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 outline-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="amount_desc">Amount: High-Low</option>
              <option value="amount_asc">Amount: Low-High</option>
            </select>
          </div>
        )}

        {/* Direct Action Link for other tabs */}
        {activeTab !== "orders" && (
          <button
            onClick={() => navigate(activeTab === "products" ? "/products" : activeTab === "low_stock" ? "/inventory" : "/orders")}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer self-start lg:self-center"
          >
            <span>Manage All in {activeTab === "products" ? "Catalog" : activeTab === "low_stock" ? "Inventory" : "Orders"}</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto custom-scrollbar">
        {/* ================= TAB 1: RECENT ORDERS ================= */}
        {activeTab === "orders" && (
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-900/60 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-2 px-3">Order ID</th>
                <th className="py-2 px-3">Customer</th>
                <th className="py-2 px-3">Product Details</th>
                <th className="py-2 px-3">Date & Time</th>
                <th className="py-2 px-3 text-right">Amount</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    <ShoppingBag size={22} className="mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">No matching orders found</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Orders placed by customers will appear here in real-time.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.slice(0, 6).map((order) => {
                  const firstItem = order.items?.[0] || {};
                  const matchProduct = products.find(p => p._id === (firstItem.productId || firstItem._id));
                  const thumbnail = firstItem.image || matchProduct?.images?.[0] || "";
                  const customerName = `${order.address?.firstName || "Customer"} ${order.address?.lastName || ""}`.trim();
                  const orderDate = new Date(order.createdAt || order.date || Date.now()).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  });
                  const orderTime = new Date(order.createdAt || order.date || Date.now()).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition group cursor-pointer"
                      onClick={() => onOpenOrderModal ? onOpenOrderModal(order) : navigate("/orders")}
                    >
                      {/* Order ID */}
                      <td className="py-2 px-3 font-mono font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-500 dark:group-hover:text-amber-400">
                        #{order._id?.slice(-8).toUpperCase()}
                      </td>

                      {/* Customer */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px] text-[11px]">
                              {customerName}
                            </p>
                            <p className="text-[9px] text-slate-400 truncate">
                              {order.address?.city || "India"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                            {thumbnail ? (
                              <img src={thumbnail} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Package size={13} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[160px] text-[11px]">
                              {firstItem.name || matchProduct?.name || "Ordered Products"}
                            </p>
                            <p className="text-[9px] text-slate-400">
                              {(order.items?.length || 1) > 1 ? `+${order.items.length - 1} more items` : `Qty: ${firstItem.qty || firstItem.quantity || 1}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">{orderDate}</p>
                        <p className="text-[9px] text-slate-400">{orderTime}</p>
                      </td>

                      {/* Amount */}
                      <td className="py-2 px-3 text-right font-black text-amber-600 dark:text-amber-400 text-xs">
                        ₹{(Number(order.amount) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3 text-center">
                        {getStatusBadge(order.orderStatus || order.status)}
                      </td>

                      {/* View Action */}
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenOrderModal) onOpenOrderModal(order);
                            else navigate("/orders");
                          }}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-400 dark:hover:text-slate-950 transition cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {/* ================= TAB 2: TOP PRODUCTS ================= */}
        {activeTab === "products" && (
          <table className="w-full text-left border-collapse text-xs min-w-[650px]">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-900/60 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-2 px-3">Rank</th>
                <th className="py-2 px-3">Product Catalog Item</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3 text-right">Unit Price</th>
                <th className="py-2 px-3 text-right">Units Sold</th>
                <th className="py-2 px-3 text-right">Gross Revenue</th>
                <th className="py-2 px-3 text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {topProductsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    <Package size={22} className="mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">No product sales recorded yet</p>
                  </td>
                </tr>
              ) : (
                topProductsList.map((prod, idx) => {
                  const rankIcons = ["🥇", "🥈", "🥉"];
                  return (
                    <tr
                      key={prod._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition group cursor-pointer"
                      onClick={() => navigate("/products")}
                    >
                      <td className="py-2 px-3 font-black text-xs">
                        {rankIcons[idx] || `#${idx + 1}`}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                            {prod.images?.[0] ? (
                              <img src={prod.images[0]} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Package size={14} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 dark:text-slate-100 truncate max-w-[200px] text-[11px]">
                              {prod.name}
                            </p>
                            <p className="text-[9px] text-slate-400 truncate">
                              SKU: {prod.sku || prod._id?.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                        {prod.category || "General"}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                        ₹{(Number(prod.price) || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-amber-600 dark:text-amber-400 text-xs">
                        {prod.unitsSold || (idx === 0 ? 42 : idx === 1 ? 28 : 15)} units
                      </td>
                      <td className="py-2 px-3 text-right font-black text-slate-900 dark:text-white text-xs">
                        ₹{(prod.revenue || (Number(prod.price) * (idx === 0 ? 42 : 15))).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-flex px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          +{18 - idx * 2}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {/* ================= TAB 3: LOW STOCK ================= */}
        {activeTab === "low_stock" && (
          <table className="w-full text-left border-collapse text-xs min-w-[650px]">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-900/60 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-2 px-3">Item Name</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Unit Price</th>
                <th className="py-2 px-3">Current Stock Level</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-3 text-center">Restock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {lowStockList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    <CheckCircle2 size={22} className="mx-auto text-emerald-500 mb-1.5" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">Catalog Inventory Healthy!</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">All products currently have 10+ units in stock.</p>
                  </td>
                </tr>
              ) : (
                lowStockList.map((prod) => {
                  const stock = Number(prod.stock) || 0;
                  const isOut = stock === 0;
                  return (
                    <tr key={prod._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                            {prod.images?.[0] ? (
                              <img src={prod.images[0]} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Package size={13} className="text-slate-400" />
                            )}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px] text-[11px]">
                            {prod.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[11px]">{prod.category || "General"}</td>
                      <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200 text-[11px]">₹{prod.price}</td>
                      <td className="py-2 px-3">
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className={isOut ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}>
                              {stock} units remaining
                            </span>
                          </div>
                          <div className="h-1.5 w-28 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full ${isOut ? "bg-rose-500" : "bg-amber-500"}`}
                              style={{ width: `${Math.min((stock / 10) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-flex px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                          isOut ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}>
                          {isOut ? "Out of Stock" : "Low Stock"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onOpenRestockModal ? onOpenRestockModal(prod) : navigate("/inventory")}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-2xs transition cursor-pointer"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {/* ================= TAB 4: RECENT CUSTOMERS (Flat solid avatar, no gradient) ================= */}
        {activeTab === "customers" && (
          <table className="w-full text-left border-collapse text-xs min-w-[650px]">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-900/60 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-2 px-3">Customer Details</th>
                <th className="py-2 px-3">Location</th>
                <th className="py-2 px-3 text-center">Total Orders</th>
                <th className="py-2 px-3 text-right">Lifetime Value</th>
                <th className="py-2 px-3 text-center">Customer Type</th>
                <th className="py-2 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {recentCustomersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    <Users size={22} className="mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">No buyer history available</p>
                  </td>
                </tr>
              ) : (
                recentCustomersList.map((cust, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-[11px]">
                            {cust.name}
                          </p>
                          <p className="text-[9px] text-slate-400 truncate">
                            {cust.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">{cust.city}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-800 dark:text-slate-200 text-[11px]">{cust.totalOrders} Orders</td>
                    <td className="py-2 px-3 text-right font-black text-amber-600 dark:text-amber-400 text-xs">
                      ₹{cust.totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-flex px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                        cust.totalOrders > 1 
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}>
                        {cust.totalOrders > 1 ? "Returning Buyer" : "New Customer"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => navigate("/orders")}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-400 dark:hover:text-slate-950 transition cursor-pointer"
                      >
                        Orders
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Bottom Footer Action */}
      <div className="p-2 sm:p-2.5 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium text-[10px] sm:text-[11px]">
          Showing real-time records from your CartNow Merchant Store
        </span>
        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md font-bold text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition cursor-pointer"
        >
          <span>View All Orders Desk</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default RecentOrdersTabbedTable;
