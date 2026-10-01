import React, { useState } from "react";
import { 
  Inbox, DollarSign, Clock, MapPin, Package, ArrowRight, Activity, Loader2, CheckCircle2, Zap, Sparkles
} from "lucide-react";

const AvailablePoolTab = ({
  filteredAvailableOrders,
  claimOrderHandler,
  driver
}) => {
  const [claimingId, setClaimingId] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const handleClaim = async (orderId) => {
    setClaimingId(orderId);
    try {
      await claimOrderHandler(orderId);
    } finally {
      setClaimingId(null);
    }
  };

  const totalPoolAmount = filteredAvailableOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

  const formatCommission = (amount) => {
    if (!amount && amount !== 0) return "₹0.00";
    return `₹${parseFloat(amount.toFixed(2)).toLocaleString("en-IN")}`;
  };

  const displayedOrders = filteredAvailableOrders.filter((order) => {
    if (filterType === "high_payout") return (order.amount || 0) >= 150;
    if (filterType === "cod") return (order.paymentMethod || "").toLowerCase() === "cod";
    if (filterType === "prepaid") return (order.paymentMethod || "").toLowerCase() !== "cod";
    return true;
  });

  return (
    <div className="space-y-3.5 text-slate-800 dark:text-slate-200">
      
      {/* Top Header Card */}
      <div className="glass-panel-elevated rounded-md p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-slate-200 dark:border-slate-800 border-t-2 border-t-amber-500">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-sm bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Zap size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Available Shipment Pool
                </h2>
                <span className="px-2 py-0.5 rounded-sm text-[8px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {driver?.deliveryZone || "Sector Pool"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Review unassigned packages and instant-claim orders in your registered zone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="glass-card px-3 py-1.5 rounded-sm text-left border border-slate-200 dark:border-slate-800">
            <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Available</span>
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
              {filteredAvailableOrders.length} Shipments
            </span>
          </div>

          <div className="glass-card px-3 py-1.5 rounded-sm text-left border border-emerald-500/25 bg-emerald-500/5">
            <span className="text-[8px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Total Payout</span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {formatCommission(totalPoolAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "all", label: "All Packages" },
            { id: "high_payout", label: "High Bounty (₹150+)" },
            { id: "prepaid", label: "Prepaid Online" },
            { id: "cod", label: "Cash on Delivery" }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1 rounded-sm text-[10px] font-mono font-bold tracking-wide transition cursor-pointer whitespace-nowrap active:scale-98 ${
                filterType === f.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-transparent shadow-xs"
                  : "glass-card text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
          {displayedOrders.length} packages ready
        </span>
      </div>

      {/* Orders Grid */}
      {displayedOrders.length === 0 ? (
        <div className="rounded-md glass-panel-elevated py-12 px-4 text-center flex flex-col items-center justify-center gap-2 border border-slate-200 dark:border-slate-800">
          <div className="h-10 w-10 rounded-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
            <Inbox size={20} />
          </div>
          <p className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide font-mono">Shipment Pool Idle</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            All orders in your zone are currently assigned. Stay on duty; new assignments broadcast instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {displayedOrders.map((order) => {
            const isClaimingThis = claimingId === order._id;
            const itemsList = order.items || order.orderItems || [];
            const isHighBounty = (order.amount || 0) >= 150;

            return (
              <div
                key={order._id}
                className="glass-panel-elevated rounded-md p-3.5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between gap-3 relative overflow-hidden border border-slate-200 dark:border-slate-800 border-t-2 border-t-blue-500"
              >
                {/* High bounty accent ribbon */}
                {isHighBounty && (
                  <div className="absolute top-0 right-0 bg-amber-500/15 border-b border-l border-amber-500/30 px-2 py-0.5 text-[8px] font-mono font-bold uppercase text-amber-500 tracking-wider flex items-center gap-1 rounded-bl-sm">
                    <Sparkles size={9} />
                    High Bounty
                  </div>
                )}

                <div className="space-y-2.5">
                  {/* Top: ID & Payment Method */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {order.paymentMethod}
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="flex items-start gap-2 text-xs">
                    <div className="h-6 w-6 rounded-sm bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={11} />
                    </div>
                    <div>
                      <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Destination</span>
                      <p className="text-slate-800 dark:text-slate-200 font-bold leading-snug text-[11px]">
                        {order.address?.street ? `${order.address.street}, ` : ""}
                        {order.address?.city || "Sector Area"}
                      </p>
                    </div>
                  </div>

                  {/* Cargo */}
                  <div className="flex items-start gap-2 text-xs">
                    <div className="h-6 w-6 rounded-sm bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Package size={11} />
                    </div>
                    <div>
                      <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Cargo Contents</span>
                      <p className="text-slate-600 dark:text-slate-400 leading-snug font-medium text-[11px] line-clamp-1">
                        {itemsList.length > 0
                          ? itemsList.map((i) => `${i.name || i.productName || "Item"} (x${i.quantity || i.qty || 1})`).join(", ")
                          : "Standard Express Parcel"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Payout</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      {formatCommission(order.amount)}
                    </span>
                  </div>

                  <button
                    disabled={claimingId !== null}
                    onClick={() => handleClaim(order._id)}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-sm px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition active:scale-98 cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shadow-xs border border-blue-400/30"
                  >
                    {isClaimingThis ? (
                      <>
                        <Loader2 size={11} className="animate-spin" />
                        <span>Claiming...</span>
                      </>
                    ) : (
                      <>
                        <span>Claim Job</span>
                        <ArrowRight size={11} />
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
