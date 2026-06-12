import React from "react";
import { 
  DollarSign, ShoppingBag, Users, Store, Truck, Clock, RotateCcw, AlertOctagon, ArrowUpRight, ArrowDownRight, Award, Shield, Landmark
} from "lucide-react";

const AdminKPIGrid = ({
  orders = [],
  totalStats = {},
  todayStats = {},
  weeklyStats = {},
  monthlyStats = {},
  customersCount = 0,
  sellersCount = 0,
  agentsCount = 0,
  pendingOrders = 0,
  pendingReturns = 0,
  lowStockProductsCount = 0
}) => {

  // Helper to calculate weekly trend sparkline points for a given attribute/stat
  const getSparklinePoints = (key) => {
    const points = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const daysOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(dateStr));
      
      if (key === "revenue") {
        points.push(daysOrders.reduce((sum, o) => o.orderStatus === "Delivered" ? sum + Number(o.amount || 0) : sum, 0));
      } else if (key === "orders") {
        points.push(daysOrders.length);
      } else if (key === "seller") {
        // Assume 90% goes to seller on average for sparkline representation
        points.push(daysOrders.reduce((sum, o) => o.orderStatus === "Delivered" ? sum + (Number(o.amount || 0) * 0.9) : sum, 0));
      } else if (key === "agent") {
        points.push(daysOrders.reduce((sum, o) => o.orderStatus === "Delivered" ? sum + 150 : sum, 0));
      } else if (key === "commission") {
        points.push(daysOrders.reduce((sum, o) => o.orderStatus === "Delivered" ? sum + (Number(o.amount || 0) * 0.1) : sum, 0));
      } else {
        points.push(daysOrders.length * 10);
      }
    }
    return points;
  };

  // Format currency helper
  const formatVal = (num) => `₹${Math.round(num).toLocaleString("en-IN")}`;

  const kpis = [
    {
      label: "Admin Revenue Console",
      val: formatVal(totalStats.adminRevenue || 0),
      icon: Landmark,
      color: "emerald",
      isRevenueCard: true,
      subMetrics: [
        { label: "Today", val: formatVal(todayStats.adminRevenue || 0) },
        { label: "Weekly", val: formatVal(weeklyStats.adminRevenue || 0) },
        { label: "Monthly", val: formatVal(monthlyStats.adminRevenue || 0) },
        { label: "Net Profit", val: formatVal(totalStats.netProfit || 0), highlight: true }
      ]
    },
    {
      label: "Orders & Volume",
      val: `${totalStats.ordersCount || 0} Orders`,
      trend: `${todayStats.ordersCount || 0} Today`,
      isPos: true,
      sparkline: getSparklinePoints("orders"),
      icon: ShoppingBag,
      color: "blue",
      subMetrics: [
        { label: "Today Orders", val: String(todayStats.ordersCount || 0) },
        { label: "Pending queue", val: String(pendingOrders) }
      ]
    },
    {
      label: "Merchant Earnings",
      val: formatVal(totalStats.sellerEarnings || 0),
      trend: `${formatVal(todayStats.sellerEarnings || 0)} Today`,
      isPos: true,
      sparkline: getSparklinePoints("seller"),
      icon: Store,
      color: "amber",
      subMetrics: [
        { label: "Total Sellers", val: String(sellersCount) },
        { label: "Today Seller", val: formatVal(todayStats.sellerEarnings || 0) }
      ]
    },
    {
      label: "Logistics Agent Earnings",
      val: formatVal(totalStats.agentEarnings || 0),
      trend: `${formatVal(todayStats.agentEarnings || 0)} Today`,
      isPos: true,
      sparkline: getSparklinePoints("agent"),
      icon: Truck,
      color: "indigo",
      subMetrics: [
        { label: "Active Fleet", val: String(agentsCount) },
        { label: "Today Agent", val: formatVal(todayStats.agentEarnings || 0) }
      ]
    },
    {
      label: "Commission Revenue",
      val: formatVal(totalStats.commission || 0),
      trend: `${formatVal(todayStats.commission || 0)} Today`,
      isPos: true,
      sparkline: getSparklinePoints("commission"),
      icon: Award,
      color: "rose",
      subMetrics: [
        { label: "Today Comm", val: formatVal(todayStats.commission || 0) },
        { label: "Est. Rate", val: "10% Avg" }
      ]
    },
    {
      label: "Platform Extra Fees",
      val: formatVal((totalStats.platformFees || 0) + (totalStats.adRevenue || 0) + (totalStats.subscriptionRevenue || 0)),
      trend: `+${formatVal(todayStats.platformFees || 0)} Today`,
      isPos: true,
      sparkline: getSparklinePoints("other"),
      icon: Shield,
      color: "slate",
      subMetrics: [
        { label: "Ads", val: formatVal(totalStats.adRevenue || 0) },
        { label: "Subs", val: formatVal(totalStats.subscriptionRevenue || 0) }
      ]
    },
    {
      label: "Net Profit Margin",
      val: formatVal(totalStats.netProfit || 0),
      trend: `${formatVal(todayStats.netProfit || 0)} Today`,
      isPos: (totalStats.netProfit || 0) >= 0,
      sparkline: getSparklinePoints("revenue"),
      icon: DollarSign,
      color: "emerald",
      subMetrics: [
        { label: "Refunds Issued", val: formatVal(totalStats.refunds || 0), isNeg: true }
      ]
    },
    {
      label: "Operations & Warnings",
      val: `${pendingReturns} Returns`,
      trend: lowStockProductsCount > 0 ? "Inventory Alert" : "Stable",
      isPos: lowStockProductsCount === 0 && pendingReturns === 0,
      sparkline: [pendingReturns, lowStockProductsCount, pendingOrders, 2, 0, 1, pendingReturns],
      icon: AlertOctagon,
      color: (lowStockProductsCount > 0 || pendingReturns > 0) ? "rose" : "indigo",
      subMetrics: [
        { label: "Low stock items", val: String(lowStockProductsCount), highlight: lowStockProductsCount > 0 },
        { label: "Return Requests", val: String(pendingReturns), highlight: pendingReturns > 0 }
      ]
    }
  ];

  const getColorStyles = (color, highlight) => {
    if (highlight) return "text-rose-400 bg-rose-500/10 border border-rose-500/20";
    switch (color) {
      case "emerald": return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
      case "blue": return "text-blue-400 bg-blue-500/10 border border-blue-500/20";
      case "indigo": return "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20";
      case "amber": return "text-amber-400 bg-amber-500/10 border border-amber-500/20";
      case "slate": return "text-slate-400 bg-slate-500/10 border border-slate-500/20";
      case "rose": return "text-rose-400 bg-rose-500/10 border border-rose-500/20";
      default: return "text-slate-400 bg-slate-500/10 border border-slate-500/20";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        
        // Generate SVG path for sparkline
        const points = kpi.sparkline || [0, 0, 0, 0, 0, 0, 0];
        const width = 60;
        const height = 24;
        const spacing = width / (points.length - 1);
        const maxVal = Math.max(...points, 10);
        const minVal = Math.min(...points, 0);
        const range = maxVal - minVal || 1;
        
        const pathData = points.map((p, i) => {
          const x = i * spacing;
          const y = height - ((p - minVal) / range) * height;
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(" ");

        if (kpi.isRevenueCard) {
          // Dedicated high-density card layout for Admin Revenue Card
          return (
            <div 
              key={idx} 
              className="col-span-1 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 dark:from-slate-950 dark:via-[#111827] dark:to-[#1e1b4b] border border-slate-800 dark:border-indigo-500/20 rounded-xl p-4 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between z-10">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {kpi.label}
                </span>
                <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Icon size={14} />
                </div>
              </div>

              <div className="mt-3.5 z-10">
                <p className="text-2xl font-black tracking-tight text-white">
                  {kpi.val}
                </p>
                <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-white/[0.06] text-[10px]">
                  {kpi.subMetrics.map((sm, sIdx) => (
                    <div key={sIdx} className="flex flex-col">
                      <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wider">{sm.label}</span>
                      <span className={`font-extrabold mt-0.5 ${sm.highlight ? "text-emerald-400" : "text-white"}`}>
                        {sm.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        return (
          <div 
            key={idx} 
            className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-white/[0.08] rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {kpi.label}
              </span>
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 ${getColorStyles(kpi.color)}`}>
                <Icon size={14} />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-3">
              <div>
                <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {kpi.val}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {kpi.isPos ? (
                    <ArrowUpRight size={10} className="text-emerald-400" />
                  ) : (
                    <ArrowDownRight size={10} className="text-rose-400" />
                  )}
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                    kpi.isPos ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {kpi.trend}
                  </span>
                </div>
              </div>

              {/* Sparkline mini chart */}
              <svg width={width} height={height} className="overflow-visible select-none opacity-80 group-hover:opacity-100 transition-opacity">
                <path
                  d={pathData}
                  fill="none"
                  stroke={kpi.isPos ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Sub metrics overlay */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/[0.04] mt-3 pt-2 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
              {kpi.subMetrics.map((sm, sIdx) => (
                <div key={sIdx} className="flex items-center gap-1">
                  <span>{sm.label}:</span>
                  <span className={sm.highlight ? "text-rose-500 dark:text-rose-400 font-extrabold" : sm.isNeg ? "text-rose-400" : "text-slate-700 dark:text-slate-300 font-extrabold"}>
                    {sm.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminKPIGrid;
