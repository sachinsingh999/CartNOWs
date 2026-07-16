import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login";
import SignUp from "./pages/SignUp";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import { 
  Truck, RotateCcw, Inbox, AlertTriangle, Settings, 
  Sun, Moon
} from "lucide-react";
import { backendUrl } from "./config";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("deliveryman_token") || ""
  );
  const [driver, setDriver] = useState(
    JSON.parse(localStorage.getItem("deliveryman_info")) || null
  );

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

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
      console.log(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("deliveryman_token", token);
    if (driver) {
      localStorage.setItem("deliveryman_info", JSON.stringify(driver));
    } else {
      localStorage.removeItem("deliveryman_info");
    }
  }, [token, driver]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const logout = () => {
    setToken("");
    setDriver(null);
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
    fetchData
  };

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

  return (
    <div className="bg-slate-50 dark:bg-[#0B0F19] min-h-screen flex flex-col antialiased text-slate-900 dark:text-slate-100 pb-16 lg:pb-0 transition-colors duration-300 relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} theme={theme} />
      
      {/* Interactive Background Glow Spots */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 dark:bg-indigo-500/10 blur-[130px] pointer-events-none z-0 animate-float" />
      <div className="absolute bottom-[10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-500/5 dark:bg-teal-500/8 blur-[150px] pointer-events-none z-0 animate-float-delayed" />
      <div className="absolute top-[40%] right-[10%] h-[350px] w-[350px] rounded-full bg-indigo-500/5 dark:bg-purple-500/10 blur-[120px] pointer-events-none z-0 animate-float" />

      {/* Cyber/Tech Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.015)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none z-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {token === "" ? (
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <Routes>
            <Route path="/" element={<Landing theme={theme} setTheme={setTheme} />} />
            <Route path="/login" element={
              <>
                <div className="absolute top-4 right-4 z-50">
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white transition shadow-sm cursor-pointer"
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                  </button>
                </div>
                <Login setToken={setToken} setDriver={setDriver} />
              </>
            } />
            <Route path="/signup" element={
              <>
                <div className="absolute top-4 right-4 z-50">
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white transition shadow-sm cursor-pointer"
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                  </button>
                </div>
                <SignUp />
              </>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      ) : (
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
              <Routes>
                <Route path="/" element={<Dashboard {...dashboardProps} />} />
                <Route path="/returns" element={<Dashboard {...dashboardProps} />} />
                <Route path="/pool" element={<Dashboard {...dashboardProps} />} />
                <Route path="/complaints" element={<Dashboard {...dashboardProps} />} />
                <Route path="/profile" element={<Dashboard {...dashboardProps} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
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
      )}
    </div>
  );
};

export default App;
