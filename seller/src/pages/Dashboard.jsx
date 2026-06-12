import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { useNavigate } from "react-router-dom";

import GreetingCard from "../components/GreetingCard";
import KPIGrid from "../components/KPIGrid";
import RevenueTrendsChart from "../components/RevenueTrendsChart";
import RecentTransactions from "../components/RecentTransactions";
import DashboardSidebar from "../components/DashboardSidebar";

const Dashboard = ({ token, seller, products = [], orders = [] }) => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [hoveredTrend, setHoveredTrend] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardStats = async () => {
    if (!token) return;
    setStatsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/seller/dashboard/stats`, {
        headers: { token }
      });
      if (response.data.success) {
        setDashboardStats(response.data.stats);
        setRecentOrders(response.data.recentOrders || []);
      }
    } catch (error) {
      console.log("Could not fetch dashboard stats:", error.message);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  // Derived KPI metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const uniqueCustomers = [...new Set(orders.map(o => o.address?.firstName + " " + o.address?.lastName).filter(Boolean))].length;
  
  // Calculate top performing items based on actual Delivered order sales count
  const productSales = {};
  orders.filter(o => o.orderStatus === "Delivered").forEach(o => {
    if (o.items) {
      o.items.forEach(item => {
        const id = item.productId || item._id;
        if (!id) return;
        productSales[id] = (productSales[id] || 0) + (item.qty || 1);
      });
    }
  });

  const lowStockItems = products.filter(p => (p.stock ?? 15) < 10);
  const topSellers = [...products]
    .map(p => ({
      ...p,
      salesCount: productSales[p._id] || 0
    }))
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 3);

  // Calculate monthly trends from real orders
  const getMonthlyTrends = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthSales = {};
    
    // Initialize past 6 months including current month with 0
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      monthSales[mName] = 0;
    }
    
    orders.forEach(o => {
      if (!o.createdAt) return;
      const oDate = new Date(o.createdAt);
      const mName = months[oDate.getMonth()];
      if (monthSales[mName] !== undefined) {
        monthSales[mName] += o.amount || 0;
      }
    });

    return Object.entries(monthSales).map(([month, sales]) => ({
      month,
      sales: Math.round(sales)
    }));
  };

  const monthlyTrends = getMonthlyTrends();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Greeting card */}
      <GreetingCard seller={seller} />

      {/* KPI Cards Grid */}
      <KPIGrid
        products={products}
        orders={orders}
        dashboardStats={dashboardStats}
        totalRevenue={totalRevenue}
      />

      {/* Revenue Growth Chart */}
      <RevenueTrendsChart
        monthlyTrends={monthlyTrends}
        hoveredTrend={hoveredTrend}
        setHoveredTrend={setHoveredTrend}
      />

      {/* Tables Row: Recent Orders, Low Stock, Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - 2/3 width on desktop */}
        <div className="lg:col-span-2">
          <RecentTransactions
            orders={orders}
            navigate={navigate}
          />
        </div>

        {/* Sidebar Cards: Low Stock & Top Sellers */}
        <DashboardSidebar
          lowStockItems={lowStockItems}
          topSellers={topSellers}
          navigate={navigate}
        />
      </div>
    </div>
  );
};

export default Dashboard;
