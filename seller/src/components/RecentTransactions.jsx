import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Search, Filter, ArrowUpDown } from "lucide-react";

const RecentTransactions = ({ orders = [], products = [], navigate }) => {
  const shouldReduceMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date_desc"); // "date_desc" | "date_asc" | "amount_desc" | "amount_asc"

  // Local filtering logic
  const filteredOrders = orders.filter((order) => {
    const fullName = `${order.address?.firstName || ""} ${order.address?.lastName || ""}`.toLowerCase();
    const orderId = order._id?.toLowerCase() || "";
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || orderId.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Local sorting logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date || 0);
    const dateB = new Date(b.createdAt || b.date || 0);
    if (sortBy === "date_desc") return dateB - dateA;
    if (sortBy === "date_asc") return dateA - dateB;
    if (sortBy === "amount_desc") return (b.amount || 0) - (a.amount || 0);
    if (sortBy === "amount_asc") return (a.amount || 0) - (b.amount || 0);
    return 0;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white dark:bg-slate-900/35 border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 backdrop-blur-xl shadow-2xl space-y-5 h-full flex flex-col justify-between text-slate-800 dark:text-slate-100"
    >
      {/* Header controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-800 pb-4">
        <div className="text-left">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Recent Transactions</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Real-time buyer transaction activity and payments status.</p>
        </div>
        
        {/* Actions button */}
        <button
          onClick={() => navigate("/orders")}
          className="text-[10px] font-black uppercase text-orange-650 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
        >
          <span>View All Orders</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Filter, Search, and Sort Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
            <Search size={12} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer or order ref..."
            className="w-full pl-8.5 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-450 dark:placeholder:text-slate-650 focus:bg-white dark:focus:bg-slate-950 focus:border-slate-300 dark:focus:border-slate-700 transition-all duration-150"
          />
        </div>

        {/* Filter & Sort select fields */}
        <div className="flex gap-2.5 shrink-0">
          
          {/* Filter Dropdown */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
              <Filter size={11} />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-7.5 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 outline-none cursor-pointer focus:border-slate-300 dark:focus:border-slate-700 transition appearance-none font-bold"
            >
              <option value="All">All Statuses</option>
              <option value="Delivered">Delivered</option>
              <option value="Processing">Processing</option>
              <option value="In Transit">In Transit</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
              <ArrowUpDown size={11} />
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-7.5 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 outline-none cursor-pointer focus:border-slate-300 dark:focus:border-slate-700 transition appearance-none font-bold"
            >
              <option value="date_desc">Newest Date</option>
              <option value="date_asc">Oldest Date</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>

        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto flex-1 min-h-[220px]">
        <table className="w-full text-left border-collapse text-xs min-w-[580px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-950/40">
              <th className="py-3 px-3 rounded-l-lg">Order Ref</th>
              <th className="py-3 px-3">Recipient</th>
              <th className="py-3 px-3">Product Image</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right rounded-r-lg">Total Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900/40">
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-slate-505 font-medium">
                  No matches found for active query.
                </td>
              </tr>
            ) : (
              sortedOrders.slice(0, 5).map((order) => {
                const initials = `${order.address?.firstName?.charAt(0) || ""}${order.address?.lastName?.charAt(0) || ""}`.toUpperCase() || "C";
                const dateStr = new Date(order.createdAt || order.date || Date.now()).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short"
                });

                // Find matching product image from products
                const matchProdId = order.items?.[0]?.productId || order.items?.[0]?._id;
                const matchProd = products.find(p => p._id === matchProdId);
                const thumbImage = matchProd?.images?.[0] || order.items?.[0]?.image || "";

                return (
                  <tr 
                    key={order._id} 
                    className="group text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/45 transition duration-150"
                  >
                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] text-slate-450 dark:text-slate-550 font-bold group-hover:text-slate-650 dark:group-hover:text-slate-400">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-[8.5px] text-slate-500 dark:text-slate-400 uppercase select-none shrink-0 shadow-sm">
                          {initials}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white">
                          {order.address?.firstName} {order.address?.lastName}
                        </span>
                      </div>
                    </td>

                    {/* Product image thumbnail */}
                    <td className="py-3 px-3">
                      <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {thumbImage ? (
                          <img src={thumbImage} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[6px] text-slate-400 font-bold uppercase">Item</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-500 dark:text-slate-400">
                      {dateStr}
                    </td>
                    
                    <td className="py-3 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                        order.orderStatus === "Delivered" 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                          : order.orderStatus === "Cancelled" 
                          ? "bg-red-500/10 border-red-500/20 text-red-650 dark:text-red-400" 
                          : order.orderStatus === "In Transit" 
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                          : "bg-blue-500/10 border-blue-500/20 text-blue-650 dark:text-blue-400"
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    
                    <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white">
                      ₹{order.amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default RecentTransactions;
