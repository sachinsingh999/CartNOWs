import React, { useState } from "react";
import { Inbox, Sparkles, Navigation, DollarSign, Clock, MapPin, Package, ArrowRight, Activity, Loader2, CheckCircle2 } from "lucide-react";

/**
 * Redesigned Available Pool Tab.
 * Standardizes currency formatting (comma-grouped raw values), preserves responsive vertical details stack,
 * and applies a clean, minimalist card aesthetic with dynamic click animations.
 */
const AvailablePoolTab = ({
  filteredAvailableOrders,
  claimOrderHandler,
  driver
}) => {
  const [claimingId, setClaimingId] = useState(null);

  const handleClaim = async (orderId) => {
    setClaimingId(orderId);
    try {
      await claimOrderHandler(orderId);
    } finally {
      setClaimingId(null);
    }
  };

  const totalPoolAmount = filteredAvailableOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

  // Format currency with standard commas (preserves raw database values for testing/debugging)
  const formatCommission = (amount) => {
    if (!amount && amount !== 0) return "₹0.00";
    return `₹${parseFloat(amount.toFixed(2)).toLocaleString("en-IN")}`;
  };

  // Estimate transit dynamically based on driver range (approx. 2.5 mins per km)
  const averageTransit = driver?.deliveryRadius 
    ? `~${Math.round(driver.deliveryRadius * 2.5)} minutes`
    : "~20 minutes";

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
            <Activity className="text-slate-500" size={16} />
            Unassigned Orders Dispatch Pool
          </h3>
          <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1 font-bold uppercase tracking-wider">
            Review and claim unassigned packages inside your dispatch zone
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-[9px] font-black px-3 py-1.5 rounded-xl shadow-xs uppercase tracking-wider">
            {filteredAvailableOrders.length} Shipments Available
          </span>
          {filteredAvailableOrders.length > 0 && (
            <span className="bg-slate-100 dark:bg-slate-900 text-slate-750 dark:text-slate-300 text-[9px] font-black px-3 py-1.5 rounded-xl shadow-xs uppercase tracking-wider">
              Commission Pool: {formatCommission(totalPoolAmount)}
            </span>
          )}
        </div>
      </div>

      {/* Available Pool Stats Grid */}
      {filteredAvailableOrders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
          {/* Card: Average Payout */}
          <div className="bg-white dark:bg-[#090b11] border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4.5 shadow-xs flex items-center gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition duration-200">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 flex items-center justify-center shrink-0">
              <DollarSign size={16} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Average Payout</p>
              <p className="text-xs font-black text-slate-800 dark:text-white mt-1.5 leading-none">
                {formatCommission(totalPoolAmount / filteredAvailableOrders.length)} <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500">/ job</span>
              </p>
            </div>
          </div>
          
          {/* Card: Average Transit */}
          <div className="bg-white dark:bg-[#090b11] border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4.5 shadow-xs flex items-center gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition duration-200">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 flex items-center justify-center shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Average Transit</p>
              <p className="text-xs font-black text-slate-800 dark:text-white mt-1.5 leading-none">{averageTransit}</p>
            </div>
          </div>

          {/* Card: Sector Mode */}
          <div className="bg-white dark:bg-[#090b11] border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4.5 shadow-xs flex items-center gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition duration-200">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 flex items-center justify-center shrink-0">
              <Package size={16} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Sector Dispatch</p>
              <p className="text-xs font-black text-slate-800 dark:text-white mt-1.5 leading-none">Manual Claim Mode</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Available Pool Cards List Grid */}
      {filteredAvailableOrders.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#090b11] py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3.5 shadow-xs">
          <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
            <Inbox size={22} className="animate-bounce" />
          </div>
          <div>
            <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide">Pool is fully claimed</p>
            <p className="text-slate-405 mt-1.5 font-semibold max-w-[340px] mx-auto leading-relaxed">
              All unassigned packages in your dispatch sector are currently claimed by active courier partners.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAvailableOrders.map((order) => {
            const isClaimingThis = claimingId === order._id;

            return (
              <div 
                key={order._id}
                className="bg-white dark:bg-[#090b11] rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-5 hover:shadow-md transition duration-300 relative group"
              >
                <div className="space-y-4">
                  {/* ID & Payment tags */}
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] font-black text-slate-500 dark:text-slate-450 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400`}>
                      {order.paymentMethod}
                    </span>
                  </div>
                  
                  {/* Responsive details list */}
                  <div className="text-xs space-y-3.5">
                    {/* Destination */}
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 text-slate-400">
                        <MapPin size={13} />
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">Sector Destination</span>
                        <p className="font-extrabold text-slate-850 dark:text-white mt-1.5 leading-tight">
                          {order.address?.city || "Unknown Sector"}, {order.address?.state || "Gujarat"}
                        </p>
                      </div>
                    </div>

                    {/* Cargo Items */}
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 text-slate-400">
                        <Package size={13} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">Cargo Items</span>
                        <p className="text-slate-600 dark:text-slate-400 font-bold mt-1.5 leading-normal">
                          {order.items.map(i => `${i.name} (x${i.qty})`).join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payout & Claim Action */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-450 dark:text-slate-550 uppercase tracking-widest leading-none">Payout Commission</span>
                    <span className="font-black text-slate-900 dark:text-white text-sm mt-1.5 tracking-tight">
                      {formatCommission(order.amount)}
                    </span>
                  </div>
                  
                  <button
                    disabled={claimingId !== null}
                    onClick={() => handleClaim(order._id)}
                    className={`bg-slate-900 hover:bg-slate-800 dark:bg-slate-850 dark:hover:bg-slate-700 text-white rounded-xl px-4.5 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all duration-200 ease-out transform hover:scale-103 active:scale-90 active:translate-y-0.5 cursor-pointer flex items-center gap-2 shadow-sm ${
                      isClaimingThis ? "opacity-80 cursor-wait bg-orange-600 dark:bg-orange-600 scale-95" : ""
                    }`}
                  >
                    {isClaimingThis ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-white" />
                        <span>Claiming...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={11} className="text-orange-400 animate-pulse" />
                        <span>Claim Shipment</span>
                        <ArrowRight size={11} className="opacity-60 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailablePoolTab;
