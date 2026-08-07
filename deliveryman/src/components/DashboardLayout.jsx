import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../config";
import Navbar from "./Navbar";
import { Truck, RotateCcw, Inbox, AlertTriangle } from "lucide-react";

const DashboardLayout = () => {
  const { token, driver, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [orders, setOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [returnTasks, setReturnTasks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalDelivered: 0,
    activeCount: 0,
    cashCollected: 0,
    isOnline: true,
    status: "active"
  });
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // If token is missing, redirect to landing/login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  let activeTab = "my-deliveries";
  if (location.pathname === "/returns") activeTab = "returns";
  else if (location.pathname === "/pool") activeTab = "available-pool";
  else if (location.pathname === "/complaints") activeTab = "complaints";
  else if (location.pathname === "/profile") activeTab = "profile";

  const handleTabClick = (tab) => {
    if (tab === "my-deliveries") navigate("/");
    else if (tab === "returns") navigate("/returns");
    else if (tab === "available-pool") navigate("/pool");
    else if (tab === "complaints") navigate("/complaints");
    else if (tab === "profile") navigate("/profile");
  };

  const fetchData = async () => {
    if (!token) return;
    try {
      const [assignedRes, unassignedRes, statsRes, complaintsRes, returnsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/deliveryman/orders`, { headers: { token } }),
        axios.get(`${backendUrl}/api/deliveryman/unassigned`, { headers: { token } }),
        axios.get(`${backendUrl}/api/deliveryman/stats`, { headers: { token } }),
        axios.get(`${backendUrl}/api/deliveryman/complaints`, { headers: { token } }),
        axios.get(`${backendUrl}/api/deliveryman/returns`, { headers: { token } })
      ]);
      
      if (assignedRes.data.success) {
        setOrders(assignedRes.data.orders);
      }
      if (unassignedRes.data.success) {
        setAvailableOrders(unassignedRes.data.orders);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (complaintsRes.data.success) {
        setComplaints(complaintsRes.data.complaints);
      }
      if (returnsRes.data.success) {
        setReturnTasks(returnsRes.data.returns);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const tabs = [
    { id: "my-deliveries", label: "Deliveries", count: orders.filter((o) => o.orderStatus !== "Delivered").length, icon: Truck, clickId: "my-deliveries" },
    { id: "returns", label: "Returns", count: returnTasks.length, icon: RotateCcw, clickId: "returns" },
    { id: "available-pool", label: "Available Pool", count: availableOrders.length, icon: Inbox, clickId: "available-pool" },
    { id: "complaints", label: "Complaints", count: complaints.length, icon: AlertTriangle, clickId: "complaints" },
  ];

  const notificationsList = [];
  if (availableOrders.length > 0) {
    notificationsList.push({
      id: "pool",
      type: "warning",
      title: "New Pool Shipments",
      desc: `${availableOrders.length} unassigned packages waiting in your zone.`,
      icon: Inbox
    });
  }
  const pendingOrders = orders.filter(o => o.orderStatus === "Accepted" || o.orderStatus === "Out for Delivery");
  if (pendingOrders.length > 0) {
    notificationsList.push({
      id: "assignment",
      type: "info",
      title: "Active Deliveries",
      desc: `You have ${pendingOrders.length} packages to dispatch.`,
      icon: Truck
    });
  }
  if (complaints.length > 0) {
    notificationsList.push({
      id: "complaint",
      type: "danger",
      title: "Agent Dispute",
      desc: `${complaints.length} customer issues registered.`,
      icon: AlertTriangle
    });
  }
  if (returnTasks.length > 0) {
    notificationsList.push({
      id: "return",
      type: "purple",
      title: "Return Tasks",
      desc: `${returnTasks.length} package pickups scheduled.`,
      icon: RotateCcw
    });
  }

  const dashboardProps = {
    token,
    driver,
    logout,
    orders,
    availableOrders,
    returnTasks,
    complaints,
    stats,
    loading,
    setLoading,
    fetchData,
    activeTab
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex-1 flex flex-col min-h-screen">
      {/* Refactored Header / Navbar component */}
      <Navbar
        driver={driver}
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        tabs={tabs}
        stats={stats}
        orders={orders}
        theme={theme}
        setTheme={setTheme}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        notificationsList={notificationsList}
        logout={logout}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-[1600px]">
          <Outlet context={dashboardProps} />
        </div>
      </main>

      {/* Sticky Mobile/Tablet Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-900 backdrop-blur-lg flex justify-around py-2.5 shadow-2xl lg:hidden transition-colors">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.clickId)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition duration-150 relative cursor-pointer ${ isActive ? "text-blue-600 dark:text-indigo-400 font-extrabold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" }`}
            >
              <div className="relative">
                <Icon size={15} className="stroke-[2.2]" />
                {tab.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-blue-600 dark:bg-indigo-600 text-slate-100 dark:text-white rounded-full text-[8px] font-extrabold min-w-[12px] text-center border border-white/10 dark:border-slate-800 dark:border-slate-950">
                    {tab.count}
                  </span>
                )}
              </div>
              <span className="text-[9px] mt-1 uppercase font-black tracking-wider text-[8px]">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-6 bg-blue-600 dark:bg-indigo-500 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardLayout;
