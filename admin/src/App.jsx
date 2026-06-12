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

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    localStorage.getItem('sidebar_collapsed') === 'true'
  );
  const [theme, setTheme] = useState(localStorage.getItem('admin_theme') || 'dark');

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

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0B1220] h-screen overflow-hidden flex flex-col antialiased text-slate-800 dark:text-slate-100 selection:bg-blue-500/30">
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
          <div className="flex flex-1 overflow-hidden h-[calc(100vh-60px)]">
            <Sidebar isCollapsed={isSidebarCollapsed} />

            {/* MAIN CONTENT */}
            <main className="flex-1 min-w-0 bg-slate-50 dark:bg-[#0B1220] p-5 md:p-6 overflow-y-scroll overflow-x-hidden custom-scrollbar">
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
                  <Route path="/sellers" element={<Sellers token={token} />} />
                  <Route path="/customers" element={<Customers token={token} />} />
                  <Route path="/product-moderation" element={<ProductModeration token={token} />} />
                  <Route path="/finance" element={<Finance token={token} />} />
                  <Route path="/notifications" element={<NotificationsAdmin token={token} />} />
                  <Route path="/logs" element={<AuditLogs token={token} />} />
                  <Route path="/invoices" element={<InvoiceManagement token={token} />} />
                  <Route path="/profile" element={<Profile />} />
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
