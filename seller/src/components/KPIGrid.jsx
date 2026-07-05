import React from "react";
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

const KPIGrid = ({
  products = [],
  orders = [],
  dashboardStats,
  totalRevenue
}) => {
  // Calculations
  const activeListingsCount = products.length;
  
  const inventoryValue = products.reduce((sum, p) => {
    return sum + (Number(p.price || 0) * Number(p.stock || 0));
  }, 0);
  
  const lowStockCount = products.filter(p => Number(p.stock || 0) < 10).length;
  
  // Dynamic active listings trend
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newListingsThisWeek = products.filter(p => new Date(p.createdAt || Date.now()).getTime() >= oneWeekAgo).length;
  const oldListingsCount = activeListingsCount - newListingsThisWeek;
  const listingTrendVal = oldListingsCount > 0 ? (newListingsThisWeek / oldListingsCount) * 100 : (newListingsThisWeek > 0 ? 100 : 0);
  const listingTrend = listingTrendVal > 0 ? `+${listingTrendVal.toFixed(1)}% this week` : "0% change this week";

  // Dynamic monthly revenue trend
  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1).getTime();

  const currentMonthRevenue = orders
    .filter(o => new Date(o.createdAt || o.date || Date.now()).getTime() >= currentMonthStart)
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const lastMonthRevenue = orders
    .filter(o => {
      const time = new Date(o.createdAt || o.date || Date.now()).getTime();
      return time >= lastMonthStart && time < currentMonthStart;
    })
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  let revenueTrend = "";
  let revenueTrendType = "neutral";
  if (lastMonthRevenue > 0) {
    const diff = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    revenueTrend = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}% vs last month`;
    revenueTrendType = diff >= 0 ? "up" : "down";
  } else {
    revenueTrend = currentMonthRevenue > 0 ? "+100% vs last month" : "0% vs last month";
    revenueTrendType = currentMonthRevenue > 0 ? "up" : "neutral";
  }

  // Metrics
  const metrics = [
    {
      label: "Active Listings",
      value: `${activeListingsCount} Items`,
      trend: listingTrend,
      trendType: listingTrendVal > 0 ? "up" : "neutral",
      icon: Package,
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
      textColor: "text-indigo-600 dark:text-indigo-400",
      borderColor: "border-indigo-100 dark:border-indigo-900/30"
    },
    {
      label: "Inventory Value",
      value: `₹${inventoryValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      trend: "Asset Stock Value",
      trendType: "neutral",
      icon: DollarSign,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-100 dark:border-emerald-900/30"
    },
    {
      label: "Low Stock Alerts",
      value: `${lowStockCount} Products`,
      trend: lowStockCount > 0 ? "Requires attention" : "Stocks healthy",
      trendType: lowStockCount > 0 ? "down" : "up",
      icon: AlertTriangle,
      bgColor: lowStockCount > 0 ? "bg-red-50 dark:bg-red-950/20" : "bg-slate-50 dark:bg-slate-900/20",
      textColor: lowStockCount > 0 ? "text-red-500 dark:text-red-400" : "text-slate-500 dark:text-slate-400",
      borderColor: lowStockCount > 0 ? "border-red-100 dark:border-red-900/30" : "border-slate-100 dark:border-slate-800/30"
    },
    {
      label: "Monthly Revenue",
      value: `₹${currentMonthRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      trend: revenueTrend,
      trendType: revenueTrendType,
      icon: TrendingUp,
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      textColor: "text-brand dark:text-orange-400",
      borderColor: "border-orange-100 dark:border-orange-900/30"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div 
            key={m.label} 
            className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between h-36 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-default"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                  {m.label}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                  {m.value}
                </h3>
              </div>
              <div className={`h-9 w-9 rounded-xl ${m.bgColor} ${m.textColor} flex items-center justify-center border ${m.borderColor} group-hover:scale-105 transition-transform duration-300`}>
                <Icon size={16} />
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-[10px] font-black border-t border-slate-50 pt-3 text-slate-500">
              {m.trendType === "up" ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <TrendingUp size={11} />
                  {m.trend}
                </span>
              ) : m.trendType === "down" ? (
                <span className="text-red-500 flex items-center gap-1">
                  <TrendingDown size={11} />
                  {m.trend}
                </span>
              ) : (
                <span className="text-slate-400">
                  {m.trend}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPIGrid;
