import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../config";
import Sidebar from "./Sidebar";
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

  // Sidebar Layout States
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // If token is missing, redirect to landing
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

  const toggleDutyStatus = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/deliveryman/toggle-duty`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

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
    activeTab,
    toggleDutyStatus
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#080C16]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading Logistics Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080C16] text-slate-800 dark:text-slate-100 flex transition-colors duration-300">
      
      {/* Left Sidebar Navigation */}
      <Sidebar
        driver={driver}
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        tabs={tabs}
        stats={stats}
        orders={orders}
        theme={theme}
        setTheme={setTheme}
        logout={logout}
        onToggleDuty={toggleDutyStatus}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Right Content Panel with dynamic padding matching Sidebar width */}
      <div
        className={`main-content-transition flex-1 flex flex-col min-h-screen ${
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        }`}
      >
        {/* Top Header Navbar */}
        <Navbar
          driver={driver}
          activeTab={activeTab}
          handleTabClick={handleTabClick}
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
          onToggleDuty={toggleDutyStatus}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Dynamic Routed Page Content */}
        <main className="flex-1 p-2 sm:p-3 lg:p-3">
          <div className="mx-auto max-w-[1700px]">
            <Outlet context={dashboardProps} />
          </div>
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
