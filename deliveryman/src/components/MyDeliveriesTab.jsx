import React from "react";
import { 
  Calendar, Search, ChevronLeft, ChevronRight, Phone, MapPin, 
  CheckCircle, Clock, Navigation, Inbox, CalendarDays, DollarSign, 
  Wallet, Truck, Sparkles, Activity
} from "lucide-react";

const MyDeliveriesTab = ({
  driver,
  stats,
  orders,
  nextOrder,
  pendingAcceptance = [],
  handleAcceptAssignment,
  handleRejectAssignment,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  tablePage,
  setTablePage,
  tableRowsPerPage,
  handleStatusChange,
  setVerifyModal,
  formatAddress,
  getStatusBadgeStyle,
  completedTodayCount,
  todayEarningsVal,
  tableFilteredOrders,
  paginatedTableOrders,
  totalTablePages
}) => {
  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      
      {/* Welcome & Compact Duty Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4.5 shadow-sm text-xs transition-all duration-300">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Activity size={14} className="animate-pulse" />
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Agent: </span>
              <span className="font-extrabold text-slate-900 dark:text-white">{driver?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className={`h-2.5 w-2.5 rounded-full ${stats.isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            <span className={`font-black uppercase tracking-widest text-[9px] ${stats.isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-slate-505 dark:text-slate-500"}`}>
              {stats.isOnline ? "Duty: Online" : "Duty: Offline"}
            </span>
          </div>
          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <div className="hidden sm:block">
            <span className="text-slate-500 dark:text-slate-400">Zone Sector: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{driver?.deliveryZone || "Zone A-2"}</span>
          </div>
          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block" />
          <div className="hidden md:block">
            <span className="text-slate-500 dark:text-slate-400">Radius Limit: </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{driver?.deliveryRadius || 10} km</span>
          </div>
        </div>
      </div>

      {/* Redesigned Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Commission */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-[#111827] dark:to-[#111827]/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-505 dark:text-emerald-400">
            <Sparkles size={12} />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Today's Earnings</p>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{todayEarningsVal}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">({completedTodayCount} jobs)</span>
          </div>
          <div className="mt-2.5 h-1 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (completedTodayCount / 8) * 100)}%` }} />
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-[#111827] dark:to-[#111827]/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-500">
            <Wallet size={12} />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Total Commission</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-3">₹{stats.totalEarnings?.toFixed(2)}</p>
          <div className="mt-2.5 h-1 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: '100%' }} />
          </div>
        </div>

        {/* COD Cash Collected */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-[#111827] dark:to-[#111827]/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-500">
            <DollarSign size={12} />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">COD Cash on Hand</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-3">₹{stats.cashCollected?.toFixed(2)}</p>
          <div className="mt-2.5 h-1 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: stats.cashCollected > 0 ? '60%' : '0%' }} />
          </div>
        </div>

        {/* Pending Deliveries */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-[#111827] dark:to-[#111827]/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500">
            <Truck size={12} />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Active Deliveries</p>
          <p className="text-2xl font-black text-indigo-650 dark:text-indigo-400 mt-3">
            {orders.filter(o => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length}
          </p>
          <div className="mt-2.5 h-1 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: '40%' }} />
          </div>
        </div>
      </div>

      {/* PENDING ASSIGNMENTS REQUEST SECTION */}
      {pendingAcceptance && pendingAcceptance.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Pending Delivery Requests ({pendingAcceptance.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingAcceptance.map((order) => (
              <div 
                key={order._id} 
                className="bg-gradient-to-br from-rose-50/50 to-white dark:from-[#1e1520] dark:to-[#111827] border-2 border-rose-100 dark:border-rose-950/40 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-rose-200 dark:hover:border-rose-900/60"
              >
                {/* Accent glow */}
                <div className="absolute top-0 right-0 h-24 w-24 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                      Action Required
                    </span>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mt-1.5">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-rose-605 dark:text-rose-400">
                      ₹{order.amount}
                    </span>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-405 dark:text-slate-500 block">Customer</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {order.address?.firstName} {order.address?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-405 dark:text-slate-500 block">Address</span>
                    <span className="font-semibold text-slate-655 dark:text-slate-350 line-clamp-2">
                      {formatAddress(order.address)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-5">
                  <button
                    onClick={() => handleRejectAssignment(order._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-800/80 hover:border-rose-200 dark:hover:border-rose-900/60 text-slate-755 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs active:scale-98"
                  >
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleAcceptAssignment(order._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md shadow-emerald-500/10 active:scale-98"
                  >
                    <span>Accept</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRIORITY NEXT TASK SECTION */}
      {nextOrder ? (
        <div className="bg-white dark:bg-[#111827] border-l-4 border-l-blue-600 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="bg-blue-600 text-white font-extrabold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm shadow-blue-500/10">
                Active Dispatch
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                Order ID: <span className="text-slate-900 dark:text-white font-extrabold">#{nextOrder._id.slice(-6).toUpperCase()}</span>
              </span>
            </div>
            
            {/* Status Updater Select */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Change Status:</span>
              <select
                value={nextOrder.orderStatus}
                onChange={(e) => handleStatusChange(nextOrder._id, e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:border-blue-600 transition"
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Details Column */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Customer Name</p>
                  <p className="font-black text-slate-900 dark:text-white text-base mt-1">
                    {nextOrder.address.firstName} {nextOrder.address.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Delivery Address</p>
                  <p className="leading-relaxed text-slate-650 dark:text-slate-300 text-xs font-semibold mt-1">
                    {formatAddress(nextOrder.address)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Distance & ETA</p>
                  <p className="font-extrabold text-slate-900 dark:text-white text-xs mt-1">
                    3.5 km <span className="text-slate-450 dark:text-slate-500 font-medium">/ ~25 mins dispatch</span>
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Payment & Cash</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border ${
                      nextOrder.paymentMethod.toLowerCase() === "cod"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {nextOrder.paymentMethod}
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {nextOrder.paymentMethod.toLowerCase() === "cod" ? `Collect ₹${nextOrder.amount}` : "Paid Online"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Column */}
            <div className="lg:col-span-4 flex flex-col gap-3 w-full">
              <div className="flex gap-2">
                {/* Call Customer */}
                <a
                  href={`tel:${nextOrder.address.phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm"
                >
                  <Phone size={12} />
                  <span>Call Customer</span>
                </a>
                
                {/* Google Maps Navigate */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(nextOrder.address))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm"
                >
                  <MapPin size={12} className="text-blue-500 dark:text-blue-400 animate-bounce" />
                  <span>Navigate</span>
                </a>
              </div>

              {/* Contextual Action Button */}
              {nextOrder.orderStatus === "Out for Delivery" ? (
                <button
                  onClick={() => setVerifyModal({ open: true, orderId: nextOrder._id, status: "Delivered" })}
                  className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-emerald-500/10 active:scale-98 cursor-pointer"
                >
                  <CheckCircle size={12} />
                  <span>Verify & Complete Job</span>
                </button>
              ) : nextOrder.orderStatus === "Shipped" ? (
                <button
                  onClick={() => handleStatusChange(nextOrder._id, "Out for Delivery")}
                  className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-blue-500/10 active:scale-98 cursor-pointer"
                >
                  <Navigation size={12} className="rotate-45" />
                  <span>Mark Out for Delivery</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange(nextOrder._id, "Out for Delivery")}
                  className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-blue-500/10 active:scale-98 cursor-pointer"
                >
                  <span>Advance Job Status</span>
                </button>
              )}
            </div>

          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-105 dark:border-slate-800 flex items-center justify-center text-slate-400">
            <Inbox size={20} />
          </div>
          <div>
            <p className="font-extrabold text-slate-700 dark:text-slate-300">No priority shipments assigned</p>
            <p className="text-slate-500 mt-1">Claim new orders from the Available Pool tab or wait for automatic assignments.</p>
          </div>
        </div>
      )}

      {/* Date Filter Panel */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-505 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
            <Calendar size={14} />
          </div>
          <div>
            <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider leading-none">Filter Assignments</h4>
            <p className="text-[9px] text-slate-550 dark:text-slate-500 mt-1">Filter shipments in the logistics table below</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 flex-1 md:flex-none">
            <span className="text-[9px] font-black uppercase text-slate-500">From:</span>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-705 dark:text-slate-300 outline-none w-full cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 flex-1 md:flex-none">
            <span className="text-[9px] font-black uppercase text-slate-500">To:</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-705 dark:text-slate-300 outline-none w-full cursor-pointer"
            />
          </div>
          {(filterStartDate || filterEndDate) && (
            <button
              onClick={() => {
                setFilterStartDate("");
                setFilterEndDate("");
              }}
              className="text-[10px] font-black text-rose-500 hover:text-rose-600 transition uppercase tracking-wider px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-950 bg-rose-50 dark:bg-rose-950/20 cursor-pointer w-full md:w-auto text-center"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Unified Logistics Data Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
        <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight shrink-0">Logistics Dispatch Center</h3>
          
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[140px] md:w-56 md:flex-none">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-505 pointer-events-none">
                <Search size={12} />
              </span>
              <input
                type="text"
                placeholder="Search ID, Customer..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setTablePage(1);
                }}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 transition"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setTablePage(1);
              }}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:border-blue-600 transition shrink-0"
            >
              <option value="All">All Jobs</option>
              <option value="Pending">Pending</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-650 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-3.5 px-5">Order ID</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Payment</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedTableOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-500">
                    No orders match the current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedTableOrders.map((order) => {
                  const isNext = nextOrder && nextOrder._id === order._id;
                  return (
                    <tr key={order._id} className={`hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors duration-150 ${isNext ? "bg-blue-500/5 dark:bg-blue-500/10" : ""}`}>
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-600 dark:text-slate-400">
                        #{order._id.slice(-6).toUpperCase()}
                        {isNext && (
                          <span className="ml-2 bg-blue-550/20 text-blue-550 dark:text-blue-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Next</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-extrabold text-slate-900 dark:text-white">
                        {order.address?.firstName} {order.address?.lastName}
                      </td>
                      <td className="py-3.5 px-5 font-extrabold text-slate-500 uppercase text-[10px]">
                        {order.paymentMethod}
                      </td>
                      <td className="py-3.5 px-5">
                        {order.assignmentStatus === "Assigned" ? (
                          <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border bg-amber-50 text-amber-705 dark:text-amber-550 dark:text-amber-400 border-amber-100 dark:border-amber-950/35">
                            Pending Accept
                          </span>
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getStatusBadgeStyle(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-550 dark:text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 font-black text-slate-850 dark:text-slate-205">
                        ₹{order.amount}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {order.orderStatus === "Delivered" ? (
                          <span className="text-emerald-500 font-extrabold text-[10px] mr-2">✓ Delivered</span>
                        ) : order.assignmentStatus === "Assigned" ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleRejectAssignment(order._id)}
                              className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/20 text-rose-605 dark:text-rose-450 dark:text-rose-400 rounded-lg border border-rose-100 dark:border-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleAcceptAssignment(order._id)}
                              className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition cursor-pointer"
                            >
                              Accept
                            </button>
                          </div>
                        ) : (
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:border-blue-600 transition"
                          >
                            <option value="Order Placed">Placed</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalTablePages > 1 && (
          <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/20">
            <span className="text-slate-550 dark:text-slate-400">
              Showing Page {tablePage} of {totalTablePages} ({tableFilteredOrders.length} total entries)
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                disabled={tablePage === 1}
                onClick={() => setTablePage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white transition disabled:opacity-40 cursor-pointer hover:scale-102 active:scale-95"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                disabled={tablePage === totalTablePages}
                onClick={() => setTablePage(p => Math.min(totalTablePages, p + 1))}
                className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white transition disabled:opacity-40 cursor-pointer hover:scale-102 active:scale-95"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default MyDeliveriesTab;
