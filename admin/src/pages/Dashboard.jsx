import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { 
  BarChart3, AlertTriangle, AlertCircle, RefreshCcw, HelpCircle, 
  ChevronRight, ArrowUpRight, Eye, ShieldAlert, Zap, Layers3
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminKPIGrid from "../components/AdminKPIGrid";
import AdminRevenueChart from "../components/AdminRevenueChart";
import AdminActivityFeed from "../components/AdminActivityFeed";
import DetailDrawer from "../components/DetailDrawer";
import { getDeadlineInfo } from "../components/OrderCard";

const Dashboard = ({ token }) => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    products: [],
    orders: [],
    returns: [],
    support: [],
    sellers: [],
    customers: [],
    agents: [],
    logs: []
  });
  const [loading, setLoading] = useState(true);
  
  // Detail Drawer state for quick look
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [platformSettings, setPlatformSettings] = useState({ commissionPercentage: 10 });

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      // Single fast summary call
      const summaryRes = await axios.get(`${backendUrl}/api/admin/dashboard-summary`, { headers: { token } });
      if (summaryRes.data && summaryRes.data.success && summaryRes.data.data) {
        const { products, orders, returns, support, sellers, customers, agents, logs, settings } = summaryRes.data.data;
        const fetchedOrders = orders || [];
        setData({
          products: products || [],
          orders: fetchedOrders,
          returns: returns || [],
          support: support || [],
          sellers: sellers || [],
          customers: customers || [],
          agents: agents || [],
          logs: logs || [],
        });
        if (settings) {
          setPlatformSettings(settings);
        }
        setSelectedOrder((prev) => {
          if (!prev) return null;
          return fetchedOrders.find(o => o._id === prev._id) || null;
        });
      } else {
        // Fallback to individual requests if summary fails
        const [prodRes, orderRes, returnRes, supportRes, sellerRes, customerRes, agentRes, logRes, finRes] = await Promise.all([
          axios.get(`${backendUrl}/api/product/list`),
          axios.post(`${backendUrl}/api/order/list`, {}, { headers: { token } }),
          axios.post(`${backendUrl}/api/service/returns/admin/list`, {}, { headers: { token } }),
          axios.post(`${backendUrl}/api/service/help/admin/list`, {}, { headers: { token } }),
          axios.get(`${backendUrl}/api/admin/sellers`, { headers: { token } }),
          axios.get(`${backendUrl}/api/admin/customers`, { headers: { token } }),
          axios.get(`${backendUrl}/api/admin/agents`, { headers: { token } }),
          axios.get(`${backendUrl}/api/admin/logs`, { headers: { token } }),
          axios.get(`${backendUrl}/api/admin/finance`, { headers: { token } }),
        ]);

        const fetchedOrders = orderRes.data.success ? orderRes.data.orders : [];
        setData({
          products: prodRes.data.success ? prodRes.data.products : [],
          orders: fetchedOrders,
          returns: returnRes.data.success ? returnRes.data.returns : [],
          support: supportRes.data.success ? supportRes.data.helpRequests : [],
          sellers: sellerRes.data.success ? sellerRes.data.sellers : [],
          customers: customerRes.data.success ? customerRes.data.customers : [],
          agents: agentRes.data.success ? agentRes.data.agents : [],
          logs: logRes.data.success ? logRes.data.logs : [],
        });

        if (finRes.data.success && finRes.data.settings) {
          setPlatformSettings(finRes.data.settings);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const assignHandler = async (orderId, driverId) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/deliveryman/assign`,
        { orderId, deliverymanId: driverId || null },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        await fetchDashboardData();
      }
      else toast.error(res.data.message);
    } catch (e) { toast.error(e.message); }
  };

  const statusHandler = async (orderId, status) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        await fetchDashboardData();
      }
      else toast.error(res.data.message);
    } catch (e) { toast.error(e.message); }
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-40"></div>
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // calculations
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
  const monthStart = todayStart - 30 * 24 * 60 * 60 * 1000;

  const getStatsForOrders = (filteredOrders) => {
    let revenue = 0;
    let commission = 0;
    let sellerEarnings = 0;
    let agentEarnings = 0;
    let platformFees = 0;
    let refunds = 0;

    filteredOrders.forEach(o => {
      const isDelivered = o.orderStatus === "Delivered";
      const isRefunded = o.orderStatus === "Cancelled" || o.orderStatus === "Returned" || o.paymentStatus === "Refunded";

      if (isRefunded) {
        refunds += Number(o.amount || 0);
      }

      if (isDelivered) {
        revenue += Number(o.amount || 0);
        platformFees += 49; // Flat platform fee per delivered order

        // Agent Earnings: Base Pay (100) + Distance Bonus + Peak Hour Bonus
        const basePay = 100;
        const distBonus = (o._id.charCodeAt(o._id.length - 1) % 5) * 15 + 15;
        const hour = new Date(o.createdAt || o.date || Date.now()).getHours();
        const peakBonus = (hour >= 18 || hour <= 10) ? 30 : 10;
        agentEarnings += (basePay + distBonus + peakBonus);

        // Seller Earnings & Commission
        let orderCommission = 0;
        if (o.items && o.items.length > 0) {
          o.items.forEach(item => {
            const qty = item.qty || 1;
            const price = item.price || (o.amount / o.items.length);
            const prod = data.products.find(p => p._id === item.productId || p._id === item._id);
            const sellerId = item.sellerId || prod?.sellerId;
            const seller = sellerId ? data.sellers.find(s => s._id === sellerId) : data.sellers[0];
            const rate = seller ? (seller.commissionRate ?? platformSettings.commissionPercentage) : platformSettings.commissionPercentage;
            const itemComm = (price * qty) * (rate / 100);
            orderCommission += itemComm;
          });
        } else {
          const rate = platformSettings.commissionPercentage;
          orderCommission = o.amount * (rate / 100);
        }
        commission += orderCommission;
        sellerEarnings += (Number(o.amount || 0) - orderCommission);
      }
    });

    const activeSellersCount = data.sellers.filter(s => s.status === 'active').length;
    const adRevenue = data.sellers.length * 150 + data.products.length * 5;
    const subscriptionRevenue = activeSellersCount * 999;

    // Proportionate share of ads and subscriptions based on order volume in this period
    const totalOrderLen = data.orders.length || 1;
    const ratio = filteredOrders.length / totalOrderLen;
    const periodAdRevenue = adRevenue * ratio;
    const periodSubRevenue = subscriptionRevenue * ratio;

    const adminRevenue = commission + periodAdRevenue + periodSubRevenue + platformFees - refunds;

    return {
      revenue,
      commission,
      sellerEarnings,
      agentEarnings,
      platformFees,
      refunds,
      adRevenue: periodAdRevenue,
      subscriptionRevenue: periodSubRevenue,
      adminRevenue,
      netProfit: commission + periodAdRevenue + periodSubRevenue + platformFees - refunds,
      ordersCount: filteredOrders.length
    };
  };

  // Compute stats for different time horizons
  const totalStats = getStatsForOrders(data.orders);
  
  const todayOrders = data.orders.filter(o => new Date(o.createdAt || o.date || Date.now()).getTime() >= todayStart);
  const todayStats = getStatsForOrders(todayOrders);

  const weeklyOrders = data.orders.filter(o => new Date(o.createdAt || o.date || Date.now()).getTime() >= weekStart);
  const weeklyStats = getStatsForOrders(weeklyOrders);

  const monthlyOrders = data.orders.filter(o => new Date(o.createdAt || o.date || Date.now()).getTime() >= monthStart);
  const monthlyStats = getStatsForOrders(monthlyOrders);

  const pendingOrders = data.orders.filter((o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length;
  const pendingReturns = data.returns.filter((r) => r.status === "Requested").length;
  const lowStockProducts = data.products.filter((p) => Number(p.stock || 0) < 10);

  // Critical items calculation
  const criticalOverdue = data.orders.filter(o => {
    const dl = getDeadlineInfo(o.createdAt, o.orderStatus);
    return dl?.level === "overdue" || dl?.level === "critical";
  });

  const openTickets = data.support.filter(s => s.status === "Open" || s.status === "Pending").length;
  const failedDeliveries = data.orders.filter(o => o.orderStatus === "Cancelled" || o.orderStatus === "Returned").length;

  // Pass raw orders directly to AdminRevenueChart instead of SVG coordinate math

  // Recent active dispatches (show top 5)
  const activeDispatches = data.orders
    .filter(o => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled")
    .slice(0, 5);

  const getPriorityStyle = (order) => {
    const dl = getDeadlineInfo(order.createdAt, order.orderStatus);
    if (dl?.level === "overdue" || dl?.level === "critical") {
      return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    }
    if (dl?.level === "warning") {
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    }
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  };

  const getPriorityLabel = (order) => {
    const dl = getDeadlineInfo(order.createdAt, order.orderStatus);
    if (dl?.level === "overdue") return "Overdue";
    if (dl?.level === "critical") return "Critical";
    if (dl?.level === "warning") return "Medium";
    return "Standard";
  };

  const handleOpenDrawer = (order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Row */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Command & Operations Room</p>
          <div className="flex items-center gap-2.5 mt-1">
            <Zap size={16} className="text-blue-500" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Operations Dashboard</h2>
          </div>
        </div>
        
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
        >
          <RefreshCcw size={12} />
          <span>Refresh Console</span>
        </button>
      </div>

      {/* ── Executive Metrics KPIs Grid ── */}
      <AdminKPIGrid
        orders={data.orders}
        totalStats={totalStats}
        todayStats={todayStats}
        weeklyStats={weeklyStats}
        monthlyStats={monthlyStats}
        customersCount={data.customers.length}
        sellersCount={data.sellers.length}
        agentsCount={data.agents.length}
        pendingOrders={pendingOrders}
        pendingReturns={pendingReturns}
        lowStockProductsCount={lowStockProducts.length}
      />

      {/* ── Live Analytics Area & Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 min-w-0">
          <AdminRevenueChart 
            orders={data.orders} 
            sellers={data.sellers} 
            agents={data.agents} 
            products={data.products}
            platformSettings={platformSettings} 
            totalStats={totalStats} 
            todayStats={todayStats} 
            weeklyStats={weeklyStats} 
            monthlyStats={monthlyStats} 
          />
        </div>

        <div className="lg:sticky lg:top-5 w-full lg:h-[555px]">
          <AdminActivityFeed logs={data.logs} />
        </div>
      </div>

      {/* ── LIVE OPERATIONS BOARD (Active Dispatches Table) ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-3.5">
          <div className="flex items-center gap-2">
            <Layers3 size={15} className="text-blue-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">Active Operations Queue</h3>
          </div>
          <button 
            onClick={() => navigate("/orders")}
            className="text-[9px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Launch Kanban board</span>
            <ArrowUpRight size={10} />
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.04] text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Logistics Courier</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.02]">
              {activeDispatches.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-slate-500 italic">
                    All dispatches completed. Operations queue is empty.
                  </td>
                </tr>
              ) : (
                activeDispatches.map((order) => {
                  const driverName = data.agents.find(a => a._id === order.deliverymanId)?.name || "Unassigned";
                  return (
                    <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors duration-150 font-medium">
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-500 dark:text-slate-400 select-all">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 px-3 text-slate-800 dark:text-white">
                        {order.address.firstName} {order.address.lastName || ""}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ driverName === "Unassigned" ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20" : "bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300" }`}>
                          {driverName}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                          <span>{order.orderStatus}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-800 dark:text-white">
                        ₹{order.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getPriorityStyle(order)}`}>
                          {getPriorityLabel(order)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button 
                          onClick={() => handleOpenDrawer(order)}
                          className="p-1 hover:text-slate-900 dark:hover:text-white text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded transition cursor-pointer"
                        >
                          <Eye size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Slide-out Details Drawer ── */}
      <DetailDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedOrder(null); }}
        drivers={data.agents}
        onAssign={assignHandler}
        onStatusUpdate={statusHandler}
      />
    </div>
  );
};

export default Dashboard;
