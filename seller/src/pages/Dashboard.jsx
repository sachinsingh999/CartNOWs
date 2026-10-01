import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "react-toastify";

// Modular Dashboard Sub-components
import WelcomeHeader from "../components/dashboard/WelcomeHeader";
import KPICards from "../components/dashboard/KPICards";
import SalesOverviewChart from "../components/dashboard/SalesOverviewChart";
import OrderStatusDonut from "../components/dashboard/OrderStatusDonut";
import RecentOrdersTabbedTable from "../components/dashboard/RecentOrdersTabbedTable";
import InventoryAlertsCard from "../components/dashboard/InventoryAlertsCard";
import StoreHealthCard from "../components/dashboard/StoreHealthCard";
import QuickActionsGrid from "../components/dashboard/QuickActionsGrid";
import PromotionsBanner from "../components/dashboard/PromotionsBanner";
import CustomerInsightsCard from "../components/dashboard/CustomerInsightsCard";
import DashboardModals from "../components/dashboard/DashboardModals";

const Dashboard = ({ 
  token, 
  seller, 
  setSeller, 
  products = [], 
  orders = [], 
  loading = false,
  fetchProducts, 
  fetchOrders 
}) => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState("30D");
  const [isStoreOnline, setIsStoreOnline] = useState(true);

  // Modal interaction states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [restockProduct, setRestockProduct] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const fetchDashboardStats = async () => {
    if (!token) return;
    setStatsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/seller/dashboard/stats`, {
        headers: { token }
      });
      if (response.data.success) {
        setDashboardStats(response.data.stats);
      }
    } catch (error) {
      console.log("Could not fetch dashboard stats from server:", error.message);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-1.5 sm:space-y-2 text-slate-800 dark:text-slate-100"
    >
      {/* 1. WELCOME HEADER & TIME SELECTOR */}
      <motion.div variants={itemVariants} className="relative z-30">
        <WelcomeHeader
          seller={seller}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          isStoreOnline={isStoreOnline}
          setIsStoreOnline={setIsStoreOnline}
        />
      </motion.div>

      {/* 2. FOUR KPI CARDS */}
      <motion.div variants={itemVariants} className="relative z-10">
        <KPICards
          orders={orders}
          products={products}
          seller={seller}
          dashboardStats={dashboardStats}
          loading={loading || statsLoading}
        />
      </motion.div>

      {/* 3. SALES OVERVIEW HERO & ORDER STATUS DONUT */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 sm:gap-2 items-stretch">
        {/* Left: Sales Overview Centerpiece (68% width on desktop) */}
        <div className="lg:col-span-8 flex flex-col">
          <SalesOverviewChart
            orders={orders}
            loading={loading || statsLoading}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
          />
        </div>

        {/* Right: Order Status Donut Breakdown (32% width on desktop) */}
        <div className="lg:col-span-4 flex flex-col">
          <OrderStatusDonut
            orders={orders}
            loading={loading || statsLoading}
          />
        </div>
      </motion.div>

      {/* 4. PROMOTIONS BANNER & QUICK ACTIONS */}
      <motion.div variants={itemVariants} className="space-y-1.5 sm:space-y-2">
        <PromotionsBanner
          onOpenOfferModal={() => setIsOfferModalOpen(true)}
        />
        <QuickActionsGrid
          navigate={navigate}
          onOpenOfferModal={() => setIsOfferModalOpen(true)}
          onOpenPayoutModal={() => setIsPayoutModalOpen(true)}
        />
      </motion.div>

      {/* 5. OPERATIONS DESK: TABBED RECENT ORDERS & INVENTORY / HEALTH */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 sm:gap-2 items-stretch">
        {/* Left: Tabbed Table (Recent Orders, Top Products, Low Stock, Recent Customers) */}
        <div className="lg:col-span-8 flex flex-col">
          <RecentOrdersTabbedTable
            orders={orders}
            products={products}
            navigate={navigate}
            onOpenOrderModal={(ord) => setSelectedOrder(ord)}
            onOpenRestockModal={(prod) => setRestockProduct(prod)}
            loading={loading}
          />
        </div>

        {/* Right: Inventory Alerts & Store Health Score */}
        <div className="lg:col-span-4 flex flex-col gap-1.5 sm:gap-2">
          <InventoryAlertsCard
            products={products}
            navigate={navigate}
            onOpenRestockModal={(prod) => setRestockProduct(prod)}
          />
          <StoreHealthCard
            seller={seller}
            products={products}
            orders={orders}
            isStoreOnline={isStoreOnline}
          />
        </div>
      </motion.div>

      {/* 6. CUSTOMER INTELLIGENCE SECTION */}
      <motion.div variants={itemVariants}>
        <CustomerInsightsCard
          orders={orders}
          loading={loading}
        />
      </motion.div>

      {/* 7. INTERACTIVE MODALS */}
      <DashboardModals
        token={token}
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        restockProduct={restockProduct}
        setRestockProduct={setRestockProduct}
        isOfferModalOpen={isOfferModalOpen}
        setIsOfferModalOpen={setIsOfferModalOpen}
        isPayoutModalOpen={isPayoutModalOpen}
        setIsPayoutModalOpen={setIsPayoutModalOpen}
        isSupportModalOpen={isSupportModalOpen}
        setIsSupportModalOpen={setIsSupportModalOpen}
        seller={seller}
        fetchProducts={fetchProducts}
        fetchOrders={fetchOrders}
      />
    </motion.div>
  );
};

export default Dashboard;
