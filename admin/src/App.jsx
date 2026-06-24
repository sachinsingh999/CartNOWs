import React, { useEffect, useState } from 'react'
import NavBar from './components/NavBar'
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import List from './pages/List'
import Orders from './pages/Orders'
import Returns from './pages/Returns'
import Deliverymen from './pages/Deliverymen'
import Support from './pages/Support'
import Sales from './pages/Sales'
import Coupons from './pages/Coupons'
import Categories from './pages/Categories'
import CollectionsBrands from './pages/CollectionsBrands'
import Sellers from './pages/Sellers'
import Customers from './pages/Customers'
import ProductModeration from './pages/ProductModeration'
import Finance from './pages/Finance'
import NotificationsAdmin from './pages/NotificationsAdmin'
import AuditLogs from './pages/AuditLogs'
import Profile from './pages/Profile'
import InvoiceManagement from './pages/InvoiceManagement'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import SystemSettings from './pages/SystemSettings'
import HeroSlideshow from './pages/HeroSlideshow'
import Banners from './pages/Banners'
import axios from 'axios'
import { backendUrl } from './config'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    localStorage.getItem('sidebar_collapsed') === 'true'
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('admin_theme') || 'dark');
  const [maintenanceActive, setMaintenanceActive] = useState(false);

  useEffect(() => {
    localStorage.setItem('token', token)
  }, [token])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

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
        localStorage.setItem('sidebar_collapsed', String(next));
        return next;
      });
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0B1220] h-screen overflow-hidden flex flex-col antialiased text-slate-800 dark:text-slate-100 selection:bg-blue-500/30">
      {maintenanceActive && (
        <div className="w-full bg-red-600 dark:bg-red-700 text-white py-2 px-4 text-[11px] font-black text-center uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 z-50 animate-pulse shadow-md">
          <span>⚠ Maintenance Mode Active: Public users cannot access the platform.</span>
        </div>
      )}
      <ToastContainer theme={theme} />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <NavBar 
            setToken={setToken} 
            toggleSidebar={toggleSidebar} 
            isCollapsed={isSidebarCollapsed} 
            theme={theme}
            setTheme={setTheme}
            token={token}
          />
          <div className="flex flex-1 overflow-hidden h-[calc(100vh-60px)] relative">
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
            <main className="flex-1 min-w-0 bg-slate-50 dark:bg-[#0B1220] p-4 md:p-6 overflow-y-scroll overflow-x-hidden custom-scrollbar">
              <div className="mx-auto w-full max-w-[1600px] space-y-5">
                <Routes>
                  <Route path="/" element={<Dashboard token={token} />} />
                  <Route path="/list" element={<List token={token} />} />
                  <Route path="/orders" element={<Orders token={token} />} />
                  <Route path="/returns" element={<Returns token={token} />} />
                  <Route path="/deliverymen" element={<Deliverymen token={token} />} />
                  <Route path="/support" element={<Support token={token} />} />
                  <Route path="/sales" element={<Sales token={token} />} />
                  <Route path="/coupons" element={<Coupons token={token} />} />
                  <Route path="/categories" element={<Categories token={token} />} />
                  <Route path="/collections-brands" element={<CollectionsBrands token={token} />} />
                  <Route path="/sellers" element={<Sellers token={token} />} />
                  <Route path="/customers" element={<Customers token={token} />} />
                  <Route path="/product-moderation" element={<ProductModeration token={token} />} />
                  <Route path="/finance" element={<Finance token={token} />} />
                  <Route path="/notifications" element={<NotificationsAdmin token={token} />} />
                  <Route path="/logs" element={<AuditLogs token={token} />} />
                  <Route path="/invoices" element={<InvoiceManagement token={token} />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<SystemSettings token={token} />} />
                  <Route path="/hero-slideshow" element={<HeroSlideshow token={token} />} />
                  <Route path="/banners" element={<Banners token={token} />} />
                </Routes>
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
};


export default App;
