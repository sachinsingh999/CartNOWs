import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import { Truck, RotateCcw, Inbox, AlertTriangle, Settings } from "lucide-react";
import { backendUrl } from "./config";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("deliveryman_token") || ""
  );
  const [driver, setDriver] = useState(
    JSON.parse(localStorage.getItem("deliveryman_info")) || null
  );

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

  return (
    <div className="bg-slate-50/50 min-h-screen flex flex-col antialiased">
      <ToastContainer position="top-right" autoClose={3000} />
      {token === "" ? (
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} setDriver={setDriver} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <>
          {/* Header NavBar */}
          <nav className="w-full flex flex-col lg:flex-row items-center justify-between px-6 py-3.5 bg-[#0F172A] text-white border-b border-slate-900 shadow-lg z-30 relative gap-4">
            <div className="flex items-center gap-3 group shrink-0">
              <div className="relative overflow-hidden h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center transition-all duration-300 hover:scale-105">
                <img
                  src="/cartnow-logo.svg"
                  alt="CartNOW Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-extrabold text-white tracking-tight">CartNOW</span>
                <span className="text-[10px] text-orange-500 font-black uppercase tracking-wider mt-0.5">Courier Hub</span>
              </div>
            </div>

            {/* Segmented Tab Capsule */}
            <div className="flex items-center bg-[#070c16] border border-slate-800/80 rounded-full p-1 shadow-inner max-w-full overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleTabClick("my-deliveries")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === "my-deliveries"
                    ? "bg-[#FF5100] text-white shadow-md shadow-orange-600/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Truck size={13} className="stroke-[2.5]" />
                <span>Deliveries ({orders.filter((o) => o.orderStatus !== "Delivered").length})</span>
              </button>

              <button
                onClick={() => handleTabClick("returns")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === "returns"
                    ? "bg-[#FF5100] text-white shadow-md shadow-orange-600/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <RotateCcw size={13} className="stroke-[2.5]" />
                <span>Return Tasks ({returnTasks.length})</span>
              </button>

              <button
                onClick={() => handleTabClick("available-pool")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === "available-pool"
                    ? "bg-[#FF5100] text-white shadow-md shadow-orange-600/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Inbox size={13} className="stroke-[2.5]" />
                <span>Available Pool ({availableOrders.length})</span>
              </button>

              <button
                onClick={() => handleTabClick("complaints")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === "complaints"
                    ? "bg-[#FF5100] text-white shadow-md shadow-orange-600/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <AlertTriangle size={13} className="stroke-[2.5]" />
                <span>Complaints ({complaints.length})</span>
              </button>

              <button
                onClick={() => handleTabClick("profile")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === "profile"
                    ? "bg-[#FF5100] text-white shadow-md shadow-orange-600/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Settings size={13} className="stroke-[2.5]" />
                <span>Account Settings</span>
              </button>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="hidden sm:flex flex-col text-right leading-none">
                <span className="text-xs font-bold text-slate-200">{driver?.name}</span>
                <span className="text-[9px] text-emerald-400 font-semibold mt-0.5">Active Agent</span>
              </div>
              <button 
                onClick={logout}
                className="rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 hover:text-white px-4.5 py-2 text-xs font-black uppercase tracking-wider transition shadow-sm active:scale-95 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 bg-slate-50/20 p-6 md:p-8">
            <div className="mx-auto max-w-4xl">
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
        </>
      )}
    </div>
  );
};

export default App;
