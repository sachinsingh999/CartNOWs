import React from "react";
import { Inbox, Sparkles, Navigation, DollarSign, Clock, MapPin, Package } from "lucide-react";

const AvailablePoolTab = ({
  filteredAvailableOrders,
  claimOrderHandler
}) => {
  // Compute metrics for the unassigned pool
  const totalPoolAmount = filteredAvailableOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="font-black text-base text-slate-900 dark:text-white tracking-tight">Unassigned Orders Dispatch Pool</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Claim packages in your designated delivery zone to start delivering.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-black px-2.5 py-1.5 rounded-xl shadow-sm animate-pulse">
            {filteredAvailableOrders.length} Shipments Available
          </span>
          {filteredAvailableOrders.length > 0 && (
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-2.5 py-1.5 rounded-xl shadow-sm">
              Commission Pool: ₹{totalPoolAmount}
            </span>
          )}
        </div>
      </div>

      {/* Available Pool Stats Grid */}
      {filteredAvailableOrders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
              <DollarSign size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Average Payout</p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                ₹{(totalPoolAmount / filteredAvailableOrders.length).toFixed(1)} <span className="text-[9px] font-bold text-slate-400">/ job</span>
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Average Transit</p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-1">~20 minutes</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
              <Package size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Sector Dispatch</p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-1">Manual Claim Mode</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Cards List */}
      {filteredAvailableOrders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-900 py-16 text-center text-xs text-slate-500 shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="h-11 w-11 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Inbox size={22} className="animate-bounce" />
          </div>
          <div>
            <p className="font-extrabold text-slate-700 dark:text-slate-300 text-sm">Pool is fully claimed</p>
            <p className="text-slate-500 mt-1 font-semibold max-w-[340px] mx-auto leading-relaxed">All unassigned packages in your dispatch sector are currently claimed by active courier partners.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAvailableOrders.map((order) => (
            <div 
              key={order._id} 
              className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5.5 shadow-sm flex flex-col justify-between gap-5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <span className="font-mono text-[9px] font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                    #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span className={`text-[9px] font-black border px-2.5 py-1 rounded-lg uppercase tracking-wider ${ order.paymentMethod.toLowerCase() === "cod" ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" }`}>
                    {order.paymentMethod}
                  </span>
                </div>
                
                <div className="text-xs space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="h-6 w-6 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 text-slate-400 dark:text-slate-500">
                      <MapPin size={12} />
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Sector Destination</span>
                      <p className="font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                        {order.address?.city}, {order.address?.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="h-6 w-6 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 text-slate-400 dark:text-slate-500">
                      <Package size={12} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Cargo Items</span>
                      <p className="text-slate-600 dark:text-slate-400 font-bold truncate mt-0.5">
                        {order.items.map(i => `${i.name} (x${i.qty})`).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-1">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Payout Commission</span>
                  <span className="font-black text-slate-900 dark:text-white text-base">₹{order.amount}</span>
                </div>
                <button
                  onClick={() => claimOrderHandler(order._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-slate-100 dark:text-white rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 hover:shadow-md hover:shadow-blue-500/10 active:scale-95 cursor-pointer flex items-center gap-2 group-hover:scale-105"
                >
                  <Sparkles size={11} className="animate-pulse" />
                  <span>Claim Shipment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailablePoolTab;
