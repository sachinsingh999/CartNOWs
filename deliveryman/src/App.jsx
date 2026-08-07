import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context providers
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Components
import Login from "./components/Login";
import SignUp from "./pages/SignUp";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/DashboardLayout";
import { Sun, Moon } from "lucide-react";

const AppContent = () => {
  const { theme, toggleTheme } = useTheme();
  const { token, setToken, setDriver } = useAuth();

  return (
    <div className="bg-slate-50 dark:bg-[#0B0F19] min-h-screen flex flex-col antialiased text-slate-900 dark:text-slate-100 pb-16 lg:pb-0 transition-colors duration-300 relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} theme={theme} />

      {/* Interactive Background Glow Spots */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 dark:bg-indigo-500/10 blur-[130px] pointer-events-none z-0 animate-float" />
      <div className="absolute bottom-[10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-500/5 dark:bg-teal-500/8 blur-[150px] pointer-events-none z-0 animate-float-delayed" />
      <div className="absolute top-[40%] right-[10%] h-[350px] w-[350px] rounded-full bg-indigo-500/5 dark:bg-purple-500/10 blur-[120px] pointer-events-none z-0 animate-float" />

      {!token ? (
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <Routes>
            <Route path="/" element={<Landing theme={theme} setTheme={toggleTheme} />} />
            <Route path="/login" element={
              <>
                <div className="absolute top-4 right-4 z-50">
                  <button
                    onClick={toggleTheme}
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
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white transition shadow-sm cursor-pointer"
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                  </button>
                </div>
                <SignUp />
              </>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      ) : (
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/returns" element={<Dashboard />} />
            <Route path="/pool" element={<Dashboard />} />
            <Route path="/complaints" element={<Dashboard />} />
            <Route path="/profile" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
