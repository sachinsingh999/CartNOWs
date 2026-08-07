import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";
import axios from "axios";
import { backendUrl } from "../config";

const AdminLayout = () => {
  const { token, setToken } = useAuth();
  const { theme, setTheme } = useTheme();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    localStorage.getItem("sidebar_collapsed") === "true"
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [maintenanceActive, setMaintenanceActive] = useState(false);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Poll or check maintenance status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/system/maintenance`);
        if (data.success) {
          setMaintenanceActive(data.settings.enabled);
        }
      } catch (e) {
        console.error("Failed to check maintenance status:", e);
      }
    };

    checkStatus();

    // Fetch periodically or on settings update event
    const interval = setInterval(checkStatus, 30000); // 30s polling fallback
    window.addEventListener("adminMaintenanceUpdated", checkStatus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("adminMaintenanceUpdated", checkStatus);
    };
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(prev => !prev);
    } else {
      setIsSidebarCollapsed(prev => {
        const next = !prev;
        localStorage.setItem("sidebar_collapsed", String(next));
        return next;
      });
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 h-screen overflow-hidden flex flex-col antialiased text-slate-800 dark:text-slate-100 selection:bg-blue-500/30 w-full">
      {maintenanceActive && (
        <div className="w-full bg-red-600 dark:bg-red-700 text-slate-100 dark:text-white py-2 px-4 text-[11px] font-black text-center uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 z-50 animate-pulse shadow-md">
          <span>⚠ Maintenance Mode Active: Public users cannot access the platform.</span>
        </div>
      )}

      <NavBar 
        setToken={setToken} 
        toggleSidebar={toggleSidebar} 
        isCollapsed={isSidebarCollapsed} 
        theme={theme}
        setTheme={setTheme}
        token={token}
      />

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-60px)] relative w-full">
        {isMobileSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 top-[60px] bg-slate-950/40 dark:bg-slate-950/65 backdrop-blur-xs z-30 transition-opacity duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-950 p-4 md:p-6 overflow-y-scroll overflow-x-hidden custom-scrollbar h-full">
          <div className="mx-auto w-full max-w-[1600px] space-y-5">
            <Outlet context={{ token }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
